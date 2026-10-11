import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { AlertTriangle, ArrowLeft, CheckCircle2, Download, FileJson, Pencil, RefreshCw, Save, Trash2 } from 'lucide-react'
import { AnalysisProgress } from '../../../../components/AnalysisProgress'
import { PageShell, Panel } from '../../../../components/AppShell'
import { FindingGroup } from '../../../../components/FindingGroup'
import { TranscriptionDocument } from '../../../../components/TranscriptionDocument'
import { Badge, Button, ConfirmModal, Input, Textarea } from '../../../../components/ui'
import { analysisToMarkdown, downloadText, exportNames } from '../../../../domain/export'
import { getComparison, getImageFiles, getTranscription } from '../../../../domain/record'
import type { Comparison, SessionAnalysisRecord } from '../../../../domain/types'
import { sessionApi } from '../../../../lib/session'

function Metric({ label, value, detail }: { label: string; value: number; detail: string }) {
  return <div className="min-w-0 rounded-lg bg-background px-3 py-3"><p className="text-2xl font-bold tabular-nums">{value}<span className="text-xs font-normal text-muted-foreground">/100</span></p><p className="mt-0.5 text-xs font-semibold">{label}</p><p className="mt-1 text-[11px] leading-4 text-muted-foreground">{detail}</p></div>
}

function EvaluationSummary({ comparison }: { comparison: Comparison | null }) {
  if (!comparison) return <Panel><h2 className="font-bold">No reference comparison</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">The notes were transcribed without a reference score.</p></Panel>
  if (!comparison.score) return <Panel className="border-warning/40 bg-warning/10"><h2 className="font-bold">Score unavailable</h2><p className="mt-2 text-sm text-muted-foreground">{comparison.limitation || 'The reference could not support a meaningful comparison.'}</p></Panel>
  const score = comparison.score
  return <Panel>
    <div className="flex items-end justify-between gap-4 border-b border-border pb-4"><div><p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Reference match</p><p className="mt-1 text-4xl font-bold tabular-nums">{score.overall}<span className="text-base font-normal text-muted-foreground">/100</span></p></div><CheckCircle2 className="text-primary" /></div>
    <div className={`mt-4 grid gap-2 ${score.technical === null ? 'grid-cols-2' : 'grid-cols-3'}`}><Metric label="Coverage" value={score.coverage} detail="Reference points included" /><Metric label="Agreement" value={score.agreement} detail="Meaning aligned" />{score.technical !== null && <Metric label="Technical" value={score.technical} detail="Notation and precision" />}</div>
    <p className="mt-4 text-xs leading-5 text-muted-foreground">Model-generated comparison with your reference. It is not an independently verified grade or accuracy score.</p>
  </Panel>
}

export default function AnalysisDetailPage() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const [envelope, setEnvelope] = useState<SessionAnalysisRecord>()
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')
  const [queryError, setQueryError] = useState('')
  const [pollError, setPollError] = useState(false)
  const [title, setTitle] = useState('')
  const [editedText, setEditedText] = useState('')
  const [editing, setEditing] = useState(false)
  const [notice, setNotice] = useState('')
  const [actionError, setActionError] = useState('')
  const [busy, setBusy] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const loadController = useRef<AbortController | null>(null)
  const record = envelope?.data

  async function load(showError = true) {
    loadController.current?.abort()
    const controller = new AbortController()
    loadController.current = controller
    try { setEnvelope(await sessionApi.get(id, controller.signal)); setStatus('ready'); setPollError(false) }
    catch (cause) {
      if (controller.signal.aborted) return
      if (showError) { setQueryError(cause instanceof Error ? cause.message : 'Analysis not found'); setStatus('error') }
      else setPollError(true)
    }
  }

  useEffect(() => () => loadController.current?.abort(), [])
  useEffect(() => { setStatus('loading'); void load() }, [id])
  useEffect(() => {
    if (record?.status !== 'processing') return
    const timer = window.setInterval(() => void load(false), 3_500)
    return () => window.clearInterval(timer)
  }, [id, record?.status])

  const parsed = useMemo(() => {
    if (!record) return null
    try { return { transcription: getTranscription(record), comparison: getComparison(record), images: getImageFiles(record) } }
    catch { return null }
  }, [record])
  useEffect(() => {
    if (record && parsed && record.status !== 'processing') { setTitle(record.title); setEditedText(record.correctedTranscription || parsed.transcription.fullText) }
  }, [record, parsed])

  const baseline = record && parsed ? record.correctedTranscription || parsed.transcription.fullText : ''
  const changed = Boolean(record && (editedText !== baseline || title.trim() !== record.title))
  useEffect(() => {
    const warn = (event: BeforeUnloadEvent) => { if (changed) event.preventDefault() }
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [changed])

  if (status === 'loading') return <PageShell><div className="mx-auto max-w-5xl space-y-4" aria-label="Loading analysis"><div className="h-20 animate-pulse rounded-xl bg-muted" /><div className="h-96 animate-pulse rounded-xl bg-muted" /></div></PageShell>
  if (queryError || !record || !envelope) return <PageShell><Panel><h1 className="font-bold">Analysis not found</h1><p className="mt-2 text-muted-foreground">{queryError || 'It may have been deleted or is no longer available.'}</p><Link className="mt-4 inline-block font-semibold text-primary" to="/library">Back to library</Link></Panel></PageShell>
  if (!parsed) return <PageShell><Panel><h1 className="font-bold">This analysis could not be read</h1><p className="mt-2 text-muted-foreground">Its saved data does not match the current format.</p></Panel></PageShell>
  const { transcription, comparison, images } = parsed

  if (record.status === 'processing') return <PageShell><AnalysisProgress title={record.title} fileName={images[0]?.name} pageCount={images.length} stage={record.processingStage || 'transcribing'} startedAt={record.processingStartedAt} hasReference={Boolean(record.hasReference)} connectionIssue={pollError} onRetry={() => void load(false)} /></PageShell>
  if (record.status === 'failed') return <PageShell><Link to="/library" className="inline-flex items-center gap-2 text-sm text-muted-foreground"><ArrowLeft size={15} /> Recents</Link><Panel className="mt-5 border-destructive/30"><AlertTriangle className="text-destructive" /><h1 className="mt-4 text-xl font-bold">Analysis failed</h1><p className="mt-2 text-muted-foreground">{record.errorSummary || 'The analysis could not be completed.'}</p><div className="mt-5 flex gap-3"><Link to="/new" className="font-semibold text-primary">Try a new analysis</Link><button className="font-semibold text-muted-foreground hover:text-foreground" onClick={() => void load(false)}>Refresh</button></div></Panel></PageShell>
  const activeEnvelope = envelope
  const activeRecord = record

  async function save() {
    setBusy(true); setActionError(''); setNotice('')
    try {
      const updated = await sessionApi.update(activeEnvelope.recordId, { title: title.trim() || activeRecord.title, correctedTranscription: editedText, comparisonStale: comparison && editedText !== baseline ? 1 : activeRecord.comparisonStale, status: 'saved' })
      setEnvelope(updated); setEditing(false); setNotice('Changes saved.')
    } catch (cause) { setActionError(cause instanceof Error ? cause.message : 'Could not save changes') }
    finally { setBusy(false) }
  }

  async function rerun() {
    setBusy(true); setActionError(''); setNotice('')
    try {
      if (changed) await sessionApi.update(activeEnvelope.recordId, { title: title.trim() || activeRecord.title, correctedTranscription: editedText, comparisonStale: 1 })
      await sessionApi.rerun(activeEnvelope.recordId, crypto.randomUUID()); await load(false); setNotice('Comparison updated from the saved transcription.')
    } catch (cause) { setActionError(cause instanceof Error ? cause.message : 'Could not update the comparison') }
    finally { setBusy(false) }
  }

  async function remove() {
    setBusy(true)
    try { await sessionApi.remove(activeEnvelope.recordId); navigate('/library') }
    catch (cause) { setActionError(cause instanceof Error ? cause.message : 'Could not delete analysis'); setBusy(false) }
  }

  const exportMarkdown = () => downloadText(analysisToMarkdown(record, transcription, comparison), exportNames(record.title).markdown, 'text/markdown;charset=utf-8')
  const exportJson = () => downloadText(JSON.stringify({ schemaVersion: record.schemaVersion, title: record.title, subject: record.subject, topic: record.topic, transcription, correctedTranscription: record.correctedTranscription || null, reference: record.hasReference ? { text: record.referenceText, fileName: record.referenceFileName || null } : null, comparison, model: { provider: record.modelProvider, id: record.modelId, promptVersion: record.promptVersion } }, null, 2), exportNames(record.title).json, 'application/json;charset=utf-8')
  const reviewFindings = comparison ? [...comparison.omissions, ...comparison.uncertainComparisons] : []

  return <PageShell width="max-w-[1480px]">
    <header className="border-b border-border pb-5">
      <Link to="/library" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft size={15} /> Recents</Link>
      <div className="mt-4 flex flex-col justify-between gap-4 lg:flex-row lg:items-end"><div className="min-w-0">{editing ? <Input aria-label="Analysis title" value={title} onChange={(event) => setTitle(event.target.value)} className="max-w-2xl text-xl font-bold" /> : <h1 className="truncate text-2xl font-bold tracking-tight sm:text-3xl">{record.title}</h1>}<p className="mt-2 text-sm text-muted-foreground">{[record.subject, record.topic].filter(Boolean).join(' · ') || 'Uncategorized'} · {images.length} {images.length === 1 ? 'page' : 'pages'} · {record.status === 'saved' ? 'Saved' : 'Ready to review'}{comparison?.score ? ` · ${comparison.score.overall}/100 match` : ''}</p></div>
        <div className="flex flex-wrap gap-2"><Button variant="outline" onClick={() => setEditing((value) => !value)}><Pencil /> {editing ? 'Close editor' : 'Edit'}</Button><Button onClick={() => void save()} loading={busy} disabled={!changed}><Save /> Save</Button><Button variant="outline" onClick={exportMarkdown} disabled={changed}><Download /> Markdown</Button><Button variant="outline" onClick={exportJson} disabled={changed}><FileJson /> JSON</Button></div></div>
    </header>
    {(record.comparisonStale || (comparison && editedText !== baseline)) && <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-warning/35 bg-warning/10 px-4 py-3 text-sm"><span className="flex items-center gap-2"><AlertTriangle size={16} className="text-warning" /> The comparison does not include the latest transcription edits.</span>{record.hasReference ? <Button size="sm" onClick={() => void rerun()} loading={busy}><RefreshCw /> Update comparison</Button> : null}</div>}
    {notice && <p role="status" className="mt-5 rounded-lg border border-success/30 bg-success/10 px-4 py-3 text-sm">{notice}</p>}{actionError && <p role="alert" className="mt-5 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">{actionError}</p>}

    <div className="mt-6 grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
      <main className="min-w-0">
        <section aria-labelledby="transcription-heading" className="overflow-hidden rounded-xl border border-border bg-card"><div className="flex items-center justify-between border-b border-border px-5 py-3"><h2 id="transcription-heading" className="text-sm font-bold uppercase tracking-[0.14em] text-muted-foreground">Transcription</h2>{changed && <Badge variant="warning">Unsaved changes</Badge>}</div>
          {editing ? <div className="p-4 sm:p-6"><Textarea aria-label="Edit transcription" value={editedText} onChange={(event) => setEditedText(event.target.value)} className="min-h-[620px] resize-y border-0 bg-transparent p-0 font-sans text-base leading-8 focus-visible:ring-0" /><p className="mt-4 text-xs text-muted-foreground">The original AI transcription remains available below and is not overwritten.</p></div> : <article className="min-h-[460px] px-5 py-6 sm:px-8"><TranscriptionDocument text={record.correctedTranscription || transcription.fullText} /></article>}
        </section>
        {transcription.uncertainties.length > 0 && <details className="mt-4 rounded-xl border border-warning/35 bg-warning/10"><summary className="cursor-pointer px-5 py-4 font-semibold">Needs review · {transcription.uncertainties.length} uncertain {transcription.uncertainties.length === 1 ? 'passage' : 'passages'}</summary><div className="grid gap-3 px-5 pb-5 sm:grid-cols-2">{transcription.uncertainties.map((item, index) => <article key={`${item.text}-${index}`} className="rounded-lg bg-card p-3"><p className="font-semibold">{item.text}</p><p className="mt-1 text-sm text-muted-foreground">{item.reason}</p>{item.alternatives.length > 0 && <p className="mt-2 text-xs text-muted-foreground">Possible: {item.alternatives.join(', ')}</p>}</article>)}</div></details>}
        {transcription.equations.length > 0 && <details className="mt-4 rounded-xl border border-border bg-card"><summary className="cursor-pointer px-5 py-4 font-semibold">Equations · {transcription.equations.length}</summary><div className="grid gap-3 px-5 pb-5 sm:grid-cols-2">{transcription.equations.map((equation, index) => <div key={`${equation.raw}-${index}`} className="rounded-lg bg-background p-3"><p className="break-words font-mono">{equation.latex}</p><p className="mt-1 text-xs text-muted-foreground">Source: {equation.raw}{equation.uncertain ? ' · uncertain' : ''}</p></div>)}</div></details>}
        <details className="mt-4 rounded-xl border border-border bg-card"><summary className="cursor-pointer px-5 py-4 font-semibold">Original AI transcription</summary><div className="max-h-96 overflow-auto border-t border-border px-5 py-4"><TranscriptionDocument text={transcription.fullText} className="text-sm leading-7 sm:text-sm sm:leading-7" /></div></details>
        <details className="mt-4 rounded-xl border border-border bg-card"><summary className="cursor-pointer px-5 py-4 font-semibold">Source pages · {images.length}</summary><div className="grid gap-4 border-t border-border p-4 sm:grid-cols-2">{images.map((image, index) => <figure key={image.key} className="rounded-lg border border-border bg-background p-2"><img src={sessionApi.imageUrl(envelope.recordId, index)} alt={`Handwritten note page ${index + 1}: ${image.name}`} className="aspect-[4/3] w-full rounded-md bg-muted object-contain" /><figcaption className="px-2 pb-1 pt-3 text-xs text-muted-foreground">Page {index + 1} · {image.name}</figcaption></figure>)}</div></details>
      </main>
      <aside className="space-y-4 xl:sticky xl:top-20"><EvaluationSummary comparison={comparison} />{comparison && <section aria-labelledby="findings-heading" className="overflow-hidden rounded-xl border border-border bg-card"><div className="border-b border-border px-4 py-3"><h2 id="findings-heading" className="font-bold">Findings</h2><p className="mt-1 text-xs text-muted-foreground">Open a section to review its evidence.</p></div><FindingGroup title="Needs review" findings={reviewFindings} critical onEdit={() => setEditing(true)} /><FindingGroup title="Discrepancies" findings={comparison.discrepancies} critical onEdit={() => setEditing(true)} /><FindingGroup title="Unsupported additions" findings={comparison.unsupportedAdditions} critical onEdit={() => setEditing(true)} /><FindingGroup title="Correctly represented" findings={comparison.correctConcepts} onEdit={() => setEditing(true)} /></section>}</aside>
    </div>
    <div className="mt-8 border-t border-border pt-5"><Button variant="destructive" onClick={() => setDeleteOpen(true)} disabled={busy}><Trash2 /> Delete analysis and files</Button></div>
    <ConfirmModal open={deleteOpen} onClose={() => setDeleteOpen(false)} onConfirm={() => void remove()} title="Delete this analysis?" description="This permanently deletes the analysis and all source images from this session." confirmText="Delete analysis" loading={busy} />
  </PageShell>
}
