import { counts, type SessionRecord } from "./history";
import { sessionMetrics, comparable } from "./metrics";
import { formatTime } from "./logic";
import { heardName } from "./bansuri";
const percent = (n: number | null) =>
  n === null ? "—" : `${Math.round(n * 100)}%`;
const seconds = (n: number | null) =>
  n === null ? "—" : `${(n / 1000).toFixed(2)}s`;
export function Results({
  record,
  history,
}: {
  record: SessionRecord;
  history: SessionRecord[];
}) {
  const c = counts(record.attempts),
    m = sessionMetrics(record);
  const prior = history.find(
    (r) =>
      r.id !== record.id &&
      comparable(record, r) &&
      sessionMetrics(r).medianMs !== null,
  );
  const previous = prior ? sessionMetrics(prior) : null;
  return (
    <>
      <div className="result-banner">
        <span aria-hidden="true">{record.finished ? "✓" : "◷"}</span>
        <div>
          <h1 tabIndex={-1}>
            {record.finished
              ? "Another set in the bank."
              : "Every bit of practice counts."}
          </h1>
          <p>
            {record.lessonTitle} · {formatTime(record.seconds)} ·{" "}
            {record.method === "microphone"
              ? "Microphone trial"
              : "Silent self-report"}
          </p>
        </div>
      </div>
      <div className="score-grid">
        <Metric
          label="First-try match"
          value={percent(m.firstRate)}
          detail={`${m.firstMatches}/${m.firstTargets} targets with clear pitch evidence`}
        />
        <Metric
          label="Median response"
          value={seconds(m.medianMs)}
          detail={`${m.timedTargets} measured targets · approximate`}
        />
        <Metric
          label="Targets matched"
          value={
            record.method === "microphone"
              ? `${m.matched}/${record.targetCount}`
              : "—"
          }
          detail="Unique targets with matched pitch"
        />
        <Metric
          label="Average response"
          value={seconds(m.meanMs)}
          detail="Excludes confirmation hold"
        />
      </div>
      <div className="outcome-totals">
        {[
          ["✓", "Matched", c.correct],
          ["×", "Wrong", c.wrong],
          ["?", "Unclear", c.unclear],
          ["↷", "Skipped", c.skipped],
          ["○", "Self-reported", c["self-reported"]],
        ].map(([icon, label, count]) => (
          <div key={label}>
            <span aria-hidden="true">{icon}</span>
            <strong>{count}</strong>
            <small>{label}</small>
          </div>
        ))}
      </div>
      {previous && m.medianMs !== null && previous.medianMs !== null && (
        <p className="comparison">
          {Math.abs((m.medianMs - previous.medianMs) / 1000).toFixed(2)}s{" "}
          {m.medianMs <= previous.medianMs ? "faster" : "slower"} than your
          previous comparable set. Read this alongside accuracy and the number
          of measured targets.
        </p>
      )}
      <details className="explanation">
        <summary>What these numbers mean</summary>
        <p>
          First-try match means the first scorable pitch attempt for a target
          matched. Unclear signals, silence and skips do not count as wrong
          notes. This is not a complete test of musical recall or technique.
        </p>
        <p>
          Retries: {m.retries} · 90th-percentile response: {seconds(m.p90Ms)}.
          Response times are approximate microphone estimates. Confirmation
          includes the stability hold; response does not.{" "}
          {record.mixedViews
            ? "Views changed during this set. Affected targets have no speed score and this set is excluded from prior-set comparisons."
            : "Comparisons require the same level, challenge, notation, view, hints and tonic."}
        </p>
        <p>
          Microphone pitch does not verify hand, finger, posture or hole
          placement. Silent practice is self-reported and has no pitch or
          playing-speed score.
        </p>
      </details>
    </>
  );
}
function Metric({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <div className="score">
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{detail}</small>
    </div>
  );
}
export function AttemptList({ record }: { record: SessionRecord }) {
  return (
    <ol className="attempt-list">
      {record.attempts.map((a, i) => (
        <li key={i}>
          <strong>
            Target {a.targetIndex + 1} ·{" "}
            {heardName(a.target, record.instrument, record.tonic)}
          </strong>
          <span>
            {a.outcome}
            {a.detected !== null
              ? ` · Heard ${heardName(a.detected, record.instrument, record.tonic)}`
              : ""}
          </span>
          {typeof a.responseMs === "number" && (
            <small>
              {seconds(a.responseMs)} response ·{" "}
              {seconds(a.confirmationMs ?? null)} confirmation
            </small>
          )}
        </li>
      ))}
    </ol>
  );
}
