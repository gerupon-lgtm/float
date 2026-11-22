// 航路のメロディ（要件F-020、7.2節）。計算・判定・お題の作成と検査。画面は src/ui/melody.js。
// 水・底面積10・船の重さ10。深さ0.5（音1つ分）は重さ5。お題は深さ×2の整数 h（3〜10、最後は空荷の2）で持つ。
import { Fraction } from './fraction.js';
import { SHIP, HULL, depthFraction, exact } from './physics.js';
import { CELLS, ROWMAX, dropCargo, stackRows, pileClearsBridge } from './stacking.js';

// 航路ごとの液体と船。油の航路は軽い小舟（船だけの重さ8）に乗り換え、空荷の深さを水と同じ1（ソ）にそろえる
export const MELODY_LIQUIDS = { water: { liq: 'water', ship: SHIP, step: 5 }, oil: { liq: 'oil', ship: 8, step: 4 } };
export const envOf = route => MELODY_LIQUIDS[route?.liq ?? 'water'];
export const STEP_WEIGHT = 5;                 // 深さ0.5の重さ（水・底面積10）
export const EMPTY_H = 2;                     // 空荷の h（深さ1）。水も油も同じ
export const depthOfH = h => new Fraction(BigInt(h), 2n);
export const hOfDepth = d => d.mul(2).toNumber();

// 荷：[重さ, 名前, 幅, 高さ, 色]。大きさは 重さ÷比重 を1マス体積4で丸めた形（要件5章）
export const MELODY_ITEMS = {
  5: [5, '麦袋', 2, 1, '#d8b56a'],
  10: [10, '石', 1, 1, '#9a9a92'],
  15: [15, '壺', 2, 2, '#d0743c'],
  20: [20, '石', 2, 1, '#9a9a92']
};
// 同じ重さ・同じマス数で、縦長の形もある（立てた麦袋、縦長の石）。積み方の面で山の高さに効く
const TALL = { 5: [5, '麦袋', 1, 2, '#d8b56a'], 20: [20, '石', 1, 2, '#9a9a92'] };

// 音階に乗らない重さのおとり（木は軽くて大きい）
export const DECOYS = [[4, '木の板', 2, 1, '#c9955a'], [8, '木箱', 2, 2, '#b07a40'], [6, '木の板', 3, 1, '#c9955a']];
// 油の航路の荷：深さ0.5が重さ4なので、4の倍数。水で使った5の倍数の荷が、ここではおとりになる
export const OIL_ITEMS = {
  4: [4, '木の板', 2, 1, '#c9955a'],
  8: [8, '木箱', 2, 2, '#b07a40'],
  12: [12, '壺', 3, 1, '#d0743c'],
  16: [16, '石', 2, 1, '#9a9a92']
};
const OIL_TALL = { 4: [4, '木の板', 1, 2, '#c9955a'], 16: [16, '石', 1, 2, '#9a9a92'] };
const OIL_DECOYS = [[5, '麦袋', 2, 1, '#d8b56a'], [10, '石', 1, 1, '#9a9a92'], [15, '壺', 2, 2, '#d0743c']];

export const weightOf = (items, placed, route) => envOf(route).ship + placed.reduce((a, p) => a + items[p.id][0], 0);
export const depthNow = (items, placed, route) => depthFraction(weightOf(items, placed, route), envOf(route).liq);

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
    const d = depthNow(items, placed, route), fault = segmentFault(route, i, d, stackRows(placed, items));
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
export function structureOf(seq, maxStep = 4, maxInit = 3, step = STEP_WEIGHT) {
  if (seq.at(-1) !== EMPTY_H) return null;
  const loadStack = [], pops = [], ports = [];
  for (let i = 0; i + 1 < seq.length; i++) {
    const dh = seq[i + 1] - seq[i];
    if (dh === 0 || Math.abs(dh) > maxStep) return null;
    const w = Math.abs(dh) * step;
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
  const env = MELODY_LIQUIDS[spec.liq ?? 'water'], table = env.liq === 'oil' ? OIL_ITEMS : MELODY_ITEMS, tallT = env.liq === 'oil' ? OIL_TALL : TALL;
  const st = structureOf(seq, spec.maxStep ?? 4, spec.maxInit ?? 3, env.step);
  if (!st) return null;
  const loads = st.ports.filter(p => p.k === 'load').length;
  if (loads < (spec.loads?.[0] ?? 0) || loads > (spec.loads?.[1] ?? 9)) return null;
  if (new Set(seq).size < (spec.distinct ?? 3)) return null;
  if (spec.minLeap && Math.max(...seq.slice(1).map((h, i) => Math.abs(h - seq[i]))) < spec.minLeap) return null;   // 大きく跳ぶ音を含む
  // 形は重さごとに1つに決める（同じ重さで形が違うと、答えの荷が入れ替えられてしまうため）
  const tall = spec.gates?.includes('bridge'), shapeOf = {};
  const itemOf = w => [...(shapeOf[w] ??= (tall && tallT[w] && r() < 0.5 ? tallT[w] : table[w]))];
  const ports = st.ports.map(p => (p.k === 'down' ? { k: 'down' } : { k: 'load', item: itemOf(p.w) }));
  // 棚：答えの荷と、おとり2つ（音階に乗らない木と、答えにない重さの荷）
  const answer = st.init.map(w => itemOf(w));
  const spare = Object.keys(table).map(Number).filter(w => !st.init.includes(w));
  const decoyList = env.liq === 'oil' ? OIL_DECOYS : DECOYS, decoys = [[...decoyList[Math.floor(r() * decoyList.length)]]];
  if (spare.length && answer.length < 4) decoys.push(itemOf(spare[Math.floor(r() * spare.length)]));
  const shelf = [...answer, ...decoys];
  for (let i = shelf.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [shelf[i], shelf[j]] = [shelf[j], shelf[i]]; }
  // 同じ重さが2つあっても別の荷を指すように、答えの荷は配列そのもので探す
  const ids = answer.map(a => shelf.indexOf(a));
  const route = { target: seq, ports, cond: {}, items: shelf, ...(env.liq === 'water' ? {} : { liq: env.liq }) };
  const inner = seq.slice(0, -1).map((h, i) => ({ h, i }));
  // 関門：浅瀬は一番深い海路、橋は浅い海路から順に。どちらも最後の空荷の海路には置かない。
  // 橋は、置き方を考えないと当たる海路に置く：通れる置き方があり、当たる置き方も十分にあること
  for (const kind of spec.gates ?? []) {
    const free = inner.filter(x => !route.cond[x.i]);
    if (kind === 'shoal') {
      if (!free.length) return null;
      const deep = free.reduce((a, b) => (b.h > a.h ? b : a));
      if (deep.h >= 2 * HULL) return null;      // 深さ5の浅瀬は、沈まない限り必ず通れて意味がない
      route.cond[deep.i] = { k: 'shoal', d: deep.h / 2 };
      continue;
    }
    let chosen = false;
    for (const x of free.sort((a, b) => a.h - b.h)) {
      route.cond[x.i] = { k: 'bridge', d: x.h / 2 };
      const st2 = placementStats(route, shelf, ids);
      if (st2.ok > 0 && st2.bridge / st2.all >= (spec.mustPlace ?? 0.25)) { chosen = true; break; }
      delete route.cond[x.i];
    }
    if (!chosen) return null;
  }
  if (!placementStats(route, shelf, ids).ok) return null;   // 解けない問題は出さない（C-03）
  return route;
}

// 長い航路向け：出航時の荷と港の動きを先に決めてから、お題の並びを作る（でたらめに並べるより早く見つかる）
function walkSeq(spec, r) {
  const n = spec.notes[0] + Math.floor(r() * (spec.notes[1] - spec.notes[0] + 1)), ports = n - 1;
  const loads = spec.loads[0] + Math.floor(r() * (spec.loads[1] - spec.loads[0] + 1));
  const downs = ports - loads, init = downs - loads, maxStep = spec.maxStep ?? 4;
  if (init < 1 || init > (spec.maxInit ?? 3)) return null;
  const step = () => 1 + Math.floor(r() * maxStep);
  const stack = Array.from({ length: init }, step);
  let h = EMPTY_H + stack.reduce((a, b) => a + b, 0), left = loads;
  if (h > 2 * HULL) return null;
  const seq = [h];
  for (let p = 0; p < ports; p++) {
    const mustDown = left === 0, mustLoad = stack.length === 1 && p < ports - 1 && left > 0 && r() < 0.5;
    const canLoad = left > 0 && stack.length + left <= ports - p - 1;
    if (!mustDown && canLoad && (mustLoad || r() < left / (ports - p))) {
      const w = step(); if (h + w > 2 * HULL) return null;
      stack.push(w); h += w; left--;
    } else {
      if (!stack.length || (stack.length === 1 && p < ports - 1)) return null;   // 途中で空荷にしない
      h -= stack.pop();
    }
    seq.push(h);
  }
  return stack.length === 0 && h === EMPTY_H ? seq : null;
}

// 面の条件 spec から、お題を count 個作る。同じメロディは出さない
export function pickMelodies(spec, { count = 8, seed = 1, tries = 300000 } = {}) {
  const r = random(seed), out = [], seen = new Set();
  for (let t = 0; t < tries && out.length < count; t++) {
    let seq;
    if (spec.walk) { seq = walkSeq(spec, r); if (!seq) continue; }
    else {
      const n = spec.notes[0] + Math.floor(r() * (spec.notes[1] - spec.notes[0] + 1));
      seq = Array.from({ length: n - 1 }, () => 3 + Math.floor(r() * 8));
      seq.push(EMPTY_H);
    }
    const key = seq.join(',');
    if (seen.has(key)) continue;
    const route = buildRoute(seq, spec, r);
    if (!route) continue;
    seen.add(key); out.push(route);
  }
  return out;
}

// 出航前の荷を、決めた順に、それぞれ好きな列へ落とすすべての置き方
export function allPlacements(shelf, ids) {
  const out = [];
  const rec = (k, placed) => {
    if (k === ids.length) { out.push(placed); return; }
    for (let c = 0; c + shelf[ids[k]][2] <= CELLS; c++) {
      const p = dropCargo(placed, shelf, ids[k], c);
      if (p) rec(k + 1, [...placed, p]);
    }
  };
  rec(0, []);
  return out;
}
// 置き方ごとの結果：ok＝お題どおり通れる、bridge＝橋に当たる、all＝置き方の数
export function placementStats(route, shelf, ids) {
  let ok = 0, bridge = 0, all = 0;
  for (const pl of allPlacements(shelf, ids)) {
    all++;
    const r = simulate(route, shelf, pl);
    if (r.ok) ok++; else if (r.fault === 'bridge') bridge++;
  }
  return { ok, bridge, all };
}
// 答えの荷（出航時、下から順）の棚の番号
export function answerIds(route) {
  const st = structureOf(route.target, 9, 9, envOf(route).step);
  if (!st) return null;
  const used = new Set(), ids = [];
  for (const w of st.init) {
    const id = route.items.findIndex((it, i) => !used.has(i) && it[0] === w);
    if (id < 0) return null;
    used.add(id); ids.push(id);
  }
  return ids;
}
// 公開する問題の検査：答えの順で、関門を通りお題と一致する置き方が少なくとも1つあること（C-03）
export function melodySolvable(route) {
  const ids = answerIds(route);
  return !!ids && placementStats(route, route.items, ids).ok > 0;
}
