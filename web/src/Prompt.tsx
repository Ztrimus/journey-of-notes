import type { Target } from "./curriculum";
import { noteName } from "./pitch";
import { staffGeometry, type DisplayMode } from "./reflex";
import { swarForMidi } from "./bansuri";
function Keyboard({ target }: { target: number }) {
  const base = Math.floor(target / 12) * 12;
  return (
    <svg
      viewBox="0 0 280 110"
      role="img"
      aria-labelledby="keyboard-title"
      className="keyboard"
    >
      <title id="keyboard-title">
        {noteName(target)} highlighted on the piano keyboard
      </title>
      {[0, 2, 4, 5, 7, 9, 11].map((n, i) => (
        <g key={n}>
          <rect
            x={i * 40 + 1}
            y="1"
            width="38"
            height="105"
            rx="3"
            fill={base + n === target ? "#c4d7ba" : "#fff"}
            stroke="#65766a"
          />
          <text
            x={i * 40 + 20}
            y="91"
            textAnchor="middle"
            fontSize="13"
            fill="#24352d"
          >
            {noteName(base + n).slice(0, -1)}
          </text>
          {base + n === target && (
            <circle cx={i * 40 + 20} cy="72" r="4" fill="#254e3c" />
          )}
        </g>
      ))}
      {[
        { n: 1, x: 31 },
        { n: 3, x: 71 },
        { n: 6, x: 151 },
        { n: 8, x: 191 },
        { n: 10, x: 231 },
      ].map(({ n, x }) => (
        <rect
          key={n}
          x={x}
          y="1"
          width="18"
          height="62"
          rx="2"
          fill={base + n === target ? "#648954" : "#24352d"}
        />
      ))}
    </svg>
  );
}
function Staff({ target }: { target: number }) {
  const { clef, y, ledgers, sharp } = staffGeometry(target);
  return (
    <div className="staff-wrap">
      <svg
        viewBox="0 0 300 175"
        role="img"
        aria-labelledby="staff-title"
        className="staff"
      >
        <title id="staff-title">
          {noteName(target)} quarter note in {clef} clef
        </title>
        {[50, 65, 80, 95, 110].map((line) => (
          <line
            key={line}
            x1="24"
            x2="280"
            y1={line}
            y2={line}
            stroke="#59665e"
            strokeWidth="1.3"
          />
        ))}
        <text
          x="29"
          y={clef === "treble" ? 110 : 94}
          fontSize={clef === "treble" ? 83 : 62}
          fontFamily="Apple Symbols, Noto Music, serif"
          fill="#24352d"
        >
          {clef === "treble" ? "𝄞" : "𝄢"}
        </text>
        {ledgers.map((line) => (
          <line
            key={line}
            x1="143"
            x2="180"
            y1={line}
            y2={line}
            stroke="#24352d"
            strokeWidth="1.5"
          />
        ))}
        {sharp && (
          <text x="125" y={y + 6} fontSize="28" fill="#24352d">
            ♯
          </text>
        )}
        <ellipse
          cx="161"
          cy={y}
          rx="10"
          ry="7"
          transform={`rotate(-18 161 ${y})`}
          fill="#24352d"
        />
        <line
          x1={y <= 80 ? 152 : 170}
          x2={y <= 80 ? 152 : 170}
          y1={y}
          y2={y + (y <= 80 ? 43 : -43)}
          stroke="#24352d"
          strokeWidth="2"
        />
      </svg>
      <span className="help">
        {clef === "treble" ? "Treble clef" : "Bass clef"}
      </span>
    </div>
  );
}
export function TargetDisplay({
  target,
  instrument,
  display,
  hints,
  notation = "western",
  tonic = 60,
  compact = false,
}: {
  target: Target;
  instrument: string;
  display: DisplayMode;
  hints: boolean;
  notation?: "western" | "sargam";
  tonic?: number;
  compact?: boolean;
}) {
  const name = noteName(target.midi);
  const showNames = display !== "staff" || hints;
  return (
    <>
      <div className="cue-strip" role="group" aria-label="Practice target">
        {instrument === "piano" && (
          <>
            <div>
              <span className="cue-icon" aria-hidden="true">
                🖐️
              </span>
              <small>Hand</small>
              <strong>
                {compact
                  ? target.hand === "Left"
                    ? "L"
                    : target.hand === "Right"
                      ? "R"
                      : "—"
                  : target.hand || "Either"}
              </strong>
            </div>
            <div>
              <span className="cue-icon" aria-hidden="true">
                ☝️
              </span>
              <small>Finger</small>
              <strong>{target.finger || "Any"}</strong>
              <span className="cue-caption">
                {target.finger
                  ? ["", "Thumb", "Index", "Middle", "Ring", "Little"][
                      target.finger
                    ]
                  : "Comfortable"}
              </span>
            </div>
          </>
        )}
        {showNames && (
          <>
            <div>
              <span className="cue-icon" aria-hidden="true">
                🎹
              </span>
              <small>Octave</small>
              <strong>{name.slice(-1)}</strong>
            </div>
            <div className="cue-note">
              <span className="cue-icon" aria-hidden="true">
                ♪
              </span>
              <small>{instrument === "flute" ? "Swar" : "Note"}</small>
              <strong>{target.swar || name.slice(0, -1)}</strong>
              {target.swar && <span className="cue-caption">{name}</span>}
            </div>
          </>
        )}
      </div>
      {display !== "keyboard" &&
        (instrument === "flute" && notation === "sargam" ? (
          <Sargam target={target.midi} tonic={tonic} />
        ) : (
          <Staff target={target.midi} />
        ))}
      {display !== "staff" && instrument === "piano" && (
        <Keyboard target={target.midi} />
      )}
      {!compact && instrument === "flute" && (
        <p className="flute-context">
          Pitch follows your selected Sa. Hole placement and breathing technique
          remain your own check.
        </p>
      )}
    </>
  );
}

function Sargam({ target, tonic }: { target: number; tonic: number }) {
  const swar = swarForMidi(target, tonic);
  const plain = swar.name.replace("Komal ", "").replace("Tivra ", "");
  return (
    <div className="sargam-sheet">
      <svg viewBox="0 0 300 170" role="img" aria-labelledby="sargam-title">
        <title id="sargam-title">
          {swar.register} {swar.name}, {swar.pitch}, relative to Sa{" "}
          {noteName(tonic)}
        </title>
        {Array.from({ length: Math.min(3, Math.abs(swar.octave)) }, (_, i) => (
          <circle
            key={i}
            cx={150 + (i - (Math.min(3, Math.abs(swar.octave)) - 1) / 2) * 15}
            cy={swar.octave > 0 ? 28 : 131}
            r="3.5"
            fill="currentColor"
          />
        ))}
        <text
          x="150"
          y="104"
          fontSize="68"
          textAnchor="middle"
          fontFamily="Georgia,serif"
          fill="currentColor"
        >
          {plain}
        </text>
        {swar.name.startsWith("Komal") && (
          <line
            x1="110"
            x2="190"
            y1="116"
            y2="116"
            stroke="currentColor"
            strokeWidth="2"
          />
        )}
      </svg>
      <span className="small">
        {swar.register} register
        {swar.name.startsWith("Tivra") ? " · Tivra Ma" : ""}
      </span>
    </div>
  );
}
