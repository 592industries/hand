# H.A.N.D v2.2.1 architecture

H.A.N.D is public and account-free. The browser receives a random opaque cookie; no name,
email, account, or recoverable identity is created.

Each cookie maps to one SQLite-backed `HandSessionRoom`. The room stores validated image chunks,
analysis results, and a small recent-work index. A hibernatable WebSocket represents the active
browser connection. Valid session requests and active connections refresh activity. When activity
stops, a Durable Object alarm schedules removal of room storage after 30 minutes. Settings also
exposes direct application-level deletion. Provider logs and user downloads are separate from this
session lifecycle.

The worker exposes only the session API and static assets. Mutations require same-origin browser
requests. The browser converts HEIC and oversized phone photos to validated JPEG or PNG files,
limited to 8 MB each, 30 MB total, and six images. The AI path additionally enforces a 42 MB
request ceiling for base64 overhead, image signatures and dimensions, bounded Zod input/output schemas, six calls per ten minutes, a 20-analysis session
cap, and idempotency keys. DeepSpace owner credentials remain server-only.

Storage mutations and cleanup are serialized within each session room. A generation guard prevents
an in-flight analysis from restoring files after manual or inactivity cleanup. Failures during a
multi-file save remove that analysis's partial chunks without affecting another session.

The blue H.A.N.D brand system, shared branded footer, and prerendered policy routes remain in place.
The evidence behind those pages is recorded in
`docs/DATA_INVENTORY.md`, `docs/PRIVACY_SECURITY_REVIEW.md`, and `docs/POLICY_DECISIONS.md`.
