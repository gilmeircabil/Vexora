# ToolNest Architecture

## Architecture Overview

ToolNest is engineered around a **hybrid, local-first architecture**. All 32 ordinary utility tools execute 100% inside the user's browser runtime with zero uploads or tracking. Heavy AI operations route through an authenticated, credit-metered backend API.

The repository is cleanly partitioned into dedicated `client/` and `server/` workspaces:

```
                      ┌────────────────────────────────────────┐
                      │              ToolNest SPA              │
                      │   (client/: React 19 + TypeScript)     │
                      └──────────────────┬─────────────────────┘
                                         │
               ┌─────────────────────────┼────────────────────────┐
               ▼                         ▼                        ▼
      ┌─────────────────┐       ┌─────────────────┐      ┌─────────────────┐
      │   Image Engine  │       │   Text & Code   │      │    PDF Engine   │
      │  (HTML5 Canvas, │       │  (Pure JS, AST, │      │    (pdf-lib,    │
      │   ImageBitmap)  │       │   Web Crypto)   │      │   pdfjs-dist)   │
      └─────────────────┘       └─────────────────┘      └─────────────────┘
                                         │
                                REST API (/api)
                                         ▼
                      ┌────────────────────────────────────────┐
                      │            ToolNest Backend            │
                      │   (server/: Express + TS + Mongoose)   │
                      └──────────────────┬─────────────────────┘
                                         │
                 ┌───────────────────────┼────────────────────────┐
                 ▼                       ▼                        ▼
        ┌─────────────────┐     ┌─────────────────┐      ┌─────────────────┐
        │  Credit Engine  │     │ Payment Service │      │    AI Engine    │
        │ (Atomic Lock &  │     │ (Stripe,        │      │ (Local Pipeline │
        │  2-Phase Comm)  │     │  PayMongo, Sand)│      │  or FastAPI)    │
        └─────────────────┘     └─────────────────┘      └─────────────────┘
```

---

## Workspace Structure

### `client/` (Frontend Application)
- `client/src/`
  - `tools/`: Central tool catalog (`catalog.ts`) and code-split registry (`registry.ts`).
  - `features/`: 33 tool interfaces across `images/`, `text/`, `developer/`, `utilities/`, `pdf/`.
  - `components/`: Accessible UI components (`common/` buttons, cards, dropzones, `layout/` header, footer).
  - `context/`: `ThemeContext`, `ToastContext`, `AuthContext`, `CreditContext`.
  - `pages/`: `HomePage`, `ToolsDirectoryPage`, `CategoryPage`, `ToolDetailPage`, `PricingPage`, `DashboardPage`, `AdminDashboardPage`, `LoginPage`, `RegisterPage`.
  - `lib/`: Domain calculations (canvas operations, diff algorithms, crypto generators, PDF builders).
  - `test/`: Vitest component and unit tests for frontend utilities.
- `client/public/`: Static assets (`robots.txt`, `sitemap.xml`).
- `client/e2e/`: Playwright end-to-end browser tests.
- `client/vite.config.ts`: Vite build configuration with `/api` reverse proxy to localhost:5000.
- `client/tsconfig.json`: Frontend TypeScript configuration.

### `server/` (Backend Application)
- `server/src/`
  - `config/`: Central plan definitions, credit costs, and Zod-validated environment config.
  - `models/`: Mongoose schemas (`User`, `Subscription`, `CreditAccount`, `CreditTransaction`, `AIJob`, `Payment`, `WebhookEvent`, `AIToolConfig`).
  - `services/`: Core logic:
    - `creditService.ts`: 00:00 UTC daily reset calculation, 2-phase atomic credit reservation, commit, rollback, and admin adjustments.
    - `authService.ts`: Password hashing (bcrypt) and JWT token lifecycle.
    - `payment/`: Provider abstraction (`StripeProvider`, `PayMongoProvider`, `SandboxProvider`) and webhook processing.
    - `ai/`: Image enhancement pipeline, FastAPI microservice HTTP adapter, and temporary file cleanup.
  - `controllers/`: Auth, credit, subscription, payment, AI, and admin handlers.
  - `routes/`: Express REST endpoints mounted under `/api`.
  - `middleware/`: JWT verification, `requireAdmin` role guard, sliding-window rate limiters, Multer image upload with magic-byte validation.
- `server/tests/`: Integration tests for timezone logic, credit math, password hashing, and webhook signature verification.
- `server/tsconfig.json`: NodeNext TypeScript backend configuration.

---

## Development Scripts (Root Orchestration)

From the project root:
- `npm run dev` or `npm run dev:client` — Start the Vite frontend server on `http://localhost:3000`.
- `npm run dev:server` — Start the Express backend with hot-reloading on `http://localhost:5000`.
- `npm run build` — Compile TypeScript and build production bundle into `client/dist/`.
- `npm run test` — Run all 73 automated tests across both client and server suites.
- `npm run typecheck` — Typecheck both client and server without emitting files.
- `npm run lint` — Lint all source files across client and server with ESLint.
