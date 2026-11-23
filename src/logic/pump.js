// スクリューの面（F-028）。古い船に水がしみ込み、港と関門の手前で止まってスクリューで水を汲み出す。
// 船に入った水も重さに数える。判定は他の面と同じ式（C-01）。分数で正確に比べる。
//
// stage.pump：
//   per     1回まわすと汲み出す水の量
//   start   最初から船に入っている水
//   leak[i] 関門 i の手前までの区間でしみ込む水
//   turns   回せる回数（「待つ」も1回に数える）
//   inflow  止まっている間にしみ込む水（傷みのひどい船だけ）。1回まわすたび・1回待つたびに入る
// 止まった所での手は、整数 a で表す：a > 0 は a 回まわす、a < 0 は -a 回待つ（inflow のある船だけ）。
// 回すと待つを同じ所で混ぜるのは、むだに回数を使うだけなので考えない。
import { SHIP, AREA, HULL, depthFraction, clearsShoal, reachesDepth } from './physics.js';

export const cargoWeight = stage => stage.items.reduce((a, it) => a + it[0], 0);
export const pumpDepth = (stage, water, liquid = stage.start) => depthFraction(SHIP + cargoWeight(stage) + water, liquid, stage.area ?? AREA);

// 1回まわす：汲み出してから、しみ込む。1回待つ：しみ込むだけ
export const crankOnce = (water, P) => Math.max(0, water - P.per) + (P.inflow ?? 0);
export const waitOnce = (water, P) => water + (P.inflow ?? 0);
function act(water, a, P) {
  for (let k = 0; k < Math.abs(a); k++) water = a > 0 ? crankOnce(water, P) : waitOnce(water, P);
  return water;
}

// 関門 g を通れるか。入れ替え室は使わない（液体が変わると、汲み出す量と音階がそろわないため）
function passes(stage, water, liquid, g) {
  const d = pumpDepth(stage, water, liquid);
  if (g.k === 'shoal') return clearsShoal(d, g.d);
  if (g.k === 'bridge' || g.k === 'lever') return reachesDepth(d, g.d);
  return true;
}
const sunk = (stage, water, liquid) => pumpDepth(stage, water, liquid).gt(HULL);

// plan[0] は港での手、plan[i + 1] は関門 i の手前での手
export function pumpRun(stage, plan) {
  const P = stage.pump, liquid = stage.start;
  let water = P.start, left = P.turns;
  const use = a => { if (Math.abs(a) > left || (a < 0 && !P.inflow)) return false; left -= Math.abs(a); return true; };
  const a0 = plan[0] ?? 0;
  if (!use(a0)) return { ok: false, at: -1, why: 'turns' };
  water = act(water, a0, P);
  if (sunk(stage, water, liquid)) return { ok: false, at: -1, why: 'sink' };
  for (let i = 0; i < stage.gates.length; i++) {
    water += P.leak[i];
    if (sunk(stage, water, liquid)) return { ok: false, at: i, why: 'sink' };
    const a = plan[i + 1] ?? 0;
    if (!use(a)) return { ok: false, at: i, why: 'turns' };
    water = act(water, a, P);
    if (sunk(stage, water, liquid)) return { ok: false, at: i, why: 'sink' };
    if (!passes(stage, water, liquid, stage.gates[i])) return { ok: false, at: i, why: stage.gates[i].k };
  }
  return { ok: true, water, left };
}

// すべての手を試して、通れる手順を集める（C-03）。水が無いのに回す手は数えない
export function pumpPlans(stage, { limit = 5000 } = {}) {
  const P = stage.pump, n = stage.gates.length, out = [];
  const walk = (i, water, left, plan) => {
    if (out.length >= limit) return;
    if (i > 0) { water += P.leak[i - 1]; if (sunk(stage, water, stage.start)) return; }
    const choices = [0];
    for (let k = 1, w = water; k <= left; k++) {
      if (w <= (P.inflow ?? 0)) break;   // これ以上回しても水は減らない
      w = crankOnce(w, P); choices.push(k);
    }
    if (P.inflow) for (let k = 1; k <= left; k++) choices.push(-k);
    for (const a of choices) {
      const w = act(water, a, P);
      if (sunk(stage, w, stage.start)) continue;
      if (i > 0 && !passes(stage, w, stage.start, stage.gates[i - 1])) continue;
      const p = [...plan, a];
      if (i === n) out.push(p); else walk(i + 1, w, left - Math.abs(a), p);
    }
  };
  walk(0, P.start, P.turns, []);
  return out;
}
export const turnsOf = plan => plan.reduce((a, k) => a + Math.abs(k), 0);

// 問題の検査：解けない、回さなくても通れる、最初から沈んでいる、をはねる
export function pumpProblem(stage) {
  if (sunk(stage, stage.pump.start, stage.start)) return '最初から沈む';
  if (!pumpPlans(stage, { limit: 1 }).length) return '解けない';
  if (pumpRun(stage, new Array(stage.gates.length + 1).fill(0)).ok) return '回さなくても通れる';
  return null;
}

// 関門の手前で、その関門だけを見て最小限回す（素直な回し方）
export function lazyPlan(stage) {
  const P = stage.pump, plan = [0];
  let water = P.start;
  for (let i = 0; i < stage.gates.length; i++) {
    water += P.leak[i];
    let k = 0;
    while (k < 30 && !passes(stage, act(water, k, P), stage.start, stage.gates[i]) && stage.gates[i].k === 'shoal') k++;
    plan.push(k); water = act(water, k, P);
  }
  return plan;
}
// 止まるたびに、回せるだけ回す
export function greedyPlan(stage) {
  const P = stage.pump, plan = [];
  let water = P.start, left = P.turns;
  for (let i = 0; i <= stage.gates.length; i++) {
    if (i > 0) water += P.leak[i - 1];
    let k = 0;
    while (k < left && water > (P.inflow ?? 0)) { water = crankOnce(water, P); k++; if (P.inflow && water <= P.inflow) break; }
    plan.push(k); left -= k;
  }
  return plan;
}
