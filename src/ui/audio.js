// 音の土台（出力の余裕、残響、消音）は AQUA NOTES の audio.js に合わせた。
// 音程のある音はFM音源、打楽器はPSGのノイズ（src/sound）で鳴らす。音色は実機で詰める。
import { renderAll } from '../sound/psg-render.js';

export const DEFAULT_LATENCY_MS = 30;
const hz = midi => 440 * 2 ** ((midi - 69) / 12);

export class FloatAudio {
  constructor({ latencyMs = DEFAULT_LATENCY_MS } = {}) { this.ctx = null; this.muted = false; this.latencyMs = latencyMs; this.drums = null; }

  // スマホは操作の中でしか音を始められないので、最初のタップで準備する
  unlock() {
    if (!this.ctx) {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return false;
      try { this.ctx = new Ctx({ latencyHint: this.latencyMs / 1000 }); } catch { this.ctx = new Ctx(); }
      this.master = this.ctx.createGain();
      this.master.gain.value = this.muted ? 0 : 0.9;
      const comp = this.ctx.createDynamicsCompressor();
      comp.threshold.value = -14; comp.ratio.value = 3;
      const dry = this.ctx.createGain(); dry.gain.value = 0.85;
      const wet = this.ctx.createGain(); wet.gain.value = 0.2;
      const reverb = this.ctx.createConvolver();
      reverb.buffer = this.#impulse(0.9);
      this.bus = this.ctx.createGain();
      this.bus.connect(dry).connect(comp);
      this.bus.connect(reverb).connect(wet).connect(comp);
      comp.connect(this.master).connect(this.ctx.destination);
      // 打楽器の音は、操作を止めないよう一拍おいて作る
      setTimeout(() => this.#prepareDrums(), 0);
    }
    if (this.ctx.state === 'suspended') this.ctx.resume();
    return true;
  }
  #impulse(seconds) {
    const rate = this.ctx.sampleRate, length = Math.floor(rate * seconds);
    const buffer = this.ctx.createBuffer(1, length, rate), data = buffer.getChannelData(0);
    for (let i = 0; i < length; i++) data[i] = (Math.random() * 2 - 1) * 0.6 * (1 - i / length) ** 3.2;
    return buffer;
  }
  setMuted(muted) {
    this.muted = muted;
    if (this.ctx) this.master.gain.setTargetAtTime(muted ? 0 : 0.9, this.ctx.currentTime, 0.03);
  }
  #prepareDrums() {
    if (this.drums) return;
    const rate = this.ctx.sampleRate;
    this.drums = Object.fromEntries(Object.entries(renderAll(rate)).map(([name, data]) => {
      const buffer = this.ctx.createBuffer(1, data.length, rate);
      buffer.copyToChannel(data, 0);
      return [name, buffer];
    }));
  }
  // PSGの打楽器を鳴らす。音の準備が済むまでは鳴らさない
  drum(name, gain = 0.5, delay = 0) {
    if (!this.ctx || this.muted || !this.drums?.[name]) return;
    const src = this.ctx.createBufferSource(), v = this.ctx.createGain();
    src.buffer = this.drums[name];
    v.gain.value = gain * 3; // PSGの出力は小さいので、深さの音と釣り合うように上げる
    src.connect(v).connect(this.bus);
    src.start(this.ctx.currentTime + delay);
  }
  // FM音源の1音。変調を立ち上がりで強くし、余韻で弱めて、明るさが引いていくようにする
  #fm(freq, gain, length, at, ratio = 2, peak = 1.1, rest = 0.06) {
    const ctx = this.ctx, car = ctx.createOscillator(), mod = ctx.createOscillator(), depth = ctx.createGain(), env = ctx.createGain();
    car.frequency.value = freq;
    mod.frequency.value = freq * ratio;
    depth.gain.setValueAtTime(freq * peak, at);
    depth.gain.exponentialRampToValueAtTime(freq * rest, at + length * 0.6);
    env.gain.setValueAtTime(0.0001, at);
    env.gain.linearRampToValueAtTime(gain, at + 0.006);
    env.gain.exponentialRampToValueAtTime(0.0001, at + length);
    mod.connect(depth).connect(car.frequency);
    car.connect(env).connect(this.bus);
    for (const o of [mod, car]) { o.start(at); o.stop(at + length + 0.02); }
  }
  // 深さの音
  bell(midi, gain = 0.2, length = 1.1) {
    if (this.ctx && !this.muted) this.#fm(hz(midi), gain, length, this.ctx.currentTime);
  }
  wood(delay = 0) { this.drum('rim', 0.55, delay); }
  clack() { this.wood(0); this.wood(0.16); } // 拍子木
  tap() { this.drum('hat', 0.3); }
  // 荷物の着地。重い荷ほど低く鳴らす
  land(weight) { this.drum(weight >= 50 ? 'kick' : weight >= 15 ? 'tom' : weight >= 8 ? 'rim' : 'hat', 0.5); }
  sink() { this.drum('crash', 0.5); this.drum('kick', 0.6); }
  miss() { this.drum('snare', 0.5); }
  jingle() { [84, 88, 91, 96].forEach((m, i) => setTimeout(() => this.bell(m, 0.14, 0.7), i * 130)); this.drum('openHat', 0.3, 0.39); }
}
