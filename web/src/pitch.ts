export interface Pitch {
  hz: number;
  midi: number;
  confidence: number;
}
export const midiToHz = (midi: number) => 440 * 2 ** ((midi - 69) / 12);
export const hzToMidi = (hz: number) => 69 + 12 * Math.log2(hz / 440);
export function noteName(midi: number): string {
  const rounded = Math.round(midi);
  return (
    ["C", "C♯", "D", "D♯", "E", "F", "F♯", "G", "G♯", "A", "A♯", "B"][
      ((rounded % 12) + 12) % 12
    ] +
    (Math.floor(rounded / 12) - 1)
  );
}

// YIN-style cumulative mean-normalized difference. Single pitched source only.
// Returns null rather than inventing a note when periodicity is weak.
export function detectPitch(
  samples: Float32Array,
  sampleRate: number,
  workspace?: Float32Array,
): Pitch | null {
  const maxLag = Math.min(
    Math.floor(sampleRate / 100),
    Math.floor(samples.length / 2) - 1,
  );
  const minLag = Math.max(2, Math.floor(sampleRate / 2000));
  if (maxLag <= minLag) return null;
  const size = samples.length - maxLag;
  const mean = samples.reduce((sum, x) => sum + x, 0) / samples.length;
  let energy = 0;
  for (const x of samples) energy += (x - mean) ** 2;
  if (Math.sqrt(energy / samples.length) < 0.006) return null;
  const normalized =
    workspace && workspace.length > maxLag
      ? workspace
      : new Float32Array(maxLag + 1);
  let running = 0;
  for (let lag = 1; lag <= maxLag; lag++) {
    let sum = 0;
    for (let i = 0; i < size; i++) {
      const delta = samples[i] - samples[i + lag];
      sum += delta * delta;
    }
    running += sum;
    normalized[lag] = running ? (sum * lag) / running : 1;
  }
  for (let lag = minLag; lag < maxLag; lag++) {
    if (normalized[lag] < 0.12) {
      while (lag + 1 < maxLag && normalized[lag + 1] < normalized[lag]) lag++;
      const left = normalized[lag - 1],
        center = normalized[lag],
        right = normalized[lag + 1];
      const denominator = left - 2 * center + right;
      const refined =
        lag + (denominator ? (left - right) / (2 * denominator) : 0);
      const hz = sampleRate / refined;
      if (hz < 100 || hz > 2000) return null;
      return { hz, midi: hzToMidi(hz), confidence: 1 - center };
    }
  }
  return null;
}
