// 画面の組み立てと進行。計算・判定は src/logic、面と語りは src/content にある。
import { AREA, HULL, SHIP, LIQUIDS, depthOf, depthFraction, isSunk, sinkingWeight, clearsShoal, reachesDepth } from '../logic/physics.js';
import { midiOf, onScale } from '../logic/pitch.js';
import { hintLevel, shoalText, shallowText, sinkText } from '../content/fail-text.js';
import { CELLS, ROWMAX, ROWH, dropCargo, stackRows, pileClearsBridge } from '../logic/stacking.js';
import { LEVELS, ContinuousRun, ModeBook } from '../logic/modes.js';
import { CHAPTERS, chapterSpan } from '../content/chapters.js';
import { STAGES } from '../content/stages.js';
import { CHALLENGES } from '../content/challenges.js';
import { SCENES } from '../content/story.js';
import { ART, INK } from './art.js';
import { GRAPHICS, cargoArt } from './graphics.js';
import { FloatAudio } from './audio.js';
import { createUpdateManager } from './update-manager.js';
import { melodyStage } from './melody.js';
import { classicStage } from './classic.js';
import { howtoScreen, partsScreen } from './guide.js';
import { lessonFigure } from './lesson.js';

const APP_VERSION = '0.9.28';
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
function show(html,cls=''){const c=document.createElement('section');c.className='card enter '+cls;c.innerHTML=html;
  // スマホでは display:contents で元の並びを保ち、PCだけ操作欄を独立してスクロールする。
  if(c.matches('.story-layout,.stage-layout')){const side=document.createElement('div');side.className='layout-side';const frame=$('.frame',c);
    while(frame.nextSibling)side.append(frame.nextSibling);c.append(side)}
  app.append(c);
  const old=cur;cur=c;requestAnimationFrame(()=>requestAnimationFrame(()=>{c.classList.remove('enter');if(old){old.classList.add('leave');setTimeout(()=>old.remove(),460)}}));return c}
// 選択プレイの面では「面を選ぶ」を出す（opt.pick が null 以外）。押せるのは遊ぶ前と失敗したあと（opt.pick が true）。
// 出し入れすると見出しの行の高さが変わるので、航海中も出したまま押せなくする
const topbar=(t,opt={})=>`<div class="top"><b>${t}</b><span>${opt.pick!=null?`<button class="tiny" id="pickst" ${opt.pick?'':'disabled'}>面を選ぶ</button> `:''}<button class="tiny" id="mute">${muted?'音なし':'音あり'}</button> <button class="tiny" id="home">表紙</button></span></div>`;
function wire(c){const m=$('#mute',c),h=$('#home',c),ps=$('#pickst',c);if(m)m.onclick=()=>{muted=!muted;audio.setMuted(muted);m.textContent=muted?'音なし':'音あり'};if(h)h.onclick=()=>{stopRun();title()};if(ps)ps.onclick=()=>{audio.wood();pick()}}

function title(){const c=show(`<div class="title-hero"><div class="hero"><div class="series">SIKUMI<br>NOTES<span>03</span></div><h1 class="logo">FLOAT</h1><div class="logo2">NOTES</div>
  <p class="tag">積んで、浮かべて、確かめる。</p></div><div class="symbols" role="img" aria-label="見習い、天秤、荷物の船"></div></div>
  <div class="title-menu"><div class="list"><button class="btn sub" id="go">おはなし</button><button class="btn" id="cont">連続プレイ</button><button class="btn sub" id="pick">選択プレイ</button>
  <div class="row"><button class="btn sub" id="parts">パーツの説明</button><button class="btn sub" id="howto">遊び方と概要</button></div></div>
  <div class="fine">© SIKUMI LAB　v${APP_VERSION} 試作</div></div>`,'cover');
  c.style.setProperty('--title-art',`url("${GRAPHICS.title}")`);
  $('#go',c).onclick=()=>{unlock();clack();stories()};
  $('#cont',c).onclick=()=>{unlock();clack();levels()};
  $('#pick',c).onclick=()=>{unlock();clack();pick()};
  const guideCtx={show,topbar,wire,audio,title};
  $('#parts',c).onclick=()=>{unlock();clack();partsScreen(guideCtx)};
  $('#howto',c).onclick=()=>{unlock();clack();howtoScreen(guideCtx)}}
// おはなし：序章を遊ぶ入口と、見た紙芝居の読み返し。何度でも見直せる
const STORIES=[['王冠の謎',['s1','s2','s3','s4','s9','s10','s5']],['積み方',['s7']],['油の湖',['s8','k1']],['銀色の湖',['s6','k2']],['古い船',['s13','s14']],['航路のメロディ',['s11','s12','k3','k4']]];
function stories(){const c=show(`${topbar('おはなし')}<div class="list" style="max-width:none"><button class="btn" id="play">序章を遊ぶ</button>
  ${STORIES.map(([n,keys],i)=>{const open=book.seen(keys[0]);return `<button class="btn sub" data-r="${i}" ${open?'':'disabled'}>${open?n:'まだ読めません'}</button>`}).join('')}</div>`,'menu-layout stories-menu');
  wire(c);$('#play',c).onclick=()=>{wood();flow(0)};
  c.querySelectorAll('[data-r]').forEach(b=>b.onclick=()=>{wood();const keys=STORIES[+b.dataset.r][1].filter(k=>book.seen(k));const read=i=>i>=keys.length?stories():scene(keys[i],()=>read(i+1));read(0)})}
function pick(){const c=show(`${topbar('選択プレイ')}<div class="list" style="max-width:none">${STAGES.map((s,i)=>`<button class="btn sub" data-s="${i}">${s.name}</button>`).join('')}</div>`,'menu-layout stage-menu');
  wire(c);c.querySelectorAll('[data-s]').forEach(b=>b.onclick=()=>{wood();R=null;enter(+b.dataset.s)})}
// 連続プレイ：章を選び、レベルを選ぶ。NGと最高記録は章ごと
function levels(){const c=show(`${topbar('連続プレイ')}<div class="say"><span class="nar">章を選んでください。章の中の面を順に進みます。NGも最高記録も、章ごとに数えます。</span></div>
  <div class="list" style="max-width:none">${CHAPTERS.map((ch,i)=>{const sp=chapterSpan(STAGES,ch);return `<button class="btn sub" data-c="${i}">${ch.name}<small style="display:block;font-size:12px">全${sp.count}面　最高 ${LEVELS.map(l=>`${l.name}${book.best(`${ch.id}/${l.id}`)}`).join('　')}</small></button>`}).join('')}${LEVELS.some(l=>book.best(l.id))?`<p class="nar" style="margin:4px 0 0;font-size:13px">以前の版の通しの記録：${LEVELS.filter(l=>book.best(l.id)).map(l=>`${l.name} ${book.best(l.id)}面`).join('　')}</p>`:''}</div>`,'menu-layout levels-menu');
  wire(c);c.querySelectorAll('[data-c]').forEach(b=>b.onclick=()=>{wood();chapterLevels(CHAPTERS[+b.dataset.c])})}
function chapterLevels(ch){const sp=chapterSpan(STAGES,ch);const c=show(`${topbar(ch.name)}<div class="say"><span class="nar">全${sp.count}面を順に進みます。沈んだり関門に当たったりするとNGです。ノーマルとエキスパートでは、出航するまで深さが見えません。</span></div>
  <div class="list" style="max-width:none">${LEVELS.map(l=>`<button class="btn sub" data-l="${l.id}">${l.name}<small style="display:block;font-size:14px">${l.note}　最高 ${book.best(`${ch.id}/${l.id}`)}/${sp.count}面</small></button>`).join('')}<button class="btn sub" id="back">章を選ぶ</button></div>`,'menu-layout levels-menu');
  wire(c);$('#back',c).onclick=()=>{wood();levels()};c.querySelectorAll('[data-l]').forEach(b=>b.onclick=()=>{unlock();clack();R=new ContinuousRun(b.dataset.l,sp.count,{id:ch.id,name:ch.name,start:sp.start});enter(sp.start)})}
// 面に入る。新しい要素の紙芝居は初回だけ流す
function enter(n){const list=(STAGES[n].intro??[]).filter(k=>!book.seen(k));
  const play=i=>{if(i>=list.length)return stage(n);book.markSeen(list[i]);scene(list[i],()=>play(i+1))};play(0)}
function question(base){const list=CHALLENGES[base.id];if(!list?.length)return{};let i=Math.floor(Math.random()*list.length);if(list.length>1&&i===lastQuestion[base.id])i=(i+1)%list.length;lastQuestion[base.id]=i;return list[i]}
function ngText(){if(!R)return'';return R.level.limit===null?`失敗 ${R.ng}回`:`やり直し あと${R.left}回`}

function scene(k,next){const s=SCENES[k];book.markSeen(k);const c=show(`${topbar(s.lesson?'比重の話':'おはなし')}<div class="frame">${s.lesson?lessonFigure(s.lesson):ART[s.art]()}</div>
  <div class="say"><span class="nar">${s.nar}</span><span class="who" style="margin-top:4px">${s.who}</span>${s.say}</div><button class="btn" id="n">つづき</button>`,'story-layout');
  wire(c);$('#n',c).onclick=()=>{wood();next()}}

/* ---------- 序章：天秤 ---------- */
const balanceArt=(tilt,water)=>ART[water?'balance-water':'balance-air']();
function bal1(next){const c=show(`${topbar('序章 1　天秤')}<div class="frame" id="f">${balanceArt(0,false)}</div>
  <div class="say" id="t"><span class="nar">見習いは、王冠と同じ重さの純金を用意しました。天秤で比べてみましょう。</span></div><button class="btn" id="a">空気の中で量る</button>`,'story-layout');
  wire(c);$('#a',c).onclick=function(){wood();this.textContent='つづき';$('#t',c).innerHTML='<span class="who">見習い</span>つり合いました。重さでは見分けられません……。';this.onclick=()=>{wood();next()}}}
function bal2(next){const c=show(`${topbar('序章 2　水の中の天秤')}<div class="frame" id="f">${balanceArt(0,false)}</div>
  <div class="say" id="t"><span class="who">アルキメデス</span>見習いよ、分かったぞ。王冠と純金を水の中で、もう一度比べてごらん。</div><button class="btn" id="a">水に沈める</button>`,'story-layout');
  wire(c);$('#a',c).onclick=function(){bell(84);$('#f',c).innerHTML=balanceArt(12,true);
    this.textContent='つづき';$('#t',c).innerHTML='<span class="who">見習い</span>えっ？ 王冠の側が上がりました！';this.onclick=()=>{wood();next()}}}
function quiz(next){const O=[['王冠のほうが、もともと軽いから',0],['王冠のほうが体積が大きく、水を多く押しのけたから',1],['水の中では、金だけが重くなるから',0]];
  const c=show(`${topbar('序章 3　なぜ？')}<div class="frame">${balanceArt(12,true)}</div><div class="say" id="t"><span class="who">アルキメデス</span>空気の中ではつり合ったのに、水の中では王冠が上がった。なぜだと思う？</div>
  <div class="list" style="max-width:none;gap:12px;margin-top:6px">${O.map((o,i)=>`<button class="choice" data-i="${i}"><span class="key">${'ABC'[i]}</span><span class="txt">${o[0]}</span><span class="go" aria-hidden="true">▶</span></button>`).join('')}</div>`,'story-layout');
  wire(c);c.querySelectorAll('[data-i]').forEach(b=>b.onclick=()=>{const ok=O[+b.dataset.i][1];if(ok){jingle();
    $('#t',c).innerHTML='<span class="who">アルキメデス</span>そのとおり。押しのけた液体の重さが、浮く力になる。王冠は体積が大きいので、純金より強く浮いたのだ。';
    $('.list',c).classList.add('foot');$('.list',c).style.marginTop='';$('.list',c).innerHTML='<button class="btn" id="n">つづき</button>';$('#n',c).onclick=()=>{wood();next()}}
    else{tap();$('#t',c).innerHTML='<span class="who">アルキメデス</span>ふむ。空気の中では、重さはつり合っていたぞ。もう一度考えてごらん。'}})}

/* ---------- 航路の盤面 ---------- */
let run=0;
let R=null;
const book=(()=>{try{return new ModeBook(window.localStorage)}catch{return new ModeBook(null)}})();
const lastQuestion={};
function stopRun(){run++}
// 動きを減らす設定の端末でも、船の動きは内容の一部なので、一瞬にせず短くするだけにする
const calm=()=>matchMedia('(prefers-reduced-motion:reduce)').matches?0.6:1;
function wait(ms){return new Promise(r=>setTimeout(r,ms*calm()))}
function tween(ms,fn){const id=run;ms*=calm();return new Promise(res=>{const t0=performance.now();
  const f=now=>{if(id!==run)return;const p=Math.min(1,(now-t0)/ms),e=p*p*(3-2*p);fn(e);if(p<1)requestAnimationFrame(f);else res()};requestAnimationFrame(f)})}

// 航路のメロディの面は src/ui/melody.js が受け持つ。画面の道具をまとめて渡す
const melodyCtx={show,topbar,wire,audio,book,ngText,finish,pick,enter:n=>enter((R?.start??0)+n),wait,run:()=>R,token:()=>run,alive:id=>id===run,muted:()=>muted};
function stage(n){stopRun();const base=STAGES[n];if(base.kind==='melody'){return melodyStage(n,base,base.route??question(base),melodyCtx)}
  classicStage(n,{area:AREA,...base,...question(base)},melodyCtx)}

function finish(){stopRun();const run0=R,clear=run0.complete,ch=run0.chapter;const c=show(`${topbar(clear?'CHAPTER CLEAR':'GAME OVER')}<div class="frame">${ART.harbor()}</div>
  <div class="say"><span class="who">${clear?'エウレカ！':'見習い'}</span>${clear?`${ch?ch.name+'の':'全部の'}面をクリアしました。`:'今回はここまで。まだ分からないことが、見つかりました。'}<br><span class="nar">${run0.level.name}　クリア ${run0.cleared}/${run0.stageCount}面　NG ${run0.ng}回　最高 ${book.best(run0.bestKey)}面</span></div>
  <div class="row2"><button class="btn sub" id="ch">章を選ぶ</button><button class="btn" id="n">表紙へ</button></div>`,'story-layout');
  wire(c);$('#ch',c).onclick=()=>{wood();R=null;levels()};$('#n',c).onclick=()=>{wood();R=null;title()}}

function flow(){scene('s1',()=>scene('s2',()=>bal1(()=>scene('s3',()=>scene('s4',()=>bal2(()=>quiz(()=>scene('s9',()=>scene('s10',()=>scene('s5',()=>levels()))))))))))}
// ---- 通信なしで使う仕組みと、新しい版の案内（F-012） ----
function setupOffline(){if(!document.querySelector('meta[name="float-offline"]')||!('serviceWorker' in navigator))return;
  const updates=createUpdateManager({serviceWorker:navigator.serviceWorker,currentVersion:APP_VERSION,canApply:()=>!document.querySelector('.card:not(.leave) #go:disabled'),reload:()=>location.reload(),
    onChange:info=>{const n=document.getElementById('update-notice');if(!n)return;n.hidden=info?.status!=='ready'}});
  document.getElementById('update-apply').onclick=()=>updates.apply();
  updates.start().catch(()=>{/* 登録できない環境では、通信ありでそのまま遊べる */});
  // アプリへ戻ったときにも新しい版を確かめる
  document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')updates.check().catch(()=>{})})}
window.__float={STAGES,go:n=>stage(n),get G(){return G}};
title();
setupOffline();
