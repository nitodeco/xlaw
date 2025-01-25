/**
 * @module x-law/alaw
 * A-Law codec.
 */

import { BitDepth } from "./types";
import { requantizeSample } from "./utils";
import { SIGN_SHIFT, MANTISSA_MASK } from "./constants";
import { validateSample } from "./internal";
const ALAW_XOR = 0x55;
const SEGMENT_SHIFT = 4;

const LOG_TABLE: number[] = [
  1, 1, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 4, 4, 4, 4, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 6, 6, 6, 6, 6, 6, 6,
  6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7,
  7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7,
  7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7,
];

/**
 * Encodes a single PCM sample of arbitrary bit depth to 8-bit A-Law.
 * @param {number} sample - The input PCM sample
 * @param {BitDepth} inputBitDepth - The bit depth of the input sample (default: 16)
 * @returns {number} The encoded 8-bit A-Law sample
 */
export function encodeSample(sample: number, inputBitDepth: BitDepth = 16): number {
  let scaledSample = requantizeSample(sample, inputBitDepth, 16).sample;
  validateSample(scaledSample, 32767);
  scaledSample = scaledSample == -32768 ? -32767 : scaledSample;
  let sign = (~scaledSample >> SIGN_SHIFT) & 0x80;

  if (!sign) {
    scaledSample = scaledSample * -1;
  }

  scaledSample = Math.min(scaledSample, 32635);

  let compandedValue: number;
  if (scaledSample >= 256) {
    let exponent: number = LOG_TABLE[(scaledSample >> SIGN_SHIFT) & 0x7f];
    let mantissa: number = (scaledSample >> (exponent + 3)) & MANTISSA_MASK;
    compandedValue = (exponent << SEGMENT_SHIFT) | mantissa;
  } else {
    compandedValue = scaledSample >> SEGMENT_SHIFT;
  }

  return compandedValue ^ (sign ^ ALAW_XOR);
}

/**
 * Decodes a single 8-bit A-Law sample to PCM of arbitrary bit depth.
 * @param {number} aLawSample - The input A-Law sample (8-bit unsigned integer)
 * @param {BitDepth} targetBitDepth - The target bit depth of the output (default: 16)
 * @returns {number} The decoded PCM sample, properly scaled to the target bit depth
 */
export function decodeSample(aLawSample: number, targetBitDepth: BitDepth = 16): number {
  let sign: number = 0;
  aLawSample ^= ALAW_XOR;

  if (aLawSample & 0x80) {
    aLawSample &= ~(1 << 7);
    sign = -1;
  }

  const position: number = ((aLawSample & 0xf0) >> SEGMENT_SHIFT) + 4;
  let decoded: number = 0;

  if (position != 4) {
    decoded = (1 << position) | ((aLawSample & MANTISSA_MASK) << (position - 4)) | (1 << (position - 5));
  } else {
    decoded = (aLawSample << 1) | 1;
  }

  decoded = sign === 0 ? decoded : -decoded;
  decoded = decoded * 8 * -1;

  return requantizeSample(decoded, 16, targetBitDepth).sample;
}

/**
 * Encodes an array of PCM samples or a PCM buffer to 8-bit A-Law samples.
 * @param {Buffer | Int16Array} samples - Array of PCM samples to encode
 * @param {BitDepth} inputBitDepth - The bit depth of the input samples (default: 16)
 * @returns {Uint8Array} Array of encoded 8-bit A-Law samples
 */
export function encode(samples: Buffer | Int16Array, inputBitDepth: BitDepth = 16): Uint8Array {
  const aLawSamples: Uint8Array = new Uint8Array(samples.length);
  for (let i = 0; i < samples.length; i++) {
    aLawSamples[i] = encodeSample(samples[i], inputBitDepth);
  }
  return aLawSamples;
}

/**
 * Decodes an array of 8-bit A-Law samples to a PCM buffer.
 * @param {Uint8Array} samples - Array of 8-bit A-Law samples to decode
 * @param {BitDepth} targetBitDepth - The target bit depth of the output (default: 16)
 * @returns {Buffer} Buffer containing decoded PCM samples at specified bit depth
 */
export function decode(samples: Uint8Array | Buffer, targetBitDepth: BitDepth = 16): Buffer {
  if (samples instanceof Buffer) {
    try {
      samples = new Uint8Array(samples);
    } catch (error) {
      throw new Error("Invalid input buffer, must be 8 bit A-Law");
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
