import { useEffect, useId, useRef, useState } from "react";
import type { SessionRecord } from "./history";
import type { Attempt } from "./validation";
import { heardName, swarForMidi } from "./bansuri";
import { noteName } from "./pitch";
import { formatTime } from "./logic";

const labels: Record<Attempt["outcome"], string> = {
  correct: "Matched",
  wrong: "Wrong pitch",
  unclear: "Unclear",
  skipped: "Skipped",
  "self-reported": "Self-reported",
};
function OutcomeIcon({ outcome }: { outcome: Attempt["outcome"] }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {outcome === "correct" ? (
        <path d="m5 12 4 4L19 6" />
      ) : outcome === "wrong" ? (
        <path d="m6 6 12 12M18 6 6 18" />
      ) : outcome === "unclear" ? (
        <>
          <path d="M9 8a3 3 0 1 1 5 2c-2 1-2 2-2 4" />
          <path d="M12 18h.01" />
        </>
      ) : outcome === "skipped" ? (
        <path d="M5 19V9a4 4 0 0 1 4-4h10m-4-4 4 4-4 4" />
      ) : (
        <circle cx="12" cy="12" r="6" />
      )}
    </svg>
  );
}
export function AttemptList({ record }: { record: SessionRecord }) {
  const [page, setPage] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const detailId = useId();
  const track = useRef<HTMLOListElement>(null);
  useEffect(() => {
    setPage(0);
    setSelected(null);
  }, [record.id]);
  const size = 12,
    pages = Math.max(1, Math.ceil(record.attempts.length / size));
  const a = selected === null ? null : record.attempts[selected];
  const fullName = (midi: number) =>
    heardName(midi, record.instrument, record.tonic, record.notation);
  function shortName(midi: number) {
    if (
      record.tonic !== null &&
      (record.instrument === "flute" ||
        (record.instrument === "vocal" && record.notation === "sargam"))
    ) {
      const swar = swarForMidi(midi, record.tonic);
      return {
        note: swar.name.replace("Komal ", "♭").replace("Tivra ", "♯"),
        pitch: swar.pitch,
      };
    }
    return { note: noteName(midi), pitch: null };
  }
  function changePage(next: number) {
    setSelected(null);
    setPage(next);
    requestAnimationFrame(() =>
      track.current?.querySelector<HTMLButtonElement>("button")?.focus(),
    );
  }
  return (
    <div className="attempt-flow">
      <ol
        ref={track}
        className="attempt-track"
        role="list"
        start={page * size + 1}
        aria-label="Attempts in playing order"
      >
        {record.attempts
          .slice(page * size, (page + 1) * size)
          .map((attempt, i) => {
            const index = page * size + i,
              cue = shortName(attempt.target);
            return (
              <li key={index}>
                <button
                  type="button"
                  className="attempt-node"
                  data-outcome={attempt.outcome}
                  aria-label={`${cue.note}${cue.pitch ? ` / ${cue.pitch}` : ""}. ${labels[attempt.outcome]}. ${fullName(attempt.target)} at ${formatTime(attempt.seconds)}. Attempt ${index + 1}.`}
                  aria-expanded={selected === index}
                  aria-controls={detailId}
                  onClick={() => setSelected(selected === index ? null : index)}
                >
                  <strong>{cue.note}</strong>
                  {cue.pitch && <small>{cue.pitch}</small>}
                  <span className="attempt-badge">
                    <OutcomeIcon outcome={attempt.outcome} />
                  </span>
                </button>
                <time>{formatTime(attempt.seconds)}</time>
              </li>
            );
          })}
      </ol>
      {!record.attempts.length ? (
        <p className="small muted">No attempts were recorded.</p>
      ) : (
        <p className="attempt-hint">Select a note for details.</p>
      )}
      <div
        id={detailId}
        className="attempt-detail"
        data-outcome={a?.outcome}
        hidden={!a}
        role="status"
      >
        {a && (
          <>
            <span className="detail-symbol">
              <OutcomeIcon outcome={a.outcome} />
            </span>
            <div>
              <strong>{fullName(a.target)}</strong> · {labels[a.outcome]} ·{" "}
              {formatTime(a.seconds)}
              {a.outcome === "wrong" && a.detected !== null && (
                <span>Heard {fullName(a.detected)}</span>
              )}
              {record.method === "microphone" &&
                typeof a.responseMs === "number" && (
                  <small>
                    {(a.responseMs / 1000).toFixed(2)}s response
                    {typeof a.confirmationMs === "number"
                      ? ` · ${(a.confirmationMs / 1000).toFixed(2)}s confirmed`
                      : ""}
                  </small>
                )}
            </div>
          </>
        )}
      </div>
      {pages > 1 && (
        <nav className="pagination" aria-label="Attempt pages">
          <button disabled={page === 0} onClick={() => changePage(page - 1)}>
            Previous
          </button>
          <span role="status">
            {page + 1}/{pages}
          </span>
          <button
            disabled={page + 1 >= pages}
            onClick={() => changePage(page + 1)}
          >
            Next
          </button>
        </nav>
      )}
    </div>
  );
}
