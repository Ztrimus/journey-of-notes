# Report and response estimates — issue #22

The four primary cards are attempt distribution, first-try target accuracy, average correct response and retries. A ring combines matched/wrong attempt shares and counts. Labels accompany color. Unclear/skipped attempts remain separate; a zero-evidence ring stays neutral. Whole percentages total 100%, while the arc uses the actual fraction.

Targets and attempts differ: a target initially wrong and later corrected contributes two attempts but one eventually matched target. Unique targets matched and pitch-evidence coverage remain in the explanation, rather than another primary card.

Metric help is a fixed floating tooltip outside the card layout. Hover/focus opens it; click pins/toggles it for touch. Escape/outside interaction dismisses it without stealing focus; the pointer can move into the tooltip. A small delay bridges the gap. Native buttons and explicit tooltip associations support browsers without interest invokers or CSS anchors. No dependency was added.

## Why response was absent

The former capture and aggregation deliberately allowed only random reflex lesson IDs. The annotated example was guided piano p3. Historical data cannot be fabricated.

New sessions use optional `responseProtocol: prompt-v2` metadata. Existing history/imports still work. The capture baseline and candidate-onset estimate are unchanged, but guided sets now capture them too. Their known sequence makes anticipation possible: this is a guided response estimate, not a surprise-note reflex benchmark or calibrated biological reaction time.

The primary number is the arithmetic mean of first-try correct microphone targets with hints off and unchanged cues. Each target counts once. First errors followed by correction, changed cues, hinted targets, silent practice and absent samples cannot improve it. Confirmation hold is separate. The tooltip provides the median as a secondary explanation. Read the mean with accuracy and sample size; there is no aptitude label or normative ranking.

Response comparisons require the same timing protocol and existing lesson/instrument/difficulty/view/hint/tonic/notation conditions. Protocol differences do not discard pitch history. Skill-board reflex time remains random-only. Hiding the document already ends the active set, avoiding a hidden-tab baseline.

Research context: a [primary study of pianists' visual monitoring](https://bop.unibe.ch/JEMR/article/view/8588) reports practice/structure effects and anticipation differences. Our product inference is to keep guided and surprise-note conditions separate. It does not validate our detector or a universal speed target. Real instrument/device calibration remains necessary.

## Public explanation boundary

About carries the owner's personal music/dance story, current capabilities and sharing controls. Sharing uses the system chooser or copies a public project link/caption; no post is sent automatically and no practice records enter the payload.

Public UI explains practical use, metric meanings, privacy and accuracy limits. Algorithm names and internal acceptance thresholds belong in engineering documentation. This does not create code secrecy: browser JavaScript and the existing public GitHub repository remain inspectable. No credentials, repository visibility, global Git settings, analytics or cloud services changed.

Accessibility references: [W3C hover/focus content guidance](https://www.w3.org/WAI/WCAG22/Understanding/content-on-hover-or-focus.html) and the [APG tooltip pattern](https://www.w3.org/WAI/ARIA/apg/patterns/tooltip/). These guide behavior, not a claim of complete accessibility conformance.
