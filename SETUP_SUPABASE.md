# Supabase setup & seed

## 1. Keep secrets safe

- `.env` is in `.gitignore` — **do not commit it.**
- Your **service role key** is in `.env`; rotate it in [Supabase Dashboard → Settings → API](https://supabase.com/dashboard/project/_/settings/api) if it was ever shared or committed.

## 2. Create tables (one-time)

1. Open [Supabase Dashboard](https://supabase.com/dashboard) → your project **bdbjjaekgqrehynygaik**.
2. Go to **SQL Editor**.
3. Open the file `supabase/RUN_MIGRATIONS_IN_DASHBOARD.sql` in this repo, copy its **entire** contents, paste into the SQL Editor, and click **Run**.
4. Confirm there are no errors (you may see “already exists” for policies — that’s fine).

## 3. Seed dummy data

From the project root:

```bash
npm run seed
```

This will:

- Create a seed user (if not exists): **seed@confessbox.demo** / **SeedPass123!**
- Ensure a profile in `public.users` with a **2004-*** style id.
- Insert **societies** (Midnight Society, College Life Society, etc.) from the app mock.
- Insert **posts** (confessions) from the app mock and a few **comments**.

## 4. Check data

- In Supabase: **Table Editor** → open `users`, `societies`, `posts`, `comments`.
- Backend: start with `npm run server` and call `GET http://localhost:5000/api/home` to see the feed.

## 5. Frontend env (optional)

For the Expo app to talk to Supabase directly, add to `.env` (or your app config):

- `EXPO_PUBLIC_SUPABASE_URL=https://bdbjjaekgqrehynygaik.supabase.co`
- `EXPO_PUBLIC_SUPABASE_KEY=<your anon/publishable key>`

Use the **anon/public** key in the frontend, not the service role key.
