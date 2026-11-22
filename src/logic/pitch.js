// 沈む深さと音の高さ（要件F-007）。深いほど低い。深さ0.5ごとに、Cのメジャーペンタトニックを下行する。
import { Fraction } from './fraction.js';
import { HULL } from './physics.js';

export const STEPS = [96, 93, 91, 88, 86, 84, 81, 79, 76, 74, 72];
export function midiOf(depth) {
  const p = Math.max(0, Math.min(depth, HULL)) * 2, i = Math.min(Math.floor(p), STEPS.length - 2);
  return STEPS[i] + (STEPS[i + 1] - STEPS[i]) * (p - i);
}
export const onScale = depth => Fraction.of(depth).mul(2).isInteger() && !depth.gt(HULL);

// 鳴らす音（v0.9.23）：深さを一番近い音階の音に寄せ、半端な深さのときは揺らす。判定は変えない（分数で比べる）
export function voiceOf(depth) {
  const p = Math.max(0, Math.min(depth, HULL)) * 2, near = Math.round(p);
  return { midi: midiOf(near / 2), wobble: Math.abs(p - near) > 1e-6 || depth > HULL };
}
