import type { ActionHandler, ActionResult } from 'deepspace/worker'
import type { Env } from '../../worker'
import {
  MODEL_ID,
  MODEL_PROVIDER,
  PROMPT_VERSION,
  analyzeRequestSchema,
  compareToReference,
  transcribeImages,
} from '../ai/analysis'
import { EMPTY_TRANSCRIPTION, type AnalysisRecord } from '../domain/types'
import { decodeAndValidateDataUrl, normalizeReference, validateImageMetadata } from '../domain/validation'

type AnalyzeResult = { recordId: string; failed?: boolean }

const safeError = (error: unknown): string => {
  if (error instanceof Error && /limit|type|signature|reference|image|score|evidence/i.test(error.message)) {
    return error.message.slice(0, 240)
  }
  return 'Analysis could not be completed. Please try again.'
}

const emptyRecord = (
  input: ReturnType<typeof analyzeRequestSchema.parse>,
  referenceText: string,
): AnalysisRecord => ({
  schemaVersion: 1,
  title: input.title,
  subject: input.subject,
  topic: input.topic,
  status: 'processing',
  imageFilesJson: JSON.stringify(input.imageFiles),
  referenceText,
  referenceFileName: input.referenceFileName,
  hasReference: referenceText ? 1 : 0,
  originalTranscriptionJson: JSON.stringify(EMPTY_TRANSCRIPTION),
  correctedTranscription: '',
  comparisonJson: '',
  comparisonStale: 0,
  modelProvider: MODEL_PROVIDER,
  modelId: MODEL_ID,
  promptVersion: PROMPT_VERSION,
  errorSummary: '',
})

const analyze: ActionHandler<Env> = async ({ params, tools, callerJwt, env }): Promise<ActionResult<AnalyzeResult>> => {
  let recordId = ''
  try {
    const input = analyzeRequestSchema.parse(params)
    const imageFiles = validateImageMetadata(input.imageFiles)
    if (input.imageDataUrls.length !== imageFiles.length) throw new Error('Every uploaded image must include analysis data')
    const referenceText = normalizeReference(input.referenceText)
    const created = await tools.create('analyses', emptyRecord(input, referenceText))
    if (!created.success) return created
    recordId = created.data.recordId

    const images = imageFiles.map((metadata, index) => ({
      metadata,
      bytes: decodeAndValidateDataUrl(input.imageDataUrls[index], metadata.mimeType),
    }))
    const transcription = await transcribeImages(env, callerJwt, images)
    const comparison = referenceText
      ? await compareToReference(env, callerJwt, transcription.fullText, referenceText)
      : null
    const updated = await tools.update<AnalysisRecord>('analyses', recordId, {
      title: input.title || transcription.suggestedTopic || 'Untitled notes',
      subject: input.subject || transcription.suggestedSubject,
      topic: input.topic || transcription.suggestedTopic,
      status: 'needs_review',
      originalTranscriptionJson: JSON.stringify(transcription),
      comparisonJson: comparison ? JSON.stringify(comparison) : '',
    })
    if (!updated.success) return updated
    return { success: true, data: { recordId } }
  } catch (error) {
    if (recordId) {
      await tools.update<AnalysisRecord>('analyses', recordId, {
        status: 'failed',
        errorSummary: safeError(error),
      })
      return { success: true, data: { recordId, failed: true } }
    }
    return { success: false, error: safeError(error) }
  }
}

const rerunComparison: ActionHandler<Env> = async ({ params, tools, userId, callerJwt, env }) => {
  const recordId = typeof params.recordId === 'string' ? params.recordId : ''
  if (!recordId) return { success: false, error: 'Missing analysis id' }
  const found = await tools.get<AnalysisRecord>('analyses', recordId)
  if (!found.success) return found
  if (found.data.record.createdBy !== userId) return { success: false, error: 'Forbidden' }
  const record = found.data.record.data
  if (!record.referenceText.trim()) return { success: false, error: 'A reference transcript is required' }
  try {
    const text = record.correctedTranscription || JSON.parse(record.originalTranscriptionJson).fullText
    const comparison = await compareToReference(env, callerJwt, text, record.referenceText)
    const updated = await tools.update<AnalysisRecord>('analyses', recordId, {
      comparisonJson: JSON.stringify(comparison),
      comparisonStale: 0,
      status: 'needs_review',
      errorSummary: '',
    })
    if (!updated.success) return updated
    return { success: true, data: { recordId } }
  } catch (error) {
    return { success: false, error: safeError(error) }
  }
}

export const actions: Record<string, ActionHandler<Env>> = {
  analyze,
  rerunComparison,
}
