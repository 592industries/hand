import { describe, expect, it } from 'vitest'
import { decodeAndValidateDataUrl, matchesImageSignature, normalizeReference, validateImageMetadata } from './validation'

describe('image validation', () => {
  it('recognizes supported file signatures rather than trusting MIME alone', () => {
    expect(matchesImageSignature(new Uint8Array([0xff, 0xd8, 0xff, 0x00]), 'image/jpeg')).toBe(true)
    expect(matchesImageSignature(new TextEncoder().encode('RIFF0000WEBP'), 'image/webp')).toBe(true)
    expect(matchesImageSignature(new TextEncoder().encode('not an image'), 'image/png')).toBe(false)
  })

  it('decodes a matching data URL and rejects spoofed content', () => {
    const jpeg = decodeAndValidateDataUrl('data:image/jpeg;base64,/9j/AA==', 'image/jpeg')
    expect([...jpeg.slice(0, 3)]).toEqual([0xff, 0xd8, 0xff])
    expect(() => decodeAndValidateDataUrl('data:image/png;base64,bm90LXBuZw==', 'image/png')).toThrow(/signature/)
  })

  it('enforces image count, size, and dimensions', () => {
    expect(() => validateImageMetadata([])).toThrow()
    expect(() => validateImageMetadata([{ key: 'a', name: 'tiny.png', mimeType: 'image/png', size: 1, width: 10, height: 10 }])).toThrow(/too small/)
  })
})

describe('reference validation', () => {
  it('normalizes line endings and strips null bytes', () => {
    expect(normalizeReference('a\r\n\u0000b ')).toBe('a\nb')
  })
})

