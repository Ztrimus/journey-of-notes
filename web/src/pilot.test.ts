import test from "node:test";
import assert from "node:assert/strict";
import { sessionMetrics, skillEvidence } from "./metrics.ts";
import {
  parseHistory,
  clearSavedHistory,
  type SessionRecord,
} from "./history.ts";
import { instrumentIds } from "./catalog.ts";
import { orderedLevels, parseRoute } from "./instruments.ts";
import { bansuriHoles } from "./visualModels.ts";
import { detectPitch, midiToHz } from "./pitch.ts";
const record = (extra: Partial<SessionRecord> = {}): SessionRecord => ({
  id: "fixture",
  lessonId: "p0",
  lessonTitle: "Note reflex",
  instrument: "piano",
  method: "microphone",
  displayMode: "staff",
  noteHints: false,
  notation: "western",
  difficulty: "easy",
  tonic: null,
  startedAt: "2026-11-01T12:00:00Z",
  seconds: 20,
  targetCount: 2,
  finished: true,
  attempts: [],
  ...extra,
});
const attempt = (
  index: number,
  outcome: "correct" | "wrong",
  responseMs = 1000,
) => ({
  targetIndex: index,
  target: 60,
  detected: outcome === "correct" ? 60 : 62,
  cents: outcome === "correct" ? 0 : 200,
  outcome,
  seconds: index + 1,
  confidence: 0.99,
  responseMs,
  confirmationMs: responseMs + 400,
});
test("fast wrong notes and later correction never improve first-try-correct speed", () => {
  const m = sessionMetrics(
    record({
      attempts: [
        attempt(0, "wrong", 100),
        attempt(0, "correct", 2200),
        attempt(1, "correct", 1300),
      ],
    }),
  );
  assert.equal(
    sessionMetrics(
      record({ noteHints: true, attempts: [attempt(0, "correct")] }),
    ).correctMedianMs,
    null,
  );
  assert.equal(
    sessionMetrics(
      record({ lessonId: "p1", attempts: [attempt(0, "correct")] }),
    ).correctMedianMs,
    null,
  );
  assert.equal(
    sessionMetrics(
      record({ method: "self-check", attempts: [attempt(0, "correct")] }),
    ).correctMedianMs,
    null,
  );
  assert.equal(m.correctMedianMs, 1300);
  assert.equal(m.correctTimed, 1);
  assert.equal(m.firstRate, 0.5);
  assert.equal(m.recovered, 1);
  assert.equal(m.initiallyWrong, 1);
  assert.equal(
    sessionMetrics(
      record({ attempts: [{ ...attempt(0, "correct"), noteHints: true }] }),
    ).correctMedianMs,
    null,
  );
});
test("all-wrong practice has zero performance ring while silent practice supplies no measured evidence", () => {
  const wrong = record({
    attempts: [attempt(0, "wrong"), attempt(1, "wrong")],
  });
  assert.equal(skillEvidence([wrong], "p0").rate, 0);
  assert.equal(skillEvidence([wrong], "p0").n, 2);
  assert.equal(
    skillEvidence(
      [
        record({
          method: "self-check",
          attempts: [{ ...attempt(0, "correct"), outcome: "self-reported" }],
        }),
      ],
      "p0",
    ).rate,
    null,
  );
});
test("quality windows count targets once, preserve first failure and separate conditions", () => {
  const r = record({
    attempts: [
      attempt(0, "wrong"),
      attempt(0, "correct"),
      attempt(1, "correct"),
    ],
  });
  const e = skillEvidence(
    [
      r,
      record({
        id: "hinted",
        noteHints: true,
        attempts: [attempt(0, "correct")],
      }),
    ],
    "p0",
  );
  assert.equal(e.n, 2);
  assert.equal(e.rate, 0.5);
  const fresh = record({
    targetCount: 40,
    attempts: Array.from({ length: 40 }, (_, i) =>
      attempt(i, i < 10 ? "wrong" : "correct"),
    ),
  });
  assert.equal(skillEvidence([fresh], "p0").n, 30);
  assert.equal(skillEvidence([fresh], "p0").rate, 1);
  const newer = record({ id: "newer", startedAt: "2026-11-02T00:00:00Z" }),
    older = record({ id: "older", startedAt: "2026-10-01T00:00:00Z" });
  assert.equal(parseHistory(JSON.stringify([older, newer]))[0].id, "newer");
  // Accuracy does not depend on today's date; old evidence remains dated, not decayed.
  assert.equal(
    skillEvidence([{ ...r, startedAt: "2020-01-01T00:00:00Z" }], "p0").rate,
    0.5,
  );
});
test("all pilot instruments have bounded single-note curricula, serializable history and routes", () => {
  for (const instrument of instrumentIds)
    for (const difficulty of ["easy", "medium", "hard"] as const) {
      const levels = orderedLevels(instrument, 60, difficulty);
      assert.ok(levels.length >= 4);
      for (const level of levels) {
        assert.ok(level.targets.length > 0);
        assert.equal(level.instrument, instrument);
        assert.equal(
          parseRoute(`#/prepare/${instrument}/${level.id}`).levelId,
          level.id,
        );
        for (const t of level.targets) {
          assert.ok(midiToHz(t.midi) >= 100 && midiToHz(t.midi) <= 2000);
          if (instrument === "guitar") {
            assert.ok(t.string && t.string <= 3);
            assert.ok(t.fret !== undefined);
          }
        }
      }
      const r = record({ instrument, lessonId: levels[0].id });
      assert.equal(parseHistory(JSON.stringify([r]))[0].instrument, instrument);
    }
});
test("bansuri guidance uses three-hole Sa, half-covered Ma and no invented chromatic fingering", () => {
  assert.deepEqual(bansuriHoles(67, 67), { closed: 3, half: false });
  assert.deepEqual(bansuriHoles(79, 67), { closed: 3, half: false });
  assert.deepEqual(bansuriHoles(72, 67), { closed: 0, half: true });
  assert.deepEqual(bansuriHoles(74, 67), { closed: 6, half: false });
  assert.equal(bansuriHoles(68, 67), null);
});
test("guitar pilot treble notes and Western flute notes are detectable at common sample rates", () => {
  for (const rate of [44100, 48000])
    for (const midi of [44, 55, 59, 64, 65, 67, 69, 71, 72, 74, 95]) {
      const wave = Float32Array.from(
        { length: 2048 },
        (_, i) => 0.15 * Math.sin((2 * Math.PI * midiToHz(midi) * i) / rate),
      );
      const pitch = detectPitch(wave, rate);
      assert.ok(pitch && Math.abs(pitch.midi - midi) < 0.1);
    }
});
test("history clear removes only the app key and propagates storage failures", () => {
  const calls: string[] = [];
  Object.defineProperty(globalThis, "localStorage", {
    configurable: true,
    value: { removeItem: (key: string) => calls.push(key) },
  });
  clearSavedHistory();
  assert.deepEqual(calls, ["journey-of-notes.history.v1"]);
  Object.defineProperty(globalThis, "localStorage", {
    configurable: true,
    value: {
      removeItem: () => {
        throw Error("blocked");
      },
    },
  });
  assert.throws(() => clearSavedHistory(), /blocked/);
  delete (globalThis as any).localStorage;
});
