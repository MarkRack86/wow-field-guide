#!/usr/bin/env python3
"""GitHub Actions refresh for the WoW Forever Field Guide (see .github/workflows/refresh.yml).

Each run:
1. Runs refresh.py with the Blizzard keys from the repository's encrypted secrets (BNET_ID and BNET_SECRET): the
   latest hourly Auction House snapshot, the character and its gear check.
2. Files the output under data/: that day's prices (each run replaces the day's file), this snapshot's prices under
   data/hourly/ (two days kept, for the watchlist's 24-hour line), the price history and the character.
3. Works out how fast things sell by comparing this snapshot with the previous run's, when that was 30 minutes to
   3 hours earlier. The workflow keeps the previous run's listings in the Actions cache (.cache/auctions.json).
4. Sends a phone alert through ntfy.sh (the NTFY_TOPIC secret) when a watched item's price moved a lot since the
   previous read, or crossed a price set on the watchlist, in the online hours only (the rule is refresh.py's PUSH_*).
5. Rebuilds data/latest.json (what the page reads) and data/status.json, and commits it all to main in one commit.

Nothing here prints or saves the keys or the ntfy topic. data/status.json and data/stats/pushes.json are public, so
they only hold short, checked messages.

cron-job.org presses "Run workflow" at five to each hour in the online hours. With --if-stale (GitHub's own
schedule, a backup), it stops straight away outside the online hours or when the last read was under 40 minutes ago.

Usage: python3 tools/ci_refresh.py [--if-stale] [--no-git] [--no-push]
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
import urllib.request
from zoneinfo import ZoneInfo

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import build_latest  # noqa: E402

ROOT = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))
SCRIPT = os.environ.get("WOWF_REFRESH_SCRIPT", os.path.join(ROOT, "refresh.py"))
CACHE = os.environ.get("WOWF_CACHE", os.path.join(ROOT, ".cache", "auctions.json"))
NTFY = os.environ.get("NTFY_SERVER", "https://ntfy.sh").rstrip("/")
PAGE = "https://markrack86.github.io/wow-field-guide/#gold"
USE_GIT = "--no-git" not in sys.argv
IF_STALE = "--if-stale" in sys.argv
NO_PUSH = "--no-push" in sys.argv
PARTIAL = ("Character", "Quest log", "Gear check", "Non-commodity")
UK = ZoneInfo("Europe/London")
# The player is usually online from 5 to 6.30am and 8 to 11pm UK time; the reads run at five to each hour from 4.55.
ONLINE = ((4, 30, 6, 45), (19, 30, 23, 15))
KEEP_HOURS, STALE_MINUTES = 48, 40


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


def online(t):
    uk = t.astimezone(UK)
    m = uk.hour * 60 + uk.minute
    return any(h1 * 60 + m1 <= m < h2 * 60 + m2 for h1, m1, h2, m2 in ONLINE)


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
    topic = os.environ.get("NTFY_TOPIC")
    if topic:
        text = text.replace(topic, "[topic]")
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
    """refresh.py's functions (pair, hourly_alerts), loaded without running it."""
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
    old. Returns (new, previous): new is False when the snapshot was already saved; previous is the read before it."""
    t = parse(prices.get("snap") or prices.get("at"))
    folder = path("data", "hourly")
    target = os.path.join(folder, t.strftime("%Y-%m-%dT%H") + ".json")
    prev = None
    for p in sorted(glob.glob(os.path.join(folder, "*.json")), reverse=True):
        d = load(p) or {}
        s = parse(d.get("snap") or d.get("at"))
        if s and s < t and isinstance(d.get("m"), dict):
            prev = d
            break
    same = load(target) or {}
    new = not (prices.get("snap") and same.get("snap") == prices.get("snap"))
    if new:
        build_latest.save_pretty(target, prices)
    for p in glob.glob(os.path.join(folder, "*.json")):
        h = hour_of(p)
        if h and h < t - datetime.timedelta(hours=KEEP_HOURS):
            os.remove(p)
    return new, prev


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


def ntfy(topic, title, lines):
    body = json.dumps({"topic": topic, "title": title, "message": "\n".join(lines), "tags": ["moneybag"], "priority": 3,
                       "click": PAGE}).encode("utf-8")
    req = urllib.request.Request(NTFY + "/", data=body, method="POST",
                                 headers={"Content-Type": "application/json", "User-Agent": "wow-field-guide-refresh"})
    with urllib.request.urlopen(req, timeout=20) as r:
        if r.status >= 300:
            raise RuntimeError("ntfy answered HTTP %d" % r.status)


def phone(rf, prices, prev):
    """Phone alerts for this read. Returns a short note for the status, or None when nothing was worth sending."""
    log_path = path("data", "stats", "pushes.json")
    t = utcnow()
    sent = [s for s in (load(log_path, {}) or {}).get("sent", [])
            if isinstance(s, dict) and parse(s.get("at", "")) and t - parse(s["at"]) < datetime.timedelta(hours=KEEP_HOURS)]
    found = rf.hourly_alerts(prices, prev, load(path("config", "watch.json"), {}) or {}, sent)
    if not found:
        return None
    lines = [a["line"] for a in found]
    shown = lines[:5] + (["and %d more: see the watchlist" % (len(lines) - 5)] if len(lines) > 5 else [])
    entry = {"at": now(), "snap": prices.get("snap"), "sent": False, "items": [{"id": a["id"], "kind": a["kind"]} for a in found], "lines": lines}
    topic = os.environ.get("NTFY_TOPIC", "").strip()
    if not online(t):
        entry["why"] = "outside the online hours"
    elif not topic:
        entry["why"] = "no NTFY_TOPIC secret"
    elif NO_PUSH:
        entry["why"] = "sending switched off for this run"
    else:
        try:
            ntfy(topic, "WoW Forever: %d price alert%s" % (len(lines), "" if len(lines) == 1 else "s"), shown)
            entry["sent"] = True
        except Exception as e:  # a failed alert never stops the refresh
            entry["why"] = safe(str(e) or type(e).__name__, 120)
    build_latest.save_pretty(log_path, {"v": 1, "sent": sent + [entry]})
    n = "%d alert%s" % (len(lines), "" if len(lines) == 1 else "s")
    return n + " sent" if entry["sent"] else n + " not sent: " + entry["why"]


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
    new, prev = save_hourly(prices)
    spd, spd_info = speed_pair(rf, out)
    note = None
    if new:
        try:
            note = phone(rf, prices, prev)
        except Exception as e:  # never lose the prices over an alert
            note = "alerts failed: " + safe(str(e) or type(e).__name__, 120)
    build_latest.build(ROOT)
    snap = parse(prices.get("snap") or prices.get("at"))
    set_status("refresh", {"at": now(), "ok": True, "date": day, "snapshot": prices.get("snap"), "new": new,
                           "items": summary.get("items"), "of": summary.get("of"), "alerts": summary.get("alerts"),
                           "phone": note or "nothing to send", "character": char_state, "level": level, "notes": notes})
    set_status("speed", spd)
    extra = ([", level %s" % level] if level else []) + ([", speed over %s min" % spd_info["minutes"]] if spd_info else []) + \
        ([", " + note.split(":")[0]] if note else []) + ([] if new else [", same snapshot"])
    commit("Prices for %s %s: %s items%s" % (day, snap.astimezone(UK).strftime("%H:%M"), summary.get("items"), "".join(extra)), [path("data")])
    print("Saved %s prices for %s (snapshot %s UTC); character %s; sell speed: %s; phone: %s." % (
        summary.get("items"), day, prices.get("snap") or "time unknown", char_state,
        "%s units over %s minutes" % (spd_info["units"], spd_info["minutes"]) if spd_info else spd.get("reason"),
        note or "nothing to send"))
    return True


def stale_reason(t):
    """Why a scheduled (backup) run has nothing to do, or None."""
    if not online(t):
        return "Outside the online hours (%s UK time); nothing to do." % t.astimezone(UK).strftime("%H:%M")
    last = last_saved()
    if last and t - last < datetime.timedelta(minutes=STALE_MINUTES):
        return "Prices were read %d minutes ago; nothing to do." % ((t - last).total_seconds() // 60)
    return None


def main():
    if IF_STALE:
        reason = stale_reason(utcnow())
        if reason:
            print(reason)
            return 0
    env = dict(os.environ)
    if not (env.get("BNET_ID") and env.get("BNET_SECRET")):
        set_status("refresh", {"at": now(), "ok": False, "error": "The BNET_ID and BNET_SECRET secrets aren't set in the repository."})
        commit("Refresh failed: Blizzard secrets missing", [path("data", "status.json")])
        print("The BNET_ID and BNET_SECRET secrets aren't set in the repository.")
        return 1
    env.pop("NTFY_TOPIC", None)  # refresh.py doesn't need it
    ok = refresh(tempfile.mkdtemp(prefix="wowf-"), env)
    return 0 if ok else 1


if __name__ == "__main__":
    sys.exit(main())
