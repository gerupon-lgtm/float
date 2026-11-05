// 配信する絵の場所。原本は docs/visual-samples/、配信用の軽い絵は public/graphics/ に置く。
export const GRAPHICS = {
  title: new URL('../../public/graphics/title-artwork.webp', import.meta.url).href,
  workshop: new URL('../../public/graphics/prologue-workshop.webp', import.meta.url).href,
  request: new URL('../../public/graphics/prologue-request.webp', import.meta.url).href,
  bath: new URL('../../public/graphics/prologue-bath.webp', import.meta.url).href,
  eureka: new URL('../../public/graphics/prologue-eureka-sign.webp', import.meta.url).href,
  harbor: new URL('../../public/graphics/prologue-harbor.webp', import.meta.url).href,
  'balance-air': new URL('../../public/graphics/balance-air.webp', import.meta.url).href,
  'balance-water': new URL('../../public/graphics/balance-water.webp', import.meta.url).href,
  'chapter-cargo': new URL('../../public/graphics/chapter-cargo.webp', import.meta.url).href,
  'chapter-oil': new URL('../../public/graphics/chapter-oil.webp', import.meta.url).href,
  'chapter-silver': new URL('../../public/graphics/chapter-silver.webp', import.meta.url).href,
  'boat': new URL('../../public/graphics/boat.webp', import.meta.url).href,
  'bridge': new URL('../../public/graphics/bridge.webp', import.meta.url).href,
  'shoal': new URL('../../public/graphics/shoal.webp', import.meta.url).href,
  'gate-door': new URL('../../public/graphics/gate-door.webp', import.meta.url).href,
  'lever-arm': new URL('../../public/graphics/lever-arm.webp', import.meta.url).href,
  'chamber': new URL('../../public/graphics/chamber.webp', import.meta.url).href,
  'cargo-crate': new URL('../../public/graphics/cargo-crate.webp', import.meta.url).href,
  'cargo-plank': new URL('../../public/graphics/cargo-plank.webp', import.meta.url).href,
  'cargo-sack': new URL('../../public/graphics/cargo-sack.webp', import.meta.url).href,
  'cargo-jar': new URL('../../public/graphics/cargo-jar.webp', import.meta.url).href,
  'cargo-stone': new URL('../../public/graphics/cargo-stone.webp', import.meta.url).href,
  'cargo-iron': new URL('../../public/graphics/cargo-iron.webp', import.meta.url).href,
  'cargo-lead': new URL('../../public/graphics/cargo-lead.webp', import.meta.url).href,
  'cargo-gold': new URL('../../public/graphics/cargo-gold.webp', import.meta.url).href,
  'liquid-water': new URL('../../public/graphics/liquid-water.webp', import.meta.url).href,
  'liquid-oil': new URL('../../public/graphics/liquid-oil.webp', import.meta.url).href,
  'liquid-mercury': new URL('../../public/graphics/liquid-mercury.webp', import.meta.url).href
};

// 荷物の名前と絵の対応
const CARGO = { 木箱: 'crate', 木の板: 'plank', 麦袋: 'sack', 壺: 'jar', 石: 'stone', 鉄: 'iron', 鉄箱: 'iron', 鉄の棒: 'iron', 鉛: 'lead', 金: 'gold', 金塊: 'gold', 大きな金塊: 'gold', 金の棒: 'gold' };
export const cargoArt = name => GRAPHICS[`cargo-${CARGO[name] ?? 'crate'}`];
