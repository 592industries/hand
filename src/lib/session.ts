import type { SessionAnalysisRecord } from '../domain/types'

type ApiResult<T> = { success: true; data: T } | { success: false; error: string }

let bootstrapPromise: Promise<void> | null = null

async function parse<T>(response: Response): Promise<T> {
  const result = await response.json() as ApiResult<T>
  if (!response.ok || !result.success) throw new Error(result.success ? 'Request failed' : result.error)
  return result.data
}

export function ensureSession(): Promise<void> {
  bootstrapPromise ??= fetch('/api/session', {
    method: 'POST',
    credentials: 'same-origin',
    headers: { 'Content-Type': 'application/json' },
    body: '{}',
  }).then((response) => parse<unknown>(response)).then(() => undefined).catch((error) => {
    bootstrapPromise = null
    throw error
  })
  return bootstrapPromise
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  await ensureSession()
  return parse<T>(await fetch(`/api/session${path}`, { ...init, credentials: 'same-origin' }))
}

export const sessionApi = {
  list: () => request<SessionAnalysisRecord[]>('/analyses'),
  get: (id: string) => request<SessionAnalysisRecord>(`/analyses/${encodeURIComponent(id)}`),
  analyze: (body: Record<string, unknown> & { requestId: string }) => request<{ recordId: string; failed?: boolean }>('/analyses', {
    method: 'POST', headers: { 'Content-Type': 'application/json', 'Idempotency-Key': body.requestId }, body: JSON.stringify(body),
  }),
  update: (id: string, body: Record<string, unknown>) => request<SessionAnalysisRecord>(`/analyses/${encodeURIComponent(id)}`, {
    method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
  }),
  rerun: (id: string, requestId: string) => request<{ recordId: string }>(`/analyses/${encodeURIComponent(id)}/rerun`, {
    method: 'POST', headers: { 'Content-Type': 'application/json', 'Idempotency-Key': requestId }, body: '{}',
  }),
  remove: (id: string) => request<unknown>(`/analyses/${encodeURIComponent(id)}`, { method: 'DELETE' }),
  imageUrl: (id: string, index: number) => `/api/session/analyses/${encodeURIComponent(id)}/images/${index}`,
  clear: async () => {
    await request<unknown>('', { method: 'DELETE' })
    bootstrapPromise = null
  },
}

export async function openSessionConnection(): Promise<() => void> {
  await ensureSession()
  let stopped = false
  let socket: WebSocket | null = null
  let reconnect: number | undefined
  let ping: number | undefined

  const connect = () => {
    if (stopped) return
    const protocol = location.protocol === 'https:' ? 'wss:' : 'ws:'
    socket = new WebSocket(`${protocol}//${location.host}/api/session/connect`)
    socket.onopen = () => {
      ping = window.setInterval(() => socket?.readyState === WebSocket.OPEN && socket.send('ping'), 60_000)
    }
    socket.onclose = () => {
      if (ping) window.clearInterval(ping)
      if (!stopped) reconnect = window.setTimeout(connect, 2_000)
    }
  }
  connect()

  return () => {
    stopped = true
    if (reconnect) window.clearTimeout(reconnect)
    if (ping) window.clearInterval(ping)
    socket?.close(1000, 'page closed')
  }
}
