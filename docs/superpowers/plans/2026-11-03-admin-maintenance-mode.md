# Dynamic Maintenance Mode & Admin Dashboard Management Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform the static "Coming Soon" page lock system into a dynamic, backend-persisted "Maintenance Mode" with custom messages and per-page toggles directly controllable via the Admin Dashboard.

**Architecture:** Extend `PlatformConfig` in MongoDB with a `maintenance` subdocument (global switch, customizable title, message, estimated completion, and per-page toggle map). Expose a public cache-friendly endpoint (`/api/platform/maintenance`) and a protected admin endpoint (`PATCH /api/admin/maintenance`). Create a React `MaintenanceContext` that pulls live config, checks route maintenance, displays an updated Neo-Brutalist `MaintenanceModal` (with wrench/maintenance branding and home redirection), gives administrators non-intrusive bypass with a preview indicator, and provides a full-featured "Maintenance & Page Locks" management console in `AdminDashboardPage.tsx`.

**Tech Stack:** React 19, TypeScript, React Router 7, Tailwind CSS (Neo-Brutalist), Node.js / Express, Mongoose, Vitest.

---

## Global Constraints

- **Design Tokens:** Background `#FAF7F2` / `#FAF7F0`, Surface `#FFFFFF`, Accent `#FFD21A` / `#FACC15` / `#FB923C`, Border `2px border-black` with hard drop shadows `shadow-[4px_4px_0px_#000]`.
- **Admin Access:** Administrators (`user.role === 'admin'`) must never be hard-locked out of pages so they can verify and maintain the site. Admins see an informative floating banner with an edit shortcut.
- **Zero Disruption:** Public unauthenticated visitors must receive maintenance statuses instantly without authentication errors.
- **No Paid Dependencies:** Completely self-contained within existing MongoDB and Express architecture.

---

## File Structure

```
server/
  src/
    models/
      PlatformConfig.ts          (extend with IMaintenanceConfig schema)
    controllers/
      platformController.ts      (add getMaintenanceConfig handler)
      adminController.ts         (add updateMaintenanceConfig handler)
    routes/
      platformRoutes.ts          (add GET /maintenance)
      adminRoutes.ts             (add PATCH /maintenance)
  tests/
    maintenance.test.ts          (new comprehensive backend test suite)

client/
  src/
    config/
      pageLocks.ts               (refactor into typed maintenance constants & route matcher)
    components/
      common/
        LockedPageModal.tsx      (refactor into MaintenanceModal with maintenance styling & title/desc props)
      layout/
        AppLayout.tsx            (integrate MaintenanceContext & admin bypass indicator)
    context/
      MaintenanceContext.tsx     (live state provider, API sync, route matcher, update helper)
    pages/
      AdminDashboardPage.tsx     (add dedicated 'Maintenance & Page Locks' tab with live preview & toggles)
      DesignEditorPage.tsx       (connect to dynamic maintenance status)
    services/
      platformApi.ts             (add getMaintenance)
      adminDonationApi.ts        (add updateMaintenance)
    test/
      page_locks.test.tsx        (update tests for maintenance mode & admin dashboard control)
```

---

## Task Breakdown

### Task 1: Backend Database Model & Endpoints for Maintenance Mode

**Files:**

- Modify: `server/src/models/PlatformConfig.ts`
- Modify: `server/src/controllers/platformController.ts`
- Modify: `server/src/controllers/adminController.ts`
- Modify: `server/src/routes/platformRoutes.ts`
- Modify: `server/src/routes/adminRoutes.ts`
- Create: `server/tests/maintenance.test.ts`

- [ ] **Step 1.1**: Define `IMaintenanceConfig` in `server/src/models/PlatformConfig.ts`:
  - `global`: boolean (default `false`)
  - `title`: string (default `'Scheduled Maintenance'`)
  - `message`: string (default `'This section is currently undergoing maintenance and improvements. Please check back shortly.'`)
  - `estimatedReturn`: string (default `''`)
  - `pages`: Record of route keys (`HOME`, `TOOLS`, `STUDIO`, `LEARNING`, `STUDY_SPACE`, `COMMUNITY`, `REVIEWS`, `DASHBOARD`, `ABOUT`, `PRIVACY`, `TERMS`, `LICENSES`, `CONTRIBUTING`) defaulting to `false`.
- [ ] **Step 1.2**: Implement `PlatformController.getMaintenanceConfig` in `platformController.ts` returning public maintenance config.
- [ ] **Step 1.3**: Implement `AdminController.updateMaintenanceConfig` with Zod validation in `adminController.ts`.
- [ ] **Step 1.4**: Wire routes:
  - `GET /api/platform/maintenance` in `server/src/routes/platformRoutes.ts`.
  - `PATCH /api/admin/maintenance` (protected by `authenticate, requireAdmin`) in `server/src/routes/adminRoutes.ts`.
- [ ] **Step 1.5**: Write and run automated tests in `server/tests/maintenance.test.ts` verifying:
  - Public access to maintenance status.
  - Non-admin blocked from updating maintenance settings (403).
  - Admin successfully toggles global maintenance, per-page switches, title, and message.

---

### Task 2: Client API Services & Context Provider

**Files:**

- Modify: `client/src/services/platformApi.ts`
- Modify: `client/src/services/adminDonationApi.ts`
- Modify: `client/src/config/pageLocks.ts`
- Create: `client/src/context/MaintenanceContext.tsx`
- Modify: `client/src/App.tsx`

- [ ] **Step 2.1**: Add `platformApi.getMaintenance()` in `client/src/services/platformApi.ts`.
- [ ] **Step 2.2**: Add `adminDonationApi.updateMaintenance(data)` in `client/src/services/adminDonationApi.ts`.
- [ ] **Step 2.3**: In `client/src/config/pageLocks.ts`:
  - Export standard `PAGE_LABELS` and `PAGE_KEYS` with metadata (title, route prefix, default accent color).
  - Update `getRouteLockStatus` to accept live maintenance config or fallback to defaults.
- [ ] **Step 2.4**: Create `client/src/context/MaintenanceContext.tsx`:
  - Fetches maintenance config on boot.
  - Exposes `maintenance`, `isLoading`, `isPageUnderMaintenance(pathname)`, `refresh()`, and `saveMaintenanceConfig()`.
- [ ] **Step 2.5**: Mount `MaintenanceProvider` in `client/src/App.tsx`.

---

### Task 3: Neo-Brutalist Maintenance Modal & Admin Bypass Banner

**Files:**

- Modify: `client/src/components/common/LockedPageModal.tsx`
- Modify: `client/src/components/layout/AppLayout.tsx`
- Modify: `client/src/pages/DesignEditorPage.tsx`

- [ ] **Step 3.1**: Refactor `LockedPageModal.tsx`:
  - Rename or adapt component to display clean maintenance styling.
  - Icon: Wrench / Construction tool badge with Neo-Brutalist border and hard drop shadow.
  - Dynamic `title` (defaults to "Scheduled Maintenance"), `description`, and optional `estimatedReturn`.
  - Action buttons: "Back to Home" primary button.
- [ ] **Step 3.2**: In `AppLayout.tsx`:
  - Consume `useMaintenance()`.
  - If page is under maintenance:
    - If `user?.role === 'admin'`: Render a fixed top pill banner (_"⚠️ Admin Preview: This page is currently set to Maintenance for regular visitors. [Admin Settings]"_) and allow admin to view/edit the page normally.
    - If regular user / guest: Render the `MaintenanceModal` blocking page interaction.
- [ ] **Step 3.3**: In `DesignEditorPage.tsx`:
  - Check `isPageUnderMaintenance('/studio')` instead of hardcoded static config, respecting admin bypass.

---

### Task 4: Admin Dashboard "Maintenance & Page Locks" Management Tab

**Files:**

- Modify: `client/src/pages/AdminDashboardPage.tsx`

- [ ] **Step 4.1**: Add `'maintenance'` to `AdminTab` with `Wrench` icon in the navigation bar.
- [ ] **Step 4.2**: Build the Maintenance Management UI:
  - **Global Master Switch**: Prominent alert card with toggle to take the entire website down for maintenance with 1 click.
  - **Notice Customization Form**:
    - Maintenance Header Title (e.g. _"Scheduled Maintenance"_ or _"System Upgrade in Progress"_).
    - Custom Message Textarea (e.g. _"We are updating our AI tools and will be back in 30 minutes."_).
    - Estimated Return Time input (optional, e.g. _"10:30 PM EST"_).
  - **Per-Page Interactive Toggles**:
    - Visual grid of all core workspaces with status badges (Online vs Under Maintenance):
      - 🏠 Homepage (`/`)
      - 🛠️ All Tools & Workspaces (`/tools`, `/category/*`, `/ai-tools/*`)
      - 🎨 Design Studio (`/studio`)
      - 📚 Learning Hub (`/learning`)
      - 🎓 Study Space (`/study`)
      - 💖 Community & Donations (`/community`)
      - ⭐ Ratings & Reviews (`/reviews`)
      - 👤 User Dashboard (`/dashboard`)
      - 📄 Legal & Info (`/about`, `/privacy`, `/terms`, `/licenses`, `/contributing`)
  - **Live Preview Card**: Real-time interactive preview of the exact modal visitors will see.
  - **Action Controls**: "Save Maintenance Changes" button with instant feedback toast.

---

### Task 5: Testing & Verification

**Files:**

- Modify: `client/src/test/page_locks.test.tsx`
- Run: `server/tests/maintenance.test.ts`

- [ ] **Step 5.1**: Run backend tests `npx vitest run server/tests/maintenance.test.ts`.
- [ ] **Step 5.2**: Update and run frontend tests `npx vitest run client/src/test/page_locks.test.tsx`.
- [ ] **Step 5.3**: Run full test suites `npx vitest run` across both client and server.
- [ ] **Step 5.4**: Run `npm run build` (`tsc -b && vite build client`) to guarantee 0 build or TypeScript errors.
