# VexoraMods — SECURITY Lane Audit Report

**Date:** 2026-11-01  
**Lane:** `SECURITY`  
**Status:** Lane Complete & Verified

---

## 1. Executive Summary

- **Project:** VexoraMods (`vexoramods`)
- **Audit Scope:** Authentication (S1), Authorization & IDOR (S2), Input Validation & Sanitization (S3), File Upload Security (S4), Backend API Hardening (S5), Rate Limiting (S6), Secrets & Environment (S7), Transport & Security Headers (S8), Database Security (S9), Concurrency (S10), Payments/Donations (S11), Paid APIs & Cost Safety (S12), and Git History Secrets Scan.
- **Git History Secrets Scan:** Clean. Verified via `git log -p -- .env*` and keyword search. No production API keys, database passwords, or payment secrets exist in git commits.
- **Findings Summary:** 0 CRITICAL, 0 HIGH, 2 MEDIUM, 2 LOW, 0 NEEDS-PROOF.
- **Verdicts:**
  - `SEC-01` (MEDIUM): Production JWT fallback secret guard — **RESOLVED**
  - `SEC-02` (MEDIUM): Cookie clearing attribute mismatch on logout and password reset — **RESOLVED**
  - `SEC-03` (LOW): Missing Strict-Transport-Security (HSTS) header in production — **RESOLVED**
  - `SEC-04` (LOW): Missing Permissions-Policy header in Express middleware — **RESOLVED**

---

## 2. Findings Table

| ID       | Severity | Category                          | Location                                   | Status     | Summary & Impact                                                                                                                                               | Remediation Executed                                                                                              |
| -------- | -------- | --------------------------------- | ------------------------------------------ | ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| `SEC-01` | `MEDIUM` | Secrets & Configuration (S7)      | `server/src/config/env.ts`                 | `RESOLVED` | In production (`NODE_ENV === 'production'`), `JWT_SECRET` and `JWT_REFRESH_SECRET` fall back to development strings if unset.                                  | Added Zod `.superRefine()` check rejecting default development secrets when `NODE_ENV === 'production'`.          |
| `SEC-02` | `MEDIUM` | Authentication & Cookies (S1, S8) | `server/src/controllers/authController.ts` | `RESOLVED` | `res.clearCookie('refreshToken')` called without `httpOnly`, `secure`, and `sameSite` options, causing strict browsers to retain the session cookie on logout. | Passed matching `{ httpOnly: true, secure: env.NODE_ENV === 'production', sameSite: 'lax' }` on cookie clearance. |
| `SEC-03` | `LOW`    | Transport & Headers (S8)          | `server/src/app.ts`                        | `RESOLVED` | Missing `Strict-Transport-Security` (HSTS) header in Express security headers.                                                                                 | Added `Strict-Transport-Security: max-age=31536000; includeSubDomains; preload` header in production.             |
| `SEC-04` | `LOW`    | Transport & Headers (S8)          | `server/src/app.ts`                        | `RESOLVED` | Missing `Permissions-Policy` header to disallow camera, microphone, and geolocation by default.                                                                | Added `Permissions-Policy: camera=(), microphone=(), geolocation=()` to Express security middleware.              |

---

## 3. Detailed Audit Evidence by Section

### S1. Authentication & Session Management

- **Password Storage:** Verified bcrypt hashing with salt rounds. Plaintext passwords never stored.
- **Account Lockout:** Verified 5 failed attempts locks account for 15 minutes (`LOGIN_MAX_FAILED_ATTEMPTS=5`, `LOGIN_LOCKOUT_MINUTES=15`).
- **Token Invalidation:** User `tokenVersion` increments upon password reset or critical security events, immediately invalidating all outstanding refresh tokens.
- **Email Verification & Password Reset:** Tokens are single-use SHA-256 hashes with strict expirations (24 hours and 30 minutes respectively).

### S2. Authorization & IDOR Protection

- **Role Gating:** `requireAdmin` and `requireTeacher` strictly protect administrative and educator endpoints. Admin router uses `router.use(authenticate, requireAdmin)`.
- **Object-Level Access (IDOR):**
  - Design projects (`DesignProjectController`): All queries bind `userId: new Types.ObjectId(userId)`.
  - Developer profiles, reviews, learning posts, and favorites all enforce ownership checks on mutate operations.
- **Data Minimization:** `AuthService.getCurrentUser` strips `passwordHash` and projects only safe fields.

### S3. Input Validation & Malicious Input

- **Request Schemas:** Zod schemas validate registration, login, profile updates, reviews, and passwords.
- **NoSQL Injection:** Parameterized Mongoose queries; all IDs validated with `Types.ObjectId.isValid()`.
- **XSS:** Content-Security-Policy meta tag active in `client/index.html`; React escape mechanisms protect user inputs; no unsafe `dangerouslySetInnerHTML` on unescaped user text.

### S4. File Upload Security

- **Memory Storage:** Uploads held in memory buffers (`multer.memoryStorage()`), never written to executable server disk locations.
- **Magic Byte Verification:** `validateImageMagicBytes` and `validateDocMagicBytes` enforce byte headers (JPEG `FF D8 FF`, PNG `89 50 4E 47`, WebP `RIFF...WEBP`, PDF `%PDF`).
- **Size Limits:** Hard-capped at 15MB for images and 30MB for documents.

### S5 & S6. API Protection & Rate Limiting

- **Production Error Masking:** `server/src/app.ts` masks error details in production to `'An internal error occurred'`.
- **Granular Rate Limiters:**
  - Registration: 6 requests / 15 min per IP.
  - Login: 10 requests / 15 min per IP.
  - Verification resends: 3 requests / 15 min per IP+email.
  - Password resets: 5 requests / 15 min per IP+email.
  - AI endpoints: 10 requests / 1 min per IP.

### S7. Secrets & Environment

- **Git History Secrets Check:** Scanned `git log -p -- .env*` and commits. No live secrets found. Only sanitized `.env.example` exists.
- **Service Tokens:** Node server and Python FastAPI AI microservice communicate using `x-ai-service-token: env.FASTAPI_AI_SECRET`.

### S8. Transport, CORS, CSP

- **CORS:** Strict origin allowlist (`env.CLIENT_URL`, `http://localhost:3000`, `http://localhost:4173`). No wildcard origins with credentials.
- **CSP:** Configured in `client/index.html` allowing Google Fonts, Cloudflare Turnstile, and self.
- **Cookies:** `refreshToken` is `HttpOnly`, `SameSite=Lax`, `Secure` in production.

### S11. Payments & Donations

- **PayMongo Webhooks:** Validated with HMAC SHA-256 signature verification (`DonationService.verifyPayMongoSignature`) using timing-safe comparison.
- **Idempotency:** Monitored via `WebhookEvent` model to prevent duplicate processing.

### S12. Paid APIs & Cost Safety

- **Zero Paid Cloud LLMs:** The application utilizes self-hosted Ollama (`http://127.0.0.1:11434`) and local Python microservices (`http://127.0.0.1:8000`).
- **Cost Risk:** $0.00 / month recurring external API cost risk.

---

## 4. Verification Baseline (Post-Remediation)

| Check                | Command                | Status | Evidence                         |
| -------------------- | ---------------------- | ------ | -------------------------------- |
| TypeScript Typecheck | `npm run typecheck`    | `PASS` | `tsc -b --noEmit` exit 0         |
| ESLint               | `npm run lint`         | `PASS` | `eslint .` exit 0 (0 errors)     |
| Unit Tests           | `npm test`             | `PASS` | 22 test files, 211 tests passed  |
| Prettier             | `npm run format:check` | `PASS` | All matched files Prettier style |
| Production Build     | `npm run build`        | `PASS` | `tsc -b && vite build client` 0  |

---

## 5. Assessment

**VERIFIED**  
All 4 security findings (`SEC-01` through `SEC-04`) have been fully remediated and verified. Clean git history confirmed. Zero test failures, 0 lint errors, 0 type errors. Lane 4 (`SECURITY`) is complete.
