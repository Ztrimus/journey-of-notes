# Journey of Notes: guided learning and validation

This is a proposed product direction and execution plan, grounded in the two supplied practice PDFs, the two prompt images, and Bill Hilton's published beginner-course handouts. It is not an instructor-approved syllabus. The user authorized an initial implementation without further questions. See [source review](source-review.md) for the lesson-by-lesson record and limitations.

## Product decision

**Bansuri follow-up, 2026-11-01:** [the retained foundations](bansuri-foundations.md) and [practice proposal](bansuri-practice-plan.md) supersede this document's broad flute stage outline for current planning. Use repeatable skill families and the released behavior documented in TASKS.md, not older chapter/diagram descriptions below. The newer documents distinguish sound discovery, sustained-tone windows and connected transitions; those evaluators remain proposed.

Build a practice companion with a clear learning route: **learn → see the target → play → receive evidence → retry → review**. Add one dimension of difficulty at a time. Being able to produce a pitch, locate a note, use an intended finger, keep time and play musically are different skills; a single percentage cannot establish all of them.

Use a standalone browser app. Keep single-note analysis local. Introduce accounts and synchronization after the feedback loop proves useful on actual instruments and target devices.

## Fast recognition

The supplied prompt images establish the desired hand/finger/note/octave information. Keep that information, but give it a clear hierarchy:

- Largest: the note letter or swar. Show the octave explicitly beside it; never rely on color to convey pitch or register.
- Beneath: spelled-out Left/Right hand and the finger number plus name. A keyboard image highlights the actual target key.
- Next: a smaller preview, with stable placement so the learner does not search the screen each time.
- Preparation: short instructions before starting. During practice, show one actionable feedback sentence.

A beginner should not start with all 840 independent hand/finger/octave combinations. Use a comfortable five-note position first, predictable order next, and constrained retrieval later. Teach finger numbering visually before requiring rapid decoding. A later optional compact layout can resemble the supplied L / 4 / G / 5 image once the learner knows the symbols.

Do not make treble clef mean right hand or bass clef mean left hand: those are reading systems, not hand assignments. Add staff notation as a separate skill after keyboard location is understood.

## Session structure

1. Setup: select instrument, lesson and evidence method. For flute, identify and confirm middle Sa in concert pitch rather than guessing from the manufacturer's key label.
2. Learn: show the small objective, starting position and validation limits.
3. Prepare: optional reference/example playback, followed by a quiet gap before listening. Reference playback is planned, not part of the current build.
4. Practice: initially self-paced, waiting for an acceptable note and short hold. A mismatch invites a retry; it does not advance the target. Repeated notes require a release so one sustained sound cannot clear several targets.
5. Summary: separate matched, wrong, unclear, skipped and self-reported events. Include target-level retries and a useful review suggestion.
6. Next session: brief review of earlier work before the next chapter. Keep chapters revisit-able. Hard unlocking and mastery awards should wait for validated measurement and teacher review.

A sequence finishing means the learner reached its end, not that they mastered the instrument. An interrupted session keeps its attempts and remains marked incomplete.

## Proposed piano syllabus

**Piano follow-up, 2026-11-01:** [the complete subtitle review](piano-foundations.md) and [practice-gym proposal](piano-practice-plan.md) expand and supersede this early piano stage outline for current planning. Use repeatable workouts and explicit microphone/MIDI/human evidence boundaries; the current owner has a USB/MIDI digital keyboard, but no MIDI adapter or new evaluator is implemented. Source-based physical/expressive instructions still need demonstration review.

| Stage | Learning objective | Practice and feedback | Prototype state |
|---|---|---|---|
| 0 | Know the keyboard and finger numbers | Locate two/three black-key groups; identify middle C and thumb=1. Technique self-check. | Text guidance and key image; fuller visual lesson planned |
| 1 | Play one target | Three separate C4 attempts, suggested right thumb; single-note pitch checks. | Chapter 1 live |
| 2 | Recognize a letter in more than one octave | C4/C5, then D4/D5; show octave explicitly. | Chapter 2 live |
| 3 | Use a five-note right-hand position | C4–G4 and return with suggested 1–5 fingers. | Chapter 3 live |
| 4 | Use a five-note left-hand position | C3–G3 and return, suggested 5–1 fingers. | Chapter 4 live |
| 5 | Retrieve notes without a scale cue | Mixed C–G targets in the same position. Pitch is measured; fingering is prompted only. | Chapter 5 live |
| 6 | Read treble/bass and durations | Separate identification exercises, then quarter/half notes and rests. | Planned; requires staff notation and rhythm model |
| 7 | Cross the thumb and play a full scale | C major, one hand first; relax speed while learning the transition. | Right-hand pitch sequence live in chapter 6; physical crossing unverified |
| 8 | Coordinate hands | Separate-hands/hands-together alternation, sustained accompaniment, then simultaneous notes. | Planned; needs suitable polyphonic/MIDI validation |
| 9 | Interpret keys and articulation | G/D/F and minor scales, accidentals, legato/staccato, phrase endings. | Planned; acoustic claims require separate evaluation |
| 10 | Read varied rhythm | Eighth/sixteenth notes, rests, 2/4 and compound time; start with tapping. | Planned; requires onset alignment and latency calibration |
| 11 | Make music with patterns and pieces | Short original melodies, broken chords, blues, longer pieces and self-review. | Planned; link to source instruction rather than copy scores |

The Bill Hilton course supplies a useful progression from keyboard orientation through reading, scales and pieces, with reinforcement after lesson 5. Our app should support that learning with original drills rather than reproduce the course or claim to replace a teacher.

## Proposed flute/bansuri syllabus

| Stage | Learning objective | Appropriate evidence | Prototype state |
|---|---|---|---|
| 0 | Hold the instrument and form a comfortable first sound | Tutorial demonstration, learner reflection or teacher review. Sound presence alone does not prove a good embouchure. | Planned; no automatic technique claim |
| 1 | Sustain a comfortable Sa | Pitch stability and short hold relative to a confirmed tonic. Do not impose long breath-retention targets. | Chapter 1 live |
| 2 | Change a few swars | Sa–Re–Ga–Re–Sa, slow and separate. Physical hole placement needs model-specific instruction. | Chapter 2 live |
| 3 | Cover the main register | Ascending and descending sargam; short holds with natural breathing breaks. | Chapters 3–4 live |
| 4 | Build small alankars | Overlapping pairs, then three-/four-note groups and reverse patterns. | Short pair exercise live in chapter 5; larger patterns planned |
| 5 | Hear register changes | Sa and upper Sa, later lower register and wider movement. | Sa octave exercise live in chapter 6 |
| 6 | Coordinate notes and pulse | One note per beat before double, triple and fourth-speed subdivisions. | Planned; source tempos are references, not universal starting requirements |
| 7 | Develop tuning awareness | Shuddha, komal and tivra swars relative to chosen tuning/reference. | Planned; equal temperament is only the current engineering trial |
| 8 | Shape articulation and expression | Tonguing, meend, kan, murki, andolan and other ornaments, introduced individually. | Planned; compare contours and seek teacher feedback rather than use exact-note penalties |
| 9 | Connect phrases and music | Original phrases and repertoire, comfortable breath planning and self-listening. | Planned |

A universal hole diagram would be misleading without knowing hole count, flute type and fingering convention. The current app therefore shows swar and pitch, not an invented hole map. Sa is configurable from C3 to B4 in the trial, giving upper Sa within the detector's supported range.

## Evidence and validation matrix

| Skill | Microphone | MIDI, where supported | Human/self-check |
|---|---|---|---|
| Single pitch and octave | Experimental periodicity/pitch estimate; reject weak confidence | Note-on identifies transmitted key number | Useful fallback, marked self-reported |
| Sustained note | Can estimate continued stable pitch; instrument decay/room/device matter | Key-down duration, not full acoustic quality | Comfort and musical steadiness |
| Timing | Requires attack detection, alignment and latency calibration | Event timestamps can support timing analysis | Optional tapping/listening reference |
| Several notes together | Out of scope for this single-pitch detector | Multiple note events are suitable for a future chord checker | Acoustic piano fallback until reliable polyphonic analysis |
| Hand and finger | Not established | Not normally established by note messages | Technique review, teacher or future carefully evaluated camera feature |
| Breath/embouchure/posture/physical holes | Sound is indirect evidence, not verification | Not applicable | Instrument-specific instruction and review |
| Dynamics and expression | Device processing/distance confound loudness; no current scoring | Velocity is a proxy, not a full measure of expression | Musical feedback remains essential |

The initial implementation uses a YIN-style single-source pitch estimate, a confidence gate and a sustained target window. These are provisional engineering choices: 100–2000Hz detector range, A4=440Hz, confidence >=0.9, ±45 cents and lesson-specific 0.35–1s holds. They need actual instrument recordings and cross-device evaluation before reliable scoring can be claimed. They are not published pedagogical standards.

Silence is waiting, not a failed note. Sustained uncertain sound becomes an unclear event. A stable wrong pitch counts once and can be corrected. Release/change begins another attempt. A successful note counts once; release advances to the next target. Rhythm is deliberately not scored in this self-paced slice.

## Track useful information without inventing certainty

Per attempt: target index, expected pitch, estimated pitch, cents from target, signal confidence, event time and outcome. Per session: chapter/version context, instrument, input method, tonic, start time, elapsed time, sequence completion, all attempt events. Summary: counts, scorable pitch-match rate, retries and review targets.

Pitch-match rate = matched / (matched + wrong-pitch attempts). Unclear, silence, skipped and self-reported outcomes are excluded. It must appear beside its numerator/denominator and evidence method. It is not an overall musicianship score. Self-reported technique checks must never become microphone-verified correctness.

Current history retains the latest 100 sessions locally, up to 500 events in one session, and supports JSON export. It does not synchronize across devices or survive clearing browser storage. Account history, import, retention controls, curriculum versioning and aggregate trends are later work. No raw microphone audio is saved or uploaded.

## Execution plan

1. **Current slice:** six piano and six flute sequences; clear key/note display; self-check and experimental single-pitch feedback; retry/skip/end; local event history/export; resource cleanup; build and automated checks.
2. **Measure feasibility:** use consented labeled recordings and live instruments across target devices. Measure semitone/octave errors, false accepts, false rejects, rejection rate, latency and performance. Test quiet/noisy rooms, headphones, harmonics, instrument decay and interruptions. A synthetic sine wave passing a test is insufficient evidence for real-instrument accuracy.
3. **Improve first lessons:** model-specific flute diagrams, hand/finger introduction, optional reference notes, staff identification and short original lessons reviewed by an instructor. Time a small recognition task to compare the new prompt with the four-column image, including wrong-octave errors and accessibility.
4. **Add rhythm:** calibrated onset timestamps and an audio-clock exercise timeline; separate pitch, onset and duration metrics. Score rests and sustained notes explicitly. Handle speaker clicks and Bluetooth latency before awarding timing scores.
5. **Add MIDI and polyphony:** feature-detect browser support and preserve microphone/self-check fallbacks; support chord sets and note release. MIDI does not prove hand or fingering.
6. **Add progression and accounts:** design review recommendations from measured weak skills, then synchronize history and add optional login. Introduce mastery criteria only after teacher review and accuracy benchmarks; retain learner access to earlier chapters.

No global authentication changes, deployment, source push, PR or Android replacement are included in this iteration.
