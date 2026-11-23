// 連続プレイの章（2026-11-23 発案者の決定）。章ごとに始められ、NGと最高記録も章ごとに数える。
// first・last は面の id。STAGES の並びで、その間の面が章に入る（tests/modes.test.js で、全部の面がちょうど1回ずつ入ることを確かめる）
export const CHAPTERS = [
  { id: 'water', name: '第1章　水の航路', first: 'w1', last: 'w5' },
  { id: 'oil', name: '第2章　油の湖', first: 'o1', last: 'o5' },
  { id: 'mercury', name: '第3章　銀色の湖', first: 'm1', last: 'm5' },
  { id: 'pump', name: '第4章　古い船', first: 'p1', last: 'p5' },
  { id: 'melody', name: '第5章　航路のメロディ', first: 'n0', last: 'n9' },
  { id: 'melody2', name: '第6章　長い航海', first: 'n10', last: 'n14' },
  { id: 'melody3', name: '第7章　油と水銀の歌', first: 'n15', last: 'n24' }
];
// 章の面の位置（STAGES の何番目から何面か）
export function chapterSpan(stages, ch) {
  const a = stages.findIndex(s => s.id === ch.first), b = stages.findIndex(s => s.id === ch.last);
  if (a < 0 || b < a) throw new Error(`章 ${ch.id} の範囲が見つかりません。`);
  return { start: a, count: b - a + 1 };
}
