import { midiToHz } from "./pitch.ts";

// One short, explicitly requested pitch reference; no downloads or recording.
export class ReferenceAudio {
  private context: AudioContext | null = null;
  private cancelled = false;
  private settle: (() => void) | null = null;
  async play(midi: number) {
    if (typeof AudioContext === "undefined")
      throw new Error(
        "Audio playback is unavailable in this browser. Try a current browser.",
      );
    const context = new AudioContext({ latencyHint: "interactive" });
    this.context = context;
    try {
      await context.resume();
      if (this.cancelled) return;
      if (context.state !== "running")
        throw new Error("Audio is paused. Tap Hear example again.");
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.frequency.value = midiToHz(midi);
      const now = context.currentTime;
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.12, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
      oscillator.connect(gain).connect(context.destination);
      oscillator.start();
      oscillator.stop(now + 0.85);
      await new Promise<void>((resolve) => {
        this.settle = resolve;
        oscillator.onended = () => resolve();
        context.onstatechange = () => {
          if (context.state !== "running") resolve();
        };
      });
    } finally {
      this.stop();
    }
  }
  stop() {
    this.cancelled = true;
    this.settle?.();
    this.settle = null;
    const context = this.context;
    this.context = null;
    if (context) {
      context.onstatechange = null;
      void context.close().catch(() => {});
    }
  }
}
