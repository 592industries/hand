import { useMemo, useState } from 'react'
import { useQuery } from 'deepspace'
import { Search, SlidersHorizontal } from 'lucide-react'
import { AnalysisRow } from '../../../components/AnalysisRow'
import { Eyebrow, PageShell, Panel } from '../../../components/AppShell'
import { Input, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui'
import type { AnalysisRecord } from '../../../domain/types'

export default function LibraryPage() {
  const { records, status, error } = useQuery<AnalysisRecord>('analyses', { orderBy: 'updatedAt', orderDir: 'desc', limit: 500 })
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

  return <PageShell>
    <Eyebrow>Saved work</Eyebrow><h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Analysis library</h1><p className="mt-2 text-muted-foreground">Search, filter, and reopen your handwritten notes.</p>
    <Panel className="mt-8"><div className="grid gap-3 lg:grid-cols-[1fr_180px_180px_190px]"><div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} /><Input className="pl-9" aria-label="Search analyses" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search title or transcription…" /></div>
      <Select value={subject} onValueChange={(value) => value && setSubject(value)}><SelectTrigger><SelectValue placeholder="All subjects" /></SelectTrigger><SelectContent><SelectItem value="all">All subjects</SelectItem>{subjects.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent></Select>
      <Select value={state} onValueChange={(value) => value && setState(value)}><SelectTrigger><SelectValue placeholder="All statuses" /></SelectTrigger><SelectContent><SelectItem value="all">All statuses</SelectItem><SelectItem value="needs_review">Needs review</SelectItem><SelectItem value="saved">Saved</SelectItem><SelectItem value="failed">Failed</SelectItem></SelectContent></Select>
      <Select value={sort} onValueChange={(value) => value && setSort(value)}><SelectTrigger><SlidersHorizontal size={15} /><SelectValue /></SelectTrigger><SelectContent><SelectItem value="updated-desc">Recently updated</SelectItem><SelectItem value="created-desc">Newest created</SelectItem><SelectItem value="created-asc">Oldest created</SelectItem></SelectContent></Select>
    </div></Panel>
    <div className="mt-5 flex items-center justify-between text-sm text-muted-foreground"><span>{filtered.length} {filtered.length === 1 ? 'analysis' : 'analyses'}</span>{search && <button className="font-semibold text-primary" onClick={() => setSearch('')}>Clear search</button>}</div>
    <div className="mt-3 space-y-3">{status === 'loading' ? <Panel>Loading your library…</Panel> : error ? <Panel><p className="text-destructive">{error}</p></Panel> : filtered.length ? filtered.map((record) => <AnalysisRow key={record.recordId} record={record} />) : <Panel className="py-14 text-center"><p className="font-semibold">No matching analyses</p><p className="mt-1 text-sm text-muted-foreground">Try a different search or filter.</p></Panel>}</div>
    {records.length >= 500 && <p className="mt-4 text-center text-xs text-muted-foreground">Showing the 500 most recently updated analyses.</p>}
  </PageShell>
}
