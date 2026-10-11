import { describe, expect, it } from 'vitest'
import { PRERENDER_ROUTES, render } from './prerender-entry'

/**
 * Every public page must render without a browser — that is what lets
 * prerender.ts turn it into static HTML at `vite build`. `deepspace dev`
 * never prerenders, so without this test the first sign of a page touching
 * `window`, `localStorage`, or `matchMedia` during render would be a failed
 * deploy. Runs in Node in about a second (`npm run test:unit`).
 */
describe('public pages prerender', () => {
  it.each(PRERENDER_ROUTES)('%s renders to static HTML with a title and a body', (route) => {
    const html = render(route)
    expect(html, `${route} rendered no <title> — render <Seo {...seo} path="${route}" /> first`).toMatch(/<title>[^<]+<\/title>/)
    expect(html).toContain('name="description"')
    const at = html.indexOf('<div data-testid="app-root"')
    expect(at, `${route} rendered no app-root — src/pages/_app.tsx root markup changed?`).toBeGreaterThan(-1)
    // Markup beyond the root wrapper itself: a page that renders nothing
    // without a browser would ship an empty static page.
    expect(html.slice(at)).toMatch(/<(h1|h2|p|main|section|article|a)\b/)
  })

  it('publishes verified policy contact and qualified retention wording', () => {
    const pages = ['/privacy', '/terms', '/acceptable-use', '/cookies', '/ai-disclaimer'].map(render).join('\n')
    expect(pages).toContain('https://592industries.com/contact')
    expect(pages).toContain('+1 (516) 336-9270')
    expect(pages).not.toMatch(/example\.com|TODO|TBD|guaranteed deletion/i)

    const privacy = render('/privacy')
    expect(privacy).toContain('schedules cleanup after 30 minutes')
    expect(privacy).toContain('does not guarantee immediate deletion')
  })
})
