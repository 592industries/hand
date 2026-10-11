import { PolicyPage } from '../components/PolicyPage'
import { PublicPage } from '../components/PublicPage'
import { Seo } from '../components/Seo'
import { seo } from '../seo'

export default function AiDisclaimerPage() {
  return <PublicPage>
    <Seo {...seo} title="AI Accuracy Notice | H.A.N.D" description="Important limits of H.A.N.D transcription, comparison, and scoring." path="/ai-disclaimer" type="article" />
    <PolicyPage title="AI Accuracy Notice" summary="H.A.N.D helps review notes, but its AI output must be checked.">
      <section><h2>Transcription</h2><p>Handwriting recognition is probabilistic. H.A.N.D may misread or omit words, punctuation, signs, diagrams, subscripts, superscripts, units, and equations. Image quality and handwriting style affect results.</p></section>
      <section><h2>Summaries and concepts</h2><p>Generated summaries, concepts, and uncertainty notes may be incomplete, misleading, or wrong. They do not replace the original notes or an authoritative source.</p></section>
      <section><h2>Reference comparisons</h2><p>A comparison can miss context, report an incorrect discrepancy, or fail to detect an error. Its quality depends on both the note transcription and the reference material you provide.</p></section>
      <section><h2>Scores</h2><p>A score is a rounded estimate of coverage, semantic agreement, and technical fidelity when applicable. It measures correspondence with the supplied reference under H.A.N.D's method. It is not a verified grade, proof of factual truth, or measure of intelligence or learning.</p></section>
      <section><h2>Your responsibility</h2><p>Compare important output with the original image and reliable material. Verify academic, scientific, mathematical, technical, legal, medical, financial, or other consequential content before relying on it. H.A.N.D is a study and organization tool, not a substitute for an instructor, source text, or qualified professional.</p></section>
    </PolicyPage>
  </PublicPage>
}
