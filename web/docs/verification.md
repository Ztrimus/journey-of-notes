# Verification and remaining evidence

## Performed

- `npm run build`: TypeScript check and production bundle passed after the final changes.
- `npm test`: 17 tests passed. Coverage includes common sample rates, exercise pitch/octave range, added harmonics, silence/DC/noise rejection, confidence gating, sustained-note deduplication, retries, drifting/sharp intonation, missing analysis frames, synthetic-wave-to-attempt flow, corrupt local-history schema handling, curriculum bounds, denial messaging, and releasing a stream granted after cancellation.
- `git diff --check`: passed.
- `openspec validate guided-practice-validation --strict`: passed.
- Desktop browser QA at a separate origin (`127.0.0.1:5174`): completed the three-target self-check chapter, confirmed three self-reports with zero measured matches and no assigned accuracy; inspected per-target attempts; reloaded and verified persistence; exported JSON and checked its three distinct target indexes/outcomes; skipped a target and ended another sequence early, confirming one skip and incomplete status.
- Responsive QA: inspected desktop and narrow rendering. At a requested 320px viewport, document scroll width equaled available client width (305px after the browser scrollbar), with no horizontal overflow. Chapter picker starts collapsed at narrow widths. Final representative screenshot saved separately with the deliverables.
- Reviewed native control labels, heading hierarchy, status/error semantics, key-image accessible title, visible focus CSS, and outcome text. This is scoped implementation review, not complete accessibility certification.
- Source review: both supplied PDFs (14 pages total); all 21 available course handouts (66 pages), text plus visual overviews. Original video content was not reviewed.

QA test records are on port 5174, separate from the user-facing port 5173 preview. The prototype is not deployed.

## Limits and manual checks

Automatic approval review blocked a browser action that could start microphone mode because microphone access was not explicitly authorized. No live microphone permission or real-instrument accuracy test was completed. Synthetic tests are a safe alternative for code-level verification; they do not establish acoustic accuracy. The flute tonic confirmation branch is source-implemented but was not verified in a live microphone browser flow.

Still test real acoustic/digital piano and flute notes on iPhone/iPad Safari, Android Chrome and desktop, using headphones and varied rooms. Include device audio processing, instrument decay, harmonics, octave confusions, low-volume attacks, ambient noise, permission grant/denial, start/stop/restart, hiding the tab, input revocation, screen locking and Bluetooth latency. Measure false accepts/rejects and unscorable rates against labeled examples before promoting this as reliable validation.

Screen-reader operation, full keyboard traversal, 200%/400% zoom, text-spacing overrides, denied-storage/quota-error browser flows, and page-hidden/interruption flows need manual verification. Use public accessibility standards for this personal product. No company-policy compliance claim applies.

The syllabus is an editable first proposal, not instructor-approved content. Source-image exercise ambiguities and specific flute fingering conventions remain documented in the blueprint/source review. Timed rhythm, chord validation, two-hand simultaneity, staff reading, advanced ornamentation, accounts and cross-device history are planned, not implemented.

## Repeatable-level, notation and timing follow-up

The updated production build and 25 tests pass. The additional tests cover constrained random pools and non-repeats, treble/bass placement and ledger lines, separation of response and confirmation time, first-wrong versus later-correct responses, exclusion of self-check/unclear timing, and backward-compatible history metadata.

Desktop browser checks confirmed staff-only mode without visible note-name hints, combined staff/keyboard rendering, revealed prompt visibility and focus on start, random advancement and unscored self-check summaries. Phone-width checks found no horizontal overflow at a requested 320px viewport. Screenshot saved as a separate deliverable. No live microphone permission was requested; actual acoustic response timing remains uncalibrated. See `reflex-practice.md` for the new seven-level-per-instrument practice model.

## Mobile-flow release candidate — 2026-10-31

- Production build and all 34 tests pass. New coverage includes relative bansuri swars/registers, stable/noisy/reset tonic sampling, response/first-try metrics, timing invalidation, activity days, backup merge/deduplication, hash routes and reusable pitch buffers. OpenSpec strict validation also passed.
- Browser UI checks used isolated origins 5174 in the previous session and 5175 in the release session, separate from user preview 5173. No microphone was activated or permission granted.
- At 390×844, inspected home, connected maps, preparation defaults, focused session and results. At 320×740, both piano and bansuri combined-view sessions had scrollWidth=clientWidth=320 and scrollHeight=viewportHeight=740.
- Bansuri preparation defaulted to Music sheet/Sargam/Microphone. Start was disabled before Sa confirmation and enabled after confirmation. C♯5 is among the manual options. Silent mode was explicitly selected before starting all UI-only drills.
- Switching live View worked and displayed timing exclusion. A marked bansuri repetition appeared as one self-report with no measured accuracy/speed. Browser Back from a piano set returned to preparation and saved an interrupted history record. Previous-session checks verified reload persistence and backup import; those were not repeated in this release session.
- New non-session instrument navigation exposes Piano, Flute · Bansuri and More instruments soon. Active practice omits this navigation. The preparation disclosure explains detection and cents.
- Screenshot: mobile-practice-preview.png in outputs. This uses a silent UI trial, not proof of acoustic correctness.
- Live acoustic accuracy, timing calibration, real mobile Safari/Chrome, assistive technology, storage quota/denial and the full manual accessibility matrix remain pending.

The public Pages release was verified on 2026-10-31: https://ztrimus.github.io/journey-of-notes/practice/. PR #12 merged as 7a7b188b0ff8287dc224370d8ed08de0d886bb42. GitHub Pages reports built for that commit. Public HTML, JS, CSS, existing Android privacy policy and new browser privacy page all returned HTTP 200. The public browser rendered the home and piano map over HTTPS. No public microphone access was activated. Existing main/docs Pages source and Android privacy-policy URLs are retained; browser-specific privacy information is separate.

Release preparation uses `npm run build:pages`, which replaces only docs/practice and preserves the root and policy pages. Personal Git transport uses a per-command gh helper; repository-local signing settings match the original personal checkout. Global Git/authentication settings are unchanged.

## Preparation layout follow-up — issue #13

- Production build, 34 existing tests and whitespace checks pass. This is a layout-only change; no new tests mirror CSS/source structure.
- Direct home Piano selection reached the map; the redundant Choose your instrument scroll-only button is removed. Desktop hero spacing is shorter.
- On preparation, Feedback and View share the same y coordinate at the default wide viewport and requested 390px viewport (375px client width with the vertical scrollbar). At requested 320px (305px client width), they stack. In both cases scrollWidth equals clientWidth. The breakpoint follows container width, including text-size effects.
- Reflex Challenge remains available above Feedback/View. Bansuri Notation remains available below them, default Sargam and disabled unconfirmed-Sa Start preserved. Native labels/control semantics inspected; no microphone action was invoked.
- Screenshot: preparation-layout-preview.png in outputs. Full assistive-technology and real mobile browser testing remain pending.
- Source-recognition, quality-score and map proposals are documentation only. `activity()`, pitch validation and map geometry were not changed.

## Visual public pilot — issue #15, 2026-11-01

- Production build and 41 tests pass (34 existing + 7 focused pilot tests). Added tests cover first-wrong recovery vs first-try-correct speed, zero-success vs missing evidence, comparable quality windows capped at 30 unique targets, no calendar-based accuracy decay, all registry routes/curricula/history IDs, guitar/flute synthesized note range, six-hole/half-hole bansuri guidance and app-key-only storage deletion/failure propagation.
- QA uses 127.0.0.1:5181. Fourteen synthetic sessions were imported through the UI, separately from the user's public origin and history. Example report screenshots are synthetic, not acoustic or user-performance evidence.
- Checked home instrument cards with no arrow or secondary navbar, flute subtype choice, bansuri setup/Hole diagram/Both and three-closed-hole Sa guidance. Silent bansuri and guitar combined sessions fit requested 390×844 with document/client width 390 and scrollHeight 844.
- Checked Western C flute B4 sheet and vocal comfortable-pitch gating, manual C4 confirmation and Sargam display, plus L/finger 5/little-finger piano prompt. All live UI session starts explicitly selected Silent practice first; no microphone permission was granted.
- Synthetic full report showed 10 matched attempts/4 wrong, 60% first-try targets, 10/10 eventually matched, four recoveries and 1.33s typical correct response. At requested 1280px, four metric columns appeared; at 320px, two columns and expanded metric help fit 305px client width (scrollbar) with no horizontal overflow. Mean/median help and wrong heard pitch were inspected.
- Attempt cards showed chronological times and outcomes and paginated from 1/2 to 2/2. History displayed instrument labels, six sets per page and Grid/Timeline controls. At requested 390px, grid had two columns without overflow. Saved reports open from history. Public-origin records were not imported or deleted.
- Clear History dialog has visible name and safe initial Keep history focus. Escape dismissed it and returned focus to Clear history; Cancel path preserved 15 QA records. Actual confirm deletion was not clicked in browser; storage deletion/failures are unit-tested with a synthetic store. Native modal focus containment, successful-delete focus successor, screen-reader behavior and storage-failure announcements need complete manual/real-device verification. No full accessibility-conformance claim.
- Hover lift applies only to enabled actions on fine hover pointers; display-only cards/SVGs have no lift and reduced motion disables transforms. This is source-reviewed; touch/mouse/assistive-technology matrix remains pending.
- App has no source classifier, analytics/replay SDK, login, cloud sync, chord/rhythm scoring, biological talent inference, or validated tone/technique assessment. The earlier source-classification discussion remains deferred. Recent quality rings replace activity-fill rings; instructor/real-device testing remains open. New instrument modes are labeled limited pilots, with guitar concert-pitch notation explicitly disclosed.
- Read `pilot-launch-plan.md` for primary research references, launch readiness, analytics/Google auth tradeoffs and the owner's real-note/phone/latency protocol. GitHub Pages/public-asset smoke verification is performed separately after publication.

Final issue #15 review also checked chronological history normalization for imported/device timestamps and session-level hint exclusions for legacy timing metadata. History Timeline and Older sets navigation showed six items on page 2; no user data was removed.

## Active feedback and hint controls — issue #17

- Build and 46 tests pass. Five new tests cover clear-event-only glow, coalescing/interval/reset, cue-change timing invalidation preserving other targets/pitch evidence, and per-attempt hints overriding initial preferences while old hinted timings stay excluded.
- Isolated QA origin 5182, no real microphone permission granted. Native-radio pills selected on click and ArrowRight; active radio retained keyboard focus rather than the prompt stealing it. Hints showed/hid octave/note and reset to preparation preference on advancement. Silent results remain unscored.
- Phone-width checks: combined view at 320×740 had scrollWidth=clientWidth=320 and scrollHeight=740; 390×844 also fit. Saved screenshot drill-controls-preview.png shows the new sheet/hint/pill layout.
- A temporary synthetic page rendered the production FeedbackWash and FeedbackGlowGate with explicit match/wrong buttons. Checked full viewport 1280×720 dimensions, correct green / wrong rose backgrounds, one-second animation, pointer-events:none and automatic element clearing. This was a simulated event check, not live acoustic feedback evidence. The fixture was removed and is not part of the release.
- Peak background blends with the existing muted text color were calculated at approximately 4.60:1 (green) and 4.53:1 (rose); this is a scoped color check, not whole-product accessibility certification. No saturated full-intensity flash is used. Reduced-motion rule replaces animation with an edge cue; actual OS preference and full assistive-technology behavior need manual trials. Existing textual/icon feedback remains available.
- Session history stores initial hint preference plus per-attempt changes. A revealed/hidden current target remains excluded from speed; pitch outcomes are retained. Future targets restore setup hints. Mixed-cue sets remain excluded from comparable baselines. Older schemas stay readable.

Cue changes preserve the target validator’s hold/dedup state: changing a view or revealing a hint must not manufacture another wrong event for the same sustained note. Target advancement still resets validation.


## Report and About follow-up — issue #22

- Unit suite: 52 tests pass, including six new tests for response mean/median, first-try exclusions and deduplication, old guided history, timing-protocol imports/comparisons and balanced ring rounding. Existing permission-release/audio/validator tests remain passing.
- Isolated local preview uses synthetic records and production report components, without modifying public-origin history or requesting microphone access. Guided, legacy, random, all-wrong, empty, hinted and silent reports were inspected.
- Requested viewport checks: 320×740 and 390×844 two-column report, 1280×900 four-column report; no horizontal overflow. Tooltips stayed inside the phone viewport, card-grid height was identical before/after opening (352.78125px at 390px), Escape retained trigger focus, Tab opened the next metric help, and click toggling/outside interactions worked. Browser console returned no warning/error logs.
- Actual About route includes the owner's story, current capability/privacy limits and share controls. Copy-post action displayed success. Native system-share UI and actual social posting were not exercised.
- No full accessibility certification: pointer-hover traversal, screen reader announcements, real phone browsers/text zoom, live instrument accuracy and latency calibration remain manual follow-up. Temporary QA entry points/records must be removed before building Pages.


## Compact timeline and circular attempts — issue #24

- 54 tests passed, including two local-calendar-day grouping cases covering midnight/month/year boundaries, empty/partial pages and preservation of source records. Production TypeScript/Vite and Pages builds passed. No measurement or history-schema changes.
- A temporary local-only bootstrap seeded eight explicitly synthetic sessions on isolated 127.0.0.1:5194 only if its history key was empty. Public history was not written, imported or cleared. No microphone permission was requested. The bootstrap is removed before the Pages build.
- Bounded visual review covered requested 320×740, 390×844 and 1280×900 viewports. No horizontal overflow. At 390px ten attempts fit two rows of 56px note circles; at 320px they wrap into three rows; desktop fits ten in one row. The collapsed phone history shows four sample sessions within its viewport. Backup controls remain at least 44px tall.
- Wrong G4 selection revealed heard F4; a matched note revealed separate response/confirmation times. Bansuri circles retained swar and Western pitch, with full register accessible in details. Both history and actual results routes used the shared attempt component. Clear History opened its existing safe confirmation and Keep History preserved the fixture. History/attempt pagination worked; final confirmation showed focus on attempt 13 after Next and on the first new date heading after Older sets.
- Final keyboard/click/320px confirmation and console checks found no errors/warnings. Native ordered lists carry explicit list roles for Safari's list-style behavior. Actual phone browsers, screen readers and text-zoom checks remain manual follow-up. No social/analytics/recording behavior changed.
- Impeccable mechanical detector ran once. It flagged the existing .notice border-left declaration, unchanged by this task; no new component finding was reported. This is not an accessibility or design-quality certification.
- Local screenshots: journey-history-mobile.jpg and journey-attempts-mobile.jpg in the workspace outputs directory; synthetic data, not real performance evidence.


## Flat text hover — issue #26

An isolated native-element preview verified actual :hover states for the brand link, History link, report summary, Back link, quiet action and history title: each computed transform and box-shadow was none. Bordered button/card controls still computed a -2px lift and the existing soft shadow. Keyboard Tab retained a 3px focus outline. At 390px the hovered summary stayed flat with no horizontal overflow. Existing fine-pointer and reduced-motion guards remain in CSS; no OS reduced-motion or assistive-technology check was run. No records or microphone access were used. The temporary preview is removed before Pages packaging. Production/Pages build and the existing 54-test suite pass; deployment evidence is in the associated PR.
