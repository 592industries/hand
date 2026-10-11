import type { CollectionSchema } from 'deepspace/schema'

export const analysesSchema: CollectionSchema = {
  name: 'analyses',
  columns: [
    { name: 'schemaVersion', storage: 'number', interpretation: 'plain' },
    { name: 'title', storage: 'text', interpretation: 'plain' },
    { name: 'subject', storage: 'text', interpretation: 'plain' },
    { name: 'topic', storage: 'text', interpretation: 'plain' },
    { name: 'status', storage: 'text', interpretation: 'plain' },
    { name: 'processingStage', storage: 'text', interpretation: 'plain' },
    { name: 'processingStartedAt', storage: 'text', interpretation: 'plain' },
    { name: 'imageFilesJson', storage: 'text', interpretation: 'plain' },
    { name: 'referenceText', storage: 'text', interpretation: 'plain' },
    { name: 'referenceFileName', storage: 'text', interpretation: 'plain' },
    { name: 'hasReference', storage: 'number', interpretation: { kind: 'boolean' } },
    { name: 'originalTranscriptionJson', storage: 'text', interpretation: 'plain' },
    { name: 'correctedTranscription', storage: 'text', interpretation: 'plain' },
    { name: 'comparisonJson', storage: 'text', interpretation: 'plain' },
    { name: 'comparisonStale', storage: 'number', interpretation: { kind: 'boolean' } },
    { name: 'modelProvider', storage: 'text', interpretation: 'plain' },
    { name: 'modelId', storage: 'text', interpretation: 'plain' },
    { name: 'promptVersion', storage: 'text', interpretation: 'plain' },
    { name: 'errorSummary', storage: 'text', interpretation: 'plain' },
  ],
  permissions: {
    '*': { read: false, create: false, update: false, delete: false },
    viewer: { read: 'own', create: false, update: false, delete: false },
    member: { read: 'own', create: true, update: 'own', delete: 'own' },
    admin: { read: true, create: true, update: true, delete: true },
  },
}

