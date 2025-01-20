# xlaw - A-Law and mu-Law codecs for JavaScript/TypeScript

A rewrite of the [alawmulaw](https://github.com/rochars/alawmulaw) library in TypeScript, with a modernized build process and more features.

This package is primarily intended to be used in a backend environment.

## Install

```
npm install xlaw
```

## Usage

CommonJS:

```javascript
const xlaw = require("xlaw");
```

ESM:

```javascript
import xlaw from "xlaw";
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
