# ConfessBox Project Progress

## Overview
Anonymous confession app built with React Native (Expo).

## Tech Stack
- **Frontend**: React Native (Expo Web), TypeScript, Zustand (State Management), React Navigation.
- **Backend**: Currently using dummy data with Zustand stores for persistent-like local state. Ready for integration with Replit PostgreSQL/API.

## Frontend Details
- **Navigation**: Bottom Tab Navigator (Home, Societies, Confess, Interactions, Profile) + Stack Navigator (Auth, Detail Screens).
- **Screens**: 
  - Home: Feed with Latest/Trending tabs and expanding search.
  - Societies: Restoration of "Old Style" with Discovery tabs (Confessions, Discover, Your Societies) and integrated header icons (Add, Search, Bookmark).
  - Create Society: Form with validation (Name max 25, Subtitle max 30, Intro 100-200).
  - Society Detail: Enhanced header with Back and Bookmark icons. Locked/Unlocked state, Guidelines, Feed, and Society Posting.
  - Interactions: Activity log with status badges and modern UI.
  - Profile: User stats and organized menu system.
- **UI Components**: PostCard, ReactionBar, CategoryChip, AnonymousAvatar (Logo based with cover resize mode), UI Primitives (Button, Card, Header, Tabs).
- **Styling**: Modern Dark Theme with Neon Accents (COLORS.accent: #6C5CE7).

## Recent Changes (2026-02-07)
- Restored "Old Style" Societies page with integrated header and multi-tab system.
- Standardized user avatars to use the app logo with `cover` resize mode.
- Added bookmark functionality in the header for Society Details.
- Enhanced Interactions and Profile UI for a more premium feel.
- Ensured tab logic consistency across the app.
