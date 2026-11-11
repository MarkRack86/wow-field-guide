# Working on the WoW Forever Field Guide

- This repo is the master copy of the app, its data and its settings. The Claude artifact (https://claude.ai/artifact/E1mdPnaspxNLvMJSv5sWrk, slug 69624e23-a1ad-49b9-8860-2ba9743e5b49) is published from it.
- To change the app: pull main, edit here, test, commit and push straight to main (the owner approved direct pushes; no pull requests). Then publish the changed files to the artifact with the claude-artifacts `publish_files` tool, in patch mode, from the files on disk. Never retype files, and never edit the artifact directly.
- The repo is public. The Blizzard keys must never appear in it, in commit messages, or in `data/status.json`. They live only in the repo's Actions secrets (`BNET_ID`, `BNET_SECRET`).
- `data/` is written by the GitHub Actions refresh (`tools/ci_refresh.py`). Don't hand-edit it except to fix a mistake. `config/` holds settings that Claude's sync copies from the artifact's database.
- Test before pushing: serve the folder (`python3 -m http.server`), load it in headless Chrome, and check the Gold tab (status line, What to craft, What to sell, the watchlist), the gear check and the Updates tab.
- Status, 11 Nov 2026: switched over. The artifact is published from this repo (index.html, market.js, data/latest.json, data/updates.json) and reads only settings from its database. The Claude scheduled task "WoW Forever sync" runs at 05:37 and 19:37 UK: it copies newer settings from the artifact's database into config/, starts the GitHub refresh by pushing the time to config/refresh-request when a window's prices are missing (GitHub's own schedule mostly doesn't run), does the morning hotfix check in data/updates.json, and publishes changed files. The two old Claude tasks are switched off, waiting for the owner to delete them.

## The Updates tab: `data/updates.json`

Claude's daily hotfix check edits only this file, never `index.html`. The page escapes everything, so write plain text only.

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
