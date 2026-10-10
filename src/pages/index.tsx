import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Seo } from '../components/Seo'
import { seo } from '../seo'

export default function WorkspaceRedirect() {
  useEffect(() => { window.location.replace('/new') }, [])
  return <main className="grid min-h-screen place-items-center bg-background p-6 text-center text-foreground">
    <Seo {...seo} path="/" />
    <div><span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-primary font-bold text-primary-foreground">H</span><p className="mt-4 text-sm text-muted-foreground">Opening your private workspace…</p><Link to="/new" className="mt-4 inline-block font-semibold text-primary">Continue</Link></div>
  </main>
}
