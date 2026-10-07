# Workday Journey

**Current version: V8.4.7.7 – Account & Authentication UX Refresh**

Workday Journey is a personal internship/workday progress dashboard with Daily Journal, Project Tracker, Calendar & Attendance, Reports, Achievements, Daily Missions, Reward Shop, Work Bank, Work Exchange, Project File Vault, and optional Supabase Cloud Sync.


## V8.4.7.7 – Account & Authentication UX Refresh

- Redesigned the Account popup so **Sign in** and **Create account** are clearly separated flows.
- Added a dedicated signup form with password confirmation and show/hide password controls.
- Added large centered success states after signup and sign-in instead of relying on a small bottom-right toast.
- Added inline, user-friendly authentication errors for invalid credentials, duplicate accounts, password mismatch, rate limits, and common signup issues.
- Optimized signup for this deployment with **Supabase Confirm Email disabled**, so a successful signup can create the session immediately.
- Added a post-auth return-action event hook (`workday:v8-auth-complete`) for upcoming account-required flows such as Reward Code redemption.
- No Supabase SQL migration is required for this patch.

## V8.4.7.6 – Cloud Reload Loop Hotfix

This hotfix fixes a Cloud Sync reload loop that could make the app appear to refresh every second after deploying a new version.

### What changed

- `wp-app-version`, `wp-theme-default-version`, and `wp-data-reset-version` are now device-local markers and are no longer included in Cloud Sync payloads or conflict detection.
- Prevents an older Cloud snapshot from restoring an older app version marker and fighting the newly deployed version on every page load.
- Added a per-tab automatic reload guard: the same reconciled Cloud payload cannot trigger document reloads repeatedly.
- Normal Cloud data, Smart Merge, manual **Use this device / Use Cloud**, and existing user data remain unchanged.
- No Supabase SQL migration is required.
- Updated the Service Worker cache and app version to `8.4.7.6`.

## V8.4.7.5 – Tier Mastery Card Polish

This patch improves Journey Challenge tier presentation in the Achievement Center so each Tier and its Mastery reward read as one coherent unit.

### What changed

- Combined the Tier heading and Tier Mastery reward into a single themed card.
- Added a distinct color identity for each Tier based on its Mastery effect: Azure (Common), Violet (Rare), Aurora Flame (Epic), and Gold (Legendary).
- Split Mastery rewards into clear **Unlocked Title** and **Theme Effect** rows.
- Improved Thai/English spacing and labels so reward text no longer runs together.
- Added responsive layouts for notebook/mobile widths and dark mode.
- Added this patch to the in-app **What's New / Version History**.
- Updated the Service Worker cache and app version to `8.4.7.5`.

## V8.4.7.4 – Hourly Market Update

This patch makes Work Exchange move more frequently during the workday while preserving the deterministic simulated-market design.

### What changed

- Work Exchange now has **10 hourly price points** per business day: `07:00` through `16:00`.
- Trading is available Monday–Friday from **07:00 until 16:00**. The `16:00` point is the daily closing price.
- Added a live **countdown to the next market round/open** in the market status card.
- The Work Exchange page automatically moves to the next hourly round when the clock crosses an hour; users no longer need to refresh the page.
- `Today` charts now show a richer hourly intraday path. `5D` and `All` continue to use each business day's current/closing value.
- Hourly prices remain deterministic from date + slot + symbol + daily market event, so refreshing the same round does not reroll a different price.
- Per-slot movement is scaled so changing from 4 rounds to 10 rounds does not simply multiply the overall daily volatility.
- Trading Academy chart guidance now describes the hourly Today path.
- Added this patch to the in-app **What's New / Version History**.
- Updated the Service Worker cache and app version to `8.4.7.4`.

## Recent Version History

| Version | Highlight |
| --- | --- |
| V8.4.7.7 | 👤 Account & Authentication UX Refresh |
| V8.4.7.6 | ☁ Cloud Reload Loop Hotfix |
| V8.4.7.5 | 🎨 Tier Mastery Card Polish |
| V8.4.7.4 | 📈 Hourly Market Update |
| V8.4.7.3 | 🕘 Extended Version History |
| V8.4.7.2 | 📰 What's New & Version History |
| V8.4.7.1 | ☁ Smart Cloud Sync |
| V8.4.7 | 🏆 Achievement Center UI Cleanup |
| V8.4.6 | 🏅 Finance & Feature Achievements |
| V8.4.5 | 📁 Project File Vault |
| V8.4.4 | 🏦 Daily Deals + Finale Bank Boost |
| V8.4.3 | 🎁 Chest Opening Experience |
| V8.4.2 | 🎨 Typography + Sidebar Reorder |
| V8.4.1 | 🎓 Trading Academy / Beginner Mode |
| V8.4 | 📈 Work Exchange |
| V8.3 | 💰 Work Bank |
| V8.2 | 🎯 Daily Missions & Chests |
| V8.1 | 🪙 Work Coins & Reward Shop |
| V8.0 | ☁ Cloud Sync & Productivity Tools |
| V7 | 🧭 Multi-page Workspace & Achievement Center |
| V6 | 📓 Daily Journal, Project Tracker & Reports |

## Main Features

- Dashboard and internship progress tracking
- Daily Work Journal
- Project Tracker
- Calendar, leave, company holidays, and compensatory workdays
- Reports & Analytics
- Journey Challenges and Feature Achievements
- Work Coins and Reward Shop
- Daily Deals and Weekly Deals
- Mascots, Accessories, Profile Frames, Themes, and Effects
- Daily Missions, Daily Chest, and Weekly Chest
- Work Bank with compound interest and Savings Streak
- Work Exchange simulated market and Trading Academy
- Project File Vault using private Supabase Storage
- Local-first operation with optional Supabase Cloud Sync
- In-app What's New / Version History

## Updating from V8.4.7.6

Replace the changed files from this release in your existing project, then redeploy the site.

The Service Worker cache name and asset query version were updated to `8.4.7.7`. If a browser still shows an older version, use the app's **Clear App Cache / Reload Latest Version** option.

## Supabase

V8.4.7.7 does **not** require a new table, SQL migration, Storage bucket, or RLS policy.

Continue using the same Supabase setup from the previous versions:

- `workday_user_state` for Cloud Sync
- Supabase Auth for user accounts
- `project-files` private Storage bucket and `project_file_versions` table for Project File Vault (V8.4.5 setup)

Do not place a Supabase `service_role` key in frontend code. The browser should use the existing publishable/anon key configuration.

## Work Exchange timing

The market schedule is based on the browser's local clock and uses deterministic hourly rounds. A different system clock/timezone can therefore display a different current round. The simulated market still contains no real money or real securities.

## Local-first behavior

The application still works without signing in. Local data remains stored in the browser. Cloud Sync is optional and becomes active after a user signs in.

The key `wp-v8472-last-seen-version` remains intentionally device-local. Reading What's New on one device does not create a Cloud conflict or force another device to mark the update as read.

## Version

`Workday Journey V8.4.7.7`

Patch focus: **clear sign-in/signup flows / centered success feedback / inline auth errors / Confirm Email OFF signup flow**
