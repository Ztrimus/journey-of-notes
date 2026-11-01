import { test } from "node:test";
import assert from "node:assert/strict";
import { NoteValidator } from "./validation.ts";
import { detectPitch, midiToHz, hzToMidi } from "./pitch.ts";
import { parseHistory, counts } from "./history.ts";
import { piano, flute } from "./curriculum.ts";
const pitch = (midi: number, confidence = 0.99) => ({
  midi,
  confidence,
  hz: midiToHz(midi),
});
test("interruption breaks a partial hold without manufacturing a second sustained wrong attempt", () => {
  const correct = new NoteValidator(60, 0.35);
  correct.ingest(pitch(60), 0.2, 0);
  correct.ingest(pitch(60), 0.2, 0.25);
  correct.interrupt();
  assert.equal(correct.ingest(pitch(60), 0.2, 0.25), null);
  assert.equal(correct.ingest(pitch(60), 0.2, 0.5), null);
  assert.equal(correct.ingest(pitch(60), 0.2, 0.61)?.outcome, "correct");
  const wrong = new NoteValidator(60);
  wrong.ingest(pitch(62), 0.2, 0);
  wrong.ingest(pitch(62), 0.2, 0.1);
  wrong.ingest(pitch(62), 0.2, 0.2);
  assert.equal(wrong.ingest(pitch(62), 0.2, 0.31)?.outcome, "wrong");
  wrong.interrupt();
  assert.equal(wrong.ingest(pitch(62), 0.2, 0.31), null);
  assert.equal(wrong.ingest(pitch(62), 0.2, 0.7), null);
});
function wave(midi: number, rate = 44100, harmonics = false) {
  return Float32Array.from(
    { length: 2048 },
    (_, i) =>
      0.2 * Math.sin((2 * Math.PI * midiToHz(midi) * i) / rate) +
      (harmonics
        ? 0.08 * Math.sin((4 * Math.PI * midiToHz(midi) * i) / rate)
        : 0),
  );
}

test("single-tone pitch identifies exercise notes at common sample rates", () => {
  for (const rate of [44100, 48000])
    for (const midi of [48, 55, 60, 64, 69, 72, 84]) {
      const result = detectPitch(wave(midi, rate), rate);
      assert.ok(result, `No pitch for ${midi} at ${rate}`);
      assert.ok(
        Math.abs(result.midi - midi) * 100 < 10,
        `${midi}: ${result.midi}`,
      );
    }
  assert.ok(Math.abs(hzToMidi(440) - 69) < 0.001);
});
test("silence, DC and deterministic broad-band noise do not invent a pitch", () => {
  assert.equal(detectPitch(new Float32Array(2048), 44100), null);
  assert.equal(detectPitch(new Float32Array(2048).fill(0.2), 44100), null);
  let seed = 17;
  const noise = Float32Array.from({ length: 2048 }, () => {
    seed = (seed * 16807) % 2147483647;
    return (seed / 2147483647 - 0.5) * 0.3;
  });
  assert.equal(detectPitch(noise, 44100), null);
});
test("pitch detects a fundamental with its second harmonic", () => {
  const result = detectPitch(wave(60, 44100, true), 44100);
  assert.ok(result);
  assert.ok(Math.abs(result.midi - 60) < 0.1);
});
function feed(
  v: NoteValidator,
  p: ReturnType<typeof pitch> | null,
  level: number,
  start: number,
  end: number,
) {
  let event = null;
  for (let t = start; t <= end + 0.00001; t += 0.05) {
    const result = v.ingest(p, level, t);
    if (result) event = result;
  }
  return event;
}
test("correct note requires a continuous hold and is counted once", () => {
  const v = new NoteValidator(60, 0.45, 2);
  assert.equal(feed(v, pitch(60), 0.1, 0, 0.2), null);
  const result = feed(v, pitch(60), 0.1, 0.25, 0.6);
  assert.equal(result?.outcome, "correct");
  assert.equal(result?.targetIndex, 2);
  assert.equal(feed(v, pitch(60), 0.1, 0.65, 1), null);
});
test("wrong octave counts once, release allows retry, correction succeeds", () => {
  const v = new NoteValidator(60, 0.45);
  assert.equal(feed(v, pitch(72), 0.1, 0, 0.4)?.outcome, "wrong");
  assert.equal(feed(v, pitch(72), 0.1, 0.45, 1), null);
  v.ingest(null, 0, 1.1);
  assert.equal(feed(v, pitch(72), 0.1, 1.2, 1.6)?.outcome, "wrong");
  assert.equal(feed(v, pitch(60), 0.1, 1.7, 2.3)?.outcome, "correct");
});
test("silence is not failure and low-confidence audio is unclear", () => {
  const v = new NoteValidator(60);
  assert.equal(v.ingest(null, 0, 0), null);
  assert.equal(v.ingest(null, 0, 100), null);
  assert.equal(feed(v, pitch(60, 0.5), 0.1, 101, 102)?.outcome, "unclear");
  assert.equal(feed(v, pitch(60, 0.5), 0.1, 102.05, 103), null);
});
test("drifting intonation cannot satisfy a continuous hold", () => {
  const v = new NoteValidator(60, 0.45);
  assert.equal(feed(v, pitch(60), 0.1, 0, 0.35), null);
  v.ingest(pitch(60.48), 0.1, 0.4);
  assert.equal(feed(v, pitch(60), 0.1, 0.45, 0.8), null);
  assert.equal(feed(v, pitch(60), 0.1, 0.85, 1)?.outcome, "correct");
});
test("missing analysis frames cannot manufacture a continuous hold", () => {
  const v = new NoteValidator(60, 0.45);
  v.ingest(pitch(60), 0.1, 0);
  assert.equal(v.ingest(pitch(60), 0.1, 5), null);
  assert.equal(feed(v, pitch(60), 0.1, 5.05, 5.6)?.outcome, "correct");
});
test("synthesized sound flows through estimation to a correct attempt", () => {
  const v = new NoteValidator(64, 0.45);
  const p = detectPitch(wave(64), 44100);
  assert.equal(feed(v, p, 0.1, 0, 0.6)?.outcome, "correct");
});
test("local history rejects corrupt schemas and keeps evidence classes distinct", () => {
  assert.deepEqual(parseHistory(null), []);
  assert.throws(() => parseHistory("{"));
  assert.throws(() => parseHistory('[{"lessonId":"p1"}]'));
  const a = {
    targetIndex: 0,
    target: 60,
    detected: null,
    cents: null,
    outcome: "self-reported" as const,
    seconds: 1,
    confidence: null,
  };
  const record = {
    id: "test",
    lessonId: "p1",
    lessonTitle: "Middle C",
    instrument: "piano",
    method: "self-check",
    tonic: null,
    startedAt: "2026-10-31T00:00:00Z",
    seconds: 2,
    targetCount: 3,
    finished: false,
    attempts: [a],
  };
  const restored = parseHistory(JSON.stringify([record]));
  assert.equal(restored.length, 1);
  assert.equal(counts(restored[0].attempts).correct, 0);
  assert.equal(counts(restored[0].attempts)["self-reported"], 1);
});
test("curriculum uses valid notes, fingers and tonic-relative flute intervals", () => {
  const ids = new Set<string>();
  for (const lesson of [...piano, ...flute(55)]) {
    assert.ok(!ids.has(lesson.id));
    ids.add(lesson.id);
    assert.ok(lesson.targets.length > 0);
    for (const target of lesson.targets) {
      assert.ok(midiToHz(target.midi) >= 100 && midiToHz(target.midi) <= 2000);
      if (target.finger) assert.ok(target.finger >= 1 && target.finger <= 5);
    }
  }
  assert.equal(flute(55)[0].targets[0].midi, 55);
  assert.equal(flute(55)[5].targets[1].midi, 67);
});

test("stable sharp intonation is a wrong-pitch attempt, not an endless wait", () => {
  const v = new NoteValidator(60, 0.45);
  assert.equal(feed(v, pitch(60.48), 0.1, 0, 0.4)?.outcome, "wrong");
  assert.equal(feed(v, pitch(60), 0.1, 0.45, 1)?.outcome, "correct");
});
