# Practice evidence and map concepts

2026-10-31. Discussion only: instrument-source classification, new progress formulas and the map redesign are not implemented. The user explicitly requested decisions before implementation. The two scoped UI fixes are tracked in issue #13.

## Current behavior, verified from source

`activity()` counts records for a skill with at least one saved attempt, including wrong pitches, unclear signals, skipped notes and self-reports. The ring is distinct active local-calendar days among today and the preceding six days, divided by seven. It reaches full at seven active days, regardless of correctness, and loses segments when those days roll out. It does not complete the skill. Line width is `2 + min(4, recentSetCount)` pixels, so four recent sets already reach maximum thickness. It is an activity display, not a skill/quality measure; all-wrong sessions can grow it. History is limited to the latest 100 sets, which can also affect summaries of older activity.

## Sound source: humming can pass

The detector estimates fundamental pitch and stability. Voice, flute and piano can all produce C4; this does not establish the instrument or hand/finger used. No source-recognition code has been added.

Recommendation: retain the lightweight pitch checker and describe evidence as pitch matched. Later offer MIDI input for compatible digital pianos and investigate optional source-likelihood feedback for acoustic practice. Web MIDI has limited browser availability and needs HTTPS/permission: https://developer.mozilla.org/en-US/docs/Web/API/Web_MIDI_API . MIDI note-on/off establishes events from the selected device, not anatomical finger use or proof against automation.

An acoustic-source experiment would analyze a short onset plus sustained spectrum, spectral envelope/harmonics and attack/decay, then use a small locally executed classifier with piano/voice/flute/other/uncertain outcomes. Source and pitch are separate estimates. Research demonstrates learned timbre/pitch instrument recognition, not guaranteed classification of every home recording: https://arxiv.org/abs/1806.09587 . Evaluate real acoustic and digital piano timbres, voices, bansuri, reverberation, noise and phone microphones before selecting thresholds. Compare missed valid piano notes, mistaken acceptance of other sources, uncertain rate, latency and processing cost. A synthesized keyboard may sound like flute; attack can be missed; playback can imitate an instrument. Do not reject or punish the player based on an unvalidated classifier. Do not add classification delay to the existing pitch response measurement unnoticed.

## Recommended measurements (proposed, not validated mastery)

| Measure | Definition and purpose |
|---|---|
| Activity | Sets, active days and elapsed practice time, explicitly separate from correctness. Elapsed time includes pauses; it is not verified productive practice time. |
| First-attempt pitch match | First scorable stable attempt matches / targets with a scorable first attempt. Latest 30 comparable presented targets is a proposed window, not an established scientific threshold. Report n and separate coverage. The present detector can miss short wrong notes, so call it first detected attempt, not every physical key strike. |
| Correct-response latency | Median time to the first correct response on targets that were correct on their first detected attempt, excluding confirmation hold, hints/view changes and uncalibrated conditions. Keep sample count and difficulty. Fast wrong notes never improve this speed metric. |
| Recovery | Targets initially wrong then eventually matched / targets initially wrong. Also show extra attempts. A correction is learning evidence but does not rewrite the first attempt as correct. |
| Delayed recall | First detected attempt success on fresh random, unhinted prompts across separate days, compared under the same difficulty, view and tonic. A repeated known C4 hold is execution practice, not evidence of broad note recall. This needs a deliberate probe design. |
| Evidence coverage | Targets with scorable pitch / presented targets, with skipped, no response, unclear and silent self-reports separate. No usable sound means unknown, not wrong and not mastered. Silence currently needs explicit end/skip; absence of an event is not proof of an attempt. |

Show performance by note/register/hand cue and errors when enough examples exist, remembering that audio cannot confirm the requested hand. Do not merge different difficulties or notation/tonic/input modes into one growth score.

Example: eight scorable targets, all first attempts wrong and none recovered => 0/8 first-attempt match, 0/8 eventual target match, activity recorded, no correct-response speed and no quality growth. If three are later corrected, recovery is 3/8 while first-attempt match stays 0/8. Two hours elapsed cannot tell us how much sound was played correctly. A bad measurement or missed audio must remain distinguishable from poor performance.

Recommendation for the next map: put a labeled recent first-attempt-match ring on each skill with its sample count, a separate recency/activity marker and a small correct-response-time line where applicable. No data uses a neutral empty state, different from observed 0%. A 100% ring means 100% in the stated sample, not permanent mastery. Require more evidence before showing strong confidence; agree minimum counts/window and optional mastery criteria separately. Missing days can fade a recency marker or say Needs a fresh check; do not automatically lower an accuracy estimate or claim forgotten skill. Re-test to update it.

Use constant thin connectors as navigation/order cues initially. Connections are between different skills, not a score, so thickness has ambiguous meaning. If growth is retained later, define it only from sufficient successful comparable evidence and an accuracy requirement; session count alone must never thicken it. Do not pick a numeric quality gate without labeling it a product hypothesis and evaluating it.

## Map alternatives

| Layout | Benefits | Tradeoff |
|---|---|---|
| Adaptive skill board (recommended) | 3–4 nodes per row on wider screens, two on phones when labels fit; title and short evidence below each circle; complete circle/title area is one native button | Seven skills require multiple rows; reading and keyboard order stay left-to-right then next row |
| Grouped branch map | Recognition, coordination, patterns and reading as useful groups; can grow with more skills | Branches and connectors may imply prerequisites, and become harder to fit on phones |
| Horizontal swipe track | Familiar progression appearance, very compact vertically | Offscreen skills can be missed; requires keyboard/touch/visible navigation and must not turn the entire page into a sideways-scroll canvas |

Recommendation: adaptive skill board, labels below nodes, no separate outward-arrow affordance, visible order numbers and simple fixed connectors only where they communicate an actual relationship. Horizontal reading does not imply horizontal scrolling is universally easier. NN/G reports discoverability issues with desktop horizontal scrolling: https://www.nngroup.com/articles/horizontal-scrolling/ . Preserve ordinary vertical scrolling for overflow and public accessibility standards; never force cramped text or tiny touch targets to fit everything into one row.

Agree the performance-ring meaning, sample/window rules, treatment of missing evidence, growth/connector meaning and target skill grouping before implementing this proposal. No source classifier, score or map geometry changed in issue #13.
