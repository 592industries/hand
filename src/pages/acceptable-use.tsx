import { PolicyPage } from '../components/PolicyPage'
import { PublicPage } from '../components/PublicPage'
import { Seo } from '../components/Seo'
import { seo } from '../seo'

export default function AcceptableUsePage() {
  return <PublicPage>
    <Seo {...seo} title="Acceptable Use Policy | H.A.N.D" description="Rules for safe and lawful use of H.A.N.D." path="/acceptable-use" type="article" />
    <PolicyPage title="Acceptable Use Policy" summary="Use H.A.N.D lawfully and without harming people, data, or the service.">
      <section><h2>1. Prohibited use</h2><p>You may not use H.A.N.D to:</p><ul><li>break a law or help another person do so;</li><li>submit content you do not have permission to use;</li><li>access or attempt to access another session, upload, or result;</li><li>upload malware, harmful files, deceptive content, or material intended to exploit the AI system;</li><li>probe, scan, reverse engineer, or exploit the service without written authorization;</li><li>bypass session controls, validation, rate limits, or other security measures;</li><li>automate excessive requests, exhaust AI resources, or disrupt service;</li><li>harass, threaten, defraud, or harm another person;</li><li>infringe privacy, copyright, trademark, or other rights.</li></ul></section>
      <section><h2>2. Security research</h2><p>Do not conduct vulnerability testing, social engineering, denial-of-service testing, or exploit testing without written authorization from 592 Industries.</p></section>
      <section><h2>3. Enforcement</h2><p>We may reject content, limit requests, clear a session, block access, preserve required records, notify a service provider, or report conduct when reasonably needed to operate the service, protect users, or meet legal duties.</p></section>
      <section><h2>4. Reporting</h2><p>Report misuse through <a href="https://592industries.com/contact" target="_blank" rel="noreferrer">592 Industries support</a> or by phone at +1 (516) 336-9270.</p></section>
    </PolicyPage>
  </PublicPage>
}
