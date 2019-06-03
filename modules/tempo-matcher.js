const MAX_DIFFS = 20

export default class TempoMatcher {
  constructor () {
    this.tempoMemo = 120
    this.lastClock = null
    this.diffs = []
  }
  get tempo () {
    if (this.diffs.length > 2) {
      const sum = this.diffs.reduce((sum, diff) => sum + (60 / (diff * 24) * 1000))
      const average = sum / this.diffs.length
      this.tempoMemo = average
    }
    return this.tempoMemo
  }
  clock (time, audioTime) {
    const now = time
    if (this.lastClock) {
      this.diffs.push(now - this.lastClock)
    }
    this.lastClock = now
    if (this.diffs.length > MAX_DIFFS) {
      this.diffs.shift()
    }
  }
  stop () {
    this.diffs = []
  }
}
