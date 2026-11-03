import type { Target } from "./curriculum.ts";
import type { Pitch } from "./pitch.ts";

// String 1 is the thinnest/highest string. Standard tuning, no capo.
export const guitarStrings = [
  { string: 1, midi: 64, label: "1 · high E" },
  { string: 2, midi: 59, label: "2 · B" },
  { string: 3, midi: 55, label: "3 · G" },
  { string: 4, midi: 50, label: "4 · D" },
  { string: 5, midi: 45, label: "5 · A" },
  { string: 6, midi: 40, label: "6 · low E" },
] as const;

export function guitarPosition(target: Target) {
  const string = guitarStrings.find((s) => s.string === target.string);
  const fret = target.fret;
  if (
    !string ||
    fret === undefined ||
    !Number.isInteger(fret) ||
    fret < 0 ||
    fret > 24 ||
    string.midi + fret !== target.midi
  )
    return null;
  return {
    string: string.string,
    fret,
    finger: fret === 0 ? 0 : (target.finger ?? (fret <= 4 ? fret : null)),
  };
}
export function guitarFinger(target: Target) {
  const position = guitarPosition(target);
  if (!position) return "Position unavailable";
  if (position.fret === 0) return "Open · no fretting finger";
  const names = ["", "index", "middle", "ring", "little"];
  return position.finger && names[position.finger]
    ? `${position.finger} · ${names[position.finger]} finger`
    : "Use a comfortable fretting finger";
}

export function tuningReading(pitch: Pitch | null, target: number) {
  if (!pitch || pitch.confidence < 0.9) return null;
  const cents = (pitch.midi - target) * 100;
  if (Math.abs(cents) > 150) return { cents, state: "different" as const };
  return {
    cents,
    state:
      Math.abs(cents) <= 10
        ? ("in-tune" as const)
        : cents < 0
          ? ("flat" as const)
          : ("sharp" as const),
  };
}
