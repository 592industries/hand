type Line =
  | { kind: 'blank' }
  | { kind: 'heading'; level: number; text: string }
  | { kind: 'list'; indent: number; marker: string; text: string }
  | { kind: 'paragraph'; text: string }

export function parseTranscriptionLine(value: string): Line {
  if (!value.trim()) return { kind: 'blank' }
  const heading = /^(#{1,4})\s+(.+)$/.exec(value)
  if (heading) return { kind: 'heading', level: heading[1].length, text: heading[2] }
  const list = /^(\s*)([-*•]|\d+[.)])\s+(.+)$/.exec(value)
  if (list) return { kind: 'list', indent: Math.min(3, Math.floor(list[1].replaceAll('\t', '  ').length / 2)), marker: list[2], text: list[3] }
  return { kind: 'paragraph', text: value }
}

export function TranscriptionDocument({ text, className = '' }: { text: string; className?: string }) {
  return <div className={`break-words font-sans text-[15px] leading-7 sm:text-base sm:leading-8 ${className}`}>
    {text.split('\n').map((value, index) => {
      const line = parseTranscriptionLine(value)
      if (line.kind === 'blank') return <div key={index} aria-hidden="true" className="h-4" />
      if (line.kind === 'heading') {
        const size = line.level === 1 ? 'text-xl' : line.level === 2 ? 'text-lg' : 'text-base'
        return <p key={index} role="heading" aria-level={line.level} className={`${index ? 'mt-5' : ''} mb-2 font-bold ${size}`}>{line.text}</p>
      }
      if (line.kind === 'list') return <p key={index} className="flex gap-2" style={{ paddingInlineStart: `${line.indent * 1.25}rem` }}><span aria-hidden="true" className="shrink-0 text-muted-foreground">{line.marker}</span><span>{line.text}</span></p>
      return <p key={index} className="min-h-7 whitespace-pre-wrap">{line.text}</p>
    })}
  </div>
}
