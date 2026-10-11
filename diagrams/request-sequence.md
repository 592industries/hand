# Analysis Request Sequence

```mermaid
sequenceDiagram
    actor User
    participant Browser
    participant Worker as H.A.N.D Worker
    participant Room as HandSessionRoom
    participant DeepSpace as DeepSpace AI
    participant Model as Anthropic Model

    User->>Browser: Select images and start
    Browser->>Browser: Convert or optimize, validate, create request id
    Browser->>Worker: POST analysis with cookie and idempotency key
    Worker->>Worker: Check origin, JSON, and body size
    Worker->>Room: Forward inside cookie-selected room
    Room->>Room: Validate actual bytes/dimensions and persist processing record
    Room-->>Worker: Processing record id
    Worker-->>Browser: No-store JSON response
    Browser-->>User: Show progress and poll record
    Room->>DeepSpace: Background structured transcription request
    DeepSpace->>Model: Model inference
    Model-->>DeepSpace: Structured candidate output
    DeepSpace-->>Room: Validated transcription
    opt Suitable reference supplied
        Room->>DeepSpace: Comparison request
        DeepSpace->>Model: Model inference
        Model-->>DeepSpace: Candidate findings and dimensions
        DeepSpace-->>Room: Structured comparison candidate
        Room->>Room: Validate evidence and calculate score
    end
    Room->>Room: Save final or failed state if session generation is current
    Browser->>Worker: Poll analysis record
    Worker->>Room: Read current-session record
    Room-->>Worker: Complete or failed state
    Worker-->>Browser: No-store record response
    Browser-->>User: Open review workspace
```

The initial response returns a processing record id. Polling later exposes the complete or failed record, allowing the user to review or delete it.

[API and Data Contracts](../docs/08-api-and-data-contracts.md) · [Analysis Pipeline](../docs/05-analysis-pipeline.md) · [Documentation home](../README.md)
