import type { SessionRecord } from "./history.ts";
export const dayKey = (date: Date) =>
  `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
export function activity(
  records: SessionRecord[],
  levelId: string,
  now = new Date(),
) {
  const all = records.filter(
    (r) => r.lessonId === levelId && r.attempts.length > 0,
  );
  const days = new Set(
    Array.from({ length: 7 }, (_, i) => {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      return dayKey(d);
    }),
  );
  const recent = all.filter((r) => days.has(dayKey(new Date(r.startedAt))));
  const activeDays = new Set(recent.map((r) => dayKey(new Date(r.startedAt))))
    .size;
  return {
    sets: all.length,
    recentSets: recent.length,
    activeDays,
    ring: activeDays / 7,
    lineWidth: 2 + Math.min(4, recent.length),
    seconds: recent.reduce((sum, r) => sum + r.seconds, 0),
  };
}
const quantile = (values: number[], p: number) => {
  if (!values.length) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const point = (sorted.length - 1) * p;
  const lo = Math.floor(point),
    hi = Math.ceil(point);
  return sorted[lo] + (sorted[hi] - sorted[lo]) * (point - lo);
};
export function sessionMetrics(record: SessionRecord) {
  const first = new Map<number, string>();
  const matched = new Set<number>();
  for (const a of record.attempts) {
    if (["correct", "wrong"].includes(a.outcome) && !first.has(a.targetIndex))
      first.set(a.targetIndex, a.outcome);
    if (a.outcome === "correct") matched.add(a.targetIndex);
  }
  const firstMatches = [...first.values()].filter(
    (x) => x === "correct",
  ).length;
  const responseFirst = new Map<number, number>();
  for (const a of record.attempts)
    if (
      ["correct", "wrong"].includes(a.outcome) &&
      typeof a.responseMs === "number" &&
      !a.viewChanged &&
      !responseFirst.has(a.targetIndex)
    )
      responseFirst.set(a.targetIndex, a.responseMs);
  const times = [...responseFirst.values()];
  const scorable = record.attempts.filter((a) =>
    ["correct", "wrong"].includes(a.outcome),
  ).length;
  return {
    firstMatches,
    firstTargets: first.size,
    firstRate: first.size ? firstMatches / first.size : null,
    matched: matched.size,
    coverage: matched.size / record.targetCount,
    scorable,
    medianMs: quantile(times, 0.5),
    p90Ms: quantile(times, 0.9),
    meanMs: times.length
      ? times.reduce((a, b) => a + b, 0) / times.length
      : null,
    timedTargets: times.length,
    retries: Math.max(0, scorable - first.size),
    unclear: record.attempts.filter((a) => a.outcome === "unclear").length,
  };
}
export function comparable(a: SessionRecord, b: SessionRecord) {
  return (
    a.method === "microphone" &&
    b.method === "microphone" &&
    !a.mixedViews &&
    !b.mixedViews &&
    a.lessonId === b.lessonId &&
    a.instrument === b.instrument &&
    a.difficulty === b.difficulty &&
    a.displayMode === b.displayMode &&
    a.noteHints === b.noteHints &&
    a.tonic === b.tonic &&
    a.notation === b.notation
  );
}
export function mergeHistory(
  current: SessionRecord[],
  incoming: SessionRecord[],
) {
  const ids = new Set(current.map((r) => r.id));
  const added = incoming.filter((r) => {
    if (ids.has(r.id)) return false;
    ids.add(r.id);
    return true;
  });
  return [...current, ...added]
    .sort((a, b) => Date.parse(b.startedAt) - Date.parse(a.startedAt))
    .slice(0, 100);
}
