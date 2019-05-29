import SimpleSynth from './modules/simple-synth.js'

window.audioContext = new window.AudioContext()
console.log("I'M THE ONE AND ONLY DOMINATOR")

document.getElementById('start').addEventListener('click', (ev) => {
  window.audioContext.resume()
  ev.target.disabled = true
  ev.target.innerText = 'BREEEEOOOOOMMM'
})

const synth = new SimpleSynth()
synth.output.connect(window.audioContext.destination)
window.synth = synth
