// 画面の組み立てと進行。計算・判定は src/logic、面と語りは src/content にある。
import { AREA, HULL, SHIP, LIQUIDS, depthOf, depthFraction, isSunk, sinkingWeight, clearsShoal, reachesDepth } from '../logic/physics.js';
import { midiOf, onScale } from '../logic/pitch.js';
import { CELLS, ROWMAX, ROWH, dropCargo, stackRows, pileClearsBridge } from '../logic/stacking.js';
import { LEVELS, ContinuousRun, ModeBook } from '../logic/modes.js';
import { STAGES } from '../content/stages.js';
import { CHALLENGES } from '../content/challenges.js';
import { SCENES } from '../content/story.js';
import { ART, INK } from './art.js';
import { GRAPHICS, cargoArt } from './graphics.js';
import { FloatAudio } from './audio.js';
import { createUpdateManager } from './update-manager.js';

const APP_VERSION = '0.8.12';
const audio = new FloatAudio();
const unlock = () => audio.unlock();
const bell = (m, g, d) => audio.bell(m, g, d);
const wood = () => audio.wood();
const clack = () => audio.clack();
const tap = () => audio.tap();
const jingle = () => audio.jingle();
/* ---------- 画面の土台 ---------- */
const app=document.getElementById('app');
const $=(s,r=document)=>r.querySelector(s);
let cur=null, muted=false;
function show(html,cls=''){const c=document.createElement('section');c.className='card enter '+cls;c.innerHTML=html;app.append(c);
  const old=cur;cur=c;requestAnimationFrame(()=>requestAnimationFrame(()=>{c.classList.remove('enter');if(old){old.classList.add('leave');setTimeout(()=>old.remove(),460)}}));return c}
const topbar=t=>`<div class="top"><b>${t}</b><span><button class="tiny" id="mute">${muted?'音なし':'音あり'}</button> <button class="tiny" id="home">表紙</button></span></div>`;
function wire(c){const m=$('#mute',c),h=$('#home',c);if(m)m.onclick=()=>{muted=!muted;audio.setMuted(muted);m.textContent=muted?'音なし':'音あり'};if(h)h.onclick=()=>{stopRun();title()}}

function title(){const c=show(`<div class="hero"><div class="series">SIKUMI<br>NOTES<span>03</span></div><h1 class="logo">FLOAT</h1><div class="logo2">NOTES</div>
  <p class="tag">積んで、浮かべて、確かめる。</p></div><div class="symbols" role="img" aria-label="見習い、天秤、荷物の船"></div>
  <div class="list"><button class="btn sub" id="go">おはなし</button><button class="btn" id="cont">連続プレイ</button><button class="btn sub" id="pick">選択プレイ</button>
  <div class="row"><button class="btn sub" disabled>パーツの説明</button><button class="btn sub" disabled>遊び方と概要</button></div></div>
  <div class="fine">© SIKUMI LAB　v${APP_VERSION} 試作</div>`,'cover');
  c.style.backgroundImage=`url("${GRAPHICS.title}")`;
  $('#go',c).onclick=()=>{unlock();clack();stories()};
  $('#cont',c).onclick=()=>{unlock();clack();levels()};
  $('#pick',c).onclick=()=>{unlock();clack();pick()}}
// おはなし：序章を遊ぶ入口と、見た紙芝居の読み返し。何度でも見直せる
const STORIES=[['王冠の謎',['s1','s2','s3','s4','s9','s10','s5']],['積み方',['s7']],['油の湖',['s8']],['銀色の湖',['s6']]];
function stories(){const c=show(`${topbar('おはなし')}<div class="list" style="max-width:none"><button class="btn" id="play">序章を遊ぶ</button>
  ${STORIES.map(([n,keys],i)=>{const open=keys.every(k=>book.seen(k));return `<button class="btn sub" data-r="${i}" ${open?'':'disabled'}>${open?n:'まだ読めません'}</button>`}).join('')}</div>`);
  wire(c);$('#play',c).onclick=()=>{wood();flow(0)};
  c.querySelectorAll('[data-r]').forEach(b=>b.onclick=()=>{wood();const keys=STORIES[+b.dataset.r][1];const read=i=>i>=keys.length?stories():scene(keys[i],()=>read(i+1));read(0)})}
function pick(){const c=show(`${topbar('選択プレイ')}<div class="list" style="max-width:none">${STAGES.map((s,i)=>`<button class="btn sub" data-s="${i}">${s.name}</button>`).join('')}</div>`);
  wire(c);c.querySelectorAll('[data-s]').forEach(b=>b.onclick=()=>{wood();R=null;enter(+b.dataset.s)})}
function levels(){const c=show(`${topbar('連続プレイ')}<div class="say"><span class="nar">全${STAGES.length}面を順に進みます。沈んだり関門に当たったりするとNGです。ノーマルとエキスパートでは、出航するまで深さが見えません。</span></div>
  <div class="list" style="max-width:none">${LEVELS.map(l=>`<button class="btn sub" data-l="${l.id}">${l.name}<small style="display:block;font-size:14px">${l.note}　最高 ${book.best(l.id)}面</small></button>`).join('')}</div>`);
  wire(c);c.querySelectorAll('[data-l]').forEach(b=>b.onclick=()=>{unlock();clack();R=new ContinuousRun(b.dataset.l,STAGES.length);enter(0)})}
// 面に入る。新しい要素の紙芝居は初回だけ流す
function enter(n){const list=(STAGES[n].intro??[]).filter(k=>!book.seen(k));
  const play=i=>{if(i>=list.length)return stage(n);book.markSeen(list[i]);scene(list[i],()=>play(i+1))};play(0)}
function question(base){const list=CHALLENGES[base.id];if(!list?.length)return{};let i=Math.floor(Math.random()*list.length);if(list.length>1&&i===lastQuestion[base.id])i=(i+1)%list.length;lastQuestion[base.id]=i;return list[i]}
function goalText(S){let liq=S.pre??S.start;const mix=S.gates.some(g=>g.k==='chamber');
  const line=g=>{if(g.k==='chamber'){liq=g.to;return ''}const at=mix?`${LIQUIDS[liq].n}の`:'';
    return g.k==='shoal'?`・${at}浅瀬：${g.d}まで（深いと底につかえる）`:g.k==='bridge'?`・${at}低い橋：${g.d}以上（浅いと船の縁が当たる）`:`・${at}レバー：${g.d}以上（浅いと届かない）`};
  const rows=S.gates.map(line).filter(Boolean).join('<br>');
  return `${S.lead}<br>船の沈む深さに注意しましょう。<br>${rows}`}
function ngText(){if(!R)return'';return R.level.limit===null?`失敗 ${R.ng}回`:`やり直し あと${R.left}回`}

function scene(k,next){const s=SCENES[k];book.markSeen(k);const c=show(`${topbar('おはなし')}<div class="frame">${ART[s.art]()}</div>
  <div class="say"><span class="nar">${s.nar}</span><span class="who" style="margin-top:4px">${s.who}</span>${s.say}</div><button class="btn" id="n">つづき</button>`);
  wire(c);$('#n',c).onclick=()=>{wood();next()}}

/* ---------- 序章：天秤 ---------- */
const balanceArt=(tilt,water)=>ART[water?'balance-water':'balance-air']();
function bal1(next){const c=show(`${topbar('序章 1　天秤')}<div class="frame" id="f">${balanceArt(0,false)}</div>
  <div class="say" id="t"><span class="nar">見習いは、王冠と同じ重さの純金を用意しました。天秤で比べてみましょう。</span></div><button class="btn" id="a">空気の中で量る</button>`);
  wire(c);$('#a',c).onclick=function(){wood();this.textContent='つづき';$('#t',c).innerHTML='<span class="who">見習い</span>つり合いました。重さでは見分けられません……。';this.onclick=()=>{wood();next()}}}
function bal2(next){const c=show(`${topbar('序章 2　水の中の天秤')}<div class="frame" id="f">${balanceArt(0,false)}</div>
  <div class="say" id="t"><span class="who">アルキメデス</span>見習いよ、分かったぞ。王冠と純金を水の中で、もう一度比べてごらん。</div><button class="btn" id="a">水に沈める</button>`);
  wire(c);$('#a',c).onclick=function(){bell(84);$('#f',c).innerHTML=balanceArt(12,true);
    this.textContent='つづき';$('#t',c).innerHTML='<span class="who">見習い</span>えっ？ 王冠の側が上がりました！';this.onclick=()=>{wood();next()}}}
function quiz(next){const O=[['王冠のほうが、もともと軽いから',0],['王冠のほうが体積が大きく、水を多く押しのけたから',1],['水の中では、金だけが重くなるから',0]];
  const c=show(`${topbar('序章 3　なぜ？')}<div class="frame">${balanceArt(12,true)}</div><div class="say" id="t"><span class="who">アルキメデス</span>空気の中ではつり合ったのに、水の中では王冠が上がった。なぜだと思う？</div>
  <div class="list" style="max-width:none;gap:12px;margin-top:6px">${O.map((o,i)=>`<button class="choice" data-i="${i}"><span class="key">${'ABC'[i]}</span><span class="txt">${o[0]}</span><span class="go" aria-hidden="true">▶</span></button>`).join('')}</div>`);
  wire(c);c.querySelectorAll('[data-i]').forEach(b=>b.onclick=()=>{const ok=O[+b.dataset.i][1];if(ok){jingle();
    $('#t',c).innerHTML='<span class="who">アルキメデス</span>そのとおり。押しのけた液体の重さが、浮く力になる。王冠は体積が大きいので、純金より強く浮いたのだ。';
    $('.list',c).classList.add('foot');$('.list',c).style.marginTop='';$('.list',c).innerHTML='<button class="btn" id="n">つづき</button>';$('#n',c).onclick=()=>{wood();next()}}
    else{tap();$('#t',c).innerHTML='<span class="who">アルキメデス</span>ふむ。空気の中では、重さはつり合っていたぞ。もう一度考えてごらん。'}})}

/* ---------- 航路の盤面 ---------- */
const U=12, SURF=128, W=360, H=236;
let G=null, run=0;
const deep=()=>depthFraction(weight(),G.liq,G.S.area);
const dp=(w,liq)=>depthOf(w,liq,G.S.area);
let R=null;
const book=(()=>{try{return new ModeBook(window.localStorage)}catch{return new ModeBook(null)}})();
const lastQuestion={};
function stopRun(){run++}
// 動きを減らす設定の端末でも、船の動きは内容の一部なので、一瞬にせず短くするだけにする
const calm=()=>matchMedia('(prefers-reduced-motion:reduce)').matches?0.6:1;
function wait(ms){return new Promise(r=>setTimeout(r,ms*calm()))}
function tween(ms,fn){const id=run;ms*=calm();return new Promise(res=>{const t0=performance.now();
  const f=now=>{if(id!==run)return;const p=Math.min(1,(now-t0)/ms),e=p*p*(3-2*p);fn(e);if(p<1)requestAnimationFrame(f);else res()};requestAnimationFrame(f)})}

function stage(n){stopRun();const base=STAGES[n],S={area:AREA,...base,...question(base)};
  G={n,S,hide:!!R?.hidesDepth&&!S.showDepth,placed:[],sel:null,on:new Set(S.on),liq:S.pre?S.start:S.start,x:0,d:0,lift:S.cradle?20:0,busy:false,floating:!S.cradle,room:null,opened:false,bottomExtra:0};
  G.d=G.floating?dp(weight(),G.liq):0;
  const c=show(`${topbar(`${S.name}${R?`<small class="sub">${R.position+1}/${R.stageCount}面　<span id="ng">${ngText()}</span></small>`:''}`)}<div class="frame"><svg id="b" viewBox="0 0 ${W} ${H}" role="img" aria-label="航路の断面図"></svg></div>
    <div class="stat"><div>液体の比重<strong id="sg"></strong></div><div>船全体の重さ<strong id="wt"></strong></div><div>沈む深さ<strong id="dp"></strong></div></div>
    <div class="formula" id="fm"></div><div class="say" id="t" style="min-height:60px"></div>
    <div class="shelf" id="sh"></div><div class="row"><button class="btn sub" id="ring">深さの音</button><button class="btn" id="dep">出航</button></div>`);
  wire(c);G.c=c;drawWorld();$('#t',c).innerHTML=goalText(S);renderShelf();syncUI();loop(run);
  $('#dep',c).onclick=()=>depart();$('#ring',c).onclick=()=>{unlock();if(G.floating&&!(G.hide&&!G.sailing))bell(midiOf(G.d));else{tap();say('船が出ると、沈んだ深さの音が鳴ります。')}};
  if(S.pre)intoMercury()}

const weight=()=>SHIP+(G.S.grid?G.placed.reduce((a,p)=>a+G.S.items[p.id][0],0):[...G.on].reduce((a,i)=>a+G.S.items[i][0],0));
const pileRows=()=>stackRows(G.placed,G.S.items);
function drop(id,col){const p=dropCargo(G.placed,G.S.items,id,col);if(!p){say('ここには置けません。荷が高くなりすぎます。');return false}G.placed.push(p);return true}
const say=h=>{$('#t',G.c).innerHTML=h};
function liqSect(){const g=G.S.gates.find(x=>x.k==='chamber');return g?g.x:null}

function drawWorld(){const S=G.S,sp=liqSect();const b=$('#b',G.c);
  const gates=S.gates.map((g,i)=>gateSVG(g,i)).join('');
  b.innerHTML=`<defs>${Object.keys(LIQUIDS).map(l=>`<pattern id="liq-${l}" patternUnits="userSpaceOnUse" width="240" height="110" y="${SURF}"><image href="${GRAPHICS['liquid-'+l]}" width="240" height="110" preserveAspectRatio="none"/></pattern>`).join('')}</defs><rect width="${W}" height="${H}" fill="var(--sky)"/>
  <path d="M0 40q30 -20 60 0t60 0M240 56q30 -20 60 0t50 0" fill="none" stroke="#fffaf0" stroke-width="7"/>
  <g id="cam"><rect id="l1" x="-500" y="${SURF}" width="${(sp??2000)+500}" height="${H-SURF}" fill="${liquidFill(G.liq)}"/>
  ${sp!=null?`<rect id="l2" x="${sp}" y="${SURF}" width="2000" height="${H-SURF}" fill="${liquidFill(G.S.gates.find(g=>g.k==='chamber').to)}"/>`:''}
  <rect id="room" x="-70" y="${SURF}" width="0" height="${H-SURF}" fill="${liquidFill('mercury')}"/>
  ${G.S.cradle?`<path d="M-500 ${SURF+1}H70L120 ${H}H-500Z" fill="var(--sand)" stroke="${INK}" stroke-width="3"/>`:''}
  ${gates}<path d="M${S.end} ${SURF+2}V${SURF-58}" stroke="${INK}" stroke-width="5"/><path d="M${S.end} ${SURF-58}l36 11l-36 11z" fill="var(--red)" stroke="${INK}" stroke-width="3"/><text x="${S.end+6}" y="${SURF-64}" font-size="13" fill="${INK}">港</text>
  <g id="ship"></g><g id="fx"></g></g>
  <g id="scale"></g>`;
  const sc=$('#scale',b);let s='';for(let i=0;i<=5;i++){const y=SURF+i*U;s+=`<path d="M8 ${y}h${i%5?8:12}" stroke="${INK}" stroke-width="2.5"/><text x="24" y="${y+4.5}" font-size="12.5" font-weight="700" fill="${INK}">${i}</text>`}
  sc.innerHTML=`<rect x="3" y="${SURF-22}" width="36" height="${5*U+34}" rx="6" fill="#fffaf0" stroke="${INK}" stroke-width="2"/><text x="21" y="${SURF-9}" text-anchor="middle" font-size="11.5" font-weight="700" fill="${INK}">深さ</text>`+s+`<path id="mark" d="M0 0l9 -6v12z" fill="var(--red)" stroke="${INK}" stroke-width="1.5" opacity="0"/>`;
  shipSVG()}
const liquidFill=l=>`url(#liq-${l})`;
const img=(key,x,y,w,h,fit='none')=>`<image href="${GRAPHICS[key]}" x="${x}" y="${y}" width="${w}" height="${h}" preserveAspectRatio="${fit}"/>`;
const tag=(x,y,t)=>`<text x="${x}" y="${y}" text-anchor="middle" font-size="12" fill="${INK}" stroke="#fffaf0" stroke-width="3" paint-order="stroke">${t}</text>`;
function gateSVG(g,i){const x=g.x;
  if(g.k==='shoal'){const y=SURF+g.d*U;return img('shoal',x-58,y-2,116,H-y+2)+tag(x,H-5,`${g.d}まで`)}
  if(g.k==='bridge'){const y=SURF-(HULL-g.d)*U,h=44;return `<path d="M${x-52} ${y-h+2}V0M${x+52} ${y-h+2}V0" stroke="#8a5a2e" stroke-width="4"/>`+img('bridge',x-62,y-h,124,h)+tag(x,y+14,`${g.d}以上`)}
  if(g.k==='lever'){const y=SURF+g.d*U;return `<g id="gate${i}">${img('gate-door',x+52,SURF-62,46,H-SURF+62)}</g><path d="M${x} ${y+8}V${H}" stroke="${INK}" stroke-width="5"/>`+img('lever-arm',x-34,y-8,68,26)+tag(x,H-5,`${g.d}以上`)}
  if(g.k==='chamber'){return img('chamber',x-6,SURF-34,152,H-SURF+34)+tag(x+70,SURF-40,'入れ替え室')}
  return ''}
const WET=`<rect id="wet" x="-60" y="0" width="120" height="0" opacity=".32"/>`;
function shipSVG(){const hull=img('boat',-62,-60,124,60);
  if(G.S.grid){const r=G.placed.map(p=>{const it=G.S.items[p.id];return `<image href="${cargoArt(it[1])}" x="${-54+p.c*18}" y="${-8-(p.r+it[3])*ROWH}" width="${it[2]*18}" height="${it[3]*ROWH}" preserveAspectRatio="none"/>`}).join('');
    $('#ship',G.c).innerHTML=hull+r+WET;return}
  const items=[...G.on].sort((a,b)=>G.S.items[a][0]-G.S.items[b][0]);let r='';
  items.forEach((id,i)=>{const [,n]=G.S.items[id],col=i%3,row=Math.floor(i/3),x=-30+col*20,y=-10-14-row*14;
    r+=`<image href="${cargoArt(n)}" x="${x-9}" y="${y}" width="18" height="14"/>`});
  $('#ship',G.c).innerHTML=hull+r+WET}
function loop(id){if(id!==run)return;if(G&&G.c.isConnected){const t=performance.now()/1000,bob=G.sinking?0:Math.sin(t*1.7)*.8;
  const cam=Math.max(0,G.x-180+0)*1;const c=$('#cam',G.c);if(c)c.setAttribute('transform',`translate(${180-G.x} 0)`);
  const s=$('#ship',G.c);if(s)s.setAttribute('transform',`translate(${G.x} ${SURF+G.d*U-G.lift+bob})`);
  const m=$('#mark',G.c);if(m){const known=G.floating&&!(G.hide&&!G.sailing);m.setAttribute('opacity',known?1:0);m.setAttribute('transform',`translate(20 ${SURF+Math.min(G.d,HULL)*U}) rotate(180)`)}
  const w=$('#wet',G.c);if(w){const h=Math.max(0,Math.min(G.d*U-G.lift,60));w.setAttribute('y',-h);w.setAttribute('height',h);w.setAttribute('fill',liquidFill(G.liq))}}requestAnimationFrame(()=>loop(id))}

function syncUI(){const c=G.c,s=LIQUIDS[G.liq].s,w=weight();$('#sg',c).textContent=s;$('#wt',c).textContent=w;
  const known=G.floating&&!(G.hide&&!G.sailing);$('#dp',c).innerHTML=known?G.d.toFixed(2):'？';
  const target=G.next||G.liq,ts=LIQUIDS[target].s;
  const chamber=G.S.gates.find(g=>g.k==='chamber');const useS=(chamber&&!G.passed)?LIQUIDS[chamber.to].s:ts;const nm=(chamber&&!G.passed)?LIQUIDS[chamber.to].n:LIQUIDS[target].n;
  $('#fm',c).innerHTML=`${nm}での深さ ＝ 重さ <em>${w}</em> ÷（比重 <em>${useS}</em> × 底面積 <em>${G.S.area}</em>）＝ ？<br>船だけの重さ <em>${SHIP}</em>`+(known&&onScale(deep())?'<span class="scale">音階に乗った</span>':'')}
function renderPack(){const S=G.S,sh=$('#sh',G.c);sh.style.display='block';const c=30,used=new Set(G.placed.map(p=>p.id));
  const cells=G.placed.map(p=>{const it=S.items[p.id];return `<image href="${cargoArt(it[1])}" x="${p.c*c+1}" y="${(ROWMAX-p.r-it[3])*c+1}" width="${it[2]*c-2}" height="${it[3]*c-2}" preserveAspectRatio="none"/>`}).join('');
  let g='';for(let i=0;i<=CELLS;i++)g+=`<path d="M${i*c} 0V180M0 ${i*c}H180" stroke="#cdbf9f"/>`;
  sh.innerHTML=`<div class="pack"><svg id="pk" viewBox="0 0 180 180" role="img" aria-label="積み場所。列をタップして荷を落とす">${g}<path d="M0 90H180" stroke="${INK}" stroke-width="2.5" stroke-dasharray="6 4"/>${cells}${[0,1,2,3,4,5].map(i=>`<rect data-col="${i}" x="${i*c}" y="0" width="${c}" height="180" fill="transparent"/>`).join('')}</svg>
  <div class="side">${S.items.map(([w,n,cw,ch],i)=>`<button class="chip" data-i="${i}" aria-pressed="${G.sel===i}" ${used.has(i)?'disabled':''}>${n} ${w}<small>${cw}×${ch}マス</small></button>`).join('')}<button class="chip" id="undo">ひとつ戻す</button></div></div>`;
  sh.querySelectorAll('.chip[data-i]').forEach(b=>b.onclick=()=>{if(G.busy)return;unlock();tap();G.sel=+b.dataset.i;renderPack()});
  sh.querySelectorAll('[data-col]').forEach(r=>r.onclick=()=>{if(G.busy)return;unlock();if(G.sel==null){say('先に、積む荷を選びましょう。');return}if(drop(G.sel,+r.dataset.col)){audio.land(S.items[G.sel][0]);G.sel=null;if(G.floating)settle()}shipSVG();renderPack();syncUI()});
  $('#undo',sh).onclick=()=>{if(G.busy||!G.placed.length)return;tap();G.placed.pop();if(G.floating)settle();shipSVG();renderPack();syncUI()}}
function renderShelf(){if(G.S.grid)return renderPack();const S=G.S,sh=$('#sh',G.c);sh.innerHTML=S.items.map(([w,n],i)=>`<button class="chip${w>=100?' lead':''}" data-i="${i}" aria-pressed="${G.on.has(i)}">${w}<small>${n}</small></button>`).join('');
  sh.querySelectorAll('.chip').forEach(b=>b.onclick=()=>{if(G.busy)return;unlock();const i=+b.dataset.i;const adding=!G.on.has(i);adding?G.on.add(i):G.on.delete(i);b.setAttribute('aria-pressed',G.on.has(i));adding?audio.land(S.items[i][0]):tap();shipSVG();
    if(G.floating)settle();syncUI()})}
function settle(){if(G.hide&&!G.sailing)return;const to=dp(weight(),G.liq),from=G.d;const id=run;
  tween(380,e=>{if(id===run)G.d=from+(to-from)*e;syncUI()}).then(()=>{bell(midiOf(to),.17,.9);if(isSunk(weight(),G.liq,G.S.area))sink(`重さ${weight()}では、${LIQUIDS[G.liq].n}に沈みきってしまいます。`)})}

async function intoMercury(){G.busy=true;lock(true);say('入れ替え室で、水を水銀に入れ替えます。');await wait(500);
  const room=$('#room',G.c);room.setAttribute('width',140);const f=[];await tween(1200,e=>{room.setAttribute('opacity',e);G.d=1+(0.074-1)*e;});
  $('#l1',G.c).setAttribute('fill',liquidFill('mercury'));G.liq='mercury';G.d=dp(weight(),'mercury');bell(midiOf(G.d));syncUI();G.busy=false;lock(false);
  await wait(300);scene2Return()}
function scene2Return(){say(goalText(G.S))}
function lock(v){$('#dep',G.c).disabled=v;$('#ring',G.c).disabled=false}

async function depart(){if(G.busy)return;unlock();if(G.S.grid&&G.placed.length<G.S.items.length){say('荷はすべて積みましょう。');return}G.busy=true;lock(true);const id=run;const S=G.S;G.sailing=true;
  if(G.floating&&G.hide){const to=dp(weight(),G.liq),from=G.d;await tween(600,e=>{G.d=from+(Math.min(to,HULL+1)-from)*e;syncUI()});G.d=to;bell(midiOf(to));syncUI();if(isSunk(weight(),G.liq,G.S.area))return sink(`重さ${weight()}では、${LIQUIDS[G.liq].n}に沈みきってしまいます。`)}
  if(!G.floating){const to=dp(weight(),G.liq);await tween(700,e=>{G.lift=20*(1-e);G.x=120*e;G.d=Math.min(to,HULL+1)*e;syncUI()});G.floating=true;G.d=to;bell(midiOf(to));syncUI();
    if(isSunk(weight(),G.liq,G.S.area))return sink(`重さ${weight()}は上限${sinkingWeight(G.liq,G.S.area)}を超えて、沈みました。沈みきる重さは、比重 × 底面積${G.S.area} × 高さ${HULL}で決まります。`)}
  for(const g of S.gates){if(id!==run)return;
    if(g.k==='chamber'){await moveTo(g.x+70);const r=await chamber(g);if(!r)return;continue}
    const stop=g.k==='lever'?g.x+18:g.x;
    if(g.k==='shoal'){if(!clearsShoal(deep(),g.d)){await moveTo(g.x-90);return fail(`沈む深さ${G.d.toFixed(2)}では、浅瀬につかえました（${g.d}まで）。`)}await moveTo(g.x+60)}
    if(g.k==='bridge'){if(!reachesDepth(deep(),g.d)){await moveTo(g.x-96);return fail(`沈む深さ${G.d.toFixed(2)}では、橋に船の縁が当たります（${g.d}以上）。`)}if(G.S.grid&&!pileClearsBridge(deep(),g.d,pileRows())){await moveTo(g.x-96);return fail(`沈み方は足りていますが、荷の山が橋に当たりました。荷が${pileRows()}段になっています。積み方を変えましょう。`)}await moveTo(g.x+60)}
    if(g.k==='lever'){await moveTo(g.x);if(!reachesDepth(deep(),g.d)){return fail(`沈む深さ${G.d.toFixed(2)}では、レバーに届きません（${g.d}以上）。`)}bell(72,.14,.7);const el=$('#gate'+S.gates.indexOf(g),G.c);if(el)await tween(500,e=>el.setAttribute('transform',`translate(0 ${-120*e})`))}
  }
  await moveTo(S.end-30);if(id!==run)return;win()}
async function moveTo(x){const from=G.x;await tween(Math.max(450,Math.abs(x-from)*7),e=>{G.x=from+(x-from)*e})}
async function chamber(g){say(`入れ替え室：${LIQUIDS[G.liq].n}を${LIQUIDS[g.to].n}に入れ替えます。`);const id=run;const l2=$('#l2',G.c);const room=$('#room',G.c);room.setAttribute('x',g.x);room.setAttribute('width',140);room.setAttribute('fill',liquidFill(g.to));
  const wait0=await tween(600,e=>room.setAttribute('opacity',e));G.liq=g.to;G.passed=true;
  const to=dp(weight(),g.to),from=G.d;await tween(900,e=>{G.d=from+(Math.min(to,HULL+1.2)-from)*e;syncUI()});G.d=to;bell(midiOf(to));syncUI();
  if(isSunk(weight(),g.to,G.S.area)){sink(`${LIQUIDS[g.to].n}に入ると深さ${to.toFixed(2)}。船の高さ5を超えて沈みました。沈みきる重さは ${sinkingWeight(g.to,G.S.area)}です。`);return false}return true}
async function sink(msg){G.busy=true;G.sinking=true;lock(true);const from=G.d;tween(900,e=>{G.d=from+6*e});audio.sink();say(`<span class="who">アルキメデス</span>${msg}`);await wait(950);failButton()}
function fail(msg){say(`<span class="who">アルキメデス</span>${msg}`);audio.miss();failButton()}
// 止まったあとは「積み直す」で港へ戻るまで、荷物を変えられない（busy のままにする）
function failButton(){const dep=$('#dep',G.c);dep.disabled=false;
  const r=R?R.record('ng'):'retry';const ng=$('#ng',G.c);if(ng)ng.textContent=ngText();
  if(r==='gameover'){dep.textContent='結果へ';dep.onclick=()=>finish();return}
  dep.textContent='積み直す';dep.onclick=()=>restart()}
function restart(){stopRun();const keep=new Set(G.on);const n=G.n;const S=G.S;const pre=S.pre;
  G.x=0;G.lift=S.cradle?20:0;G.floating=!S.cradle;G.sinking=false;G.passed=false;G.sailing=false;G.busy=false;G.liq=pre||S.start;
  G.d=G.floating?dp(G.hide&&!G.S.loaded?SHIP:weight(),G.liq):0;if(G.d>HULL)G.d=HULL;
  drawWorld();if(pre)$('#l1',G.c).setAttribute('fill',liquidFill(pre));renderShelf();syncUI();say(goalText(S));const dep=$('#dep',G.c);dep.textContent='出航';dep.disabled=false;dep.onclick=()=>depart();loop(run)}
function win(){jingle();const S=G.S,n=G.n;const f=$('.frame',G.c);f.style.position='relative';f.insertAdjacentHTML('beforeend','<div class="stamp">エウレカ！</div>');
  say(`<span class="who">アルキメデス</span>${S.winner}<br><span class="nar">重さ${weight()}、深さ${G.d.toFixed(2)}で到着。</span>`);
  $('#sh',G.c).innerHTML='';const dep=$('#dep',G.c);dep.disabled=false;
  if(R){const r=R.record('clear');book.recordBest(R.level.id,R.cleared);
    dep.textContent=r==='complete'?'結果へ':'次の面へ';dep.onclick=()=>{wood();r==='complete'?finish():enter(R.position)}}
  else{dep.textContent='面を選ぶ';dep.onclick=()=>{wood();pick()}}}
function finish(){stopRun();const run0=R,clear=run0.complete;const c=show(`${topbar(clear?'ALL CLEAR':'GAME OVER')}<div class="frame">${ART.harbor()}</div>
  <div class="say"><span class="who">${clear?'エウレカ！':'見習い'}</span>${clear?'全部の面をクリアしました。':'今回はここまで。まだ分からないことが、見つかりました。'}<br><span class="nar">${run0.level.name}　クリア ${run0.cleared}/${run0.stageCount}面　NG ${run0.ng}回　最高 ${book.best(run0.level.id)}面</span></div><button class="btn" id="n">表紙へ</button>`);
  wire(c);$('#n',c).onclick=()=>{wood();R=null;title()}}

function flow(){scene('s1',()=>scene('s2',()=>bal1(()=>scene('s3',()=>scene('s4',()=>bal2(()=>quiz(()=>scene('s9',()=>scene('s10',()=>scene('s5',()=>levels()))))))))))}
// ---- 通信なしで使う仕組みと、新しい版の案内（F-012） ----
function setupOffline(){if(!document.querySelector('meta[name="float-offline"]')||!('serviceWorker' in navigator))return;
  const updates=createUpdateManager({serviceWorker:navigator.serviceWorker,currentVersion:APP_VERSION,canApply:()=>!G?.busy,reload:()=>location.reload(),
    onChange:info=>{const n=document.getElementById('update-notice');if(!n)return;n.hidden=info?.status!=='ready'}});
  document.getElementById('update-apply').onclick=()=>updates.apply();
  updates.start().catch(()=>{/* 登録できない環境では、通信ありでそのまま遊べる */})}
window.__float={STAGES,go:n=>stage(n),get G(){return G}};
title();
setupOffline();
