/**
 * Block Blast! - Pure Vanilla JavaScript Game Engine
 * Featuring smart piece balancing, drag & drop + tap-to-place, combo streaks,
 * dynamic particle blasts, and Web Audio API synthesizer.
 */

(function () {
  'use strict';

  const BOARD_SIZE = 8;

  // Shapes classified by size category: 'small', 'medium', 'large'
  const SHAPE_DEFS = [
    // --- Small Shapes ---
    { id: 'dot', color: 'color-yellow', sizeType: 'small', matrix: [[1]] },
    { id: 'h2', color: 'color-cyan', sizeType: 'small', matrix: [[1, 1]] },
    { id: 'v2', color: 'color-cyan', sizeType: 'small', matrix: [[1], [1]] },
    { id: 'corner2_tl', color: 'color-pink', sizeType: 'small', matrix: [[1, 1], [1, 0]] },
    { id: 'corner2_tr', color: 'color-pink', sizeType: 'small', matrix: [[1, 1], [0, 1]] },
    { id: 'corner2_bl', color: 'color-pink', sizeType: 'small', matrix: [[1, 0], [1, 1]] },
    { id: 'corner2_br', color: 'color-pink', sizeType: 'small', matrix: [[0, 1], [1, 1]] },

    // --- Medium Shapes ---
    { id: 'h3', color: 'color-blue', sizeType: 'medium', matrix: [[1, 1, 1]] },
    { id: 'v3', color: 'color-blue', sizeType: 'medium', matrix: [[1], [1], [1]] },
    { id: 'sq2', color: 'color-green', sizeType: 'medium', matrix: [[1, 1], [1, 1]] },
    { id: 't_down', color: 'color-purple', sizeType: 'medium', matrix: [[1, 1, 1], [0, 1, 0]] },
    { id: 't_up', color: 'color-purple', sizeType: 'medium', matrix: [[0, 1, 0], [1, 1, 1]] },
    { id: 't_right', color: 'color-purple', sizeType: 'medium', matrix: [[1, 0], [1, 1], [1, 0]] },
    { id: 't_left', color: 'color-purple', sizeType: 'medium', matrix: [[0, 1], [1, 1], [0, 1]] },
    { id: 'l_1', color: 'color-orange', sizeType: 'medium', matrix: [[1, 0], [1, 0], [1, 1]] },
    { id: 'l_2', color: 'color-orange', sizeType: 'medium', matrix: [[0, 1], [0, 1], [1, 1]] },
    { id: 'l_3', color: 'color-orange', sizeType: 'medium', matrix: [[1, 1], [1, 0], [1, 0]] },
    { id: 'l_4', color: 'color-orange', sizeType: 'medium', matrix: [[1, 1], [0, 1], [0, 1]] },
    { id: 'l_h1', color: 'color-green', sizeType: 'medium', matrix: [[1, 1, 1], [1, 0, 0]] },
    { id: 'l_h2', color: 'color-green', sizeType: 'medium', matrix: [[1, 1, 1], [0, 0, 1]] },
    { id: 'l_h3', color: 'color-green', sizeType: 'medium', matrix: [[1, 0, 0], [1, 1, 1]] },
    { id: 'l_h4', color: 'color-green', sizeType: 'medium', matrix: [[0, 0, 1], [1, 1, 1]] },
    { id: 's_h', color: 'color-cyan', sizeType: 'medium', matrix: [[0, 1, 1], [1, 1, 0]] },
    { id: 'z_h', color: 'color-red', sizeType: 'medium', matrix: [[1, 1, 0], [0, 1, 1]] },
    { id: 's_v', color: 'color-cyan', sizeType: 'medium', matrix: [[1, 0], [1, 1], [0, 1]] },
    { id: 'z_v', color: 'color-red', sizeType: 'medium', matrix: [[0, 1], [1, 1], [1, 0]] },

    // --- Large Shapes ---
    { id: 'h4', color: 'color-purple', sizeType: 'large', matrix: [[1, 1, 1, 1]] },
    { id: 'v4', color: 'color-purple', sizeType: 'large', matrix: [[1], [1], [1], [1]] },
    { id: 'h5', color: 'color-orange', sizeType: 'large', matrix: [[1, 1, 1, 1, 1]] },
    { id: 'v5', color: 'color-orange', sizeType: 'large', matrix: [[1], [1], [1], [1], [1]] },
    { id: 'sq3', color: 'color-red', sizeType: 'large', matrix: [[1, 1, 1], [1, 1, 1], [1, 1, 1]] },
    { id: 'corner3_tl', color: 'color-yellow', sizeType: 'large', matrix: [[1, 1, 1], [1, 0, 0], [1, 0, 0]] },
    { id: 'corner3_tr', color: 'color-yellow', sizeType: 'large', matrix: [[1, 1, 1], [0, 0, 1], [0, 0, 1]] },
    { id: 'corner3_bl', color: 'color-yellow', sizeType: 'large', matrix: [[1, 0, 0], [1, 0, 0], [1, 1, 1]] },
    { id: 'corner3_br', color: 'color-yellow', sizeType: 'large', matrix: [[0, 0, 1], [0, 0, 1], [1, 1, 1]] },
    { id: 'plus', color: 'color-blue', sizeType: 'large', matrix: [[0, 1, 0], [1, 1, 1], [0, 1, 0]] }
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
        // Audio error gracefully handled
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

      // Pentatonic Arpeggio scaled with combo
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
        // Harmonic overtone for extra richness
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
  // Core Block Blast Game Engine
  // ==========================================
  class BlockBlastGame {
    constructor() {
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
      this.grid = Array.from({ length: BOARD_SIZE }, () => Array(BOARD_SIZE).fill(null));
      this.dockSlots = [null, null, null];
      this.score = 0;
      this.highScore = parseInt(localStorage.getItem('blockblast_highscore') || '0', 10);
      this.combo = 0;
      this.isGameOver = false;
      this.selectedDockIndex = null;

      // Drag Tracking
      this.isDragging = false;
      this.draggedSlotIndex = null;
      this.draggedShape = null;
      this.draggedColor = null;
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
      // Generate 8x8 cells
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
      for (let r = 0; r < BOARD_SIZE; r++) {
        for (let c = 0; c < BOARD_SIZE; c++) {
          this.grid[r][c] = null;
        }
      }
      this.renderBoard();

      this.score = 0;
      this.combo = 0;
      this.isGameOver = false;
      this.selectedDockIndex = null;
      this.scoreValEl.textContent = '0';
      this.hideCombo();

      this.modalEl.classList.add('hidden');
      this.newRecordBadgeEl.classList.add('hidden');

      this.spawnDockPieces();
      this.updateDockAvailability();
    }

    // Smart piece spawning: guarantees fair play and variety
    spawnDockPieces() {
      const smallPool = SHAPE_DEFS.filter(s => s.sizeType === 'small');
      const mediumPool = SHAPE_DEFS.filter(s => s.sizeType === 'medium');
      const largePool = SHAPE_DEFS.filter(s => s.sizeType === 'large');

      let picked = [];
      let attempts = 0;

      while (attempts < 50) {
        attempts++;
        picked = [];

        // At most one large piece per round
        const includeLarge = Math.random() < 0.45;
        if (includeLarge) {
          picked.push(largePool[Math.floor(Math.random() * largePool.length)]);
        }

        // Fill remaining with small & medium
        while (picked.length < 3) {
          const pool = Math.random() < 0.55 ? smallPool : mediumPool;
          picked.push(pool[Math.floor(Math.random() * pool.length)]);
        }

        // Shuffle picked pieces
        picked.sort(() => Math.random() - 0.5);

        // Ensure at least one piece can fit on the current board
        const canFitAtLeastOne = picked.some(p => this.canFitAnywhere(p.matrix));
        if (canFitAtLeastOne) {
          break;
        }
      }

      for (let i = 0; i < 3; i++) {
        this.dockSlots[i] = {
          matrix: picked[i].matrix,
          color: picked[i].color,
          id: picked[i].id
        };
      }

      this.renderDock();
    }

    renderDock() {
      const slotEls = this.dockEl.querySelectorAll('.dock-slot');
      slotEls.forEach((slotEl, idx) => {
        slotEl.innerHTML = '';
        const pieceData = this.dockSlots[idx];
        if (!pieceData) return;

        const pieceEl = document.createElement('div');
        pieceEl.className = 'piece';
        pieceEl.dataset.slotIndex = idx;
        if (this.selectedDockIndex === idx) {
          pieceEl.classList.add('selected');
        }

        const rows = pieceData.matrix.length;
        const cols = pieceData.matrix[0].length;
        pieceEl.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
        pieceEl.style.gridTemplateRows = `repeat(${rows}, 1fr)`;

        for (let r = 0; r < rows; r++) {
          for (let c = 0; c < cols; c++) {
            const mini = document.createElement('div');
            mini.className = 'mini-block';
            if (pieceData.matrix[r][c] === 1) {
              mini.classList.add(pieceData.color);
            } else {
              mini.classList.add('empty');
            }
            pieceEl.appendChild(mini);
          }
        }

        slotEl.appendChild(pieceEl);
      });
    }

    renderBoard() {
      const cells = this.boardEl.querySelectorAll('.cell');
      cells.forEach(cell => {
        const r = parseInt(cell.dataset.r, 10);
        const c = parseInt(cell.dataset.c, 10);
        const color = this.grid[r][c];

        cell.className = 'cell';
        if (color) {
          cell.classList.add('filled', color);
        }
      });
    }

    canFitAt(matrix, startR, startC) {
      const rows = matrix.length;
      const cols = matrix[0].length;

      if (startR < 0 || startC < 0 || startR + rows > BOARD_SIZE || startC + cols > BOARD_SIZE) {
        return false;
      }

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          if (matrix[r][c] === 1) {
            if (this.grid[startR + r][startC + c] !== null) {
              return false;
            }
          }
        }
      }
      return true;
    }

    canFitAnywhere(matrix) {
      const rows = matrix.length;
      const cols = matrix[0].length;

      for (let r = 0; r <= BOARD_SIZE - rows; r++) {
        for (let c = 0; c <= BOARD_SIZE - cols; c++) {
          if (this.canFitAt(matrix, r, c)) {
            return true;
          }
        }
      }
      return false;
    }

    updateDockAvailability() {
      let anyCanFit = false;
      let remainingPieces = 0;

      const slotEls = this.dockEl.querySelectorAll('.dock-slot');
      slotEls.forEach((slotEl, idx) => {
        const pieceData = this.dockSlots[idx];
        const pieceEl = slotEl.querySelector('.piece');
        if (!pieceData || !pieceEl) return;

        remainingPieces++;
        const fits = this.canFitAnywhere(pieceData.matrix);
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

      // Pointer interactions on dock
      this.dockEl.addEventListener('pointerdown', (e) => this.onPointerDown(e));
      window.addEventListener('pointermove', (e) => this.onPointerMove(e));
      window.addEventListener('pointerup', (e) => this.onPointerUp(e));
      window.addEventListener('pointercancel', (e) => this.onPointerCancel(e));

      // Board interactions for tap-to-place & mouse hover preview
      this.boardEl.addEventListener('click', (e) => this.onBoardClick(e));
      this.boardEl.addEventListener('pointermove', (e) => this.onBoardPointerMove(e));
      this.boardEl.addEventListener('pointerleave', () => {
        if (this.selectedDockIndex !== null && !this.isDragging) {
          this.clearPreview();
        }
      });
    }

    onPointerDown(e) {
      if (this.isGameOver) return;

      const pieceEl = e.target.closest('.piece');
      if (!pieceEl || pieceEl.classList.contains('disabled')) return;

      const slotIdx = parseInt(pieceEl.dataset.slotIndex, 10);
      const pieceData = this.dockSlots[slotIdx];
      if (!pieceData) return;

      this.sound.playPick();

      this.isDragging = true;
      this.draggedSlotIndex = slotIdx;
      this.draggedShape = pieceData.matrix;
      this.draggedColor = pieceData.color;
      this.dragPointerType = e.pointerType;
      this.dragStartCoords = { x: e.clientX, y: e.clientY };

      // Pointer Capture
      try {
        pieceEl.setPointerCapture(e.pointerId);
        this.activePointerId = e.pointerId;
        this.activeCapturedEl = pieceEl;
      } catch (err) {
        // Pointer capture fallback
      }

      pieceEl.classList.add('is-dragging');

      this.createDragProxy(pieceData);
      this.updateDragProxyPosition(e.clientX, e.clientY);

      this.deselectDockPiece();
      e.preventDefault();
    }

    createDragProxy(pieceData) {
      this.dragProxyEl.innerHTML = '';
      this.dragProxyEl.className = 'drag-proxy';

      const rows = pieceData.matrix.length;
      const cols = pieceData.matrix[0].length;
      this.dragProxyEl.style.gridTemplateColumns = `repeat(${cols}, var(--cell-size))`;
      this.dragProxyEl.style.gridTemplateRows = `repeat(${rows}, var(--cell-size))`;

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const block = document.createElement('div');
          block.className = 'proxy-block';
          if (pieceData.matrix[r][c] === 1) {
            block.classList.add(pieceData.color);
          } else {
            block.classList.add('empty');
          }
          this.dragProxyEl.appendChild(block);
        }
      }

      this.dragProxyEl.classList.remove('hidden');
    }

    getPointerTargetCoords(clientX, clientY) {
      // In mobile touch, offset piece ~70px vertically so finger doesn't block view
      const isTouch = this.dragPointerType === 'touch';
      const offsetY = isTouch ? -70 : 0;
      return {
        x: clientX,
        y: clientY + offsetY
      };
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
      const targetPos = this.getGridCoordsFromPoint(target.x, target.y, this.draggedShape);

      if (targetPos) {
        this.updatePlacementPreview(targetPos.r, targetPos.c, this.draggedShape, this.draggedColor);
      } else {
        this.clearPreview();
      }
    }

    onPointerUp(e) {
      if (!this.isDragging) return;

      // Release pointer capture
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
      const targetPos = this.getGridCoordsFromPoint(target.x, target.y, this.draggedShape);

      let placed = false;
      if (targetPos && this.canFitAt(this.draggedShape, targetPos.r, targetPos.c)) {
        placed = this.placePiece(this.draggedSlotIndex, targetPos.r, targetPos.c);
      }

      // If user tapped without dragging
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
      this.draggedShape = null;
      this.draggedColor = null;
    }

    // Precise grid coordinate computation using actual cell dimensions
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

      // Center of shape relative to pointer
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

    updatePlacementPreview(startR, startC, matrix, color) {
      this.clearPreview();

      const canFit = this.canFitAt(matrix, startR, startC);
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
        if (this.grid[r][c]) {
          cell.classList.add('filled', this.grid[r][c]);
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
      const pieceData = this.dockSlots[this.selectedDockIndex];
      if (!pieceData) return;

      this.updatePlacementPreview(r, c, pieceData.matrix, pieceData.color);
    }

    onBoardClick(e) {
      if (this.selectedDockIndex === null) return;

      const cell = e.target.closest('.cell');
      if (!cell) return;

      const r = parseInt(cell.dataset.r, 10);
      const c = parseInt(cell.dataset.c, 10);
      const pieceData = this.dockSlots[this.selectedDockIndex];
      if (!pieceData) return;

      if (this.canFitAt(pieceData.matrix, r, c)) {
        this.placePiece(this.selectedDockIndex, r, c);
        this.deselectDockPiece();
      }
    }

    // ==========================================
    // Piece Placement & Line Blasts
    // ==========================================
    placePiece(slotIndex, startR, startC) {
      const pieceData = this.dockSlots[slotIndex];
      if (!pieceData) return false;

      const matrix = pieceData.matrix;
      const color = pieceData.color;
      let filledCount = 0;

      for (let r = 0; r < matrix.length; r++) {
        for (let c = 0; c < matrix[0].length; c++) {
          if (matrix[r][c] === 1) {
            this.grid[startR + r][startC + c] = color;
            filledCount++;
          }
        }
      }

      this.sound.playDrop();

      this.dockSlots[slotIndex] = null;
      this.renderDock();
      this.renderBoard();

      // Base placement points
      this.addScore(filledCount * 10);

      this.checkAndClearLines();
      return true;
    }

    checkAndClearLines() {
      const fullRows = [];
      const fullCols = [];

      for (let r = 0; r < BOARD_SIZE; r++) {
        if (this.grid[r].every(c => c !== null)) {
          fullRows.push(r);
        }
      }

      for (let c = 0; c < BOARD_SIZE; c++) {
        let isColFull = true;
        for (let r = 0; r < BOARD_SIZE; r++) {
          if (this.grid[r][c] === null) {
            isColFull = false;
            break;
          }
        }
        if (isColFull) {
          fullCols.push(c);
        }
      }

      const totalLines = fullRows.length + fullCols.length;

      if (totalLines > 0) {
        this.combo++;
        this.showCombo(this.combo, totalLines);

        const multiBonus = totalLines > 1 ? (totalLines - 1) * 150 : 0;
        const linePoints = (totalLines * 100 + multiBonus) * this.combo;
        this.addScore(linePoints);

        this.sound.playBlast(this.combo);
        if (totalLines >= 2) {
          this.triggerBoardShake();
        }

        const cellsToAnimate = new Set();
        fullRows.forEach(r => {
          for (let c = 0; c < BOARD_SIZE; c++) cellsToAnimate.add(`${r},${c}`);
        });
        fullCols.forEach(c => {
          for (let r = 0; r < BOARD_SIZE; r++) cellsToAnimate.add(`${r},${c}`);
        });

        // Trigger blast animation and blast particles
        cellsToAnimate.forEach(coord => {
          const [r, c] = coord.split(',').map(Number);
          const cell = this.boardEl.querySelector(`[data-r="${r}"][data-c="${c}"]`);
          if (cell) {
            cell.classList.add('blast-clearing');
            this.createBlastParticles(cell, this.grid[r][c]);
          }
        });

        this.showFloatingScore(`+${linePoints}`);

        setTimeout(() => {
          cellsToAnimate.forEach(coord => {
            const [r, c] = coord.split(',').map(Number);
            this.grid[r][c] = null;
          });
          this.renderBoard();
          this.postPlacementRoutine();
        }, 360);
      } else {
        this.combo = 0;
        this.hideCombo();
        this.postPlacementRoutine();
      }
    }

    postPlacementRoutine() {
      const allEmpty = this.dockSlots.every(s => s === null);
      if (allEmpty) {
        this.spawnDockPieces();
      }
      this.updateDockAvailability();
    }

    addScore(pts) {
      this.score += pts;
      this.scoreValEl.textContent = this.score;
      this.scoreValEl.classList.remove('score-bounce');
      void this.scoreValEl.offsetWidth;
      this.scoreValEl.classList.add('score-bounce');

      if (this.score > this.highScore) {
        this.highScore = this.score;
        this.highScoreValEl.textContent = this.highScore;
        localStorage.setItem('blockblast_highscore', this.highScore);
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

      // 4 particles per clearing block
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

    // ==========================================
    // Game Over Handling
    // ==========================================
    triggerGameOver() {
      if (this.isGameOver) return;
      this.isGameOver = true;

      this.sound.playGameOver();

      this.modalScoreEl.textContent = this.score;
      this.modalHighScoreEl.textContent = this.highScore;

      const isNewRecord = this.score >= this.highScore && this.score > 0;
      if (isNewRecord) {
        this.newRecordBadgeEl.classList.remove('hidden');
        this.sound.playNewRecord();
      } else {
        this.newRecordBadgeEl.classList.add('hidden');
      }

      this.modalEl.classList.remove('hidden');
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    new BlockBlastGame();
  });
})();
