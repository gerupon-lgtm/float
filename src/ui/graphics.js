// 配信する絵の場所。原本は docs/visual-samples/、配信用の軽い絵は public/graphics/ に置く。
export const GRAPHICS = {
  title: new URL('../../public/graphics/title-artwork.webp', import.meta.url).href,
  workshop: new URL('../../public/graphics/prologue-workshop.webp', import.meta.url).href,
  request: new URL('../../public/graphics/prologue-request.webp', import.meta.url).href,
  bath: new URL('../../public/graphics/prologue-bath.webp', import.meta.url).href,
  eureka: new URL('../../public/graphics/prologue-eureka.webp', import.meta.url).href,
  harbor: new URL('../../public/graphics/prologue-harbor.webp', import.meta.url).href
};
