// 紙芝居の絵。工房は Codex の絵、そのほかは仮の図形（docs/request-codex-visual.md）。
import { GRAPHICS } from './graphics.js';

export const INK='#23304a';
const face=(x,y,r,skin='#f2c79b')=>`<circle cx="${x}" cy="${y}" r="${r}" fill="${skin}" stroke="${INK}" stroke-width="3"/>`;
const eyes=(x,y,g=7)=>`<circle cx="${x-g}" cy="${y}" r="2.6" fill="${INK}"/><circle cx="${x+g}" cy="${y}" r="2.6" fill="${INK}"/>`;
const apprentice=(x,y,s='<path d="M-6 10q6 6 12 0" fill="none" stroke="#23304a" stroke-width="2.6"/>')=>`<g transform="translate(${x} ${y})">
  <path d="M-24 92 L-18 34 Q0 24 18 34 L24 92Z" fill="#e7dfc9" stroke="${INK}" stroke-width="3"/><path d="M-16 40 L16 62" stroke="#d6452c" stroke-width="7"/>
  ${face(0,0,25)}<path d="M-25 -2Q-22 -30 2 -28Q24 -28 25 -4Q12 -18 -2 -14Q-14 -12 -25 -2Z" fill="#6b3f1d" stroke="${INK}" stroke-width="3"/>
  ${eyes(0,1)}<g transform="translate(0 0)">${s}</g></g>`;
const master=(x,y)=>`<g transform="translate(${x} ${y})">
  <path d="M-36 110 L-26 38 Q0 24 26 38 L36 110Z" fill="#fffaf0" stroke="${INK}" stroke-width="3"/><path d="M-22 44L24 104" stroke="#3f97c0" stroke-width="9"/>
  ${face(0,0,29)}<path d="M-26 4Q-30 52 0 60Q30 52 26 4Q14 18 0 15Q-14 18 -26 4Z" fill="#f0f0ea" stroke="${INK}" stroke-width="3"/>
  <path d="M-29 -4Q-40 -14 -30 -24M29 -4Q40 -14 30 -24" fill="none" stroke="${INK}" stroke-width="5"/>${eyes(0,-5,10)}</g>`;
const king=(x,y)=>`<g transform="translate(${x} ${y})">
  <path d="M-48 120 L-38 40 Q0 22 38 40 L48 120Z" fill="#7a3a8c" stroke="${INK}" stroke-width="3"/>
  ${face(0,0,32)}<path d="M-30 12Q-20 44 0 42Q20 44 30 12Q14 22 0 20Q-14 22 -30 12Z" fill="#3a2a22" stroke="${INK}" stroke-width="3"/>
  <path d="M-26 -22 L-30 -52 L-13 -36 L0 -56 L13 -36 L30 -52 L26 -22Z" fill="#efb32a" stroke="${INK}" stroke-width="3"/>${eyes(0,-4,11)}</g>`;
export const crown=(x,y,s=1)=>`<path transform="translate(${x} ${y}) scale(${s})" d="M-22 12 L-27 -14 L-11 0 L0 -18 L11 0 L27 -14 L22 12Z" fill="#efb32a" stroke="${INK}" stroke-width="3"/>`;
const smith=(x,y)=>`<g transform="translate(${x} ${y})"><path d="M-26 80 L-22 30 Q0 22 22 30 L26 80Z" fill="#5a4a3a" stroke="${INK}" stroke-width="3"/>
  ${face(0,0,23)}${eyes(4,-2,6)}<path d="M-6 9q8 -5 14 2" fill="none" stroke="${INK}" stroke-width="2.6"/><path d="M30 -24q7 10 0 14q-7 -4 0 -14z" fill="#8fd0d4" stroke="${INK}" stroke-width="2"/></g>`;
const wrap=(bg,inner)=>`<svg viewBox="0 0 360 230" role="img"><rect width="360" height="230" fill="${bg}"/><g filter="url(#wob)">${inner}</g></svg>`;
const picture=(key,alt)=>`<img src="${GRAPHICS[key]}" alt="${alt}" width="960" height="720" style="display:block;width:100%;height:auto">`;
export const ART={
  workshop:()=>picture('workshop','工房で、師匠が見習いに天秤を示す絵'),
  request:()=>picture('request','王が王冠を前に、師匠と金細工師へ話す絵'),
  bath:()=>picture('bath','師匠が湯船で気づく絵。湯があふれている'),
  eureka:()=>`<div class="picture">${picture('eureka','師匠が札と湯気で体を隠して走る絵')}<span class="sign" style="left:49.5%;top:67%;transform:translate(-50%,-50%) rotate(4deg)">エウレカ！</span></div>`,
  harbor:()=>picture('harbor','見習いと師匠が港で船を見る絵'),
  order:()=>wrap('#a6d8c5',`<rect y="178" width="360" height="52" fill="#c9a06a"/><rect x="250" y="66" width="86" height="112" fill="#fffaf0" stroke="${INK}" stroke-width="3"/>${master(96,72)}${apprentice(218,92)}`),
  surprise:()=>wrap('#d7dde2',`<rect y="150" width="360" height="80" fill="#aab3bd"/><path d="M40 182q40 -14 80 0t80 0t80 0t60 -4" stroke="#fffaf0" stroke-width="5" fill="none"/><g transform="translate(250 150)"><path d="M-64 -56H64L46 -8H-46Z" fill="#b9793c" stroke="${INK}" stroke-width="3"/>${[-30,0,30,-16,14,-2].map((x,i)=>`<rect x="${x-14}" y="${-78-Math.floor(i/3)*22-(i>4?22:0)}" width="28" height="22" fill="#e7b76a" stroke="${INK}" stroke-width="3"/>`).join('')}</g>${apprentice(82,58,'<ellipse cx="0" cy="12" rx="6" ry="8" fill="#23304a"/>')}`)
};
