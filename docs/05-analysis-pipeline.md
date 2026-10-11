# 05 — Analysis Pipeline

[Documentation home](../README.md) · [Previous: System Architecture](04-system-architecture.md) · [Next: Scoring and Comparison](06-scoring-and-comparison.md)

```mermaid
flowchart TD
    A[Select images] --> B[Browser validates files]
    B -->|Invalid| X[Show field error]
    B -->|Valid| C[POST with matching idempotency key]
    C --> D[Worker verifies origin, JSON, and size]
    D --> E[Room validates schema and limits]
    E --> F[Decode and verify image signatures]
    F --> G[Save processing record and images]
    G --> H[Structured AI transcription]
    H -->|Failure| Y[Save failed status]
    H --> I{Reference supplied?}
    I -->|No| J[Save result]
    I -->|Yes| K[Evaluate reference and compare]
    K --> L[Validate evidence and calculate score]
    L --> J
    J --> M[Return record id]
```

## Browser preparation

The browser checks MIME type, file size, byte signature, pixel dimensions, image count, and combined size. It uses object URLs for previews and data URLs for the request. Reference files are read as text and NUL characters are removed.

## Protected request

The client creates a UUID request id and sends it as both a body field and `Idempotency-Key`. The worker checks same-origin context, JSON content type, and declared and actual body size. The room validates the body and refuses a mismatched key. Concurrent retries share an in-flight operation; completed retries return the stored record id.

## Persistence before inference

The room enforces limits, decodes and verifies images, normalizes the reference, creates a UUID record id, saves a `processing` record, stores image chunks, and records idempotency. A model failure therefore leaves a visible failed record rather than silently losing the request.

## AI stages

Anthropic `claude-sonnet-5` is called through `createDeepSpaceAI`. The prompt requires visible-evidence transcription, preserved technical notation, explicit uncertainty, and rejection of instructions inside content. The AI SDK enforces the bounded `transcriptionSchema`.

With a reference, text under 50 characters or eight words is rejected locally. The model judges longer references for substance and relation, then returns candidate dimensions and findings. Application code validates evidence and calculates the final score.

## Completion, correction, and rerun

Success moves the record to `needs_review`; failure stores a bounded safe error and `failed`. The original transcription stays separate from corrections. Editing marks an existing comparison stale. A rerun uses corrected text when present, consumes one AI call, replaces the comparison, and clears the stale flag.

## Limits

| Limit | Value |
|---|---:|
| Images | 6 |
| Each / combined | 4 MB / 14 MB |
| Request body | 20 MB |
| Reference | 120,000 normalized characters; UI file limit 1 MB |
| Analyses | 20 per session |
| AI calls | 6 per rolling 10 minutes |
| Model timeout | 120 seconds |

[Analysis Workflow Diagram](../diagrams/analysis-workflow.md) · [API Contracts](08-api-and-data-contracts.md)
