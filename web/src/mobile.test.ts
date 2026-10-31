import { test } from "node:test";
import assert from "node:assert/strict";
import { swarForMidi, TonicSampler, heardName } from "./bansuri.ts";
import { midiToHz, detectPitch } from "./pitch.ts";
import {
  activity,
  sessionMetrics,
  comparable,
  mergeHistory,
} from "./metrics.ts";
import { orderedLevels, parseRoute, routeHash } from "./instruments.ts";
import { invalidateTargetTiming } from "./reflex.ts";
import type { SessionRecord } from "./history.ts";
const session = (overrides: Partial<SessionRecord> = {}): SessionRecord => ({
  id: "one",
  lessonId: "p0",
  lessonTitle: "Reflex",
  instrument: "piano",
  method: "microphone",
  tonic: null,
  startedAt: new Date(2026, 9, 31, 12).toISOString(),
  seconds: 30,
  targetCount: 10,
  finished: false,
  attempts: [],
  ...overrides,
});
const attempt = (
  index: number,
  outcome: "wrong" | "correct" | "unclear" | "skipped" | "self-reported",
  responseMs?: number,
) => ({
  targetIndex: index,
  target: 60,
  detected: outcome === "correct" ? 60 : outcome === "wrong" ? 62 : null,
  cents: outcome === "correct" ? 0 : null,
  outcome,
  seconds: 1,
  confidence: null,
  responseMs,
});
test("bansuri swars and registers are relative to the confirmed Sa", () => {
  assert.equal(heardName(69, "flute", 67), "Middle Re / A4");
  assert.equal(heardName(66, "flute", 67), "Lower Ni / F♯4");
  assert.equal(heardName(79, "flute", 67), "Upper Sa / G5");
  assert.equal(swarForMidi(68, 67).name, "Komal Re");
  assert.equal(swarForMidi(73, 67).name, "Tivra Ma");
  assert.equal(swarForMidi(75, 73).name, "Re");
  assert.equal(heardName(60, "piano", null), "C4");
});
test("tonic sampling requires sustained confident periodicity and a bounded pitch", () => {
  const sampler = new TonicSampler();
  let found = null;
  for (let t = 0; t < 1.6; t += 0.06) {
    const result = sampler.process(
      { midi: 73, hz: midiToHz(73), confidence: 0.99 },
      0.1,
      t,
    );
    if (result) found = result;
  }
  assert.equal(found?.midi, 73);
  const noise = new TonicSampler();
  for (let t = 0; t < 2; t += 0.06)
    assert.equal(
      noise.process({ midi: 67, hz: 392, confidence: 0.5 }, 0.1, t),
      null,
    );
  assert.equal(
    noise.process({ midi: 90, hz: 1480, confidence: 0.99 }, 0.1, 3),
    null,
  );
});
test("silence and pitch changes reset Sa sampling", () => {
  const sampler = new TonicSampler();
  for (let t = 0; t < 0.8; t += 0.06)
    sampler.process({ midi: 67, hz: 392, confidence: 0.99 }, 0.1, t);
  sampler.process(null, 0, 0.9);
  for (let t = 1; t < 1.7; t += 0.06)
    assert.equal(
      sampler.process({ midi: 73, hz: midiToHz(73), confidence: 0.99 }, 0.1, t),
      null,
    );
});
test("metrics separate first-try correctness, retries, unclear and response distributions", () => {
  const record = session({
    attempts: [
      attempt(0, "wrong", 500),
      attempt(0, "wrong", 800),
      attempt(0, "correct", 1500),
      attempt(1, "correct", 1000),
      attempt(2, "unclear"),
      attempt(3, "skipped"),
    ],
  });
  const m = sessionMetrics(record);
  assert.equal(m.firstMatches, 1);
  assert.equal(m.firstTargets, 2);
  assert.equal(m.firstRate, 0.5);
  assert.equal(m.retries, 2);
  assert.equal(m.matched, 2);
  assert.equal(m.unclear, 1);
  assert.equal(m.medianMs, 750);
  assert.equal(m.p90Ms, 950);
  const silent = sessionMetrics(
    session({ method: "self-check", attempts: [attempt(0, "self-reported")] }),
  );
  assert.equal(silent.firstRate, null);
  assert.equal(silent.medianMs, null);
});
test("view changes invalidate timing for the affected target only", () => {
  const changed = invalidateTargetTiming(
    [attempt(0, "wrong", 500), attempt(1, "correct", 700)],
    0,
  );
  assert.equal(changed[0].responseMs, null);
  assert.equal(changed[0].viewChanged, true);
  assert.equal(changed[1].responseMs, 700);
  assert.equal(sessionMetrics(session({ attempts: changed })).timedTargets, 1);
  assert.equal(comparable(session({ mixedViews: true }), session()), false);
  assert.equal(
    comparable(
      session({ notation: "western" }),
      session({ notation: "sargam" }),
    ),
    false,
  );
});
test("activity rings use actual distinct local days and exclude empty sessions", () => {
  const now = new Date(2026, 9, 31, 12);
  const data = [
    session({ attempts: [attempt(0, "correct")] }),
    session({ id: "two", attempts: [attempt(0, "correct")] }),
    session({
      id: "old",
      startedAt: new Date(2026, 9, 1, 12).toISOString(),
      attempts: [attempt(0, "correct")],
    }),
    session({ id: "empty" }),
  ];
  const a = activity(data, "p0", now);
  assert.equal(a.sets, 3);
  assert.equal(a.recentSets, 2);
  assert.equal(a.activeDays, 1);
  assert.equal(a.ring, 1 / 7);
});
test("backup merge preserves existing IDs, deduplicates imports and sorts newest first", () => {
  const current = session({ lessonTitle: "preserve me" });
  const newer = session({
    id: "two",
    startedAt: new Date(2026, 10, 1, 12).toISOString(),
  });
  const merged = mergeHistory(
    [current],
    [session({ lessonTitle: "replacement" }), newer, newer],
  );
  assert.equal(merged.length, 2);
  assert.equal(merged[0].id, "two");
  assert.equal(merged[1].lessonTitle, "preserve me");
});
test("routes and instrument registry support deep links without a server route", () => {
  assert.deepEqual(parseRoute("#/prepare/flute/f1"), {
    screen: "prepare",
    instrument: "flute",
    levelId: "f1",
  });
  assert.equal(
    routeHash({ screen: "map", instrument: "piano" }),
    "#/map/piano",
  );
  assert.equal(parseRoute("#/unknown/not-an-instrument").screen, "home");
  assert.equal(orderedLevels("flute", 73, "easy")[0].targets[0].midi, 73);
});
test("reused pitch workspace produces the same estimate without stale-frame state", () => {
  const wave = (hz: number) =>
    Float32Array.from(
      { length: 2048 },
      (_, i) => 0.2 * Math.sin((2 * Math.PI * hz * i) / 44100),
    );
  const workspace = new Float32Array(1025);
  assert.ok(
    Math.abs(detectPitch(wave(440), 44100, workspace)!.midi - 69) < 0.1,
  );
  assert.ok(
    Math.abs(detectPitch(wave(261.63), 44100, workspace)!.midi - 60) < 0.1,
  );
});
