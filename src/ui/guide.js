// 「遊び方と概要」「パーツの説明」の画面。文は src/content/guide.js、数字は src/logic から埋める（C-01）。
import { AREA, HULL, SHIP, LIQUIDS, MATERIALS, cellWeight } from '../logic/physics.js';
import { CELLS, ROWMAX } from '../logic/stacking.js';
import { HOWTO, PARTS } from '../content/guide.js';
import { GRAPHICS } from './graphics.js';

const VALUES = { HULL, AREA, SHIP, CELLS, ROWMAX };
const fill = t => t.replace(/\{(\w+)\}/g, (_, k) => VALUES[k] ?? `{${k}}`);
const fmt = x => (Number.isInteger(x) ? String(x) : String(Math.round(x * 100) / 100));

// 航路のメロディの部品は、画面と同じ形の小さな絵で示す
const ICONS = {
  note: '<svg viewBox="0 0 48 40" aria-hidden="true"><path d="M4 26H44" stroke="#23304a" stroke-width="2.5" stroke-linecap="round"/><ellipse cx="22" cy="26" rx="7" ry="5" transform="rotate(-22 22 26)" fill="#23304a"/><path d="M28 24V6q2 7 9 10" fill="none" stroke="#23304a" stroke-width="2.4" stroke-linecap="round"/></svg>',
  port: '<svg viewBox="0 0 48 40" aria-hidden="true"><rect x="6" y="6" width="36" height="20" rx="4" fill="#d6452c" stroke="#5f3b1c" stroke-width="1.5"/><text x="24" y="21" font-size="13" font-weight="700" text-anchor="middle" fill="#fffaf0">港1</text><text x="24" y="38" font-size="11" font-weight="700" text-anchor="middle" fill="#23304a">↑下ろす</text></svg>',
  tag: '<svg viewBox="0 0 48 40" aria-hidden="true"><path d="M16 4H38V36H10V10Z" fill="#fffaf0" stroke="#23304a" stroke-width="1.4"/><text x="24" y="17" font-size="12" font-weight="700" text-anchor="middle" fill="#d6452c">1</text><path d="M13 21H35" stroke="#cdbf9f"/><text x="24" y="33" font-size="13" font-weight="700" text-anchor="middle" fill="#23304a">15</text></svg>'
};

function partLines(it) {
  if (it.kind === 'liquid') return `比重 <b>${fmt(LIQUIDS[it.id].s)}</b>。${it.text}`;
  if (it.kind === 'material') {
    const m = MATERIALS[it.id], sg = m.sg.includes('/') ? m.sg.split('/').reduce((a, b) => a / b) : +m.sg;
    return `比重 <b>${fmt(sg)}</b>、1マスの重さ <b>${fmt(cellWeight(it.id))}</b>。${it.text}`;
  }
  return fill(it.text);
}

export function howtoScreen(ctx) {
  const c = ctx.show(`${ctx.topbar('遊び方と概要')}<div class="guide">${HOWTO.map(sec => `<section class="gsec"><h2>${sec.h}</h2>${sec.p.map(t => `<p>${fill(t)}</p>`).join('')}</section>`).join('')}
    <button class="btn sub" id="gback">表紙へ</button></div>`, 'menu-layout guide-layout');
  ctx.wire(c); c.querySelector('#gback').onclick = () => { ctx.audio.wood(); ctx.title(); };
}

export function partsScreen(ctx) {
  const c = ctx.show(`${ctx.topbar('パーツの説明')}<div class="guide">${PARTS.map(sec => `<section class="gsec"><h2>${sec.h}</h2>${sec.note ? `<p class="gnote">${sec.note}</p>` : ''}
    <div class="gparts">${sec.items.map(it => `<div class="gpart"><div class="gart">${it.icon ? ICONS[it.icon] : `<img src="${GRAPHICS[it.art]}" alt="">`}</div><div><b>${it.name}</b><p>${partLines(it)}</p></div></div>`).join('')}</div></section>`).join('')}
    <button class="btn sub" id="gback">表紙へ</button></div>`, 'menu-layout guide-layout');
  ctx.wire(c); c.querySelector('#gback').onclick = () => { ctx.audio.wood(); ctx.title(); };
}
