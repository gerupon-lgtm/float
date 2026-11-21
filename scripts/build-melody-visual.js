
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname,join,resolve,relative,extname } from 'node:path';
import { fileURLToPath } from 'node:url';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..'),dir=join(root,'proto/melody-visual');
const order=[],seen=new Set();
function visit(file){if(seen.has(file))return;seen.add(file);for(const m of readFileSync(file,'utf8').matchAll(/^import .* from '(\.[^']+)';$/gm))visit(resolve(dirname(file),m[1]));order.push(file)}
visit(join(dir,'main.js'));
let js=order.map(file=>{
  const body=readFileSync(file,'utf8').replace(/^import .* from '\.[^']+';\r?\n/gm,'').replace(/^export (?=(const|let|function|class|async function) )/gm,'');
  if(/^\s*(import|export)\b/m.test(body))throw Error(relative(root,file)+' に未処理のimport/exportがあります');
  return '// ---- '+relative(root,file).replace(/\\/g,'/')+' ----\n'+body;
}).join('\n');
js=js.replace(/new URL\('(\.\.\/\.\.\/(?:public\/graphics|docs\/visual-samples)\/[^']+\.(?:webp|png))', import\.meta\.url\)\.href/g,(_,p)=>{
  const file=resolve(dir,p),mime=extname(p)==='.png'?'image/png':'image/webp';
  return JSON.stringify('data:'+mime+';base64,'+readFileSync(file).toString('base64'));
});
const html=readFileSync(join(dir,'index.html'),'utf8'),part=n=>new RegExp('<!-- proto:'+n+':start -->\\r?\\n([\\s\\S]*?)<!-- proto:'+n+':end -->').exec(html)[1];
const page='<!doctype html>\n<html lang="ja"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">\n'+part('head')+'<style>\n'+readFileSync(join(dir,'style.css'),'utf8')+'\n</style></head><body>\n'+part('body')+'<script type="module">\n'+js+'\n</script></body></html>\n';
mkdirSync(join(root,'artifact'),{recursive:true});
writeFileSync(join(root,'artifact/melody-visual.html'),page);
console.log('artifact/melody-visual.html を作成（見本0.1.1、'+order.length+'モジュール、'+(Buffer.byteLength(page)/1024/1024).toFixed(1)+'MB）');
