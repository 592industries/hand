import { expect, test } from '@playwright/test'

test('separate browsers receive isolated anonymous sessions', async ({ browser }) => {
  const [first, second] = await Promise.all([browser.newContext(), browser.newContext()])
  try {
    const [a, b] = await Promise.all([first.newPage(), second.newPage()])
    await Promise.all([a.goto('/new'), b.goto('/new')])
    await Promise.all([
      expect(a.getByTestId('app-navigation')).toBeVisible(),
      expect(b.getByTestId('app-navigation')).toBeVisible(),
    ])
    await expect.poll(async () => (await first.cookies()).length + (await second.cookies()).length).toBeGreaterThan(1)
    const aSession = (await first.cookies()).find((cookie) => cookie.name === '__Host-hand-session')?.value
    const bSession = (await second.cookies()).find((cookie) => cookie.name === '__Host-hand-session')?.value
    expect(aSession).toBeTruthy()
    expect(bSession).toBeTruthy()
    expect(aSession).not.toBe(bSession)
  } finally {
    await Promise.all([first.close(), second.close()])
  }
})
