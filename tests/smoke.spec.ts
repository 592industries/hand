import { expect, test } from '@playwright/test'
import { captureConsoleErrors } from './helpers/errors'

test.describe('workspace', () => {
  test('root opens the account-free analysis workspace', async ({ page }) => {
    const errors = captureConsoleErrors(page)
    await page.goto('/')
    await expect(page).toHaveURL(/\/new$/)
    await expect(page.getByRole('heading', { name: 'Analyze handwritten notes' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'H.A.N.D home' }).locator('img')).toHaveAttribute('src', '/brand/hand-mark-v1-64.png')
    await expect(page.getByText(/sign in/i)).toHaveCount(0)
    expect(errors).toEqual([])
  })

  test('upload area offers files or camera', async ({ page }) => {
    await page.goto('/new')
    await page.getByRole('button', { name: /drop note images here/i }).click()
    await expect(page.getByRole('button', { name: 'Upload files', exact: true })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Take photo' })).toBeVisible()
  })

  test('theme toggle switches to dark mode and persists', async ({ page }) => {
    await page.goto('/new')
    await page.getByRole('button', { name: 'Switch to dark mode' }).click()
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'hand-ink')
    await page.reload()
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'hand-ink')
  })

  test('settings keeps privacy controls concise and confirms deletion', async ({ page }) => {
    await page.goto('/settings')
    await expect(page.getByRole('heading', { name: 'Settings' })).toBeVisible()
    await expect(page.getByText(/H\.A\.N\.D keeps uploads and results in a temporary/)).toBeVisible()
    await expect(page.getByText(/Cleanup is scheduled after 30 minutes/)).toBeVisible()
    await page.getByRole('button', { name: 'Clear Session Data' }).click()
    await expect(page.getByRole('dialog', { name: 'Clear all session data?' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Cancel' })).toBeVisible()
  })

  test('unknown route shows 404', async ({ page }) => {
    await page.goto('/nonexistent-page-xyz')
    await expect(page.locator('text=404')).toBeVisible()
  })

  test('public policy pages and shared footer are available', async ({ page }) => {
    const routes = [
      ['/privacy', 'Privacy Policy'],
      ['/terms', 'Terms of Service'],
      ['/acceptable-use', 'Acceptable Use Policy'],
      ['/cookies', 'Cookie and Session Policy'],
      ['/ai-disclaimer', 'AI Accuracy Notice'],
    ] as const
    for (const [route, heading] of routes) {
      await page.goto(route)
      await expect(page.getByRole('heading', { name: heading, exact: true })).toBeVisible()
      await expect(page.getByTestId('app-footer')).toHaveCount(1)
      await expect(page.getByRole('link', { name: 'H.A.N.D home' }).locator('img')).toHaveAttribute('src', '/brand/hand-mark-v1-64.png')
    }
    await page.getByRole('link', { name: 'Privacy', exact: true }).click()
    await expect(page).toHaveURL(/\/privacy$/)
    await expect(page.getByTestId('app-footer')).toContainText('A 592 Industries product. Contact support · +1 (516) 336-9270')
    await expect(page.getByTestId('app-footer')).toContainText('© 2026 592 Industries')
  })

  test('brand assets load and policy pages make no third-party requests', async ({ page, request }) => {
    for (const path of ['/brand/hand-mark-v1-16.png', '/brand/hand-mark-v1-32.png', '/brand/hand-mark-v1-64.png', '/brand/hand-mark-v1-180.png', '/brand/hand-logo-v1.webp', '/brand/hand-social-v1.jpg', '/favicon.ico']) {
      const response = await request.get(path)
      expect(response.ok(), path).toBeTruthy()
      expect(response.headers()['content-type']).toMatch(/^image\//)
    }
    const thirdParty: string[] = []
    page.on('request', (item) => {
      if (!['127.0.0.1', 'localhost'].includes(new URL(item.url()).hostname)) thirdParty.push(item.url())
    })
    await page.goto('/privacy')
    await expect(page.getByRole('heading', { name: 'Privacy Policy' })).toBeVisible()
    expect(thirdParty).toEqual([])
  })
})
