// test-engine.js - Tests all functions of the WebAssembly assembly engine
const fs = require('fs');
const path = require('path');

const wasmBytes = fs.readFileSync(path.join(__dirname, 'engine.wasm'));
const mod = new WebAssembly.Module(wasmBytes);
const inst = new WebAssembly.Instance(mod);
const wasm = inst.exports;

console.log('--- Testing WebAssembly Game Engine ---');

// 1. Test init_game
wasm.init_game(12345, 500);
console.log('Score:', wasm.get_score(), '(expected 0)');
console.log('High Score:', wasm.get_high_score(), '(expected 500)');
console.log('Combo:', wasm.get_combo(), '(expected 0)');
console.log('Is Game Over:', wasm.get_is_game_over(), '(expected 0)');

// 2. Test board cell get/set
wasm.set_board_cell(0, 0, 7);
console.log('Board cell (0, 0):', wasm.get_board_cell(0, 0), '(expected 7)');
wasm.set_board_cell(0, 0, 0);
console.log('Board cell (0, 0) after reset:', wasm.get_board_cell(0, 0), '(expected 0)');

// 3. Test dock pieces
for (let i = 0; i < 3; i++) {
  console.log(`Slot ${i}: active=${wasm.get_dock_slot_active(i)}, color=${wasm.get_dock_slot_color(i)}, rows=${wasm.get_dock_slot_rows(i)}, cols=${wasm.get_dock_slot_cols(i)}`);
}

// 4. Test can_fit_at and placement
const active0 = wasm.get_dock_slot_active(0);
console.log('Slot 0 active:', active0);
const canFit = wasm.can_fit_at(0, 0, 0);
console.log('Slot 0 can fit at (0, 0):', canFit);
console.log('Slot 0 can fit anywhere:', wasm.can_fit_anywhere(0));

// Place slot 0 at 0, 0
const placedLines = wasm.place_piece(0, 0, 0);
console.log('Placed slot 0 at (0,0), lines cleared:', placedLines);
console.log('Slot 0 active after placement:', wasm.get_dock_slot_active(0), '(expected 0)');
console.log('New Score:', wasm.get_score());
console.log('Score Delta:', wasm.get_last_score_delta());

// 5. Test line blast by filling an entire row
wasm.reset_board();
// Fill row 3 cols 0..6
for (let c = 0; c < 7; c++) {
  wasm.set_board_cell(3, c, 1);
}
// Manually set dock slot 0 to 1x1 dot
wasm.copy_shape_to_slot(0, 0); // shape 0 is 1x1 dot
const linesCleared = wasm.place_piece(0, 3, 7);
console.log('Line blast test: lines cleared:', linesCleared, '(expected 1)');
console.log('Cleared rows mask:', wasm.get_cleared_rows_mask(), '(expected 8, which is 1<<3)');
console.log('Combo:', wasm.get_combo(), '(expected 1)');
console.log('Score delta for line clear:', wasm.get_last_score_delta());

// Clear the blasted line
wasm.clear_cleared_lines();
console.log('Row 3 col 7 after clear:', wasm.get_board_cell(3, 7), '(expected 0)');
console.log('Row 3 col 0 after clear:', wasm.get_board_cell(3, 0), '(expected 0)');
console.log('Cleared rows mask after clear:', wasm.get_cleared_rows_mask(), '(expected 0)');

// 6. Test replenish dock
wasm.check_and_replenish_dock();
console.log('Dock replenished check done. Game over status:', wasm.get_is_game_over());

console.log('ALL WASM ENGINE TESTS PASSED SUCCESSFULLY! 🎉');
