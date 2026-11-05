# 生成指示：船・低い橋 v2

- 日付：2026-11-05
- 方法：内蔵 image_gen（CLI/APIへの切替なし）
- 種類：precise-object-edit
- 背景：透過。生成されたPNGを加工せずコピー
- 編集元：採用済みの `../2026-11-05-priority2-v1/08-boat-empty.png` と `22-obstacle-low-bridge.png`

## 船：初回の編集指示

```text
Use case: precise-object-edit.
Asset type: FLOAT NOTES empty cargo barge sprite, transparent PNG.
Input image 1 is the EDIT TARGET: approved 08-boat-empty crayon artwork. Keep its childlike wax crayon on rough paper treatment, thick wobbly dark navy outline, honey-orange wood and simple box-shaped open flat-bottom barge. Change only geometry needed below.
PRIMARY CHANGE: The BOAT ITSELF (opaque silhouette, ignoring canvas margins) must have WIDTH : HEIGHT very close to 2 : 1, rather than the very thin original. Make it a deeper, taller rectangular wooden cargo barge. For a 1536x1024 canvas, aim boat silhouette from x=110 to1425, y=175 to835 (about1315x660). This ratio is for the whole hull including visible opening, not canvas.
Composition: near orthographic SIDE VIEW with just a slight downward look so an empty horizontal open cargo well is visible on top. Top opening only about 100-130 px tall; the LARGE NEAR SIDE of hull is about500px tall, broad and largely uncluttered for a SOFTWARE depth ruler overlay. Broad flat horizontal bottom, nearly vertical ends. The high front side is a big warm orange rectangular panel; a few understated wood crayon strokes at edges allowed, but do not fill it with dark cross braces or heavy plank dividers. Empty top well and rim clearly visible; no cargo.
No water, waves, waterline, boat reflection, shadow, glow, horizon, shore, rope, people, labels, numbers, ruler marks or explanatory text.
Background: ACTUAL transparent alpha outside the hull, not a painted checkerboard or white sheet. Inside wooden opening is brown wood, not a transparent hole. Paper tooth belongs inside the drawing only. Keep full boat with modest clear margins. Child's handmade flat game art, not realistic, not 3D/rendered, no glossy shading.
```

## 船：高さの再調整

初回の外形が約2.39:1だったため、次の指示で調整しました。結果は約2.20:1でした。

```text
Use case: precise-object-edit. Input image 1 is the edit target: the deep orange crayon barge. Preserve exact childlike crayon grain, dark navy thick hand-drawn outlines, orange wood color, single open cargo well, slight top-down side view, flat bottom and uncluttered near side. Transparent background.
ONE GEOMETRIC CORRECTION ONLY: the opaque hull is currently about2.4 times as wide as tall. DEEPEN ITS LARGE NEAR SIDE BY ANOTHER20 PERCENT so total hull silhouette WIDTH:HEIGHT is 2:1. This is NOT the canvas ratio. Full object must measure roughly1400px wide by700px tall on1536x1024 canvas. Top of opening near y160, rim front near y350, bottom of hull near y860. Side wall is a very tall broad rectangular plain orange area for a software depth ruler. Boat upper well stays empty and visible. No ruler, ticks, labels or text. Do not add plank seams, cargo, water, scenery, ropes, shadows or glows. Keep paper texture only within the opaque crayon drawing, actual alpha transparency everywhere else. Entire hull fits within image.
```

## 船：最終調整

前の生成結果を編集元とし、横幅だけを詰めるよう指示しました。最終外形は約2.08:1です。

```text
Use case: precise-object-edit. This approved-style crayon sprite is the edit target. Make one change only: NARROW the BOAT by about10 percent while keeping its height unchanged, so the hull itself has width:height exactly about2:1. Current hull looks2.2:1. On the1536x1024 canvas target the OUTER BOAT SILHOUETTE at x130..1405, y195..835: width1275, height640. Keep its full height. It will have slightly larger transparent left and right margins. Preserve broad plain orange side panel, large empty brown opening at top, bright orange rim, flat bottom, navy thick handdrawn outlines, grainy wax crayon on rough paper. No horizontal dividing lines in the tall side. No water, shadows, glow, cargo, labels, ruler, marks or extra objects. Background remains true alpha transparent. Do not change viewpoint or make top opening dominate. The silhouette including the opening must be 2:1; canvas ratio irrelevant.
```

## 低い橋

```text
Use case: precise-object-edit.
Asset type: FLOAT NOTES low bridge obstacle sprite, transparent PNG.
Input image 1 is the EDIT TARGET: approved 22-obstacle-low-bridge. Preserve its simple childlike wax crayon on rough paper, thick wobbly dark navy outlines and honey-orange wooden planks. REMOVE the two gray bridge piers completely. Change to a bridge SUSPENDED FROM ABOVE. Do not retain any support below the deck.
Required geometry: The game is a SIDE VIEW and the boat moves horizontally LEFT TO RIGHT UNDER the low bridge. A long simple horizontal wooden deck spans most of the image, with a straight horizontal underside. Two chunky brown rope hangers attach near the deck's left and right ends and rise vertically UPWARD to continue beyond the top image edge (intentional offscreen overhead anchors). The bridge is held ONLY by these ropes above it. Simple construction, no extra scenic objects. Upper deck surface can be seen slightly, matching original wooden drawing.
MOST IMPORTANT: below the flat underside of the bridge there must be a continuous EMPTY TRANSPARENT horizontal passage all the way from the left image edge to the right image edge. Absolutely NO piers, posts, stones, banks, legs, chains, ropes or diagonal braces below the wooden deck. Entire lower half of canvas is true alpha=0, enabling a boat to enter from left and exit on right. Hangers extend only above the bridge. This is NOT an arch with pillars at its sides.
Composition: wide1536x1024 canvas, deck around y=380-510, short visible suspension rope parts from top to deck. Lots of transparent space under the deck. No floor, water, waterline, boat, cargo, arrows, labels, explanatory text, ruler, shadow, glow or painted background.
Actual transparent alpha background; crayon paper tooth only inside the wood/rope drawing. Keep approved rough crayon simplicity, not photorealistic, not glossy or rendered.
```
