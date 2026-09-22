# Workday Journey V7.5

A bilingual, private-by-default work and internship journey tracker built with HTML, CSS and JavaScript.

## V7 — App Layout Redesign

V7 reorganizes the feature-rich V6 dashboard into a clearer app-style layout with seven dedicated areas:

- Dashboard — today's progress, live countdown, timeline, internship overview and quick actions
- Daily Journal — full daily journal editor and journal history
- Projects — project tracker with status, progress and journal links
- Achievements — achievement center, milestones, journey timeline and story
- Reports & Analytics — attendance, monthly breakdown, heatmap, milestone predictor and final report
- Calendar & Attendance — leave, company holidays, compensatory workdays and calendar presets
- Settings — profile, appearance, timezone/date format, backup and dashboard tools

The app uses hash routing (`#/dashboard`, `#/journal`, etc.), so it works on Vercel without server-side routing configuration.

## Data & privacy

Journey data is stored in the user's browser with `localStorage`. Users opening the same Vercel URL do not share each other's local data. Existing V5/V6 local data remains compatible with V7.

## Run locally

Open `index.html` directly, use `start-dashboard.bat`, or use `start-pwa-local.bat` to test PWA features on localhost.

## Deploy

Upload the contents of `workday_progress-dashboard/` to the existing GitHub repository. If Vercel is connected to the repository, the new commit deploys automatically.


## V7.2 updates
- Desktop sidebar can be collapsed and reopened from the top bar.
- Font size now scales rem-based typography across the whole app with clearly different Small / Medium / Large levels.
- Thai mode now fully translates the V7 Settings page and sidebar labels.


## V7.3 updates
- Project Tracker editor now uses the full content width.
- Project cards are displayed below the editor in a responsive grid.
- Top application header now has a distinct background, border and shadow for clearer hierarchy.


## V7.4 updates
- 30 achievement challenges across time, journey, projects, journals, attendance, and exploration.
- Common / Rare / Epic / Legendary tiers with progress bars.
- Unlockable profile titles linked to harder achievements.
- Select an unlocked title from Settings; it appears on the sidebar and top profile.
- Existing users are migrated without achievement-popup spam.

## V7.5 additions
- Daily Journal project selector now stays compact with a scrollable project grid and smaller action buttons.
- Challenge Center adds Tier Mastery rewards for completing every Common, Rare, Epic, or Legendary challenge.
- Tier Mastery rewards unlock exclusive titles and profile aura effects.
- Added title rewards for 500 Hours, 75% Complete, 90% Complete, and Chronicle Master.
