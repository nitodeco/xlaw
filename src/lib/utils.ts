/**
 * @module x-law/utils
 * Utility functions for common audio processing tasks.
 */

const BIT_DEPTHS: number[] = [8, 16, 24, 32];

/**
 * Computes the average RMS loudness of a PCM buffer in decibels (dB).
 *
 * @param buffer - Array of PCM samples.
 * @param bitDepth - The bit depth of the PCM audio.
 * @returns The average RMS loudness in decibels (dB).
 *
 * @throws {Error} If the buffer is empty or the bit depth is invalid.
 */
export function calculateRms(buffer: number[], bitDepth: number): number {
  if (buffer.length === 0) {
    throw new Error("Invalid buffer, buffer must not be empty.");
  }
  if (!BIT_DEPTHS.includes(bitDepth)) {
    throw new Error("Invalid bit depth, supported values are 8, 16, 24, and 32.");
  }

  const maxValue = (1 << (bitDepth - 1)) - 1;
  let sumOfSquares = 0;

  for (const sample of buffer) {
    const normalized = sample / maxValue;
    sumOfSquares += normalized * normalized;
  }

  const rms = Math.sqrt(sumOfSquares / buffer.length);

  if (rms === 0) {
    return -Infinity;
  }

  return 20 * Math.log10(rms);
}

/**
 * Computes the integrated LUFS loudness of a PCM buffer.
 *
 * @param buffer - Array of PCM samples.
 * @param bitDepth - The bit depth of the PCM audio (8, 16, 24, or 32).
 * @param sampleRate - The sample rate in Hz (currently unused).
 * @returns The integrated loudness in LUFS.
 *
 * @throws {Error} If the buffer is empty, the bit depth is invalid, or the sample rate is non-positive.
 */
export function calculateLufs(buffer: number[], bitDepth: number, sampleRate: number): number {
  if (!buffer.length) {
    throw new Error("Invalid buffer, must not be empty.");
  }
  if (![8, 16, 24, 32].includes(bitDepth)) {
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
  const normalized = buffer.map((sample) => sample / maxValue);

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
