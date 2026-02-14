# ConfessBox API Endpoints

Base URL: `/api` (e.g. `http://localhost:5000/api`)

---

## Auth (no auth required except where noted)

| Method | Path | Description |
|--------|------|-------------|
| POST | `/auth/register` | Register: body `{ email, password, fullName, rulesAccepted, mac_address?, mobile_sim_number? }`. Captures IP, device, date/time; generates user id with **2004** prefix. |
| POST | `/auth/login` | Login: body `{ email, password, mac_address?, mobile_sim_number? }`. Updates tracking (login date/time, IP, etc.) and keeps previous records. |
| POST | `/auth/forget-password` | Body `{ email, redirectTo? }`. Sends reset email. |
| POST | `/auth/logout` | Logout (client should discard token). |

---

## Home (public)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/home` | Public confession feed. Query: `limit`, `offset`. |
| GET | `/home/trending` | Trending confessions. Query: `limit`, `period`. |

---

## Societies

| Method | Path | Description |
|--------|------|-------------|
| GET | `/societies` | List all societies. |
| GET | `/societies/confessions` | **Protected.** Feed from all joined societies. |
| GET | `/societies/discover` | Discover public societies. Query: `q`. |
| GET | `/societies/joined` | **Protected.** User's joined societies. |
| GET | `/societies/you` | **Protected.** Societies created by user. |
| GET | `/societies/:id` | Single society (`/society/:id`). |
| POST | `/societies/join/:id` | **Protected.** Join a society. |
| POST | `/societies/leave` | **Protected.** Body `{ societyId }`. Leave society. |

---

## Create society

| Method | Path | Description |
|--------|------|-------------|
| POST | `/create-society` | **Protected.** Body `{ name, description?, isPrivate?, iconName? }`. |

---

## Saved societies

| Method | Path | Description |
|--------|------|-------------|
| GET | `/saved-societies` | **Protected.** List saved/bookmarked societies. |
| POST | `/saved-societies` | **Protected.** Body `{ societyId }`. Save society. |
| DELETE | `/saved-societies/:id` | **Protected.** Remove saved society (id = society_id). |

---

## Leave society

| Method | Path | Description |
|--------|------|-------------|
| POST | `/leave-society` | **Protected.** Body `{ societyId }` or query `?societyId=`. |

---

## Post

| Method | Path | Description |
|--------|------|-------------|
| POST | `/post` | **Protected.** Create confession. Body `{ title, content, category, visibility?, societyId? }`. Captures unique id, username (identity), date/time, category, society id, heading, content; traces IP/device. |
| GET | `/post/:id` | Single post (for share link). Increments view count. Returns post + comments. |

---

## Interactions

| Method | Path | Description |
|--------|------|-------------|
| POST | `/interactions/react` | **Protected.** Body `{ postId, reactionType }`. |
| POST | `/interactions/comment` | **Protected.** Body `{ postId, content }`. |
| GET | `/interactions/post/:postId` | Post + comments (for redirect to that interaction/comment). |

---

## Profile

| Method | Path | Description |
|--------|------|-------------|
| GET | `/me` | **Protected.** Current user profile (anonymous identity, stats). |

---

## My confessions

| Method | Path | Description |
|--------|------|-------------|
| GET | `/my-confessions` | **Protected.** List current user's confessions. |
| DELETE | `/my-confession/delete/:id` | **Protected.** Delete own confession. |
| PATCH | `/my-confession/edit/:id` | **Protected.** Edit own confession. Body `{ title?, content?, category?, visibility?, societyId? }`. |

---

## Search

| Method | Path | Description |
|--------|------|-------------|
| GET | `/search` | Query `q`, `type` (all | posts | societies), `limit`. Search posts and societies. |

---

## Report

| Method | Path | Description |
|--------|------|-------------|
| POST | `/report/:postid` | **Protected.** Report a post. Body `{ reason?, details? }`. |

---

## Protected routes

Send header: `Authorization: Bearer <access_token>` (Supabase JWT from login/register).

---

## Tracking

- **Register:** Stores in `tracking_logs`: event_type `register`, IP, MAC (if sent), mobile_sim (if sent), device_info (User-Agent), created_at. User id is generated with pattern **2004-XXXXX**.
- **Login:** Appends a new row to `tracking_logs` with event_type `login` and same fields (previous records kept).
- **Post:** Each confession creation is logged in `post_activity_log`: post_id, user_id, user_identity_id, category, society_id, heading, content, ip_address, device_info, posted_at.

Client can send optional `mac_address` and `mobile_sim_number` in request body (register/login) or via headers `X-Mac-Address`, `X-Mobile-Sim` where applicable.
