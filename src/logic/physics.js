// 浮き沈みの計算（要件定義書5章）。判定は分数で行い、浮動小数点は描画と発音にだけ使う。
import { Fraction } from './fraction.js';

export const AREA = 10; // 船の底面積
export const HULL = 5;  // 船の高さ
export const SHIP = 10; // 船だけの重さ

// 比重はゲームの設定値。画面の表示は s、判定は sg（分数）を使う
export const LIQUIDS = {
  water: { n: '水', s: 1, sg: '1', c: 'var(--water)' },
  oil: { n: '油', s: 0.8, sg: '4/5', c: 'var(--oil)' },
  mercury: { n: '水銀', s: 13.5, sg: '27/2', c: 'var(--mercury)' }
};

// 素材の比重（設定値）と、1マスの重さ。1マスは体積4
export const CELL_VOLUME = 4;
export const MATERIALS = {
  wood: { n: '木', sg: '1/2' }, wheat: { n: '麦袋', sg: '7/10' }, jar: { n: '壺', sg: '1' }, stone: { n: '石', sg: '5/2' },
  iron: { n: '鉄', sg: '8' }, lead: { n: '鉛', sg: '11' }, gold: { n: '金', sg: '19' }
};
export const cellWeight = material => Fraction.of(MATERIALS[material].sg).mul(CELL_VOLUME).toNumber();

// 小数第2位までの数を分数にする（面の条件値 4.5 など）
export const exact = x => new Fraction(BigInt(Math.round(x * 100)), 100n);

// 沈む深さ ＝ 重さ ÷（比重 × 底面積）
export function depthFraction(weight, liquid, area = AREA) {
  if (!(weight > 0)) throw new Error('重さは0より大きい値にしてください。');
  return exact(weight).div(Fraction.of(LIQUIDS[liquid].sg).mul(area));
}
export const depthOf = (weight, liquid, area = AREA) => depthFraction(weight, liquid, area).toNumber();

// 深さが船の高さより大きいと沈む。ちょうど同じなら沈まない
export const isSunk = (weight, liquid, area = AREA, hull = HULL) => depthFraction(weight, liquid, area).gt(hull);
export const sinkingWeight = (liquid, area = AREA, hull = HULL) => Fraction.of(LIQUIDS[liquid].sg).mul(area).mul(hull).toNumber();
export const clearsShoal = (depth, limit) => depth.cmp(exact(limit)) <= 0;
export const reachesDepth = (depth, limit) => depth.cmp(exact(limit)) >= 0;
