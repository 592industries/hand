import { signOut, useUser } from 'deepspace'
import { Bot, Cloud, Database, LockKeyhole } from 'lucide-react'
import { Eyebrow, PageShell, Panel } from '../../../components/AppShell'
import { Button } from '../../../components/ui'

export default function SettingsPage() {
  const { user } = useUser()
  return <PageShell width="max-w-4xl">
    <Eyebrow>Configuration</Eyebrow><h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Settings & privacy</h1><p className="mt-2 text-muted-foreground">How H.A.N.D. handles your notes and analysis.</p>
    <div className="mt-8 grid gap-5 md:grid-cols-2">
      <Panel><LockKeyhole className="text-primary" /><h2 className="mt-4 font-bold">Your account</h2><dl className="mt-4 space-y-3 text-sm"><div><dt className="text-muted-foreground">Name</dt><dd>{user?.name ?? '—'}</dd></div><div><dt className="text-muted-foreground">Email</dt><dd>{user?.email ?? '—'}</dd></div></dl><Button variant="secondary" className="mt-6" onClick={() => signOut()}>Sign out</Button></Panel>
      <Panel><Bot className="text-primary" /><h2 className="mt-4 font-bold">AI model</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">Anthropic Claude Sonnet 5 through DeepSpace’s managed AI proxy. Model calls run server-side; no provider credential is shipped to your browser.</p></Panel>
      <Panel><Database className="text-primary" /><h2 className="mt-4 font-bold">Saved analyses</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">Structured results live in DeepSpace’s SQLite-backed record room. Owner permissions are enforced by the server for every record read and write.</p></Panel>
      <Panel><Cloud className="text-primary" /><h2 className="mt-4 font-bold">Source images</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">Images use private per-user DeepSpace R2 storage. They require your authenticated session and are removed before their analysis record is deleted.</p></Panel>
    </div>
    <Panel className="mt-5"><h2 className="font-bold">Upload limits</h2><p className="mt-2 text-sm text-muted-foreground">Up to 6 JPG, PNG, or WebP images; 4 MB per image and 14 MB total. Images must be 64–12,000 pixels per side. Plain-text and Markdown references may be up to 1 MB / 120,000 characters.</p></Panel>
  </PageShell>
}
