import test from 'node:test';
import assert from 'node:assert/strict';
import { depthOf, depthFraction, isSunk, sinkingWeight, clearsShoal, reachesDepth, cellWeight } from '../src/logic/physics.js';

test('沈む深さの固定例（要件5章）', () => {
  assert.equal(depthOf(40, 'water'), 4);
  assert.equal(depthOf(40, 'oil'), 5);
  assert.equal(depthOf(135, 'mercury'), 1);
  assert.equal(depthOf(30, 'water'), 3);
  assert.equal(depthOf(45, 'oil'), 5.625);
});
test('沈みきる重さ', () => {
  assert.equal(sinkingWeight('oil'), 40);
  assert.equal(sinkingWeight('water'), 50);
  assert.equal(sinkingWeight('mercury'), 675);
});
test('ちょうど船の高さなら沈まない。超えると沈む', () => {
  assert.equal(isSunk(40, 'oil'), false);
  assert.equal(isSunk(41, 'oil'), true);
  assert.equal(isSunk(50, 'water'), false);
  assert.equal(isSunk(51, 'water'), true);
  assert.equal(isSunk(675, 'mercury'), false);
  assert.equal(isSunk(676, 'mercury'), true);
});
test('境界の一致は通れる', () => {
  assert.equal(clearsShoal(depthFraction(40, 'water'), 4), true);
  assert.equal(clearsShoal(depthFraction(41, 'water'), 4), false);
  assert.equal(reachesDepth(depthFraction(45, 'water'), 4.5), true);
  assert.equal(reachesDepth(depthFraction(44, 'water'), 4.5), false);
  assert.equal(reachesDepth(depthFraction(405, 'mercury'), 3), true);
  assert.equal(reachesDepth(depthFraction(404, 'mercury'), 3), false);
});
test('重さ0はエラーにする', () => assert.throws(() => depthOf(0, 'water')));
test('素材の1マスの重さ', () => {
  assert.deepEqual(['wood', 'wheat', 'jar', 'stone', 'iron', 'lead', 'gold'].map(cellWeight), [2, 2.8, 4, 10, 32, 44, 76]);
});
