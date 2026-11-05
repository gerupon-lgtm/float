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
