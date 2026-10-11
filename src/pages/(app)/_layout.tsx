import { Suspense, useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import Navigation from '../../components/Navigation'
import { Footer } from '../../components/Footer'
import { APP_NAME } from '../../constants'
import { openSessionConnection } from '../../lib/session'

export default function AppLayout() {
  useEffect(() => {
    let close: (() => void) | undefined
    void openSessionConnection().then((cleanup) => { close = cleanup }).catch(() => {})
    return () => close?.()
  }, [])

  return (
    <>
      <title>{APP_NAME}</title>
      <div className="flex min-h-screen flex-col bg-background">
        <Navigation />
        <main className="min-h-0 flex-1">
          <Suspense fallback={<div className="mx-auto w-full max-w-7xl space-y-4 px-4 py-10 sm:px-6" aria-label="Loading page"><div className="h-16 animate-pulse rounded-xl bg-muted" /><div className="h-72 animate-pulse rounded-xl bg-muted" /></div>}>
            <Outlet />
          </Suspense>
        </main>
        <Footer />
      </div>
    </>
  )
}
