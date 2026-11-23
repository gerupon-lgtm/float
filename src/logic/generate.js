// 問題の生成（要件7章）。面の配置は固定し、数字だけを変える。結果は src/content/challenges.js に保存する。
import { AREA, SHIP, depthOf, depthFraction, isSunk, cellWeight } from './physics.js';
import { Fraction } from './fraction.js';
import { problemOf, selections, minRows, totalWeight } from './stage-check.js';
import { pumpPlans, pumpRun, lazyPlan } from './pump.js';

const random = seed => () => (seed = (seed * 1664525 + 1013904223) >>> 0) / 2 ** 32;
const pick = (r, list) => list[Math.floor(r() * list.length)];
const half = x => Math.floor(x * 2) / 2;

const NAMES = { 5: '木箱', 7: '麦袋', 8: '壺', 10: '石', 12: '鉄', 15: '麦袋', 20: '石', 25: '鉄' };
const WEIGHTS = Object.keys(NAMES).map(Number);
export const SHAPES = [
  [8, '木箱', 2, 2, '#e7b76a'], [6, '木の板', 3, 1, '#d9a65c'], [8, '壺', 1, 2, '#c9744a'],
  [10, '石', 1, 1, '#8c8f96'], [20, '石', 2, 1, '#8c8f96'], [4, '木の板', 2, 1, '#d9a65c']
];

const cell = m => cellWeight(m);
export const HEAVY_SHAPES = [
  [cell('gold'), '金', 1, 1, '#efb32a'], [cell('gold') * 2, '金の棒', 2, 1, '#efb32a'], [cell('lead'), '鉛', 1, 1, '#59616e'],
  [cell('iron'), '鉄', 1, 1, '#7a6f66'], [cell('iron') * 2, '鉄の棒', 2, 1, '#7a6f66'], [cell('iron') * 4, '鉄箱', 2, 2, '#7a6f66'],
  [cell('stone'), '石', 1, 1, '#8c8f96']
];

function chooseItems(r) {
  const w = new Set();
  while (w.size < 4) w.add(pick(r, WEIGHTS));
  return [...w].sort((a, b) => a - b).map(x => [x, NAMES[x]]);
}

const HEAVY = [[10, '木箱'], [20, '鉄箱'], [50, '鉛'], [100, '金塊'], [100, '金塊'], [200, '大きな金塊']];
const floorStep = (x, step) => Math.floor(x / step + 1e-9) * step;
const ceilStep = (x, step) => Math.ceil(x / step - 1e-9) * step;
const round2 = x => Math.round(x * 100) / 100;

// 答えの荷を先に決め、関門の深さをその答えに合わせる
function routeQuestion(stage, r) {
  const step = stage.step ?? 0.5, items = [];
  if (stage.count) {
    for (let i = 0; i < stage.count; i++) items.push(pick(r, stage.step ? WEIGHTS.map(w => [w, NAMES[w]]) : HEAVY));
    items.sort((a, b) => a[0] - b[0]);
  } else items.push(...chooseItems(r));
  const ids = items.map((_, i) => i).filter(() => r() < 0.5);
  if (!ids.length || ids.length === items.length) return null;
  const w = totalWeight(items, ids);
  let liquid = stage.pre ?? stage.start;
  const gates = stage.gates.map(g => {
    if (g.k === 'chamber') { liquid = g.to; return { ...g }; }
    const d = depthOf(w, liquid);
    return { ...g, d: round2(g.k === 'shoal' ? ceilStep(d, step) : floorStep(d, step)) };
  });
  if (stage.loaded && isSunk(totalWeight(items, items.map((_, i) => i)), stage.start)) return null;
  return { area: AREA, items, gates, ...(stage.loaded ? { on: items.map((_, i) => i) } : {}) };
}

export function pickProblems(stage, { count = 8, seed = 1, tries = 40000 } = {}) {
  const r = random(seed), out = [], keys = new Set(), used = new Map();
  // 積み方の面は、関門の数字が同じお題ばかりにならないよう、同じ数字は3問までにする（足りなければ緩める）
  const cap = stage.grid && !stage.noScale ? 3 : Infinity;
  for (let i = 0; i < tries && out.length < count; i++) {
    const q = stage.pumpQ ? pumpQuestion(stage, r) : stage.grid ? gridQuestion(stage, r) : stage.route ? routeQuestion(stage, r) : selectQuestion(stage, r);
    if (!q) continue;
    const key = JSON.stringify(q);
    if (keys.has(key)) continue;
    if (problemOf({ ...stage, ...q })) continue;
    if (!stage.grid && !stage.pumpQ && selections({ ...stage, ...q }).length > stage.maxAnswers) continue;
    const gk = JSON.stringify(q.gates);
    if ((used.get(gk) ?? 0) >= (i < tries / 2 ? cap : Infinity)) continue;
    used.set(gk, (used.get(gk) ?? 0) + 1);
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
  const shapes = stage.heavy ? HEAVY_SHAPES : SHAPES;
  for (let i = 0; i < stage.count; i++) items.push(pick(r, shapes));
  const liquid = stage.gates.find(g => g.k === 'chamber')?.to ?? stage.start;
  // 答えの音を音階に乗せる：最後の荷を、合計が音階に乗る形から選び直す
  //（狙う深さを先に決める）
  if (!stage.noScale) {
    const target = pick(r, [4, 5, 6, 7, 8, 9].filter(x => x >= (stage.minDepth ?? 3) * 2)); // 深さ×2
    const rest = SHIP + items.slice(0, -1).reduce((a, it) => a + it[0], 0);
    const fits = shapes.filter(sh => depthFraction(rest + sh[0], liquid).mul(2).eq(Fraction.of(target)));
    if (!fits.length) return null;
    items[items.length - 1] = pick(r, fits);
  }
  const w = SHIP + items.reduce((a, it) => a + it[0], 0), d = depthOf(w, liquid);
  if (d < (stage.minDepth ?? 3) || d > 4.5 || isSunk(w, stage.start)) return null;
  const lower = half(d - stage.gap);
  if (minRows(items, 3) > 3) return null;
  return { area: AREA, items, gates: stage.gates.map(g => ({ ...g, d: g.k === 'shoal' ? half(d) + 0.5 : lower })) };
}

// スクリューの面：荷・最初の水・しみ込む量・関門の深さを決め、回せる回数は「通るのに要る最少の回数＋余り」にする
const PUMP_CARGO = [[5, '木箱'], [10, '石'], [15, '麦袋'], [20, '石']];
function pumpQuestion(stage, r) {
  const Q = stage.pumpQ, per = 5, n = stage.gates.length;
  const items = Array.from({ length: 1 + Math.floor(r() * 3) }, () => pick(r, PUMP_CARGO)).sort((a, b) => a[0] - b[0]);
  const pump = { per, start: pick(r, Q.starts ?? [10, 15, 20, 25]), leak: stage.gates.map(() => pick(r, Q.leaks ?? [0, 5, 10])), turns: 30 };
  const gates = stage.gates.map(g => ({ ...g, d: pick(r, [1.5, 2, 2.5, 3, 3.5, 4, 4.5]) }));
  const q = { area: AREA, items, on: items.map((_, i) => i), gates, pump };
  const plans = pumpPlans({ ...stage, ...q });
  if (!plans.length) return null;
  pump.turns = Math.min(...plans.map(p => p.reduce((a, k) => a + k, 0))) + (Q.spare ?? 0);
  const st = { ...stage, ...q };
  if (pump.turns < 1) return null;
  // 見せたい考えどころ
  if (Q.early && pumpRun(st, lazyPlan(st)).ok) return null;          // 関門の手前だけで回すと間に合わない
  if (Q.keep && pumpRun(st, greedyPlan(st)).ok) return null;         // 回せるだけ回すと、橋に届かない
  return q;
}
// 止まるたびに、回せるだけ回す
function greedyPlan(stage) {
  const P = stage.pump, plan = [];
  let water = P.start, left = P.turns;
  for (let i = 0; i <= stage.gates.length; i++) {
    if (i > 0) water += P.leak[i - 1];
    const k = Math.min(left, Math.ceil(water / P.per));
    plan.push(k); left -= k; water = Math.max(0, water - k * P.per);
  }
  return plan;
}
