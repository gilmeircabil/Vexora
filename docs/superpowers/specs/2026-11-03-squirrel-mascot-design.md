# Squirrel Mascot with Acorn Design Specification

**Date:** 2026-11-03  
**Status:** Pending User Approval  
**Scope:** Small Feature (Animated Squirrel Mascot & Widget)

---

## 1. Intent & Purpose
Integrate an engaging, animated mascot into Vexora featuring a cream-colored squirrel with tufted ear tips holding an acorn. The mascot types on a laptop and dynamically responds to user interaction, site activity, and tool/AI processing with three distinct expressive animation states inspired by retro pixel art.

---

## 2. Character & Animation States

### Character Appearance
- **Creature:** Cream/off-white squirrel with tufted ear tips, dark dot eyes, cute nose/mouth, and a fluffy curved tail.
- **Accompanying Item:** Glossy acorn with a dark cap and stem resting beside or held by the squirrel.
- **Workstation:** Pixel-art style laptop with glowing keyboard and screen.

### Animation States
1. **Calm / Idle (`idle`):**
   - Gentle breathing / tail sway.
   - Occasional eye blink and relaxed key taps on the laptop.
   - Acorn sits happily next to the laptop.
2. **Focus / Furious Typing (`crunch`):**
   - Determined / intense facial expression.
   - Rapid paw movement typing on the keyboard.
   - Warm red glow emitting from the screen/keys.
3. **Success / Celebration (`celebrate`):**
   - Joyful victory expression and upward bounce.
   - Star/sparkle twinkle particles around the mascot and acorn.
   - Triggered on tool/AI task completion or when clicking the mascot.

---

## 3. Goals, Non-Goals & Anti-Goals

### Goals
- **Full Integration (Option D):**
  - **Hero Placement:** Welcome banner in `HomePage.tsx` hero section next to the search bar.
  - **Floating Corner Widget:** A persistent, non-intrusive floating companion docked at the bottom-right of pages (`App.tsx`).
- **Interactive Triggers:**
  - Clicking the mascot cycles its state and plays a sparkle animation.
  - Automatically enters `crunch` mode when forms/tools run or when users type in search/AI prompt inputs.
  - Enters `celebrate` mode upon successful tool output or AI response generation.
- **Compact & Collapsible:** Widget can be minimized to a small acorn badge if the user wants an uncluttered view.
- **Zero Heavy Dependencies:** SVG + CSS keyframes for crisp rendering on retina displays, fast load time (< 20 KB), and zero external video/image downloads.

### Non-Goals
- Complex speech-to-text or voice synthesis.
- Blocking modals or intrusive popups.

### Anti-Goals
- Never obscure crucial navigation, buttons, or form controls (collapsible and positioned safely above mobile footers).
- Never degrade website performance or cause CPU spikes (pure CSS GPU-accelerated transforms).

---

## 4. Approaches Considered

1. **Approach 1: Pixel-Style SVG & CSS Keyframe Engine (Selected)**
   - *Pros:* Ultra-lightweight (< 15 KB), sharp at any resolution, zero asset load latency, instant mood transitions, fully themeable.
   - *Cons:* Requires precise SVG vector geometry.
   - *Decision:* Selected as the best approach for high performance and responsiveness.

2. **Approach 2: Retro Canvas Sprite Sheet**
   - *Pros:* Mimics 16-bit game engines frame by frame.
   - *Cons:* Fixed pixel resolution, requires asset preloading and canvas draw loops.

3. **Approach 3: Pre-rendered Transparent Video / WebP Loops**
   - *Pros:* Direct video playback.
   - *Cons:* Larger file size (~500 KB+), micro-stutters when switching clips, harder to make reactively interactive.

---

## 5. Technical Architecture

### Component Hierarchy
- `client/src/components/mascot/SquirrelMascot.tsx`:
  - Standalone SVG renderer taking props: `state: 'idle' | 'crunch' | 'celebrate'`, `size?: number`, `onClick?: () => void`.
  - Self-contained CSS keyframes for tail wag, typing paws, screen glow, and sparkles.
- `client/src/components/mascot/FloatingMascotWidget.tsx`:
  - Fixed-position bottom-right floating widget.
  - Includes minimize/expand button (toggles between full mascot and mini acorn badge).
  - Speech bubble tooltip for friendly tips or Easter egg reactions.
- `client/src/context/MascotContext.tsx`:
  - Lightweight React context allowing any tool (AI Chat, Background Remover, OCR, etc.) to trigger mascot moods (`setMascotMood('crunch')`, `setMascotMood('celebrate')`).

### Integration Points
- `client/src/pages/HomePage.tsx`: Hero section mascot display.
- `client/src/App.tsx`: Global `<FloatingMascotWidget />` wrapper inside layout.

### Verification Plan
- Unit test `SquirrelMascot.test.tsx` verifying:
  - Renders all three states (`idle`, `crunch`, `celebrate`) without errors.
  - Triggers click callback.
  - Minimize and expand toggle functionality in `FloatingMascotWidget.test.tsx`.
- Typecheck (`npm run typecheck`) and build verification (`npm run build:client`).

---

## 6. Rollback Plan
All mascot files are isolated inside `client/src/components/mascot/` and `client/src/context/MascotContext.tsx`. Reverting involves simply removing the widget tag from `App.tsx` and hero tag from `HomePage.tsx`.
