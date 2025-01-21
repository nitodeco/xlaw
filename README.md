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

## API

### xlaw.alaw

```javascript
/**
 * Encode a 16-bit linear PCM sample as 8-bit A-Law.
 * @param {number} sample A 16-bit PCM sample
 * @return {number}
 */
export function encodeSample(sample) {}

/**
 * Decode a 8-bit A-Law sample as 16-bit PCM.
 * @param {number} aLawSample The 8-bit A-Law sample
 * @return {number}
 */
export function decodeSample(aLawSample) {}

/**
 * Encode 16-bit linear PCM samples as 8-bit A-Law samples.
 * @param {!Int16Array} samples A array of 16-bit PCM samples.
 * @return {!Uint8Array}
 */
export function encode(samples) {}

/**
 * Decode 8-bit A-Law samples into 16-bit linear PCM samples.
 * @param {!Uint8Array} samples A array of 8-bit A-Law samples.
 * @return {!Int16Array}
 */
export function decode(samples) {}
```

### xlaw.mulaw

```javascript
/**
 * Encode a 16-bit linear PCM sample as 8-bit mu-Law.
 * @param {number} sample A 16-bit PCM sample
 * @return {number}
 */
export function encodeSample(sample) {}

/**
 * Decode a 8-bit mu-Law sample as 16-bit PCM.
 * @param {number} muLawSample The 8-bit mu-Law sample
 * @return {number}
 */
export function decodeSample(muLawSample) {}

/**
 * Encode 16-bit linear PCM samples into 8-bit mu-Law samples.
 * @param {!Int16Array} samples A array of 16-bit PCM samples.
 * @return {!Uint8Array}
 */
export function encode(samples) {}

/**
 * Decode 8-bit mu-Law samples into 16-bit PCM samples.
 * @param {!Uint8Array} samples A array of 8-bit mu-Law samples.
 * @return {!Int16Array}
 */
export function decode(samples) {}
```

### LICENSE

This project is licensed under the MIT license. See [LICENSE](LICENSE) for more details.
