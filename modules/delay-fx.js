import TempoMatcher from './tempo-matcher.js'

function midiFloat (value, from = 0, to = 127) {
  const range = to - from
  return (value - from) / range
}

function cubic (value) {
  return Math.pow(value, 3)
}

export default class DelayFX {
  constructor () {
    this.audioContext = window.audioContext
    this.delay = this.audioContext.createDelay(10)
    this.returnGain = this.audioContext.createGain()
    this.inGain = this.audioContext.createGain()
    this.inGain.gain.value = 0.5
    this.returnGain.gain.value = 0.3
    this.filter = this.audioContext.createBiquadFilter()
    this.filter.mode = 'highpass'
    // this.filter.frequency.value = 6000
    this.filter.Q.value = -0.77
    this.shaper = this.audioContext.createWaveShaper()
    this.inGain.connect(this.delay)
    this.delay.connect(this.filter)
    this.filter.connect(this.returnGain)
    this.delay.connect(this.shaper)
    this.returnGain.connect(this.delay)
    // this.returnShaper.connect(this.delay)
    this.delay.delayTime.value = 0.2
    this.tempoMatcher = new TempoMatcher()
    this.setShaperCurve(100)
  }
  setShaperCurve (k) {
    const samples = 44100
    const curve = new Float32Array(samples)
    const deg = Math.PI / 180
    for (let i = 0; i < samples; ++i) {
      let x = i * 2 / samples - 1
      curve[i] = (3 + k) * x * 20 * deg / (Math.PI + k * Math.abs(x))
    }
    this.shaper.curve = curve
  }
  clock (time) {
    this.tempoMatcher.clock(time)
    this.adjustDelayTime()
  }
  stop () {
    this.tempoMatcher.stop()
  }

  cc (ccnum, value, audioTime) {
    if (ccnum === 1) {
    }
    if (ccnum === 2) {
      this.returnGain.gain.setTargetAtTime(cubic(midiFloat(value)), audioTime, 0.001)
    }
  }

  get output () {
    return this.shaper
  }

  get input () {
    return this.inGain
  }

  adjustDelayTime () {
    const newTime = 60 / (this.tempoMatcher.tempo * 4) * 3
    this.delay.delayTime.setTargetAtTime(newTime, this.audioContext.currentTime, 0.5)
  }
}
