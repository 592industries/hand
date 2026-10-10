import type { Context, Hono } from 'hono'
import type { AppContext } from '../../worker.js'

const COOKIE = '__Host-hand-session'
const SESSION_ID = /^[A-Za-z0-9_-]{43}$/
const MAX_BODY_BYTES = 20 * 1024 * 1024

function cookieValue(header: string | undefined): string | null {
  const value = header?.split(';').map((part) => part.trim()).find((part) => part.startsWith(`${COOKIE}=`))?.slice(COOKIE.length + 1)
  return value && SESSION_ID.test(value) ? value : null
}

function newSessionId(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(32))
  return btoa(String.fromCharCode(...bytes)).replaceAll('+', '-').replaceAll('/', '_').replace(/=+$/, '')
}

function sameOrigin(request: Request): boolean {
  const origin = request.headers.get('Origin')
  const fetchSite = request.headers.get('Sec-Fetch-Site')
  return origin === new URL(request.url).origin || fetchSite === 'same-origin'
}

function sessionStub(c: Context<AppContext>, id: string): DurableObjectStub {
  return c.env.SESSION_ROOMS.get(c.env.SESSION_ROOMS.idFromName(id))
}

async function forward(c: Context<AppContext>, id: string): Promise<Response> {
  const upgrade = c.req.header('Upgrade') === 'websocket'
  if ((upgrade || !['GET', 'HEAD'].includes(c.req.method)) && !sameOrigin(c.req.raw)) {
    return c.json({ success: false, error: 'Cross-origin request refused' }, 403)
  }

  if (!upgrade && !['GET', 'HEAD', 'DELETE'].includes(c.req.method)) {
    if (!(c.req.header('Content-Type') ?? '').toLowerCase().startsWith('application/json')) {
      return c.json({ success: false, error: 'JSON content type required' }, 415)
    }
  }

  const declared = Number(c.req.header('Content-Length') ?? 0)
  if (declared > MAX_BODY_BYTES) return c.json({ success: false, error: 'Request is too large' }, 413)

  let request = c.req.raw
  if (!upgrade && !['GET', 'HEAD'].includes(c.req.method)) {
    const body = await c.req.raw.arrayBuffer()
    if (body.byteLength > MAX_BODY_BYTES) return c.json({ success: false, error: 'Request is too large' }, 413)
    request = new Request(c.req.url, { method: c.req.method, headers: c.req.raw.headers, body: body.byteLength ? body : undefined })
  }
  return sessionStub(c, id).fetch(request)
}

export function registerSessionRoutes(app: Hono<AppContext>): void {
  app.get('/api/session/health', (c) => c.json({ ok: true }))

  app.post('/api/session', async (c) => {
    if (!sameOrigin(c.req.raw)) return c.json({ success: false, error: 'Cross-origin request refused' }, 403)
    const id = cookieValue(c.req.header('Cookie')) ?? newSessionId()
    const response = await forward(c, id)
    const headers = new Headers(response.headers)
    headers.append('Set-Cookie', `${COOKIE}=${id}; Path=/; HttpOnly; Secure; SameSite=Strict`)
    return new Response(response.body, { status: response.status, headers })
  })

  app.delete('/api/session', async (c) => {
    const id = cookieValue(c.req.header('Cookie'))
    if (!id) return c.json({ success: false, error: 'Session unavailable' }, 401)
    return forward(c, id)
  })

  app.all('/api/session/*', async (c) => {
    const id = cookieValue(c.req.header('Cookie'))
    if (!id) return c.json({ success: false, error: 'Session unavailable' }, 401)
    return forward(c, id)
  })
}
