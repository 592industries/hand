# H.A.N.D privacy and security review

Updated: October 10, 2026

This is an engineering review of the anonymous-session design, not a penetration test, legal opinion, or certification. Severity reflects likely impact and ease of abuse based on the inspected code.

| Risk | Severity | Evidence | Current mitigation | Status |
|---|---|---|---|---|
| Cross-session access | High | Session room is selected from a random cookie-derived identity; analysis routes do not accept a session id | High-entropy identifier, host-only secure cookie, isolated room storage, record lookup inside the room | Mitigated in design; browser test confirms separate contexts receive different sessions, but no full external audit |
| Session-cookie theft | High | The active cookie grants access to its session | HttpOnly, Secure, SameSite=Strict, `__Host-` prefix, no value in URLs, TLS expected at deployment | Reduced, not eliminated; compromised devices or browsers remain a risk |
| Session fixation | Medium | A valid cookie is reused | Strict format validation; invalid values are replaced with a random identifier; cross-origin mutations are rejected | Mitigated in code |
| Direct access to uploaded images | High | Images are served through a session API route | Image index and analysis id are resolved only inside the current session room; responses are private/no-store; no public object URL is created | Mitigated in code |
| Insecure direct object reference | High | Analysis ids appear in app URLs | Every operation is routed through the cookie-selected room before record lookup | Mitigated in design; dedicated cross-session record test remains desirable |
| Cross-site request forgery | High | Mutations and session WebSocket could be targeted from another origin | Same-origin/`Sec-Fetch-Site` checks, strict SameSite cookie, JSON content requirement | Mitigated in code and API tests |
| Prompt injection in notes or references | High | User content is included in AI requests | Prompts label uploads as untrusted data and direct the model not to follow embedded instructions; outputs are schema validated | Reduced; model behavior cannot be guaranteed |
| Malformed or oversized images | Medium | Browser and server receive user-controlled files | MIME allowlist, byte-signature check, per-file and total limits, dimension bounds, request body limit | Mitigated in code and unit tests; decompression behavior depends on provider/runtime |
| AI cost or resource abuse | High | Analysis and rerun actions consume model resources | Per-session analysis cap, rolling AI-call limit, upload/body limits, idempotency, same-origin checks | Reduced; distributed abuse across new sessions remains possible |
| Duplicate processing | Medium | Network retries can repeat paid work | Client request identifiers and stored idempotency results | Mitigated in code |
| Sensitive content in logs | High | Runtime can log error messages and providers may log request metadata | Client receives safe errors; application does not intentionally log note bodies | Partially mitigated; platform and provider log contents/retention are unverified |
| Incomplete automatic cleanup | High | Cleanup depends on `lastSeen`, connection signals, and a room alarm | Durable storage alarm reschedules on renewed activity and calls `deleteAll()` after inactivity; manual clear is available | Implemented but not proven across every eviction/restart scenario; no automated expiry test currently exercises production semantics |
| Expired cookie reused before cleanup | Medium | Cookie has no fixed expiry and server does not reject by elapsed age on each request | Cleanup alarm removes stored data after inactivity | Open design limitation; a restored cookie can create or resume a room if cleanup has not run |
| Orphaned or provider-held data | High | AI processing crosses application boundaries | Policy separates application deletion from provider retention; no separate app file store exists | Provider behavior unverified; requires contractual/configuration review |
| Browser cache and downloaded exports | Medium | Previews and downloads exist on the user's device | Image API uses private/no-store; object URLs are local and revoked when removed; explicit session clear available | Reduced; downloaded files and some browser artifacts remain outside application control |
| Data exposed through URL or analytics | Medium | URLs and trackers can leak identifiers | No note content, session id, or analytics payload is placed in URLs; no analytics SDK is included | Mitigated in code |
| Unauthorized deployment or secret exposure | High | GitHub Actions deploys production | Repository secret authentication, tests before deployment, environment check, protected server-side AI access | Depends on GitHub and DeepSpace access controls; branch protection was not verified |
| Accessibility failure blocks privacy controls | Medium | Users need Settings to clear data | Settings is navigable, clear action requires confirmation, controls have accessible names | Basic implementation verified; no formal accessibility audit |

## Retention assessment

The implemented 30-minute window begins from the last recorded valid activity. Requests call `touch()`. Active WebSocket pings also refresh the timestamp. When the final browser connection closes or errors, an alarm is scheduled. At alarm time, the room checks the stored timestamp and open connections; it reschedules if the session is still active and otherwise deletes all room storage.

Important limits:

- A network disconnect is a signal, not proof the user has permanently left.
- Valid activity before cleanup refreshes the timestamp.
- The cookie itself has no fixed 30-minute expiration.
- Expiration is not rejected on every request by comparing a signed expiry value.
- Platform alarms are designed to survive normal object lifecycle changes, but that behavior was not independently load- or failure-tested for this app.
- Application deletion does not establish deletion from provider safety logs, network logs, backups, or a user's exports.

The public policy therefore says cleanup is **scheduled** after 30 minutes of inactivity and avoids “guaranteed deletion within 30 minutes.”

## Recommended follow-up

1. Add a deterministic integration harness for time-based room alarms and verify deletion across restart/eviction behavior.
2. Add a cross-session test that creates a synthetic record without a paid AI request and proves the second session cannot read it.
3. Confirm DeepSpace AI proxy data terms, diagnostic logging, and subprocessors in writing.
4. Confirm the production Anthropic retention configuration and whether any training or feedback option is enabled.
5. Review Cloudflare request-log settings and retention for the deployed account.
6. Require protected main-branch reviews and least-privilege access for `DEEPSPACE_SESSION`.
7. Arrange legal review of all public policies and an independent accessibility/security review before treating the documents as compliance evidence.

[Data inventory](DATA_INVENTORY.md) · [Policy decisions](POLICY_DECISIONS.md)
