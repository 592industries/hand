import { describe, expect, it } from 'vitest'
import { calculateScore, validateFindingEvidence } from './scoring'
import type { ComparisonCandidate } from './types'

const base: ComparisonCandidate = {
  referenceSuitable: true,
  coverageScore: 80,
  agreementScore: 90,
  technicalScore: 70,
  technicalApplicable: true,
  omissions: [], discrepancies: [], unsupportedAdditions: [], correctConcepts: [], uncertainComparisons: [],
  explanation: 'Evidence-based comparison.', suggestedCorrections: [],
}

describe('calculateScore', () => {
  it('uses the documented 40/35/25 weighting', () => {
    expect(calculateScore(base)).toMatchObject({ overall: 81, coverage: 80, agreement: 90, technical: 70 })
  })

  it('renormalizes when technical scoring is not applicable', () => {
    const score = calculateScore({ ...base, technicalApplicable: false, technicalScore: undefined })
    expect(score?.overall).toBe(85)
    expect(score?.technical).toBeNull()
    expect(score?.weights.coverage).toBeCloseTo(0.4 / 0.75)
    expect(score?.weights.agreement).toBeCloseTo(0.35 / 0.75)
  })

  it('does not score an unsuitable reference', () => {
    expect(calculateScore({ ...base, referenceSuitable: false })).toBeNull()
  })

  it('rejects invalid ranges and missing applicable dimensions', () => {
    expect(() => calculateScore({ ...base, coverageScore: 101 })).toThrow(/between 0 and 100/)
    expect(() => calculateScore({ ...base, technicalScore: undefined })).toThrow(/Technical score/)
  })
})

describe('finding evidence', () => {
  it('requires evidence for substantive findings', () => {
    expect(() => validateFindingEvidence({ ...base, omissions: [{ claim: 'Missing concept', referenceEvidence: '', explanation: 'Not present.' }] })).toThrow(/reference evidence/)
  })
})

