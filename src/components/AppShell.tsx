import type { ReactNode } from 'react'

export function PageShell({ children, width = 'max-w-7xl' }: { children: ReactNode; width?: string }) {
  return <div className={`mx-auto w-full ${width} px-4 py-8 sm:px-6 sm:py-12`}>{children}</div>
}

export function Eyebrow({ children }: { children: ReactNode }) {
  return <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.22em] text-primary">{children}</p>
}

export function Panel({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <section className={`rounded-xl border border-border bg-card p-5 ${className}`}>{children}</section>
}

export function PageHeader({ eyebrow, title, description, action }: { eyebrow: string; title: string; description: string; action?: ReactNode }) {
  return <header className="flex flex-col justify-between gap-5 border-b border-border pb-7 sm:flex-row sm:items-end">
    <div className="max-w-3xl"><Eyebrow>{eyebrow}</Eyebrow><h1 className="text-3xl font-bold tracking-[-0.035em] sm:text-4xl">{title}</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">{description}</p></div>
    {action}
  </header>
}

export function StepHeading({ number, title, description }: { number: string; title: string; description: string }) {
  return <div className="flex gap-4"><span className="mt-0.5 text-xs font-bold tracking-[0.16em] text-primary">{number}</span><div><h2 className="font-bold">{title}</h2><p className="mt-1 text-sm leading-6 text-muted-foreground">{description}</p></div></div>
}

