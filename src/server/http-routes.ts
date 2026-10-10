import type { Hono } from 'hono'
import { isPlatformReservedPath } from 'deepspace/worker'
import type { AppContext } from '../../worker.js'

const API_PREFIXES = ['/api']
const SPA_SHELL_PATH = '/_spa'

const matches = (pathname: string, prefixes: readonly string[]): boolean =>
  prefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`))

function namesAFile(pathname: string): boolean {
  return pathname.slice(pathname.lastIndexOf('/') + 1).includes('.')
}

export function registerStaticRoutes(app: Hono<AppContext>): void {
  app.all('*', async (c, next) => {
    if (matches(new URL(c.req.url).pathname, API_PREFIXES)) return c.json({ error: 'not_found' }, 404)
    await next()
  })

  app.get('*', async (c) => {
    const url = new URL(c.req.url)
    const response = await c.env.ASSETS.fetch(c.req.raw)
    if (response.status !== 404) return response
    if (namesAFile(url.pathname) || isPlatformReservedPath(url.pathname)) return c.json({ error: 'not_found' }, 404)
    url.pathname = SPA_SHELL_PATH
    const shell = await c.env.ASSETS.fetch(new Request(url, c.req.raw))
    return shell.status === 404 ? c.env.ASSETS.fetch(new Request(new URL('/', url), c.req.raw)) : shell
  })
}
