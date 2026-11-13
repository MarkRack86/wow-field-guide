#!/usr/bin/env python3
"""Check data/market-notes.json (the Gold tab's "Why" notes) before committing it.

Usage: python3 tools/check_notes.py [path/to/market-notes.json]
Prints "OK: ..." and exits 0, or lists the problems and exits 1. The format is described in CLAUDE.md.
"""
import datetime
import json
import os
import re
import sys

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
path = sys.argv[1] if len(sys.argv) > 1 else os.path.join(ROOT, "data", "market-notes.json")
problems = []

# Item names, from the page's own table, so every id is one the Gold tab can show.
names = {}
for line in open(os.path.join(ROOT, "market.js"), encoding="utf-8"):
    if line.lstrip().startswith("var NAMES = "):
        names = json.loads(line.split("=", 1)[1].strip().rstrip(";"))
        break
if not names:
    problems.append("market.js: couldn't find the NAMES table")

try:
    with open(path, encoding="utf-8") as f:
        u = json.load(f)
except (OSError, ValueError) as e:
    sys.exit(f"Can't read {path}: {e}")

if not isinstance(u, dict) or set(u) != {"checked", "notes"}:
    problems.append('top level: needs exactly "checked" and "notes"')
    u = u if isinstance(u, dict) else {}
if not re.fullmatch(r"\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z", str(u.get("checked", ""))):
    problems.append('"checked": use UTC like 2026-11-13T05:37:00Z')
notes = u.get("notes")
if not isinstance(notes, list):
    problems.append('"notes": needs a list (it can be empty)')
    notes = []
today = datetime.datetime.now(datetime.timezone.utc).date()
seen = {}
for i, n in enumerate(notes):
    w = f"notes[{i}]"
    if not isinstance(n, dict) or not {"ids", "date", "text"} <= set(n) or set(n) - {"ids", "date", "text", "source", "url"}:
        problems.append(f'{w}: needs "ids", "date" and "text", and may have "source" and "url"')
        continue
    ids = n["ids"]
    if not isinstance(ids, list) or not ids or not all(isinstance(x, int) and not isinstance(x, bool) for x in ids):
        problems.append(f"{w}.ids: a list of item ids (numbers)")
    else:
        for x in ids:
            if names and str(x) not in names:
                problems.append(f"{w}.ids: {x} isn't an item the Gold tab knows")
            if x in seen and seen[x][1] == n["date"]:
                problems.append(f"{w}.ids: {x} already has a note dated {n['date']} (notes[{seen[x][0]}]); merge them")
            seen[x] = (i, n["date"])
    try:
        d = datetime.date.fromisoformat(str(n["date"]))
        if d > today:
            problems.append(f"{w}.date: {d} is in the future")
        elif (today - d).days > 30:
            problems.append(f"{w}.date: older than 30 days; the page ignores it, so delete it")
    except ValueError:
        problems.append(f"{w}.date: use YYYY-MM-DD")
    t = n["text"]
    if not isinstance(t, str) or not t.strip():
        problems.append(f"{w}.text: needs some text")
    else:
        if re.search(r"<\s*/?\s*[a-zA-Z]", t):
            problems.append(f"{w}.text: plain text only, no HTML tags")
        if len(t) > 420:
            problems.append(f"{w}.text: keep it under 420 characters ({len(t)})")
        if re.search(r"\b[A-Za-z0-9]{28,}\b", t):
            problems.append(f"{w}.text: looks like it holds a key or token; never put secrets in this public file")
    if "url" in n:
        if not isinstance(n["url"], str) or not re.fullmatch(r"https://[^\s\"'<>]+", n["url"]):
            problems.append(f"{w}.url: a full https:// link")
        if not isinstance(n.get("source"), str) or not n.get("source", "").strip():
            problems.append(f'{w}: a "url" needs a short "source" name, like "Blizzard"')
    elif "source" in n and not isinstance(n["source"], str):
        problems.append(f"{w}.source: text")
    if i and isinstance(notes[i - 1], dict) and str(notes[i - 1].get("date", "")) < str(n.get("date", "")):
        problems.append(f"{w}: notes go newest first")

if problems:
    print("Problems in " + path + ":")
    for p in problems:
        print(" - " + p)
    sys.exit(1)
print(f"OK: {len(notes)} notes covering {len(seen)} items, checked {u.get('checked')}")
