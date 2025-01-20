# xlaw - A-Law and mu-Law codecs in JavaScript/TypeScript

A rewrite of the [alawmulaw](https://github.com/rochars/alawmulaw) library. Adds some additional features as well as a modernized build process and TypeScript support.

This fork is primarily intended to be used in a backend environment.

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

## References

https://github.com/rochars/alawmulaw  
https://github.com/torvalds/linux/blob/master/sound/core/oss/mulaw.c  
https://github.com/deftio/companders  
http://dystopiancode.blogspot.com.br/2012/02/pcm-law-and-u-law-companding-algorithms.html

### LICENSE

This project is licensed under the MIT license. See [LICENSE](LICENSE) for more details.
