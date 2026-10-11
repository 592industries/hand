import { Link } from 'react-router-dom'
import { ArrowRight, BookOpen, FileCheck2, Plus, Sparkles } from 'lucide-react'
import { AnalysisRow } from '../../../components/AnalysisRow'
import { PageHeader, PageShell } from '../../../components/AppShell'
import { useSessionAnalyses } from '../../../hooks/useSessionAnalyses'

const metrics = [
  { label: 'Recent analyses', icon: BookOpen },
  { label: 'Ready to review', icon: FileCheck2 },
  { label: 'With comparisons', icon: Sparkles },
]

export default function HomePage() {
  const { records, status, error } = useSessionAnalyses(5)
  const values = [
    records.length,
    records.filter((record) => record.data.status === 'saved' || record.data.status === 'needs_review').length,
    records.filter((record) => record.data.hasReference).length,
  ]

  return <PageShell>
    <PageHeader
      eyebrow="Session workspace"
      title="Your notes, ready to review"
      description="Upload handwritten pages, create a clean transcript, and compare the result with source material—all within this temporary session."
      action={<Link to="/new" className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-lg bg-primary px-5 font-semibold text-primary-foreground transition-colors hover:bg-primary/90"><Plus size={17} /> New analysis</Link>}
    />
    <section aria-labelledby="workspace-overview" className="mt-8 overflow-hidden rounded-xl border border-border bg-card">
      <h2 id="workspace-overview" className="sr-only">Workspace overview</h2>
      <div className="grid sm:grid-cols-3">{metrics.map(({ label, icon: Icon }, index) => <div key={label} className="flex items-center gap-4 border-b border-border px-5 py-5 last:border-b-0 sm:border-b-0 sm:border-r sm:last:border-r-0"><Icon size={18} className="text-primary" /><div><p className="text-2xl font-bold tabular-nums">{values[index]}</p><p className="text-xs text-muted-foreground">{label}</p></div></div>)}</div>
    </section>
    <section className="mt-10" aria-labelledby="recent-work">
      <div className="flex items-end justify-between gap-4 border-b border-border pb-4"><div><h2 id="recent-work" className="text-xl font-bold">Recent work</h2><p className="mt-1 text-sm text-muted-foreground">Your latest session analyses</p></div><Link to="/library" className="flex items-center gap-1 text-sm font-semibold text-primary hover:underline">View library <ArrowRight size={15} /></Link></div>
      <div className="mt-3 divide-y divide-border overflow-hidden rounded-xl border border-border bg-card">{status === 'loading' ? <div aria-label="Loading recent analyses" className="space-y-px">{[0, 1, 2].map((item) => <div key={item} className="flex h-20 items-center gap-4 px-5"><span className="h-10 w-10 animate-pulse rounded-lg bg-muted" /><span className="h-4 flex-1 animate-pulse rounded bg-muted" /></div>)}</div> : status === 'error' ? <p role="alert" className="px-5 py-8 text-sm text-destructive">{error}</p> : records.length ? records.map((record) => <AnalysisRow key={record.recordId} record={record} />) : <div className="px-5 py-10 text-center"><p className="font-semibold">No analyses yet</p><p className="mt-1 text-sm text-muted-foreground">Upload your first handwritten page to begin.</p><Link to="/new" className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline">Start an analysis <ArrowRight size={15} /></Link></div>}</div>
    </section>
  </PageShell>
}
