# Journey of Notes — durable product backlog

Owner: this repository. Updated 2026-10-31. This is the working source of truth for requests from the handoff, typed chat and voice session. Read it before planning or editing; update status and verification after each session. Do not silently drop deferred work. Status: TODO, IN PROGRESS, IMPLEMENTED (needs device trial), VERIFIED (named checks), DEFERRED.

## Execution order

1. P0: protect data, establish a clear mobile flow and honest measurement.
2. P0: bansuri setup/notation and practice clarity.
3. P1: results, local activity tracking and safe backups.
4. P1: real-device audio/pitch/latency evaluation and a free HTTPS release.
5. P2: expand lessons/instruments and advanced evidence methods.

## P0 — current iteration

| ID | Request / acceptance criterion | Status |
|---|---|---|
| FLOW-01 | Home → instrument → visual skill map → preparation → focused session → results; one primary task per screen, browser Back works | IMPLEMENTED (device checks pending; see verification.md) |
| FLOW-02 | Mobile-first session fits ordinary phone screens without excessive scrolling; no settings/history/sidebar in active practice | IMPLEMENTED (device checks pending; see verification.md) |
| VIEW-01 | Label Music sheet, default on; optional Key diagram/Both; compact switch remains usable during a set | IMPLEMENTED (device checks pending; see verification.md) |
| VIEW-02 | Compact cue L/R → finger number → octave → note with supplementary visual hints; preserve key highlighting | IMPLEMENTED (device checks pending; see verification.md) |
| VIEW-03 | Red/green feedback also has distinct icon/shape and accessible text; show progress and heard note, move count totals to results | IMPLEMENTED (device checks pending; see verification.md) |
| RECALL-01 | Random recall has no upcoming-note preview or placeholder; only reveal target on presentation | IMPLEMENTED (device checks pending; see verification.md) |
| RECALL-02 | Explain Easy=C4/D4/E4 right thumb, Medium=C4–G4 fingers1–5, Hard=C3–G5 and hand changes | IMPLEMENTED (device checks pending; see verification.md) |
| TIME-01 | Keep estimated response separate from confirmation hold; never score self-check click speed | IMPLEMENTED (25 tests; live calibration pending) |
| TIME-02 | Changing view mid-target removes that target from response comparison; store per-attempt view/hints to avoid mixing conditions | IMPLEMENTED (device checks pending; see verification.md) |
| AUDIO-01 | Explain getUserMedia → local Web Audio samples → YIN-style pitch → confidence → target/hold validation; explain missed fast/wrong notes and single-note limit | IMPLEMENTED (device checks pending; see verification.md) |
| AUDIO-02 | Default microphone, request permission only following explicit user Start/Detect; keep optional silent practice and permission-denied fallback | IMPLEMENTED (device checks pending; see verification.md) |
| BANSURI-01 | Default bansuri music sheet uses Sa/Re/Ga/Ma/Pa/Dha/Ni with lower/middle/upper register; optional Western sheet remains possible | IMPLEMENTED (device checks pending; see verification.md) |
| BANSURI-02 | Heard note shows relative swar/register plus Western pitch; include altered swars where relevant | IMPLEMENTED (device checks pending; see verification.md) |
| BANSURI-03 | Tonic setup: manual chromatic note choice or play a demonstrated middle Sa for stable candidate; learner confirms; Start disabled with visible reason until ready | IMPLEMENTED (device checks pending; see verification.md) |
| BANSURI-04 | Interpret tuner screenshots conditionally: C#5 563.8Hz (+29c), G4 390.9Hz (-5c). Do not infer flute scale without Sa fingering/register evidence | IMPLEMENTED (device checks pending; see verification.md) |
| DATA-01 | Preserve prior browser history and evidence categories through redesign; storage failure must be visible, no silent loss | IMPLEMENTED (device checks pending; see verification.md) |
| QA-01 | Unit/integration logic, build, 320/390px UI, navigation/focus, notation, results, history; report unrun live microphone/AT checks | VERIFIED scoped build/34 tests and phone-width UI; remaining device/AT checks below |

## P1 — product usefulness and release

| ID | Request / acceptance criterion | Status |
|---|---|---|
| MAP-01 | Visual connected skill nodes with real recent-practice activity, per-node repetition indicator; not a mastery certificate or fabricated skill-decay score | IMPLEMENTED (device checks pending; see verification.md) |
| METRIC-01 | Correct/wrong/unclear/skipped/self-reported, first-try match, coverage, response median/mean/p90, retries and comparable prior-set change; no unsupported composite score | IMPLEMENTED (device checks pending; see verification.md) |
| DATA-02 | Local-first prototype, latest 100 sessions and export; add validated merge import so local data can move to hosted origin | IMPLEMENTED (device checks pending; see verification.md) |
| DATA-03 | Revisit IndexedDB for larger history and accounts/database only when cross-device synchronization is needed | DEFERRED |
| HOST-01 | Recommend free HTTPS static hosting; prepare relative/subpath build; preserve existing Pages privacy-policy URL | IMPLEMENTED (device checks pending; see verification.md) |
| HOST-02 | Publish source/deploy, verify HTTPS microphone and mobile Safari/Chrome before announcing public availability | PUBLISHED — HTTPS page/assets checked; real mobile/audio trial pending |
| AUDIO-03 | Evaluate labeled real flute/piano notes, noise/harmonics/decay, false accepts/rejects, 60ms analysis spacing, timing bias and latency; remove unreliable speed claims | TODO |
| ACCESS-01 | Manual screen-reader, keyboard-only, zoom/text-spacing checks and real phones/tablets | TODO |

## P2 — retained ideas and future architecture

| ID | Request / acceptance criterion | Status |
|---|---|---|
| ARCH-01 | Small instrument registry; separate curriculum, pitch analysis, validation, metrics, persistence and UI; keep future guitar/Western flute possible without implementing them prematurely | IMPLEMENTED (device checks pending; see verification.md) |
| MAP-02 | Evaluate retention tests to model maintenance/decay; any recency fade must be labeled activity, never proof of lost skill | DEFERRED |
| SKILL-01 | Bansuri: first clear sound/embouchure → swar changes/holes → sargam → registers → patterns → articulation; technique stages require human evidence | DEFERRED — initial measured drills exist; full instruction needs review |
| SKILL-02 | Piano: note location → hand/finger prompts → patterns/scales → reading/rhythm → separate/together hands → pieces; repeatable at every proficiency | IMPLEMENTED (initial drills); full syllabus DEFERRED |
| TECH-01 | Explore camera/teacher review, MIDI limits, instrument sensors/capacitive holes, wearable/contact sensing; phone tapping does not prove which finger played an external instrument | IMPLEMENTED research notes; hardware/camera DEFERRED |
| RHYTHM-01 | Audio-clock rhythm exercises, rests/durations and latency calibration; timed double/triple/quadruple speed later | DEFERRED |
| POLY-01 | MIDI/polyphonic validation for chords and simultaneous hands; microphone monophonic scoring cannot certify these | DEFERRED |
| CONTENT-01 | Both supplied PDFs and every available Bill Hilton handout reviewed; original scores not redistributed. Exact handwriting/video demonstrations/instructor review remain pending | VERIFIED (21 handouts/66 pages + supplied14 pages); videos DEFERRED |
| AUTH-01 | Personal GitHub Ztrimus only; per-command credentials, signed commits when requested; no global auth/config change | VERIFIED previously; recheck before publication |
| LEGACY-01 | Preserve original Android dirty tree, prior icon/dependency changes, existing privacy policy and signing material; no branch cleanup/history rewrite/key rotation without separate scope | ONGOING |

## Decisions carried forward

- No Expo in the browser application. Local-only React/TypeScript/Vite trial so far; no paid build platform.
- Practice is a gym: repeatable skills and sets, not permanent chapter completion.
- Acoustic pitch is evidence about sound, never hand/finger/posture/hole verification.
- Default notation follows the instrument: Western sheet for piano, sargam sheet for Indian bansuri.
- Shape/icons/text accompany colors; visual speed must not remove nonvisual access.
- Local-first history is appropriate while the training loop is being proven. Data does not automatically follow between browser profiles/devices/origins.
- No generic sleep-style overall score until its formula and measurement reliability are defensible.
- Keep the app fast through bounded work, simple modules and measured profiling; do not add speculative infrastructure for hypothetical instruments.

## Personal product scope — user correction, 2026-10-31

Journey of Notes is independent of UOPX. Apply public web/accessibility standards and musician-centered consumer UX; no company mission, branding, institutional education model, internal policy or corporate approval processes. General techniques may be reused on their merits. This instruction governs the current redesign and future work. The curriculum is a repeatable musician's practice structure, not an institutional course.

## Phone-access and clarity follow-up — 2026-10-31

- RELEASE-01: Publish the prototype on existing personal GitHub Pages, preserving privacy-policy URLs. VERIFIED: public URL and assets return HTTP 200, Pages built release 7a7b188.
- UI-04: Piano / Flute (Bansuri) navigation plus More instruments soon on non-session pages; active sets stay focused. IMPLEMENTED.
- HELP-01: Plain-language detector/hold explanation and cents definition on preparation. IMPLEMENTED; explain directly in chat too.
- Terminology: Music sheet is the visible product label; internal staff identifiers remain compatible with saved records.

Public preview verified on 2026-10-31: https://ztrimus.github.io/journey-of-notes/practice/ (PR #12 merged). Published prototype is available without the laptop. Real-device acoustic/latency and assistive-technology checks remain open; advanced technique sensing, broader instruments and accounts/sync remain deferred.

## Preparation and evidence follow-up — issue #13

- UI-05: Remove redundant home scroll-only Choose your instrument CTA; keep direct instrument cards. IMPLEMENTED; release checks below.
- UI-06: Feedback and View share a responsive row at ordinary widths; stack only with insufficient container width. Challenge and bansuri notation retained. IMPLEMENTED.
- EVIDENCE-01: Voice/flute can pass piano pitch validation. Source recognition research and optional MIDI/timbre approach documented. PROPOSAL ONLY; user explicitly said do not implement this part.
- METRIC-02: Separate activity, first-detected-attempt quality, correct-response latency, recovery, delayed recall and evidence coverage. PROPOSAL ONLY; no scoring or map growth formula changed.
- MAP-03: Compare adaptive horizontal skill board, grouped branches and swipe track; recommend wrapping board with labels under nodes and no separate arrow. PROPOSAL ONLY; agree metrics/layout before implementation.
- Read progress-and-map-proposal.md before any future scoring, source-recognition or map change; do not treat the proposal as implementation authorization.
