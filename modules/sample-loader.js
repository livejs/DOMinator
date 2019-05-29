export default class SampleLoader {
  constructor() {
    this.samples = []
    this.buffers = new Map()
  }
  register(name) {
    this.samples.push(name)
  }

  async load() {
    for(const sample of this.samples) {
      console.log("loading", sample)
      const body = await fetch(`samples/${sample}`)
      const buffer = await body.arrayBuffer()
      const audioBuffer = await window.audioContext.decodeAudioData(buffer)
      console.log(audioBuffer)
      this.buffers.set(sample, audioBuffer)
    }

    console.log("DONE.", this.buffers)
  }

  getBuffer(name) {
    return this.buffers.get(name)
  }

}