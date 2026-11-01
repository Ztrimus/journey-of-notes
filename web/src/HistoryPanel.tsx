import { useEffect, useRef, useState } from "react";
import type { SessionRecord } from "./history";
import { instrumentName } from "./catalog";
import { sessionMetrics } from "./metrics";
import { AttemptList } from "./AttemptTrail";
import { groupHistoryDays } from "./historyTimeline";
import { formatTime } from "./logic";
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
  const [page, setPage] = useState(0);
  const timeline = useRef<HTMLDivElement>(null);
  const pages = Math.max(1, Math.ceil(records.length / 6));
  useEffect(() => setPage(0), [records]);
  const groups = groupHistoryDays(records.slice(page * 6, (page + 1) * 6));
  function changePage(next: number) {
    setPage(next);
    requestAnimationFrame(() => {
      const heading = timeline.current?.querySelector<HTMLElement>("h2");
      heading?.focus();
      heading?.scrollIntoView({ block: "start" });
    });
  }
  return (
    <>
      <div className="history-toolbar">
        <span>{records.length} saved sets</span>
        <small>Circles show first-try match</small>
      </div>
      {!records.length && (
        <p>No saved sets yet. Choose an instrument to start.</p>
      )}
      <div className="history-timeline" ref={timeline}>
        {groups.map((group) => (
          <section className="history-day" key={group.key}>
            <h2 tabIndex={-1}>
              {group.date.toLocaleDateString(undefined, {
                weekday: "short",
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </h2>
            <ol role="list">
              {group.records.map((record) => (
                <HistoryEntry
                  key={record.id}
                  record={record}
                  onReview={() => onReview(record)}
                />
              ))}
            </ol>
          </section>
        ))}
      </div>
      {pages > 1 && (
        <nav className="pagination" aria-label="History pages">
          <button disabled={page === 0} onClick={() => changePage(page - 1)}>
            Newer sets
          </button>
          <span role="status">
            {page + 1}/{pages}
          </span>
          <button
            disabled={page + 1 >= pages}
            onClick={() => changePage(page + 1)}
          >
            Older sets
          </button>
        </nav>
      )}
    </>
  );
}
function HistoryEntry({
  record,
  onReview,
}: {
  record: SessionRecord;
  onReview: () => void;
}) {
  const [open, setOpen] = useState(false);
  const m = sessionMetrics(record);
  const measured = record.method === "microphone";
  const rate = measured ? m.firstRate : null;
  const accuracy = rate === null ? "—" : `${Math.round(rate * 100)}%`;
  return (
    <li className="history-entry">
      <button
        className="history-node"
        onClick={onReview}
        aria-label={`${accuracy}${measured ? " first-try match" : ". Silent practice"}. Open report for ${instrumentName(record.instrument)}, ${record.lessonTitle}, ${new Date(record.startedAt).toLocaleString()}`}
      >
        <svg viewBox="0 0 56 56" aria-hidden="true">
          <circle
            className={
              rate === null ? "history-ring-empty" : "history-ring-wrong"
            }
            cx="28"
            cy="28"
            r="25"
          />
          {rate !== null && (
            <circle
              className="history-ring-match"
              cx="28"
              cy="28"
              r="25"
              pathLength="100"
              strokeDasharray={`${rate * 100} 100`}
              transform="rotate(-90 28 28)"
            />
          )}
        </svg>
        <span>{accuracy}</span>
      </button>
      <div className="history-entry-body">
        <div className="history-entry-meta">
          <span className="instrument-tag">
            {instrumentName(record.instrument)}
          </span>
          <time dateTime={record.startedAt}>
            {new Date(record.startedAt).toLocaleTimeString(undefined, {
              hour: "numeric",
              minute: "2-digit",
            })}
          </time>
        </div>
        <h3>
          <button className="history-title" onClick={onReview}>
            {record.lessonTitle}
            <span className="sr-only"> — open report</span>
          </button>
        </h3>
        <p className="history-entry-evidence">
          {measured
            ? `${m.matched}/${record.targetCount} matched`
            : "Self-reported"}{" "}
          · {formatTime(record.seconds)}
          {!record.finished && " · Ended early"}
          {measured && rate === null && " · No clear pitch"}
        </p>
      </div>
      <details
        className="history-entry-attempts"
        onToggle={(e) => setOpen(e.currentTarget.open)}
      >
        <summary>Attempts ({record.attempts.length})</summary>
        {open && <AttemptList record={record} />}
      </details>
    </li>
  );
}
