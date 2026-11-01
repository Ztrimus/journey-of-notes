import type { Lesson } from "./curriculum";
import type { SessionRecord } from "./history";
import { activity, skillEvidence } from "./metrics";
export function ActivityMap({
  levels,
  history,
  onChoose,
}: {
  levels: Lesson[];
  history: SessionRecord[];
  onChoose: (level: Lesson) => void;
}) {
  return (
    <ol className="skill-map skill-board">
      {levels.map((level, i) => {
        const a = activity(history, level.id),
          e = skillEvidence(history, level.id);
        const c = 2 * Math.PI * 27;
        return (
          <li key={level.id}>
            <button className="skill-node" onClick={() => onChoose(level)}>
              <span
                className={`skill-ring ${e.rate === null ? "no-evidence" : e.rate < 0.5 ? "needs-practice" : ""}`}
              >
                <svg viewBox="0 0 64 64" aria-hidden="true">
                  <circle
                    cx="32"
                    cy="32"
                    r="27"
                    fill="none"
                    stroke="#d8dfd0"
                    strokeWidth="3"
                  />
                  <circle
                    cx="32"
                    cy="32"
                    r="27"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="4"
                    strokeDasharray={`${(e.rate ?? 0) * c} ${c}`}
                    transform="rotate(-90 32 32)"
                  />
                </svg>
                <span>
                  {e.rate === null ? "—" : `${Math.round(e.rate * 100)}%`}
                </span>
              </span>
              {e.rate !== null && (
                <meter
                  className="sr-only"
                  min="0"
                  max="1"
                  value={e.rate}
                  aria-label={`${level.title}, first detected attempt match`}
                  aria-valuetext={`${Math.round(e.rate * 100)}%`}
                />
              )}
              <span className="skill-label">
                <small className="skill-index">
                  {String(i + 1).padStart(2, "0")} ·{" "}
                  {/0$/.test(level.id) ? "Recall" : "Pitch practice"}
                </small>
                <strong>{level.title}</strong>
                <small>
                  {e.n
                    ? `${e.correct}/${e.n} first-try matches · recent sample`
                    : "No measured pitch evidence yet"}
                </small>
                <small>
                  {a.activeDays}/7 active days
                  {e.last
                    ? ` · checked ${new Date(e.last).toLocaleDateString()}`
                    : ""}
                </small>
                {e.response !== null && (
                  <small>
                    {(e.response / 1000).toFixed(2)}s typical correct response
                  </small>
                )}
                {e.delta !== null && (
                  <small>
                    {e.delta >= 0 ? "+" : ""}
                    {Math.round(e.delta * 100)} percentage points vs previous 30
                  </small>
                )}
              </span>
            </button>
          </li>
        );
      })}
    </ol>
  );
}
