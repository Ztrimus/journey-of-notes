# Journey of Notes — durable product backlog

Owner: this repository. Updated 2026-11-01. This is the working source of truth for requests from the handoff, typed chat and voice session. Read it before planning or editing; update status and verification after each session. Do not silently drop deferred work. Status: TODO, IN PROGRESS, IMPLEMENTED (needs device trial), VERIFIED (named checks), DEFERRED.

## Default combined view — issue #34

- VIEW-04: Both is the default on initial load, instrument selection and each new preparation screen. Explicit view choices remain available. Supersedes the earlier music-sheet default. IMPLEMENTED; production build and preparation UI checked.

## Personal story and attribution — issue #32

- ABOUT-02: Refine the opening About story around the owner's joy in music/dance, learning, solo-practice feedback and riyaz; retain honest capability limits. IMPLEMENTED.
- ABOUT-03: Exact copyright “© 2026 Saurabh Zinjad”; X, LinkedIn and GitHub profile links beneath the story. VERIFIED at 320/390/1280px: exact destinations/text, 44px link targets, no horizontal overflow and visible ordered keyboard focus. Production/Pages build verified; deployment evidence belongs in the associated PR.

## Desktop skill-map sizing — issue #30

- UI-09: Remove the legacy narrow-path width cap from the skill board; let desktop cards fill the content width with content-sized automatic columns. IMPLEMENTED; existing mobile two-column/narrow one-column rules retained.
- QA-30: Browser widths 320, 390, 768, 1024, 1440 and 1920 checked: no horizontal overflow or clipped card content; board aligns with its summary. Wide desktop shows four columns, laptop three, tablet/phone two where space permits. Keyboard focus and preparation navigation checked. Production/Pages build and existing 59-test suite verified; release evidence belongs in the associated PR.

## Session closes immediately — issue #28

- AUDIO-04: Replace automatic set completion on microphone/audio interruption or page hiding with a recoverable pause and explicit Resume. IMPLEMENTED; target, attempts and active elapsed time retained, capture released during pause.
- AUDIO-05: Ignore delayed callbacks from stopped/older captures; detach listeners before releasing tracks. VERIFIED with lifecycle regression tests.
- TIME-03: Exclude interrupted unconfirmed targets from response timing; preserve accepted evidence and time later untouched targets. VERIFIED through a controlled three-note browser drill (3 matches, 2 eligible response samples).
- QA-28: 59 tests and production/Pages build; real local microphone stayed active beyond 17 seconds, plus controlled disconnect/audio-suspension/page-hide recovery, frozen timer, single final history entry and 390px recovery UI. See `verification.md`; real phone/browser and instrument latency calibration remain TODO. Release evidence belongs in the associated PR.

## Hover correction — issue #26

- UI-08: Remove hover lift/shadow from plain links (including brand/History), disclosure summaries and borderless text buttons. Keep bounded-control feedback, focus indicators and reduced-motion rules. IMPLEMENTED; scoped browser/build verification below and deployment evidence in the associated PR.

## Mobile density follow-up — issue #24

- HISTORY-03: Remove grid layout and switch; compact date-grouped timeline with clickable score circles/titles and retained instrument/evidence. IMPLEMENTED.
- ATTEMPTS-01: Shared circular note trail in history/results; visible time and outcome symbols, full heard-note/timing details on selection. IMPLEMENTED; microphone-only timing display, no self-report speed claim.
- HISTORY-04: Compact history heading/backup row; move storage help into disclosure and preserve clear safeguards. IMPLEMENTED.
- ACCESS-24: List semantics, full note/outcome names, keyboard selection and pagination focus. IMPLEMENTED; real phone/assistive-technology follow-up remains open.
- REFERENCE-24: Three design articles reviewed and applied; two YouTube pages opened but transcripts unavailable. DOCUMENTED in `compact-history-design.md`.
- QA-24: 54 tests/build passed; synthetic phone/desktop review and final confirmation recorded in `verification.md`. Associated PR carries Pages deployment evidence.

## Report/About follow-up — issue #22

- REPORT-04: Floating metric tooltips without card expansion. IMPLEMENTED; keyboard focus, click toggle, Escape and 320/390px positioning checked. Pointer-hover persistence and assistive technology remain manual device follow-up.
- REPORT-05: Compact matched/wrong ring among four primary cards; rounded shares total 100%. Unique-target count/coverage moved to explanation. IMPLEMENTED; zero/all-wrong/hinted/legacy/silent synthetic cases checked.
- RESPONSE-01: Always-visible average response card; new guided microphone capture with explicit protocol; first-try correct/unhinted/unchanged-cue evidence only. IMPLEMENTED; legacy data not backfilled; six added metric/import tests pass. Guided estimates remain distinct from random reflex; real instrument latency calibration TODO.
- ABOUT-01: Owner's music/dance story and share/copy controls; concise home device disclaimer. IMPLEMENTED; no automatic social posting.
- COPY-01: Remove public algorithm names/internal thresholds while retaining practical privacy/accuracy limits. IMPLEMENTED; public source remains inspectable.
- RELEASE-22: Pages candidate regenerated with this change; deployment evidence belongs in its associated PR. Research-only PR #20 remains separate, open and unmerged.

Read `report-response-decisions.md` for the definitions and research behind these changes. Earlier verification entries below describe earlier versions and are retained as history.

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
- UI-04: Secondary instrument navigation was implemented, then REMOVED at user request in issue #15; home remains the instrument hub.
- HELP-01: Plain-language detector/hold explanation and cents definition on preparation. IMPLEMENTED; explain directly in chat too.
- Terminology: Music sheet is the visible product label; internal staff identifiers remain compatible with saved records.

Public preview verified on 2026-10-31: https://ztrimus.github.io/journey-of-notes/practice/ (PR #12 merged). Published prototype is available without the laptop. Real-device acoustic/latency and assistive-technology checks remain open; advanced technique sensing, broader instruments and accounts/sync remain deferred.

## Preparation and evidence follow-up — issue #13

- UI-05: Remove redundant home scroll-only Choose your instrument CTA; keep direct instrument cards. IMPLEMENTED; release checks below.
- UI-06: Feedback and View share a responsive row at ordinary widths; stack only with insufficient container width. Challenge and bansuri notation retained. IMPLEMENTED.
- EVIDENCE-01: Voice/flute can pass piano pitch validation. Source recognition research and optional MIDI/timbre approach documented. PROPOSAL ONLY; user explicitly said do not implement this part.
- METRIC-02: Separate activity, first-detected-attempt quality, correct-response latency, recovery, delayed recall and evidence coverage. APPROVED/IMPLEMENTED in issue #15 for recent quality, correct response, recovery and coverage; delayed recall probes remain TODO.
- MAP-03: Compare adaptive horizontal skill board, grouped branches and swipe track; recommend wrapping board with labels under nodes and no separate arrow. APPROVED/IMPLEMENTED as a responsive repeatable skill board in issue #15.
- Read progress-and-map-proposal.md before any future scoring, source-recognition or map change; do not treat the proposal as implementation authorization.

## Public pilot follow-up — issue #15, 2026-11-01

| ID | User request | State |
|---|---|---|
| CUE-01 | Original six-hole bansuri diagram with dark closed/light open/half-hole guidance, register caveat | IMPLEMENTED; teacher/device trial pending |
| CUE-02 | Hand orientation and finger-specific cue | IMPLEMENTED as mirrored hand SVG + highlighted finger; no ambiguous/offensive emoji |
| UI-07 | Remove home-card arrows and secondary instrument bar; hover lift only on actions | IMPLEMENTED; fine-pointer and reduced-motion rules |
| REPORT-01 | Visual matched/wrong distribution, up to four primary metrics, secondary unclear/skips, metric help | IMPLEMENTED; synthetic/browser checked |
| REPORT-02 | Explain guided/silent/view/hint timing exclusions and median vs average | IMPLEMENTED; actual calibration TODO |
| REPORT-03 | Shared compact color+icon attempt grid, heard wrong note, pagination in history and results | IMPLEMENTED |
| HISTORY-01 | Export / Clear / Import; clear only app records with safe confirmation and error handling | IMPLEMENTED; unit storage checks and browser Cancel/Escape; no user data deleted |
| HISTORY-02 | Instrument labels, Grid/Timeline, six-set pagination, open saved full report | IMPLEMENTED |
| METRIC-03 | Quality ring with count and comparable conditions, separate recency/activity, no wrong-set growth or fabricated decay | IMPLEMENTED; not mastery certification |
| METRIC-04 | Personal improvement trend with evidence; no born-talent/fast-slow learner identity inference | IMPLEMENTED recent 30 vs prior 30 percentage-point change; aptitude labels intentionally excluded |
| RETENTION-01 | Fresh unhinted probes across days for retention, and note/register breakdown with adequate samples | TODO; not implied by recent quality ring |
| INSTRUMENT-01 | Guitar single-note starter and string/fret prompts; standard tuning, no chords/low E2 | IMPLEMENTED pilot; sounding-pitch sheet explicitly labeled |
| INSTRUMENT-02 | Flute family → Hindustani bansuri / Western C concert flute | IMPLEMENTED, limited Western starter drills |
| INSTRUMENT-03 | Vocal pitch starters, comfortable starting note, Western/Sargam, gentle/rest guidance | IMPLEMENTED pilot; instructor/real-voice trials TODO |
| LAUNCH-01 | Public pilot readiness, social draft, real instrument/device and latency test instructions | DOCUMENTED in pilot-launch-plan.md; tests require owner/testers |
| ANALYTICS-01 | Multiple lightweight visitor/funnel/replay/feedback options and recommended minimal events | RESEARCH COMPLETE; provider/account/consent setup pending, nothing activated |
| IDENTITY-01 | Google login and database tradeoffs | RESEARCH COMPLETE; optional Firebase Auth + Firestore recommended later, not implemented |
| BRAND-01 | Saurabh Zinjad copyright/creator credit, About/Feedback/Privacy | IMPLEMENTED; feedback uses public GitHub Issues (account required) |
| NAV-01 | Repeat / Next skill / Practice map after a set | IMPLEMENTED; next opens preparation, no auto-start; last skill has no next |

No social posts, analytics/replay scripts, OAuth projects, database accounts or microphone recording uploads were created. No private contact address was published. Source recognition remains deferred as instructed earlier. The user approved performance-ring improvements; this supersedes issue #13's proposal-only boundary for quality display and skill board, not its source-classifier boundary.

- VOCAL-02: Optional reference-tone playback/ear-training. TODO: design it so the microphone cannot score speaker playback as the learner; suppress validation and timing while reference audio and its room tail play. Current vocal starters can begin from the learner’s own detected comfortable hum.

## Active drill controls — issue #17, 2026-11-01

- DRILL-01: Gentle green/rose full-viewport glow for confirmed matched/wrong microphone events. IMPLEMENTED: low-opacity one-second fade, pulses at least 1.2s apart; fast events coalesce. No unclear/silent/self-report glow. Optional preparation checkbox; reduced motion uses a static edge cue.
- DRILL-02: One-tap Music sheet / Keyboard (instrument-specific cue) / Both pills inside active drill. IMPLEMENTED with native radio inputs, visible selected/focus state and keyboard arrow navigation. Preparation retains its compact selector.
- DRILL-03: Show/Hide hint inside sheet-mode drill, revealing note/octave for the current target. IMPLEMENTED: next target restores the preparation preference. Hint/view changes invalidate the current target's response/confirmation times, preserve pitch outcomes, retain per-attempt metadata and mark mixed conditions.
- DRILL-QA: Build/46 tests; 320×740 and 390×844 silent UI, keyboard focus, hint reset and synthetic production-component glow checked. Live microphone effect integration, actual phones and reduced-motion OS/assistive-technology matrix remain manual follow-up.

Cue changes preserve the target validator’s hold/dedup state: changing a view or revealing a hint must not manufacture another wrong event for the same sustained note. Target advancement still resets validation.
