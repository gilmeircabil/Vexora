# User-Account AI Chat Storage Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Store AI chat conversations directly in MongoDB per user account so they are accessible from **any device** (mobile phone, laptop, desktop) with **zero localStorage usage** for user conversations. Strictly protects MongoDB Atlas Free Tier (~512 MB) via 12-day inactivity auto-expiry, a 25-conversation quota per user, a 50-message cap per conversation, zero base64 storage, and a user disclaimer notice banner in the sidebar.

---

## Proposed Changes & File Map

### Backend (Server)

- **`server/src/models/AIChatSession.ts`**:
  - Mongoose schema for `AIChatSession` with embedded `messages` array, 12-day TTL index on `updatedAt`, and compound index `{ userId: 1, updatedAt: -1 }`.
- **`server/src/models/index.ts`**:
  - Export `AIChatSession`.
- **`server/src/controllers/aiController.ts`**:
  - Add session management handlers: `listChatSessions`, `getChatSession`, `createChatSession`, `updateChatSession`, `deleteChatSession`, `clearChatSessions`.
  - Enforce FIFO 25-session cap, 50-message cap, 15,000 char cap, and stripping of raw base64 data.
- **`server/src/routes/aiRoutes.ts`**:
  - Mount `/chat/sessions` routes with `authenticate` middleware.
- **`server/src/test/aiChatSession.test.ts`**:
  - Tests verifying CRUD operations, 25-conversation quota pruning, base64 stripping, and TTL index configuration.

### Frontend (Client)

- **`client/src/services/aiToolsApi.ts`**:
  - Add API client methods for chat session endpoints: `listChatSessions`, `getChatSession`, `createChatSession`, `updateChatSession`, `deleteChatSession`, `clearChatSessions`.
- **`client/src/pages/ai/AiChatPage.tsx`**:
  - **No localStorage for user chats:** Fetch conversations directly from MongoDB via `aiToolsApi.listChatSessions()` on load.
  - Save all changes (new chats, new messages, renames, deletions) directly to MongoDB via the API.
  - Add 12-day auto-expiry disclaimer banner in the sidebar.
  - If not logged in, prompt users with a banner: _"Sign in to save and access your chats across all your devices."_ (Unauthenticated chats remain temporary in-memory state).
- **`client/src/test/ai_chat_storage.test.tsx`**:
  - Vitest test suite testing cloud session loading, 12-day disclaimer rendering, and session creation/deletion without localStorage.

---

## Tasks

### Task 1: Create `AIChatSession` Mongoose Model with 12-Day TTL Index

- [ ] **Step 1.1: Write `server/src/models/AIChatSession.ts`**
  - Define interfaces: `IChatAttachmentMeta`, `IChatMessageItem`, `IAIChatSession`.
  - Define schema with validation:
    - `userId`: `Schema.Types.ObjectId`, `ref: 'User'`, `required: true`, `index: true`.
    - `title`: `String`, `default: 'New Conversation'`, `trim: true`, `maxlength: 120`.
    - `model`: `String`, `default: 'gemini-3.5-flash-lite'`.
    - `messages`: Embedded array of `{ id, role, content, timestamp, attachment }`.
  - Add indexes:
    - Compound index: `{ userId: 1, updatedAt: -1 }`.
    - TTL index: `{ updatedAt: 1 }` with `{ expireAfterSeconds: 12 * 24 * 60 * 60 }` (12 days = 1,036,800 seconds).
  - Export model as `AIChatSession`.

- [ ] **Step 1.2: Register in `server/src/models/index.ts`**
  - Export `AIChatSession` and its TypeScript interfaces.

- [ ] **Step 1.3: Verify model compilation**
  - Run TypeScript typecheck:
    ```powershell
    npx tsc -p server/tsconfig.json --noEmit
    ```

---

### Task 2: Implement Backend Controller Endpoints & Free-Tier Protections

- [ ] **Step 2.1: Add helper sanitization in `server/src/controllers/aiController.ts`**
  - Add `sanitizeChatMessage(msg)` helper to strip any base64 properties (`base64Data`, `previewUrl` data URIs) and enforce a 15,000-character content limit.
  - Add quota enforcement helper: if user's session count >= 25, automatically delete the oldest session (`sort({ updatedAt: 1 })`).

- [ ] **Step 2.2: Add session controller methods to `AIController`**
  - `listChatSessions(req, res)`:
    - Query `AIChatSession.find({ userId }).select('_id title model updatedAt createdAt messages').sort({ updatedAt: -1 }).lean()`.
    - Return list of sessions with `messageCount: s.messages?.length || 0`, `lastMessagePreview: s.messages?.[s.messages.length - 1]?.content?.slice(0, 80) || ''`.
  - `getChatSession(req, res)`:
    - Query `AIChatSession.findOne({ _id: sessionId, userId }).lean()`. Return 404 if not found.
  - `createChatSession(req, res)`:
    - Check count. If >= 25, prune oldest session.
    - Sanitize messages (cap at latest 50 messages, strip base64).
    - Save and return new session.
  - `updateChatSession(req, res)`:
    - Support partial updates: if `title` is provided, update `title`. If `messages` provided, sanitize, slice last 50, update `messages` and touch `updatedAt`.
  - `deleteChatSession(req, res)`:
    - `AIChatSession.findOneAndDelete({ _id: sessionId, userId })`.
  - `clearChatSessions(req, res)`:
    - `AIChatSession.deleteMany({ userId })`.

- [ ] **Step 2.3: Wire routes in `server/src/routes/aiRoutes.ts`**
  - Import `authenticate` middleware.
  - Register endpoints:
    ```typescript
    router.get('/chat/sessions', authenticate, AIController.listChatSessions);
    router.get('/chat/sessions/:sessionId', authenticate, AIController.getChatSession);
    router.post('/chat/sessions', authenticate, AIController.createChatSession);
    router.put('/chat/sessions/:sessionId', authenticate, AIController.updateChatSession);
    router.delete('/chat/sessions/:sessionId', authenticate, AIController.deleteChatSession);
    router.delete('/chat/sessions', authenticate, AIController.clearChatSessions);
    ```

- [ ] **Step 2.4: Verify server compilation**
  - Run:
    ```powershell
    npx tsc -p server/tsconfig.json --noEmit
    ```

---

### Task 3: Backend Tests for AI Chat Session Endpoints & Quotas

- [ ] **Step 3.1: Write `server/src/test/aiChatSession.test.ts`**
  - Test session creation and sanitization (verifies base64 payload is stripped).
  - Test 25-conversation FIFO auto-pruning.
  - Test 50-message cap per conversation.
  - Test TTL index exists with 1,036,800 seconds (12 days).

- [ ] **Step 3.2: Run test suite**
  - Run:
    ```powershell
    npx vitest run server/src/test/aiChatSession.test.ts
    ```

---

### Task 4: Implement Client API Methods in `aiToolsApi.ts`

- [ ] **Step 4.1: Add API client methods to `client/src/services/aiToolsApi.ts`**
  - `listChatSessions()` -> `GET /api/ai/chat/sessions`
  - `getChatSession(sessionId: string)` -> `GET /api/ai/chat/sessions/${sessionId}`
  - `createChatSession(payload)` -> `POST /api/ai/chat/sessions`
  - `updateChatSession(sessionId: string, payload)` -> `PUT /api/ai/chat/sessions/${sessionId}`
  - `deleteChatSession(sessionId: string)` -> `DELETE /api/ai/chat/sessions/${sessionId}`
  - `clearChatSessions()` -> `DELETE /api/ai/chat/sessions`

- [ ] **Step 4.2: Verify client compilation**
  - Run:
    ```powershell
    npm run build --prefix client
    ```

---

### Task 5: Pure Cloud Sync & 12-Day Notice in `AiChatPage.tsx` (No LocalStorage for User Chats)

- [ ] **Step 5.1: Add 12-day auto-expiry disclaimer banner in the sidebar**
  - Render an info card at the bottom of the session sidebar:
    ```tsx
    <div className="mx-3 my-2 p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300/90 flex items-start gap-2">
      <Clock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
      <div>
        <span className="font-semibold block">12-Day Cloud Storage Notice</span>
        <span>
          Inactive conversations are automatically cleared after 12 days to optimize storage.
        </span>
      </div>
    </div>
    ```

- [ ] **Step 5.2: Replace localStorage chat persistence with direct MongoDB cloud persistence**
  - When `isAuthenticated` is true:
    - Load sessions directly from `aiToolsApi.listChatSessions()` on mount or auth change.
    - When a user sends a message in a new conversation, create the session in MongoDB (`aiToolsApi.createChatSession`).
    - When a stream completes or a conversation continues, persist the updated messages to MongoDB (`aiToolsApi.updateChatSession`).
    - Deleting a conversation calls `aiToolsApi.deleteChatSession`.
    - No user conversations are stored in `localStorage`, guaranteeing full cross-device synchronization between mobile phones, laptops, and desktop browsers.
  - When `isAuthenticated` is false:
    - Show prompt in sidebar: _"Sign in to save and access your chats across all your devices."_
    - Unauthenticated guest chats exist only in temporary memory (state).

- [ ] **Step 5.3: Verify client build**
  - Run:
    ```powershell
    npm run build --prefix client
    ```

---

### Task 6: Frontend Tests & Verification

- [ ] **Step 6.1: Add Vitest test file `client/src/test/ai_chat_storage.test.tsx`**
  - Test that the 12-day storage notice disclaimer renders in the sidebar.
  - Test cloud session fetching on mount.
  - Test session creation and deletion API calls.
  - Test unauthenticated guest banner rendering.

- [ ] **Step 6.2: Run all frontend tests**
  - Run:
    ```powershell
    npx vitest run client/src/test/ai_chat_storage.test.tsx
    ```

- [ ] **Step 6.3: Run full existing test suite to ensure zero regressions**
  - Run:
    ```powershell
    npx vitest run client/src/test/ai_tools.test.tsx
    ```
