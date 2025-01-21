/**
 * @fileoverview A-Law codec.
 */

/** @module x-law/alaw */

const LOG_TABLE: number[] = [
  1, 1, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 4, 4, 4, 4, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 6, 6, 6, 6, 6, 6, 6,
  6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7,
  7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7,
  7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7,
];

/**
 * Encodes a single 16-bit PCM sample to 8-bit A-Law.
 * @param {number} sample - The input PCM sample (16-bit signed integer)
 * @returns {number} The encoded 8-bit A-Law sample
 */
export function encodeSample(sample: number): number {
  let compandedValue: number;
  sample = sample == -32768 ? -32767 : sample;
  let sign = (~sample >> 8) & 0x80;
  if (!sign) {
    sample = sample * -1;
  }
  if (sample > 32635) {
    sample = 32635;
  }
  if (sample >= 256) {
    let exponent: number = LOG_TABLE[(sample >> 8) & 0x7f];
    let mantissa: number = (sample >> (exponent + 3)) & 0x0f;
    compandedValue = (exponent << 4) | mantissa;
  } else {
    compandedValue = sample >> 4;
  }
  return compandedValue ^ (sign ^ 0x55);
}

/**
 * Decodes a single 8-bit A-Law sample to 16-bit PCM.
 * @param {number} aLawSample - The input A-Law sample (8-bit unsigned integer)
 * @returns {number} The decoded 16-bit PCM sample
 */
export function decodeSample(aLawSample: number): number {
  let sign: number = 0;
  aLawSample ^= 0x55;
  if (aLawSample & 0x80) {
    aLawSample &= ~(1 << 7);
    sign = -1;
  }

  const position: number = ((aLawSample & 0xf0) >> 4) + 4;
  let decoded: number = 0;
  if (position != 4) {
    decoded = (1 << position) | ((aLawSample & 0x0f) << (position - 4)) | (1 << (position - 5));
  } else {
    decoded = (aLawSample << 1) | 1;
  }
  decoded = sign === 0 ? decoded : -decoded;
  return decoded * 8 * -1;
}

/**
 * Encodes an array of 16-bit PCM samples to 8-bit A-Law samples.
 * @param {Int16Array} samples - Array of 16-bit PCM samples to encode
 * @returns {Uint8Array} Array of encoded 8-bit A-Law samples
 */
export function encode(samples: Int16Array): Uint8Array {
  const aLawSamples: Uint8Array = new Uint8Array(samples.length);
  for (let i = 0; i < samples.length; i++) {
    aLawSamples[i] = encodeSample(samples[i]);
  }
  return aLawSamples;
}

/**
 * Decodes an array of 8-bit A-Law samples to 16-bit PCM samples.
 * @param {Uint8Array} samples - Array of 8-bit A-Law samples to decode
 * @returns {Int16Array} Array of decoded 16-bit PCM samples
 */
export function decode(samples: Uint8Array): Int16Array {
  const pcmSamples: Int16Array = new Int16Array(samples.length);
  for (let i = 0; i < samples.length; i++) {
    pcmSamples[i] = decodeSample(samples[i]);
  }
  return pcmSamples;
}
