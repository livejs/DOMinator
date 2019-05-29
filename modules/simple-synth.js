export default class SimpleSynth {
  constructor () {
    this.oscillator = window.audioContext.createOscillator()
    this.vca = window.audioContext.createGain()
    this.vca.gain.value = 0
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