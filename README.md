# Block Blast! 💥 (WebAssembly / WAT Assembly Edition)

A high-performance, modern, and addictive **Block Blast!** puzzle game remade with **WebAssembly Text (WAT) Assembly Language**, HTML5, and CSS3.

All core gameplay mechanics, collision detection, piece generation with balanced PRNG, line blasting, combo multiplier streaks, and game over state machines run directly in **pure WebAssembly assembly**.

---

## ⚡ WebAssembly Architecture & Assembly Details

The core game logic is written in **WebAssembly Text Format ([`engine.wat`](file:///C:/Users/gilmi/OneDrive/Documents/Github/Vexora/engine.wat))** and compiled into a lean binary module ([`engine.wasm`](file:///C:/Users/gilmi/OneDrive/Documents/Github/Vexora/engine.wasm)).

### Linear Memory Map (64 KB / 1 Page)

| Memory Offset | Size | Purpose | Description |
|---|---|---|---|
| `0x0000 - 0x003F` | 64 bytes | **8×8 Board Grid** | Byte at `r * 8 + c`: `0` = empty, `1..8` = block color ID |
| `0x0080` (128) | 4 bytes (i32) | **Current Score** | Total points accumulated |
| `0x0084` (132) | 4 bytes (i32) | **High Score** | All-time best score |
| `0x0088` (136) | 4 bytes (i32) | **Combo Multiplier** | Consecutive line blast streak counter |
| `0x008C` (140) | 4 bytes (i32) | **Game Over Flag** | `0` = playing, `1` = no playable moves remain |
| `0x0090` (144) | 4 bytes (i32) | **Last Score Delta** | Points gained on the most recent move |
| `0x0094` (148) | 4 bytes (i32) | **Last Lines Cleared** | Number of rows & columns blasted on last move |
| `0x0098` (152) | 4 bytes (i32) | **Cleared Rows Mask** | Bitmask of rows 0..7 marked for blast animation |
| `0x009C` (156) | 4 bytes (i32) | **Cleared Cols Mask** | Bitmask of cols 0..7 marked for blast animation |
| `0x00A0` (160) | 4 bytes (i32) | **PRNG State** | 32-bit state for in-assembly Xorshift PRNG |
| `0x0100 - 0x01BF` | 192 bytes | **Dock Slots (0..2)** | 64 bytes per slot (active flag, shape ID, color ID, dimensions, 5×5 bitmatrix) |
| `0x0400 - 0x087F` | 1152 bytes | **Shape Table ROM** | Pre-computed table of 36 distinct tetromino & polyomino shapes |

### Assembly Subroutines in `engine.wat`

- `$prng_next` / `$prng_range`: 32-bit Xorshift PRNG in assembly for fair and uniform random piece selection.
- `$can_fit_at`: Assembly hit testing checking bounding limits and grid cell collisions.
- `$can_fit_anywhere`: Exhaustive board scan in assembly to verify if a piece can be placed anywhere.
- `$spawn_dock_pieces`: Smart balancing algorithm selecting small, medium, and large shapes with guaranteed playability.
- `$place_piece`: Stamps piece into board memory, detects full rows and columns, calculates combo multipliers, and updates score.
- `$clear_cleared_lines`: Zeroes out blasted rows and columns according to bitmasks after animation.
- `$check_and_replenish_dock`: Detects round exhaustion and evaluates game over state.

---

## 🎮 How to Play

1. **Place Blocks:** Drag pieces from the bottom dock into the 8×8 grid (or tap a piece to select it, then tap an empty cell on the board).
2. **Blast Lines:** Completely fill any horizontal row or vertical column to blast it off the board!
3. **Trigger Combos:** Clear rows or columns on consecutive turns to build up huge combo multipliers and score streaks!
4. **Game Over:** When none of the remaining pieces in the dock can fit anywhere on the board, the game ends. Try to beat your record!

---

## ✨ Features

- **⚡ WebAssembly Assembly Engine:** Core board logic, collision detection, and scoring running in WebAssembly.
- **Intuitive Controls:**
  - Full touch & mouse drag-and-drop support with pointer capture.
  - Automatic vertical touch offset on mobile (pieces hover above your finger).
  - Tap-to-Place accessibility mode (click piece in dock, click cell on board).
- **Juicy Visuals & Animations:**
  - Modern dark-mode interface with vibrant neon block gradients.
  - Live ghost placement preview on grid cells.
  - Particle burst explosions and board shake on multi-line clears.
  - Dynamic combo streaks (`COMBO x2!`, `DOUBLE BLAST!`, `SUPER HOT! 🔥`).
- **Web Audio API Synthesizer:**
  - Built-in zero-latency sound effects (pickup, snap drop, ascending pentatonic blast chords, game over chime).
  - Fully self-contained without needing external audio files.
  - Sound mute / unmute toggle button.
- **Persistent High Scores:**
  - Automatically saves and tracks your highest score in `localStorage`.
  - Game Over modal with new high score celebration.
- **Dual Loading Compatibility:**
  - Supports standard `engine.wasm` loading via HTTP/fetch.
  - Includes embedded zero-latency Base64 fallback in `engine-wasm.js` so you can double-click `index.html` via `file://` offline without any CORS issues.

---

## 🚀 Running the Game

Simply open [`index.html`](file:///C:/Users/gilmi/OneDrive/Documents/Github/Vexora/index.html) in any modern web browser (Google Chrome, Microsoft Edge, Safari, Firefox) or serve it with any static web server:

```bash
# Optional static web server
npx serve .
```

### Building & Testing the Assembly Engine

To recompile the WebAssembly binary and run the automated test suite:

```bash
# Run test suite verifying board logic, line blasts, combos, and game over
npm test

# Rebuild engine.wasm and engine-wasm.js
npm run build
```
