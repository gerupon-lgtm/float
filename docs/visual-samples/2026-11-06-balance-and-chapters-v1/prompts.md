# 生成指示：序章の天秤・面の紙芝居

2026-11-06。内蔵 image_gen を使用。背景付きの紙芝居PNGを生成・編集し、画像加工はせず最終原本をコピーしました。

## 序章：空気中の天秤

参照画像（入力順）：

1. ../2026-11-05-priority1-v1/12-prologue-workshop.png

```text
Use case: scientific-educational. Asset type: FLOAT NOTES prologue kamishibai, air balance scene.
Input image1 is a STYLE AND OBJECT REFERENCE, not an edit target. Reuse the simple orange/brass balance, yellow THREE-POINT zigzag crown and small plain rectangular gold block from this image. Do not include its characters.
Style/medium: Match the supplied adopted FLOAT NOTES illustrations exactly: childlike simple wax crayon marks on rough off-white paper, dense visible tooth and little gaps in flat fills, thick irregular dark navy outlines, rounded simple shapes and dot eyes, no nose. Naive handmade kamishibai, not polished digital vector, not photoreal, not 3D. Full landscape paper illustration, aspect4:3 around1448x1086. No border, UI, captions, speech balloons, logos, letters or numbers. Narration is handled outside the picture.
Subject: a large traditional equal-arm pan balance standing on an orange wooden laboratory table, seen straight on. LEFT pan holds the intact simple yellow three-point crown. RIGHT pan holds a smaller solid yellow rectangular pure-gold block. Both have equal mass IN AIR. The crossbeam is EXACTLY LEVEL HORIZONTAL. The two identical hanging pans are at EXACTLY THE SAME HEIGHT, same length cords. Crown is visibly larger than the gold block. Show entire stand, center pivot, taut suspension cords, two pans, objects and table. A clear symmetrical simple composition, balance dominates about70 percent of image. Both pans hang freely above tabletop, not resting on anything.
Backdrop: pale mint-green crayon workshop wall, warm orange wooden table, perhaps a small terracotta jar on a wall shelf high at farleft as in the reference, no scene clutter. No water/tank in this air image. No people, hands, arrows, tick marks, scales, labels, numbers, weights or mathematical symbols. NO TEXT whatsoever.
```

## 序章：水中の天秤

参照画像（入力順）：

1. 01-balance-air.png

```text
Use case: precise-object-edit. Asset type: FLOAT NOTES prologue comparison, submerged pan balance.
Input image1 is the EDIT TARGET: the AIR balance just generated. Preserve exact rough childlike crayon paper technique, thick wobbly navy outlines, mint workshop wall, orange table, orange/brass pan balance, LEFT simple3-point yellow crown and RIGHT small rectangular pure-gold block. No people or text.
EDIT: this same balance now has BOTH its identical suspended pans and BOTH objects FULLY SUBMERGED in the SAME DEEP rectangular TRANSPARENT glass tank filled with pale BLUE WATER. Crown side rises from greater buoyancy; LEFT end of beam is HIGHER, RIGHT gold end LOWER. The beam tilts gently upward to left, not level. Pans hang vertically on taut same-length cords. LEFT crown pan is higher than RIGHT gold pan.
MOST IMPORTANT: the ENTIRE crown INCLUDING its highest point and the ENTIRE gold block, AND BOTH entire pan bowls, must be CLEARLY BELOW the SINGLE HORIZONTAL WATER SURFACE. Neither object nor pan crosses or floats on the surface. The upper crown pan is still deeply underwater with a generous visible blue gap ABOVE THE CROWN. Also a visible gap below the lower gold pan before tank floor so it is freely suspended, not resting on bottom.
Composition guide on1448x1086 canvas: central pivot near(720,230); left beam endpoint near(400,170), right endpoint near(1040,290); tank spans roughly x140..1330 from y330..920. Water surface is a strong continuous BLUE HORIZONTAL line at y390. Crown highest point around y480 and LEFT pan around y650. Right gold block around y700 and RIGHT pan around y780. Entire pans and objects inside tank boundary with generous margins. Tabletop should move down near y930 to support tank. Scale center post and fixed base stand in tank, base below both freely hanging pans. Beam and pivot stay ABOVE WATER, cords descend through the waterline. Put pale blue crayon in the water region BEHIND visible yellow objects and orange pans; do not obscure them with opaque dark blue. Front tank wall is clear so all submerged parts show.
Same single mint paper laboratory scene, no cutaway inset, no diagram arrows, no labels, no numbers, no letters, no speech or narration. No second waterline. No bubble pattern obscuring objects. Do NOT leave higher crown in air.
```

### 最終調整

参照画像（入力順）：

1. この場面の前の生成結果（中間案）

```text
Use case: precise-object-edit. Image1 is the EDIT TARGET. Preserve this entire picture exactly: the crayon/paper style, mint wall, orange table, transparent BLUE water tank, single horizontal blue waterline, tilt of balance left end HIGHER and right end LOWER, crown at left, small gold block at right, both entire objects and both entire bowls FULLY UNDERWATER with the blue gap above crown and gap below lower right bowl. Do not move waterline, objects, pans, stand or table.
ONLY FIX THE SUSPENSION CORDS: At present the vertical cords incorrectly appear attached to the crown apex and gold top. Remove these two central vertical cords. Each bowl must instead be suspended by TWO taut dark navy DIAGONAL CORDS forming an upside-down V triangle from its beam endpoint to its TWO BOWL RIM EDGES. Left beam endpoint around(412,188) connects to LEFT bowl rim tips around(260,632) AND(572,632). Right beam endpoint around(1038,286) connects to RIGHT bowl rim tips around(889,693) AND(1191,693). Both strings go around the outside of each object; they do NOT end on the crown or the gold block. Bowls carry objects by their bottoms; do not hang objects directly from tops.
No new props, weights, labels, words, numbers, symbols, arrows or text. No other changes.
```

## 面の紙芝居：荷物の大きさ

参照画像（入力順）：

1. ../2026-11-05-priority2-v1/07-prologue-harbor.png
2. ../2026-11-05-priority2-v2/08-boat-empty.png

```text
Use case: illustration-story. Asset type: FLOAT NOTES chapter kamishibai, cargo size introduction.
Input image1 is the adopted harbor/character/wood crate STYLE REFERENCE. Input image2 is the ADOPTED BOAT GEOMETRY REFERENCE; it is a tall open box barge with width:height about2:1 and a broad orange side. Do not retain any transparent black preview background.
Style/medium: Match the supplied adopted FLOAT NOTES illustrations exactly: childlike simple wax crayon marks on rough off-white paper, dense visible tooth and little gaps in flat fills, thick irregular dark navy outlines, rounded simple shapes and dot eyes, no nose. Naive handmade kamishibai, not polished digital vector, not photoreal, not 3D. Full landscape paper illustration, aspect4:3 around1448x1086. No border, UI, captions, speech balloons, logos, letters or numbers. Narration is handled outside the picture.
Apprentice identity: chestnut brown large broad hair tufts with ONE upright curved forelock, round peach face, dark navy dot eyes, yellow short tunic with RED diagonal sash, bare lower legs, simple brown shoes.
Archimedes identity: bald round peach head, white side hair tufts, connected WHITE moustache and pointed white beard. Any mouth is INSIDE the white beard just beneath moustache, never on bare cheeks. White robe with BLUE diagonal sash, simple brown shoes.
Scene: an ancient Syracuse harbor has just received an absurdly HUGE delivery of wooden cargo. A mountain of many large orange wooden crates with simple diagonal braces, together with conspicuous bundles and stacks of long wooden planks, towers far over the apprentice's head. The many recognizable planks and crates occupy center/right about two-thirds of the picture. The pile is on DRY DOCK STONES, not in water. A few tiny dark metal ingots and a very small plain gold block beside the base make the visual idea of bulky wood and compact metal clear without labels. Do not draw the gold bigger than a crate.
In lower left foreground, the small apprentice looks upward in astonishment with raised hands and open small O mouth; master beside him calmly regards the delivery. Keep both full bodies visible and the apprentice smaller than master. Blue sea peeks behind the cargo, distant simple cream Greek harbor houses, mint sky. A small partly visible empty adopted box barge moored at the right edge helps identify delivery harbor, do not let it dominate or hide the wooden planks. No modern forklift/truck or delivery staff needed.
Big uncomplicated childlike shapes, readable at phone size. No words, signs, numbers, speech balloons or question marks.
```

## 面の紙芝居：油の湖と入れ替え室

参照画像（入力順）：

1. ../2026-11-05-priority2-v1/07-prologue-harbor.png
2. ../2026-11-05-priority2-v1/24-obstacle-exchange-chamber.png
3. ../2026-11-05-priority2-v1/19-liquid-oil.png
4. ../2026-11-05-priority2-v2/08-boat-empty.png

```text
Use case: illustration-story. Asset type: FLOAT NOTES chapter kamishibai, oil lake and fictional liquid exchange chamber.
Input image1: STYLE and character reference. Image2: adopted exchange chamber STRUCTURE reference (gray U-bottom basin, TWO separate wooden gates, red valve, separate inlet and drain). Image3: oil COLOR/PATTERN reference (ochre-yellow with broad smooth wavy stripes). Image4: adopted tall BOX BARGE GEOMETRY.
Style/medium: Match the supplied adopted FLOAT NOTES illustrations exactly: childlike simple wax crayon marks on rough off-white paper, dense visible tooth and little gaps in flat fills, thick irregular dark navy outlines, rounded simple shapes and dot eyes, no nose. Naive handmade kamishibai, not polished digital vector, not photoreal, not 3D. Full landscape paper illustration, aspect4:3 around1448x1086. No border, UI, captions, speech balloons, logos, letters or numbers. Narration is handled outside the picture.
Apprentice identity: chestnut brown large broad hair tufts with ONE upright curved forelock, round peach face, dark navy dot eyes, yellow short tunic with RED diagonal sash, bare lower legs, simple brown shoes.
Archimedes identity: bald round peach head, white side hair tufts, connected WHITE moustache and pointed white beard. Any mouth is INSIDE the white beard just beneath moustache, never on bare cheeks. White robe with BLUE diagonal sash, simple brown shoes.
Composition: a single coherent broad SIDE-CUTAWAY harbor scene. The blue water approach is at LEFT, an isolated liquid-exchange chamber is CENTER, a broad ochre-yellow OIL LAKE extends RIGHT. Blue water and yellow oil MUST BE SEPARATED by solid gray walls and two full-depth CLOSED wooden gates. Do not show a simple boundary where blue and yellow liquids freely meet. This is NOT an ordinary water-level lock: liquid is exchanged using a visible upper inlet pipe with a red handwheel and separate lower drain pipe, not by raising water level. Keep liquid surfaces at roughly the same height.
In the chamber a small orange open box cargo boat (about2:1 hull) carrying just two modest crates floats IN AMBER OIL with a modest amount of hull below liquid line; boat remains safely afloat. Its hull/objects must not overlap gate structure ambiguously. Leave boat fully visible, interior vessel between two closed gates. Drawing uses a cutaway front basin so boat and liquid level can be read.
Master and apprentice stand on a DRY raised stone control platform at upperleft/behind gate; master indicates the red handwheel, boy observes thoughtfully. No one touching liquid. Beige land and muted mint sky, simple ancient setting, no modern industrial realism.
Clearly distinguish blue water's thin small ripples from amber oil's broad slow waves. No arrows, labels, words, bubbles of text, numbers, ruler markings, letters, signs or UI.
```

## 面の紙芝居：銀色の湖

参照画像（入力順）：

1. ../2026-11-05-priority2-v1/07-prologue-harbor.png
2. ../2026-11-05-priority2-v2/08-boat-empty.png
3. ../2026-11-05-priority2-v1/20-liquid-mercury.png
4. ../2026-11-05-priority2-v1/02-apprentice-empty-surprised.png

```text
Use case: illustration-story. Asset type: FLOAT NOTES chapter kamishibai, fictional hazardous silver mercury lake.
Input image1: adopted STYLE and character reference. Image2: adopted deep box barge GEOMETRY (broad tall side, roughly2:1). Image3: mercury surface PATTERN reference, gray horizontal streaks and hazard triangle. Image4: apprentice SHOCKED POSE/identity reference.
Style/medium: Match the supplied adopted FLOAT NOTES illustrations exactly: childlike simple wax crayon marks on rough off-white paper, dense visible tooth and little gaps in flat fills, thick irregular dark navy outlines, rounded simple shapes and dot eyes, no nose. Naive handmade kamishibai, not polished digital vector, not photoreal, not 3D. Full landscape paper illustration, aspect4:3 around1448x1086. No border, UI, captions, speech balloons, logos, letters or numbers. Narration is handled outside the picture.
Apprentice identity: chestnut brown large broad hair tufts with ONE upright curved forelock, round peach face, dark navy dot eyes, yellow short tunic with RED diagonal sash, bare lower legs, simple brown shoes.
Archimedes identity: bald round peach head, white side hair tufts, connected WHITE moustache and pointed white beard. Any mouth is INSIDE the white beard just beneath moustache, never on bare cheeks. White robe with BLUE diagonal sash, simple brown shoes.
Story: the apprentice is AMAZED that a boat with a mountain of cargo is hardly sinking into a heavy SILVER-GRAY liquid. Show one huge orange rectangular box barge on right, LOADED HIGH with crates, long wood plank bundles, grain sack, jars, chunky dark iron/lead bars and a few tiny gold blocks. Cargo mountain is taller than hull but stable and centered; ship remains LEVEL.
Critical buoyancy: about85-90 percent of the tall orange hull side remains ABOVE the flat silver surface. ONLY the BOTTOM10-15 percent touches/is below the liquid. The hull bottom visibly contacts and displaces the liquid, boat is not levitating. No flooding, no sinking bow, no waterline near the top. Give side of hull enough height to see how little is submerged.
At LEFT the apprentice stands entirely on a raised DRY STONE SHORE behind a simple protective railing, both hands recoiling near chest/raised in surprise, dot eyes widened and small O mouth, NO smile. Master also on dry land beside him, cautious serious expression and hands away from lake. Nobody riding the boat, nobody touching liquid.
Mercury is a clearly FICTIONAL, closed-off barren silver basin, NOT a recreational lake: dull cold gray/silver surface with dark straight streaks and heavy matte metallic sheen, muted slate sky and barren gray rock bank. One plain yellow triangular hazard plaque on the shore railing with a simple navy exclamation ICON only. NO letters or explanation burned into image. Safety caption will be displayed outside the image.
Absolutely no glittering treasure-lake glamour, sparkle stars, magical spirits, fairies, bathing, swimming, splashes, playful poses, festive decoration, cheerful fishing or skin contact. Keep adopted simple children's crayon aesthetic without making mercury safe or fun.
```

### 最終調整

参照画像（入力順）：

1. この場面の前の生成結果（中間案）
2. ../2026-11-05-priority2-v2/08-boat-empty.png

```text
Use case: precise-object-edit. Input1 is the EDIT TARGET silver-lake scene. Input2 is the ADOPTED BOAT GEOMETRY reference (transparent background is only preview, do not copy black backdrop). Keep input1's grainy simple crayon on paper, muted dangerous silver lake, gray sky, barren rocks, same shocked apprentice in yellow/red and cautious white-bearded master in white/blue standing on DRY stone shore, no contact with liquid, no smiles; all existing cargo kinds and dull gray streaks.
Primary change ONLY THE BOAT GEOMETRY and its connected cargo position: Replace its thin shallow orange hull with the SAME DEEP BOX BARGE as input2, the boat's width:height about2:1. Keep it on right and fully visible. For1448x1086 canvas aim the hull silhouette about x600..1410 wide810px, from top rim near y440 to flat bottom near y845 high405px. Broad tall largely plain near orange side, navy thick wobbly outline, open cargo rim, slight view of top. Reposition cargo UPWARD onto this rim; the cargo mountain still towers ABOVE the hull with crates/planks/sack/jars/heavy metal bars/tiny gold. Keep cargo within top image edge.
Very important: loaded ship remains LEVEL and floating EXTREMELY HIGH; local SILVER waterline at hull near y815 so only lowest30-45px of deep hull submerged, the tall side mostly dry above liquid. NOT sinking, NOT flooding, NOT levitating; bottom contacts/displaces lake. Silver foreground liquid wraps around only the base. Keep all of the hull and cargo within image bounds without covering people.
The plain caution triangle remains on dry shore, no words or labels. No fun/sparkles/swimming/splashes or direct contact. Do not add narration or UI.
```

