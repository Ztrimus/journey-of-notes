# Compact history and attempts — issue #24

## Direction

The owner's screenshots showed a tall repeated attempt card and a history grid that required too much phone scrolling. Replace attempt cards with 56px circular note buttons, an outcome badge and elapsed time. Read left to right, wrapping onto the next row. Selection reveals one shared detail area with full note/register, outcome, heard wrong note and available response/confirmation times. Results and history share the same component. No measurement formula or stored record changes.

History has one date-grouped timeline. A small circle shows first-try pitch match; its text and the timeline legend explain the number. Missing evidence/silent practice stays neutral. The circle and skill title open the full report. Instrument, local time, matched targets, duration and early ending remain visible. Attempts expand across the available width. Pagination stays bounded and moves focus to the newly shown content. Grid controls and repeated card borders are removed.

The history heading is smaller, backup actions share a row, and longer storage guidance uses native disclosure. Export / Clear / Import order, app-only clear confirmation, backup behavior and existing data are preserved.

## References reviewed

- [Lollypop: Stepper UI](https://lollypop.design/blog/2026/february/beyond-the-progress-bar-the-art-of-stepper-ui-design/): concise labels, clear state and an appropriate layout for the available space. We adapt the visual sequence, rather than turn a historical event list into a mandatory wizard or show upcoming drill answers.
- [Figma: UI principles](https://www.figma.com/resource-library/ui-design-principles/): hierarchy, proximity, alignment and progressive disclosure informed the smaller overview and details on selection.
- [Designmodo: Progress-step patterns](https://designmodo.com/progress-step-ui/): combine short text and recognizable visual states consistently. Outcome symbols accompany colors; circles retain the note label.
- [Improve Your UI Design FAST With These Exercises](https://www.youtube.com/watch?v=1CMVhR1ctF4) and [4 levels of UI/UX design](https://www.youtube.com/watch?v=86PGRyQjdzQ&t=621s): both pages opened and titles were verified, but transcript export returned unavailable for each. Full video content was not reviewed; no design claim is attributed to an unreviewed video.

## Interaction and accessibility

Use native buttons for note selection, normal Tab/Enter/Space behavior, expanded/control relationships, a polite shared detail region and native disclosures. Preserve focus on selection. After pagination, focus the first newly shown note or date heading. Full accessible names disambiguate repeated notes and include outcomes/times. Bansuri/vocal Sargam circles show the swar plus Western pitch; selection retains the complete register label. No camera/audio validation behavior changed.

Native ordered lists retain explicit list roles because [Safari can suppress list semantics when list-style is none](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/list-style). Respect the existing focus and reduced-motion rules. Colors are supplemented by drawn SVG outcome symbols and full text details.

Verification belongs in `verification.md`. Screen-reader announcements and actual phone-browser checks remain manual follow-up; desktop viewport emulation is not a substitute for those checks.
