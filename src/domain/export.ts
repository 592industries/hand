import type { AnalysisRecord, Comparison, Transcription } from './types'

function safeFileName(title: string): string {
  return (title || 'hand-analysis').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'hand-analysis'
}

export function analysisToMarkdown(
  record: AnalysisRecord,
  transcription: Transcription,
  comparison: Comparison | null,
): string {
  const text = record.correctedTranscription || transcription.fullText
  const lines = [
    `# ${record.title}`,
    '',
    `- Subject: ${record.subject || transcription.suggestedSubject || 'Not specified'}`,
    `- Topic: ${record.topic || transcription.suggestedTopic || 'Not specified'}`,
    `- Model: ${record.modelProvider}/${record.modelId}`,
    '',
    '## Transcription',
    '',
    text,
    '',
    '## Summary',
    '',
    transcription.summary,
    '',
    '## Key concepts',
    '',
    ...transcription.keyConcepts.map((concept) => `- ${concept}`),
  ]
  if (transcription.equations.length) {
    lines.push('', '## Equations', '', ...transcription.equations.map((e) => `- Raw: ${e.raw}\n  - LaTeX: \`${e.latex}\`${e.uncertain ? '\n  - Uncertain' : ''}`))
  }
  if (transcription.uncertainties.length) {
    lines.push('', '## Uncertainties', '', ...transcription.uncertainties.map((u) => `- **${u.text}** — ${u.reason}`))
  }
  if (record.hasReference && comparison) {
    lines.push('', '## Reference comparison', '')
    if (comparison.score) {
      lines.push(
        `- Overall: ${comparison.score.overall}/100`,
        `- Coverage: ${comparison.score.coverage}/100`,
        `- Semantic agreement: ${comparison.score.agreement}/100`,
        `- Technical fidelity: ${comparison.score.technical === null ? 'Not applicable' : `${comparison.score.technical}/100`}`,
      )
    } else {
      lines.push(`No score was produced: ${comparison.limitation || 'the reference was unsuitable for scoring.'}`)
    }
    lines.push('', comparison.explanation)
    if (comparison.omissions.length) lines.push('', '### Important omissions', '', ...comparison.omissions.map((f) => `- ${f.claim} — ${f.explanation}`))
    if (comparison.discrepancies.length) lines.push('', '### Discrepancies', '', ...comparison.discrepancies.map((f) => `- ${f.claim} — ${f.explanation}`))
  } else {
    lines.push('', '## Reference comparison', '', 'No reference transcript was supplied, so no reference-based score is available.')
  }
  lines.push('', '---', '', 'The score measures correspondence with the supplied reference; it is not a grade and does not establish that the reference itself is factually correct.')
  return lines.join('\n')
}

export function downloadText(content: string, filename: string, type: string): void {
  const url = URL.createObjectURL(new Blob([content], { type }))
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.click()
  URL.revokeObjectURL(url)
}

export function exportNames(title: string) {
  const base = safeFileName(title)
  return { markdown: `${base}.md`, json: `${base}.json` }
}

