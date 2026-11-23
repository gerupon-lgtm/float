import test from 'node:test';
import assert from 'node:assert/strict';
import { dropCargo, stackRows, pileClearsBridge } from '../src/logic/stacking.js';
import { depthFraction } from '../src/logic/physics.js';

const items = [[8, '木箱', 2, 2], [8, '木箱', 2, 2], [6, '木の板', 3, 1], [10, '石', 1, 1]];
const place = (seq) => seq.reduce((a, [id, c]) => { const p = dropCargo(a, items, id, c); assert.ok(p); return [...a, p]; }, []);

test('荷は下の荷の上で止まる', () => { const a = place([[2, 0], [0, 0]]); assert.equal(a[1].r, 1); assert.equal(stackRows(a, items), 3); });
test('幅に収まるよう列を寄せる', () => assert.equal(dropCargo([], items, 2, 5).c, 3));
test('高さの上限を超えると置けない', () => { const a = place([[2, 0], [3, 0], [0, 0], [1, 0]]); assert.equal(stackRows(a, items), 6); assert.equal(dropCargo(a, items, 3, 0), null); });
test('積み方の面：悪い積み方は橋に当たり、良い積み方は通る', () => {
  const d = depthFraction(42, 'water');
  assert.equal(pileClearsBridge(d, 3, 6), false);
  assert.equal(pileClearsBridge(d, 3, 3), true);
});

test('荷の山の印：船底の深さ−荷の山の分が橋の深さ以上なら、荷の山も橋を通る', async () => {
  const { pileClearsBridge, pileExtra } = await import('../src/logic/stacking.js');
  const { exact } = await import('../src/logic/physics.js');
  for (const rows of [0, 1, 2, 3, 4, 5, 6]) for (const dd of [2, 3, 3.5, 4, 4.5, 5]) for (const limit of [1.5, 2, 2.5, 3, 3.5, 4]) {
    const d = exact(dd), extra = pileExtra(rows);
    const byMark = d.sub(extra).cmp(exact(limit)) >= 0;
    assert.equal(byMark, pileClearsBridge(d, limit, rows), `rows${rows} d${dd} limit${limit}`);
  }
});
