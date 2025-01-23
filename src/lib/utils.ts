/**
 * @module x-law/utils
 * Utility functions for common audio processing tasks.
 */

import { BitDepth, Channels } from "./types";

const BIT_DEPTHS: BitDepth[] = [8, 16, 24, 32];

/**
 * Computes the average RMS loudness of a PCM buffer in decibels (dB).
 *
 * @param samples - Array of PCM samples.
 * @param bitDepth - The bit depth of the PCM audio.
 * @returns The average RMS loudness in decibels (dB).
 *
 * @throws {Error} If the buffer is empty or the bit depth is invalid.
 */
export function calculateRms(samples: number[], bitDepth: number): number {
  if (samples.length === 0) {
    throw new Error("Invalid buffer, buffer must not be empty.");
  }
  if (!BIT_DEPTHS.includes(bitDepth as BitDepth)) {
    throw new Error("Invalid bit depth, supported values are 8, 16, 24, and 32.");
  }

  const maxValue = (1 << (bitDepth - 1)) - 1;
  let sumOfSquares = 0;

  for (const sample of samples) {
    const normalized = sample / maxValue;
    sumOfSquares += normalized * normalized;
  }

  const rms = Math.sqrt(sumOfSquares / samples.length);

  if (rms === 0) {
    return -Infinity;
  }

  return 20 * Math.log10(rms);
}

/**
 * Computes the integrated LUFS loudness of a PCM buffer.
 *
 * @param samples - Array of PCM samples
 * @param bitDepth - The bit depth of the PCM audio (8, 16, 24, or 32)
 * @param sampleRate - The sample rate in Hz (currently unused)
 * @returns The integrated loudness in LUFS
 *
 * @throws {Error} If the buffer is empty, the bit depth is invalid, or the sample rate is non-positive
 */
export function calculateLufs(samples: number[], bitDepth: number, sampleRate: number): number {
  if (!samples.length) {
    throw new Error("Invalid buffer, must not be empty.");
  }
  if (!BIT_DEPTHS.includes(bitDepth as BitDepth)) {
    throw new Error("Invalid bit depth, supported values are 8, 16, 24, and 32.");
  }
  if (sampleRate <= 0) {
    throw new Error("Invalid sample rate, must be a positive number.");
  }

  const kA = 1.53512485958697;
  const kB = -2.69169618940638;
  const kC = 1.19839281085285;
  const kD = -1.69065929318241;
  const kE = 0.73248077421585;

  const maxValue = (1 << (bitDepth - 1)) - 1;
  const normalized = samples.map((sample) => sample / maxValue);

  let w1 = 0;
  let w2 = 0;
  let sumOfSquares = 0;

  for (let i = 0; i < normalized.length; i++) {
    let w0 = 0;
    if (i >= 2) {
      w0 = kA * normalized[i] + kB * normalized[i - 1] + kC * normalized[i - 2] + kD * w1 + kE * w2;
    }
    sumOfSquares += w0 * w0;
    w2 = w1;
    w1 = w0;
  }

  const meanSquare = sumOfSquares / normalized.length;
  const lufs = 10 * Math.log10(meanSquare);

  return lufs;
}

/**
 * Creates a WAV header for a given data size, sample rate, and number of channels.
 *
 * @param dataSize - Size of the data in bytes
 * @param sampleRate - Sample rate of the audio in Hz
 * @param channels - Number of channels in the audio
 * @param bitDepth - Bit depth of the audio
 * @returns Buffer containing WAV header
 */
export function createWavHeader(dataSize: number, sampleRate: number, channels: Channels, bitDepth: BitDepth): Buffer {
  // https://docs.fileformat.com/audio/wav/
  const headerData = [
    { value: "RIFF", type: "string" },
    { value: 36 + dataSize, type: "uint32" },
    { value: "WAVE", type: "string" },
    { value: "fmt ", type: "string" },
    { value: 16, type: "uint32" },
    { value: 7, type: "uint16" },
    { value: channels, type: "uint16" },
    { value: sampleRate, type: "uint32" },
    { value: sampleRate * channels, type: "uint32" },
    { value: channels, type: "uint16" },
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
 * Generates Triangular Probability Density Function (TPDF) dither.
 * TPDF provides better noise characteristics than uniform dithering.
 * @param bitDepth - Target bit depth for dither generation
 * @returns Dither value scaled to the target bit depth
 */
const generateTPDFDither = (bitDepth: number): number => {
  const r1 = Math.random() * 2 - 1;
  const r2 = Math.random() * 2 - 1;
  return (r1 + r2) * (1 << (bitDepth - 1));
};

/**
 * Applies simple noise shaping to reduce perceived quantization noise.
 * @param sample - Input sample to process
 * @param error - Previous sample's quantization error
 * @returns Processed sample with noise shaping applied
 */
const applyNoiseShaping = (sample: number, error: number): number => {
  const shapingCoeff = -1.5;
  return sample + error * shapingCoeff;
};

/**
 * Requantizes a PCM sample to a different bit depth with dithering and noise shaping.
 * @param sample - Input PCM sample.
 * @param inputBitDepth - Original bit depth of the sample
 * @param targetBitDepth - Desired output bit depth
 * @param previousError - Previous sample's quantization error for noise shaping
 * @returns Object containing the processed sample and its quantization error
 * @throws {Error} If sample value exceeds the valid range for input bit depth
 */
export const requantizeSample = (
  sample: number,
  inputBitDepth: BitDepth,
  targetBitDepth: BitDepth,
  previousError = 0
): { sample: number; error: number } => {
  const maxInputValue = (1 << (inputBitDepth - 1)) - 1;
  if (Math.abs(sample) > maxInputValue) {
    throw new Error(`Sample value exceeds ${inputBitDepth}-bit range`);
  }

  const bitDifference = inputBitDepth - targetBitDepth;

  if (bitDifference > 0) {
    let processedSample = sample + generateTPDFDither(targetBitDepth);
    processedSample = applyNoiseShaping(processedSample, previousError);

    const quantized = Math.round(processedSample / (1 << bitDifference)) * (1 << bitDifference);
    const currentError = processedSample - quantized;

    const result = Math.max(
      -maxInputValue,
      Math.min(maxInputValue, Math.round(processedSample / (1 << bitDifference)))
    );

    return {
      sample: result,
      error: currentError,
    };
  } else {
    return {
      sample: sample << Math.abs(bitDifference),
      error: 0,
    };
  }
};

/**
 * Requantizes an array of audio samples to a different bit depth.
 * Applies TPDF dithering and noise shaping across the entire array.
 * @param samples - Array of input audio samples
 * @param inputBitDepth - Original bit depth of the samples
 * @param targetBitDepth - Desired output bit depth
 * @returns Array of requantized samples
 */
export const requantize = (samples: number[], inputBitDepth: BitDepth, targetBitDepth: BitDepth): number[] => {
  let lastError = 0;

  return samples.map((sample) => {
    const result = requantizeSample(sample, inputBitDepth, targetBitDepth, lastError);
    lastError = result.error;
    return result.sample;
  });
};

/**
 * Resamples PCM samples from one sample rate to another.
 * @param samples - Array of PCM samples
 * @param inputSampleRate - The sample rate of the input samples
 * @param targetSampleRate - The target sample rate
 * @returns Array of resampled PCM samples
 */
export const resample = (samples: number[], inputSampleRate: number, targetSampleRate: number) => {
  if (inputSampleRate <= 0 || targetSampleRate <= 0) {
    throw new Error("Sample rates must be positive");
  }

  const ratio = targetSampleRate / inputSampleRate;
  const resampled = [];

  for (let i = 0; i < samples.length * ratio; i++) {
    const position = i / ratio;
    const index1 = Math.floor(position);
    const index2 = Math.min(index1 + 1, samples.length - 1);

    const alpha = position - index1;

    const interpolatedValue = samples[index1] * (1 - alpha) + samples[index2] * alpha;

    resampled.push(interpolatedValue);
  }

  return resampled;
};
