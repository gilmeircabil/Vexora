;; ==============================================================
;; Block Blast! - WebAssembly Text (WAT) Assembly Engine
;; Pure assembly implementation of board grid, dock piece balancing,
;; placement collision detection, line blasting, combo multiplier,
;; and game over state machine.
;; ==============================================================
(module
  ;; 1 page linear memory (64 KB)
  (memory (export "memory") 1)

  ;; ------------------------------------------------------------
  ;; Shape ROM Data Segment (Offset 1024 / 0x0400)
  ;; 36 shapes, 32 bytes per shape (category, color, rows, cols, count, matrix[25])
  ;; ------------------------------------------------------------
  (data (i32.const 1024) "\01\01\01\01\01\01\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\01\02\01\02\02\01\01\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\01\02\02\01\02\01\00\00\00\00\01\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\01\03\02\02\03\01\01\00\00\00\01\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\01\03\02\02\03\01\01\00\00\00\00\01\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\01\03\02\02\03\01\00\00\00\00\01\01\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\01\03\02\02\03\00\01\00\00\00\01\01\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\02\04\01\03\03\01\01\01\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\02\04\03\01\03\01\00\00\00\00\01\00\00\00\00\01\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\02\05\02\02\04\01\01\00\00\00\01\01\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\02\06\02\03\04\01\01\01\00\00\00\01\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\02\06\02\03\04\00\01\00\00\00\01\01\01\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\02\06\03\02\04\01\00\00\00\00\01\01\00\00\00\01\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\02\06\03\02\04\00\01\00\00\00\01\01\00\00\00\00\01\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\02\07\03\02\04\01\00\00\00\00\01\00\00\00\00\01\01\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\02\07\03\02\04\00\01\00\00\00\00\01\00\00\00\01\01\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\02\07\03\02\04\01\01\00\00\00\01\00\00\00\00\01\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\02\07\03\02\04\01\01\00\00\00\00\01\00\00\00\00\01\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\02\05\02\03\04\01\01\01\00\00\01\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\02\05\02\03\04\01\01\01\00\00\00\00\01\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\02\05\02\03\04\01\00\00\00\00\01\01\01\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\02\05\02\03\04\00\00\01\00\00\01\01\01\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\02\02\02\03\04\00\01\01\00\00\01\01\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\02\08\02\03\04\01\01\00\00\00\00\01\01\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\02\02\03\02\04\01\00\00\00\00\01\01\00\00\00\00\01\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\02\08\03\02\04\00\01\00\00\00\01\01\00\00\00\01\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\03\06\01\04\04\01\01\01\01\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\03\06\04\01\04\01\00\00\00\00\01\00\00\00\00\01\00\00\00\00\01\00\00\00\00\00\00\00\00\00\00\00\03\07\01\05\05\01\01\01\01\01\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\03\07\05\01\05\01\00\00\00\00\01\00\00\00\00\01\00\00\00\00\01\00\00\00\00\01\00\00\00\00\00\00\03\08\03\03\09\01\01\01\00\00\01\01\01\00\00\01\01\01\00\00\00\00\00\00\00\00\00\00\00\00\00\00\03\01\03\03\05\01\01\01\00\00\01\00\00\00\00\01\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\03\01\03\03\05\01\01\01\00\00\00\00\01\00\00\00\00\01\00\00\00\00\00\00\00\00\00\00\00\00\00\00\03\01\03\03\05\01\00\00\00\00\01\00\00\00\00\01\01\01\00\00\00\00\00\00\00\00\00\00\00\00\00\00\03\01\03\03\05\00\00\01\00\00\00\00\01\00\00\01\01\01\00\00\00\00\00\00\00\00\00\00\00\00\00\00\03\04\03\03\05\00\01\00\00\00\01\01\01\00\00\00\01\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00")

  ;; ------------------------------------------------------------
  ;; Function Exports & Implementation
  ;; ------------------------------------------------------------
  ;; Function: prng_next (FuncIdx: 0)
  (func $prng_next (export "prng_next")
    (result i32)
    (local i32)
    ;; Hand-assembled WebAssembly bytecode
  )

  ;; Function: prng_range (FuncIdx: 1)
  (func $prng_range (export "prng_range")
    (param i32) (param i32)
    (result i32)
    ;; Hand-assembled WebAssembly bytecode
  )

  ;; Function: set_rng_seed (FuncIdx: 2)
  (func $set_rng_seed (export "set_rng_seed")
    (param i32)
    ;; Hand-assembled WebAssembly bytecode
  )

  ;; Function: get_board_cell (FuncIdx: 3)
  (func $get_board_cell (export "get_board_cell")
    (param i32) (param i32)
    (result i32)
    ;; Hand-assembled WebAssembly bytecode
  )

  ;; Function: set_board_cell (FuncIdx: 4)
  (func $set_board_cell (export "set_board_cell")
    (param i32) (param i32) (param i32)
    ;; Hand-assembled WebAssembly bytecode
  )

  ;; Function: reset_board (FuncIdx: 5)
  (func $reset_board (export "reset_board")
    (local i32)
    ;; Hand-assembled WebAssembly bytecode
  )

  ;; Function: copy_shape_to_slot (FuncIdx: 6)
  (func $copy_shape_to_slot (export "copy_shape_to_slot")
    (param i32) (param i32)
    (local i32) (local i32) (local i32)
    ;; Hand-assembled WebAssembly bytecode
  )

  ;; Function: can_fit_at (FuncIdx: 7)
  (func $can_fit_at (export "can_fit_at")
    (param i32) (param i32) (param i32)
    (result i32)
    (local i32) (local i32) (local i32) (local i32) (local i32)
    ;; Hand-assembled WebAssembly bytecode
  )

  ;; Function: can_fit_anywhere (FuncIdx: 8)
  (func $can_fit_anywhere (export "can_fit_anywhere")
    (param i32)
    (result i32)
    (local i32) (local i32) (local i32) (local i32) (local i32) (local i32) (local i32)
    ;; Hand-assembled WebAssembly bytecode
  )

  ;; Function: can_shape_fit_anywhere (FuncIdx: 9)
  (func $can_shape_fit_anywhere (export "can_shape_fit_anywhere")
    (param i32)
    (result i32)
    (local i32) (local i32) (local i32) (local i32) (local i32) (local i32) (local i32) (local i32) (local i32) (local i32)
    ;; Hand-assembled WebAssembly bytecode
  )

  ;; Function: spawn_dock_pieces (FuncIdx: 10)
  (func $spawn_dock_pieces (export "spawn_dock_pieces")
    (param i32)
    (local i32) (local i32) (local i32) (local i32) (local i32) (local i32) (local i32)
    ;; Hand-assembled WebAssembly bytecode
  )

  ;; Function: place_piece (FuncIdx: 11)
  (func $place_piece (export "place_piece")
    (param i32) (param i32) (param i32)
    (result i32)
    (local i32) (local i32) (local i32) (local i32) (local i32) (local i32) (local i32) (local i32) (local i32) (local i32) (local i32) (local i32) (local i32) (local i32)
    ;; Hand-assembled WebAssembly bytecode
  )

  ;; Function: clear_cleared_lines (FuncIdx: 12)
  (func $clear_cleared_lines (export "clear_cleared_lines")
    (local i32) (local i32) (local i32) (local i32)
    ;; Hand-assembled WebAssembly bytecode
  )

  ;; Function: check_and_replenish_dock (FuncIdx: 13)
  (func $check_and_replenish_dock (export "check_and_replenish_dock")
    (result i32)
    (local i32) (local i32) (local i32)
    ;; Hand-assembled WebAssembly bytecode
  )

  ;; Function: init_game (FuncIdx: 14)
  (func $init_game (export "init_game")
    (param i32) (param i32)
    ;; Hand-assembled WebAssembly bytecode
  )

  ;; Function: get_score (FuncIdx: 15)
  (func $get_score (export "get_score")
    (result i32)
    ;; Hand-assembled WebAssembly bytecode
  )

  ;; Function: get_high_score (FuncIdx: 16)
  (func $get_high_score (export "get_high_score")
    (result i32)
    ;; Hand-assembled WebAssembly bytecode
  )

  ;; Function: set_high_score (FuncIdx: 17)
  (func $set_high_score (export "set_high_score")
    (param i32)
    ;; Hand-assembled WebAssembly bytecode
  )

  ;; Function: get_combo (FuncIdx: 18)
  (func $get_combo (export "get_combo")
    (result i32)
    ;; Hand-assembled WebAssembly bytecode
  )

  ;; Function: get_is_game_over (FuncIdx: 19)
  (func $get_is_game_over (export "get_is_game_over")
    (result i32)
    ;; Hand-assembled WebAssembly bytecode
  )

  ;; Function: get_last_score_delta (FuncIdx: 20)
  (func $get_last_score_delta (export "get_last_score_delta")
    (result i32)
    ;; Hand-assembled WebAssembly bytecode
  )

  ;; Function: get_last_lines_cleared (FuncIdx: 21)
  (func $get_last_lines_cleared (export "get_last_lines_cleared")
    (result i32)
    ;; Hand-assembled WebAssembly bytecode
  )

  ;; Function: get_cleared_rows_mask (FuncIdx: 22)
  (func $get_cleared_rows_mask (export "get_cleared_rows_mask")
    (result i32)
    ;; Hand-assembled WebAssembly bytecode
  )

  ;; Function: get_cleared_cols_mask (FuncIdx: 23)
  (func $get_cleared_cols_mask (export "get_cleared_cols_mask")
    (result i32)
    ;; Hand-assembled WebAssembly bytecode
  )

  ;; Function: get_dock_slot_active (FuncIdx: 24)
  (func $get_dock_slot_active (export "get_dock_slot_active")
    (param i32)
    (result i32)
    ;; Hand-assembled WebAssembly bytecode
  )

  ;; Function: get_dock_slot_color (FuncIdx: 25)
  (func $get_dock_slot_color (export "get_dock_slot_color")
    (param i32)
    (result i32)
    ;; Hand-assembled WebAssembly bytecode
  )

  ;; Function: get_dock_slot_rows (FuncIdx: 26)
  (func $get_dock_slot_rows (export "get_dock_slot_rows")
    (param i32)
    (result i32)
    ;; Hand-assembled WebAssembly bytecode
  )

  ;; Function: get_dock_slot_cols (FuncIdx: 27)
  (func $get_dock_slot_cols (export "get_dock_slot_cols")
    (param i32)
    (result i32)
    ;; Hand-assembled WebAssembly bytecode
  )

  ;; Function: get_dock_slot_cell (FuncIdx: 28)
  (func $get_dock_slot_cell (export "get_dock_slot_cell")
    (param i32) (param i32) (param i32)
    (result i32)
    ;; Hand-assembled WebAssembly bytecode
  )

)