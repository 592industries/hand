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
    <footer data-testid="app-footer" className="border-t border-border bg-card/70">
      <div className="safe-area-bottom mx-auto max-w-7xl px-4 pt-5 text-xs text-muted-foreground sm:px-6">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
          <div><p className="leading-5">A <a href="https://592industries.com/" target="_blank" rel="noreferrer" className="font-semibold text-foreground underline decoration-border underline-offset-4 hover:text-primary">592 Industries</a> product. <a href="https://592industries.com/contact" target="_blank" rel="noreferrer" className="font-semibold text-foreground underline decoration-border underline-offset-4 hover:text-primary">Contact support</a> · +1 (516) 336-9270</p><p className="mt-1">© 2026 592 Industries</p></div>
          <nav aria-label="Policy navigation" className="flex flex-wrap gap-x-4 gap-y-2">
            {policies.map(([path, label]) => <Link key={path} to={path} className="hover:text-primary">{label}</Link>)}
          </nav>
        </div>
      </div>
    </footer>
  )
}
