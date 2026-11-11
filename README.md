# WoW Forever Field Guide

A companion app for World of Warcraft: Forever, set up for Brakka Keltorra (Orc Shaman, EU Normal, Horde): levelling, talents, professions, gold-making, gear upgrades and Auction House prices.

**Live app:** https://markrack86.github.io/wow-field-guide/
It also runs as a private Claude artifact, published from this repo.

## How it works

- **Refresh.** `.github/workflows/refresh.yml` runs `refresh.py` with the Blizzard API keys from this repo's encrypted Actions secrets (`BNET_ID`, `BNET_SECRET`), saves prices, price history, the character (with a gear check) and a sell-speed sample under `data/`, and commits to main. Claude's "WoW Forever sync" task starts it at about 05:37 and 19:37 UK time by pushing the time to `config/refresh-request`, because GitHub's own schedule (tries from 4am and 6pm UK time) often runs hours late or not at all. To run it now, open the **Actions** tab, pick **Refresh prices and character**, and choose **Run workflow**.
- **Data.** `data/latest.json` holds the prices, character and settings the page loads. `data/updates.json` holds the Updates tab's notes. `data/status.json` says how the last refresh went.
- **Site.** GitHub Pages serves `index.html` and `market.js` straight from main.
- **Settings.** The watchlist, gear stat and quest ticks are saved in the Claude artifact's database, and Claude copies them into `config/`. On the GitHub site, setting changes stay in your browser.
- **Claude.** This repo is the master copy. Claude's sync task copies settings in, starts the refresh, adds hotfix notes to `data/updates.json` each morning and publishes changed files to the Claude artifact. Code changes are made here first.

## Files

| Path | What it is |
|---|---|
| `index.html`, `market.js` | The app |
| `refresh.py` | The refresh script (Python 3 standard library plus `curl`) |
| `tools/ci_refresh.py` | What the workflow runs: refresh, file the results, commit |
| `tools/build_latest.py` | Rebuilds `data/latest.json` |
| `tools/build_offline.py` | Builds `offline/wow-field-guide-offline.html`, a single file that works with no internet |
| `data/prices/` | One file per day of Auction House prices |
| `data/stats/recent.json` | The price history each refresh builds on |
| `data/char/current.json` | Level, gear and upgrades, professions, quests, reputations, talents |
| `data/speed/` | Sell-speed samples |
| `data/updates.json` | The Updates tab's hotfix and patch notes, written by Claude's daily check (format in `CLAUDE.md`) |
| `tools/check_updates.py` | Checks `data/updates.json` before it's committed |
| `config/` | Settings |

## Run the refresh yourself

```
BNET_ID=<client id> BNET_SECRET=<client secret> python3 tools/ci_refresh.py --no-git
```

The Blizzard keys must never be committed: this repo is public. They live only in **Settings → Secrets and variables → Actions**.
