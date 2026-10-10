# H.A.N.D. v0.9 architecture

H.A.N.D. is public and account-free. The browser receives a random opaque cookie; no name,
email, account, or recoverable identity is created.

Each cookie maps to one SQLite-backed `HandSessionRoom`. The room stores validated image chunks,
analysis results, and a small recent-work index. A hibernatable WebSocket represents the active
browser connection. When the final connection closes, a Durable Object alarm removes all room
storage after 30 minutes. Settings also exposes immediate deletion.

The worker exposes only the session API and static assets. Mutations require same-origin browser
requests. The AI path additionally enforces a 20 MB request ceiling, image signatures and
dimensions, bounded Zod input/output schemas, six calls per ten minutes, a 20-analysis session
cap, and idempotency keys. DeepSpace owner credentials remain server-only.
