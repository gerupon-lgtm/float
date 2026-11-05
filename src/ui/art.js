// 紙芝居の絵（Codex 作、docs/visual-samples）。文字は画面側で重ねる。
import { GRAPHICS } from './graphics.js';

export const INK='#23304a';
const picture=(key,alt)=>`<img src="${GRAPHICS[key]}" alt="${alt}" width="960" height="720" style="display:block;width:100%;height:auto">`;
export const ART={
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
};
