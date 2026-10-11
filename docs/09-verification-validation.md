# 09 — Verification and Validation

[Documentation home](../README.md) · [Previous: API and Data Contracts](08-api-and-data-contracts.md) · [Next: Deployment and Operations](10-deployment-and-operations.md)

## Test layers

| Layer | Tool | Current coverage |
|---|---|---|
| Unit | Vitest | scoring, evidence validation, exports, image signatures/dimensions/limits, normalization helpers, collapsed findings, transcription structure, cleanup isolation/retry, and public-page prerendering |
| API | Playwright request context | health endpoint and absence of old browser-auth route |
| Browser smoke | Playwright Chromium | root redirect, brand mark, upload/camera choice, HEIC picker acceptance, JPEG/PNG/WebP browser normalization, malformed-file rejection, theme persistence, Settings confirmation, 404, policies, footer, assets, and no external policy-page requests |
| Session isolation | Playwright browser contexts | distinct anonymous cookies across separate browser contexts |
| Build | TypeScript, ESLint, Vite | types, hooks/style rules, worker/client bundles, six prerendered public routes |
| CI/CD | GitHub Actions | clean install, auth check, browser dependencies, type/lint, full DeepSpace suite, deploy |

## Commands

```bash
npm run type-check
npm run lint
npm run test:unit
npm run build
npx deepspace test run all
```

`npx deepspace test run all` installs the configured browser, runs Vitest, starts the local worker, and runs all Playwright specs. It does not invoke paid AI inference.

## Observed v2.2.1 results

On October 11, 2026, implementation commit `605adbcb` produced:

| Check | Result |
|---|---|
| TypeScript | Passed |
| ESLint | Passed |
| Vitest | 10 files, 30 tests passed |
| Production build | Passed; six public routes prerendered |
| DeepSpace suite | All unit tests and the request-only health test passed; Chromium could not start on the host because `libatk-1.0.so.0` was unavailable, so 10 browser-dependent tests did not execute |

The browser failure occurred before page execution and is not recorded as an application assertion pass. The GitHub workflow uses `playwright install --with-deps chromium`, which installs that system library before the same suite. A green workflow remains the browser acceptance signal.

## Verified requirements

- Scoring weights, renormalization, and evidence validation have direct unit coverage.
- Upload signatures, actual PNG/JPEG/WebP header dimensions, byte limits, base64 overhead, HEIC recognition, output naming, resizing calculations, and cleanup isolation/retry have direct unit coverage.
- Export content and names have direct unit coverage.
- Public pages render without browser globals and contain qualified policy language.
- Separate browser contexts receive different session ids.
- Core UI controls have smoke assertions.

## Gaps

- Automated tests do not call the live model or evaluate transcription quality.
- There is no deployed, deterministic clock-driven integration test for the full 30-minute alarm lifecycle; unit tests cover expired/active room isolation and retry after a deletion failure.
- There is no test that creates a synthetic record in one session and attempts its exact id from another without paid inference.
- No load, soak, chaos, penetration, or formal accessibility test is committed.
- Provider retention and logging cannot be established by application tests.
- No coverage percentage or performance benchmark is claimed.
- A real HEIC fixture and oversized-photo quality comparison were not executed on this host because Chromium could not launch; the conversion path uses the lazy-loaded `heic-to` CSP build and requires CI/device validation.

## Release rule

Do not describe a release as verified merely because the code builds. The deployment workflow must complete all quality gates, including Playwright, before `npx deepspace deploy` runs.

[Product Requirements](03-product-requirements.md) · [Traceability Matrix](15-traceability-matrix.md)
