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
          <Suspense fallback={<div className="flex h-full items-center justify-center text-muted-foreground">Loading…</div>}>
            <Outlet />
          </Suspense>
        </main>
        <Footer />
      </div>
    </>
  )
}
