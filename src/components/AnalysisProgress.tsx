import { useEffect, useState } from 'react'
import { Check, FileSearch, LoaderCircle } from 'lucide-react'
import type { ProcessingStage } from '../domain/types'

const stages: Array<{ id: ProcessingStage; label: string }> = [
  { id: 'preparing', label: 'Preparing pages' },
  { id: 'transcribing', label: 'Transcribing handwriting' },
  { id: 'comparing', label: 'Comparing with the reference' },
  { id: 'finalizing', label: 'Preparing the review workspace' },
]

export function getProcessingStages(hasReference: boolean) {
  return stages.filter((item) => hasReference || item.id !== 'comparing')
}

export function AnalysisProgress({
  title,
  fileName,
  pageCount,
  stage,
  startedAt,
  hasReference,
  connectionIssue,
  onRetry,
}: {
  title: string
  fileName?: string
  pageCount: number
  stage: ProcessingStage
  startedAt?: string
  hasReference: boolean
  connectionIssue?: boolean
  onRetry?: () => void
}) {
  const [now, setNow] = useState(Date.now())
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1_000)
    return () => window.clearInterval(timer)
  }, [])
  const visible = getProcessingStages(hasReference)
  const activeIndex = Math.max(0, visible.findIndex((item) => item.id === stage))
  const seconds = startedAt ? Math.max(0, Math.floor((now - new Date(startedAt).getTime()) / 1_000)) : 0

  return <section aria-labelledby="analysis-progress-title" aria-describedby="analysis-progress-status" className="mx-auto max-w-3xl overflow-hidden rounded-2xl border border-border bg-card">
    <div className="border-b border-border px-5 py-5 sm:px-7">
      <div className="flex items-start gap-4">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary"><FileSearch /></span>
        <div className="min-w-0"><p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">Analysis in progress</p><h1 id="analysis-progress-title" className="mt-1 truncate text-xl font-bold sm:text-2xl">{title}</h1><p className="mt-1 truncate text-sm text-muted-foreground">{fileName || `${pageCount} ${pageCount === 1 ? 'page' : 'pages'}`} · {seconds}s elapsed</p></div>
      </div>
    </div>
    <div className="px-5 py-6 sm:px-7">
      <div className="h-1.5 overflow-hidden rounded-full bg-muted" aria-hidden="true"><span className="block h-full w-2/5 animate-progress rounded-full bg-primary" /></div>
      <p id="analysis-progress-status" role="status" aria-live="polite" className="mt-4 font-semibold">{visible[activeIndex]?.label ?? 'Working on your analysis'}</p>
      <ol className="mt-5 grid gap-2 sm:grid-cols-2">
        {visible.map((item, index) => {
          const complete = index < activeIndex
          const active = index === activeIndex
          return <li key={item.id} className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm ${active ? 'bg-primary/10 text-foreground' : 'text-muted-foreground'}`} aria-current={active ? 'step' : undefined}>
            <span className={`grid h-6 w-6 shrink-0 place-items-center rounded-full border ${complete ? 'border-primary bg-primary text-primary-foreground' : active ? 'border-primary text-primary' : 'border-border'}`}>{complete ? <Check size={13} /> : active ? <LoaderCircle size={13} className="animate-spin" /> : index + 1}</span>{item.label}
          </li>
        })}
      </ol>
      {connectionIssue ? <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-warning/40 bg-warning/10 px-4 py-3 text-sm"><span>Status could not be refreshed. The analysis may still be running.</span>{onRetry && <button className="font-semibold text-primary hover:underline" onClick={onRetry}>Retry status</button>}</div> : null}
      <p className="mt-5 text-xs leading-5 text-muted-foreground">You can leave this page and return from Recents. Processing continues in your temporary session.</p>
    </div>
  </section>
}
