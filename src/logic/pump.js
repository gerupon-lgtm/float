// スクリューの面（F-028）。古い船に水がしみ込み、関門の手前で止まってスクリューを回して水を汲み出す。
// 船に入った水も重さに数える。判定は他の面と同じ式（C-01）。分数で正確に比べる。
import { SHIP, AREA, HULL, depthFraction, clearsShoal, reachesDepth } from './physics.js';

// 流れ：港で回す → [関門ごとに：水がしみ込む → 止まって回す → 関門] → 港
// plan[0] は港で回す回数、plan[i + 1] は関門 i の手前で回す回数
export const cargoWeight = stage => stage.items.reduce((a, it) => a + it[0], 0);
export const pumpDepth = (stage, water) => depthFraction(SHIP + cargoWeight(stage) + water, stage.start, stage.area ?? AREA);
const pumpOut = (water, k, per) => Math.max(0, water - k * per);

export function pumpRun(stage, plan) {
  const P = stage.pump;
  let water = P.start, left = P.turns;
  const use = k => { if (k > left) return false; left -= k; return true; };
  if (!use(plan[0] ?? 0)) return { ok: false, at: -1, why: 'turns' };
  water = pumpOut(water, plan[0] ?? 0, P.per);
  for (let i = 0; i < stage.gates.length; i++) {
    const g = stage.gates[i];
    water += P.leak[i];
    if (pumpDepth(stage, water).gt(HULL)) return { ok: false, at: i, why: 'sink' };
    const k = plan[i + 1] ?? 0;
    if (!use(k)) return { ok: false, at: i, why: 'turns' };
    water = pumpOut(water, k, P.per);
    const d = pumpDepth(stage, water);
    if (g.k === 'shoal' && !clearsShoal(d, g.d)) return { ok: false, at: i, why: 'shoal' };
    if (g.k === 'bridge' && !reachesDepth(d, g.d)) return { ok: false, at: i, why: 'bridge' };
  }
  return { ok: true, water, left };
}

// すべての回し方を試して、通れる回し方を数える（C-03）。むだに回す（水が無いのに回す）手は数えない
export function pumpPlans(stage) {
  const P = stage.pump, n = stage.gates.length, out = [];
  const walk = plan => {
    if (plan.length === n + 1) { if (pumpRun(stage, plan).ok) out.push(plan); return; }
    const used = plan.reduce((a, k) => a + k, 0);
    // この時点の水の量（ここまでの回し方で決まる）
    let water = P.start;
    for (let j = 0; j < plan.length; j++) { if (j > 0) water += P.leak[j - 1]; water = pumpOut(water, plan[j], P.per); }
    if (plan.length > 0) water += P.leak[plan.length - 1];
    const most = Math.min(P.turns - used, Math.ceil(water / P.per));
    for (let k = 0; k <= most; k++) walk([...plan, k]);
  };
  walk([]);
  return out;
}

// 問題の検査：解けない、回さなくても通れる、回し方が多すぎる、などをはねる
export function pumpProblem(stage) {
  const plans = pumpPlans(stage), n = stage.gates.length;
  if (!plans.length) return '解けない';
  if (pumpRun(stage, new Array(n + 1).fill(0)).ok) return '回さなくても通れる';
  if (pumpDepth(stage, stage.pump.start).gt(HULL)) return '最初から沈む';
  return null;
}

// 関門の手前で、その関門だけを見て最小限回す（素直な回し方）。これで通れるかどうか
export function lazyPlan(stage) {
  const P = stage.pump, plan = [0];
  let water = P.start;
  for (let i = 0; i < stage.gates.length; i++) {
    water += P.leak[i];
    const g = stage.gates[i];
    let k = 0;
    if (g.k === 'shoal') while (k * P.per < water && !clearsShoal(pumpDepth(stage, pumpOut(water, k, P.per)), g.d)) k++;
    plan.push(k); water = pumpOut(water, k, P.per);
  }
  return plan;
}
