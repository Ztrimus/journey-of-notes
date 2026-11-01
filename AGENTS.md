# Journey of Notes — AGENTS.md

**Read first:** This is an independent personal music-practice product. Use public standards and musician-centered UX, not UOPX institutional policies or branding. Read `web/docs/TASKS.md` for the live priorities and `web/docs/product-decisions.md` for current decisions before changing the browser app. The latest user instructions supersede older prototype notes below.

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

6. Run post-merge cleanup (from repo root):
   ./scripts/post-merge.sh
   → confirms PR merged, deletes remote + local branch, switches to main, pulls latest
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

## Browser feasibility experiment — issue #11

`web/` is a standalone React + TypeScript + Vite prototype with no Expo or React Native dependency. The existing Android app remains in `flute-tempo-trainer/`. This is an experiment, not a completed migration. Browser audio uses Web Audio scheduling and optional local microphone analysis; amplitude onsets are experimental and do not measure pitch or accuracy. Login remains deferred. The user authorized a public experimental browser preview on 2026-10-31; retain visible audio/latency limitations while device trials remain pending. See `web/README.md` for checks and scope.

### Guided learning follow-up — issue #11

The browser experiment now includes six piano and six flute sequences, large note/key prompts, a self-check path, experimental monophonic microphone pitch validation, and local per-attempt history/export. Read `web/docs/learning-blueprint.md`, `web/docs/source-review.md`, and `web/docs/verification.md` before extending the syllabus or scoring. Keep correct/wrong/unclear/skipped/self-reported outcomes distinct. Audio never proves hand, finger, posture, hole placement or breath technique. The current build does not score rhythm or chords. Flute tonic is learner-configured and requires confirmation before microphone practice. Final pedagogy and real-instrument accuracy remain unverified.

### Repeatable-level and recall update

The user replaced the chapter model with repeatable practice levels. Read `web/docs/reflex-practice.md` for the latest behavior: a random recall level per instrument with constrained difficulty, hand/finger/octave/note cue, keyboard/staff/both views, and optional note hints. Upcoming recall targets stay hidden. Microphone recall attempts record approximate response and confirmation durations separately; self-check clicks never count as playing speed. Old history remains compatible. Do not describe the timing as calibrated reaction time or infer physical fingering correctness.

## Personal-project boundary — explicit user direction

Journey of Notes is an independent personal music-practice product owned by Ztrimus. It is not a University of Phoenix application or institutional education product. Its audience, visual design, language, pedagogy and product goals are musicians' practice needs; do not import UOPX branding, mission, curriculum assumptions, internal policies, team consultations, release gates, or corporate approval workflows. Use public standards and evidence-based web practice (semantic HTML, WCAG 2.2 accessibility guidance, platform documentation, and appropriate consumer-product UX). A bundled skill's organization-specific defaults are not project policy. Reuse a sound general technique only on its merits. Preserve this repository's independently stated personal GitHub/issue/signing rules and never alter global/work authentication for it.

### Phone-access release follow-up — 2026-10-31

Use Music sheet as the visible label; staff is only an internal notation/history identifier. Keep Piano / Flute (Bansuri) / More instruments soon navigation on non-session pages. The requested public preview lives under docs/practice, preserving legacy privacy-policy URLs; rebuild web/dist and copy its contents there for release. This static app uploads no microphone audio and stores history only in the visitor’s browser. Real-device accuracy and timing calibration remain pending.

### Evidence/map discussion boundary — issue #13

Read `web/docs/progress-and-map-proposal.md` before changing progress, recall scoring, connectors, map geometry or acoustic source recognition. These are proposals awaiting product decisions. The user explicitly said not to implement instrument recognition now and asked to decide metrics and map direction before implementation. Issue #13 only fixes the redundant home CTA and Feedback/View layout. Preserve the distinction between activity, measured pitch performance, recall and physical technique.

### Public pilot expansion — issue #15, 2026-11-01

The user approved performance-based rings and requested visual reports/history, instrument starters and launch research. Current implementation supersedes the proposal-only quality/map boundary above: rings show up to 30 comparable first-detected-attempt outcomes with count, recency/activity remain separate, connectors no longer imply quality growth. Correct-response timing only uses first-try correct unhinted microphone evidence. No skill decay or born-talent/fast-slow learner labels. Delayed recall needs deliberate future probes.

Registry modes: piano, flute (legacy ID for Hindustani bansuri), western-flute (C concert), guitar, vocal. Preserve old history IDs/schema. New modes are limited single-note pilot drills, not validated courses. Guitar avoids low E2/chords and labels sounding-pitch sheet convention; vocals require comfortable range and no health assessment. Native SVG guidance never proves physical technique or sound source.

History clear is app-key-only and requires an explicit user confirmation; never erase actual user records in QA. Use isolated QA origins/fixtures. No third-party analytics/replay, OAuth or cloud sync until the owner chooses a personal provider/project and privacy behavior. Read web/docs/pilot-launch-plan.md for exact research/testing and web/docs/TASKS.md for retained work.

### Active feedback controls — issue #17

Use native-radio pills only in active practice; keep keyboard focus in the controls when views/hints change, and focus the prompt on a new target. Live hints apply to the current target and reset to setup preference on advancement. Store initial and per-attempt hint conditions separately; any current-target cue change invalidates its earlier/later timing while preserving pitch evidence. Mixed-cue sets are not comparable baselines.

Feedback glow is decorative, low-opacity, one-second, rate-limited/coalesced and only triggered by clear matched/wrong microphone events. Keep existing status/icon feedback; respect reduced motion and allow disabling the glow in preparation. Never add rapid saturated full-screen flashing. Temporary synthetic QA fixtures must not be published or write to real-user history.

### Bansuri domain knowledge and creative planning — issue #19

Read `web/docs/bansuri-foundations.md`, `web/docs/bansuri-practice-plan.md` and the current research section in `web/docs/TASKS.md` before extending bansuri guidance, drills, diagrams or assessment. All 11 supplied Divine Bansuri lesson transcripts were reviewed; the source manifest records 21 tracks with 10 identical alternate pairs. Captions are not watched/listened demonstrations. Keep source teaching, our proposed design and validated measurement distinct. Do not reproduce the full subtitle collection in the public repository.

Treat first-sound production, sustained tone, hole changes, named-pitch tuning, registers, partial holes, patterns, pulse and expression as distinct repeatable skills. Pitch/periodicity alone does not verify crystal-clear tone, breath technique, hole sealing or sound source. The current first-match note validator does not measure an entire sustained tone or connected transitions. Tone-window/transition evaluators, scoring and curricula in issue #19 remain proposals, not shipped features.

Retain three-hole middle Sa. The teacher's temporary six-hole Sa exercise is explicitly abandoned in lesson 6; all-open is Tivra Ma, Shuddha Ma requires partial-hole guidance, and Pa has register-specific alternatives. Review audio/video and instructor evidence before exact grip, partial-hole or ornament instructions. A count of closed holes cannot represent every fingering mask. Preserve the legacy `flute` identity/history and separate future tone evidence from pitch/reflex metrics.

Accepted owner requirement: both hand orientations, **left hand nearest the blowing hole by default**, with an option for right hand nearest. Describe physical hand position rather than infer it from dominant hand. This selector is not yet implemented. Mirror hand placement without reversing hole numbering or changing acoustic meaning.

This is an early creative product process: maintain the durable task list, share progress/next steps, and ask a focused question when a material architecture, pedagogy, physical-guidance or metric ambiguity remains. State a recommendation and its evidence; continue independent research/documentation while awaiting input. Do not invent certainty or add approval gates for routine reversible work. The current task produced research/proposals only; it did not change or deploy the app.
