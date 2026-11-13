# Working on the WoW Forever Field Guide

- This repo is the master copy of the app, its data and its settings. GitHub Pages serves it at https://markrack86.github.io/wow-field-guide/, the copy Mark uses. The Claude artifact (https://claude.ai/artifact/E1mdPnaspxNLvMJSv5sWrk, slug 69624e23-a1ad-49b9-8860-2ba9743e5b49) is no longer updated (Mark's call, 12 Nov 2026): don't publish to it. Its database is still read for settings.
- To change the app: pull main, edit here, test, commit and push straight to main (the owner approved direct pushes; no pull requests). GitHub Pages serves it from main.
- The repo is public. The Blizzard keys and the ntfy topic must never appear in it, in commit messages, or in `data/status.json`. They live only in the repo's Actions secrets (`BNET_ID`, `BNET_SECRET`, `NTFY_TOPIC`).
- `data/` is written by the GitHub Actions refresh (`tools/ci_refresh.py`). Don't hand-edit it except to fix a mistake. `config/` holds settings that Claude's sync copies from the artifact's database.
- Test before pushing: serve the folder (`python3 -m http.server`), load it in headless Chrome, and check the Gold tab (status line, At a glance, Price alerts, Under-priced listings, What to craft, What to sell, the watchlist), the gear check and the Updates tab.
- Status, 12 Nov 2026: hourly without cron-job.org, which never started a run. The Claude scheduled task "WoW Forever sync" runs at 04:52 and 19:52 UK: it copies newer settings from the artifact's database into config/, starts the session's GitHub refresh by pushing the time to config/refresh-request, checks that the previous session got its hourly reads, and does the morning hotfix check in data/updates.json. That run (`tools/ci_refresh.py --hourly`) reads at about 4.55am or 7.55pm, then waits and reads again at five to each hour while that's still in the online hours (5.55am; 8.55, 9.55 and 10.55pm). GitHub's own schedule is a backup. Each read also works out sell speed from the previous read's listings (kept in the run, and in the Actions cache between runs) and sends phone alerts through ntfy (secret NTFY_TOPIC). Publishing to the Claude artifact stopped on 12 Nov.

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
