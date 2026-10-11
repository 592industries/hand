# 14 — Glossary

[Documentation home](../README.md) · [Previous: Accessibility and Usability](13-accessibility-and-usability.md) · [Next: Traceability Matrix](15-traceability-matrix.md)

| Term | Definition |
|---|---|
| Analysis | One saved session record containing source metadata, transcription, optional comparison, and review state |
| Comparison finding | A structured claim with evidence and explanation produced during reference evaluation |
| Coverage | The scoring dimension for how much important reference material appears in the notes |
| Durable Object | Cloudflare's stateful compute/storage primitive; H.A.N.D uses one isolated room per random session id |
| Evidence validation | Application checks that a finding's reference evidence is supported by normalized reference text |
| Idempotency | Returning the same result for a retried logical request instead of repeating paid work |
| Legibility | Model classification of the visible handwriting as high, medium, or low readability |
| Original transcription | The first structured transcription returned by the model and preserved after edits |
| Reference material | Optional user-supplied text used as the basis for comparison |
| Reference suitability | Whether the reference is substantial and related enough to justify scoring |
| Schema validation | Checking untrusted input or model output against explicit types, bounds, and allowed values |
| Semantic agreement | The scoring dimension for consistency of meaning between notes and reference |
| Stale comparison | A saved comparison that no longer matches the edited transcription |
| Technical fidelity | The scoring dimension for equations, formulas, notation, and precision-sensitive details |
| Temporary session | The account-free browser workspace selected by a random secure cookie and subject to inactivity cleanup |
| Transcription | Structured text derived from visible handwritten-note evidence |
| Uncertainty | A passage the model cannot read confidently, with a reason and possible alternatives |
| Unsupported addition | A substantive statement in the notes that the supplied reference does not support |

[Scoring and Comparison](06-scoring-and-comparison.md) · [Session and Privacy](07-session-and-privacy.md)
