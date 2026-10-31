import { useEffect, useRef, useState } from "react";
import { PracticeAudio, audioError, type Snapshot } from "./audio";
import { NoteValidator, type Attempt } from "./validation";
import {
  isReflex,
  responseTiming,
  invalidateTargetTiming,
  type Difficulty,
  type DisplayMode,
} from "./reflex";
import type { Lesson } from "./curriculum";
import type { SessionRecord } from "./history";
export interface PracticeOptions {
  lesson: Lesson;
  method: "microphone" | "self-check";
  display: DisplayMode;
  hints: boolean;
  notation: "western" | "sargam";
  difficulty: Difficulty;
  tonic: number | null;
}
interface Run extends PracticeOptions {
  index: number;
  attempts: Attempt[];
  validator: NoteValidator;
  accepted: boolean;
  quietSince: number | null;
  startedAt: string;
  seconds: number;
  shownAt: number | null;
  viewChanged: boolean;
  mixedViews: boolean;
  initialDisplay: DisplayMode;
}
const empty: Snapshot = { seconds: 0, beats: 0, onsets: 0, level: 0 };
export function usePractice(onFinish: (record: SessionRecord) => void) {
  const callback = useRef(onFinish);
  callback.current = onFinish;
  const runtime = useRef<Run | null>(null);
  const audio = useRef<PracticeAudio | null>(null);
  const startTime = useRef(0);
  const [phase, setPhase] = useState<"idle" | "starting" | "running">("idle");
  const [index, setIndex] = useState(0);
  const [snapshot, setSnapshot] = useState(empty);
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [accepted, setAccepted] = useState(false);
  const [feedback, setFeedback] = useState("Play the note when it appears.");
  const [outcome, setOutcome] = useState<
    "waiting" | "correct" | "wrong" | "unclear"
  >("waiting");
  const [error, setError] = useState("");
  function finish(finished = false) {
    const r = runtime.current;
    runtime.current = null;
    audio.current?.stop();
    audio.current = null;
    if (!r) return;
    setPhase("idle");
    setAccepted(false);
    setSnapshot((s) => ({ ...s, level: 0, pitch: null }));
    callback.current({
      id: crypto.randomUUID(),
      lessonId: r.lesson.id,
      lessonTitle: r.lesson.title,
      instrument: r.lesson.instrument,
      method: r.method,
      displayMode: r.initialDisplay,
      noteHints: r.hints,
      notation: r.notation,
      mixedViews: r.mixedViews,
      difficulty: isReflex(r.lesson.id) ? r.difficulty : undefined,
      tonic: r.tonic,
      startedAt: r.startedAt,
      seconds: r.seconds,
      targetCount: r.lesson.targets.length,
      finished:
        finished || (r.accepted && r.index === r.lesson.targets.length - 1),
      attempts: [...r.attempts],
    });
  }
  function record(a: Attempt) {
    const r = runtime.current;
    if (!r) return;
    r.attempts.push({
      ...a,
      displayMode: r.display,
      noteHints: r.hints,
      notation: r.notation,
      viewChanged: r.viewChanged,
    });
    setAttempts([...r.attempts]);
    if (r.attempts.length >= 500) finish();
  }
  function next() {
    const r = runtime.current;
    if (!r) return;
    if (r.index + 1 >= r.lesson.targets.length) {
      finish(true);
      return;
    }
    r.index++;
    r.accepted = false;
    r.quietSince = null;
    r.shownAt = null;
    r.viewChanged = false;
    r.validator = new NoteValidator(
      r.lesson.targets[r.index].midi,
      r.lesson.hold,
      r.index,
    );
    setIndex(r.index);
    setAccepted(false);
    setOutcome("waiting");
    setFeedback(
      r.method === "microphone"
        ? "Play and hold the new target."
        : "Practice this target, then mark it yourself.",
    );
  }
  function process(s: Snapshot) {
    const r = runtime.current;
    if (!r) return;
    r.seconds = s.seconds;
    setSnapshot(s);
    if (r.shownAt === null) return;
    if (r.accepted) {
      if (s.level < 0.012) {
        r.quietSince ??= s.seconds;
        if (s.seconds - r.quietSince > 0.18) next();
      } else r.quietSince = null;
      return;
    }
    const a = r.validator.ingest(s.pitch ?? null, s.level, s.seconds);
    if (!a) return;
    const timing =
      isReflex(r.lesson.id) && !r.viewChanged
        ? responseTiming(
            a.outcome,
            a.onsetSeconds,
            s.seconds,
            performance.now(),
            r.shownAt,
          )
        : { responseMs: null, confirmationMs: null };
    record({ ...a, ...timing });
    if (!runtime.current) return;
    if (a.outcome === "correct") {
      r.accepted = true;
      setAccepted(true);
      setOutcome("correct");
      setFeedback("Matched. Release the note to continue.");
    } else if (a.outcome === "wrong") {
      setOutcome("wrong");
      setFeedback(
        Math.round(a.detected!) === a.target
          ? "Adjust the pitch and try again."
          : "Try again. The heard note is different.",
      );
    } else {
      setOutcome("unclear");
      setFeedback("Unclear sound. Try one steady note.");
    }
  }
  async function start(options: PracticeOptions) {
    if (runtime.current) return;
    const r: Run = {
      ...options,
      index: 0,
      attempts: [],
      validator: new NoteValidator(
        options.lesson.targets[0].midi,
        options.lesson.hold,
      ),
      accepted: false,
      quietSince: null,
      startedAt: new Date().toISOString(),
      seconds: 0,
      shownAt: null,
      viewChanged: false,
      mixedViews: false,
      initialDisplay: options.display,
    };
    runtime.current = r;
    setIndex(0);
    setAttempts([]);
    setSnapshot(empty);
    setAccepted(false);
    setOutcome("waiting");
    setError("");
    startTime.current = performance.now();
    if (r.method === "self-check") {
      setPhase("running");
      setFeedback("Silent practice. You report each repetition.");
      return;
    }
    setPhase("starting");
    setFeedback("Allow microphone access to begin.");
    const engine = new PracticeAudio();
    audio.current = engine;
    try {
      await engine.start(
        { bpm: 60, microphone: true, click: false, threshold: 0.06 },
        process,
        () => finish(),
      );
      if (runtime.current !== r) return;
      setPhase("running");
      setFeedback("Play and hold the target, then release.");
    } catch (e) {
      engine.stop();
      if (runtime.current !== r) return;
      runtime.current = null;
      audio.current = null;
      setPhase("idle");
      setError(audioError(e));
      setFeedback("Choose Retry or Silent practice.");
    }
  }
  function changeDisplay(display: DisplayMode) {
    const r = runtime.current;
    if (!r) return;
    if (r.display === display) return;
    r.display = display;
    r.mixedViews = true;
    r.viewChanged = true;
    r.attempts = invalidateTargetTiming(r.attempts, r.index);
    setAttempts([...r.attempts]);
    r.shownAt = null;
    if (!r.accepted)
      r.validator = new NoteValidator(
        r.lesson.targets[r.index].midi,
        r.lesson.hold,
        r.index,
      );
    setFeedback("View changed. Timing is omitted for this target.");
  }
  function presented() {
    if (runtime.current) runtime.current.shownAt = performance.now();
  }
  function manual(outcome: "self-reported" | "skipped") {
    const r = runtime.current;
    if (!r) return;
    if (outcome === "self-reported" && r.method !== "self-check") return;
    record({
      targetIndex: r.index,
      target: r.lesson.targets[r.index].midi,
      detected: null,
      cents: null,
      outcome,
      seconds: r.seconds,
      confidence: null,
      responseMs: null,
      confirmationMs: null,
    });
    next();
  }
  useEffect(() => {
    const hidden = () => {
      if (document.hidden) finish();
    };
    document.addEventListener("visibilitychange", hidden);
    const leaving = () => finish();
    window.addEventListener("pagehide", leaving);
    const timer = window.setInterval(() => {
      const r = runtime.current;
      if (r?.method === "self-check") {
        r.seconds = (performance.now() - startTime.current) / 1000;
        const seconds = r.seconds;
        setSnapshot((s) => ({ ...s, seconds }));
      }
    }, 200);
    return () => {
      document.removeEventListener("visibilitychange", hidden);
      window.removeEventListener("pagehide", leaving);
      clearInterval(timer);
      audio.current?.stop();
    };
  }, []);
  return {
    phase,
    index,
    snapshot,
    attempts,
    accepted,
    feedback,
    outcome,
    error,
    start,
    finish,
    next,
    changeDisplay,
    presented,
    manual,
  };
}
