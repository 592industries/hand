# 08 — API and Data Contracts

[Documentation home](../README.md) · [Previous: Session and Privacy](07-session-and-privacy.md) · [Next: Verification and Validation](09-verification-validation.md)

The API is same-origin and cookie-bound. It is an internal browser API, not a public account API. JSON endpoints normally return `{ "success": true, "data": ... }` or `{ "success": false, "error": "..." }` with `Cache-Control: no-store`.

## Routes

| Method | Route | Purpose | Notable behavior |
|---|---|---|---|
| GET | `/api/session/health` | Worker/session route liveness | Does not create a session |
| POST | `/api/session` | Initialize or confirm the current session | Sets the secure session cookie; returns `expiresInMinutes: 30` |
| DELETE | `/api/session` | Clear current room storage | Requires a valid cookie and same-origin request |
| GET | `/api/session/analyses` | List current-session records | Newest updated first |
| POST | `/api/session/analyses` | Create and process an analysis | JSON plus matching UUID idempotency header |
| GET | `/api/session/analyses/:id` | Read one record | 404 if absent from this room |
| PATCH | `/api/session/analyses/:id` | Save title, correction, stale flag, or saved state | Bounded title and corrected text |
| DELETE | `/api/session/analyses/:id` | Delete record and image chunks | Current room only |
| GET | `/api/session/analyses/:id/images/:index` | Read a source image | Private/no-store, original MIME type |
| POST | `/api/session/analyses/:id/rerun` | Recompare corrected/original text | Requires a reference and UUID idempotency key |
| WebSocket | `/api/session/connect` | Track an active browser connection | Ping/pong refreshes activity |

Unknown `/api` routes return 404 instead of the SPA shell.

## Request controls

- WebSocket upgrades and non-read methods require same-origin evidence.
- POST/PATCH requests require `application/json`.
- Declared and actual request bodies are capped at 42 MB, leaving room for base64 overhead above the 30 MB normalized image total.
- Normalized image data is limited to six files, 8 MB each, 30 MB combined; signatures, decoded byte lengths, and header-derived dimensions must match metadata.
- The session cookie must match the expected 43-character base64url shape.
- Analysis and rerun operations are limited and idempotent.

Some domain refusals from analysis, update, delete, and rerun are represented as `success: false` in an otherwise successful JSON response, while missing record reads and unknown routes use HTTP 404. Clients must inspect the envelope, not only the HTTP status.

## Create-analysis shape

Synthetic example, shortened for readability:

```json
{
  "requestId": "00000000-0000-4000-8000-000000000000",
  "title": "Calculus notes",
  "subject": "Mathematics",
  "topic": "Integration",
  "referenceText": "Optional reference content ...",
  "referenceFileName": "reference.md",
  "imageFiles": [
    {
      "key": "0",
      "name": "page-1.png",
      "mimeType": "image/png",
      "size": 1024,
      "width": 800,
      "height": 1200
    }
  ],
  "imageDataUrls": ["data:image/png;base64,<redacted>"]
}
```

The matching `Idempotency-Key` header must contain the same request UUID. HEIC is a browser input format, not a stored API MIME type: it is converted before this request, so the API accepts normalized `image/jpeg`, `image/png`, or `image/webp` data only.

## Stored analysis contract

Each session envelope contains `recordId`, `createdAt`, `updatedAt`, and `data`. The data record includes metadata, status, serialized image metadata, reference text, original structured transcription, a separate correction, serialized comparison, stale flag, model/prompt identifiers, and safe error summary.

Statuses are `processing`, `needs_review`, `saved`, or `failed`. The schema version is currently `1`.

## Output schemas

Transcription includes full text, sections, equations, key concepts, summary, suggested metadata/tags, uncertainties, and legibility. Comparison includes suitability, optional limitation and dimensions, technical applicability, evidence groups, explanation, suggested corrections, and a nullable calculated score.

All examples must use synthetic ids and redacted content. Never publish a production cookie or user note.

[Request Sequence Diagram](../diagrams/request-sequence.md) · [Analysis Pipeline](05-analysis-pipeline.md)
