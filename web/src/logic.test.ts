import { test } from "node:test";
import assert from "node:assert/strict";
import { rms, OnsetDetector, pianoPrompt, formatTime } from "./logic.ts";

test("RMS measures silence and alternating audio samples", () => {
  assert.equal(rms(new Float32Array()), 0);
  assert.equal(rms(new Float32Array([0, 0, 0])), 0);
  assert.equal(rms(new Float32Array([0.5, -0.5, 0.5, -0.5])), 0.5);
});
test("sustained notes count once, quiet re-arms and debounce filters rapid noise", () => {
  const detector = new OnsetDetector();
  assert.equal(detector.process(0.1, 0, 0.06), true);
  assert.equal(detector.process(0.2, 0.2, 0.06), false);
  detector.process(0, 0.21, 0.06);
  assert.equal(detector.process(0.1, 0.22, 0.06), true);
  detector.process(0, 0.23, 0.06);
  assert.equal(detector.process(0.1, 0.24, 0.06), false);
  assert.equal(detector.process(0.1, 0.4, 0.06), true);
});
test("prompts stay within the prototype practice range at random boundaries", () => {
  assert.deepEqual(
    pianoPrompt(() => 0),
    { note: "C3", hand: "Left hand", finger: 1 },
  );
  assert.deepEqual(
    pianoPrompt(() => 0.99999),
    { note: "B5", hand: "Right hand", finger: 5 },
  );
  assert.equal(formatTime(125.9), "2:05");
});
