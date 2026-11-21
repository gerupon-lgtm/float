// 「遊び方と概要」「パーツの説明」。文と数値は既存の資料・計算から受け取る。
import { AREA, HULL, SHIP, LIQUIDS, MATERIALS, cellWeight } from '../logic/physics.js';
import { CELLS, ROWMAX } from '../logic/stacking.js';
import { HOWTO, PARTS } from '../content/guide.js';
import { GRAPHICS } from './graphics.js';
import { calculationFigure, gateFigures, melodyPartFigure } from './guide-art.js';

const VALUES = { HULL, AREA, SHIP, CELLS, ROWMAX };
const fill = t => t.replace(/\{(\w+)\}/g, (_, k) => VALUES[k] ?? '{' + k + '}');
const fmt = x => (Number.isInteger(x) ? String(x) : String(Math.round(x * 100) / 100));
const mercuryWarning = HOWTO.find(sec => sec.h === '液体と入れ替え室').p.find(t => t.includes('触れてはいけません'));

function partLines(it) {
  if (it.kind === 'liquid') return '比重 <b>' + fmt(LIQUIDS[it.id].s) + '</b>。' + it.text;
  if (it.kind === 'material') {
    const m = MATERIALS[it.id], sg = m.sg.includes('/') ? m.sg.split('/').reduce((a, b) => a / b) : +m.sg;
    return '比重 <b>' + fmt(sg) + '</b>、1マスの重さ <b>' + fmt(cellWeight(it.id)) + '</b>。' + it.text;
  }
  return fill(it.text);
}

function caution() {
  return '<aside class="guide-caution"><span aria-hidden="true">!</span><p>' + mercuryWarning + '</p></aside>';
}

// 閉じていても危険物の注意は隠さず、開いた本文では元の注意文を強調する。
function section(sec, i, body, warning) {
  return '<section class="guide-section" id="guide-section-' + i + '"><details class="gsec"' + (i === 0 ? ' open' : '') + '>' +
    '<summary><h2>' + sec.h + '</h2><span class="guide-fold" aria-hidden="true"></span></summary>' +
    '<div class="gbody">' + body + '</div></details>' + (warning ? caution() : '') + '</section>';
}

function guideScreen(ctx, title, sections, contents) {
  const links = sections.map((sec, i) => '<button type="button" data-guide-section="' + i + '" aria-controls="guide-section-' + i + '">' + sec.h + '</button>').join('');
  const c = ctx.show(ctx.topbar(title) + '<div class="guide">' +
    '<nav class="guide-index" aria-label="' + title + 'の目次"><h2>目次</h2>' +
    '<button type="button" class="guide-index-toggle" aria-expanded="false" aria-controls="guide-links">目次から探す<span aria-hidden="true">＋</span></button>' +
    '<div class="guide-links" id="guide-links">' + links + '</div></nav>' +
    '<div class="guide-reader" tabindex="0" role="region" aria-label="' + title + 'の本文">' + contents +
    '<button class="btn sub" id="gback">表紙へ</button></div></div>', 'menu-layout guide-layout');
  ctx.wire(c);
  const home = c.querySelector('#home');
  home.textContent = '表紙へ';
  c.querySelector('#gback').onclick = () => { ctx.audio.wood(); ctx.title(); };
  const nav = c.querySelector('.guide-index'), toggle = c.querySelector('.guide-index-toggle'), reader = c.querySelector('.guide-reader');
  toggle.onclick = () => {
    const open = nav.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', String(open));
    toggle.querySelector('span').textContent = open ? '−' : '＋';
  };
  c.querySelectorAll('[data-guide-section]').forEach(button => {
    button.onclick = () => {
      const sec = c.querySelector('#guide-section-' + button.dataset.guideSection);
      sec.querySelector('details').open = true;
      nav.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.querySelector('span').textContent = '＋';
      reader.scrollTop += sec.getBoundingClientRect().top - reader.getBoundingClientRect().top - 8;
      sec.querySelector('summary').focus({ preventScroll: true });
    };
  });
}

export function howtoScreen(ctx) {
  const contents = HOWTO.map((sec, i) => {
    const figure = sec.h === '沈む深さの計算' ? calculationFigure() : sec.h === '関門' ? gateFigures() : '';
    const paragraphs = sec.p.map((t, j) => '<p' +
      (t.includes('触れてはいけません') ? ' class="guide-warning-text"' : sec.h === '沈む深さの計算' && j === 0 ? ' class="guide-formula"' : '') +
      '>' + fill(t) + '</p>').join('');
    return section(sec, i, figure + paragraphs, sec.h === '液体と入れ替え室');
  }).join('');
  guideScreen(ctx, '遊び方と概要', HOWTO, contents);
}

export function partsScreen(ctx) {
  const contents = PARTS.map((sec, i) => {
    const note = sec.note ? '<p class="gnote">' + sec.note + '</p>' : '';
    const items = sec.items.map(it => '<div class="gpart' + (it.id === 'mercury' ? ' gpart-warning' : '') + (it.icon ? ' gpart-melody' : '') + '">' +
      '<div class="gart">' + (it.icon ? melodyPartFigure(it.icon) : '<img src="' + GRAPHICS[it.art] + '" alt="">') +
      '</div><div><h3>' + it.name + '</h3><p>' + partLines(it) + '</p></div></div>').join('');
    return section(sec, i, note + '<div class="gparts">' + items + '</div>', sec.h === '液体');
  }).join('');
  guideScreen(ctx, 'パーツの説明', PARTS, contents);
}
