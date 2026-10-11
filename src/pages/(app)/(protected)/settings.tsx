import { useState } from 'react'
import { ShieldAlert } from 'lucide-react'
import { PageShell } from '../../../components/AppShell'
import { Button, ConfirmModal } from '../../../components/ui'
import { sessionApi } from '../../../lib/session'

export default function SettingsPage() {
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')

  async function clear() {
    setBusy(true)
    setError('')
    setNotice('')
    try {
      await sessionApi.clear()
      setConfirmOpen(false)
      setNotice('Session data cleared. Your temporary workspace is now empty.')
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Session data could not be cleared. Try again.')
    } finally { setBusy(false) }
  }

  return <PageShell width="max-w-3xl">
    <header className="border-b border-border pb-7"><h1 className="text-3xl font-bold tracking-[-0.035em] sm:text-4xl">Settings</h1><p className="mt-4 max-w-2xl text-sm leading-7 text-muted-foreground">H.A.N.D keeps uploads and results in a temporary, account-free session. Cleanup is scheduled after 30 minutes without a browser connection or valid session activity. You can clear the current application session below.</p></header>

    <section aria-labelledby="clear-session" className="mt-8 rounded-xl border border-destructive/30 bg-card p-5 sm:p-6">
      <div className="flex gap-4"><ShieldAlert className="mt-0.5 shrink-0 text-destructive" size={20} /><div><h2 id="clear-session" className="font-bold">Clear Session Data</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">Delete uploads, transcripts, comparisons, and recent items stored by H.A.N.D for this session.</p><Button variant="destructive" className="mt-5" onClick={() => { setError(''); setNotice(''); setConfirmOpen(true) }}>Clear Session Data</Button></div></div>
    </section>

    {notice && <p role="status" className="mt-5 rounded-lg border border-success/30 bg-success/10 px-4 py-3 text-sm text-foreground">{notice}</p>}
    {error && <div role="alert" className="mt-5 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"><p>{error}</p><Button variant="outline" size="sm" className="mt-3" onClick={() => setConfirmOpen(true)}>Try again</Button></div>}

    <ConfirmModal open={confirmOpen} onClose={() => { if (!busy) setConfirmOpen(false) }} onConfirm={() => void clear()} title="Clear all session data?" description="This deletes H.A.N.D uploads and analyses in this session. Downloaded files and provider records are not controlled by this action." confirmText="Clear Session Data" loading={busy} />
  </PageShell>
}
