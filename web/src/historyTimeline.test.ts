import test from "node:test";
import assert from "node:assert/strict";
import { groupHistoryDays } from "./historyTimeline.ts";
import type { SessionRecord } from "./history.ts";
const record = (id: string, date: Date): SessionRecord => ({
  id,
  startedAt: date.toISOString(),
  lessonId: "p3",
  lessonTitle: "Five notes",
  instrument: "piano",
  method: "microphone",
  tonic: null,
  seconds: 40,
  targetCount: 8,
  finished: true,
  attempts: [],
});
test("timeline groups by local calendar date across midnight, preserving records and newest-first input order", () => {
  const records = [
    record("new", new Date(2026, 10, 2, 0, 1)),
    record("older", new Date(2026, 10, 1, 23, 59)),
    record("earlier", new Date(2026, 10, 1, 12)),
  ];
  const before = JSON.stringify(records);
  const groups = groupHistoryDays(records);
  assert.deepEqual(
    groups.map((g) => g.records.map((r) => r.id)),
    [["new"], ["older", "earlier"]],
  );
  assert.equal(groups[0].records[0], records[0]);
  assert.equal(JSON.stringify(records), before);
});
test("timeline never combines the same day number across months or years and handles empty or partial pages", () => {
  const records = [
    record("a", new Date(2026, 10, 1)),
    record("b", new Date(2026, 9, 1)),
    record("c", new Date(2025, 10, 1)),
  ];
  assert.equal(groupHistoryDays(records).length, 3);
  assert.deepEqual(groupHistoryDays([]), []);
  assert.deepEqual(
    groupHistoryDays(records.slice(1)).flatMap((g) =>
      g.records.map((r) => r.id),
    ),
    ["b", "c"],
  );
});
