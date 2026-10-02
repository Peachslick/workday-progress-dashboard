WORKDAY JOURNEY V8.0.2
======================

V8 adds optional Supabase Account + Cloud Sync while keeping Local Mode available.

NEW IN V8
- Optional Email/Password account
- Cross-device Cloud Sync for wp-* Workday Journey data
- Existing local-data migration and conflict choice
- Auto Save Draft for Journal and new Project forms
- Notification Center
- Schedule Templates + Import/Export JSON
- Data Health / Storage Status
- PWA diagnostics (Check Update / Clear Cache / Reload Latest)
- Privacy-safe Public Journey Card / share link
- Mobile UI polish

SUPABASE SETUP
1. Create a Supabase project.
2. Run supabase-setup.sql in Supabase SQL Editor.
3. Edit supabase-config.js with Project URL and Publishable/Anon key.
4. Do NOT use a service_role/secret key in browser code.
5. See SUPABASE_SETUP.md for full instructions.

Without Supabase configuration, the app continues to work locally exactly as before.

DEPLOY
Replace the existing workday_progress-dashboard files in GitHub and commit. Vercel will deploy automatically if the repository is connected.
