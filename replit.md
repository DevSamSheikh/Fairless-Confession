# ConfessBox Confession

## Overview
Anonymous confession app built with React Native (Expo) for web. Users can post anonymous confessions across categories like College, Work, Love, Drama, Dark, Funny, and Secrets. Features emoji reactions and comment counts.

## Tech Stack
- **Framework**: React Native with Expo (web target)
- **Language**: TypeScript
- **Navigation**: React Navigation (Bottom Tabs)
- **State Management**: Zustand
- **UI**: Custom dark theme with neon accents

## Project Structure
```
/app
  /screens       - Home, Trending, Post, Activity, More screens
  /components    - PostCard, ReactionBar, CategoryChip, AnonymousAvatar
  /store         - Zustand stores for feed and user state
  /utils         - Constants, colors, category definitions
```

## Development
Run the web app:
```bash
npm run web
```
The app runs on port 5000.

## Features (MVP)
- Home feed with latest confessions
- Trending feed (sorted by reactions)
- Post submission with category selection
- Anonymous avatars and identities
- Emoji reactions (heart, surprised, sad, angry, laugh)
- Activity/notifications screen
- Settings/More screen

## Recent Changes
- Initial project setup with Expo + TypeScript
- Implemented bottom tab navigation
- Created PostCard, ReactionBar, CategoryChip, AnonymousAvatar components
- Set up Zustand stores for state management
- Added dummy data for demonstration
- Configured for Replit (port 5000)
