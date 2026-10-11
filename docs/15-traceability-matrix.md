# 15 — Traceability Matrix

[Documentation home](../README.md) · [Previous: Glossary](14-glossary.md)

This matrix is the public evidence index for major implementation claims. Line numbers are intentionally omitted because source changes move them; paths and symbols provide stable review targets.

| Claim | Primary implementation evidence | Verification evidence | Documentation |
|---|---|---|---|
| Account-free random session | `src/server/session-routes.ts`: `newSessionId`, cookie handling | `tests/api.spec.ts`, `tests/collab.spec.ts` | [Session and Privacy](07-session-and-privacy.md) |
| Secure cookie flags | `registerSessionRoutes` | API cookie test | [Cookie policy](https://hand.592industries.com/cookies) |
| Same-origin mutation boundary | `src/server/session-routes.ts`: `sameOrigin`, `forward` | API health/auth and browser suite; source review | [Architecture](04-system-architecture.md) |
| Isolated session records/images | `sessionStub`, `HandSessionRoom`, private image route | Separate browser-context test; exact-record cross-session test remains a gap | [Data Boundaries](../diagrams/data-boundaries.md) |
| Upload limits and signatures | `src/domain/validation.ts`, new-analysis page | `src/domain/validation.test.ts` | [Analysis Pipeline](05-analysis-pipeline.md) |
| Server-only Anthropic path | `src/ai/analysis.ts`, `worker.ts` | Type/build checks; live inference not automated | [Architecture](04-system-architecture.md) |
| Prompt-injection instruction | `SYSTEM_RULES` in `src/ai/analysis.ts` | Source review; model adherence not guaranteed | [Privacy Review](PRIVACY_SECURITY_REVIEW.md) |
| Structured transcription | `transcriptionSchema` | Type/build checks | [Analysis Pipeline](05-analysis-pipeline.md) |
| Evidence-backed finding groups | `comparisonCandidateSchema`, `validateFindingEvidence` | Scoring tests | [Scoring](06-scoring-and-comparison.md) |
| Deterministic score | `src/domain/scoring.ts`: `calculateScore` | `src/domain/scoring.test.ts` | [Scoring](06-scoring-and-comparison.md) |
| Original output preserved | `AnalysisRecord`, review page save behavior | Source review | [User Guide](02-user-guide.md) |
| Stale comparison and rerun | Review page and `HandSessionRoom.rerun` | Source review/browser coverage is partial | [Scoring](06-scoring-and-comparison.md) |
| Session library | Library page and `HandSessionRoom.list` | Browser smoke covers app access; filters source-reviewed | [User Guide](02-user-guide.md) |
| Local exports | `src/domain/export.ts`, review page | `src/domain/export.test.ts` | [User Guide](02-user-guide.md) |
| 30-minute inactivity cleanup | `touch`, `scheduleCleanup`, `alarm` | Source review; time-controlled integration test absent | [Session](07-session-and-privacy.md) |
| Explicit session clear | Settings and `DELETE /api/session` | Settings confirmation smoke test; deletion path source-reviewed | [Session](07-session-and-privacy.md) |
| Light/dark persistence | Navigation and `index.html` | Theme browser test | [Accessibility](13-accessibility-and-usability.md) |
| Public policy routes | Policy page files and `src/prerender-entry.tsx` | Prerender unit and policy browser tests | [Policy Decisions](POLICY_DECISIONS.md) |
| Production checks before deploy | `.github/workflows/deploy.yml` | Workflow source review | [Operations](10-deployment-and-operations.md) |
| No new runtime variables in v2.1 | `ENVIRONMENT.md`, `worker.ts`, workflow | Diff review | [Development Guide](12-development-guide.md) |

## Unverified or partial claims intentionally excluded

The documentation does not claim live model accuracy, guaranteed provider deletion, zero data retention, WCAG conformance, penetration-test results, uptime, performance benchmarks, or verified branch protection. See [Verification and Validation](09-verification-validation.md) for current gaps.
