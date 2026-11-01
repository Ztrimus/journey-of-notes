# Session interruption and recovery

Issue #28 addresses sessions reaching results almost immediately after Start.

## Observed cause

The original practice hook treated a microphone track's `ended` event, a non-running AudioContext and `document.hidden` as `finish()`. During local reproduction, an active microphone track ended while the document was visible and its AudioContext was running. That immediately saved an unfinished set. There was no universal one-second drill timer: quiet foreground sessions could continue. Native/browser capture can still be interrupted; the app must recover rather than treat interruption as completion.

Stopped captures also retained track listeners, so a queued `ended` event could affect a later run. Regression tests reproduced this independently of physical hardware.

## State and ownership

- `idle → starting → running` remains the normal path. Recoverable interruption goes to `paused`; Resume starts a fresh capture, returning to `running`. Only completion, End set, actual page departure or navigation produces a session record.
- Pause keeps the current run, target, attempts, acceptance and elapsed active seconds. It clears live pitch/level, pending release time and prompt-presentation baseline, stops all input tracks and closes the old context. No capture resumes automatically on visibility changes.
- Resume uses the stored seconds as an offset for the new audio clock. Silent practice restores its monotonic clock offset too. Failed reconnection leaves the run paused with a retryable Resume button and a visible error; initial permission failure retains the existing Retry/Silent fallback.
- Each callback checks both its run and audio-engine identity. A stopped engine ignores queued interruption events, reports at most one interruption and removes track listeners before stopping tracks/closing its context. Pending permission streams are released if their capture was already cancelled.
- Validator interruption restarts an unconfirmed hold. It preserves the deduplication of an already reported sustained wrong pitch and preserves a completed match. Release after Resume can advance an accepted target without duplicating it.

## Timing and UI

An unconfirmed interrupted target has no response/confirmation score. Pitch evidence remains valid; prior accepted timing is preserved and later untouched targets can be measured. No history schema change or backfilling is needed: omitted timing is already supported.

Paused practice shows a native, focused Resume practice button and the interruption reason in the existing status region. Other practice controls remain disabled; End set stays available. At 390×844, the screen fits without scrolling and the Resume target is 170×45 CSS pixels. This is scoped browser verification, not full accessibility certification.

## Evidence and limits

59 tests pass. Added regressions cover quiet capture beyond one second, active track loss, audio suspension, stale callbacks after capture replacement and partial-hold/dedup behavior. A real local microphone session ran beyond 17 seconds and later completed normally. Controlled browser input using a local synthesized C4 stream verified disconnect, suspended audio, page hiding, Resume, frozen time, capture release, accepted-target preservation and exactly one final record. The completed three-target drill had three matches and two eligible response samples, excluding its interrupted first target.

The controlled page was temporary and removed before Pages packaging. These checks do not establish pitch accuracy, instrument identity, calibrated response latency or behavior on real iOS/Android hardware. Those remain on the durable backlog.

Browser references: [AudioContext states](https://developer.mozilla.org/en-US/docs/Web/API/BaseAudioContext/state), [visibility changes](https://developer.mozilla.org/en-US/docs/Web/API/Document/visibilitychange_event).
