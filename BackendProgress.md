# ConfessBox Backend Progress

## Architecture
- **Backend**: Node.js with Express and TypeScript.
- **Database**: PostgreSQL (Neon-backed) using Drizzle ORM for type-safe database access.
- **Hosting**: Designed for Replit's Autoscale or VM deployments.
- **Authentication**: JWT-based session management for anonymous identities.

## Data Flow
1. **Frontend**: React Native (Expo Web) sends requests to the backend API.
2. **Backend**: Express handles routing and validation.
3. **Identity**: Users are assigned persistent anonymous IDs linked to their local device/account.
4. **Database**: PostgreSQL stores confessions, reactions, and society data.

## Recent Changes
- Initial backend structure created.
- PostgreSQL schema defined for users, posts, comments, reactions, and societies.
- Database connection configured with Drizzle ORM.
- Placeholder authentication logic refined for smooth UI transitions.
- Connected frontend to mock backend endpoints for testing authentication flow.

## Next Steps
- Implement JWT generation and validation middleware.
- Connect frontend `userStore` to real backend endpoints.
- Deploy database migrations.
