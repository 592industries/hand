import { useEffect, useState } from 'react'
import type { SessionAnalysisRecord } from '../domain/types'
import { sessionApi } from '../lib/session'

export function useSessionAnalyses(limit?: number) {
  const [records, setRecords] = useState<SessionAnalysisRecord[]>([])
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    sessionApi.list().then((items) => {
      if (active) { setRecords(limit ? items.slice(0, limit) : items); setStatus('ready') }
    }).catch((cause) => {
      if (active) { setError(cause instanceof Error ? cause.message : 'Could not load session'); setStatus('error') }
    })
    return () => { active = false }
  }, [limit])

  return { records, status, error }
}
