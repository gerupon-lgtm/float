// 失敗したときの師匠の言葉。連続プレイの難しさに応じて、明かす量を変える（要件7章）。
// フリーと選択プレイは答えの数字まで、ノーマルは今の深さや重さまで、エキスパートは原因だけ。
const f2 = d => d.toFixed(2);

export const hintLevel = levelId => (levelId === 'normal' || levelId === 'expert' ? levelId : 'open');

export function shoalText(level, depth, limit) {
  const head = '沈みすぎて、浅瀬につかえたな。';
  if (level === 'expert') return `${head}<br>どれだけ沈むか、もう一度計算してごらん。`;
  if (level === 'normal') return `${head}<br>深さ${f2(depth)}では通れぬ。荷をどう変えるか考えてごらん。`;
  return `${head}<br>深さ${f2(depth)}では通れぬ。${limit}までにするのだ。`;
}

export function shallowText(level, depth, limit, what) {
  const head = what === 'lever' ? '浅すぎて、レバーに届かぬな。' : '浅すぎて、船の縁が橋に当たったな。';
  const miss = what === 'lever' ? '足りぬ' : '通れぬ';
  if (level === 'expert') return `${head}<br>どれだけ沈むか、もう一度計算してごらん。`;
  if (level === 'normal') return `${head}<br>深さ${f2(depth)}では${miss}。荷をどう変えるか考えてごらん。`;
  return `${head}<br>深さ${f2(depth)}では${miss}。${limit}以上にするのだ。`;
}

export function sinkText(level, weight, liquidName, maxWeight) {
  if (level === 'expert') return '重すぎたな。船が沈んでしまった。<br>船の高さまでに収まるか、式に戻って確かめてごらん。';
  if (level === 'normal') return `重さ${weight}は重すぎたな。船が沈んでしまった。<br>${liquidName}でどこまで積めるか、計算してごらん。`;
  return `重さ${weight}は重すぎたな。船が沈んでしまった。<br>${liquidName}でこの船が運べるのは、重さ${maxWeight}までだ。`;
}
