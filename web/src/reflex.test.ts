import { test } from "node:test";
import assert from "node:assert/strict";
import {
  reflexLevel,
  staffGeometry,
  responseTiming,
  responseSummary,
} from "./reflex.ts";
import { NoteValidator } from "./validation.ts";
import { parseHistory } from "./history.ts";

test("random sets use constrained difficulty pools and avoid immediate repeats", () => {
  for (const instrument of ["piano", "flute"] as const)
    for (const difficulty of ["easy", "medium", "hard"] as const) {
      const set = reflexLevel(instrument, difficulty, 55, () => 0.25);
      assert.equal(set.targets.length, 10);
      set.targets.forEach((target, i) => {
        if (i) assert.notEqual(target.midi, set.targets[i - 1].midi);
      });
      if (instrument === "piano" && difficulty === "easy")
        assert.ok(
          set.targets.every(
            (t) =>
              t.hand === "Right" &&
              t.finger === 1 &&
              [60, 62, 64].includes(t.midi),
          ),
        );
      if (instrument === "flute")
        assert.ok(set.targets.every((t) => t.midi >= 55 && t.midi <= 67));
    }
});
test("hard piano pool includes left-hand bass and higher right-hand targets", () => {
  const low = reflexLevel("piano", "hard", 60, () => 0).targets[0];
  const high = reflexLevel("piano", "hard", 60, () => 0.999).targets[0];
  assert.deepEqual(low, { midi: 48, hand: "Left", finger: 5 });
  assert.deepEqual(high, { midi: 79, hand: "Right", finger: 5 });
});
test("staff geometry places middle C and ledger lines in the correct positions", () => {
  assert.deepEqual(staffGeometry(60), {
    clef: "treble",
    y: 125,
    ledgers: [125],
    sharp: false,
  });
  assert.equal(staffGeometry(64).y, 110);
  assert.equal(staffGeometry(77).y, 50);
  assert.equal(staffGeometry(43).y, 110);
  assert.equal(staffGeometry(48).y, 87.5);
  assert.equal(staffGeometry(81).y, 35);
  assert.deepEqual(staffGeometry(83).ledgers, [35]);
  assert.equal(staffGeometry(61).sharp, true);
});
test("response excludes hold time and confirmation includes it", () => {
  assert.deepEqual(responseTiming("correct", 1, 1.5, 2000, 500), {
    responseMs: 1000,
    confirmationMs: 1500,
  });
  assert.deepEqual(responseTiming("wrong", 1, 1.3, 1800, 500), {
    responseMs: 1000,
    confirmationMs: 1300,
  });
});
test("unseen, pre-presentation, unclear and self-reported samples have no response score", () => {
  for (const outcome of ["self-reported", "skipped", "unclear"])
    assert.equal(responseTiming(outcome, 1, 2, 2500, 100).responseMs, null);
  assert.equal(responseTiming("correct", 1, 2, 2500, null).responseMs, null);
  assert.equal(
    responseTiming("correct", undefined, 2, 2500, 100).responseMs,
    null,
  );
  assert.equal(responseTiming("correct", 0, 2, 2500, 1000).responseMs, null);
});
test("first response and time to correct remain distinct after a wrong attempt", () => {
  const s = responseSummary([
    { targetIndex: 0, outcome: "wrong", responseMs: 500 },
    { targetIndex: 0, outcome: "correct", responseMs: 1800 },
    { targetIndex: 1, outcome: "correct", responseMs: 1000 },
    { targetIndex: 2, outcome: "self-reported", responseMs: 1 },
  ]);
  assert.deepEqual(s, { firstMs: 750, correctMs: 1400, measured: 2 });
  assert.deepEqual(responseSummary([]), {
    firstMs: null,
    correctMs: null,
    measured: 0,
  });
});
test("validator exposes the initial stable candidate time before its confirmation hold", () => {
  const v = new NoteValidator(60, 0.35);
  let event = null;
  for (let t = 1; t < 1.5; t += 0.05) {
    const a = v.ingest({ midi: 60, hz: 261.63, confidence: 0.99 }, 0.1, t);
    if (a) event = a;
  }
  assert.equal(event?.onsetSeconds, 1);
  assert.ok(event!.seconds >= 1.35);
});
test("old history remains readable and new timing metadata survives reload", () => {
  const record = {
    id: "test",
    lessonId: "p0",
    lessonTitle: "Note reflex",
    instrument: "piano",
    method: "microphone",
    tonic: null,
    startedAt: "2026-10-31T12:00:00Z",
    seconds: 2,
    targetCount: 10,
    finished: false,
    attempts: [
      {
        targetIndex: 0,
        target: 60,
        detected: 60,
        cents: 0,
        outcome: "correct",
        seconds: 1,
        confidence: 0.99,
      },
    ],
  };
  assert.equal(parseHistory(JSON.stringify([record])).length, 1);
  const updated = {
    ...record,
    displayMode: "staff",
    noteHints: false,
    difficulty: "hard",
    attempts: [
      {
        ...record.attempts[0],
        onsetSeconds: 0.5,
        responseMs: 500,
        confirmationMs: 850,
      },
    ],
  };
  assert.equal(
    parseHistory(JSON.stringify([updated]))[0].attempts[0].responseMs,
    500,
  );
  assert.throws(() =>
    parseHistory(
      JSON.stringify([
        { ...updated, attempts: [{ ...updated.attempts[0], responseMs: -1 }] },
      ]),
    ),
  );
});
