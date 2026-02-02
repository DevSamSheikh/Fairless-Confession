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

## Recent Changes (2026-02-02)
- Fixed eye button (show/hide password) in Login and Register screens.
- Enhanced Splash Screen with polished layout and typography.
- Optimized navigation with native-stack for smoother transitions.
- Implemented reaction picker with custom emojis: 👍, 👌, 🥂, 🤯, 🤔, 😡.
- Added real-time reaction and comment counts to PostCard.
- Fixed header overlap with mobile top bar and added slide animations.
