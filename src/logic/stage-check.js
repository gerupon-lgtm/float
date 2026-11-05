// 面の機械検査（C-03）。解けることと、理由を考えずに解けないことを確かめる。
import { AREA, SHIP, depthFraction, isSunk, clearsShoal, reachesDepth } from './physics.js';
import { CELLS, ROWMAX, dropCargo, stackRows, pileClearsBridge } from './stacking.js';
import { onScale } from './pitch.js';

// 重さと荷の段数を決めたとき、航路を通れるか
export function runRoute(stage, weight, rows = 0) {
  const area = stage.area ?? AREA;
  let liquid = stage.pre ?? stage.start;
  if (isSunk(weight, liquid, area)) return false;
  for (const g of stage.gates) {
    if (g.k === 'chamber') { liquid = g.to; if (isSunk(weight, liquid, area)) return false; continue; }
    const d = depthFraction(weight, liquid, area);
    if (g.k === 'shoal' && !clearsShoal(d, g.d)) return false;
    if ((g.k === 'bridge' || g.k === 'lever') && !reachesDepth(d, g.d)) return false;
    if (g.k === 'bridge' && stage.grid && !pileClearsBridge(d, g.d, rows)) return false;
  }
  return true;
}
export const totalWeight = (items, ids) => SHIP + ids.reduce((a, i) => a + items[i][0], 0);

// 荷物の選び方で解く面：解になる選び方をすべて返す
export function selections(stage) {
  const n = stage.items.length, out = [];
  for (let mask = 0; mask < 1 << n; mask++) {
    const ids = [];
    for (let i = 0; i < n; i++) if (mask >> i & 1) ids.push(i);
    if (runRoute(stage, totalWeight(stage.items, ids))) out.push(ids);
  }
  return out;
}

// 積み方の面：全部の荷を積んだときの、一番低い山の段数
export function minRows(items, cutoff = Infinity) {
  let best = Infinity;
  const walk = (placed, left) => {
    const rows = stackRows(placed, items);
    if (rows >= best || rows > cutoff) return;
    if (!left.length) { best = rows; return; }
    for (const id of left) for (let col = 0; col + items[id][2] <= CELLS; col++) {
      const p = dropCargo(placed, items, id, col);
      if (p) walk([...placed, p], left.filter(x => x !== id));
    }
  };
  walk([], items.map((_, i) => i));
  return best;
}

export function isSolvable(stage) {
  if (stage.grid) {
    const w = totalWeight(stage.items, stage.items.map((_, i) => i));
    return runRoute(stage, w, minRows(stage.items));
  }
  return selections(stage).length > 0;
}

// 問題の検査。問題ありなら理由の文字列を返す
export function problemOf(stage) {
  if (!isSolvable(stage)) return '解けない';
  if (stage.grid) {
    const ids = stage.items.map((_, i) => i);
    const tallest = Math.min(ROWMAX, stage.items.reduce((a, it) => a + it[3], 0));
    if (runRoute(stage, totalWeight(stage.items, ids), tallest)) return '積み方を問わず通れる';
    return null;
  }
  const sols = selections(stage), n = stage.items.length;
  if (sols.some(s => s.length === n)) return '全部積めば解ける';
  if (sols.some(s => s.length === 0)) return '何も積まなくても解ける';
  if (!sols.some(s => onScale(depthFraction(totalWeight(stage.items, s), stage.pre ?? stage.start, stage.area ?? AREA)))) return '音階に乗る答えがない';
  return null;
}
