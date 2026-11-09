#!/usr/bin/env python3
"""Check data/updates.json (the Updates tab's notes) before committing it.

Usage: python3 tools/check_updates.py [path/to/updates.json]
Prints "OK: ..." and exits 0, or lists the problems and exits 1. The format is described in CLAUDE.md.
"""
import datetime
import json
import os
import re
import sys

CLASSES = {"Druid", "Hunter", "Mage", "Paladin", "Priest", "Rogue", "Shaman", "Warlock", "Warrior"}
path = sys.argv[1] if len(sys.argv) > 1 else os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "data", "updates.json")
problems = []


def text(v, where, required=True):
    if not isinstance(v, str) or (required and not v.strip()):
        problems.append(f"{where}: needs some text")
    elif re.search(r"<\s*/?\s*[a-zA-Z]", v):
        problems.append(f"{where}: plain text only, no HTML tags")


try:
    with open(path, encoding="utf-8") as f:
        u = json.load(f)
except (OSError, ValueError) as e:
    sys.exit(f"Can't read {path}: {e}")

if not isinstance(u, dict) or set(u) != {"checked", "entries", "sources"}:
    problems.append('top level: needs exactly "checked", "entries" and "sources"')
    u = u if isinstance(u, dict) else {}
if not re.fullmatch(r"\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z", str(u.get("checked", ""))):
    problems.append('"checked": use UTC like 2026-11-10T05:37:00Z')
entries = u.get("entries")
if not isinstance(entries, list) or not entries:
    problems.append('"entries": needs a list of entries')
    entries = []
for i, e in enumerate(entries):
    w = f"entries[{i}]"
    if not isinstance(e, dict):
        problems.append(f"{w}: needs to be an object")
        continue
    extra = set(e) - {"date", "label", "chips", "state", "title", "blocks"}
    if extra:
        problems.append(f"{w}: unknown fields {sorted(extra)}")
    if e.get("date") is not None:
        try:
            datetime.date.fromisoformat(e["date"])
        except (TypeError, ValueError):
            problems.append(f"{w}.date: use YYYY-MM-DD, or null when there's no exact date")
    text(e.get("label"), f"{w}.label")
    text(e.get("title"), f"{w}.title")
    if e.get("state", "") not in ("", "new", "due"):
        problems.append(f'{w}.state: use "new", "due" or ""')
    chips = e.get("chips", [])
    if not isinstance(chips, list):
        problems.append(f"{w}.chips: needs a list")
    else:
        for j, c in enumerate(chips):
            text(c, f"{w}.chips[{j}]")
    blocks = e.get("blocks")
    if not isinstance(blocks, list) or not blocks:
        problems.append(f"{w}.blocks: needs at least one block")
        continue
    for j, b in enumerate(blocks):
        bw = f"{w}.blocks[{j}]"
        if not isinstance(b, dict) or not set(b) <= {"heading", "items", "byClass", "note"} or not set(b) & {"items", "byClass", "note"}:
            problems.append(f"{bw}: use heading plus one of items, byClass or note")
            continue
        if "heading" in b:
            text(b["heading"], f"{bw}.heading")
        if "note" in b:
            text(b["note"], f"{bw}.note")
        if "items" in b:
            if not isinstance(b["items"], list) or not b["items"]:
                problems.append(f"{bw}.items: needs a list of bullets")
            else:
                for k, s in enumerate(b["items"]):
                    text(s, f"{bw}.items[{k}]")
        if "byClass" in b:
            rows = b["byClass"]
            if not isinstance(rows, list) or not rows:
                problems.append(f"{bw}.byClass: needs a list of [class, text] pairs")
            else:
                for k, r in enumerate(rows):
                    if not (isinstance(r, list) and len(r) == 2 and r[0] in CLASSES):
                        problems.append(f"{bw}.byClass[{k}]: use [class name, text]")
                    else:
                        text(r[1], f"{bw}.byClass[{k}]")
sources = u.get("sources")
if not isinstance(sources, list):
    problems.append('"sources": needs a list')
    sources = []
for i, s in enumerate(sources):
    if not (isinstance(s, dict) and set(s) == {"title", "url"} and re.match(r"https?://\S+$", str(s.get("url", "")))):
        problems.append(f'sources[{i}]: use {{"title": ..., "url": "https://..."}}')
    else:
        text(s["title"], f"sources[{i}].title")

if problems:
    print("data/updates.json has problems:")
    for p in problems:
        print(" -", p)
    sys.exit(1)
print(f"OK: {len(entries)} entries, {len(sources)} sources, checked {u['checked']}")
