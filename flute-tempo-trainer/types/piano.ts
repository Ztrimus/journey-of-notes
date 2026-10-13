// ─── Piano Exercise Types ────────────────────────────────────────────────────

/** Milliseconds between displaying one random note prompt and the next. */
export const PIANO_NOTE_INTERVAL_MS = 5000;

// ─── Dimensions ──────────────────────────────────────────────────────────────

export type PianoHand = 'L' | 'R';
export const PIANO_HANDS: PianoHand[] = ['L', 'R'];
export const PIANO_HAND_LABELS: Record<PianoHand, string> = {
  L: 'Left',
  R: 'Right',
};

/** Finger numbers 1 (thumb) → 5 (pinky). */
export type PianoFinger = 1 | 2 | 3 | 4 | 5;
export const PIANO_FINGERS: PianoFinger[] = [1, 2, 3, 4, 5];
export const PIANO_FINGER_LABELS: Record<PianoFinger, string> = {
  1: '1 – Thumb',
  2: '2 – Index',
  3: '3 – Middle',
  4: '4 – Ring',
  5: '5 – Pinky',
};

/** Octaves 1–7 covering the standard piano range. */
export type PianoOctave = 1 | 2 | 3 | 4 | 5 | 6 | 7;
export const PIANO_OCTAVES: PianoOctave[] = [1, 2, 3, 4, 5, 6, 7];

/**
 * All 12 chromatic notes.
 * Enharmonic equivalents shown with "/" (e.g. A#/B♭).
 */
export type PianoNote =
  | 'A'
  | 'A#/B♭'
  | 'B'
  | 'C'
  | 'C#/D♭'
  | 'D'
  | 'D#/E♭'
  | 'E'
  | 'F'
  | 'F#/G♭'
  | 'G'
  | 'G#/A♭';

export const PIANO_NOTES: PianoNote[] = [
  'A',
  'A#/B♭',
  'B',
  'C',
  'C#/D♭',
  'D',
  'D#/E♭',
  'E',
  'F',
  'F#/G♭',
  'G',
  'G#/A♭',
];

// 2 hands × 5 fingers × 7 octaves × 12 notes = 840 combinations
export const TOTAL_COMBINATIONS =
  PIANO_HANDS.length *
  PIANO_FINGERS.length *
  PIANO_OCTAVES.length *
  PIANO_NOTES.length; // = 840

// ─── Prompt ───────────────────────────────────────────────────────────────────

export interface NotePrompt {
  hand: PianoHand;
  finger: PianoFinger;
  octave: PianoOctave;
  note: PianoNote;
}
