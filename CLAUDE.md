# Working on the WoW Forever Field Guide

- This repo is the master copy of the app, its data and its settings. GitHub Pages serves it at https://markrack86.github.io/wow-field-guide/, the copy Mark uses. The Claude artifact (https://claude.ai/artifact/E1mdPnaspxNLvMJSv5sWrk, slug 69624e23-a1ad-49b9-8860-2ba9743e5b49) is no longer updated (Mark's call, 12 Nov 2026): don't publish to it. Its database is still read for settings.
- To change the app: pull main, edit here, test, commit and push straight to main (the owner approved direct pushes; no pull requests). GitHub Pages serves it from main.
- The repo is public. The Blizzard keys must never appear in it, in commit messages, or in `data/status.json`. They live only in the repo's Actions secrets (`BNET_ID`, `BNET_SECRET`).
- `data/` is written by the GitHub Actions refresh (`tools/ci_refresh.py`). Don't hand-edit it except to fix a mistake. `config/` holds settings that Claude's sync copies from the artifact's database.
- Test before pushing: serve the folder (`python3 -m http.server`), load it in headless Chrome, and check the Gold tab (status line, At a glance, Big moves, Herb search, Selling high, Under-priced listings, What to craft, What to sell and its Show all), the Talents tab (the You against the plan card and the tree marks), the gear check and the Updates tab.
- Status, 14 Nov 2026: the refresh reads at five to every hour, day and night (Mark's call: the repo is public, so Actions minutes cost nothing). One run (`tools/ci_refresh.py --hourly`) reads hourly for about five hours, then its last step starts the next run with `gh workflow run refresh.yml -f chain=true`, which skips its first read if prices are under 40 minutes old. GitHub's own schedule (every 3 hours) only restarts the chain if it stops; while a run is going it waits in the queue and is replaced. Each read also works out sell speed from the previous read's listings (kept in the run, and in the Actions cache between runs). Phone alerts were dropped on 14 Nov (Mark's call), and so was the Gold tab's watchlist: the page no longer reads `config/watch.json` (`refresh.py` still takes it, for an alert count nothing shows). The Claude scheduled task "WoW Forever sync" runs at 04:52 and 19:52 UK: it copies newer settings from the artifact's database into config/, checks the hourly reads arrived, nudges the refresh (pushes the time to config/refresh-request) if the newest read is over 90 minutes old, and does the morning hotfix check in data/updates.json. Publishing to the Claude artifact stopped on 12 Nov.
- A running refresh keeps the code it started with until it hands over (up to about five hours). After a push that changes `refresh.py`, `tools/ci_refresh.py` or the workflow, a run waits in the queue; to apply the change at once, cancel the running "Refresh prices and character" run, and the queued one starts and reads straight away.

## The Updates tab: `data/updates.json`

Claude's daily hotfix check edits only this file and `data/market-notes.json` (below), never `index.html`. The page escapes everything, so write plain text only.

- `checked`: when the check last ran, in UTC, like `2026-11-10T05:37:00Z`. The page shows it in UK time on the Updates tab, in the masthead and in the footer.
- `entries`: newest first, with future events (like raids opening) at the bottom. Each entry has:
  - `date`: `YYYY-MM-DD`, or `null` when there's no exact date
  - `label`: the date as shown, like `Tue 10 Nov`
  - `chips`: tags such as `["Hotfixes"]`
  - `state`: `"new"` for entries added by today's check, `"due"` for something expected today, otherwise `""`
  - `title`
  - `blocks`: a list of `{"heading": "...", "items": ["..."]}` (heading optional), `{"heading": "By class", "byClass": [["Shaman", "..."]]}` or `{"note": "..."}`
- `sources`: the footer's "Updates and timers" links, newest first, as `{"title": "...", "url": "https://..."}`.

Each run:
- Add new entries at the top with state `"new"`.
- Clear `"new"` and `"due"` from older entries, along with any "Expected" or "Due today" chip.
- If an announced fix has shipped, say so in the new entry and delete the old announcement.
- Update `checked`, even when nothing is new.
- Write plain British English in short sentences. Start a class-specific bullet with the class name, like "Shaman: ...".
- Run `python3 tools/check_updates.py` before committing.
- Then do the Gold tab's "Why" notes, below.

## The Gold tab's "Why" notes: `data/market-notes.json`

The Gold tab says why a price moved sharply (Big moves, Selling high and Under-priced listings). The page works out what the listings show by itself: new to the Auction House, far more or fewer listed than usual, few listed, or most of them at one price. This file adds the causes the data can't show. Plain text only: the page escapes it, and the repo is public.

- `checked`: when the notes were last checked, in UTC, like `2026-11-13T05:37:00Z`.
- `notes`: newest first. Each has `ids` (item ids, as in market.js's `NAMES`), `date` (`YYYY-MM-DD`, when written), `text` (one to three short sentences), and may have `source` (a short name, like "Blizzard") with `url` (https). The page shows an item's newest note from the last 30 days, with the source and date.

Each morning run, after the Updates check:
- Run `python3 tools/market_moves.py`. It lists the big moves, the under-priced listings and Brakka's herbs and potions selling high, with listed counts and whether a note covers each item.
- For the biggest moves with no note (about the top ten, and every under-priced listing), look for a clear cause in Blizzard's hotfix notes and the news: a drop rate, vendor, recipe or quest change, a new use, an event. Add a note only when a source supports it. Write "No hotfix has changed it" only after checking Blizzard's latest hotfix list. Don't guess about buyouts or individual sellers; the page already reports the listed counts.
- Replace a note when its cause changes, and delete notes older than 30 days.
- Update `checked` even when nothing is new, and run `python3 tools/check_notes.py` before committing.
