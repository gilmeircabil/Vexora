# Squirrel Mascot with Acorn Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a lively, animated mascot for Vexora featuring a cream-colored squirrel with tufted ear tips and an acorn, typing on a pixel laptop with three expressive states (`idle`, `crunch`, `celebrate`), integrated into the homepage hero and as a persistent floating corner widget.

**Architecture:** Create a pure SVG-and-CSS-animated `SquirrelMascot` component with GPU-accelerated keyframe animations. Wrap in a `MascotContext` providing global mood control across tools and AI pages. Implement `FloatingMascotWidget` for bottom-right corner presence and embed in `HomePage.tsx` hero.

**Tech Stack:** React 19, TypeScript, Tailwind CSS, Lucide React, Vitest, React Testing Library.

**Spec:** `docs/superpowers/specs/2026-11-03-squirrel-mascot-design.md`

## Global Constraints
- Node >= 20.19, React 19, TypeScript strict mode.
- Pure SVG + CSS keyframes for mascot animation: ultra-lightweight (< 20 KB total bundle footprint), zero external image/video downloads.
- Non-intrusive: Widget must be collapsible into a compact badge, responsive on mobile screens, and never obscure interactive page controls.
- Maintain documentation integrity and pass `npm run typecheck`, `npm run lint`, and `npm test`.

## Review Focus
1. State transitions: Mascot seamlessly transitions between `idle`, `crunch`, and `celebrate` without layout shifts or jerky animation restarts.
2. Responsiveness & z-index: Floating widget scales cleanly on mobile devices (`max-w-[80vw]`) and stays below modals/menus (`z-40`).
3. Memory cleanup: Timers for temporary states (e.g. `triggerCrunch(3000)`) must properly clear on unmount.
4. Collapsed state persistence: Widget minimize/expand preference persists in `localStorage` (`vexora_mascot_minimized`) so user preference is remembered across page navigations.
5. Accessibility & reduced motion: Respect `prefers-reduced-motion` media queries by toning down rapid animations.

---

### Task 1: Create `MascotContext` and Unit Tests

**Files:**
- Create: `client/src/context/MascotContext.tsx`
- Create: `client/src/test/mascot_context.test.tsx`

**Interfaces:**
- Produces:
  ```typescript
  export type MascotMood = 'idle' | 'crunch' | 'celebrate';
  export interface MascotContextType {
    mood: MascotMood;
    isMinimized: boolean;
    setMood: (mood: MascotMood) => void;
    setIsMinimized: (minimized: boolean) => void;
    triggerMood: (mood: MascotMood, durationMs?: number) => void;
  }
  export const MascotProvider: React.FC<{ children: React.ReactNode }>;
  export const useMascot: () => MascotContextType;
  ```

- [ ] **Step 1: Write the failing unit test**
  Create `client/src/test/mascot_context.test.tsx` testing default mood (`idle`), `setMood`, `triggerMood` with auto-revert timer, and `setIsMinimized` syncing with `localStorage`.

- [ ] **Step 2: Run test to verify it fails**
  Run: `npx vitest run client/src/test/mascot_context.test.tsx`
  Expected: FAIL with "Cannot find module"

- [ ] **Step 3: Implement `MascotContext.tsx`**
  Implement `MascotContext` with `useState`, `useEffect` for timer cleanup, and `localStorage` persistence for `vexora_mascot_minimized`.

- [ ] **Step 4: Run test to verify it passes**
  Run: `npx vitest run client/src/test/mascot_context.test.tsx`
  Expected: PASS

- [ ] **Step 5: Commit**
  ```bash
  git add client/src/context/MascotContext.tsx client/src/test/mascot_context.test.tsx
  git commit -m "feat(mascot): add MascotContext with mood and minimize state"
  ```

---

### Task 2: Create `SquirrelMascot` Component (SVG & CSS Animations)

**Files:**
- Create: `client/src/components/mascot/SquirrelMascot.tsx`
- Create: `client/src/test/squirrel_mascot.test.tsx`

**Interfaces:**
- Produces:
  ```typescript
  export interface SquirrelMascotProps {
    state?: 'idle' | 'crunch' | 'celebrate';
    size?: number | string;
    className?: string;
    onClick?: () => void;
  }
  export const SquirrelMascot: React.FC<SquirrelMascotProps>;
  ```

- [ ] **Step 1: Write the failing unit test**
  Create `client/src/test/squirrel_mascot.test.tsx` testing rendering in `idle`, `crunch`, and `celebrate` states, checking that appropriate CSS classes/data-state attributes are set, and checking `onClick` callback.

- [ ] **Step 2: Run test to verify it fails**
  Run: `npx vitest run client/src/test/squirrel_mascot.test.tsx`
  Expected: FAIL with "Cannot find module"

- [ ] **Step 3: Implement `SquirrelMascot.tsx`**
  Implement vector SVG drawing:
  - Cream/beige squirrel body (`#f5ede0`), rounded muzzle, tufted ear tips (`#3b2f2f`), glossy black dot eyes, nose.
  - Fluffy curved tail with gentle sway keyframe.
  - Pixel-art laptop with keyboard and glowing display.
  - Acorn with deep brown body (`#6d4327`) and textured dark cap (`#3d2314`) resting beside laptop.
  - Paws typing animation (calm in `idle`, fast in `crunch`).
  - Red glow filter/rect over laptop in `crunch` state.
  - Sparkle star bursts in `celebrate` state.

- [ ] **Step 4: Run test to verify it passes**
  Run: `npx vitest run client/src/test/squirrel_mascot.test.tsx`
  Expected: PASS

- [ ] **Step 5: Commit**
  ```bash
  git add client/src/components/mascot/SquirrelMascot.tsx client/src/test/squirrel_mascot.test.tsx
  git commit -m "feat(mascot): add animated SVG SquirrelMascot component"
  ```

---

### Task 3: Create `FloatingMascotWidget` Component

**Files:**
- Create: `client/src/components/mascot/FloatingMascotWidget.tsx`
- Create: `client/src/test/floating_mascot_widget.test.tsx`

**Interfaces:**
- Consumes: `useMascot` from `client/src/context/MascotContext.tsx`, `SquirrelMascot` from `client/src/components/mascot/SquirrelMascot.tsx`
- Produces:
  ```typescript
  export const FloatingMascotWidget: React.FC;
  ```

- [ ] **Step 1: Write the failing unit test**
  Create `client/src/test/floating_mascot_widget.test.tsx` testing widget expansion, minimize toggle button, speech bubble tips on click, and celebrate trigger on clicking mascot.

- [ ] **Step 2: Run test to verify it fails**
  Run: `npx vitest run client/src/test/floating_mascot_widget.test.tsx`
  Expected: FAIL with "Cannot find module"

- [ ] **Step 3: Implement `FloatingMascotWidget.tsx`**
  Implement fixed bottom-right container:
  - When expanded: renders `SquirrelMascot` (120px), speech bubble with encouraging messages/tips (e.g., "Crunching code!", "Need a tool? Just ask!", "Acorn power! 🌰"), and a small minimize button (`_`).
  - When minimized: renders a compact floating pill/acorn icon with a badge that can be clicked to expand.
  - Clicking the mascot triggers `celebrate` mood and shows a playful quote.

- [ ] **Step 4: Run test to verify it passes**
  Run: `npx vitest run client/src/test/floating_mascot_widget.test.tsx`
  Expected: PASS

- [ ] **Step 5: Commit**
  ```bash
  git add client/src/components/mascot/FloatingMascotWidget.tsx client/src/test/floating_mascot_widget.test.tsx
  git commit -m "feat(mascot): add FloatingMascotWidget with speech bubble and minimize support"
  ```

---

### Task 4: Integrate into `HomePage.tsx` Hero and `App.tsx` Global Layout

**Files:**
- Modify: `client/src/App.tsx`
- Modify: `client/src/pages/HomePage.tsx`
- Modify: `client/src/test/mascot_integration.test.tsx`

- [ ] **Step 1: Write integration tests**
  Create `client/src/test/mascot_integration.test.tsx` testing:
  - `App` renders `FloatingMascotWidget`.
  - `HomePage` renders hero mascot companion.
  - Typing in the hero search bar triggers `crunch` mood.

- [ ] **Step 2: Run test to verify failure**
  Run: `npx vitest run client/src/test/mascot_integration.test.tsx`
  Expected: FAIL

- [ ] **Step 3: Update `App.tsx` and `HomePage.tsx`**
  - In `client/src/App.tsx`: Wrap routing tree with `<MascotProvider>` and place `<FloatingMascotWidget />` in layout.
  - In `client/src/pages/HomePage.tsx`: Place `<SquirrelMascot />` in the hero section alongside the search bar, with search input `onChange` triggering `crunch` mode.

- [ ] **Step 4: Run test to verify it passes**
  Run: `npx vitest run client/src/test/mascot_integration.test.tsx`
  Expected: PASS

- [ ] **Step 5: Commit**
  ```bash
  git add client/src/App.tsx client/src/pages/HomePage.tsx client/src/test/mascot_integration.test.tsx
  git commit -m "feat(mascot): integrate squirrel mascot into HomePage hero and App layout"
  ```

---

### Task 5: Full Project Verification & Code Formatting

**Files:**
- All touched files

- [ ] **Step 1: Run type checking**
  Run: `npm run typecheck` (`tsc -b --noEmit`) to verify 0 TypeScript errors.

- [ ] **Step 2: Run linter**
  Run: `npm run lint` to verify 0 ESLint errors.

- [ ] **Step 3: Run full test suite**
  Run: `npm test` to verify all test suites pass.

- [ ] **Step 4: Prettier formatting**
  Run: `npm run format` to ensure uniform code style.

- [ ] **Step 5: Final commit**
  ```bash
  git add -A
  git commit -m "chore(mascot): verify and format codebase"
  ```
