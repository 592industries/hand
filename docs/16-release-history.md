# 16 — Release History

[Documentation home](../README.md) · [Previous: Traceability Matrix](15-traceability-matrix.md)

This chapter records implementation snapshots represented by the case study. A version listed here is not necessarily a published GitHub tag or a confirmed production deployment.

## v2.2.1 — Focused review and upload hardening

Implementation commit: `605adbcb`

- Added lazy browser-side HEIC conversion through the CSP-compatible `heic-to` build.
- Added decode, resize, and compression handling for large phone photos while prioritizing handwriting detail.
- Set limits of 40 MB per source, 8 MB per normalized image, 30 MB combined, and six images.
- Raised the worker body ceiling to 42 MB for base64, reference, and JSON overhead.
- Added server-side PNG/JPEG/WebP header parsing and exact dimension/metadata comparison.
- Made partial chunk writes recoverable and serialized per-session storage changes with cleanup.
- Added a generation guard so expired or manually cleared sessions cannot be repopulated by older background work.
- Started findings and uncertainty groups collapsed.
- Replaced serif transcription presentation with structured interface typography for headings, paragraphs, and nested lists.
- Updated architecture, upload, privacy, security, and release documentation without adding environment variables or a storage service.

Local verification on October 11, 2026:

| Check | Result |
|---|---|
| TypeScript | Passed |
| ESLint | Passed |
| Vitest | 10 files, 30 tests passed |
| Production build | Passed; six public pages prerendered |
| Full DeepSpace suite | Unit and request-only health coverage passed; browser-dependent tests could not launch because the host lacked `libatk-1.0.so.0` |

The GitHub production workflow installs Chromium system dependencies and remains the complete browser/deployment gate after merge to `main`. No v2.2.1 tag or manual deployment was created as part of the implementation.

## v2.2.0 — Analysis experience redesign

Implementation commit: `6fde22bb`

- Persisted a processing record before inference and exposed preparation, transcription, comparison, and finalization stages.
- Added polling, elapsed-time feedback, connection recovery, and safe navigation while the session-backed task continues.
- Made transcription the primary results surface with editing, unsaved-state feedback, and recoverable original output.
- Consolidated scoring and evidence into a focused review layout.
- Preserved scoring, reference comparison, exports, and the account-free session model.

## v2.1.0 — Brand, policies, and privacy evidence

Implementation commit: `7050b917`

- Applied the logo-matched blue light and dark themes.
- Added the branded footer and prerendered Privacy, Terms, Acceptable Use, Cookie/Session, and AI Accuracy pages.
- Simplified New Analysis wording.
- Added the public data inventory, policy decisions, and privacy/security review.

## v2.0.0 — Account-free workspace redesign

- Rebuilt the application shell, dashboard, new-analysis flow, results workspace, library, and Settings.
- Standardized the H.A.N.D name and preserved the anonymous session architecture.

## Earlier milestone

- v1.0.0 introduced the optimized H.A.N.D brand mark, favicon, and responsive brand assets.

[Verification](09-verification-validation.md) · [Architecture](04-system-architecture.md) · [Privacy Review](PRIVACY_SECURITY_REVIEW.md)
