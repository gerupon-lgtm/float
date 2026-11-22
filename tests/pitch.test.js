import test from 'node:test';
import assert from 'node:assert/strict';
import { midiOf, onScale } from '../src/logic/pitch.js';
import { depthFraction } from '../src/logic/physics.js';

test('深いほど低い', () => { for (let d = 0; d < 5; d += .25) assert.ok(midiOf(d + .25) < midiOf(d)); });
test('目盛りの音', () => { assert.equal(midiOf(0), 96); assert.equal(midiOf(2.5), 84); assert.equal(midiOf(5), 72); assert.equal(midiOf(9), 72); });
test('音階に乗る判定', () => {
  assert.equal(onScale(depthFraction(40, 'oil')), true);
  assert.equal(onScale(depthFraction(45, 'water')), true);
  assert.equal(onScale(depthFraction(42, 'water')), false);
  assert.equal(onScale(depthFraction(60, 'water')), false);
});

test('鳴らす音：一番近い音階の音に寄せ、半端な深さだけ揺らす', async () => {
  const { voiceOf } = await import('../src/logic/pitch.js');
  assert.deepEqual(voiceOf(1), { midi: 91, wobble: false });      // ソ
  assert.deepEqual(voiceOf(1.25), { midi: 88, wobble: true });    // 油の空船：ミに寄せて揺らす
  assert.deepEqual(voiceOf(10 / 135), { midi: 96, wobble: true }); // 水銀の空船：上のドに寄せて揺らす
  assert.deepEqual(voiceOf(5), { midi: 72, wobble: false });
  assert.equal(voiceOf(6).wobble, true);                           // 沈んだ深さ
});
