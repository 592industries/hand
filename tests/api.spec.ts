import { expect, test } from '@playwright/test'

test.describe('session API', () => {
  test('health endpoint is available and browser auth is removed', async ({ request }) => {
    expect((await request.get('/api/session/health')).ok()).toBeTruthy()
    expect((await request.get('/api/auth/ok')).status()).toBe(404)
  })

  test('creates a private session cookie', async ({ page }) => {
    await page.goto('/new')
    await expect(page.getByTestId('app-navigation')).toBeVisible()
    await expect.poll(async () => (await page.context().cookies()).some((cookie) => cookie.name === '__Host-hand-session')).toBeTruthy()
    const cookie = (await page.context().cookies()).find((item) => item.name === '__Host-hand-session')
    expect(cookie?.httpOnly).toBeTruthy()
    expect(cookie?.sameSite).toBe('Strict')
  })
})
