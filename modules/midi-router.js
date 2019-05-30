const QUACK_CHANNEL = 3
const QUACK_NOTE = 24

export default class MidiRouter {
  constructor (name) {
    this.deviceName = name
    this.handleStateChange = this.handleStateChange.bind(this)
    this.midiSetup()
    this.runFakeClock = false
    this.channelHandlers = []
    setInterval(() => {
      this.fakeClock()
    }, 60000 / 128 / 24)
  }

  fakeClock () {
    if (!this.runFakeClock) { return }
    this.channelHandlers.forEach((handler) => {
      if (handler && typeof handler.clock === 'function') {
        handler.clock(window.performance.now())
      }
    })
  }

  async midiSetup () {
    const access = await navigator.requestMIDIAccess()
    access.onstatechange = this.handleStateChange
    this.input = this.findDevice(access)
    if (this.input) {
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
    if (data.length === 1) {
      if (data[0] === 0xF8) {
        this.channelHandlers.forEach((handler) => {
          if (handler && typeof handler.clock === 'function') {
            handler.clock(event.timeStamp)
          }
        })
      }
      if (data[0] === 0xFC) {
        this.channelHandlers.forEach((handler) => {
          if (handler && typeof handler.stop === 'function') {
            handler.stop()
          }
        })
      }
    }
    if (data.length === 3) {
      const channel = (data[0] & 0xF) + 1
      const command = data[0] & 0xF0

      if (command === 144) {
        console.log("N-O")
        // handle noteon
        // Specific Quack Handling
        if (channel === QUACK_CHANNEL && data[1] === QUACK_NOTE) {
          this.channelHandlers.forEach((handler) => {
            if (handler && typeof handler.quack === 'function') {
              handler.quack()
            }
          })
        }
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
