import { viewLabels } from "./viewLabels";
import type { DisplayMode } from "./reflex";
import type { GlowSignal } from "./practiceFeedback";
export function ViewPills({
  value,
  onChange,
  instrument,
  disabled = false,
}: {
  value: DisplayMode;
  onChange: (value: DisplayMode) => void;
  instrument: string;
  disabled?: boolean;
}) {
  const labels = viewLabels(instrument);
  return (
    <fieldset className="view-pills" disabled={disabled}>
      <legend className="sr-only">Prompt view</legend>
      <div className="pill-options">
        {(
          [
            ["staff", labels.sheet],
            ["keyboard", labels.diagram],
            ["both", "Both"],
          ] as const
        ).map(([mode, label]) => (
          <label key={mode}>
            <input
              type="radio"
              name="session-prompt-view"
              value={mode}
              checked={value === mode}
              onChange={() => onChange(mode)}
            />
            <span>{label}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
export function FeedbackWash({ signal }: { signal: GlowSignal | null }) {
  return signal ? (
    <div
      key={signal.id}
      className={`feedback-wash feedback-wash-${signal.tone}`}
      aria-hidden="true"
    />
  ) : null;
}
