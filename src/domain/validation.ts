import { imageFileSchema, type ImageFile } from './types'

export const MAX_IMAGES = 6
export const MAX_IMAGE_BYTES = 4 * 1024 * 1024
export const MAX_TOTAL_IMAGE_BYTES = 14 * 1024 * 1024
export const MAX_REFERENCE_BYTES = 1024 * 1024
export const MAX_REFERENCE_CHARS = 120_000
export const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const

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

export function validateImageMetadata(files: unknown): ImageFile[] {
  const parsed = imageFileSchema.array().min(1).max(MAX_IMAGES).parse(files)
  let total = 0
  for (const file of parsed) {
    if (file.size > MAX_IMAGE_BYTES) throw new Error(`${file.name} exceeds the 4 MB limit`)
    if (file.width < 64 || file.height < 64) throw new Error(`${file.name} is too small to analyze`)
    if (file.width > 12_000 || file.height > 12_000) throw new Error(`${file.name} dimensions are too large`)
    total += file.size
  }
  if (total > MAX_TOTAL_IMAGE_BYTES) throw new Error('Images exceed the 14 MB total limit')
  return parsed
}

export function decodeAndValidateDataUrl(dataUrl: string, expectedMime: string): Uint8Array {
  const match = /^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=]+)$/.exec(dataUrl)
  if (!match || match[1] !== expectedMime) throw new Error('Image content does not match its declared type')
  const binary = atob(match[2])
  if (binary.length > MAX_IMAGE_BYTES) throw new Error('Image exceeds the 4 MB limit')
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0))
  if (!matchesImageSignature(bytes, expectedMime)) throw new Error('Image signature is invalid')
  return bytes
}

export function normalizeReference(text: string): string {
  const normalized = text.replace(/\r\n/g, '\n').replace(/\u0000/g, '').trim()
  if (normalized.length > MAX_REFERENCE_CHARS) throw new Error('Reference transcript is too long')
  return normalized
}

