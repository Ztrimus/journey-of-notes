import { bansuriHoles } from "./visualModels";
import { useId } from "react";
export const fingerNames = ["", "Thumb", "Index", "Middle", "Ring", "Little"];
export function HandCue({
  hand,
  finger,
}: {
  hand?: "Left" | "Right";
  finger?: number;
}) {
  const id = useId();
  return (
    <svg
      className="hand-cue"
      viewBox="0 0 140 125"
      role="img"
      aria-labelledby={id}
    >
      <title id={id}>
        {hand || "Either"} hand
        {finger ? `, ${fingerNames[finger]} highlighted` : ""}
      </title>
      <g
        transform={hand === "Left" ? "translate(140 0) scale(-1 1)" : undefined}
        fill="#e1e7db"
        stroke="#315f43"
        strokeWidth="3"
      >
        <rect x="43" y="55" width="73" height="60" rx="22" />
        {[1, 2, 3, 4, 5].map((n) =>
          n === 1 ? (
            <path
              key={n}
              d="M48 100 L21 72 Q12 58 24 54 Q31 52 39 63 L57 79 Z"
              fill={finger === 1 ? "#315f43" : "#e1e7db"}
            />
          ) : (
            <rect
              key={n}
              x={44 + (n - 2) * 18}
              y={[0, 0, 20, 8, 18, 35][n]}
              width="17"
              height={72 - [0, 0, 20, 8, 18, 35][n]}
              rx="8"
              fill={finger === n ? "#315f43" : "#e1e7db"}
            />
          ),
        )}
      </g>
    </svg>
  );
}
export function BansuriDiagram({
  target,
  tonic,
}: {
  target: number;
  tonic: number;
}) {
  const id = useId();
  const fingering = bansuriHoles(target, tonic);
  if (!fingering)
    return <p className="small">No fingering diagram for this altered swar.</p>;
  const { closed, half } = fingering;
  const description = `Holes numbered from the blowing end. ${closed ? `Holes 1 to ${closed} closed.` : "No fully closed holes."} ${half ? "Hole 1 half covered." : ""} Remaining holes open.`;
  return (
    <div className="bansuri-diagram">
      <svg viewBox="0 0 350 90" role="img" aria-labelledby={id}>
        <title id={id}>{description}</title>
        <rect
          x="8"
          y="23"
          width="334"
          height="38"
          rx="18"
          fill="#e7cfa0"
          stroke="#836a41"
          strokeWidth="2"
        />
        <circle cx="37" cy="42" r="9" fill="#58482f" />
        {Array.from({ length: 6 }, (_, i) => (
          <g key={i}>
            <circle
              cx={92 + i * 43}
              cy="42"
              r="12"
              fill={i < closed ? "#243c2d" : "#fffdf6"}
              stroke="#243c2d"
              strokeWidth="2"
            />
            {half && i === 0 && (
              <path d="M92 30 A12 12 0 0 0 92 54 Z" fill="#243c2d" />
            )}
            <text
              x={92 + i * 43}
              y="81"
              textAnchor="middle"
              fontSize="12"
              fill="#243c2d"
            >
              {i + 1}
            </text>
          </g>
        ))}
      </svg>
      <small>
        ● Closed · ○ Open{half ? " · ◐ Half covered" : ""} · blowing end on left
      </small>
      <small>
        Three-hole Sa convention. Register also needs breath control; confirm
        your flute’s fingering.
      </small>
    </div>
  );
}
export function GuitarDiagram({
  string = 1,
  fret = 0,
}: {
  string?: number;
  fret?: number;
}) {
  const id = useId();
  return (
    <svg
      className="guitar-diagram"
      viewBox="0 0 330 130"
      role="img"
      aria-labelledby={id}
    >
      <title id={id}>
        Standard tuning, string {string}, {fret === 0 ? "open" : `fret ${fret}`}
        . Thinnest string is 1.
      </title>
      <rect x="32" y="12" width="275" height="106" fill="#ead9b9" />
      {[0, 1, 2, 3, 4].map((n) => (
        <line
          key={n}
          x1={45 + n * 60}
          x2={45 + n * 60}
          y1="12"
          y2="118"
          stroke="#7e715c"
          strokeWidth={n === 0 ? 5 : 2}
        />
      ))}
      {[1, 2, 3, 4, 5, 6].map((n) => (
        <g key={n}>
          <line
            x1="32"
            x2="307"
            y1={18 + (n - 1) * 19}
            y2={18 + (n - 1) * 19}
            stroke={n === string ? "#315f43" : "#807968"}
            strokeWidth={n === string ? 3 : 1}
          />
          <text x="15" y={22 + (n - 1) * 19} fontSize="10">
            {n}
          </text>
        </g>
      ))}
      <circle
        cx={fret === 0 ? 34 : 45 + (fret - 0.5) * 60}
        cy={18 + (string - 1) * 19}
        r="7"
        fill="#315f43"
      />
    </svg>
  );
}
