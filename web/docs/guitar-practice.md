# Guitar practice iteration — issue #36

Current scope is standard six-string tuning, no capo, single-note practice. TAB replaces the guitar's earlier concert-pitch sheet view; the internal staff/both/keyboard IDs remain compatible with history. TAB is six lines with high E at the top, and fret numbers (0 = open). Existing fretboard guidance remains available. `guitarPosition` checks that string + fret agrees with expected sounding pitch. Suggested fretting fingers use guitar numbering (1 index, 2 middle, 3 ring, 4 little), independently of playing handedness; the existing first-position exercises suggest the corresponding finger. No acoustic result proves string, finger, hand, strumming or technique.

Preparation includes a compact optional tuner and exercise preview. The tuner requires explicit microphone activation and selected open string; it shows pitch direction/cents without awarding skill credit. It stops on closing its disclosure, hiding/leaving the page, interruption, user Stop or its one-minute limit. It can be skipped if the learner uses an independent tuner. Alternate tunings/capo require future explicit modeling, not silently reinterpreting string numbers.

The tuner alone uses 4096 samples, a 65–450Hz range and ~10 updates/second. Ordinary practice keeps the existing 2048-sample 100–2000Hz profile and ~60ms update spacing. The extended range covers low E2 (~82.4Hz), which was outside the previous search. Workspaces are reused. Reference sound is a short generated pitch, not a realistic guitar articulation demonstration. It only runs from an explicit preparation action, and blocks capture/Start until stopped or completed. Guided guitar preview can select each exercise note; other guided instruments preview their first target. Reflex exercises expose no example or target preview. Sa detection is disabled while reference sound plays, and vice versa.

Audio state is owned by small preparation components; the existing practice hook still owns scored capture. Cancellation releases pending/active capture and playback contexts. New guitar records carry optional `cueProtocol: guitar-tab-v1`; history imports preserve it and performance comparisons separate it from legacy cues. Existing records are not rewritten. An initial microphone failure can now exit through End set back to preparation without saving an empty set.

## Verification

66 tests pass. New cases cover six strings at 44.1/48kHz, ±35-cent offsets, decaying fundamentals with a second harmonic, silence/DC/noise rejection, valid TAB positions, finger/open-string guidance, tuning direction and confidence, reference cancellation/context release, animation-frame cancellation and history cue comparability/import. These are synthetic/logic checks, not real-instrument accuracy evidence.

A temporary local-only browser harness used generated input on isolated port 5203, without hardware microphone permission or recording. It verified six-string tuner output, ±30-cent sharp/flat feedback, permission-denial recovery, interrupted and hidden-page cleanup, collapse-to-stop, Start/reference exclusion, and zero live tracks/contexts after stopping. A complete synthetic guitar drill produced 3 correct attempts, 3 eligible response samples and exactly one new saved result. A separate silent five-note drill completed unscored. Reference playback blocked simultaneous Sa detection; reflex had no preview controls. The temporary harness was removed before release packaging.

At requested 320/390/1280px, preparation had no horizontal overflow. The 390×844 combined TAB/fretboard drill fit without scrolling, including finger guidance and controls. Real phone touch/text scaling, screen-reader behavior, physical guitar attacks/harmonics, microphone processing and latency remain pending the owner/friend trial. Screenshot: journey-guitar-drill.jpg.

## Optimization review

No dependencies, accounts, server or heavyweight audio models were added. Shared view labels replace repeated instrument branches. Audio snapshots now allocate at the publishing cadence instead of every animation frame; onset sampling and ordinary practice timing stay unchanged. A stopped capture no longer queues an extra animation frame. The default pitch-range object and per-capture workspaces are reused. Tuner pitch updates stay inside its component rather than rerendering the entire app.

Local Node benchmark (100 frames after warm-up, 48kHz, single deterministic tone): normal profile median ~0.50ms/p95 ~0.58ms; low-E tuner median ~1.63ms/p95 ~1.75ms. This is a laptop observation, not a mobile performance promise. Final production bundle is ~99.15kB gzip JS versus ~96.03kB before this iteration, with no new network audio assets. Existing bounded 100-record history does not justify a database or broad state rewrite. Worker-based analysis should follow evidence from slow phones.

## Open feedback

F01/F02/F04 implemented; F05 is experimental pending physical instrument/device validation. F03 strumming instruction versus scored rhythm, F06 piano meaning of scale, and friend setup details remain open awaiting the owner's reply. Their persistent ledger is `work/journey-next-iteration.md` outside this source repository. No strumming/chord assessment or piano-scale guess was introduced.

References: [Fender TAB convention](https://www.fender.com/articles/techniques/how-to-read-tabs), [Fender guitar finger numbering](https://www.fender.com/articles/chords/read-guitar-chord-charts), [MDN Web Audio practices](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Best_practices).
