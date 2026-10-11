import { expect, test } from '@playwright/test'
import { captureConsoleErrors } from './helpers/errors'

test.describe('workspace', () => {
  test('root opens the account-free analysis workspace', async ({ page }) => {
    const errors = captureConsoleErrors(page)
    await page.goto('/')
    await expect(page).toHaveURL(/\/new$/)
    await expect(page.getByRole('heading', { name: 'Bring your notes into focus.' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'H.A.N.D. home' }).locator('img')).toHaveAttribute('src', '/brand/hand-mark-v1-64.png')
    await expect(page.getByText(/sign in/i)).toHaveCount(0)
    expect(errors).toEqual([])
  })

  test('upload area offers files or camera', async ({ page }) => {
    await page.goto('/new')
    await page.getByRole('button', { name: /drop note images here/i }).click()
    await expect(page.getByRole('button', { name: 'Upload files', exact: true })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Take photo' })).toBeVisible()
  })

  test('theme toggle switches to dark mode', async ({ page }) => {
    await page.goto('/new')
    await page.getByRole('button', { name: 'Switch to dark mode' }).click()
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'hand-ink')
  })

  test('unknown route shows 404', async ({ page }) => {
    await page.goto('/nonexistent-page-xyz')
    await expect(page.locator('text=404')).toBeVisible()
  })
})
