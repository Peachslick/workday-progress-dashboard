# Workday Journey V8.0.2

A bilingual, local-first work and internship journey app built with HTML, CSS and JavaScript. V8 adds optional Supabase accounts and Cloud Sync while preserving full Local Mode.

## V8 highlights

### Account & Cloud Sync
- Local Mode still works without an account.
- Optional Email + Password account through Supabase Auth.
- Syncs Workday Journey `wp-*` data across PC, iPad and mobile: profile, schedule, settings, avatar, calendar/leave, journals, projects, achievements, titles, drafts and preferences.
- Existing local data can be uploaded to Cloud after sign-in.
- On a new device, sign in and choose Cloud data.
- If Local and Cloud both contain different data, V8 shows a conflict choice instead of silently overwriting either copy.
- New local changes auto-upload while signed in and online.

Cloud Sync requires one deployment-owner setup. See **SUPABASE_SETUP.md** and `supabase-setup.sql`.

### Auto Save Draft
- Daily Journal text, mood and selected projects are saved as a draft automatically.
- New Project forms are also saved as a draft.
- Refreshing or accidentally closing the tab no longer loses unfinished form text.

### Notification Center
The top-bar bell can surface:
- Missing Daily Journals for completed workdays
- Backup reminders
- Upcoming 900 / 1,000-hour milestones
- Recently unlocked achievements
- Unsynced Cloud changes

### Schedule Templates
- Built-in Internship 07:00–16:10 template
- Office 08:00–17:00 template
- Office 09:00–18:00 template
- Save the current schedule as a custom template
- Import / Export schedule templates as JSON for sharing
- Built-in templates are also available during First-Time Setup

### Data Health & PWA Diagnostics
Settings now shows:
- Journal count
- Project count
- Achievement count
- Approximate localStorage size
- Last backup
- Last Cloud Sync
- App version
- Local JSON health

Diagnostics include Check for Update, Clear App Cache and Reload Latest Version.

### Public Journey Card
Reports & Analytics can create a privacy-safe share link / card containing only:
- Journey progress
- Total work hours
- Completed workdays
- Project count
- Achievement count

The public payload does **not** include Journal text, Leave details or Calendar entries.

### Mobile polish
V8 adds responsive layouts for Cloud account UI, Notification Center, Data Health, Templates and Public Journey cards.

## Supabase setup

1. Create a Supabase project.
2. Run `supabase-setup.sql` in Supabase SQL Editor.
3. Put the Project URL and browser-safe Publishable/Anon key in `supabase-config.js`.
4. If email confirmation is enabled, add the Vercel production URL in Supabase Auth URL settings.
5. Commit to GitHub and let Vercel redeploy.

**Never put a service_role/secret key in this static project.**

See `SUPABASE_SETUP.md` for details.

## Local Mode

If `supabase-config.js` remains empty, the app simply stays in Local Mode. All V7 features continue working normally.

## Deployment

Upload the contents of `workday_progress-dashboard/` to the existing GitHub repository. If Vercel is already connected, the commit deploys automatically.

The app uses hash routing (`#/dashboard`, `#/journal`, etc.), so no extra Vercel route configuration is required.


## V8.0.2 Clean Top Bar
- Top bar now focuses on current page, notifications, cloud status and profile.
- Language, theme, install, settings and account shortcuts live in the Profile menu.
- The original controls remain in the DOM for compatibility but are hidden from the header.
