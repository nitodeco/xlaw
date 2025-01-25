/**
 * @module x-law/mulaw
 * μ-Law codec.
 */

import { BitDepth } from "./types";
import { requantizeSample } from "./utils";
import { SIGN_SHIFT, MANTISSA_MASK } from "./constants";
import { validateSample } from "./internal";

const BIAS = 0x84;
const CLIP = 32635;
const EXPONENT_MASK = 0x07;
const EXPONENT_SHIFT = 4;

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
 * Encodes a single PCM sample of arbitrary bit depth and sample rate to 8-bit μ-Law.
 * @param {number} sample - The input PCM sample
 * @param {BitDepth} inputBitDepth - The bit depth of the input sample (default: 16)
 * @returns {number} The encoded 8-bit μ-Law sample
 */
export function encodeSample(sample: number, inputBitDepth: BitDepth = 16): number {
  let scaledSample = requantizeSample(sample, inputBitDepth, 16).sample;
  validateSample(scaledSample, 32767);

  let sign = (scaledSample >> SIGN_SHIFT) & 0x80;
  if (sign !== 0) scaledSample = -scaledSample;

  scaledSample += BIAS;
  if (scaledSample > CLIP) scaledSample = CLIP;

  let exponent = encodeTable[(scaledSample >> 7) & 0xff];
  let mantissa = (scaledSample >> (exponent + 3)) & MANTISSA_MASK;
  let muLawSample = ~(sign | (exponent << EXPONENT_SHIFT) | mantissa);

  return muLawSample & 0xff;
}

/**
 * Decodes a single 8-bit μ-Law sample to a PCM sample of arbitrary bit depth and sample rate.
 * @param {number} muLawSample - The input μ-Law sample (8-bit unsigned integer)
 * @param {BitDepth} targetBitDepth - The target bit depth of the output (default: 16)
 * @returns {number} The decoded PCM sample, properly scaled to the target bit depth
 */
export function decodeSample(muLawSample: number, targetBitDepth: BitDepth = 16): number {
  muLawSample = ~muLawSample;
  let sign = muLawSample & 0x80;
  let exponent = (muLawSample >> EXPONENT_SHIFT) & EXPONENT_MASK;
  let mantissa = muLawSample & MANTISSA_MASK;

  let decoded16 = decodeTable[exponent] + (mantissa << (exponent + 3));
  if (sign !== 0) decoded16 = -decoded16;

  return requantizeSample(decoded16, 16, targetBitDepth).sample;
}

/**
 * Encodes an array of PCM samples or a PCM buffer to 8-bit μ-Law samples.
 * @param {Buffer | Int16Array} samples - Array of PCM samples to encode
 * @returns {Uint8Array} Array of encoded 8-bit μ-Law samples
 */
export function encode(samples: Buffer | Int16Array, inputBitDepth: BitDepth = 16): Uint8Array {
  let muLawSamples: Uint8Array = new Uint8Array(samples.length);
  for (let i = 0; i < samples.length; i++) {
    muLawSamples[i] = encodeSample(samples[i], inputBitDepth);
  }
  return muLawSamples;
}

/**
 * Decodes an array of 8-bit μ-Law samples to a PCM buffer.
 * @param {Uint8Array} samples - Array of 8-bit μ-Law samples to decode
 * @param {BitDepth} targetBitDepth - Target bit depth for decoded samples (default: 16)
 * @returns {Buffer} Buffer containing decoded PCM samples at specified bit depth
 */
export function decode(samples: Uint8Array | Buffer, targetBitDepth: BitDepth = 16): Buffer {
  if (samples instanceof Buffer) {
    try {
      samples = new Uint8Array(samples);
    } catch (error) {
      throw new Error("Invalid input buffer, must be 8 bit μ-Law");
    }
  }

  const bytesPerSample = Math.ceil(targetBitDepth / 8);
  const buffer = Buffer.alloc(samples.length * bytesPerSample);

  for (let i = 0; i < samples.length; i++) {
    const decodedSample = decodeSample(samples[i], targetBitDepth);
    buffer.writeIntLE(decodedSample, i * bytesPerSample, bytesPerSample);
  }

  return buffer;
}
