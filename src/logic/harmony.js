// クリア時の伴奏（要件7.2の後続）。旋律の音に、Cメジャーの簡単な和音を付ける。
// 旋律はドレミソラの5音だけなので、その音を含む和音を選ぶ。最後の音（空荷のソ）はV、帰着のドはIで、V→Iの終わり方になる。
export const CHORDS = {
  I: [36, 48, 52, 55],    // ド・ミ・ソ（低いドを添える）
  IV: [41, 53, 57, 60],   // ファ・ラ・ド
  V: [43, 47, 50, 55],    // ソ・シ・レ
  vi: [45, 48, 52, 57]    // ラ・ド・ミ
};

// 音（MIDI）と位置から和音の名前。last：空荷の最後の音、home：エウレカで帰着するド
export function chordFor(midi, { last = false, home = false, prev = null } = {}) {
  if (home) return 'I';
  if (last) return 'V';
  switch (((midi % 12) + 12) % 12) {
    case 0: return 'I';               // ド
    case 2: return 'V';               // レ
    case 4: return prev === 'vi' ? 'vi' : 'I';   // ミ
    case 7: return 'I';               // ソ（途中）
    case 9: return prev === 'IV' ? 'IV' : 'vi';  // ラ
    default: return null;             // 音階の外（クリア時には来ない）
  }
}

// 旋律全体の和音の並び（帰着のドを含まない）
export function accompaniment(midis) {
  const out = [];
  midis.forEach((m, i) => out.push(chordFor(m, { last: i === midis.length - 1, prev: out[i - 1] })));
  return out;
}
