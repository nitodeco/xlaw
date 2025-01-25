export type BitDepth = 8 | 16 | 24 | 32 | 48;

export type Channels = 1 | 2;

/**
 * A-Law codec for audio processing.
 */
export namespace alaw {
  function decodeSample(sample: number): number;
  function encodeSample(sample: number): number;
  function decode(samples: Buffer): Int16Array;
  function encode(samples: Int16Array): Uint8Array;
  function encodeBuffer(buffer: Buffer): Buffer;
  function decodeBuffer(buffer: Buffer): Buffer;
}

/**
 * μ-Law codec for audio processing.
 */
export namespace mulaw {
  function decodeSample(sample: number): number;
  function encodeSample(sample: number): number;
  function decode(samples: Uint8Array): Int16Array;
  function encode(samples: Int16Array): Uint8Array;
  function encodeBuffer(buffer: Buffer): Buffer;
  function decodeBuffer(buffer: Buffer): Buffer;
}

/**
 * Utility functions for common audio processing tasks.
 */
export namespace utils {
  function calculateLoudness(buffer: Buffer, bitDepth: BitDepth): number;
  function createWavHeader(dataSize: number, sampleRate: number, channels: Channels, bitDepth: BitDepth): Buffer;
  function resample(samples: number[], inputSampleRate: number, targetSampleRate: number, bitDepth: BitDepth): number[];
}
