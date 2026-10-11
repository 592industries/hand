import { imageFileSchema, type ImageFile } from './types'

export const MAX_IMAGES = 6
export const MAX_IMAGE_BYTES = 8 * 1024 * 1024
export const MAX_TOTAL_IMAGE_BYTES = 30 * 1024 * 1024
export const MAX_SOURCE_IMAGE_BYTES = 40 * 1024 * 1024
export const MAX_SESSION_BODY_BYTES = 42 * 1024 * 1024
export const MAX_REFERENCE_BYTES = 1024 * 1024
export const MAX_REFERENCE_CHARS = 120_000
export const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const

export function base64EncodedSize(bytes: number): number {
  return 4 * Math.ceil(bytes / 3)
}

const signatures: Record<string, number[][]> = {
  'image/jpeg': [[0xff, 0xd8, 0xff]],
  'image/png': [[0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]],
  'image/webp': [[0x52, 0x49, 0x46, 0x46]],
}

export function matchesImageSignature(bytes: Uint8Array, mimeType: string): boolean {
  const options = signatures[mimeType]
  if (!options) return false
  if (mimeType === 'image/webp') {
    return options[0].every((value, index) => bytes[index] === value) &&
      String.fromCharCode(...bytes.slice(8, 12)) === 'WEBP'
  }
  return options.some((signature) => signature.every((value, index) => bytes[index] === value))
}

function read16(bytes: Uint8Array, offset: number, littleEndian = false): number {
  return littleEndian ? bytes[offset] | (bytes[offset + 1] << 8) : (bytes[offset] << 8) | bytes[offset + 1]
}

export function imageDimensions(bytes: Uint8Array, mimeType: string): { width: number; height: number } | null {
  if (!matchesImageSignature(bytes, mimeType)) return null
  if (mimeType === 'image/png' && bytes.length >= 24) {
    const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength)
    return { width: view.getUint32(16), height: view.getUint32(20) }
  }
  if (mimeType === 'image/jpeg') {
    const frames = new Set([0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7, 0xc9, 0xca, 0xcb, 0xcd, 0xce, 0xcf])
    let offset = 2
    while (offset + 8 < bytes.length) {
      if (bytes[offset] !== 0xff) { offset += 1; continue }
      while (bytes[offset] === 0xff) offset += 1
      const marker = bytes[offset++]
      if (marker === 0xd8 || marker === 0xd9 || (marker >= 0xd0 && marker <= 0xd7)) continue
      if (offset + 1 >= bytes.length) return null
      const length = read16(bytes, offset)
      if (length < 2 || offset + length > bytes.length) return null
      if (frames.has(marker) && length >= 7) return { width: read16(bytes, offset + 5), height: read16(bytes, offset + 3) }
      offset += length
    }
  }
  if (mimeType === 'image/webp' && bytes.length >= 30) {
    const chunk = String.fromCharCode(...bytes.slice(12, 16))
    if (chunk === 'VP8X') {
      const width = 1 + bytes[24] + (bytes[25] << 8) + (bytes[26] << 16)
      const height = 1 + bytes[27] + (bytes[28] << 8) + (bytes[29] << 16)
      return { width, height }
    }
    if (chunk === 'VP8L' && bytes[20] === 0x2f) {
      return {
        width: 1 + bytes[21] + ((bytes[22] & 0x3f) << 8),
        height: 1 + (bytes[22] >> 6) + (bytes[23] << 2) + ((bytes[24] & 0x0f) << 10),
      }
    }
    if (chunk === 'VP8 ' && bytes[23] === 0x9d && bytes[24] === 0x01 && bytes[25] === 0x2a) {
      return { width: read16(bytes, 26, true) & 0x3fff, height: read16(bytes, 28, true) & 0x3fff }
    }
  }
  return null
}

export function validateImageMetadata(files: unknown): ImageFile[] {
  const parsed = imageFileSchema.array().min(1).max(MAX_IMAGES).parse(files)
  let total = 0
  for (const file of parsed) {
    if (file.size > MAX_IMAGE_BYTES) throw new Error(`${file.name} exceeds the 8 MB normalized limit`)
    if (file.width < 64 || file.height < 64) throw new Error(`${file.name} is too small to analyze`)
    if (file.width > 12_000 || file.height > 12_000) throw new Error(`${file.name} dimensions are too large`)
    total += file.size
  }
  if (total > MAX_TOTAL_IMAGE_BYTES) throw new Error('Images exceed the 30 MB normalized total limit')
  return parsed
}

export function decodeAndValidateDataUrl(dataUrl: string, expectedMime: string): Uint8Array {
  const match = /^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/]+={0,2})$/.exec(dataUrl)
  if (!match || match[1] !== expectedMime) throw new Error('Image content does not match its declared type')
  if (match[2].length % 4 !== 0 || base64EncodedSize(MAX_IMAGE_BYTES) < match[2].length) throw new Error('Image exceeds the 8 MB normalized limit')
  const binary = atob(match[2])
  if (binary.length > MAX_IMAGE_BYTES) throw new Error('Image exceeds the 8 MB normalized limit')
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0))
  if (!matchesImageSignature(bytes, expectedMime)) throw new Error('Image signature is invalid')
  return bytes
}

export function normalizeReference(text: string): string {
  const normalized = text.replace(/\r\n/g, '\n').replace(/\u0000/g, '').trim()
  if (normalized.length > MAX_REFERENCE_CHARS) throw new Error('Reference transcript is too long')
  return normalized
}

