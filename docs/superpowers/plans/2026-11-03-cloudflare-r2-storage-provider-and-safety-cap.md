# Cloudflare R2 Storage Provider & 9.5 GB Safety Cap Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement Cloudflare R2 (S3-compatible) object storage provider in Vexora backend with an automatic 9.5 GB safety cap that rejects uploads when nearing 10 GB to prevent cloud overage fees.

**Architecture:** Extend `StorageService` to support dual providers (`local` and `s3`). When configured for `s3`, uploads (main asset + Sharp thumbnail) stream to Cloudflare R2 using `@aws-sdk/client-s3`. Before each upload, a storage quota calculation against `DesignAsset` aggregates verifies total stored bytes stay below 9.5 GB (`9.5 * 1024 * 1024 * 1024`), rejecting excessive uploads with an explicit safety error. Asset serving routes stream from R2 or redirect to a public R2 bucket domain if configured.

**Tech Stack:** Node.js, Express, TypeScript, `@aws-sdk/client-s3`, Sharp, Mongoose, Vitest.

**Spec:** Support Cloudflare R2 object storage with zero risk of overage charges by enforcing a 9.5 GB hard stop while maintaining 100% backward compatibility with `local` disk storage during offline development.

---

## Global Constraints

- Never break existing `STORAGE_PROVIDER=local` development workflow.
- Do not add new required environment variables that break startup when `STORAGE_PROVIDER=local`.
- Hard stop quota threshold defaults to 9.5 GB (`9.5 * 1024 * 1024 * 1024` bytes) and can be configured via `STORAGE_MAX_GB`.
- Magic byte validation and 15MB/30MB file size limits in `uploadMiddleware.ts` must remain fully intact.
- All tests in `server` must pass with `npm run test:server`.

---

## Review Focus

1. **Storage Cap Boundary Check:** Uploading a file when existing total is 9.49 GB with a 20 MB file must fail cleanly with a 400/413 error without crashing or creating partial S3 objects.
2. **Local Fallback:** When `STORAGE_PROVIDER=local`, all uploads, thumbnail generation, and disk serving continue to work without needing any S3 environment variables.
3. **Thumbnail Generation with S3:** Thumbnail generated via Sharp in WebP format must be uploaded to the same R2 bucket under `thumbs/` or `thumb_*` key alongside the primary image.
4. **Delete Cascade:** Deleting a `DesignAsset` must delete both the primary asset object and the thumbnail object in the R2 bucket.
5. **Streaming / Public Fallback:** When public URL is configured, assets can be served via direct CDN or piped securely through `/api/design-assets/files/:storageKey`.

---

### Task 1: Add `@aws-sdk/client-s3` Dependency & Environment Schema

**Files:**
- Modify: `package.json`
- Modify: `server/package.json`
- Modify: `server/src/config/env.ts`
- Modify: `.env.example`

**Interfaces:**
- Produces: `env.STORAGE_MAX_GB` (number, default 9.5), `env.S3_PUBLIC_URL` (optional string), `S3Client` import availability.

- [x] **Step 1: Install `@aws-sdk/client-s3` in dependencies**
Run: `npm install @aws-sdk/client-s3`
Verify: `@aws-sdk/client-s3` appears in `package.json` and `server/package.json`.

- [x] **Step 2: Add `S3_PUBLIC_URL` and `STORAGE_MAX_GB` to `server/src/config/env.ts`**
Add:
```ts
S3_PUBLIC_URL: z.string().optional().default(''),
STORAGE_MAX_GB: z.coerce.number().default(9.5),
```

- [x] **Step 3: Update `.env.example`**
Add comments and examples for `STORAGE_MAX_GB=9.5` and `S3_PUBLIC_URL=`.

- [x] **Step 4: Verify typecheck passes**
Run: `npm run typecheck`
Expected: PASS

---

### Task 2: Implement Storage Quota Guard & S3 Client in `StorageService`

**Files:**
- Modify: `server/src/services/storageService.ts`
- Test: `server/tests/storage_service.test.ts`

**Interfaces:**
- Consumes: `env.STORAGE_PROVIDER`, `env.S3_BUCKET`, `env.S3_ENDPOINT`, `env.S3_REGION`, `env.S3_ACCESS_KEY`, `env.S3_SECRET_KEY`, `env.STORAGE_MAX_GB`, `DesignAsset` model.
- Produces: `StorageService.checkQuota(incomingBytes: number): Promise<void>`, `StorageService.saveAsset(...)`, `StorageService.deleteAsset(...)`, `StorageService.getAssetStream(...)`.

- [x] **Step 1: Write unit test in `server/tests/storage_service.test.ts` for quota calculation and S3 operations**
Test:
- Quota check passes when total size < 9.5 GB.
- Quota check throws `Storage limit reached (9.5 GB safety cap)` when total size + incoming > 9.5 GB.
- S3 upload calls S3 client PutObjectCommand with proper bucket and content type.

- [x] **Step 2: Run test to verify it fails**
Run: `npx vitest run server/tests/storage_service.test.ts`
Expected: FAIL (quota guard and S3 methods not yet implemented).

- [x] **Step 3: Implement S3 integration and quota guard in `StorageService`**
In `server/src/services/storageService.ts`:
- Lazy-instantiate `S3Client` using `env.S3_ENDPOINT`, `env.S3_REGION`, `credentials: { accessKeyId, secretAccessKey }`.
- In `checkQuota(incomingBytes: number)`:
  Sum total size using `DesignAsset.aggregate([{ $group: { _id: null, total: { $sum: '$size' } } }])`.
  If `(currentTotal + incomingBytes) > env.STORAGE_MAX_GB * 1024 * 1024 * 1024`, throw Error.
- In `saveAsset`:
  - Run `checkQuota(params.buffer.length)`.
  - If `env.STORAGE_PROVIDER === 's3'`:
    - Upload main asset via `PutObjectCommand`.
    - Generate Sharp WebP thumbnail in-memory and upload via `PutObjectCommand`.
    - Return keys and URLs.
  - If `local`: continue local disk saving.
- In `deleteAsset`:
  - If `s3`: invoke `DeleteObjectCommand` for main asset and thumbnail.
  - If `local`: unlink files.
- In `getAssetStream(storageKey: string, isThumb: boolean)`:
  - Return `{ stream: Readable, contentType: string } | null` for S3 or local disk.

- [x] **Step 4: Run test to verify it passes**
Run: `npx vitest run server/tests/storage_service.test.ts`
Expected: PASS

---

### Task 3: Update `designAssetController.ts` for Dual S3/Local File Streaming & Errors

**Files:**
- Modify: `server/src/controllers/designAssetController.ts`

**Interfaces:**
- Consumes: `StorageService.getAssetStream`, `StorageService.saveAsset` error handling.

- [x] **Step 1: Update `serveFile` in `designAssetController.ts`**
Handle `StorageService.getAssetStream`:
- If S3 public URL is configured (`env.S3_PUBLIC_URL`), redirect `res.redirect(302, `${env.S3_PUBLIC_URL}/${key}`)`.
- Otherwise, stream S3 object or local file with appropriate `Content-Type` and `Cache-Control` headers.

- [x] **Step 2: Ensure quota errors return 413 Payload Too Large / 400 Bad Request**
Catch `Storage limit reached` in upload endpoint and return `res.status(413).json({ success: false, error: err.message })`.

- [x] **Step 3: Run existing server test suite**
Run: `npm run test:server`
Expected: All existing server tests PASS.

---

### Task 4: End-to-End Build & Verification

**Files:**
- None (verification)

- [x] **Step 1: Run typecheck**
Run: `npm run typecheck`
Expected: PASS with 0 errors.

- [x] **Step 2: Build server and client**
Run: `npm run build:server`
Run: `npm run build:client`
Expected: Both build cleanly.

- [x] **Step 3: Run full test suite**
Run: `npm test`
Expected: PASS.
