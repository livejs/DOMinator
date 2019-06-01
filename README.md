
```
________   ________      _____  .__               __
\______ \  \_____  \    /     \ |__| ____ _____ _/  |_  ___________
 |    |  \  /   |   \  /  \ /  \|  |/    \\__  \\   __\/  _ \_  __ \
 |    `   \/    |    \/    Y    \  |   |  \/ __ \|  | (  <_> )  | \/
/_______  /\_______  /\____|__  /__|___|  (____  /__|  \____/|__|
        \/         \/         \/        \/     \/
```

https://www.youtube.com/watch?v=tgf2W3dmglo

An MIDI driven audio engine written specifically for the JSConf.eu 2019 opening

Written by Matt McKegg (@mckegg) & Jan Krutisch (@halfbyte)

## Install / Use

- use git-lfs to check out the samples
- run npm i to install the webserver
- use sequencer to play back track (we'll try to uh make this more useful)

## Structure

- The modules folder contains all of the sound engine parts
- index.js contains the performance related setup
- Each Instrument, which can be one of
  - Drum/Oneshot Sampler
  - Slicer
  - Synth
- is then fed into a Mixer Channel which contains a
  - Bitcrusher
  - Dual filter (similar to these on DJ Mixers)
  - Sends to a Reverb and a Delay
  - A ducker (ala sidechain compression)

## License

See [LICENSE](LICENSE)
