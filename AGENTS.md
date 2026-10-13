# Journey of Notes — AGENTS.md

Project-level memory for AI coding agents. Update this file whenever a significant architectural decision is made or a future sprint is scoped.

---

## Development Workflow — Non-Negotiable Rules

**Rule: Issue-first, always.** No branch, no code, no commit without a GitHub Issue first.

### Step-by-step

```
1. Create GitHub Issue
   → comprehensive title + description + acceptance criteria
   → add appropriate label (feature / bug / chore / ci/cd / refactor / documentation)

2. Create branch from main
   → naming: <type>/#<issue-id>/<short-description>
   → examples: feat/#4/piano-note-detection
               fix/#7/countdown-bar-flicker
               ci/#9/release-signing

3. Do the work, commit (conventional commits)

4. Push + open PR
   → first line of PR body: Closes #<issue-id>
   → PR is auto-assigned to you + auto-labelled from branch prefix

5. Merge PR → issue closes automatically
```

### Keywords that auto-close an issue on merge (GitHub)

Any of these in the **PR body** (not commit message) will close the issue when merged to the default branch:
`Closes`, `Close`, `Closed`, `Fixes`, `Fix`, `Fixed`, `Resolves`, `Resolve`, `Resolved`
(case-insensitive, followed by `#<issue-id>`)

### PR automation (`.github/workflows/pr-automation.yml`)

Fires on every PR `opened` / `reopened`:
- **Auto-assigns** PR to the author
- **Auto-labels** from branch prefix:

| Branch prefix | Label |
|---|---|
| `feat/` | `feature` |
| `fix/` | `bug` |
| `ci/` | `ci/cd` |
| `chore/` | `chore` |
| `docs/` | `documentation` |
| `refactor/` | `refactor` |

---

## Project Overview

**Repo:** `journey-of-notes`
**Type:** Expo / React Native monorepo
**Instruments supported:**

| Instrument | App location | Status |
|---|---|---|
| Bamboo Flute | `flute-tempo-trainer/` | Active — tempo trainer with beat accuracy & onset detection |
| Piano | `flute-tempo-trainer/app/piano/` | Active — random note exercise (Sprint 1) |

---

## Architecture

Single Expo app (`flute-tempo-trainer/`) serving both instruments via expo-router:

```
app/
  _layout.tsx            ← Root layout — fires useUpdateCheck on cold start
  index.tsx              ← Instrument hub (Flute / Piano)
  session.tsx            ← Flute session screen
  summary.tsx            ← Flute session summary
  piano/
    index.tsx            ← Piano home (exercise menu)
    random-notes.tsx     ← Random note exercise
hooks/
  useUpdateCheck.ts      ← GitHub Releases update checker (Android only, silent fail)
types/
  index.ts               ← Shared / flute types
  piano.ts               ← Piano-specific types & constants
.github/
  workflows/
    release-android.yml  ← CI/CD: push to main → expo prebuild → Gradle → GitHub Release
```

---

## CI/CD — Android Release Pipeline

**No EAS. No Expo account. No paid services.**

Trigger: push to `main` when `app.json` version is bumped.

Flow:
1. `expo prebuild --platform android` generates `android/` (gitignored, generated fresh each run)
2. `./gradlew assembleDebug` builds a debug-signed APK
3. `softprops/action-gh-release` creates a GitHub Release with the APK attached

Only secret needed: `GITHUB_TOKEN` — auto-provided by GitHub Actions.

**To release a new version:**
```sh
# 1. Bump both fields in flute-tempo-trainer/app.json
#    "version": "1.0.1"
#    "android": { "versionCode": 2 }
# 2. Push to main
git push origin main
```

**To upgrade to release-signed APK (Play Store, future):**
See comments in `.github/workflows/release-android.yml` — keystore setup is documented there.

---

## Piano — Key Constants

Defined in `types/piano.ts`. Change here to affect all piano screens.

| Constant | Value | Meaning |
|---|---|---|
| `PIANO_NOTE_INTERVAL_MS` | `2000` | Milliseconds between each random prompt during the exercise |
| `TOTAL_COMBINATIONS` | `840` | 2 hands × 5 fingers × 7 octaves × 12 notes |

---

## Backlog / Future Sprints

### 🎹 Sprint 2 — Note Detection (Audio Matching)

**Summary:** After the app shows a prompt (e.g. *B4, Right hand, Finger 2*), detect whether the user actually plays that note on the piano and report accuracy.

**What this requires:**
- Microphone audio capture (already available via `expo-av` used in flute trainer)
- Pitch detection algorithm — identify the fundamental frequency of the played note
  - Candidate: `YIN` or `MPM` algorithm (both implementable in JS/TS)
  - Map frequency → note + octave (A4 = 440 Hz, standard MIDI frequency formula)
- Compare detected note against the prompt: exact match / wrong note / no note detected
- Display result feedback per prompt (✓ correct / ✗ wrong note label / — not played)
- Aggregate accuracy % after session ends

**Hand / finger detection is out of scope for Sprint 2** — cannot be detected from audio alone; would require a camera/vision model in a later sprint.

**Files to create/modify:**
- `utils/pitchDetection.ts` — pitch → note/octave logic
- `hooks/usePitchListener.ts` — microphone listener returning detected `NotePrompt`-compatible values
- `app/piano/random-notes.tsx` — wire in detection result, show feedback overlay per prompt
- `types/piano.ts` — add `NoteDetectionResult` type

**Reference prior art:** `hooks/useAudioListener.ts` and `utils/onsetDetection.ts` (built for flute) — reuse the `expo-av` recording pattern.

---

### 🎹 Sprint 3 — Session Stats for Piano

Track and display per-session stats after the random note exercise:
- Total prompts shown
- Notes attempted (detected vs skipped)
- Accuracy by hand / octave / note
- Slowest notes (where user consistently hesitates)

---

### 🎹 Sprint 4 — Configurable Exercise Settings

Allow user to set before starting an exercise:
- `PIANO_NOTE_INTERVAL_MS` override (currently hardcoded to 2000ms)
- Filter combinations: e.g. right hand only, specific octave range, natural notes only
- Shuffle vs. systematic coverage (guarantee all 840 before repeating)
