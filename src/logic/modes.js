// 連続プレイの決まり（要件7章）。AQUA NOTES の modes.js に合わせる。
// NGは沈没や関門への衝突。上限を超えるとゲームオーバー。記録は端末に保存し、消さない（C-04）。
export const MODES_KEY = 'float-modes-v1';

export const LEVELS = Object.freeze([
  Object.freeze({ id: 'free', name: 'フリー', limit: null, note: '上限なし' }),
  Object.freeze({ id: 'normal', name: 'ノーマル', limit: 10, note: 'NG 10回まで' }),
  Object.freeze({ id: 'expert', name: 'エキスパート', limit: 5, note: 'NG 5回まで' })
]);
export const levelOf = id => LEVELS.find(l => l.id === id) ?? null;

export class ContinuousRun {
  constructor(levelId, stageCount) {
    const level = levelOf(levelId);
    if (!level) throw new Error(`レベル ${levelId} がありません。`);
    this.level = level;
    this.stageCount = stageCount;
    this.position = 0;
    this.cleared = 0;
    this.ng = 0;
    this.over = false;
    this.complete = false;
  }
  get left() { return this.level.limit === null ? null : Math.max(0, this.level.limit - this.ng); }
  // 制限のあるレベルでは、出航まで深さを見せない
  get hidesDepth() { return this.level.limit !== null; }
  // outcome は 'ng' か 'clear'。次にすることを返す：retry、gameover、next、complete
  record(outcome) {
    if (this.over || this.complete) throw new Error('この連続プレイは終わっています。');
    if (outcome === 'ng') {
      this.ng++;
      if (this.level.limit !== null && this.ng > this.level.limit) { this.over = true; return 'gameover'; }
      return 'retry';
    }
    this.cleared++;
    if (this.position + 1 >= this.stageCount) { this.complete = true; return 'complete'; }
    this.position++;
    return 'next';
  }
}

// 記録：レベルごとの最高（クリアした面数）と、見た紙芝居。保存できない端末でも遊べるよう、失敗は無視する
export class ModeBook {
  constructor(storage) {
    this.storage = storage;
    this.data = { best: {}, seen: {} };
    try {
      const saved = JSON.parse(storage?.getItem(MODES_KEY) || 'null');
      if (saved && typeof saved === 'object') this.data = { best: { ...(saved.best ?? {}) }, seen: { ...(saved.seen ?? {}) } };
    } catch { /* 読めないときは記録なしの扱い */ }
  }
  #save() { try { this.storage?.setItem(MODES_KEY, JSON.stringify(this.data)); return true; } catch { return false; } }
  best(levelId) { return this.data.best[levelId] ?? 0; }
  // 低い記録で、以前の最高を消さない
  recordBest(levelId, cleared) {
    if (cleared <= this.best(levelId)) return false;
    this.data.best[levelId] = cleared;
    this.#save();
    return true;
  }
  seen(id) { return !!this.data.seen[id]; }
  markSeen(id) { this.data.seen[id] = 1; this.#save(); }
}
