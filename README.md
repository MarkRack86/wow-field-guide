# WoW Forever Field Guide

A companion app for World of Warcraft: Forever, set up for Brakka Keltorra (Orc Shaman, EU Normal, Horde): levelling, talents, professions, gold-making, gear upgrades and Auction House prices.

**Live app:** https://markrack86.github.io/wow-field-guide/
The private Claude artifact copy is no longer updated (since 12 Nov 2026).

## How it works

- **Refresh.** `.github/workflows/refresh.yml` runs `refresh.py` with the Blizzard API keys from this repo's encrypted Actions secrets (`BNET_ID`, `BNET_SECRET`). Each run reads Blizzard's latest hourly Auction House snapshot and the character (with a gear check), saves them under `data/`, works out how fast things sell from this snapshot and the previous run's, sends any phone alerts, and commits to main. It takes about a minute.
- **When it runs.** Every hour while Mark is usually online: at about 4.55am, 5.55am, 7.55pm, 8.55pm, 9.55pm and 10.55pm UK time. Claude's "WoW Forever sync" task starts each session's first read at about 4.55am and 7.55pm by pushing the time to `config/refresh-request`. That run then stays on (`tools/ci_refresh.py --hourly`) and reads again at five to each hour until the session ends. GitHub's own schedule is a backup, because it often runs hours late or not at all; it stops at once when it isn't needed. To run it now, open the **Actions** tab, pick **Refresh prices and character**, and choose **Run workflow**.
- **Phone alerts.** When a watched item's price moves by 25% or more since the previous hourly read (worth at least 1s over 20, with 20 or more listed), or its cheapest listing crosses a price set on the watchlist, the refresh sends one notification through [ntfy](https://ntfy.sh) to the topic in the `NTFY_TOPIC` secret, during the online hours only. Each item's moves alert at most once in three hours. The rule is at the top of `refresh.py` (`PUSH_*`); `data/stats/pushes.json` logs what was found and sent.
- **Data.** `data/latest.json` holds the prices, the last day of hourly reads, the character and the settings the page loads. `data/updates.json` holds the Updates tab's notes. `data/status.json` says how the last refresh went.
- **Site.** GitHub Pages serves `index.html` and `market.js` straight from main.
- **Settings.** The watchlist, gear stat and quest ticks are saved in the Claude artifact's database, and Claude copies them into `config/`. On the GitHub site, setting changes stay in your browser.
- **Claude.** This repo is the master copy. Claude's sync task, at about 4.52am and 7.52pm UK time, copies settings in from the Claude artifact's database, starts each session's refresh, checks the previous session got its hourly reads, and adds hotfix notes to `data/updates.json` each morning. It no longer publishes to the Claude artifact. Code changes are made here first.

## Files

| Path | What it is |
|---|---|
| `index.html`, `market.js` | The app |
| `refresh.py` | The refresh script (Python 3 standard library plus `curl`) |
| `tools/ci_refresh.py` | What the workflow runs: refresh, file the results, commit; with `--hourly`, again at five to each hour until the session ends |
| `tools/build_latest.py` | Rebuilds `data/latest.json` |
| `tools/build_offline.py` | Builds `offline/wow-field-guide-offline.html`, a single file that works with no internet |
| `data/prices/` | One file per day of Auction House prices (each hourly read replaces that day's) |
| `data/hourly/` | Each hourly read's prices, kept for two days |
| `data/stats/recent.json` | The price history each refresh builds on |
| `data/char/current.json` | Level, gear and upgrades, professions, quests, reputations, talents |
| `data/speed/` | Sell-speed samples: what sold between two hourly reads |
| `data/stats/pushes.json` | The last two days of phone alerts, sent or not |
| `data/updates.json` | The Updates tab's hotfix and patch notes, written by Claude's daily check (format in `CLAUDE.md`) |
| `tools/check_updates.py` | Checks `data/updates.json` before it's committed |
| `config/` | Settings |

## Set up phone alerts

**Phone alerts (ntfy).** Install the ntfy app, subscribe to a hard-to-guess topic on ntfy.sh (anyone who knows the name can read it), and add the same name as the Actions secret `NTFY_TOPIC`. With no `NTFY_TOPIC`, alerts are only logged.

## Run the refresh yourself

```
BNET_ID=<client id> BNET_SECRET=<client secret> python3 tools/ci_refresh.py --no-git
```

The Blizzard keys must never be committed: this repo is public. They live only in **Settings → Secrets and variables → Actions**.
