import test from 'node:test';
import assert from 'node:assert/strict';
import { CHORDS, chordFor, accompaniment } from '../src/logic/harmony.js';

const pcs = name => CHORDS[name].map(m => m % 12);
test('旋律の音は、付けた和音の中に含まれる', () => {
  for (const m of [72, 74, 76, 79, 81, 84, 86, 88, 91, 93, 96]) {
    const c = chordFor(m);
    assert.ok(pcs(c).includes(m % 12), `${m} に ${c}`);
  }
});
test('最後の空荷はV、帰着はI（V→Iで終わる）', () => {
  assert.equal(chordFor(91, { last: true }), 'V');
  assert.equal(chordFor(84, { home: true }), 'I');
  const acc = accompaniment([84, 86, 84, 86, 91]);
  assert.equal(acc.at(-1), 'V');
  assert.equal(acc.length, 5);
});
