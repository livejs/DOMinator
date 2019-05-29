const PITCH_SMOOTHING = 0.001

export default class Slicer {
  constructor ({ audioBuffer, sliceCount, ticks, tickQuantize = 3, startNote }) {
    this.buffer = audioBuffer
    this.pitch = new ConstantSourceNode(window.audioContext)
    this.position = 0
    this.playing = false
    this.player = null
    this.ticks = ticks
    this.sliceCount = sliceCount
    this.tickQuantize = tickQuantize
  }

  clock () {
    if (this.buffer) {
      if (this.playing) {
        const ctx = window.audioContext
        const quantizedPosition = Math.round(this.ticks / this.tickQuantize) * this.tickQuantize
        const distance = Math.abs(this.position - quantizedPosition)

        if (distance >= this.tickQuantize) {
          const offset = (this.position / this.ticks) * this.buffer.duration

          if (this.player) {
            this.player.stop()
          }

          this.player = new AudioBufferSourceNode(ctx, { buffer: this.buffer })
          this.pitch.connect(this.player.detune)
          this.player.start(ctx.currentTime, offset)
        }
      } else if (this.player) {
        this.player.stop()
        this.player = null
      }
    }
    this.position = (this.position + 1) % this.ticks
  }

  noteOn (noteId, velocity) {
    if (noteId >= this.startNote && noteId < this.startNote + this.sliceCount) {
      let sliceIndex = noteId - this.startNote
      let sliceLength = this.ticks / this.sliceCount
      this.position = Math.floor(sliceLength * sliceIndex)

      this.playing = true
    } else {
      this.playing = false
    }
  }

  pb (value) {
    this.pitch.setTargetAtTime(value * 1200, window.audioContext.currentTime, PITCH_SMOOTHING)
  }
}
