// 比重の解説の図（液体が変わる最初の面の前に出す）。数値は src/logic の計算から入れる（C-01）。
import { Fraction } from '../logic/fraction.js';
import { AREA, HULL, LIQUIDS, depthFraction } from '../logic/physics.js';
import { MELODY_LIQUIDS } from '../logic/melody.js';
import { midiOf } from '../logic/pitch.js';
import { GRAPHICS } from './graphics.js';

const LS_INK = '#23304a', LS_RED = '#d6452c', LS_PAPER = '#fffaf0';
const LS_NOTE = { 96: 'ド', 93: 'ラ', 91: 'ソ', 88: 'ミ', 86: 'レ', 84: 'ド', 81: 'ラ', 79: 'ソ', 76: 'ミ', 74: 'レ', 72: 'ド' };
const lsNum = x => String(Math.round(x * 100) / 100);
const lsText = (x, y, s, size = 12, color = LS_INK, anchor = 'middle', bold = true) =>
  `<text x="${x}" y="${y}" font-size="${size}" ${bold ? 'font-weight="700"' : ''} text-anchor="${anchor}" fill="${color}" stroke="${LS_PAPER}" stroke-width="3" paint-order="stroke">${s}</text>`;

// 同じ重さの船を、2つの液体に浮かべて比べる
function lsCompare({ weight, liqs }) {
  const SURF = 116, GU = 12, BW = 112;
  const panel = (liq, k) => {
    const x0 = k * 160, d = depthFraction(weight, liq).toNumber(), sunk = d > HULL;
    const bottom = sunk ? 212 : SURF + d * GU, top = bottom - HULL * GU, bx = x0 + 24;
    const id = `ls-${liq}-${k}`;
    let g = `<defs><pattern id="${id}" patternUnits="userSpaceOnUse" width="240" height="110" y="${SURF}"><image href="${GRAPHICS['liquid-' + liq]}" width="240" height="110" preserveAspectRatio="none"/></pattern></defs>`;
    g += `<rect x="${x0}" width="160" height="240" fill="#8fd0d4"/><rect x="${x0}" y="${SURF}" width="160" height="${240 - SURF}" fill="url(#${id})"/>`;
    g += `<image href="${GRAPHICS.boat}" x="${bx}" y="${top - HULL * GU * 28 / 116}" width="${BW}" height="${HULL * GU * 144 / 116}" preserveAspectRatio="none"/>`;
    if (!sunk) {
      // 押しのけた液体（液面から船底まで）
      g += `<rect x="${bx + 8}" y="${SURF}" width="${BW - 16}" height="${bottom - SURF}" fill="#fffaf0" fill-opacity=".35" stroke="${LS_RED}" stroke-width="1.6" stroke-dasharray="4 3"/>`;
      g += `<path d="M${x0 + 146} ${SURF}V${bottom}m-5 0h10m-10 ${SURF - bottom}h10" stroke="${LS_RED}" stroke-width="2.2" fill="none"/>`;
      g += lsText(x0 + 140, Math.max(SURF + 14, (SURF + bottom) / 2 + 5), `深さ${lsNum(d)}`, 12, LS_RED, 'end');
      if (bottom - SURF > 30) g += lsText(bx + 46, bottom - 8, '押しのけた分', 9, LS_RED);
    } else g += lsText(x0 + 80, 140, '沈む', 22, LS_RED) + lsText(x0 + 80, 160, `深さ${lsNum(d)}は船の高さ${HULL}を超える`, 10, LS_RED);
    g += `<path d="M${x0} ${SURF}h160" stroke="${LS_PAPER}" stroke-width="1.5"/>`;
    g += lsText(x0 + 80, 20, `${LIQUIDS[liq].n}（比重${LIQUIDS[liq].s}）`, 15) + lsText(x0 + 80, 37, `船全体の重さ ${weight}`, 11);
    g += lsText(x0 + 80, 232, `${weight}÷（${LIQUIDS[liq].s}×${AREA}）＝${lsNum(d)}`, 11);
    return g;
  };
  return `<svg viewBox="0 0 320 240" role="img" aria-label="同じ重さ${weight}の船を、${liqs.map(l => LIQUIDS[l].n).join('と')}に浮かべた比べ">` +
    liqs.map(panel).join('') + `<path d="M160 0V240" stroke="${LS_INK}" stroke-width="2"/></svg>`;
}

// 航路のメロディ：深さ（音）ごとに、要る重さを液体ごとに並べる
function lsLadder({ liqs }) {
  const envs = liqs.map(l => MELODY_LIQUIDS[l]), depths = [1, 1.5, 2, 2.5, 3];
  const col = [34, 78, 166, 262], rowY = i => 78 + i * 30;
  const name = env => ({ water: '水の船', oil: '油の小舟', mercury: '水銀の鉄の船' }[env.liq]);
  let g = `<rect width="320" height="240" fill="${LS_PAPER}"/>`;
  g += lsText(col[0], 30, '深さ', 12) + lsText(col[1], 30, '音', 12);
  envs.forEach((env, k) => {
    g += lsText(col[2 + k], 24, name(env), 12);
    g += lsText(col[2 + k], 40, `比重${LIQUIDS[env.liq].s}・底面積${env.area}`, 10, LS_INK, 'middle', false);
  });
  g += `<path d="M10 52H310" stroke="${LS_INK}" stroke-width="1.5"/>`;
  depths.forEach((d, i) => {
    const y = rowY(i), df = new Fraction(BigInt(d * 2), 2n);
    g += lsText(col[0], y, String(d), 14) + lsText(col[1], y, LS_NOTE[Math.round(midiOf(d))], 14, LS_RED);
    envs.forEach((env, k) => {
      const w = df.mul(Fraction.of(LIQUIDS[env.liq].sg)).mul(env.area).toNumber();
      g += lsText(col[2 + k], y, `重さ ${lsNum(w)}`, 14);
      if (i === 0) g += lsText(col[2 + k], y + 12, '（船だけ・空荷）', 8, LS_INK, 'middle', false);
      if (i > 0) g += lsText(col[2 + k] + 34, y - 14, `＋${env.step}`, 10, LS_RED, 'start');
    });
    g += `<path d="M10 ${y + 15}H310" stroke="${LS_INK}" stroke-opacity=".15"/>`;
  });
  g += lsText(160, 232, envs.map(e => `${LIQUIDS[e.liq].n}：音一つ分は重さ${e.step}`).join('　'), 11, LS_RED);
  return `<svg viewBox="0 0 320 240" role="img" aria-label="深さと音ごとに、要る重さを${liqs.map(l => LIQUIDS[l].n).join('と')}で比べた表">${g}</svg>`;
}

export function lessonFigure(spec) {
  return spec.kind === 'ladder' ? lsLadder(spec) : lsCompare(spec);
}
