import test from "node:test";
import assert from "node:assert/strict";
import {
  attemptShares,
  comparableResponse,
  sessionMetrics,
} from "./metrics.ts";
import { parseHistory, type SessionRecord } from "./history.ts";
import type { Attempt } from "./validation.ts";
const attempt = (
  targetIndex: number,
  outcome: Attempt["outcome"],
  responseMs: number | null = 1000,
): Attempt => ({
  targetIndex,
  target: 60,
  detected: outcome === "wrong" ? 62 : 60,
  cents: 0,
  confidence: 0.99,
  seconds: 3,
  outcome,
  responseMs,
});
const record = (extra: Partial<SessionRecord> = {}): SessionRecord => ({
  id: "report-fixture",
  lessonId: "p3",
  lessonTitle: "Five notes",
  instrument: "piano",
  method: "microphone",
  noteHints: false,
  displayMode: "staff",
  tonic: null,
  startedAt: "2026-11-01T12:00:00Z",
  seconds: 30,
  targetCount: 5,
  finished: true,
  attempts: [],
  ...extra,
});
test("attempt shares balance rounded percentages and handle no evidence, all wrong and all matched", () => {
  assert.deepEqual(attemptShares(7, 1), {
    matched: 88,
    wrong: 12,
    fraction: 0.875,
  });
  assert.equal(attemptShares(0, 0), null);
  assert.deepEqual(attemptShares(0, 8), {
    matched: 0,
    wrong: 100,
    fraction: 0,
  });
  assert.deepEqual(attemptShares(8, 0), {
    matched: 100,
    wrong: 0,
    fraction: 1,
  });
});
test("new guided sessions report a true mean and median from first-try correct evidence", () => {
  const m = sessionMetrics(
    record({
      responseProtocol: "prompt-v2",
      attempts: [
        attempt(0, "correct", 1000),
        attempt(1, "correct", 2000),
        attempt(2, "correct", 6000),
      ],
    }),
  );
  assert.equal(m.correctMeanMs, 3000);
  assert.equal(m.correctMedianMs, 2000);
  assert.equal(m.correctTimed, 3);
});
test("guided speed excludes corrected errors, duplicates, hints, changed cues and missing samples", () => {
  const m = sessionMetrics(
    record({
      responseProtocol: "prompt-v2",
      attempts: [
        attempt(0, "wrong", 100),
        attempt(0, "correct", 3000),
        { ...attempt(1, "correct"), noteHints: true },
        { ...attempt(2, "correct"), viewChanged: true },
        attempt(3, "correct", null),
        attempt(4, "correct", 1500),
        attempt(4, "correct", 9999),
      ],
    }),
  );
  assert.equal(m.correctTimed, 1);
  assert.equal(m.correctMeanMs, 1500);
  assert.equal(m.firstMatches, 4);
  assert.equal(m.recovered, 1);
});
test("old guided history is never backfilled while old reflex evidence remains readable", () => {
  const old = record({ attempts: [attempt(0, "correct")] });
  assert.equal(sessionMetrics(old).correctTimed, 0);
  assert.equal(sessionMetrics({ ...old, lessonId: "p0" }).correctTimed, 1);
  assert.equal(
    parseHistory(JSON.stringify([old]))[0].responseProtocol,
    undefined,
  );
  const fresh = { ...old, responseProtocol: "prompt-v2" as const };
  assert.equal(
    parseHistory(JSON.stringify([fresh]))[0].responseProtocol,
    "prompt-v2",
  );
  assert.throws(() =>
    parseHistory(JSON.stringify([{ ...fresh, responseProtocol: "unknown" }])),
  );
});
test("silent and hinted sessions provide no response average", () => {
  for (const extra of [{ method: "self-check" as const }, { noteHints: true }])
    assert.equal(
      sessionMetrics(
        record({
          responseProtocol: "prompt-v2",
          attempts: [attempt(0, "correct")],
          ...extra,
        }),
      ).correctMeanMs,
      null,
    );
});
test("response comparisons keep timing protocols and drill conditions separate", () => {
  const a = record({ responseProtocol: "prompt-v2" });
  assert.ok(comparableResponse(a, { ...a, id: "another" }));
  for (const extra of [
    { responseProtocol: undefined },
    { lessonId: "p0" },
    { displayMode: "keyboard" as const },
    { mixedViews: true },
  ])
    assert.equal(comparableResponse(a, { ...a, ...extra }), false);
});
