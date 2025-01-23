export function validateSample(sample: number, maxValue: number) {
  if (Math.abs(sample) > maxValue) {
    throw new Error(`Sample value ${sample} exceeds maximum ${maxValue}`);
  }
}
