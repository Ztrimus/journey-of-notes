import { invalidateTargetTiming, type DisplayMode } from "./reflex.ts";
import type { Attempt } from "./validation.ts";
export const GLOW_DURATION_MS = 1000;
export const GLOW_INTERVAL_MS = 1200;
export type GlowTone = "correct" | "wrong";
export interface GlowSignal {
  id: number;
  tone: GlowTone;
  fresh: boolean;
}
// Confirmed events only. Fast events update the current tint rather than restart a flash.
export class FeedbackGlowGate {
  private startedAt = -Infinity;
  private id = 0;
  signal(outcome: string, now: number): GlowSignal | null {
    if ((outcome !== "correct" && outcome !== "wrong") || !Number.isFinite(now))
      return null;
    if (now - this.startedAt >= GLOW_INTERVAL_MS) {
      this.startedAt = now;
      return { id: ++this.id, tone: outcome, fresh: true };
    }
    return now - this.startedAt < GLOW_DURATION_MS
      ? { id: this.id, tone: outcome, fresh: false }
      : null;
  }
  reset() {
    this.startedAt = -Infinity;
  }
}
export function changeCue<
  T extends {
    display: DisplayMode;
    hints: boolean;
    index: number;
    attempts: Attempt[];
    mixedViews: boolean;
    viewChanged: boolean;
  },
>(run: T, change: { display?: DisplayMode; hints?: boolean }) {
  const display = change.display ?? run.display,
    hints = change.hints ?? run.hints;
  if (display === run.display && hints === run.hints) return run;
  return {
    ...run,
    display,
    hints,
    mixedViews: true,
    viewChanged: true,
    attempts: invalidateTargetTiming(run.attempts, run.index),
  };
}
