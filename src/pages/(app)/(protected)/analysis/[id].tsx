import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { AlertTriangle, ArrowLeft, Check, Download, FileJson, RefreshCw, Save, Trash2 } from 'lucide-react'
import { Eyebrow, PageShell, Panel } from '../../../../components/AppShell'
import { Badge, Button, ConfirmModal, Input, Textarea } from '../../../../components/ui'
import { analysisToMarkdown, downloadText, exportNames } from '../../../../domain/export'
import { getComparison, getImageFiles, getTranscription } from '../../../../domain/record'
import type { Comparison, SessionAnalysisRecord } from '../../../../domain/types'
import { sessionApi } from '../../../../lib/session'

function ScoreCard({ comparison }: { comparison: Comparison }) {
  if (!comparison.score) return <Panel className="border-warning/40 bg-warning/10"><h3 className="font-bold">Score unavailable</h3><p className="mt-2 text-sm text-muted-foreground">{comparison.limitation || 'The reference was not suitable for a meaningful comparison.'}</p></Panel>
  const score = comparison.score
  return <Panel className="overflow-hidden"><div className="flex items-end justify-between"><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">Reference match</p><p className="mt-2 text-5xl font-bold tabular-nums">{score.overall}<span className="text-lg font-normal text-muted-foreground">/100</span></p></div><Check className="mb-2 text-primary" /></div><div className="mt-6 grid grid-cols-3 gap-2 border-t border-border pt-5 text-xs text-muted-foreground"><span><b className="block text-lg text-foreground">{score.coverage}</b>Coverage</span><span><b className="block text-lg text-foreground">{score.agreement}</b>Agreement</span><span><b className="block text-lg text-foreground">{score.technical ?? 'N/A'}</b>Technical</span></div></Panel>
}

function Findings({ title, findings, tone }: { title: string; findings: Comparison['omissions']; tone: 'warn' | 'good' | 'neutral' }) {
  if (!findings.length) return null
  const styles = tone === 'warn' ? 'border-warning/35 bg-warning/10' : tone === 'good' ? 'border-success/30 bg-success/10' : 'border-border bg-card'
  return <section className={`rounded-xl border p-4 ${styles}`}><h3 className="font-bold">{title}</h3><div className="mt-3 space-y-4">{findings.map((finding, index) => <div key={`${finding.claim}-${index}`}><p className="text-sm font-semibold">{finding.claim}</p><p className="mt-1 text-sm text-muted-foreground">{finding.explanation}</p><blockquote className="mt-2 border-l-2 border-primary/35 pl-3 text-xs text-muted-foreground">Reference: {finding.referenceEvidence}{finding.notesEvidence ? <><br />Notes: {finding.notesEvidence}</> : null}</blockquote></div>)}</div></section>
}

export default function AnalysisDetailPage() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const [envelope, setEnvelope] = useState<SessionAnalysisRecord>()
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')
  const [queryError, setQueryError] = useState('')
  const record = envelope?.data
  const [title, setTitle] = useState('')
  const [editedText, setEditedText] = useState('')
  const [notice, setNotice] = useState('')
  const [actionError, setActionError] = useState('')
  const [busy, setBusy] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)

  useEffect(() => {
    let active = true
    setStatus('loading')
    sessionApi.get(id).then((value) => { if (active) { setEnvelope(value); setStatus('ready') } })
      .catch((cause) => { if (active) { setQueryError(cause instanceof Error ? cause.message : 'Analysis not found'); setStatus('error') } })
    return () => { active = false }
  }, [id])

  const parsed = useMemo(() => {
    if (!record) return null
    try { return { transcription: getTranscription(record), comparison: getComparison(record), images: getImageFiles(record) } }
    catch { return null }
  }, [record])
  useEffect(() => {
    if (record && parsed) { setTitle(record.title); setEditedText(record.correctedTranscription || parsed.transcription.fullText) }
  }, [record, parsed])

  if (status === 'loading') return <PageShell><Panel>Loading analysis…</Panel></PageShell>
  if (queryError || !record || !envelope) return <PageShell><Panel><h1 className="font-bold">Analysis not found</h1><p className="mt-2 text-muted-foreground">{queryError || 'It may have been deleted or you may not have access.'}</p><Link className="mt-4 inline-block font-semibold text-primary" to="/library">Back to library</Link></Panel></PageShell>
  if (!parsed) return <PageShell><Panel><h1 className="font-bold">This analysis could not be read</h1><p className="mt-2 text-muted-foreground">Its saved data does not match the current schema.</p></Panel></PageShell>
  const activeEnvelope = envelope
  const activeRecord = record
  const { transcription, comparison, images } = parsed
  const baseline = record.correctedTranscription || transcription.fullText
  const textChanged = editedText !== baseline

  async function save() {
    setBusy(true); setActionError(''); setNotice('')
    try {
      const updated = await sessionApi.update(activeEnvelope.recordId, { title: title.trim() || activeRecord.title, correctedTranscription: editedText, comparisonStale: comparison && textChanged ? 1 : activeRecord.comparisonStale, status: 'saved' })
      setEnvelope(updated)
      setNotice('Corrections saved.')
    } catch (cause) { setActionError(cause instanceof Error ? cause.message : 'Could not save changes') }
    finally { setBusy(false) }
  }

  async function rerun() {
    setBusy(true); setActionError(''); setNotice('')
    try {
      if (textChanged) await sessionApi.update(activeEnvelope.recordId, { correctedTranscription: editedText, comparisonStale: 1 })
      await sessionApi.rerun(activeEnvelope.recordId, crypto.randomUUID())
      setEnvelope(await sessionApi.get(activeEnvelope.recordId))
      setNotice('Comparison rerun against the corrected transcription.')
    } catch (cause) { setActionError(cause instanceof Error ? cause.message : 'Could not rerun comparison') }
    finally { setBusy(false) }
  }

  async function remove() {
    setBusy(true); setActionError('')
    try { await sessionApi.remove(activeEnvelope.recordId); navigate('/library') }
    catch (cause) { setActionError(cause instanceof Error ? cause.message : 'Could not delete analysis'); setBusy(false) }
  }

  function exportMarkdown() {
    downloadText(analysisToMarkdown(activeRecord, transcription, comparison), exportNames(activeRecord.title).markdown, 'text/markdown;charset=utf-8')
  }
  function exportJson() {
    const data = { schemaVersion: activeRecord.schemaVersion, title: activeRecord.title, subject: activeRecord.subject, topic: activeRecord.topic, transcription, correctedTranscription: activeRecord.correctedTranscription || null, reference: activeRecord.hasReference ? { text: activeRecord.referenceText, fileName: activeRecord.referenceFileName || null } : null, comparison, model: { provider: activeRecord.modelProvider, id: activeRecord.modelId, promptVersion: activeRecord.promptVersion } }
    downloadText(JSON.stringify(data, null, 2), exportNames(activeRecord.title).json, 'application/json;charset=utf-8')
  }

  if (record.status === 'processing') return <PageShell><Panel className="py-20 text-center"><RefreshCw className="mx-auto animate-spin text-primary" /><h1 className="mt-5 text-xl font-bold">Analysis in progress</h1><p className="mt-2 text-muted-foreground">Transcribing your handwriting and validating the result.</p></Panel></PageShell>
  if (record.status === 'failed') return <PageShell><Link to="/library" className="inline-flex items-center gap-2 text-sm text-muted-foreground"><ArrowLeft size={15} /> Library</Link><Panel className="mt-5 border-destructive/30"><AlertTriangle className="text-destructive" /><h1 className="mt-4 text-xl font-bold">Analysis failed</h1><p className="mt-2 text-muted-foreground">{record.errorSummary || 'The analysis could not be completed.'}</p><Link to="/new" className="mt-5 inline-block font-semibold text-primary">Start a new analysis</Link></Panel></PageShell>

  return <PageShell>
    <div className="flex flex-wrap items-start justify-between gap-4"><div><Link to="/library" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft size={15} /> Recents</Link><Eyebrow>Review workspace</Eyebrow><Input aria-label="Analysis title" value={title} onChange={(e) => setTitle(e.target.value)} className="h-auto border-0 bg-transparent p-0 text-3xl font-bold shadow-none focus-visible:ring-0 sm:text-4xl" /><p className="mt-2 text-sm text-muted-foreground">{[record.subject, record.topic].filter(Boolean).join(' · ') || 'Uncategorized'} · {images.length} {images.length === 1 ? 'page' : 'pages'}</p></div><div className="flex flex-wrap gap-2"><Button variant="outline" onClick={exportMarkdown}><Download /> Markdown</Button><Button variant="outline" onClick={exportJson}><FileJson /> JSON</Button><Button onClick={() => void save()} loading={busy}><Save /> Save</Button></div></div>
    {(record.comparisonStale || (comparison && textChanged)) ? <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-warning/35 bg-warning/10 px-4 py-3 text-sm"><span className="flex items-center gap-2"><AlertTriangle size={16} className="text-warning" /> This score may be stale because the transcription changed.</span>{record.hasReference ? <Button size="sm" onClick={() => void rerun()} disabled={busy}><RefreshCw /> Rerun comparison</Button> : null}</div> : null}
    {notice && <div role="status" className="mt-5 rounded-xl border border-success/30 bg-success/10 px-4 py-3 text-sm">{notice}</div>}{actionError && <div role="alert" className="mt-5 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">{actionError}</div>}

    <div className="mt-8 grid gap-7 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,.65fr)]">
      <div className="min-w-0"><div className="flex items-center justify-between border-b border-border pb-3"><h2 className="text-sm font-bold uppercase tracking-[0.16em] text-muted-foreground">Transcription</h2>{textChanged && <Badge variant="warning">Unsaved edits</Badge>}</div><Panel className="mt-4"><p className="mb-4 text-xs text-muted-foreground">Edit anything the model misread. The original AI output remains preserved in the record.</p><Textarea value={editedText} onChange={(e) => setEditedText(e.target.value)} className="min-h-[560px] resize-y border-0 bg-transparent p-0 font-serif text-base leading-8 focus-visible:ring-0" /></Panel>
        {transcription.equations.length > 0 && <Panel className="mt-4"><h3 className="font-bold">Equations</h3><div className="mt-3 space-y-3">{transcription.equations.map((equation, index) => <div key={`${equation.raw}-${index}`} className="rounded-lg bg-background p-3"><p className="font-mono">{equation.latex}</p><p className="mt-1 text-xs text-muted-foreground">Raw: {equation.raw}{equation.uncertain ? ' · uncertain' : ''}</p></div>)}</div></Panel>}
        {transcription.uncertainties.length > 0 && <Panel className="mt-4 border-warning/35"><h3 className="font-bold">Uncertain passages</h3><div className="mt-3 space-y-3">{transcription.uncertainties.map((item, index) => <div key={`${item.text}-${index}`} className="border-l-2 border-warning pl-3"><p className="font-semibold">{item.text}</p><p className="text-sm text-muted-foreground">{item.reason}</p>{item.alternatives.length > 0 && <p className="mt-1 text-xs text-muted-foreground">Possible readings: {item.alternatives.join(', ')}</p>}</div>)}</div></Panel>}
        <section className="mt-7" aria-labelledby="source-pages"><h2 id="source-pages" className="border-b border-border pb-3 text-sm font-bold uppercase tracking-[0.16em] text-muted-foreground">Source pages</h2><div className="mt-4 grid gap-4 sm:grid-cols-2">{images.map((image, index) => <Panel key={image.key} className="p-2"><img src={sessionApi.imageUrl(envelope.recordId, index)} alt={`Handwritten note page ${index + 1}: ${image.name}`} className="aspect-[4/3] w-full rounded-lg bg-muted object-contain" /><p className="px-2 pb-1 pt-3 text-xs text-muted-foreground">Page {index + 1} · {image.name}</p></Panel>)}</div></section>
      </div>
      <aside className="space-y-4"><h2 className="border-b border-border pb-3 text-sm font-bold uppercase tracking-[0.16em] text-muted-foreground">Evaluation</h2>{comparison ? <><ScoreCard comparison={comparison} /><section className="border-b border-border px-1 pb-5"><h3 className="font-bold">What the score means</h3><p className="mt-2 text-sm leading-6 text-muted-foreground">{comparison.explanation}</p><p className="mt-3 text-xs text-muted-foreground">This measures correspondence with the supplied reference—not your ability, a grade, or independent proof that the reference is correct.</p></section><Findings title="Important omissions" findings={comparison.omissions} tone="warn" /><Findings title="Discrepancies" findings={comparison.discrepancies} tone="warn" /><Findings title="Unsupported additions" findings={comparison.unsupportedAdditions} tone="warn" /><Findings title="Correctly represented" findings={comparison.correctConcepts} tone="good" /><Findings title="Needs human review" findings={comparison.uncertainComparisons} tone="neutral" />{comparison.suggestedCorrections.length > 0 && <Panel><h3 className="font-bold">Suggested review</h3><ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-muted-foreground">{comparison.suggestedCorrections.map((item) => <li key={item}>{item}</li>)}</ul></Panel>}</> : <Panel><h3 className="font-bold">No reference supplied</h3><p className="mt-2 text-sm leading-6 text-muted-foreground">The notes were transcribed and organized, but no reference-based score was produced.</p></Panel>}</aside>
    </div>
    <div className="mt-10 border-t border-border pt-6"><Button variant="destructive" onClick={() => setDeleteOpen(true)} disabled={busy}><Trash2 /> Delete analysis and files</Button></div>
    <ConfirmModal open={deleteOpen} onClose={() => setDeleteOpen(false)} onConfirm={() => void remove()} title="Delete this analysis?" description="This permanently deletes the analysis and all source images. This action cannot be undone." confirmText="Delete analysis" loading={busy} />
  </PageShell>
}
