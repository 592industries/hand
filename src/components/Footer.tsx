import { Link } from 'react-router-dom'

const policies = [
  ['/privacy', 'Privacy'],
  ['/terms', 'Terms'],
  ['/acceptable-use', 'Acceptable use'],
  ['/cookies', 'Cookies and sessions'],
  ['/ai-disclaimer', 'AI accuracy'],
] as const

export function Footer() {
  return (
    <footer data-testid="app-footer" className="border-t border-border bg-card">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-8 sm:px-6 md:grid-cols-[240px_1fr] md:items-center">
        <img src="/brand/hand-logo-v1.webp" width="240" height="126" loading="lazy" decoding="async" alt="H.A.N.D — Handwritten Analysis and Note Digitization" className="h-auto w-60 rounded-lg border border-border" />
        <div>
          <p className="font-bold">H.A.N.D</p>
          <p className="text-sm text-muted-foreground">Handwritten Analysis &amp; Note Digitization</p>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">Turn handwritten notes into clear, reviewable text.</p>
          <nav aria-label="Policy navigation" className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm">
            {policies.map(([path, label]) => <Link key={path} to={path} className="text-muted-foreground hover:text-primary">{label}</Link>)}
          </nav>
          <p className="mt-5 text-xs leading-5 text-muted-foreground">
            A <a href="https://592industries.com" target="_blank" rel="noreferrer" className="underline decoration-border underline-offset-4 hover:text-primary">592 Industries</a> product.{' '}
            <a href="https://592industries.com/contact" target="_blank" rel="noreferrer" className="underline decoration-border underline-offset-4 hover:text-primary">Contact support</a> · +1 (516) 336-9270
          </p>
          <p className="mt-1 text-xs text-muted-foreground">© {new Date().getUTCFullYear()} 592 Industries</p>
        </div>
      </div>
    </footer>
  )
}
