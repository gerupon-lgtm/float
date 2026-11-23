// 紙芝居の絵（Codex 作、docs/visual-samples）。文字は画面側で重ねる。
import { GRAPHICS } from './graphics.js';

export const INK='#23304a';
// まだ絵が届いていない場面は、fallback の絵を仮に使う（Codex が GRAPHICS に足すと自動で切り替わる）
const later=(key,fallback,alt)=>picture(GRAPHICS[key]?key:fallback,alt);
const picture=(key,alt)=>`<img src="${GRAPHICS[key]}" alt="${alt}" width="960" height="720" style="display:block;width:100%;height:auto">`;
export const ART={
  arrest:()=>picture('arrest','王の前で、兵士が金細工師を出口へ連れて行く絵'),
  command:()=>picture('command','王がアルキメデスと見習いに命じる絵'),
  'balance-air':()=>picture('balance-air','王冠と純金が空気中でつり合う天秤'),
  'balance-water':()=>picture('balance-water','水槽の中で王冠の側が上がった天秤。両方とも水の中'),
  cargo:()=>picture('chapter-cargo','港に届いた木箱と板の山を見上げる師匠と見習い'),
  oil:()=>picture('chapter-oil','水と油を仕切る入れ替え室'),
  silver:()=>picture('chapter-silver','銀色の湖で荷を山積みした船が浅く浮き、岸で見習いが驚く'),
  workshop:()=>picture('workshop','工房で、師匠が見習いに天秤を示す絵'),
  request:()=>picture('request','王が王冠を前に、師匠と金細工師へ話す絵'),
  bath:()=>picture('bath','師匠が湯船で気づく絵。湯があふれている'),
  eureka:()=>`<div class="picture">${picture('eureka','師匠が札と湯気で体を隠して走る絵')}<span class="sign" style="left:49.5%;top:67%;transform:translate(-50%,-50%) rotate(4deg)">エウレカ！</span></div>`,
  harbor:()=>picture('harbor','見習いと師匠が港で船を見る絵'),
  melody:()=>picture('chapter-melody','港で師匠が船から木箱を下ろし、見習いが耳を澄ませて音の変化に驚く'),
  'melody-chart':()=>picture('chapter-melody-chart','港と音符を描いた航海図を広げる師匠と、のぞき込む見習い'),
  'old-ship':()=>later('chapter-old-ship','harbor','古い船の船底から水がしみ込み、見習いが驚く絵'),
  screw:()=>later('chapter-screw','chapter-cargo','師匠が船にらせんの筒（スクリュー）を据えつけ、見習いが筒を回す絵'),
  storm:()=>later('chapter-storm','chapter-silver','嵐の夜、波に打たれる傷んだ船で、見習いがスクリューを回し、師匠が水を見つめる絵'),
  shipwright:()=>later('chapter-shipwright','harbor','港で船大工アルキアスが船を見上げ、師匠と見習いが迎える絵'),
  repaired:()=>later('chapter-repaired','harbor','新しい板で直された船の前で、アルキアスと師匠と見習いが並ぶ絵'),
  finale:()=>later('chapter-finale','command','宮殿で、王の前に模型の船と水槽を置き、師匠と見習いが船の旋律を聴かせる絵'),
};
