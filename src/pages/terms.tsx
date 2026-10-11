import { PolicyPage } from '../components/PolicyPage'
import { PublicPage } from '../components/PublicPage'
import { Seo } from '../components/Seo'
import { seo } from '../seo'

export default function TermsPage() {
  return <PublicPage>
    <Seo {...seo} title="Terms of Service | H.A.N.D" description="Terms for using the H.A.N.D note transcription and comparison service." path="/terms" type="article" />
    <PolicyPage title="Terms of Service" summary="These terms apply when you use H.A.N.D and its temporary note-analysis workspace.">
      <section><h2>1. Acceptance</h2><p>By using H.A.N.D, you agree to these Terms, the <a href="/privacy">Privacy Policy</a>, and the <a href="/acceptable-use">Acceptable Use Policy</a>. Do not use the service if you do not agree.</p></section>
      <section><h2>2. Service</h2><p>H.A.N.D accepts handwritten-note images, creates an AI-assisted transcription, organizes the result, and can compare it with optional reference material. The service uses an anonymous temporary session instead of an account.</p></section>
      <section><h2>3. Eligibility and responsibility</h2><p>You must be legally able to accept these Terms. Users under 13 may not use H.A.N.D. You are responsible for your device, browser session, uploads, and compliance with applicable rules.</p></section>
      <section><h2>4. Your content</h2><p>You keep your rights in original notes and other material you submit. You give 592 Industries a limited license to receive, store, validate, transmit, process, analyze, display, and return that content only as needed to provide, secure, and maintain H.A.N.D.</p><p>You must have the right to submit the content. Do not upload protected, confidential, regulated, or third-party material without permission.</p></section>
      <section><h2>5. AI and accuracy</h2><p>AI output may be incomplete or wrong. Handwriting, punctuation, signs, symbols, equations, summaries, concepts, findings, and scores can be misread or misclassified. You must check important work against the original notes and reliable sources.</p><p>A comparison score estimates alignment with the reference you supplied under H.A.N.D's scoring method. It is not an independently verified grade, proof of truth, or measure of intelligence. See the <a href="/ai-disclaimer">AI Accuracy Notice</a>.</p></section>
      <section><h2>6. Acceptable use and limits</h2><p>You may not misuse the service, access another session, bypass controls, submit malware, infringe rights, or overload AI and infrastructure resources. H.A.N.D may enforce upload, request, analysis, and rate limits and may block or end abusive use.</p></section>
      <section><h2>7. Temporary access and deletion</h2><p>Session data is temporary. Access may end when a cookie is cleared, a session expires, the service is unavailable, or session data is deleted. H.A.N.D does not provide account recovery. Save any export you need before leaving; downloaded copies are your responsibility.</p></section>
      <section><h2>8. Third-party services</h2><p>H.A.N.D depends on DeepSpace infrastructure and external AI processing. Their service terms and privacy practices may apply to their processing. We do not control every provider event or retention decision.</p></section>
      <section><h2>9. Availability and changes</h2><p>We may change, limit, suspend, or stop features. The service may be unavailable because of maintenance, demand, provider failure, or other events. We do not promise uninterrupted availability.</p></section>
      <section><h2>10. Disclaimer and liability</h2><p>To the extent allowed by law, H.A.N.D is provided “as is” and “as available,” without warranties of accuracy, fitness, availability, or error-free operation. It is a study and organization tool, not professional, legal, medical, financial, or academic advice.</p><p>To the extent allowed by law, 592 Industries is not liable for indirect, special, incidental, consequential, or punitive losses arising from use of H.A.N.D. Rights that cannot legally be limited remain unaffected.</p></section>
      <section><h2>11. Ending use</h2><p>You may stop using H.A.N.D at any time and clear the active session. We may restrict access for misuse, risk, legal requirements, or service operation.</p></section>
      <section><h2>12. Law and contact</h2><p>These Terms are governed by New York law, subject to any non-waivable rights that apply where you live. Questions may be submitted through <a href="https://592industries.com/contact" target="_blank" rel="noreferrer">592 Industries support</a> or by phone at +1 (516) 336-9270.</p><p>This draft is an operational policy starting point and should be reviewed by qualified counsel.</p></section>
    </PolicyPage>
  </PublicPage>
}
