# Study Space Workspace Separation & Full-Screen Layout Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Separate the Study Space into two independent, dedicated workspaces (Student Workspace and Teacher Workspace) and implement full-screen immersive layouts for both the Study Space and the AI Chat page, including a toggleable distraction-free full-screen mode.

**Architecture:**

1. **Workspace Separation:** Refactor `StudySpacePage.tsx` and `EducationDashboard.tsx` to support a dedicated top-level Workspace Switcher (`student` vs `teacher`). When in Student Workspace, only student-specific tools and metrics are presented in the sidebar and launchpad. When in Teacher Workspace, only teacher-specific tools and metrics are presented in the sidebar and launchpad. Active workspace state is synchronized with the URL query (`?workspace=student` or `?workspace=teacher`) and user role preferences.
2. **Full-Bleed Viewport Layout:** Update `AppLayout.tsx` so `/study` joins the AI Chat routes as a full-bleed viewport route (no `max-w-7xl` container box, `p-0`, and footer hidden), allowing Study Space to occupy `h-[calc(100vh-4rem)]` with a responsive collapsible sidebar and dedicated scrollable workspace canvas.
3. **Immersive Full-Screen / Focus Mode:** Implement a unified Fullscreen / Focus Mode toggle (`Maximize2` / `Minimize2`) in both `StudySpacePage.tsx` and `AiChatPage.tsx`. When activated, it triggers the HTML5 Fullscreen API (`requestFullscreen()`), hides the global top header (`h-screen`), and renders a quick floating exit control (or `Esc` key listener) for zero-distraction focus.

**Tech Stack:** React 19, TypeScript, React Router 7, Tailwind CSS (Neo-Brutalist), Lucide React, Vitest, Testing Library.

---

## Global Constraints

- **Design Tokens:** Background `#FAF7F2` / `#FAF7F0`, Surface `#FFFFFF`, Accent `#FFD21A` / `#FACC15`, Border `2px border-black` with hard drop shadows `shadow-[2px_2px_0px_#000]` or `shadow-[3px_3px_0px_#000]`.
- **Zero Regressions:** Existing student tools (10 tools) and teacher tools (7 tools) must remain 100% functional with all their client-side capabilities intact.
- **Privacy & Teacher Security:** Teacher workspace tools remain protected for educator/admin roles while allowing authorized one-click role switching for testing.
- **No Paid Dependencies:** Fully native React + DOM Fullscreen API.

---

## File Structure

```
client/
  src/
    components/
      layout/
        AppLayout.tsx                       (extend isFullBleedRoute to include /study; add focus mode / header hide support)
    features/
      education/
        shared/
          EducationDashboard.tsx             (add workspace-tailored metrics & quick launchpad for Teacher mode)
          StudySpaceHeader.tsx               (new component: top bar with Workspace Switcher + Fullscreen Toggle + Mobile Menu)
          useFullscreenMode.ts               (new reusable hook: fullscreen state, document.requestFullscreen, Esc listener)
    pages/
      education/
        StudySpacePage.tsx                   (separate student/teacher workspaces; integrate collapsible sidebar & full-bleed layout)
      ai/
        AiChatPage.tsx                       (add Fullscreen / Focus Mode toggle and expanded 100vh focus view)
    test/
      education_suite.test.tsx               (update & expand tests for workspace separation & fullscreen toggle)
      document_quiz_generator.test.tsx       (ensure document quiz integration passes in separated student workspace)
      ai_tools.test.tsx                      (verify AI chat fullscreen toggle button & functionality)
```

---

## Review Focus

1. **Workspace State Preservation:** Switching between Student and Teacher workspaces should remember the active tab in each workspace rather than wiping user input.
2. **Esc Key Behavior in Fullscreen:** Pressing `Esc` natively exits browser fullscreen, and our state listener (`fullscreenchange`) must synchronize immediately so UI controls never show "Exit Fullscreen" when already exited.
3. **Mobile Drawer Responsiveness:** Collapsible sidebars in full-bleed mode must open as smooth slide-over drawers on mobile screens without horizontal scroll leaks.
4. **Teacher Role Gating:** When an unauthorized student user views the Teacher Workspace, they see an informative authorization gate banner with an "Enable Teacher Mode" activation button, keeping student data private.
5. **Existing Routes & Deep Linking:** Direct links to Study Space (`/study`, `/study?workspace=teacher`, `/study?workspace=student&tab=flashcards`) should deep-link directly into the requested workspace and tool.

---

## Task 1: Reusable Full-Screen / Focus Mode Hook & AppLayout Integration

**Files:**

- Create: `client/src/features/education/shared/useFullscreenMode.ts`
- Modify: `client/src/components/layout/AppLayout.tsx`
- Test: `client/src/test/components.test.tsx`

**Interfaces:**

- Produces: `useFullscreenMode(): { isFullscreen: boolean; toggleFullscreen: () => void; exitFullscreen: () => void; isSupported: boolean }`
- Consumes in `AppLayout.tsx`: Detect full-bleed routes (`isAiChatRoute` or `isStudySpaceRoute`), conditionally hide Header when in app focus mode, and hide Footer.

- [ ] **Step 1: Write test for `useFullscreenMode` hook behavior**

```tsx
// in client/src/test/components.test.tsx
it('toggles fullscreen state and handles fullscreenchange event', () => {
  // test toggleFullscreen invokes requestFullscreen / exitFullscreen and updates state
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test client/src/test/components.test.tsx`
Expected: FAIL (hook does not exist yet)

- [ ] **Step 3: Implement `useFullscreenMode.ts`**

Implement `useFullscreenMode` with:

- Check for `document.fullscreenEnabled`
- Listener for `fullscreenchange` event to update `isFullscreen` boolean
- `toggleFullscreen` that calls `document.documentElement.requestFullscreen()` or `document.exitFullscreen()` with try/catch fallbacks
- Custom event dispatcher (`vexora-focus-mode-change`) so `AppLayout` can hide the top `<Header />` during distraction-free mode if requested.

- [ ] **Step 4: Update `AppLayout.tsx` for full-bleed Study Space layout**

Update `AppLayout.tsx`:

- Update `isAiChatRoute` to `isFullBleedRoute = isAiChatRoute || location.pathname.startsWith('/study') || location.pathname.startsWith('/study-space')`
- When `isFullBleedRoute`, render `<main>` with `className="flex-1 w-full p-0 relative z-10 focus:outline-none flex flex-col min-h-0"` and omit `<Footer />`.
- Add listener for distraction-free focus mode to hide `<Header />` when full-screen focus is engaged.

- [ ] **Step 5: Run tests to verify they pass**

Run: `npm test client/src/test/components.test.tsx`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add client/src/features/education/shared/useFullscreenMode.ts client/src/components/layout/AppLayout.tsx client/src/test/components.test.tsx
git commit -m "feat: add useFullscreenMode hook and enable full-bleed layout for study space in AppLayout"
```

---

## Task 2: Study Space Header with Workspace Switcher & Full-Screen Toggle

**Files:**

- Create: `client/src/features/education/shared/StudySpaceHeader.tsx`
- Modify: `client/src/features/education/shared/EducationDashboard.tsx`
- Test: `client/src/test/education_suite.test.tsx`

**Interfaces:**

- Produces: `StudySpaceHeader` component props:
  ```ts
  interface StudySpaceHeaderProps {
    workspace: 'student' | 'teacher';
    onWorkspaceChange: (ws: 'student' | 'teacher') => void;
    activeTab: string;
    isSidebarCollapsed: boolean;
    onToggleSidebar: () => void;
    onToggleMobileNav: () => void;
    isFullscreen: boolean;
    onToggleFullscreen: () => void;
  }
  ```
- Consumes: `GraduationCap`, `School`, `Maximize2`, `Minimize2`, `PanelLeftClose`, `PanelLeftOpen`, `Menu` from `lucide-react`.

- [ ] **Step 1: Write tests for `StudySpaceHeader` and workspace switching**

```tsx
// in client/src/test/education_suite.test.tsx
it('renders workspace switcher with Student and Teacher options and triggers onWorkspaceChange', () => {
  // verify student button and teacher button are rendered
  // verify clicking triggers workspace change
  // verify fullscreen toggle button is rendered
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test client/src/test/education_suite.test.tsx`
Expected: FAIL (component not found)

- [ ] **Step 3: Implement `StudySpaceHeader.tsx`**

- Render Neo-brutalist top bar with:
  - Left: Sidebar collapse button (`PanelLeftClose` / `PanelLeftOpen`), Study Space title badge with `GraduationCap`.
  - Center: Segmented Workspace Switcher:
    - Button: `🎓 Student Workspace` (Highlighted `#FFD21A` when `workspace === 'student'`)
    - Button: `👨‍🏫 Teacher Workspace` (Highlighted `#FFD21A` when `workspace === 'teacher'`)
  - Right:
    - Breadcrumb indicator showing active module.
    - Fullscreen Toggle button with `Maximize2` / `Minimize2` and tooltip `Full Screen (Focus Mode)`.
    - Mobile Menu button for opening sidebar drawer on mobile.

- [ ] **Step 4: Enhance `EducationDashboard.tsx` with Teacher Launchpad**

- Add Teacher-specific KPI tiles when in Teacher Workspace (Lesson Plans count, Worksheet count, Active Exams, Attendance sessions).
- Add Teacher Quick Launchpad grid linking directly to Lesson Plans, Worksheets, Exam Builder, Gradebook, Attendance, Rubrics, and Certificate Generator.

- [ ] **Step 5: Run tests to verify they pass**

Run: `npm test client/src/test/education_suite.test.tsx`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add client/src/features/education/shared/StudySpaceHeader.tsx client/src/features/education/shared/EducationDashboard.tsx client/src/test/education_suite.test.tsx
git commit -m "feat: add StudySpaceHeader with workspace switcher and full-screen toggle"
```

---

## Task 3: StudySpacePage Workspace Separation & Full-Bleed Viewport Layout

**Files:**

- Modify: `client/src/pages/education/StudySpacePage.tsx`
- Test: `client/src/test/education_suite.test.tsx`
- Test: `client/src/test/document_quiz_generator.test.tsx`

**Interfaces:**

- Produces: Complete separated workspaces on `/study`:
  - `workspace = 'student'`: Only Student navigation tabs (Dashboard, Study Planner, Flashcards, Quizzes, Doc-to-Quiz, GPA Calc, Smart Notes, Pomodoro, Citations, Timetable, Goals, Data Backup).
  - `workspace = 'teacher'`: Only Teacher navigation tabs (Dashboard, Lesson Plans, Worksheets, Exam Builder, Attendance, Gradebook, Rubrics, Certificates, Data Backup).
  - Responsive full-bleed layout: `h-[calc(100vh-4rem)]` or `h-screen` when in fullscreen mode, sticky collapsible sidebar, smooth scrollable content area.

- [ ] **Step 1: Write integration tests for separated workspaces and full-screen navigation**

```tsx
// in client/src/test/education_suite.test.tsx
it('displays only student tools when Student Workspace is selected', () => {
  // verify Study Planner, Flashcard Maker, Practice Tests exist
  // verify Lesson Plan Creator and Gradebook Ledger DO NOT exist in student sidebar
});

it('displays only teacher tools when Teacher Workspace is selected', () => {
  // switch to teacher workspace
  // verify Lesson Plan Creator, Rubric Builder, Certificate Generator exist
  // verify Study Planner does not exist in teacher sidebar
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test client/src/test/education_suite.test.tsx`
Expected: FAIL (teacher tools currently still in student sidebar)

- [ ] **Step 3: Refactor `StudySpacePage.tsx`**

- Parse `workspace` from query params (`useSearchParams`) or local state with sync.
- Separate sidebar navigation items into `STUDENT_NAV_ITEMS` and `TEACHER_NAV_ITEMS`.
- When in Student Workspace: render only `STUDENT_NAV_ITEMS` + Dashboard + Backup.
- When in Teacher Workspace: render only `TEACHER_NAV_ITEMS` + Dashboard + Backup. If the user does not have teacher role, show the authorization gate card cleanly in the workspace content area or sidebar header with the "Enable Teacher Mode" button.
- Integrate `useFullscreenMode`:
  - Pass `isFullscreen` and `toggleFullscreen` to `StudySpaceHeader`.
  - When in fullscreen, add floating exit button or status pill.
- Replace boxed grid container with full-viewport flex layout:
  - Outer: `w-full h-[calc(100vh-4rem)] flex flex-col overflow-hidden select-text bg-[#FAF7F2]` (or `h-screen` when in fullscreen).
  - Top: `<StudySpaceHeader />`
  - Body: Flex row containing:
    - Left: Collapsible Neo-brutalist sidebar (`w-64`, collapsible to `w-0` or icons, mobile overlay drawer).
    - Right: `flex-1 overflow-y-auto p-4 sm:p-6 min-w-0 bg-[#FAF7F2]`.

- [ ] **Step 4: Run tests to verify all tests pass**

Run: `npm test client/src/test/education_suite.test.tsx client/src/test/document_quiz_generator.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add client/src/pages/education/StudySpacePage.tsx client/src/test/education_suite.test.tsx client/src/test/document_quiz_generator.test.tsx
git commit -m "feat: separate student and teacher workspaces and implement full-screen layout in Study Space"
```

---

## Task 4: AI Chat Page Full-Screen / Focus Mode Enhancement

**Files:**

- Modify: `client/src/pages/ai/AiChatPage.tsx`
- Test: `client/src/test/ai_tools.test.tsx`

**Interfaces:**

- Produces: Interactive Fullscreen / Focus Mode in `AiChatPage`:
  - Fullscreen button with `Maximize2` / `Minimize2` in top action bar of AI Chat.
  - Expand AI Chat from `h-[calc(100vh-4rem)]` to `h-screen` when fullscreen / distraction-free mode is toggled.
  - Floating exit button and `Esc` shortcut handler.

- [ ] **Step 1: Write test for AI Chat full-screen toggle**

```tsx
// in client/src/test/ai_tools.test.tsx
it('renders full-screen focus mode toggle button in AiChatPage and toggles fullscreen state', () => {
  // render AiChatPage
  // verify button with title "Full Screen Focus Mode" or aria-label exists
  // fire click and verify state change
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test client/src/test/ai_tools.test.tsx`
Expected: FAIL (fullscreen button does not exist in AiChatPage yet)

- [ ] **Step 3: Update `AiChatPage.tsx`**

- Import `useFullscreenMode` hook and `Maximize2`, `Minimize2` from `lucide-react`.
- Add Fullscreen button to the AI Chat top bar (next to New Conversation or Clear Chat / Inspector buttons).
- When `isFullscreen` is active:
  - AI chat container switches to `h-screen fixed inset-0 z-50 bg-[#FAF7F2]`.
  - Display a sleek floating exit badge: `Exit Full Screen (Esc)` with `Minimize2` icon in the top right.
- Ensure chat stream, attachments, inspector panel, and prompts adapt smoothly to the full-screen canvas.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test client/src/test/ai_tools.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add client/src/pages/ai/AiChatPage.tsx client/src/test/ai_tools.test.tsx
git commit -m "feat: add full-screen focus mode toggle to AI Chat page"
```

---

## Task 5: Full Integration Verification & Platform Suite Test

**Files:**

- Verify: Full workspace separation on `/study`, full-bleed view, and AI Chat full-screen mode.
- Run: Complete vitest test suite across client and server.

- [ ] **Step 1: Run the full test suite**

Run: `npm test`
Expected: All 25+ test suites and 216+ tests PASS.

- [ ] **Step 2: Final visual and code audit**

Verify:

1. Student workspace has zero teacher tools polluting its sidebar.
2. Teacher workspace has clean teacher tools + dedicated launchpad.
3. Full-screen toggle works on both Study Space and AI Chat.
4. No layout breaks on mobile, tablet, or desktop viewports.
