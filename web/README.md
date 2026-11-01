# Journey of Notes — personal browser practice app

An independent musician's practice prototype built with React, TypeScript and Vite. No Expo or React Native dependency in this web app. Read the repository instructions and [durable task list](docs/TASKS.md) before extending it.

## Run and check

Using Node 24, from `web/`:

```sh
npm ci
npm run dev
npm run build
npm test
# To prepare the static Pages subtree:
npm run build:pages
```

Open the Local URL printed by Vite, normally http://127.0.0.1:5173/. `npm run preview` serves the production build. Relative assets and hash navigation support a static-hosting subdirectory. The public preview is prepared for https://ztrimus.github.io/journey-of-notes/practice/ using the existing main/docs Pages source. See verification.md for release status.

## Current flow

Home → instrument → connected activity map → set preparation → focused practice → results. History is a separate screen.

- Piano and Indian bansuri each have seven repeatable skill workouts. Guitar, Western C concert flute and vocals have four limited starter/pitch workouts each. None is permanently completed or locked.
- Music sheet and microphone are defaults. Piano uses Western notation; bansuri defaults to sargam, with an optional Western sheet.
- Compact View controls remain available during practice. Changing the cue invalidates that target's timing and marks the set as mixed-view.
- Random reflex practice hides all upcoming targets; fixed patterns retain their defined sequence.
- Microphone feedback uses experimental local single-pitch analysis and a short hold. It never verifies anatomical fingers, posture, embouchure or hole placement.
- Bansuri setup offers stable pitch detection or a manual chromatic Sa choice, followed by confirmation. Start stays disabled until microphone-mode tonic setup is ready. Detection cannot determine that an arbitrary played sound is Sa.
- Silent practice is optional and self-reported; it has no instrument response score.
- Results separate clear pitch matches, wrong notes, unclear audio, skipped targets, self-reports, first-try match, coverage, response distributions and retries. Comparisons require comparable conditions.
- Map rings show distinct active days out of the last seven. Connection thickness shows recent sets; neither is a validated mastery or forgetting score.

## Data

The latest 100 sessions are stored locally. Existing history remains readable. Export/import JSON moves it between origins or browsers; import validates and merges IDs without replacing existing records. Import files are limited to 5 MB. A hidden/leaving page ends the current set and attempts to save its recorded events. Clearing browser data/private-mode behavior can still remove local data; export backups.

Microphone samples are neither recorded to a file nor uploaded. Google Fonts remains an external typography request with local fallbacks. This is not an offline/installable-PWA claim.

## Test manually

1. Choose Piano → Note reflex. Confirm Music sheet/Microphone defaults and side-by-side preparation settings.
2. Choose Silent practice for UI-only testing. Start, change View during the set, mark/skip targets, end and review the separate results screen. Self-reports must not produce measured pitch accuracy or response time.
3. Reload during a silent set and confirm the interrupted attempt is in history. Export and re-import a backup; duplicate IDs must not multiply records.
4. Choose Bansuri. Confirm default sargam, all chromatic Sa options including C#5, and disabled Start before confirmation. Do not grant microphone permission unless intentionally testing live audio.
5. On a real instrument, choose Microphone, use headphones, and grant permission yourself after Start or Detect my Sa. Compare requested/heard notes and registers; test noise, fast fragments, sustained tones, wrong octaves, note release, permission denial and interruptions.

Hosted microphone use requires HTTPS; plain HTTP on a laptop's LAN address usually does not qualify on a phone. Localhost is suitable for development. Browser support, real-instrument accuracy, precise latency and assistive-technology checks still require device testing.

## Further context

- [Priorities and retained requests](docs/TASKS.md)
- [Product decisions, detector explanation, bansuri notation, storage, hosting and future sensing](docs/product-decisions.md)
- [Syllabus proposal and original execution plan](docs/learning-blueprint.md)
- [Review of supplied PDFs and course handouts](docs/source-review.md)
- [Bansuri knowledge and all 11 subtitle lessons reviewed](docs/bansuri-foundations.md)
- [Bansuri tone, continuity and technique proposal](docs/bansuri-practice-plan.md)
- [Piano knowledge and all 29 subtitle videos reviewed](docs/piano-foundations.md)
- [Piano practice gym and evidence proposal](docs/piano-practice-plan.md)
- [Response-time model](docs/reflex-practice.md)
- [Verification evidence and limits](docs/verification.md)

The original Android checkout remains separate. Personal GitHub access uses per-command authentication; no global/work authentication changes were performed.

## Public pilot follow-up — issue #15

Read [pilot-launch-plan.md](docs/pilot-launch-plan.md) for device/audio testing, launch claims, analytics/provider options, Google sign-in and report-design research. Results and history share compact attempt cards; history offers Grid/Timeline, pagination and a scoped Clear History confirmation. Performance rings show up to 30 comparable first-detected-attempt outcomes, with evidence count; activity is separate. Delayed recall needs a dedicated future probe. No talent labels, third-party analytics, OAuth, cloud sync or source classifier are implemented.

## Active drill feedback — issue #17

Active View uses one-tap native-radio pills. Sheet mode has Show/Hide hint; the next note restores the setup preference. Hint/view changes invalidate that target's response times without erasing pitch outcomes. Confirmed correct/wrong microphone attempts trigger a low-opacity full-viewport green/rose fade; rapid events coalesce. Preparation can disable it, and reduced-motion preferences replace the fade with a static edge cue. Unclear audio and silent self-reports do not trigger pitch feedback glow.
