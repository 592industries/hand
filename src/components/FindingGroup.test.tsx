import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { FindingGroup } from './FindingGroup'

describe('FindingGroup', () => {
  it('starts collapsed while retaining its count and evidence control', () => {
    const html = renderToStaticMarkup(<FindingGroup title="Needs review" critical onEdit={() => {}} findings={[{
      claim: 'Claim',
      explanation: 'Explanation',
      referenceEvidence: 'Reference',
      notesEvidence: 'Notes',
    }]} />)
    expect(html).toContain('<details class=')
    expect(html).not.toContain('<details open')
    expect(html).toContain('View evidence')
  })
})
