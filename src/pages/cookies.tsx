import { PolicyPage } from '../components/PolicyPage'
import { PublicPage } from '../components/PublicPage'
import { Seo } from '../components/Seo'
import { seo } from '../seo'

export default function CookiesPage() {
  return <PublicPage>
    <Seo {...seo} title="Cookie and Session Policy | H.A.N.D" description="The essential cookie and browser storage used by H.A.N.D." path="/cookies" type="article" />
    <PolicyPage title="Cookie and Session Policy" summary="H.A.N.D uses a small set of essential browser technologies and no advertising cookies.">
      <section><h2>1. Essential session cookie</h2><p>H.A.N.D creates an essential cookie named <code>__Host-hand-session</code>. It contains a random session identifier that routes your browser to isolated temporary storage. It does not contain your notes.</p><p>The cookie is HttpOnly, Secure, SameSite=Strict, available only at the site root, and has no set Max-Age or Expires value. Browsers normally treat it as a session cookie, but browser restore settings may affect how long it remains.</p></section>
      <section><h2>2. Browser storage</h2><p>Local storage keeps only the light or dark theme choice. Session storage may hold a one-time marker used to recover from a stale application update. H.A.N.D does not intentionally use IndexedDB or a service worker.</p></section>
      <section><h2>3. No analytics or advertising cookies</h2><p>The current H.A.N.D application does not include advertising pixels, cross-site tracking, or an audience-analytics service. Infrastructure providers may still process normal request and security data as explained in the <a href="/privacy">Privacy Policy</a>.</p></section>
      <section><h2>4. Your controls</h2><p>You can block or delete cookies and storage in your browser. Blocking the essential cookie prevents H.A.N.D from maintaining a stable session and may make uploads, results, recent analyses, and deletion controls unavailable. Clearing it can permanently remove your ability to reach the old session even before server cleanup runs.</p></section>
      <section><h2>5. Session cleanup</h2><p>H.A.N.D schedules application-data cleanup 30 minutes after the last browser connection closes. Valid activity can refresh this window. The session cookie itself does not prove that server data still exists. Use Settings to clear the current application session directly.</p></section>
      <section><h2>6. Contact</h2><p>Questions may be submitted through <a href="https://592industries.com/contact" target="_blank" rel="noreferrer">592 Industries support</a> or by phone at +1 (516) 336-9270.</p></section>
    </PolicyPage>
  </PublicPage>
}
