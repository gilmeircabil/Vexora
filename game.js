/**
 * Block Blast! - WebAssembly Assembly Engine Frontend
 * Core game state, piece generation, collision hit testing, line blasting,
 * and combo scoring are executed directly in WebAssembly Text (WAT) assembly.
 */

(function () {
  'use strict';

  const BOARD_SIZE = 8;

  // 1-indexed color classes matching WebAssembly engine color IDs (1..8)
  const COLOR_CLASSES = [
    '',
    'color-yellow', // 1
    'color-cyan',   // 2
    'color-pink',   // 3
    'color-blue',   // 4
    'color-green',  // 5
    'color-purple', // 6
    'color-orange', // 7
    'color-red'     // 8
  ];

  // ==========================================
  // Web Audio Synthesizer
  // ==========================================
  class SoundManager {
    constructor() {
      this.ctx = null;
      this.isMuted = localStorage.getItem('blockblast_muted') === 'true';
    }

    init() {
      if (!this.ctx) {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (AudioContextClass) {
          this.ctx = new AudioContextClass();
        }
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
    }

    toggleMute() {
      this.isMuted = !this.isMuted;
      localStorage.setItem('blockblast_muted', this.isMuted);
      return this.isMuted;
    }

    playTone(freq, type, duration, startTime = 0, gainVal = 0.2) {
      if (this.isMuted || !this.ctx) return;
      try {
        const now = this.ctx.currentTime + startTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(freq, now);

        gain.gain.setValueAtTime(gainVal, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + duration);
      } catch (e) {
        // Audio error handled
      }
    }

    playPick() {
      this.init();
      if (this.isMuted || !this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(600, now + 0.07);

      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.07);
    }

    playDrop() {
      this.init();
      if (this.isMuted || !this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(260, now);
      osc.frequency.exponentialRampToValueAtTime(90, now + 0.1);

      gain.gain.setValueAtTime(0.28, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.1);
    }

    playBlast(combo = 1) {
      this.init();
      if (this.isMuted || !this.ctx) return;

      const pentatonic = [523.25, 587.33, 659.25, 783.99, 880.0, 1046.5]; // C5, D5, E5, G5, A5, C6
      const baseIdx = Math.min(combo - 1, 4);
      const notes = [
        pentatonic[baseIdx % pentatonic.length],
        pentatonic[(baseIdx + 2) % pentatonic.length],
        pentatonic[(baseIdx + 4) % pentatonic.length],
        pentatonic[(baseIdx + 5) % pentatonic.length]
      ];

      notes.forEach((freq, idx) => {
        this.playTone(freq, 'sine', 0.28, idx * 0.05, 0.22);
        this.playTone(freq * 1.5, 'triangle', 0.2, idx * 0.05 + 0.02, 0.08);
      });
    }

    playGameOver() {
      this.init();
      if (this.isMuted || !this.ctx) return;
      const notes = [440, 392, 349.23, 293.66]; // A4, G4, F4, D4
      notes.forEach((freq, idx) => {
        this.playTone(freq, 'sawtooth', 0.32, idx * 0.14, 0.18);
      });
    }

    playNewRecord() {
      this.init();
      if (this.isMuted || !this.ctx) return;
      const fanfare = [523.25, 659.25, 783.99, 1046.50, 1318.51];
      fanfare.forEach((freq, idx) => {
        this.playTone(freq, 'sine', 0.35, idx * 0.07, 0.25);
      });
    }
  }

  // ==========================================
  // Core Block Blast Game Controller (WASM Engine)
  // ==========================================
  class BlockBlastGame {
    constructor(wasm) {
      this.wasm = wasm;

      // DOM Elements
      this.boardWrapperEl = document.querySelector('.board-wrapper');
      this.boardEl = document.getElementById('board');
      this.dockEl = document.getElementById('pieces-dock');
      this.scoreValEl = document.getElementById('score-val');
      this.highScoreValEl = document.getElementById('high-score-val');
      this.comboBannerEl = document.getElementById('combo-banner');
      this.dragProxyEl = document.getElementById('drag-proxy');
      this.modalEl = document.getElementById('game-over-modal');
      this.modalScoreEl = document.getElementById('modal-score');
      this.modalHighScoreEl = document.getElementById('modal-high-score');
      this.newRecordBadgeEl = document.getElementById('new-record-badge');
      this.soundBtnEl = document.getElementById('sound-btn');
      this.restartBtnEl = document.getElementById('restart-btn');
      this.modalRestartBtnEl = document.getElementById('modal-restart-btn');

      // State
      this.sound = new SoundManager();
      this.highScore = parseInt(localStorage.getItem('blockblast_highscore') || '0', 10);
      this.selectedDockIndex = null;
      this.isProcessingBlast = false;

      // Drag Tracking
      this.isDragging = false;
      this.draggedSlotIndex = null;
      this.draggedRows = 0;
      this.draggedCols = 0;
      this.draggedColor = null;
      this.draggedMatrix = null;
      this.dragPointerType = 'mouse';
      this.dragStartCoords = { x: 0, y: 0 };
      this.activePointerId = null;
      this.activeCapturedEl = null;
      this.currentPreviewCells = [];

      this.initDOM();
      this.bindEvents();
      this.startNewGame();
    }

    initDOM() {
      this.boardEl.innerHTML = '';
      for (let r = 0; r < BOARD_SIZE; r++) {
        for (let c = 0; c < BOARD_SIZE; c++) {
          const cell = document.createElement('div');
          cell.className = 'cell';
          cell.dataset.r = r;
          cell.dataset.c = c;
          this.boardEl.appendChild(cell);
        }
      }

      this.updateSoundButtonUI();
      this.highScoreValEl.textContent = this.highScore;
    }

    updateSoundButtonUI() {
      const onIcon = this.soundBtnEl.querySelector('.sound-on-icon');
      const offIcon = this.soundBtnEl.querySelector('.sound-off-icon');
      if (this.sound.isMuted) {
        onIcon.classList.add('hidden');
        offIcon.classList.remove('hidden');
      } else {
        onIcon.classList.remove('hidden');
        offIcon.classList.add('hidden');
      }
    }

    startNewGame() {
      // Initialize WebAssembly engine with randomized seed and saved high score
      const seed = (Date.now() ^ (Math.random() * 0x7FFFFFFF)) >>> 0;
      this.wasm.init_game(seed, this.highScore);

      this.selectedDockIndex = null;
      this.isProcessingBlast = false;
      this.scoreValEl.textContent = '0';
      this.hideCombo();

      this.modalEl.classList.add('hidden');
      this.newRecordBadgeEl.classList.add('hidden');

      this.renderBoard();
      this.renderDock();
      this.updateDockAvailability();
    }

    renderBoard() {
      const cells = this.boardEl.querySelectorAll('.cell');
      cells.forEach(cell => {
        const r = parseInt(cell.dataset.r, 10);
        const c = parseInt(cell.dataset.c, 10);
        const colorIdx = this.wasm.get_board_cell(r, c);

        cell.className = 'cell';
        if (colorIdx > 0 && COLOR_CLASSES[colorIdx]) {
          cell.classList.add('filled', COLOR_CLASSES[colorIdx]);
        }
      });
    }

    renderDock() {
      const slotEls = this.dockEl.querySelectorAll('.dock-slot');
      slotEls.forEach((slotEl, idx) => {
        slotEl.innerHTML = '';
        const isActive = this.wasm.get_dock_slot_active(idx);
        if (!isActive) return;

        const pieceEl = document.createElement('div');
        pieceEl.className = 'piece';
        pieceEl.dataset.slotIndex = idx;
        if (this.selectedDockIndex === idx) {
          pieceEl.classList.add('selected');
        }

        const rows = this.wasm.get_dock_slot_rows(idx);
        const cols = this.wasm.get_dock_slot_cols(idx);
        const colorClass = COLOR_CLASSES[this.wasm.get_dock_slot_color(idx)];

        pieceEl.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
        pieceEl.style.gridTemplateRows = `repeat(${rows}, 1fr)`;

        for (let r = 0; r < rows; r++) {
          for (let c = 0; c < cols; c++) {
            const mini = document.createElement('div');
            mini.className = 'mini-block';
            if (this.wasm.get_dock_slot_cell(idx, r, c) === 1) {
              mini.classList.add(colorClass);
            } else {
              mini.classList.add('empty');
            }
            pieceEl.appendChild(mini);
          }
        }

        slotEl.appendChild(pieceEl);
      });
    }

    updateDockAvailability() {
      let anyCanFit = false;
      let remainingPieces = 0;

      const slotEls = this.dockEl.querySelectorAll('.dock-slot');
      slotEls.forEach((slotEl, idx) => {
        const isActive = this.wasm.get_dock_slot_active(idx);
        const pieceEl = slotEl.querySelector('.piece');
        if (!isActive || !pieceEl) return;

        remainingPieces++;
        const fits = this.wasm.can_fit_anywhere(idx) === 1;
        if (fits) {
          pieceEl.classList.remove('disabled');
          anyCanFit = true;
        } else {
          pieceEl.classList.add('disabled');
        }
      });

      if (remainingPieces > 0 && !anyCanFit) {
        setTimeout(() => this.triggerGameOver(), 350);
      }
    }

    // ==========================================
    // Unified Pointer Event Handlers
    // ==========================================
    bindEvents() {
      this.soundBtnEl.addEventListener('click', () => {
        this.sound.toggleMute();
        this.updateSoundButtonUI();
      });

      this.restartBtnEl.addEventListener('click', () => this.startNewGame());
      this.modalRestartBtnEl.addEventListener('click', () => this.startNewGame());

      window.addEventListener('resize', () => this.clearPreview());

      // Dock pointer interactions
      this.dockEl.addEventListener('pointerdown', (e) => this.onPointerDown(e));
      window.addEventListener('pointermove', (e) => this.onPointerMove(e));
      window.addEventListener('pointerup', (e) => this.onPointerUp(e));
      window.addEventListener('pointercancel', (e) => this.onPointerCancel(e));

      // Board interactions for tap-to-place & hover preview
      this.boardEl.addEventListener('click', (e) => this.onBoardClick(e));
      this.boardEl.addEventListener('pointermove', (e) => this.onBoardPointerMove(e));
      this.boardEl.addEventListener('pointerleave', () => {
        if (this.selectedDockIndex !== null && !this.isDragging) {
          this.clearPreview();
        }
      });
    }

    onPointerDown(e) {
      if (this.wasm.get_is_game_over() === 1 || this.isProcessingBlast) return;

      const pieceEl = e.target.closest('.piece');
      if (!pieceEl || pieceEl.classList.contains('disabled')) return;

      const slotIdx = parseInt(pieceEl.dataset.slotIndex, 10);
      if (this.wasm.get_dock_slot_active(slotIdx) !== 1) return;

      this.sound.playPick();

      this.isDragging = true;
      this.draggedSlotIndex = slotIdx;
      this.draggedRows = this.wasm.get_dock_slot_rows(slotIdx);
      this.draggedCols = this.wasm.get_dock_slot_cols(slotIdx);
      this.draggedColor = COLOR_CLASSES[this.wasm.get_dock_slot_color(slotIdx)];

      this.draggedMatrix = [];
      for (let r = 0; r < this.draggedRows; r++) {
        const row = [];
        for (let c = 0; c < this.draggedCols; c++) {
          row.push(this.wasm.get_dock_slot_cell(slotIdx, r, c));
        }
        this.draggedMatrix.push(row);
      }

      this.dragPointerType = e.pointerType;
      this.dragStartCoords = { x: e.clientX, y: e.clientY };

      try {
        pieceEl.setPointerCapture(e.pointerId);
        this.activePointerId = e.pointerId;
        this.activeCapturedEl = pieceEl;
      } catch (err) {
        // Fallback
      }

      pieceEl.classList.add('is-dragging');
      this.createDragProxy();
      this.updateDragProxyPosition(e.clientX, e.clientY);

      this.deselectDockPiece();
      e.preventDefault();
    }

    createDragProxy() {
      this.dragProxyEl.innerHTML = '';
      this.dragProxyEl.className = 'drag-proxy';
      this.dragProxyEl.style.gridTemplateColumns = `repeat(${this.draggedCols}, var(--cell-size))`;
      this.dragProxyEl.style.gridTemplateRows = `repeat(${this.draggedRows}, var(--cell-size))`;

      for (let r = 0; r < this.draggedRows; r++) {
        for (let c = 0; c < this.draggedCols; c++) {
          const block = document.createElement('div');
          block.className = 'proxy-block';
          if (this.draggedMatrix[r][c] === 1) {
            block.classList.add(this.draggedColor);
          } else {
            block.classList.add('empty');
          }
          this.dragProxyEl.appendChild(block);
        }
      }

      this.dragProxyEl.classList.remove('hidden');
    }

    getPointerTargetCoords(clientX, clientY) {
      const isTouch = this.dragPointerType === 'touch';
      const offsetY = isTouch ? -70 : 0;
      return { x: clientX, y: clientY + offsetY };
    }

    updateDragProxyPosition(clientX, clientY) {
      const target = this.getPointerTargetCoords(clientX, clientY);
      this.dragProxyEl.style.left = `${target.x}px`;
      this.dragProxyEl.style.top = `${target.y}px`;
    }

    onPointerMove(e) {
      if (!this.isDragging) return;

      this.updateDragProxyPosition(e.clientX, e.clientY);
      const target = this.getPointerTargetCoords(e.clientX, e.clientY);
      const targetPos = this.getGridCoordsFromPoint(target.x, target.y, this.draggedMatrix);

      if (targetPos) {
        this.updatePlacementPreview(targetPos.r, targetPos.c, this.draggedSlotIndex, this.draggedMatrix, this.draggedColor);
      } else {
        this.clearPreview();
      }
    }

    onPointerUp(e) {
      if (!this.isDragging) return;

      if (this.activeCapturedEl && this.activePointerId !== null) {
        try {
          this.activeCapturedEl.releasePointerCapture(this.activePointerId);
        } catch (err) {
          // ignore
        }
        this.activeCapturedEl = null;
        this.activePointerId = null;
      }

      const target = this.getPointerTargetCoords(e.clientX, e.clientY);
      const targetPos = this.getGridCoordsFromPoint(target.x, target.y, this.draggedMatrix);

      let placed = false;
      if (targetPos && this.wasm.can_fit_at(this.draggedSlotIndex, targetPos.r, targetPos.c) === 1) {
        placed = this.placePiece(this.draggedSlotIndex, targetPos.r, targetPos.c);
      }

      const distance = Math.hypot(e.clientX - this.dragStartCoords.x, e.clientY - this.dragStartCoords.y);
      if (!placed && distance < 8) {
        this.toggleSelectDockPiece(this.draggedSlotIndex);
      }

      this.endDrag();
    }

    onPointerCancel() {
      if (this.isDragging) {
        this.endDrag();
      }
    }

    endDrag() {
      this.isDragging = false;
      this.clearPreview();
      this.dragProxyEl.classList.add('hidden');
      this.dragProxyEl.innerHTML = '';

      const slotEls = this.dockEl.querySelectorAll('.dock-slot');
      slotEls.forEach(slotEl => {
        const pieceEl = slotEl.querySelector('.piece');
        if (pieceEl) {
          pieceEl.classList.remove('is-dragging');
        }
      });

      this.draggedSlotIndex = null;
      this.draggedMatrix = null;
      this.draggedColor = null;
    }

    getGridCoordsFromPoint(screenX, screenY, matrix) {
      const firstCell = this.boardEl.children[0];
      const secondCell = this.boardEl.children[1];
      const nextRowCell = this.boardEl.children[BOARD_SIZE];

      if (!firstCell || !secondCell || !nextRowCell) return null;

      const r0 = firstCell.getBoundingClientRect();
      const r1 = secondCell.getBoundingClientRect();
      const rNext = nextRowCell.getBoundingClientRect();

      const stepX = r1.left - r0.left;
      const stepY = rNext.top - r0.top;

      const shapeRows = matrix.length;
      const shapeCols = matrix[0].length;

      const shapeWidth = (shapeCols - 1) * stepX + r0.width;
      const shapeHeight = (shapeRows - 1) * stepY + r0.height;

      const shapeTopLeftX = screenX - shapeWidth / 2;
      const shapeTopLeftY = screenY - shapeHeight / 2;

      const col = Math.round((shapeTopLeftX - r0.left) / stepX);
      const row = Math.round((shapeTopLeftY - r0.top) / stepY);

      if (row >= 0 && row + shapeRows <= BOARD_SIZE && col >= 0 && col + shapeCols <= BOARD_SIZE) {
        return { r: row, c: col };
      }

      return null;
    }

    updatePlacementPreview(startR, startC, slotIdx, matrix, color) {
      this.clearPreview();

      const canFit = this.wasm.can_fit_at(slotIdx, startR, startC) === 1;
      const rows = matrix.length;
      const cols = matrix[0].length;

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          if (matrix[r][c] === 1) {
            const targetR = startR + r;
            const targetC = startC + c;
            if (targetR < BOARD_SIZE && targetC < BOARD_SIZE) {
              const cell = this.boardEl.querySelector(`[data-r="${targetR}"][data-c="${targetC}"]`);
              if (cell) {
                if (canFit) {
                  cell.classList.add('preview-valid', color);
                } else {
                  cell.classList.add('preview-invalid');
                }
                this.currentPreviewCells.push(cell);
              }
            }
          }
        }
      }
    }

    clearPreview() {
      this.currentPreviewCells.forEach(cell => {
        cell.classList.remove(
          'preview-valid',
          'preview-invalid',
          'color-cyan',
          'color-orange',
          'color-purple',
          'color-green',
          'color-yellow',
          'color-pink',
          'color-blue',
          'color-red'
        );
        const r = parseInt(cell.dataset.r, 10);
        const c = parseInt(cell.dataset.c, 10);
        const colorIdx = this.wasm.get_board_cell(r, c);
        if (colorIdx > 0 && COLOR_CLASSES[colorIdx]) {
          cell.classList.add('filled', COLOR_CLASSES[colorIdx]);
        }
      });
      this.currentPreviewCells = [];
    }

    // ==========================================
    // Tap-to-Place Support
    // ==========================================
    toggleSelectDockPiece(slotIndex) {
      if (this.selectedDockIndex === slotIndex) {
        this.deselectDockPiece();
      } else {
        this.selectedDockIndex = slotIndex;
        this.renderDock();
      }
    }

    deselectDockPiece() {
      this.selectedDockIndex = null;
      this.clearPreview();
      this.renderDock();
    }

    onBoardPointerMove(e) {
      if (this.isDragging || this.selectedDockIndex === null) return;
      const cell = e.target.closest('.cell');
      if (!cell) {
        this.clearPreview();
        return;
      }

      const r = parseInt(cell.dataset.r, 10);
      const c = parseInt(cell.dataset.c, 10);

      const rows = this.wasm.get_dock_slot_rows(this.selectedDockIndex);
      const cols = this.wasm.get_dock_slot_cols(this.selectedDockIndex);
      const colorClass = COLOR_CLASSES[this.wasm.get_dock_slot_color(this.selectedDockIndex)];
      const matrix = [];
      for (let row = 0; row < rows; row++) {
        const rowArr = [];
        for (let col = 0; col < cols; col++) {
          rowArr.push(this.wasm.get_dock_slot_cell(this.selectedDockIndex, row, col));
        }
        matrix.push(rowArr);
      }

      this.updatePlacementPreview(r, c, this.selectedDockIndex, matrix, colorClass);
    }

    onBoardClick(e) {
      if (this.selectedDockIndex === null || this.isProcessingBlast) return;

      const cell = e.target.closest('.cell');
      if (!cell) return;

      const r = parseInt(cell.dataset.r, 10);
      const c = parseInt(cell.dataset.c, 10);

      if (this.wasm.can_fit_at(this.selectedDockIndex, r, c) === 1) {
        this.placePiece(this.selectedDockIndex, r, c);
        this.deselectDockPiece();
      }
    }

    // ==========================================
    // Piece Placement & Line Blasts (WASM Engine)
    // ==========================================
    placePiece(slotIndex, startR, startC) {
      if (this.wasm.can_fit_at(slotIndex, startR, startC) === 0) return false;

      // Execute placement and line calculations in WebAssembly
      const linesCleared = this.wasm.place_piece(slotIndex, startR, startC);
      this.sound.playDrop();

      this.renderDock();
      this.renderBoard();

      const scoreDelta = this.wasm.get_last_score_delta();
      const currentScore = this.wasm.get_score();
      const highScore = this.wasm.get_high_score();
      const combo = this.wasm.get_combo();

      this.scoreValEl.textContent = currentScore;
      this.scoreValEl.classList.remove('score-bounce');
      void this.scoreValEl.offsetWidth;
      this.scoreValEl.classList.add('score-bounce');

      if (currentScore >= highScore) {
        this.highScoreValEl.textContent = highScore;
        localStorage.setItem('blockblast_highscore', highScore);
      }

      if (linesCleared > 0) {
        this.isProcessingBlast = true;
        this.showCombo(combo, linesCleared);
        this.sound.playBlast(combo);

        if (linesCleared >= 2) {
          this.triggerBoardShake();
        }

        const rowsMask = this.wasm.get_cleared_rows_mask();
        const colsMask = this.wasm.get_cleared_cols_mask();
        const cellsToAnimate = new Set();

        for (let r = 0; r < BOARD_SIZE; r++) {
          if ((rowsMask & (1 << r)) !== 0) {
            for (let c = 0; c < BOARD_SIZE; c++) cellsToAnimate.add(`${r},${c}`);
          }
        }
        for (let c = 0; c < BOARD_SIZE; c++) {
          if ((colsMask & (1 << c)) !== 0) {
            for (let r = 0; r < BOARD_SIZE; r++) cellsToAnimate.add(`${r},${c}`);
          }
        }

        cellsToAnimate.forEach(coord => {
          const [r, c] = coord.split(',').map(Number);
          const cell = this.boardEl.querySelector(`[data-r="${r}"][data-c="${c}"]`);
          if (cell) {
            cell.classList.add('blast-clearing');
            const colorIdx = this.wasm.get_board_cell(r, c);
            this.createBlastParticles(cell, COLOR_CLASSES[colorIdx]);
          }
        });

        this.showFloatingScore(`+${scoreDelta}`);

        setTimeout(() => {
          this.wasm.clear_cleared_lines();
          this.renderBoard();
          this.isProcessingBlast = false;
          this.postPlacementRoutine();
        }, 360);
      } else {
        this.hideCombo();
        this.postPlacementRoutine();
      }

      return true;
    }

    postPlacementRoutine() {
      // Check dock replenishment and game over in WebAssembly
      const isGameOver = this.wasm.check_and_replenish_dock();
      this.renderDock();
      this.updateDockAvailability();

      if (isGameOver === 1) {
        setTimeout(() => this.triggerGameOver(), 350);
      }
    }

    showCombo(combo, lines) {
      const textEl = this.comboBannerEl.querySelector('.combo-text');
      let message = `COMBO x${combo}!`;
      if (lines >= 3) {
        message = `TRIPLE BLAST! x${combo}`;
      } else if (lines === 2) {
        message = `DOUBLE BLAST! x${combo}`;
      } else if (combo >= 4) {
        message = `SUPER HOT! 🔥 x${combo}`;
      }

      textEl.textContent = message;
      this.comboBannerEl.classList.remove('hidden');
    }

    hideCombo() {
      this.comboBannerEl.classList.add('hidden');
    }

    triggerBoardShake() {
      this.boardWrapperEl.classList.remove('board-shake');
      void this.boardWrapperEl.offsetWidth;
      this.boardWrapperEl.classList.add('board-shake');
    }

    showFloatingScore(text) {
      const bubble = document.createElement('div');
      bubble.className = 'floating-score';
      bubble.textContent = text;

      const rect = this.boardEl.getBoundingClientRect();
      bubble.style.left = `${rect.left + rect.width / 2}px`;
      bubble.style.top = `${rect.top + rect.height / 2}px`;

      document.body.appendChild(bubble);

      setTimeout(() => {
        if (bubble.parentNode) bubble.parentNode.removeChild(bubble);
      }, 950);
    }

    createBlastParticles(cellEl, colorClass) {
      const rect = cellEl.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      for (let i = 0; i < 4; i++) {
        const particle = document.createElement('div');
        particle.className = `blast-particle ${colorClass || 'color-yellow'}`;
        const angle = Math.random() * Math.PI * 2;
        const velocity = 25 + Math.random() * 45;
        const tx = Math.cos(angle) * velocity;
        const ty = Math.sin(angle) * velocity;

        particle.style.left = `${centerX}px`;
        particle.style.top = `${centerY}px`;
        particle.style.setProperty('--tx', `${tx}px`);
        particle.style.setProperty('--ty', `${ty}px`);

        document.body.appendChild(particle);

        setTimeout(() => {
          if (particle.parentNode) particle.parentNode.removeChild(particle);
        }, 500);
      }
    }

    triggerGameOver() {
      if (this.wasm.get_is_game_over() !== 1) return;

      this.sound.playGameOver();

      const finalScore = this.wasm.get_score();
      const bestScore = this.wasm.get_high_score();

      this.modalScoreEl.textContent = finalScore;
      this.modalHighScoreEl.textContent = bestScore;

      const isNewRecord = finalScore >= bestScore && finalScore > 0;
      if (isNewRecord) {
        this.newRecordBadgeEl.classList.remove('hidden');
        this.sound.playNewRecord();
      } else {
        this.newRecordBadgeEl.classList.add('hidden');
      }

      this.modalEl.classList.remove('hidden');
    }
  }

  // Bootstrap WebAssembly Module and Start Game
  document.addEventListener('DOMContentLoaded', async () => {
    try {
      if (typeof BlockBlastWasm !== 'undefined') {
        const wasm = await BlockBlastWasm.loadModule();
        new BlockBlastGame(wasm);
      } else {
        console.error('BlockBlastWasm loader not found.');
      }
    } catch (err) {
      console.error('Failed to initialize WebAssembly engine:', err);
    }
  });
})();
