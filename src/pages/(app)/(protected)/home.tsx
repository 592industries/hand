import { Link } from 'react-router-dom'
import { useAuthProfileReady, useQuery } from 'deepspace'
import { ArrowRight, BookOpen, FileCheck2, Plus, Sparkles } from 'lucide-react'
import { AnalysisRow } from '../../../components/AnalysisRow'
import { Eyebrow, PageShell, Panel } from '../../../components/AppShell'
import type { AnalysisRecord } from '../../../domain/types'

export default function HomePage() {
  const { user } = useAuthProfileReady({ requireUser: true })
  const { records, status } = useQuery<AnalysisRecord>('analyses', { orderBy: 'updatedAt', orderDir: 'desc', limit: 5 })
  const completed = records.filter((r) => r.data.status === 'saved' || r.data.status === 'needs_review').length
  const withReference = records.filter((r) => r.data.hasReference).length
  return <PageShell>
    <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><Eyebrow>Study workspace</Eyebrow><h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Welcome back{user?.name ? `, ${user.name.split(' ')[0]}` : ''}.</h1><p className="mt-2 text-muted-foreground">Make the thinking in your notes searchable, editable, and easier to trust.</p></div><Link to="/new" className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-primary px-5 font-semibold text-primary-foreground"><Plus size={17} /> New analysis</Link></div>
    <div className="mt-8 grid gap-4 sm:grid-cols-3"><Panel><BookOpen className="text-primary" /><p className="mt-5 text-3xl font-bold">{records.length}</p><p className="text-sm text-muted-foreground">Recent analyses</p></Panel><Panel><FileCheck2 className="text-primary" /><p className="mt-5 text-3xl font-bold">{completed}</p><p className="text-sm text-muted-foreground">Ready to review</p></Panel><Panel><Sparkles className="text-primary" /><p className="mt-5 text-3xl font-bold">{withReference}</p><p className="text-sm text-muted-foreground">With comparisons</p></Panel></div>
    <div className="mt-10 flex items-center justify-between"><div><h2 className="text-xl font-bold">Recent work</h2><p className="text-sm text-muted-foreground">Your latest note analyses</p></div><Link to="/library" className="flex items-center gap-1 text-sm font-semibold text-primary">View library <ArrowRight size={15} /></Link></div>
    <div className="mt-4 space-y-3">{status === 'loading' ? <Panel><p className="text-muted-foreground">Loading your analyses…</p></Panel> : records.length ? records.map((record) => <AnalysisRow key={record.recordId} record={record} />) : <Panel className="py-12 text-center"><p className="font-semibold">No analyses yet</p><p className="mt-1 text-sm text-muted-foreground">Upload your first handwritten page to begin.</p><Link to="/new" className="mt-5 inline-flex items-center gap-2 font-semibold text-primary">Start now <ArrowRight size={15} /></Link></Panel>}</div>
  </PageShell>
}
