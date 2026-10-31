import type { Lesson, Target } from "./curriculum.ts";
export type Difficulty = "easy" | "medium" | "hard";
export type DisplayMode = "keyboard" | "staff" | "both";
export function reflexLevel(
  instrument: "piano" | "flute",
  difficulty: Difficulty,
  tonic = 60,
  random = Math.random,
): Lesson {
  let pool: Target[] = [];
  if (instrument === "piano") {
    const positions =
      difficulty === "hard"
        ? [
            { base: 48, hand: "Left" as const },
            { base: 60, hand: "Right" as const },
            { base: 72, hand: "Right" as const },
          ]
        : [{ base: 60, hand: "Right" as const }];
    for (const { base, hand } of positions)
      for (const [i, step] of [0, 2, 4, 5, 7].entries()) {
        if (difficulty === "easy" && i > 2) continue;
        pool.push({
          midi: base + step,
          hand,
          finger: difficulty === "easy" ? 1 : hand === "Right" ? i + 1 : 5 - i,
        });
      }
  } else {
    const steps =
      difficulty === "easy"
        ? [0, 2, 4]
        : difficulty === "medium"
          ? [0, 2, 4, 5, 7]
          : [0, 2, 4, 5, 7, 9, 11, 12];
    const names = ["Sa", "Re", "Ga", "Ma", "Pa", "Dha", "Ni", "Sa ↑"];
    pool = steps.map((step, i) => ({ midi: tonic + step, swar: names[i] }));
  }
  const targets: Target[] = [];
  for (let i = 0; i < 10; i++) {
    const choices = pool.filter((t) => t.midi !== targets.at(-1)?.midi);
    const choice =
      choices[
        Math.min(choices.length - 1, Math.floor(random() * choices.length))
      ];
    targets.push({ ...choice });
  }
  return {
    id: instrument === "piano" ? "p0" : "f0",
    instrument,
    title: instrument === "piano" ? "Note reflex" : "Swar reflex",
    goal: "Recognize a fresh target, play it accurately, and repeat. Ten prompts per set.",
    hint:
      instrument === "piano"
        ? "Read hand → finger → octave → note. Aim for accurate responses before faster ones. Fingering remains your own check."
        : "Identify the swar relative to your confirmed Sa. Accuracy comes before speed; hole placement is your own check.",
    targets,
    hold: 0.35,
    source:
      "Original repeatable retrieval drill based on the requested practice-gym model",
  };
}
export const isReflex = (id: string) => id === "p0" || id === "f0";
// Diatonic geometry uses scientific pitch notation; clef is independent of hand.
export function staffGeometry(midi: number) {
  const pc = ((midi % 12) + 12) % 12;
  const letter = [0, 0, 1, 1, 2, 3, 3, 4, 4, 5, 5, 6][pc];
  const octave = Math.floor(midi / 12) - 1;
  const clef = midi < 60 ? "bass" : "treble";
  const bottom = clef === "treble" ? 4 * 7 + 2 : 2 * 7 + 4;
  const y = 110 - (octave * 7 + letter - bottom) * 7.5;
  const ledgers: number[] = [];
  for (let line = 125; line <= y; line += 15) ledgers.push(line);
  for (let line = 35; line >= y; line -= 15) ledgers.push(line);
  return { clef, y, ledgers, sharp: [1, 3, 6, 8, 10].includes(pc) };
}
export function responseTiming(
  outcome: string,
  candidateSeconds: number | undefined,
  audioSeconds: number,
  nowMs: number,
  shownAtMs: number | null,
) {
  if (
    !["correct", "wrong"].includes(outcome) ||
    shownAtMs === null ||
    candidateSeconds === undefined
  )
    return { responseMs: null, confirmationMs: null };
  const estimated =
    nowMs - (audioSeconds - candidateSeconds) * 1000 - shownAtMs;
  const confirmed = nowMs - shownAtMs;
  if (
    !Number.isFinite(estimated) ||
    !Number.isFinite(confirmed) ||
    estimated < 0 ||
    confirmed < estimated
  )
    return { responseMs: null, confirmationMs: null };
  return {
    responseMs: Math.round(estimated),
    confirmationMs: Math.round(confirmed),
  };
}
export function responseSummary(
  attempts: {
    targetIndex: number;
    outcome: string;
    responseMs?: number | null;
    confirmationMs?: number | null;
  }[],
) {
  const first = new Map<number, number>();
  const correct = new Map<number, number>();
  for (const a of attempts)
    if (
      ["wrong", "correct"].includes(a.outcome) &&
      typeof a.responseMs === "number" &&
      Number.isFinite(a.responseMs) &&
      a.responseMs >= 0
    ) {
      if (!first.has(a.targetIndex)) first.set(a.targetIndex, a.responseMs);
      if (a.outcome === "correct" && !correct.has(a.targetIndex))
        correct.set(a.targetIndex, a.responseMs);
    }
  const mean = (m: Map<number, number>) =>
    m.size ? [...m.values()].reduce((a, b) => a + b, 0) / m.size : null;
  return {
    firstMs: mean(first),
    correctMs: mean(correct),
    measured: first.size,
  };
}

export function invalidateTargetTiming<
  T extends {
    targetIndex: number;
    responseMs?: number | null;
    confirmationMs?: number | null;
    viewChanged?: boolean;
  },
>(attempts: T[], index: number): T[] {
  return attempts.map((a) =>
    a.targetIndex === index
      ? { ...a, responseMs: null, confirmationMs: null, viewChanged: true }
      : a,
  );
}
