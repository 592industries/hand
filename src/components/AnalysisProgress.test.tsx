import { describe, expect, it } from 'vitest'
import { getProcessingStages } from './AnalysisProgress'

describe('analysis progress stages', () => {
  it('shows comparison only when a reference is present', () => {
    expect(getProcessingStages(false).map((stage) => stage.id)).toEqual([
      'preparing', 'transcribing', 'finalizing',
    ])
    expect(getProcessingStages(true).map((stage) => stage.id)).toContain('comparing')
  })
})
