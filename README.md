# Workday Journey

**Current version: V8.4.7.3 – Extended Version History**

Workday Journey is a personal internship/workday progress dashboard with Daily Journal, Project Tracker, Calendar & Attendance, Reports, Achievements, Daily Missions, Reward Shop, Work Bank, Work Exchange, Project File Vault, and optional Supabase Cloud Sync.

## V8.4.7.3 – Extended Version History

This patch expands the in-app update history so users can follow the Workday Journey timeline back through V8.0, V7, and V6 without reading developer documentation.

### What changed

- Added a small **📰 What’s New** button beside the app version in the Sidebar.
- Added **What’s New** to the Profile menu for mobile/collapsed Sidebar access.
- The current version shows a **NEW** badge until the user opens the update history once.
- Expanded Version History to cover the main **V6 → V8.4.7.3** milestones.
- Added concise V8.0, V7, and V6 summaries so older foundations of the app are easier to understand.
- Each version is intentionally limited to a few short highlights so the history stays easy to scan.
- The read state is **device-local** and is excluded from Cloud conflict detection.
- Clicking the version number in the footer also opens the Version History.
- Supports Thai/English, Light/Dark themes, responsive layouts, and the existing font-size setting.

## Recent Version History

| Version | Highlight |
| --- | --- |
| V8.4.7.3 | 🕘 Extended Version History |
| V8.4.7.2 | 📰 What’s New & Version History |
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
- In-app What’s New / Version History

## Updating from V8.4.7.2

Replace the changed files from this release in your existing project, then redeploy the site.

The Service Worker cache name and asset query version were updated to `8.4.7.3`. If a browser still shows an older version, use the app’s **Clear App Cache / Reload Latest Version** option.

## Supabase

V8.4.7.3 does **not** require a new table, SQL migration, Storage bucket, or RLS policy.

Continue using the same Supabase setup from the previous versions:

- `workday_user_state` for Cloud Sync
- Supabase Auth for user accounts
- `project-files` private Storage bucket and `project_file_versions` table for Project File Vault (V8.4.5 setup)

Do not place a Supabase `service_role` key in frontend code. The browser should use the existing publishable/anon key configuration.

## Local-first behavior

The application still works without signing in. Local data remains stored in the browser. Cloud Sync is optional and becomes active after a user signs in.

The key `wp-v8472-last-seen-version` is intentionally device-local. Reading What’s New on one device does not create a Cloud conflict or force another device to mark the update as read.

## Version

`Workday Journey V8.4.7.3`

Patch focus: **Extended Version History / V6–V8 timeline / lightweight release communication**
