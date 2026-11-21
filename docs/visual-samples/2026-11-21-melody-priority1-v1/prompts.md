# 生成指示：文字なしの看板

2026-11-21。内蔵 image_gen を使用。既存の `public/graphics/boat.webp` を絵柄と色の参照にしました。生成PNGを加工せずコピーしています。

```text
Use case: stylized-concept.
Asset type: FLOAT NOTES educational paper kamishibai game UI, one reusable BLANK wooden sign plaque.
Input image1 is STYLE AND PALETTE reference ONLY: simple childlike wax-crayon wooden barge with thick dark navy outlines, orange/ochre wood and paper tooth. Do not draw a boat.
Create ONE horizontal rectangular blank wooden sign plate, a warm pale honey-yellow face and darker ochre rough wooden rim, thick uneven DARK NAVY crayon outline. Broad uncluttered empty center for changeable Japanese text to be added by software. Slightly imperfect handdrawn corners. Two tiny simple navy nail-head dots near farleft/farright rim are enough detail. Actual sign silhouette width:height about3:1. Draw sign nearly edge-to-edge with small uniform transparent margins, not huge whitespace.
Crayon on textured paper: broad scratchy fills and visible little paper gaps, deliberately naive/childlike, flat graphic. Interior remains opaque pale warm wood, outside true alpha transparency.
NO words, letters, numbers, icons, arrows, objects, ropes, posts, hanging chain, drop shadow, glow, scenery, people, logos, shiny gradients, 3D or photorealistic wood grain. Only the single blank sign plate.
```

航海図・目盛り・港・浅瀬・橋・荷札・合否記号は、変更できる情報を保持するためSVG/HTMLで描いています。小さな船と荷は採用済みの絵の再利用です。

## 0.1.4：荷の棚に使う平らな木の板

内蔵 image_gen の編集モードを使用。`blank-status-board.png` を参照し、太い枠のない背景専用の板を作りました。出力は加工せず `cargo-board-v2.png` へコピーしています。元の看板は保持しています。

```text
Use case: precise-object-edit.
Asset type: background texture for the cargo selection area of FLOAT NOTES, a childlike wax-crayon paper kamishibai educational game.
Edit reference image 1 into a new TALL PORTRAIT plain wooden plank (width:height about 1:3). Preserve the simple child-drawn wax-crayon strokes and paper tooth. This is a flat background board for cards placed ON its broad face.
Change the framed sign plaque into ONE PLAIN FLAT WOODEN PLANK: remove the raised orange rim, remove the heavy navy border, remove all nails. Do not make a picture frame, bevel, golden plaque or recessed center.
The whole surface is the same pale natural TAN / light sandy brown wood, with a few subtle long uneven VERTICAL wood-grain strokes and one small simple wooden knot near the lower third. Use muted warm browns instead of bright yellow/gold. The uninterrupted usable wood face should cover at least 94 percent of the plank width and height. Only a THIN imperfect dark-brown contour at its actual outside edge, about 1 percent of the plank width, is enough. Broad calm center for software-rendered cargo cards. Flat graphic, no perspective or cast shadow.
Make the entire tall rectangle nearly edge-to-edge with tiny uniform 1-2 percent transparent margins. Slightly uneven almost-square corners, no broken or jagged splinters.
No text, letters, numbers, icons, characters, cargo, objects, hardware, posts, ropes, scenery, glow or photographic/3D rendering. True alpha transparency outside the single plank; opaque wood face inside.
This must look like a child drew the wood plank with crayons on paper, not a polished vector or realistic wood photograph.
```
