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
- Fixed Header overlap by adjusting `paddingTop` in `home.tsx` and adding `SafeAreaView` context.
- Implemented Societies Explore page (`trending.tsx`) with a search bar and society cards.
- Created `SocietyDetailScreen.tsx` for viewing specific society feeds.
- Configured navigation for Societies to allow exploring and joining groups.
- Ensured all society names end with "Society" as per requirements.
- Followed Premium Dark theme design pattern for the new Societies page.
- Optimized header layout for better mobile status bar compatibility.
