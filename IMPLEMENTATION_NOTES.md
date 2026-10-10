# Phase 0 capability note

Verified against the official DeepSpace documentation, CLI, and installed `deepspace@0.39.3` declarations on 2026-10-09.

## Capability matrix

| Area | Directly supported by DeepSpace | H.A.N.D. application logic | Unsupported / bounded |
|---|---|---|---|
| App/runtime | Vite + React + Hono worker scaffold and `app.space` deployment | Routes and interface | Deployment requires owner login/authorization |
| Identity | OAuth, verified JWT, owner/member/admin roles | Protected routes and action ownership checks | None identified |
| Records | SQLite-backed `RecordRoom`, schemas, queries, live sync, RBAC | Versioned `analyses` record and serialization | No server full-text search; local bounded search used |
| Files | Private per-user managed R2, authenticated render/read/delete | Validation, metadata, lifecycle cleanup | Local file upload returns 401 until deployment identity exists |
| AI | `createDeepSpaceAI`, Anthropic/OpenAI/Cerebras model proxy, Vercel AI SDK | Prompts, image parts, Zod schemas, retry bound | Catalog `openai/chat-completion` only accepts strings and was not used for vision |
| Background work | Durable `JobRoom` and progress hooks | Current request-bound orchestration | Not needed at current 14 MB cap; available if latency grows |
| Secrets | Remote DeepSpace secrets store and injected platform credentials | No custom secret required | Provider keys are intentionally unavailable to browser/app source |
| Search | Structured query/filter/sort/limits | Authorized client-side text matching | Bounded to 500 recent records |

## Model and validation

`claude-sonnet-5` is selected through DeepSpace's Anthropic proxy. The installed AI SDK accepts binary image content in user messages. The model produces runtime-validated Zod objects; application code rejects invalid score ranges and missing discrepancy evidence. One bounded SDK retry is allowed.

The reference is placed inside explicit evidence delimiters and the system prompt states that uploaded text is untrusted evidence, not instructions.

## Persistence and access

The `analyses` collection grants members create access and owner-only read/update/delete access. Admins can operate all records. Image objects use `useR2Files()` default `self` scope. The platform derives app/user prefixes server-side; no R2 credential or permanent public URL is exposed.

