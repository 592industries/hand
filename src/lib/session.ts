import type { SessionAnalysisRecord } from '../domain/types'

type ApiResult<T> = { success: true; data: T } | { success: false; error: string }

let bootstrapPromise: Promise<void> | null = null

async function bootstrapSession(): Promise<void> {
  const controller = new AbortController()
  const timeout = window.setTimeout(() => controller.abort(), 12_000)
  try {
    await parse<unknown>(await fetch('/api/session', {
      method: 'POST',
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },
      body: '{}',
      signal: controller.signal,
    }))
  } finally {
    window.clearTimeout(timeout)
  }
}

async function parse<T>(response: Response): Promise<T> {
  const result = await response.json() as ApiResult<T>
  if (!response.ok || !result.success) throw new Error(result.success ? 'Request failed' : result.error)
  return result.data
}

export function ensureSession(): Promise<void> {
  bootstrapPromise ??= bootstrapSession().catch((error) => {
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
  get: (id: string, signal?: AbortSignal) => request<SessionAnalysisRecord>(`/analyses/${encodeURIComponent(id)}`, { signal }),
  analyze: (body: Record<string, unknown> & { requestId: string }) => request<{ recordId: string; status: 'processing' }>('/analyses', {
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

export function sessionReconnectDelay(attempt: number): number {
  return Math.min(1_000 * 2 ** Math.max(0, attempt), 30_000)
}

export async function openSessionConnection(): Promise<() => void> {
  await ensureSession()
  let stopped = false
  let socket: WebSocket | null = null
  let reconnect: number | undefined
  let ping: number | undefined
  let attempt = 0

  const available = () => document.visibilityState !== 'hidden' && navigator.onLine !== false
  const clearPing = () => {
    if (ping !== undefined) window.clearInterval(ping)
    ping = undefined
  }
  const clearReconnect = () => {
    if (reconnect !== undefined) window.clearTimeout(reconnect)
    reconnect = undefined
  }
  const closeSocket = () => {
    const current = socket
    socket = null
    clearPing()
    if (current) {
      current.onclose = null
      current.close(1000, 'connection paused')
    }
  }

  const schedule = () => {
    if (stopped || !available() || reconnect !== undefined) return
    reconnect = window.setTimeout(() => {
      reconnect = undefined
      connect()
    }, sessionReconnectDelay(attempt++))
  }

  const connect = () => {
    if (stopped || !available() || socket?.readyState === WebSocket.CONNECTING || socket?.readyState === WebSocket.OPEN) return
    clearReconnect()
    const protocol = location.protocol === 'https:' ? 'wss:' : 'ws:'
    try {
      socket = new WebSocket(`${protocol}//${location.host}/api/session/connect`)
    } catch {
      schedule()
      return
    }
    const current = socket
    current.onopen = () => {
      if (socket !== current) return
      attempt = 0
      clearPing()
      ping = window.setInterval(() => current.readyState === WebSocket.OPEN && current.send('ping'), 60_000)
    }
    current.onclose = () => {
      if (socket === current) socket = null
      clearPing()
      schedule()
    }
  }

  const onVisibilityChange = () => available() ? connect() : closeSocket()
  const onOnline = () => connect()
  const onOffline = () => {
    clearReconnect()
    closeSocket()
  }
  document.addEventListener('visibilitychange', onVisibilityChange)
  window.addEventListener('online', onOnline)
  window.addEventListener('offline', onOffline)
  connect()

  return () => {
    stopped = true
    clearReconnect()
    closeSocket()
    document.removeEventListener('visibilitychange', onVisibilityChange)
    window.removeEventListener('online', onOnline)
    window.removeEventListener('offline', onOffline)
  }
}
