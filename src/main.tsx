import { createRoot, hydrateRoot } from 'react-dom/client'
// Route-based code splitting keeps interactive workspace pages out of
// the initial bundle for a public top-level route such as `/`.
import { routes } from '@generouted/react-router/lazy'
import { createBrowserRouter, RouterProvider } from 'react-router'
import { installStaleChunkRecovery } from './stale-chunk-recovery'
import './styles.css'

async function main() {
  const root = document.getElementById('root')!
  const router = createBrowserRouter(routes)
  installStaleChunkRecovery(router)
  const app = <RouterProvider router={router} />
  const prerendered = root.dataset.prerendered === window.location.pathname

  // Client-only routes start rendering immediately. This lets React Router's
  // fallback replace the static loading shell while the lazy route downloads;
  // waiting here left mobile visitors staring at a blank page on slow starts.
  if (!prerendered) {
    root.replaceChildren()
    createRoot(root).render(app)
    return
  }

  // Prerendered pages already show useful HTML. Wait for their lazy module so
  // React hydrates that exact markup instead of replacing it with a fallback.
  if (!router.state.initialized) {
    await new Promise<void>((done) => {
      const stop = router.subscribe((state) => {
        if (state.initialized) {
          stop()
          done()
        }
      })
    })
  }

  if (!router.state.errors) {
    hydrateRoot(root, app, {
      // React recovers from a mismatch by repainting from scratch, so the page
      // still works — but the visitor saw a flicker and the cause is invisible
      // in `deepspace dev`, which never prerenders. Name it.
      onRecoverableError(error) {
        console.error(
          `[prerender] The static HTML for ${window.location.pathname} did not match what React rendered, so React repainted it. ` +
            'Public pages must render the same markup without a browser: no Date.now(), Math.random(), window, or matchMedia during render.',
          error,
        )
      },
    })
  } else {
    root.replaceChildren()
    createRoot(root).render(app)
  }
}

void main()
