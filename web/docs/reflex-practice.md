# Repeatable practice levels and note-response trials

## Product model

The latest user direction replaces chapter completion with a practice-gym model. Every level remains available; a finished set is a repetition, not permanent completion or mastery. Both piano and flute now have a random recall level followed by the six earlier skill drills. Existing drill IDs and recorded results are preserved.

The first recall level generates ten targets for each set, with no immediate same-pitch repeats. Easy piano uses right thumb and C4/D4/E4; medium uses the C4–G4 five-finger position; hard mixes left C3–G3 and right C4–G4/C5–G5 positions, with suggested fingers. Easy flute uses Sa/Re/Ga, medium adds Ma/Pa, and hard spans Sa to upper Sa. These are constrained practice choices, not certified difficulty standards.

## Prompt choices

The default compact cue reads **hand → finger → octave → note**, following the user's final requested order. Decorative visual cues support persistent text labels and finger numbers. The note remains visually prominent. A highlighted piano key is preserved.

Music sheet is the default. Choose Music sheet, the instrument diagram, or Both before a set or through the active drill pills. Sheet-only mode hides visible note/octave answers by default, with optional note-name hints. Staff placement uses scientific pitch notation, automatic treble/bass clef, ledger lines and sharp signs; clef does not determine hand. Quarter notes identify pitch here, not a timed rhythm requirement. The staff image has a descriptive accessible name. View and hint changes invalidate timing for the affected target while preserving pitch evidence; the next target restores the setup hint preference.

Random recall hides the upcoming target. The first actual target is revealed only after starting. On start and target changes the prompt is brought into view and receives programmatic focus. This avoids timing from a note that is above the viewport while the learner is looking at the Start button.

## Response timing and limits

Unhinted microphone attempts in new guided and random sets store two approximate durations:

- **Response:** estimated first frame of the eventually classified note candidate, relative to prompt presentation. This excludes the confirmation hold.
- **Confirmation:** time until the stable pitch/hold classification is produced. This includes the hold and processing delay.

The visual baseline uses two animation-frame callbacks following the prompt state update and scroll/focus. Browser callbacks are not direct measurements of photons appearing on a display. The input baseline uses the first stable pitch-candidate timestamp; it is not a calibrated physical key-press or precise acoustic-attack sensor. Microphone buffering, frame sampling, display refresh, scheduling and pitch confidence add delay. The app labels these estimates as approximate and uncalibrated.

New sets marked `responseProtocol: prompt-v2` capture guided responses as well as random recall. Guided sequences can be anticipated, so their response estimates are never called surprise-note reflex scores. Older guided records without this marker retain no response score; nothing is backfilled. Signals observed before the presentation baseline, unclear audio, skipped targets and self-report button presses do not acquire instrument response scores.

Each attempt retains response and confirmation durations. The report shows the average among first-try correct, unhinted microphone targets with unchanged cues, alongside the sample count. A corrected first error never improves this speed metric. Median (middle value) is in the tooltip. Response comparisons require the same timing protocol and comparable drill/settings. Skill-board reflex trends remain random-only. Wrong/unclear/skipped/self-reported categories and old history remain distinct and readable.

## Verification

Production build and 25 tests pass, including random-pool bounds, no immediate repeats, clef/ledger placement, response-versus-hold separation, first-wrong/later-correct timing, absence of self-check response scores, and backward-compatible history parsing. Desktop browser checks covered staff-only without visible note-name hints, Both view, prompt focus/visibility on starting, random advancement and self-check summaries with no invented speed metric.

No live microphone access was exercised. Actual instrument response quality and timing need real-device testing and calibration before reliable reaction-time claims or cross-device rankings. Hand/finger technique is still prompted but cannot be verified from microphone pitch.

Browser clock references: [animation-frame scheduling](https://developer.mozilla.org/en-US/docs/Web/API/Window/requestAnimationFrame), [monotonic performance clock](https://developer.mozilla.org/en-US/docs/Web/API/Performance/now).
