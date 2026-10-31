import { test } from "node:test";
import assert from "node:assert/strict";
import { PracticeAudio, audioError } from "./audio.ts";

test("ending while microphone permission is pending releases the eventual stream", async () => {
  const saved = Object.getOwnPropertyDescriptors(globalThis);
  let resolveStream;
  let stopped = 0;
  let closed = 0;
  let asked = false;
  class Context {
    state = "running";
    async resume() {}
    async close() {
      closed++;
    }
  }
  Object.defineProperty(globalThis, "window", {
    configurable: true,
    value: { AudioContext: Context },
  });
  Object.defineProperty(globalThis, "AudioContext", {
    configurable: true,
    value: Context,
  });
  Object.defineProperty(globalThis, "cancelAnimationFrame", {
    configurable: true,
    value: () => {},
  });
  Object.defineProperty(globalThis, "navigator", {
    configurable: true,
    value: {
      mediaDevices: {
        getUserMedia: () => {
          asked = true;
          return new Promise((resolve) => {
            resolveStream = resolve;
          });
        },
      },
    },
  });
  try {
    const engine = new PracticeAudio();
    const started = engine.start(
      { bpm: 80, microphone: true, click: true, threshold: 0.06 },
      () => assert.fail("cancelled session must not update"),
      () => {},
    );
    await Promise.resolve();
    assert.equal(asked, true);
    engine.stop();
    resolveStream({ getTracks: () => [{ stop: () => stopped++ }] });
    await started;
    assert.equal(stopped, 1);
    assert.equal(closed, 1);
  } finally {
    for (const key of [
      "window",
      "AudioContext",
      "cancelAnimationFrame",
      "navigator",
    ]) {
      if (saved[key]) Object.defineProperty(globalThis, key, saved[key]);
      else delete globalThis[key];
    }
  }
});

test("microphone denial explains how to recover", () => {
  assert.match(
    audioError(new DOMException("denied", "NotAllowedError")),
    /site settings/,
  );
  assert.match(
    audioError(new DOMException("missing", "NotFoundError")),
    /No microphone/,
  );
});
