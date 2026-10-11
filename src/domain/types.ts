import { z } from 'zod'

export const uncertaintySchema = z.object({
  text: z.string().max(2_000),
  reason: z.string().max(2_000),
  alternatives: z.array(z.string().max(1_000)).max(10).default([]),
  imageIndex: z.number().int().min(0).optional(),
  region: z.string().max(500).optional(),
})

export const equationSchema = z.object({
  raw: z.string().max(4_000),
  latex: z.string().max(4_000),
  interpretation: z.string().max(4_000).optional(),
  uncertain: z.boolean().default(false),
})

export const transcriptionSchema = z.object({
  fullText: z.string().max(250_000),
  sections: z.array(z.object({ heading: z.string().max(500), content: z.string().max(30_000) })).max(100),
  equations: z.array(equationSchema).max(100),
  keyConcepts: z.array(z.string().max(1_000)).max(100),
  summary: z.string().max(20_000),
  suggestedSubject: z.string().max(100),
  suggestedTopic: z.string().max(140),
  suggestedTags: z.array(z.string().max(100)).max(30),
  uncertainties: z.array(uncertaintySchema).max(100),
  legibility: z.enum(['high', 'medium', 'low']),
})

export const evidenceFindingSchema = z.object({
  claim: z.string().max(4_000),
  referenceEvidence: z.string().max(4_000),
  notesEvidence: z.string().max(4_000).optional(),
  explanation: z.string().max(8_000),
})

export const comparisonCandidateSchema = z.object({
  referenceSuitable: z.boolean(),
  limitation: z.string().optional(),
  coverageScore: z.number().min(0).max(100).optional(),
  agreementScore: z.number().min(0).max(100).optional(),
  technicalScore: z.number().min(0).max(100).optional(),
  technicalApplicable: z.boolean(),
  omissions: z.array(evidenceFindingSchema).max(100),
  discrepancies: z.array(evidenceFindingSchema).max(100),
  unsupportedAdditions: z.array(evidenceFindingSchema).max(100),
  correctConcepts: z.array(evidenceFindingSchema).max(100),
  uncertainComparisons: z.array(evidenceFindingSchema).max(100),
  explanation: z.string().max(20_000),
  suggestedCorrections: z.array(z.string().max(4_000)).max(100),
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

export const processingStageSchema = z.enum([
  'preparing',
  'transcribing',
  'comparing',
  'finalizing',
  'complete',
  'failed',
])

export const analysisRecordSchema = z.object({
  schemaVersion: z.literal(1),
  title: z.string(),
  subject: z.string(),
  topic: z.string(),
  status: analysisStatusSchema,
  processingStage: processingStageSchema.default('complete'),
  processingStartedAt: z.string().default(''),
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
export type ProcessingStage = z.infer<typeof processingStageSchema>

export interface SessionAnalysisRecord {
  recordId: string
  createdAt: string
  updatedAt: string
  data: AnalysisRecord
}

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

