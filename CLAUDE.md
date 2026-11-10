# Working on the WoW Forever Field Guide

- This repo is the master copy of the app, its data and its settings. The Claude artifact (https://claude.ai/artifact/E1mdPnaspxNLvMJSv5sWrk, slug 69624e23-a1ad-49b9-8860-2ba9743e5b49) is published from it.
- To change the app: pull main, edit here, test, commit and push straight to main (the owner approved direct pushes; no pull requests). Then publish the changed files to the artifact with the claude-artifacts `publish_files` tool, in patch mode, from the files on disk. Never retype files, and never edit the artifact directly.
- The repo is public. The Blizzard keys must never appear in it, in commit messages, or in `data/status.json`. They live only in the repo's Actions secrets (`BNET_ID`, `BNET_SECRET`).
- `data/` is written by the GitHub Actions refresh (`tools/ci_refresh.py`). Don't hand-edit it except to fix a mistake. `config/` holds settings that Claude's sync copies from the artifact's database.
- Test before pushing: serve the folder (`python3 -m http.server`), load it in headless Chrome, and check the Market status line, the watchlist, the gear check and the Updates tab.
- Status, 10 Nov 2026: the new pipeline is running alongside the old one. The switch-over was put off to 11 Nov because GitHub started the first scheduled runs hours late; the schedule now has several tries per window. Until the switch-over, the artifact still reads the database written by the old Claude price-refresh task, and the old hotfix task still edits the artifact's own index.html. At the switch-over, carry any newer notes from the artifact into `data/updates.json` (`tools/extract_updates.py` helps). Don't publish this repo's files to the artifact until then.

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
