import { useId } from "react";
import type { Target } from "./curriculum";
import { guitarFinger, guitarPosition, guitarStrings } from "./guitar";

export function GuitarTab({ target }: { target: Target }) {
  const id = useId();
  const position = guitarPosition(target);
  if (!position)
    return <p className="small">No TAB position available for this note.</p>;
  return (
    <svg
      className="guitar-tab"
      viewBox="0 0 330 128"
      role="img"
      aria-labelledby={id}
    >
      <title id={id}>
        TAB: string {position.string},{" "}
        {position.fret === 0 ? "open" : `fret ${position.fret}`}.{" "}
        {guitarFinger(target)}. Thinnest string at the top.
      </title>
      {guitarStrings.map((s, i) => (
        <g key={s.string}>
          <text x="8" y={22 + i * 19} fontSize="12" fill="currentColor">
            {["e", "B", "G", "D", "A", "E"][i]}
          </text>
          <line
            x1="32"
            x2="315"
            y1={18 + i * 19}
            y2={18 + i * 19}
            stroke="currentColor"
            strokeWidth={s.string === position.string ? 2 : 1}
            opacity={s.string === position.string ? 1 : 0.35}
          />
          {s.string === position.string && (
            <>
              <rect
                x="151"
                y={8 + i * 19}
                width="28"
                height="20"
                fill="#f6f5ee"
              />
              <text
                x="165"
                y={24 + i * 19}
                textAnchor="middle"
                fontSize="19"
                fontWeight="700"
                fill="currentColor"
              >
                {position.fret}
              </text>
            </>
          )}
        </g>
      ))}
    </svg>
  );
}
