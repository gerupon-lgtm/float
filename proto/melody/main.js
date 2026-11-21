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
  const num = s => s.split('/').reduce((a, b) => a / b);

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

  const S = { mode: 'route', level: 'free', home: 84, muted: false, items: [], placed: [], sel: null, phase: 'prep', seg: 0, played: [], log: [], ng: 0, history: [], fx: null };

  const weight = () => SHIP + S.placed.reduce((a, p) => a + S.items[p.id][0], 0);
  const depth = () => depthFraction(weight(), 'water');
  // 組み立て中の手がかり：フリーは重さ・深さ・音、ノーマルは重さだけ、エキスパートは伏せる。出航後は全部見せる
  const showLive = () => S.mode === 'free' || S.level === 'free' || S.phase !== 'prep';
  const showWeight = () => showLive() || S.level === 'normal';
  const ring = d => { au.unlock(); au.bell(midiOf(Math.min(d.toNumber(), HULL)), 0.2, 0.9); };
  let lastSay = '';
  const say = h => { lastSay = h; const e = $('#say'); if (e) e.innerHTML = h; };

  function reset(mode) {
    S.mode = mode ?? S.mode; S.phase = 'prep'; S.seg = 0; S.played = []; S.log = []; S.sel = null; S.history = []; S.fx = null;
    S.items = (S.mode === 'free' ? FREE_ITEMS : ROUTE.items).map(x => [...x]); S.placed = [];
    say(S.mode === 'free'
      ? '荷を選んで、船の上の列を押すと積みます。「下ろす」は最後に積んだ荷から。'
      : '図の点と同じ深さ（音）になるよう荷を積みます。港では最後に積んだ荷から下ろします。');
    draw();
  }

  // ---- 船 ----
  // 本体の積み方と同じ比率（深さ1＝12、1段＝16、甲板8）を1.3倍で描く
  const K = 1.3, U = 12 * K, ROW = 16 * K, DECK = 8 * K, CW = 22, BX = 66, WATER = 134;
  const shownDepth = () => (showLive() ? depth() : depthFraction(SHIP, 'water'));
  const bottomY = () => WATER + Math.min(shownDepth().toNumber(), HULL + 0.6) * U;
  function shipSvg() {
    const d = shownDepth(), live = showLive(), bottom = bottomY(), top = bottom - HULL * U;
    const pick = S.phase === 'prep' && S.sel != null;
    let g = `<rect x="0" y="${WATER}" width="232" height="90" fill="#6fb6d6"/>`;
    for (let i = 0; i <= 10; i++) {
      const y = WATER + i * U / 2;
      g += `<line x1="4" x2="${i % 2 ? 11 : 16}" y1="${y}" y2="${y}" stroke="#23304a" stroke-width="1.4"/><text x="19" y="${y + 3.3}" font-size="8.5" fill="#23304a">${i % 2 ? '' : i / 2}</text><text x="31" y="${y + 3.3}" font-size="8.5" fill="#23304a">${NOTE[midiOf(i / 2)]}</text>`;
    }
    g += `<g id="hullg"><rect x="${BX}" y="${top}" width="${CELLS * CW + 12}" height="${HULL * U}" rx="3" fill="#d2692e" stroke="#23304a" stroke-width="2"/>`;
    for (const [n, p] of S.placed.entries()) {
      const it = S.items[p.id], x = BX + 6 + p.c * CW, y = bottom - DECK - (p.r + it[3]) * ROW, w = it[2] * CW, h = it[3] * ROW;
      // 荷札（積んだ順の番号）と重さ。合計を伏せても、自分で足し算できるように重さは常に見せる
      g += `<g data-n="${n}"><rect x="${x + 1}" y="${y + 1}" width="${w - 2}" height="${h - 2}" rx="3" fill="${it[4]}" stroke="#23304a" stroke-width="1.5"/>
        <rect x="${x + 2.5}" y="${y + 2.5}" width="9" height="8.5" rx="1.5" fill="#fffaf0" stroke="#23304a" stroke-width=".7"/><text x="${x + 7}" y="${y + 9.3}" font-size="7" text-anchor="middle" fill="#23304a">${n + 1}</text>
        <text x="${x + w - 3}" y="${y + h - 3}" font-size="8.5" text-anchor="end" fill="#23304a" font-family="Montserrat,Arial,sans-serif">${it[0]}</text></g>`;
    }
    if (live && !d.gt(HULL)) g += `<path d="M${BX - 2} ${bottom}l-7 -4.5v9z" fill="#d6452c"/>`;
    g += `</g><rect x="0" y="${WATER}" width="232" height="90" fill="#3f97c0" opacity=".3"/><line x1="${BX - 6}" x2="${BX + CELLS * CW + 18}" y1="${WATER}" y2="${WATER}" stroke="#fffaf0" stroke-width="2"/>`;
    for (let c = 0; c < CELLS && pick; c++) {
      const x = BX + 6 + c * CW;
      g += `<g class="col" data-col="${c}"><rect x="${x}" y="0" width="${CW}" height="${bottom - DECK}" fill="#efb32a" opacity=".001"/><path d="M${x + CW / 2 - 5} 3h10l-5 7z" fill="#23304a"/></g>`;
    }
    return `<svg viewBox="0 0 232 220" class="ship">${g}</svg>`;
  }

  // ---- 航海図＝深さの図 ----
  // 縦は深さ（上ほど浅く、音は高い）。お題の点、浅瀬の海底、橋桁を同じ目盛りに描く。難しさによらず同じ情報量
  const rowsUnderBridge = limit => { let r = 0; while (r < ROWMAX && pileClearsBridge(exact(limit), limit, r + 1)) r++; return r; };
  function chartSvg() {
    const n = ROUTE.target.length, x0 = 40, step = (314 - x0) / n, T = 26, DY = 17, y = d => T + d * DY;
    let g = `<rect width="320" height="150" rx="6" fill="#efe0bd"/><rect x="${x0}" y="${T}" width="${314 - x0}" height="${HULL * DY}" fill="#9fd3e6"/>`;
    for (let i = 0; i <= 10; i++) {
      const yy = y(i / 2);
      g += `<line x1="${x0}" x2="314" y1="${yy}" y2="${yy}" stroke="#23304a" stroke-opacity="${i % 2 ? .1 : .22}"/><text x="5" y="${yy + 3}" font-size="8" fill="#23304a">${i % 2 ? '' : i / 2}</text><text x="17" y="${yy + 3}" font-size="8" fill="#23304a">${NOTE[midiOf(i / 2)]}</text>`;
    }
    for (let i = 0; i < n; i++) {
      const xa = x0 + i * step, xc = xa + step / 2, c = ROUTE.cond[i];
      if (c?.k === 'shoal') g += `<rect x="${xa + 2}" y="${y(c.d)}" width="${step - 4}" height="${y(HULL) - y(c.d) + 3}" fill="#e8c98a" stroke="#5f3b1c" stroke-width="1.4"/><text x="${xc}" y="${y(HULL) + 13}" font-size="8.5" text-anchor="middle" fill="#5f3b1c">浅瀬 ${c.d}まで</text>`;
      if (c?.k === 'bridge') g += `<rect x="${xa + 2}" y="${T - 3}" width="${step - 4}" height="${y(c.d) - T + 3}" fill="#b07a40" stroke="#5f3b1c" stroke-width="1.4"/><text x="${xc}" y="${T + 11}" font-size="8.5" text-anchor="middle" fill="#fffaf0">橋</text><text x="${xc}" y="10" font-size="8" text-anchor="middle" fill="#5f3b1c">橋 ${c.d}以上</text><text x="${xc}" y="20" font-size="8" text-anchor="middle" fill="#5f3b1c">荷${rowsUnderBridge(c.d)}段まで</text>`;
      const t = num(ROUTE.target[i]);
      g += `<line x1="${xa + 6}" x2="${xa + step - 6}" y1="${y(t)}" y2="${y(t)}" stroke="#23304a" stroke-width="3" stroke-linecap="round"/><circle cx="${xc}" cy="${y(t)}" r="4.5" fill="#fffaf0" stroke="#23304a" stroke-width="2"/>`;
      const r = S.played[i];
      if (r) g += `<line x1="${xa + 6}" x2="${xa + step - 6}" y1="${y(r.d)}" y2="${y(r.d)}" stroke="${r.ok ? '#2e7d5b' : '#d6452c'}" stroke-width="4" stroke-linecap="round" opacity=".85"/>${r.ok ? '' : `<text x="${xc}" y="${y(r.d) - 5}" font-size="8.5" text-anchor="middle" fill="#d6452c">×${r.name}</text>`}`;
    }
    for (let i = 0; i <= n; i++) {
      const x = x0 + i * step, p = ROUTE.ports[i - 1];
      const label = i === 0 ? '出航' : i === n ? '終着' : p.k === 'down' ? '↑下ろす' : `↓積む${p.item[1]}${p.item[0]}`;
      if (i > 0 && i < n) g += `<line x1="${x}" x2="${x}" y1="${T}" y2="${y(HULL)}" stroke="#5f3b1c" stroke-dasharray="3 3"/>`;
      g += `<text x="${x}" y="${i % 2 ? 146 : 135}" font-size="8" text-anchor="middle" fill="#23304a">${label}</text>`;
    }
    if (S.phase !== 'prep') {
      const k = Math.min(S.seg, n - 1), dd = S.played[k]?.d ?? S.log[k]?.toNumber() ?? depth().toNumber();
      g += `<path transform="translate(${x0 + k * step + step / 2} ${y(Math.min(dd, HULL))})" d="M-9 -8h18l-3 8h-12z" fill="#d2692e" stroke="#23304a" stroke-width="1.4"/>`;
    }
    return `<svg viewBox="0 0 320 150" class="chart">${g}</svg>`;
  }

  // ---- 画面 ----
  function draw() {
    const d = depth(), live = showLive(), route = S.mode === 'route', prep = S.phase === 'prep';
    const chips = S.items.map((it, i) => (S.placed.some(p => p.id === i) || (route && i >= ROUTE.items.length)) ? ''
      : `<button class="chip ${S.sel === i ? 'on' : ''}" data-i="${i}" ${prep ? '' : 'disabled'}>${it[1]} ${it[0]}<small>${it[2]}×${it[3]}マス</small></button>`).join('');
    $('#app').innerHTML = `
      <div class="top"><b>航路のメロディ 試作</b><span>
        <button class="tab ${!route ? 'on' : ''}" data-mode="free">1 自由</button><button class="tab ${route ? 'on' : ''}" data-mode="route">2 お題</button></span></div>
      ${route ? `<div class="opts"><select id="lv" ${prep ? '' : 'disabled'}>${Object.entries(LEVELS).map(([k, v]) => `<option value="${k}" ${S.level === k ? 'selected' : ''}>${v}</option>`).join('')}</select>
        <button class="opt ${S.muted ? 'on' : ''}" data-mute>${S.muted ? '音なし' : '音あり'}</button><span class="sp"></span>帰着のド<button class="opt ${S.home === 84 ? 'on' : ''}" data-home="84">下</button><button class="opt ${S.home === 96 ? 'on' : ''}" data-home="96">上</button></div>
        ${chartSvg()}` : ''}
      <div class="stat">重さ<b>${showWeight() ? weight() : '？'}</b>深さ<b>${live ? (d.gt(HULL) ? '沈没' : d.toNumber()) : '？'}</b>音<b>${live && !d.gt(HULL) ? noteName(d) : '？'}</b>${route ? `NG<b>${S.ng}</b>` : ''}</div>
      <div class="mid">${shipSvg()}<div class="shelf">${chips || '<p class="empty">棚は空です</p>'}</div></div>
      <div class="say" id="say"></div>
      <div class="row">${route
        ? `<button id="listen" ${S.muted ? 'disabled' : ''}>お題を聴く</button><button id="undo" ${prep && S.placed.length ? '' : 'disabled'}>ひとつ戻す</button><button id="go" class="main" ${S.phase === 'sail' || S.phase === 'replay' ? 'disabled' : ''}>${S.phase === 'end' ? 'もう一度' : prep ? '出航' : '航海中…'}</button>`
        : `<button id="down">下ろす</button><button id="replay">ここまでを聴く</button><button id="clear">空にする</button>`}</div>`;
    bind(); playFx();
  }

  function bind() {
    $('#say').innerHTML = lastSay;
    document.querySelectorAll('[data-mode]').forEach(b => b.onclick = () => { au.unlock(); reset(b.dataset.mode); });
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
      au.wood(); await wait(250); await liftLast(); draw(); await wait(500);
      return sailSegment();
    }
    // 積む港：荷が上から落ちてきて、船が沈む
    S.items.push([...port.item]); const id = S.items.length - 1, p = autoDrop(id);
    say(`港に着きました。${port.item[1]}（${port.item[0]}）を積み込みます。`); au.clack(); await wait(500);
    if (!p) return fail('積む場所がありません。');
    placeWithFx(p, 130); draw(); await wait(900);
    return sailSegment();
  }
  function fail(msg) { S.ng++; S.phase = 'end'; au.miss(); say(`${msg} NGです。「もう一度」で積み直します。`); draw(); }

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
    if (all) { au.bell(S.home, 0.22, 1.6); await wait(250); au.jingle(); say('<span class="eu">エウレカ！</span> お題と同じメロディになりました。'); }
    else { S.ng++; au.miss(); say('港は回れましたが、メロディがお題と違いました（赤い線）。NGです。'); }
    draw();
  }

  reset('route');
}
