# ConfessBox Backend Implementation: Step-by-Step Breakdown

This document breaks down the Backend Development PRD into small, actionable tasks for implementation using Supabase.

## Phase 1: Database Schema & Core Infrastructure
- [ ] **1.1 Setup Supabase Project**
  - Initialize Supabase project.
  - Configure environment variables (`SUPABASE_URL`, `SUPABASE_ANON_KEY`).
- [ ] **1.2 Create `users` Profile Table**
  - Fields: `id` (UUID, primary key), `full_name`, `email`, `user_id_custom` (2004 prefix pattern), `avatar_url`, `created_at`.
  - Set up Row Level Security (RLS) so users can only read/write their own profile.
- [ ] **1.3 Create `tracking_logs` Table**
  - Fields: `id`, `user_id`, `ip_address`, `mac_address`, `device_info`, `timestamp`.
  - Note: MAC address capture is limited in web environments; will use best-effort fingerprinting.
- [ ] **1.4 Create `categories` Table**
  - Seed with initial categories (e.g., College Life, Broken Hearts, Secrets).

## Phase 2: Authentication & User Tracking
- [ ] **2.1 Implement Registration Flow**
  - Integrate Supabase Auth `signUp`.
  - Capture tracking metadata during registration.
  - Implement 4-8 character password enforcement.
- [ ] **2.2 Implement Login/Logout**
  - Integrate Supabase Auth `signInWithPassword`.
  - Update `tracking_logs` on every login.
- [ ] **2.3 Password Reset**
  - Implement `resetPasswordForEmail` flow.

## Phase 3: Content Management (Confessions)
- [ ] **3.1 Create `posts` Table**
  - Fields: `id`, `user_id`, `title`, `content` (Rich Text), `category_id`, `society_id` (nullable), `visibility` (public/society), `is_edited`, `created_at`.
- [ ] **3.2 Implement Post CRUD**
  - Create Post (Public vs Society).
  - Edit Post (track edit history).
  - Delete Post (with confirmation).
- [ ] **3.3 Implement Feeds**
  - Home Feed (Public, Infinite Scroll).
  - Trending Algorithm (based on likes/comments/time).
  - My Confessions list.

## Phase 4: Society System
- [ ] **4.1 Create `societies` Table**
  - Fields: `id`, `name`, `description`, `creator_id`, `is_private`, `category_id`, `created_at`.
- [ ] **4.2 Create `society_members` Table**
  - Fields: `society_id`, `user_id`, `joined_at`.
- [ ] **4.3 Implement Society Logic**
  - Create Society.
  - Join/Leave Society.
  - Society Discovery (Search & Categories).
  - Society-specific feeds (Member-only visibility).

## Phase 5: Interaction Features
- [ ] **5.1 Implement Likes**
  - Create `likes` table.
  - Toggle functionality.
- [ ] **5.2 Implement Comments**
  - Create `comments` table.
  - Nested or flat structure? (Default: Flat with parent_id for simple replies).
- [ ] **5.3 Implement Views & Bookmarks**
  - `post_views` table for tracking.
  - `bookmarks` table for saved posts/societies.

## Phase 6: Admin & Security
- [ ] **6.1 Content Reporting**
  - Create `reports` table.
  - Link to posts/comments.
- [ ] **6.2 Admin Roles & RLS Fine-tuning**
  - Define admin user role.
  - Implement RLS policies for admin-only tracking access.
- [ ] **6.3 Security Hardening**
  - Email validation check.
  - Rate limiting (via Edge Functions if necessary).
