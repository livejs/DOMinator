import SimpleSynth from './modules/simple-synth.js'
import MixerChannel from './modules/mixer-channel.js'
import MidiRouter from './modules/midi-router.js'
import SampleLoader from './modules/sample-loader.js'
import Slicer from './modules/slicer.js'
import DrumSampler from './modules/drum-sampler.js'
import DelayFX from './modules/delay-fx.js'
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

const router = new MidiRouter(/loopMIDI/)
const synth = new SimpleSynth()
const slicer = new Slicer({
  ticks: 48 * BEAT_TICKS * 4,
  sliceCount: 48 * 2,
  startNote: 30
})

const synthChannel = new MixerChannel()
const slicerChannel = new MixerChannel()
const delayFX = new DelayFX()
const delayChannel = new MixerChannel()
const loader = new SampleLoader()
const drums = new DrumSampler('drums.wav', 36, 39)
drums.config(38, { chokeGroup: 'h' })
drums.config(39, { chokeGroup: 'h' })
const drumChannel = new MixerChannel()

loader.register('never-forget.wav')
loader.register(drums.sampleNames)

loader.load().then(() => {
  slicer.buffer = loader.getBuffer('never-forget.wav')
  loader.getBuffers(drums.sampleNames).forEach((buffer, index) => {
    drums.setBuffer(index, buffer)
  })
  console.log('LOADED!')
}).catch((e) => console.log(e))

// CONNECTIONS
synth.output.connect(synthChannel.input)
synthChannel.output.connect(window.audioContext.destination)

slicer.output.connect(slicerChannel.input)
slicerChannel.output.connect(window.audioContext.destination)

drums.output.connect(drumChannel.input)
drumChannel.output.connect(window.audioContext.destination)

delayFX.output.connect(delayChannel.input)
delayChannel.output.connect(window.audioContext.destination)

drumChannel.delaySend.connect(delayFX.input)

router.connect(1, synth)
router.connect(2, slicer)
router.connect(3, drums)

router.connect(5, synthChannel)
router.connect(6, slicerChannel)
router.connect(14, delayFX)
router.connect(15, delayChannel)

// expose for debugging
window.synth = synth
window.synthChannel = synthChannel
window.slicer = slicer
window.slicerChannel = slicerChannel
window.router = router

// expose for debugging
window.synth = synth
window.synthChannel = synthChannel
