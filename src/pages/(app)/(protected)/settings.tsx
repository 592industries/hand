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
    <header className="border-b border-border pb-7"><h1 className="text-3xl font-bold tracking-[-0.035em] sm:text-4xl">Settings</h1><p className="mt-4 max-w-2xl text-sm leading-7 text-muted-foreground">H.A.N.D is an account-free workspace where your uploaded files, transcripts, analyses, comparisons, and session history remain available temporarily. Your session data is automatically deleted 30 minutes after the last browser connection closes; use Clear Session Data below to erase the current session immediately.</p></header>

    <section aria-labelledby="clear-session" className="mt-8 rounded-xl border border-destructive/30 bg-card p-5 sm:p-6">
      <div className="flex gap-4"><ShieldAlert className="mt-0.5 shrink-0 text-destructive" size={20} /><div><h2 id="clear-session" className="font-bold">Clear Session Data</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">Permanently delete every upload, transcript, comparison, and recent item in this session.</p><Button variant="destructive" className="mt-5" onClick={() => { setError(''); setNotice(''); setConfirmOpen(true) }}>Clear Session Data</Button></div></div>
    </section>

    {notice && <p role="status" className="mt-5 rounded-lg border border-success/30 bg-success/10 px-4 py-3 text-sm text-foreground">{notice}</p>}
    {error && <div role="alert" className="mt-5 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"><p>{error}</p><Button variant="outline" size="sm" className="mt-3" onClick={() => setConfirmOpen(true)}>Try again</Button></div>}

    <ConfirmModal open={confirmOpen} onClose={() => { if (!busy) setConfirmOpen(false) }} onConfirm={() => void clear()} title="Clear all session data?" description="This permanently deletes every upload and analysis in this session. This action cannot be undone." confirmText="Clear Session Data" loading={busy} />
  </PageShell>
}
