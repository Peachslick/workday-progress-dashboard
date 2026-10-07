# Workday Journey

**Current version: V8.5.0 – Navigation & App Shell Refresh**

Workday Journey is a personal internship/workday progress dashboard with Daily Journal, Project Tracker, Calendar & Attendance, Reports, Achievements, Daily Missions, Reward Shop, Work Bank, Work Exchange, Project File Vault, and optional Supabase Cloud Sync.


## V8.5.0 – Navigation & App Shell Refresh

V8.5.0 starts the UX/UI System Refresh without changing the existing business logic for Work Coins, Reward Codes, Cloud Sync, Work Bank, Work Exchange, Project File Vault, or Achievements.

### What changed

- Reorganized the Sidebar into four clear sections: **WORK / JOURNEY / ECONOMY / SYSTEM**.
- Replaced Sidebar navigation emoji with one consistent line-icon system while keeping playful emoji inside rewards and gamification content.
- Simplified Sidebar density and improved the collapsed state with cleaner icon-only navigation and native hover labels.
- Refined the Topbar into a flatter app-shell surface with one clear page title, a concise subtitle, Notifications, Cloud status, and Profile actions.
- Standardized page headers across Journal, Projects, Reports, Calendar, Achievements, Missions, Rewards, Work Bank, Work Exchange, Developer Tools, and Settings.
- Added a compact mobile bottom dock for **Dashboard / Journal / Projects / Rewards / More** while preserving the full Sidebar drawer for every route.
- Added responsive spacing, dark-mode treatment, focus/hover states, safe-area support, and reduced-motion handling.
- Added `v850.css` and `v850.js` as an isolated shell layer so the refresh stays low-risk and does not rewrite existing feature logic.
- Updated the app/PWA cache version and in-app What's New history to `8.5.0`.

### Supabase

V8.5.0 requires **no new SQL, table, RPC, Storage bucket, RLS policy, or Auth setting**. Keep the existing V8.4.8.1 Reward Code setup/hotfix in place.

### Updating from V8.4.8.1

Replace the changed frontend files from the V8.5.0 ZIP and redeploy. No Supabase action is required. If a browser still shows the previous shell, use **Clear App Cache / Reload Latest Version** once.

## V8.4.8.1 – Reward Code Redemption Hotfix

This patch fixes the Supabase RPC error `column reference "code" is ambiguous` when redeeming an existing Reward Code.

### What changed

- Qualified the `reward_codes.code` column inside `redeem_reward_code(p_code)` so PostgreSQL no longer confuses it with the RPC output column named `code`.
- Added `SUPABASE_REWARD_CODES_HOTFIX_V8.4.8.1.sql` for existing V8.4.8 installations.
- The hotfix replaces only the RPC function. It does **not** drop tables or delete existing Reward Codes, usage counts, Owner settings, or redemption history.
- Added a clearer in-app diagnostic when a browser is connected to the old V8.4.8 RPC.
- Updated the app/PWA cache version to `8.4.8.1`.

### Existing V8.4.8 users

Run only:

`SUPABASE_REWARD_CODES_HOTFIX_V8.4.8.1.sql`

Your existing codes such as `MURATA` remain in `reward_codes` and can be used immediately after the RPC is replaced.

### Fresh setup

Use `SUPABASE_REWARD_CODES_SETUP_V8.4.8.1.sql`, set the Owner email in the bootstrap block, and run the full file once.

## V8.4.8 – Reward Codes + Developer Control Center

V8.4.8 adds Cloud-backed Reward Codes for signed-in users and a protected Owner workspace for managing codes and special rewards.

### Reward Codes

- Added a **Redeem Code** entry inside Reward Shop.
- Reward Code redemption requires a Supabase login so usage limits are tied to `auth.uid()`.
- If a guest starts the flow, the app opens Sign In and returns to Redeem Code after authentication.
- Codes can reward **Work Coins, Mascots, Accessories, Profile Frames, Themes, Effects, Daily / Weekly / Mystery Chests, or a bundle of multiple rewards**.
- Supports per-user limits, global max uses, active/inactive state, expiration time, and redemption history.
- Redemptions are recorded in Supabase first, then applied to the existing local Work Coin / Reward system with idempotent reward IDs.
- On another signed-in device, recorded redemptions can be re-applied safely without duplicating the same reward.

### Code Exclusive Collection

Five rewards are available only from Reward Codes or Owner tools:

- 🐥 Developer Chick
- 🛠️ Developer Crown
- 🔷 Founder Frame
- 🌠 Secret Galaxy
- 🪙 Coin Rain

These items cannot be purchased with Coins from the normal shop.

### Developer Control Center

The **Developer Tools** navigation item is shown only when the signed-in Supabase user is listed as an enabled Owner/Admin in `app_admins`. Backend RLS/RPC checks also enforce the Owner role, so hiding/showing the button is not the security boundary.

Owner tools include:

- Create and edit Reward Codes
- Enable / disable codes
- Configure Coins, bundle items, Chest rewards, expiry, per-user limit, and max uses
- View total codes, active codes, total redemptions, and recent users
- View recent redemption history
- Copy codes quickly
- Owner Economy Tools for the Owner's own account: grant Coins, Code Exclusive items, or Owner Chests

The Owner Economy Tools intentionally continue using the existing Work Coin ledger. V8.4.8 does not convert the app to a server-authoritative economy.

## Supabase setup required for V8.4.8

Run this file once in **Supabase → SQL Editor**:

`SUPABASE_REWARD_CODES_SETUP_V8.4.8.sql`

Before running it, edit the Owner bootstrap near the bottom:

```sql
owner_email text := 'your-owner-email@example.com';
```

Use the email of the Supabase account that should see **Developer Tools**. The account must already exist in **Authentication → Users**.

The SQL creates:

- `app_admins`
- `reward_codes`
- `reward_code_redemptions`
- `is_workday_owner()` RPC
- `redeem_reward_code(p_code)` RPC
- indexes, RLS policies, grants, and Owner bootstrap

Regular users cannot read the Reward Code table directly. A user submits a code through the redemption RPC, which checks login, active state, expiry, max uses, and per-user usage before returning the reward.

Do **not** put a Supabase `service_role` key in frontend files. Continue using the existing publishable/anon key.

**Confirm Email may remain disabled**, matching V8.4.7.7. No additional Auth setting is required for Reward Codes.

## V8.4.7.7 – Account & Authentication UX Refresh

- Separated **Sign in** and **Create account** into clear flows.
- Added password confirmation and show/hide password controls.
- Added centered success states after signup/sign-in and clearer inline errors.
- Optimized signup for this deployment with **Confirm Email disabled**.
- Added the `workday:v8-auth-complete` return-action hook used by the V8.4.8 Reward Code flow.

## Recent Version History

| Version | Highlight |
| --- | --- |
| V8.5.0 | 🧭 Navigation & App Shell Refresh |
| V8.4.8.1 | Reward Code Redemption Hotfix |
| V8.4.8 | 🎟 Reward Codes + Developer Control Center |
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
- Project Tracker and Project File Vault
- Calendar, leave, holidays, and compensatory workdays
- Reports & Analytics
- Journey Challenges and Feature Achievements
- Work Coins, Reward Shop, Daily/Weekly Deals, and Reward Codes
- Mascots, Accessories, Frames, Themes, Effects, Daily Missions, and Chests
- Work Bank with compound interest and Savings Streak
- Work Exchange simulated market and Trading Academy
- Local-first operation with optional Supabase Cloud Sync
- Owner-only Developer Control Center
- In-app What's New / Version History

## Updating from V8.4.8.1

1. Replace the changed frontend files from the V8.5.0 ZIP.
2. Redeploy the site.
3. No SQL migration is required for V8.5.0.
4. If an old cached shell appears, use **Clear App Cache / Reload Latest Version** once.

The Service Worker cache and asset query version are `8.5.0`.

## Existing Supabase features retained

- `workday_user_state` for Cloud Sync
- Supabase Auth for user accounts
- `project-files` private Storage bucket and `project_file_versions` table for Project File Vault

## Work Exchange timing

The simulated market continues to use deterministic hourly rounds from 07:00 through 16:00 based on the browser's local clock.

## Local-first behavior

The main application still works without signing in. Reward Code redemption is intentionally account-required because redemption limits and history are stored in Supabase.

## Version

`Workday Journey V8.5.0`

Release focus: **Grouped navigation / cleaner app shell / standardized page headers / mobile navigation**

Previous V8.4.8.1 focus: **Reward Code RPC ambiguity hotfix / data-safe Supabase patch**
