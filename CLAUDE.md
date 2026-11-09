# Working on the WoW Forever Field Guide

- This repo is the master copy of the app, its data and its settings. The Claude artifact (https://claude.ai/artifact/E1mdPnaspxNLvMJSv5sWrk, slug 69624e23-a1ad-49b9-8860-2ba9743e5b49) is published from it.
- To change the app: pull main, edit here, test, commit and push straight to main (the owner approved direct pushes; no pull requests). Then publish the changed files to the artifact with the claude-artifacts `publish_files` tool, in patch mode, from the files on disk. Never retype files, and never edit the artifact directly.
- The repo is public. The Blizzard keys must never appear in it, in commit messages, or in `data/status.json`. They live only in the repo's Actions secrets (`BNET_ID`, `BNET_SECRET`).
- `data/` is written by the GitHub Actions refresh (`tools/ci_refresh.py`). Don't hand-edit it except to fix a mistake. `config/` holds settings that Claude's sync copies from the artifact's database.
- Test before pushing: serve the folder (`python3 -m http.server`), load it in headless Chrome, and check the Market status line, the watchlist and the gear check.
- Status, 9 Nov 2026: the new pipeline is running alongside the old one. Until the switch-over, the artifact still reads the database written by the old Claude price-refresh task. Don't publish this repo's files to the artifact until the owner agrees to switch over.
