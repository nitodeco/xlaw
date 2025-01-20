/**
 * @fileoverview μ-Law codec.
 */

/** @module xlaw/mulaw */

const BIAS: number = 0x84;
const CLIP: number = 32635;

const encodeTable: number[] = [
  0, 0, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 3, 3, 3, 3, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 5, 5, 5, 5, 5, 5, 5,
  5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6,
  6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6,
  6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7,
  7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7,
  7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7,
  7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7,
];

const decodeTable: number[] = [0, 132, 396, 924, 1980, 4092, 8316, 16764];

/**
 * Encodes a single 16-bit PCM sample to 8-bit μ-Law.
 * @param {number} sample - The input PCM sample (16-bit signed integer)
 * @returns {number} The encoded 8-bit μ-Law sample
 */
export function encodeSample(sample: number): number {
  let sign: number;
  let exponent: number;
  let mantissa: number;
  let muLawSample: number;

  /** get the sample into sign-magnitude **/
  sign = (sample >> 8) & 0x80;
  if (sign != 0) sample = -sample;
  /** convert from 16 bit linear to μ-law **/
  sample = sample + BIAS;
  if (sample > CLIP) sample = CLIP;
  exponent = encodeTable[(sample >> 7) & 0xff];
  mantissa = (sample >> (exponent + 3)) & 0x0f;
  muLawSample = ~(sign | (exponent << 4) | mantissa);

  return muLawSample;
}

/**
 * Decodes a single 8-bit μ-Law sample to 16-bit PCM.
 * @param {number} muLawSample - The input μ-Law sample (8-bit unsigned integer)
 * @returns {number} The decoded 16-bit PCM sample
 */
export function decodeSample(muLawSample: number): number {
  let sign: number;
  let exponent: number;
  let mantissa: number;
  let sample: number;

  muLawSample = ~muLawSample;
  sign = muLawSample & 0x80;
  exponent = (muLawSample >> 4) & 0x07;
  mantissa = muLawSample & 0x0f;
  sample = decodeTable[exponent] + (mantissa << (exponent + 3));
  if (sign != 0) sample = -sample;
  return sample;
}

/**
 * Encodes an array of 16-bit PCM samples to 8-bit μ-Law samples.
 * @param {Int16Array} samples - Array of 16-bit PCM samples to encode
 * @returns {Uint8Array} Array of encoded 8-bit μ-Law samples
 */
export function encode(samples: Int16Array): Uint8Array {
  let muLawSamples: Uint8Array = new Uint8Array(samples.length);
  for (let i = 0; i < samples.length; i++) {
    muLawSamples[i] = encodeSample(samples[i]);
  }
  return muLawSamples;
}

/**
 * Decodes an array of 8-bit μ-Law samples to 16-bit PCM samples.
 * @param {Uint8Array} samples - Array of 8-bit μ-Law samples to decode
 * @returns {Int16Array} Array of decoded 16-bit PCM samples
 */
export function decode(samples: Uint8Array): Int16Array {
  let pcmSamples: Int16Array = new Int16Array(samples.length);
  for (let i = 0; i < samples.length; i++) {
    pcmSamples[i] = decodeSample(samples[i]);
  }
  return pcmSamples;
}
