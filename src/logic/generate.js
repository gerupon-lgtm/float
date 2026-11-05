// 問題の生成（要件7章）。面の配置は固定し、数字だけを変える。結果は src/content/challenges.js に保存する。
import { AREA, depthOf } from './physics.js';
import { problemOf, selections, minRows } from './stage-check.js';

const random = seed => () => (seed = (seed * 1664525 + 1013904223) >>> 0) / 2 ** 32;
const pick = (r, list) => list[Math.floor(r() * list.length)];
const half = x => Math.floor(x * 2) / 2;

const NAMES = { 5: '木箱', 7: '麦袋', 8: '壺', 10: '石', 12: '鉄', 15: '麦袋', 20: '石', 25: '鉄' };
const WEIGHTS = Object.keys(NAMES).map(Number);
export const SHAPES = [
  [8, '木箱', 2, 2, '#e7b76a'], [6, '木の板', 3, 1, '#d9a65c'], [8, '壺', 1, 2, '#c9744a'],
  [10, '石', 1, 1, '#8c8f96'], [20, '石', 2, 1, '#8c8f96'], [4, '木の板', 2, 1, '#d9a65c']
];

function chooseItems(r) {
  const w = new Set();
  while (w.size < 4) w.add(pick(r, WEIGHTS));
  return [...w].sort((a, b) => a - b).map(x => [x, NAMES[x]]);
}

export function pickProblems(stage, { count = 8, seed = 1, tries = 40000 } = {}) {
  const r = random(seed), out = [], keys = new Set();
  for (let i = 0; i < tries && out.length < count; i++) {
    const q = stage.grid ? gridQuestion(stage, r) : selectQuestion(stage, r);
    if (!q) continue;
    const key = JSON.stringify(q);
    if (keys.has(key)) continue;
    if (problemOf({ ...stage, ...q })) continue;
    if (!stage.grid && selections({ ...stage, ...q }).length > stage.maxAnswers) continue;
    keys.add(key);
    out.push(q);
  }
  return out;
}

function selectQuestion(stage, r) {
  const area = stage.areas ? pick(r, stage.areas) : AREA;
  const low = pick(r, [2, 2.5, 3, 3.5]), high = low + stage.window;
  if (high > 4.5) return null;
  return { area, items: chooseItems(r), gates: stage.gates.map(g => ({ ...g, d: g.k === 'shoal' ? high : low })) };
}

function gridQuestion(stage, r) {
  const items = [];
  for (let i = 0; i < stage.count; i++) items.push(pick(r, SHAPES));
  const w = 10 + items.reduce((a, it) => a + it[0], 0), d = depthOf(w, 'water');
  if (d < 3 || d > 4.5) return null;
  const lower = half(d - stage.gap);
  if (minRows(items, 3) > 3) return null;
  return { area: AREA, items, gates: stage.gates.map(g => ({ ...g, d: g.k === 'shoal' ? half(d) + 0.5 : lower })) };
}
