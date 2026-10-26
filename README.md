# Block Blast! 💥

A modern, responsive, and addictive **Block Blast!** puzzle game built with pure **HTML5, CSS3, and Vanilla JavaScript**.

## 🎮 How to Play

1. **Place Blocks:** Drag pieces from the bottom dock into the 8×8 grid (or tap a piece to select it, then tap an empty cell on the board).
2. **Blast Lines:** Completely fill any horizontal row or vertical column to blast it off the board!
3. **Trigger Combos:** Clear rows or columns on consecutive turns to build up huge combo multipliers and high score streaks!
4. **Game Over:** When none of the remaining pieces in the dock can fit anywhere on the board, the game ends. Try to beat your record!

## ✨ Features

- **Intuitive Controls:**
  - Full touch & mouse drag-and-drop support.
  - Automatic vertical touch offset on mobile (pieces hover above your finger so your thumb doesn't block the view).
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
- **Smart Piece Balancing:**
  - Fair shape distribution guaranteeing diverse and playable pieces every round.

## 🚀 Running the Game

Simply open [`index.html`](file:///C:/Users/gilmi/OneDrive/Documents/Github/Vexora/index.html) in any modern web browser (Google Chrome, Microsoft Edge, Safari, Firefox) or serve it with any static web server (such as VS Code Live Server or `npx serve`).
