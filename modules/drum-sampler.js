export default class DrumSampler {
  constructor (name, start, end) {
    this.audioContext = window.audioContext
    this.samples = []
    this.gains = []
    this.playing = {}
    this.chokeGroups = {}
    this.vca = this.audioContext.createGain()
    const [prefix, postfix] = name.split('.')
    for (var i = start; i <= end; i++) {
      this.samples[i] = { name: `${prefix}_${i}.${postfix}`, buffer: null, volume: 1.0 }
    }
  }

  config (i, opts = {}) {
    this.samples[i] = { ...this.samples[i], ...opts }
  }

  setBuffer (i, buffer) {
    if (this.samples[i] == null) { return }
    this.samples[i].buffer = buffer
  }

  get sampleNames () {
    return this.samples.map((sample) => {
      return sample != null ? sample.name : null
    })
  }

  get output () {
    return this.vca
  }

  stop (audioTime) {
    for (let player of Object.values(this.playing)) {
      player.stop(audioTime)
    }
    this.playing = {}
  }

  noteOn (note, velocity, audioTime) {
    console.log('SNote', note, this.samples[note])
    if (this.samples[note] == null) { return }
    if (this.samples[note].buffer == null) { return }

    if (this.playing[note]) {
      this.playing[note].stop()
      this.playing[note] = null
    }

    const src = this.audioContext.createBufferSource()
    const gain = this.audioContext.createGain()
    gain.connect(this.vca)
    const buffer = this.samples[note].buffer
    const now = audioTime
    src.buffer = buffer
    src.connect(gain)
    if (this.samples[note].chokeGroup) {
      console.log('CHOKE', this.chokeGroups[this.samples[note].chokeGroup])
      const toChoke = this.chokeGroups[this.samples[note].chokeGroup]
      if (toChoke != null) {
        toChoke.gain.linearRampToValueAtTime(0, now + 0.02)
      }
      this.chokeGroups[this.samples[note].chokeGroup] = gain
    }
    gain.gain.setValueAtTime(this.samples[note].volume, now)
    gain.gain.setValueAtTime(this.samples[note].volume, now + (buffer.duration - 0.02))
    gain.gain.linearRampToValueAtTime(0, now + buffer.duration)
    this.playing[note] = src
    src.start(now)
  }
}
