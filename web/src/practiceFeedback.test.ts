import test from "node:test";
import assert from "node:assert/strict";
import {
  FeedbackGlowGate,
  GLOW_DURATION_MS,
  GLOW_INTERVAL_MS,
  changeCue,
} from "./practiceFeedback.ts";
import { sessionMetrics } from "./metrics.ts";
import { NoteValidator, type Attempt } from "./validation.ts";
const a = (index: number): Attempt => ({
  targetIndex: index,
  target: 60,
  detected: 60,
  cents: 0,
  outcome: "correct",
  seconds: 1,
  confidence: 0.99,
  responseMs: 1000,
  confirmationMs: 1350,
});
test("glow only accepts confirmed clear pitch outcomes", () => {
  const gate = new FeedbackGlowGate();
  for (const outcome of ["waiting", "unclear", "skipped", "self-reported"])
    assert.equal(gate.signal(outcome, 0), null);
  assert.deepEqual(gate.signal("correct", 0), {
    id: 1,
    tone: "correct",
    fresh: true,
  });
});
test("rapid events coalesce without restarting a full-screen pulse", () => {
  const gate = new FeedbackGlowGate();
  gate.signal("wrong", 0);
  assert.deepEqual(gate.signal("correct", 300), {
    id: 1,
    tone: "correct",
    fresh: false,
  });
  assert.equal(gate.signal("wrong", GLOW_DURATION_MS + 1), null);
  assert.deepEqual(gate.signal("wrong", GLOW_INTERVAL_MS), {
    id: 2,
    tone: "wrong",
    fresh: true,
  });
  gate.reset();
  assert.equal(gate.signal("correct", GLOW_INTERVAL_MS + 1)?.fresh, true);
});
test("view and hint changes invalidate only current target timing, preserve evidence and record mixed cues", () => {
  const run = {
    display: "staff" as const,
    hints: false,
    index: 1,
    initialHints: false,
    attempts: [a(0), a(1)],
    mixedViews: false,
    viewChanged: false,
  };
  assert.equal(changeCue(run, { hints: false }), run);
  const revealed = changeCue(run, { hints: true });
  assert.equal(revealed.hints, true);
  assert.equal(revealed.initialHints, false);
  assert.equal(revealed.mixedViews, true);
  assert.equal(revealed.viewChanged, true);
  assert.equal(revealed.attempts[0].responseMs, 1000);
  assert.equal(revealed.attempts[1].responseMs, null);
  assert.equal(revealed.attempts[1].confirmationMs, null);
  assert.equal(revealed.attempts[1].outcome, "correct");
  const hidden = changeCue(revealed, { hints: false });
  assert.equal(hidden.viewChanged, true);
  assert.equal(hidden.attempts[1].responseMs, null);
  const diagram = changeCue(run, { display: "keyboard" });
  assert.equal(diagram.display, "keyboard");
  assert.equal(diagram.attempts[1].responseMs, null);
});
test("per-attempt hint metadata overrides initial preference while legacy hinted times remain excluded", () => {
  const record = {
    id: "hints",
    lessonId: "p0",
    lessonTitle: "Reflex",
    instrument: "piano",
    method: "microphone" as const,
    noteHints: true,
    tonic: null,
    startedAt: "2026-11-01T00:00:00Z",
    seconds: 5,
    targetCount: 2,
    finished: true,
    attempts: [a(0), { ...a(1), noteHints: false }],
  };
  assert.equal(sessionMetrics(record).correctTimed, 1);
  assert.equal(sessionMetrics(record).correctMedianMs, 1000);
});

test("cue changes preserve held-note validation and do not manufacture duplicate wrong attempts", () => {
  const validator = new NoteValidator(60, 0.35, 0);
  const wrong = { midi: 62, hz: 293.66, confidence: 0.99 };
  assert.equal(validator.ingest(wrong, 0.1, 0), null);
  assert.equal(validator.ingest(wrong, 0.1, 0.2), null);
  assert.equal(validator.ingest(wrong, 0.1, 0.4)?.outcome, "wrong");
  const changed = changeCue(
    {
      display: "staff" as const,
      hints: false,
      index: 0,
      attempts: [],
      mixedViews: false,
      viewChanged: false,
      validator,
    },
    { hints: true },
  );
  assert.equal(changed.validator, validator);
  assert.equal(changed.validator.ingest(wrong, 0.1, 0.5), null);
});
