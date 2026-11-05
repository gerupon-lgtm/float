# 作業指示（フロート・ノーツ / FLOAT NOTES）

荷物を積んだ船の沈む深さを計算で予想する、SIKUMI NOTES 03のパズル。

## 読む順序

1. `要件定義書_FLOAT_NOTES.md`（0章の変更区分を最初に読む）
2. 絵とUIの担当は `docs/request-codex-visual.md`

## 技術

- JavaScript（ES modules、追加のライブラリなし）、盤面はSVG、音は Web Audio、PWA
- 判定は分数（`src/logic/fraction.js`）。浮動小数点は描画と発音の直前だけ
- 計算は `src/logic`、面と語りは `src/content`、画面は `src/ui`
- 公開用の自動配信は未設定。公開時期が決まってから用意する

## 変更の扱い

要件定義書0章に従う。配置や文言など（A）は発案者の指示ですぐ変える。旧記載との不一致だけで指示を拒否しない。C区分だけは、改訂内容の合意後に変える。

## 版

`package.json` の version と `src/ui/app.js` の `APP_VERSION` を同じ値にする。ビルドが一致を検査する。

## 共同作業

Claude と Codex は同じリポジトリを使う。作業の開始と終了は発案者が伝え、同時に変更しない。コミットは自分が変えたファイルを名指しで add する。
