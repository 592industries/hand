import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useMutations, useQuery, useR2Files } from 'deepspace'
import { AlertTriangle, ArrowLeft, Check, Download, FileJson, RefreshCw, Save, Trash2 } from 'lucide-react'
import { Eyebrow, PageShell, Panel } from '../../../../components/AppShell'
import { Badge, Button, Input, Textarea } from '../../../../components/ui'
import { analysisToMarkdown, downloadText, exportNames } from '../../../../domain/export'
import { getComparison, getImageFiles, getTranscription } from '../../../../domain/record'
import type { AnalysisRecord, Comparison, Transcription } from '../../../../domain/types'
import { callAction } from '../../../../lib/actions'

function ScoreCard({ comparison }: { comparison: Comparison }) {
  if (!comparison.score) return <Panel className="border-amber-300 bg-amber-50"><h3 className="font-bold text-amber-900">Score unavailable</h3><p className="mt-2 text-sm text-amber-900/75">{comparison.limitation || 'The reference was not suitable for a meaningful comparison.'}</p></Panel>
  const score = comparison.score
  return <Panel className="overflow-hidden bg-primary text-primary-foreground"><div className="flex items-end justify-between"><div><p className="text-xs font-semibold uppercase tracking-widest text-primary-foreground/70">Reference match</p><p className="mt-2 text-6xl font-bold">{score.overall}<span className="text-xl font-normal text-primary-foreground/60">/100</span></p></div><Check className="mb-2" /></div><div className="mt-6 grid grid-cols-3 gap-2 border-t border-white/20 pt-5 text-xs"><span><b className="block text-lg">{score.coverage}</b>Coverage</span><span><b className="block text-lg">{score.agreement}</b>Agreement</span><span><b className="block text-lg">{score.technical ?? 'N/A'}</b>Technical</span></div></Panel>
}

function Findings({ title, findings, tone }: { title: string; findings: Comparison['omissions']; tone: 'warn' | 'good' | 'neutral' }) {
  if (!findings.length) return null
  const styles = tone === 'warn' ? 'border-amber-300 bg-amber-50' : tone === 'good' ? 'border-emerald-200 bg-emerald-50' : 'border-border bg-card'
  return <section className={`rounded-xl border p-4 ${styles}`}><h3 className="font-bold">{title}</h3><div className="mt-3 space-y-4">{findings.map((finding, index) => <div key={`${finding.claim}-${index}`}><p className="text-sm font-semibold">{finding.claim}</p><p className="mt-1 text-sm text-muted-foreground">{finding.explanation}</p><blockquote className="mt-2 border-l-2 border-primary/35 pl-3 text-xs text-muted-foreground">Reference: {finding.referenceEvidence}{finding.notesEvidence ? <><br />Notes: {finding.notesEvidence}</> : null}</blockquote></div>)}</div></section>
}

export default function AnalysisDetailPage() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const { records, status, error: queryError } = useQuery<AnalysisRecord>('analyses', { where: { recordId: id }, limit: 1 })
  const { ready, putConfirmed, removeConfirmed } = useMutations<AnalysisRecord>('analyses')
  const { getUrl, deleteFile } = useR2Files()
  const envelope = records[0]
  const record = envelope?.data
  const [title, setTitle] = useState('')
  const [editedText, setEditedText] = useState('')
  const [notice, setNotice] = useState('')
  const [actionError, setActionError] = useState('')
  const [busy, setBusy] = useState(false)

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
  const { transcription, comparison, images } = parsed
  const baseline = record.correctedTranscription || transcription.fullText
  const textChanged = editedText !== baseline

  async function save() {
    setBusy(true); setActionError(''); setNotice('')
    try {
      await putConfirmed(envelope.recordId, { title: title.trim() || record.title, correctedTranscription: editedText, comparisonStale: comparison && textChanged ? 1 : record.comparisonStale, status: 'saved' })
      setNotice('Corrections saved.')
    } catch (cause) { setActionError(cause instanceof Error ? cause.message : 'Could not save changes') }
    finally { setBusy(false) }
  }

  async function rerun() {
    setBusy(true); setActionError(''); setNotice('')
    try {
      if (textChanged) await putConfirmed(envelope.recordId, { correctedTranscription: editedText, comparisonStale: 1 })
      await callAction('rerunComparison', { recordId: envelope.recordId })
      setNotice('Comparison rerun against the corrected transcription.')
    } catch (cause) { setActionError(cause instanceof Error ? cause.message : 'Could not rerun comparison') }
    finally { setBusy(false) }
  }

  async function remove() {
    if (!window.confirm('Delete this analysis and all of its source images? This cannot be undone.')) return
    setBusy(true); setActionError('')
    const results = await Promise.allSettled(images.map((image) => deleteFile(image.key)))
    if (results.some((result) => result.status === 'rejected' || (result.status === 'fulfilled' && !result.value.success))) {
      setActionError('Some source files could not be deleted, so the analysis record was preserved. Try again.')
      setBusy(false); return
    }
    try { await removeConfirmed(envelope.recordId); navigate('/library') }
    catch (cause) { setActionError(cause instanceof Error ? cause.message : 'Could not delete analysis'); setBusy(false) }
  }

  function exportMarkdown() {
    downloadText(analysisToMarkdown(record, transcription, comparison), exportNames(record.title).markdown, 'text/markdown;charset=utf-8')
  }
  function exportJson() {
    const data = { schemaVersion: record.schemaVersion, title: record.title, subject: record.subject, topic: record.topic, transcription, correctedTranscription: record.correctedTranscription || null, reference: record.hasReference ? { text: record.referenceText, fileName: record.referenceFileName || null } : null, comparison, model: { provider: record.modelProvider, id: record.modelId, promptVersion: record.promptVersion } }
    downloadText(JSON.stringify(data, null, 2), exportNames(record.title).json, 'application/json;charset=utf-8')
  }

  if (record.status === 'processing') return <PageShell><Panel className="py-20 text-center"><RefreshCw className="mx-auto animate-spin text-primary" /><h1 className="mt-5 text-xl font-bold">Analysis in progress</h1><p className="mt-2 text-muted-foreground">Transcribing your handwriting and validating the result.</p></Panel></PageShell>
  if (record.status === 'failed') return <PageShell><Link to="/library" className="inline-flex items-center gap-2 text-sm text-muted-foreground"><ArrowLeft size={15} /> Library</Link><Panel className="mt-5 border-destructive/30"><AlertTriangle className="text-destructive" /><h1 className="mt-4 text-xl font-bold">Analysis failed</h1><p className="mt-2 text-muted-foreground">{record.errorSummary || 'The analysis could not be completed.'}</p><Link to="/new" className="mt-5 inline-block font-semibold text-primary">Start a new analysis</Link></Panel></PageShell>

  return <PageShell>
    <div className="flex flex-wrap items-start justify-between gap-4"><div><Link to="/library" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft size={15} /> Library</Link><Eyebrow>Review workspace</Eyebrow><Input aria-label="Analysis title" value={title} onChange={(e) => setTitle(e.target.value)} className="h-auto border-0 bg-transparent p-0 text-3xl font-bold shadow-none focus-visible:ring-0 sm:text-4xl" /><p className="mt-2 text-sm text-muted-foreground">{[record.subject, record.topic].filter(Boolean).join(' · ') || 'Uncategorized'} · {images.length} {images.length === 1 ? 'page' : 'pages'}</p></div><div className="flex flex-wrap gap-2"><Button variant="outline" onClick={exportMarkdown}><Download /> Markdown</Button><Button variant="outline" onClick={exportJson}><FileJson /> JSON</Button><Button onClick={() => void save()} loading={busy} disabled={!ready}><Save /> Save</Button></div></div>
    {(record.comparisonStale || (comparison && textChanged)) ? <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900"><span className="flex items-center gap-2"><AlertTriangle size={16} /> This score may be stale because the transcription changed.</span>{record.hasReference ? <Button size="sm" onClick={() => void rerun()} disabled={busy}><RefreshCw /> Rerun comparison</Button> : null}</div> : null}
    {notice && <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">{notice}</div>}{actionError && <div role="alert" className="mt-5 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">{actionError}</div>}

    <div className="mt-7 grid gap-6 xl:grid-cols-[.78fr_1.25fr_.8fr]">
      <div className="space-y-4"><h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Source pages</h2>{images.map((image, index) => <Panel key={image.key} className="p-2"><img src={getUrl(image.key)} alt={`Handwritten note page ${index + 1}: ${image.name}`} className="w-full rounded-xl bg-muted object-contain" /><p className="px-2 pb-1 pt-3 text-xs text-muted-foreground">Page {index + 1} · {image.name}</p></Panel>)}</div>
      <div><div className="flex items-center justify-between"><h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Transcription</h2>{textChanged && <Badge variant="warning">Unsaved edits</Badge>}</div><Panel className="mt-4"><p className="mb-3 text-xs text-muted-foreground">Edit anything the model misread. The original AI output remains preserved in the record.</p><Textarea value={editedText} onChange={(e) => setEditedText(e.target.value)} className="min-h-[520px] resize-y border-0 bg-transparent p-0 font-serif text-base leading-8 shadow-none focus-visible:ring-0" /></Panel>
        {transcription.equations.length > 0 && <Panel className="mt-4"><h3 className="font-bold">Equations</h3><div className="mt-3 space-y-3">{transcription.equations.map((equation, index) => <div key={`${equation.raw}-${index}`} className="rounded-lg bg-background p-3"><p className="font-mono">{equation.latex}</p><p className="mt-1 text-xs text-muted-foreground">Raw: {equation.raw}{equation.uncertain ? ' · uncertain' : ''}</p></div>)}</div></Panel>}
        {transcription.uncertainties.length > 0 && <Panel className="mt-4 border-amber-300"><h3 className="font-bold">Uncertain passages</h3><div className="mt-3 space-y-3">{transcription.uncertainties.map((item, index) => <div key={`${item.text}-${index}`} className="border-l-2 border-amber-400 pl-3"><p className="font-semibold">{item.text}</p><p className="text-sm text-muted-foreground">{item.reason}</p>{item.alternatives.length > 0 && <p className="mt-1 text-xs text-muted-foreground">Possible readings: {item.alternatives.join(', ')}</p>}</div>)}</div></Panel>}
      </div>
      <div className="space-y-4"><h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Evaluation</h2>{comparison ? <><ScoreCard comparison={comparison} /><Panel><h3 className="font-bold">What the score means</h3><p className="mt-2 text-sm leading-6 text-muted-foreground">{comparison.explanation}</p><p className="mt-3 text-xs text-muted-foreground">This measures correspondence with the supplied reference—not your ability, a grade, or independent proof that the reference is correct.</p></Panel><Findings title="Important omissions" findings={comparison.omissions} tone="warn" /><Findings title="Discrepancies" findings={comparison.discrepancies} tone="warn" /><Findings title="Unsupported additions" findings={comparison.unsupportedAdditions} tone="warn" /><Findings title="Correctly represented" findings={comparison.correctConcepts} tone="good" /><Findings title="Needs human review" findings={comparison.uncertainComparisons} tone="neutral" />{comparison.suggestedCorrections.length > 0 && <Panel><h3 className="font-bold">Suggested review</h3><ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-muted-foreground">{comparison.suggestedCorrections.map((item) => <li key={item}>{item}</li>)}</ul></Panel>}</> : <Panel><h3 className="font-bold">No reference supplied</h3><p className="mt-2 text-sm leading-6 text-muted-foreground">The notes were transcribed and organized, but no reference-based score was produced.</p></Panel>}</div>
    </div>
    <div className="mt-10 border-t border-border pt-6"><Button variant="destructive" onClick={() => void remove()} disabled={busy || !ready}><Trash2 /> Delete analysis and files</Button></div>
  </PageShell>
}
