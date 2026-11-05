import test from 'node:test';
import assert from 'node:assert/strict';
import { ContinuousRun, ModeBook, MODES_KEY } from '../src/logic/modes.js';

test('ノーマルは10回目のNGまで続き、11回目で終わる', () => {
  const r = new ContinuousRun('normal', 3);
  for (let i = 0; i < 10; i++) assert.equal(r.record('ng'), 'retry');
  assert.equal(r.left, 0);
  assert.equal(r.record('ng'), 'gameover');
});
test('エキスパートは6回目のNGで終わる', () => {
  const r = new ContinuousRun('expert', 3);
  for (let i = 0; i < 5; i++) r.record('ng');
  assert.equal(r.record('ng'), 'gameover');
});
test('フリーは上限がなく、深さも見せる', () => {
  const r = new ContinuousRun('free', 2);
  for (let i = 0; i < 50; i++) assert.equal(r.record('ng'), 'retry');
  assert.equal(r.hidesDepth, false);
  assert.equal(new ContinuousRun('normal', 2).hidesDepth, true);
});
test('全面クリア', () => {
  const r = new ContinuousRun('free', 2);
  assert.equal(r.record('clear'), 'next');
  assert.equal(r.record('clear'), 'complete');
  assert.equal(r.cleared, 2);
});
test('低い記録で最高を消さず、保存できなくても動く', () => {
  const m = new Map(), storage = { getItem: k => m.get(k) ?? null, setItem: (k, v) => m.set(k, v) };
  const b = new ModeBook(storage);
  assert.equal(b.recordBest('normal', 5), true);
  assert.equal(b.recordBest('normal', 3), false);
  assert.equal(new ModeBook(storage).best('normal'), 5);
  assert.ok(m.has(MODES_KEY));
  const broken = new ModeBook({ getItem() { throw new Error('x'); }, setItem() { throw new Error('x'); } });
  broken.markSeen('s6');
  assert.equal(broken.seen('s6'), true);
});
