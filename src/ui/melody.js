// 航路のメロディの面（要件F-020、7.2節）。見た目は Codex の見本0.1.4（docs/visual-samples/2026-11-21-melody-priority1-v1）を移したもの。
// 計算・判定は src/logic/melody.js。ここは画面と流れだけ。
import { SHIP, HULL, AREA, LIQUIDS, depthFraction, depthLabel } from '../logic/physics.js';
import { midiOf, onScale, voiceOf } from '../logic/pitch.js';
import { CELLS, ROWMAX, dropCargo, stackRows, pileExtra } from '../logic/stacking.js';
import { keelMark } from './chart-mark.js';
import { envOf, depthNow, weightOf, autoDrop, rowsUnderBridge, segmentFault, matchesTarget } from '../logic/melody.js';
import { GRAPHICS, cargoArt } from './graphics.js';
import { CHORDS, accompaniment } from '../logic/harmony.js';
import { melodyArtDefs, melodyShoalArt, melodyBridgeArt, melodyQuayArt, melodyPileTag } from './melody-art.js';

// 船の絵（144px）は、上の28pxが船の中の奥の面。船べりは上から28pxの位置なので、ここを船の高さ5に合わせる
const BOAT_TOP = 28 / 116;
const NOTE = { 96: 'ド', 93: 'ラ', 91: 'ソ', 88: 'ミ', 86: 'レ', 84: 'ド', 81: 'ラ', 79: 'ソ', 76: 'ミ', 74: 'レ', 72: 'ド' };
const noteName = d => (onScale(d) ? NOTE[Math.round(midiOf(d.toNumber()))] : '外れ');
const HOME = 84;   // エウレカで帰着する「ド」。上下は実機で決める（要件7.2）

// ctx：app.js から渡す道具（show, topbar, wire, audio, run, book, ngText, enter, finish, pick, stopRun, wait, alive, muted）
export function melodyStage(n, base, route, ctx) {
  const { audio: au } = ctx;
  const R = ctx.run();
  // 組み立て中の手がかり：フリー（選択プレイ含む）は重さ・深さ・音、ノーマルは重さだけ、エキスパートは伏せる。練習はいつもフリー
  const level = base.tutorial ? 'free' : R?.level.id ?? 'free';
  const S = { items: route.items.map(x => [...x]), placed: [], sel: null, phase: 'prep', seg: 0, played: [], log: [], sign: null, fx: null, said: '', gate: null, hit: null };
  const items0 = route.items.length;
  const showLive = () => level === 'free' || S.phase !== 'prep';
  const showWeight = () => showLive() || level === 'normal';
  const env = envOf(route), LIQ_NAME = { water: '水', oil: '油', mercury: '水銀' }[env.liq];
  const depth = () => depthNow(S.items, S.placed, route);
  const ring = d => au.depthBell(d.toNumber(), 0.2, 0.9);
  const c = ctx.show('', 'melody-layout');
  const $ = s => c.querySelector(s);
  const id0 = ctx.token();
  const alive = () => ctx.alive(id0) && c.isConnected;
  const say = (h, who = 'アルキメデス') => { S.said = who ? `<span class="who">${who}</span>${h}` : h; const e = $('#say'); if (e) e.innerHTML = S.said; };

  function tutorialHint() {
    const k = S.placed.length;
    if (k === 0) return '1、2、3…は立ち寄る港、♪の高さは港の間の深さと音だ。積む順は、最後の港から逆にたどってごらん。港4で深さ2から1へ浮く。重さ10が下りる。それが一番下の荷だ。';
    if (k === 1) return '次は最初の♪だ。深さ2.5は重さ25。港1で深さ2へ浮くには、5を下ろせばよい。港では最後に積んだ荷から下りるから、5は一番上に積むのだ。';
    return '重さ25になったな。出航して、♪をたどれるか確かめてごらん。';
  }

  // ---- 船 ----
  // 本番の船の絵と寸法（幅124・高さ60＝深さ5、1列18、1段16、甲板8）を1.3倍で描く
  const K = 1.3, U = 12 * K, ROW = 16 * K, DECK = 8 * K, CW = 18 * K, HW = 124 * K, HX = 70, WATER = 134;
  const shownDepth = () => (showLive() ? depth() : depthFraction(env.ship, env.liq, env.area));
  const bottomY = () => WATER + Math.min(shownDepth().toNumber(), HULL + 0.6) * U;
  // 発案者了承（2026-11-21）：橋の高さに届く荷の先端まで進んで止める。
  // 当たるかどうかは segmentFault の結果を使い、ここでは絵の接触位置だけを求める。
  function bridgeContact() {
    const gate = route.cond?.[S.gate], front = HX + HW;
    if (gate?.k !== 'bridge') return { x: front, shift: 54 };
    const bottom = bottomY(), ceiling = WATER + gate.d * U - HULL * U;
    if (bottom - HULL * U < ceiling) return { x: front, shift: 54 };
    const high = S.placed.filter(p => bottom - DECK - (p.r + S.items[p.id][3]) * ROW < ceiling);
    const x = high.length ? Math.max(...high.map(p => HX + 8 * K + (p.c + S.items[p.id][2]) * CW)) : front;
    return { x, shift: x - (front - 54) };
  }
  function shipSvg() {
    const d = shownDepth(), live = showLive(), bottom = bottomY(), top = bottom - HULL * U;
    const pick = S.phase === 'prep' && S.sel != null, cx = HX + 8 * K;
    // 出航したら棚を隠し、右に今の海路の関門（浅瀬・橋）を描く
    const VW = S.phase === 'prep' ? 240 : 330, GX = HX + HW + 16, gate = S.gate != null ? route.cond?.[S.gate] : null;
    let g = `<defs><pattern id="mw" patternUnits="userSpaceOnUse" width="240" height="110" y="${WATER}"><image href="${GRAPHICS['liquid-' + env.liq]}" width="240" height="110" preserveAspectRatio="none"/></pattern>
      ${melodyArtDefs()}</defs>
      <rect width="${VW}" height="230" fill="var(--sky)"/><path d="M110 22q20 -14 40 0t40 0" fill="none" stroke="#fffaf0" stroke-width="5"/>
      <rect x="0" y="${WATER}" width="${VW}" height="100" fill="url(#mw)"/>`;
    // 関門は幅 GW の絵で描き、航海中は右から左へ流して、船がその上・下を通る様子にする。当たったら船の前で止まる
    const GW = 74, gpos = S.hit === 'shoal' ? ' transform="translate(-16 0)"' : S.hit === 'bridge' ? ` transform="translate(${bridgeContact().shift} 0)"` : '';
    if (gate?.k === 'shoal') {
      const ys = WATER + gate.d * U;
      g += `<g id="gate"${gpos}>${melodyShoalArt(GX, GW, ys)}
        <g font-size="10" font-weight="700" text-anchor="middle" fill="#fffaf0" stroke="#5f3b1c" stroke-width="2.6" paint-order="stroke"><text x="${GX + GW / 2}" y="${ys - 19}">浅瀬</text><text x="${GX + GW / 2}" y="${ys - 7}">${gate.d}まで</text></g></g>`;
    }
    // 港に寄っている間は、右に岸壁を見せる
    const qn = S.port ?? S.portOut;   // 出航しても岸壁はすぐ消さず、後ろへ流れていく
    if (qn) g += `<g id="quay">${melodyQuayArt(VW, WATER)}
      <text x="${VW - 24}" y="${WATER - 59.5}" font-size="11.5" font-weight="700" text-anchor="middle" fill="#fffaf0">港${qn}</text></g>`;
    g += `<g id="hullg"><image href="${GRAPHICS.boat}" x="${HX}" y="${top - HULL * U * BOAT_TOP}" width="${HW}" height="${HULL * U * (1 + BOAT_TOP)}" preserveAspectRatio="none"/>
`;
    // 船の中（荷）は断面で見せる。船体には水の色を重ねず、水面の高さは船体の外側の線で示す
    for (const [k, p] of S.placed.entries()) {
      const it = S.items[p.id], x = cx + p.c * CW, y = bottom - DECK - (p.r + it[3]) * ROW, w = it[2] * CW, h = it[3] * ROW;
      // 荷札（積んだ順の番号）と重さ。合計を伏せても、自分で足し算できるように重さは常に見せる
      const ceiling = gate?.k === 'bridge' ? WATER + gate.d * U - HULL * U : null;
      const hitOutline = S.hit === 'bridge' && top >= ceiling && y < ceiling
        ? `<path class="hit-cargo-outline" d="M${x + .5} ${y + .5}H${x + w - .5}V${y + h - .5}H${x + .5}Z" fill="none" stroke="#d6452c" stroke-width="1.5" stroke-dasharray="3 1.5"/>` : '';
      g += `<g data-n="${k}"><image href="${cargoArt(it[1])}" x="${x}" y="${y}" width="${w}" height="${h}" preserveAspectRatio="none"/>${hitOutline}
        <g class="cargo-tag" aria-label="荷札${k + 1}、重さ${it[0]}"><path d="M${x + 4} ${y + .4}H${x + 20.5}V${y + 20}H${x + .5}V${y + 4}Z" fill="#fffaf0" stroke="#23304a" stroke-width=".8"/>
        <text x="${x + 10.5}" y="${y + 9.3}" font-size="10" font-weight="700" text-anchor="middle" fill="#d6452c">${k + 1}</text>
        <path d="M${x + 3} ${y + 10.8}H${x + 18}" stroke="#cdbf9f" stroke-width=".7"/>
        <text x="${x + 10.5}" y="${y + 19.2}" font-size="11.5" font-weight="700" text-anchor="middle" fill="#23304a" font-family="Arial,sans-serif">${it[0]}</text></g></g>`;
    }
    // 船の前を水面が横切る（喫水線）。外側から見た水の高さで、船が浮いていることを示す
    g += `</g><line x1="0" x2="${VW}" y1="${WATER}" y2="${WATER}" stroke="#fffaf0" stroke-width="1.5" opacity=".85"/>
      <path d="M${HX - 4} ${WATER}q6 -3 12 0t12 0t12 0t12 0t12 0t12 0t12 0t12 0t12 0t12 0t12 0t12 0t12 0t12 0" fill="none" stroke="#3f97c0" stroke-width="2.4" opacity=".9"/>`;
    // 橋は船の手前に描く（船の絵の奥の面が橋桁に重なって、当たったように見えないように）
    if (gate?.k === 'bridge') {
      const yb = WATER + gate.d * U - HULL * U - (S.hit ? 0 : 3);  // 通れるときは、ちょうどでも少しすき間を見せる   // 橋の下面：深さがちょうど橋の値のときの船の縁の高さ
      g += `<g id="gate"${gpos}>${melodyBridgeArt(GX, GW, yb)}
        <g font-size="10" font-weight="700" text-anchor="middle" fill="#fffaf0" stroke="#5f3b1c" stroke-width="2.6" paint-order="stroke"><text x="${S.hit ? Math.min(GX + GW / 2, VW - 44 - bridgeContact().shift) : GX + GW / 2}" y="${yb - 22}">橋 ${gate.d}以上</text></g></g>`;
    }
    if (S.hit) {
      const x = S.hit === 'bridge' ? bridgeContact().x : HX + HW, y = S.hit === 'bridge' ? WATER + gate.d * U - HULL * U : WATER + gate.d * U;
      g += `<path class="hit-mark" d="M${x - 6} ${y - 4}l-5-4m9 0l-1-7m7 10l5-2" fill="none" stroke="#d6452c" stroke-width="2.2" stroke-linecap="round"/>`;
      g += `<text class="hit-label" x="${x + (S.hit === 'bridge' ? 8 : 4)}" y="${S.hit === 'bridge' ? 58 : Math.min(218, bottom + 20)}" font-size="13" font-weight="700" text-anchor="${S.hit === 'bridge' ? 'start' : 'middle'}" fill="#d6452c" stroke="#fffaf0" stroke-width="3.5" paint-order="stroke">ゴツン！</text>`;
    }
    let sc = `<rect x="3" y="${WATER - 20}" width="52" height="${HULL * U + 30}" rx="6" fill="#fffaf0" stroke="#23304a" stroke-width="2"/><text x="29" y="${WATER - 7}" text-anchor="middle" font-size="10" font-weight="700" fill="#23304a">深さ・音</text>`;
    for (let i = 0; i <= 10; i++) {
      const y = WATER + i * U / 2;
      sc += `<path d="M7 ${y}h${i % 2 ? 5 : 9}" stroke="#23304a" stroke-width="2"/><text x="19" y="${y + 3.5}" font-size="9.5" font-weight="700" fill="#23304a">${i % 2 ? '' : i / 2}</text><text x="${i % 2 ? 40 : 31}" y="${y + 3.5}" font-size="9" font-weight="700" fill="#23304a">${NOTE[midiOf(i / 2)]}</text>`;
    }
    g += sc;
    // 液体と船の重さ。油の航路は小舟（船だけの重さ8）
    g += `<text x="${VW - 5}" y="219" font-size="10" font-weight="700" text-anchor="end" fill="#fffaf0" stroke="#23304a" stroke-width="2.6" paint-order="stroke">${LIQ_NAME} 比重${LIQUIDS[env.liq].s}${env.area === AREA ? '' : '・底面積' + env.area}・船だけ${env.ship}</text>`;
    if (live && !d.gt(HULL)) g += `<path d="M${HX - 1} ${bottom}l-8 -5v10z" fill="var(--red)" stroke="#23304a" stroke-width="1.2"/>`;
    // 看板：出航前と港での積み込みは「積載中」、荷下ろしは「荷下ろし中」。板の絵に文字を重ねる
    const sign = S.phase === 'prep' ? '積載中' : S.sign;
    if (sign) g += `<g class="mboard" aria-label="${sign}"><image href="${GRAPHICS['status-board']}" x="64" y="3" width="116" height="40" preserveAspectRatio="none"/><text x="122" y="29" font-size="14" text-anchor="middle" fill="#23304a" font-family="var(--disp)">${sign}</text></g>`;
    // 荷の山の段数。航海図の橋の「荷○段まで」と見比べる
    g += melodyPileTag(stackRows(S.placed, S.items));
    if (S.phase === 'prep' && S.sel == null && S.items.some((_, i) => i < items0 && !S.placed.some(p => p.id === i)))
      g += `<text x="${HX + HW / 2}" y="60" font-size="10.5" font-weight="700" text-anchor="middle" fill="#23304a" stroke="#fffaf0" stroke-width="3" paint-order="stroke">右の棚から荷を選ぶ →</text>`;
    // 荷を選んでいる間：積める範囲を光らせ、指を置いた列に落ちる位置の影を出す
    if (pick) {
      g += `<rect x="${cx}" y="46" width="${CELLS * CW}" height="${bottom - DECK - 46}" fill="#efb32a" opacity=".22" stroke="#d6452c" stroke-width="1.5" stroke-dasharray="4 3"/>`;
      for (let col = 1; col < CELLS; col++) g += `<path d="M${cx + col * CW} 46V${bottom - DECK}" stroke="#d6452c" stroke-width=".6" opacity=".5"/>`;
      g += `<text x="${cx + CELLS * CW / 2}" y="60" font-size="10.5" font-weight="700" text-anchor="middle" fill="#23304a" stroke="#fffaf0" stroke-width="3" paint-order="stroke">ここを押して積む</text><g id="ghost"></g>`;
    }
    return `<svg viewBox="0 0 ${VW} 226" class="ship" role="img" aria-label="船と荷">${g}</svg>`;
  }

  // 落ちる位置の影（列 col に落としたとき）
  function ghostSvg(col) {
    if (S.sel == null || col == null) return '';
    const it = S.items[S.sel], p = dropCargo(S.placed, S.items, S.sel, col), cx = HX + 8 * K, bottom = bottomY();
    if (!p) return `<text x="${cx + CELLS * CW / 2}" y="76" font-size="11" font-weight="700" text-anchor="middle" fill="#d6452c" stroke="#fffaf0" stroke-width="3" paint-order="stroke">高すぎて積めない</text>`;
    const x = cx + p.c * CW, y = bottom - DECK - (p.r + it[3]) * ROW, w = it[2] * CW, h = it[3] * ROW;
    return `<image href="${cargoArt(it[1])}" x="${x}" y="${y}" width="${w}" height="${h}" preserveAspectRatio="none" opacity=".55"/><rect x="${x}" y="${y}" width="${w}" height="${h}" fill="none" stroke="#d6452c" stroke-width="2" stroke-dasharray="4 2"/>`;
  }
  // 画面上の位置から、荷の中心がそこに来る列
  function colAt(svg, e) {
    const pt = svg.createSVGPoint(); pt.x = e.clientX; pt.y = e.clientY;
    const q = pt.matrixTransform(svg.getScreenCTM().inverse()), w = S.items[S.sel][2];
    return Math.max(0, Math.min(CELLS - w, Math.round((q.x - (HX + 8 * K)) / CW - w / 2)));
  }

  // ---- 航海図＝深さの図 ----
  // 縦は深さ（上ほど浅く、音は高い）。お題の点、浅瀬の海底、橋桁を同じ目盛りに描く。難しさによらず同じ情報量
  // 港の積み下ろし：下ろす港は緑の札、積む港は橙の札。札の下に、積む荷の名前と重さ（港が多い航路は重さだけ）
  function portTag(x, B, p, tight, last) {
    const down = p.k === 'down', w = tight ? 26 : 40, y0 = B + 36;
    let g = `<g class="port-act"><rect x="${x - w / 2}" y="${y0}" width="${w}" height="15" rx="7.5" fill="${down ? '#dcefe4' : '#fde3c8'}" stroke="${down ? '#2e7d5b' : '#c0560e'}" stroke-width="1.4"/>
      <text x="${x}" y="${y0 + 11}" font-size="${tight ? 9.5 : 10}" font-weight="700" text-anchor="middle" fill="${down ? '#1f5a40' : '#8a3d08'}">${down ? (tight ? '↑下' : '↑下ろす') : (tight ? '↓積' : '↓積む')}</text>`;
    if (!down) g += `<text x="${x}" y="${y0 + 27}" font-size="${tight ? 10 : 9.5}" font-weight="700" text-anchor="middle" fill="#23304a">${tight ? p.item[0] : p.item[1] + p.item[0]}</text>`;
    if (last) g += `<text x="${x}" y="${y0 + 27}" font-size="9.5" font-weight="700" text-anchor="middle" fill="#d6452c">終着</text>`;
    return g + '</g>';
  }
  function chartSvg() {
    // 橋の数字は橋桁の下寄せ。音符の棒（上へ約17）に重ならない高さに置く
    const tg = route.target, cnt = tg.length, x0 = 48, right = 352, step = (right - x0) / cnt;
    const box = $('.chartf'), maxCH = innerWidth > innerHeight ? 420 : 280;
    const CH = Math.max(200, Math.min(maxCH, box ? Math.round(box.clientHeight * 360 / Math.max(1, box.clientWidth)) : 230));
    const tight = cnt >= 7;   // 港が多い航路は、港の札を数字だけにし、下ろす／積むも短く書く
    // 上の余白：通しで聴いた結果（✓ミなど）。航海中は、船の絵をこの段に置き、船の上に今鳴っている音を書く
    const T = 22, DY = (CH - 92) / HULL, y = d => T + d * DY, B = y(HULL);
    const sailing = S.phase === 'sail' || S.phase === 'replay', kNow = Math.min(S.seg, cnt - 1);
    let g = `<defs>
      <pattern id="map-sand" patternUnits="userSpaceOnUse" width="19" height="13"><rect width="19" height="13" fill="#e8c98a"/><path d="M1 4l7 -2m3 7l6 -1M2 12l4 -1" stroke="#b68a4d" stroke-width="1.2" opacity=".6"/></pattern>
      <pattern id="map-timber" patternUnits="userSpaceOnUse" width="17" height="11"><rect width="17" height="11" fill="#d89d50"/><path d="M0 10H17M3 3l9 -1" stroke="#8a5a2e" stroke-width="1.3"/><path d="M1 5l12 -1" stroke="#f2c771" stroke-width="1.4"/></pattern>
      <filter id="paper-tooth"><feTurbulence type="fractalNoise" baseFrequency=".55" numOctaves="2" stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/><feComponentTransfer><feFuncA type="linear" slope=".065"/></feComponentTransfer><feBlend in="SourceGraphic" mode="multiply"/></filter>
    </defs><rect width="360" height="${CH}" fill="#fff5df"/>
    <rect x="${x0}" y="${T}" width="${right - x0}" height="${HULL * DY}" fill="#c4e1df" filter="url(#paper-tooth)"/>
    <text x="5" y="11" font-size="9" fill="#23304a">深さ 音</text>`;
    for (let i = 0; i <= 10; i++) {
      const yy = y(i / 2);
      g += `<line x1="${x0}" x2="${right}" y1="${yy}" y2="${yy}" stroke="#23304a" stroke-opacity="${i % 2 ? .12 : .28}" stroke-width="${i % 2 ? .6 : 1}"/>
        <text x="5" y="${yy + 3.7}" font-size="9.5" fill="#23304a">${i % 2 ? '' : i / 2}</text><text x="25" y="${yy + 3.7}" font-size="10.5" fill="#23304a">${NOTE[midiOf(i / 2)]}</text>`;
    }
    for (let i = 0; i < cnt; i++) {
      const xa = x0 + i * step, xc = xa + step / 2, cd = route.cond?.[i], t = tg[i] / 2;
      if (cd?.k === 'shoal') g += `<path d="M${xa} ${y(cd.d)}l${step / 4} -1l${step / 4} 1l${step / 4} -1l${step / 4} 1V${y(HULL)}H${xa}Z" fill="url(#map-sand)" stroke="#8a5a2e" stroke-width="1.4"/>
          <text x="${xc}" y="${B + 11}" font-size="9.5" text-anchor="middle" fill="#5f3b1c">浅瀬${cd.d}まで</text>`;
      if (cd?.k === 'bridge') g += `<path d="M${xa} ${T}H${xa + step}V${y(cd.d)}H${xa}Z" fill="url(#map-timber)" opacity=".85"/>
          <path d="M${xa} ${y(cd.d)}H${xa + step}" stroke="#5f3b1c" stroke-width="3"/>
          <g font-size="9.5" font-weight="700" text-anchor="middle" fill="#fffaf0" stroke="#5f3b1c" stroke-width="2.6" paint-order="stroke"><text x="${xc}" y="${Math.max(y(cd.d) - 36, T + 12)}">荷${rowsUnderBridge(cd.d)}段まで</text><text x="${xc}" y="${Math.max(y(cd.d) - 24, T + 24)}">橋${cd.d}以上</text></g>`;
      const r = S.played[i];
      if (r) {
        const color = r.ok ? '#2e7d5b' : '#bd3424', ry = y(r.d);
        if (i && S.played[i - 1]) g += `<path d="M${xa - 6} ${y(S.played[i - 1].d)}L${xa + 6} ${ry}" fill="none" stroke="${color}" stroke-width="2" stroke-dasharray="3 2"/>`;
        g += `<g class="actual-depth"><path d="M${xa + 6} ${ry}H${xa + step - 6}" stroke="${color}" stroke-width="4" stroke-linecap="round"/>
          ${sailing && i === kNow ? '' : `<text x="${xc + 4}" y="12" font-size="10.5" font-weight="700" text-anchor="middle" fill="${color}" stroke="#fffaf0" stroke-width="3" paint-order="stroke">${r.ok ? '✓' : '×'}${r.name}</text>`}</g>`;
      }
      // お題は音符で示す：線の高さ＝深さ＝音の高さ
      const ty = y(t);
      g += `<g class="target-depth"><path d="M${xa + 7} ${ty}H${xa + step - 7}" stroke="#23304a" stroke-width="2" stroke-linecap="round"/>
        <ellipse cx="${xc}" cy="${ty}" rx="5.6" ry="4" transform="rotate(-22 ${xc} ${ty})" fill="#23304a" stroke="#fffaf0" stroke-width="1.2"/>
        <path d="M${xc + 4.6} ${ty - 1.5}V${ty - 17}q1 5 6.5 7.5" fill="none" stroke="#23304a" stroke-width="1.8" stroke-linecap="round"/></g>`;
    }
    for (let i = 0; i <= cnt; i++) {
      const x = x0 + i * step, p = route.ports[i - 1];
      if (i > 0 && i < cnt) g += `<path d="M${x} ${T}V${y(HULL)}" stroke="#8a5a2e" stroke-width="1" stroke-dasharray="3 3"/>
        <g class="port"><rect x="${x - (tight ? 10 : 14)}" y="${B + 17}" width="${tight ? 20 : 28}" height="16" rx="3" fill="#d6452c" stroke="#5f3b1c" stroke-width="1.2"/>
        <text x="${x}" y="${B + 29}" font-size="10.5" font-weight="700" text-anchor="middle" fill="#fffaf0">${tight ? i : '港' + i}</text></g>
        ${portTag(x, B, p, tight, i === cnt - 1)}`;
      else g += `<text x="${x}" y="${B + (tight ? 59 : 29)}" font-size="10" text-anchor="${i ? 'end' : 'start'}" fill="#23304a">${i ? '停泊' : '出航'}</text>`;
    }
    if (S.phase !== 'prep') {
      const k = kNow, r = S.played[k], dd = r?.d ?? S.log[k]?.toNumber() ?? depth().toNumber();
      const dk = Math.min(dd, HULL), extra = pileExtra(stackRows(S.placed, S.items)).toNumber();
      const v = voiceOf(dd), label = NOTE[v.midi] + (v.wobble ? '〜' : '');
      const lane = sailing ? { y: 21, label, color: r ? (r.ok ? '#2e7d5b' : '#bd3424') : '#23304a' } : null;
      g += keelMark(x0 + k * step + step / 2, y(dk), extra > 0 ? y(Math.max(0, dk - extra)) : null, lane);
    }
    return `<svg viewBox="0 0 360 ${CH}" class="chart" role="img" aria-label="航海図。上ほど浅く高い音。音符がお題。数字は立ち寄る港で、上向き矢印は荷下ろし、下向き矢印は積載。">${g}</svg>`;
  }

  // ---- 画面 ----
  let ended = null;   // 終わったときのボタン：{label, act}
  function draw() {
    const d = depth(), live = showLive(), prep = S.phase === 'prep';
    const chips = S.items.map((it, i) => (S.placed.some(p => p.id === i) || i >= items0) ? ''
      : `<button class="chip ${S.sel === i ? 'on' : ''}" data-i="${i}" ${prep ? '' : 'disabled'}><img src="${cargoArt(it[1])}" alt=""><span>${it[1]}<b>${it[0]}</b><small>${it[2]}×${it[3]}マス</small></span></button>`).join('');
    const sub = R ? `<small class="sub">${R.position + 1}/${R.stageCount}面　<span id="ng">${ctx.ngText()}</span></small>` : '';
    c.innerHTML = `${ctx.topbar(`${base.name}${sub}`, { pick: R ? null : S.phase === 'prep' || ended?.act === restart })}
      <div class="melody-plan">
      <section class="frame chartf" aria-label="航海図">${chartSvg()}</section>
      <section class="stat mstat" aria-label="船の手がかり"><div>船全体の重さ<strong>${showWeight() ? weightOf(S.items, S.placed, route) : '？'}</strong></div><div>沈む深さ<strong>${live ? (d.gt(HULL) ? '沈没' : depthLabel(d.toNumber())) : '？'}</strong></div><div>音<strong>${live && !d.gt(HULL) ? noteName(d) : '？'}</strong></div></section>
      <div class="say" id="say" role="status" aria-live="polite">${S.said}</div>
      </div><div class="melody-work">
      <section class="mid${prep ? '' : ' sailing'}" aria-label="船と荷の棚"><div class="frame vessel">${shipSvg()}<span class="tag-key">荷札：上が順番／下が重さ</span></div>${prep ? `<div class="mshelf" aria-label="荷を選ぶ"><img class="shelf-board" src="${GRAPHICS['cargo-board']}" alt="" aria-hidden="true" draggable="false">${chips || '<p class="empty">荷をすべて<br>積みました</p>'}</div>` : ''}</section>
      <div class="row3"><button class="btn sub" id="listen">お題を聴く</button><button class="btn sub" id="undo" ${prep && S.placed.length ? '' : 'disabled'}>ひとつ戻す</button><button class="btn" id="go" ${ended || prep ? '' : 'disabled'}>${ended ? ended.label : prep ? '出航' : '航海中'}</button></div></div>`;
    ctx.wire(c); bind(); playFx();
  }
  function bind() {
    c.querySelectorAll('[data-i]').forEach(b => b.onclick = () => { au.unlock(); au.tap(); S.sel = S.sel === +b.dataset.i ? null : +b.dataset.i; draw(); });
    // 船の上：押すと影が出て、指を動かすと影も動き、離すとその列に積む
    const svg = $('.ship'), gh = () => $('#ghost');
    if (svg && S.phase === 'prep' && S.sel != null) {
      svg.style.touchAction = 'none'; svg.style.cursor = 'pointer';
      let down = false;
      svg.onpointerdown = e => { down = true; svg.setPointerCapture?.(e.pointerId); gh().innerHTML = ghostSvg(colAt(svg, e)); };
      svg.onpointermove = e => { if (down || e.pointerType === 'mouse') gh().innerHTML = ghostSvg(colAt(svg, e)); };
      svg.onpointerup = e => { if (!down) return; down = false; put(colAt(svg, e)); };
      svg.onpointercancel = () => { down = false; gh().innerHTML = ''; };
      svg.onpointerleave = e => { if (e.pointerType === 'mouse' && !down) gh().innerHTML = ''; };
    }
    $('#undo').onclick = undo;
    $('#listen').onclick = () => { if (ctx.muted()) { say('音なしなら、航海図の♪の高さを見て進めばよい。'); return; } play(route.target.map(h => h / 2), false); };
    $('#go').onclick = () => (ended ? ended.act() : S.phase === 'prep' ? depart() : null);
  }

  // ---- 動き：荷が落ちる、持ち上がる、船が沈む・浮く ----
  function playFx() {
    if (S.quayOut) {
      $('#quay')?.animate([{ transform: 'translate(0px,0px)' }, { transform: 'translate(-420px,0px)' }], { duration: 1500, easing: 'ease-in', fill: 'forwards' });
      S.quayOut = false; S.portOut = null;
    }
    const f = S.fx; S.fx = null; if (!f) return;
    const hull = $('#hullg');
    const gateEl = $('#gate'), VWn = S.phase === 'prep' ? 240 : 330, GXn = HX + HW + 16;
    if (f.gatePass && gateEl) { gateEl.animate([{ transform: `translate(${VWn - GXn + 80}px,0px)` }, { transform: `translate(${-(GXn + 160)}px,0px)` }], { duration: f.gatePass, easing: 'linear', fill: 'forwards' }); return; }
    if (f.gateHit && gateEl) {
      gateEl.animate([{ transform: `translate(${VWn - GXn + 150}px,0px)` }, { transform: `translate(${f.bridge ? bridgeContact().shift : -16}px,0px)` }], { duration: f.gateHit, easing: 'ease-out', composite: 'replace' });
      return;
    }
    if (f.quay) { $('#quay')?.animate([{ transform: 'translate(80px,0px)' }, { transform: 'translate(0px,0px)' }], { duration: 450, easing: 'ease-out' }); return; }
    if (f.bump) { hull?.animate([{ transform: 'translate(0px,0px)' }, { transform: 'translate(-6px,0px)', offset: .3 }, { transform: 'translate(3px,0px)', offset: .65 }, { transform: 'translate(0px,0px)' }], { duration: 420, easing: 'ease-out' }); return; }
    if (f.drop != null) {
      $(`[data-n="${f.drop}"]`)?.animate([{ transform: `translate(0px, ${-f.fall}px)` }, { transform: 'translate(0px, 0px)' }], { duration: 380, easing: 'cubic-bezier(.55,0,.9,.55)' });
      hull?.animate([{ transform: `translate(0px, ${f.shift}px)` }, { transform: `translate(0px, ${f.shift}px)`, offset: .45 }, { transform: 'translate(0px, 0px)' }], { duration: 820, easing: 'ease-out' });
    } else if (f.shift) hull?.animate([{ transform: `translate(0px, ${f.shift}px)` }, { transform: 'translate(0px, 0px)' }], { duration: 420, easing: 'ease-out' });
  }
  function placeWithFx(p, fall = 90) {
    const before = bottomY(); S.placed.push(p); S.fx = { drop: S.placed.length - 1, fall, shift: before - bottomY() };
    setTimeout(() => alive() && au.land(S.items[p.id][0]), 360);
  }
  async function liftLast() {
    const el = $(`[data-n="${S.placed.length - 1}"]`);
    if (el) await el.animate([{ transform: 'translate(0px,0px)', opacity: 1 }, { transform: 'translate(0px,-70px)', opacity: 0 }], { duration: 380, easing: 'ease-in', fill: 'forwards' }).finished;
    const before = bottomY(), last = S.placed.pop(); S.fx = { shift: before - bottomY() };
    return last;
  }

  function put(col) {
    if (S.sel == null) return;
    const p = dropCargo(S.placed, S.items, S.sel, col);
    if (!p) { say(`そこに積むと、${ROWMAX}段を超えてしまうぞ。`); return; }
    au.unlock(); placeWithFx(p); S.sel = null; changed(460);
  }
  async function undo() { if (!S.placed.length || S.phase !== 'prep') return; await liftLast(); au.tap(); changed(0); }
  function changed(delay) {
    const d = depth();
    if (showLive() && !d.gt(HULL)) setTimeout(() => alive() && ring(d), delay);
    if (base.tutorial) say(tutorialHint());
    draw();
  }

  let playing = false;
  async function play(depths, home) {
    if (playing) return; playing = true; au.unlock();
    for (const d of depths) { if (!alive()) break; au.depthBell(d, 0.2, 0.7); await ctx.wait(480); }
    if (home && alive()) { await ctx.wait(80); au.bell(HOME, 0.2, 1.4); }
    playing = false;
  }

  // ---- 航海 ----
  async function depart() {
    if (!S.placed.length) { say('荷を積んでから出航するのだ。'); return; }
    au.unlock();
    const before = bottomY();
    S.phase = 'sail'; S.seg = 0; S.log = [];
    S.fx = { shift: before - bottomY() };  // 伏せていた深さまで、船が沈んで見える
    draw(); await ctx.wait(450);
    await sailSegment();
  }
  const FAULT = {
    sink: () => '重すぎて、船が沈んでしまった。',
    shoal: i => `沈みすぎて、${i + 1}番目の海路の浅瀬につかえたな。`,
    bridge: i => `${i + 1}番目の海路で、橋に当たったな。深さと、荷の山の高さを見直してごらん。`
  };
  async function sailSegment() {
    if (!alive()) return;
    const d = depth(), i = S.seg, fault = segmentFault(route, i, d, stackRows(S.placed, S.items));
    // 関門のある海路では、船の右に関門を出してから進む
    S.gate = route.cond?.[i] ? i : null;
    if (fault === 'shoal' || fault === 'bridge') {
      // 関門が近づいてきて、船の前でぶつかる
      S.fx = { gateHit: 900, bridge: fault === 'bridge' }; draw(); await ctx.wait(900); if (!alive()) return;
      S.hit = fault; S.fx = { bump: true };
    }
    if (fault) return lose(FAULT[fault](i), fault === 'sink');
    S.log.push(d); ring(d); say(S.docked ? `港${S.port}が終着。荷をすべて下ろした。空の船は深さ${depthLabel(d.toNumber())}、「${noteName(d)}」。` : `${i + 1}番目の海路。深さ${d.toNumber()}、「${noteName(d)}」。`, '航海の記録');
    if (S.gate != null) {
      // 関門が右から左へ流れ、船がその上（浅瀬）や下（橋）を通り抜ける
      S.fx = { gatePass: 1700 }; draw(); await ctx.wait(1700); if (!alive()) return;
      S.gate = null; draw();
    } else { draw(); await ctx.wait(800); if (!alive()) return; }
    if (i >= route.ports.length) return arrive();
    const port = route.ports[i]; S.seg = i + 1;
    S.port = i + 1; S.fx = { quay: true };   // 港に寄る間は岸壁を見せる
    if (port.k === 'down') {
      if (!S.placed.length) return lose('下ろす荷がなかったな。');
      const k = S.placed.length, it = S.items[S.placed[k - 1].id];
      say(`港に着きました。荷札${k}の${it[1]}（${it[0]}）を下ろします。`, '航海の記録');
      S.sign = '荷下ろし中'; draw(); au.wood(); await ctx.wait(600); if (!alive()) return;
      await liftLast(); draw(); await ctx.wait(500); S.sign = null;
      // 最後の港は終着：荷を下ろし終えたら、そこに泊まったまま最後の音（空荷）を鳴らす。それ以外は出航して岸壁を隠す
      if (i < route.ports.length - 1) S.port = null; else { S.docked = true; draw(); }
      return sailSegment();
    }
    // 積む港：荷は空いている中で一番低い位置へ自動で置く。上から落ちてきて、船が沈む
    S.items.push([...port.item]); const p = autoDrop(S.placed, S.items, S.items.length - 1);
    say(`港に着きました。${port.item[1]}（${port.item[0]}）を積み込みます。${base.tutorial ? '港で積んだ荷は、次の港で最初に下ります。' : ''}`, '航海の記録');
    S.sign = '積載中'; draw(); au.clack(); await ctx.wait(800); if (!alive()) return;
    if (!p) return lose('積む場所がなかったな。');
    placeWithFx(p, 130); draw(); await ctx.wait(1200); S.sign = null; S.port = null;
    return sailSegment();
  }

  // 最後の荷下ろしの後、航海図の上を船が進み、通しで聴かせる
  async function arrive() {
    if (S.placed.length) return lose('荷が残っているな。荷は全部下ろすのだ。');
    S.phase = 'replay'; S.gate = null; say('通しで聴きます。', '航海の記録'); draw(); await ctx.wait(500);
    // お題どおりなら、通しで聴くときに和音の伴奏を付ける（クリア時のメロディ）
    const oks = S.log.map((d, i) => matchesTarget(route, i, d)), all = oks.every(Boolean);
    const acc = all ? accompaniment(S.log.map(d => midiOf(d.toNumber()))) : [];
    for (let i = 0; i < S.log.length; i++) {
      if (!alive()) return;
      const d = S.log[i], ok = oks[i];
      S.seg = i; S.played[i] = { ok, name: noteName(d), d: d.toNumber() }; draw();
      au.depthBell(d.toNumber(), 0.2, 0.7); if (all) au.chord(CHORDS[acc[i]]);
      await ctx.wait(520);
    }
    S.seg = S.log.length;
    if (!all) return lose(`港は回れたが、メロディがお題と違うな（赤い線）。${base.tutorial ? '積む順を逆にしてごらん。' : ''}`);
    au.bell(HOME, 0.22, 1.6); au.chord(CHORDS.I, 0.05, 1.6); await ctx.wait(900); if (!alive()) return;
    au.jingle(); S.phase = 'end';
    say(`<span class="eu">エウレカ！</span> ${base.winner}`);
    if (R) {
      const r = R.record('clear'); ctx.book.recordBest(R.bestKey, R.cleared);
      ended = { label: r === 'complete' ? '結果へ' : '次の面へ', act: () => { au.wood(); r === 'complete' ? ctx.finish() : ctx.enter(R.position); } };
    } else ended = { label: '面を選ぶ', act: () => { au.wood(); ctx.pick(); } };
    draw();
    const f = $('.chartf'); f.style.position = 'relative'; f.insertAdjacentHTML('beforeend', '<div class="stamp">エウレカ！</div>');
  }

  function lose(msg, sunk = false) {
    S.phase = 'end'; S.sign = null; S.port = null; S.portOut = null; S.quayOut = false; S.docked = false;
    if (sunk) au.sink(); else au.miss();
    const r = R ? R.record('ng') : 'retry';
    say(msg);
    ended = r === 'gameover' ? { label: '結果へ', act: () => ctx.finish() } : { label: '積み直す', act: restart };
    draw();
  }
  function restart() {
    au.wood(); ended = null;
    Object.assign(S, { items: route.items.map(x => [...x]), placed: [], sel: null, phase: 'prep', seg: 0, played: [], log: [], sign: null, fx: null, gate: null, hit: null, port: null, portOut: null, quayOut: false, docked: false });
    if (base.tutorial) say(tutorialHint()); else say(`<span class="nar">${base.lead}</span>`, null);
    draw();
  }

  if (base.tutorial) say(tutorialHint()); else say(`<span class="nar">${base.lead}</span>`, null);
  draw();
  // 航海図の高さは枠の大きさで決まるので、配置が決まってから描き直す
  requestAnimationFrame(() => alive() && draw());
}
