import {
  analysisRecordSchema,
  comparisonSchema,
  imageFileSchema,
  transcriptionSchema,
  type AnalysisRecord,
  type Comparison,
  type ImageFile,
  type Transcription,
} from './types'

export function parseAnalysisRecord(value: unknown): AnalysisRecord {
  return analysisRecordSchema.parse(value)
}

export function getTranscription(record: AnalysisRecord): Transcription {
  return transcriptionSchema.parse(JSON.parse(record.originalTranscriptionJson))
}

export function getComparison(record: AnalysisRecord): Comparison | null {
  if (!record.comparisonJson) return null
  return comparisonSchema.parse(JSON.parse(record.comparisonJson))
}

export function getImageFiles(record: AnalysisRecord): ImageFile[] {
  return imageFileSchema.array().parse(JSON.parse(record.imageFilesJson))
}

