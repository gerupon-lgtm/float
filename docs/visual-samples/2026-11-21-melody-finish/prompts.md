# 航路のメロディ・導入2枚の生成指示

2026-11-21。内蔵 `image_gen` を使用。生成・編集モードは参照画像付きの編集です。外部APIや代替の描画手段は使用していません。

参照1は採用済みの港の紙芝居（人物・船・色・クレヨンの粗さ）、参照2は採用済みのキャラクターシート（人物の同一性・表情だけ）です。生成したPNG原本は変更せず保存し、配信用だけ960×720pxのWebP（品質90）へ縮小しました。語り・セリフ・数字は描き込まず、音符と港の旗は絵の記号として扱います。

## s11 荷下ろしと音の変化

```text
Use case: illustration-story.
Asset type: FLOAT NOTES chapter-melody story panel s11, landscape 4:3 (target 1448 x 1086), full bleed opaque paper illustration.
Edit the reference harbor illustration into the NEXT STORY MOMENT. Reference image 1 supplies the exact approved harbor, box-shaped orange wooden boat, childlike crayon treatment, palette and two characters. Reference image 2 is identity/expression reference ONLY; do not reproduce the character sheet, its labels, or extra characters.
Scene: at a small sunny ancient-Greek-inspired harbor, cargo is being UNLOADED FROM the boat onto the stone pier. The white-bearded teacher Archimedes has both feet on the pier and lifts a single wooden crate out toward the pier. The boy stands beside him, one hand cupped to his ear, leaning toward the boat with curious surprised dot eyes and a small O mouth, noticing that the boat's tone is getting higher. A couple of simple handdrawn musical-note SYMBOLS near the boat suggest sound; they are pictorial symbols, not words or captions.
Boat: the same broad rectangular open wooden barge, orange/brown crayon hull with large flat side, about 2:1 width:height. Calm blue water, a clear low waterline, much of its hull visible above water now that cargo has been removed. One small remaining sack inside; a crate already on the pier. No submerged people, no flying boat, no magical glow.
Characters: same simple bald peach head, white side-hair puffs, white moustache/beard, white robe and blue diagonal sash, brown sandals for Archimedes. Any mouth is INSIDE the beard below his moustache. Boy: same tousled chestnut spiky hair and cowlick, yellow short tunic with red diagonal sash, brown sandals. Small simple childlike paper-puppet proportions, navy dot eyes, no detailed anatomy.
Style: wax crayon drawn by a child on textured paper, thick uneven dark NAVY outlines, scratchy broad color fills with paper gaps. Deliberately simple and naive; few large shapes, flat depth, mint sky, vivid blue sea, warm sand pier, a few small flat pale houses in the distance. Match the reference's simplicity and character identity, not polished storybook rendering.
No written language, letters, digits, narration, speech bubbles, titles, labels, logos, borders or frame. Musical-note symbols only are allowed as part of the story. No photo/3D, dramatic lighting, glossy gradients, complex costumes or ornate architecture.
```

## s12 航海図と音符

```text
Use case: illustration-story.
Asset type: FLOAT NOTES chapter-melody story panel s12, landscape 4:3 (target 1448 x 1086), full bleed opaque paper illustration.
Create the following story moment by editing reference image 1 into a new composition at the SAME harbor, with the SAME two characters and the SAME childlike crayon technique. Reference image 2 is identity/expression reference ONLY; never reproduce its words, labels, sheet layout or extra characters.
Archimedes spreads a LARGE pale paper voyage map across a simple wooden table on the pier. He is smiling and uses a short wooden stylus to point to a route on the map. The tousle-haired apprentice leans eagerly over the table beside him, looking down at the map with curious attentive dot eyes, one finger near a port symbol. Both characters and the map are large and immediately readable.
The map is tilted toward the viewer and contains only a simple blue shoreline, a dotted winding route, four tiny red triangular port pennants, and a few large dark handdrawn musical-note SYMBOLS along the route. Do not draw any written names, labels, numbers, words, formulae, legend, stave lines or dialogue. Musical-note and port symbols are pictorial story motifs only.
A small version of the same orange rectangular wooden boat is moored in the blue water behind the table. Mint sky and a few very simple sand-colored harbor buildings in the distance. Few broad shapes; keep the map the main object of attention and keep the composition uncluttered.
Archimedes: same bald round peach head, white side-hair puffs, white moustache and long beard, white robe with blue diagonal sash. Any mouth must be INSIDE the white beard below the moustache. Boy: same spiky chestnut hair with distinctive cowlick, yellow tunic and red diagonal sash. No bowl or vessel in the boy's hands. Small naive paper-puppet proportions, navy dot eyes, no detailed anatomy.
Style exactly matches the reference: thick uneven dark NAVY crayon outlines, rough wax-crayon fills with visible paper gaps and grain, deliberately child-drawn, warm simple kamishibai look, flat depth. Not polished storybook or anime rendering.
No written language, letters, digits, speech bubbles, captions, labels, title, logo, frame, realistic 3D, glossy gradients, magical glow, ornate map compass or extra characters.
```

