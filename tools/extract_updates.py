"""Switch-over helper (remove after the switch-over): turn the Updates panel and the footer's "Updates and timers"
sources in the old artifact's index.html into data/updates.json.

Usage: python3 tools/extract_updates.py <old index.html> tools <output.json>
"""
import datetime, json, re, sys
from html.parser import HTMLParser
from zoneinfo import ZoneInfo
sys.path.insert(0, sys.argv[2])
import build_latest

html = open(sys.argv[1], encoding="utf-8").read()
panel = html[html.index("<!-- UPDATES -->"):html.index("<!-- END PANELS -->")]
foot = html[html.index('<p class="label">Updates and timers</p>'):]
foot = foot[:foot.index("</ul>") + 5]

class P(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.entries, self.stack, self.cur, self.block, self.capture, self.buf, self.cls_li = [], [], None, None, None, "", None
    def handle_starttag(self, tag, attrs):
        a = dict(attrs); c = (a.get("class") or "").split()
        self.stack.append((tag, c))
        if tag == "li" and "tl" in c:
            self.cur = {"date": None, "label": "", "chips": [], "state": "new" if "is-new" in c else "due" if "is-due" in c else "", "title": "", "blocks": []}
            self.entries.append(self.cur); self.block = None
        elif self.cur is None:
            return
        elif tag in ("time", "span") and "tl-date" in c:
            self.cur["date"] = a.get("datetime"); self.capture, self.buf = "label", ""
        elif tag == "span" and "chip" in c and "mine-tag" not in c and self.cls_li is None:
            self.capture, self.buf = "chip", ""
        elif tag == "p" and "tl-title" in c:
            self.capture, self.buf = "title", ""
        elif tag == "p" and "tl-sub" in c:
            self.block = {"heading": ""}; self.cur["blocks"].append(self.block); self.capture, self.buf = "heading", ""
        elif tag == "p" and "note" in c:
            self.cur["blocks"].append({"note": ""}); self.capture, self.buf = "note", ""
        elif tag == "ul":
            key = "byClass" if "clsch" in c else "items"
            if self.block is None or key in self.block or "items" in self.block or "byClass" in self.block:
                self.block = {}; self.cur["blocks"].append(self.block)
            self.block[key] = []
        elif tag == "li" and self.block is not None and "byClass" in self.block:
            self.cls_li = [a.get("data-cls"), ""]
        elif tag == "li" and self.block is not None and "items" in self.block:
            self.capture, self.buf = "item", ""
        elif tag == "br" and self.cls_li is not None:
            pass
    def handle_endtag(self, tag):
        t, c = self.stack.pop() if self.stack else (None, [])
        text = " ".join(self.buf.split())
        if self.capture == "label" and tag in ("time", "span"): self.cur["label"] = text; self.capture = None
        elif self.capture == "chip" and tag == "span": self.cur["chips"].append(text); self.capture = None
        elif self.capture == "title" and tag == "p": self.cur["title"] = text; self.capture = None
        elif self.capture == "heading" and tag == "p": self.block["heading"] = text; self.capture = None
        elif self.capture == "note" and tag == "p": self.cur["blocks"][-1]["note"] = text; self.capture = None; self.block = None
        elif self.capture == "item" and tag == "li": self.block["items"].append(text); self.capture = None
        elif self.cls_li is not None and tag == "li":
            self.block["byClass"].append([self.cls_li[0], " ".join(self.cls_li[1].split())]); self.cls_li = None
        elif tag == "ul" and self.block is not None and self.cur is not None:
            self.block = None
    def handle_data(self, data):
        if self.capture: self.buf += data
        elif self.cls_li is not None and self.stack and self.stack[-1][0] == "span" and not self.stack[-1][1]:
            self.cls_li[1] += data

p = P(); p.feed(panel)
for e in p.entries:
    for b in e["blocks"]:
        if b.get("heading") == "": del b["heading"]
m = re.search(r"Snapshot taken on [A-Za-z]+ (\d{1,2}) ([A-Za-z]{3}) at (\d{1,2})(?::(\d{2}))?([ap]m) UK time", panel)
mon = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"].index(m.group(2)) + 1
hour = int(m.group(3)) % 12 + (12 if m.group(5) == "pm" else 0)
checked = datetime.datetime(2026, mon, int(m.group(1)), hour, int(m.group(4) or 0), tzinfo=ZoneInfo("Europe/London")).astimezone(datetime.timezone.utc)
sources = [{"title": t, "url": u} for u, t in re.findall(r'<a href="([^"]+)" rel="noopener">([^<]+)</a>', foot)]
out = {"checked": checked.strftime("%Y-%m-%dT%H:%M:%SZ"), "entries": p.entries, "sources": sources}
build_latest.save_pretty(sys.argv[3], out)
print(len(p.entries), "entries,", sum(len(b.get("items", [])) + len(b.get("byClass", [])) for e in p.entries for b in e["blocks"]), "bullets,", len(sources), "sources; checked", out["checked"])
for e in p.entries: print(" ", e["state"] or "-", e["date"], "|", e["label"], "|", e["chips"], "|", e["title"], "|", [list(b.keys()) for b in e["blocks"]])
