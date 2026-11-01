import { useEffect, useRef, useState } from "react";
import { PracticeAudio, audioError } from "./audio";
import { TonicSampler } from "./bansuri";
import { noteName } from "./pitch";
export function TonicSetup({
  vocal = false,
  tonic,
  confirmed,
  onChange,
  onConfirm,
  onListening,
}: {
  vocal?: boolean;
  tonic: number;
  confirmed: boolean;
  onChange: (midi: number) => void;
  onConfirm: (value: boolean) => void;
  onListening: (value: boolean) => void;
}) {
  const engine = useRef<PracticeAudio | null>(null);
  const timeout = useRef(0);
  const [listening, setListening] = useState(false);
  const [candidate, setCandidate] = useState<{
    midi: number;
    hz: number;
  } | null>(null);
  const [message, setMessage] = useState(
    vocal
      ? "Choose a comfortable pitch. No range or loudness challenge."
      : "Play your known middle Sa. We can detect its pitch, but cannot infer the fingering you used.",
  );
  function stop() {
    engine.current?.stop();
    engine.current = null;
    clearTimeout(timeout.current);
    setListening(false);
    onListening(false);
  }
  useEffect(() => {
    const hidden = () => {
      if (document.hidden) stop();
    };
    document.addEventListener("visibilitychange", hidden);
    return () => {
      document.removeEventListener("visibilitychange", hidden);
      engine.current?.stop();
      clearTimeout(timeout.current);
      onListening(false);
    };
  }, []);
  async function detect() {
    if (engine.current) return;
    const audio = new PracticeAudio();
    engine.current = audio;
    const sampler = new TonicSampler();
    setCandidate(null);
    setListening(true);
    onListening(true);
    onConfirm(false);
    setMessage(
      vocal
        ? "Allow the microphone, then hum a comfortable steady note."
        : "Allow the microphone, then hold your middle Sa steadily.",
    );
    try {
      await audio.start(
        { bpm: 60, microphone: true, click: false, threshold: 0.06 },
        (s) => {
          if (engine.current !== audio) return;
          const result = sampler.process(s.pitch ?? null, s.level, s.seconds);
          if (result) {
            stop();
            setCandidate(result);
            onChange(result.midi);
            setMessage(
              `Detected ${noteName(result.midi)} at ${result.hz.toFixed(1)} Hz. ${vocal ? "Confirm only if this is comfortable." : "Confirm only if you were playing middle Sa."}`,
            );
          }
        },
        () => {
          stop();
          setMessage("Audio was interrupted. Try again or select Sa manually.");
        },
      );
      if (engine.current === audio)
        timeout.current = window.setTimeout(() => {
          stop();
          setMessage(
            "No stable pitch settled. Try again, or choose Sa manually.",
          );
        }, 15000);
    } catch (e) {
      if (engine.current !== audio) return;
      stop();
      setMessage(audioError(e));
    }
  }
  return (
    <section className="tonic-setup" aria-labelledby="tonic-title">
      <h2 id="tonic-title">
        {vocal ? "Choose a comfortable starting note" : "Find your Sa"}
      </h2>
      <p className="subtle">
        {vocal
          ? "Hum gently at a comfortable pitch or choose it below. Keep all drill notes comfortable; do not force your range. Stop if uncomfortable or hoarse."
          : "For a typical Hindustani bansuri, middle Sa uses the three upper finger holes closed. Confirm your flute’s convention; all-holes-closed can be a different note."}
      </p>
      <div className="tonic-actions">
        <button type="button" onClick={listening ? stop : detect}>
          {listening
            ? "Stop listening"
            : vocal
              ? "Find my starting pitch"
              : "Detect my Sa"}
        </button>
        <span className="tonic-reading">
          {candidate
            ? `${noteName(candidate.midi)} · ${candidate.hz.toFixed(1)} Hz`
            : noteName(tonic)}
        </span>
      </div>
      <p className="small status-copy" role="status">
        {message}
      </p>
      <label htmlFor="tonic">
        {vocal ? "Or select starting note" : "Or select middle Sa"}
      </label>
      <select
        id="tonic"
        value={tonic}
        disabled={listening}
        onChange={(e) => {
          onChange(Number(e.target.value));
          onConfirm(false);
          setCandidate(null);
        }}
      >
        {Array.from({ length: 36 }, (_, i) => i + 48).map((midi) => (
          <option key={midi} value={midi}>
            {noteName(midi)}
          </option>
        ))}
      </select>
      <label className="check">
        <input
          type="checkbox"
          checked={confirmed}
          disabled={listening}
          onChange={(e) => onConfirm(e.target.checked)}
        />
        {vocal
          ? "This starting note and the small steps around it are comfortable for me."
          : "I confirm this is my middle Sa."}
      </label>
    </section>
  );
}
