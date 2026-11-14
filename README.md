# WoW Forever Field Guide

A companion app for World of Warcraft: Forever, set up for Brakka Keltorra (Orc Shaman, EU Normal, Horde): levelling, talents, professions, gold-making, gear upgrades and Auction House prices.

**Live app:** https://markrack86.github.io/wow-field-guide/
The private Claude artifact copy is no longer updated (since 12 Nov 2026).

## How it works

- **Refresh.** `.github/workflows/refresh.yml` runs `refresh.py` with the Blizzard API keys from this repo's encrypted Actions secrets (`BNET_ID`, `BNET_SECRET`). Each run reads Blizzard's latest hourly Auction House snapshot and the character (with a gear check), saves them under `data/`, works out how fast things sell from this snapshot and the previous read's, and commits to main. It takes about a minute.
- **When it runs.** At five to every hour, day and night (Blizzard takes a new snapshot about once an hour). One run (`tools/ci_refresh.py --hourly`) reads, then waits and reads again at five to each hour for about five hours, and then starts the next run, which carries on: GitHub stops a job after six hours. GitHub's own schedule is only a backup that restarts the chain if it ever stops, because it often runs hours late or not at all. Claude's "WoW Forever sync" task also checks twice a day and nudges it (a push to `config/refresh-request`) if the newest read is more than 90 minutes old. To read now, open the **Actions** tab, pick **Refresh prices and character**, and choose **Run workflow**; if a run is already going, the new one waits for it to finish. To stop the reads, choose **Disable workflow** there.
- **Cost.** Nothing: Actions minutes are free for public repositories, and each read adds only about 20 to 30 KB to the repository once GitHub packs it.
- **Data.** `data/latest.json` holds the prices, the last day of hourly reads, the character and the settings the page loads. `data/updates.json` holds the Updates tab's notes. `data/status.json` says how the last refresh went.
- **Site.** GitHub Pages serves `index.html` and `market.js` straight from main.
- **Settings.** The watchlist, gear stat and quest ticks are saved in the Claude artifact's database, and Claude copies them into `config/`. On the GitHub site, setting changes stay in your browser.
- **Claude.** This repo is the master copy. Claude's sync task, at about 4.52am and 7.52pm UK time, copies settings in from the Claude artifact's database, checks the hourly reads are arriving (and restarts them if not), and adds hotfix notes to `data/updates.json` each morning. It no longer publishes to the Claude artifact. Code changes are made here first.

## Files

| Path | What it is |
|---|---|
| `index.html`, `market.js` | The app |
| `refresh.py` | The refresh script (Python 3 standard library plus `curl`) |
| `tools/ci_refresh.py` | What the workflow runs: refresh, file the results, commit; with `--hourly`, again at five to each hour for about five hours, then the next run takes over |
| `tools/build_latest.py` | Rebuilds `data/latest.json` |
| `tools/build_offline.py` | Builds `offline/wow-field-guide-offline.html`, a single file that works with no internet |
| `data/prices/` | One file per day of Auction House prices (each hourly read replaces that day's) |
| `data/hourly/` | Each hourly read's prices, kept for two days |
| `data/stats/recent.json` | The price history each refresh builds on |
| `data/char/current.json` | Level, gear and upgrades, professions, quests, reputations, talents |
| `data/speed/` | Sell-speed samples: what sold between two hourly reads |
| `data/updates.json` | The Updates tab's hotfix and patch notes, written by Claude's daily check (format in `CLAUDE.md`) |
| `tools/check_updates.py` | Checks `data/updates.json` before it's committed |
| `config/` | Settings |

## Run the refresh yourself

```
BNET_ID=<client id> BNET_SECRET=<client secret> python3 tools/ci_refresh.py --no-git
```

The Blizzard keys must never be committed: this repo is public. They live only in **Settings → Secrets and variables → Actions**.
