import { noteName, type Pitch } from "./pitch.ts";
const SWARS = [
  "Sa",
  "Komal Re",
  "Re",
  "Komal Ga",
  "Ga",
  "Ma",
  "Tivra Ma",
  "Pa",
  "Komal Dha",
  "Dha",
  "Komal Ni",
  "Ni",
];
export function swarForMidi(midi: number, tonic: number) {
  const relative = Math.round(midi) - tonic;
  const degree = ((relative % 12) + 12) % 12;
  const octave = Math.floor(relative / 12);
  const register =
    octave === 0
      ? "Middle"
      : octave === 1
        ? "Upper"
        : octave === -1
          ? "Lower"
          : `${Math.abs(octave)} octaves ${octave > 0 ? "above" : "below"}`;
  return { name: SWARS[degree], octave, register, pitch: noteName(midi) };
}
export function heardName(
  midi: number,
  instrument: string,
  tonic: number | null,
  notation?: "western" | "sargam",
) {
  if (
    (instrument !== "flute" &&
      !(instrument === "vocal" && notation === "sargam")) ||
    tonic === null
  )
    return noteName(midi);
  const swar = swarForMidi(midi, tonic);
  return `${swar.register} ${swar.name} / ${swar.pitch}`;
}
export class TonicSampler {
  private note: number | null = null;
  private since = 0;
  private last = 0;
  private frequencies: number[] = [];
  process(
    pitch: Pitch | null,
    level: number,
    seconds: number,
  ): { midi: number; hz: number } | null {
    if (!pitch || pitch.confidence < 0.93 || level < 0.012) {
      this.note = null;
      this.frequencies = [];
      return null;
    }
    const note = Math.round(pitch.midi);
    if (note < 48 || note > 83) {
      this.note = null;
      return null;
    }
    if (note !== this.note || seconds - this.last > 0.25) {
      this.note = note;
      this.since = seconds;
      this.frequencies = [];
    }
    this.last = seconds;
    this.frequencies.push(pitch.hz);
    if (this.frequencies.length > 30) this.frequencies.shift();
    if (seconds - this.since < 1.2 || this.frequencies.length < 12) return null;
    const sorted = [...this.frequencies].sort((a, b) => a - b);
    const hz = sorted[Math.floor(sorted.length / 2)];
    const spread = 1200 * Math.log2(sorted.at(-1)! / sorted[0]);
    if (spread > 35) {
      this.since = seconds;
      this.frequencies = [];
      return null;
    }
    return { midi: note, hz };
  }
}
