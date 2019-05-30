import Synth from './modules/synth.js'
import MixerChannel from './modules/mixer-channel.js'
import MidiRouter from './modules/midi-router.js'
import SampleLoader from './modules/sample-loader.js'
import Slicer from './modules/slicer.js'
import DrumSampler from './modules/drum-sampler.js'
import DelayFX from './modules/delay-fx.js'
import ReverbFX from './modules/reverb-fx.js'

const BEAT_TICKS = 24

window.audioContext = new AudioContext()
console.log("I'M THE ONE AND ONLY DOMINATOR")

document.getElementById('start').addEventListener('click', (ev) => {
  window.audioContext.resume()
  ev.target.disabled = true
  ev.target.innerText = 'BREEEEOOOOOMMM'
  window.setTimeout(() => {
    ev.target.hidden = true
  }, 300)
})

var clockDisplay = document.getElementById('clock')
var cueDisplay = document.getElementById('cueDisplay')

var ticks = 0

var ui = {
  clock: () => {
    clockDisplay.innerText = ticks
    ticks += 1
  },
  stop: () => {
    clockDisplay.innerText = 'STOPPED'
    ticks = 0
  },
  noteOn: (note) => {
    cueDisplay.innerText = 'VISUAL CUE ' + note
  }
}

function init () {
  // TODO: configure correct midi device
  var midiInputs = [
    new MidiRouter(/DOMinator/, { useClock: true }), // sequencer (mac)
    new MidiRouter(/loopMIDI/, { useClock: true }), // sequencer (windows)
    new MidiRouter(/LD Output/), // Loop Drop (Matt)
    new MidiRouter(/AudioBox/) // Improjam (Jan)
  ]

  // MIDI Channels for Inst + Send from 1
  const drums = new DrumSampler('drums.wav', 35, 63)
  drums.config(41, { chokeGroup: 'h', volume: 0.5 })
  drums.config(42, { chokeGroup: 'h', volume: 0.5 })
  drums.config(50, { chokeGroup: 'h', volume: 0.5 })
  drums.config(52, { chokeGroup: 'h', volume: 0.5 })
  drums.config(54, { chokeGroup: 'h', volume: 0.5 })
  drums.config(63, { chokeGroup: 'h', volume: 0.5 })

  const bass = new Synth()
  const lead = new Synth()
  const slicer = new Slicer({
    ticks: 48 * BEAT_TICKS * 4,
    sliceCount: 48 * 2,
    startNote: 30
  })

  const oneshots = new DrumSampler('oneshot.wav', 36, 37)
  oneshots.config(36, { chokeGroup: 'p' })
  oneshots.config(37, { chokeGroup: 'p' })

  const reverbFX = new ReverbFX()
  const delayFX = new DelayFX()

  // MIDI Channels for mixer channels from 8
  const drumsChannel = new MixerChannel()
  const bassChannel = new MixerChannel()
  const leadChannel = new MixerChannel()
  const slicerChannel = new MixerChannel()
  const oneshotsChannel = new MixerChannel()
  const delayChannel = new MixerChannel()
  const reverbChannel = new MixerChannel()

  // Connect inst/fx to channel strips
  drums.output.connect(drumsChannel.input)
  bass.output.connect(bassChannel.input)
  lead.output.connect(leadChannel.input)
  slicer.output.connect(slicerChannel.input)
  oneshots.output.connect(oneshotsChannel.input)
  delayFX.output.connect(delayChannel.input)
  reverbFX.output.connect(reverbChannel.input)

  // connect channel strips to output
  ;[
    drumsChannel, bassChannel, leadChannel, slicerChannel, oneshotsChannel,
    delayChannel, reverbChannel
  ].forEach((ch) => ch.output.connect(window.audioContext.destination))

  // connect sends
  ;[
    drumsChannel, bassChannel, leadChannel, slicerChannel, oneshotsChannel
  ].forEach((ch) => {
    ch.reverbSend.connect(reverbFX.input)
    ch.delaySend.connect(delayFX.input)
  })
  delayChannel.reverbSend.connect(reverbFX.input)

  // MIDI router connections
  ;[
    drums, bass, lead, slicer, oneshots,
    reverbFX, delayFX,
    drumsChannel, bassChannel, leadChannel, slicerChannel, oneshotsChannel,
    reverbChannel, delayChannel,
    ui // to display clock info
  ].forEach((obj, i) => {
    midiInputs.forEach(router => {
      router.connect(i + 1, obj)
    })
  })

  // Sample loader config
  const loader = new SampleLoader()

  loader.register('never-forget.wav')
  loader.register(drums.sampleNames)
  loader.register(oneshots.sampleNames)

  // assign samples after all been loaded and decoded
  loader.load().then(() => {
    slicer.buffer = loader.getBuffer('never-forget.wav')
    loader.getBuffers(drums.sampleNames).forEach((buffer, index) => {
      drums.setBuffer(index, buffer)
    })
    loader.getBuffers(oneshots.sampleNames).forEach((buffer, index) => {
      oneshots.setBuffer(index, buffer)
    })
    console.log('LOADED!')
  }).catch((e) => console.log(e))

  // expose for debugging
  window.bass = bass
  window.bassChannel = bassChannel
  window.slicer = slicer
  window.slicerChannel = slicerChannel
  window.midiInputs = midiInputs

  // expose for debugging
  window.drums = drums
  window.drumsChannel = drumsChannel
}

async function asyncInit () {
  try {
    await window.audioContext.audioWorklet.addModule('./worklets/bitcrusher.js?v=1')
    console.log('ADD MODULE')
  } catch (e) {
    console.log(e)
  }
  console.log('LETS INIT')
  init()
}

asyncInit()
