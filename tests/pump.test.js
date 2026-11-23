import test from 'node:test';
import assert from 'node:assert/strict';
import { pumpRun, pumpPlans, pumpProblem, pumpDepth } from '../src/logic/pump.js';
import { STAGES } from '../src/content/stages.js';
import { CHALLENGES } from '../src/content/challenges.js';

const base = { start: 'water', area: 10, items: [[10, '石']], gates: [{ k: 'shoal', d: 3 }], pump: { per: 5, start: 15, leak: [5], turns: 3 } };

test('スクリュー：船の中の水も重さに数える', () => {
  assert.equal(pumpDepth(base, 15).toNumber(), 3.5);   // 船10＋荷10＋水15＝35
});
test('スクリュー：関門の手前で回して、浅瀬を通る', () => {
  assert.equal(pumpRun(base, [0, 0]).ok, false);         // 水20で深さ4：つかえる
  assert.equal(pumpRun(base, [0, 2]).ok, true);          // 水10で深さ3：通る
  assert.equal(pumpRun(base, [1, 1]).ok, true);          // 港で回しても同じ
  assert.equal(pumpRun(base, [2, 2]).why, 'turns');      // 回せるのは3回まで
});
test('スクリュー：しみ込んで沈めば失敗', () => {
  const s = { ...base, pump: { ...base.pump, start: 30, leak: [5], turns: 5 } };  // 50＋5＝55：沈む
  assert.equal(pumpRun(s, [0, 5]).why, 'sink');
  assert.equal(pumpRun(s, [5, 0]).ok, true);           // 港で先に回せば、沈まず浅瀬も通る
});
test('スクリューの面：公開するお題はすべて解けて、回さないと通れない（C-03）', () => {
  for (const s of STAGES.filter(s => s.pumpQ)) {
    assert.ok(CHALLENGES[s.id].length >= 8, s.id);
    for (const q of CHALLENGES[s.id]) {
      const st = { ...s, ...q };
      assert.equal(pumpProblem(st), null, s.id);
      assert.ok(pumpPlans(st).length > 0, s.id);
    }
  }
});
