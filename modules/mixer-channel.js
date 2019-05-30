const FILTER_SMOOTHING = 0.001
const GAIN_SMOOTHING = 0.001

export default class MixerChannel {
  constructor () {
    const ctx = window.audioContext
    this.input = new GainNode(ctx)
    this.output = new GainNode(ctx)

    // inserts
    this.bitCrusher = new GainNode(ctx) // PLACEHOLDER
    this.lowPass = new BiquadFilterNode(ctx, { type: 'lowpass', frequency: 22000 })
    this.highPass = new BiquadFilterNode(ctx, { type: 'highpass', frequency: 0 })
    this.compressor = ctx.createDynamicsCompressor({
      threshold: -20,
      ratio: 5,
      attack: 0.01,
      release: 0.25
    })

    // sends
    this.reverbSend = new GainNode(ctx, { gain: 0 })
    this.delaySend = new GainNode(ctx, { gain: 0 })

    // connections
    this.input.connect(this.reverbSend)
    this.input.connect(this.delaySend)
    this.input.connect(this.bitCrusher).connect(this.lowPass).connect(this.highPass).connect(this.output)
  }

  duck () {
    // TODO
  }

  cc (id, value) {
    let time = window.audioContext.currentTime
    if (id === 1) { // VOLUME
      this.output.gain.setTargetAtTime(cubic(midiFloat(value) * 2), time, GAIN_SMOOTHING)
    } else if (id === 2) { // REVERB SEND
      this.reverbSend.gain.setTargetAtTime(cubic(midiFloat(value)), time, GAIN_SMOOTHING)
    } else if (id === 3) { // DELAY SEND
      this.delaySend.gain.setTargetAtTime(cubic(midiFloat(value)), time, GAIN_SMOOTHING)
    } else if (id === 4) { // DUAL FILTER
      if (value > 64) {
        this.lowPass.frequency.setTargetAtTime(20000, time, FILTER_SMOOTHING)
        this.highPass.frequency.setTargetAtTime(exp(midiFloat(value, 64, 127)) * 20000, time, FILTER_SMOOTHING)
      } else if (value < 63) {
        this.lowPass.frequency.setTargetAtTime(exp(midiFloat(value, 0, 63)) * 20000, time, FILTER_SMOOTHING)
        this.highPass.frequency.setTargetAtTime(0, time, 0.1)
      } else {
        this.lowPass.frequency.setTargetAtTime(20000, time, 0.1)
        this.highPass.frequency.setTargetAtTime(0, time, 0.1)
      }
    } else if (id === 5) { // BIT REDUCTION
      // TODO
    } else if (id === 6) { // RATE REDUCTION
      // TODO
    } else if (id === 7) { // DUCKING AMOUNT
      // TODO
    }
  }
}

function midiFloat (value, from = 0, to = 127) {
  const range = to - from
  return (value - from) / range
}

function exp (value) {
  return value * value
}

function cubic (value) {
  return value * value
}
