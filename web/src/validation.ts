import type { Pitch } from "./pitch.ts";
export type Outcome =
  | "correct"
  | "wrong"
  | "unclear"
  | "skipped"
  | "self-reported";
export interface Attempt {
  displayMode?: "keyboard" | "staff" | "both";
  noteHints?: boolean;
  notation?: "western" | "sargam";
  viewChanged?: boolean;
  onsetSeconds?: number;
  responseMs?: number | null;
  confirmationMs?: number | null;
  targetIndex: number;
  target: number;
  detected: number | null;
  cents: number | null;
  outcome: Outcome;
  seconds: number;
  confidence: number | null;
}
export class NoteValidator {
  private candidate: number | null | undefined = undefined;
  private since = 0;
  private emitted = false;
  private complete = false;
  private lastTime: number | null = null;
  private interrupted = false;
  private target: number;
  private hold: number;
  private targetIndex: number;
  constructor(target: number, hold = 0.45, targetIndex = 0) {
    this.target = target;
    this.hold = hold;
    this.targetIndex = targetIndex;
  }
  interrupt() {
    this.interrupted = true;
    this.lastTime = null;
  }
  ingest(pitch: Pitch | null, level: number, seconds: number): Attempt | null {
    if (this.complete) return null;
    if (this.interrupted) {
      this.since = seconds;
      this.interrupted = false;
    }
    if (this.lastTime !== null && seconds - this.lastTime > 0.25)
      this.since = seconds;
    this.lastTime = seconds;
    if (level < 0.012) {
      this.candidate = undefined;
      this.emitted = false;
      return null;
    }
    const usable = pitch && pitch.confidence >= 0.9 ? pitch : null;
    const tuned = usable && Math.abs(usable.midi - this.target) * 100 <= 45;
    const nearest = usable ? Math.round(usable.midi) : null;
    // Separate in-tune and sharp/flat regions so a drifting note cannot borrow hold time.
    const candidate =
      nearest === this.target && !tuned && usable
        ? nearest + (usable.midi > this.target ? 0.1 : -0.1)
        : nearest;
    if (candidate !== this.candidate) {
      this.candidate = candidate;
      this.since = seconds;
      this.emitted = false;
    }
    if (this.emitted) return null;
    const cents = usable ? (usable.midi - this.target) * 100 : null;
    const correct = cents !== null && Math.abs(cents) <= 45;
    const required = usable ? (correct ? this.hold : 0.3) : 0.8;
    if (seconds - this.since < required) return null;
    this.emitted = true;
    if (correct) this.complete = true;
    return {
      onsetSeconds: this.since,
      targetIndex: this.targetIndex,
      target: this.target,
      detected: usable?.midi ?? null,
      cents,
      outcome: usable ? (correct ? "correct" : "wrong") : "unclear",
      seconds,
      confidence: usable?.confidence ?? null,
    };
  }
}
