// 説明用の図。数値は計算から入れ、ゲームの判定や値は変更しない。
import { AREA, HULL, SHIP, LIQUIDS, depthOf } from '../logic/physics.js';
import { GRAPHICS } from './graphics.js';
import { melodyArtDefs, melodyBridgeArt, melodyShoalArt, melodyPileTag } from './melody-art.js';

const U = 15.6, WATER = 134, HX = 70, HW = 161.2;
const number = x => String(Math.round(x * 100) / 100);
const boat = depth => {
  const top = WATER + depth * U - HULL * U;
  return '<image href="' + GRAPHICS.boat + '" x="' + HX + '" y="' + (top - HULL * U * 28 / 116) +
    '" width="' + HW + '" height="' + (HULL * U * 144 / 116) + '" preserveAspectRatio="none"/>';
};
const sea = id => '<defs><pattern id="' + id + '" patternUnits="userSpaceOnUse" width="240" height="110" y="' + WATER +
  '"><image href="' + GRAPHICS['liquid-water'] + '" width="240" height="110" preserveAspectRatio="none"/></pattern></defs>' +
  '<rect width="330" height="226" fill="#8fd0d4"/><rect y="' + WATER + '" width="330" height="92" fill="url(#' + id + ')"/>';
const waterline = '<path d="M0 134H62m176 0h92" stroke="#fffaf0" stroke-width="2" fill="none"/>';

export function calculationFigure() {
  // guide.js の既存の「重さ35」の例。同じ計算で船底から液面までを示す。
  const weight = 35, depth = depthOf(weight, 'water'), bottom = WATER + depth * U;
  return '<figure class="guide-calculation"><div class="guide-figure-title">水での例</div>' +
    '<svg viewBox="0 50 330 174" role="img" aria-label="水中の船。沈む深さは液面から船底まで">' + sea('guide-calc-water') +
    boat(depth) + '<image href="' + GRAPHICS['cargo-stone'] + '" x="91" y="' + (bottom - 36) + '" width="41" height="28"/>' +
    '<image href="' + GRAPHICS['cargo-sack'] + '" x="143" y="' + (bottom - 50) + '" width="38" height="42"/>' +
    '<path d="M252 134h12m-6 0V' + bottom + 'm-6 0h12" fill="none" stroke="#d6452c" stroke-width="2.5"/>' +
    '<path d="M234 ' + bottom + 'H266" stroke="#23304a" stroke-width="1" stroke-dasharray="3 3"/>' +
    '<text x="273" y="' + ((WATER + bottom) / 2 - 5) + '" font-size="12" fill="#23304a">深さ</text>' +
    '<text x="273" y="' + ((WATER + bottom) / 2 + 16) + '" font-size="21" font-weight="700" fill="#d6452c">' + number(depth) + '</text>' +
    '<text x="10" y="126" font-size="12" font-weight="700" fill="#23304a">液面</text>' + waterline + '</svg>' +
    '<figcaption><span>船全体の重さ<b>' + weight + '</b></span><span>水の比重<b>' + LIQUIDS.water.s + '</b></span><span>底面積<b>' + AREA + '</b></span></figcaption>' +
    '<p class="guide-example-parts">船だけ ' + SHIP + ' ＋ 荷 ' + number(weight - SHIP) + '</p></figure>';
}

export function gateFigures() {
  const limit = HULL / 2, bottom = WATER + limit * U;
  return '<div class="guide-gates">' + ['shoal', 'bridge', 'lever'].map(kind => {
    const name = { shoal: '浅瀬', bridge: '低い橋', lever: '水中のレバー' }[kind];
    const condition = number(limit) + (kind === 'shoal' ? 'まで' : '以上');
    const before = kind === 'shoal' ? melodyShoalArt(150, 150, bottom) : '';
    const after = kind === 'bridge' ? melodyBridgeArt(247.2, 74, WATER + limit * U - HULL * U - 3) : kind === 'lever'
      ? '<image href="' + GRAPHICS['lever-arm'] + '" x="225" y="' + (bottom - 14) + '" width="65" height="43"/>' : '';
    return '<figure class="guide-gate"><figcaption><b>' + name + '</b><span>例：' + condition + '</span></figcaption>' +
      '<svg viewBox="0 0 330 226" role="img" aria-label="' + name + 'を、ちょうど深さ' + number(limit) + 'で通る例">' +
      '<defs>' + melodyArtDefs() + '</defs>' + sea('guide-gate-water-' + kind) + before + boat(limit) + after + waterline + '</svg>' +
      '<p>✓ ' + (kind === 'lever' ? '船底が届く' : 'ちょうどでも通れる') + '</p></figure>';
  }).join('') + '</div>';
}

// 本体 melody.js と同じ音符・港札・荷札の輪郭、寸法、色。数字は例としてSVGの文字で入れる。
export function melodyPartFigure(kind) {
  if (kind === 'note') return '<svg viewBox="0 0 120 78" role="img" aria-label="航海図のお題の音符"><g transform="translate(60 48) scale(2.5)">' +
    '<path d="M-15 0H15" stroke="#23304a" stroke-width="2" stroke-linecap="round"/><ellipse cx="0" cy="0" rx="5.6" ry="4" transform="rotate(-22)" fill="#23304a" stroke="#fffaf0" stroke-width="1.2"/>' +
    '<path d="M4.6 -1.5V-17q1 5 6.5 7.5" fill="none" stroke="#23304a" stroke-width="1.8" stroke-linecap="round"/></g></svg>';
  if (kind === 'port') return '<svg viewBox="0 0 120 90" role="img" aria-label="航海図の港1の札と荷下ろしの矢印"><g transform="translate(60 12) scale(2.2)">' +
    '<rect x="-14" width="28" height="16" rx="3" fill="#d6452c" stroke="#5f3b1c" stroke-width="1.2"/><text x="0" y="12" font-size="10.5" font-weight="700" text-anchor="middle" fill="#fffaf0">港1</text>' +
    '<text x="0" y="29" font-size="9.5" font-weight="700" text-anchor="middle" fill="#23304a">↑下ろす</text></g></svg>';
  return '<svg viewBox="0 0 184 104" role="img" aria-label="荷札。上は順番1、下は重さ15。荷の山の札は3段の例"><defs>' + melodyArtDefs() + '</defs>' +
    '<g transform="translate(6 20) scale(3)"><path d="M4 .4H20.5V20H.5V4Z" fill="#fffaf0" stroke="#23304a" stroke-width=".8"/>' +
    '<text x="10.5" y="9.3" font-size="10" font-weight="700" text-anchor="middle" fill="#d6452c">1</text><path d="M3 10.8H18" stroke="#cdbf9f" stroke-width=".7"/>' +
    '<text x="10.5" y="19.2" font-size="11.5" font-weight="700" text-anchor="middle" fill="#23304a" font-family="Arial,sans-serif">15</text></g>' +
    '<g transform="translate(-300 6) scale(2)">' + melodyPileTag(3) + '</g></svg>';
}
