import type { ReactNode } from 'react'
import { PageShell } from './AppShell'

export const POLICY_DATE = 'October 10, 2026'

export function PolicyPage({ title, summary, children }: { title: string; summary: string; children: ReactNode }) {
  return <PageShell width="max-w-4xl">
    <article className="policy-page">
      <header className="border-b border-border pb-7">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">H.A.N.D policy</p>
        <h1 className="mt-3 text-3xl font-bold tracking-[-0.035em] sm:text-4xl">{title}</h1>
        <p className="mt-3 max-w-3xl text-base leading-7 text-muted-foreground">{summary}</p>
        <p className="mt-4 text-xs text-muted-foreground">Effective: {POLICY_DATE} · Updated: {POLICY_DATE}</p>
      </header>
      <div className="mt-8 space-y-8 text-sm leading-7 text-foreground [&_a]:text-primary [&_a]:underline [&_a]:underline-offset-4 [&_h2]:text-xl [&_h2]:font-bold [&_h3]:font-bold [&_li]:ml-5 [&_li]:list-disc [&_p+p]:mt-3 [&_ul]:mt-3 [&_ul]:space-y-1">
        {children}
      </div>
    </article>
  </PageShell>
}
