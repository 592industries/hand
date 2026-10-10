import { z } from 'zod'

export const uncertaintySchema = z.object({
  text: z.string(),
  reason: z.string(),
  alternatives: z.array(z.string()).default([]),
  imageIndex: z.number().int().min(0).optional(),
  region: z.string().optional(),
})

export const equationSchema = z.object({
  raw: z.string(),
  latex: z.string(),
  interpretation: z.string().optional(),
  uncertain: z.boolean().default(false),
})

export const transcriptionSchema = z.object({
  fullText: z.string(),
  sections: z.array(z.object({ heading: z.string(), content: z.string() })),
  equations: z.array(equationSchema),
  keyConcepts: z.array(z.string()),
  summary: z.string(),
  suggestedSubject: z.string(),
  suggestedTopic: z.string(),
  suggestedTags: z.array(z.string()),
  uncertainties: z.array(uncertaintySchema),
  legibility: z.enum(['high', 'medium', 'low']),
})

export const evidenceFindingSchema = z.object({
  claim: z.string(),
  referenceEvidence: z.string(),
  notesEvidence: z.string().optional(),
  explanation: z.string(),
})

export const comparisonCandidateSchema = z.object({
  referenceSuitable: z.boolean(),
  limitation: z.string().optional(),
  coverageScore: z.number().min(0).max(100).optional(),
  agreementScore: z.number().min(0).max(100).optional(),
  technicalScore: z.number().min(0).max(100).optional(),
  technicalApplicable: z.boolean(),
  omissions: z.array(evidenceFindingSchema),
  discrepancies: z.array(evidenceFindingSchema),
  unsupportedAdditions: z.array(evidenceFindingSchema),
  correctConcepts: z.array(evidenceFindingSchema),
  uncertainComparisons: z.array(evidenceFindingSchema),
  explanation: z.string(),
  suggestedCorrections: z.array(z.string()),
})

export const scoreBreakdownSchema = z.object({
  overall: z.number().min(0).max(100),
  coverage: z.number().min(0).max(100),
  agreement: z.number().min(0).max(100),
  technical: z.number().min(0).max(100).nullable(),
  weights: z.object({
    coverage: z.number(),
    agreement: z.number(),
    technical: z.number(),
  }),
})

export const comparisonSchema = comparisonCandidateSchema.extend({
  score: scoreBreakdownSchema.nullable(),
})

export const imageFileSchema = z.object({
  key: z.string(),
  name: z.string(),
  mimeType: z.enum(['image/jpeg', 'image/png', 'image/webp']),
  size: z.number().int().positive(),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
})

export const analysisStatusSchema = z.enum([
  'processing',
  'needs_review',
  'saved',
  'failed',
])

export const analysisRecordSchema = z.object({
  schemaVersion: z.literal(1),
  title: z.string(),
  subject: z.string(),
  topic: z.string(),
  status: analysisStatusSchema,
  imageFilesJson: z.string(),
  referenceText: z.string(),
  referenceFileName: z.string(),
  hasReference: z.number().int().min(0).max(1),
  originalTranscriptionJson: z.string(),
  correctedTranscription: z.string(),
  comparisonJson: z.string(),
  comparisonStale: z.number().int().min(0).max(1),
  modelProvider: z.string(),
  modelId: z.string(),
  promptVersion: z.string(),
  errorSummary: z.string(),
})

export type Transcription = z.infer<typeof transcriptionSchema>
export type ComparisonCandidate = z.infer<typeof comparisonCandidateSchema>
export type Comparison = z.infer<typeof comparisonSchema>
export type ScoreBreakdown = z.infer<typeof scoreBreakdownSchema>
export type ImageFile = z.infer<typeof imageFileSchema>
export type AnalysisRecord = z.infer<typeof analysisRecordSchema>
export type AnalysisStatus = z.infer<typeof analysisStatusSchema>

export const EMPTY_TRANSCRIPTION: Transcription = {
  fullText: '',
  sections: [],
  equations: [],
  keyConcepts: [],
  summary: '',
  suggestedSubject: '',
  suggestedTopic: '',
  suggestedTags: [],
  uncertainties: [],
  legibility: 'low',
}

