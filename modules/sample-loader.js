export default class SampleLoader {
  constructor () {
    this.samples = []
    this.buffers = new Map()
  }
  register (name) {
    this.samples.push(name)
  }

  registerRange (name, start, end) {
    const [prefix, postfix] = name.split('.')
    for (var i = start; i <= end; i++) {
      this.samples.push(`${prefix}_${i}.${postfix}`)
    }
  }

  async load () {
    for (const sample of this.samples) {
      const body = await fetch(`samples/${sample}`)
      const buffer = await body.arrayBuffer()
      console.log(buffer)
      const audioBuffer = await window.audioContext.decodeAudioData(buffer)
      this.buffers.set(sample, audioBuffer)
    }
    console.log("DONE.")
  }

  getBuffer (name) {
    return this.buffers.get(name)
  }

  getBuffers (name, start, end) {
    const buffers = []
    const [prefix, postfix] = name.split('.')
    for (var i = start; i <= end; i++) {
      buffers.push(`${prefix}_${i}.${postfix}`)
    }
    return buffers
  }
}
