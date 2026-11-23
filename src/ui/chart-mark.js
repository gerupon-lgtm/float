import { GRAPHICS } from './graphics.js';

// 航路図・航海図の、今の船の印（元の遊び方・スクリューの面・航路のメロディで共通）。
// 船底の深さに赤い線。荷の山が船の縁より高いときは、その分だけ上に「荷の山」の点線を足す。
// 橋の列では、点線（なければ赤い線）が橋桁の下の端より下にあれば通れる。
// 船の絵は、深さの目盛りの外（図の上の余白）に浮かべて、今どこを進んでいるかだけを示す。
// 目盛りの中に描くと、橋の列で船が橋の上にあるように見えるため。船の絵と船底の印は、細い点線でつなぐ
export function keelMark(x, yKeel, yPile = null, lane = null) {
  // lane：数なら船の絵の下端の高さ。{ y, label, color } なら、船の上に今鳴っている音名を書く（航路のメロディ）
  const laneY = typeof lane === 'number' ? lane : lane?.y ?? null, label = lane?.label, big = !!label;
  const bw = big ? 28 : 24, bh = big ? 12 : 11;
  let g = `<g class="chart-ship">${laneY != null ? `<path d="M${x} ${laneY + 1}V${(yPile ?? yKeel) - 2}" stroke="#23304a" stroke-opacity=".35" stroke-width="1" stroke-dasharray="1.5 2.5"/>
    <image href="${GRAPHICS.boat}" x="${x - bw / 2}" y="${laneY - bh}" width="${bw}" height="${bh}" preserveAspectRatio="none"/>${big ? `<rect x="${x - (8 + label.length * 5.5)}" y="${laneY - bh - 9.5}" width="${16 + label.length * 11}" height="15" rx="7.5" fill="#fffaf0" stroke="${lane.color ?? '#23304a'}" stroke-width="1.8"/>
      <text x="${x}" y="${laneY - bh + 1.5}" font-size="11.5" font-weight="700" text-anchor="middle" fill="${lane.color ?? '#23304a'}">${label}</text>` : ''}` : ''}<path d="M${x - 15} ${yKeel}h30" stroke="#d6452c" stroke-width="2.6"/><path d="M${x} ${yKeel + 1.5}l-5 7h10z" fill="#d6452c" stroke="#23304a" stroke-width="1"/>
    <text x="${x}" y="${yKeel + 18}" font-size="9" font-weight="700" text-anchor="middle" fill="#d6452c" stroke="#fffaf0" stroke-width="2.6" paint-order="stroke">船底</text>`;
  if (yPile != null && yKeel - yPile > 0.5) {
    g += `<path d="M${x} ${yKeel - 1}V${yPile}" stroke="#e07a1f" stroke-width="1.4" stroke-dasharray="2 2"/><path d="M${x - 16} ${yPile}h32" stroke="#fffaf0" stroke-width="5"/><path d="M${x - 15} ${yPile}h30" stroke="#c0560e" stroke-width="2.6" stroke-dasharray="4 2.5"/>
      <text x="${x + 18}" y="${yPile + 3.5}" font-size="9" font-weight="700" fill="#b35a0d" stroke="#fffaf0" stroke-width="2.6" paint-order="stroke">荷の山</text>`;
  }
  return g + '</g>';
}
