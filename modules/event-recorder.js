export default class Recorder {
  constructor () {
    this.events = []
    this.handlers = []
  }
  push (name, ch, mt, at, ...params) {
    this.events.push({ name, ch, mt, at, params })
  }
  clock (ch, midiTime, audioTime) {
    this.push('clock', ch, midiTime, audioTime)
  }
  stop (ch, audioTime) {
    this.push('stop', ch, window.performance.now(), audioTime)
  }
  noteOn (ch, note, velo, audioTime) {
    this.push('noteOn', ch, window.performance.now(), audioTime, note, velo)
  }
  noteOff (ch, note, velo, audioTime) {
    this.push('noteOff', ch, window.performance.now(), audioTime, note, velo)
  }
  quack (ch, audioTime) {
    this.push('quack', ch, window.performance.now(), audioTime)
  }
  cc (ch, cmd, value, audioTime) {
    this.push('quack', ch, window.performance.now(), audioTime, cmd, value)
  }
  pb (ch, value, audioTime) {
    this.push('pb', ch, window.performance.now(), audioTime, value)
  }
  connect (ch, obj) {
    this.handlers[ch] = obj
  }

  play () {
    if (this.events.length === 0) { return }
    const baseMidiTime = this.events[0].mt
    const baseAudioTime = this.events[0].at

    const midiNow = window.performance.now()
    const audioNow = window.audioContext.currentTime

    this.events.forEach((event) => {
      const relativeMidiTime = event.mt - baseMidiTime
      const relativeAudioTime = event.at - baseAudioTime
      if (typeof this.handlers[event.ch][event.name] === 'function') {
        if (event.name === 'clock') {
          this.handlers[event.ch].clock(relativeMidiTime + midiNow, relativeAudioTime + audioNow)
        } else {
          this.handlers[event.ch][event.name](...event.params, relativeAudioTime + audioNow)
        }
      }
    })
  }
}
