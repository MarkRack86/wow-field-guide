#!/usr/bin/env python3
"""Look up items in Blizzard's item data, to check ids and names before the refresh tracks them.

Run by the "Look up item names" workflow (.github/workflows/item-names.yml), which has the Blizzard keys.
Its inputs arrive as environment variables:
  IDS     item ids, separated by spaces or commas
  SEARCH  names to search for, separated by semicolons (finds ids for Forever's new items)
  MIN_ID  show only search results from this id up (Forever's new items have ids from about 246000)
  KNOWN   "true" to check every name in market.js's NAMES against Blizzard's own name
Prints one line per item: id, name, quality, class / subclass, binding and whether the refresh tracks it.
It prints item data only: never the keys or the token.
"""
import json
import os
import re
import sys
import urllib.parse

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
sys.path.insert(0, ROOT)
import refresh  # noqa: E402  (token(), curl(), API and the tracked NAMES)

NAMESPACES = ["static-forever-eu", "static-classic1x-eu", "static-classic-eu"]


def fetch(tok, path, ns):
    sep = "&" if "?" in path else "?"
    url = refresh.API + path + sep + "namespace=" + ns + "&locale=en_GB"
    for _ in range(2):
        try:
            out = refresh.curl(["-H", "Authorization: Bearer " + tok, "-w", "\n%{http_code}", url], 30)
        except RuntimeError as e:
            code, body = "error " + str(e)[:60], ""
            continue
        body, code = out.rsplit("\n", 1)
        if code == "200":
            return code, json.loads(body)
        if code == "404":
            break
    return code, None


def text(v):
    if isinstance(v, dict):
        if "name" in v:
            return text(v["name"])
        return v.get("en_GB") or v.get("en_US") or next((x for x in v.values() if isinstance(x, str)), "")
    return v if isinstance(v, str) else ""


def row(d):
    bind = ((d.get("preview_item") or {}).get("binding") or {}).get("type", "")
    return "\t".join([
        str(d.get("id")), text(d.get("name")), (d.get("quality") or {}).get("type", ""),
        text(d.get("item_class")) + " / " + text(d.get("item_subclass")),
        bind or "-", "stack %s" % d.get("max_count", "?") if d.get("is_stackable") else "single",
        "tracked" if str(d.get("id")) in refresh.NAMES else "not tracked",
    ])


def known_names():
    for line in open(os.path.join(ROOT, "market.js"), encoding="utf-8"):
        if line.lstrip().startswith("var NAMES = "):
            return json.loads(line.split("=", 1)[1].strip().rstrip(";"))
    return {}


def main():
    ids = [int(x) for x in re.split(r"[\s,]+", os.environ.get("IDS", "")) if x.isdigit()]
    terms = [t.strip() for t in os.environ.get("SEARCH", "").split(";") if t.strip()]
    check_known = os.environ.get("KNOWN", "").lower() == "true"
    tok = refresh.token()
    ns = None
    for n in NAMESPACES:
        code, d = fetch(tok, "/data/wow/item/2447", n)  # Peacebloom
        print("namespace %s: %s%s" % (n, code, (" (" + text(d.get("name")) + ")") if d else ""))
        if d and ns is None:
            ns = n
    if not ns:
        raise SystemExit("No item namespace answered.")
    print("using " + ns, flush=True)

    min_id = int(os.environ.get("MIN_ID") or 0)
    for t in terms:
        q = "/data/wow/search/item?name.en_GB=%s&orderby=id:desc&_pageSize=200" % urllib.parse.quote(t)
        code, d = fetch(tok, q, ns)
        res = [r.get("data") or {} for r in (d or {}).get("results") or []]
        shown = [x for x in res if (x.get("id") or 0) >= min_id]
        print("\n== search %r: %s, %d results, %d from id %d" % (t, code, len(res), len(shown), min_id))
        for x in shown:
            print(row(x))
        sys.stdout.flush()

    if ids:
        print("\n== ids (%d)" % len(ids))
        for i in ids:
            code, d = fetch(tok, "/data/wow/item/%d" % i, ns)
            print(row(d) if d else "%d\tNOT FOUND (%s)" % (i, code))
        sys.stdout.flush()

    if check_known:
        names, odd = known_names(), 0
        print("\n== market.js names that differ from Blizzard's (%d checked)" % len(names))
        for k, ours in names.items():
            code, d = fetch(tok, "/data/wow/item/%s" % k, ns)
            theirs = text(d.get("name")) if d else ""
            if theirs != ours:
                odd += 1
                print("%s\tours %r\tBlizzard %r%s" % (k, ours, theirs, "" if d else " (%s)" % code))
        print("%d differ" % odd)


if __name__ == "__main__":
    main()
