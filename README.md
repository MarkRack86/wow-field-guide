# WoW Forever Field Guide

A companion app for World of Warcraft: Forever, set up for Brakka Keltorra (Orc Shaman, EU Normal, Horde): levelling, talents, professions, gold-making, gear upgrades and Auction House prices.

**Live app:** https://markrack86.github.io/wow-field-guide/
It also runs as a private Claude artifact, published from this repo.

## How it works

- **Refresh.** `.github/workflows/refresh.yml` runs `refresh.py` with the Blizzard API keys from this repo's encrypted Actions secrets (`BNET_ID`, `BNET_SECRET`). Each run reads Blizzard's latest hourly Auction House snapshot and the character (with a gear check), saves them under `data/`, works out how fast things sell from this snapshot and the previous run's, sends any phone alerts, and commits to main. It takes about a minute.
- **When it runs.** Every hour while Mark is usually online: at 4.55am, 5.55am, 7.55pm, 8.55pm, 9.55pm and 10.55pm UK time. A free [cron-job.org](https://cron-job.org) job presses **Run workflow** at those times (setup below), because GitHub's own schedule often runs hours late or not at all; that schedule stays as a backup and stops at once when it isn't needed. Claude's "WoW Forever sync" task also starts a refresh at about 05:07 and 20:07 if the hour's read is missing, by pushing the time to `config/refresh-request`. To run it now, open the **Actions** tab, pick **Refresh prices and character**, and choose **Run workflow**.
- **Phone alerts.** When a watched item's price moves by 25% or more since the previous hourly read (worth at least 1s over 20, with 20 or more listed), or its cheapest listing crosses a price set on the watchlist, the refresh sends one notification through [ntfy](https://ntfy.sh) to the topic in the `NTFY_TOPIC` secret, during the online hours only. Each item's moves alert at most once in three hours. The rule is at the top of `refresh.py` (`PUSH_*`); `data/stats/pushes.json` logs what was found and sent.
- **Data.** `data/latest.json` holds the prices, the last day of hourly reads, the character and the settings the page loads. `data/updates.json` holds the Updates tab's notes. `data/status.json` says how the last refresh went.
- **Site.** GitHub Pages serves `index.html` and `market.js` straight from main.
- **Settings.** The watchlist, gear stat and quest ticks are saved in the Claude artifact's database, and Claude copies them into `config/`. On the GitHub site, setting changes stay in your browser.
- **Claude.** This repo is the master copy. Claude's sync task, at about 05:07 and 20:07 UK time, copies settings in, starts the refresh if needed, adds hotfix notes to `data/updates.json` each morning and publishes changed files to the Claude artifact, so the Claude copy gets the hourly reads twice a day and this site gets every one. Code changes are made here first.

## Files

| Path | What it is |
|---|---|
| `index.html`, `market.js` | The app |
| `refresh.py` | The refresh script (Python 3 standard library plus `curl`) |
| `tools/ci_refresh.py` | What the workflow runs: refresh, file the results, commit |
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

## Set up the hourly runs and phone alerts

**Hourly runs (cron-job.org).**
1. On GitHub: **Settings → Developer settings → Personal access tokens → Fine-grained tokens → Generate new token**. Repository access: only `MarkRack86/wow-field-guide`. Permissions: **Actions: Read and write** (nothing else). Copy the token.
2. On cron-job.org (free account): **Create cronjob**. URL `https://api.github.com/repos/MarkRack86/wow-field-guide/actions/workflows/refresh.yml/dispatches`. Schedule: custom, minute 55 of hours 4, 5, 19, 20, 21 and 22, every day, time zone Europe/London.
3. Under **Advanced**: request method **POST**; headers `Authorization: Bearer <the token>`, `Accept: application/vnd.github+json`, `X-GitHub-Api-Version: 2022-11-28`, `Content-Type: application/json`; request body `{"ref":"main"}`.
4. **Test run**: GitHub answers 204 and a run appears on the **Actions** tab. Turn on cron-job.org's failure emails, so an expired token gets noticed.

**Phone alerts (ntfy).** Install the ntfy app, subscribe to a hard-to-guess topic on ntfy.sh (anyone who knows the name can read it), and add the same name as the Actions secret `NTFY_TOPIC`. With no `NTFY_TOPIC`, alerts are only logged.

## Run the refresh yourself

```
BNET_ID=<client id> BNET_SECRET=<client secret> python3 tools/ci_refresh.py --no-git
```

The Blizzard keys must never be committed: this repo is public. They live only in **Settings → Secrets and variables → Actions**.
