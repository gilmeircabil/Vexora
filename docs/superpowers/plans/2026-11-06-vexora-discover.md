# Vexora Discover Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build "Vexora Discover" into VexoraMods—a modern location-based business and service discovery platform inspired by FastFinder, featuring business search, category filtering, interactive Leaflet/OSM mapping with dual-pane sync, browser geolocation + manual location fallback, Google Maps directions, community business submission with admin approval workflows, ratings/reviews, and full admin dashboard moderation.

**Architecture:** 
1. **Backend**: Express 5 + Mongoose models (`Business`, `BusinessCategory`, `BusinessReview`, `BusinessReport`) with 2dsphere indexing and Haversine distance calculations, a modular `SearchProvider` abstraction supporting internal database listings and geocoding cache, authentication checks for business ownership, and admin moderation APIs.
2. **Frontend**: React 19 + React Router 7 + Tailwind CSS v4 in Vexora's neo-brutalist design system (`border-2 border-black`, `shadow-[3px_3px_0px_#000000]`). Includes `/discover` page with dual-pane desktop view (responsive list + sticky map) and mobile list/map view switcher, custom Leaflet map markers, location picker modal, business submission modal, and an admin management suite in `AdminDashboardPage.tsx`.

**Tech Stack:** React 19, React Router 7, TypeScript, Tailwind CSS v4, Lucide React, Express 5, Mongoose, Vitest, React Testing Library.

**Spec:** User request for Vexora Discover.

## Global Constraints

- Preserve all existing VexoraMods authentication, tools, routes, and database records without regressions.
- Comply with Neo-Brutalist design language: `#FAF7F2` canvas, `border-2 border-black`, sharp shadow offsets, vibrant accent badges (`#FACC15`, `#38BDF8`, `#A78BFA`, `#A3E635`, `#F472B6`).
- Zero required paid APIs: interactive mapping powered by Leaflet and OpenStreetMap tiles; geocoding provider cached to prevent abuse and rate limits.
- Geolocation privacy: browser geolocation is strictly opt-in; manual location search is always available and user coordinates are never permanently logged.
- Must pass `npm run typecheck`, `npm run build`, and `npm test`.

## Review Focus

1. Geolocation Permission Rejection: When a user denies browser geolocation, the app gracefully falls back to default/manual location without crashing or re-prompting loops.
2. Distance Accuracy & Sorting: Haversine distance calculation produces accurate kilometer distances and sorts nearest-first by default.
3. Interactive Map & List Synchronization: Clicking a marker scrolls to and highlights the card; clicking a card centers and opens the map popup.
4. Submission Moderation Gate: Newly submitted businesses remain in `pending` status and are strictly invisible to public discovery until approved by an administrator.
5. Authorization Enforcement: Users can only update/manage businesses they own; only administrators can approve/reject/delete listings and moderate reviews.

---

### Task 1: Navigation Link & Core Discover Route Scaffolding

**Files:**
- Create: `client/src/pages/discover/DiscoverPage.tsx`
- Modify: `client/src/App.tsx:144-230`
- Modify: `client/src/components/layout/Header.tsx:1-150`
- Test: `client/src/test/discover_navigation.test.tsx`

- [ ] **Step 1: Write failing navigation test**
      Create `client/src/test/discover_navigation.test.tsx` asserting that `/discover` renders the Discover page and Header contains the Discover navigation link with active state.
- [ ] **Step 2: Run test to verify failure**
      Run `npx vitest run client/src/test/discover_navigation.test.tsx`
- [ ] **Step 3: Implement route and header link**
      Add `Discover` with `Compass` icon to `Header.tsx`, add `/discover` route in `App.tsx`, and create initial `DiscoverPage.tsx` container.
- [ ] **Step 4: Verify test passes**
      Run `npx vitest run client/src/test/discover_navigation.test.tsx`
- [ ] **Step 5: Commit**

---

### Task 2: Backend Models, Categories, Seed Data & Provider Abstraction

**Files:**
- Create: `server/src/models/Business.ts`
- Create: `server/src/models/BusinessCategory.ts`
- Create: `server/src/models/BusinessReview.ts`
- Create: `server/src/models/BusinessReport.ts`
- Create: `server/src/services/discover/searchProvider.ts`
- Create: `server/src/services/discover/seedData.ts`
- Modify: `server/src/models/index.ts`
- Test: `server/tests/discover_models_and_provider.test.ts`

- [ ] **Step 1: Write failing unit test for models and search provider**
      Create `server/tests/discover_models_and_provider.test.ts` testing business creation, status defaults (`pending`), category seeding, Haversine distance filtering, and keyword search.
- [ ] **Step 2: Run test to verify failure**
      Run `npx vitest run server/tests/discover_models_and_provider.test.ts`
- [ ] **Step 3: Implement models, searchProvider and seed generator**
      Implement Mongoose models with validation, category defaults (Laundry, Dining, Pharmacy, Tech Repair, Groceries, Printing, Salon, Automotive), and `SearchProvider` with geo-distance calculation.
- [ ] **Step 4: Verify test passes**
      Run `npx vitest run server/tests/discover_models_and_provider.test.ts`
- [ ] **Step 5: Commit**

---

### Task 3: Backend API Endpoints & Geocoding Caching

**Files:**
- Create: `server/src/controllers/discoverController.ts`
- Create: `server/src/routes/discoverRoutes.ts`
- Modify: `server/src/routes/index.ts`
- Modify: `server/src/controllers/adminController.ts`
- Modify: `server/src/routes/adminRoutes.ts`
- Test: `server/tests/discover_api.test.ts`

- [ ] **Step 1: Write failing integration test for discover API**
      Test category retrieval, business search with keyword and radius, business submission, owner verification, review submission, and admin approval/rejection endpoints.
- [ ] **Step 2: Run test to verify failure**
      Run `npx vitest run server/tests/discover_api.test.ts`
- [ ] **Step 3: Implement controller and routes**
      Create `discoverController.ts` and `discoverRoutes.ts` with rate-limiting, input validation, and admin moderation endpoints in `adminController.ts`. Mount under `/api/discover` and `/api/admin/discover`.
- [ ] **Step 4: Verify test passes**
      Run `npx vitest run server/tests/discover_api.test.ts`
- [ ] **Step 5: Commit**

---

### Task 4: Frontend API Client & Location Detection / Manual Picker

**Files:**
- Create: `client/src/services/discoverApi.ts`
- Create: `client/src/features/discover/components/ManualLocationModal.tsx`
- Create: `client/src/features/discover/hooks/useUserLocation.ts`
- Test: `client/src/test/discover_location.test.tsx`

- [ ] **Step 1: Write failing test for location hook & manual modal**
      Test browser geolocation success, permission denial fallback, and manual location selection with coordinates and city name.
- [ ] **Step 2: Run test to verify failure**
      Run `npx vitest run client/src/test/discover_location.test.tsx`
- [ ] **Step 3: Implement `discoverApi.ts`, `useUserLocation.ts`, and `ManualLocationModal.tsx`**
      Implement robust location hook storing non-precise preference in sessionStorage/state, geocoding search support, and fallback presets.
- [ ] **Step 4: Verify test passes**
      Run `npx vitest run client/src/test/discover_location.test.tsx`
- [ ] **Step 5: Commit**

---

### Task 5: Interactive Map Component with Custom Neo-Brutalist Markers

**Files:**
- Create: `client/src/features/discover/components/InteractiveMap.tsx`
- Create: `client/src/features/discover/utils/mapUtils.ts`
- Test: `client/src/test/discover_map.test.tsx`

- [ ] **Step 1: Write failing test for map rendering and marker interaction**
      Test map container initialization, marker click events, active marker centering, and Google Maps directions link generation.
- [ ] **Step 2: Run test to verify failure**
      Run `npx vitest run client/src/test/discover_map.test.tsx`
- [ ] **Step 3: Implement `InteractiveMap.tsx`**
      Build interactive Leaflet-powered map with custom Neo-Brutalist HTML markers, popups with business quick-info, directions trigger, and graceful offline/loading fallback.
- [ ] **Step 4: Verify test passes**
      Run `npx vitest run client/src/test/discover_map.test.tsx`
- [ ] **Step 5: Commit**

---

### Task 6: Business Search, Category Chips & Filter Controls

**Files:**
- Create: `client/src/features/discover/components/DiscoverSearchHeader.tsx`
- Create: `client/src/features/discover/components/DiscoverFilterDrawer.tsx`
- Create: `client/src/features/discover/components/DiscoverBusinessCard.tsx`
- Test: `client/src/test/discover_search_filters.test.tsx`

- [ ] **Step 1: Write failing test for search bar, category chips, and filter changes**
      Test keyword input with autocomplete suggestions, category filtering, radius slider changes, and "Open Now" toggle.
- [ ] **Step 2: Run test to verify failure**
      Run `npx vitest run client/src/test/discover_search_filters.test.tsx`
- [ ] **Step 3: Implement search header, filters drawer, and business card**
      Build components with full keyboard accessibility, distance badge formatting, verified badges, rating stars, and Neo-Brutalist styling.
- [ ] **Step 4: Verify test passes**
      Run `npx vitest run client/src/test/discover_search_filters.test.tsx`
- [ ] **Step 5: Commit**

---

### Task 7: Business Detail Modal, Reviews & Rating Submissions

**Files:**
- Create: `client/src/features/discover/components/DiscoverBusinessModal.tsx`
- Create: `client/src/features/discover/components/BusinessReviewList.tsx`
- Create: `client/src/features/discover/components/WriteBusinessReviewModal.tsx`
- Test: `client/src/test/discover_reviews.test.tsx`

- [ ] **Step 1: Write failing test for business detail modal and review submission**
      Test displaying business details, hours schedule, review list, opening Google Maps directions, and submitting a review.
- [ ] **Step 2: Run test to verify failure**
      Run `npx vitest run client/src/test/discover_reviews.test.tsx`
- [ ] **Step 3: Implement modal and review components**
      Connect to `discoverApi.addReview` and `discoverApi.reportBusiness`, display operating hours with real-time "Open Now" calculation, and render photo galleries.
- [ ] **Step 4: Verify test passes**
      Run `npx vitest run client/src/test/discover_reviews.test.tsx`
- [ ] **Step 5: Commit**

---

### Task 8: Business Registration Modal & Owner Submission Flow

**Files:**
- Create: `client/src/features/discover/components/BusinessRegistrationModal.tsx`
- Test: `client/src/test/discover_registration.test.tsx`

- [ ] **Step 1: Write failing test for business submission**
      Test required fields validation (name, category, address, coordinates, hours, contact), pin-picking on map, and successful submission notice explaining admin approval.
- [ ] **Step 2: Run test to verify failure**
      Run `npx vitest run client/src/test/discover_registration.test.tsx`
- [ ] **Step 3: Implement `BusinessRegistrationModal.tsx`**
      Multi-step/structured submission modal with map coordinate selector, image URL / upload input, hours selector, and validation errors.
- [ ] **Step 4: Verify test passes**
      Run `npx vitest run client/src/test/discover_registration.test.tsx`
- [ ] **Step 5: Commit**

---

### Task 9: Admin Management Section for Vexora Discover

**Files:**
- Modify: `client/src/pages/AdminDashboardPage.tsx`
- Create: `client/src/features/discover/components/AdminDiscoverManagement.tsx`
- Test: `client/src/test/discover_admin.test.tsx`

- [ ] **Step 1: Write failing test for admin discover management**
      Test rendering pending submissions, approving/rejecting a submission, editing listing details, category management, and moderating reviews.
- [ ] **Step 2: Run test to verify failure**
      Run `npx vitest run client/src/test/discover_admin.test.tsx`
- [ ] **Step 3: Implement `AdminDiscoverManagement.tsx` and integrate into `AdminDashboardPage.tsx`**
      Add "Vexora Discover" tab with sub-views: Submissions Moderation, Listings Directory, Category Editor, and Reported Listings/Reviews.
- [ ] **Step 4: Verify test passes**
      Run `npx vitest run client/src/test/discover_admin.test.tsx`
- [ ] **Step 5: Commit**

---

### Task 10: Complete Page Integration, Responsive View Toggle & Regression Verification

**Files:**
- Modify: `client/src/pages/discover/DiscoverPage.tsx`
- Test: `client/src/test/discover_integration.test.tsx`

- [ ] **Step 1: Write comprehensive integration test**
      Test end-to-end user flow: searching, switching between list and map views on mobile, selecting a business, filtering by distance, and opening directions.
- [ ] **Step 2: Run test to verify**
      Run `npx vitest run client/src/test/discover_integration.test.tsx`
- [ ] **Step 3: Refine `DiscoverPage.tsx` with loading/empty/error states and responsiveness**
- [ ] **Step 4: Full platform regression verification**
      Run `npm run typecheck`, `npm run build`, and `npm test` across all client and server test suites.
- [ ] **Step 5: Final Commit**
