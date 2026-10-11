# H.A.N.D policy decisions

Updated: October 11, 2026

These decisions connect public wording to implementation evidence. The policy pages are a legal-drafting starting point and require qualified review.

| Decision | Public wording | Evidence and reason |
|---|---|---|
| Operator name | H.A.N.D is described as a 592 Industries product; no separate company is invented | Repository ownership, product branding, and <https://592industries.com> |
| Account-free does not mean data-free | The policy lists uploads, metadata, generated results, session identifiers, and technical data | New-analysis flow, session routes, record schema, and provider boundary |
| Browser normalization is processing | Privacy documentation states that HEIC conversion, resizing, and compression occur on the device before upload | `src/lib/image-normalization.ts`, new-analysis page |
| No requested identity profile | The policy says H.A.N.D has no fields for name, email, phone, profile, password, or payment details | Route and form inventory; auth UI and routes are absent |
| Incidental personal information | Notes may still contain personal, academic, confidential, or third-party content | Users control image and reference contents; the app cannot reliably classify all sensitive material before processing |
| Session cookie | The cookie is called essential and its verified security attributes are listed | `src/server/session-routes.ts` |
| Theme and recovery storage | Local storage and session storage are disclosed; no analytics/advertising cookie is claimed | Navigation, first-paint theme script, stale-chunk recovery, dependency review |
| 30-minute language | “Scheduled after 30 minutes of inactivity,” not “guaranteed deletion within 30 minutes” | Activity refresh, WebSocket close/error, alarm rescheduling, and `deleteAll()` in `src/server/session-room.ts` |
| Manual clear | Settings deletes H.A.N.D-controlled session storage, with limits for providers, logs, caches, and downloads | `DELETE /api/session`, settings page, export behavior |
| AI recipient | DeepSpace is identified as the server-side AI intermediary and Anthropic as the model provider | `createDeepSpaceAI(env, 'anthropic')` and configured Anthropic model in `src/ai/analysis.ts` |
| Model training | Anthropic's default commercial-API statement is attributed to Anthropic, not promised by H.A.N.D | <https://privacy.anthropic.com/en/articles/7996868-is-my-data-used-for-model-training> |
| Provider retention | Anthropic's current standard API period is described with exceptions; zero retention is not claimed | <https://privacy.anthropic.com/en/articles/7996866-how-long-do-you-store-my-organization-s-data>; no production agreement in repo |
| Logs | Infrastructure may process IP, device, request, and security metadata; exact retention is left unverified | No app analytics; normal hosted HTTP path and provider-controlled logging |
| Security | Specific controls are named without promising absolute safety | Same-origin checks, secure cookie, validation, private/no-store assets, limits, CSP and headers |
| Ownership | Users keep rights in original material and grant only a service-operation license | Minimum license needed for receive/store/process/return operations |
| Score meaning | Score is described as reference correspondence, not a grade, truth measure, or intelligence measure | `src/domain/scoring.ts` and scoring tests |
| Children | The service is not intended for children under 13; no claim is made about age verification | Consistent with parent policy; the app has no account or age gate |
| Contact | Parent support link and published phone number are used; no email address is guessed | <https://592industries.com/privacy-policy> and <https://592industries.com/contact> |
| Governing law | New York is used with a non-waivable-rights qualifier | Parent Terms of Service; requires counsel confirmation for this product |
| Separate cookie page | A short dedicated route is retained because the footer promises it and users need a direct explanation of the essential session cookie | `/cookies` and shared footer |
| No consent modal | No blocking legal-acceptance dialog was added | Current release does not establish a separately approved consent requirement; footer provides persistent access |

## Parent-policy alignment

The drafting reviewed the 592 Industries privacy, terms, cookie, acceptable-use, custom-order, footer, and contact materials. Ecommerce, shipping, payment, manufacturing, and custom-order clauses were intentionally excluded because H.A.N.D is a note-processing application.

## Items for legal review

- Confirm the operator description and whether a more precise legal name or address is required.
- Confirm New York governing-law and dispute language for H.A.N.D users.
- Review warranty and liability limits for applicable jurisdictions.
- Decide whether education-specific, student, school, or parental-consent terms are required.
- Review privacy-right request handling when the service cannot identify a user after the session cookie is lost.
- Confirm provider subprocessors, international transfers, and contract terms.
- Decide whether a consent or notice mechanism is required for future material changes.

## Change control

Policy claims must be reviewed whenever session retention, logging, analytics, AI provider, hosting provider, account model, file storage, or user-contact behavior changes. A footer link alone should not be treated as consent where the law or product design requires an affirmative agreement.

[Data inventory](DATA_INVENTORY.md) · [Privacy and security review](PRIVACY_SECURITY_REVIEW.md)
