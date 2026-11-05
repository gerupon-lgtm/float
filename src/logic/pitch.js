// 沈む深さと音の高さ（要件F-007）。深いほど低い。深さ0.5ごとに、Cのメジャーペンタトニックを下行する。
import { Fraction } from './fraction.js';
import { HULL } from './physics.js';

export const STEPS = [96, 93, 91, 88, 86, 84, 81, 79, 76, 74, 72];
export function midiOf(depth) {
  const p = Math.max(0, Math.min(depth, HULL)) * 2, i = Math.min(Math.floor(p), STEPS.length - 2);
  return STEPS[i] + (STEPS[i + 1] - STEPS[i]) * (p - i);
}
export const onScale = depth => Fraction.of(depth).mul(2).isInteger() && !depth.gt(HULL);
