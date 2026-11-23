# 古い船・王の前の旋律と船大工アルキアス

2026-11-23、`docs/request-codex-story-2.md` に対応。公開済みmain `94cf9f4`（v0.9.29）を基準に、mainで作業しました。表示・読込版は **0.9.30** です。

## 絵の一覧

| 原本PNG（すべて1448×1086） | 配信WebP（960×720） | 場面 |
|---|---|---|
| [アルキアスの設定画](00-archias-character.png) | 設定資料のみ | 全身正面寄り・横姿・表情2種 |
| [古い船の浸水](01-chapter-old-ship.png) | `public/graphics/chapter-old-ship.webp` | s13 |
| [スクリューで汲み出す](02-chapter-screw.png) | `public/graphics/chapter-screw.webp` | s14 |
| [嵐の夜](03-chapter-storm.png) | `public/graphics/chapter-storm.webp` | s15・s20 |
| [船大工を迎える](04-chapter-shipwright.png) | `public/graphics/chapter-shipwright.webp` | s16 |
| [直った船](05-chapter-repaired.png) | `public/graphics/chapter-repaired.webp` | s17 |
| [王の前の旋律](06-chapter-finale.png) | `public/graphics/chapter-finale.webp` | s18・s19 |

アルキアスは短い灰色の髪と四角いひげ、日に焼けた腕、赤茶の作業着、青緑の前掛け、木槌と木くずで表しました。師匠の白い長いひげと見分けられる形です。船内の水・汲み上げる筒の入口・船外への吐き出しを描き、修理後は新しい明るい板にそろえています。宮殿は水槽内の模型の船と荷下ろしです。

生成は内蔵image_genへの参照画像付き指示。採用済みのキャラクター基準・港・宮殿を参照しました。新しい文字・台詞・説明・年号・地名の銘板は描き込んでいません。宮殿の音符は絵の記号です。原本はそのまま保持し、配信分だけ縮小・形式変換しています。[生成指示](prompts.md)、[寸法・容量・SHA-256照合情報](manifest.json)。

## 実画面と検査

- [スマホ：浸水](review/phone-s13.png) ／ [汲み出し](review/phone-s14.png) ／ [嵐](review/phone-s15.png)
- [スマホ：船大工](review/phone-s16.png) ／ [修理完了](review/phone-s17.png) ／ [王の前](review/phone-s18.png)
- [横置き：船大工](review/landscape-s16.png) ／ [PC：王の前](review/desktop-s18.png)
- [表示・読み返し・実入口の検査92件](review/local-ui.json) ／ [変更範囲の照合](review/source-boundary.json)
- [スクリュー15・最後のメロディ29の実クリア2件](review/local-outro.json)：章末から新しい絵へ進むことを確認。
- [点検記録](../../reviews/2026-11-23-story-2.md)

読み返しの確認では検査専用ブラウザにs13〜s20の既読を設定しています。クリアによって獲得した既読ではありません。スクリュー1・12の導入と再訪は、新規の検査用保存データから実際の選択プレイの入口を操作しています。物語の本文・順番・初回条件・面・計算・判定・音・保存の実装は変更していません。スマホ実機の見え方と指操作は未確認です。
