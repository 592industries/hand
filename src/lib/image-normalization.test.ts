import { describe, expect, it } from 'vitest'
import { isPotentialHeic, normalizedFileName, scaledDimensions } from './image-normalization'

describe('image normalization helpers', () => {
  it('recognizes HEIC by MIME type or extension', () => {
    expect(isPotentialHeic({ name: 'notes', type: 'image/heic' })).toBe(true)
    expect(isPotentialHeic({ name: 'notes.HEIF', type: '' })).toBe(true)
    expect(isPotentialHeic({ name: 'notes.jpg', type: 'image/jpeg' })).toBe(false)
  })

  it('uses a matching safe extension after conversion', () => {
    expect(normalizedFileName('page.HEIC', 'image/jpeg')).toBe('page.jpg')
    expect(normalizedFileName('page.jpg', 'image/png')).toBe('page.png')
  })

  it('preserves aspect ratio while limiting large phone photos', () => {
    expect(scaledDimensions(12_000, 9_000)).toEqual({ width: 6_000, height: 4_500 })
    expect(scaledDimensions(1_200, 900)).toEqual({ width: 1_200, height: 900 })
  })
})
