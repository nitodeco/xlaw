import { BitDepth } from "./lib/types";

/**
 * A-Law codec for audio processing.
 */
export namespace alaw {
  function decode(samples: Uint8Array | Buffer, targetBitDepth?: BitDepth): Buffer;
  function decodeSample(aLawSample: number, targetBitDepth?: BitDepth): number;
  function encode(samples: Buffer | Int16Array, inputBitDepth?: BitDepth): Uint8Array;
  function encodeSample(sample: number, inputBitDepth?: BitDepth): number;
}

/**
 * μ-Law codec for audio processing.
 */
export namespace mulaw {
  function decode(samples: Uint8Array | Buffer, targetBitDepth?: BitDepth): Buffer;
  function decodeSample(muLawSample: number, targetBitDepth?: BitDepth): number;
  function encode(samples: Buffer | Int16Array, inputBitDepth?: BitDepth): Uint8Array;
  function encodeSample(sample: number, inputBitDepth?: BitDepth): number;
}

/**
 * Utility functions for common audio processing tasks.
 */
export namespace utils {
  function calculateRms(buffer: Buffer, bitDepth: BitDepth): number;
  function calculateLufs(buffer: Buffer, bitDepth: BitDepth, sampleRate: number): number;
  function resample(samples: number[], inputSampleRate: number, targetSampleRate: number): number[];
  function requantize(
    sample: number,
    inputBitDepth: BitDepth,
    targetBitDepth: BitDepth,
    previousError: number
  ): { sample: number; error: number };
  function requantizeSamples(samples: number[], inputBitDepth: BitDepth, targetBitDepth: BitDepth): number[];
}

export namespace types {
  type BitDepth = 8 | 16 | 24 | 32 | 48;
  type Channels = 1 | 2;
}
