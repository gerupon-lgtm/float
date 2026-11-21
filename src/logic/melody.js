// 航路のメロディ（要件F-020、7.2節）。計算・判定・お題の作成と検査。画面は src/ui/melody.js。
// 水・底面積10・船の重さ10。深さ0.5（音1つ分）は重さ5。お題は深さ×2の整数 h（3〜10、最後は空荷の2）で持つ。
import { Fraction } from './fraction.js';
import { SHIP, HULL, depthFraction, exact } from './physics.js';
import { CELLS, ROWMAX, dropCargo, stackRows, pileClearsBridge } from './stacking.js';

const LIQ = 'water';
export const STEP_WEIGHT = 5;                 // 深さ0.5の重さ（水・底面積10）
export const EMPTY_H = SHIP / STEP_WEIGHT;    // 空荷の h（深さ1）
export const depthOfH = h => new Fraction(BigInt(h), 2n);
export const hOfDepth = d => d.mul(2).toNumber();

// 荷：[重さ, 名前, 幅, 高さ, 色]。大きさは 重さ÷比重 を1マス体積4で丸めた形（要件5章）
export const MELODY_ITEMS = {
  5: [5, '麦袋', 2, 1, '#d8b56a'],
  10: [10, '石', 1, 1, '#9a9a92'],
  15: [15, '壺', 2, 2, '#d0743c'],
  20: [20, '石', 2, 1, '#9a9a92']
};
// 音階に乗らない重さのおとり（木は軽くて大きい）
export const DECOYS = [[4, '木の板', 2, 1, '#c9955a'], [8, '木箱', 2, 2, '#b07a40'], [6, '木の板', 3, 1, '#c9955a']];

export const weightOf = (items, placed) => SHIP + placed.reduce((a, p) => a + items[p.id][0], 0);
export const depthNow = (items, placed) => depthFraction(weightOf(items, placed), LIQ);

// 港で積む荷は、空いている中で一番低い位置へ自動で置く（同じ高さなら左）
export function autoDrop(placed, items, id) {
  let best = null;
  for (let c = 0; c + items[id][2] <= CELLS; c++) {
    const p = dropCargo(placed, items, id, c);
    if (p && (!best || p.r < best.r)) best = p;
  }
  return best;
}

// 橋の下を通れる荷の段数（深さがちょうど橋の値のとき）
export function rowsUnderBridge(limit) {
  let r = 0;
  while (r < ROWMAX && pileClearsBridge(exact(limit), limit, r + 1)) r++;
  return r;
}

// 海路 i を通れるか。通れれば null、通れなければ理由
export function segmentFault(route, i, depth, rows) {
  if (depth.gt(HULL)) return 'sink';
  const c = route.cond?.[i];
  if (c?.k === 'shoal' && depth.cmp(exact(c.d)) > 0) return 'shoal';
  if (c?.k === 'bridge' && (depth.cmp(exact(c.d)) < 0 || !pileClearsBridge(depth, c.d, rows))) return 'bridge';
  return null;
}
export const matchesTarget = (route, i, depth) => depth.cmp(depthOfH(route.target[i])) === 0;

// 出航前の積み方（placed の順）で航海を最後まで試す。画面の流れと同じ順で判定する
export function simulate(route, shelf, placed0) {
  const items = shelf.map(x => [...x]), placed = placed0.map(p => ({ ...p })), log = [];
  for (let i = 0; ; i++) {
    const d = depthNow(items, placed), fault = segmentFault(route, i, d, stackRows(placed, items));
    if (fault) return { ok: false, fault, seg: i, log };
    log.push(d);
    if (i >= route.ports.length) break;
    const port = route.ports[i];
    if (port.k === 'down') { if (!placed.length) return { ok: false, fault: 'empty', seg: i, log }; placed.pop(); continue; }
    items.push([...port.item]);
    const p = autoDrop(placed, items, items.length - 1);
    if (!p) return { ok: false, fault: 'full', seg: i, log };
    placed.push(p);
  }
  if (placed.length) return { ok: false, fault: 'left', seg: log.length, log };
  const match = log.map((d, i) => matchesTarget(route, i, d));
  return { ok: match.every(Boolean), fault: null, log, match };
}

// ---- お題の作成 ----
const random = seed => () => (seed = (seed * 1664525 + 1013904223) >>> 0) / 2 ** 32;

// h の並びから、出航時の荷（下から上）と港の動きを決める。成り立たなければ null
export function structureOf(seq, maxStep = 4, maxInit = 3) {
  if (seq.at(-1) !== EMPTY_H) return null;
  const loadStack = [], pops = [], ports = [];
  for (let i = 0; i + 1 < seq.length; i++) {
    const dh = seq[i + 1] - seq[i];
    if (dh === 0 || Math.abs(dh) > maxStep) return null;
    const w = Math.abs(dh) * STEP_WEIGHT;
    if (dh > 0) { loadStack.push(w); ports.push({ k: 'load', w }); continue; }
    ports.push({ k: 'down' });
    if (loadStack.length) { if (loadStack.pop() !== w) return null; } else pops.push(w);
  }
  if (loadStack.length || !pops.length || pops.length > maxInit) return null;
  return { init: pops.reverse(), ports };   // init は下から上の順
}

// 出航前の荷を、下から順に一番低い位置へ置いた積み方（解けることの検査に使う）
export function greedyPlacement(shelf, ids) {
  const placed = [];
  for (const id of ids) { const p = autoDrop(placed, shelf, id); if (!p) return null; placed.push(p); }
  return placed;
}

function buildRoute(seq, spec, r) {
  const st = structureOf(seq, spec.maxStep ?? 4, spec.maxInit ?? 3);
  if (!st) return null;
  const loads = st.ports.filter(p => p.k === 'load').length;
  if (loads < (spec.loads?.[0] ?? 0) || loads > (spec.loads?.[1] ?? 9)) return null;
  if (new Set(seq).size < (spec.distinct ?? 3)) return null;
  const ports = st.ports.map(p => (p.k === 'down' ? { k: 'down' } : { k: 'load', item: [...MELODY_ITEMS[p.w]] }));
  // 棚：答えの荷と、おとり2つ（音階に乗らない木と、答えにない重さの荷）
  const answer = st.init.map(w => [...MELODY_ITEMS[w]]);
  const spare = Object.keys(MELODY_ITEMS).map(Number).filter(w => !st.init.includes(w));
  const decoys = [[...DECOYS[Math.floor(r() * DECOYS.length)]]];
  if (spare.length) decoys.push([...MELODY_ITEMS[spare[Math.floor(r() * spare.length)]]]);
  const shelf = [...answer, ...decoys];
  for (let i = shelf.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [shelf[i], shelf[j]] = [shelf[j], shelf[i]]; }
  // 同じ重さが2つあっても別の荷を指すように、答えの荷は配列そのもので探す
  const ids = answer.map(a => shelf.indexOf(a));
  const route = { target: seq, ports, cond: {}, items: shelf };
  // 関門：浅瀬は一番深い海路、橋は浅い海路。どちらも最後の空荷の海路には置かない
  const inner = seq.slice(0, -1).map((h, i) => ({ h, i }));
  if (spec.gates?.includes('shoal')) {
    const deep = inner.reduce((a, b) => (b.h > a.h ? b : a));
    if (deep.h >= 2 * HULL) return null;      // 深さ5の浅瀬は、沈まない限り必ず通れて意味がない
    route.cond[deep.i] = { k: 'shoal', d: deep.h / 2 };
  }
  if (spec.gates?.includes('bridge')) {
    const cands = inner.filter(x => !route.cond[x.i]).sort((a, b) => a.h - b.h);
    if (!cands.length) return null;
    route.cond[cands[0].i] = { k: 'bridge', d: cands[0].h / 2 };
  }
  const placed = greedyPlacement(shelf, ids);
  if (!placed) return null;
  const sim = simulate(route, shelf, placed);
  if (!sim.ok) return null;                   // 解けない問題は出さない（C-03）
  return route;
}

// 面の条件 spec から、お題を count 個作る。同じメロディは出さない
export function pickMelodies(spec, { count = 8, seed = 1, tries = 300000 } = {}) {
  const r = random(seed), out = [], seen = new Set();
  for (let t = 0; t < tries && out.length < count; t++) {
    const n = spec.notes[0] + Math.floor(r() * (spec.notes[1] - spec.notes[0] + 1));
    const seq = Array.from({ length: n - 1 }, () => 3 + Math.floor(r() * 8));
    seq.push(EMPTY_H);
    const key = seq.join(',');
    if (seen.has(key)) continue;
    const route = buildRoute(seq, spec, r);
    if (!route) continue;
    seen.add(key); out.push(route);
  }
  return out;
}

// 公開する問題の検査：答えの積み方で、関門を通り、お題と一致すること（C-03）
export function melodySolvable(route) {
  const st = structureOf(route.target, 9, 9);
  if (!st) return false;
  const used = new Set(), ids = [];
  for (const w of st.init) {
    const id = route.items.findIndex((it, i) => !used.has(i) && it[0] === w);
    if (id < 0) return false;
    used.add(id); ids.push(id);
  }
  const placed = greedyPlacement(route.items, ids);
  return !!placed && simulate(route, route.items, placed).ok;
}
