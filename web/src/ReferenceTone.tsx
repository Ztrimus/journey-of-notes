import { useEffect, useRef, useState } from "react";
import { ReferenceAudio } from "./referenceAudio";
import { audioError } from "./audio";
import { noteName } from "./pitch";

export function ReferenceTone({
  midi,
  onBusy,
  disabled = false,
}: {
  midi: number;
  onBusy: (busy: boolean) => void;
  disabled?: boolean;
}) {
  const current = useRef<ReferenceAudio | null>(null);
  const [playing, setPlaying] = useState(false);
  const [message, setMessage] = useState("");
  function stop() {
    const audio = current.current;
    current.current = null;
    audio?.stop();
    setPlaying(false);
    onBusy(false);
  }
  useEffect(() => {
    const hidden = () => {
      if (document.hidden) stop();
    };
    document.addEventListener("visibilitychange", hidden);
    return () => {
      document.removeEventListener("visibilitychange", hidden);
      stop();
    };
  }, [midi]);
  async function play() {
    if (current.current) return;
    const audio = new ReferenceAudio();
    current.current = audio;
    setPlaying(true);
    onBusy(true);
    setMessage("");
    try {
      await audio.play(midi);
    } catch (error) {
      if (current.current === audio) setMessage(audioError(error));
    } finally {
      if (current.current === audio) stop();
    }
  }
  return (
    <div className="reference-tone">
      <button type="button" disabled={disabled} onClick={playing ? stop : play}>
        {playing ? "Stop example" : `Hear example · ${noteName(midi)}`}
      </button>
      <small>
        Pitch reference · a generated tone, not a recording of the instrument.
      </small>
      <p className="small" role="status">
        {message}
      </p>
    </div>
  );
}
