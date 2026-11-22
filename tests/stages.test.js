import test from 'node:test';
import assert from 'node:assert/strict';
import { STAGES } from '../src/content/stages.js';
import { CHALLENGES } from '../src/content/challenges.js';
import { isSolvable, problemOf } from '../src/logic/stage-check.js';
import { melodySolvable, placementStats, answerIds } from '../src/logic/melody.js';

for (const s of STAGES) {
  if (s.kind === 'melody') {
    test(`${s.name}のお題はすべて解ける（C-03）`, () => {
      const list = s.generated ? CHALLENGES[s.id] : [s.route];
      if (s.generated) assert.ok(list.length >= 4, `${list.length}問しか作れない`);
      assert.equal(new Set(list.map(q => q.target.join(','))).size, list.length);
      for (const q of list) assert.ok(melodySolvable(q), q.target.join(' '));
      // 橋のある面は、置き方を考えないと橋に当たる（置き方の1/4以上が当たる）
      if (s.melody?.gates?.includes('bridge')) for (const q of list) {
        const st = placementStats(q, q.items, answerIds(q));
        assert.ok(st.bridge / st.all >= 0.25, `${q.target.join(' ')} は置き方が効かない`);
      }
    });
    continue;
  }
  if (!s.generated) { test(`${s.name}は解ける（C-03）`, () => assert.ok(isSolvable(s))); continue; }
  test(`${s.name}の問題はすべて検査に合格する（C-03）`, () => {
    const list = CHALLENGES[s.id];
    assert.ok(list.length >= 4, `${list.length}問しか作れない`);
    assert.equal(new Set(list.map(q => JSON.stringify(q))).size, list.length);
    for (const q of list) assert.equal(problemOf({ ...s, ...q }), null);
  });
}

test('油・水銀・積み方の面も、答えの深さが音階に乗る', async () => {
  const { depthFraction } = await import('../src/logic/physics.js');
  const { onScale } = await import('../src/logic/pitch.js');
  const { finalLiquid, totalWeight } = await import('../src/logic/stage-check.js');
  for (const s of STAGES.filter(s => s.grid)) for (const p of CHALLENGES[s.id]) {
    const st = { ...s, ...p };
    assert.ok(onScale(depthFraction(totalWeight(st.items, st.items.map((_, i) => i)), finalLiquid(st), st.area)), s.id);
  }
});
