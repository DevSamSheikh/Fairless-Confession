# AI Memory

## Project Strategy
- User prefers Fast Mode for all tasks.
- Framework: Expo SDK 54 (React Native 0.81).
- Theme: Premium Dark (`#0F1115` background, `#1E222B` cards).
- Typography: Poppins (SemiBold/Regular).

## Key Implementation Details
- **Navigation:** Using `native-stack` for high-performance transitions.
- **Header:** Sticky header logic in `home.tsx` using `Animated.FlatList` and `headerAnim`.
- **Interactions:** PostCard uses custom reaction picker triggered by `onLongPress`.
- **Assets:** Logo located at `assets/images/logo.png`.

## Recent Changes (2026-02-03)
- Fixed Expo Go compatibility by syncing `@expo/metro-runtime` and `@expo/vector-icons` versions.
- Cleaned up duplicate imports in `App.tsx` and resolved LSP diagnostics.
- Upgraded project to Expo SDK 54.
- Implemented active like button color (#E0245E) and logic in PostCard.
- Created Auth Screens: Welcome, Login, Register, and Forget Password.
- Implemented Onboarding slider with animations and navigation flow.
- Configured full navigation stack (Auth + Main Tabs).
- Finalized migration to Expo SDK 54 with latest dependencies.
