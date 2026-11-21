
import { readFileSync } from 'node:fs';
import { resolve,dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const read=p=>readFileSync(resolve(root,p),'utf8').replaceAll('\r\n','\n');
const a=read('proto/melody/main.js'),b=read('proto/melody-visual/main.js');
const block=(s,start,end)=>{const x=s.indexOf(start);if(x<0)throw Error('開始位置なし: '+start);const y=s.indexOf(end,x);if(y<0)throw Error('終了位置なし: '+end);return s.slice(x,y).trim()};
const checks=[
 ['荷・お題・状態・手がかりの条件','  const FREE_ITEMS =','  let lastSay ='],
 ['リセット処理','  function reset(','  // ---- 船 ----'],
 ['積み下ろし・音と再生','  // ---- 動き：','  // 港で積む荷は'],
 ['自動積載・出航・関門・判定・帰着','  // 港で積む荷は','  reset(\'route\', \'tut\');']
];
for(const [name,start,end]of checks){
 const endB=name==='自動積載・出航・関門・判定・帰着'?'  const review =':end;
 if(block(a,start,end)!==block(b,start,endB))throw Error(name+' に試作との差があります');
 console.log('保持: '+name);
}
for(const name of ['weight','depth','showLive','showWeight','shownDepth','bottomY','rowsUnderBridge']){
 const line=s=>s.split('\n').find(l=>l.includes('const '+name+' ='));
 if(!line(a)||line(a)!==line(b))throw Error(name+' の式に差があります');
}
console.log('船の重さ・深さ・伏せ方・橋の段数の式も一致しました');
