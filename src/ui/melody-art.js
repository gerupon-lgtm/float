// 航路のメロディの可変サイズの絵。高さ・位置は melody.js が渡した値を使う。
// 木目・紙のすき間は固定サイズの繰り返し模様なので、関門の幅が変わっても伸びない。
export function melodyArtDefs() {
  return `<pattern id="melody-wood" patternUnits="userSpaceOnUse" width="29" height="19">
    <rect width="29" height="19" fill="#cd8d43"/>
    <path d="M1 3l12-1m5 4l9-2M3 11l19-2M1 17l9-2m6 3l11-2" stroke="#f4c57b" stroke-width="1.5" stroke-linecap="round" opacity=".8"/>
    <path d="M3 6l6-1m7 8l11-2M8 18l8-1" stroke="#8a5a2e" stroke-width=".9" stroke-linecap="round" opacity=".65"/>
  </pattern><pattern id="melody-sand" patternUnits="userSpaceOnUse" width="21" height="17">
    <rect width="21" height="17" fill="#dfbd7d"/>
    <path d="M1 5l9-3m3 5l7-2M3 13l8-2m4 5l5-2" stroke="#fff0c6" stroke-width="1.7" stroke-linecap="round" opacity=".9"/>
    <path d="M4 6l4-1m5 7l4-1M1 17l7-2" stroke="#ac8048" stroke-width=".8" opacity=".7"/>
  </pattern><pattern id="melody-stone" patternUnits="userSpaceOnUse" width="31" height="21">
    <rect width="31" height="21" fill="#bcb3a1"/>
    <path d="M1 4l14-2m3 8l11-3M3 15l19-3m2 7l6-1" stroke="#ede4d2" stroke-width="1.6" stroke-linecap="round" opacity=".8"/>
    <path d="M5 8l6-2m7 9l8-1" stroke="#8c8373" stroke-width=".8" opacity=".65"/>
  </pattern><pattern id="melody-paper" patternUnits="userSpaceOnUse" width="17" height="13">
    <rect width="17" height="13" fill="#fffaf0"/>
    <path d="M2 4l5-2m4 7l4-2M1 12l6-1" stroke="#e8dcc5" stroke-width=".8" opacity=".7"/>
  </pattern>`;
}

export function melodyShoalArt(x, width, surface) {
  // 衝突時の移動量-16で面の先端 x が船首に一致する。停止位置と面の高さは変えない。
  const shape = `M${x - 24} 230L${x} ${surface}H${x + width - 8}L${x + width + 8} 230Z`;
  return `<g class="melody-shoal-art" data-plane-y="${surface}">
    <defs><clipPath id="melody-shoal-clip"><path d="${shape}"/></clipPath></defs>
    <g clip-path="url(#melody-shoal-clip)"><path d="${shape}" fill="url(#melody-sand)" stroke="#6f5637" stroke-width="2.3" stroke-linejoin="round"/>
    <path d="M${x + 2} ${surface + 3}H${x + width - 10}" stroke="#f7deaa" stroke-width="2"/>
    <path d="M${x + 10} ${surface + 16}l9-2m11 13l13-2m-22 24l11-1" fill="none" stroke="#b1874b" stroke-width="1.3" stroke-linecap="round"/>
    </g></g>`;
}

export function melodyBridgeArt(x, width, underside) {
  const left = x - 70, span = width + 140;
  // 輪郭をクリップし、線の太さで橋の下面が判定側へはみ出さないようにする。
  return `<g class="melody-bridge-art" data-plane-y="${underside}">
    <defs><clipPath id="melody-bridge-clip"><rect x="${left - 1}" y="0" width="${span + 2}" height="${underside}"/></clipPath></defs>
    <g clip-path="url(#melody-bridge-clip)">
      <path d="M${left + 1} 0V${underside}H${left + 14}V0M${x + width + 56} 0V${underside}H${x + width + 69}V0" fill="url(#melody-wood)" stroke="#23304a" stroke-width="1.8"/>
      <path d="M${left} ${underside - 16}l${span / 2}-.7l${span / 2} .7V${underside}H${left}Z" fill="url(#melody-wood)" stroke="#23304a" stroke-width="2" stroke-linejoin="round"/>
      <path d="M${left + 3} ${underside - 13}H${left + span - 3}" stroke="#f7d598" stroke-width="1.5" opacity=".85"/>
      <path class="bridge-underside" d="M${left} ${underside - 1}H${left + span}" stroke="#23304a" stroke-width="2"/>
      <path d="M${left + 4} ${underside - 11}l8 7m-8 0l8-7M${left + span - 12} ${underside - 11}l8 7m-8 0l8-7" stroke="#724720" stroke-width="1"/>
    </g></g>`;
}

export function melodyQuayArt(viewWidth, water) {
  const left = viewWidth - 62, top = water - 30;
  let stones = '';
  for (let row = 0; row < 7; row++) {
    const y = top + row * 19, offset = row % 2 ? -13 : 0;
    for (let col = 0; col < 3; col++) {
      const x = left + offset + col * 29;
      stones += `<path d="M${x + 1} ${y + 1}l26-.6l1 16.5l-27 .5Z" fill="url(#melody-stone)" stroke="#736957" stroke-width="1.2" stroke-linejoin="round"/>`;
    }
  }
  return `<defs><clipPath id="melody-quay-clip"><rect x="${left}" y="${top}" width="62" height="${230 - top}"/></clipPath></defs>
    <g class="melody-quay-art"><g clip-path="url(#melody-quay-clip)"><rect x="${left}" y="${top}" width="62" height="${230 - top}" fill="#bcb3a1"/>${stones}</g>
    <path d="M${left} ${top}V230" fill="none" stroke="#23304a" stroke-width="2"/>
    <path d="M${left} ${water - 34}l31-.5l31 .5v6H${left}Z" fill="url(#melody-wood)" stroke="#6b4827" stroke-width="1.2"/>
    <path d="M${viewWidth - 54} ${water - 46}q4-2 8 0v12h-8Z" fill="url(#melody-wood)" stroke="#23304a" stroke-width="1.2"/>
    <path d="M${viewWidth - 24} ${water - 54}V${water - 34}" stroke="#6b4827" stroke-width="3"/>
    <path d="M${viewWidth - 44} ${water - 73}l39-1l1 20l-39 .7Z" fill="#cf4934" stroke="#23304a" stroke-width="1.5" stroke-linejoin="round"/>
    <path d="M${viewWidth - 41} ${water - 70}l33-.8M${viewWidth - 39} ${water - 57}l12-.5m10 .5l10-.8" stroke="#ed9570" stroke-width="1" opacity=".7"/>
    </g>`;
}

export function melodyPileTag(rows) {
  return `<g class="pile"><path d="M193 6l39 .5l4 4l-.5 27l-3 2l-39-.4l-3-3l-.5-25Z" fill="url(#melody-paper)" stroke="#23304a" stroke-width="1.5" stroke-linejoin="round"/>
    <path d="M193 8l2 2m37-2l-2 2" stroke="#cdbb99" stroke-width="1.2"/>
    <text x="213" y="19" font-size="9" font-weight="700" text-anchor="middle" fill="#23304a">荷の山</text><text x="213" y="35" font-size="13" font-weight="700" text-anchor="middle" fill="#23304a">${rows}段</text></g>`;
}
