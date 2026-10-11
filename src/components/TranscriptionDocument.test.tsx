import { describe, expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { TranscriptionDocument, parseTranscriptionLine } from './TranscriptionDocument'

describe('TranscriptionDocument', () => {
  it('preserves headings and nested list structure', () => {
    expect(parseTranscriptionLine('## Topic')).toEqual({ kind: 'heading', level: 2, text: 'Topic' })
    expect(parseTranscriptionLine('  - detail')).toEqual({ kind: 'list', indent: 1, marker: '-', text: 'detail' })
    const html = renderToStaticMarkup(<TranscriptionDocument text={'# Notes\n- first\n  - nested\nx = y + 2'} />)
    expect(html).toContain('aria-level="1"')
    expect(html).toContain('padding-inline-start:1.25rem')
    expect(html).toContain('x = y + 2')
    expect(html).not.toContain('font-serif')
  })
})
