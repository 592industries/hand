import { Link } from 'react-router-dom'
import { ArrowRight, FileText } from 'lucide-react'
import { Badge } from './ui'
import type { AnalysisRecord, SessionAnalysisRecord } from '../domain/types'
import { getComparison } from '../domain/record'

const statusLabel: Record<AnalysisRecord['status'], string> = {
  processing: 'Processing',
  needs_review: 'Needs review',
  saved: 'Saved',
  failed: 'Failed',
}

export function AnalysisRow({ record }: { record: SessionAnalysisRecord }) {
  let score: number | null = null
  try { score = getComparison(record.data)?.score?.overall ?? null } catch { /* malformed legacy record */ }
  return (
    <Link
      to={`/analysis/${record.recordId}`}
      className="group flex min-h-20 items-center gap-4 px-4 py-3 transition-colors hover:bg-accent/55 sm:px-5"
    >
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary"><FileText size={18} /></span>
      <span className="min-w-0 flex-1">
        <span className="block truncate font-semibold text-foreground">{record.data.title}</span>
        <span className="mt-1 block truncate text-xs text-muted-foreground">
          {[record.data.subject, record.data.topic].filter(Boolean).join(' · ') || 'Uncategorized'} · {new Date(record.updatedAt).toLocaleDateString()}
        </span>
      </span>
      {score !== null && <span className="hidden text-right sm:block"><strong className="block text-lg tabular-nums text-foreground">{score}</strong><small className="text-muted-foreground">match</small></span>}
      <Badge className="hidden sm:inline-flex" variant={record.data.status === 'failed' ? 'destructive' : record.data.status === 'saved' ? 'success' : 'warning'}>{statusLabel[record.data.status]}</Badge>
      <ArrowRight size={17} className="text-muted-foreground transition-colors group-hover:text-primary" />
    </Link>
  )
}

