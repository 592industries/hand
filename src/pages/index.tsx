import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { BrandMark } from '../components/BrandMark'
import { Seo } from '../components/Seo'
import { seo } from '../seo'

export default function WorkspaceRedirect() {
  useEffect(() => { window.location.replace('/new') }, [])
  return <main className="grid min-h-screen place-items-center bg-background p-6 text-center text-foreground">
    <Seo {...seo} path="/" />
    <div><BrandMark size={48} alt="H.A.N.D." className="mx-auto h-12 w-12 rounded-xl object-cover" /><p className="mt-4 text-sm text-muted-foreground">Opening your private workspace…</p><Link to="/new" className="mt-4 inline-block font-semibold text-primary">Continue</Link></div>
  </main>
}
