# FLOAT NOTES：追加ポーズ・優先度2の見本 v1

2026-11-05 / SIKUMI NOTES 03

発案者が採用した[優先度1の絵柄](../2026-11-05-priority1-v1/README.md)を基準にした、今回指定された範囲の見本25枚です。クレヨンの手描きと紙の質感を引き継ぎ、前2作の精霊は使っていません。今回の変更は画像と素材資料だけです。

## 追加ポーズ

| 見習い：器なし | 見習い：驚く | 師匠：測ってごらん |
|---|---|---|
| <img src="01-apprentice-empty-standing.png" width="220" alt="見習い：器を持たない立ち姿"> | <img src="02-apprentice-empty-surprised.png" width="220" alt="見習い：器を持たず驚く"> | <img src="03-archimedes-measure.png" width="220" alt="アルキメデス：指を立てて話す"> |

少年は両手を空けています。師匠は指を1本立てて話す姿です。口は、口ひげの下のひげの中に収めています。

## 序章の紙芝居

王冠の伝承を元にした創作の紙芝居です。語りやセリフを画像に焼き付けず、画面側で扱える形にしています。

### 王の依頼

![王の依頼](04-prologue-royal-request.png)

金細工師は噂を疑われている段階の人物として描いています。

### 工房（採用済みの前回見本）

[師匠が見習いに天秤を示す場面](../2026-11-05-priority1-v1/12-prologue-workshop.png)を引き続き使う想定です。

### 風呂で気づく

![風呂で気づく](05-prologue-bath-discovery.png)

体は湯船と湯気で隠し、湯があふれる様子を見せています。

### エウレカ：2案

| 布あり | 服なし・横長の札と湯気（追加修正版） |
|---|---|
| <img src="06-prologue-eureka.png" width="360" alt="序章：エウレカ"> | <img src="25-prologue-eureka-sign-only.png" width="360" alt="序章：エウレカ別案（服なし・横長札と湯気）"> |

追加修正版は、発案者が示した港のアルキメデスの顔・頭身・指を立てた姿を基準にしています。服を外し、高さを抑えた横長の札と湯気で体を隠しています。札は無地です。

### 港へ向かう

![港へ向かう](07-prologue-harbor.png)

## 船

<img src="08-boat-empty.png" width="720" alt="箱形の船：空荷">

船底と縁が読み取れる、横から見た箱形の空荷の船です。水面線や液体を描き込まず、別の液体素材と重ねる形にしています。

## 荷物8種類と大小比較

![同じ重さの大小比較](17-cargo-equal-mass-comparison.png)

左から、木箱・木の板・麦袋・壺・石・鉄・鉛・金です。同じ重さで、木が大きく金が小さく見える関係を示しています。

単体PNGは共通の1254×1254の画像枠で、透明な余白を含めて大小を比べる見本です。金が最小であることを透過の範囲から確認しています。絵の形による見かけの差があるため、実装時の大きさは要件書の「重さ÷比重」とマスへの丸めに従います。詳しくは[荷物の比重と大きさ](cargo-scale.md)を参照してください。

## 液体

| 水 | 油 | 水銀 |
|---|---|---|
| <img src="18-liquid-water.png" width="240" alt="液体：水"> | <img src="19-liquid-oil.png" width="240" alt="液体：油"> | <img src="20-liquid-mercury.png" width="240" alt="液体：水銀"> |

色に加えて、水は細い波、油は太い帯、水銀は直線的な筋と注意の印で区別しています。

**水銀の湖は架空の設定です。本物の水銀は毒性が強いため、触れないでください。** この注意文は絵の外にあり、画面への組み込み時も読める形で表示してください。

## 関門

| 浅瀬 | 低い橋 |
|---|---|
| <img src="21-obstacle-shoal.png" width="360" alt="関門：浅瀬"> | <img src="22-obstacle-low-bridge.png" width="360" alt="関門：低い橋"> |

| 水中のレバーと門 | 入れ替え室 |
|---|---|
| <img src="23-obstacle-underwater-lever-gate.png" width="360" alt="関門：水中のレバーと門"> | <img src="24-obstacle-exchange-chamber.png" width="360" alt="関門：入れ替え室"> |

関門の周りと、橋の通路・入れ替え室の内部は透過です。液面や深さの条件は絵へ固定せず、画面側で配置します。入れ替え室は、閉じた室内で排出・注入する架空の装置として描いています。

## 原本一覧

| ファイル | 内容 | 大きさ | 背景 |
|---|---|---|---|
| [01-apprentice-empty-standing.png](01-apprentice-empty-standing.png) | 見習い：器を持たない立ち姿 | 1086×1448 | 透過 |
| [02-apprentice-empty-surprised.png](02-apprentice-empty-surprised.png) | 見習い：器を持たず驚く | 1086×1448 | 透過 |
| [03-archimedes-measure.png](03-archimedes-measure.png) | アルキメデス：指を立てて話す | 1086×1448 | 透過 |
| [04-prologue-royal-request.png](04-prologue-royal-request.png) | 序章：王の依頼 | 1448×1086 | 紙の背景 |
| [05-prologue-bath-discovery.png](05-prologue-bath-discovery.png) | 序章：風呂で気づく | 1448×1086 | 紙の背景 |
| [06-prologue-eureka.png](06-prologue-eureka.png) | 序章：エウレカ | 1448×1086 | 紙の背景 |
| [07-prologue-harbor.png](07-prologue-harbor.png) | 序章：港へ向かう | 1448×1086 | 紙の背景 |
| [08-boat-empty.png](08-boat-empty.png) | 箱形の船：空荷 | 1536×1024 | 透過 |
| [09-cargo-wood-crate.png](09-cargo-wood-crate.png) | 木箱 | 1254×1254 | 透過 |
| [10-cargo-wood-plank.png](10-cargo-wood-plank.png) | 木の板 | 1254×1254 | 透過 |
| [11-cargo-grain-sack.png](11-cargo-grain-sack.png) | 麦袋 | 1254×1254 | 透過 |
| [12-cargo-clay-jar.png](12-cargo-clay-jar.png) | 壺 | 1254×1254 | 透過 |
| [13-cargo-stone.png](13-cargo-stone.png) | 石 | 1254×1254 | 透過 |
| [14-cargo-iron.png](14-cargo-iron.png) | 鉄 | 1254×1254 | 透過 |
| [15-cargo-lead.png](15-cargo-lead.png) | 鉛 | 1254×1254 | 透過 |
| [16-cargo-gold.png](16-cargo-gold.png) | 金 | 1254×1254 | 透過 |
| [17-cargo-equal-mass-comparison.png](17-cargo-equal-mass-comparison.png) | 荷物：同じ重さの大小比較 | 2172×724 | 紙の背景 |
| [18-liquid-water.png](18-liquid-water.png) | 液体：水 | 1536×1024 | 透過 |
| [19-liquid-oil.png](19-liquid-oil.png) | 液体：油 | 1536×1024 | 透過 |
| [20-liquid-mercury.png](20-liquid-mercury.png) | 液体：水銀 | 1536×1024 | 透過 |
| [21-obstacle-shoal.png](21-obstacle-shoal.png) | 関門：浅瀬 | 1536×1024 | 透過 |
| [22-obstacle-low-bridge.png](22-obstacle-low-bridge.png) | 関門：低い橋 | 1536×1024 | 透過 |
| [23-obstacle-underwater-lever-gate.png](23-obstacle-underwater-lever-gate.png) | 関門：水中のレバーと門 | 1536×1024 | 透過 |
| [24-obstacle-exchange-chamber.png](24-obstacle-exchange-chamber.png) | 関門：入れ替え室 | 1536×1024 | 透過 |
| [25-prologue-eureka-sign-only.png](25-prologue-eureka-sign-only.png) | 序章：エウレカ別案（服なし・横長札と湯気） | 1448×1086 | 紙の背景 |

原本のPNGをそのまま登録しています（合計約39.9MB）。配信用の軽量化、画面への組み込み、実機での確認は別工程です。

[生成指示](prompts.md) / [寸法・透過・ファイル照合情報](manifest.json) / [素材一覧](../../assets.md)

内蔵 image_gen で生成しました。

