#!/usr/bin/env python3
"""Build offline/wow-field-guide-offline.html: one file that opens in a browser with no internet and no Claude.

It puts market.js and data/latest.json inside index.html. Prices and character are frozen at the time of the build;
setting changes stay in that browser.

Usage: python3 tools/build_offline.py [repo folder]
"""
import datetime
import json
import os
import sys
from zoneinfo import ZoneInfo

root = os.path.abspath(sys.argv[1] if len(sys.argv) > 1 else os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))


def read(name):
    with open(os.path.join(root, name), encoding="utf-8") as f:
        return f.read()


html, js, data = read("index.html"), read("market.js"), read("data/latest.json").strip()
built = datetime.datetime.fromisoformat(json.loads(data)["built"].replace("Z", "+00:00")).astimezone(ZoneInfo("Europe/London"))
tag = '<script src="market.js"></script>'
if html.count(tag) != 1 or html.count("</head>") != 1 or "</script" in js.lower():
    sys.exit("index.html or market.js isn't in the expected shape; nothing written.")
banner = ('<div role="note" style="background:#3a2c17;color:#fff8e6;font:600 13px/1.45 system-ui,sans-serif;'
          'padding:7px 12px;text-align:center">Offline copy, data from ' + built.strftime("%a %-d %b %Y at %H:%M") +
          " UK time. Prices and character don't update here. Changes you make stay in this browser.</div>")
page = html.replace("</head>", "</head>" + banner, 1).replace(
    tag, '<script type="application/json" id="wowf-data">' + data.replace("</", "<\\/") + "</script>\n<script>\n" + js + "\n</script>", 1)
out = os.path.join(root, "offline", "wow-field-guide-offline.html")
os.makedirs(os.path.dirname(out), exist_ok=True)
with open(out, "w", encoding="utf-8") as f:
    f.write(page)
print("Wrote", os.path.relpath(out, root), "(%d KB)" % (len(page.encode("utf-8")) // 1024))
