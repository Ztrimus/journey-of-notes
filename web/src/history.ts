import { instrumentIds } from "./catalog.ts";
import type { Attempt } from "./validation.ts";
export interface SessionRecord {
  mixedViews?: boolean;
  notation?: "western" | "sargam";
  id: string;
  lessonId: string;
  lessonTitle: string;
  instrument: string;
  method: "microphone" | "self-check";
  displayMode?: "keyboard" | "staff" | "both";
  noteHints?: boolean;
  difficulty?: "easy" | "medium" | "hard";
  tonic: number | null;
  startedAt: string;
  seconds: number;
  targetCount: number;
  finished: boolean;
  attempts: Attempt[];
}
const KEY = "journey-of-notes.history.v1";
const outcomes = ["correct", "wrong", "unclear", "skipped", "self-reported"];
export function validSession(x: unknown): x is SessionRecord {
  if (!x || typeof x !== "object") return false;
  const s = x as SessionRecord;
  const optionalTime = (v: unknown) =>
    v === undefined ||
    v === null ||
    (typeof v === "number" && Number.isFinite(v) && v >= 0);
  return (
    (s.notation === undefined || ["western", "sargam"].includes(s.notation)) &&
    (s.mixedViews === undefined || typeof s.mixedViews === "boolean") &&
    (s.displayMode === undefined ||
      ["keyboard", "staff", "both"].includes(s.displayMode)) &&
    (s.difficulty === undefined ||
      ["easy", "medium", "hard"].includes(s.difficulty)) &&
    (s.noteHints === undefined || typeof s.noteHints === "boolean") &&
    typeof s.id === "string" &&
    typeof s.lessonId === "string" &&
    typeof s.lessonTitle === "string" &&
    (instrumentIds as readonly string[]).includes(s.instrument) &&
    ["microphone", "self-check"].includes(s.method) &&
    (s.tonic === null || Number.isFinite(s.tonic)) &&
    typeof s.startedAt === "string" &&
    Number.isFinite(Date.parse(s.startedAt)) &&
    Number.isFinite(s.seconds) &&
    s.seconds >= 0 &&
    Number.isInteger(s.targetCount) &&
    s.targetCount > 0 &&
    typeof s.finished === "boolean" &&
    Array.isArray(s.attempts) &&
    s.attempts.length <= 500 &&
    s.attempts.every(
      (a) =>
        a &&
        (a.displayMode === undefined ||
          ["keyboard", "staff", "both"].includes(a.displayMode)) &&
        (a.noteHints === undefined || typeof a.noteHints === "boolean") &&
        (a.notation === undefined ||
          ["western", "sargam"].includes(a.notation)) &&
        (a.viewChanged === undefined || typeof a.viewChanged === "boolean") &&
        optionalTime(a.responseMs) &&
        optionalTime(a.confirmationMs) &&
        optionalTime(a.onsetSeconds) &&
        Number.isInteger(a.targetIndex) &&
        a.targetIndex >= 0 &&
        a.targetIndex < s.targetCount &&
        Number.isFinite(a.target) &&
        outcomes.includes(a.outcome) &&
        Number.isFinite(a.seconds) &&
        a.seconds >= 0 &&
        (a.detected === null || Number.isFinite(a.detected)) &&
        (a.cents === null || Number.isFinite(a.cents)) &&
        (a.confidence === null || Number.isFinite(a.confidence)),
    )
  );
}
export function parseHistory(raw: string | null): SessionRecord[] {
  if (!raw) return [];
  const data: unknown = JSON.parse(raw);
  if (!Array.isArray(data) || !data.every(validSession))
    throw new Error(
      "Saved practice history could not be read. New results will remain available for export.",
    );
  return data
    .sort((a, b) => Date.parse(b.startedAt) - Date.parse(a.startedAt))
    .slice(0, 100);
}
export function loadHistory() {
  return parseHistory(localStorage.getItem(KEY));
}
export function saveHistory(records: SessionRecord[]) {
  localStorage.setItem(KEY, JSON.stringify(records.slice(0, 100)));
}
export function counts(attempts: Attempt[]) {
  return Object.fromEntries(
    outcomes.map((outcome) => [
      outcome,
      attempts.filter((a) => a.outcome === outcome).length,
    ]),
  ) as Record<Attempt["outcome"], number>;
}

export function clearSavedHistory() {
  localStorage.removeItem(KEY);
}
