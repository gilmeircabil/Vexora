# Dual Free Cloud AI Providers (Google Gemini & NVIDIA NIM) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Enable Vexora's AI services to run on 100% free cloud models (Google Gemini API & NVIDIA NIM API) with smart failover, zero heavy local Ollama requirements, and resilient error recovery for visual AI tools.

**Architecture:** A unified provider interface in `ai-service/app/services/language_model.py` that connects via `httpx` async REST calls to both Google Gemini (Google AI Studio) and NVIDIA NIM (`integrate.api.nvidia.com`). The Express server (`aiService.ts`) is fortified with fallback guards so microservice disconnections never cause 500 errors.

**Tech Stack:** Python 3 (FastAPI, httpx, pydantic), Node.js (Express, TypeScript, Mongoose, Sharp), Google Gemini API, NVIDIA NIM API.

**Spec:** Dual Provider Design Specification discussed in chat.

## Global Constraints

- Zero new third-party cloud SDK dependencies required (`httpx` handles both APIs cleanly).
- Zero paid API requirements (only free tier endpoints).
- Support `AI_PROVIDER=auto`, `AI_PROVIDER=gemini`, and `AI_PROVIDER=nvidia`.
- Backward compatibility: If a user still wants local `ollama`, keep it as a supported option.
- Resilient fallback: Image & document tools in Node.js must not crash with unhandled 500 when microservice is offline.

## Review Focus

- Missing API keys must return clear, actionable configuration messages rather than crashing with 500.
- Gemini rate-limit (HTTP 429) must automatically fall back to NVIDIA if `NVIDIA_API_KEY` is present.
- OpenAI-compatible parsing for NVIDIA response shapes must cleanly map to Vexora's internal response schema.
- Node.js `aiService.ts` must handle microservice `fetch` failures gracefully across all endpoints (especially `processObjectRemoval` and `processOcr`).

---

### Task 1: Environment & Config Updates for Gemini and NVIDIA

**Files:**

- Modify: `ai-service/app/config.py`
- Modify: `server/src/config/env.ts`
- Modify: `.env.example`
- Modify: `.env`

- [x] Add Gemini and NVIDIA configuration fields to `ai-service/app/config.py`:
  - `AI_PROVIDER: str = "auto"`
  - `GEMINI_API_KEY: Optional[str] = None`
  - `GEMINI_MODEL: str = "gemini-2.0-flash"`
  - `NVIDIA_API_KEY: Optional[str] = None`
  - `NVIDIA_BASE_URL: str = "https://integrate.api.nvidia.com/v1"`
  - `NVIDIA_MODEL: str = "meta/llama-3.3-70b-instruct"`
  - `NVIDIA_CODE_MODEL: str = "qwen/qwen2.5-coder-32b-instruct"`
- [x] Update `server/src/config/env.ts` to include optional `GEMINI_API_KEY`, `NVIDIA_API_KEY`, and `AI_PROVIDER`.
- [x] Add annotated placeholders in `.env.example` and update `.env`.
- [x] Verify TypeScript server build (`npm run typecheck`).

---

### Task 2: Implement Unified Multi-Provider Language Model Service

**Files:**

- Modify: `ai-service/app/services/language_model.py`
- Modify: `ai-service/app/models/model_registry.py`

- [x] In `language_model.py`, build `call_gemini(prompt, system_prompt, model, ...)` via REST `https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={GEMINI_API_KEY}`.
- [x] In `language_model.py`, build `call_nvidia(prompt, system_prompt, model, ...)` via REST `{NVIDIA_BASE_URL}/chat/completions` with bearer token.
- [x] Implement `generate()` and `chat()` router in `LanguageModelService` to respect `AI_PROVIDER` (`gemini`, `nvidia`, `auto`, `ollama`).
- [x] Implement automatic failover: If the primary provider encounters HTTP 429 or connection failure, attempt the secondary provider if its key is configured.
- [x] Update `model_registry.py` to inspect and report live readiness of Gemini and NVIDIA.

---

### Task 3: Fortify Node.js AI Service Error Handling

**Files:**

- Modify: `server/src/services/ai/aiService.ts`

- [x] Wrap `fetch` in `processObjectRemoval` with `try / catch` so microservice unavailability falls back safely instead of throwing unhandled `ECONNREFUSED`.
- [x] Wrap `fetch` in `processOcr` with `try / catch` so microservice unavailability falls back to built-in message.
- [x] Improve error reporting in `getModelStatus` to clearly indicate whether Gemini, NVIDIA, or local microservice is active.

---

### Task 4: Verification & Automated Tests

**Files:**

- Test: `server/tests/ai_tools.test.ts`
- Run: `npm run typecheck`
- Run: `npm run lint`
- Run: `npm test`

- [x] Run full project typecheck (`npm run typecheck`).
- [x] Run server tests (`npm run test:server`).
- [x] Run full project test suite (`npm test`).
