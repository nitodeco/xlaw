/**
 * @module x-law/alaw
 */

const LOG_TABLE = [
  1, 1, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 4, 4, 4, 4, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 6, 6, 6, 6, 6, 6, 6,
  6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7,
  7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7,
  7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7,
];

/**
 * Encode a 16-bit linear PCM sample as 8-bit A-Law.
 * @param {number} sample A 16-bit PCM sample
 * @return {number} 8-bit A-Law sample
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
    let exponent = LOG_TABLE[(sample >> 8) & 0x7f];
    let mantissa = (sample >> (exponent + 3)) & 0x0f;
    compandedValue = (exponent << 4) | mantissa;
  } else {
    compandedValue = sample >> 4;
  }
  return compandedValue ^ (sign ^ 0x55);
}

/**
 * Decode a 8-bit A-Law sample as 16-bit PCM.
 * @param {number} sample The 8-bit A-Law sample
 * @return {number} 16-bit PCM sample
 */
export function decodeSample(sample: number): number {
  let sign = 0;
  sample ^= 0x55;
  if (sample & 0x80) {
    sample &= ~(1 << 7);
    sign = -1;
  }
  let position = ((sample & 0xf0) >> 4) + 4;
  let decoded = 0;
  if (position != 4) {
    decoded = (1 << position) | ((sample & 0x0f) << (position - 4)) | (1 << (position - 5));
  } else {
    decoded = (sample << 1) | 1;
  }
  decoded = sign === 0 ? decoded : -decoded;
  return decoded * 8 * -1;
}

/**
 * Encode 16-bit linear PCM samples as 8-bit A-Law samples.
 * @param {!Int16Array} samples Array of 16-bit PCM samples
 * @return {!Uint8Array} Array of 8-bit A-Law samples
 */
export function encode(samples: Int16Array): Uint8Array {
  let aLawSamples = new Uint8Array(samples.length);
  for (let i = 0; i < samples.length; i++) {
    aLawSamples[i] = encodeSample(samples[i]);
  }
  return aLawSamples;
}

/**
 * Decode 8-bit A-Law samples into 16-bit linear PCM samples.
 * @param {!Uint8Array} samples Array of 8-bit A-Law samples
 * @return {!Int16Array} Array of 16-bit PCM samples
 */
export function decode(samples: Uint8Array): Int16Array {
  let pcmSamples = new Int16Array(samples.length);
  for (let i = 0; i < samples.length; i++) {
    pcmSamples[i] = decodeSample(samples[i]);
  }
  return pcmSamples;
}

/**
 * Encode a Buffer of 16-bit PCM samples into a Buffer of 8-bit A-Law samples.
 * @param {Buffer} buffer - Buffer of 16-bit PCM samples
 * @returns {Buffer} Buffer of 8-bit A-Law samples
 */
export function encodeBuffer(buffer: Buffer): Buffer {
  const numSamples = Math.floor(buffer.length / 2);
  const samples = new Int16Array(numSamples);

  for (let i = 0; i < numSamples; i++) {
    samples[i] = buffer.readInt16LE(i * 2);
  }

  return Buffer.from(encode(samples).buffer);
}

/**
 * Decode a Buffer of 8-bit A-Law samples into a Buffer of 16-bit PCM samples.
 * @param {Buffer} buffer - Buffer of 8-bit A-Law samples
 * @returns {Buffer} Buffer of 16-bit PCM samples
 */
export function decodeBuffer(buffer: Buffer): Buffer {
  const samples = decode(new Uint8Array(buffer));
  return Buffer.from(samples.buffer);
}
