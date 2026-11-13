#!/usr/bin/env python3
"""List the Gold tab's sharp price moves, for the morning check that writes data/market-notes.json.

Usage: python3 tools/market_moves.py
Reads data/latest.json, data/char/current.json, data/market-notes.json and the tables in market.js, and prints
the big moves, the under-priced listings and Brakka's herbs and potions selling high, with the listed counts
and whether a note already covers each item. It mirrors the page's rules closely, not exactly.
"""
import datetime
import json
import os
import re
import statistics

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")


def table(name, text):
    for line in text.splitlines():
        if line.lstrip().startswith("var " + name + " = "):
            return line.split("=", 1)[1].strip().rstrip(";")
    raise SystemExit(f"market.js: no {name} table")


js = open(os.path.join(ROOT, "market.js"), encoding="utf-8").read()
NAMES = {int(k): v for k, v in json.loads(table("NAMES", js)).items()}
RX = json.loads(table("RX", js))
m = re.search(r"var HERB = \{(.*?)\};", js, re.S)
HERB = {int(k): int(v) for k, v in re.findall(r"(\d+):\s*(\d+)", m.group(1))} if m else {}

docs = json.load(open(os.path.join(ROOT, "data", "latest.json"), encoding="utf-8"))["docs"]
days = sorted((k for k in docs if k.startswith("prices/")), key=lambda k: docs[k].get("d", k))
if len(days) < 4:
    raise SystemExit("Fewer than four days of prices: nothing to compare yet.")
cur = docs[days[-1]]
prev = [docs[k] for k in days[:-1] if docs[k].get("src") == cur.get("src")][-7:]
try:
    notes = json.load(open(os.path.join(ROOT, "data", "market-notes.json"), encoding="utf-8")).get("notes", [])
except (OSError, ValueError):
    notes = []
cut = (datetime.date.today() - datetime.timedelta(days=30)).isoformat()
noted = {i for n in notes if str(n.get("date", "")) >= cut for i in n.get("ids", [])}


def point(day, i):
    v = (day.get("m") or {}).get(str(i))
    if not v or v[1] is None:
        return None
    mn, med, qty = v[0], v[1], v[2]
    p20 = v[3] if len(v) > 3 else None
    price = p20 if p20 is not None and not (med is not None and p20 > med * 3) else (mn if mn is not None else med)
    return {"min": mn, "med": med, "qty": qty, "price": price, "nmin": v[4] if len(v) > 4 else None}


def usual(i, key="price", min_qty=0):
    a = [p[key] for d in prev if (p := point(d, i)) and p[key] is not None and (p["qty"] or 0) >= min_qty]
    return statistics.median(a) if len(a) >= 3 else None


def money(c):
    c = int(round(c))
    g, s, cc = c // 10000, c // 100 % 100, c % 100
    out = [f"{g}g"] if g else []
    if s:
        out.append(f"{s}s")
    if cc or not out:
        out.append(f"{cc}c")
    return " ".join(out[:2])


def listed(i):
    n = point(cur, i)
    uq = usual(i, "qty")
    first = next((docs[k]["d"] for k in days if point(docs[k], i)), None)
    return f"listed {n['qty']} (usually {int(uq) if uq else '?'}), first seen {first}"


ids = [int(k) for k in (cur.get("m") or {})]
print(f"Prices from {cur.get('d')} ({cur.get('at', '')}), compared with {len(prev)} earlier days.\n")

print("Big moves (40% and 25c or more from usual, ten or more listed):")
for i in sorted(ids, key=lambda i: -abs(((point(cur, i) or {}).get("price") or 0) - (usual(i) or 0))):
    n, u = point(cur, i), usual(i)
    if not n or not u or (n["qty"] or 0) < 10 or abs(n["price"] - u) < 25 or abs(n["price"] - u) / u < 0.4:
        continue
    print(f"  {i:>7} {NAMES.get(i, '?')}: {money(n['price'])}, {'+' if n['price'] >= u else '-'}{abs(n['price'] - u) / u:.0%} on {money(u)}; "
          f"{listed(i)}{'; has a note' if i in noted else ''}")

print("\nUnder-priced listings (cheapest at most 60% of its usual cheapest):")
for i in ids:
    n, u, um = point(cur, i), usual(i, "min", 10), usual(i, "med", 10)
    if not n or n["min"] is None or not u or n["min"] > u * 0.6 or (um and n["med"] is not None and n["med"] < um * 0.8):
        continue
    gain, take = u * 0.95 - n["min"], min(n["nmin"] or 1, 20)
    if gain < 3 or gain * take < 100:
        continue
    print(f"  {i:>7} {NAMES.get(i, '?')}: {money(n['min'])}, usually {money(u)}; {listed(i)}{'; has a note' if i in noted else ''}")

ch = json.load(open(os.path.join(ROOT, "data", "char", "current.json"), encoding="utf-8"))
skill = {p[0]: p[1] for p in ch.get("profs", [])}
known = {r for p in ch.get("profs", []) if len(p) > 3 for r in p[3]}
mine = {i for i, s in HERB.items() if s <= skill.get("Herbalism", 0)}
mine |= {r[2] for rid, r in RX.items() if r[1] == "alch" and (int(rid) in known or (r[7] == "auto" and "Alchemy" in skill))}
print(f"\nYour herbs and potions selling high (15% and 5c above usual), Herbalism {skill.get('Herbalism', 0)}:")
for i in sorted(mine):
    n, u = point(cur, i), usual(i)
    if not n or not u or (n["qty"] or 0) < 10 or n["price"] - u < 5 or (n["price"] - u) / u < 0.15:
        continue
    print(f"  {i:>7} {NAMES.get(i, '?')}: {money(n['price'])}, +{(n['price'] - u) / u:.0%} on {money(u)}; {listed(i)}{'; has a note' if i in noted else ''}")
