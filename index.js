import SimpleSynth from './modules/simple-synth.js'
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

function init() {
  // TODO: configure correct midi device
  const router = new MidiRouter(/loopMIDI/)

  // MIDI Channels for Inst + Send from 1
  const drums = new DrumSampler('drums.wav', 36, 39)
  drums.config(38, { chokeGroup: 'h' })
  drums.config(39, { chokeGroup: 'h' })

  const bass = new SimpleSynth()
  const lead = new SimpleSynth()
  const slicer = new Slicer({
    ticks: 48 * BEAT_TICKS * 4,
    sliceCount: 48 * 2,
    startNote: 30
  })

  const slicer2 = new Slicer({
    ticks: 48 * BEAT_TICKS * 4,
    sliceCount: 48 * 2,
    startNote: 30
  })

  const reverbFX = new ReverbFX()
  const delayFX = new DelayFX()

  // MIDI Channels for mixer channels from 8
  const drumsChannel = new MixerChannel()
  const bassChannel = new MixerChannel()
  const leadChannel = new MixerChannel()
  const slicerChannel = new MixerChannel()
  const slicer2Channel = new MixerChannel()
  const delayChannel = new MixerChannel()
  const reverbChannel = new MixerChannel()

  // Connect inst/fx to channel strips
  drums.output.connect(drumsChannel.input)
  bass.output.connect(bassChannel.input)
  lead.output.connect(leadChannel.input)
  slicer.output.connect(slicerChannel.input)
  slicer2.output.connect(slicer2Channel.input)
  delayFX.output.connect(delayChannel.input)
  reverbFX.output.connect(reverbChannel.input)

  // connect channel strips to output
  ;[
    drumsChannel, bassChannel, leadChannel, slicerChannel, slicer2Channel,
    delayChannel, reverbChannel
  ].forEach((ch) => ch.output.connect(window.audioContext.destination))

  // connect sends
  ;[
    drumsChannel, bassChannel, leadChannel, slicerChannel
  ].forEach((ch) => {
    ch.reverbSend.connect(reverbFX.input)
    ch.delaySend.connect(delayFX.input)
  })
  delayChannel.reverbSend.connect(reverbFX.input)

  // MIDI router connections
  ;[
    drums, bass, lead, slicer, slicer2,
    reverbFX, delayFX,
    drumsChannel, bassChannel, leadChannel, slicerChannel, slicer2Channel,
    reverbChannel, delayChannel
  ].forEach((obj, i) => router.connect(i + 1, obj))

  // Sample loader config
  const loader = new SampleLoader()

  loader.register('never-forget.wav')
  loader.register(drums.sampleNames)

  // assign samples after all been loaded and decoded
  loader.load().then(() => {
    slicer.buffer = loader.getBuffer('never-forget.wav')
    loader.getBuffers(drums.sampleNames).forEach((buffer, index) => {
      drums.setBuffer(index, buffer)
    })
    console.log('LOADED!')
  }).catch((e) => console.log(e))

  // expose for debugging
  window.bass = bass
  window.bassChannel = bassChannel
  window.slicer = slicer
  window.slicerChannel = slicerChannel
  window.router = router

  // expose for debugging
  window.drums = drums
  window.drumsChannel = drumsChannel
}

async function asyncInit() {
  try {
    await window.audioContext.audioWorklet.addModule('./worklets/bitcrusher.js?v=1');
    console.log("ADD MODULE")
  } catch(e) {
    console.log(e)
  }
  console.log("LETS INIT")
  init()
}

asyncInit()