import {
  MODEL_ID,
  MODEL_PROVIDER,
  PROMPT_VERSION,
  analyzeRequestSchema,
  compareToReference,
  transcribeImages,
} from '../ai/analysis.js'
import { EMPTY_TRANSCRIPTION, type AnalysisRecord, type ProcessingStage, type SessionAnalysisRecord } from '../domain/types.js'
import { decodeAndValidateDataUrl, normalizeReference, validateImageMetadata } from '../domain/validation.js'
import type { Env } from '../../worker.js'

const IDLE_TTL_MS = 30 * 60_000
const RATE_WINDOW_MS = 10 * 60_000
const AI_CALL_LIMIT = 6
const MAX_ANALYSES = 20
const CHUNK_BYTES = 1_500_000

type Json = Record<string, unknown>

function response(body: Json, status = 200): Response {
  return Response.json(body, { status, headers: { 'Cache-Control': 'no-store' } })
}

function safeError(error: unknown): string {
  if (error instanceof Error && /limit|type|signature|reference|image|score|evidence/i.test(error.message)) {
    return error.message.slice(0, 240)
  }
  return 'Analysis could not be completed. Please try again.'
}

function emptyRecord(input: ReturnType<typeof analyzeRequestSchema.parse>, referenceText: string): AnalysisRecord {
  return {
    schemaVersion: 1,
    title: input.title,
    subject: input.subject,
    topic: input.topic,
    status: 'processing',
    processingStage: 'preparing',
    processingStartedAt: new Date().toISOString(),
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
  }
}

export class HandSessionRoom {
  private readonly inflight = new Map<string, Promise<Json>>()

  constructor(private readonly state: DurableObjectState, private readonly env: Env) {}

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url)
    if (url.pathname.endsWith('/connect') && request.headers.get('Upgrade') === 'websocket') {
      return this.connect()
    }

    await this.touch()
    const path = url.pathname.replace(/^\/api\/session/, '') || '/'
    try {
      if (request.method === 'POST' && path === '/') return response({ success: true, data: { expiresInMinutes: 30 } })
      if (request.method === 'GET' && path === '/analyses') return response({ success: true, data: await this.list() })
      if (request.method === 'POST' && path === '/analyses') return response(await this.analyze(request))
      if (request.method === 'DELETE' && path === '/') {
        await this.state.storage.deleteAll()
        return response({ success: true, data: {} })
      }

      const imageMatch = /^\/analyses\/([0-9a-f-]+)\/images\/(\d+)$/.exec(path)
      if (request.method === 'GET' && imageMatch) return this.image(imageMatch[1], Number(imageMatch[2]))

      const rerunMatch = /^\/analyses\/([0-9a-f-]+)\/rerun$/.exec(path)
      if (request.method === 'POST' && rerunMatch) return response(await this.rerun(rerunMatch[1], request))

      const recordMatch = /^\/analyses\/([0-9a-f-]+)$/.exec(path)
      if (recordMatch) {
        const id = recordMatch[1]
        if (request.method === 'GET') {
          const record = await this.readAnalysis(id)
          return record ? response({ success: true, data: record }) : response({ success: false, error: 'Analysis not found' }, 404)
        }
        if (request.method === 'PATCH') return response(await this.update(id, request))
        if (request.method === 'DELETE') return response(await this.remove(id))
      }
      return response({ success: false, error: 'Not found' }, 404)
    } catch (error) {
      console.error('[session]', error instanceof Error ? error.message : String(error))
      return response({ success: false, error: safeError(error) }, 400)
    }
  }

  async alarm(): Promise<void> {
    if (this.state.getWebSockets().length) return
    const lastSeen = (await this.state.storage.get<number>('lastSeen')) ?? 0
    const remaining = lastSeen + IDLE_TTL_MS - Date.now()
    if (remaining > 0) await this.state.storage.setAlarm(Date.now() + remaining)
    else await this.state.storage.deleteAll()
  }

  async webSocketMessage(ws: WebSocket, message: ArrayBuffer | string): Promise<void> {
    if (message === 'ping') ws.send('pong')
    await this.state.storage.put('lastSeen', Date.now())
  }

  async webSocketClose(ws: WebSocket, code: number, reason: string): Promise<void> {
    ws.close(code, reason)
    await this.scheduleCleanup()
  }

  async webSocketError(): Promise<void> {
    await this.scheduleCleanup()
  }

  private async connect(): Promise<Response> {
    const pair = new WebSocketPair()
    const [client, server] = Object.values(pair)
    this.state.acceptWebSocket(server)
    await this.state.storage.put('lastSeen', Date.now())
    await this.state.storage.deleteAlarm()
    return new Response(null, { status: 101, webSocket: client })
  }

  private async touch(): Promise<void> {
    await this.state.storage.put('lastSeen', Date.now())
    if (!this.state.getWebSockets().length) await this.state.storage.setAlarm(Date.now() + IDLE_TTL_MS)
  }

  private async scheduleCleanup(): Promise<void> {
    await this.state.storage.put('lastSeen', Date.now())
    await this.state.storage.setAlarm(Date.now() + IDLE_TTL_MS)
  }

  private async analyze(request: Request): Promise<Json> {
    const body = analyzeRequestSchema.parse(await request.json())
    if (request.headers.get('Idempotency-Key') !== body.requestId) {
      return { success: false, error: 'A matching idempotency key is required' }
    }
    const running = this.inflight.get(body.requestId)
    if (running) return running
    const existingId = await this.state.storage.get<string>(`idem:${body.requestId}`)
    if (existingId) return { success: true, data: { recordId: existingId } }
    const operation = this.prepareAnalysis(body).finally(() => this.inflight.delete(body.requestId))
    this.inflight.set(body.requestId, operation)
    return operation
  }

  private async prepareAnalysis(input: ReturnType<typeof analyzeRequestSchema.parse>): Promise<Json> {
    await this.consumeAiBudget()
    const ids = await this.ids()
    if (ids.length >= MAX_ANALYSES) return { success: false, error: `This session is limited to ${MAX_ANALYSES} analyses. Delete one to continue.` }

    const metadata = validateImageMetadata(input.imageFiles)
    if (input.imageDataUrls.length !== metadata.length) throw new Error('Every uploaded image must include analysis data')
    const images = metadata.map((item, index) => {
      const bytes = decodeAndValidateDataUrl(input.imageDataUrls[index], item.mimeType)
      if (bytes.byteLength !== item.size) throw new Error(`${item.name} size does not match its metadata`)
      return { metadata: item, bytes }
    })
    const recordId = crypto.randomUUID()
    const now = new Date().toISOString()
    const storedMetadata = metadata.map((item, index) => ({ ...item, key: `${recordId}/${index}` }))
    const normalizedInput = { ...input, imageFiles: storedMetadata }
    const envelope: SessionAnalysisRecord = {
      recordId,
      createdAt: now,
      updatedAt: now,
      data: emptyRecord(normalizedInput, normalizeReference(input.referenceText)),
    }

    await this.saveAnalysis(envelope)
    await Promise.all(images.map((image, index) => this.writeBytes(`image:${recordId}:${index}`, image.bytes)))
    await this.state.storage.put(`idem:${input.requestId}`, recordId)

    this.state.waitUntil(this.runAnalysis(envelope, images))
    return { success: true, data: { recordId, status: 'processing' } }
  }

  private async runAnalysis(
    envelope: SessionAnalysisRecord,
    images: Array<{ metadata: ReturnType<typeof validateImageMetadata>[number]; bytes: Uint8Array }>,
  ): Promise<void> {
    try {
      await this.setStage(envelope, 'transcribing')
      const transcription = await transcribeImages(this.env, this.env.APP_OWNER_JWT, images)
      let comparison = null
      if (envelope.data.referenceText) {
        await this.setStage(envelope, 'comparing')
        comparison = await compareToReference(this.env, this.env.APP_OWNER_JWT, transcription.fullText, envelope.data.referenceText)
      }
      await this.setStage(envelope, 'finalizing')
      envelope.data = {
        ...envelope.data,
        title: envelope.data.title || transcription.suggestedTopic || 'Untitled notes',
        subject: envelope.data.subject || transcription.suggestedSubject,
        topic: envelope.data.topic || transcription.suggestedTopic,
        status: 'needs_review',
        processingStage: 'complete',
        originalTranscriptionJson: JSON.stringify(transcription),
        comparisonJson: comparison ? JSON.stringify(comparison) : '',
      }
    } catch (error) {
      envelope.data.status = 'failed'
      envelope.data.processingStage = 'failed'
      envelope.data.errorSummary = safeError(error)
    }
    envelope.updatedAt = new Date().toISOString()
    await this.saveAnalysis(envelope)
  }

  private async setStage(envelope: SessionAnalysisRecord, stage: ProcessingStage): Promise<void> {
    envelope.data.processingStage = stage
    envelope.updatedAt = new Date().toISOString()
    await this.saveAnalysis(envelope)
  }

  private async rerun(id: string, request: Request): Promise<Json> {
    const key = request.headers.get('Idempotency-Key')
    if (!key || !/^[0-9a-f-]{36}$/.test(key)) return { success: false, error: 'An idempotency key is required' }
    const cached = await this.state.storage.get<string>(`idem:${key}`)
    if (cached) return { success: true, data: { recordId: id } }
    await this.consumeAiBudget()
    const envelope = await this.readAnalysis(id)
    if (!envelope) return { success: false, error: 'Analysis not found' }
    if (!envelope.data.referenceText.trim()) return { success: false, error: 'A reference transcript is required' }
    const original = JSON.parse(envelope.data.originalTranscriptionJson) as { fullText?: string }
    const text = envelope.data.correctedTranscription || original.fullText || ''
    const comparison = await compareToReference(this.env, this.env.APP_OWNER_JWT, text, envelope.data.referenceText)
    envelope.data = { ...envelope.data, comparisonJson: JSON.stringify(comparison), comparisonStale: 0, status: 'needs_review', errorSummary: '' }
    envelope.updatedAt = new Date().toISOString()
    await this.saveAnalysis(envelope)
    await this.state.storage.put(`idem:${key}`, id)
    return { success: true, data: { recordId: id } }
  }

  private async update(id: string, request: Request): Promise<Json> {
    const envelope = await this.readAnalysis(id)
    if (!envelope) return { success: false, error: 'Analysis not found' }
    const body = await request.json<Json>()
    const title = typeof body.title === 'string' ? body.title.trim().slice(0, 140) : envelope.data.title
    const corrected = typeof body.correctedTranscription === 'string' ? body.correctedTranscription.slice(0, 250_000) : envelope.data.correctedTranscription
    envelope.data = {
      ...envelope.data,
      title: title || envelope.data.title,
      correctedTranscription: corrected,
      comparisonStale: body.comparisonStale === 1 ? 1 : envelope.data.comparisonStale,
      status: body.status === 'saved' ? 'saved' : envelope.data.status,
    }
    envelope.updatedAt = new Date().toISOString()
    await this.saveAnalysis(envelope)
    return { success: true, data: envelope }
  }

  private async remove(id: string): Promise<Json> {
    const envelope = await this.readAnalysis(id)
    if (!envelope) return { success: false, error: 'Analysis not found' }
    const count = JSON.parse(envelope.data.imageFilesJson).length as number
    await Promise.all([this.deleteBytes(`analysis:${id}`), ...Array.from({ length: count }, (_, index) => this.deleteBytes(`image:${id}:${index}`))])
    await this.state.storage.put('ids', (await this.ids()).filter((item) => item !== id))
    return { success: true, data: {} }
  }

  private async image(id: string, index: number): Promise<Response> {
    const envelope = await this.readAnalysis(id)
    if (!envelope) return response({ success: false, error: 'Analysis not found' }, 404)
    const files = JSON.parse(envelope.data.imageFilesJson) as Array<{ mimeType: string }>
    if (!files[index]) return response({ success: false, error: 'Image not found' }, 404)
    const bytes = await this.readBytes(`image:${id}:${index}`)
    if (!bytes) return response({ success: false, error: 'Image not found' }, 404)
    return new Response(bytes.slice().buffer as ArrayBuffer, { headers: { 'Content-Type': files[index].mimeType, 'Cache-Control': 'private, no-store', 'X-Content-Type-Options': 'nosniff' } })
  }

  private async list(): Promise<SessionAnalysisRecord[]> {
    const records = await Promise.all((await this.ids()).map((id) => this.readAnalysis(id)))
    return records.filter((item): item is SessionAnalysisRecord => Boolean(item)).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
  }

  private async ids(): Promise<string[]> {
    return (await this.state.storage.get<string[]>('ids')) ?? []
  }

  private async saveAnalysis(record: SessionAnalysisRecord): Promise<void> {
    await this.writeBytes(`analysis:${record.recordId}`, new TextEncoder().encode(JSON.stringify(record)))
    const ids = await this.ids()
    if (!ids.includes(record.recordId)) await this.state.storage.put('ids', [record.recordId, ...ids])
  }

  private async readAnalysis(id: string): Promise<SessionAnalysisRecord | null> {
    const bytes = await this.readBytes(`analysis:${id}`)
    return bytes ? JSON.parse(new TextDecoder().decode(bytes)) as SessionAnalysisRecord : null
  }

  private async consumeAiBudget(): Promise<void> {
    const now = Date.now()
    const recent = ((await this.state.storage.get<number[]>('aiCalls')) ?? []).filter((time) => now - time < RATE_WINDOW_MS)
    if (recent.length >= AI_CALL_LIMIT) throw new Error('AI request limit reached. Try again in a few minutes.')
    await this.state.storage.put('aiCalls', [...recent, now])
  }

  private async writeBytes(key: string, bytes: Uint8Array): Promise<void> {
    await this.deleteBytes(key)
    const count = Math.ceil(bytes.byteLength / CHUNK_BYTES)
    await Promise.all(Array.from({ length: count }, (_, index) => {
      const chunk = bytes.slice(index * CHUNK_BYTES, (index + 1) * CHUNK_BYTES)
      return this.state.storage.put(`${key}:${index}`, chunk.buffer)
    }))
    await this.state.storage.put(`${key}:chunks`, count)
  }

  private async readBytes(key: string): Promise<Uint8Array | null> {
    const count = await this.state.storage.get<number>(`${key}:chunks`)
    if (!count) return null
    const chunks = await Promise.all(Array.from({ length: count }, (_, index) => this.state.storage.get<ArrayBuffer>(`${key}:${index}`)))
    if (chunks.some((chunk) => !chunk)) return null
    const size = chunks.reduce((sum, chunk) => sum + (chunk?.byteLength ?? 0), 0)
    const output = new Uint8Array(size)
    let offset = 0
    for (const chunk of chunks) { output.set(new Uint8Array(chunk!), offset); offset += chunk!.byteLength }
    return output
  }

  private async deleteBytes(key: string): Promise<void> {
    const count = (await this.state.storage.get<number>(`${key}:chunks`)) ?? 0
    await this.state.storage.delete([`${key}:chunks`, ...Array.from({ length: count }, (_, index) => `${key}:${index}`)])
  }
}
