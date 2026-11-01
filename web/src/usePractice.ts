import { useEffect, useRef, useState } from "react";
import { PracticeAudio, audioError, type Snapshot } from "./audio";
import { NoteValidator, type Attempt } from "./validation";
import {
  isReflex,
  responseTiming,
  type Difficulty,
  type DisplayMode,
} from "./reflex";
import type { Lesson } from "./curriculum";
import type { SessionRecord } from "./history";
import {
  changeCue,
  FeedbackGlowGate,
  GLOW_DURATION_MS,
  type GlowSignal,
} from "./practiceFeedback";
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
  initialHints: boolean;
}
const empty: Snapshot = { seconds: 0, beats: 0, onsets: 0, level: 0 };
export function usePractice(onFinish: (record: SessionRecord) => void) {
  const callback = useRef(onFinish);
  callback.current = onFinish;
  const runtime = useRef<Run | null>(null);
  const audio = useRef<PracticeAudio | null>(null);
  const startTime = useRef(0);
  const glowGate = useRef(new FeedbackGlowGate());
  const glowTimer = useRef(0);
  const [glow, setGlow] = useState<GlowSignal | null>(null);
  function clearGlow() {
    clearTimeout(glowTimer.current);
    glowGate.current.reset();
    setGlow(null);
  }
  function signalGlow(outcome: string) {
    const signal = glowGate.current.signal(outcome, performance.now());
    if (!signal) return;
    setGlow(signal);
    if (signal.fresh) {
      clearTimeout(glowTimer.current);
      glowTimer.current = window.setTimeout(
        () => setGlow(null),
        GLOW_DURATION_MS,
      );
    }
  }
  const [phase, setPhase] = useState<"idle" | "starting" | "running">("idle");
  const [index, setIndex] = useState(0);
  const [snapshot, setSnapshot] = useState(empty);
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [accepted, setAccepted] = useState(false);
  const [liveHints, setLiveHints] = useState(false);
  const [feedback, setFeedback] = useState("Play the note when it appears.");
  const [outcome, setOutcome] = useState<
    "waiting" | "correct" | "wrong" | "unclear"
  >("waiting");
  const [error, setError] = useState("");
  function finish(finished = false) {
    const r = runtime.current;
    clearGlow();
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
      noteHints: r.initialHints,
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
    if (r.method === "microphone") signalGlow(a.outcome);
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
    r.hints = r.initialHints;
    setLiveHints(r.hints);
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
      isReflex(r.lesson.id) && !r.viewChanged && !r.hints
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
      initialHints: options.hints,
    };
    runtime.current = r;
    clearGlow();
    setIndex(0);
    setLiveHints(options.hints);
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
  function updateCue(
    change: { display?: DisplayMode; hints?: boolean },
    message: string,
  ) {
    const current = runtime.current;
    if (!current) return;
    const changed = changeCue(current, change);
    if (changed === current) return;
    Object.assign(current, changed);
    setLiveHints(current.hints);
    setAttempts([...current.attempts]);
    current.shownAt = null;
    // The target pitch is unchanged. Preserve hold/dedup state so revealing
    // a hint or switching views cannot count a sustained wrong note twice.
    setFeedback(message);
  }
  function changeDisplay(display: DisplayMode) {
    updateCue({ display }, "View changed. Timing is omitted for this target.");
  }
  function changeHints(hints: boolean) {
    updateCue(
      { hints },
      hints
        ? "Hints shown. Timing is omitted for this target."
        : "Hints hidden. This target remains excluded from speed scoring.",
    );
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
      clearTimeout(glowTimer.current);
      audio.current?.stop();
    };
  }, []);
  return {
    phase,
    glow,
    hints: liveHints,
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
    changeHints,
    presented,
    manual,
  };
}
