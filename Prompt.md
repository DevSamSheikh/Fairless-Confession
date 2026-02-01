# Fairless Confession App Prompt

## Project Overview

**App Name:** Fairless Confession
**Type:** Anonymous confession and drama feed app
**Platform:** React Native with Expo
**Goal:** Build a solo-founder-ready MVP that is addictive, emotionally engaging, and safe. Users post anonymous secrets, opinions, and confessions. App monetization via ads and sponsored content is planned, but users remain free.

---

## Master Prompt for AI-Assisted Development

### 1️⃣ Role Definition

> Act as a **senior React Native + Expo developer and software architect**. You will build a complete mobile app scaffold with **clean architecture**, modular code, and ready-to-launch MVP screens. Provide **comments in code** explaining each module for a solo founder.

### 2️⃣ App Concept

* Users post **anonymous confessions** (text-based).
* Categories: College, Work, Love, Drama, Dark, Funny.
* Users can **react** (❤️ 😮 😢 😡 😂) and **comment anonymously**.
* Feed ranked by trending, recency, and category.
* AI moderation prevents toxicity, harassment, and spam.
* Dark mode UX with soft neon accents.

### 3️⃣ Tech Stack

* React Native + Expo
* TypeScript
* React Navigation (Bottom Tabs)
* Zustand or React Context API for state management
* Firebase / Supabase for backend (DB + functions)
* OpenAI / Perspective API for moderation (placeholder)
* Vector DB optional for embeddings/clustering

### 4️⃣ Project Structure

```
/app
  /screens
      home.tsx
      trending.tsx
      post.tsx
      activity.tsx
      more.tsx
  /components
      PostCard.tsx
      ReactionBar.tsx
      CategoryChip.tsx
      AnonymousAvatar.tsx
  /services
      post.service.ts
      comment.service.ts
      moderation.service.ts
  /hooks
      useFeed.ts
      usePost.ts
      useModeration.ts
  /utils
      constants.ts
      logger.ts
      rateLimiter.ts
  /store
      feed.store.ts
      user.store.ts
  App.tsx
```

### 5️⃣ Features (MVP)

1. **Anonymous Posting**: Text input, category selection, one-tap submit.
2. **Feed**: Infinite scroll, post cards, reactions.
3. **Trending Feed**: Ranked by reactions and activity.
4. **Anonymous Comments**: Reply to posts safely.
5. **Moderation**: AI-powered text moderation.
6. **Reporting**: User report functionality.
7. **Dark Mode**: Default theme with soft neon highlights.

### 6️⃣ UI/UX Guidelines

* Dark theme (midnight blue / deep purple / black gradients)
* Rounded post cards with shadows and soft neon highlights
* One confession per card
* Smooth swipe-up for next post
* Bottom tab navigation (Home, Trending, Post, Activity, More)
* Minimalist icons
* Reactions easy to tap

### 7️⃣ Backend & Security

* Device-based anonymous ID
* Backend functions for moderation and API calls
* Rate limiting: max posts/comments per device
* Secure storage in DB, no sensitive info in client
* Moderation pipeline (OpenAI / Perspective API)

### 8️⃣ Deliverables

1. **Full Expo project scaffold**
2. **Sample screens**: Home feed, Trending, Post, Activity, More
3. **State management setup**
4. **Placeholder AI moderation service**
5. **Comments in code** explaining each module
6. Ready-to-run Expo project

### 9️⃣ Step 1: Initialize Project

> Generate code to **initialize the Expo project** with TypeScript, React Navigation, and folder structure. Include:

* `App.tsx` with Bottom Tabs placeholder
* Empty screen files (`home.tsx`, `trending.tsx`, etc.)
* `/components`, `/services`, `/hooks`, `/store`, `/utils` folders with placeholder files
* Basic dark mode theme applied
* Placeholder for Zustand store or Context API
* Instructions to run project in Expo

### 10️⃣ Next Steps After Step 1

1. Build **PostCard component** with reactions.
2. Implement **Home feed** with dummy posts.
3. Add **Post submission screen**.
4. Integrate **AI moderation placeholder**.
5. Implement **Trending feed logic**.
6. Add **Activity / notifications screen**.
7. Build **More / Settings screen**.

---

> Use this prompt to instruct AI coding assistants to scaffold the app step-by-step. Keep the project modular, secure, and scalable for a solo founder. Ensure all code includes **comments for clarity** and guidance.
