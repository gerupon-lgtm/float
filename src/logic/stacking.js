// 荷物の積み方（要件F-014）。items の1行は [重さ, 名前, 幅, 高さ, 色]。
import { Fraction } from './fraction.js';
import { HULL, exact } from './physics.js';

export const CELLS = 6, ROWMAX = 6, ROWH = 16, SHIP_DECK = 8, PIXELS_PER_DEPTH = 12;

export function stackHeights(placed, items) {
  const h = Array(CELLS).fill(0);
  for (const p of placed) { const it = items[p.id]; for (let c = p.c; c < p.c + it[2]; c++) h[c] = Math.max(h[c], p.r + it[3]); }
  return h;
}
export const stackRows = (placed, items) => Math.max(0, ...stackHeights(placed, items));

// 列を選ぶと上から落ちて止まる。高さの上限を超えるなら null
export function dropCargo(placed, items, id, col) {
  const it = items[id], c = Math.min(col, CELLS - it[2]), h = stackHeights(placed, items);
  let r = 0;
  for (let i = c; i < c + it[2]; i++) r = Math.max(r, h[i]);
  return r + it[3] > ROWMAX ? null : { id, c, r };
}

// 荷の山の上端（船底からの高さ）。船の縁より低ければ縁の高さで見る
export function pileTop(rows) {
  const top = new Fraction(BigInt(SHIP_DECK + rows * ROWH), BigInt(PIXELS_PER_DEPTH));
  return top.gt(HULL) ? top : Fraction.of(HULL);
}
// 橋の下面は、深さ limit の船の縁の高さにある
export const pileClearsBridge = (depth, limit, rows) => pileTop(rows).sub(depth).cmp(Fraction.of(HULL).sub(exact(limit))) <= 0;
