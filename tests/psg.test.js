import test from 'node:test';
import assert from 'node:assert/strict';
import { renderDrum, renderAll, SFX_NOTES } from '../src/sound/psg-render.js';

const rate = 48000;
test('すべての打楽器が音になり、範囲に収まる', () => {
  for (const [name, data] of Object.entries(renderAll(rate))) {
    const peak = Math.max(...data.map(Math.abs));
    assert.ok(peak > 0.01 && peak <= 1, name);
  }
});
test('同じ打楽器は同じ音になる', () => assert.deepEqual(renderDrum(SFX_NOTES.hat, rate), renderDrum(SFX_NOTES.hat, rate)));
test('音は最後に消える', () => { const d = renderDrum(SFX_NOTES.snare, rate); assert.equal(Math.abs(d[d.length - 1]), 0); });
test('全部の音を作る時間が短い', () => { const t = performance.now(); renderAll(rate); assert.ok(performance.now() - t < 300); });
