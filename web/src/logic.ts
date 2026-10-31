export function rms(samples: Float32Array): number {
  if (!samples.length) return 0;
  return Math.sqrt(
    samples.reduce((sum, value) => sum + value * value, 0) / samples.length,
  );
}

// Experimental amplitude onset detector; this does not identify pitch.
export class OnsetDetector {
  private armed = true;
  private last = -Infinity;
  process(level: number, time: number, threshold: number): boolean {
    if (level < threshold * 0.55) this.armed = true;
    if (this.armed && level >= threshold && time - this.last >= 0.15) {
      this.armed = false;
      this.last = time;
      return true;
    }
    return false;
  }
}

export function pianoPrompt(random = Math.random) {
  const notes = ["C", "D", "E", "F", "G", "A", "B"];
  return {
    note: `${notes[Math.floor(random() * 7)]}${3 + Math.floor(random() * 3)}`,
    hand: random() < 0.5 ? "Left hand" : "Right hand",
    finger: 1 + Math.floor(random() * 5),
  };
}

export function formatTime(seconds: number) {
  return `${Math.floor(seconds / 60)}:${Math.floor(seconds % 60)
    .toString()
    .padStart(2, "0")}`;
}
