// 試作ページ（proto/melody）を1ページにまとめ、確認用ページを作る。まとめ方は build-artifact.js と同じ。
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join, resolve, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const dir = join(root, 'proto/melody');
const order = [], seen = new Set();
function visit(file) {
  if (seen.has(file)) return;
  seen.add(file);
  for (const m of readFileSync(file, 'utf8').matchAll(/^import .* from '(\.[^']+)';$/gm)) visit(resolve(dirname(file), m[1]));
  order.push(file);
}
visit(join(dir, 'main.js'));
const js = order.map(file => {
  const body = readFileSync(file, 'utf8').replace(/^import .* from '\.[^']+';\r?\n/gm, '').replace(/^export (?=(const|let|function|class|async function) )/gm, '');
  if (/^\s*(import|export)\b/m.test(body)) throw new Error(`${relative(root, file)} にまとめられない import/export があります。`);
  return `// ---- ${relative(root, file).replace(/\\/g, '/')} ----\n${body}`;
}).join('\n');
const html = readFileSync(join(dir, 'index.html'), 'utf8');
const part = n => new RegExp(`<!-- proto:${n}:start -->\\r?\\n([\\s\\S]*?)<!-- proto:${n}:end -->`).exec(html)[1];
const page = `${part('head')}<style>\n${readFileSync(join(dir, 'style.css'), 'utf8')}</style>\n${part('body')}<script type="module">\n${js}</script>\n`;
mkdirSync(join(root, 'artifact'), { recursive: true });
writeFileSync(join(root, 'artifact/melody-proto.html'), page);
console.log(`artifact/melody-proto.html を作りました（${order.length} モジュール、${(page.length / 1024).toFixed(1)} KB）`);
