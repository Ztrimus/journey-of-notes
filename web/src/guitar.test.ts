import test from "node:test";
import assert from "node:assert/strict";
import { detectPitch, midiToHz } from "./pitch.ts";
import {
  guitarStrings,
  guitarPosition,
  guitarFinger,
  tuningReading,
} from "./guitar.ts";
import { starterLevels } from "./curriculum.ts";
import { reflexLevel } from "./reflex.ts";

const range = { minHz: 65, maxHz: 450 };
function tone(midi: number, rate: number, cents = 0, decay = false) {
  const hz = midiToHz(midi + cents / 100);
  return Float32Array.from({ length: 4096 }, (_, i) => {
    const phase = (2 * Math.PI * hz * i) / rate;
    return (
      0.18 *
      (Math.sin(phase) + 0.45 * Math.sin(phase * 2)) *
      (decay ? Math.exp(-i / 2500) : 1)
    );
  });
}
test("all six standard guitar strings, including low E, are detectable with the tuner profile", () => {
  for (const rate of [44100, 48000])
    for (const string of guitarStrings)
      for (const cents of [-35, 0, 35]) {
        const pitch = detectPitch(
          tone(string.midi, rate, cents, true),
          rate,
          new Float32Array(2049),
          range,
        );
        assert.ok(pitch, `${rate} ${string.label} ${cents}`);
        assert.ok(Math.abs(pitch.midi - string.midi - cents / 100) < 0.05);
        assert.ok(pitch.confidence > 0.9);
      }
});
test("tuner does not invent notes from silence, DC or deterministic noise", () => {
  let seed = 17;
  const noise = Float32Array.from({ length: 4096 }, () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return (seed / 2 ** 32 - 0.5) * 0.2;
  });
  for (const samples of [
    new Float32Array(4096),
    new Float32Array(4096).fill(0.2),
    noise,
  ])
    assert.equal(detectPitch(samples, 48000, undefined, range), null);
});
test("guitar TAB positions match expected pitches across guided and random drills", () => {
  for (const lesson of [
    ...starterLevels("guitar", 67),
    ...(["easy", "medium", "hard"] as const).map((d) =>
      reflexLevel("guitar", d, 67),
    ),
  ])
    for (const target of lesson.targets)
      assert.ok(guitarPosition(target), JSON.stringify(target));
  assert.equal(guitarPosition({ midi: 65, string: 1, fret: 0 }), null);
  assert.equal(guitarPosition({ midi: 65, string: 1, fret: 1.5 }), null);
  assert.equal(
    guitarFinger({ midi: 64, string: 1, fret: 0 }),
    "Open · no fretting finger",
  );
  assert.equal(
    guitarFinger({ midi: 65, string: 1, fret: 1 }),
    "1 · index finger",
  );
  assert.equal(
    guitarFinger({ midi: 67, string: 1, fret: 3 }),
    "3 · ring finger",
  );
});
test("tuning feedback distinguishes direction, close reference, wrong string and unclear input", () => {
  const p = (midi: number, confidence = 0.99) => ({
    midi,
    confidence,
    hz: midiToHz(midi),
  });
  assert.equal(tuningReading(p(40.05), 40)?.state, "in-tune");
  assert.equal(tuningReading(p(39.7), 40)?.state, "flat");
  assert.equal(tuningReading(p(40.3), 40)?.state, "sharp");
  assert.equal(tuningReading(p(52), 40)?.state, "different");
  assert.equal(tuningReading(p(40, 0.4), 40), null);
  assert.equal(tuningReading(null, 40), null);
});
