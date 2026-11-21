// F-020 航路のメロディの試作（要件定義書7.2）。本体のゲームとは別のページ。
// 計算は本体と同じモジュールを使う（C-01）。ここで作るのは画面と流れだけ。
import { depthFraction, SHIP, HULL, exact } from '../../src/logic/physics.js';
import { midiOf, onScale } from '../../src/logic/pitch.js';
import { CELLS, ROWMAX, dropCargo, stackRows, pileClearsBridge } from '../../src/logic/stacking.js';
import { FloatAudio } from '../../src/ui/audio.js';

{
  const au = new FloatAudio();
  const $ = s => document.querySelector(s);
  const NOTE = { 96: 'ド', 93: 'ラ', 91: 'ソ', 88: 'ミ', 86: 'レ', 84: 'ド', 81: 'ラ', 79: 'ソ', 76: 'ミ', 74: 'レ', 72: 'ド' };
  const noteName = d => (onScale(d) ? NOTE[Math.round(midiOf(d.toNumber()))] : '外れ');
  const wait = ms => new Promise(r => setTimeout(r, ms));

  // 荷：[重さ, 名前, 幅, 高さ, 色]。大きさは 重さ÷比重 を1マス体積4で丸めた形（要件5章）
  const FREE_ITEMS = [
    [5, '麦袋', 2, 1, '#d8b56a'], [5, '麦袋', 2, 1, '#d8b56a'], [10, '石', 1, 1, '#9a9a92'], [10, '石', 1, 1, '#9a9a92'],
    [15, '壺', 2, 2, '#d0743c'], [20, '壺', 1, 5, '#d0743c'], [4, '木の板', 2, 1, '#c9955a'], [8, '木箱', 2, 2, '#b07a40']
  ];
  // お題1：港で下ろす・積むを組み合わせ、お題のメロディから作った航路
  const ROUTE = {
    items: [[5, '麦袋', 2, 1, '#d8b56a'], [10, '石', 1, 1, '#9a9a92'], [15, '壺', 2, 2, '#d0743c'], [8, '木箱', 2, 2, '#b07a40'], [4, '木の板', 2, 1, '#c9955a']],
    ports: [{ k: 'down' }, { k: 'load', item: [10, '石', 1, 1, '#7f8a96'] }, { k: 'down' }, { k: 'down' }, { k: 'down' }],
    target: ['4', '7/2', '9/2', '7/2', '5/2', '1'],
    cond: { 2: { k: 'shoal', d: 4.5 }, 4: { k: 'bridge', d: 2.5 } }
  };
  const LEVELS = { free: 'フリー', normal: 'ノーマル', expert: 'エキスパート' };

  const S = { mode: 'route', level: 'free', home: 84, items: [], placed: [], sel: null, phase: 'prep', seg: 0, played: [], ng: 0, loadIdx: null, history: [] };

  const weight = () => SHIP + S.placed.reduce((a, p) => a + S.items[p.id][0], 0);
  const depth = () => depthFraction(weight(), 'water');
  const showLive = () => S.mode === 'free' || S.level === 'free' || S.phase !== 'prep';
  const ring = d => { au.unlock(); au.bell(midiOf(Math.min(d.toNumber(), HULL)), 0.2, 0.9); };
  let lastSay = '';
  const say = h => { lastSay = h; const e = $('#say'); if (e) e.innerHTML = h; };
  const keepSay = () => {};

  function reset(mode) {
    S.mode = mode ?? S.mode; S.phase = 'prep'; S.seg = 0; S.played = []; S.sel = null; S.loadIdx = null; S.history = [];
    S.items = (S.mode === 'free' ? FREE_ITEMS : ROUTE.items).map(x => [...x]); S.placed = [];
    say(S.mode === 'free'
      ? '荷を選んで、船の上の列を押すと積みます。「下ろす」は最後に積んだ荷から下ろします。動かすたびに深さの音が鳴ります。'
      : 'お題を聴いて、同じメロディになるよう荷を積みましょう。港では最後に積んだ荷から下ろします。');
    draw();
  }

  // ---- 描画 ----
  // 本体の積み方と同じ比率（深さ1＝12、1段＝16、甲板8）を1.5倍で描く
  const K = 1.5, U = 12 * K, ROW = 16 * K, DECK = 8 * K, CW = 26, BX = 92, WATER = 150;
  function shipSvg() {
    const d = depth(), dn = Math.min(d.toNumber(), HULL + 0.6), live = showLive();
    const bottom = WATER + dn * U, top = bottom - HULL * U, pick = (S.phase === 'prep' || S.phase === 'load') && S.sel != null;
    let g = `<rect x="0" y="${WATER}" width="320" height="110" fill="#6fb6d6"/>`;
    // 深さの目盛りと音名（要件7.2：目盛りに音名を添える）
    for (let i = 0; i <= 10; i++) {
      const y = WATER + i * U / 2;
      g += `<line x1="8" x2="${i % 2 ? 16 : 22}" y1="${y}" y2="${y}" stroke="#23304a" stroke-width="1.5"/><text x="26" y="${y + 3.5}" font-size="9.5" fill="#23304a">${i % 2 ? '' : i / 2}</text><text x="40" y="${y + 3.5}" font-size="9.5" fill="#23304a">${NOTE[midiOf(i / 2)]}</text>`;
    }
    g += `<rect x="${BX}" y="${top}" width="${CELLS * CW + 12}" height="${HULL * U}" rx="3" fill="#d2692e" stroke="#23304a" stroke-width="2"/>`;
    for (const [n, p] of S.placed.entries()) {
      const it = S.items[p.id], x = BX + 6 + p.c * CW, y = bottom - DECK - (p.r + it[3]) * ROW;
      g += `<rect x="${x + 1}" y="${y + 1}" width="${it[2] * CW - 2}" height="${it[3] * ROW - 2}" rx="3" fill="${it[4]}" stroke="#23304a" stroke-width="1.5"/>`;
      g += `<rect x="${x + 3}" y="${y + 3}" width="15" height="13" rx="2" fill="#fffaf0" stroke="#23304a"/><text x="${x + 10.5}" y="${y + 13.5}" font-size="10.5" text-anchor="middle" fill="#23304a">${n + 1}</text>`;
    }
    g += `<rect x="0" y="${WATER}" width="320" height="110" fill="#3f97c0" opacity=".35"/><line x1="${BX - 8}" x2="${BX + CELLS * CW + 20}" y1="${WATER}" y2="${WATER}" stroke="#fffaf0" stroke-width="2"/>`;
    if (live && !d.gt(HULL)) g += `<path d="M${BX - 2} ${bottom}l-8 -5v10z" fill="#d6452c"/>`;
    // 列そのものを押して落とす
    for (let c = 0; c < CELLS; c++) {
      const x = BX + 6 + c * CW;
      g += pick ? `<g class="col" data-col="${c}"><rect x="${x}" y="0" width="${CW}" height="${bottom - DECK}" fill="#efb32a" opacity=".001"/><path d="M${x + CW / 2 - 6} 4h12l-6 8z" fill="#23304a"/></g>` : '';
    }
    return `<svg viewBox="0 0 320 250" class="ship">${g}</svg>`;
  }

  function chartSvg() {
    const n = ROUTE.target.length, W = 320, x0 = 20, step = (W - 40) / n;
    let g = `<rect width="${W}" height="96" rx="6" fill="#efe0bd"/>`;
    for (let i = 0; i < n; i++) {
      const xa = x0 + i * step, xb = xa + step, res = S.played[i];
      const color = res == null ? '#3f97c0' : res.ok ? '#2e7d5b' : '#d6452c';
      g += `<line x1="${xa}" x2="${xb}" y1="42" y2="42" stroke="${color}" stroke-width="${res ? 6 : 4}" stroke-dasharray="${res ? '' : '6 4'}"/>`;
      const known = S.level === 'free' || (S.level === 'normal' && i === 0);
      const t = Fractionless(ROUTE.target[i]);
      g += `<text x="${(xa + xb) / 2}" y="28" font-size="13" text-anchor="middle" fill="#23304a">${known ? NOTE[Math.round(midiOf(t))] : '？'}</text>`;
      if (res && !res.ok) g += `<text x="${(xa + xb) / 2}" y="12" font-size="10" text-anchor="middle" fill="#d6452c">×${res.name}</text>`;
      const c = ROUTE.cond[i];
      if (c) g += `<text x="${(xa + xb) / 2}" y="91" font-size="9" text-anchor="middle" fill="#5f3b1c">${c.k === 'shoal' ? `浅瀬 ${c.d}まで` : `橋 ${c.d}以上`}</text>`;
    }
    for (let i = 0; i <= n; i++) {
      const x = x0 + i * step, p = ROUTE.ports[i - 1];
      const label = i === 0 ? '出航' : i === n ? '終着' : p.k === 'down' ? '下ろす' : `積む ${p.item[1]}${p.item[0]}`;
      g += `<circle cx="${x}" cy="42" r="6" fill="#fffaf0" stroke="#23304a" stroke-width="2"/><text x="${x}" y="${i % 2 ? 72 : 60}" font-size="8.5" text-anchor="middle" fill="#23304a">${label}</text>`;
    }
    const sx = x0 + Math.min(S.seg, n - 1) * step + (S.phase === 'prep' ? 0 : step / 2);
    g += `<g id="boat" transform="translate(${sx} 42)"><path d="M-9 -3h18l-4 7h-10z" fill="#d2692e" stroke="#23304a" stroke-width="1.5"/></g>`;
    return `<svg viewBox="0 0 320 96" class="chart">${g}</svg>`;
  }
  const Fractionless = s => s.split('/').reduce((a, b) => a / b);

  function draw() {
    const d = depth(), live = showLive(), route = S.mode === 'route';
    const loading = S.phase === 'load';
    const usable = (S.phase === 'prep' || loading);
    $('#app').innerHTML = `
      <div class="top"><b>航路のメロディ　試作</b><span>
        <button class="tab ${!route ? 'on' : ''}" data-mode="free">1 自由に試す</button><button class="tab ${route ? 'on' : ''}" data-mode="route">2 お題</button></span></div>
      ${route ? `<div class="opts">難しさ ${Object.entries(LEVELS).map(([k, v]) => `<button class="opt ${S.level === k ? 'on' : ''}" data-lv="${k}" ${S.phase !== 'prep' ? 'disabled' : ''}>${v}</button>`).join('')}
        <span class="sp"></span>帰着 <button class="opt ${S.home === 84 ? 'on' : ''}" data-home="84">下</button><button class="opt ${S.home === 96 ? 'on' : ''}" data-home="96">上</button></div>
        ${chartSvg()}` : ''}
      <div class="stat"><div>重さ<b>${weight()}</b></div><div>深さ<b>${live ? (d.gt(HULL) ? '沈没' : d.toNumber()) : '？'}</b></div><div>音<b>${live && !d.gt(HULL) ? noteName(d) : '？'}</b></div>${route ? `<div>NG<b>${S.ng}</b></div>` : ''}</div>
      ${shipSvg()}
      <div class="say" id="say"></div>
      <div class="shelf">${loading
        ? `<button class="chip on" disabled>${S.items[S.loadIdx][1]} ${S.items[S.loadIdx][0]}<small>${S.items[S.loadIdx][2]}×${S.items[S.loadIdx][3]}マス</small></button>`
        : S.items.map((it, i) => (S.placed.some(p => p.id === i) || (route && i >= ROUTE.items.length)) ? '' : `<button class="chip ${S.sel === i ? 'on' : ''}" data-i="${i}" ${usable ? '' : 'disabled'}>${it[1]} ${it[0]}<small>${it[2]}×${it[3]}マス</small></button>`).join('')}</div>
      <div class="row">${route ? (loading
        ? `<button id="undo">ひとつ戻す</button><button id="go" class="main" ${S.placed.some(p => p.id === S.loadIdx) ? '' : 'disabled'}>続きへ</button>`
        : `<button id="listen">お題を聴く</button><button id="undo" ${S.phase === 'prep' ? '' : 'disabled'}>ひとつ戻す</button><button id="go" class="main">${S.phase === 'end' ? 'もう一度' : S.phase === 'prep' ? '出航' : '航海中…'}</button>`)
        : `<button id="down">下ろす</button><button id="replay">ここまでを聴く</button><button id="clear">空にする</button>`}</div>`;
    bind();
  }

  function bind() {
    $('#say').innerHTML = lastSay;
    document.querySelectorAll('[data-mode]').forEach(b => b.onclick = () => { au.unlock(); reset(b.dataset.mode); keepSay(); });
    document.querySelectorAll('[data-lv]').forEach(b => b.onclick = () => { S.level = b.dataset.lv; draw(); });
    document.querySelectorAll('[data-home]').forEach(b => b.onclick = () => { S.home = +b.dataset.home; au.unlock(); au.bell(91, 0.2, 0.5); setTimeout(() => au.bell(S.home, 0.2, 1.2), 420); draw(); });
    document.querySelectorAll('[data-i]').forEach(b => b.onclick = () => { au.unlock(); au.tap(); S.sel = +b.dataset.i; draw(); });
    document.querySelectorAll('[data-col]').forEach(b => b.onclick = () => put(+b.dataset.col));
    const on = (id, f) => { const e = $('#' + id); if (e) e.onclick = f; };
    on('undo', undo); on('down', unloadFree); on('replay', () => play(S.history, false)); on('clear', () => { reset('free'); keepSay(); });
    on('listen', () => play(ROUTE.target.map(Fractionless), true));
    on('go', () => (S.phase === 'end' ? (reset(), keepSay()) : S.phase === 'load' ? resume() : S.phase === 'prep' ? depart() : null));
  }

  function put(col) {
    if (S.sel == null) return;
    const p = dropCargo(S.placed, S.items, S.sel, col);
    if (!p) { say(`高さ${ROWMAX}段を超えるので、そこには積めません。`); keepSay(); return; }
    S.placed.push(p); au.land(S.items[S.sel][0]); S.sel = null;
    changed();
  }
  function undo() {
    if (S.phase === 'load') { const i = S.placed.findIndex(p => p.id === S.loadIdx); if (i >= 0) S.placed.splice(i, 1); S.sel = S.loadIdx; draw(); return; }
    if (!S.placed.length) return; S.placed.pop(); au.tap(); changed();
  }
  function unloadFree() { if (!S.placed.length) return; S.placed.pop(); au.wood(); changed(); }
  function changed() {
    const d = depth();
    if (S.mode === 'free') { S.history.push(d.toNumber()); if (!d.gt(HULL)) ring(d); else { au.sink(); say('沈んでしまいました。荷を下ろしてください。'); keepSay(); } }
    else if (showLive() && !d.gt(HULL)) ring(d);
    draw();
  }

  let playing = false;
  async function play(depths, home) {
    if (playing || !depths.length) return; playing = true; au.unlock();
    for (const d of depths) { au.bell(midiOf(Math.min(d, HULL)), 0.2, 0.7); await wait(480); }
    if (home) { await wait(80); au.bell(S.home, 0.2, 1.4); }
    playing = false;
  }

  // ---- 航海 ----
  async function depart() {
    if (!S.placed.length) { say('荷を積んでから出航しましょう。'); keepSay(); return; }
    au.unlock(); S.phase = 'sail'; S.seg = 0; S.log = []; draw();
    await sailSegment();
  }
  async function sailSegment() {
    const d = depth(), i = S.seg;
    if (d.gt(HULL)) return fail('重すぎて、船が沈んでしまいました。');
    const c = ROUTE.cond[i];
    if (c?.k === 'shoal' && d.cmp(exact(c.d)) > 0) return fail(`沈みすぎて、浅瀬につかえました（${i + 1}番目の海路）。`);
    if (c?.k === 'bridge' && (d.cmp(exact(c.d)) < 0 || !pileClearsBridge(d, c.d, stackRows(S.placed, S.items)))) return fail(`橋に当たりました（${i + 1}番目の海路）。`);
    S.log.push(d); ring(d); say(`${i + 1}番目の海路。深さ${d.toNumber()}、「${noteName(d)}」。`); draw(); keepSay();
    await wait(700);
    if (i >= ROUTE.ports.length) return arrive();
    const port = ROUTE.ports[i]; S.seg = i + 1;
    if (port.k === 'down') {
      const last = S.placed.pop();
      if (!last) return fail('下ろす荷がありません。');
      au.wood(); say(`港で荷札${S.placed.length + 1}の${S.items[last.id][1]}${S.items[last.id][0]}を下ろしました。`); keepSay(); draw();
      await wait(450); return sailSegment();
    }
    S.items.push([...port.item]); S.loadIdx = S.items.length - 1; S.sel = S.loadIdx; S.phase = 'load';
    say(`港で${port.item[1]}${port.item[0]}が積まれます。列を選んで落としてください。`); keepSay(); draw();
  }
  async function resume() { S.phase = 'sail'; S.sel = null; draw(); await sailSegment(); }
  function fail(msg) { S.ng++; S.phase = 'end'; au.miss(); say(`${msg}<br>NGです。「もう一度」で積み直します。`); keepSay(); draw(); }

  // 最後の荷下ろしの後、航海図の上を船が進み、通しで聴かせる（要件7.2）
  async function arrive() {
    if (S.placed.length) return fail('荷が残っています。荷は全部下ろします。');
    S.phase = 'replay'; say('通しで聴きます。'); keepSay(); draw(); await wait(500);
    let all = true;
    for (let i = 0; i < S.log.length; i++) {
      const d = S.log[i], ok = d.cmp(depthFromTarget(i)) === 0; all &&= ok;
      S.seg = i; S.played[i] = { ok, name: noteName(d) }; draw();
      au.bell(midiOf(d.toNumber()), 0.2, 0.7); await wait(520);
    }
    S.seg = S.log.length; S.phase = 'end';
    if (all) { au.bell(S.home, 0.22, 1.6); await wait(250); au.jingle(); say('<span class="eu">エウレカ！</span> お題と同じメロディになりました。'); }
    else { S.ng++; au.miss(); say('港は回れましたが、メロディがお題と違いました（赤い海路）。NGです。'); }
    keepSay(); draw();
  }
  const depthFromTarget = i => exact(Fractionless(ROUTE.target[i]));

  reset('route'); keepSay(); draw();
}
