import type { ReactNode } from 'react'

export function PageShell({ children, width = 'max-w-7xl' }: { children: ReactNode; width?: string }) {
  return <div className={`mx-auto w-full ${width} px-4 py-7 sm:px-6 sm:py-10`}>{children}</div>
}

export function Eyebrow({ children }: { children: ReactNode }) {
  return <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-primary">{children}</p>
}

export function Panel({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <section className={`rounded-2xl border border-border bg-card p-5 shadow-[0_12px_40px_rgba(20,42,34,0.06)] ${className}`}>{children}</section>
}

