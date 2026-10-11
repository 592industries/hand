# 03 — Product Requirements

[Documentation home](../README.md) · [Previous: User Guide](02-user-guide.md) · [Next: System Architecture](04-system-architecture.md)

Status is based on the v2.2.1 source at implementation commit `605adbcb`. **Partial** means an implementation exists but verification or provider behavior is incomplete.

## Functional requirements

| ID | Requirement | Status | Evidence |
|---|---|---|---|
| FR-01 | Accept one to six HEIC, JPEG, PNG, or WebP note images and normalize unsupported AI input formats | Implemented | Image-normalization module, new-analysis page, validation module and tests |
| FR-02 | Offer file selection, drag and drop, and camera capture | Implemented | New-analysis page and smoke test |
| FR-03 | Require a title and accept optional subject/topic metadata | Implemented | New-analysis page and request schema |
| FR-04 | Accept optional text/Markdown reference | Implemented | New-analysis page and request schema |
| FR-05 | Produce structured transcription, equations, and uncertainty | Implemented | AI output schema and prompt |
| FR-06 | Preserve original model output after user correction | Implemented | Record fields and review page |
| FR-07 | Compare with a suitable reference and return evidence groups | Implemented | AI comparison and evidence validation |
| FR-08 | Calculate the final score outside the model | Implemented | Scoring module and tests |
| FR-09 | Mark edited comparisons stale and allow rerun | Implemented | Review page and session room |
| FR-10 | Search, filter, sort, reopen, and delete session analyses | Implemented | Library and session API |
| FR-11 | Export Markdown and JSON locally | Implemented | Export module and tests |
| FR-12 | Clear the current session | Implemented | Settings and session API |
| FR-13 | Publish accessible service policies | Implemented | Public routes, footer, prerender tests |
| FR-14 | Start all finding groups collapsed while preserving native keyboard behavior and counts | Implemented | Findings component and unit test |
| FR-15 | Render transcription headings, paragraphs, and nested lists with consistent interface typography | Implemented | Transcription document component and unit test |

## Non-functional requirements

| ID | Requirement | Status | Evidence |
|---|---|---|---|
| NFR-01 | Keep AI credentials and calls server-side | Implemented | Worker AI integration |
| NFR-02 | Isolate data by anonymous session | Implemented | Cookie-derived room routing and browser test |
| NFR-03 | Reject cross-origin mutations and non-JSON writes | Implemented | Session route layer and API tests |
| NFR-04 | Bound source, normalized image, aggregate, request, output, rate, and record sizes | Implemented | Normalization, route, validation, schema, and room constants |
| NFR-05 | Make retried paid operations idempotent | Implemented | Request headers and stored idempotency keys |
| NFR-06 | Schedule isolated cleanup after inactivity and prevent stale in-flight writes | Partial | Serialized room storage, generation guard, cleanup tests; production eviction/restart behavior is not independently tested |
| NFR-07 | Provide visible focus and reduced-motion behavior | Implemented in source | Global styles; no formal accessibility audit |
| NFR-08 | Support responsive layouts | Implemented in source | Responsive classes and browser tests |
| NFR-09 | Prerender policies with metadata and sitemap entries | Implemented | Prerender entry and unit tests |
| NFR-10 | Gate production deploy on automated checks | Implemented in workflow | GitHub Actions; branch protection not verified |

## Acceptance boundaries

AI accuracy is not guaranteed. Scores require a suitable reference. Temporary retention applies only to H.A.N.D-controlled storage. The application has no WCAG, penetration-test, or formal security certification. Automated tests avoid paid inference and do not validate live model quality.

See the [Traceability Matrix](15-traceability-matrix.md) and [Verification and Validation](09-verification-validation.md).
