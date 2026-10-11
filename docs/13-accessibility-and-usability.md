# 13 — Accessibility and Usability

[Documentation home](../README.md) · [Previous: Development Guide](12-development-guide.md) · [Next: Glossary](14-glossary.md)

## Implemented behavior

### Structure and names

- Navigation regions have accessible labels.
- Forms connect visible labels to controls.
- Icon-only controls provide accessible names.
- Status, error, and alert messages use live-region roles where appropriate.
- Source images and the brand mark include alternative text.
- Policy pages use a consistent heading hierarchy.

### Keyboard use

- Links, buttons, form fields, the upload drop zone, and menus are keyboard reachable.
- Enter or Space opens upload source options from the drop zone.
- Global focus-visible outlines use the active theme ring color.
- Base UI dialog primitives manage modal interaction and focus behavior.

### Input alternatives

Users can drag HEIC/JPEG/PNG/WebP images, choose files, or open the device camera. Camera use is optional and restricted to the same origin through the Permissions Policy. A busy state announces browser image optimization and disables analysis until it completes. Reference content can be pasted or selected as a text/Markdown file.

### Review readability

Finding and uncertainty disclosures start collapsed and use native `details`/`summary` keyboard behavior. Counts stay visible before expansion. Transcription content uses the application typeface with consistent line height, paragraph rhythm, heading levels, and nested-list indentation; equations and source annotations retain their separate technical presentation.

### Motion and display

The application provides light and dark themes, responsive breakpoints, touch-friendly controls, and browser zoom-compatible layouts. `prefers-reduced-motion` reduces animation and disables smooth scrolling. Widths use responsive containers rather than fixed desktop canvases.

### Error recovery

Validation errors appear near the relevant area. Failed analysis, missing record, empty library, no-match, stale comparison, and session-clear states have distinct messages and actions. Destructive actions use confirmation dialogs.

## Limits of the evidence

Source review and browser smoke tests establish implemented patterns, not full accessibility conformance. The repository does not contain:

- a completed WCAG audit;
- automated axe or equivalent accessibility scans;
- documented screen-reader results;
- contrast measurements for every component/state;
- a full keyboard test matrix across supported browsers;
- testing for every camera/file picker combination.

No WCAG level or legal accessibility compliance is claimed. A formal audit should include screen readers, keyboard-only use, zoom/reflow, contrast, mobile assistive technology, error announcements, and dialog focus restoration.

## Usability principles

The v2.2.1 interface uses short formal labels, keeps technical limits near upload controls, separates creation into four steps, places source and comparison evidence in one review workspace, and keeps privacy controls in Settings and the shared footer.

[User Guide](02-user-guide.md) · [Verification](09-verification-validation.md)
