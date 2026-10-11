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
    Browser->>Browser: Validate files and create request id
    Browser->>Worker: POST analysis with cookie and idempotency key
    Worker->>Worker: Check origin, JSON, and body size
    Worker->>Room: Forward inside cookie-selected room
    Room->>Room: Validate, reserve limits, and persist processing record
    Room->>DeepSpace: Structured transcription request
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
    Room->>Room: Save final or failed state
    Room-->>Worker: Record id
    Worker-->>Browser: No-store JSON response
    Browser-->>User: Open review workspace
```

The response can report a failed record while still returning its id, allowing the user to see and delete the failed item.

[API and Data Contracts](../docs/08-api-and-data-contracts.md) · [Analysis Pipeline](../docs/05-analysis-pipeline.md) · [Documentation home](../README.md)
