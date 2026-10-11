# 12 — Development Guide

[Documentation home](../README.md) · [Previous: Limitations and Tradeoffs](11-limitations-and-tradeoffs.md) · [Next: Accessibility and Usability](13-accessibility-and-usability.md)

## Prerequisites

- Node.js `>=22.15 <23`, or a supported Node 24/26 release.
- npm `>=11.6`.
- DeepSpace CLI access to the H.A.N.D application for platform operations.
- Chromium system dependencies for local Playwright runs.

Read `AGENTS.md` and `.agents/skills/deepspace/SKILL.md` before repository work.

## Install and initialize

```bash
npm install
npx deepspace auth login
npx deepspace app init
npm run dev
```

Do not invent or hand-edit the DeepSpace app identity. Do not add direct model-provider keys; the AI path uses DeepSpace's server-side integration.

## Repository map

| Path | Purpose |
|---|---|
| `src/pages` | File-based frontend routes |
| `src/components` | Shared layout, brand, and UI components |
| `src/domain` | Record parsing, validation, scoring, and export logic |
| `src/ai` | Server-only prompts, model requests, and schemas |
| `src/server` | Session route middleware and Durable Object implementation |
| `tests` | Playwright API, isolation, and smoke tests |
| `worker.ts` | Worker assembly, bindings, headers, and exported room classes |
| `prerender.ts` | Static public-page generation |
| `.github/workflows` | Verification and production deploy pipeline |

## Checks

```bash
npm run type-check
npm run lint
npm run test:unit
npm run build
npx deepspace test run all
```

Unit and Playwright tests are designed not to consume paid AI calls. Manually submitting an analysis in local or deployed H.A.N.D can invoke the paid model path through the app owner's DeepSpace credits.

## Change guidance

- Keep browser and worker code boundaries clear; never import server AI code into the client.
- Validate untrusted inputs on the server even when the browser also validates them.
- Keep idempotency on any retryable paid mutation.
- When changing scoring, update the formula tests and public scoring chapter together.
- When changing retention, providers, cookies, logging, or analytics, update policies and all three privacy evidence documents.
- Add public pages to `src/prerender-entry.tsx` and its tests.
- Preserve the shared navigation/footer and both themes.

## Git and delivery

Create a focused feature branch from the current intended base. Keep secrets, `.dev.vars`, generated `dist`, and local `.deepspace` state out of commits. Review `git diff --check`, run checks, commit, then push the named branch. Do not deploy feature or documentation branches manually when the release is intended to flow through `main` CI.

## Environment values

The only GitHub deployment secret is `DEEPSPACE_SESSION`. DeepSpace supplies runtime bindings and server credentials. See [ENVIRONMENT.md](../ENVIRONMENT.md) for the complete inventory and handling rules.

[Operations](10-deployment-and-operations.md) · [Verification](09-verification-validation.md)
