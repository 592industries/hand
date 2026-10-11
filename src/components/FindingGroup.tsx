import type { Comparison } from '../domain/types'
import { Badge } from './ui'

type Finding = Comparison['omissions'][number]

export function FindingGroup({ title, findings, critical = false, onEdit }: { title: string; findings: Finding[]; critical?: boolean; onEdit: () => void }) {
  if (!findings.length) return null
  return <details className="group border-b border-border last:border-b-0">
    <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-4 font-semibold hover:bg-accent/45"><span>{title}</span><Badge variant={critical ? 'warning' : 'outline'}>{findings.length}</Badge></summary>
    <div className="space-y-3 px-4 pb-4">
      {findings.map((finding, index) => <article key={`${finding.claim}-${index}`} className="rounded-lg bg-background p-3"><h4 className="text-sm font-semibold">{finding.claim}</h4><p className="mt-1 text-sm leading-6 text-muted-foreground">{finding.explanation}</p><details className="mt-2 text-xs text-muted-foreground"><summary className="cursor-pointer font-semibold text-primary">View evidence</summary><dl className="mt-2 grid gap-2 border-l-2 border-primary/30 pl-3"><div><dt className="font-semibold text-foreground">Reference</dt><dd>{finding.referenceEvidence}</dd></div>{finding.notesEvidence && <div><dt className="font-semibold text-foreground">Transcription</dt><dd>{finding.notesEvidence}</dd></div>}</dl></details><button className="mt-3 text-xs font-semibold text-primary hover:underline" onClick={onEdit}>Edit transcription</button></article>)}
    </div>
  </details>
}
