# 生成指示と参照画像（2026-11-23）

内蔵 image_gen を使用。すべて参照画像付き・背景あり。参照画像は絵柄と人物の同一性の基準で、新しい構図を生成しています。文字は描き込みません。選択したPNG原本は生成後にコピーし、配信6枚だけPillowで960×720へ縮小、WebP（quality=90、method=6）へ形式変換しています。描き足しや切り抜きはしていません。

## 00-archias-character

参照画像（順番どおり）：

- `docs/reference/character-sheet-2026-11-05.png`
- `public/graphics/prologue-harbor.webp`

生成ツールへ渡した全文：

```text
FLOAT NOTES original game illustration. Match the supplied approved references closely: deliberately simple childlike wax-crayon drawing on textured paper, rough thick uneven dark navy outlines, big flat silhouettes, visible wax hatching and small white paper gaps, dot eyes, very simple mitten hands, warm flat colors. No polished watercolor, no realistic rendering, no gradients, no anime detailing, no spirits. Keep all characters recognizably the same as references. Archimedes: bald peach head with two white side hair puffs, white moustache and long pointed white beard, white robe with bright blue diagonal sash/sleeves, brown sandals. Any mouth opening must be inside beard immediately under moustache, never drawn on bare face above beard. Apprentice: young boy with tousled chestnut spiky hair and high cowlick, yellow sleeveless tunic, red diagonal sash, brown sandals. No written words, no captions, no numbers, no logos, no border. Create one coherent CHARACTER DESIGN SHEET for new original shipwright ARCHIAS, on light cream textured paper, landscape 4:3. A large clear full-body front three-quarter standing figure at left, a smaller side standing figure at upper right, two simple bust expressions below right (assessing damaged planks thoughtfully, warm pleased smile). No labels or text. Older stocky but nimble craftsman with square face, deeply sun-tanned skin especially bare forearms, short curly grey hair, thick grey eyebrows, short squared salt-and-pepper beard and moustache, dot eyes, simple friendly presence. Distinct from bald long-bearded Archimedes and brown-haired goldsmith. Faded terracotta short sleeved knee-length work tunic, dark muted teal work apron tied at waist, brown sandals, a few pale curled wood shavings caught on apron. A small wooden mallet held down in one hand, a wooden carpenter's square tucked in apron, no threatening pose. Same stubby 2.5-head proportions and naive simple linework as approved characters. Flat spare sheet, only these views of the SAME character, plenty of paper space.
```

## 01-chapter-old-ship

参照画像（順番どおり）：

- `public/graphics/prologue-harbor.webp`
- `docs/reference/character-sheet-2026-11-05.png`

生成ツールへ渡した全文：

```text
FLOAT NOTES original game illustration. Match the supplied approved references closely: deliberately simple childlike wax-crayon drawing on textured paper, rough thick uneven dark navy outlines, big flat silhouettes, visible wax hatching and small white paper gaps, dot eyes, very simple mitten hands, warm flat colors. No polished watercolor, no realistic rendering, no gradients, no anime detailing, no spirits. Keep all characters recognizably the same as references. Archimedes: bald peach head with two white side hair puffs, white moustache and long pointed white beard, white robe with bright blue diagonal sash/sleeves, brown sandals. Any mouth opening must be inside beard immediately under moustache, never drawn on bare face above beard. Apprentice: young boy with tousled chestnut spiky hair and high cowlick, yellow sleeveless tunic, red diagonal sash, brown sandals. No written words, no captions, no numbers, no logos, no border. Create a new single 4:3 landscape kamishibai story panel, 1448x1086 target. Sunny harbor, the SAME orange-brown open rectangular box barge as reference, visibly old worn uneven wooden planks. Boat fills lower two-thirds seen from a slightly elevated side angle so the broad hull side AND interior floor are clearly visible. Teacher Archimedes standing calmly near stern at left inside boat; apprentice boy inside boat center-right, hands lifted in surprise, small round shocked mouth, looking DOWN at water on the floor. Very clear shallow blue pool on the INSIDE floor, two little blue jets seeping through gaps/cracks between bottom boards, NOT just sea beside hull. Sea around boat blue, small distant cream harbor houses, mint sky. A few old wooden crates at stern. Focus on the visible leak inside boat and boy's surprise. No pump yet. No sinking catastrophe, no slapstick splashing at faces. Complete scene edge to edge, keep faces and main action comfortably within frame.
```

## 02-chapter-screw

参照画像（順番どおり）：

- `public/graphics/prologue-harbor.webp`
- `docs/reference/character-sheet-2026-11-05.png`

生成ツールへ渡した全文：

```text
FLOAT NOTES original game illustration. Match the supplied approved references closely: deliberately simple childlike wax-crayon drawing on textured paper, rough thick uneven dark navy outlines, big flat silhouettes, visible wax hatching and small white paper gaps, dot eyes, very simple mitten hands, warm flat colors. No polished watercolor, no realistic rendering, no gradients, no anime detailing, no spirits. Keep all characters recognizably the same as references. Archimedes: bald peach head with two white side hair puffs, white moustache and long pointed white beard, white robe with bright blue diagonal sash/sleeves, brown sandals. Any mouth opening must be inside beard immediately under moustache, never drawn on bare face above beard. Apprentice: young boy with tousled chestnut spiky hair and high cowlick, yellow sleeveless tunic, red diagonal sash, brown sandals. No written words, no captions, no numbers, no logos, no border. Create a new single 4:3 landscape kamishibai story panel, 1448x1086 target. Daytime beside harbor, the SAME worn orange-brown open rectangular wooden barge filling lower two-thirds, elevated side view clearly shows interior bottom with a shallow blue pool. Archimedes on left carefully steadies/fastens a primitive ARCHIMEDES SCREW PUMP to the gunwale; apprentice boy near center-right actively turns its wooden crank with both hands, looking interested. Mechanism must read clearly: ONE long diagonal cylindrical wooden trough/tube, lower LEFT intake down IN the blue bilge water on floor, rising to upper RIGHT outlet over the SIDE of the boat. Visible spiral flights within a simple cutaway opening, central shaft, a clear crank above near upper end. A small continuous blue stream pours from raised open outlet OVER GUNWALE outward into the surrounding sea; do not pour it back inside boat. Pump is a simple ancient wooden device not modern plumbing, no metal motor. A couple wood braces clamp tube to gunwale. Sea and mint sky, simple cream harbor houses far away. Entire teacher, boy, pump intake and water outlet clearly within frame, uncomplicated diagram-like visual storytelling without labels.
```

## 03-chapter-storm

参照画像（順番どおり）：

- `docs/visual-samples/2026-11-23-story-2/02-chapter-screw.png`
- `docs/visual-samples/2026-11-23-story-2/01-chapter-old-ship.png`

生成ツールへ渡した全文：

```text
FLOAT NOTES original game illustration. Match the supplied approved references closely: deliberately simple childlike wax-crayon drawing on textured paper, rough thick uneven dark navy outlines, big flat silhouettes, visible wax hatching and small white paper gaps, dot eyes, very simple mitten hands, warm flat colors. No polished watercolor, no realistic rendering, no gradients, no anime detailing, no spirits. Keep all characters recognizably the same as references. Archimedes: bald peach head with two white side hair puffs, white moustache and long pointed white beard, white robe with bright blue diagonal sash/sleeves, brown sandals. Any mouth opening must be inside beard immediately under moustache, never drawn on bare face above beard. Apprentice: young boy with tousled chestnut spiky hair and high cowlick, yellow sleeveless tunic, red diagonal sash, brown sandals. No written words, no captions, no numbers, no logos, no border. Create ONE new 4:3 landscape 1448x1086 story panel, SAME boy, teacher, battered open wooden boat and diagonal screw pump from first reference, NOW a stormy night at sea. Navy-violet crayon sky, grey rolling clouds, diagonal rain strokes, teal-blue waves hitting hull, pale moon partly hidden. Interior boat clearly visible from above side, bottom worn cracked planks and blue bilge puddle with two small leak ripples. Boy braces his feet INSIDE boat and keeps turning the single crank of the diagonal wooden screw with both hands, concerned determined face, not smiling. Archimedes stands beside him, one hand to beard, gazing thoughtfully down at the bilge water. Pump lower left inlet immersed in bilge puddle, spiral rises to right outlet over gunwale, blue stream pours OUTSIDE boat. Boat damaged but intact and everyone safe. Keep it a very simple child-drawn crayon story, readable figures against sky, not realistic dangerous disaster, no lightning touching people, no new props. Full pump and two heads within frame. No text or labels.
```

## 04-chapter-shipwright

参照画像（順番どおり）：

- `docs/visual-samples/2026-11-23-story-2/00-archias-character.png`
- `docs/visual-samples/2026-11-23-story-2/01-chapter-old-ship.png`
- `public/graphics/prologue-harbor.webp`

生成ツールへ渡した全文：

```text
FLOAT NOTES original game illustration. Match the supplied approved references closely: deliberately simple childlike wax-crayon drawing on textured paper, rough thick uneven dark navy outlines, big flat silhouettes, visible wax hatching and small white paper gaps, dot eyes, very simple mitten hands, warm flat colors. No polished watercolor, no realistic rendering, no gradients, no anime detailing, no spirits. Keep all characters recognizably the same as references. Archimedes: bald peach head with two white side hair puffs, white moustache and long pointed white beard, white robe with bright blue diagonal sash/sleeves, brown sandals. Any mouth opening must be inside beard immediately under moustache, never drawn on bare face above beard. Apprentice: young boy with tousled chestnut spiky hair and high cowlick, yellow sleeveless tunic, red diagonal sash, brown sandals. No written words, no captions, no numbers, no logos, no border. Create ONE new 4:3 landscape 1448x1086 kamishibai panel. Morning return to harbor after storm. SAME elderly shipwright ARCHIAS from first reference (short curly grey hair, square grey beard and moustache, tanned arms, terracotta tunic, dark muted teal apron with a few curled pale wood shavings, wooden mallet held low). Archias at left foreground on pale stone dock, looking UP at the battered wooden barge drawn up slightly on a simple timber boat cradle at right, broad weathered hull side raised clearly above him, cracked loose planks on lower side. Archimedes and apprentice stand on dock center-left beside shipwright welcoming him with gentle relieved gestures, all three full bodies clear and separated. Archias gently points at one loose lower plank with empty hand, not wielding mallet toward anyone. Sea and a few cream harbor houses beyond. Boat still recognizably same box-like orange-brown barge as references, empty open cargo well visible, old worn grey-brown boards and small cracks, no sails or ornate prow. A couple spare wood planks and curled shavings on dock. Calm warm post-storm light; one strong simple composition, no labels or words.
```

## 05-chapter-repaired

参照画像（順番どおり）：

- `docs/visual-samples/2026-11-23-story-2/00-archias-character.png`
- `public/graphics/prologue-harbor.webp`

生成ツールへ渡した全文：

```text
FLOAT NOTES original game illustration. Match the supplied approved references closely: deliberately simple childlike wax-crayon drawing on textured paper, rough thick uneven dark navy outlines, big flat silhouettes, visible wax hatching and small white paper gaps, dot eyes, very simple mitten hands, warm flat colors. No polished watercolor, no realistic rendering, no gradients, no anime detailing, no spirits. Keep all characters recognizably the same as references. Archimedes: bald peach head with two white side hair puffs, white moustache and long pointed white beard, white robe with bright blue diagonal sash/sleeves, brown sandals. Any mouth opening must be inside beard immediately under moustache, never drawn on bare face above beard. Apprentice: young boy with tousled chestnut spiky hair and high cowlick, yellow sleeveless tunic, red diagonal sash, brown sandals. No written words, no captions, no numbers, no logos, no border. Create ONE new 4:3 landscape 1448x1086 kamishibai panel. Sunny harbor after boat repairs. SAME elderly shipwright Archias from first reference, short grey curly hair and short squared grey beard, sun-tanned arms, terracotta work tunic, muted dark teal apron with wood shavings, brown sandals, wooden mallet down at side. Archias at left, teacher Archimedes at middle, apprentice at right, all three standing together full-body along pale stone dock FOREGROUND, pleased and relieved. Behind the three stands the SAME simple orange-brown open box-like wooden barge, tied up in blue harbor water, its wide broad side made from fresh bright honey-gold replacement wooden planks, neat simple large joins, no cracks, no leaks, cargo well clearly visible. Boat large in middle background, characters do not entirely cover hull. A few new planks and wood shavings at left dock edge suggest finished repairs, not ongoing work. Mint sky, simple distant cream buildings. No ship cabin, no sails. Minimal scenery and thick navy wax lines, consistent simple proportions, no lettering or labels.
```

## 06-chapter-finale

参照画像（順番どおり）：

- `public/graphics/prologue-command.webp`
- `public/graphics/prologue-harbor.webp`

生成ツールへ渡した全文：

```text
FLOAT NOTES original game illustration. Match the supplied approved references closely: deliberately simple childlike wax-crayon drawing on textured paper, rough thick uneven dark navy outlines, big flat silhouettes, visible wax hatching and small white paper gaps, dot eyes, very simple mitten hands, warm flat colors. No polished watercolor, no realistic rendering, no gradients, no anime detailing, no spirits. Keep all characters recognizably the same as references. Archimedes: bald peach head with two white side hair puffs, white moustache and long pointed white beard, white robe with bright blue diagonal sash/sleeves, brown sandals. Any mouth opening must be inside beard immediately under moustache, never drawn on bare face above beard. Apprentice: young boy with tousled chestnut spiky hair and high cowlick, yellow sleeveless tunic, red diagonal sash, brown sandals. No written words, no captions, no numbers, no logos, no border. Create ONE new 4:3 landscape 1448x1086 kamishibai panel, palace demonstration of a singing miniature boat. SAME palace cream columns and honey-yellow walls as first reference. King Hieron II stands at LEFT, simple large gold three-point crown, purple long robe, dark brown beard and moustache, delighted attentive expression, mouth INSIDE beard under moustache. At CENTER foreground a broad waist-high clear rectangular glass WATER TANK on a sturdy simple wooden table. Blue water halfway up tank, distinct horizontal water surface and transparent front wall. A SMALL orange-brown open box-shaped model boat FLOATS in the water, two little wooden cargo cubes in boat; NOT a full-size boat or bathtub. Apprentice boy at RIGHT of tank, yellow tunic red sash, actively lifting ONE small crate OUT of miniature boat with two hands, full face visible. Archimedes just behind right side, white robe blue sash, pointing gently toward floating model and explaining, mouth inside white beard. Place two little crates already unloaded on table beside tank. A few simple navy and warm gold pictorial MUSICAL NOTES rise from boat, no music staff or words. Entire tank, model boat, hands, and all three faces clear within margins. Window at back shows tiny harbor but main focus is tank and unloading. All forms simple flat crayon wax and paper texture, no photorealistic glass effects, no text, no writing, no title.
```
