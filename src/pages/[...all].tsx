import { Link } from 'react-router-dom'
import { APP_NAME } from '../constants'
import { PublicPage } from '../components/PublicPage'

export default function NotFound() {
  return (
    <PublicPage>
      <title>{`Not found · ${APP_NAME}`}</title>
      <div className="grid min-h-[60vh] place-items-center px-4 text-center"><div><h1 className="mb-2 text-4xl font-bold text-foreground">404</h1><p className="mb-6 text-muted-foreground">Page not found</p><Link to="/home" className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90">Go home</Link></div></div>
    </PublicPage>
  )
}
