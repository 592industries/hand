import { describe, expect, it } from 'vitest'
import { sessionReconnectDelay } from './session'

describe('session reconnect delay', () => {
  it('backs off quickly and caps retries at 30 seconds', () => {
    expect([0, 1, 2, 3, 4, 5, 10].map(sessionReconnectDelay)).toEqual([
      1_000, 2_000, 4_000, 8_000, 16_000, 30_000, 30_000,
    ])
  })

  it('treats an invalid negative attempt as the first retry', () => {
    expect(sessionReconnectDelay(-1)).toBe(1_000)
  })
})
