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
  const correctTimes = record.attempts
    .filter(
      (a) =>
        a.outcome === "correct" &&
        first.get(a.targetIndex) === "correct" &&
        typeof a.responseMs === "number" &&
        !a.viewChanged &&
        !a.noteHints &&
        !record.noteHints &&
        record.method === "microphone" &&
        /^[pfvgw]0$/.test(record.lessonId),
    )
    .map((a) => a.responseMs!);
  const initiallyWrong = [...first.entries()]
    .filter(([, o]) => o === "wrong")
    .map(([index]) => index);
  return {
    correctMedianMs: quantile(correctTimes, 0.5),
    correctMeanMs: correctTimes.length
      ? correctTimes.reduce((a, b) => a + b, 0) / correctTimes.length
      : null,
    correctTimed: correctTimes.length,
    recovered: initiallyWrong.filter((i) => matched.has(i)).length,
    initiallyWrong: initiallyWrong.length,
    signalCoverage: first.size / record.targetCount,
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

export function skillEvidence(records: SessionRecord[], levelId: string) {
  const ordered = [...records].sort(
    (a, b) => Date.parse(b.startedAt) - Date.parse(a.startedAt),
  );
  const latest = ordered.find(
    (r) =>
      r.lessonId === levelId &&
      r.method === "microphone" &&
      !r.mixedViews &&
      sessionMetrics(r).firstTargets > 0,
  );
  if (!latest)
    return {
      rate: null as number | null,
      n: 0,
      correct: 0,
      response: null as number | null,
      last: null as string | null,
      recall: false,
      delta: null as number | null,
    };
  const recent = records
    .filter((r) => comparable(latest, r))
    .sort((a, b) => Date.parse(b.startedAt) - Date.parse(a.startedAt));
  const trials: { correct: boolean; time: number | null }[] = [];
  for (const r of recent) {
    const seen = new Set<number>();
    const current: { correct: boolean; time: number | null }[] = [];
    for (const a of r.attempts)
      if (
        ["correct", "wrong"].includes(a.outcome) &&
        !seen.has(a.targetIndex)
      ) {
        seen.add(a.targetIndex);
        current.push({
          correct: a.outcome === "correct",
          time:
            a.outcome === "correct" &&
            !a.viewChanged &&
            !a.noteHints &&
            !r.noteHints &&
            /^[pfvgw]0$/.test(r.lessonId)
              ? (a.responseMs ?? null)
              : null,
        });
      }
    trials.push(...current.reverse());
  }
  const sample = trials.slice(0, 30),
    correct = sample.filter((t) => t.correct).length;
  const prior = trials.slice(30, 60);
  return {
    rate: sample.length ? correct / sample.length : null,
    n: sample.length,
    correct,
    response: quantile(
      sample.flatMap((t) => (t.time === null ? [] : [t.time])),
      0.5,
    ),
    last: latest.startedAt,
    recall: /^[pfvgw]0$/.test(levelId) && !latest.noteHints,
    delta:
      sample.length === 30 && prior.length === 30
        ? correct / 30 - prior.filter((t) => t.correct).length / 30
        : null,
  };
}
