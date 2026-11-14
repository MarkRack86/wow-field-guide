#!/usr/bin/env python3
"""Build data/latest.json, the one file the page loads.

It holds the last 120 days of prices, the last day of hourly reads, the character, the last 24 sell-speed samples (a
day of hourly reads) and the settings files, as {"v": 1, "built": "<UTC time>", "docs": {"prices/2026-11-09": {...}, "char/current": {...}, ...}}.
Each key is the document's old path in the Claude artifact's database, except "hourly/recent", which is new:
{"at": newest snapshot, "t": [snapshot times, oldest first], "b": {"<item id>": [price at each, or null]}},
the price being what the cheapest 20 cost each.

Usage: python3 tools/build_latest.py [repo folder]
"""
import datetime
import glob
import json
import os
import sys

PRICE_DAYS, SPEED_SAMPLES, HOURLY_SPAN = 120, 24, datetime.timedelta(hours=24, minutes=30)


def load(path):
    with open(path, encoding="utf-8") as f:
        return json.load(f)


def write(path, text):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    tmp = path + ".tmp"
    with open(tmp, "w", encoding="utf-8") as f:
        f.write(text)
    os.replace(tmp, path)


def compact(obj):
    return json.dumps(obj, separators=(",", ":"), ensure_ascii=False)


def pretty(obj, ind=0):
    """JSON with one entry per line wherever a line would be long, so files read well on GitHub."""
    sp = "  " * ind
    if isinstance(obj, dict) and obj and len(compact(obj)) > 90:
        rows = [sp + "  " + json.dumps(k, ensure_ascii=False) + ": " + pretty(v, ind + 1) for k, v in obj.items()]
        return "{\n" + ",\n".join(rows) + "\n" + sp + "}"
    if isinstance(obj, list) and obj and len(compact(obj)) > 90:
        return "[\n" + ",\n".join(sp + "  " + pretty(x, ind + 1) for x in obj) + "\n" + sp + "]"
    return compact(obj)


def save_pretty(path, obj):
    text = pretty(obj) + "\n"
    assert json.loads(text) == obj
    write(path, text)


def when(text):
    try:
        return datetime.datetime.fromisoformat(str(text).replace("Z", "+00:00"))
    except ValueError:
        return None


def hourly(root):
    """Each item's price at every hourly read in about the last day, for the watchlist's 24-hour line."""
    reads = []
    for path in glob.glob(os.path.join(root, "data", "hourly", "*.json")):
        d = load(path)
        t = when(d.get("snap") or d.get("at"))
        if t and isinstance(d.get("m"), dict):
            reads.append((t, d["m"]))
    if not reads:
        return None
    reads.sort(key=lambda r: r[0])
    reads = [r for r in reads if r[0] >= reads[-1][0] - HOURLY_SPAN]
    ids = sorted({k for _, m in reads for k in m}, key=lambda k: int(k) if k.isdigit() else 0)
    b = {k: [m[k][3] if isinstance(m.get(k), list) and len(m[k]) > 3 else None for _, m in reads] for k in ids}
    stamp = [t.strftime("%Y-%m-%dT%H:%M:%SZ") for t, _ in reads]
    return {"at": stamp[-1], "t": stamp, "b": {k: v for k, v in b.items() if any(x is not None for x in v)}}


def build(root):
    docs = {}
    for path in sorted(glob.glob(os.path.join(root, "data", "prices", "*.json")))[-PRICE_DAYS:]:
        docs["prices/" + os.path.basename(path)[:-5]] = load(path)
    recent = hourly(root)
    if recent:
        docs["hourly/recent"] = recent
    for path in sorted(glob.glob(os.path.join(root, "data", "speed", "*.json")))[-SPEED_SAMPLES:]:
        docs["speed/" + os.path.basename(path)[:-5]] = load(path)
    path = os.path.join(root, "data", "char", "current.json")
    if os.path.exists(path):
        docs["char/current"] = load(path)
    for name in ("watch", "gear", "quests"):
        path = os.path.join(root, "config", name + ".json")
        if os.path.exists(path):
            docs["config/" + name] = load(path)
    out = {"v": 1, "built": datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"), "docs": docs}
    write(os.path.join(root, "data", "latest.json"), compact(out) + "\n")
    return out


if __name__ == "__main__":
    root = os.path.abspath(sys.argv[1] if len(sys.argv) > 1 else os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))
    out = build(root)
    kinds = {}
    for key in out["docs"]:
        kinds[key.split("/")[0]] = kinds.get(key.split("/")[0], 0) + 1
    print("Wrote data/latest.json:", ", ".join(f"{n} {k}" for k, n in sorted(kinds.items())))
