export default class SimpleSynth {
  constructor () {
    this.context = window.audioContext
    this.oscillator = new OscillatorNode(this.context, { type: 'square' })
    this.vca = new GainNode(this.context, { gain: 0 })
    this.oscillator.connect(this.vca)
    this.oscillator.start()
  }

  get output () {
    return this.vca
  }

  noteOn (note, velocity) {
    this.oscillator.detune.value = (note - 69) * 100
    this.vca.gain.setTargetAtTime(1, window.audioContext.currentTime, 0.01)
  }

  noteOff (note) {
    this.vca.gain.setTargetAtTime(0, window.audioContext.currentTime, 0.01)
  }
}
