import SimpleSynth from './modules/simple-synth.js'
import MixerChannel from './modules/mixer-channel.js'
import MidiRouter from './modules/midi-router.js'
import SampleLoader from './modules/sample-loader.js'
import Slicer from './modules/slicer.js'

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

const loader = new SampleLoader()

loader.register('stab.wav')
loader.register('never-forget.wav')

loader.load().then(() => {
  slicer.buffer = loader.getBuffer('never-forget.wav')
  console.log('LOADED!')
})

// CONNECTIONS
synth.output.connect(synthChannel.input)
synthChannel.output.connect(window.audioContext.destination)

slicer.output.connect(slicerChannel.input)
slicerChannel.output.connect(window.audioContext.destination)

router.connect(1, synth)
router.connect(2, slicer)

router.connect(5, synthChannel)
router.connect(6, slicerChannel)

// expose for debugging
window.synth = synth
window.synthChannel = synthChannel
window.slicer = slicer
window.slicerChannel = slicerChannel

setInterval(() => {
  slicer.clock()
}, 60000 / 128 / 24)
