// 可変寸法の絵。高さ・位置・液体の切替は classic.js の値を使う。
export function classicArtDefs() {
  return `<pattern id="classic-metal" patternUnits="userSpaceOnUse" width="17" height="13"><rect width="17" height="13" fill="#aab3bd"/><path d="M1 4l10-2m-7 9l12-3" stroke="#e3e6e9" stroke-width="1.5"/><path d="M3 6l5-1m3 7l4-1" stroke="#727d8b" stroke-width=".8"/></pattern>
    <pattern id="classic-grain" patternUnits="userSpaceOnUse" width="19" height="15"><path d="M1 5l10-3m2 8l5-2M3 14l7-2" stroke="#fffaf0" stroke-width="1.4" opacity=".5"/><path d="M4 7l4-1m6 6l4-1" stroke="#23304a" stroke-width=".7" opacity=".12"/></pattern>
    <pattern id="classic-band" patternUnits="userSpaceOnUse" width="11" height="9"><rect width="11" height="9" fill="#2e7d5b" fill-opacity=".17"/><path d="M0 7l11-5m-3 8l4-2" stroke="#2e7d5b" stroke-width="1.1" opacity=".35"/></pattern>
    <pattern id="classic-flag" patternUnits="userSpaceOnUse" width="13" height="10"><rect width="13" height="10" fill="#d6452c"/><path d="M1 4l9-2m-6 7l8-2" stroke="#f39a73" stroke-width="1.2"/></pattern>`;
}

export function classicCradleArt(hx, hullWidth, bottom) {
  const ground = bottom + 12;
  const supports = [hx + 20, hx + hullWidth - 20].map(x => `<path d="M${x - 9} ${bottom}h18v4h-18Z" fill="url(#melody-wood)" stroke="#23304a" stroke-width="1.2"/>
    <path d="M${x - 5} ${bottom + 4}l-2 10h14l-2-10Z" fill="url(#melody-wood)" stroke="#5f3b1c" stroke-width="1.2"/><path d="M${x - 3} ${bottom + 5}l6 7m-6 0l6-7" stroke="#f4c57b" stroke-width="1"/>`).join("");
  return `<g class="classic-cradle-art" data-support-y="${bottom}"><path d="M0 ${ground}H${hx + hullWidth + 8}L${hx + hullWidth + 70} 230H0Z" fill="url(#melody-sand)" stroke="#23304a" stroke-width="2"/>
    <path d="M0 ${ground + 4}H${hx + hullWidth + 5}l57 92M10 ${ground + 17}l12-2m29 11l17-3m32 12l15-2m35 21l13-2" fill="none" stroke="#fff0c6" stroke-width="1.8" opacity=".8"/>${supports}</g>`;
}

export function classicLeverArt(x, plane) {
  return `<g class="classic-lever-art" data-plane-y="${plane}"><path d="M${x + 27} ${plane + 20}V230h12V${plane + 20}Z" fill="url(#classic-metal)" stroke="#23304a" stroke-width="1.4"/>
    <path d="M${x + 22} ${plane + 20}h22v6h-22Z" fill="url(#melody-stone)" stroke="#23304a" stroke-width="1.2"/>
    <g id="arm"><path d="M${x + 9} ${plane + 5}l22 14h30v-5H${x + 33}L${x + 14} ${plane + 1}Z" fill="#efb32a" stroke="#23304a" stroke-width="2" stroke-linejoin="round"/>
    <circle cx="${x + 32}" cy="${plane + 16}" r="4.5" fill="url(#classic-metal)" stroke="#23304a" stroke-width="1.4"/>
    <defs><clipPath id="classic-lever-cap"><rect x="${x - 2}" y="${plane}" width="23" height="16"/></clipPath></defs><path class="lever-contact" clip-path="url(#classic-lever-cap)" d="M${x + 1} ${plane + 1}q8-2 16 0v6q-8 4-16 0Z" fill="#d6452c" stroke="#23304a" stroke-width="1.6"/><path d="M${x + 4} ${plane + 3}h10" stroke="#f7b885" stroke-width="1.2"/></g>
    <path d="M${x - 6} ${plane}H${x + 66}" stroke="#d6452c" stroke-width="1.5" stroke-dasharray="4 3"/></g>`;
}

export function classicChamberArt(hx, hullWidth, liquidColor) {
  const left = hx - 10, right = hx + hullWidth + 2;
  return `<g class="classic-chamber-art" aria-hidden="true"><path d="M${left} 232V57q0-8 8-8H${right - 5}q6 0 6 8v175h-7V61H${left + 7}v171Z" fill="url(#melody-stone)" stroke="#23304a" stroke-width="1.8" stroke-linejoin="round"/>
    <path d="M${left + 1} 54H${right - 1}" stroke="#fff0c6" stroke-width="2"/><path d="M${left + 8} 70h8v15M${right - 9} 70h-8v15" fill="none" stroke="url(#classic-metal)" stroke-width="5"/>
    <path d="M${left + 10} 88q-5 7 2 7t2-7l-2-3Z" fill="${liquidColor}" stroke="#23304a" stroke-width=".9"/><path d="M${right - 19} 88q-5 7 2 7t2-7l-2-3Z" fill="${liquidColor}" stroke="#23304a" stroke-width=".9"/>
    <circle cx="${right - 2}" cy="74" r="5" fill="url(#melody-wood)" stroke="#23304a" stroke-width="1.2"/><path d="M${right - 5} 71l6 6m-6 0l6-6" stroke="#fff0c6" stroke-width="1.1"/></g>`;
}

export function classicChartLiquid(x, y, width, height, tint) {
  return `<g class="classic-chart-liquid"><rect x="${x}" y="${y}" width="${width}" height="${height}" fill="${tint}"/><rect x="${x}" y="${y}" width="${width}" height="${height}" fill="url(#classic-grain)" opacity=".55"/></g>`;
}

export function classicChartLever(x, plane, width, bottom) {
  const mid = x + width / 2;
  return `<g class="classic-map-lever" data-plane-y="${plane}"><path d="M${x + 4} ${plane}H${x + width - 4}" stroke="#d6452c" stroke-width="2.4" stroke-dasharray="5 3"/><path d="M${mid} ${plane + 4}V${bottom}" stroke="#23304a" stroke-width="3"/><path d="M${mid + 1} ${plane + 5}l10 7" stroke="#efb32a" stroke-width="3"/><circle cx="${mid}" cy="${plane}" r="3.5" fill="#d6452c" stroke="#23304a" stroke-width="1"/></g>`;
}

export function classicChartChamber(x, y, width, height) {
  return `<g class="classic-map-chamber" data-split-x="${x + width / 2}"><path d="M${x + 4} ${y + height - 2}V${y + 7}q0-3 3-3h${width - 14}q3 0 3 3V${y + height - 2}" fill="none" stroke="#5f3b1c" stroke-width="2.6"/>
    <path d="M${x + 7} ${y + 6}h${width - 14}" stroke="#f4c57b" stroke-width="1.1"/><circle cx="${x + width / 2}" cy="${y + 9}" r="4.5" fill="url(#classic-metal)" stroke="#23304a" stroke-width="1"/><path d="M${x + width / 2 - 2.5} ${y + 6.5}l5 5m-5 0l5-5" stroke="#fffaf0" stroke-width="1.1"/><path d="M${x + width / 2} ${y + 18}V${y + height - 3}" stroke="#23304a" stroke-width=".8" stroke-dasharray="2 4" opacity=".35"/></g>`;
}

export function classicHarborFlag(x, y) {
  return `<g class="classic-harbor-flag"><path d="M${x - 8} ${y + 2}V${y + 30}" stroke="#23304a" stroke-width="2.5"/><path d="M${x - 8} ${y + 2}l18 6l-18 6Z" fill="url(#classic-flag)" stroke="#23304a" stroke-width="1.5" stroke-linejoin="round"/><path d="M${x - 6} ${y + 4}l10 3" stroke="#ffd8b3" stroke-width=".8"/></g>`;
}

export function classicSafeBand(x, y, width, height) {
  return `<g class="classic-safe-band" data-range-y="${y},${y + height}"><rect x="${x}" y="${y}" width="${width}" height="${height}" fill="url(#classic-band)" stroke="#2e7d5b" stroke-width="1.6" stroke-dasharray="5 3"/></g>`;
}
