// PSGの打楽器を、あらかじめ音のデータにする。SCCシミュレーターの psg-ref.js・psg-drums.js をそのまま使う。
// 鳴らすたびに計算せず、効果音として再生するので、スマホの負荷が軽い。
import { PsgRef, PSG_TABLE } from './psg-ref.js';
import { PsgDrums, DRUM_MAP } from './psg-drums.js';

const PSG_TICK_RATE = (3579545 / 2) / 8; // PSGの計算1回の速さ
const CONTROL_SECONDS = 128 / 48000;     // 音量・音程を更新する間隔

// GMの打楽器の番号。FLOAT NOTES の使い道に名前を付ける
export const SFX_NOTES = Object.freeze({ kick: 36, rim: 37, snare: 38, hat: 42, openHat: 46, crash: 49, tom: 45 });

export function renderDrum(note, sampleRate, velocity = 127) {
  const sound = DRUM_MAP[note];
  if (!sound) throw new Error(`打楽器の番号が表にありません：${note}`);
  const psg = new PsgRef(), drums = new PsgDrums(psg);
  const length = Math.ceil((sound.len + 0.01) * sampleRate);
  const out = new Float32Array(length), silent = PSG_TABLE[0], ticksPerSample = PSG_TICK_RATE / sampleRate;
  drums.trigger(note, velocity);
  let phase = 0, control = 0;
  for (let i = 0; i < length; i++) {
    phase += ticksPerSample;
    const n = Math.floor(phase);
    phase -= n;
    if (n > 0) out[i] = psg.sumTicks(n) / n - silent;
    control += 1 / sampleRate;
    if (control >= CONTROL_SECONDS) { drums.tick(control); control = 0; }
  }
  return out;
}

export function renderAll(sampleRate) {
  return Object.fromEntries(Object.entries(SFX_NOTES).map(([name, note]) => [name, renderDrum(note, sampleRate)]));
}
