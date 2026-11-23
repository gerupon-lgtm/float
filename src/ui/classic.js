// 元の遊び方の面。画面の構成は航路のメロディ（src/ui/melody.js）にそろえる：上に航路図、手がかり、船の拡大と右に荷の棚、案内、ボタン。
// 計算・判定は src/logic。ここは画面と流れだけ（判定の順番と内容は以前の app.js と同じ）。
import { SHIP, HULL, LIQUIDS, depthOf, depthFraction, depthLabel, isSunk, sinkingWeight, clearsShoal, reachesDepth } from '../logic/physics.js';
import { midiOf } from '../logic/pitch.js';
import { CELLS, ROWMAX, dropCargo, stackRows, pileClearsBridge, pileExtra } from '../logic/stacking.js';
import { keelMark } from './chart-mark.js';
import { rowsUnderBridge } from '../logic/melody.js';
import { hintLevel, shoalText, shallowText, sinkText } from '../content/fail-text.js';
import { GRAPHICS, cargoArt } from './graphics.js';
import { melodyArtDefs, melodyShoalArt, melodyBridgeArt, melodyQuayArt, melodyPileTag } from './melody-art.js';
import { classicArtDefs, classicCradleArt, classicLeverArt, classicChamberArt, classicChartLiquid, classicChartLever, classicChartChamber, classicHarborFlag, classicSafeBand } from './classic-art.js';

const CL_BOAT_TOP = 28 / 116;
const CL_NOTE = { 96: 'ド', 93: 'ラ', 91: 'ソ', 88: 'ミ', 86: 'レ', 84: 'ド', 81: 'ラ', 79: 'ソ', 76: 'ミ', 74: 'レ', 72: 'ド' };
const CL_TINT = { water: '#c4e1df', oil: '#efdc9c', mercury: '#cfd2d8' };
const CL_GATE = { shoal: '浅瀬', bridge: '橋', lever: 'レバー', chamber: '入れ替え室' };

// ctx：app.js から渡す道具（show, topbar, wire, audio, run, book, ngText, enter, finish, pick, wait, token, alive, muted）
export function classicStage(n, S, ctx) {
  const { audio: au } = ctx;
  const R = ctx.run();
  const hide = !!R?.hidesDepth && !S.showDepth, grid = !!S.grid;
  // スクリューの面（F-028）：船に水がしみ込み、関門の手前で止まって汲み出す
  const P = S.pump ?? null;
  const st = {
    liq: S.start, on: new Set(S.on), placed: [], sel: null, phase: 'prep', col: 0, gate: null, gateShift: null, hit: null,
    sign: null, fx: null, said: '', docked: false, floating: !S.cradle, sunk: false, busy: false,
    water: P?.start ?? 0, turns: P?.turns ?? 0, seenW: 0, resume: null
  };
  const hiddenW = SHIP + (S.loaded ? [...st.on].reduce((a, i) => a + S.items[i][0], 0) : 0);
  const weight = () => SHIP + st.water + (grid ? st.placed.reduce((a, p) => a + S.items[p.id][0], 0) : [...st.on].reduce((a, i) => a + S.items[i][0], 0));
  st.seenW = weight();
  // 止まっている間（港・関門の手前）は、ノーマル以上で深さを伏せる
  const stopped = () => st.phase === 'prep' || st.phase === 'pump';
  const live = () => !hide || !stopped();
  const depthF = () => depthFraction(weight(), st.liq, S.area);
  const dNow = () => depthF().toNumber();
  const hint = () => hintLevel(R?.level.id);
  const c = ctx.show('', 'melody-layout classic-layout');
  const $ = s => c.querySelector(s);
  const id0 = ctx.token();
  const alive = () => ctx.alive(id0) && c.isConnected;
  const say = (h, who = 'アルキメデス') => { st.said = who ? `<span class="who">${who}</span>${h}` : h; const e = $('#say'); if (e) e.innerHTML = st.said; };
  // 最初の数面（S.band）：両方の関門を通れる深さの幅を、航路図と案内で示す
  const band = (() => {
    if (!S.band) return null;
    const lo = Math.max(0, ...S.gates.filter(g => g.k === 'bridge' || g.k === 'lever').map(g => g.d));
    const hi = Math.min(HULL, ...S.gates.filter(g => g.k === 'shoal').map(g => g.d));
    return lo <= hi ? { lo, hi } : null;
  })();
  const gateLine = g => g.k === 'shoal' ? `浅瀬は${g.d}まで（深いとつかえる）` : g.k === 'bridge' ? `橋は${g.d}以上（浅いと当たる）` : g.k === 'lever' ? `レバーは${g.d}以上（浅いと届かない）` : '';
  const intro = () => P ? say(`<span class="nar">${S.lead}<br>1回まわすと、船の中の水が${P.per}減る。深さ＝重さ÷（比重×底面積${S.area}）。</span>`, null) : say(`<span class="nar">${S.lead}${band ? `${S.gates.map(gateLine).filter(Boolean).join('、')}。両方を通れるのは<b>深さ${band.lo}〜${band.hi}</b>（緑の帯）。` : ''}<br>深さ＝重さ÷（比重×底面積${S.area}）。船だけの重さ${SHIP}。</span>`, null);

  // 積み方の面以外の荷は、船の中に2マス幅で並べて見せる（重さの軽い順、1段に3つ）
  const shown = () => grid ? st.placed.map(p => ({ id: p.id, c: p.c, r: p.r, w: S.items[p.id][2], h: S.items[p.id][3] }))
    : [...st.on].sort((a, b) => S.items[a][0] - S.items[b][0]).map((id, i) => ({ id, c: (i % 3) * 2, r: Math.floor(i / 3), w: 2, h: 1 }));

  // ---- 船の拡大 ----
  const K = 1.3, U = 12 * K, ROW = 16 * K, DECK = 8 * K, CW = 18 * K, HW = 124 * K, HX = 70, WATER = 134;
  const shownDepth = () => (live() ? dNow() : depthOf(P ? st.seenW : hiddenW, st.liq, S.area));
  const bottomY = () => (st.floating ? WATER + Math.min(shownDepth(), HULL + 0.6) * U : WATER - 12);
  const VW = () => (P ? 330 : stopped() ? 240 : 330), GX = HX + HW + 16, GW = 74;
  function bridgeContact() {
    const gate = st.gate, front = HX + HW;
    if (gate?.k !== 'bridge') return { x: front, shift: 54 };
    const bottom = bottomY(), ceiling = WATER + gate.d * U - HULL * U;
    if (bottom - HULL * U < ceiling) return { x: front, shift: 54 };
    const high = grid ? st.placed.filter(p => bottom - DECK - (p.r + S.items[p.id][3]) * ROW < ceiling) : [];
    const x = high.length ? Math.max(...high.map(p => HX + 8 * K + (p.c + S.items[p.id][2]) * CW)) : front;
    return { x, shift: x - (front - 54) };
  }
  const LEVER_STOP = HX + HW * 0.55 - GX;   // レバーが船底の真下に来る位置
  function shipSvg() {
    const vw = VW(), bottom = bottomY(), top = bottom - HULL * U, cx = HX + 8 * K, gate = st.gate;
    const pick = st.phase === 'prep' && st.sel != null;
    const gpos = st.gateShift != null ? ` transform="translate(${st.gateShift} 0)"` : '';
    let g = `<defs><pattern id="cw" patternUnits="userSpaceOnUse" width="240" height="110" y="${WATER}"><image href="${GRAPHICS['liquid-' + st.liq]}" width="240" height="110" preserveAspectRatio="none"/></pattern>
      ${melodyArtDefs()}${classicArtDefs()}</defs>
      <rect width="${vw}" height="230" fill="var(--sky)"/><path d="M110 22q20 -14 40 0t40 0" fill="none" stroke="#fffaf0" stroke-width="5"/>
      <rect x="0" y="${WATER}" width="${vw}" height="100" fill="url(#cw)"/>`;
    // 出航前に台（船台）に載っている面：船の下に砂の斜面と台を描く
    if (!st.floating) g += classicCradleArt(HX, HW, bottom);
    if (st.sign === '入れ替え室') g += classicChamberArt(HX, HW, LIQUIDS[st.liq].c);
    if (gate?.k === 'shoal') {
      const ys = WATER + gate.d * U;
      g += `<g id="gate"${gpos}>${melodyShoalArt(GX, GW, ys)}
        <g font-size="10" font-weight="700" text-anchor="middle" fill="#fffaf0" stroke="#5f3b1c" stroke-width="2.6" paint-order="stroke"><text x="${GX + GW / 2}" y="${ys - 19}">浅瀬</text><text x="${GX + GW / 2}" y="${ys - 7}">${gate.d}まで</text></g></g>`;
    }
    if (gate?.k === 'lever') {
      const yl = WATER + gate.d * U;
      g += `<g id="gate"${gpos}>${classicLeverArt(GX, yl)}</g>
        <g class="classic-lever-caption"><path d="M${vw - 98} 47h94v21l-94-.5Z" fill="#fffaf0" stroke="#5f3b1c" stroke-width="1.2"/><text x="${vw - 51}" y="62" font-size="10" font-weight="700" text-anchor="middle" fill="#23304a">レバー ${gate.d}以上</text></g>`;
    }
    if (st.docked) g += `<g id="quay">${melodyQuayArt(vw, WATER)}
      <text x="${vw - 24}" y="${WATER - 59.5}" font-size="11.5" font-weight="700" text-anchor="middle" fill="#fffaf0">港</text></g>`;
    g += `<g id="hullg"><image href="${GRAPHICS.boat}" x="${HX}" y="${top - HULL * U * CL_BOAT_TOP}" width="${HW}" height="${HULL * U * (1 + CL_BOAT_TOP)}" preserveAspectRatio="none"/>`;
    if (P) {
      // 船の中の水（重さ1で、底面積いっぱいに広がる高さ）と、らせんの筒（仮の絵）
      const hw = Math.min(HULL * U - DECK, st.water / S.area * U);
      if (hw > 0) g += `<rect id="bilge" x="${HX + 12}" y="${bottom - 7 - hw}" width="${HW - 24}" height="${hw}" fill="#2f86c7" opacity=".8" stroke="#23304a" stroke-width="1"/><path d="M${HX + 12} ${bottom - 7 - hw}q6 -3 12 0t12 0t12 0t12 0t12 0t12 0t12 0t12 0t12 0t12 0t12 0t12 0" fill="none" stroke="#fffaf0" stroke-width="1.6"/>`;
      const sx = HX + HW - 34;
      g += `<g class="screw"><path d="M${sx} ${bottom - 8}L${sx + 22} ${top - 22}" stroke="#8a5a2e" stroke-width="13" stroke-linecap="round"/>
        <path d="M${sx - 3} ${bottom - 20}l10 -4M${sx + 2} ${bottom - 40}l10 -4M${sx + 6} ${bottom - 60}l10 -4M${sx + 10} ${bottom - 80}l10 -4M${sx + 14} ${top - 4}l10 -4" stroke="#f2c771" stroke-width="2.4"/>
        <circle cx="${sx + 24}" cy="${top - 26}" r="5" fill="#5f3b1c" stroke="#23304a" stroke-width="1.5"/></g>
        <path id="spout" d="M${sx + 26} ${top - 20}q16 4 18 30" fill="none" stroke="#3f97c0" stroke-width="4" stroke-linecap="round" opacity="0"/>`;
    }
    for (const p of shown()) {
      const it = S.items[p.id], x = cx + p.c * CW, y = bottom - DECK - (p.r + p.h) * ROW, w = p.w * CW, h = p.h * ROW;
      const ceiling = gate?.k === 'bridge' ? WATER + gate.d * U - HULL * U : null;
      const hitOutline = st.hit === 'bridge' && grid && top >= ceiling && y < ceiling
        ? `<path d="M${x + .5} ${y + .5}H${x + w - .5}V${y + h - .5}H${x + .5}Z" fill="none" stroke="#d6452c" stroke-width="1.5" stroke-dasharray="3 1.5"/>` : '';
      g += `<g data-id="${p.id}"><image href="${cargoArt(it[1])}" x="${x}" y="${y}" width="${w}" height="${h}" preserveAspectRatio="none"/>${hitOutline}
        <g aria-label="重さ${it[0]}"><rect x="${x + 1}" y="${y + 1}" width="${String(it[0]).length * 6.4 + 5}" height="12" rx="2" fill="#fffaf0" stroke="#23304a" stroke-width=".8"/>
        <text x="${x + 3.5}" y="${y + 10.6}" font-size="10.5" font-weight="700" fill="#23304a" font-family="Arial,sans-serif">${it[0]}</text></g></g>`;
    }
    g += `</g>`;
    if (st.floating) g += `<line x1="0" x2="${vw}" y1="${WATER}" y2="${WATER}" stroke="#fffaf0" stroke-width="1.5" opacity=".85"/>
      <path d="M${HX - 4} ${WATER}q6 -3 12 0t12 0t12 0t12 0t12 0t12 0t12 0t12 0t12 0t12 0t12 0t12 0t12 0t12 0" fill="none" stroke="#3f97c0" stroke-width="2.4" opacity=".9"/>`;
    if (gate?.k === 'bridge') {
      const yb = WATER + gate.d * U - HULL * U - (st.hit ? 0 : 3);
      g += `<g id="gate"${gpos}>${melodyBridgeArt(GX, GW, yb)}
        <g font-size="10" font-weight="700" text-anchor="middle" fill="#fffaf0" stroke="#5f3b1c" stroke-width="2.6" paint-order="stroke"><text x="${st.hit ? Math.min(GX + GW / 2, vw - 44 - bridgeContact().shift) : GX + GW / 2}" y="${yb - 22}">橋 ${gate.d}以上</text></g></g>`;
    }
    if (st.hit === 'shoal' || st.hit === 'bridge') {
      const x = st.hit === 'bridge' ? bridgeContact().x : HX + HW, y = st.hit === 'bridge' ? WATER + gate.d * U - HULL * U : WATER + gate.d * U;
      g += `<path d="M${x - 6} ${y - 4}l-5-4m9 0l-1-7m7 10l5-2" fill="none" stroke="#d6452c" stroke-width="2.2" stroke-linecap="round"/>
        <text x="${x + (st.hit === 'bridge' ? 8 : 4)}" y="${st.hit === 'bridge' ? 58 : Math.min(218, bottom + 20)}" font-size="13" font-weight="700" text-anchor="${st.hit === 'bridge' ? 'start' : 'middle'}" fill="#d6452c" stroke="#fffaf0" stroke-width="3.5" paint-order="stroke">ゴツン！</text>`;
    }
    if (st.hit === 'lever') g += `<text x="${HX + HW * 0.55}" y="${Math.min(222, bottom + 18)}" font-size="12" font-weight="700" text-anchor="middle" fill="#d6452c" stroke="#fffaf0" stroke-width="3.5" paint-order="stroke">届かない</text>`;
    let sc = `<rect x="3" y="${WATER - 20}" width="52" height="${HULL * U + 30}" rx="6" fill="#fffaf0" stroke="#23304a" stroke-width="2"/><text x="29" y="${WATER - 7}" text-anchor="middle" font-size="10" font-weight="700" fill="#23304a">深さ・音</text>`;
    for (let i = 0; i <= 10; i++) {
      const y = WATER + i * U / 2;
      sc += `<path d="M7 ${y}h${i % 2 ? 5 : 9}" stroke="#23304a" stroke-width="2"/><text x="19" y="${y + 3.5}" font-size="9.5" font-weight="700" fill="#23304a">${i % 2 ? '' : i / 2}</text><text x="${i % 2 ? 40 : 31}" y="${y + 3.5}" font-size="9" font-weight="700" fill="#23304a">${CL_NOTE[midiOf(i / 2)]}</text>`;
    }
    g += sc;
    g += `<text x="${vw - 5}" y="219" font-size="10" font-weight="700" text-anchor="end" fill="#fffaf0" stroke="#23304a" stroke-width="2.6" paint-order="stroke">${LIQUIDS[st.liq].n} 比重${LIQUIDS[st.liq].s}・底面積${S.area}・船だけ${SHIP}</text>`;
    if (live() && st.floating && shownDepth() <= HULL) g += `<path d="M${HX - 1} ${bottom}l-8 -5v10z" fill="var(--red)" stroke="#23304a" stroke-width="1.2"/>`;
    const sign = st.sign ?? (P ? (st.phase === 'prep' ? '出航準備' : st.phase === 'pump' ? '汲み出し' : null) : st.phase === 'prep' ? '積載中' : null);
    if (sign) g += `<g class="mboard" aria-label="${sign}"><image href="${GRAPHICS['status-board']}" x="64" y="3" width="116" height="40" preserveAspectRatio="none"/><text x="122" y="29" font-size="14" text-anchor="middle" fill="#23304a" font-family="var(--disp)">${sign}</text></g>`;
    if (grid) g += melodyPileTag(stackRows(st.placed, S.items));
    if (!P && st.phase === 'prep' && st.sel == null && !st.sign && (grid ? !st.placed.length : !st.on.size))
      g += `<text x="${HX + HW / 2}" y="60" font-size="10.5" font-weight="700" text-anchor="middle" fill="#23304a" stroke="#fffaf0" stroke-width="3" paint-order="stroke">右の棚から荷を選ぶ →</text>`;
    if (pick) {
      g += `<rect x="${cx}" y="46" width="${CELLS * CW}" height="${bottom - DECK - 46}" fill="#efb32a" opacity=".22" stroke="#d6452c" stroke-width="1.5" stroke-dasharray="4 3"/>`;
      for (let col = 1; col < CELLS; col++) g += `<path d="M${cx + col * CW} 46V${bottom - DECK}" stroke="#d6452c" stroke-width=".6" opacity=".5"/>`;
      g += `<text x="${cx + CELLS * CW / 2}" y="60" font-size="10.5" font-weight="700" text-anchor="middle" fill="#23304a" stroke="#fffaf0" stroke-width="3" paint-order="stroke">ここを押して積む</text><g id="ghost"></g>`;
    }
    return `<svg viewBox="0 0 ${vw} 226" class="ship" role="img" aria-label="船と荷">${g}</svg>`;
  }
  function ghostSvg(col) {
    if (st.sel == null || col == null) return '';
    const it = S.items[st.sel], p = dropCargo(st.placed, S.items, st.sel, col), cx = HX + 8 * K, bottom = bottomY();
    if (!p) return `<text x="${cx + CELLS * CW / 2}" y="76" font-size="11" font-weight="700" text-anchor="middle" fill="#d6452c" stroke="#fffaf0" stroke-width="3" paint-order="stroke">高すぎて積めない</text>`;
    const x = cx + p.c * CW, y = bottom - DECK - (p.r + it[3]) * ROW, w = it[2] * CW, h = it[3] * ROW;
    return `<image href="${cargoArt(it[1])}" x="${x}" y="${y}" width="${w}" height="${h}" preserveAspectRatio="none" opacity=".55"/><rect x="${x}" y="${y}" width="${w}" height="${h}" fill="none" stroke="#d6452c" stroke-width="2" stroke-dasharray="4 2"/>`;
  }
  function colAt(svg, e) {
    const pt = svg.createSVGPoint(); pt.x = e.clientX; pt.y = e.clientY;
    const q = pt.matrixTransform(svg.getScreenCTM().inverse()), w = S.items[st.sel][2];
    return Math.max(0, Math.min(CELLS - w, Math.round((q.x - (HX + 8 * K)) / CW - w / 2)));
  }

  // ---- 航路図：横は航路の順（出航・関門・港）、縦は深さ（上ほど浅く、音は高い） ----
  const cols = [{ k: 'start' }, ...S.gates, { k: 'end' }];
  function chartSvg() {
    const cnt = cols.length, x0 = 48, right = 352, step = (right - x0) / cnt;
    const box = $('.chartf'), maxCH = innerWidth > innerHeight ? 420 : 280;
    const CH = Math.max(190, Math.min(maxCH, box ? Math.round(box.clientHeight * 360 / Math.max(1, box.clientWidth)) : 220));
    const T = 22, DY = (CH - 70) / HULL, y = d => T + d * DY, B = y(HULL);
    let g = `<defs>
      <pattern id="cmap-sand" patternUnits="userSpaceOnUse" width="19" height="13"><rect width="19" height="13" fill="#e8c98a"/><path d="M1 4l7 -2m3 7l6 -1M2 12l4 -1" stroke="#b68a4d" stroke-width="1.2" opacity=".6"/></pattern>
      <pattern id="cmap-timber" patternUnits="userSpaceOnUse" width="17" height="11"><rect width="17" height="11" fill="#d89d50"/><path d="M0 10H17M3 3l9 -1" stroke="#8a5a2e" stroke-width="1.3"/><path d="M1 5l12 -1" stroke="#f2c771" stroke-width="1.4"/></pattern>
      ${classicArtDefs()}
    </defs><rect width="360" height="${CH}" fill="#fff5df"/><text x="5" y="11" font-size="9" fill="#23304a">深さ 音</text>`;
    // 液体ごとの色（入れ替え室の列は、左が前の液体、右が後の液体）
    let liq = S.pre ?? S.start;
    cols.forEach((col, i) => {
      const xa = x0 + i * step;
      if (col.k === 'chamber') {
        g += classicChartLiquid(xa, T, step / 2, HULL * DY, CL_TINT[liq]);
        liq = col.to;
        g += classicChartLiquid(xa + step / 2, T, step / 2, HULL * DY, CL_TINT[liq]);
      } else g += classicChartLiquid(xa, T, step, HULL * DY, CL_TINT[liq]);
    });
    for (let i = 0; i <= 10; i++) {
      const yy = y(i / 2);
      g += `<line x1="${x0}" x2="${right}" y1="${yy}" y2="${yy}" stroke="#23304a" stroke-opacity="${i % 2 ? .12 : .28}" stroke-width="${i % 2 ? .6 : 1}"/>
        <text x="5" y="${yy + 3.7}" font-size="9.5" fill="#23304a">${i % 2 ? '' : i / 2}</text><text x="25" y="${yy + 3.7}" font-size="10.5" fill="#23304a">${CL_NOTE[midiOf(i / 2)]}</text>`;
    }
    liq = S.pre ?? S.start;
    cols.forEach((col, i) => {
      const xa = x0 + i * step, xc = xa + step / 2;
      if (col.k === 'shoal') g += `<path d="M${xa} ${y(col.d)}l${step / 4} -1l${step / 4} 1l${step / 4} -1l${step / 4} 1V${B}H${xa}Z" fill="url(#cmap-sand)" stroke="#8a5a2e" stroke-width="1.4"/>`;
      if (col.k === 'bridge') g += `<path d="M${xa} ${T}H${xa + step}V${y(col.d)}H${xa}Z" fill="url(#cmap-timber)" opacity=".85"/><path d="M${xa} ${y(col.d)}H${xa + step}" stroke="#5f3b1c" stroke-width="3"/>
        <g font-size="9.5" font-weight="700" text-anchor="middle" fill="#fffaf0" stroke="#5f3b1c" stroke-width="2.6" paint-order="stroke"><text x="${xc}" y="${Math.max(y(col.d) - 6, T + (grid ? 24 : 12))}">${col.d}以上</text>${grid ? `<text x="${xc}" y="${Math.max(y(col.d) - 18, T + 12)}">荷${rowsUnderBridge(col.d)}段まで</text>` : ''}</g>`;
      if (col.k === 'lever') g += `${classicChartLever(xa, y(col.d), step, B)}
        <text x="${xc}" y="${y(col.d) - 6}" font-size="9.5" font-weight="700" text-anchor="middle" fill="#fffaf0" stroke="#23304a" stroke-width="2.6" paint-order="stroke">${col.d}以上</text>`;
      if (col.k === 'shoal') g += `<text x="${xc}" y="${y(col.d) - 5}" font-size="9.5" font-weight="700" text-anchor="middle" fill="#fffaf0" stroke="#5f3b1c" stroke-width="2.6" paint-order="stroke">${col.d}まで</text>`;
      if (col.k === 'chamber') g += classicChartChamber(xa, T, step, HULL * DY);
      if (col.k === 'end') g += classicHarborFlag(xc, T);
      if (i > 0) g += `<path d="M${xa} ${T}V${B}" stroke="#8a5a2e" stroke-width="1" stroke-dasharray="3 3"/>`;
      const name = col.k === 'start' ? '出航' : col.k === 'end' ? '港' : CL_GATE[col.k];
      const sub = col.k === 'chamber' ? `${LIQUIDS[liq].n}→${LIQUIDS[col.to].n}` : col.k === 'start' ? LIQUIDS[liq].n : P && i > 0 && i <= S.gates.length ? `水+${P.leak[i - 1]}` : '';
      if (col.k === 'chamber') liq = col.to;
      g += `<text x="${xc}" y="${B + 14}" font-size="${name.length > 3 ? 9 : 10.5}" font-weight="700" text-anchor="middle" fill="${col.k === 'start' || col.k === 'end' ? '#23304a' : '#5f3b1c'}">${name}</text>`;
      if (sub) g += `<text x="${xc}" y="${B + 27}" font-size="9.5" text-anchor="middle" fill="#23304a">${sub}</text>`;
    });
    if (band) {
      const xa = x0 + step, w = (cnt - 2) * step;
      g += classicSafeBand(xa, y(band.lo), w, Math.max(2, y(band.hi) - y(band.lo)));
      g += `
        <g font-size="9.5" font-weight="700" text-anchor="middle" fill="#1f5a40" stroke="#fffaf0" stroke-width="3" paint-order="stroke"><text x="${x0 + step / 2}" y="${y((band.lo + band.hi) / 2) - 2}">通れる深さ</text><text x="${x0 + step / 2}" y="${y((band.lo + band.hi) / 2) + 10}">${band.lo}〜${band.hi}</text></g>`;
    }
    // 今の船底の深さ（深さが見えるときだけ）。船の絵は描かない（橋の列で、船が橋の上にあるように見えるため）
    if (st.floating && live()) {
      const xc = x0 + st.col * step + step / 2, dd = Math.min(dNow(), HULL);
      const xm = st.approach ? x0 + st.col * step + 2 : xc;   // スクリューの面：関門の手前にいる間は列の左端
      const extra = grid ? pileExtra(stackRows(st.placed, S.items)).toNumber() : 0;
      g += keelMark(xm, y(dd), extra > 0 ? y(Math.max(0, dd - extra)) : null);
    }
    return `<svg viewBox="0 0 360 ${CH}" class="chart" role="img" aria-label="航路図。左から出航、関門、港の順。上ほど浅く高い音。砂は浅瀬（それより深いとつかえる）、木は橋（それより浅いと当たる）。">${g}</svg>`;
  }

  // ---- 画面 ----
  let ended = null;
  function draw() {
    const prep = st.phase === 'prep', known = live() && st.floating, d = dNow();
    const used = new Set(st.placed.map(p => p.id));
    const chips = S.items.map((it, i) => grid
      ? (used.has(i) ? '' : `<button class="chip ${st.sel === i ? 'on' : ''}" data-i="${i}" ${prep && !st.busy ? '' : 'disabled'}><img src="${cargoArt(it[1])}" alt=""><span class="cargo-info"><span class="cargo-name">${it[1]}</span><b>${it[0]}</b><small>${it[2]}×${it[3]}マス</small></span></button>`)
      : `<button class="chip ${st.on.has(i) ? 'on' : ''}" data-i="${i}" aria-pressed="${st.on.has(i)}" ${prep && !st.busy ? '' : 'disabled'}><img src="${cargoArt(it[1])}" alt=""><span class="cargo-info"><span class="cargo-name">${it[1]}</span><b>${it[0]}</b><small>${st.on.has(i) ? '積んでいる' : '棚にある'}</small></span></button>`).join('');
    const stop = stopped();
    const sub = R ? `<small class="sub">${R.position + 1}/${R.stageCount}面　<span id="ng">${ctx.ngText()}</span></small>` : '';
    c.innerHTML = `${ctx.topbar(`${S.name}${sub}`)}
      <div class="melody-plan">
      <section class="frame chartf" aria-label="航路図">${chartSvg()}</section>
      <section class="stat mstat" aria-label="船の手がかり">${P ? `<div>船の中の水<strong>${st.water}</strong></div>` : `<div>液体の比重<strong>${LIQUIDS[st.liq].s}</strong></div>`}<div>船全体の重さ<strong>${weight()}</strong></div><div>沈む深さ<strong>${known ? (d > HULL ? '沈没' : depthLabel(d)) : '？'}</strong></div></section>
      <div class="say" id="say" role="status" aria-live="polite">${st.said}</div>
      </div><div class="melody-work">
      <section class="mid${!P && prep ? '' : ' sailing'}" aria-label="船と荷の棚"><div class="frame vessel">${shipSvg()}<span class="tag-key">${P ? '荷の札は重さ。青いのは船に入った水' : `荷の札は重さ${grid ? '' : '。棚の荷を押すと積む／下ろす'}`}</span></div>${P ? '' : prep ? `<div class="mshelf${S.items.length > 5 ? ' many' : ''}" aria-label="荷を選ぶ"><img class="shelf-board" src="${GRAPHICS['cargo-board']}" alt="" aria-hidden="true" draggable="false">${chips || '<p class="empty">荷をすべて<br>積みました</p>'}</div>` : ''}</section>
      <div class="row3"><button class="btn sub" id="ring">深さの音</button>${P ? `<button class="btn sub" id="crank" ${stop && !st.busy && !ended ? '' : 'disabled'}>回す（残り${st.turns}）</button>` : `<button class="btn sub" id="undo" ${prep && !st.busy && (grid ? st.placed.length : st.on.size) ? '' : 'disabled'}>${grid ? 'ひとつ戻す' : '全部下ろす'}</button>`}<button class="btn" id="go" ${ended || (stop && !st.busy) ? '' : 'disabled'}>${ended ? ended.label : prep ? '出航' : st.phase === 'pump' ? '進む' : '航海中'}</button></div></div>`;
    ctx.wire(c); bind(); playFx();
  }
  function bind() {
    c.querySelectorAll('[data-i]').forEach(b => b.onclick = () => {
      if (st.busy || st.phase !== 'prep') return; au.unlock();
      const i = +b.dataset.i;
      if (grid) { au.tap(); st.sel = st.sel === i ? null : i; draw(); return; }
      const before = bottomY(), adding = !st.on.has(i);
      adding ? st.on.add(i) : st.on.delete(i);
      if (adding) au.land(S.items[i][0]); else au.tap();
      st.fx = { shift: before - bottomY(), drop: adding ? i : null };
      changed(adding ? 420 : 200);
    });
    const svg = $('.ship'), gh = () => $('#ghost');
    if (svg && st.phase === 'prep' && st.sel != null) {
      svg.style.touchAction = 'none'; svg.style.cursor = 'pointer';
      let down = false;
      svg.onpointerdown = e => { down = true; svg.setPointerCapture?.(e.pointerId); gh().innerHTML = ghostSvg(colAt(svg, e)); };
      svg.onpointermove = e => { if (down || e.pointerType === 'mouse') gh().innerHTML = ghostSvg(colAt(svg, e)); };
      svg.onpointerup = e => { if (!down) return; down = false; put(colAt(svg, e)); };
      svg.onpointercancel = () => { down = false; gh().innerHTML = ''; };
      svg.onpointerleave = e => { if (e.pointerType === 'mouse' && !down) gh().innerHTML = ''; };
    }
    if (P) $('#crank').onclick = crank; else $('#undo').onclick = undo;
    $('#ring').onclick = () => {
      au.unlock();
      if (st.floating && live()) au.depthBell(dNow());
      else { au.tap(); say('船が出ると、沈んだ深さの音が鳴ります。'); }
    };
    $('#go').onclick = () => (ended ? ended.act() : st.busy ? null : st.phase === 'prep' ? depart() : st.phase === 'pump' ? st.resume?.() : null);
  }

  // ---- 動き ----
  function playFx() {
    const f = st.fx; st.fx = null; if (!f) return;
    const hull = $('#hullg'), gateEl = $('#gate');
    if (f.gate && gateEl) { gateEl.animate([{ transform: `translate(${f.gate[0]}px,0px)` }, { transform: `translate(${f.gate[1]}px,0px)` }], { duration: f.gate[2], easing: f.gate[3] ?? 'linear', fill: 'forwards' }); return; }
    if (f.quay) { $('#quay')?.animate([{ transform: 'translate(90px,0px)' }, { transform: 'translate(0px,0px)' }], { duration: 700, easing: 'ease-out' }); return; }
    if (f.bump) { hull?.animate([{ transform: 'translate(0px,0px)' }, { transform: 'translate(-6px,0px)', offset: .3 }, { transform: 'translate(3px,0px)', offset: .65 }, { transform: 'translate(0px,0px)' }], { duration: 420, easing: 'ease-out' }); return; }
    if (f.sink) { hull?.animate([{ transform: 'translate(0px,0px)', opacity: 1 }, { transform: 'translate(0px,90px)', opacity: .35 }], { duration: 1100, easing: 'ease-in', fill: 'forwards' }); return; }
    if (f.lever) { $('#arm')?.animate([{ transform: 'translate(0px,0px)' }, { transform: 'translate(0px,10px)' }], { duration: 300, easing: 'ease-out', fill: 'forwards' }); return; }
    if (f.pour) $('#spout')?.animate([{ opacity: 0 }, { opacity: 1, offset: .2 }, { opacity: 1, offset: .7 }, { opacity: 0 }], { duration: 650 });
    if (f.drop != null) $(`[data-id="${f.drop}"]`)?.animate([{ transform: 'translate(0px,-90px)' }, { transform: 'translate(0px,0px)' }], { duration: 380, easing: 'cubic-bezier(.55,0,.9,.55)' });
    if (f.shift) hull?.animate([{ transform: `translate(0px, ${f.shift}px)` }, ...(f.drop != null ? [{ transform: `translate(0px, ${f.shift}px)`, offset: .45 }] : []), { transform: 'translate(0px, 0px)' }], { duration: f.drop != null ? 820 : 600, easing: 'ease-out' });
  }
  function put(col) {
    if (st.sel == null) return;
    const p = dropCargo(st.placed, S.items, st.sel, col);
    if (!p) { say(`そこに積むと、${ROWMAX}段を超えてしまうぞ。`); return; }
    au.unlock();
    const before = bottomY(); st.placed.push(p); st.fx = { drop: p.id, shift: before - bottomY() };
    setTimeout(() => alive() && au.land(S.items[p.id][0]), 360);
    st.sel = null; changed(460);
  }
  function crank() {
    if (!P || st.busy || !stopped() || ended) return;
    au.unlock();
    if (st.turns <= 0) { au.tap(); say('もう腕が上がらない。回せるのはここまでだ。'); return; }
    if (st.water <= 0) { au.tap(); say('船の中に、もう水は無いぞ。'); return; }
    const before = bottomY();
    st.water = Math.max(0, st.water - P.per); st.turns--;
    st.fx = { shift: before - bottomY(), pour: true };
    draw();
    if (live()) au.depthBell(dNow(), 0.17, 0.8); else au.tap();
  }
  function undo() {
    if (st.busy || st.phase !== 'prep') return;
    const before = bottomY();
    if (grid) { if (!st.placed.length) return; st.placed.pop(); } else { if (!st.on.size) return; st.on.clear(); }
    au.tap(); st.fx = { shift: before - bottomY() }; changed(200);
  }
  // 荷を変えたあと：深さが見えるなら音を鳴らす。沈むほど重ければ、その場で沈む（以前と同じ）
  function changed(delay) {
    draw();
    if (!(live() && st.floating)) return;
    const d = dNow();
    setTimeout(() => {
      if (!alive()) return;
      au.depthBell(d, 0.17, 0.9);
      if (isSunk(weight(), st.liq, S.area) && st.phase === 'prep') sinkNow();
    }, delay);
  }

  // ---- 航海 ----
  const wait = ms => ctx.wait(ms);
  const atCol = async (i, ms = 500) => { st.col = i; draw(); await wait(ms); };
  async function depart() {
    if (grid && st.placed.length < S.items.length) { say('荷はすべて積みましょう。'); return; }
    au.unlock(); st.busy = true;
    const before = bottomY(); st.phase = 'sail'; st.sel = null;
    if (!st.floating) { st.floating = true; st.fx = { shift: before - bottomY() }; draw(); await wait(700); }
    else { st.fx = { shift: before - bottomY() }; draw(); await wait(hide ? 600 : 300); }
    if (!alive()) return;
    au.depthBell(dNow());
    if (isSunk(weight(), st.liq, S.area)) return sinkNow();
    for (let gi = 0; gi < S.gates.length; gi++) {
      const g = S.gates[gi]; if (!alive()) return;
      st.approach = !!P && g.k !== 'chamber';
      await atCol(gi + 1, 200); if (!alive()) return;
      if (g.k === 'chamber') {
        st.sign = '入れ替え室'; say(`入れ替え室：${LIQUIDS[st.liq].n}を${LIQUIDS[g.to].n}に入れ替えます。`, '航海の記録'); draw(); await wait(800); if (!alive()) return;
        const b = bottomY(); st.liq = g.to; st.fx = { shift: b - bottomY() }; draw(); au.depthBell(dNow()); await wait(900); if (!alive()) return;
        st.sign = null; draw();
        if (isSunk(weight(), st.liq, S.area)) return sinkNow();
        continue;
      }
      if (P) {
        if (P.leak[gi]) {
          const b = bottomY(); st.water += P.leak[gi]; st.fx = { shift: b - bottomY() }; say(`古い船底から、水が${P.leak[gi]}しみ込んだ。`, '航海の記録'); draw(); au.depthBell(dNow());
          await wait(1000); if (!alive()) return;
          if (isSunk(weight(), st.liq, S.area)) return sinkNow();
        }
        st.seenW = weight(); st.phase = 'pump'; st.busy = false; st.gate = g; st.gateShift = 0;
        say(`${CL_GATE[g.k]}（${g.d}${g.k === 'shoal' ? 'まで' : '以上'}）の手前で止まった。スクリューを回すか、このまま進むか。`); draw();
        await new Promise(res => { st.resume = res; }); st.resume = null; if (!alive()) return;
        const b = bottomY(); st.phase = 'sail'; st.busy = true; st.approach = false; st.fx = { shift: b - bottomY() }; draw();
        if (hide) au.depthBell(dNow()); await wait(hide ? 700 : 250); if (!alive()) return;
      }
      st.gate = g; st.gateShift = null;
      const d = depthF(), vw = VW(), near = P ? 0 : null;   // スクリューの面は、関門がすぐ前にある所から動く
      if (g.k === 'lever') {
        st.fx = { gate: [vw - GX + 150, LEVER_STOP, 1000, 'ease-out'] }; draw(); await wait(1000); if (!alive()) return;
        st.gateShift = LEVER_STOP;
        if (!reachesDepth(d, g.d)) { st.hit = 'lever'; draw(); return fail(shallowText(hint(), dNow(), g.d, 'lever')); }
        au.bell(72, 0.14, 0.7); say('レバーに届いた。門が開くぞ。', '航海の記録'); st.fx = { lever: true }; draw(); await wait(700); if (!alive()) return;
        st.fx = { gate: [LEVER_STOP, -(GX + 160), 1000] }; st.gateShift = null; draw(); await wait(1000); if (!alive()) return;
        st.gate = null; continue;
      }
      let fault = null;
      if (g.k === 'shoal' && !clearsShoal(d, g.d)) fault = ['shoal', shoalText(hint(), dNow(), g.d)];
      if (g.k === 'bridge') {
        if (!reachesDepth(d, g.d)) fault = ['bridge', shallowText(hint(), dNow(), g.d, 'bridge')];
        else if (grid && !pileClearsBridge(d, g.d, stackRows(st.placed, S.items))) fault = ['bridge', '沈み方はよいが、荷の山が橋に当たったな。<br>積み方を変えてごらん。'];
      }
      if (fault) {
        const stop = fault[0] === 'bridge' ? bridgeContact().shift : -16;
        st.fx = { gate: [near ?? vw - GX + 150, stop, near != null ? 500 : 900, 'ease-out'] }; draw(); await wait(900); if (!alive()) return;
        st.gateShift = stop; st.hit = fault[0]; st.fx = { bump: true }; draw();
        return fail(fault[1]);
      }
      st.fx = { gate: [near ?? vw - GX + 80, -(GX + 160), near != null ? 1400 : 1700] }; draw(); await wait(1700); if (!alive()) return;
      st.gate = null;
    }
    st.col = cols.length - 1; st.docked = true; st.fx = { quay: true }; draw(); await wait(700); if (!alive()) return;
    win();
  }
  function sinkNow() { st.sunk = true; au.sink(); end(sinkText(hint(), weight(), LIQUIDS[st.liq].n, sinkingWeight(st.liq, S.area))); }
  function fail(msg) { au.miss(); end(msg); }
  function end(msg) {
    st.phase = 'end'; st.busy = false; st.sel = null;
    const r = R ? R.record('ng') : 'retry';
    say(msg);
    ended = r === 'gameover' ? { label: '結果へ', act: () => ctx.finish() } : { label: '積み直す', act: restart };
    if (st.sunk) st.fx = { sink: true };
    draw();
  }
  // 積み直し：荷はそのままにして港へ戻る（以前と同じ）
  function restart() {
    au.wood(); ended = null;
    Object.assign(st, { water: P?.start ?? 0, turns: P?.turns ?? 0, resume: null, approach: false });
    st.seenW = weight();
    Object.assign(st, { liq: S.pre ?? S.start, phase: 'prep', col: 0, gate: null, gateShift: null, hit: null, sign: null, fx: null, docked: false, floating: !S.cradle, sunk: false, busy: false, sel: null });
    intro(); draw();
  }
  function win() {
    au.jingle(); st.phase = 'end';
    say(`<span class="eu">エウレカ！</span> ${S.winner}<br><span class="nar">重さ${weight()}、深さ${depthLabel(dNow())}で到着。</span>`);
    if (R) {
      const r = R.record('clear'); ctx.book.recordBest(R.level.id, R.cleared);
      ended = { label: r === 'complete' ? '結果へ' : '次の面へ', act: () => { au.wood(); r === 'complete' ? ctx.finish() : ctx.enter(R.position); } };
    } else ended = { label: '面を選ぶ', act: () => { au.wood(); ctx.pick(); } };
    draw();
    const f = $('.chartf'); f.style.position = 'relative'; f.insertAdjacentHTML('beforeend', '<div class="stamp">エウレカ！</div>');
  }

  // 最初から水銀の面（入れ替え室の中から始まる）：水を水銀に入れ替えてから始める
  async function intoPre() {
    st.busy = true; say('入れ替え室で、水を水銀に入れ替えます。', '航海の記録'); st.sign = '入れ替え室'; draw();
    await wait(700); if (!alive()) return;
    const b = bottomY(); st.liq = S.pre; st.fx = { shift: b - bottomY() }; draw(); au.depthBell(shownDepth());
    await wait(800); if (!alive()) return;
    st.sign = null; st.busy = false; intro(); draw();
  }

  intro(); draw();
  requestAnimationFrame(() => alive() && draw());
  if (S.pre) intoPre();
}
