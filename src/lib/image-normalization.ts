import {
  ACCEPTED_IMAGE_TYPES,
  MAX_IMAGE_BYTES,
  MAX_SOURCE_IMAGE_BYTES,
  imageDimensions,
  matchesImageSignature,
} from '../domain/validation'

const MAX_EDGE = 6_000
const MAX_SOURCE_EDGE = 20_000
const MAX_SOURCE_PIXELS = 100_000_000
const HEIC_TYPES = new Set(['image/heic', 'image/heif', 'image/heic-sequence', 'image/heif-sequence'])

export type NormalizedImage = {
  file: File
  preview: string
  dataUrl: string
  width: number
  height: number
  optimized: boolean
}

export function isPotentialHeic(file: Pick<File, 'name' | 'type'>): boolean {
  return HEIC_TYPES.has(file.type.toLowerCase()) || /\.(heic|heif)$/i.test(file.name)
}

export function normalizedFileName(name: string, mimeType: string): string {
  const extension = mimeType === 'image/png' ? 'png' : mimeType === 'image/webp' ? 'webp' : 'jpg'
  return `${name.replace(/\.[^.]+$/, '') || 'note'}.${extension}`
}

export function scaledDimensions(width: number, height: number, maxEdge = MAX_EDGE) {
  const scale = Math.min(1, maxEdge / Math.max(width, height))
  return { width: Math.max(1, Math.round(width * scale)), height: Math.max(1, Math.round(height * scale)) }
}

async function readDataUrl(blob: Blob): Promise<string> {
  return await new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(new Error('The normalized image could not be read'))
    reader.readAsDataURL(blob)
  })
}

async function decode(blob: Blob) {
  if ('createImageBitmap' in window) {
    const bitmap = await createImageBitmap(blob, { imageOrientation: 'from-image' })
    return { source: bitmap as CanvasImageSource, width: bitmap.width, height: bitmap.height, close: () => bitmap.close() }
  }
  const url = URL.createObjectURL(blob)
  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const element = new Image()
    element.onload = () => resolve(element)
    element.onerror = () => reject(new Error('The image could not be decoded'))
    element.src = url
  })
  return { source: image as CanvasImageSource, width: image.naturalWidth, height: image.naturalHeight, close: () => URL.revokeObjectURL(url) }
}

async function canvasBlob(source: CanvasImageSource, width: number, height: number, type: string, quality?: number): Promise<Blob> {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const context = canvas.getContext('2d', { alpha: type === 'image/png' })
  if (!context) throw new Error('Image processing is unavailable in this browser')
  if (type !== 'image/png') { context.fillStyle = '#fff'; context.fillRect(0, 0, width, height) }
  context.imageSmoothingEnabled = true
  context.imageSmoothingQuality = 'high'
  context.drawImage(source, 0, 0, width, height)
  return await new Promise((resolve, reject) => canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error('The image could not be optimized')), type, quality))
}

async function encodeWithinLimit(source: CanvasImageSource, width: number, height: number, preferPng: boolean) {
  let dimensions = scaledDimensions(width, height)
  if (preferPng) {
    const png = await canvasBlob(source, dimensions.width, dimensions.height, 'image/png')
    if (png.size <= MAX_IMAGE_BYTES) return { blob: png, ...dimensions }
  }
  for (const quality of [0.94, 0.88, 0.82, 0.74, 0.64]) {
    const jpeg = await canvasBlob(source, dimensions.width, dimensions.height, 'image/jpeg', quality)
    if (jpeg.size <= MAX_IMAGE_BYTES) return { blob: jpeg, ...dimensions }
  }
  for (let attempt = 0; attempt < 4; attempt += 1) {
    dimensions = scaledDimensions(dimensions.width, dimensions.height, Math.round(Math.max(dimensions.width, dimensions.height) * 0.8))
    const jpeg = await canvasBlob(source, dimensions.width, dimensions.height, 'image/jpeg', 0.82)
    if (jpeg.size <= MAX_IMAGE_BYTES) return { blob: jpeg, ...dimensions }
  }
  throw new Error('The image could not be reduced below 8 MB without losing too much detail')
}

export async function normalizeImage(file: File): Promise<NormalizedImage> {
  if (file.size > MAX_SOURCE_IMAGE_BYTES) throw new Error(`${file.name}: source image exceeds 40 MB`)
  const heicCandidate = isPotentialHeic(file)
  let sourceBlob: Blob = file
  let convertedFromHeic = false
  let sourceDimensions: { width: number; height: number } | null = null

  if (heicCandidate || !ACCEPTED_IMAGE_TYPES.includes(file.type as typeof ACCEPTED_IMAGE_TYPES[number])) {
    const { heicTo, isHeic } = await import('heic-to/csp')
    if (!await isHeic(file)) throw new Error(`${file.name}: use HEIC, JPEG, PNG, or WebP`)
    sourceBlob = await heicTo({ blob: file, type: 'image/jpeg', quality: 0.94 })
    convertedFromHeic = true
  } else {
    const bytes = new Uint8Array(await file.arrayBuffer())
    if (!matchesImageSignature(bytes, file.type)) throw new Error(`${file.name}: file contents do not match the image type`)
    sourceDimensions = imageDimensions(bytes, file.type)
    if (!sourceDimensions) throw new Error(`${file.name}: image dimensions could not be verified`)
  }

  const decoded = await decode(sourceBlob)
  try {
    if (decoded.width < 64 || decoded.height < 64) throw new Error(`${file.name}: image is too small to analyze`)
    if (decoded.width > MAX_SOURCE_EDGE || decoded.height > MAX_SOURCE_EDGE || decoded.width * decoded.height > MAX_SOURCE_PIXELS) {
      throw new Error(`${file.name}: image dimensions are too large to process safely`)
    }
    const canKeepOriginal = !convertedFromHeic && file.size <= MAX_IMAGE_BYTES && Math.max(decoded.width, decoded.height) <= MAX_EDGE
    const normalized = canKeepOriginal
      ? { blob: file as Blob, width: sourceDimensions!.width, height: sourceDimensions!.height }
      : await encodeWithinLimit(decoded.source, decoded.width, decoded.height, file.type === 'image/png')
    const normalizedFile = new File([normalized.blob], normalizedFileName(file.name, normalized.blob.type), { type: normalized.blob.type, lastModified: file.lastModified })
    const head = new Uint8Array(await normalizedFile.slice(0, 16).arrayBuffer())
    if (!matchesImageSignature(head, normalizedFile.type)) throw new Error(`${file.name}: normalized image signature is invalid`)
    return {
      file: normalizedFile,
      preview: URL.createObjectURL(normalizedFile),
      dataUrl: await readDataUrl(normalizedFile),
      width: normalized.width,
      height: normalized.height,
      optimized: convertedFromHeic || normalizedFile.size !== file.size || normalizedFile.type !== file.type,
    }
  } finally { decoded.close() }
}
