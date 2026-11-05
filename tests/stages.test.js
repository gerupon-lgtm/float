import test from 'node:test';
import assert from 'node:assert/strict';
import { STAGES } from '../src/content/stages.js';
import { solutionCount } from '../src/logic/stage-check.js';

for (const s of STAGES) test(`${s.name}は解ける（C-03）`, () => assert.ok(solutionCount(s) > 0));
test('全部積むだけでは水の面は解けない', () => {
  const s = STAGES[0];
  assert.ok(solutionCount(s) < 2 ** s.items.length);
});
