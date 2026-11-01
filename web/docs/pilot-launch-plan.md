# Public pilot decisions and testing — 2026-11-01

This is Saurabh Zinjad's independent personal musician-practice app. The current release adds visual reports/history, a quality-based skill board and limited guitar, C concert flute and vocal starters. No third-party analytics, session recording, OAuth or cloud database is enabled. No social-media post has been sent.

## Public sharing readiness

Share this as an **experimental public pilot / building in public**, not a validated instrument teacher. The app can demonstrate a complete training loop: choose a skill, see a cue, receive single-note pitch feedback, review evidence and repeat. Synthetic tests and UI checks do not prove live acoustic accuracy or calibrated timing. No claim about talent, health, posture, fingering, breath, chords or rhythm is warranted.

Before claiming a reliable training MVP, complete one real-phone/instrument trial on the actual public HTTPS site, then expand to iOS Safari and Android Chrome. New guitar, Western-flute and vocal paths have small original pilot drills, not full professionally reviewed curricula. More instruments are not prerequisites for a useful launch; further expansion should follow demand and successful completed sets, not an unsupported claim that most musicians use our selected instruments. Ukulele or violin could be future single-note candidates; drums need a different rhythm/onset engine. Do not add more before measuring this loop.

A short feedback link and one honest working demo are enough for a first post. About, Privacy, Feedback and creator credit are included; separate marketing pages and account walls are unnecessary for the pilot. The feedback link opens public GitHub Issues and requires a GitHub account. A hosted anonymous form is a sensible next option for nontechnical users when the owner supplies/creates its destination. No private address or corporate contact is published.

Draft, not posted:
> I'm building Journey of Notes, a browser-based practice gym for musicians. It gives single-note pitch feedback, repeatable drills and a visual practice history, with piano/bansuri and early guitar, Western-flute and vocal drills. This is an experimental pilot: I'm looking for testers to try a short set and tell me what feels clear, confusing or inaccurate. No installation or account needed. https://ztrimus.github.io/journey-of-notes/practice/

## What is needed from the owner/testers

Record device model, OS/browser version, instrument/model or digital sound patch, microphone (built-in/wired/Bluetooth), room/noise and selected tonic/view/difficulty. Headphones avoid feedback; start with the built-in microphone and no Bluetooth to reduce uncontrolled delay. No raw recording upload is required.

1. Open the public URL on the phone; choose a pitch workout and allow the microphone yourself after Start. Confirm Sa/comfortable vocal starting note when relevant.
2. Play ten known targets one at a time, deliberately allowing each required hold and release. Note target, independently known pitch and app-heard pitch, plus accepted/rejected/unclear. If using a tuner as reference, do not let a second app compete for the same microphone.
3. Try five deliberate wrong notes/octaves, then correct them. Include five silent pauses and note whether a false match occurs. Test quiet attacks, decay and ordinary background noise separately. A small trial is an initial smoke test, not a reliability benchmark.
4. Finish, inspect the report, reload and check history. Deny microphone once, then try the silent fallback. Hide/return to the tab and confirm the set ends and resources release. Test next skill, repeat and backup transfer. Clear only your own intended test history after export.
5. Repeat a short Note reflex set with hints off and a fixed view; guided drills deliberately have no surprise-response score. Report counts along with approximate response times.

For an initial labeled note trial calculate wrong-note false accepts, correct-note misses and unclear/no-result rate separately. Keep denominator and device/room conditions. A pitch match from a voice during a piano exercise is not a source-classification success/failure: source recognition is not implemented.

**Latency is separate.** A precise benchmark needs a synchronized reference tying actual visual presentation to the physical note attack. MIDI timestamps can help on supported devices; a single external high-frame-rate video that sees the screen and records the attack can give a rough end-to-end estimate if the owner explicitly chooses to record it. Audio-buffer/device/OS delays and display-frame timing remain. Do not subtract a guessed constant or call an everyday response time pure brain reaction speed. A user does not need to record their face, hands or room to use the app.

## Analytics and feedback options

| Option | Best fit | Cost/setup and limits |
|---|---|---|
| PostHog | Explicit events, funnels, paths, retention and optional surveys/replay | Current pricing advertises 1M analytics events, 5K replays and 1,500 survey responses monthly free. Project setup required. Start with explicit events, autocapture/replay off. https://posthog.com/pricing and https://posthog.com/docs/product-analytics |
| Microsoft Clarity | Heatmaps, dead/rage clicks and visual interaction replays | Advertised free. Useful qualitative behavior, not the same as accurate exercise outcome data. Requires script/project and privacy choices. https://clarity.microsoft.com/ and https://clarity.microsoft.com/pricing |
| Plausible | Simple visits/referrers and selected event goals | Hosted paid plans after trial; advanced journeys/funnels depend on plan. Simpler aggregate analytics, not a full replay tool. https://plausible.io/docs/subscription-plans |
| Google Analytics standard | Acquisition sources, page views, events/funnels | Free standard analytics; broader configuration/consent considerations, no native full replay. https://marketingplatform.google.com/about/small-business/ |
| Feedback form / GitHub Issues | What felt confusing and why | Lowest effort, complements counts. A form needs the owner's destination; GitHub Issues is already linked but requires a GitHub account. Ask one short question after a set rather than blocking practice. |

Recommendation: **PostHog explicit event analytics plus a short feedback form, no replay initially.** First events: instrument_selected, skill_opened, practice_started, microphone_error (coarse code), practice_finished/ended_early, report_opened, repeat_clicked, next_skill_clicked, feedback_opened. Use coarse instrument/method/view/difficulty and completion counts, not raw pitches, recordings, note histories, names or email. Treat microphone permission as separate from analytics/replay consent. If replay is later enabled, mask text/inputs and exclude reports/history/imports and all audio; limit retention and sample rate, review disclosure/consent behavior before activation. Replay illustrates UI actions, not a complete recording of musical practice. PostHog privacy controls: https://posthog.com/docs/session-replay/privacy . No vendor can show every user or every interaction reliably (blocking, consent, device/browser limits).

Without a configured provider, the live website does not currently count visitors or clicks. GitHub repository traffic is not a substitute for practice-site analytics. Add campaign tags to shared links once attribution tracking is configured; do not confuse link clicks with successfully completed drills.

## Google sign-in and storage

Google sign-in does not store our exercise history in a user's Google account automatically. A practical optional-sync path is Firebase Authentication (Google provider) plus Cloud Firestore per-user records, security rules and backup/migration. Authentication and database are separate products. Keep public practice available without sign-in. https://firebase.google.com/docs/auth/web/google-signin and https://firebase.google.com/docs/firestore/security/get-started and https://firebase.google.com/docs/projects/billing/firebase-pricing-plans .

The UI button is a small part of the work. Domain/provider setup, permission/redirect behavior, per-user access rules, merge conflicts, offline syncing, account/data deletion, export and quota handling require design/testing. Do not enable work/company Google projects for this personal app. Recommend adding optional sync after testers demonstrate that cross-device history is important. No backend or login is required to share the pilot.

## Visual report and skill-design research

Reviewed public primary product pages, not user accounts or paid dashboards:
- musictheory.net separates note, keyboard/fretboard and ear-training exercises and its FAQ describes exercise settings, elapsed time and score in reports: https://www.musictheory.net/exercises and https://www.musictheory.net/faq . Useful principle: describe the exact task/settings behind a score.
- Strava's Training Log uses weekly visual overviews, colors, interaction and filters: https://support.strava.com/en-us/articles/15402077-training-log . Useful principle: activity log and measured performance are different views; do not imply volume proves musical correctness.
- PostHog uses trends/funnels/paths/retention for product usage, not an individual musician's ability. Keep product analytics separate from practice feedback.

Current design: responsive skill board with recent first-detected-attempt pitch match and sample count, distinct active days and last check. Zero measured success differs from no data. No inaccurate connector growth and no forced sequence/unlocks. In future group by pitch/reading, register control, patterns and technique. Tonguing, vibrato, breath and posture need different validated measurements or teacher/self evidence; keep them visually distinct from verified pitch evidence. A radar chart now would suggest comparable validated dimensions that we do not yet possess, so defer it.

Reports show matched/wrong clear-attempt distribution, first-try target accuracy, eventual targets matched, retries/recovery and eligible correct-response median. Coverage substitutes when speed is unavailable. Colors are paired with icons/text. Attempt cards wrap horizontally and paginate in both reports/history. Unclear/skips remain secondary; silent reports do not invent measured percentages.

Median means the middle of sorted responses; the mean is the sum divided by count and is more affected by a long pause. One primary Typical response is sufficient; the help control includes its definition and mean. Only first-try correct, unhinted random drill evidence is eligible. Guided targets, silent clicks, changing the view and missed signals explain absent timing; a dash was unhelpful.

## Vocals, diagrams and claim boundaries

Original limited vocal drills: comfortable hum; Do Re Mi Re Do / Sa Re Ga Re Sa; small pitch steps; random small-range note matching. Western sheet or relative sargam may be selected. They assess steady pitch only, not resonance, register technique, breath support, vibrato quality or vocal health. Comfortable starting pitch and small steps are learner-confirmed; no forced range, loudness or maximum-hold challenge. NIH recommends avoiding vocal overuse/strain, rest when appropriate, and healthy habits: https://www.nidcd.nih.gov/health/taking-care-your-voice . Gentle warm-ups are also discussed by Johns Hopkins: https://www.hopkinsmedicine.org/-/media/entaa-care/documents/vocal-hygiene/vocal-hygiene-for-singers.pdf . Stop if uncomfortable/hoarse; teaching and health advice require qualified people.

Bansuri diagrams follow documented three-hole Sa convention (1–3 closed), one-hole Ga, half-covered first hole for natural Ma, all-open Tivra Ma, and six/five/four-hole Pa/Dha/Ni with register/breath context. Other altered swars receive no invented diagram. Sources: https://bansuri.com/learn-bansuri/swaras-symbols/ and https://bansuribliss.com/wp-content/uploads/Hansadhwani-Bansuri-Fingering-Chart.pdf . Physical variants/alternate fingerings exist; diagrams are guidance, never microphone verification. Original SVGs are drawn in code, not copied charts.

A pitch engine can support an instrument-specific single-note drill without being a full instrument recognizer/course. Guitar starts with G3/B3/E4 open treble strings and a few first-position notes in standard tuning, avoiding the current detector's unsupported low E2 and chords. Western flute is C concert flute with B4/A4/G4 and a limited ascending range; no six-hole bansuri chart is applied to keyed Western flutes.

Do not label users born talented, fast/slow learners or rank their aptitude. Prior experience, practice conditions, disabilities, hints, hardware/audio latency and sampling affect these observations. Instead show personal comparable changes (e.g. percentage-point change across two 30-target windows), accuracy, recovery and approximate correct-response time with counts. Delayed recall across days needs a deliberate fresh-probe design; existing recent performance is not proof of lifelong retention.

Guitar notation limitation: this pilot explicitly labels its sheet as sounding/concert pitch. Conventional guitar music is normally written an octave above sounding pitch; a dedicated guitar-notation mode is deferred. Yamaha reference: https://www.yamaha.com/en/musical_instrument_guide/classical_guitar/play/play002.html .
