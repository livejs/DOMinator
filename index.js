import SimpleSynth from './modules/simple-synth.js'
import MixerChannel from './modules/mixer-channel.js'
import MidiRouter from './modules/midi-router.js'

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
const synthChannel = new MixerChannel()

synth.output.connect(synthChannel.input)
// synth.output.connect(window.audioContext.destination)
synthChannel.output.connect(window.audioContext.destination)

// expose for debugging
window.synth = synth
window.synthChannel = synthChannel
router.connect(1, synth)
router.connect(5, synthChannel)
