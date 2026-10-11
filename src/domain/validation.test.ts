import { describe, expect, it } from 'vitest'
import {
  MAX_IMAGE_BYTES,
  MAX_REFERENCE_BYTES,
  MAX_SESSION_BODY_BYTES,
  MAX_TOTAL_IMAGE_BYTES,
  base64EncodedSize,
  decodeAndValidateDataUrl,
  imageDimensions,
  matchesImageSignature,
  normalizeReference,
  validateImageMetadata,
} from './validation'

describe('image validation', () => {
  it('recognizes supported file signatures rather than trusting MIME alone', () => {
    expect(matchesImageSignature(new Uint8Array([0xff, 0xd8, 0xff, 0x00]), 'image/jpeg')).toBe(true)
    expect(matchesImageSignature(new TextEncoder().encode('RIFF0000WEBP'), 'image/webp')).toBe(true)
    expect(matchesImageSignature(new TextEncoder().encode('not an image'), 'image/png')).toBe(false)
  })

  it('reads actual PNG, JPEG, and WebP dimensions from their headers', () => {
    const png = new Uint8Array(24)
    png.set([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])
    new DataView(png.buffer).setUint32(16, 1200)
    new DataView(png.buffer).setUint32(20, 900)
    expect(imageDimensions(png, 'image/png')).toEqual({ width: 1200, height: 900 })

    const jpeg = new Uint8Array([0xff, 0xd8, 0xff, 0xc0, 0, 7, 8, 3, 0x84, 4, 0xb0, 0xff, 0xd9])
    expect(imageDimensions(jpeg, 'image/jpeg')).toEqual({ width: 1200, height: 900 })

    const webp = new Uint8Array(30)
    webp.set(new TextEncoder().encode('RIFF0000WEBPVP8X'))
    webp.set([0xaf, 0x04, 0, 0x83, 0x03, 0], 24)
    expect(imageDimensions(webp, 'image/webp')).toEqual({ width: 1200, height: 900 })
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

  it('allows base64 overhead for the normalized upload and reference limits', () => {
    expect(base64EncodedSize(MAX_TOTAL_IMAGE_BYTES) + MAX_REFERENCE_BYTES).toBeLessThan(MAX_SESSION_BODY_BYTES)
    expect(MAX_IMAGE_BYTES).toBe(8 * 1024 * 1024)
  })
})

describe('reference validation', () => {
  it('normalizes line endings and strips null bytes', () => {
    expect(normalizeReference('a\r\n\u0000b ')).toBe('a\nb')
  })
})

