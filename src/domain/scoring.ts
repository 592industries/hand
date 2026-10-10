import type { ComparisonCandidate, ScoreBreakdown } from './types'

const BASE_WEIGHTS = { coverage: 0.4, agreement: 0.35, technical: 0.25 } as const

function bounded(value: number, label: string): number {
  if (!Number.isFinite(value) || value < 0 || value > 100) {
    throw new Error(`${label} must be between 0 and 100`)
  }
  return value
}

export function calculateScore(candidate: ComparisonCandidate): ScoreBreakdown | null {
  if (!candidate.referenceSuitable) return null
  if (candidate.coverageScore === undefined || candidate.agreementScore === undefined) {
    throw new Error('Suitable references require coverage and agreement scores')
  }

  const coverage = bounded(candidate.coverageScore, 'Coverage score')
  const agreement = bounded(candidate.agreementScore, 'Agreement score')
  const technical = candidate.technicalApplicable
    ? bounded(candidate.technicalScore ?? Number.NaN, 'Technical score')
    : null
  const active = technical === null
    ? BASE_WEIGHTS.coverage + BASE_WEIGHTS.agreement
    : 1
  const weights = {
    coverage: BASE_WEIGHTS.coverage / active,
    agreement: BASE_WEIGHTS.agreement / active,
    technical: technical === null ? 0 : BASE_WEIGHTS.technical,
  }
  const overall = Math.round(
    coverage * weights.coverage +
    agreement * weights.agreement +
    (technical ?? 0) * weights.technical,
  )

  return { overall, coverage, agreement, technical, weights }
}

export function validateFindingEvidence(candidate: ComparisonCandidate): void {
  const substantive = [
    ...candidate.omissions,
    ...candidate.discrepancies,
    ...candidate.unsupportedAdditions,
  ]
  for (const finding of substantive) {
    if (!finding.referenceEvidence.trim()) {
      throw new Error('Substantive findings require reference evidence')
    }
    if (!finding.claim.trim() || !finding.explanation.trim()) {
      throw new Error('Findings require a claim and explanation')
    }
  }
}

