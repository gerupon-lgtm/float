// F-020 優先度1の画面見本。本体へは未組み込み。元の試作の計算・音・進行を保持する。
// 計算は本体と同じモジュールを使う（C-01）。ここで作るのは画面と流れだけ。
import { depthFraction, SHIP, HULL, exact } from '../../src/logic/physics.js';
import { midiOf, onScale } from '../../src/logic/pitch.js';
import { CELLS, ROWMAX, dropCargo, stackRows, pileClearsBridge } from '../../src/logic/stacking.js';
import { FloatAudio } from '../../src/ui/audio.js';
import { GRAPHICS, cargoArt } from '../../src/ui/graphics.js';

{
  const au = new FloatAudio();
  const VISUAL_SAMPLE_VERSION = '0.1.1';
  const BLANK_SIGN = new URL('../../docs/visual-samples/2026-11-21-melody-priority1-v1/blank-status-board.png', import.meta.url).href;
  const $ = s => document.querySelector(s);
  const NOTE = { 96: 'ド', 93: 'ラ', 91: 'ソ', 88: 'ミ', 86: 'レ', 84: 'ド', 81: 'ラ', 79: 'ソ', 76: 'ミ', 74: 'レ', 72: 'ド' };
  const noteName = d => (onScale(d) ? NOTE[Math.round(midiOf(d.toNumber()))] : '外れ');
  const wait = ms => new Promise(r => setTimeout(r, ms));
  const num = s => s.split('/').reduce((a, b) => a / b);

  // 荷：[重さ, 名前, 幅, 高さ, 色]。大きさは 重さ÷比重 を1マス体積4で丸めた形（要件5章）
  const FREE_ITEMS = [
    [5, '麦袋', 2, 1, '#d8b56a'], [5, '麦袋', 2, 1, '#d8b56a'], [10, '石', 1, 1, '#9a9a92'], [10, '石', 1, 1, '#9a9a92'],
    [15, '壺', 2, 2, '#d0743c'], [20, '壺', 1, 5, '#d0743c'], [4, '木の板', 2, 1, '#c9955a'], [8, '木箱', 2, 2, '#b07a40']
  ];
  // 練習：荷2つ。積む順を逆にすると、港は回れてもメロディが違う（赤い線）になる
  const TUTORIAL = {
    name: '練習',
    items: [[10, '石', 1, 1, '#9a9a92'], [5, '麦袋', 2, 1, '#d8b56a']],
    ports: [{ k: 'down' }, { k: 'load', item: [5, '麦袋', 2, 1, '#c9a75c'] }, { k: 'down' }, { k: 'down' }],
    target: ['5/2', '2', '5/2', '2', '1'],
    cond: {}, tutorial: true
  };
  // お題1：港で下ろす・積むを組み合わせ、お題のメロディから作った航路
  const ROUTE1 = {
    name: 'お題1',
    items: [[5, '麦袋', 2, 1, '#d8b56a'], [10, '石', 1, 1, '#9a9a92'], [15, '壺', 2, 2, '#d0743c'], [8, '木箱', 2, 2, '#b07a40'], [4, '木の板', 2, 1, '#c9955a']],
    ports: [{ k: 'down' }, { k: 'load', item: [10, '石', 1, 1, '#7f8a96'] }, { k: 'down' }, { k: 'down' }, { k: 'down' }],
    target: ['4', '7/2', '9/2', '7/2', '5/2', '1'],
    cond: { 2: { k: 'shoal', d: 4.5 }, 4: { k: 'bridge', d: 2.5 } }
  };
  const ROUTES = { tut: TUTORIAL, r1: ROUTE1 };
  let ROUTE = TUTORIAL;
  const LEVELS = { free: 'フリー', normal: 'ノーマル', expert: 'エキスパート' };

  const S = { mode: 'route', route: 'tut', sign: null, level: 'free', home: 84, muted: false, items: [], placed: [], sel: null, phase: 'prep', seg: 0, played: [], log: [], ng: 0, history: [], fx: null };

  const weight = () => SHIP + S.placed.reduce((a, p) => a + S.items[p.id][0], 0);
  const depth = () => depthFraction(weight(), 'water');
  // 組み立て中の手がかり：フリーは重さ・深さ・音、ノーマルは重さだけ、エキスパートは伏せる。出航後は全部見せる
  const showLive = () => S.mode === 'free' || S.level === 'free' || ROUTE.tutorial || S.phase !== 'prep';
  const showWeight = () => showLive() || S.level === 'normal';
  const ring = d => { au.unlock(); au.bell(midiOf(Math.min(d.toNumber(), HULL)), 0.2, 0.9); };
  let lastSay = '';
  const say = h => { lastSay = h; const e = $('#say'); if (e) e.innerHTML = h; };

  // 練習面の案内：組み立ての進み具合に合わせて文を変える
  function tutorialHint() {
    const n = S.placed.length;
    if (n === 0) return '航海図の○がお題です。最初は深さ2.5、船と荷で重さ25。船の重さ10に、荷を15足してみよう。';
    if (n === 1) return '港では、最後に積んだ荷から下ろします。最初の港で何を下ろすか、積む順を考えてみよう。';
    return '荷を15積みました。最初の港で5を下ろすと深さ2。出航して、○の道をたどれるか確かめよう。';
  }
  function reset(mode, route) {
    S.mode = mode ?? S.mode; if (route) S.route = route; ROUTE = ROUTES[S.route]; S.sign = null; S.phase = 'prep'; S.seg = 0; S.played = []; S.log = []; S.sel = null; S.history = []; S.fx = null;
    S.items = (S.mode === 'free' ? FREE_ITEMS : ROUTE.items).map(x => [...x]); S.placed = [];
    say(S.mode === 'free'
      ? '荷を選んで、船の上の列を押すと積みます。「下ろす」は最後に積んだ荷から。'
      : ROUTE.tutorial ? tutorialHint() : '図の点と同じ深さ（音）になるよう荷を積みます。港では最後に積んだ荷から下ろします。');
    draw();
  }

  // ---- 船 ----
  // 本番の船の絵と寸法（幅124・高さ60＝深さ5、1列18、1段16、甲板8）を1.3倍で描く
  const K = 1.3, U = 12 * K, ROW = 16 * K, DECK = 8 * K, CW = 18 * K, HW = 124 * K, HX = 70, WATER = 134;
  const shownDepth = () => (showLive() ? depth() : depthFraction(SHIP, 'water'));
  const bottomY = () => WATER + Math.min(shownDepth().toNumber(), HULL + 0.6) * U;
  function shipSvg() {
    const d = shownDepth(), live = showLive(), bottom = bottomY(), top = bottom - HULL * U;
    const pick = S.phase === 'prep' && S.sel != null, cx = HX + 8 * K;
    let g = `<defs><pattern id="pw" patternUnits="userSpaceOnUse" width="240" height="110" y="${WATER}"><image href="${GRAPHICS['liquid-water']}" width="240" height="110" preserveAspectRatio="none"/></pattern></defs>
      <rect width="240" height="230" fill="var(--sky)"/><path d="M110 22q20 -14 40 0t40 0" fill="none" stroke="#fffaf0" stroke-width="5"/>`;
    g += `<rect x="0" y="${WATER}" width="240" height="100" fill="url(#pw)"/>`;
    g += `<g id="hullg"><image href="${GRAPHICS.boat}" x="${HX}" y="${top}" width="${HW}" height="${HULL * U}" preserveAspectRatio="none"/>`;
    for (const [n, p] of S.placed.entries()) {
      const it = S.items[p.id], x = cx + p.c * CW, y = bottom - DECK - (p.r + it[3]) * ROW, w = it[2] * CW, h = it[3] * ROW;
      // 荷札（積んだ順の番号）と重さ。合計を伏せても、自分で足し算できるように重さは常に見せる
      g += `<g data-n="${n}"><image href="${cargoArt(it[1])}" x="${x}" y="${y}" width="${w}" height="${h}" preserveAspectRatio="none"/>
        <g class="cargo-tag" aria-label="荷札${n + 1}、重さ${it[0]}"><path d="M${x+4} ${y+.4}H${x+20.5}V${y+20}H${x+.5}V${y+4}Z" fill="#fffaf0" stroke="#23304a" stroke-width=".8"/>
        <text class="cargo-order" x="${x+10.5}" y="${y+9.3}" font-size="10" font-weight="700" text-anchor="middle" fill="#d6452c">${n+1}</text>
        <path d="M${x+3} ${y+10.8}H${x+18}" stroke="#cdbf9f" stroke-width=".7"/>
        <text class="cargo-weight" x="${x+10.5}" y="${y+19.2}" font-size="11.5" font-weight="700" text-anchor="middle" fill="#23304a" font-family="Arial,sans-serif">${it[0]}</text></g></g>`;
    }
    g += `</g><rect x="0" y="${WATER}" width="240" height="100" fill="#3f97c0" opacity=".28"/><line x1="0" x2="240" y1="${WATER}" y2="${WATER}" stroke="#fffaf0" stroke-width="1.5" opacity=".8"/>`;
    // 深さの目盛り（本番と同じ白い札）に音名を添える
    let sc = `<rect x="3" y="${WATER - 20}" width="52" height="${HULL * U + 30}" rx="6" fill="#fffaf0" stroke="#23304a" stroke-width="2"/><text x="29" y="${WATER - 7}" text-anchor="middle" font-size="10" font-weight="700" fill="#23304a">深さ・音</text>`;
    for (let i = 0; i <= 10; i++) {
      const y = WATER + i * U / 2;
      sc += `<path d="M7 ${y}h${i % 2 ? 5 : 9}" stroke="#23304a" stroke-width="2"/><text x="19" y="${y + 3.5}" font-size="9.5" font-weight="700" fill="#23304a">${i % 2 ? '' : i / 2}</text><text x="${i % 2 ? 40 : 31}" y="${y + 3.5}" font-size="9" font-weight="700" fill="#23304a">${NOTE[midiOf(i / 2)]}</text>`;
    }
    g += sc;
    if (live && !d.gt(HULL)) g += `<path d="M${HX - 1} ${bottom}l-8 -5v10z" fill="var(--red)" stroke="#23304a" stroke-width="1.2"/>`;
    // 看板：出航前と港での積み込みは「積載中」、荷下ろしは「荷下ろし中」
    const sign = S.mode === 'route' && S.phase === 'prep' ? '積載中' : S.sign;
    if (sign) g += `<g class="sign" aria-label="${sign}"><image href="${BLANK_SIGN}" x="64" y="3" width="116" height="40" preserveAspectRatio="none"/><text x="122" y="29" font-size="14" text-anchor="middle" fill="#23304a" font-family="var(--disp)">${sign}</text></g>`;
    for (let c = 0; c < CELLS && pick; c++) {
      const x = cx + c * CW;
      g += `<g class="col" data-col="${c}"><rect x="${x}" y="0" width="${CW}" height="${bottom - DECK}" fill="#efb32a" opacity=".001"/><path d="M${x + CW / 2 - 5} 32h10l-5 7z" fill="var(--red)" stroke="#23304a" stroke-width="1"/></g>`;
    }
    return `<svg viewBox="0 0 240 226" class="ship" role="img" aria-label="船と荷">${g}</svg>`;
  }

  // ---- 航海図＝深さの図 ----
  // 縦は深さ（上ほど浅く、音は高い）。お題の点、浅瀬の海底、橋桁を同じ目盛りに描く。難しさによらず同じ情報量
  const rowsUnderBridge = limit => { let r = 0; while (r < ROWMAX && pileClearsBridge(exact(limit), limit, r + 1)) r++; return r; };

  function chartSvg() {
    const n=ROUTE.target.length,x0=48,right=352,step=(right-x0)/n,CH=Math.max(212,Math.min(280,innerHeight-570)),T=22,DY=(CH-92)/HULL,y=d=>T+d*DY,B=y(HULL);
    let g=`<defs>
      <pattern id="map-sand" patternUnits="userSpaceOnUse" width="19" height="13"><rect width="19" height="13" fill="#e8c98a"/><path d="M1 4l7 -2m3 7l6 -1M2 12l4 -1" stroke="#b68a4d" stroke-width="1.2" opacity=".6"/></pattern>
      <pattern id="map-timber" patternUnits="userSpaceOnUse" width="17" height="11"><rect width="17" height="11" fill="#d89d50"/><path d="M0 10H17M3 3l9 -1" stroke="#8a5a2e" stroke-width="1.3"/><path d="M1 5l12 -1" stroke="#f2c771" stroke-width="1.4"/></pattern>
      <filter id="paper-tooth"><feTurbulence type="fractalNoise" baseFrequency=".55" numOctaves="2" stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/><feComponentTransfer><feFuncA type="linear" slope=".065"/></feComponentTransfer><feBlend in="SourceGraphic" mode="multiply"/></filter>
    </defs><rect width="360" height="${CH}" fill="#fff5df"/>
    <rect x="${x0}" y="${T}" width="${right-x0}" height="${HULL*DY}" fill="#c4e1df" filter="url(#paper-tooth)"/>
    <text x="5" y="11" font-size="9" fill="#23304a">深さ 音</text>`;
    for(let i=0;i<=10;i++){
      const yy=y(i/2);
      g+=`<line x1="${x0}" x2="${right}" y1="${yy}" y2="${yy}" stroke="#23304a" stroke-opacity="${i%2?.12:.28}" stroke-width="${i%2?.6:1}"/>
        <text x="5" y="${yy+3.7}" font-size="9.5" fill="#23304a">${i%2?'':i/2}</text><text x="25" y="${yy+3.7}" font-size="10.5" fill="#23304a">${NOTE[midiOf(i/2)]}</text>`;
    }
    for(let i=0;i<n;i++){
      const xa=x0+i*step,xc=xa+step/2,c=ROUTE.cond[i],t=num(ROUTE.target[i]);
      g+=`<text x="${xa+3}" y="12" font-size="9.5" fill="#23304a">${i+1}</text>`;
      if(c?.k==='shoal'){
        g+=`<path class="chart-shoal" data-depth="${c.d}" d="M${xa} ${y(c.d)}l${step/4} -1l${step/4} 1l${step/4} -1l${step/4} 1V${y(HULL)}H${xa}Z" fill="url(#map-sand)" stroke="#8a5a2e" stroke-width="1.4"/>
          <text x="${xc}" y="${B+14}" font-size="10" text-anchor="middle" fill="#5f3b1c">浅瀬${c.d}まで</text>`;
      }
      if(c?.k==='bridge'){
        g+=`<path class="chart-bridge" data-depth="${c.d}" d="M${xa} ${T}H${xa+step}V${y(c.d)}H${xa}Z" fill="url(#map-timber)" opacity=".85"/>
          <path d="M${xa} ${y(c.d)}H${xa+step}" stroke="#5f3b1c" stroke-width="3"/>
          <text x="${xc}" y="${B+14}" font-size="10" text-anchor="middle" fill="#5f3b1c">橋${c.d}以上</text><text x="${xc}" y="${B+26}" font-size="10" text-anchor="middle" fill="#5f3b1c">荷${rowsUnderBridge(c.d)}段まで</text>`;
      }
      const r=S.played[i];
      if(r){
        const color=r.ok?'#2e7d5b':'#bd3424',ry=y(r.d);
        if(i&&S.played[i-1])g+=`<path d="M${xa-6} ${y(S.played[i-1].d)}L${xa+6} ${ry}" fill="none" stroke="${color}" stroke-width="2" stroke-dasharray="3 2"/>`;
        g+=`<g class="actual-depth" data-match="${r.ok}" data-depth="${r.d}"><path d="M${xa+6} ${ry}H${xa+step-6}" stroke="${color}" stroke-width="4" stroke-linecap="round"/>
          <text x="${xc+4}" y="12" font-size="10.5" font-weight="700" text-anchor="middle" fill="${color}" stroke="#fffaf0" stroke-width="3" paint-order="stroke">${r.ok?'✓':'×'}${r.name}</text></g>`;
      }
      g+=`<g class="target-depth" data-depth="${t}"><path d="M${xa+7} ${y(t)}H${xa+step-7}" stroke="#23304a" stroke-width="2" stroke-linecap="round"/><circle cx="${xc}" cy="${y(t)}" r="4.5" fill="#fffaf0" stroke="#23304a" stroke-width="2"/></g>`;
    }
    for(let i=0;i<=n;i++){
      const x=x0+i*step,p=ROUTE.ports[i-1];
      if(i>0&&i<n)g+=`<path d="M${x} ${T}V${y(HULL)}" stroke="#8a5a2e" stroke-width="1" stroke-dasharray="3 3"/>
        <circle cx="${x}" cy="${B+43}" r="8" fill="#f7efdc" stroke="#8a5a2e" stroke-width="1.2"/>
        <text class="port-arrow" x="${x}" y="${B+48}" font-size="14" font-weight="700" text-anchor="middle" fill="#23304a">${p.k==='down'?'↑':'↓'}</text>
        <text class="port-label" x="${x}" y="${B+63}" font-size="9.5" font-weight="700" text-anchor="middle" fill="#23304a">${p.k==='down'?'下ろす':p.item[1]+p.item[0]}</text>`;
      else g+=`<text x="${x}" y="${B+61}" font-size="10" text-anchor="${i?'end':'start'}" fill="#23304a">${i?'終着':'出航'}</text>`;
    }
    if(S.phase!=='prep'){
      const k=Math.min(S.seg,n-1),dd=S.played[k]?.d??S.log[k]?.toNumber()??depth().toNumber();
      g+=`<g class="chart-ship" aria-label="今の船の深さ${dd}"><image href="${GRAPHICS.boat}" x="${x0+k*step+step/2-12}" y="${y(Math.min(dd,HULL))-11.6}" width="24" height="11.6" preserveAspectRatio="none"/></g>`;
    }
    return `<svg viewBox="0 0 360 ${CH}" class="chart" role="img" aria-label="航海図。上ほど浅く高い音。白丸がお題、上向き矢印は荷下ろし、下向き矢印は積載。">${g}</svg>`;
  }

  // ---- 画面 ----
  function draw() {
    const d = depth(), live = showLive(), route = S.mode === 'route', prep = S.phase === 'prep';
    const chips = S.items.map((it, i) => (S.placed.some(p => p.id === i) || (route && i >= ROUTE.items.length)) ? ''
      : `<button class="chip ${S.sel === i ? 'on' : ''}" data-i="${i}" ${prep ? '' : 'disabled'}><img src="${cargoArt(it[1])}" alt=""><span>${it[1]}<b>${it[0]}</b><small>${it[2]}×${it[3]}マス</small></span></button>`).join('');

    const ngInfo=route?`<small class="sub">${ROUTE.tutorial?'はじめの航海':ROUTE.name}　NG ${S.ng}回</small>`:'<small class="sub">荷と音を確かめる</small>';
    $('#app').innerHTML=`
      <header class="top"><b>航路のメロディ${ngInfo}</b><button class="tiny" data-mute aria-pressed="${S.muted}">${S.muted?'音なし':'音あり'}</button></header>
      <section class="frame chartf" aria-label="航海図">${chartSvg()}</section>
      <section class="stat" aria-label="船の手がかり"><div>船全体の重さ<strong data-stat="weight">${showWeight()?weight():'？'}</strong></div><div>沈む深さ<strong data-stat="depth">${live?(d.gt(HULL)?'沈没':d.toNumber()):'？'}</strong></div><div>音<strong data-stat="note">${live&&!d.gt(HULL)?noteName(d):'？'}</strong></div></section>
      <section class="mid" aria-label="船と荷の棚"><div class="frame vessel">${shipSvg()}<span class="tag-key">荷札：上が順番／下が重さ</span></div><div class="shelf" aria-label="荷を選ぶ">${chips||'<p class="empty">荷をすべて<br>積みました</p>'}</div></section>
      <div class="say" id="say" role="status" aria-live="polite"></div>
      <div class="row"><button class="btn sub" id="listen" ${S.muted?'disabled':''}>お題を聴く</button><button class="btn sub" id="undo" ${prep&&S.placed.length?'':'disabled'}>ひとつ戻す</button><button class="btn" id="go" ${S.phase==='sail'||S.phase==='replay'?'disabled':''}>${S.phase==='end'?'もう一度':prep?'出航':'航海中'}</button></div>
      <footer class="sample-version">航路のメロディ 見本 ${VISUAL_SAMPLE_VERSION}</footer>`;
    bind(); playFx();
  }

  function bind() {
    $('#say').innerHTML = lastSay.includes('class="who"') ? lastSay : `<span class="who">${S.phase === 'prep' ? 'アルキメデス' : '航海の記録'}</span>${lastSay}`;
    document.querySelectorAll('[data-mode]').forEach(b => b.onclick = () => { au.unlock(); reset(b.dataset.mode); });
    document.querySelectorAll('[data-route]').forEach(b => b.onclick = () => { au.unlock(); reset('route', b.dataset.route); });
    const lv = $('#lv'); if (lv) lv.onchange = () => { S.level = lv.value; draw(); };
    document.querySelectorAll('[data-mute]').forEach(b => b.onclick = () => { S.muted = !S.muted; au.unlock(); au.setMuted(S.muted); draw(); });
    document.querySelectorAll('[data-home]').forEach(b => b.onclick = () => { S.home = +b.dataset.home; au.unlock(); au.bell(91, 0.2, 0.5); setTimeout(() => au.bell(S.home, 0.2, 1.2), 420); draw(); });
    document.querySelectorAll('[data-i]').forEach(b => b.onclick = () => { au.unlock(); au.tap(); S.sel = +b.dataset.i; draw(); });
    document.querySelectorAll('[data-col]').forEach(b => b.onclick = () => put(+b.dataset.col));
    const on = (id, f) => { const e = $('#' + id); if (e) e.onclick = f; };
    on('undo', undo); on('down', unloadFree); on('replay', () => play(S.history, false)); on('clear', () => reset('free'));
    on('listen', () => play(ROUTE.target.map(num), true));
    on('go', () => (S.phase === 'end' ? reset() : S.phase === 'prep' ? depart() : null));
  }

  // ---- 動き：荷が落ちる、持ち上がる、船が沈む・浮く ----
  function playFx() {
    const f = S.fx; S.fx = null; if (!f) return;
    const hull = document.querySelector('#hullg');
    if (f.drop != null) {
      document.querySelector(`[data-n="${f.drop}"]`)?.animate([{ transform: `translate(0px, ${-f.fall}px)` }, { transform: 'translate(0px, 0px)' }], { duration: 380, easing: 'cubic-bezier(.55,0,.9,.55)' });
      hull?.animate([{ transform: `translate(0px, ${f.shift}px)` }, { transform: `translate(0px, ${f.shift}px)`, offset: .45 }, { transform: 'translate(0px, 0px)' }], { duration: 820, easing: 'ease-out' });
    } else if (f.shift) hull?.animate([{ transform: `translate(0px, ${f.shift}px)` }, { transform: 'translate(0px, 0px)' }], { duration: 420, easing: 'ease-out' });
  }
  // 荷を置き、落ちて船が沈む動きを付けて描く
  function placeWithFx(p, fall = 90) {
    const before = bottomY(); S.placed.push(p); S.fx = { drop: S.placed.length - 1, fall, shift: before - bottomY() };
    setTimeout(() => au.land(S.items[p.id][0]), 360);
  }
  async function liftLast() {
    const n = S.placed.length - 1, el = document.querySelector(`[data-n="${n}"]`);
    if (el) await el.animate([{ transform: 'translate(0px,0px)', opacity: 1 }, { transform: 'translate(0px,-70px)', opacity: 0 }], { duration: 380, easing: 'ease-in', fill: 'forwards' }).finished;
    const before = bottomY(), last = S.placed.pop(); S.fx = { shift: before - bottomY() };
    return last;
  }

  function put(col) {
    if (S.sel == null) return;
    const p = dropCargo(S.placed, S.items, S.sel, col);
    if (!p) { say(`高さ${ROWMAX}段を超えるので、そこには積めません。`); return; }
    placeWithFx(p); S.sel = null; changed(460);
  }
  async function undo() { if (!S.placed.length) return; await liftLast(); au.tap(); changed(0); }
  async function unloadFree() { if (!S.placed.length) return; au.wood(); await liftLast(); changed(0); }
  function changed(delay) {
    const d = depth();
    if (S.mode === 'free') {
      S.history.push(d.toNumber());
      if (d.gt(HULL)) { au.sink(); say('沈んでしまいました。荷を下ろしてください。'); }
      else setTimeout(() => ring(d), delay);
    } else if (showLive() && !d.gt(HULL)) setTimeout(() => ring(d), delay);
    if (S.mode === 'route' && ROUTE.tutorial && S.phase === 'prep') say(tutorialHint());
    draw();
  }

  let playing = false;
  async function play(depths, home) {
    if (playing || !depths.length) return; playing = true; au.unlock();
    for (const d of depths) { au.bell(midiOf(Math.min(d, HULL)), 0.2, 0.7); await wait(480); }
    if (home) { await wait(80); au.bell(S.home, 0.2, 1.4); }
    playing = false;
  }

  // 港で積む荷は、空いている中で一番低い位置に自動で置く（同じ高さなら左から）
  function autoDrop(id) {
    let best = null;
    for (let c = 0; c + S.items[id][2] <= CELLS; c++) {
      const p = dropCargo(S.placed, S.items, id, c);
      if (p && (!best || p.r < best.r)) best = p;
    }
    return best;
  }

  // ---- 航海 ----
  async function depart() {
    if (!S.placed.length) { say('荷を積んでから出航しましょう。'); return; }
    au.unlock();
    const before = bottomY();
    S.phase = 'sail'; S.seg = 0; S.log = [];
    S.fx = { shift: before - bottomY() };  // 伏せていた深さまで、船が沈んで見える
    draw(); await wait(450);
    await sailSegment();
  }
  async function sailSegment() {
    const d = depth(), i = S.seg;
    if (d.gt(HULL)) return fail('重すぎて、船が沈んでしまいました。');
    const c = ROUTE.cond[i];
    if (c?.k === 'shoal' && d.cmp(exact(c.d)) > 0) return fail(`沈みすぎて、浅瀬につかえました（${i + 1}番目の海路）。`);
    if (c?.k === 'bridge' && (d.cmp(exact(c.d)) < 0 || !pileClearsBridge(d, c.d, stackRows(S.placed, S.items)))) return fail(`橋に当たりました（${i + 1}番目の海路）。`);
    S.log.push(d); ring(d); say(`${i + 1}番目の海路。深さ${d.toNumber()}、「${noteName(d)}」。`); draw();
    await wait(800);
    if (i >= ROUTE.ports.length) return arrive();
    const port = ROUTE.ports[i]; S.seg = i + 1;
    if (port.k === 'down') {
      if (!S.placed.length) return fail('下ろす荷がありません。');
      const n = S.placed.length, it = S.items[S.placed[n - 1].id];
      say(`港に着きました。荷札${n}の${it[1]}（${it[0]}）を下ろします。`);
      S.sign = '荷下ろし中'; draw(); au.wood(); await wait(250); await liftLast(); S.sign = null; draw(); await wait(500);
      return sailSegment();
    }
    // 積む港：荷が上から落ちてきて、船が沈む
    S.items.push([...port.item]); const id = S.items.length - 1, p = autoDrop(id);
    say(`港に着きました。${port.item[1]}（${port.item[0]}）を積み込みます。${ROUTE.tutorial ? '港で積んだ荷は、次の港で最初に下ります。' : ''}`); S.sign = '積載中'; draw(); au.clack(); await wait(500);
    if (!p) return fail('積む場所がありません。');
    placeWithFx(p, 130); draw(); await wait(900); S.sign = null;
    return sailSegment();
  }
  function fail(msg) { S.ng++; S.phase = 'end'; au.miss(); say(`<span class="who">アルキメデス</span>${msg}「もう一度」で積み直してごらん。`); draw(); }

  // 最後の荷下ろしの後、航海図の上を船が進み、通しで聴かせる（要件7.2）
  async function arrive() {
    if (S.placed.length) return fail('荷が残っています。荷は全部下ろします。');
    S.phase = 'replay'; say('通しで聴きます。'); draw(); await wait(500);
    let all = true;
    for (let i = 0; i < S.log.length; i++) {
      const d = S.log[i], ok = d.cmp(exact(num(ROUTE.target[i]))) === 0; all &&= ok;
      S.seg = i; S.played[i] = { ok, name: noteName(d), d: d.toNumber() }; draw();
      au.bell(midiOf(d.toNumber()), 0.2, 0.7); await wait(520);
    }
    S.seg = S.log.length; S.phase = 'end';
    if (all) { au.bell(S.home, 0.22, 1.6); await wait(250); au.jingle(); say('<span class="who">アルキメデス</span><span class="eu">エウレカ！</span> お題と同じメロディになったな。'); }
    else { S.ng++; au.miss(); say(`<span class="who">アルキメデス</span>港は回れたが、メロディがお題と違うな（赤い線）。${ROUTE.tutorial ? '積む順を逆にしてごらん。' : ''}`); }
    draw();
  }

  const review = new URLSearchParams(location.search);
  S.level = ['free','normal','expert'].includes(review.get('hints')) ? review.get('hints') : 'free';
  reset('route', review.get('lesson') === 'route1' ? 'r1' : 'tut');
}
