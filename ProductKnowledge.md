# Fairless Confession - Product Knowledge

## Overview

**App Name:** Fairless Confession
**Type:** Anonymous Confession App
**Platform:** React Native (Expo)
**Goal:** Build a scalable, addictive, emotionally-driven anonymous confession app that requires authentication but keeps users anonymous to each other.
**Backend:** FastAPI + MongoDB
**Authentication:** Google OAuth 2.0 (primary), Firebase Phone Auth (secondary)

---

## Target Audience

* Primarily college students and young professionals.
* Users who want to share secrets, opinions, and confessions without revealing identity.
* Users who enjoy emotionally engaging, dopamine-triggering feeds.

---

## App Concept

* Users can post **confessions** in multiple categories.
* Every post is anonymous to other users but **trackable** by the system using email, device ID, IP, or phone number.
* Categories include: College, Work, Love, Drama, Dark, Funny, Secrets.
* Users can **react** and **comment anonymously**.
* Infinite scrolling feed.
* Trending posts highlighted based on reactions and activity.
* AI moderation replaced with **basic keyword-based filtering** for MVP.

---

## Features

### 1. Authentication

* **Google OAuth 2.0** (primary) - Free, unlimited.
* **Firebase Phone Auth** (secondary) - Free 10,000/month.
* Account creation is required to post confessions.
* Users appear anonymous in feed but system tracks them for abuse prevention.

### 2. Posting Confessions

* Text input for confessions.
* Category selection from predefined list.
* Post submission rate-limited (5–10 posts/day).
* Anonymous display.
* Keywords filtered for moderation.

### 3. Reactions & Comments

* Users can react: ❤️ 😮 😢 😡 😂
* Unlimited reactions.
* Comments allowed: 50/hour per user.
* Comments are anonymous to other users.

### 4. Feed & Navigation

* **Home Feed:** Latest posts.
* **Trending Feed:** Posts ranked by reactions and engagement.
* Infinite scroll.
* **Bottom Tab Navigation:** Home, Trending, Post, Activity, More/Settings.

### 5. Categories

* College
* Work
* Love
* Drama
* Dark
* Funny
* Secrets

### 6. Moderation

* Basic **keyword-based filtering** for profanity, harassment, and abuse.
* Posts flagged are blocked automatically.
* No AI moderation in MVP.

### 7. User Tracking & Safety

* Anonymous to other users.
* System tracks via: email, phone, IP, device ID, location.
* Rate limiting implemented.
* Abuse and spam prevention.

### 8. UI/UX Guidelines

* **Theme:** Dark mode default.
* **Colors:** Midnight blue, deep purple, soft neon highlights (violet/pink).
* **Typography:** Modern, readable, large enough for mobile.
* **Post Cards:** Rounded corners, shadows, subtle glow.
* **Navigation:** Bottom tab bar with smooth transitions.
* **Reactions:** Easy tap, animated feedback.
* **Animations:** Smooth feed scroll, swipe gestures for post browsing.
* **Design Philosophy:** Minimalist, emotionally engaging, addictive, Gen-Z friendly.

### 9. Tech Stack

* React Native + Expo
* TypeScript
* React Navigation
* Zustand / React Context API for state management
* FastAPI + MongoDB backend
* Google OAuth / Firebase Phone Auth for authentication
* Keyword-based moderation
* Optional vector embedding for future feed clustering

### 10. Rate Limits

* **Posts:** 5–10 per day per user.
* **Comments:** 50/hour per user.
* **Reactions:** Unlimited.

### 11. Future Considerations

* AI-powered moderation integration (OpenAI / Perspective API) can be added later.
* Analytics dashboard for engagement.
* Sponsored polls or ads.
* Feed personalization using embeddings and clustering.

---

## MVP Screens & Components

### Screens

1. Home Feed
2. Trending Feed
3. Post Submission
4. Activity / Notifications
5. More / Settings

### Components

* PostCard.tsx
* ReactionBar.tsx
* CategoryChip.tsx
* AnonymousAvatar.tsx
* RateLimiter.tsx
* KeywordModeration.ts

### Hooks

* useFeed.ts
* usePost.ts
* useModeration.ts
* useAuth.ts

### Services

* post.service.ts
* comment.service.ts
* moderation.service.ts

### Store

* feed.store.ts
* user.store.ts

### Utilities

* constants.ts
* logger.ts
* rateLimiter.ts
* profanity.ts

---

## Key Principles

1. **Modular Architecture:** Separation of UI, business logic, and backend API calls.
2. **Scalability:** Backend handles logic; front-end is lightweight.
3. **Security:** Client never calls moderation API directly. Sensitive logic in backend.
4. **User Safety:** Anonymous display but full backend tracking for abuse prevention.
5. **Addictive UX:** Emotional content, dopamine-triggering reactions, smooth infinite scroll.
6. **Solo Founder Ready:** Minimal dependencies, clean folder structure, ready for Replit + Expo.

---

This **Product Knowledge Document** will serve as the reference for **design, development, UI/UX, backend, and feature implementation** of **Fairless Confession**.
