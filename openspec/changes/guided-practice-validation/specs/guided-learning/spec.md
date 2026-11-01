## ADDED Requirements

### Requirement: Sequential practice
The app SHALL present a repeatable ordered workout with a current target and no upcoming-target preview.

#### Scenario: New beginner session
- **WHEN** a learner starts a practice level
- **THEN** its first target appears and advancement follows the defined order.

### Requirement: Distinct evidence
The app SHALL distinguish correct pitch, wrong pitch, unclear signal, skipped target and self-reported completion.

#### Scenario: Silence or noise
- **WHEN** audio is absent or pitch confidence is insufficient
- **THEN** it is not counted as a wrong note.

#### Scenario: Self-check
- **WHEN** a learner marks a target practiced without microphone input
- **THEN** it is saved as self-reported and excluded from microphone accuracy.

### Requirement: Retry without inflating counts
The app SHALL count a stable attempted note once rather than counting each analysis frame.

#### Scenario: Held wrong note
- **WHEN** the same wrong note continues sounding
- **THEN** only one wrong attempt is recorded until the sound changes or is released.

### Requirement: Measurement limits
The app SHALL visibly identify hand, finger, posture and physical hole placement as unverified.

#### Scenario: Correct pitch with requested fingering
- **WHEN** a microphone confirms a target pitch
- **THEN** the feedback does not claim that the requested hand or finger was used.

### Requirement: Persistent history
The app SHALL save bounded local per-attempt history and provide JSON export while handling unavailable storage visibly.

#### Scenario: Reload
- **WHEN** stored history is available after a reload
- **THEN** prior sessions and their input method remain visible.

### Requirement: Interruptions
The app SHALL release microphone and audio resources when practice ends, the page hides, or permission is revoked.

#### Scenario: Pending permission
- **WHEN** a learner ends practice before granting microphone permission
- **THEN** any subsequently granted stream is stopped immediately.

### Requirement: Repeatable levels
The app SHALL present exercises as repeatable practice levels rather than permanently completed chapters.

#### Scenario: Finished set
- **WHEN** a learner reaches the end of a set
- **THEN** the level remains available for another set and its repetition count is shown.

### Requirement: Music sheet display
The app SHALL offer key diagram, Music sheet and combined prompt views with explicit optional note-name hints in Music sheet mode.

#### Scenario: Reading practice without hints
- **WHEN** Music sheet mode is selected with hints off
- **THEN** the visible prompt shows sheet music and hand/finger context without the note-name answer.

### Requirement: Recall timing
The app SHALL retain approximate microphone note-response and confirmation durations separately for random recall.

#### Scenario: Wrong first response followed by correction
- **WHEN** a target receives a wrong note and later a correct note
- **THEN** first-response and time-to-correct statistics retain their distinct meanings and exclude self-check clicks.

### Requirement: Unrevealed recall targets
The app SHALL keep upcoming random-recall targets hidden and bring the current prompt into view before its presentation-time estimate.

#### Scenario: Starting a recall set
- **WHEN** the learner starts a new random set
- **THEN** the first target is revealed, brought into view, and assigned a presentation baseline before eligible audio is timed.

### Requirement: Focused mobile flow
The app SHALL separate instrument selection, activity map, preparation, active practice, results and history. Music sheet and microphone SHALL be defaults; the active view switch SHALL remain available.

#### Scenario: Mid-set view change
- **WHEN** the learner changes the current view
- **THEN** that target is excluded from response timing and its saved metadata records the changed condition.

### Requirement: Bansuri tonic and swar display
The app SHALL offer confirmed chromatic Sa selection or stable pitch sampling and relative sargam with register indications.

#### Scenario: Unconfirmed tonic
- **WHEN** bansuri microphone practice has no confirmed middle Sa
- **THEN** Start is disabled and explains how to enable practice.

### Requirement: Pilot instrument modes
The app SHALL retain existing piano/bansuri history and offer limited single-note guitar, Western C concert flute and vocal workouts with explicit technique/range limits.

#### Scenario: Choose flute family
- **WHEN** a musician selects Flute
- **THEN** bansuri and Western concert flute choices lead to their respective notation and setup.

### Requirement: Quality evidence board
The app SHALL display recent comparable first-detected-attempt match rates with evidence counts and separate activity/recency, without volume-based success or innate-aptitude claims.

#### Scenario: Repeated wrong attempts
- **WHEN** recorded first attempts are all wrong
- **THEN** quality remains zero despite recorded activity, and corrections do not rewrite first-attempt outcomes.

### Requirement: Clear scoped history
The app SHALL offer export, clear and import in that order, with a visible confirmation before app-history deletion and no deletion of unrelated browser data.

#### Scenario: Cancel clear
- **WHEN** the musician cancels or presses Escape in confirmation
- **THEN** history is retained and focus returns to the clear action.

### Requirement: Compact visual reports
The app SHALL share paginated color-and-symbol attempt cards between history and results, distinguish attempts from unique targets, and explain absent response measurements.

#### Scenario: Guided practice
- **WHEN** a known-sequence guided pitch drill ends
- **THEN** the report shows pitch outcomes and explains that surprise-response speed is not measured.

### Requirement: One-tap live views and current-target hints
The app SHALL offer native-radio view pills and a sheet-mode hint toggle without leaving the active set.

#### Scenario: Reveal hint
- **WHEN** a learner reveals a target's note-name/octave hint
- **THEN** pitch evidence remains, that target's timing is invalidated, and the next target restores the setup hint preference.

### Requirement: Gentle peripheral feedback
The app SHALL give optional low-opacity full-viewport feedback on confirmed correct/wrong pitch events, coalesce rapid events, preserve text/icons and respect reduced-motion preferences.

#### Scenario: Unclear sound
- **WHEN** sound is unclear, absent or self-reported
- **THEN** it does not trigger a correct/wrong pitch glow.
