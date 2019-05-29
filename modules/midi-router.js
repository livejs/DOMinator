export default class MidiRouter {
  constructor (name) {
    this.deviceName = name
    this.handleStateChange = this.handleStateChange.bind(this)
    this.midiSetup()
    this.channelHandlers = []
  }
  async midiSetup () {
    const access = await navigator.requestMIDIAccess()
    access.onstatechange = this.handleStateChange
    this.input = this.findDevice(access)
    if (this.input) {
      this.input.onmidimessage = (e) => console.log(e)
      this.input.addEventListener('midimessage', (e) => this.handleInput(e))
    }
  }
  findDevice (access) {
    for (var [, input] of access.inputs) {
      if (input.name.match(this.deviceName)) {
        return input
      }
    }
  }
  handleStateChange (event) {
    // TODO: Implement for resilience
  }
  handleInput (event) {
    const data = event.data
    if (data === [0xF8]) {
      this.channelHandlers.forEach((handler) => {
        if (handler && typeof handler.clock === 'function') {
          handler.clock()
        }
      })
    }
    if (data.length === 3) {
      const channel = (data[0] & 0xF) + 1
      const command = data[0] & 0xF0
      if (command === 144) {
        // handle noteon
        if (this.channelHandlers[channel] != null && (typeof this.channelHandlers[channel].noteOn === 'function')) {
          this.channelHandlers[channel].noteOn(data[1], data[2])
        }
      }
      if (command === 128) {
        // handle noteoff
        if (this.channelHandlers[channel] != null && typeof this.channelHandlers[channel].noteOff === 'function') {
          this.channelHandlers[channel].noteOff(data[1], data[2])
        }
      }
      if (command === 176) {
        // handle CC
        if (this.channelHandlers[channel] != null && typeof this.channelHandlers[channel].cc === 'function') {
          this.channelHandlers[channel].cc(data[1], data[2])
        }
      }
      if (command === 224) {
        // handle PB

        if (this.channelHandlers[channel] != null && typeof this.channelHandlers[channel].pb === 'function') {
          const pbValue = ((data[2] << 7 + data[1]) - 0x2000) / 8192

          this.channelHandlers[channel].pb(pbValue)
        }
      }
    }
  }

  connect (channel, obj) {
    this.channelHandlers[channel] = obj
  }
}
