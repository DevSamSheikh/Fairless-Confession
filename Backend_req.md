# Backend Requirements: ConfessBox

## 1. Overview
ConfessBox is an anonymous confession app requiring a robust, scalable backend to handle anonymous postings, reactions, and real-time interactions while ensuring user privacy.

## 2. Database Schema (PostgreSQL)

### Users Table
- `id`: UUID (Primary Key)
- `identity_id`: String (e.g., #Confess_4920)
- `avatar_seed`: String (for consistent anonymous avatars)
- `created_at`: Timestamp
- `posts_count`: Integer
- `reactions_count`: Integer

### Societies Table
- `id`: UUID (Primary Key)
- `name`: String (Unique)
- `description`: Text
- `icon_name`: String
- `member_count`: Integer
- `is_private`: Boolean
- `created_at`: Timestamp

### Posts Table
- `id`: UUID (Primary Key)
- `user_id`: UUID (Foreign Key)
- `society_id`: UUID (Foreign Key, Optional)
- `title`: String
- `content`: Text
- `category`: Enum (College, Work, Love, Drama, Dark, Funny, Secrets)
- `reactions_summary`: JSONB (count of each emoji type)
- `comment_count`: Integer
- `created_at`: Timestamp
- `is_trending`: Boolean

### Comments Table
- `id`: UUID (Primary Key)
- `post_id`: UUID (Foreign Key)
- `user_id`: UUID (Foreign Key)
- `content`: Text
- `created_at`: Timestamp

### Reactions Table
- `id`: UUID (Primary Key)
- `post_id`: UUID (Foreign Key)
- `user_id`: UUID (Foreign Key)
- `reaction_type`: Enum (Like, Funny, Supportive, Unbelievable, Thought, Anger)
- `created_at`: Timestamp

### SocietyMembers Table
- `user_id`: UUID (Foreign Key)
- `society_id`: UUID (Foreign Key)
- `role`: Enum (Member, Moderator, Admin)
- `joined_at`: Timestamp

## 3. API Endpoints

### Auth
- `POST /auth/anonymous-login`: Creates or retrieves an anonymous session.

### Posts
- `GET /posts`: Fetch latest confessions (paginated).
- `GET /posts/trending`: Fetch confessions sorted by reaction velocity.
- `POST /posts`: Create a new confession.
- `GET /posts/:id`: Get detailed view with comments.
- `DELETE /posts/:id`: Delete own post.

### Societies
- `GET /societies`: List all societies.
- `GET /societies/:id`: Get society details and its posts.
- `POST /societies/join/:id`: Join a society.
- `POST /societies/leave/:id`: Leave a society.

### Interactions
- `POST /reactions`: Add/toggle a reaction on a post.
- `POST /comments`: Add a comment to a post.
- `GET /activities`: Get personal activity feed (notifications).

## 4. Technical Stack Recommendations
- **Language**: Node.js (TypeScript) or Go
- **Framework**: Express/Fastify (Node) or Fiber/Gin (Go)
- **Database**: PostgreSQL (Neon/Replit DB)
- **Real-time**: Socket.io or WebSockets for instant reactions/comments notifications.
- **Cache**: Redis for trending post calculations and session management.

## 5. Security & Privacy
- **Anonymity**: User IDs should never be exposed in public API responses. Only `identity_id` and anonymous metadata should be visible.
- **Rate Limiting**: Prevent spam by limiting posts/comments per hour per user.
- **Moderation**: Logic to automatically flag posts receiving high "Report" counts.
