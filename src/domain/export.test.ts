import { describe, expect, it } from 'vitest'
import { analysisToMarkdown, exportNames } from './export'
import { EMPTY_TRANSCRIPTION, type AnalysisRecord } from './types'

const record: AnalysisRecord = {
  schemaVersion: 1, title: 'Physics / Week 1', subject: 'Physics', topic: 'Motion', status: 'saved',
  imageFilesJson: '[]', referenceText: '', referenceFileName: '', hasReference: 0,
  originalTranscriptionJson: JSON.stringify(EMPTY_TRANSCRIPTION), correctedTranscription: 'Corrected text',
  comparisonJson: '', comparisonStale: 0, modelProvider: 'anthropic', modelId: 'claude-sonnet-5',
  promptVersion: 'test', errorSummary: '',
}

describe('exports', () => {
  it('exports corrected text and explains an absent reference score', () => {
    const markdown = analysisToMarkdown(record, { ...EMPTY_TRANSCRIPTION, summary: 'Summary' }, null)
    expect(markdown).toContain('Corrected text')
    expect(markdown).toContain('no reference-based score')
    expect(markdown).toContain('not a grade')
  })

  it('creates safe export filenames', () => {
    expect(exportNames(record.title)).toEqual({ markdown: 'physics-week-1.md', json: 'physics-week-1.json' })
  })
})
