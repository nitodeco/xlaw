/**
 * @module x-law/mulaw
 */

const BIAS = 0x84;
const CLIP = 32635;

const encodeTable = [
  0, 0, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 3, 3, 3, 3, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 5, 5, 5, 5, 5, 5, 5,
  5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6,
  6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6,
  6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7,
  7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7,
  7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7,
  7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7,
];

const decodeTable = [0, 132, 396, 924, 1980, 4092, 8316, 16764];

/**
 * Encode a single 16-bit PCM sample to 8-bit μ-Law.
 * @param {number} sample - A 16-bit PCM sample
 * @returns {number} The 8-bit μ-Law encoded sample
 */
export function encodeSample(sample: number): number {
  const sign = sample < 0 ? 0x80 : 0;
  sample = Math.abs(sample);

  sample += BIAS;
  if (sample > CLIP) sample = CLIP;

  const exponent = encodeTable[(sample >> 7) & 0xff];
  const mantissa = (sample >> (exponent + 3)) & 0x0f;

  return ~(sign | (exponent << 4) | mantissa) & 0xff;
}

/**
 * Decode a single 8-bit μ-Law sample to 16-bit PCM.
 * @param {number} sample - 8-bit μ-Law sample
 * @returns {number} The decoded 16-bit PCM sample
 */
export function decodeSample(sample: number): number {
  sample = ~sample & 0xff;

  const sign = sample & 0x80 ? -1 : 1;
  const exponent = (sample >> 4) & 0x07;
  const mantissa = sample & 0x0f;

  const decodedSample = decodeTable[exponent] + (mantissa << (exponent + 3));
  return sign * decodedSample;
}

/**
 * Encode an array of 16-bit PCM samples into 8-bit μ-Law samples.
 * @param {Int16Array} samples - Int16Array of PCM samples
 * @returns {Uint8Array} A new Uint8Array of μ-Law data
 */
export function encode(samples: Int16Array): Uint8Array {
  const muLawSamples = new Uint8Array(samples.length);
  for (let i = 0; i < samples.length; i++) {
    muLawSamples[i] = encodeSample(samples[i]);
  }
  return muLawSamples;
}

/**
 * Decode an array of 8-bit μ-Law samples into 16-bit PCM samples.
 * @param {Uint8Array} samples - Uint8Array of μ-Law data
 * @returns {Int16Array} A new Int16Array of 16-bit PCM samples
 */
export function decode(samples: Uint8Array): Int16Array {
  const pcmSamples = new Int16Array(samples.length);
  for (let i = 0; i < samples.length; i++) {
    pcmSamples[i] = decodeSample(samples[i]);
  }
  return pcmSamples;
}

/**
 * Encode a Buffer of 16-bit PCM samples into a Buffer of 8-bit μ-Law samples.
 * @param {Buffer} buffer - Buffer of 16-bit PCM samples
 * @returns {Buffer} Buffer of 8-bit μ-Law samples
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
 * Decode a Buffer of 8-bit μ-Law samples into a Buffer of 16-bit PCM samples.
 * @param {Buffer} buffer - Buffer of 8-bit μ-Law samples
 * @returns {Buffer} Buffer of 16-bit PCM samples
 */
export function decodeBuffer(buffer: Buffer): Buffer {
  const samples = decode(new Uint8Array(buffer));
  return Buffer.from(samples.buffer);
}
