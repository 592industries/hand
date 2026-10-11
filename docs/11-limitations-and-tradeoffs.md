# 11 — Limitations and Tradeoffs

[Documentation home](../README.md) · [Previous: Deployment and Operations](10-deployment-and-operations.md) · [Next: Development Guide](12-development-guide.md)

## Current limitations

| Area | Limitation | Effect |
|---|---|---|
| Identity | No accounts or recovery | Sessions cannot be restored after the cookie or server data is lost |
| Retention | Activity-based cleanup, not a fixed cookie expiry | A resumed session can extend the window; provider retention differs |
| Upload | Six supported raster images, 4 MB each, 14 MB combined | PDFs, HEIC, and larger sets require conversion or splitting |
| Reference | Text/Markdown only | No direct PDF or document reference parser |
| Inference | Request remains open during AI work | Users must keep the page open; no durable background queue |
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

### Request-bound AI instead of background jobs

The implementation is smaller and returns one direct result. Long requests depend on the browser/network path and have a 120-second model timeout.

### Structured model output plus deterministic score

Schemas and code-owned arithmetic make the stored result predictable and the final weighting auditable. They cannot guarantee that the model's transcription, evidence selection, or dimension judgments are correct.

### Data URLs in JSON

This keeps the API narrow and avoids a separate upload store. Base64 overhead contributes to the 14 MB image cap and 20 MB request ceiling.

## Future considerations

These are directions, not committed features:

- Deterministic time-controlled cleanup integration tests.
- A synthetic cross-session record-isolation test.
- Provider contract and retention verification.
- Background analysis with durable progress.
- Additional input formats after safe parsing design.
- Formal accessibility review and independent security assessment.
- Opt-in durable accounts only if the privacy and recovery tradeoff is approved.

[Privacy Review](PRIVACY_SECURITY_REVIEW.md) · [Verification](09-verification-validation.md)
