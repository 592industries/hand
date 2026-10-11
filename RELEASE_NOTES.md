# H.A.N.D v2.2.2

H.A.N.D v2.2.2 improves startup speed and reliability on iPhone and other mobile devices.

## Highlights

- Shows a lightweight branded loading state before JavaScript is ready and mounts client routes immediately.
- Targets Safari 15 and newer while separating optional UI code from the initial application bundle.
- Caches hashed production assets for repeat visits and keeps full-height layouts within the visible mobile viewport.
- Pauses the session connection while a phone is offline or backgrounded and uses bounded retry backoff after failures.
- Adds iPhone safe-area spacing and a phone-width regression check.

## Compatibility

No storage migration, environment variable, API, scoring, or provider change is required.

---

# H.A.N.D v2.2.1

H.A.N.D v2.2.1 refines review readability and makes phone-photo uploads safer and more reliable.

## Highlights

- Starts every findings and uncertainty section collapsed while preserving accessible native controls and counts.
- Replaces transcription serif styling with the interface typeface and consistent spacing for headings, paragraphs, and nested lists.
- Accepts HEIC, JPEG, PNG, and WebP sources, then validates, resizes, and compresses them in the browser before upload when needed.
- Raises normalized upload limits to 8 MB per image and 30 MB total across six images, with a 42 MB server request ceiling for base64 overhead.
- Serializes session cleanup and storage writes so an expired or manually cleared session cannot be repopulated by in-flight analysis work.

## Compatibility

No storage migration, environment variable, scoring, export, or provider change is required.

---

# H.A.N.D v2.2.0

H.A.N.D v2.2.0 makes analysis progress transparent and turns results into a focused document-review workspace.

## Highlights

- Starts analysis as a session-backed background job and reports real preparation, transcription, comparison, and finalization stages.
- Adds resilient 3.5-second status polling, elapsed time, reconnect feedback, and safe navigation while work continues.
- Makes the transcription the main results surface, with explicit editing, unsaved-change feedback, and recoverable original AI output.
- Consolidates reference metrics and evidence into a compact summary with accessible expandable findings.
- Omits non-applicable technical scores instead of presenting them as failures.
- Standardizes loading and empty states and replaces the oversized footer with the required compact 592 Industries attribution.

## Compatibility

Existing session records remain readable. No new environment variables or provider credentials are required.

---

# H.A.N.D v2.1.0

H.A.N.D v2.1.0 completes the product's blue brand system and adds evidence-based privacy and service policies without changing the analysis, scoring, or account-free session model.

## Highlights

- Replaced the green interface palette with logo-matched blue light and dark themes.
- Added a compact shared footer with the full H.A.N.D logo, parent-brand details, verified support information, and policy links.
- Added prerendered Privacy, Terms, Acceptable Use, Cookie/Session, and AI Accuracy routes.
- Simplified the New Analysis page and replaced explanatory copy with direct labels and essential limits.
- Documented the data inventory, session-retention limits, provider boundaries, threat review, and policy decisions.
- Kept the existing logo mark, optimized favicon/touch assets, upload flow, AI behavior, scoring, exports, and session controls intact.

## Compatibility

No new environment variables, storage migrations, endpoint changes, or provider credentials are required.

---

# H.A.N.D v2.0.0

H.A.N.D v2.0.0 introduces a complete interface redesign while preserving the account-free, session-scoped analysis workflow and existing backend behavior.

## Highlights

- Rebuilt the application shell with a compact responsive navigation, optimized brand mark, persistent light/dark themes, and clearer temporary-session status.
- Redesigned the dashboard around a concise workspace overview, prominent New Analysis action, and streamlined recent work.
- Reorganized New Analysis into four numbered steps with upload and camera choices, visible limits, local validation, and one clear completion action.
- Improved the results workspace with a larger editing surface, clearer score context, evidence-focused findings, source previews, exports, and accessible destructive-action confirmation.
- Added a searchable, filterable, sortable library with distinct empty and no-results states.
- Reduced Settings to the required temporary-data notice and an immediate session-clearing control with confirmation, success, and error feedback.
- Standardized product naming as `H.A.N.D`, refined both visual themes, improved focus treatment, and honored reduced-motion preferences.

## Compatibility

No storage schema, AI behavior, session lifecycle, route contract, or environment-variable changes are included in this release.
