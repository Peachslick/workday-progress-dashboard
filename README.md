# Workday Journey

**Current version: V8.4.7.1 – Smart Cloud Sync**

Workday Journey is a personal internship/workday progress dashboard with Daily Journal, Project Tracker, Calendar & Attendance, Reports, Achievements, Daily Missions, Reward Shop, Work Bank, Work Exchange, Project File Vault, and optional Supabase Cloud Sync.

## V8.4.7.1 – Smart Cloud Sync

This hotfix focuses on reducing unnecessary Cloud conflict prompts while keeping Local-first behavior.

### What changed

- Added **Smart Cloud Sync** reconciliation.
- UI-only state no longer causes a Cloud conflict, including:
  - Sidebar collapsed state
  - Journal/Project view filters
  - Reward Shop selected tab
  - Work Exchange selected stock and chart range
  - Achievement filters/views
  - Temporary notification/open-page state
- Local and Cloud changes on **different data keys** are merged automatically.
- The conflict dialog is shown only when the **same important data** was changed on both sides from the same sync baseline.
- Soft preferences such as theme, font, language, dashboard layout, equipped cosmetics, and watchlist are resolved automatically instead of creating a blocking conflict.
- Added a per-key Cloud baseline so later syncs can identify which side actually changed.
- Added stable hashing for JSON values to avoid false conflicts caused only by JSON property order.
- Existing V8.4.7 Cloud metadata is migrated automatically where possible.
- Time-based Economy processing waits for the first Cloud reconciliation when a signed-in session is being restored, reducing false conflicts from Daily/Bank/Reward state being generated too early.
- Manual controls remain available:
  - **Sync Now**
  - **Use this device data**
  - **Use Cloud data**

### Expected sync behavior

| Situation | V8.4.7.1 behavior |
| --- | --- |
| Local and Cloud are the same | Sync silently |
| Only Local changed | Upload automatically |
| Only Cloud changed | Download automatically |
| Different data changed on each device | Merge automatically |
| Only UI/preferences differ | Resolve automatically |
| Same important data changed on both devices | Ask the user which copy to keep |

> A genuinely new device that already contains meaningful Local data may still ask once which copy should become the initial source of truth. After that, Smart Cloud Sync stores a common baseline for future reconciliation.

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

## Updating from V8.4.7

Replace the changed files from this release in your existing project, then redeploy the site.

Because the Service Worker cache name and asset query version were updated to `8.4.7.1`, users should receive the new files after the updated Service Worker activates. If a browser still shows an older version, use the app's **Clear App Cache / Reload Latest Version** option.

## Supabase

V8.4.7.1 does **not** require a new table, SQL migration, Storage bucket, or RLS policy.

Continue using the same Supabase setup from the previous versions:

- `workday_user_state` for Cloud Sync
- Supabase Auth for user accounts
- `project-files` private Storage bucket and `project_file_versions` table for Project File Vault (V8.4.5 setup)

Do not place a Supabase `service_role` key in frontend code. The browser should use the existing publishable/anon key configuration.

## Local-first behavior

The application still works without signing in. Local data remains stored in the browser. Cloud Sync is optional and becomes active after a user signs in.

Device-specific UI state is intentionally kept local in V8.4.7.1 so opening a different tab, collapsing the Sidebar, changing a temporary filter, or selecting another stock does not create a Cloud conflict.

## Version

`Workday Journey V8.4.7.1`

Hotfix focus: **Smart Cloud Sync / conflict reduction / cloud-first reconciliation**
