import type { CSSProperties } from "react";
import type { Lesson } from "./curriculum";
import type { SessionRecord } from "./history";
import { activity } from "./metrics";
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
    <ol className="skill-map">
      {levels.map((level, i) => {
        const a = activity(history, level.id);
        const circumference = 2 * Math.PI * 27;
        return (
          <li
            key={level.id}
            style={{ "--connection": `${a.lineWidth}px` } as CSSProperties}
          >
            <button className="skill-node" onClick={() => onChoose(level)}>
              <span className="skill-ring">
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
                    stroke="#315f43"
                    strokeWidth="4"
                    strokeDasharray={`${a.ring * circumference} ${circumference}`}
                    transform="rotate(-90 32 32)"
                  />
                </svg>
                <span>{String(i + 1).padStart(2, "0")}</span>
              </span>
              <span className="skill-label">
                <strong>{level.title}</strong>
                <small>
                  {a.recentSets
                    ? `${a.recentSets} ${a.recentSets === 1 ? "set" : "sets"} this week · ${a.activeDays}/7 active days`
                    : "Ready for a little practice"}
                </small>
              </span>
              <span className="node-arrow" aria-hidden="true">
                ↗
              </span>
            </button>
          </li>
        );
      })}
    </ol>
  );
}
