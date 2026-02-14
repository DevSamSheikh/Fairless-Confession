# Backend Development Guide: ConfessBox

This document outlines the backend for ConfessBox using **Supabase** (Auth, Database, optional Realtime/Edge Functions) with a thin **Express + TypeScript** API server where needed.

---

## Tech Stack

- **Supabase**: Auth, Database (PostgreSQL), Storage, Realtime
- **Express + TypeScript**: Optional API server using `@supabase/supabase-js` (service role) for server-side logic
- **Environment**: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` (see `.env.example`)

---

## Phase 1: Environment Setup

1. **Supabase project**
   - Create a project at [supabase.com](https://supabase.com).
   - In Settings → API: copy **Project URL** and **service_role** key (keep secret).

2. **Environment variables**
   - Copy `.env.example` to `.env`.
   - Set `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`.

3. **Database schema**
   - Run the SQL in `supabase/migrations/00001_initial_schema.sql` in the Supabase SQL Editor (or use Supabase CLI: `supabase db push`).
   - This creates enums, `public.users`, `societies`, `posts`, `comments`, `reactions`, `society_members`, and RLS policies.

4. **Run the API server** (optional; for custom endpoints)
   - `npm run server` (runs `tsx server/src/index.ts`).

---

## Phase 2: Core Infrastructure

1. **Identity**
   - Anonymous identity (`identity_id`, `avatar_seed`, `user_id_custom` with 2004 prefix) is stored in `public.users` and created on signup (server or DB trigger).

2. **Auth**
   - **Middleware**: Validates Supabase JWT via `supabase.auth.getUser(token)`.
   - **Endpoints**: Register and login use Supabase Auth; server creates/reads profile from `public.users`.

3. **Rate limiting**
   - To be added (e.g. Express middleware or Supabase Edge Function).

---

## Phase 3: API Implementation

- **Auth**: `POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/forgot-password`
- **Posts**: `GET /api/posts`, `POST /api/posts`, `GET /api/posts/:id`
- **Societies**: `GET /api/societies`, `POST /api/societies/join/:id`
- **Interactions**: `POST /api/interactions/react`, `POST /api/interactions/comment`

The app can also call Supabase directly from the client (with anon key) where RLS allows.

---

## Phase 4: Real-time & Optimization

- **Supabase Realtime**: Subscribe to table changes (e.g. new comments, reactions) from the client.
- **Edge Functions**: Use for tracking, heavy logic, or rate limiting if needed.

---

## Phase 5: Deployment & Hardening

- Never expose `SUPABASE_SERVICE_ROLE_KEY` to the client; use it only on the server.
- RLS policies restrict what the anon key can do; service role bypasses RLS (use only in trusted server code).
- Deploy the Express server to your chosen host (e.g. Railway, Render, Fly.io).

---

## Why Supabase

- Single platform for Auth, Database, Storage, and Realtime.
- PostgreSQL with RLS for secure, fine-grained access.
- No direct PostgreSQL connection or ORM to maintain; use Supabase client and SQL migrations.
