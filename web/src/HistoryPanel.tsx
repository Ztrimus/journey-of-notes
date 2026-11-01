import { useEffect, useRef, useState } from "react";
import type { SessionRecord } from "./history";
import { instrumentName } from "./catalog";
import { sessionMetrics } from "./metrics";
import { AttemptList } from "./Results";
export function ClearHistoryButton({
  disabled,
  onClear,
}: {
  disabled: boolean;
  onClear: () => boolean;
}) {
  const modal = useRef<HTMLDialogElement>(null);
  const [error, setError] = useState("");
  return (
    <>
      <button
        disabled={disabled}
        onClick={() => {
          setError("");
          modal.current?.showModal();
        }}
      >
        Clear history
      </button>
      <dialog
        ref={modal}
        aria-labelledby="clear-title"
        className="clear-dialog"
      >
        <h2 id="clear-title">Clear this browser’s history?</h2>
        <p>
          This removes saved sets for all instruments on this website, including
          the latest report. Export a backup first if you want to keep them.
          Other browser data is unchanged.
        </p>
        {error && <p role="alert">{error}</p>}
        <div className="dialog-actions">
          <button autoFocus onClick={() => modal.current?.close()}>
            Keep history
          </button>
          <button
            className="danger-button"
            onClick={() => {
              if (onClear()) {
                modal.current?.close();
                document.querySelector<HTMLElement>("#main h1")?.focus();
              } else
                setError(
                  "History could not be cleared. Your saved records remain available.",
                );
            }}
          >
            Clear saved sets
          </button>
        </div>
      </dialog>
    </>
  );
}
export function HistoryPanel({
  records,
  onReview,
}: {
  records: SessionRecord[];
  onReview: (record: SessionRecord) => void;
}) {
  const [view, setView] = useState<"grid" | "list">("grid"),
    [page, setPage] = useState(0);
  const pages = Math.max(1, Math.ceil(records.length / 6));
  useEffect(() => setPage(0), [records]);
  return (
    <>
      <div className="history-toolbar">
        <span>{records.length} saved sets</span>
        <div role="group" aria-label="History layout">
          <button
            aria-pressed={view === "grid"}
            onClick={() => setView("grid")}
          >
            Grid
          </button>
          <button
            aria-pressed={view === "list"}
            onClick={() => setView("list")}
          >
            Timeline
          </button>
        </div>
      </div>
      {!records.length && (
        <p>No saved sets yet. Choose an instrument to start.</p>
      )}
      <div className={`history-layout history-${view}`}>
        {records.slice(page * 6, (page + 1) * 6).map((r) => (
          <HistoryCard key={r.id} record={r} onReview={() => onReview(r)} />
        ))}
      </div>
      {pages > 1 && (
        <nav className="pagination" aria-label="History pages">
          <button disabled={page === 0} onClick={() => setPage((p) => p - 1)}>
            Newer sets
          </button>
          <span role="status">
            {page + 1}/{pages}
          </span>
          <button
            disabled={page + 1 >= pages}
            onClick={() => setPage((p) => p + 1)}
          >
            Older sets
          </button>
        </nav>
      )}
    </>
  );
}
function HistoryCard({
  record,
  onReview,
}: {
  record: SessionRecord;
  onReview: () => void;
}) {
  const [open, setOpen] = useState(false);
  const m = sessionMetrics(record);
  return (
    <article className="history-card">
      <span className="instrument-tag">
        {instrumentName(record.instrument)}
      </span>
      <h2>{record.lessonTitle}</h2>
      <time dateTime={record.startedAt}>
        {new Date(record.startedAt).toLocaleString()}
      </time>
      <p className="small">
        {record.finished ? "Set finished" : "Ended early"} ·{" "}
        {record.method === "microphone" ? "Microphone" : "Silent practice"}
      </p>
      {record.method === "microphone" ? (
        <div className="history-score">
          <strong>
            {m.firstRate === null
              ? "No clear pitch"
              : `${Math.round(m.firstRate * 100)}% first-try`}
          </strong>
          <span>
            ✓ {m.matched}/{record.targetCount} targets matched
          </span>
        </div>
      ) : (
        <p className="small">Self-reported repetitions</p>
      )}
      <button className="history-report-button" onClick={onReview}>
        Open report
      </button>
      <details onToggle={(e) => setOpen(e.currentTarget.open)}>
        <summary>View attempts ({record.attempts.length})</summary>
        {open && <AttemptList record={record} />}
      </details>
    </article>
  );
}
