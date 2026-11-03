# AI Text & Developer Tools Frontend & Backend Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the missing frontend UI pages and Express backend routes for the 3 core AI text & developer utilities: AI Code Explainer & Debugger, AI Document Summarizer & Q&A, and AI Writing & ATS Resume Assistant, powered directly by Google Gemini and NVIDIA NIM.

**Architecture:** 
- Express backend (`server/src/services/ai/geminiTextService.ts`) provides clean REST endpoints (`/api/ai/code-assist`, `/api/ai/document-assist`, `/api/ai/writing-assist`) connecting directly to Google Gemini (or NVIDIA NIM) using the verified API key in `.env`.
- Frontend React pages follow Vexora's neo-brutalist UI pattern with full responsiveness, copy-to-clipboard, markdown formatting, sample prompts, and error boundaries.
- Registered in `TOOL_CATALOG` and `AI_TOOLS_REGISTRY` so they appear on `/tools`, `/ai`, and in search.

**Tech Stack:** React 19, TypeScript, Tailwind CSS 4, Lucide Icons, Express 5, Google Gemini API, Vitest.

---

### Task 1: Express Backend Text AI Service & Routes

**Files:**
- Create: `server/src/services/ai/geminiTextService.ts`
- Modify: `server/src/controllers/aiController.ts`
- Modify: `server/src/routes/aiRoutes.ts`

- [x] Create `geminiTextService.ts` to execute prompt completions with `gemini-flash-latest` (and NVIDIA fallback).
- [x] Add `explainCode`, `summarizeDocument`, and `assistWriting` handlers in `aiController.ts`.
- [x] Register routes `POST /api/ai/code-assist`, `POST /api/ai/document-assist`, `POST /api/ai/writing-assist` in `aiRoutes.ts`.
- [x] Verify server typecheck (`npm run typecheck`).

---

### Task 2: Frontend API Service & Registry Catalog Updates

**Files:**
- Modify: `client/src/services/aiToolsApi.ts`
- Modify: `client/src/lib/ai/aiToolsRegistry.ts`
- Modify: `client/src/tools/catalog.ts`

- [x] Add `explainCode`, `summarizeDocument`, and `assistWriting` methods in `aiToolsApi.ts`.
- [x] Add the 3 tools to `AI_TOOLS_REGISTRY` in `aiToolsRegistry.ts`.
- [x] Add the 3 tools to `TOOL_CATALOG` in `catalog.ts` under categories `developer` and `text`.

---

### Task 3: Build Frontend Pages & Routes

**Files:**
- Create: `client/src/pages/ai/AiCodeExplainerPage.tsx`
- Create: `client/src/pages/ai/AiDocumentSummarizerPage.tsx`
- Create: `client/src/pages/ai/AiWritingAssistantPage.tsx`
- Modify: `client/src/App.tsx`

- [x] Build `AiCodeExplainerPage.tsx` with code editor/textarea, language picker, mode selector (Explain vs Debug), sample snippets, and formatted response viewer.
- [x] Build `AiDocumentSummarizerPage.tsx` with file upload (.txt, .md, .pdf) or paste area, summary style selector, and interactive Q&A question box.
- [x] Build `AiWritingAssistantPage.tsx` with mode toggle (Rewrite/Polish vs ATS Resume Builder), tone selector, and side-by-side preview with one-click copy.
- [x] Register routes in `client/src/App.tsx` with `React.lazy` and link them in navigation.

---

### Task 4: Verification & Automated Tests

**Files:**
- Modify: `client/src/test/ai_tools.test.tsx`
- Run: `npm run typecheck`
- Run: `npm run build:client`
- Run: `npm test`

- [x] Update `ai_tools.test.tsx` to assert new tools are present and render correctly.
- [x] Run typecheck (`npm run typecheck`).
- [x] Run build test (`npm run build:client`).
- [x] Run Vitest suite (`npm test`).
