# H.A.N.D v2.1 architecture

H.A.N.D is public and account-free. The browser receives a random opaque cookie; no name,
email, account, or recoverable identity is created.

Each cookie maps to one SQLite-backed `HandSessionRoom`. The room stores validated image chunks,
analysis results, and a small recent-work index. A hibernatable WebSocket represents the active
browser connection. Valid session requests and active connections refresh activity. When activity
stops, a Durable Object alarm schedules removal of room storage after 30 minutes. Settings also
exposes direct application-level deletion. Provider logs and user downloads are separate from this
session lifecycle.

The worker exposes only the session API and static assets. Mutations require same-origin browser
requests. The AI path additionally enforces a 20 MB request ceiling, image signatures and
dimensions, bounded Zod input/output schemas, six calls per ten minutes, a 20-analysis session
cap, and idempotency keys. DeepSpace owner credentials remain server-only.

v2.1 applies the blue H.A.N.D brand system across light and dark themes, adds a shared branded
footer, and publishes prerendered policy routes. The evidence behind those pages is recorded in
`docs/DATA_INVENTORY.md`, `docs/PRIVACY_SECURITY_REVIEW.md`, and `docs/POLICY_DECISIONS.md`.
