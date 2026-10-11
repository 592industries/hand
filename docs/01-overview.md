# 01 — Overview

[Documentation home](../README.md) · [Next: User Guide](02-user-guide.md)

## Product purpose

H.A.N.D helps students and other note users convert handwritten academic pages into editable text without losing equations, uncertain passages, or the original model output. It also supports an optional reference comparison for users who want evidence about how closely their notes correspond to supplied material.

## Problem

Handwritten notes are difficult to search, revise, reuse, and compare. General OCR can flatten structure, silently guess unclear text, or mishandle technical notation. A useful note tool must preserve uncertainty, make corrections possible, and explain what a comparison score means.

## Target users

- Students organizing or reviewing their own notes.
- Educators or tutors reviewing material they are authorized to process.
- Researchers and technical users digitizing handwritten study material.
- Any user who needs a temporary, account-free transcription workspace.

## Main capabilities

| Capability | Meaning |
|---|---|
| Transcription | Converts visible handwriting into structured text and marks uncertainty |
| Organization | Extracts sections, equations, concepts, a summary, tags, and subject/topic suggestions |
| Reference comparison | Compares the transcription with material supplied by the user |
| Scoring | Combines validated dimension scores using application-owned weights |
| Review | Lets the user correct text while preserving the original AI output |
| Session library | Searches, filters, sorts, reopens, exports, and deletes current-session analyses |

## Important distinctions

Transcription records what the model reads. Organization describes that transcription. Reference comparison evaluates correspondence with a supplied reference. Scoring summarizes the comparison dimensions. None of these establishes independent truth or a formal academic grade.

## System boundaries

H.A.N.D owns the browser interface, validation rules, prompt instructions, schemas, evidence checks, deterministic score calculation, session routes, session storage, and export generation. DeepSpace supplies hosting, Durable Object infrastructure, and the server-side AI access layer. Anthropic supplies the configured model. Browser and provider behavior outside these boundaries remains outside direct application control.

## Goals

- Preserve visible evidence and uncertainty instead of inventing missing content.
- Keep provider credentials and AI requests on the server.
- Isolate each anonymous session.
- Make comparison evidence inspectable.
- Provide short, direct controls on mobile and desktop.
- Explain privacy and AI limits accurately.

## Not provided

H.A.N.D does not provide user accounts, long-term cloud notebooks, cross-device recovery, instructor grading, verified factual answers, real-time collaboration, billing, or professional advice.

## Related documents

[Product Requirements](03-product-requirements.md) · [System Architecture](04-system-architecture.md) · [Limitations](11-limitations-and-tradeoffs.md)
