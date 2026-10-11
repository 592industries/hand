import type { ReactNode } from 'react'
import Navigation from './Navigation'
import { Footer } from './Footer'

export function PublicPage({ children }: { children: ReactNode }) {
  return <div className="flex min-h-screen flex-col bg-background"><Navigation /><main className="flex-1">{children}</main><Footer /></div>
}
