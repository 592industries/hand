# DeepSpace variables and bindings

H.A.N.D. requires **no manually supplied provider API keys**. Anthropic access and billing are handled through DeepSpace's AI proxy.

## Values you configure

| Name | Required | Where | Purpose |
|---|---:|---|---|
| `DEEPSPACE_APP_ID` | Yes | `wrangler.toml` via `npx deepspace app init` | Immutable app/data identity. Never invent or hand-edit this value. |
| `APP_NAME` | Yes | `wrangler.toml` | App subdomain/display routing name (`hand`). |
| `NATIVE_AUTH_REDIRECT_URIS` | No | `wrangler.toml` | Empty for this web-only build; only set for a future native client. |

No entry needs to be added manually to DeepSpace Secrets/Variables for the current application.

## GitHub Actions deployment credentials

The deployment workflow authenticates the DeepSpace CLI non-interactively. Add this as a
**GitHub repository secret** (Settings → Secrets and variables → Actions → Secrets), not as a
DeepSpace application variable and not as a plain GitHub variable:

| Name | Required | Purpose |
|---|---:|---|
| `DEEPSPACE_SESSION` | Yes | DeepSpace CLI session for an account that owns or can deploy H.A.N.D. Keep it secret and rotate it if exposed. |

The workflow validates the secret, writes it to the DeepSpace CLI's session file with owner-only
permissions on the ephemeral runner, and verifies the account before testing or deployment.
GitHub masks the secret value in logs and the value is never placed on the command line.

## Values DeepSpace injects automatically

Do not create or copy these yourself. They are platform bindings or credentials minted by DeepSpace during development/deployment.

| Name | Purpose |
|---|---|
| `OWNER_USER_ID` | Canonical app owner and admin identity. |
| `APP_OWNER_JWT` | Server-side owner credential used by developer-billed platform calls. Never expose to the browser. |
| `APP_IDENTITY_TOKEN` | App HMAC identity used by the private file gateway and AI proxy. |
| `AUTH_JWT_PUBLIC_KEY` | Verifies caller JWTs. |
| `AUTH_JWT_ISSUER` | Expected JWT issuer. |
| `AUTH_WORKER_URL` | DeepSpace authentication service route. |
| `API_WORKER` / `API_WORKER_URL` | DeepSpace integrations and AI proxy transport (binding in production, URL fallback in development). |
| `PLATFORM_WORKER` / `PLATFORM_WORKER_URL` | DeepSpace file/platform transport (binding in production, URL fallback in development). |
| `ASSETS` | Worker static-assets binding. |
| `RECORD_ROOMS` | SQLite-backed record Durable Object binding. |
| `YJS_ROOMS` | DeepSpace Yjs Durable Object binding retained by the standard scaffold. |
| `CANVAS_ROOMS` | DeepSpace canvas Durable Object binding retained by the standard scaffold. |
| `PRESENCE_ROOMS` | DeepSpace presence Durable Object binding retained by the standard scaffold. |
| `CRON_ROOMS` | DeepSpace cron Durable Object binding retained by the standard scaffold. |
| `JOB_ROOMS` | DeepSpace durable job binding available for future long-running migrations. |
| `ALLOW_DEBUG_ROUTES` | Development/test-only flag set by DeepSpace; production debug routes remain disabled. |

## Tooling-only overrides

| Name | Default / source | Purpose |
|---|---|---|
| `DEEPSPACE_SITE_ORIGIN` | Injected by the DeepSpace deploy build | Canonical/SEO origin used by `prerender.ts`. Local builds fall back to the configured app name. |
| `DEEPSPACE_PORT` | `5173` in Playwright config | Optional local end-to-end test port override. |
| `DEV` (`import.meta.env.DEV`) | Injected by Vite | Hides developer-only navigation outside development. This is a build flag, not a DeepSpace variable to add. |

The DeepSpace CLI also recognizes service URL/session overrides such as `DEEPSPACE_DEPLOY_URL` and its own login credentials. H.A.N.D. application code does not read them. Do not add them unless DeepSpace support specifically directs you to a non-default control plane.

