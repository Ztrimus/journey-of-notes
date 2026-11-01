# Personal product decisions and answers

Updated 2026-10-31. Journey of Notes is an independent personal musician's practice product. Public web standards and musician-centered UX guide it. No company branding, mission, institutional curriculum, policy or approval processes govern this design. The durable task register is [TASKS.md](TASKS.md).

## Order of work

**Latest bansuri research (2026-11-01, issue #19):** [Foundations and all-lesson source review](bansuri-foundations.md) and [practice/evaluator proposal](bansuri-practice-plan.md) retain the supplied subtitle knowledge and current implementation gaps. First sound, steady tone and connected hole changes are proposed independent workouts; automatic clarity scoring remains research. Both hand orientations with left hand nearest the blowing hole by default is an accepted requirement, not yet implemented. The proposal does not replace the released evaluator or change historical scores. See TASKS.md for what is complete versus still proposed.

1. Make the practice loop honest, legible and comfortable on a phone.
2. Resolve instrument-specific setup: piano pitch versus bansuri tonic and swar/register.
3. Preserve attempts and show useful results without inventing a universal skill score.
4. Validate real instruments/devices and publish a free HTTPS prototype.
5. Add accounts/sync, broader instruments and advanced technique evidence when justified.

The latest implementation uses home → instrument → activity map → preparation → focused practice → results, with separate history. This follows progressive disclosure: reveal the information needed for the current task instead of presenting every setting at once. The [eBay design-system pattern](https://playbook.ebay.com/design-system/patterns/progressive-disclosure) gives a public example of this approach. This is a general design technique, not a company-specific product identity.

## What changed in the UI

- Music sheet is the default; its compact View menu can switch to Key diagram/Note cue or Both during practice.
- Challenge and feedback sit side by side. Preparation contains instructions and settings; the active set contains only target, progress, short feedback, heard note, essential controls and a small evidence note.
- Piano uses L/R and finger numbers, with optional note-name hints and the key diagram. Emoji support labels rather than replace meaning.
- Counts and response distributions appear after a set. Immediate feedback still uses a green check or red cross plus accessible words, not red/green alone. The heard pitch remains visible during microphone practice.
- Random recall has no next-target preview or placeholder. The next target is sampled and revealed only when it becomes current. Guided patterns have known order by design and are not surprise-note speed benchmarks.
- Changing the view during a target invalidates that target's timing. Per-attempt view/notation metadata is retained and mixed-view sessions are excluded from baseline comparisons.
- The skill map uses real recent activity: ring fill is distinct active days out of the last seven, and line thickness reflects recent sets. This is practice activity, not proven muscle strength, mastery or a measured forgetting curve. No skill is permanently locked or completed.

## How the app hears and matches a note

This is local signal processing, not a cloud AI model or music transcription service.

1. After the user's Start action, `getUserMedia` requests a microphone stream. The browser may deny permission, lack a microphone, or find it busy. Some desktops have no microphone; even devices with one may have access disabled. Therefore Silent practice remains a useful opt-out/fallback.
2. Web Audio connects that stream to an analyser. A 2,048-sample time-domain frame represents about 43ms at 48kHz or 46ms at 44.1kHz. Microphone audio is not played through the speakers, recorded to a file or uploaded.
3. About every 60ms or later, the custom YIN-style detector compares delayed copies of the waveform to find a repeating period. Frequency is sample rate divided by that period; frequency is converted to a fractional MIDI pitch with A4=440Hz.
4. Quiet frames and weak periodicity are rejected. The internal confidence is a periodicity estimate, not a calibrated probability that a named note is correct.
5. A validator compares the pitch with the target. In this trial, a match stays within ±45 cents for a short level-specific hold. Correct holds are 0.35–1s; a stable wrong candidate needs roughly 0.3s before it becomes one wrong event. A sustained sound is not counted once per frame.
6. A successful note waits for release before advancing. Short fragments, fast runs, noise, breathy attacks, decaying piano notes and harmonics may not qualify or may be misestimated. Several notes sounding together can produce an ambiguous period; this detector is monophonic and cannot judge a chord.

That explains why playing many quick notes may yield only one counted attempt. The interface's Heard value is an estimate from a recent frame; a result event requires stability. Harmonics can also cause octave errors. We need labeled real recordings and device trials before claiming general reliability. User-reported success with G4 as Sa is useful evidence for that particular flute/session, not a universal benchmark.

The relevant code is `src/audio.ts`, `src/pitch.ts`, `src/validation.ts` and `src/usePractice.ts`. The method is inspired by [de Cheveigne and Kawahara's YIN work](https://pubmed.ncbi.nlm.nih.gov/12002874/); the prototype is a small custom implementation, not the full published evaluation or a guarantee of its accuracy. [Browser microphone requirements](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia).

## Bansuri notation and your tuner images

Hindustani music commonly uses sargam/swar notation. The syllables Sa Re Ga Ma Pa Dha Ni are relative to Sa, rather than fixed Western note letters. Bhatkhande-style writing commonly uses a dot above for an upper register and below for a lower register, with separate marks for altered swars. Traditions and teaching materials vary, and oral demonstration remains important. [SurSadhak's notation description](https://sursadhak.com/notation-app/) and the [Bansuri Bliss fingering example](https://bansuribliss.com/wp-content/uploads/Hansadhwani-Bansuri-Fingering-Chart.pdf) are direct examples.

The bansuri default sheet now shows sargam with register dots. Western notation is an optional preparation choice. Heard feedback retains both systems, e.g. Middle Re / A4 when Sa=G4, Upper Sa / G5, or Lower Ni / F#4. The swar mapper also names komal/tivra pitch classes. The current equal-tempered A4=440Hz trial is not a complete model of raga-specific intonation or expressive ornamentation.

| Screenshot | Measured pitch | What it establishes |
|---|---|---|
| C#5, 563.8Hz | About 29 cents sharp of equal-tempered C#5 | The sound is near C#5. If this was middle Sa, C# is the tonic in that playing register. |
| G4, 390.9Hz | About 5 cents flat of equal-tempered G4 | The sound is close to G4. If this was middle Sa, G is the tonic in that playing register. |

A single screenshot does not identify the flute's marketed scale or bass/medium model without fingering and register. A manufacturer may name a bansuri by three-holes-closed Sa or all-holes-closed key; those are not the same note. [One World Flutes explicitly documents both conventions](https://oneworldflutes.com/PDF/FlutesCallOut.pdf). Avoid declaring these definitively C#-scale and G-scale merely because arbitrary notes were played.

The built-in Detect my Sa flow asks the learner to play their known middle Sa. It seeks a stable pitched sound for about 1.2s, presents a candidate, and requires confirmation. It cannot infer that an arbitrary played note is functionally Sa. For a typical Hindustani bansuri, the top three finger holes closed is the usual tonic reference; verify the particular instrument's convention. Manual choice includes sharps and the C#5 shown in the screenshot. Start is disabled, with a visible explanation, until the selected Sa is confirmed. Microphone permission is requested only after the explicit Detect or Start action.

## Which metrics matter

- First-try match: targets whose first scorable pitch attempt matched, with numerator and denominator. This is a specific proxy, not a validated overall recall score.
- Matched/wrong/unclear/skipped/self-reported counts: preserve missing evidence instead of converting every uncertain signal into failure.
- Target coverage: unique targets matched out of the requested total, alongside whether the set ended early.
- Response median, mean and 90th percentile: typical response, average response, and slower tail. Show measured target count.
- Retries: how many scorable attempts occurred after each target's first attempt.
- Comparable prior-set change: only same instrument, level, challenge, notation, view, hints, tonic and microphone method; mixed-view sets do not get a baseline comparison.
- Practice activity: sets, time and active days. Activity includes silent practice but does not manufacture measured pitch correctness.

Response estimates exclude the stability hold; confirmation includes it. Browser rendering, microphone buffering, sampling and scheduling still add uncalibrated delay. Speed should always be read alongside correctness and sample count. A single sleep-style combined number could hide low accuracy behind speed or reward microphone failures; defer a composite until its formula and reliability are defensible.

## Storage and release priority

Ship the local prototype before adding login or a backend. There is no technical need for a server database to run these local exercises. Small structured records fit the existing browser store; it survives ordinary reloads but is origin/browser-specific and can be removed by clearing data or private-mode behavior. The implementation retains the latest 100 sessions, exports JSON and supports validated merge import without replacing existing IDs.

Browser Web Storage is synchronous. When histories become larger, move behind the same persistence boundary to IndexedDB, an asynchronous browser database. [Web Storage](https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API), [IndexedDB](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API). Add optional identity and a hosted database when people actually need cross-device sync, recovery or sharing. An online-hosted website still will not automatically receive localhost history; export here and import on its new origin.

## Can we host it free?

Yes. This version builds into static HTML/CSS/JavaScript and does audio processing in the visitor's browser. [GitHub Pages supports static websites and public repositories on GitHub Free](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages), and [supports HTTPS](https://docs.github.com/en/pages/getting-started-with-github-pages/securing-your-github-pages-site-with-https), which the microphone needs outside localhost.

The production build now uses relative asset URLs and hash-based navigation for subpath hosting. A sensible destination is a practice subdirectory while preserving the existing privacy-policy page. Re-check current Pages configuration before changing publishing sources. Add a reviewed build/deploy step and test it over HTTPS on real Safari/Chrome devices. The user requested phone-accessible publication on 2026-10-31; release verification is recorded in verification.md. Do not replace the existing privacy-policy site blindly. No account/database is required for this first release; user histories stay local.

## Future hand/finger/technique evidence

| Approach | Useful evidence | Limit |
|---|---|---|
| Overhead camera plus hand landmarks and instrument mapping | Visible hand/fingertip positions, possible finger-to-key contact | Occlusion, camera angle and real contact need evaluation; consent and local processing should be explicit. [MediaPipe hand landmarks](https://ai.google.dev/edge/api/mediapipe/python/mp/tasks/vision/drawing_styles/hand_landmarker/HandLandmark) |
| MIDI plus optional brief visual review | Key number, note-on/off and velocity | Ordinary MIDI does not identify the anatomical finger or guarantee the hand. [MIDI messages](https://midi.org/about-midi-part-3midi-messages) |
| Capacitive instrument touch/closure sensors | Where contact occurs, potentially which flute holes are covered | Requires additional hardware; contact does not prove an airtight seal or identify a particular finger by itself. [Bela Trill](https://bela.io/products/trill-touch-sensors/) |
| Finger-assigned rings or wearables combined with contact sensing | A potential way to associate contact with a tagged finger | Experimental hardware path; calibration and false contacts need validation. Not implemented or recommended as a required purchase. |
| Phone tapping drills | Separate recognition/timing practice on the phone | Ordinary touch contact IDs are not reliable anatomical finger identities and do not prove what happened on an external piano/flute. |
| Constrained exercises and self/teacher review | Practical technique guidance with low setup cost | An instruction to use a hand/finger is not proof that it was used. Keep it separate from acoustic results. |

The next low-cost step is reliable pitch/rhythm plus clear technique prompts, followed by an optional local camera experiment. Extra sensors may be creative later, but are not justified prerequisites for this prototype.

## Architecture mindset

`instruments.ts` contains a small instrument registry. Curriculum, sargam mapping, signal processing, validation, session orchestration, metrics, persistence and screens have separate modules. Future guitar or Western flute needs an explicit instrument definition, appropriate prompts and a credible validation capability; it should not require replacing the whole application. Do not pretend the current monophonic detector can validate strummed chords.

Keep optimizations proportionate and measured: reuse the pitch workspace, avoid scheduling inaudible click work, persist at session boundaries, lazy-render attempt details and paginate history. No server, heavy model or speculative framework is introduced for hypothetical instruments. Profile real mobile devices before moving analysis into a worker or changing the audio engine.

## Terminology and fine tuning

The product label is **Music sheet**. A staff technically means the five notation lines, while sheet music is the written music; internal staff keys remain for history compatibility. A cent is 1/100 of an equal-tempered semitone. +29 cents means a pitch is 29% of a semitone higher than its reference, not 29 notes or 29 Hz. Zero is on reference; negative values are flat. C♯5 is about 554.37 Hz; the screenshot’s 563.8 Hz is about +29 cents. Use `1200 * log2(measuredHz/referenceHz)`. The app’s ±45-cent trial threshold is deliberately permissive and is not a professional tuning standard.

## Quality and map follow-up

The current activity ring and set-based connector can grow on wrong attempts. They are not quality measures. The user requested quality/recall definitions and alternative horizontal maps before implementation; read [the discussion proposal](progress-and-map-proposal.md). Instrument-source recognition is also discussion only. Issue #13 changes only the redundant home CTA and responsive preparation-field placement, alongside documentation.
