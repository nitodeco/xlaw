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
const { alaw, mulaw, utils } = require("x-law");
```

ESM:

```javascript
import { alaw, mulaw, utils } from "x-law";
```

## Examples

### Basic Usage

```typescript
import { alaw, mulaw } from "x-law";

// Convert between PCM and μ-Law/A-Law
const pcmSamples = new Int16Array([
  /* 16-bit PCM samples */
]);

// Encode to μ-Law
const mulawSamples = mulaw.encode(pcmSamples); // Returns Uint8Array
// Decode back to PCM
const decodedPcm = mulaw.decode(mulawSamples); // Returns Int16Array

// Encode to A-Law
const alawSamples = alaw.encode(pcmSamples); // Returns Uint8Array
// Decode back to PCM
const decodedAlawPcm = alaw.decode(alawSamples); // Returns Int16Array

// Working with Buffer objects
const pcmBuffer = Buffer.from(pcmSamples.buffer);
const encodedMulaw = mulaw.encodeBuffer(pcmBuffer);
const decodedBuffer = mulaw.decodeBuffer(encodedMulaw);
```

### Single Sample Processing

```typescript
import { alaw, mulaw } from "x-law";

// Single sample conversion
const pcmSample = 16384; // 16-bit PCM sample
const mulawSample = mulaw.encodeSample(pcmSample);
const decodedSample = mulaw.decodeSample(mulawSample);

const alawSample = alaw.encodeSample(pcmSample);
const decodedAlawSample = alaw.decodeSample(alawSample);
```

### Audio Processing Utilities

```typescript
import { utils } from "x-law";

// Calculate audio loudness
const buffer = Buffer.from([
  /* audio data */
]);
const loudness = utils.calculateLoudness(buffer, 16); // For 16-bit PCM
console.log(`Loudness: ${loudness}`);

// Resample audio
const samples = [
  /* PCM samples */
];
const resampled = utils.resample(samples, 48000, 16000);

// Change bit depth with dithering
const inputSamples = [
  /* PCM samples */
];
const requantized = utils.requantize(inputSamples, 16, 8);

// Single sample requantization with error diffusion
let prevError = 0;
const sample = 32767;
const { sample: newSample, error } = utils.requantizeSample(sample, 16, 8, prevError);
prevError = error;
```

### Creating WAV Files

```typescript
import fs from "fs";
import { utils } from "x-law";

// Create a WAV header for mono 16-bit PCM at 16kHz
const dataSize = pcmSamples.byteLength;
const wavHeader = utils.createWavHeader(dataSize, 16000, 1, 16);

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
