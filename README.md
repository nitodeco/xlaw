<p align="center">
  <h1 align="center">x-law</h1>
  <p align="center">
    <a href="https://www.npmjs.com/package/x-law">
      <img src="https://img.shields.io/npm/v/x-law.svg" alt="NPM" />
    </a>
    <a href="https://nitodeco.github.io/xlaw/">
      <img src="https://img.shields.io/badge/docs-online-blue.svg" alt="Docs" />
    </a>
    <a href="https://github.com/nitodeco/xlaw/blob/main/LICENSE">
      <img src="https://img.shields.io/badge/license-MIT-green.svg" alt="License" />
    </a>
  </p>
  <h3 align="center">
    A-Law, μ-Law and common audio utilites for JavaScript/TypeScript
  </h3>
</p>

This package started as a rewrite of the [alawmulaw](https://github.com/rochars/alawmulaw) library in TypeScript for a modernized build process and updated dependencies. It adds additional utilities and features for processing audio data, such as loudness calculation, more flexible encoding/decoding, and more.

Primarily intended for use in a backend environment.

## Install

```
npm install x-law
```

## Usage

CommonJS:

```javascript
const xlaw = require("x-law");
```

ESM:

```javascript
import xlaw from "x-law";
```

## Examples

### Basic Usage

```javascript
import xlaw from "x-law";

// Convert between PCM and μ-Law/A-Law
const pcmSamples = new Int16Array([
  /* 16-bit PCM samples */
]);

// Encode to μ-Law
const mulawSamples = xlaw.mulaw.encode(pcmSamples);
// Decode back to PCM
const decodedPcm = xlaw.mulaw.decode(mulawSamples);

// Encode to A-Law
const alawSamples = xlaw.alaw.encode(pcmSamples);
// Decode back to PCM
const decodedAlawPcm = xlaw.alaw.decode(alawSamples);
```

### Working with Different Bit Depths

```javascript
import xlaw from "x-law";

// Convert 24-bit PCM to 8-bit μ-Law
const pcm24bit = new Int32Array([
  /* 24-bit PCM samples */
]);
const mulaw = xlaw.mulaw.encode(pcm24bit, 24);

// Decode μ-Law to 32-bit PCM
const pcm32bit = xlaw.mulaw.decode(mulaw, 32);

// Single sample conversion
const singleMulaw = xlaw.mulaw.encodeSample(pcmSample, 24); // 24-bit PCM to μ-Law
const singlePcm = xlaw.mulaw.decodeSample(mulawSample, 32); // μ-Law to 32-bit PCM
```

### Audio Processing Utilities

```javascript
import xlaw from "x-law";

// Calculate audio loudness (RMS)
const rmsDb = xlaw.utils.calculateRms(pcmSamples, 16); // For 16-bit PCM
console.log(`Loudness: ${rmsDb} dB`);

// Calculate LUFS loudness
const lufs = xlaw.utils.calculateLufs(pcmSamples, 16, 44100);
console.log(`Integrated loudness: ${lufs} LUFS`);

// Resample audio
const pcm48k = new Int16Array([
  /* 48kHz PCM samples */
]);
const pcm16k = xlaw.utils.resample(pcm48k, 48000, 16000);

// Change bit depth with dithering
const pcm16bit = new Int16Array([
  /* 16-bit PCM samples */
]);
const pcm8bit = xlaw.utils.requantize(pcm16bit, 16, 8);
```

### Saving PCM to a WAV file

```javascript
import fs from "fs";
import xlaw from "x-law";

// Create a WAV header for mono 16-bit PCM at 44.1kHz
const dataSize = pcmSamples.byteLength;
const wavHeader = xlaw.utils.createWavHeader(dataSize, 44100, 1, 16);

// Combine header with audio data
const wavFile = Buffer.concat([wavHeader, Buffer.from(pcmSamples.buffer)]);

// Save to file
fs.writeFileSync("output.wav", wavFile);
```

You can find the full documentation [here](https://nitodeco.github.io/xlaw/).

## Contributing

Contributions are welcome! See [CONTRIBUTING.md](CONTRIBUTING.md) for more details.

### LICENSE

This project is licensed under the MIT license. See [LICENSE](LICENSE) for more details.
