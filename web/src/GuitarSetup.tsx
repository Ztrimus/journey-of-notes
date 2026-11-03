import { useEffect, useRef, useState } from "react";
import { PracticeAudio, audioError } from "./audio";
import { guitarStrings, guitarFinger, tuningReading } from "./guitar";
import { noteName, type Pitch } from "./pitch";
import type { Lesson } from "./curriculum";
import { GuitarTab } from "./GuitarTab";
import { GuitarDiagram } from "./InstrumentVisuals";
import { ReferenceTone } from "./ReferenceTone";

export function GuitarSetup({
  lesson,
  reflex,
  onBusy,
}: {
  lesson: Lesson;
  reflex: boolean;
  onBusy: (busy: boolean) => void;
}) {
  const [selected, setSelected] = useState(1);
  const [preview, setPreview] = useState(0);
  const [listening, setListening] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [pitch, setPitch] = useState<Pitch | null>(null);
  const [message, setMessage] = useState("");
  const audio = useRef<PracticeAudio | null>(null);
  const timeout = useRef(0);
  const target = guitarStrings[selected - 1];
  const reading = tuningReading(pitch, target.midi);
  function stop() {
    const engine = audio.current;
    audio.current = null;
    engine?.stop();
    clearTimeout(timeout.current);
    setListening(false);
    setPitch(null);
    onBusy(false);
  }
  useEffect(() => {
    const hidden = () => {
      if (document.hidden) {
        stop();
        setMessage("Listening stopped while this page was away.");
      }
    };
    document.addEventListener("visibilitychange", hidden);
    return () => {
      document.removeEventListener("visibilitychange", hidden);
      stop();
    };
  }, []);
  async function listen() {
    if (audio.current || playing) return;
    const engine = new PracticeAudio();
    audio.current = engine;
    setListening(true);
    onBusy(true);
    setMessage("Pluck the selected open string gently; mute the others.");
    try {
      await engine.start(
        {
          bpm: 60,
          microphone: true,
          click: false,
          threshold: 0.06,
          analysis: "guitar-tuner",
        },
        (s) => {
          if (audio.current === engine)
            setPitch(s.level > 0.012 ? (s.pitch ?? null) : null);
        },
        () => {
          if (audio.current === engine) {
            stop();
            setMessage("Audio was interrupted. Tap Start tuner to reconnect.");
          }
        },
      );
      if (audio.current === engine)
        timeout.current = window.setTimeout(() => {
          stop();
          setMessage(
            "Listening stopped after one minute. Start again when ready.",
          );
        }, 60000);
    } catch (error) {
      if (audio.current === engine) {
        stop();
        setMessage(audioError(error));
      }
    }
  }
  const example = lesson.targets[preview] ?? lesson.targets[0];
  return (
    <section className="guitar-setup" aria-labelledby="guitar-setup-title">
      <h2 id="guitar-setup-title">Get your guitar ready</h2>
      <p className="small muted">
        Standard six-string tuning · no capo. Use either playing hand. Check
        tuning before each set.
      </p>
      <details
        onToggle={(e) => {
          if (!e.currentTarget.open && audio.current) stop();
        }}
      >
        <summary>Check tuning · experimental</summary>
        <label htmlFor="tuner-string">Open string to tune</label>
        <select
          id="tuner-string"
          value={selected}
          disabled={playing}
          onChange={(e) => {
            setSelected(Number(e.target.value));
            setPitch(null);
          }}
        >
          {guitarStrings.map((s) => (
            <option key={s.string} value={s.string}>
              {s.label} · {noteName(s.midi)}
            </option>
          ))}
        </select>
        <div className="tuner-actions">
          <button
            type="button"
            disabled={playing}
            onClick={listening ? stop : listen}
          >
            {listening ? "Stop tuner" : "Start tuner"}
          </button>
          <strong>{noteName(target.midi)}</strong>
        </div>
        <div className={`tuner-reading ${reading?.state ?? "waiting"}`}>
          <strong role="status">
            {!reading
              ? "—"
              : reading.state === "different"
                ? `Heard ${noteName(pitch!.midi)}`
                : reading.state === "in-tune"
                  ? "In tune"
                  : reading.state === "flat"
                    ? "Flat · raise pitch gently"
                    : "Sharp · lower pitch gently"}
          </strong>
          {reading && (
            <span>
              {Math.round(reading.cents)} cents
              {reading.state !== "different" &&
                ` · heard ${noteName(pitch!.midi)}`}
            </span>
          )}
        </div>
        <p className="small" role="status">
          {message}
        </p>
        <p className="small muted">
          Pluck one string at a time. A harmonic can look like another note;
          check the selected string and use an independent tuner if unsure. Zero
          cents is the reference pitch; negative is flat, positive is sharp.
          Live instrument accuracy still needs testing.
        </p>
      </details>
      {!reflex && (
        <details>
          <summary>Preview this exercise</summary>
          <label htmlFor="guitar-preview">Note to preview</label>
          <select
            id="guitar-preview"
            value={preview}
            disabled={playing || listening}
            onChange={(e) => setPreview(Number(e.target.value))}
          >
            {lesson.targets.map((t, i) => (
              <option key={i} value={i}>
                {i + 1} · {noteName(t.midi)} · string {t.string},{" "}
                {t.fret === 0 ? "open" : `fret ${t.fret}`}
              </option>
            ))}
          </select>
          <GuitarTab target={example} />
          <GuitarDiagram string={example.string} fret={example.fret} />
          <p className="small">{guitarFinger(example)} · suggested placement</p>
          <ReferenceTone
            midi={example.midi}
            disabled={listening}
            onBusy={(busy) => {
              setPlaying(busy);
              onBusy(busy || audio.current !== null);
            }}
          />
        </details>
      )}
      <p className="small muted">
        TAB numbers are frets; 0 means open. Finger numbers: 1 index, 2 middle,
        3 ring, 4 little. Pitch feedback cannot verify your string or finger.
      </p>
    </section>
  );
}
