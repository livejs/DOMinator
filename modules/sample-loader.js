export default class SampleLoader {
  constructor () {
    this.samples = []
    this.buffers = new Map()
  }

  register (names) {
    if (typeof names === 'string') { names = [names] }
    for (const name of names) {
      if (name != null) {
        this.samples.push(name)
      }
    }
  }

  async load () {
    for (let sample of this.samples) {
      const body = await window.fetch(`samples/${sample}`)
      const buffer = await body.arrayBuffer()
      const audioBuffer = await window.audioContext.decodeAudioData(buffer)
      this.buffers.set(sample, audioBuffer)
    }
  }

  getBuffer (name) {
    return this.buffers.get(name)
  }

  getBuffers (names) {
    return names.map((name) => {
      return this.getBuffer(name)
    })
  }
}
