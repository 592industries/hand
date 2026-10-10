import { Link } from 'react-router-dom'
import { ArrowRight, CheckCircle2, FileSearch, PenLine, ShieldCheck } from 'lucide-react'
import { Seo } from '../components/Seo'
import { seo } from '../seo'

export default function Landing() {
  return (
    <>
      <Seo {...seo} path="/" />
      <main data-testid="static-landing" className="min-h-screen overflow-hidden bg-background text-foreground">
        <nav className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 sm:px-8">
          <div className="flex items-center gap-3 font-bold tracking-wide"><span className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-primary-foreground">H</span> H.A.N.D.</div>
          <Link to="/home" className="rounded-full border border-border bg-card px-5 py-2 text-sm font-semibold transition hover:border-primary/40">Open workspace</Link>
        </nav>
        <section className="relative mx-auto grid max-w-7xl items-center gap-12 px-5 pb-20 pt-14 sm:px-8 lg:grid-cols-[1.1fr_.9fr] lg:py-28">
          <div className="relative z-10">
            <p className="mb-5 text-xs font-bold uppercase tracking-[0.22em] text-primary">Handwritten Analysis & Note Digitization</p>
            <h1 className="max-w-3xl text-5xl font-bold leading-[1.04] tracking-[-0.045em] sm:text-7xl">Your handwriting,<br /><span className="font-serif italic font-normal text-primary">made clear.</span></h1>
            <p className="mt-7 max-w-xl text-lg leading-8 text-muted-foreground">Turn handwritten academic notes into structured, editable text. Add a reference to see exactly what you captured, what you missed, and why.</p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link to="/new" className="inline-flex h-12 items-center gap-2 rounded-full bg-primary px-6 font-semibold text-primary-foreground shadow-lg shadow-primary/15">Analyze notes <ArrowRight size={17} /></Link>
              <a href="#how" className="inline-flex h-12 items-center rounded-full border border-border bg-card px-6 font-semibold">See how it works</a>
            </div>
            <p className="mt-5 flex items-center gap-2 text-sm text-muted-foreground"><ShieldCheck size={16} className="text-primary" /> Private files, authenticated access, transparent scoring.</p>
          </div>
          <div className="relative mx-auto w-full max-w-lg">
            <div className="absolute -inset-16 rounded-full bg-primary/10 blur-3xl" />
            <div className="relative rotate-2 rounded-2xl border border-border bg-card p-5 shadow-[0_30px_80px_rgba(23,59,50,0.15)]">
              <div className="mb-5 flex items-center justify-between"><span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Thermodynamics · Lecture 04</span><span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">92 match</span></div>
              <div className="space-y-4 font-serif text-lg leading-8"><p className="font-bold">Second law of thermodynamics</p><p>For an isolated system, entropy never decreases:</p><p className="rounded-lg bg-secondary p-3 text-center text-2xl">ΔS<sub>universe</sub> ≥ 0</p><p className="border-l-2 border-amber-400 pl-3 text-base text-muted-foreground"><span className="font-sans text-xs font-bold uppercase text-amber-700">Uncertain</span><br />“reversible process”</p></div>
              <div className="mt-5 grid grid-cols-3 gap-2 border-t border-border pt-4 text-center text-xs text-muted-foreground"><span><b className="block text-lg text-foreground">94</b>Coverage</span><span><b className="block text-lg text-foreground">91</b>Agreement</span><span><b className="block text-lg text-foreground">89</b>Technical</span></div>
            </div>
          </div>
        </section>
        <section id="how" className="border-y border-border bg-card/60"><div className="mx-auto max-w-7xl px-5 py-20 sm:px-8"><p className="text-center text-xs font-bold uppercase tracking-[0.22em] text-primary">A review tool, not a black box</p><h2 className="mx-auto mt-3 max-w-2xl text-center text-3xl font-bold tracking-tight sm:text-4xl">From a page of ink to an honest study companion.</h2><div className="mt-12 grid gap-5 md:grid-cols-3">{[
          [PenLine, '1. Upload', 'Add up to six JPG, PNG, or WebP note images. A reference transcript is optional.'],
          [FileSearch, '2. Analyze', 'Vision AI preserves structure and equations while explicitly flagging uncertain passages.'],
          [CheckCircle2, '3. Review', 'Edit the transcription, inspect evidence, rerun comparisons, save, search, and export.'],
        ].map(([Icon, title, body]) => { const I = Icon as typeof PenLine; return <article key={String(title)} className="rounded-2xl border border-border bg-background p-6"><I className="mb-5 text-primary" /><h3 className="font-bold">{String(title)}</h3><p className="mt-2 leading-6 text-muted-foreground">{String(body)}</p></article> })}</div></div></section>
      </main>
    </>
  )
}

