#!/usr/bin/env python3
"""GitHub Actions refresh for the WoW Forever Field Guide (see .github/workflows/refresh.yml).

1. Starts the sell-speed sample in the background (it waits up to 78 minutes for Blizzard's next hourly snapshot).
2. Runs refresh.py with the Blizzard keys from the repository's encrypted secrets (BNET_ID and BNET_SECRET), files its
   output under data/, rebuilds data/latest.json (what the page reads) and data/status.json, and commits to main.
3. When the sell-speed sample finishes, saves it under data/speed/ and commits again.

Nothing here prints or saves the keys. data/status.json is public, so it only holds short, checked messages.

Usage: python3 tools/ci_refresh.py [--no-git]
"""
import datetime
import json
import os
import re
import subprocess
import sys
import tempfile
import time

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import build_latest  # noqa: E402

ROOT = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))
SCRIPT = os.environ.get("WOWF_REFRESH_SCRIPT", os.path.join(ROOT, "refresh.py"))
SPEED_WAIT = int(os.environ.get("WOWF_SPEED_WAIT", str(82 * 60)))
USE_GIT = "--no-git" not in sys.argv
PARTIAL = ("Character", "Quest log", "Gear check", "Non-commodity")


def path(*parts):
    return os.path.join(ROOT, *parts)


def now():
    return datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


def safe(text, n=200):
    """Short text for the public status file. The keys never reach these messages; long tokens are hidden anyway."""
    text = re.sub(r"[A-Za-z0-9_\-]{24,}", "[hidden]", str(text or ""))
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


def commit(message, files):
    if not USE_GIT:
        return
    git("add", "--", *[f for f in files if os.path.exists(f)])
    if git("diff", "--cached", "--quiet", check=False).returncode == 0:
        return
    git("commit", "-q", "-m", message)
    for attempt in range(5):
        if git("push", "-q", "origin", "HEAD:main", check=False).returncode == 0:
            return
        # Someone else pushed (Claude's sync or an edit): replay this commit on top. They never touch data/.
        if git("pull", "-q", "--rebase", "origin", "main", check=False).returncode:
            git("rebase", "--abort", check=False)
        time.sleep(5 * (attempt + 1))
    raise RuntimeError("git push failed after 5 tries")


def last_line(text):
    lines = [ln for ln in (text or "").splitlines() if ln.strip()]
    return lines[-1] if lines else ""


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
    files = [path("data", "prices", day + ".json"), path("data", "stats", "recent.json"), path("data", "char", "current.json"),
             path("data", "latest.json"), path("data", "status.json")]
    build_latest.save_pretty(files[0], prices)
    recent = load(os.path.join(out, "recent.json"))
    if recent:
        build_latest.save_pretty(files[1], recent)
    char, level, char_state = load(os.path.join(out, "char.json")), None, "not set up"
    if char and char.get("missing"):
        char_state = "not found on Blizzard"
    elif char:
        current = load(files[2], {}) or {}
        current.update(char)  # like the old database merge: parts that failed to sync keep their previous values
        build_latest.save_pretty(files[2], current)
        level, char_state = current.get("level"), "synced"
    build_latest.build(ROOT)
    set_status("refresh", {"at": now(), "ok": True, "date": day, "items": summary.get("items"), "of": summary.get("of"),
                           "alerts": summary.get("alerts"), "character": char_state, "level": level, "notes": notes})
    commit("Prices for %s: %s items%s" % (day, summary.get("items"), ", level %s" % level if level else ""), files)
    print("Saved %s prices for %s; character %s." % (summary.get("items"), day, char_state))
    return True


def speed(proc, log_path, spd_dir):
    """Wait for the sell-speed sample and save it."""
    try:
        proc.wait(timeout=SPEED_WAIT)
    except subprocess.TimeoutExpired:
        proc.kill()
    with open(log_path, encoding="utf-8", errors="replace") as f:
        log = f.read()
    line = next((ln for ln in log.splitlines() if ln.startswith('{"speed"')), None)
    doc = load(os.path.join(spd_dir, "speed.json"))
    if not (line and doc):
        reason = safe(last_line(log) or "no result", 160)
        set_status("speed", {"at": now(), "ok": False, "reason": reason})
        commit("Sell-speed sample skipped", [path("data", "status.json")])
        print("Sell-speed sample skipped:", reason)
        return
    info = json.loads(line)
    target = path("data", "speed", info["speed"] + ".json")
    if not os.path.exists(target):
        build_latest.save_pretty(target, doc)
    build_latest.build(ROOT)
    set_status("speed", {"at": now(), "ok": True, "id": info["speed"], "units": info.get("units"), "minutes": info.get("minutes")})
    commit("Sell-speed sample %s: %s units over %s minutes" % (info["speed"], info.get("units"), info.get("minutes")),
           [target, path("data", "latest.json"), path("data", "status.json")])
    print("Sell-speed sample saved: %s units over %s minutes." % (info.get("units"), info.get("minutes")))


def main():
    env = dict(os.environ)
    if not (env.get("BNET_ID") and env.get("BNET_SECRET")):
        set_status("refresh", {"at": now(), "ok": False, "error": "The BNET_ID and BNET_SECRET secrets aren't set in the repository."})
        commit("Refresh failed: Blizzard secrets missing", [path("data", "status.json")])
        print("The BNET_ID and BNET_SECRET secrets aren't set in the repository.")
        return 1
    tmp = tempfile.mkdtemp(prefix="wowf-")
    spd_dir, log_path = os.path.join(tmp, "spd"), os.path.join(tmp, "speed.log")
    with open(log_path, "w") as log:
        proc = subprocess.Popen([sys.executable, SCRIPT, "speed", spd_dir], stdout=log, stderr=subprocess.STDOUT, env=env)
    ok = refresh(tmp, env)
    speed(proc, log_path, spd_dir)
    return 0 if ok else 1


if __name__ == "__main__":
    sys.exit(main())
