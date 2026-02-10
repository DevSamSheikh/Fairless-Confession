# Backend Development Guide: ConfessBox

This document outlines the step-by-step process to build a robust, anonymous backend for ConfessBox using **Node.js, TypeScript, and PostgreSQL**.

---

## Phase 1: Environment Setup
1. **Initialize Project**: 
   - Use `npm init -y` in the server directory.
   - Install core dependencies: `express`, `cors`, `helmet`, `dotenv`, `pg`, `drizzle-orm`.
   - Install dev dependencies: `typescript`, `@types/node`, `@types/express`, `tsx`.
2. **Database Provisioning**: 
   - Use the Replit PostgreSQL tool to create a database instance.
   - Configure environment variables (`DATABASE_URL`).
3. **Drizzle ORM Setup**: 
   - Define the schema in `src/db/schema.ts` based on `@Backend_req.md`.
   - Set up the migration runner.

---

## Phase 2: Core Infrastructure
1. **Identity Management**:
   - Create an `IdentityService` to generate anonymous handles (e.g., `#Confess_1234`) and unique avatar seeds.
   - Implement JWT-based anonymous sessions (no password required).
2. **Middleware**:
   - **Auth Middleware**: Extracts and validates the anonymous identity from the header.
   - **Privacy Middleware**: Ensures no sensitive user IDs are leaked in API responses.
   - **Rate Limiter**: Limits post creation frequency to prevent spam.

---

## Phase 3: API Implementation
1. **Auth Endpoints**: 
   - `POST /auth/anonymous-login`
2. **Post Management**: 
   - `GET /posts` (with pagination & filtering)
   - `POST /posts` (with identity injection)
   - `GET /posts/trending` (logic for sorting by recent engagement)
3. **Society Management**:
   - `GET /societies`
   - `POST /societies/join/:id`
4. **Interaction Endpoints**:
   - `POST /reactions` (atomic updates to post reaction counts)
   - `POST /comments`

---

## Phase 4: Real-time & Optimization
1. **WebSockets (Socket.io)**:
   - Implement a notification system for when someone reacts to or comments on a user's post.
2. **Caching (Redis)**:
   - Cache trending post results to avoid heavy DB queries on every request.
3. **Analytics**:
   - Track post velocity to feed the "Trending" algorithm.

---

## Phase 5: Deployment & Hardening
1. **Security Review**: 
   - Verify that real user IDs are never returned to the frontend.
2. **Scaling**: 
   - Configure connection pooling for PostgreSQL.
3. **Publishing**: 
   - Deploy the backend as a Replit Autoscale deployment.

---

## Why this works best:
By using **TypeScript** on both sides, we ensure that the `Post` object the backend sends is exactly what the frontend expects, eliminating 90% of integration bugs.
