# Free and Open-Source Architecture Refactoring Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refactor ToolNest into a completely free, open-source, all-in-one tools platform by removing all subscription, payment, and credit systems, while making AI an optional, self-hosted enhancement powered by user-configurable local Ollama.

**Architecture:** 
- Strip out credit reservations, daily allowances, payment providers, and subscription gating from both client and server.
- Ordinary tools and ToolNest Studio work 100% free with zero login or credit requirement.
- Centralize AI integration into an open-source provider (`AIService` & `aiProvider`) that supports user-configurable Ollama endpoints with SSRF protection, live model discovery, and timeouts.
- Provide a dedicated AI Settings page (`/settings/ai`) for endpoint configuration, model selection, and connection testing.
- Integrate AI enhancement options into Image, PDF, Text, Developer, and Studio tools while ensuring non-AI fallback processing is always available.
- Update homepage to `"ToolNest — Everyday tools. One place. Free for everyone."` and restructure tool categories.

**Tech Stack:** React, TypeScript, Vite, Tailwind CSS, Node.js, Express, MongoDB, Mongoose, Sharp, PyMuPDF, Fabric.js, Ollama.

**Spec:** User request: Free and Open-Source Product Architecture.

---

## Global Constraints
- All ordinary tools are 100% free and usable without creating an account.
- No subscriptions, payment providers, credit checks, or daily AI limits.
- No paid third-party AI APIs (no OpenAI, Replicate, Stability AI).
- AI is strictly optional and must never block standard tool workflows or Studio canvas editing.
- SSRF validation on user-configured Ollama endpoints (only valid HTTP localhost or allowed hostnames/ports, no private cloud metadata IP access).
- Preserve existing saved projects, designs, assets, and user database records.
- Preserve full test suite pass rate (`npm test`, `npm run typecheck`, `npm run build`).

---

## Tasks

### Task 1: Safe Removal of Monetization, Payments, and Credits from Server

**Files:**
- Modify: `server/src/routes/index.ts`
- Modify: `server/src/services/ai/aiService.ts`
- Modify: `server/src/controllers/aiController.ts`
- Modify: `server/src/models/AIJob.ts`
- Modify: `server/src/models/User.ts`
- Modify: `server/src/services/authService.ts`
- Modify: `server/src/controllers/adminController.ts`
- Modify: `server/src/config/plans.ts` (deprecate/remove pricing tiers)
- Test: `server/tests/ai_tools.test.ts`

**Steps:**
- [ ] Remove `creditRoutes` and `subscriptionRoutes` from `server/src/routes/index.ts`.
- [ ] In `server/src/services/ai/aiService.ts`, eliminate `CreditService.reserveCredits`, `commitReservation`, and `refundReservation`. Allow anonymous or authenticated execution with 0 credit deduction.
- [ ] In `server/src/controllers/aiController.ts`, remove credit-check error responses (402 Insufficient Credits). Allow requests to proceed directly.
- [ ] In `server/src/models/AIJob.ts`, set `creditsReserved` and `creditsConsumed` default to 0 and make them non-required.
- [ ] In `server/src/services/authService.ts`, remove initial credit account creation and subscription linking on user register.
- [ ] In `server/src/controllers/adminController.ts`, remove credit balance adjustments and subscription queries.
- [ ] Verify server compiles cleanly via `npm run typecheck`.

---

### Task 2: Build Centralized AI Provider & SSRF Validation

**Files:**
- Create: `server/src/services/ai/aiProvider.ts`
- Modify: `server/src/routes/aiRoutes.ts`
- Modify: `server/src/controllers/aiController.ts`
- Modify: `server/src/services/ai/aiService.ts`
- Test: `server/tests/ai_provider.test.ts`

**Steps:**
- [ ] Create `server/src/services/ai/aiProvider.ts` with:
  - SSRF validator function `validateOllamaEndpoint(url: string)`: blocks cloud metadata (`169.254.169.254`), non-HTTP/HTTPS protocols, dangerous local network masks, while allowing `localhost`, `127.0.0.1`, and explicit valid remote ports.
  - `checkConnection(endpoint: string)`: sends ping to `/api/tags` with 3s timeout and returns list of installed models.
  - `generate(endpoint: string, model: string, prompt: string, systemPrompt?: string)`.
- [ ] Add `POST /api/ai/test-connection` endpoint to test any user-specified endpoint safely.
- [ ] Wire user-configured endpoint header (`x-ollama-endpoint`) or fallback to `env.OLLAMA_URL` in `AIService`.
- [ ] Write unit test `server/tests/ai_provider.test.ts` testing SSRF blocking of AWS/GCP metadata IPs and successful localhost endpoint validation.
- [ ] Run `npm test` to verify.

---

### Task 3: Remove Monetization from Frontend & Clean Up Navigation

**Files:**
- Modify: `client/src/App.tsx`
- Modify: `client/src/components/layout/Header.tsx`
- Modify: `client/src/context/AuthContext.tsx`
- Delete: `client/src/context/CreditContext.tsx`
- Delete: `client/src/components/common/CreditIndicator.tsx`
- Delete: `client/src/pages/PricingPage.tsx`
- Modify: `client/src/pages/DashboardPage.tsx`
- Modify: `client/src/pages/AdminDashboardPage.tsx`
- Modify: `client/src/pages/RegisterPage.tsx`
- Modify: `client/src/features/images/AiImageEnhancerTool.tsx`

**Steps:**
- [ ] Remove `CreditProvider` from `client/src/App.tsx` and delete the `/pricing` route.
- [ ] Remove Pricing and CreditIndicator from `client/src/components/layout/Header.tsx`, replacing with AI Settings and clean tool links.
- [ ] In `client/src/context/AuthContext.tsx`, remove credit balance polling and subscription fields from user state.
- [ ] Clean `client/src/pages/DashboardPage.tsx` to remove "Subscription Plan" and "Credits" tabs; display saved projects and recent tool history.
- [ ] Clean `client/src/pages/AdminDashboardPage.tsx` to remove credit adjustments.
- [ ] Remove credit badges and "sign in for 3/10 credits" notices from `AiImageEnhancerTool.tsx` and `RegisterPage.tsx`.
- [ ] Verify frontend builds cleanly with `npm run build`.

---

### Task 4: Create AI Settings Page & Client Provider Config

**Files:**
- Create: `client/src/lib/ai/aiSettingsStore.ts`
- Create: `client/src/pages/AiSettingsPage.tsx`
- Modify: `client/src/services/aiToolsApi.ts`
- Modify: `client/src/App.tsx`
- Modify: `client/src/components/layout/Header.tsx`

**Steps:**
- [ ] Create `client/src/lib/ai/aiSettingsStore.ts`: LocalStorage management for `aiEnabled` (boolean), `ollamaEndpoint` (string, default `http://localhost:11434`), `selectedModel` (string), and `customModels` (array).
- [ ] Update `client/src/services/aiToolsApi.ts` to attach `x-ollama-endpoint` and `x-ollama-model` headers to all AI requests from `aiSettingsStore`.
- [ ] Create `client/src/pages/AiSettingsPage.tsx` (`/settings/ai`) with:
  - Master AI Enabled/Disabled toggle.
  - Ollama Endpoint URL input.
  - "Test Connection" button calling `/api/ai/test-connection`.
  - Live model dropdown populated dynamically from the connected Ollama server.
  - Status indicator (Connected / Offline / Error).
  - Clear, friendly setup instructions (`ollama serve`, `ollama pull llama3.2`).
- [ ] Add route `/settings/ai` in `client/src/App.tsx` and link in `Header.tsx`.

---

### Task 5: AI Integration into Existing Tools & Free Workspace Polish

**Files:**
- Modify: `client/src/lib/ai/aiToolsRegistry.ts`
- Modify: `client/src/pages/AiToolsDashboardPage.tsx`
- Modify: `client/src/pages/ai/AiImageEnhancerPage.tsx`
- Modify: `client/src/pages/ai/AiBackgroundRemoverPage.tsx`
- Modify: `client/src/pages/ai/AiObjectRemoverPage.tsx`
- Modify: `client/src/pages/ai/AiPhotoRestorationPage.tsx`
- Modify: `client/src/pages/ai/AiOcrPage.tsx`
- Modify: `client/src/pages/ai/AiPdfSummarizerPage.tsx`
- Modify: `client/src/pages/ai/AiPdfChatPage.tsx`
- Modify: `client/src/pages/ai/AiWritingAssistantPage.tsx`
- Modify: `client/src/pages/ai/AiResumeBuilderPage.tsx`
- Modify: `client/src/pages/ai/AiCodeExplainerPage.tsx`
- Modify: `client/src/pages/ai/AiErrorExplainerPage.tsx`
- Modify: `client/src/pages/ai/AiSocialDesignPage.tsx`
- Modify: `client/src/pages/DesignEditorPage.tsx`

**Steps:**
- [ ] Remove `creditCost` from `AI_TOOLS_REGISTRY` and all tool pages; mark all tools as 100% free and open.
- [ ] On each AI tool page, check `aiSettingsStore.isAiEnabled()`. If disabled or Ollama is offline, show an informative banner with a direct link to `/settings/ai`, while keeping local algorithmic tools (Sharp, inpainting canvas, text filters) functioning.
- [ ] In `AiSocialDesignPage.tsx`, allow generating designs and opening directly into Design Studio without requiring an account.
- [ ] In `DesignEditorPage.tsx` (ToolNest Studio), add an optional "AI Text & Layout" panel button that queries Ollama if enabled, while keeping all standard Fabric.js editing 100% offline and free.

---

### Task 6: Homepage & Category Reorganization

**Files:**
- Modify: `client/src/pages/HomePage.tsx`
- Modify: `client/src/tools/catalog.ts`
- Modify: `README.md`

**Steps:**
- [ ] Update `client/src/pages/HomePage.tsx` hero headline:
  `"ToolNest — Everyday tools. One place. Free for everyone."`
- [ ] Organize platform categories on the homepage:
  1. Image Tools
  2. PDF Tools
  3. Developer Tools
  4. Text Tools
  5. Productivity Tools
  6. ToolNest Studio
  7. AI-Enhanced Tools
- [ ] Update `README.md` to document the free, open-source architecture, Ollama setup, and self-hosted installation.

---

### Task 7: Full Verification & Automated Tests

**Files:**
- Modify: `server/tests/ai_tools.test.ts`
- Modify: `client/src/test/ai_tools.test.tsx`
- Modify: `server/tests/credit_system.test.ts` -> migrate into `server/tests/auth_and_security.test.ts`

**Steps:**
- [ ] Update tests to verify that no credit or subscription checks are required.
- [ ] Add unit tests verifying SSRF protection and connection testing.
- [ ] Run `npm run typecheck` across both client and server (0 errors).
- [ ] Run `npm test` across all suites (all tests passing).
- [ ] Run `npm run build` to verify production bundle.
