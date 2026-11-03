# Design: User-Account AI Chat Storage with MongoDB Free-Tier Protection & Auto-Expiry

**Date:** 2026-11-03  
**Status:** Approved by User  
**Storage Model:** Pure Cloud Database (MongoDB) - Zero LocalStorage for Users  
**Retention Policy:** 12 Days Inactivity Auto-Expiry  
**Author:** Antigravity & User

---

## 1. Intent & The "Why"

The user explicitly wants conversations accessible across **any device** (mobile phone, computer, tablet). LocalStorage is eliminated for authenticated users so that conversations are never trapped on a single machine or browser.

MongoDB is the **sole source of truth** for all user conversations.

To permanently safeguard the MongoDB Atlas Free Tier (M0 ~512 MB):

1. **12-Day Native Expiry:** Inactive conversations automatically expire and get purged by MongoDB 12 days after the last message.
2. **Quota Guards:** Maximum 25 conversations per user (FIFO auto-pruning if exceeded), 50 messages max per conversation, 0 raw base64 binary storage in the database.
3. **UI Transparency:** A disclaimer banner in the sidebar informs users that inactive chats expire after 12 days.

---

## 2. Goals, Non-Goals & Anti-Goals

### Goals

- **True Universal Cross-Device Access:** A user chatting on their phone immediately sees those conversations when opening their laptop or desktop.
- **Pure Cloud Source of Truth:** No `localStorage` is used for user chat history. Conversations are fetched directly from MongoDB on mount/login.
- **Account Isolation:** User A and User B never see each other's chats.
- **12-Day Native TTL Purging:** Native MongoDB index deletes conversations inactive for 12 days (`1,036,800` seconds).
- **Sidebar Notice Banner:** Displays: _"Notice: Inactive chats are automatically cleared after 12 days to optimize cloud storage."_
- **Strict Free-Tier Caps:**
  - Max 25 sessions per user.
  - Max 50 messages per session.
  - Zero base64 blobs in database (attachment metadata only: filename, size, MIME type).
- **Guest / Unauthenticated Experience:**
  - If a user is not logged in, an info pill/banner prompts: _"Sign in to save and access your chats across all your devices."_ (Unauthenticated chats are transient in session memory, not persisted to the database).

### Non-Goals

- LocalStorage caching or offline-only silos for user accounts.
- Storing high-resolution image binaries in MongoDB.

### Anti-Goals

- **No Device Lock-in:** Chats must never be stranded in a single browser's local storage.
- **No Free-Tier Storage Overflows:** Hard caps ensure active users consume < 1.2 MB each, leaving ample space on Atlas M0.

---

## 3. Technical Specification

### 3.1 MongoDB Schema & Native TTL Index (`server/src/models/AIChatSession.ts`)

```typescript
interface IChatAttachmentMeta {
  name: string;
  mimeType: string;
  size: number;
}

interface IChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string; // capped at 15,000 chars
  timestamp: number;
  attachment?: IChatAttachmentMeta; // No base64 data
}

interface IAIChatSession extends Document {
  userId: Types.ObjectId;
  title: string;
  model?: string;
  messages: IChatMessage[]; // capped at 50 messages
  createdAt: Date;
  updatedAt: Date;
}
```

**Indexes:**

1. `{ userId: 1, updatedAt: -1 }` (fast query by recency)
2. `{ updatedAt: 1 }` with `{ expireAfterSeconds: 12 * 24 * 60 * 60 }` (native TTL auto-deletion after 12 days of inactivity)

### 3.2 Backend API Routes (`server/src/controllers/aiController.ts` & `aiRoutes.ts`)

- `GET /api/ai/chat/sessions`: Lists the user's sessions from MongoDB.
- `GET /api/ai/chat/sessions/:sessionId`: Fetches a session and its messages from MongoDB.
- `POST /api/ai/chat/sessions`: Creates a new session in MongoDB (enforces 25-session quota; auto-prunes oldest session if exceeded).
- `PUT /api/ai/chat/sessions/:sessionId`: Updates title or appends messages (enforces 50-message cap; strips base64).
- `DELETE /api/ai/chat/sessions/:sessionId`: Deletes session from MongoDB.
- `DELETE /api/ai/chat/sessions`: Clears all sessions for the user from MongoDB.

### 3.3 UI Notice Banner (`client/src/pages/ai/AiChatPage.tsx`)

In the sidebar:

- Notice card with clock icon:
  _"Notice: Inactive chats are automatically cleared after 12 days to optimize cloud storage."_
- If not authenticated:
  _"Sign in to save and access your chats across all your devices."_

### 3.4 Client Data Flow (No LocalStorage for User Chats)

- On page load / user authentication:
  - Fetches conversation list directly from `/api/ai/chat/sessions`.
  - Sets active conversation from MongoDB.
- When sending a message:
  - On stream complete, saves/updates session directly in MongoDB via API.
- Switching devices:
  - Opening the app on a phone or laptop queries `/api/ai/chat/sessions` with the user's auth token, immediately presenting their full cloud chat history.
