// 面の機械検査（C-03）。全部の積み方を調べ、解ける組み合わせを返す。
import { SHIP, depthFraction, isSunk, clearsShoal, reachesDepth } from './physics.js';
import { dropCargo, stackRows, pileClearsBridge } from './stacking.js';

function runRoute(stage, weight, rows) {
  let liquid = stage.pre ?? stage.start;
  if (isSunk(weight, liquid)) return false;
  for (const g of stage.gates) {
    if (g.k === 'chamber') { liquid = g.to; if (isSunk(weight, liquid)) return false; continue; }
    const d = depthFraction(weight, liquid);
    if (g.k === 'shoal' && !clearsShoal(d, g.d)) return false;
    if (g.k === 'bridge' && !reachesDepth(d, g.d)) return false;
    if (g.k === 'lever' && !reachesDepth(d, g.d)) return false;
    if (g.k === 'bridge' && stage.grid && !pileClearsBridge(d, g.d, rows)) return false;
  }
  return true;
}
const sumOf = (items, ids) => SHIP + ids.reduce((a, i) => a + items[i][0], 0);

function gridSolutions(stage) {
  const { items } = stage, n = items.length;
  let count = 0;
  const walk = (placed, used) => {
    if (placed.length === n) { if (runRoute(stage, sumOf(items, [...used]), stackRows(placed, items))) count++; return; }
    for (let id = 0; id < n; id++) {
      if (used.has(id)) continue;
      for (let col = 0; col + items[id][2] <= 6; col++) {
        const p = dropCargo(placed, items, id, col);
        if (p) walk([...placed, p], new Set(used).add(id));
      }
    }
  };
  walk([], new Set());
  return count;
}
export function solutionCount(stage) {
  if (stage.grid) return gridSolutions(stage);
  const n = stage.items.length;
  let count = 0;
  for (let mask = 0; mask < 1 << n; mask++) {
    const ids = []; for (let i = 0; i < n; i++) if (mask >> i & 1) ids.push(i);
    if (runRoute(stage, sumOf(stage.items, ids), 0)) count++;
  }
  return count;
}
