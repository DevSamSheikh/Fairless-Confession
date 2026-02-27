# ConfessBox Backend Progress

**Last updated:** Feb 27, 2026  
**Reference:** `prd backend.txt`, `prd-step-by-step.md`

---

## Tech Stack (aligned with PRD)

| Component | Implementation |
|-----------|----------------|
| **Backend** | Supabase + Express (thin API layer using Supabase client) |
| **Auth** | Supabase Auth (signUp, signInWithPassword, resetPasswordForEmail) |
| **Database** | Supabase (PostgreSQL); schema in `supabase/migrations/` |
| **API** | Express server uses `@supabase/supabase-js` with service role for server-side ops |
| **RLS** | Row Level Security enabled on Supabase tables (see migration) |

---

## Phase 1: Database Schema & Core Infrastructure

| Task | Status | Notes |
|------|--------|--------|
| **1.1** Setup project & env | ✅ Done | Supabase client; `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`. See `.env.example`. |
| **1.2** Users profile table | ✅ Done | `public.users` (id = auth.users.id), identity_id, avatar_seed, user_id_custom (2004 prefix). Profile created on signup with auto-generation. |
| **1.3** `tracking_logs` table | ❌ Not done | Table not in schema. No IP/MAC/device/timestamp logging. |
| **1.4** Categories | ✅ Done | Categories as **enum** on `posts` (College, Work, Love, Drama, Dark, Funny, Secrets). |
| **1.5** Comment votes table | ✅ Done | `comment_votes` table for upvote/downvote functionality on comments. |

---

## Phase 2: Authentication & User Tracking

| Task | Status | Notes |
|------|--------|--------|
| **2.1** Registration flow | ✅ Done | `POST /api/auth/register` uses Supabase Auth `signUp`; profile row in `public.users` with anonymous identity. |
| **2.2** Login / Logout | ✅ Done | `POST /api/auth/login` uses `signInWithPassword`; returns Supabase access token. Logout is client-side (discard token). |
| **2.3** Password reset | ✅ Done | `POST /api/auth/forgot-password` uses `resetPasswordForEmail`. |
| **2.4** User profile | ✅ Done | `GET /api/me` returns current user profile with stats. |

---

## Phase 3: Content Management (Confessions)

| Task | Status | Notes |
|------|--------|--------|
| **3.1** `posts` table | ✅ Done | id, user_id, society_id, title, content, category, reactions_summary, comment_count, view_count, is_trending, visibility, created_at. |
| **3.2** Post CRUD | ✅ Done | **Create** ✅ `POST /api/post`. **Read** ✅ `GET /api/home`, `GET /api/home/trending`. **Edit** ✅ `PATCH /api/my-confession/edit/:id`. **Delete** ✅ `DELETE /api/my-confession/delete/:id`. |
| **3.3** Feeds | ✅ Done | **Home feed** ✅ `GET /api/home` (latest, with isOwner). **Trending** ✅ `GET /api/home/trending`. **My Confessions** ✅ `GET /api/my-confessions`. **My Reactions** ✅ `GET /api/my-reactions`. |
| **3.4** Search | ✅ Done | `GET /api/search?q=` for searching posts by content. |

---

## Phase 4: Society System

| Task | Status | Notes |
|------|--------|--------|
| **4.1** `societies` table | ✅ Done | In Supabase migration. |
| **4.2** `society_members` table | ✅ Done | In Supabase migration. |
| **4.3** Society logic | ✅ Done | **Join** ✅ `POST /api/societies/:id/join`. **Create** ✅ `POST /api/create-society`. **Leave** ✅ `POST /api/leave-society/:id`. **Discovery** ✅ `GET /api/societies`. **Saved societies** ✅ `GET /api/saved-societies`. |

---

## Phase 5: Interaction Features

| Task | Status | Notes |
|------|--------|--------|
| **5.1** Reactions | ✅ Done | `reactions` table + `POST /api/interactions/react`. Supports toggle (add/remove), switch reactions, and unique constraint (user_id, post_id). |
| **5.2** Comments | ✅ Done | `comments` table + `POST /api/interactions/comment`, `PATCH /api/interactions/comment/:id`, `DELETE /api/interactions/comment/:id`. |
| **5.3** Comment votes | ✅ Done | `POST /api/interactions/comment/:id/vote` for upvote/downvote with toggle support. |
| **5.4** Views & bookmarks | ⚠️ Partial | `view_count` on posts; not incremented on view. No `bookmarks` table. |

---

## Phase 6: Admin & Security

| Task | Status | Notes |
|------|--------|--------|
| **6.1** Content reporting | ✅ Done | `POST /api/report/:postid` for reporting posts. |
| **6.2** Admin roles & RLS | ⚠️ Partial | RLS basic policies in place; no admin-only access. |
| **6.3** Security hardening | ⚠️ Partial | Auth middleware validates JWT; no rate limiting yet. |

---

## Recent Fixes & Improvements (Feb 27, 2026)

### Fixed Issues
- ✅ Fixed `ensureUserProfileExists` to handle admin API failures gracefully
- ✅ Added `isOwner` field to home feed endpoints for proper ownership detection
- ✅ Fixed reactions unique constraint to prevent duplicate reactions
- ✅ Improved error handling in interactions route (500 errors)

### Known Issues
- ⚠️ Admin API may not be available in some Supabase configurations
- ⚠️ View count not auto-incremented on post view

---

## Summary

### Completed Features

- **Stack:** Supabase (Auth + Database) + Express (API server using Supabase client).
- **Schema:** Complete with users, societies, posts, comments, reactions, comment_votes, society_members; RLS enabled.
- **Auth:** Register, Login, Forgot password, User profile endpoint.
- **Posts:** Full CRUD (create, read, edit, delete), multiple feeds (home, trending, my confessions, my reactions), search.
- **Societies:** Full CRUD (create, join, leave, list, saved societies).
- **Interactions:** Reactions (toggle/switch), Comments (CRUD), Comment votes (upvote/downvote).
- **Reporting:** Post reporting system.

### Remaining Work

- **Tracking:** `tracking_logs` table and capture on register/login.
- **Admin:** Admin-only access controls and moderation tools.
- **Security:** Rate limiting, enhanced validation.
- **Views:** Auto-increment view count on post view.
- **Bookmarks:** Saved posts functionality.

---

## API Endpoints Summary

### Auth
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/forgot-password` - Request password reset
- `GET /api/me` - Get current user profile

### Posts
- `POST /api/post` - Create new post
- `GET /api/home` - Get latest posts (with isOwner)
- `GET /api/home/trending` - Get trending posts (with isOwner)
- `GET /api/my-confessions` - Get user's own posts
- `GET /api/my-reactions` - Get posts user has reacted to
- `PATCH /api/my-confession/edit/:id` - Edit own post
- `DELETE /api/my-confession/delete/:id` - Delete own post
- `GET /api/search?q=` - Search posts

### Societies
- `GET /api/societies` - List all societies
- `POST /api/create-society` - Create new society
- `POST /api/societies/:id/join` - Join society
- `POST /api/leave-society/:id` - Leave society
- `GET /api/saved-societies` - Get user's saved societies

### Interactions
- `POST /api/interactions/react` - Add/toggle/switch reaction
- `POST /api/interactions/comment` - Add comment
- `PATCH /api/interactions/comment/:id` - Edit comment
- `DELETE /api/interactions/comment/:id` - Delete comment
- `POST /api/interactions/comment/:id/vote` - Vote on comment
- `GET /api/interactions/post/:postId` - Get post with comments

### Reporting
- `POST /api/report/:postid` - Report a post
