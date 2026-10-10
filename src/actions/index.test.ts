import { beforeEach, describe, expect, it, vi } from 'vitest'
import { EMPTY_TRANSCRIPTION } from '../domain/types'

vi.mock('../ai/analysis', async () => {
  const actual = await vi.importActual<typeof import('../ai/analysis')>('../ai/analysis')
  return {
    ...actual,
    transcribeImages: vi.fn(async () => ({ ...EMPTY_TRANSCRIPTION, fullText: 'Energy is conserved.', summary: 'Energy notes', legibility: 'high' })),
    compareToReference: vi.fn(),
  }
})

import { transcribeImages } from '../ai/analysis'
import { actions } from './index'

const jpegData = 'data:image/jpeg;base64,/9j/AA=='
const params = {
  requestId: '5f98b9b8-b305-43fe-9640-81f9c2ce6480',
  title: 'Physics', subject: 'Science', topic: 'Energy', referenceText: '', referenceFileName: '',
  imageFiles: [{ key: 'private-key', name: 'notes.jpg', mimeType: 'image/jpeg', size: 4, width: 100, height: 100 }],
  imageDataUrls: [jpegData],
}

function tools() {
  return {
    create: vi.fn(async () => ({ success: true as const, data: { recordId: 'record-1' } })),
    update: vi.fn(async () => ({ success: true as const, data: { recordId: 'record-1' } })),
    get: vi.fn(), remove: vi.fn(), deleteWhere: vi.fn(), query: vi.fn(), integration: vi.fn(), registerUser: vi.fn(),
  }
}

describe('analysis actions', () => {
  beforeEach(() => vi.clearAllMocks())

  it('persists validated transcription without fabricating a comparison', async () => {
    const mockedTools = tools()
    const result = await actions.analyze({ params, tools: mockedTools as never, userId: 'user-1', callerJwt: 'jwt', env: {} as never })
    expect(result).toEqual({ success: true, data: { recordId: 'record-1' } })
    expect(mockedTools.create).toHaveBeenCalledOnce()
    expect(mockedTools.update).toHaveBeenCalledWith('analyses', 'record-1', expect.objectContaining({
      status: 'needs_review', comparisonJson: '',
    }))
  })

  it('stores a safe failed state when model analysis fails', async () => {
    vi.mocked(transcribeImages).mockRejectedValueOnce(new Error('model timeout'))
    const mockedTools = tools()
    const result = await actions.analyze({ params, tools: mockedTools as never, userId: 'user-1', callerJwt: 'jwt', env: {} as never })
    expect(result).toEqual({ success: true, data: { recordId: 'record-1', failed: true } })
    expect(mockedTools.update).toHaveBeenLastCalledWith('analyses', 'record-1', expect.objectContaining({ status: 'failed' }))
  })

  it('refuses to rerun another user’s analysis', async () => {
    const mockedTools = tools()
    mockedTools.get.mockResolvedValueOnce({ success: true, data: { record: { createdBy: 'someone-else', data: {} } } })
    const result = await actions.rerunComparison({ params: { recordId: 'record-1' }, tools: mockedTools as never, userId: 'user-1', callerJwt: 'jwt', env: {} as never })
    expect(result).toEqual({ success: false, error: 'Forbidden' })
    expect(mockedTools.update).not.toHaveBeenCalled()
  })
})
