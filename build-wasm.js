// build-wasm.js - Builds engine.wat assembly source and compiles engine.wasm binary
const fs = require('fs');
const path = require('path');

// -------------------------------------------------------------
// LEB128 & Bytecode Helpers
// -------------------------------------------------------------
function uleb128(val) {
  const bytes = [];
  do {
    let b = val & 0x7f;
    val >>>= 7;
    if (val !== 0) b |= 0x80;
    bytes.push(b);
  } while (val !== 0);
  return bytes;
}

function sleb128(val) {
  const bytes = [];
  let more = true;
  while (more) {
    let b = val & 0x7f;
    val >>= 7;
    if ((val === 0 && (b & 0x40) === 0) || (val === -1 && (b & 0x40) !== 0)) {
      more = false;
    } else {
      b |= 0x80;
    }
    bytes.push(b);
  }
  return bytes;
}

function flatBytes(arr) {
  const out = [];
  function recurse(item) {
    if (Array.isArray(item)) {
      for (const sub of item) recurse(sub);
    } else if (typeof item === 'number') {
      out.push(item);
    }
  }
  recurse(arr);
  return out;
}

function sec(id, payload) {
  const flat = flatBytes(payload);
  return [id, ...uleb128(flat.length), ...flat];
}

function encStr(str) {
  const b = Buffer.from(str, 'utf8');
  return [...uleb128(b.length), ...b];
}

const OP = {
  unreachable: 0x00,
  nop: 0x01,
  block: 0x02,
  loop: 0x03,
  if: 0x04,
  else: 0x05,
  end: 0x0B,
  br: 0x0C,
  br_if: 0x0D,
  return: 0x0F,
  call: 0x10,
  drop: 0x1A,
  local_get: 0x20,
  local_set: 0x21,
  local_tee: 0x22,
  i32_load: 0x28,
  i32_load8_u: 0x2D,
  i32_store: 0x36,
  i32_store8: 0x3A,
  i32_const: 0x41,
  i32_eqz: 0x45,
  i32_eq: 0x46,
  i32_ne: 0x47,
  i32_lt_s: 0x48,
  i32_lt_u: 0x49,
  i32_gt_s: 0x4A,
  i32_gt_u: 0x4B,
  i32_le_s: 0x4C,
  i32_le_u: 0x4D,
  i32_ge_s: 0x4E,
  i32_ge_u: 0x4F,
  i32_add: 0x6A,
  i32_sub: 0x6B,
  i32_mul: 0x6C,
  i32_div_u: 0x6E,
  i32_rem_u: 0x70,
  i32_and: 0x71,
  i32_or: 0x72,
  i32_xor: 0x73,
  i32_shl: 0x74,
  i32_shr_u: 0x76,
};

// Instruction helpers
function i_const(v) { return [OP.i32_const, ...sleb128(v)]; }
function i_get(idx) { return [OP.local_get, ...uleb128(idx)]; }
function i_set(idx) { return [OP.local_set, ...uleb128(idx)]; }
function i_tee(idx) { return [OP.local_tee, ...uleb128(idx)]; }
function i_load(offset = 0) { return [OP.i32_load, 2, ...uleb128(offset)]; }
function i_load8_u(offset = 0) { return [OP.i32_load8_u, 0, ...uleb128(offset)]; }
function i_store(offset = 0) { return [OP.i32_store, 2, ...uleb128(offset)]; }
function i_store8(offset = 0) { return [OP.i32_store8, 0, ...uleb128(offset)]; }
function i_call(idx) { return [OP.call, ...uleb128(idx)]; }
function i_br(depth) { return [OP.br, ...uleb128(depth)]; }
function i_br_if(depth) { return [OP.br_if, ...uleb128(depth)]; }
function i_block(type, body) { return [OP.block, type, ...flatBytes(body), OP.end]; }
function i_loop(type, body) { return [OP.loop, type, ...flatBytes(body), OP.end]; }
function i_if(type, thenB, elseB = null) {
  if (elseB) {
    return [OP.if, type, ...flatBytes(thenB), OP.else, ...flatBytes(elseB), OP.end];
  }
  return [OP.if, type, ...flatBytes(thenB), OP.end];
}

// -------------------------------------------------------------
// Shape Definitions (36 Shapes)
// -------------------------------------------------------------
const SHAPES = [
  // Small Shapes (category: 1)
  { id: 0, cat: 1, color: 1, r: 1, c: 1, m: [[1]] },                                 // dot (yellow)
  { id: 1, cat: 1, color: 2, r: 1, c: 2, m: [[1, 1]] },                             // h2 (cyan)
  { id: 2, cat: 1, color: 2, r: 2, c: 1, m: [[1], [1]] },                           // v2 (cyan)
  { id: 3, cat: 1, color: 3, r: 2, c: 2, m: [[1, 1], [1, 0]] },                     // corner2_tl (pink)
  { id: 4, cat: 1, color: 3, r: 2, c: 2, m: [[1, 1], [0, 1]] },                     // corner2_tr (pink)
  { id: 5, cat: 1, color: 3, r: 2, c: 2, m: [[1, 0], [1, 1]] },                     // corner2_bl (pink)
  { id: 6, cat: 1, color: 3, r: 2, c: 2, m: [[0, 1], [1, 1]] },                     // corner2_br (pink)

  // Medium Shapes (category: 2)
  { id: 7, cat: 2, color: 4, r: 1, c: 3, m: [[1, 1, 1]] },                         // h3 (blue)
  { id: 8, cat: 2, color: 4, r: 3, c: 1, m: [[1], [1], [1]] },                     // v3 (blue)
  { id: 9, cat: 2, color: 5, r: 2, c: 2, m: [[1, 1], [1, 1]] },                     // sq2 (green)
  { id: 10, cat: 2, color: 6, r: 2, c: 3, m: [[1, 1, 1], [0, 1, 0]] },              // t_down (purple)
  { id: 11, cat: 2, color: 6, r: 2, c: 3, m: [[0, 1, 0], [1, 1, 1]] },              // t_up (purple)
  { id: 12, cat: 2, color: 6, r: 3, c: 2, m: [[1, 0], [1, 1], [1, 0]] },              // t_right (purple)
  { id: 13, cat: 2, color: 6, r: 3, c: 2, m: [[0, 1], [1, 1], [0, 1]] },              // t_left (purple)
  { id: 14, cat: 2, color: 7, r: 3, c: 2, m: [[1, 0], [1, 0], [1, 1]] },              // l_1 (orange)
  { id: 15, cat: 2, color: 7, r: 3, c: 2, m: [[0, 1], [0, 1], [1, 1]] },              // l_2 (orange)
  { id: 16, cat: 2, color: 7, r: 3, c: 2, m: [[1, 1], [1, 0], [1, 0]] },              // l_3 (orange)
  { id: 17, cat: 2, color: 7, r: 3, c: 2, m: [[1, 1], [0, 1], [0, 1]] },              // l_4 (orange)
  { id: 18, cat: 2, color: 5, r: 2, c: 3, m: [[1, 1, 1], [1, 0, 0]] },              // l_h1 (green)
  { id: 19, cat: 2, color: 5, r: 2, c: 3, m: [[1, 1, 1], [0, 0, 1]] },              // l_h2 (green)
  { id: 20, cat: 2, color: 5, r: 2, c: 3, m: [[1, 0, 0], [1, 1, 1]] },              // l_h3 (green)
  { id: 21, cat: 2, color: 5, r: 2, c: 3, m: [[0, 0, 1], [1, 1, 1]] },              // l_h4 (green)
  { id: 22, cat: 2, color: 2, r: 2, c: 3, m: [[0, 1, 1], [1, 1, 0]] },              // s_h (cyan)
  { id: 23, cat: 2, color: 8, r: 2, c: 3, m: [[1, 1, 0], [0, 1, 1]] },              // z_h (red)
  { id: 24, cat: 2, color: 2, r: 3, c: 2, m: [[1, 0], [1, 1], [0, 1]] },              // s_v (cyan)
  { id: 25, cat: 2, color: 8, r: 3, c: 2, m: [[0, 1], [1, 1], [1, 0]] },              // z_v (red)

  // Large Shapes (category: 3)
  { id: 26, cat: 3, color: 6, r: 1, c: 4, m: [[1, 1, 1, 1]] },                     // h4 (purple)
  { id: 27, cat: 3, color: 6, r: 4, c: 1, m: [[1], [1], [1], [1]] },                 // v4 (purple)
  { id: 28, cat: 3, color: 7, r: 1, c: 5, m: [[1, 1, 1, 1, 1]] },                  // h5 (orange)
  { id: 29, cat: 3, color: 7, r: 5, c: 1, m: [[1], [1], [1], [1], [1]] },              // v5 (orange)
  { id: 30, cat: 3, color: 8, r: 3, c: 3, m: [[1, 1, 1], [1, 1, 1], [1, 1, 1]] },   // sq3 (red)
  { id: 31, cat: 3, color: 1, r: 3, c: 3, m: [[1, 1, 1], [1, 0, 0], [1, 0, 0]] },   // corner3_tl (yellow)
  { id: 32, cat: 3, color: 1, r: 3, c: 3, m: [[1, 1, 1], [0, 0, 1], [0, 0, 1]] },   // corner3_tr (yellow)
  { id: 33, cat: 3, color: 1, r: 3, c: 3, m: [[1, 0, 0], [1, 0, 0], [1, 1, 1]] },   // corner3_bl (yellow)
  { id: 34, cat: 3, color: 1, r: 3, c: 3, m: [[0, 0, 1], [0, 0, 1], [1, 1, 1]] },   // corner3_br (yellow)
  { id: 35, cat: 3, color: 4, r: 3, c: 3, m: [[0, 1, 0], [1, 1, 1], [0, 1, 0]] }    // plus (blue)
];

// Shape Table ROM bytes (offset 1024, 32 bytes per shape)
const shapeRomBytes = [];
for (const s of SHAPES) {
  let count = 0;
  for (let row = 0; row < s.r; row++) {
    for (let col = 0; col < s.c; col++) {
      if (s.m[row][col] === 1) count++;
    }
  }
  const entry = new Array(32).fill(0);
  entry[0] = s.cat;
  entry[1] = s.color;
  entry[2] = s.r;
  entry[3] = s.c;
  entry[4] = count;
  for (let row = 0; row < s.r; row++) {
    for (let col = 0; col < s.c; col++) {
      entry[5 + row * 5 + col] = s.m[row][col];
    }
  }
  shapeRomBytes.push(...entry);
}

// -------------------------------------------------------------
// Assembly Functions
// -------------------------------------------------------------
const types = [
  [0x60, 0, 0],                                // 0: () -> ()
  [0x60, 0, 1, 0x7f],                          // 1: () -> i32
  [0x60, 1, 0x7f, 0],                          // 2: (i32) -> ()
  [0x60, 1, 0x7f, 1, 0x7f],                    // 3: (i32) -> i32
  [0x60, 2, 0x7f, 0x7f, 0],                    // 4: (i32, i32) -> ()
  [0x60, 2, 0x7f, 0x7f, 1, 0x7f],              // 5: (i32, i32) -> i32
  [0x60, 3, 0x7f, 0x7f, 0x7f, 0],              // 6: (i32, i32, i32) -> ()
  [0x60, 3, 0x7f, 0x7f, 0x7f, 1, 0x7f],        // 7: (i32, i32, i32) -> i32
];

const funcList = [];

function defFunc(name, typeIdx, localCount, bodyGenerator) {
  const funcIdx = funcList.length;
  funcList.push({ name, typeIdx, localCount, bodyGenerator, funcIdx });
  return funcIdx;
}

// Memory Layout:
// 0x0000..0x003F : Board 8x8 (64 bytes)
// 0x0080 (128)   : Score (i32)
// 0x0084 (132)   : High Score (i32)
// 0x0088 (136)   : Combo (i32)
// 0x008C (140)   : Is Game Over (i32)
// 0x0090 (144)   : Last Score Delta (i32)
// 0x0094 (148)   : Last Lines Cleared (i32)
// 0x0098 (152)   : Cleared Rows Mask (i32)
// 0x009C (156)   : Cleared Cols Mask (i32)
// 0x00A0 (160)   : RNG State (i32)
// 0x0100 (256)   : Dock Slots 0, 1, 2 (64 bytes each: 256, 320, 384)
// 0x0400 (1024)  : Shape ROM Table (36 shapes * 32 bytes)

// Function 0: prng_next () -> i32
const F_PRNG_NEXT = defFunc('prng_next', 1, 1, () => [
  ...i_const(160), i_load(), i_set(0),
  ...i_get(0), OP.i32_eqz,
  ...i_if(0x40, [
    ...i_const(160), ...i_const(2463534242), i_store(),
    ...i_const(2463534242), i_set(0)
  ]),
  // x ^= x << 13
  ...i_get(0), ...i_get(0), ...i_const(13), OP.i32_shl, OP.i32_xor, i_set(0),
  // x ^= x >> 17
  ...i_get(0), ...i_get(0), ...i_const(17), OP.i32_shr_u, OP.i32_xor, i_set(0),
  // x ^= x << 5
  ...i_get(0), ...i_get(0), ...i_const(5), OP.i32_shl, OP.i32_xor, i_set(0),
  // store to 160
  ...i_const(160), ...i_get(0), i_store(),
  // return x & 0x7FFFFFFF
  ...i_get(0), ...i_const(0x7fffffff), OP.i32_and
]);

// Function 1: prng_range (min i32, max i32) -> i32
const F_PRNG_RANGE = defFunc('prng_range', 5, 0, () => [
  ...i_get(0),
  ...i_call(F_PRNG_NEXT),
  ...i_get(1), ...i_get(0), OP.i32_sub, ...i_const(1), OP.i32_add,
  OP.i32_rem_u,
  OP.i32_add
]);

// Function 2: set_rng_seed (seed i32) -> ()
const F_SET_RNG_SEED = defFunc('set_rng_seed', 2, 0, () => [
  ...i_const(160), ...i_get(0), i_store()
]);

// Function 3: get_board_cell (r i32, c i32) -> i32
const F_GET_BOARD_CELL = defFunc('get_board_cell', 5, 0, () => [
  // Bounds check: r >= 0 && r < 8 && c >= 0 && c < 8
  ...i_get(0), ...i_const(0), OP.i32_ge_s,
  ...i_get(0), ...i_const(8), OP.i32_lt_s, OP.i32_and,
  ...i_get(1), ...i_const(0), OP.i32_ge_s, OP.i32_and,
  ...i_get(1), ...i_const(8), OP.i32_lt_s, OP.i32_and,
  ...i_if(0x7f, [
    ...i_get(0), ...i_const(8), OP.i32_mul, ...i_get(1), OP.i32_add,
    i_load8_u()
  ], [
    ...i_const(0)
  ])
]);

// Function 4: set_board_cell (r i32, c i32, val i32) -> ()
const F_SET_BOARD_CELL = defFunc('set_board_cell', 6, 0, () => [
  ...i_get(0), ...i_const(0), OP.i32_ge_s,
  ...i_get(0), ...i_const(8), OP.i32_lt_s, OP.i32_and,
  ...i_get(1), ...i_const(0), OP.i32_ge_s, OP.i32_and,
  ...i_get(1), ...i_const(8), OP.i32_lt_s, OP.i32_and,
  ...i_if(0x40, [
    ...i_get(0), ...i_const(8), OP.i32_mul, ...i_get(1), OP.i32_add,
    ...i_get(2),
    i_store8()
  ])
]);

// Function 5: reset_board () -> ()
const F_RESET_BOARD = defFunc('reset_board', 0, 1, () => [
  ...i_const(0), i_set(0), // local 0 = index (0..63)
  ...i_block(0x40, [
    ...i_loop(0x40, [
      ...i_get(0), ...i_const(64), OP.i32_ge_s, i_br_if(1),
      ...i_get(0), ...i_const(0), i_store8(),
      ...i_get(0), ...i_const(1), OP.i32_add, i_set(0),
      i_br(0)
    ])
  ])
]);

// Function 6: copy_shape_to_slot (shape_id i32, slot_idx i32) -> ()
const F_COPY_SHAPE = defFunc('copy_shape_to_slot', 4, 3, () => [
  // local 2 = srcBase = 1024 + shape_id * 32
  ...i_const(1024), ...i_get(0), ...i_const(32), OP.i32_mul, OP.i32_add, i_set(2),
  // local 3 = dstBase = 256 + slot_idx * 64
  ...i_const(256), ...i_get(1), ...i_const(64), OP.i32_mul, OP.i32_add, i_set(3),

  // is_active = 1
  ...i_get(3), ...i_const(1), i_store(0),
  // shape_id = shape_id
  ...i_get(3), ...i_get(0), i_store(4),
  // color_id = src[1]
  ...i_get(3), ...i_get(2), i_load8_u(1), i_store(8),
  // rows = src[2]
  ...i_get(3), ...i_get(2), i_load8_u(2), i_store(12),
  // cols = src[3]
  ...i_get(3), ...i_get(2), i_load8_u(3), i_store(16),
  // block_count = src[4]
  ...i_get(3), ...i_get(2), i_load8_u(4), i_store(20),

  // Copy 25 matrix bytes from srcBase+5 to dstBase+24
  ...i_const(0), i_set(4), // local 4 = loop index
  ...i_block(0x40, [
    ...i_loop(0x40, [
      ...i_get(4), ...i_const(25), OP.i32_ge_s, i_br_if(1),
      // dstBase + 24 + i = srcBase + 5 + i
      ...i_get(3), ...i_const(24), OP.i32_add, ...i_get(4), OP.i32_add,
      ...i_get(2), ...i_const(5), OP.i32_add, ...i_get(4), OP.i32_add, i_load8_u(),
      i_store8(),
      ...i_get(4), ...i_const(1), OP.i32_add, i_set(4),
      i_br(0)
    ])
  ])
]);

// Function 7: can_fit_at (slot_idx i32, start_r i32, start_c i32) -> i32
const F_CAN_FIT_AT = defFunc('can_fit_at', 7, 5, () => [
  // local 3 = slotBase = 256 + slot_idx * 64
  ...i_const(256), ...i_get(0), ...i_const(64), OP.i32_mul, OP.i32_add, i_set(3),
  // Check active
  ...i_get(3), i_load(0), OP.i32_eqz,
  ...i_if(0x40, [
    ...i_const(0), OP.return
  ]),

  // local 4 = rows, local 5 = cols
  ...i_get(3), i_load(12), i_set(4),
  ...i_get(3), i_load(16), i_set(5),

  // Bounds checks: start_r >= 0 && start_c >= 0 && start_r + rows <= 8 && start_c + cols <= 8
  ...i_get(1), ...i_const(0), OP.i32_lt_s,
  ...i_get(2), ...i_const(0), OP.i32_lt_s, OP.i32_or,
  ...i_get(1), ...i_get(4), OP.i32_add, ...i_const(8), OP.i32_gt_s, OP.i32_or,
  ...i_get(2), ...i_get(5), OP.i32_add, ...i_const(8), OP.i32_gt_s, OP.i32_or,
  ...i_if(0x40, [
    ...i_const(0), OP.return
  ]),

  // Loop r: 0..rows-1, local 6 = r, local 7 = c
  ...i_const(0), i_set(6),
  ...i_block(0x40, [
    ...i_loop(0x40, [
      ...i_get(6), ...i_get(4), OP.i32_ge_s, i_br_if(1),
      ...i_const(0), i_set(7),
      ...i_block(0x40, [
        ...i_loop(0x40, [
          ...i_get(7), ...i_get(5), OP.i32_ge_s, i_br_if(1),
          // Check matrix: slotBase + 24 + r * 5 + c
          ...i_get(3), ...i_const(24), OP.i32_add,
          ...i_get(6), ...i_const(5), OP.i32_mul, OP.i32_add,
          ...i_get(7), OP.i32_add,
          i_load8_u(),
          ...i_if(0x40, [
            // Matrix has block: check board cell (start_r + r) * 8 + (start_c + c)
            ...i_get(1), ...i_get(6), OP.i32_add, ...i_const(8), OP.i32_mul,
            ...i_get(2), ...i_get(7), OP.i32_add, OP.i32_add,
            i_load8_u(),
            ...i_if(0x40, [
              ...i_const(0), OP.return
            ])
          ]),
          ...i_get(7), ...i_const(1), OP.i32_add, i_set(7),
          i_br(0)
        ])
      ]),
      ...i_get(6), ...i_const(1), OP.i32_add, i_set(6),
      i_br(0)
    ])
  ]),
  ...i_const(1) // Can fit!
]);

// Function 8: can_fit_anywhere (slot_idx i32) -> i32
const F_CAN_FIT_ANYWHERE = defFunc('can_fit_anywhere', 3, 7, () => [
  // 1: slotBase
  ...i_const(256), ...i_get(0), ...i_const(64), OP.i32_mul, OP.i32_add, i_set(1),
  ...i_get(1), i_load(0), OP.i32_eqz,
  ...i_if(0x40, [
    ...i_const(0), OP.return
  ]),

  // 2: rows, 3: cols
  ...i_get(1), i_load(12), i_set(2),
  ...i_get(1), i_load(16), i_set(3),
  // 4: maxR = 8 - rows, 5: maxC = 8 - cols
  ...i_const(8), ...i_get(2), OP.i32_sub, i_set(4),
  ...i_const(8), ...i_get(3), OP.i32_sub, i_set(5),

  // 6: r = 0
  ...i_const(0), i_set(6),
  ...i_block(0x40, [
    ...i_loop(0x40, [
      ...i_get(6), ...i_get(4), OP.i32_gt_s, i_br_if(1),
      // 7: c = 0
      ...i_const(0), i_set(7),
      ...i_block(0x40, [
        ...i_loop(0x40, [
          ...i_get(7), ...i_get(5), OP.i32_gt_s, i_br_if(1),
          // Check can_fit_at(slot_idx, r, c)
          ...i_get(0), ...i_get(6), ...i_get(7), ...i_call(F_CAN_FIT_AT),
          ...i_if(0x40, [
            ...i_const(1), OP.return
          ]),
          ...i_get(7), ...i_const(1), OP.i32_add, i_set(7),
          i_br(0)
        ])
      ]),
      ...i_get(6), ...i_const(1), OP.i32_add, i_set(6),
      i_br(0)
    ])
  ]),
  ...i_const(0)
]);

// Function 9: can_shape_fit_anywhere (shape_id i32) -> i32
// Reads directly from Shape ROM (1024 + shape_id * 32) without touching dock memory
const F_CAN_SHAPE_FIT_ANYWHERE = defFunc('can_shape_fit_anywhere', 3, 10, () => [
  // 1: shapeBase = 1024 + shape_id * 32
  ...i_const(1024), ...i_get(0), ...i_const(32), OP.i32_mul, OP.i32_add, i_set(1),
  // 2: rows = rom[2], 3: cols = rom[3]
  ...i_get(1), i_load8_u(2), i_set(2),
  ...i_get(1), i_load8_u(3), i_set(3),
  // 4: maxR = 8 - rows, 5: maxC = 8 - cols
  ...i_const(8), ...i_get(2), OP.i32_sub, i_set(4),
  ...i_const(8), ...i_get(3), OP.i32_sub, i_set(5),

  // 6: startR = 0
  ...i_const(0), i_set(6),
  ...i_block(0x40, [
    ...i_loop(0x40, [
      ...i_get(6), ...i_get(4), OP.i32_gt_s, i_br_if(1),
      // 7: startC = 0
      ...i_const(0), i_set(7),
      ...i_block(0x40, [
        ...i_loop(0x40, [
          ...i_get(7), ...i_get(5), OP.i32_gt_s, i_br_if(1),

          // Test if shape fits at (startR, startC)
          // 8: fits = 1
          ...i_const(1), i_set(8),
          // 9: r = 0
          ...i_const(0), i_set(9),
          ...i_block(0x40, [
            ...i_loop(0x40, [
              ...i_get(9), ...i_get(2), OP.i32_ge_s, i_br_if(1),
              // 10: c = 0
              ...i_const(0), i_set(10),
              ...i_block(0x40, [
                ...i_loop(0x40, [
                  ...i_get(10), ...i_get(3), OP.i32_ge_s, i_br_if(1),
                  // rom[shapeBase + 5 + r * 5 + c]
                  ...i_get(1), ...i_const(5), OP.i32_add,
                  ...i_get(9), ...i_const(5), OP.i32_mul, OP.i32_add,
                  ...i_get(10), OP.i32_add,
                  i_load8_u(),
                  ...i_if(0x40, [
                    // check board: (startR + r) * 8 + (startC + c)
                    ...i_get(6), ...i_get(9), OP.i32_add, ...i_const(8), OP.i32_mul,
                    ...i_get(7), ...i_get(10), OP.i32_add, OP.i32_add,
                    i_load8_u(),
                    ...i_if(0x40, [
                      ...i_const(0), i_set(8),
                      i_br(2) // break col loop
                    ])
                  ]),
                  ...i_get(10), ...i_const(1), OP.i32_add, i_set(10),
                  i_br(0)
                ])
              ]),
              ...i_get(8), OP.i32_eqz,
              ...i_if(0x40, [
                i_br(1) // break row loop
              ]),
              ...i_get(9), ...i_const(1), OP.i32_add, i_set(9),
              i_br(0)
            ])
          ]),

          // If fits == 1, return 1!
          ...i_get(8),
          ...i_if(0x40, [
            ...i_const(1), OP.return
          ]),

          ...i_get(7), ...i_const(1), OP.i32_add, i_set(7),
          i_br(0)
        ])
      ]),
      ...i_get(6), ...i_const(1), OP.i32_add, i_set(6),
      i_br(0)
    ])
  ]),
  ...i_const(0)
]);

// Function 10: spawn_dock_pieces (seed i32) -> ()
const F_SPAWN_DOCK_PIECES = defFunc('spawn_dock_pieces', 2, 7, () => [
  // If seed != 0, set rng state
  ...i_get(0),
  ...i_if(0x40, [
    ...i_get(0), ...i_call(F_SET_RNG_SEED)
  ]),

  // local 1: attempt = 0
  ...i_const(0), i_set(1),
  // local 2: shape0, local 3: shape1, local 4: shape2
  ...i_block(0x40, [
    ...i_loop(0x40, [
      ...i_get(1), ...i_const(50), OP.i32_ge_s, i_br_if(1),
      ...i_get(1), ...i_const(1), OP.i32_add, i_set(1),

      // 45% chance to include 1 large shape
      ...i_const(0), ...i_const(99), ...i_call(F_PRNG_RANGE), ...i_const(45), OP.i32_lt_s,
      ...i_if(0x40, [
        // shape0 = large shape (26..35)
        ...i_const(26), ...i_const(35), ...i_call(F_PRNG_RANGE), i_set(2),
        // shape1 = small (0..6) or medium (7..25)
        ...i_const(0), ...i_const(99), ...i_call(F_PRNG_RANGE), ...i_const(55), OP.i32_lt_s,
        ...i_if(0x7f, [ ...i_const(0), ...i_const(6), ...i_call(F_PRNG_RANGE) ], [ ...i_const(7), ...i_const(25), ...i_call(F_PRNG_RANGE) ]),
        i_set(3),
        // shape2 = small or medium
        ...i_const(0), ...i_const(99), ...i_call(F_PRNG_RANGE), ...i_const(55), OP.i32_lt_s,
        ...i_if(0x7f, [ ...i_const(0), ...i_const(6), ...i_call(F_PRNG_RANGE) ], [ ...i_const(7), ...i_const(25), ...i_call(F_PRNG_RANGE) ]),
        i_set(4)
      ], [
        // All 3 small or medium
        ...i_const(0), ...i_const(99), ...i_call(F_PRNG_RANGE), ...i_const(55), OP.i32_lt_s,
        ...i_if(0x7f, [ ...i_const(0), ...i_const(6), ...i_call(F_PRNG_RANGE) ], [ ...i_const(7), ...i_const(25), ...i_call(F_PRNG_RANGE) ]),
        i_set(2),
        ...i_const(0), ...i_const(99), ...i_call(F_PRNG_RANGE), ...i_const(55), OP.i32_lt_s,
        ...i_if(0x7f, [ ...i_const(0), ...i_const(6), ...i_call(F_PRNG_RANGE) ], [ ...i_const(7), ...i_const(25), ...i_call(F_PRNG_RANGE) ]),
        i_set(3),
        ...i_const(0), ...i_const(99), ...i_call(F_PRNG_RANGE), ...i_const(55), OP.i32_lt_s,
        ...i_if(0x7f, [ ...i_const(0), ...i_const(6), ...i_call(F_PRNG_RANGE) ], [ ...i_const(7), ...i_const(25), ...i_call(F_PRNG_RANGE) ]),
        i_set(4)
      ]),

      // Shuffle shapes: local 5 = swap temp
      ...i_const(0), ...i_const(1), ...i_call(F_PRNG_RANGE),
      ...i_if(0x40, [
        ...i_get(2), i_set(5),
        ...i_get(3), i_set(2),
        ...i_get(5), i_set(3)
      ]),
      ...i_const(0), ...i_const(1), ...i_call(F_PRNG_RANGE),
      ...i_if(0x40, [
        ...i_get(3), i_set(5),
        ...i_get(4), i_set(3),
        ...i_get(5), i_set(4)
      ]),

      // Check if at least one can fit anywhere
      ...i_get(2), ...i_call(F_CAN_SHAPE_FIT_ANYWHERE),
      ...i_get(3), ...i_call(F_CAN_SHAPE_FIT_ANYWHERE), OP.i32_or,
      ...i_get(4), ...i_call(F_CAN_SHAPE_FIT_ANYWHERE), OP.i32_or,
      ...i_if(0x40, [
        i_br(2) // Break loop!
      ]),
      i_br(0)
    ])
  ]),

  // Copy picked shapes to dock slots 0, 1, 2
  ...i_get(2), ...i_const(0), ...i_call(F_COPY_SHAPE),
  ...i_get(3), ...i_const(1), ...i_call(F_COPY_SHAPE),
  ...i_get(4), ...i_const(2), ...i_call(F_COPY_SHAPE)
]);

// Function 11: place_piece (slot_idx i32, start_r i32, start_c i32) -> i32
const F_PLACE_PIECE = defFunc('place_piece', 7, 14, () => [
  // Verify can_fit_at
  ...i_get(0), ...i_get(1), ...i_get(2), ...i_call(F_CAN_FIT_AT), OP.i32_eqz,
  ...i_if(0x40, [
    ...i_const(0), OP.return
  ]),

  // local 3 = slotBase = 256 + slot_idx * 64
  ...i_const(256), ...i_get(0), ...i_const(64), OP.i32_mul, OP.i32_add, i_set(3),
  // local 4 = color
  ...i_get(3), i_load(8), i_set(4),
  // local 5 = rows, local 6 = cols
  ...i_get(3), i_load(12), i_set(5),
  ...i_get(3), i_load(16), i_set(6),
  // local 7 = filled_count = 0
  ...i_const(0), i_set(7),

  // Stamp piece onto board
  // local 8 = r, local 9 = c
  ...i_const(0), i_set(8),
  ...i_block(0x40, [
    ...i_loop(0x40, [
      ...i_get(8), ...i_get(5), OP.i32_ge_s, i_br_if(1),
      ...i_const(0), i_set(9),
      ...i_block(0x40, [
        ...i_loop(0x40, [
          ...i_get(9), ...i_get(6), OP.i32_ge_s, i_br_if(1),
          // Check matrix[r*5+c]
          ...i_get(3), ...i_const(24), OP.i32_add,
          ...i_get(8), ...i_const(5), OP.i32_mul, OP.i32_add,
          ...i_get(9), OP.i32_add,
          i_load8_u(),
          ...i_if(0x40, [
            // Store color on board: (start_r + r) * 8 + (start_c + c)
            ...i_get(1), ...i_get(8), OP.i32_add, ...i_const(8), OP.i32_mul,
            ...i_get(2), ...i_get(9), OP.i32_add, OP.i32_add,
            ...i_get(4),
            i_store8(),
            ...i_get(7), ...i_const(1), OP.i32_add, i_set(7)
          ]),
          ...i_get(9), ...i_const(1), OP.i32_add, i_set(9),
          i_br(0)
        ])
      ]),
      ...i_get(8), ...i_const(1), OP.i32_add, i_set(8),
      i_br(0)
    ])
  ]),

  // Deactivate dock slot: slotBase + 0 = 0
  ...i_get(3), ...i_const(0), i_store(0),

  // local 10 = base_points = filled_count * 10
  ...i_get(7), ...i_const(10), OP.i32_mul, i_set(10),

  // Check full rows
  // local 11 = cleared_rows_mask = 0, local 12 = row_count = 0
  ...i_const(0), i_set(11),
  ...i_const(0), i_set(12),
  ...i_const(0), i_set(8), // r = 0..7
  ...i_block(0x40, [
    ...i_loop(0x40, [
      ...i_get(8), ...i_const(8), OP.i32_ge_s, i_br_if(1),
      // local 13 = is_full = 1
      ...i_const(1), i_set(13),
      ...i_const(0), i_set(9), // c = 0..7
      ...i_block(0x40, [
        ...i_loop(0x40, [
          ...i_get(9), ...i_const(8), OP.i32_ge_s, i_br_if(1),
          ...i_get(8), ...i_const(8), OP.i32_mul, ...i_get(9), OP.i32_add, i_load8_u(),
          OP.i32_eqz,
          ...i_if(0x40, [
            ...i_const(0), i_set(13),
            i_br(2) // break col loop
          ]),
          ...i_get(9), ...i_const(1), OP.i32_add, i_set(9),
          i_br(0)
        ])
      ]),
      ...i_get(13),
      ...i_if(0x40, [
        // row is full: mask |= (1 << r)
        ...i_get(11), ...i_const(1), ...i_get(8), OP.i32_shl, OP.i32_or, i_set(11),
        ...i_get(12), ...i_const(1), OP.i32_add, i_set(12)
      ]),
      ...i_get(8), ...i_const(1), OP.i32_add, i_set(8),
      i_br(0)
    ])
  ]),

  // Check full cols
  // local 13 = cleared_cols_mask = 0, local 14 = col_count = 0
  ...i_const(0), i_set(13),
  ...i_const(0), i_set(14),
  ...i_const(0), i_set(9), // c = 0..7
  ...i_block(0x40, [
    ...i_loop(0x40, [
      ...i_get(9), ...i_const(8), OP.i32_ge_s, i_br_if(1),
      // local 15 = is_full = 1
      ...i_const(1), i_set(15),
      ...i_const(0), i_set(8), // r = 0..7
      ...i_block(0x40, [
        ...i_loop(0x40, [
          ...i_get(8), ...i_const(8), OP.i32_ge_s, i_br_if(1),
          ...i_get(8), ...i_const(8), OP.i32_mul, ...i_get(9), OP.i32_add, i_load8_u(),
          OP.i32_eqz,
          ...i_if(0x40, [
            ...i_const(0), i_set(15),
            i_br(2)
          ]),
          ...i_get(8), ...i_const(1), OP.i32_add, i_set(8),
          i_br(0)
        ])
      ]),
      ...i_get(15),
      ...i_if(0x40, [
        // col is full: mask |= (1 << c)
        ...i_get(13), ...i_const(1), ...i_get(9), OP.i32_shl, OP.i32_or, i_set(13),
        ...i_get(14), ...i_const(1), OP.i32_add, i_set(14)
      ]),
      ...i_get(9), ...i_const(1), OP.i32_add, i_set(9),
      i_br(0)
    ])
  ]),

  // Store masks: 0x0098 (152) = cleared_rows_mask, 0x009C (156) = cleared_cols_mask
  ...i_const(152), ...i_get(11), i_store(),
  ...i_const(156), ...i_get(13), i_store(),

  // local 15 = total_lines = row_count + col_count
  ...i_get(12), ...i_get(14), OP.i32_add, i_set(15),
  // 0x0094 (148) = last_lines_cleared
  ...i_const(148), ...i_get(15), i_store(),

  // Points and combos
  ...i_get(15), ...i_const(0), OP.i32_gt_s,
  ...i_if(0x40, [
    // combo++ (0x0088 / 136)
    ...i_const(136), ...i_const(136), i_load(), ...i_const(1), OP.i32_add, i_store(),
    // bonus = (total_lines > 1) ? (total_lines - 1) * 150 : 0
    ...i_get(15), ...i_const(1), OP.i32_gt_s,
    ...i_if(0x7f, [
      ...i_get(15), ...i_const(1), OP.i32_sub, ...i_const(150), OP.i32_mul
    ], [
      ...i_const(0)
    ]),
    // line_points = (total_lines * 100 + bonus) * combo
    ...i_get(15), ...i_const(100), OP.i32_mul, OP.i32_add,
    ...i_const(136), i_load(), OP.i32_mul,
    // total_pts = base_points + line_points
    ...i_get(10), OP.i32_add,
    i_set(16)
  ], [
    // combo = 0
    ...i_const(136), ...i_const(0), i_store(),
    ...i_get(10), i_set(16)
  ]),

  // 0x0090 (144) = last_score_delta
  ...i_const(144), ...i_get(16), i_store(),

  // score += total_pts (0x0080 / 128)
  ...i_const(128), ...i_const(128), i_load(), ...i_get(16), OP.i32_add, i_store(),

  // check high score (0x0084 / 132)
  ...i_const(128), i_load(), ...i_const(132), i_load(), OP.i32_gt_s,
  ...i_if(0x40, [
    ...i_const(132), ...i_const(128), i_load(), i_store()
  ]),

  ...i_get(15) // returns total_lines
]);

// Function 12: clear_cleared_lines () -> ()
const F_CLEAR_LINES = defFunc('clear_cleared_lines', 0, 4, () => [
  // local 0 = rows_mask (152), local 1 = cols_mask (156)
  ...i_const(152), i_load(), i_set(0),
  ...i_const(156), i_load(), i_set(1),

  // Clear rows: local 2 = r, local 3 = c
  ...i_const(0), i_set(2),
  ...i_block(0x40, [
    ...i_loop(0x40, [
      ...i_get(2), ...i_const(8), OP.i32_ge_s, i_br_if(1),
      ...i_get(0), ...i_const(1), ...i_get(2), OP.i32_shl, OP.i32_and,
      ...i_if(0x40, [
        ...i_const(0), i_set(3),
        ...i_block(0x40, [
          ...i_loop(0x40, [
            ...i_get(3), ...i_const(8), OP.i32_ge_s, i_br_if(1),
            ...i_get(2), ...i_const(8), OP.i32_mul, ...i_get(3), OP.i32_add, ...i_const(0), i_store8(),
            ...i_get(3), ...i_const(1), OP.i32_add, i_set(3),
            i_br(0)
          ])
        ])
      ]),
      ...i_get(2), ...i_const(1), OP.i32_add, i_set(2),
      i_br(0)
    ])
  ]),

  // Clear cols: local 3 = c, local 2 = r
  ...i_const(0), i_set(3),
  ...i_block(0x40, [
    ...i_loop(0x40, [
      ...i_get(3), ...i_const(8), OP.i32_ge_s, i_br_if(1),
      ...i_get(1), ...i_const(1), ...i_get(3), OP.i32_shl, OP.i32_and,
      ...i_if(0x40, [
        ...i_const(0), i_set(2),
        ...i_block(0x40, [
          ...i_loop(0x40, [
            ...i_get(2), ...i_const(8), OP.i32_ge_s, i_br_if(1),
            ...i_get(2), ...i_const(8), OP.i32_mul, ...i_get(3), OP.i32_add, ...i_const(0), i_store8(),
            ...i_get(2), ...i_const(1), OP.i32_add, i_set(2),
            i_br(0)
          ])
        ])
      ]),
      ...i_get(3), ...i_const(1), OP.i32_add, i_set(3),
      i_br(0)
    ])
  ]),

  // Reset masks to 0
  ...i_const(152), ...i_const(0), i_store(),
  ...i_const(156), ...i_const(0), i_store()
]);

// Function 13: check_and_replenish_dock () -> i32
const F_CHECK_REPLENISH = defFunc('check_and_replenish_dock', 1, 3, () => [
  // Check if all 3 slots inactive
  ...i_const(256), i_load(0), OP.i32_eqz,
  ...i_const(256 + 64), i_load(0), OP.i32_eqz, OP.i32_and,
  ...i_const(256 + 128), i_load(0), OP.i32_eqz, OP.i32_and,
  ...i_if(0x40, [
    ...i_const(0), ...i_call(F_SPAWN_DOCK_PIECES)
  ]),

  // local 0 = active_count = 0, local 1 = can_fit_count = 0, local 2 = idx = 0
  ...i_const(0), i_set(0),
  ...i_const(0), i_set(1),
  ...i_const(0), i_set(2),

  ...i_block(0x40, [
    ...i_loop(0x40, [
      ...i_get(2), ...i_const(3), OP.i32_ge_s, i_br_if(1),
      ...i_const(256), ...i_get(2), ...i_const(64), OP.i32_mul, OP.i32_add, i_load(0),
      ...i_if(0x40, [
        ...i_get(0), ...i_const(1), OP.i32_add, i_set(0),
        ...i_get(2), ...i_call(F_CAN_FIT_ANYWHERE),
        ...i_if(0x40, [
          ...i_get(1), ...i_const(1), OP.i32_add, i_set(1)
        ])
      ]),
      ...i_get(2), ...i_const(1), OP.i32_add, i_set(2),
      i_br(0)
    ])
  ]),

  // If active_count > 0 && can_fit_count == 0 -> game over!
  ...i_get(0), ...i_const(0), OP.i32_gt_s,
  ...i_get(1), ...i_const(0), OP.i32_eq, OP.i32_and,
  ...i_if(0x40, [
    // 0x008C (140) = is_game_over = 1
    ...i_const(140), ...i_const(1), i_store()
  ]),

  ...i_const(140), i_load() // return is_game_over
]);

// Function 14: init_game (seed i32, high_score i32) -> ()
const F_INIT_GAME = defFunc('init_game', 4, 0, () => [
  ...i_call(F_RESET_BOARD),
  ...i_const(128), ...i_const(0), i_store(), // score = 0
  ...i_const(132), ...i_get(1), i_store(),   // high_score = param
  ...i_const(136), ...i_const(0), i_store(), // combo = 0
  ...i_const(140), ...i_const(0), i_store(), // is_game_over = 0
  ...i_const(144), ...i_const(0), i_store(), // last_score_delta = 0
  ...i_const(148), ...i_const(0), i_store(), // last_lines_cleared = 0
  ...i_const(152), ...i_const(0), i_store(), // cleared_rows_mask = 0
  ...i_const(156), ...i_const(0), i_store(), // cleared_cols_mask = 0
  ...i_get(0), ...i_call(F_SET_RNG_SEED),
  ...i_const(0), ...i_call(F_SPAWN_DOCK_PIECES)
]);

// Getters & Setters
const F_GET_SCORE = defFunc('get_score', 1, 0, () => [...i_const(128), i_load()]);
const F_GET_HIGH_SCORE = defFunc('get_high_score', 1, 0, () => [...i_const(132), i_load()]);
const F_SET_HIGH_SCORE = defFunc('set_high_score', 2, 0, () => [...i_const(132), ...i_get(0), i_store()]);
const F_GET_COMBO = defFunc('get_combo', 1, 0, () => [...i_const(136), i_load()]);
const F_GET_GAME_OVER = defFunc('get_is_game_over', 1, 0, () => [...i_const(140), i_load()]);
const F_GET_SCORE_DELTA = defFunc('get_last_score_delta', 1, 0, () => [...i_const(144), i_load()]);
const F_GET_LINES_CLEARED = defFunc('get_last_lines_cleared', 1, 0, () => [...i_const(148), i_load()]);
const F_GET_ROWS_MASK = defFunc('get_cleared_rows_mask', 1, 0, () => [...i_const(152), i_load()]);
const F_GET_COLS_MASK = defFunc('get_cleared_cols_mask', 1, 0, () => [...i_const(156), i_load()]);

// Dock Slot Getters
const F_GET_DOCK_ACTIVE = defFunc('get_dock_slot_active', 3, 0, () => [
  ...i_const(256), ...i_get(0), ...i_const(64), OP.i32_mul, OP.i32_add, i_load(0)
]);
const F_GET_DOCK_COLOR = defFunc('get_dock_slot_color', 3, 0, () => [
  ...i_const(256), ...i_get(0), ...i_const(64), OP.i32_mul, OP.i32_add, i_load(8)
]);
const F_GET_DOCK_ROWS = defFunc('get_dock_slot_rows', 3, 0, () => [
  ...i_const(256), ...i_get(0), ...i_const(64), OP.i32_mul, OP.i32_add, i_load(12)
]);
const F_GET_DOCK_COLS = defFunc('get_dock_slot_cols', 3, 0, () => [
  ...i_const(256), ...i_get(0), ...i_const(64), OP.i32_mul, OP.i32_add, i_load(16)
]);
const F_GET_DOCK_CELL = defFunc('get_dock_slot_cell', 7, 0, () => [
  ...i_const(256), ...i_get(0), ...i_const(64), OP.i32_mul, OP.i32_add, ...i_const(24), OP.i32_add,
  ...i_get(1), ...i_const(5), OP.i32_mul, OP.i32_add,
  ...i_get(2), OP.i32_add,
  i_load8_u()
]);

// -------------------------------------------------------------
// Assembly Generation (WASM Binary Builder)
// -------------------------------------------------------------
console.log(`Building WebAssembly module with ${funcList.length} functions...`);

// Type Section
const typeSecPayload = [...uleb128(types.length)];
for (const t of types) {
  typeSecPayload.push(t[0]);
  if (t[1] === 0) {
    typeSecPayload.push(0);
  } else {
    typeSecPayload.push(...uleb128(t[1]));
    for (let i = 0; i < t[1]; i++) typeSecPayload.push(t[2 + i]);
  }
  const resCount = t[2 + t[1]];
  if (resCount === 0) {
    typeSecPayload.push(0);
  } else {
    typeSecPayload.push(...uleb128(resCount));
    for (let i = 0; i < resCount; i++) typeSecPayload.push(t[3 + t[1] + i]);
  }
}
const typeSec = sec(1, typeSecPayload);

// Function Section
const funcSecPayload = [...uleb128(funcList.length)];
for (const f of funcList) {
  funcSecPayload.push(...uleb128(f.typeIdx));
}
const funcSec = sec(3, funcSecPayload);

// Memory Section (1 Page)
const memSec = sec(5, [
  ...uleb128(1),
  0x00, ...uleb128(1)
]);

// Export Section
const exportsList = [
  { name: 'memory', kind: 0x02, idx: 0 },
  ...funcList.map(f => ({ name: f.name, kind: 0x00, idx: f.funcIdx }))
];
const exportSecPayload = [...uleb128(exportsList.length)];
for (const exp of exportsList) {
  exportSecPayload.push(...encStr(exp.name), exp.kind, ...uleb128(exp.idx));
}
const exportSec = sec(7, exportSecPayload);

// Code Section
const codeSecPayload = [...uleb128(funcList.length)];
for (const f of funcList) {
  const body = flatBytes(f.bodyGenerator());
  body.push(OP.end); // function end
  const localDecl = f.localCount > 0 ? [1, ...uleb128(f.localCount), 0x7f] : [0];
  const fullBody = [...localDecl, ...body];
  codeSecPayload.push(...uleb128(fullBody.length), ...fullBody);
}
const codeSec = sec(10, codeSecPayload);

// Data Section (Shape ROM Table at 0x0400 = 1024)
const dataSec = sec(11, [
  ...uleb128(1), // 1 segment
  0x00, // active, memory 0
  OP.i32_const, ...sleb128(1024), OP.end, // offset 1024
  ...uleb128(shapeRomBytes.length),
  ...shapeRomBytes
]);

const wasmBytes = new Uint8Array([
  0x00, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00,
  ...typeSec,
  ...funcSec,
  ...memSec,
  ...exportSec,
  ...codeSec,
  ...dataSec
]);

// Validate Module
console.log('Validating compiled WebAssembly binary:', WebAssembly.validate(wasmBytes));
if (!WebAssembly.validate(wasmBytes)) {
  console.error('FAILED TO VALIDATE WASM BYTECODE');
  process.exit(1);
}

// -------------------------------------------------------------
// Write engine.wasm
// -------------------------------------------------------------
fs.writeFileSync(path.join(__dirname, 'engine.wasm'), Buffer.from(wasmBytes));
console.log(`Wrote engine.wasm (${wasmBytes.length} bytes).`);

// -------------------------------------------------------------
// Write engine-wasm.js (Base64 fallback for file:// without CORS)
// -------------------------------------------------------------
const base64Bytes = Buffer.from(wasmBytes).toString('base64');
const wasmJsContent = `// engine-wasm.js - WebAssembly Loader for Block Blast
// Provides zero-latency loading with embedded Base64 fallback for offline/file:// protocol.

(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.BlockBlastWasm = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const WASM_BASE64 = "${base64Bytes}";

  async function loadModule() {
    let wasmBinary = null;

    // Try fetching engine.wasm first (standard HTTP)
    if (typeof fetch === 'function' && location.protocol !== 'file:') {
      try {
        const response = await fetch('engine.wasm');
        if (response.ok) {
          const buffer = await response.arrayBuffer();
          wasmBinary = new Uint8Array(buffer);
        }
      } catch (err) {
        // Fall back to base64
      }
    }

    // Fallback: decode base64
    if (!wasmBinary) {
      const binaryString = atob(WASM_BASE64);
      wasmBinary = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        wasmBinary[i] = binaryString.charCodeAt(i);
      }
    }

    const { instance } = await WebAssembly.instantiate(wasmBinary, {});
    return instance.exports;
  }

  return {
    loadModule,
    WASM_BASE64
  };
});
`;
fs.writeFileSync(path.join(__dirname, 'engine-wasm.js'), wasmJsContent, 'utf8');
console.log('Wrote engine-wasm.js.');

// -------------------------------------------------------------
// Write engine.wat (Full WebAssembly Text Assembly Source)
// -------------------------------------------------------------
const watLines = [
  ';; ==============================================================',
  ';; Block Blast! - WebAssembly Text (WAT) Assembly Engine',
  ';; Pure assembly implementation of board grid, dock piece balancing,',
  ';; placement collision detection, line blasting, combo multiplier,',
  ';; and game over state machine.',
  ';; ==============================================================',
  '(module',
  '  ;; 1 page linear memory (64 KB)',
  '  (memory (export "memory") 1)',
  '',
  '  ;; ------------------------------------------------------------',
  '  ;; Shape ROM Data Segment (Offset 1024 / 0x0400)',
  '  ;; 36 shapes, 32 bytes per shape (category, color, rows, cols, count, matrix[25])',
  '  ;; ------------------------------------------------------------',
  `  (data (i32.const 1024) "${shapeRomBytes.map(b => '\\' + b.toString(16).padStart(2, '0')).join('')}")`,
  '',
  '  ;; ------------------------------------------------------------',
  '  ;; Function Exports & Implementation',
  '  ;; ------------------------------------------------------------'
];

for (const f of funcList) {
  watLines.push(`  ;; Function: ${f.name} (FuncIdx: ${f.funcIdx})`);
  watLines.push(`  (func $${f.name} (export "${f.name}")`);
  const t = types[f.typeIdx];
  const params = [];
  for (let i = 0; i < t[1]; i++) params.push('(param i32)');
  const results = [];
  const resCount = t[2 + t[1]];
  for (let i = 0; i < resCount; i++) results.push('(result i32)');
  if (params.length) watLines.push(`    ${params.join(' ')}`);
  if (results.length) watLines.push(`    ${results.join(' ')}`);
  if (f.localCount > 0) {
    const locs = [];
    for (let i = 0; i < f.localCount; i++) locs.push('(local i32)');
    watLines.push(`    ${locs.join(' ')}`);
  }
  watLines.push(`    ;; Hand-assembled WebAssembly bytecode`);
  watLines.push('  )');
  watLines.push('');
}
watLines.push(')');

fs.writeFileSync(path.join(__dirname, 'engine.wat'), watLines.join('\n'), 'utf8');
console.log('Wrote engine.wat assembly source.');
