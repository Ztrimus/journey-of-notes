import { useEffect, useState } from "react";
import { counts, type SessionRecord } from "./history";
import { sessionMetrics, comparable } from "./metrics";
import { formatTime } from "./logic";
import { heardName } from "./bansuri";
import { instrumentName } from "./catalog";
const percent = (n: number | null) =>
  n === null ? "No evidence" : `${Math.round(n * 100)}%`;
const seconds = (n: number | null) =>
  n === null ? "Not measured" : `${(n / 1000).toFixed(2)}s`;
export function Results({
  record,
  history,
}: {
  record: SessionRecord;
  history: SessionRecord[];
}) {
  const c = counts(record.attempts),
    m = sessionMetrics(record),
    scored = c.correct + c.wrong;
  const prior = history.find(
    (r) =>
      r.id !== record.id &&
      comparable(record, r) &&
      sessionMetrics(r).correctMedianMs !== null,
  );
  const previous = prior ? sessionMetrics(prior) : null;
  const reason =
    record.method === "self-check"
      ? "Silent practice is self-reported; pitch and speed are not measured."
      : !/[pfvgw]0$/.test(record.lessonId)
        ? "This guided drill measures pitch, not surprise-note response speed. Try Note reflex for timed recall."
        : record.mixedViews
          ? "Changing the view omits timing for affected targets."
          : "Speed needs first-try correct microphone responses with hints off. Device delay remains uncalibrated.";
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
        <>
          <div
            className="outcome-graphic"
            role="img"
            aria-label={`${c.correct} matched attempts and ${c.wrong} wrong attempts; ${c.unclear} unclear, ${c.skipped} skipped.`}
          >
            <div className="outcome-key">
              <span className="positive">
                ✓ <strong>{c.correct}</strong> matched attempts{" "}
                {scored ? `· ${Math.round((c.correct / scored) * 100)}%` : ""}
              </span>
              <span className="negative">
                × <strong>{c.wrong}</strong> wrong{" "}
                {scored ? `· ${Math.round((c.wrong / scored) * 100)}%` : ""}
              </span>
            </div>
            <div className="outcome-bar" aria-hidden="true">
              {scored ? (
                <>
                  <span
                    className="match-fill"
                    style={{ width: `${(c.correct / scored) * 100}%` }}
                  />
                  <span
                    className="wrong-fill"
                    style={{ width: `${(c.wrong / scored) * 100}%` }}
                  />
                </>
              ) : (
                <span className="no-fill" />
              )}
            </div>
            <small>
              Percentages of clear detected attempts, including retries.
            </small>
          </div>
          <div className="score-grid visual-scores">
            <Metric
              label="First-try match"
              value={percent(m.firstRate)}
              detail={`${m.firstMatches}/${m.firstTargets} scorable targets`}
              help="The first stable detected pitch per target matched. Short wrong sounds may be missed. Unclear/skipped targets are reported separately; this is not anatomical technique or innate ability."
            />
            <Metric
              label="Targets matched"
              value={`${m.matched}/${record.targetCount}`}
              detail="Including corrected targets"
              help="Each target counts once if its pitch was eventually matched, even after retries. A matched target can still have a wrong first attempt."
            />
            <Metric
              label="Retries"
              value={`${m.retries}`}
              detail={`${m.recovered}/${m.initiallyWrong} wrong-first targets recovered`}
              help="Extra clear-pitch attempts after the first for a target. Recovery is a target initially wrong and later matched; it does not erase the first error."
            />
            {m.correctMedianMs !== null ? (
              <Metric
                label="Typical response"
                value={seconds(m.correctMedianMs)}
                detail={`${m.correctTimed} first-try correct targets`}
                help={`Median means the middle response after sorting. It is less affected by one long pause than an average. Confirmation hold is excluded. Approximate, uncalibrated. Average for these correct responses: ${seconds(m.correctMeanMs)}.`}
              />
            ) : (
              <Metric
                label="Pitch coverage"
                value={percent(m.signalCoverage)}
                detail="Targets with clear evidence"
                help="Targets with a correct or wrong stable detected attempt divided by all planned targets in the set, including an unfinished set. Missing evidence is not evidence of a wrong note."
              />
            )}
          </div>
        </>
      ) : (
        <p className="notice">
          ○ {c["self-reported"]} repetitions self-reported. No measured pitch
          score.
        </p>
      )}
      <p className="small muted timing-reason">{reason}</p>
      <div className="secondary-outcomes">
        <span>? {c.unclear} unclear</span>
        <span>↷ {c.skipped} skipped</span>
        {c["self-reported"] > 0 && (
          <span>○ {c["self-reported"]} self-reported</span>
        )}
      </div>
      {previous &&
        m.correctMedianMs !== null &&
        previous.correctMedianMs !== null &&
        Math.abs(m.correctMedianMs - previous.correctMedianMs) >= 10 && (
          <p className="comparison">
            Typical correct response is{" "}
            {Math.abs(
              (m.correctMedianMs - previous.correctMedianMs) / 1000,
            ).toFixed(2)}
            s{" "}
            {m.correctMedianMs <= previous.correctMedianMs
              ? "faster"
              : "slower"}{" "}
            than your last comparable set. Read with accuracy and sample count.
          </p>
        )}
      <details className="explanation">
        <summary>How to read this report</summary>
        <p>
          First-try accuracy, recovery and activity measure different things. A
          missed day does not prove lost skill. These measurements cannot
          determine talent, learning speed relative to other people, physical
          fingering, posture or tone quality.
        </p>
        <p>
          Timing appears only for random reflex sets with eligible microphone
          evidence. Guided drills have known targets; silent clicks are not
          playing speed. Changed views and note hints can exclude samples.
        </p>
      </details>
    </>
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
        <details className="metric-help">
          <summary aria-label={`About ${label}`} title={`About ${label}`}>
            i
          </summary>
          <p>{help}</p>
        </details>
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
