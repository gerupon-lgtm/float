// 問題を生成して src/content/challenges.js に保存する。--check で内容の一致を確かめる。
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { STAGES } from '../src/content/stages.js';
import { pickProblems } from '../src/logic/generate.js';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const target = join(root, 'src/content/challenges.js');
const data = Object.fromEntries(STAGES.filter(s => s.generated).map((s, i) => [s.id, pickProblems(s, { seed: 2026 + i })]));
const text = `// 自動生成（npm run generate:challenges）。手で直さない。\nexport const CHALLENGES = ${JSON.stringify(data)};\n`;
if (process.argv.includes('--check')) {
  if (readFileSync(target, 'utf8') !== text) { console.error('challenges.js が生成結果と一致しません。'); process.exit(1); }
} else writeFileSync(target, text);
for (const [id, list] of Object.entries(data)) console.log(id, list.length);
