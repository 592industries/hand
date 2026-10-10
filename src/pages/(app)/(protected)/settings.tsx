import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bot, Clock3, Database, LockKeyhole } from 'lucide-react'
import { Eyebrow, PageShell, Panel } from '../../../components/AppShell'
import { Button } from '../../../components/ui'
import { sessionApi } from '../../../lib/session'

export default function SettingsPage() {
  const navigate = useNavigate()
  const [busy, setBusy] = useState(false)

  async function clear() {
    if (!window.confirm('Clear every upload and analysis in this session now?')) return
    setBusy(true)
    await sessionApi.clear()
    navigate('/new', { replace: true })
  }

  return <PageShell width="max-w-4xl">
    <Eyebrow>Privacy</Eyebrow><h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Session & privacy</h1><p className="mt-2 text-muted-foreground">H.A.N.D. works without accounts or personal profiles.</p>
    <div className="mt-8 grid gap-5 md:grid-cols-2">
      <Panel><LockKeyhole className="text-primary" /><h2 className="mt-4 font-bold">No account data</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">There is no sign-up, login, name, email, or user profile. A random HttpOnly cookie only connects this browser to its temporary workspace.</p></Panel>
      <Panel><Clock3 className="text-primary" /><h2 className="mt-4 font-bold">30-minute cleanup</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">Uploads and results are deleted 30 minutes after the last browser connection closes. Reconnecting before then keeps the session available.</p></Panel>
      <Panel><Bot className="text-primary" /><h2 className="mt-4 font-bold">Protected AI access</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">AI calls run only through the server, with schema validation, per-session rate limits, request-size limits, and idempotency protection.</p></Panel>
      <Panel><Database className="text-primary" /><h2 className="mt-4 font-bold">Temporary storage</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">Images and analyses remain inside one isolated session Durable Object. Source images are never published through a public file URL.</p></Panel>
    </div>
    <Panel className="mt-5"><h2 className="font-bold">Clear this session now</h2><p className="mt-2 text-sm text-muted-foreground">Immediately remove all current uploads, transcriptions, comparisons, and recent items.</p><Button variant="destructive" className="mt-4" loading={busy} onClick={() => void clear()}>Clear session data</Button></Panel>
  </PageShell>
}
