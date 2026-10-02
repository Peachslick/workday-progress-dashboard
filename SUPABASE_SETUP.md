# Workday Journey V8 - Supabase setup

Cloud Sync is optional. Without Supabase configuration, Workday Journey continues to work locally exactly as before.

## 1. Create a Supabase project

Create a project at Supabase and keep **Email authentication** enabled.

## 2. Create the sync table

Open **SQL Editor** in Supabase and run the entire `supabase-setup.sql` file from this project.

The table uses Row Level Security so an authenticated user can read and write only the row whose `user_id` matches their own account.

## 3. Configure the browser client

Open `supabase-config.js` and fill in:

```js
window.WORKDAY_SUPABASE_CONFIG = {
  url: "https://YOUR_PROJECT.supabase.co",
  publishableKey: "YOUR_PUBLISHABLE_OR_ANON_KEY"
};
```

Use the **Publishable key** (or legacy anon key if your project still shows that label). These browser keys are designed to be used client-side when RLS is configured correctly.

**Never use the `service_role` or any secret server key in this static website.**

## 4. Auth URL configuration

In Supabase **Authentication > URL Configuration**, add your Vercel production URL as the Site URL / allowed redirect URL if your project requires email confirmation links.

Example:

```text
https://your-workday-project.vercel.app
```

## 5. Deploy

Commit the updated files to GitHub. Vercel will deploy them as before.

Users can still use Local Mode without an account. Signing in enables cross-device Cloud Sync.

## Sync model

- Local browser data remains the offline working copy.
- Signed-in changes are automatically uploaded after local changes.
- On a new device, sign in and choose **Use Cloud Data**.
- If both the device and cloud already contain different data, V8 shows a conflict choice instead of silently overwriting either copy.
- Avatar images are part of the synced JSON state, so uploaded profile photos also follow the account.
