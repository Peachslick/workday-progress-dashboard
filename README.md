# Workday Journey V5.1

A bilingual **work / internship journey dashboard** built with plain HTML, CSS and JavaScript. It works without a backend or database and is designed for GitHub + Vercel deployment.

## What's new in V5

- First-time setup wizard for each visitor
- Personal profile / journey settings
- Custom start date, end date, workdays, work hours and up to 3 breaks
- Timezone and date/number locale settings
- Personal Mode / Public Demo Mode
- JSON Backup / Restore
- Start New Journey / Reset All Data
- Share Journey Summary + existing PNG Snapshot
- Privacy notice explaining that data stays in browser `localStorage`
- PWA update notice for new deployments
- Existing V4.1 attendance, leave, company holiday and compensatory workday logic remains available

## Privacy / multi-user behavior

There is no shared database. Every browser gets its own local data. If two people open the same Vercel URL, their journeys, calendar overrides, leave records, theme and achievements are separate because they are stored in that browser's `localStorage`.

Use **Settings → Data & Backup → Export Backup** before clearing browser data or moving to another device.

## Run locally

For the simplest mode, open `index.html` or run `start-dashboard.bat`.

For PWA testing, run `start-pwa-local.bat` (requires Node.js, but no npm install).

## Deploy to Vercel

If this folder is the Vercel Root Directory:

- Framework Preset: `Other`
- Build Command: leave empty
- Output Directory: leave empty
- Install Command: leave empty

Push changes to the connected GitHub repository and Vercel will deploy automatically.

## Update workflow

```bash
git add .
git commit -m "Update Workday Journey"
git push
```

When the PWA detects a newer deployed service worker, the dashboard shows an update banner with **Refresh Now**.

## Default journey

Recommended default values are still:

- 05 May 2026 → 30 October 2026
- Monday–Friday
- 07:00 → 16:10
- Breaks: 09:00–09:20, 11:00–11:40, 14:00–14:10
- Actual work: 8 hours/day
- Default timezone: Asia/Bangkok

New visitors can change all of these during first-time setup.

## Sarabun

The site can load Sarabun from Google Fonts when online. For local offline use, `setup-sarabun-font.bat` can fetch the font from the official Google Fonts repository into `assets/fonts/` on the user's machine.

---

**Version:** 5.0.0  
**Stack:** HTML / CSS / JavaScript / PWA  
**Storage:** Browser localStorage

V5.1 PROFILE / DATE UPDATE
- Start/End Date supports manual DD/MM/YYYY (or MM/DD/YYYY for en-US) input.
- Calendar buttons open the native browser date picker and sync back to the text field.
- Thai date format label is now ไทย · DD/MM/YYYY.
- This release performs a one-time reset of prior Workday Journey local data so every existing browser sees First-Time Setup again. Only keys belonging to this app (wp-*) are cleared.
- V5.1 adds cache-busting and a new Service Worker cache name to reduce stale Vercel/PWA files.


V5.1.1 LIGHT DEFAULT
- New users now start in Light theme.
- Browsers still using the previous System default are migrated once to Light.
- Explicit Light or Dark choices are preserved.
- Reset Settings now returns to Light theme.
