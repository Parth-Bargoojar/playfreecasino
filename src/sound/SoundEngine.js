// Lightweight Web Audio synth engine — no external assets required.
// Every sound is generated from oscillators / noise and routed through a single
// master gain node, so muting is instant and also silences in-progress sounds
// (Crash riser, Wheel whir). One shared instance lives for the whole app.

let engine = null

class SoundEngine {
  constructor() {
    this.ctx = null
    this.master = null
    this.muted = false
    this._noise = null
    this._last = {} // per-sound debounce timestamps
    this._crash = null
    this._wheel = null
  }

  init(muted) {
    this.muted = muted
  }

  // Lazily create the AudioContext (must follow a user gesture) and resume it.
  ensure() {
    if (typeof window === 'undefined') return null
    if (!this.ctx) {
      const AC = window.AudioContext || window.webkitAudioContext
      if (!AC) return null
      this.ctx = new AC()
      this.master = this.ctx.createGain()
      this.master.gain.value = this.muted ? 0 : 1
      this.master.connect(this.ctx.destination)
    }
    if (this.ctx.state === 'suspended') this.ctx.resume()
    return this.ctx
  }

  // Instant mute — applies to currently-playing continuous sounds too.
  setMuted(m) {
    this.muted = m
    if (this.ctx && this.master) {
      const now = this.ctx.currentTime
      this.master.gain.cancelScheduledValues(now)
      this.master.gain.setTargetAtTime(m ? 0 : 1, now, 0.015)
    }
  }

  // Drop re-triggers fired within `gap` ms so rapid clicks don't stack harshly.
  _gate(name, gap = 30) {
    const now = performance.now()
    if (this._last[name] && now - this._last[name] < gap) return false
    this._last[name] = now
    return true
  }

  _noiseBuffer() {
    const ctx = this.ensure()
    if (!ctx) return null
    if (!this._noise) {
      const len = Math.floor(ctx.sampleRate * 1)
      const buf = ctx.createBuffer(1, len, ctx.sampleRate)
      const data = buf.getChannelData(0)
      for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1
      this._noise = buf
    }
    return this._noise
  }

  _tone({ freq = 440, freqEnd, type = 'sine', dur = 0.15, gain = 0.18, delay = 0, attack = 0.005 }) {
    const ctx = this.ensure()
    if (!ctx) return
    const t0 = ctx.currentTime + delay
    const osc = ctx.createOscillator()
    const g = ctx.createGain()
    osc.type = type
    osc.frequency.setValueAtTime(freq, t0)
    if (freqEnd) osc.frequency.exponentialRampToValueAtTime(Math.max(1, freqEnd), t0 + dur)
    g.gain.setValueAtTime(0.0001, t0)
    g.gain.exponentialRampToValueAtTime(gain, t0 + attack)
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur)
    osc.connect(g).connect(this.master)
    osc.start(t0)
    osc.stop(t0 + dur + 0.03)
  }

  _noiseBurst({ dur = 0.2, gain = 0.3, type = 'lowpass', freq = 1000, q = 1, delay = 0 }) {
    const ctx = this.ensure()
    if (!ctx) return
    const buf = this._noiseBuffer()
    if (!buf) return
    const t0 = ctx.currentTime + delay
    const src = ctx.createBufferSource()
    src.buffer = buf
    src.loop = true
    const filt = ctx.createBiquadFilter()
    filt.type = type
    filt.frequency.value = freq
    filt.Q.value = q
    const g = ctx.createGain()
    g.gain.setValueAtTime(gain, t0)
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur)
    src.connect(filt).connect(g).connect(this.master)
    src.start(t0)
    src.stop(t0 + dur + 0.03)
  }

  // One-shot effects.
  play(name) {
    if (!this.ensure()) return
    switch (name) {
      case 'gem':
      case 'chime':
        if (!this._gate('gem', 18)) return
        this._tone({ freq: 880, type: 'sine', dur: 0.12, gain: 0.16 })
        this._tone({ freq: 1320, type: 'sine', dur: 0.16, gain: 0.12, delay: 0.06 })
        break
      case 'win':
        if (!this._gate('win', 60)) return
        ;[660, 880, 1100, 1320].forEach((f, i) =>
          this._tone({ freq: f, type: 'triangle', dur: 0.18, gain: 0.15, delay: i * 0.07 })
        )
        break
      case 'fail':
        if (!this._gate('fail', 60)) return
        this._tone({ freq: 440, freqEnd: 110, type: 'sawtooth', dur: 0.5, gain: 0.15 })
        break
      case 'explosion':
      case 'bomb':
        if (!this._gate('explosion', 40)) return
        this._noiseBurst({ dur: 0.45, gain: 0.45, type: 'lowpass', freq: 900 })
        this._tone({ freq: 120, freqEnd: 40, type: 'sine', dur: 0.4, gain: 0.3 })
        break
      case 'card':
        if (!this._gate('card', 15)) return
        this._noiseBurst({ dur: 0.08, gain: 0.22, type: 'highpass', freq: 2200 })
        break
      case 'cluck':
        if (!this._gate('cluck', 30)) return
        this._tone({ freq: 700, freqEnd: 1150, type: 'square', dur: 0.06, gain: 0.1 })
        this._tone({ freq: 950, freqEnd: 500, type: 'square', dur: 0.08, gain: 0.1, delay: 0.07 })
        break
      case 'pop':
        if (!this._gate('pop', 30)) return
        this._tone({ freq: 700, freqEnd: 150, type: 'sine', dur: 0.12, gain: 0.32 })
        this._noiseBurst({ dur: 0.06, gain: 0.18, type: 'bandpass', freq: 1600, q: 1 })
        break
      case 'hiss':
        if (!this._gate('hiss', 22)) return
        this._noiseBurst({ dur: 0.18, gain: 0.06, type: 'highpass', freq: 4500 })
        break
      case 'roar':
        if (!this._gate('roar', 80)) return
        this._tone({ freq: 95, freqEnd: 70, type: 'sawtooth', dur: 0.5, gain: 0.32 })
        this._tone({ freq: 150, freqEnd: 90, type: 'sawtooth', dur: 0.5, gain: 0.16 })
        break
      case 'roll':
        if (!this._gate('roll', 60)) return
        for (let i = 0; i < 6; i++) {
          this._noiseBurst({
            dur: 0.05,
            gain: 0.16,
            type: 'bandpass',
            freq: 1200 + Math.random() * 900,
            q: 3,
            delay: i * 0.06,
          })
        }
        break
      default:
        break
    }
  }

  // ---- Crash: continuous riser whose pitch tracks the multiplier ----
  crashStart() {
    const ctx = this.ensure()
    if (!ctx) return
    this.crashStop()
    const now = ctx.currentTime
    const osc = ctx.createOscillator()
    const filt = ctx.createBiquadFilter()
    const g = ctx.createGain()
    // gentle vibrato adds tension without harshness
    const vib = ctx.createOscillator()
    const vibGain = ctx.createGain()

    // soft triangle (few harmonics) instead of a buzzy sawtooth
    osc.type = 'triangle'
    osc.frequency.setValueAtTime(140, now)

    // lowpass keeps the tone warm and stops it ever turning bright/sharp
    filt.type = 'lowpass'
    filt.frequency.setValueAtTime(500, now)
    filt.Q.value = 0.5

    vib.type = 'sine'
    vib.frequency.setValueAtTime(5, now)
    vibGain.gain.setValueAtTime(4, now) // ±4 Hz depth
    vib.connect(vibGain).connect(osc.frequency)

    // soft, slower fade-in at a lower volume than before
    g.gain.setValueAtTime(0.0001, now)
    g.gain.exponentialRampToValueAtTime(0.045, now + 0.3)

    osc.connect(filt).connect(g).connect(this.master)
    osc.start()
    vib.start()
    this._crash = { osc, vib, filt, g }
  }

  crashUpdate(mult) {
    if (!this._crash || !this.ctx) return
    const now = this.ctx.currentTime
    // sub-linear (log) climb so the pitch rises perceptibly but stays in a
    // comfortable, warm mid-range — capped well below anything piercing.
    const freq = Math.min(140 + Math.log2(Math.max(1, mult)) * 110, 680)
    this._crash.osc.frequency.setTargetAtTime(freq, now, 0.12)
    // glide the lowpass just above the tone so it never gets bright/harsh
    this._crash.filt.frequency.setTargetAtTime(freq * 2.2 + 150, now, 0.12)
  }

  crashStop() {
    if (this._crash && this.ctx) {
      const { osc, vib, g } = this._crash
      const now = this.ctx.currentTime
      g.gain.cancelScheduledValues(now)
      g.gain.setTargetAtTime(0.0001, now, 0.04)
      try {
        osc.stop(now + 0.12)
        if (vib) vib.stop(now + 0.12)
      } catch {
        /* already stopped */
      }
      this._crash = null
    }
  }

  crashExplode() {
    this.crashStop()
    this.play('explosion')
  }

  // ---- Wheel: spinning whir that slows and fades with the wheel ----
  wheelStart(durationMs = 4200) {
    const ctx = this.ensure()
    if (!ctx) return
    this.wheelStop()
    const dur = durationMs / 1000
    const osc = ctx.createOscillator()
    const lfo = ctx.createOscillator()
    const lfoGain = ctx.createGain()
    const g = ctx.createGain()
    const now = ctx.currentTime

    osc.type = 'triangle'
    osc.frequency.setValueAtTime(440, now)
    osc.frequency.linearRampToValueAtTime(150, now + dur)

    lfo.type = 'square' // ratchet/tick character
    lfo.frequency.setValueAtTime(20, now)
    lfo.frequency.linearRampToValueAtTime(4, now + dur)
    lfoGain.gain.value = 0.05

    g.gain.setValueAtTime(0.0001, now)
    g.gain.exponentialRampToValueAtTime(0.09, now + 0.12)
    g.gain.setValueAtTime(0.09, now + Math.max(0, dur - 0.6))
    g.gain.exponentialRampToValueAtTime(0.0001, now + dur)

    lfo.connect(lfoGain).connect(g.gain)
    osc.connect(g).connect(this.master)
    osc.start()
    lfo.start()
    osc.stop(now + dur + 0.05)
    lfo.stop(now + dur + 0.05)
    this._wheel = { osc, lfo }
  }

  wheelStop() {
    if (this._wheel) {
      try {
        this._wheel.osc.stop()
        this._wheel.lfo.stop()
      } catch {
        /* already stopped */
      }
      this._wheel = null
    }
  }
}

export function getEngine() {
  if (!engine) engine = new SoundEngine()
  return engine
}
