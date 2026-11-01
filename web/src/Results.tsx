import { useEffect, useState } from "react";
import { counts, type SessionRecord } from "./history";
import { sessionMetrics, comparableResponse, attemptShares } from "./metrics";
import { MetricHelp } from "./MetricHelp";
import { isReflex } from "./reflex";
import { formatTime } from "./logic";
import { heardName } from "./bansuri";
import { instrumentName } from "./catalog";
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
  const reflex = isReflex(record.lessonId);
  const prior = history.find(
    (r) =>
      r.id !== record.id &&
      comparableResponse(record, r) &&
      sessionMetrics(r).correctMeanMs !== null,
  );
  const previous = prior ? sessionMetrics(prior) : null;
  const reason =
    record.method === "self-check"
      ? "Silent practice is self-reported; pitch and response time are not measured."
      : !reflex && record.responseProtocol !== "prompt-v2"
        ? "This saved set has no response measurements. New microphone sets can measure response with hints off."
        : m.correctTimed === 0
          ? "No eligible response samples: play a first-try correct note with hints off, without changing its view."
          : reflex
            ? "Random-note response estimate. Read speed together with first-try accuracy."
            : "Guided response estimate: the sequence can be anticipated. Use Note reflex to practise surprise-note responses.";
  return (
    <>
      <div className="result-banner">
        <span aria-hidden="true">{record.finished ? "✓" : "◷"}</span>
        <div>
          <h1 tabIndex={-1}>
            {record.finished
              ? "Set complete. Keep growing."
              : "A little practice counts."}
          </h1>
          <p>
            {instrumentName(record.instrument)} · {record.lessonTitle} ·{" "}
            {formatTime(record.seconds)}
          </p>
        </div>
      </div>
      {record.method === "microphone" ? (
        <div className="score-grid visual-scores">
          <AttemptRing correct={c.correct} wrong={c.wrong} />
          <Metric
            label="First-try match"
            value={percent(m.firstRate)}
            detail={
              m.firstTargets
                ? `${m.firstMatches}/${m.firstTargets} scorable targets`
                : "No clear pitch evidence"
            }
            help="How often your first detected attempt matched the target. Each target counts once. Unclear and skipped targets are separate; short sounds may be missed."
          />
          <Metric
            label="Response time"
            value={seconds(m.correctMeanMs)}
            detail={
              m.correctTimed
                ? `Average · ${m.correctTimed} first-try correct`
                : "Not measured in this set"
            }
            help={`Average time from the note appearing to your first-try correct note. Confirmation hold, retries, hints and changed views are excluded. Approximate and uncalibrated; device/audio delay remains.${m.correctTimed ? ` Middle response (median): ${seconds(m.correctMedianMs)}.` : ""}`}
          />
          <Metric
            label="Retries"
            value={`${m.retries}`}
            detail={`${m.recovered}/${m.initiallyWrong} wrong-first targets recovered`}
            help="Extra clear-pitch attempts after the first attempt at a target. Recovery means you matched a target after a wrong first attempt; it does not erase that first error."
          />
        </div>
      ) : (
        <p className="notice">
          ○ {c["self-reported"]} repetitions self-reported. No measured pitch
          score.
        </p>
      )}
      <p className="small muted timing-reason">{reason}</p>
      {record.method === "microphone" && m.correctTimed > 0 && (
        <p className="small muted">
          Approximate and uncalibrated; device/audio delay remains.
        </p>
      )}
      <div className="secondary-outcomes">
        <span>? {c.unclear} unclear</span>
        <span>↷ {c.skipped} skipped</span>
        {c["self-reported"] > 0 && (
          <span>○ {c["self-reported"]} self-reported</span>
        )}
      </div>
      {previous &&
        m.correctMeanMs !== null &&
        previous.correctMeanMs !== null &&
        Math.abs(m.correctMeanMs - previous.correctMeanMs) >= 10 && (
          <p className="comparison">
            Average correct response is{" "}
            {Math.abs(
              (m.correctMeanMs - previous.correctMeanMs) / 1000,
            ).toFixed(2)}
            s {m.correctMeanMs <= previous.correctMeanMs ? "faster" : "slower"}{" "}
            than your last comparable set. Read with accuracy and sample count.
          </p>
        )}
      <details className="explanation">
        <summary>How to read this report</summary>
        {record.method === "microphone" && (
          <p>
            {m.matched}/{record.targetCount} unique targets matched, including
            corrections. {percent(m.signalCoverage)} of planned targets had
            clear pitch evidence. The ring counts attempts, including retries,
            so its count can be higher than the number of targets. Its rounded
            percentages add to 100%. Unclear and skipped attempts are outside
            the ring.
          </p>
        )}
        <p>
          First-try accuracy, recovery and activity measure different things. A
          missed day does not prove lost skill. These measurements cannot
          determine talent, learning speed relative to other people, physical
          fingering, posture or tone quality.
        </p>
        <p>
          Response time uses first-try correct microphone evidence with hints
          off. Guided sequences and random reflex drills are different
          conditions; compare the same drill, view and settings. One small set
          is only a snapshot. Times exclude the confirmation hold and remain
          approximate and uncalibrated.
        </p>
      </details>
    </>
  );
}
function AttemptRing({ correct, wrong }: { correct: number; wrong: number }) {
  const shares = attemptShares(correct, wrong);
  const fraction = shares?.fraction ?? 0;
  return (
    <div className="score attempt-score">
      <div className="metric-heading">
        <span>Attempts</span>
        <MetricHelp label="Attempts">
          Matched and wrong attempts, including retries. Percentages use only
          clear detected attempts; unclear and skipped attempts are separate.
          These are pitch matches, not proof of technique.
        </MetricHelp>
      </div>
      <div
        className="attempt-ring"
        role="img"
        aria-label={
          shares
            ? `${correct} matched attempts (${shares.matched}%); ${wrong} wrong attempts (${shares.wrong}%).`
            : "No clear detected attempts."
        }
      >
        <svg viewBox="0 0 180 180" aria-hidden="true">
          <circle className="ring-track" cx="90" cy="90" r="83" />
          {shares && (
            <>
              <circle className="ring-wrong" cx="90" cy="90" r="83" />
              <circle
                className="ring-match"
                cx="90"
                cy="90"
                r="83"
                pathLength="100"
                strokeDasharray={`${fraction * 100} 100`}
                transform="rotate(-90 90 90)"
              />
            </>
          )}
        </svg>
        <div className="ring-values">
          <div className="positive">
            <small>Matched</small>
            <strong>{shares ? `${shares.matched}%` : "—"}</strong>
            <small>
              {correct} {correct === 1 ? "try" : "tries"}
            </small>
          </div>
          <div className="negative">
            <small>Wrong</small>
            <strong>{shares ? `${shares.wrong}%` : "—"}</strong>
            <small>
              {wrong} {wrong === 1 ? "try" : "tries"}
            </small>
          </div>
        </div>
      </div>
    </div>
  );
}
function Metric({
  label,
  value,
  detail,
  help,
}: {
  label: string;
  value: string;
  detail: string;
  help: string;
}) {
  return (
    <div className="score">
      <div className="metric-heading">
        <span>{label}</span>
        <MetricHelp label={label}>{help}</MetricHelp>
      </div>
      <strong>{value}</strong>
      <small>{detail}</small>
    </div>
  );
}
export function AttemptList({ record }: { record: SessionRecord }) {
  const [page, setPage] = useState(0);
  useEffect(() => setPage(0), [record.id]);
  const size = 12,
    pages = Math.max(1, Math.ceil(record.attempts.length / size));
  const symbols = {
    correct: "✓",
    wrong: "×",
    unclear: "?",
    skipped: "↷",
    "self-reported": "○",
  };
  return (
    <div className="attempt-flow">
      <ol className="attempt-list attempt-grid" start={page * size + 1}>
        {record.attempts.slice(page * size, (page + 1) * size).map((a, i) => (
          <li key={page * size + i} data-outcome={a.outcome}>
            <div className="attempt-heading">
              <span className="attempt-symbol" aria-hidden="true">
                {symbols[a.outcome]}
              </span>
              <time>{formatTime(a.seconds)}</time>
            </div>
            <strong>
              {heardName(
                a.target,
                record.instrument,
                record.tonic,
                record.notation,
              )}
            </strong>
            <span className="attempt-status">
              {a.outcome === "correct"
                ? "Matched"
                : a.outcome === "self-reported"
                  ? "Self-reported"
                  : a.outcome === "wrong"
                    ? "Wrong pitch"
                    : a.outcome === "skipped"
                      ? "Skipped"
                      : "Unclear"}
            </span>
            {a.detected !== null && a.outcome === "wrong" && (
              <span>
                Heard{" "}
                {heardName(
                  a.detected,
                  record.instrument,
                  record.tonic,
                  record.notation,
                )}
              </span>
            )}
            {typeof a.responseMs === "number" && (
              <small>
                {seconds(a.responseMs)} response ·{" "}
                {seconds(a.confirmationMs ?? null)} confirmed
              </small>
            )}
          </li>
        ))}
      </ol>
      {!record.attempts.length && <p>No attempts were recorded.</p>}
      {pages > 1 && (
        <nav className="pagination" aria-label="Attempt pages">
          <button disabled={page === 0} onClick={() => setPage((p) => p - 1)}>
            Previous attempts
          </button>
          <span role="status">
            {page + 1}/{pages}
          </span>
          <button
            disabled={page + 1 >= pages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next attempts
          </button>
        </nav>
      )}
    </div>
  );
}
