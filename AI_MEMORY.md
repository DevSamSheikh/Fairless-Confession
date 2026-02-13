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
- Refactored UI elements into reusable components: `Button`, `Card`, `Header`, and `Tabs`.
- Optimized `HomeScreen` and `TrendingScreen` by utilizing the new atomic components.
- Improved code maintainability and reduced redundancy across the codebase.
- Updated active color to theme purple (#6B5CE7) for Like buttons and primary CTAs.
- Implemented `Modal` based reaction picker in `PostCard.tsx` that hides when clicking outside.
- Fixed sticky headers and tab bars in Societies page using atomic UI components.
