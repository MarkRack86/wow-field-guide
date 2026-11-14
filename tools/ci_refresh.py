#!/usr/bin/env python3
"""GitHub Actions refresh for the WoW Forever Field Guide (see .github/workflows/refresh.yml).

Each run:
1. Runs refresh.py with the Blizzard keys from the repository's encrypted secrets (BNET_ID and BNET_SECRET): the
   latest hourly Auction House snapshot, the character and its gear check.
2. Files the output under data/: that day's prices (each run replaces the day's file), this snapshot's prices under
   data/hourly/ (two days kept, for the watchlist's 24-hour line), the price history and the character.
3. Works out how fast things sell by comparing this snapshot with the previous read's, when that was 30 minutes to
   3 hours earlier. The workflow keeps the previous run's listings in the Actions cache (.cache/auctions.json).
4. Rebuilds data/latest.json (what the page reads) and data/status.json, and commits it all to main in one commit.

Nothing here prints or saves the keys. data/status.json is public, so it only holds short, checked messages.

Reads happen at five to every hour, day and night. With --hourly, a run reads, then waits and reads again at five to
each hour for about RUN_MINUTES, and then says "handoff" so the workflow starts the next run, which carries on (GitHub
stops a job after 6 hours). A run started that way, or by GitHub's own schedule (a backup that restarts the chain if
it ever stops), passes --if-stale: it skips its first read when prices were read under STALE_MINUTES ago. A run
started by a push (Claude's nudge to config/refresh-request, or a change to the refresh) reads straight away.

Usage: python3 tools/ci_refresh.py [--if-stale] [--hourly] [--no-git]
"""
import datetime
import glob
import importlib.util
import json
import os
import re
import shutil
import subprocess
import sys
import tempfile
import time
from zoneinfo import ZoneInfo

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import build_latest  # noqa: E402

ROOT = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))
SCRIPT = os.environ.get("WOWF_REFRESH_SCRIPT", os.path.join(ROOT, "refresh.py"))
CACHE = os.environ.get("WOWF_CACHE", os.path.join(ROOT, ".cache", "auctions.json"))
USE_GIT = "--no-git" not in sys.argv
IF_STALE = "--if-stale" in sys.argv
HOURLY = "--hourly" in sys.argv
PARTIAL = ("Character", "Quest log", "Gear check", "Non-commodity")
UK = ZoneInfo("Europe/London")
KEEP_HOURS, STALE_MINUTES = 48, 40
# With --hourly, the next read is at this minute past the hour, and at least GAP_MINUTES after the last read.
READ_MINUTE, GAP_MINUTES = 55, 30
# One run reads for about this long, then hands over to the next run. Its last read starts at least FINISH_MINUTES
# before the end, so the run ends well inside the workflow's timeout (355 minutes; GitHub's limit is 360).
RUN_MINUTES, FINISH_MINUTES = 320, 5


def path(*parts):
    return os.path.join(ROOT, *parts)


def utcnow():
    t = os.environ.get("WOWF_NOW")  # tests only: pretend it's this UTC time
    return datetime.datetime.fromisoformat(t.replace("Z", "+00:00")) if t else datetime.datetime.now(datetime.timezone.utc)


def iso(t):
    return t.astimezone(datetime.timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


def now():
    return iso(utcnow())


def parse(text):
    try:
        return datetime.datetime.fromisoformat(str(text).replace("Z", "+00:00"))
    except ValueError:
        return None


def last_saved():
    """When prices were last read, from the newest price files."""
    best = None
    for p in sorted(glob.glob(path("data", "prices", "*.json")))[-2:]:
        t = parse((load(p) or {}).get("at", ""))
        if t and (best is None or t > best):
            best = t
    return best


def safe(text, n=200):
    """Short text for the public files. The keys never reach these messages; long tokens are hidden anyway."""
    text = str(text or "")
    text = re.sub(r"[A-Za-z0-9_\-]{24,}", "[hidden]", text)
    return " ".join(text.split())[:n]


def load(p, default=None):
    try:
        with open(p, encoding="utf-8") as f:
            return json.load(f)
    except (OSError, ValueError):
        return default


def set_status(part, info):
    status = load(path("data", "status.json"), {}) or {}
    status[part] = info
    build_latest.write(path("data", "status.json"), json.dumps(status, indent=1, ensure_ascii=False) + "\n")


def git(*args, check=True):
    r = subprocess.run(["git", "-C", ROOT] + list(args), capture_output=True, text=True)
    if check and r.returncode:
        raise RuntimeError("git " + args[0] + " failed: " + safe(r.stderr, 300))
    return r


def commit(message, paths):
    """Commit everything changed under paths (new, changed and deleted files) and push to main."""
    if not USE_GIT:
        return
    git("add", "-A", "--", *paths)
    if git("diff", "--cached", "--quiet", check=False).returncode == 0:
        return
    git("commit", "-q", "-m", message)
    for attempt in range(5):
        if git("push", "-q", "origin", "HEAD:main", check=False).returncode == 0:
            return
        # Someone else pushed (Claude's sync or an edit): replay this commit on top. They never touch these files.
        if git("pull", "-q", "--rebase", "origin", "main", check=False).returncode:
            git("rebase", "--abort", check=False)
        time.sleep(5 * (attempt + 1))
    raise RuntimeError("git push failed after 5 tries")


def last_line(text):
    lines = [ln for ln in (text or "").splitlines() if ln.strip()]
    return lines[-1] if lines else ""


def refresh_module():
    """refresh.py's functions (pair), loaded without running it."""
    spec = importlib.util.spec_from_file_location("wowf_refresh", SCRIPT)
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


def hour_of(name):
    try:
        return datetime.datetime.strptime(os.path.basename(name)[:13], "%Y-%m-%dT%H").replace(tzinfo=datetime.timezone.utc)
    except ValueError:
        return None


def save_hourly(prices):
    """Keep this read under data/hourly/, named by the UTC hour of Blizzard's snapshot, and drop those over two days
    old. Returns False when the snapshot was already saved."""
    t = parse(prices.get("snap") or prices.get("at"))
    folder = path("data", "hourly")
    target = os.path.join(folder, t.strftime("%Y-%m-%dT%H") + ".json")
    same = load(target) or {}
    new = not (prices.get("snap") and same.get("snap") == prices.get("snap"))
    if new:
        build_latest.save_pretty(target, prices)
    for p in glob.glob(os.path.join(folder, "*.json")):
        h = hour_of(p)
        if h and h < t - datetime.timedelta(hours=KEEP_HOURS):
            os.remove(p)
    return new


def github_output(name, value):
    out = os.environ.get("GITHUB_OUTPUT")
    if out:
        with open(out, "a", encoding="utf-8") as f:
            f.write("%s=%s\n" % (name, value))


def speed_pair(rf, out):
    """Sell speed from this run's listings and the previous run's, then keep this run's for the next.
    Returns (status, summary or None)."""
    cur = load(os.path.join(out, "auctions.json"))
    if not cur:
        return {"at": now(), "ok": False, "reason": "Blizzard didn't say when it took this snapshot"}, None
    prev = load(CACHE)
    info = None
    if not prev:
        status = {"at": now(), "ok": False, "reason": "no earlier run's listings to compare with yet"}
    else:
        doc, info = rf.pair(prev, cur)
        if doc:
            target = path("data", "speed", info["speed"] + ".json")
            if not os.path.exists(target):
                build_latest.save_pretty(target, doc)
            status = {"at": now(), "ok": True, "id": info["speed"], "units": info.get("units"), "minutes": info.get("minutes")}
        else:
            status, info = {"at": now(), "ok": False, "reason": safe(info, 160)}, None
    if not prev or prev.get("lm") != cur.get("lm"):
        os.makedirs(os.path.dirname(CACHE), exist_ok=True)
        shutil.copyfile(os.path.join(out, "auctions.json"), CACHE)
        github_output("snapshot", "new")
    return status, info


def refresh(tmp, env):
    """The main refresh. Returns True if prices were saved."""
    out = os.path.join(tmp, "out")
    inputs = [path("data", "stats", "recent.json"), path("config", "watch.json"), path("config", "char.json"), path("config", "gear.json")]
    cmd = [sys.executable, SCRIPT, out] + [p if os.path.exists(p) else "" for p in inputs]
    try:
        r = subprocess.run(cmd, capture_output=True, text=True, env=env, timeout=25 * 60)
        stdout, stderr, code = r.stdout, r.stderr, r.returncode
    except subprocess.TimeoutExpired:
        stdout, stderr, code = "", "The refresh took over 25 minutes and was stopped.", 1
    notes = [safe(ln, 160) for ln in (stdout + "\n" + stderr).splitlines() if ln.startswith(PARTIAL)]
    summary = next((json.loads(ln) for ln in stdout.splitlines() if ln.startswith('{"date"')), None)
    prices = load(os.path.join(out, "prices.json"))
    if code or not summary or not prices:
        error = safe(last_line(stderr) or last_line(stdout) or "The refresh stopped without saying why.")
        set_status("refresh", {"at": now(), "ok": False, "error": error, "notes": notes})
        commit("Refresh failed: " + error[:72], [path("data", "status.json")])
        print("Refresh failed:", error)
        return False

    day = prices["d"]
    build_latest.save_pretty(path("data", "prices", day + ".json"), prices)
    recent = load(os.path.join(out, "recent.json"))
    if recent:
        build_latest.save_pretty(path("data", "stats", "recent.json"), recent)
    char, level, char_state = load(os.path.join(out, "char.json")), None, "not set up"
    if char and char.get("missing"):
        char_state = "not found on Blizzard"
    elif char:
        current = load(path("data", "char", "current.json"), {}) or {}
        current.update(char)  # like the old database merge: parts that failed to sync keep their previous values
        build_latest.save_pretty(path("data", "char", "current.json"), current)
        level, char_state = current.get("level"), "synced"

    rf = refresh_module()
    new = save_hourly(prices)
    spd, spd_info = speed_pair(rf, out)
    build_latest.build(ROOT)
    snap = parse(prices.get("snap") or prices.get("at"))
    set_status("refresh", {"at": now(), "ok": True, "date": day, "snapshot": prices.get("snap"), "new": new,
                           "items": summary.get("items"), "of": summary.get("of"), "alerts": summary.get("alerts"),
                           "character": char_state, "level": level, "notes": notes})
    set_status("speed", spd)
    extra = ([", level %s" % level] if level else []) + ([", speed over %s min" % spd_info["minutes"]] if spd_info else []) + \
        ([] if new else [", same snapshot"])
    commit("Prices for %s %s: %s items%s" % (day, snap.astimezone(UK).strftime("%H:%M"), summary.get("items"), "".join(extra)), [path("data")])
    print("Saved %s prices for %s (snapshot %s UTC); character %s; sell speed: %s." % (
        summary.get("items"), day, prices.get("snap") or "time unknown", char_state,
        "%s units over %s minutes" % (spd_info["units"], spd_info["minutes"]) if spd_info else spd.get("reason")), flush=True)
    return True


def read_once(env):
    """One read. A failure is logged and the hourly loop carries on: the next hour tries again."""
    try:
        return refresh(tempfile.mkdtemp(prefix="wowf-"), env)
    except Exception as e:
        print("This read failed: " + safe(str(e) or type(e).__name__, 300), flush=True)
        return False


def next_read(after):
    """With --hourly: the first five to the hour at least GAP_MINUTES after the last read and at least a minute from
    now. after is the last read's time (or now, when there's none)."""
    t = max(after + datetime.timedelta(minutes=GAP_MINUTES), utcnow() + datetime.timedelta(minutes=1))
    nxt = t.replace(minute=READ_MINUTE, second=0, microsecond=0)
    while nxt < t:
        nxt += datetime.timedelta(hours=1)
    return nxt


def main():
    start = utcnow()
    env = dict(os.environ)
    if not (env.get("BNET_ID") and env.get("BNET_SECRET")):
        # No handoff: a chain of runs that can't read would only fail again. The backup schedule tries later.
        set_status("refresh", {"at": now(), "ok": False, "error": "The BNET_ID and BNET_SECRET secrets aren't set in the repository."})
        commit("Refresh failed: Blizzard secrets missing", [path("data", "status.json")])
        print("The BNET_ID and BNET_SECRET secrets aren't set in the repository.")
        return 1
    ok, last = True, last_saved()
    if IF_STALE and last and start - last < datetime.timedelta(minutes=STALE_MINUTES):
        print("Prices were read %d minutes ago, so the first read waits for the next hour." % ((start - last).total_seconds() // 60), flush=True)
    else:
        ok, last = read_once(env), utcnow()
    while HOURLY:
        nxt = next_read(last or utcnow())
        if nxt + datetime.timedelta(minutes=FINISH_MINUTES) > start + datetime.timedelta(minutes=RUN_MINUTES):
            print("This run has done its share. The next run carries on from the read at %s UK time." % nxt.astimezone(UK).strftime("%H:%M"), flush=True)
            github_output("handoff", "yes")
            break
        print("Next read at %s UK time." % nxt.astimezone(UK).strftime("%H:%M"), flush=True)
        time.sleep(max(0, (nxt - utcnow()).total_seconds()))
        # Pick up anything pushed meanwhile (settings, Claude's notes). If this fails, the next commit retries.
        if USE_GIT and git("pull", "-q", "--rebase", "origin", "main", check=False).returncode:
            git("rebase", "--abort", check=False)
        ok, last = read_once(env), utcnow()
    return 0 if ok else 1


if __name__ == "__main__":
    sys.exit(main())
