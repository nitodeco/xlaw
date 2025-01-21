export namespace alaw {
  function decode(samples: Uint8Array): Int16Array;
  function decodeSample(sample: number): number;
  function encode(samples: Int16Array): Uint8Array;
  function encodeSample(sample: number): number;
}

export namespace mulaw {
  function decode(samples: Uint8Array): Int16Array;
  function decodeSample(sample: number): number;
  function encode(samples: Int16Array): Uint8Array;
  function encodeSample(sample: number): number;
}

export namespace utils {
  function calculateRms(buffer: number[], bitDepth: number): number;
  function calculateLufs(buffer: number[], bitDepth: number, sampleRate: number): number;
}
