# ConfessBox Backend Progress

## Architecture
- **Backend**: Node.js with Express and TypeScript.
- **Database**: PostgreSQL (Neon-backed) using Drizzle ORM for type-safe database access.
- **Hosting**: Replit VM/Autoscale with a shared PostgreSQL instance.
- **Authentication**: JWT-based session management for anonymous identities.

## Data Flow
1. **Frontend**: React Native (Expo Web) communicates with the Express backend on port 3000.
2. **Backend**: Express handles routing, JWT validation, and database interactions.
3. **Identity**: Users are assigned persistent anonymous IDs (`identityId`) generated server-side.
4. **Database**: PostgreSQL stores users, confessions, reactions, and society data.

## Recent Changes
- Initial backend structure created with Express and TypeScript.
- PostgreSQL schema finalized for users, posts, comments, reactions, and societies.
- Database connection configured and synchronized using Drizzle ORM.
- **Full Auth Flow**: Implemented registration, login, and logout logic on the frontend (connected to mock backend for now, with full schema support).
- Enabled CORS on the backend to allow frontend communication.
- Configured Replit workflows for both Backend and Web App.

## Hosting Strategy
- **Backend**: Hosted on Replit as a background process (`Backend Server`).
- **Frontend**: Hosted via Expo's web target on port 5000.
- **Database**: Replit's native PostgreSQL integration.

## Testing Status
- ✅ Backend Server: Running on port 3000.
- ✅ Web App: Bundled and running on port 5000.
- ✅ Database: Schema pushed and connection active.
- ✅ Auth Flow: Login and Register screens functional with validation and toast feedback.
