# 11 — Limitations and Tradeoffs

[Documentation home](../README.md) · [Previous: Deployment and Operations](10-deployment-and-operations.md) · [Next: Development Guide](12-development-guide.md)

## Current limitations

| Area | Limitation | Effect |
|---|---|---|
| Identity | No accounts or recovery | Sessions cannot be restored after the cookie or server data is lost |
| Retention | Activity-based cleanup, not a fixed cookie expiry | A resumed session can extend the window; provider retention differs |
| Upload | Six normalized images, 8 MB each, 30 MB combined; 40 MB source limit | HEIC is converted in-browser; PDFs, very large sources, and larger sets still require conversion or splitting |
| Reference | Text/Markdown only | No direct PDF or document reference parser |
| Inference | Session background task with polling, not an external durable queue | Navigation is recoverable in the session, but platform execution and the 120-second model timeout still bound work |
| Accuracy | Model output can be incomplete or wrong | Users must verify important text, symbols, equations, and findings |
| Scoring | Depends on a user-supplied suitable reference | No independent truth or instructor-grade guarantee |
| Capacity | 20 analyses and six AI calls per rolling ten minutes per session | Limits abuse but can interrupt heavy legitimate work |
| Portability | Browser-bound session | No cross-device sync or shared workspace |
| Search | In-memory client filtering of the current session list | Appropriate for 20 records, not long-term archives |
| Accessibility | Source includes accessible patterns but has no formal audit | No WCAG conformance claim |
| Verification | Automated suite avoids live paid inference | Model behavior and quality require separate controlled evaluation |

## Deliberate tradeoffs

### Account-free instead of durable identity

This reduces identity collection and login friction. It also removes recovery, cross-device history, and durable user preferences.

### Session Durable Object instead of a general database

One room provides a simple isolation boundary and co-locates records, counters, files, and cleanup. It ties retention to platform alarm behavior and is not designed for permanent archives.

### Session background work instead of an external job service

The create request persists a processing record and returns its id before AI work finishes. The browser polls for progress, while the room uses platform background execution. This avoids a new queue or storage service but does not provide indefinite retry, cross-session recovery, or permanent job history.

### Structured model output plus deterministic score

Schemas and code-owned arithmetic make the stored result predictable and the final weighting auditable. They cannot guarantee that the model's transcription, evidence selection, or dimension judgments are correct.

### Data URLs in JSON

This keeps the API narrow and avoids a separate upload store. The 42 MB request ceiling is sized for base64 overhead above the 30 MB normalized image total, plus reference text and JSON metadata.

## Future considerations

These are directions, not committed features:

- Deployed deterministic time-controlled cleanup integration tests across restart/eviction behavior.
- A synthetic cross-session record-isolation test.
- Provider contract and retention verification.
- Background analysis with durable progress.
- Additional document formats after safe parsing design.
- Real-device HEIC and high-resolution handwriting quality benchmarks.
- Formal accessibility review and independent security assessment.
- Opt-in durable accounts only if the privacy and recovery tradeoff is approved.

[Privacy Review](PRIVACY_SECURITY_REVIEW.md) · [Verification](09-verification-validation.md)
