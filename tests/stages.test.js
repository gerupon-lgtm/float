import test from 'node:test';
import assert from 'node:assert/strict';
import { STAGES } from '../src/content/stages.js';
import { CHALLENGES } from '../src/content/challenges.js';
import { isSolvable, problemOf } from '../src/logic/stage-check.js';
import { melodySolvable } from '../src/logic/melody.js';

for (const s of STAGES) {
  if (s.kind === 'melody') {
    test(`${s.name}のお題はすべて解ける（C-03）`, () => {
      const list = s.generated ? CHALLENGES[s.id] : [s.route];
      if (s.generated) assert.ok(list.length >= 4, `${list.length}問しか作れない`);
      assert.equal(new Set(list.map(q => q.target.join(','))).size, list.length);
      for (const q of list) assert.ok(melodySolvable(q), q.target.join(' '));
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
