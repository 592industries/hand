import { describe, expect, it, vi } from 'vitest'
import { HandSessionRoom } from './session-room'

function fakeState(values: Record<string, unknown>, failDeleteOnce = false) {
  const data = new Map(Object.entries(values))
  let shouldFail = failDeleteOnce
  const storage = {
    get: vi.fn(async (key: string) => data.get(key)),
    put: vi.fn(async (key: string, value: unknown) => { data.set(key, value) }),
    delete: vi.fn(async (keys: string | string[]) => { for (const key of Array.isArray(keys) ? keys : [keys]) data.delete(key) }),
    deleteAll: vi.fn(async () => {
      if (shouldFail) { shouldFail = false; throw new Error('temporary failure') }
      data.clear()
    }),
    setAlarm: vi.fn(async () => undefined),
    deleteAlarm: vi.fn(async () => undefined),
  }
  return {
    data,
    state: { storage, getWebSockets: () => [] } as unknown as DurableObjectState,
    storage,
  }
}

describe('session cleanup', () => {
  it('deletes only the expired room and leaves another session untouched', async () => {
    const expired = fakeState({ lastSeen: 0, note: 'expired' })
    const active = fakeState({ lastSeen: Date.now(), note: 'active' })
    const expiredRoom = new HandSessionRoom(expired.state, {} as never)
    const activeRoom = new HandSessionRoom(active.state, {} as never)

    await expiredRoom.alarm()
    await activeRoom.alarm()

    expect(expired.data.size).toBe(0)
    expect(active.data.get('note')).toBe('active')
    expect(active.storage.setAlarm).toHaveBeenCalledOnce()
  })

  it('releases its cleanup lock after a storage failure so an alarm retry can recover', async () => {
    const roomState = fakeState({ lastSeen: 0, note: 'retry' }, true)
    const room = new HandSessionRoom(roomState.state, {} as never)

    await expect(room.alarm()).rejects.toThrow('temporary failure')
    await expect(room.alarm()).resolves.toBeUndefined()
    expect(roomState.data.size).toBe(0)
  })
})
