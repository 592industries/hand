import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Search, SlidersHorizontal } from 'lucide-react'
import { AnalysisRow } from '../../../components/AnalysisRow'
import { PageHeader, PageShell, Panel } from '../../../components/AppShell'
import { Button, Input, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui'
import { useSessionAnalyses } from '../../../hooks/useSessionAnalyses'

export default function LibraryPage() {
  const { records, status, error } = useSessionAnalyses()
  const [search, setSearch] = useState('')
  const [subject, setSubject] = useState('all')
  const [state, setState] = useState('all')
  const [sort, setSort] = useState('updated-desc')
  const subjects = useMemo(() => [...new Set(records.map((r) => r.data.subject).filter(Boolean))].sort(), [records])
  const filtered = useMemo(() => {
    const needle = search.trim().toLowerCase()
    const result = records.filter((record) => {
      const haystack = `${record.data.title} ${record.data.subject} ${record.data.topic} ${record.data.correctedTranscription} ${record.data.originalTranscriptionJson}`.toLowerCase()
      return (!needle || haystack.includes(needle)) && (subject === 'all' || record.data.subject === subject) && (state === 'all' || record.data.status === state)
    })
    return [...result].sort((a, b) => {
      const field = sort.startsWith('created') ? 'createdAt' : 'updatedAt'
      const direction = sort.endsWith('asc') ? 1 : -1
      return a[field].localeCompare(b[field]) * direction
    })
  }, [records, search, subject, state, sort])
  const filteredActive = Boolean(search.trim() || subject !== 'all' || state !== 'all')
  const clearFilters = () => { setSearch(''); setSubject('all'); setState('all') }

  return <PageShell>
    <PageHeader eyebrow="Current session" title="Analysis library" description="Search, filter, export, and reopen work before this temporary session expires." action={<Link to="/new" className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-lg bg-primary px-5 font-semibold text-primary-foreground hover:bg-primary/90"><Plus size={17} /> New analysis</Link>} />
    <Panel className="mt-8"><div className="grid gap-3 lg:grid-cols-[1fr_180px_180px_190px]"><div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} /><Input className="pl-9" aria-label="Search analyses" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search title or transcription…" /></div>
      <Select value={subject} onValueChange={(value) => value && setSubject(value)}><SelectTrigger aria-label="Filter by subject"><SelectValue placeholder="All subjects" /></SelectTrigger><SelectContent><SelectItem value="all">All subjects</SelectItem>{subjects.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent></Select>
      <Select value={state} onValueChange={(value) => value && setState(value)}><SelectTrigger aria-label="Filter by status"><SelectValue placeholder="All statuses" /></SelectTrigger><SelectContent><SelectItem value="all">All statuses</SelectItem><SelectItem value="needs_review">Needs review</SelectItem><SelectItem value="saved">Saved</SelectItem><SelectItem value="failed">Failed</SelectItem></SelectContent></Select>
      <Select value={sort} onValueChange={(value) => value && setSort(value)}><SelectTrigger aria-label="Sort analyses"><SlidersHorizontal size={15} /><SelectValue /></SelectTrigger><SelectContent><SelectItem value="updated-desc">Recently updated</SelectItem><SelectItem value="created-desc">Newest created</SelectItem><SelectItem value="created-asc">Oldest created</SelectItem></SelectContent></Select>
    </div></Panel>
    <div className="mt-5 flex items-center justify-between text-sm text-muted-foreground"><span>{filtered.length} {filtered.length === 1 ? 'analysis' : 'analyses'}</span>{filteredActive && <button className="font-semibold text-primary hover:underline" onClick={clearFilters}>Clear filters</button>}</div>
    <div className="mt-3 divide-y divide-border overflow-hidden rounded-xl border border-border bg-card">{status === 'loading' ? <p className="px-5 py-8 text-sm text-muted-foreground">Loading your library…</p> : error ? <div className="px-5 py-8"><p role="alert" className="text-sm text-destructive">{error}</p></div> : filtered.length ? filtered.map((record) => <AnalysisRow key={record.recordId} record={record} />) : records.length ? <div className="px-5 py-12 text-center"><p className="font-semibold">No matching analyses</p><p className="mt-1 text-sm text-muted-foreground">Try a different search or filter.</p><Button variant="outline" className="mt-4" onClick={clearFilters}>Clear filters</Button></div> : <div className="px-5 py-12 text-center"><p className="font-semibold">Your library is empty</p><p className="mt-1 text-sm text-muted-foreground">Completed analyses appear here for this session.</p><Link to="/new" className="mt-4 inline-flex font-semibold text-primary hover:underline">Start your first analysis</Link></div>}</div>
  </PageShell>
}
