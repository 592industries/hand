import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Clock3, Menu, Moon, Sun, X } from 'lucide-react'
import { BrandMark } from './BrandMark'
import { APP_NAME } from '../constants'
import { nav } from '../nav'
import { cn } from '../lib/utils'

type HandTheme = 'hand-paper' | 'hand-ink'

export default function Navigation() {
  const location = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [theme, setTheme] = useState<HandTheme>(() =>
    document.documentElement.dataset.theme === 'hand-ink' ? 'hand-ink' : 'hand-paper',
  )

  useEffect(() => setMobileMenuOpen(false), [location.pathname])

  function toggleTheme() {
    const next = theme === 'hand-paper' ? 'hand-ink' : 'hand-paper'
    document.documentElement.dataset.theme = next
    localStorage.setItem('hand-theme', next)
    setTheme(next)
  }

  const navLink = (item: (typeof nav)[number]) => {
    if (item.devOnly && !import.meta.env.DEV) return null
    const active = location.pathname.startsWith(item.path)
    return <Link key={item.path} to={item.path} aria-current={active ? 'page' : undefined} className={cn('px-3 py-1.5 text-sm', active ? 'text-foreground' : 'text-muted-foreground hover:text-foreground')}>{item.label}</Link>
  }

  return (
    <nav data-testid="app-navigation" className="sticky top-0 z-40 border-b border-border/80 bg-background/90 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6">
        <Link to="/new" aria-label={`${APP_NAME} home`} className="flex items-center gap-2 text-sm font-bold tracking-wide text-foreground">
          <BrandMark className="h-8 w-8 rounded-lg object-cover" />
          <span className="hidden sm:inline">{APP_NAME}</span>
        </Link>
        <div className="hidden items-center md:flex">{nav.map(navLink)}</div>
        <div className="flex-1" />
        <span className="hidden items-center gap-1.5 text-xs text-muted-foreground lg:flex"><Clock3 size={14} /> Cleared 30 min after disconnect</span>
        <button onClick={toggleTheme} className="grid h-9 w-9 place-items-center rounded-full border border-border bg-card text-muted-foreground hover:text-foreground" aria-label={`Switch to ${theme === 'hand-paper' ? 'dark' : 'light'} mode`}>
          {theme === 'hand-paper' ? <Moon size={16} /> : <Sun size={16} />}
        </button>
        <button className="inline-flex h-8 w-8 items-center justify-center text-muted-foreground hover:text-foreground md:hidden" onClick={() => setMobileMenuOpen((open) => !open)} aria-label="Toggle menu" aria-expanded={mobileMenuOpen}>
          {mobileMenuOpen ? <X size={16} /> : <Menu size={16} />}
        </button>
      </div>
      {mobileMenuOpen && <div className="flex flex-col border-t border-border px-2 py-2 md:hidden">{nav.map(navLink)}</div>}
    </nav>
  )
}
