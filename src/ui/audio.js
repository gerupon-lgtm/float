// 深さの音と操作音。音の土台（出力の余裕、残響、消音）は AQUA NOTES の audio.js に合わせた。音色は実機で詰める。
export const DEFAULT_LATENCY_MS = 30;
const hz = midi => 440 * 2 ** ((midi - 69) / 12);

export class FloatAudio {
  constructor({ latencyMs = DEFAULT_LATENCY_MS } = {}) { this.ctx = null; this.muted = false; this.latencyMs = latencyMs; }

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
  #osc(type, freq, gain, length, at) {
    const o = this.ctx.createOscillator(), v = this.ctx.createGain();
    o.type = type; o.frequency.value = freq;
    v.gain.setValueAtTime(gain, at);
    v.gain.exponentialRampToValueAtTime(0.0001, at + length);
    o.connect(v).connect(this.bus);
    o.start(at); o.stop(at + length + 0.02);
  }
  // 深さの音。木を打ったような立ち上がりに、鐘の余韻を重ねる
  bell(midi, gain = 0.2, length = 1.1) {
    if (!this.ctx || this.muted) return;
    const t = this.ctx.currentTime, f = hz(midi);
    this.#osc('sine', f, gain, length, t);
    this.#osc('sine', f * 3.93, gain * 0.28, 0.14, t);
    this.#osc('sine', f * 2, gain * 0.16, length * 0.5, t);
  }
  wood(delay = 0) { if (this.ctx && !this.muted) this.#osc('square', 1700, 0.12, 0.05, this.ctx.currentTime + delay); }
  clack() { this.wood(0); this.wood(0.16); } // 拍子木
  tap() { if (this.ctx && !this.muted) this.#osc('triangle', 420, 0.09, 0.07, this.ctx.currentTime); }
  jingle() { [84, 88, 91, 96].forEach((m, i) => setTimeout(() => this.bell(m, 0.14, 0.7), i * 130)); }
}
