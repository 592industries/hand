# 15 — Traceability Matrix

[Documentation home](../README.md) · [Previous: Glossary](14-glossary.md) · [Next: Release History](16-release-history.md)

This matrix is the public evidence index for major implementation claims. Line numbers are intentionally omitted because source changes move them; paths and symbols provide stable review targets.

| Claim | Primary implementation evidence | Verification evidence | Documentation |
|---|---|---|---|
| Account-free random session | `src/server/session-routes.ts`: `newSessionId`, cookie handling | `tests/api.spec.ts`, `tests/collab.spec.ts` | [Session and Privacy](07-session-and-privacy.md) |
| Secure cookie flags | `registerSessionRoutes` | API cookie test | [Cookie policy](https://hand.592industries.com/cookies) |
| Same-origin mutation boundary | `src/server/session-routes.ts`: `sameOrigin`, `forward` | API health/auth and browser suite; source review | [Architecture](04-system-architecture.md) |
| Isolated session records/images | `sessionStub`, `HandSessionRoom`, private image route | Separate browser-context test; exact-record cross-session test remains a gap | [Data Boundaries](../diagrams/data-boundaries.md) |
| HEIC and phone-photo normalization | `src/lib/image-normalization.ts`, new-analysis page | `src/lib/image-normalization.test.ts`, upload browser smoke test | [Analysis Pipeline](05-analysis-pipeline.md) |
| Upload limits, signatures, and actual dimensions | `src/domain/validation.ts`, `HandSessionRoom.prepareAnalysis` | `src/domain/validation.test.ts` | [API Contracts](08-api-and-data-contracts.md) |
| Server-only Anthropic path | `src/ai/analysis.ts`, `worker.ts` | Type/build checks; live inference not automated | [Architecture](04-system-architecture.md) |
| Prompt-injection instruction | `SYSTEM_RULES` in `src/ai/analysis.ts` | Source review; model adherence not guaranteed | [Privacy Review](PRIVACY_SECURITY_REVIEW.md) |
| Structured transcription | `transcriptionSchema` | Type/build checks | [Analysis Pipeline](05-analysis-pipeline.md) |
| Evidence-backed finding groups | `comparisonCandidateSchema`, `validateFindingEvidence` | Scoring tests | [Scoring](06-scoring-and-comparison.md) |
| Findings collapsed initially | `src/components/FindingGroup.tsx`, review page | `src/components/FindingGroup.test.tsx` | [Accessibility](13-accessibility-and-usability.md) |
| Structured transcription typography | `src/components/TranscriptionDocument.tsx` | `src/components/TranscriptionDocument.test.tsx` | [User Guide](02-user-guide.md) |
| Deterministic score | `src/domain/scoring.ts`: `calculateScore` | `src/domain/scoring.test.ts` | [Scoring](06-scoring-and-comparison.md) |
| Original output preserved | `AnalysisRecord`, review page save behavior | Source review | [User Guide](02-user-guide.md) |
| Stale comparison and rerun | Review page and `HandSessionRoom.rerun` | Source review/browser coverage is partial | [Scoring](06-scoring-and-comparison.md) |
| Session library | Library page and `HandSessionRoom.list` | Browser smoke covers app access; filters source-reviewed | [User Guide](02-user-guide.md) |
| Local exports | `src/domain/export.ts`, review page | `src/domain/export.test.ts` | [User Guide](02-user-guide.md) |
| 30-minute isolated inactivity cleanup | `withStorageLock`, generation guard, `alarm`, `clearSession` | Cleanup isolation/retry unit tests; deployed time-controlled test absent | [Session](07-session-and-privacy.md) |
| Explicit session clear | Settings and `DELETE /api/session` | Settings confirmation smoke test; deletion path source-reviewed | [Session](07-session-and-privacy.md) |
| Light/dark persistence | Navigation and `index.html` | Theme browser test | [Accessibility](13-accessibility-and-usability.md) |
| Public policy routes | Policy page files and `src/prerender-entry.tsx` | Prerender unit and policy browser tests | [Policy Decisions](POLICY_DECISIONS.md) |
| Production checks before deploy | `.github/workflows/deploy.yml` | Workflow source review | [Operations](10-deployment-and-operations.md) |
| No new runtime variables in v2.2.1 | `ENVIRONMENT.md`, `worker.ts`, workflow | Diff review | [Development Guide](12-development-guide.md) |

## Unverified or partial claims intentionally excluded

The documentation does not claim live model accuracy, guaranteed provider deletion, zero data retention, WCAG conformance, penetration-test results, uptime, performance benchmarks, or verified branch protection. See [Verification and Validation](09-verification-validation.md) for current gaps.
