import { getAuthToken } from 'deepspace'

export type ActionResponse<T> =
  | { success: true; data: T }
  | { success: false; error: string }

export async function callAction<T>(name: string, params: Record<string, unknown>): Promise<T> {
  const token = await getAuthToken()
  if (!token) throw new Error('Please sign in before continuing')
  const response = await fetch(`/api/actions/${encodeURIComponent(name)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(params),
  })
  const result = await response.json() as ActionResponse<T>
  if (!response.ok || !result.success) {
    throw new Error(result.success ? 'Request failed' : result.error)
  }
  return result.data
}

