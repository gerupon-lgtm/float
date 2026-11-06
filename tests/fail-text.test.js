import test from 'node:test';
import assert from 'node:assert/strict';
import { hintLevel, shoalText, shallowText, sinkText } from '../src/content/fail-text.js';

test('フリーと選択プレイは答えの数字まで見せる', () => {
  assert.equal(hintLevel(undefined), 'open');
  assert.equal(hintLevel('free'), 'open');
  assert.match(sinkText('open', 60, '水', 50), /重さ50まで/);
  assert.match(shoalText('open', 4.5, 4), /4までにする/);
});
test('ノーマルは今の値まで見せ、目標の値は見せない', () => {
  assert.doesNotMatch(sinkText('normal', 60, '水', 50), /50/);
  assert.match(sinkText('normal', 60, '水', 50), /重さ60/);
  const s = shallowText('normal', 2.5, 3.5, 'bridge');
  assert.match(s, /2\.50/);
  assert.doesNotMatch(s, /3\.5/);
});
test('エキスパートは原因だけで数字を見せない', () => {
  for (const t of [sinkText('expert', 60, '水', 50), shoalText('expert', 4.5, 4), shallowText('expert', 2.5, 3.5, 'lever')]) assert.doesNotMatch(t, /\d/);
});
