# Deployment Pipeline

```mermaid
flowchart LR
    Commit["Reviewed commit"] --> Push["Push or merge to main"]
    Push --> Checkout["GitHub Actions checkout"]
    Checkout --> Install["Node and npm clean install"]
    Install --> Auth["Validate DeepSpace session secret"]
    Auth --> Browser["Install Chromium with system dependencies"]
    Browser --> Static["TypeScript and ESLint"]
    Static --> Tests["DeepSpace unit, API, and browser tests"]
    Tests -->|"Fail"| Stop["Stop without deployment"]
    Tests -->|"Pass"| Deploy["npx deepspace deploy"]
    Deploy --> Release["DeepSpace production release"]
```

Feature and `case-study` branches do not trigger production deployment. The workflow authenticates with the GitHub repository secret `DEEPSPACE_SESSION`.

[Deployment and Operations](../docs/10-deployment-and-operations.md) · [Verification](../docs/09-verification-validation.md) · [Documentation home](../README.md)
