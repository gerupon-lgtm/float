import test from 'node:test';
import assert from 'node:assert/strict';
import { STAGES } from '../src/content/stages.js';
import { structureOf, simulate, greedyPlacement, depthOfH, autoDrop, rowsUnderBridge } from '../src/logic/melody.js';

const tut = STAGES.find(s => s.id === 'n0').route;

test('お題の並びから、出航時の荷と港の動きが1通りに決まる', () => {
  const st = structureOf([8, 7, 9, 7, 5, 2]);
  assert.deepEqual(st.init, [15, 10, 5]);   // 下から上
  assert.deepEqual(st.ports.map(p => p.k), ['down', 'load', 'down', 'down', 'down']);
  assert.equal(st.ports[1].w, 10);
});
test('成り立たない並び（積んだ荷と違う重さで下ろす、最後が空荷でない）は null', () => {
  assert.equal(structureOf([6, 8, 5, 2]), null);
  assert.equal(structureOf([6, 4, 3]), null);
});
test('練習：石を下・麦袋を上ならお題どおり', () => {
  const placed = greedyPlacement(tut.items, [0, 1]);
  const r = simulate(tut, tut.items, placed);
  assert.ok(r.ok);
  assert.deepEqual(r.log.map(d => d.toNumber()), [2.5, 2, 2.5, 2, 1]);
});
test('練習：積む順を逆にすると、港は回れてもメロディが違う', () => {
  const r = simulate(tut, tut.items, greedyPlacement(tut.items, [1, 0]));
  assert.equal(r.fault, null);
  assert.equal(r.ok, false);
  assert.deepEqual(r.match, [true, false, false, false, true]);
});
test('荷が残る・荷が足りないときは理由を返す', () => {
  assert.equal(simulate(tut, tut.items, greedyPlacement(tut.items, [0])).fault, 'empty');
});
test('港で積む荷は一番低い位置、同じ高さなら左へ置く', () => {
  const items = [[15, '壺', 2, 2], [10, '石', 1, 1]];
  assert.deepEqual(autoDrop([{ id: 0, c: 0, r: 0 }], items, 1), { id: 1, c: 2, r: 0 });
});
test('深さと h', () => {
  assert.equal(depthOfH(7).toNumber(), 3.5);
  assert.equal(rowsUnderBridge(2.5), 3);
});

test('液体ごとの船：どの航路でも空荷は深さ1（ソ）、音1つ分は深さ0.5', async () => {
  const { MELODY_LIQUIDS } = await import('../src/logic/melody.js');
  const { depthFraction } = await import('../src/logic/physics.js');
  for (const env of Object.values(MELODY_LIQUIDS)) {
    assert.equal(depthFraction(env.ship, env.liq, env.area).toNumber(), 1, env.liq);
    assert.equal(depthFraction(env.ship + env.step, env.liq, env.area).toNumber(), 1.5, env.liq);
  }
});
