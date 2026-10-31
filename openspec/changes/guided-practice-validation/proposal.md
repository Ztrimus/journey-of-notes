## Why

A beginner needs a gradual route through piano and bansuri practice, with readable targets and feedback that prevents repeated unnoticed mistakes. Random four-part prompts and amplitude counts alone do not establish that the requested note was played.

## What Changes

- Introduce a sequential syllabus and short, ordered exercises with revisitable earlier material.
- Make the note the dominant visual, with a keyboard location and explicit hand/finger context.
- Add experimental single-note microphone checks, sustained-note requirements, retries, and distinct unclear/skipped outcomes.
- Save per-attempt results locally and provide a portable export.
- Separate acoustic observations from unmeasured technique and self-reported completion.

## Capabilities

### New Capabilities

- `guided-learning`: ordered targets, immediate feedback, retries, chapter history and review.
- `single-note-validation`: confidence-gated pitch and hold checks, without technique claims.

### Modified Capabilities

- Practice changes from an endless random exercise to a bounded lesson with a summary; the earlier audio scheduling and permission cleanup are retained.

## Impact

The browser prototype grows beyond issue #11's original feasibility-only scope, as requested in the follow-up. Android remains untouched. This is a local trial; accounts, cloud history, production mastery decisions and deployment remain later work.

## Assumptions

Authored under the user's instruction to proceed without questions. Beginners are the initial audience. Lessons use equal temperament and A4=440Hz as an explicit trial setting. Flute Sa must be chosen by the learner; the app does not infer a flute's tonic from its printed key. Teacher review is required for final instrument-specific fingering and pedagogy. Numerical tolerances are provisional engineering settings, not proven teaching thresholds.

## Key Decisions

- Start with self-paced single notes before timed/polyphonic work.
- Pitch feedback is experimental evidence, never proof of correct hand, finger, breath technique or posture.
- Unknown audio is unscorable, not an automatic wrong note; silence does not count as failure.
- Self-check sessions remain visibly separate from microphone results.
- Use original exercises; link to Bill Hilton's resources instead of redistributing his scores.

## Outstanding Questions

Deferred: real flute model and tonic convention, latency calibration, microphone accuracy across devices, MIDI support, instructor approval, polyphonic validation and identity/cloud storage.
