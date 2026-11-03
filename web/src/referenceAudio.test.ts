import test from "node:test";
import assert from "node:assert/strict";
import { ReferenceAudio } from "./referenceAudio.ts";
import { midiToHz } from "./pitch.ts";

test("stopping a reference resolves playback and closes its context without recording", async () => {
  const saved = Object.getOwnPropertyDescriptor(globalThis, "AudioContext");
  let closed = 0,
    frequency = 0;
  class Context {
    state = "running";
    currentTime = 0;
    destination = {};
    onstatechange: (() => void) | null = null;
    async resume() {}
    async close() {
      closed++;
      this.state = "closed";
      this.onstatechange?.();
    }
    createGain() {
      return {
        gain: {
          setValueAtTime() {},
          linearRampToValueAtTime() {},
          exponentialRampToValueAtTime() {},
        },
        connect() {},
      };
    }
    createOscillator() {
      return {
        frequency: {
          set value(v: number) {
            frequency = v;
          },
        },
        connect(node: unknown) {
          return node;
        },
        start() {},
        stop() {},
        onended: null,
      };
    }
  }
  Object.defineProperty(globalThis, "AudioContext", {
    configurable: true,
    value: Context,
  });
  try {
    const audio = new ReferenceAudio();
    const playing = audio.play(40);
    await Promise.resolve();
    audio.stop();
    await playing;
    assert.equal(frequency, midiToHz(40));
    assert.equal(closed, 1);
    audio.stop();
    assert.equal(closed, 1);
    const cancelled = new ReferenceAudio();
    const pending = cancelled.play(64);
    cancelled.stop();
    await pending;
    assert.equal(closed, 2);
  } finally {
    if (saved) Object.defineProperty(globalThis, "AudioContext", saved);
    else delete (globalThis as any).AudioContext;
  }
});
