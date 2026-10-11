import { describe, expect, it } from 'vitest'
import { analysisRecordSchema, processingStageSchema } from './types'

const legacyRecord = {
  schemaVersion: 1,
  title: 'Notes',
  subject: '',
  topic: '',
  status: 'saved',
  imageFilesJson: '[]',
  referenceText: '',
  referenceFileName: '',
  hasReference: 0,
  originalTranscriptionJson: '{}',
  correctedTranscription: '',
  comparisonJson: '',
  comparisonStale: 0,
  modelProvider: 'anthropic',
  modelId: 'test',
  promptVersion: 'test',
  errorSummary: '',
}

describe('analysis processing state', () => {
  it('keeps existing records readable after the progress fields are added', () => {
    expect(analysisRecordSchema.parse(legacyRecord)).toMatchObject({
      processingStage: 'complete',
      processingStartedAt: '',
    })
  })

  it('accepts only truthful backend stages', () => {
    expect(processingStageSchema.options).toEqual([
      'preparing', 'transcribing', 'comparing', 'finalizing', 'complete', 'failed',
    ])
  })
})
