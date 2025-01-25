/**
 * @module x-law/utils
 * Utility functions for common audio processing tasks.
 */

import { BitDepth, Channels } from "../index.d";

const BIT_DEPTHS: BitDepth[] = [8, 16, 24, 32, 48];

/**
 * Computes the average RMS loudness of a signed-integerlittle-endian PCM buffer in decibels (dB).
 *
 * @param {Buffer} buffer - PCM audio buffer
 * @param {BitDepth} bitDepth - The bit depth of the PCM audio.
 * @returns {number} The average RMS loudness in decibels (dB).
 *
 * @throws {Error} If the buffer is empty or the bit depth is invalid.
 */
export function calculateLoudness(buffer: Buffer, bitDepth: number): number {
  if (!(buffer instanceof Buffer) || buffer.length === 0) {
    throw new Error("Invalid buffer, must be a non-empty Buffer.");
  }
  if (!BIT_DEPTHS.includes(bitDepth as BitDepth)) {
    throw new Error("Invalid bit depth, supported values are 8, 16, 24, 32, and 48.");
  }
  if (bitDepth === 48) {
    throw new Error("48-bit audio is not yet implemented.");
  }

  const bytesPerSample = Math.ceil(bitDepth / 8);
  if (buffer.length % bytesPerSample !== 0) {
    throw new Error(
      `Invalid buffer length ${buffer.length}. Must be a multiple of ${bytesPerSample} bytes for ${bitDepth}-bit audio.`
    );
  }

  const maxValue = Math.pow(2, bitDepth - 1) - 1;
  const numSamples = buffer.length / bytesPerSample;
  let sumOfSquares = 0;

  for (let i = 0; i < numSamples; i++) {
    const offset = i * bytesPerSample;
    let sample: number;

    switch (bitDepth) {
      case 8:
        sample = buffer[offset];
        if (sample & 0x80) sample = sample - 256;
        break;
      case 16:
        sample = buffer[offset] | (buffer[offset + 1] << 8);
        if (sample & 0x8000) sample = sample - 65536;
        break;
      case 24:
        sample = buffer[offset] | (buffer[offset + 1] << 8) | (buffer[offset + 2] << 16);
        if (sample & 0x800000) sample = sample | ~0xffffff;
        break;
      case 32:
        sample = buffer[offset] | (buffer[offset + 1] << 8) | (buffer[offset + 2] << 16) | (buffer[offset + 3] << 24);
        break;
      default:
        throw new Error(`Unsupported bit depth: ${bitDepth}`);
    }

    const normalized = sample / maxValue;
    sumOfSquares += normalized * normalized;
  }

  const rms = Math.sqrt(sumOfSquares / numSamples);
  return rms <= 1e-10 ? -100 : 20 * Math.log10(rms);
}

/**
 * Creates a WAV header for a given data size, sample rate, and number of channels.
 * Supports only PCM audio.
 *
 * @param {number} dataSize - Size of the data in bytes
 * @param {number} sampleRate - Sample rate of the audio in Hz
 * @param {Channels} channels - Number of channels in the audio
 * @param {BitDepth} bitDepth - Bit depth of the audio
 * @returns {Buffer} Buffer containing WAV header
 */
export function createWavHeader(dataSize: number, sampleRate: number, channels: Channels, bitDepth: BitDepth): Buffer {
  // https://docs.fileformat.com/audio/wav/
  const headerData = [
    { value: "RIFF", type: "string" },
    { value: 36 + dataSize, type: "uint32" },
    { value: "WAVE", type: "string" },
    { value: "fmt ", type: "string" },
    { value: 16, type: "uint32" },
    { value: 1, type: "uint16" },
    { value: channels, type: "uint16" },
    { value: sampleRate, type: "uint32" },
    { value: (sampleRate * channels * bitDepth) / 8, type: "uint32" },
    { value: (channels * bitDepth) / 8, type: "uint16" },
    { value: bitDepth, type: "uint16" },
    { value: "data", type: "string" },
    { value: dataSize, type: "uint32" },
  ];

  const header = Buffer.alloc(44);
  let offset = 0;

  headerData.forEach(({ value, type }) => {
    if (type === "string") {
      header.write(value as string, offset);
      offset += 4;
    } else if (type === "uint32") {
      header.writeUInt32LE(value as number, offset);
      offset += 4;
    } else if (type === "uint16") {
      header.writeUInt16LE(value as number, offset);
      offset += 2;
    }
  });

  return header;
}

/**
 * Resamples PCM samples from one sample rate to another.
 * @param samples - Array of PCM samples (integers at given bit depth)
 * @param inputSampleRate - The sample rate of the input samples
 * @param targetSampleRate - The target sample rate
 * @param bitDepth - The bit depth of the PCM samples (must be in BIT_DEPTHS)
 * @returns Array of resampled PCM samples
 */
export const resample = (
  samples: number[],
  inputSampleRate: number,
  targetSampleRate: number,
  bitDepth: BitDepth
): number[] => {
  if (inputSampleRate <= 0 || targetSampleRate <= 0) {
    throw new Error("Sample rates must be positive.");
  }

  if (!BIT_DEPTHS.includes(bitDepth)) {
    throw new Error(`Invalid bit depth. Allowed values are: ${BIT_DEPTHS.join(", ")}`);
  }

  const ratio = targetSampleRate / inputSampleRate;
  const outLength = Math.round(samples.length * ratio);
  const resampled: number[] = new Array(outLength);

  const maxSample = (1 << (bitDepth - 1)) - 1;
  const minSample = -1 << (bitDepth - 1);

  for (let i = 0; i < outLength; i++) {
    const sourcePos = i / ratio;
    const index1 = Math.floor(sourcePos);
    const index2 = Math.min(index1 + 1, samples.length - 1);
    const alpha = sourcePos - index1;

    const interpolated = samples[index1] * (1 - alpha) + samples[index2] * alpha;

    const intSample = Math.round(interpolated);
    resampled[i] = Math.max(minSample, Math.min(maxSample, intSample));
  }

  return resampled;
};
