# Analysis Workflow

```mermaid
flowchart TD
    Start["Select or capture note images"] --> ClientCheck["Client checks, converts HEIC, and optimizes size"]
    ClientCheck -->|"Invalid"| ClientError["Show field error"]
    ClientCheck -->|"Valid"| Request["Send JSON request and idempotency key"]
    Request --> WorkerCheck["Check origin, content type, and body size"]
    WorkerCheck -->|"Rejected"| HttpError["Return safe error"]
    WorkerCheck --> RoomCheck["Check schema, limits, metadata, and bytes"]
    RoomCheck -->|"Rejected"| DomainError["Return bounded error"]
    RoomCheck --> Persist["Save processing record and normalized chunks"]
    Persist --> Return["Return record id"]
    Return --> Poll["Browser polls processing stage"]
    Poll --> Ready{"Complete or failed?"}
    Ready -->|"No"| Poll
    Return --> Transcribe["Background structured AI transcription"]
    Transcribe -->|"Failure"| Failed["Save failed record"]
    Transcribe --> Ref{"Reference present?"}
    Ref -->|"No"| Complete["Save review record"]
    Ref -->|"Yes"| Compare["Suitability and comparison"]
    Compare --> Evidence["Validate evidence and calculate score"]
    Evidence --> Complete
    Complete --> Ready
    Failed --> Ready
    Ready -->|"Yes"| Review["Review collapsed findings, correct, export, or delete"]
```

Persistence occurs before inference so a failed operation has a visible session record. The model proposes comparison dimensions; application code owns final scoring.

[Analysis Pipeline](../docs/05-analysis-pipeline.md) · [Reference Comparison](reference-comparison.md) · [Documentation home](../README.md)
