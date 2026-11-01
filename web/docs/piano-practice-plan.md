# Piano practice gym: retained direction and proposals

2026-11-01, issue #21. Based on all 29 supplied video transcripts and the previously reviewed beginner handouts. [Knowledge/source review](piano-foundations.md) · [source manifest](piano-source-manifest.json) · [tasks](TASKS.md). **Documentation and proposals only: no runtime, scoring, curriculum or deployment changes in this task.**

## Recommendation

Keep random note reflex as one useful workout, while building a broader practice gym around **reading, timing, movement, coordination, listening and musical control**. The teacher repeatedly warns against treating piano as a sequence of button presses. Our existing pitch loop is a useful narrow tool, not the definition of piano progress.

Use short repeatable workouts with a stated purpose, a manageable range and an honest feedback method. Mix foundations, one current challenge and a return to music. Suggest review rather than permanently ticking skills off, forcing a course deadline, or withholding all later work until perfection.

**Owner setup confirmed in this discussion:** a digital piano or keyboard with USB/MIDI. The next feasibility check should therefore prioritize optional MIDI input for key events and polyphony before investing in heavier acoustic transcription. Exact model, pedal/controller behavior, connection and target browser support remain unverified. No MIDI access or adapter was implemented/tested in this task; the microphone path stays available for other instruments/users.

## Skill families, workouts and evidence

| Family | Original repeatable workouts to design | Evidence and boundaries |
|---|---|---|
| Keyboard geography | Find a letter around two/three-black-key landmarks; find it in another octave; shift a known position | Current single-pitch microphone trial can support isolated targets in its range. Letter-only versus exact-octave goals must be explicit. Prompted hand/finger remains unverified. |
| Music-sheet decoding | Treble/bass separately; middle-C/ledger anchors; intervals and patterns; later accidentals/key changes | Separate note-name selection from playing a key. A diagram/hint changes the task. Clef is not a hand instruction. Exact spelling needs more than MIDI pitch class. |
| Pulse and rhythm | Count/clap/tap quarter/half/whole and rests; eighth subdivisions; dotted rhythms; later sixteenths, triplets and grouped meter | Visual/learner-guided practice first. Automatic onset/offset/rest evidence needs a timed evaluator and calibration. Current pitch holds do not score note values. |
| Five-finger control and scales | Even five-note movement each hand; isolate crossover; whole scale; different keys when ready | Pitch order is one measure. Physical fingering, even touch and fluid movement need human review or suitable additional evidence. Avoid forced stretch or universal finger-pattern rules. |
| Hand coordination | Similar/contrary movement; alternate separate/together; later different rhythms/articulation and melody/accompaniment balance | Ordinary monophonic microphone analysis cannot establish simultaneous notes or anatomical hand. MIDI can report keys/events, not fingers; human observation remains useful. |
| Harmony and shapes | Identify a triad/inversion; blocked versus broken chords; serial pattern; later chord transitions | Distinguish simultaneous chord sets from a serial note sequence. Do not flatten a chord into whichever pitch the microphone happens to estimate. |
| Articulation and touch | Contrast connected/detached patterns; listen for thumb accents; shape a short phrase; balance paired notes | Key-down duration differs from sounding duration, especially with pedal. Ordinary microphone RMS is not reliable finger force, dynamic balance or quality. |
| Hearing and audiation | Listen, imagine/sing a comfortable line, then play; compare phrase shape; later original call-and-response | Keep reference playback, vocal response and piano response separate. Do not score speaker playback or singing as evidence of a played piano key. Musical listening can remain self-reported. |
| Phrase reading and navigation | Small unfamiliar phrases; rests/ties; repeated sections; first/second endings; later coda/key changes | Preview is intentional here. Familiar repeated material is practice fluency, not fresh sight-reading. Preserve structured score order and context. |
| Expression and style | Melody above softer accompaniment; broad dynamic shape; jazz swing/anticipation; optional ornament version | Allow declared interpretive flexibility. Rigid quantization, one swing ratio or absolute decibels do not establish musicality. Instructor/listener evidence stays distinct. |
| Practice method | Review a previous workout; isolate one problem; reconnect it; reflect on sound and next useful focus | Activity and self-reflection are useful but not automatically verified skill. Keep review workload bounded and allow enjoyment/rest. |

These families overlap. A scale can train geography, coordination, touch and key knowledge, but one measured pitch score must not fill every family's progress indicator. Completing a set records that practice happened; it is not lifelong mastery.

## First useful expansion to discuss

Start with three small original workout types rather than copy the course into a large unvalidated syllabus:

1. **Recognize and locate:** one unfamiliar Music sheet cue in an explicit range/clef, then play it. Keep a learning version with optional labels and a separate unhinted recall version. Use constrained meaningful positions before arbitrary hand/finger/octave combinations. Keep the existing isolated-pitch evidence and approximate timing label.
2. **Count the notes and rests:** a short rhythm shown on one familiar pitch, or tapping with no instrument. Count the pulse and subdivisions; compare quarter/half/eighth values and planned silence. Initially this can be guided practice without an automatic correctness claim. Before adding grades, build timed events, calibration and interruption handling; do not reuse self-check click times as piano performance data.
3. **Smooth movement, then connect it:** five-finger pattern or short scale crossing, one hand at a time; isolate its difficult movement, then reconnect to a short phrase. Keep a listening prompt for evenness and flow. The current release-required loop must be extended before this can be called automatically assessed legato or a continuous scale.

Later add chosen left-hand scales, controlled dyads/chords, coordination and harmonic shapes when the evidence path supports them. Independent sight-reading and creative practice can be guided even when reliable automatic assessment is unavailable, provided the interface says so.

An optional example routine is 2 minutes of familiar foundations, 2 of reading/rhythm, 3 on a difficult movement, 3 reconnecting it into music, and 2 reviewing/listening. This is a product sketch, not a prescribed physical regimen or minimum commitment. Adapt to the learner's time/comfort and let them stop. No compulsory daily streak, fixed repetition count or age-based prediction.

## Preserve the important distinctions

- **Surprise recall versus reading ahead:** keep upcoming random reflex targets hidden. For a phrase-reading workout, show the short phrase and allow pre-scan/movement planning. Changing this policy by mode respects both the owner's reflex goal and the teacher's reading advice.
- **First success versus retained fluency:** invite another short set and a later revisit; do not require exactly 20/30 repetitions because a teacher used those examples. A later first attempt at comparable material may supply a retention probe; activity alone cannot measure a forgetting curve.
- **Practice versus performance:** slow counting and focused retry may be appropriate during learning. A fixed-tempo test is a separately chosen condition. Don't punish exploratory pauses as if a performance contract had been selected.
- **Literal rhythm versus expressive timing:** ties/rests/meter remain explicit; rubato, phrase endings, grace notes and swing need declared context. A strict timing score must not pretend to cover every interpretation.
- **Physical key, sounding note and finger:** piano decay, damper action and sustain can make them diverge. A MIDI key number is not anatomical fingering. A heard tone could still be humming or another instrument; source recognition remains deferred.
- **Hints, rehearsal and novelty:** record these conditions with the attempt. A previously played phrase, key diagram, note-name hint, view change or coached retry changes comparability. Do not label a hint-assisted rehearsed result “fresh reading speed.”

## Measurement proposal

Keep the existing pitch metrics narrowly named. For new workouts, define denominator and eligibility before drawing a score/ring.

| Objective | Useful future observation | Required context |
|---|---|---|
| Location/decoding | First unhinted response, wrong-note/octave confusions, correction after retry | Target range, clef, view, hints, novelty, input method and sample count; current acoustic time remains approximate |
| Rhythm | Note-onset deviation, duration/release alignment and correctly observed rests | Declared tempo/meter/expected events, measured clock/delay and capture coverage; human/device uncertainty not silently marked wrong |
| Scale/movement | Correct serial order, repeatable troublesome transition, timing evenness | Same scale/hand instruction/tempo, complete event stream; touch/fingering not proved |
| Coordination/chords | Missing/extra keys and simultaneity spread | Multi-note event input and explicit chord/voice targets; no inferred actual hand from pitch/channel alone |
| Musical control | Learner/listener reflection, optionally within-device velocity/envelope trends | Clearly human-reported or exploratory evidence; no universal “expression 87%” score |
| Review | Comparable later first attempt and trend with evidence count | Deliberately scheduled probe, same relevant conditions; not a neurological/innate-talent judgment |

Do not display every measure for every workout. A small report should explain what happened and one useful next action. No-data, incomplete, unsupported-range, unclear signal and deliberate rest are different states. Compare like conditions and show coverage so rejecting difficult/quiet notes cannot inflate apparent success.

## Architecture: reusable infrastructure, objective-specific evaluation

This extends the bansuri proposal's separation between capture, drill intent and evidence. It does **not** make piano use a sustained-breath model. Share timestamps, resources, storage and interfaces where useful; keep instrument-specific guidance and decay/articulation assumptions explicit.

- **Skill definitions:** stable instrument/skill IDs, trained capabilities, source references and review status. A graph may suggest dependencies, but avoid locking repeatable foundation workouts as permanently completed.
- **Drill definitions:** stable version, skill/objective, guided/recall/phrase mode, target/event structure, range/hand/finger suggestions, novelty/hint conditions, acceptable input/evaluator types and missing-capability behavior. Do not make one `midi` plus a hold represent every musical task.
- **Notation model:** separate sounding pitch from written step/alteration/octave, independent clef/stave/voice and optional intended hand. Rhythm needs durations/subdivisions, rests, ties and meter grouping. Later phrase navigation needs repeat/ending/key-change state. A MIDI integer alone cannot preserve B-flat versus A-sharp or a tied note versus a reattack. [Primary MusicXML example](https://www.w3.org/2021/06/musicxml40/tutorial/notation-basics/).
- **Input adapters:** retain optional microphone isolated-note analysis and silent/self-report fallback. Investigate optional MIDI for compatible digital instruments; feature-detect actual browser/device support and preserve an alternative. Note-on/off and controller messages can support richer events but not hand/finger technique. [MIDI message reference](https://midi.org/summary-of-midi-1-0-messages). No hardware purchase, new permission or backend is required by this documentation task.
- **Evaluators:** retain isolated pitch/reflex; add rhythm/tapping or ordered sequence only when its evidence is adequate; add polyphonic chord/voice evaluation later with appropriate input. Handle key release separately from sustain/resonance. Every evaluator has versioned parameters and an abstention state.
- **Evidence/history:** keep typed note, rhythm, chord/sequence and self-reflection evidence distinct. Retain old `p0`–`p6` IDs, old backup readability and original meanings. New fields/record kinds need validated adapters/import/export before writing them. Never reinterpret old pitch matches as verified technique or full phrase mastery.
- **Performance:** bounded event buffers and summaries, shared reusable analysis workspace, independent visual update cadence, no raw recording/upload by default. Profile target phones before a heavier audio engine, polyphonic model or score parser. A tiny original reviewed-phrase format is enough to explore the first timed drills; a full MusicXML importer is not a prerequisite.

Source codes inspected for the gap analysis: `curriculum.ts`, `reflex.ts`, `validation.ts`, `usePractice.ts`, `pitch.ts` and the existing history/metrics model. Current isolated 0.35-second piano holds and release-based advancement do not establish onset, release, duration, pedal or rhythmic grading. Treat that as a design constraint to resolve, not simply a tooltip to hide.

## Suggested order of future work

1. **Retain knowledge (this task):** complete source audit/manifest, conflicts, practice principles, task list and agent memory. Preserve the bansuri research and all live behavior.
2. **Verify instrument capabilities and review physical examples:** the owner confirmed a digital keyboard with USB/MIDI; verify actual model/range, touch, pedal, connection and browser MIDI support next. Review score/hand demonstrations before detailed crossover, pedal or ornament instruction. This does not block documentation.
3. **Strengthen honest isolated-note learning:** explicit clef/range and independent hand suggestion, choice versus playing modes, novel versus repeated condition, reviewed original content. Preserve hint/timing rules and all old history.
4. **Prototype rhythm separately:** original short rhythms/rests, tap or learner-guided practice, then calibrated event capture. Test note values, late starts, missing input, sustained decay, planned silence and interruptions before automatic grading.
5. **Explore MIDI and connected sequences where useful:** assess real instrument/browser support; handle chords, repeated notes, off events and pedal without inferring fingers. Validate acoustic fallback limitations rather than claim parity.
6. **Add coordination/harmony and musical review:** carefully scoped workouts, alternate separate/together, optional human feedback. Extend notation/data incrementally, and keep expression/style assessment exploratory.
7. **Recommend review from real evidence:** a weak transition or missed reading pattern can suggest practice. Later retention probes can support trend claims. Avoid a fictional overall musicianship score, biological muscle-decay formula or talent ranking.

## Checks needed before claiming new abilities

Use real acoustic and digital examples: quiet/decaying notes, repeated same pitch, legato connection, staccato, wrong octave, dyad/chord, held lower voice with moving upper voice, pedal-down/up, intentional rests, reference playback, background sound and a humming confound. Where supported, compare MIDI and audible results without assuming either is ground truth for anatomy or expression. Test clock alignment, false accepts/rejects, unavailable coverage, browser interruptions and phone performance by mode.

For notation, verify spelling/key/accidental scope, ties versus slurs, rests per voice, simple versus compound grouping, and repeat/ending traversal with reviewed original examples. Do not test an ASR-generated guess against the same guessed target. For physical and expressive guidance, teacher/learner review remains necessary. No automatic claim of posture, finger, hand, talent, health or artistic-quality verification follows from a successful build or synthetic pitch test.
