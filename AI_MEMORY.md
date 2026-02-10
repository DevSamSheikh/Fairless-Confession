# AI Memory

## Project Strategy
- User prefers Fast Mode for all tasks.
- Framework: Expo SDK 54 (React Native 0.81).
- Theme: Premium Dark (`#0F1115` background, `#1E222B` cards).
- Typography: Poppins (SemiBold/Regular).
- Backend: Node.js (TypeScript) with Express, Drizzle ORM, and PostgreSQL.

## Key Implementation Details
- **Navigation:** Using `native-stack` for high-performance transitions.
- **Header:** Sticky header logic in `home.tsx` using `Animated.FlatList` and `headerAnim`.
- **Interactions:** PostCard uses custom reaction picker triggered by `onLongPress`.
- **Assets:** Logo located at `assets/images/logo.png`.
- **Identity:** Anonymous handles (#Confess_1234) generated via IdentityService.
- **Database:** PostgreSQL schema defined with Users, Societies, Posts, Comments, and Reactions.

## Recent Changes (2026-02-10)
- Initialized backend in `server/` directory.
- Set up PostgreSQL database and Drizzle ORM schema.
- Implemented `IdentityService` for anonymous session management.
- Created `authMiddleware` for securing API endpoints.
- Updated project structure with `Backend` branch logic.
