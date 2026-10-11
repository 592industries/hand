import { useEffect, useRef, useState, type DragEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Camera, FileText, Files, Sparkles, Trash2, UploadCloud } from 'lucide-react'
import { AnalysisProgress } from '../../../components/AnalysisProgress'
import { PageHeader, PageShell, StepHeading } from '../../../components/AppShell'
import { Button, Input, Label, Modal, Textarea } from '../../../components/ui'
import { sessionApi } from '../../../lib/session'
import {
  MAX_IMAGES,
  MAX_REFERENCE_BYTES,
  MAX_TOTAL_IMAGE_BYTES,
} from '../../../domain/validation'
import type { ImageFile } from '../../../domain/types'
import { normalizeImage, type NormalizedImage } from '../../../lib/image-normalization'

export default function NewAnalysisPage() {
  const navigate = useNavigate()
  const inputRef = useRef<HTMLInputElement>(null)
  const cameraRef = useRef<HTMLInputElement>(null)
  const imagesRef = useRef<NormalizedImage[]>([])
  const [images, setImages] = useState<NormalizedImage[]>([])
  const [title, setTitle] = useState('')
  const [subject, setSubject] = useState('')
  const [topic, setTopic] = useState('')
  const [referenceText, setReferenceText] = useState('')
  const [referenceFileName, setReferenceFileName] = useState('')
  const [imageError, setImageError] = useState('')
  const [titleError, setTitleError] = useState('')
  const [referenceError, setReferenceError] = useState('')
  const [formError, setFormError] = useState('')
  const [busy, setBusy] = useState(false)
  const [normalizing, setNormalizing] = useState(false)
  const [startedAt, setStartedAt] = useState('')
  const [showSourceOptions, setShowSourceOptions] = useState(false)

  useEffect(() => { imagesRef.current = images }, [images])
  useEffect(() => () => imagesRef.current.forEach((image) => URL.revokeObjectURL(image.preview)), [])

  async function addFiles(files: File[]) {
    setImageError('')
    if (!files.length || normalizing || busy) return
    const normalized: NormalizedImage[] = []
    setNormalizing(true)
    try {
      if (images.length + files.length > MAX_IMAGES) throw new Error(`You can upload up to ${MAX_IMAGES} images`)
      for (const file of files) normalized.push(await normalizeImage(file))
      const total = [...images, ...normalized].reduce((sum, image) => sum + image.file.size, 0)
      if (total > MAX_TOTAL_IMAGE_BYTES) {
        throw new Error('Images exceed the 30 MB total limit after optimization')
      }
      setImages((current) => [...current, ...normalized])
    } catch (cause) {
      normalized.forEach((image) => URL.revokeObjectURL(image.preview))
      setImageError(cause instanceof Error ? cause.message : 'Could not add images')
    } finally { setNormalizing(false) }
  }

  async function readReference(file?: File) {
    if (!file) return
    setReferenceError('')
    if (!/\.(txt|md|markdown)$/i.test(file.name) || file.size > MAX_REFERENCE_BYTES) {
      setReferenceError('Reference files must be plain text or Markdown and no larger than 1 MB')
      return
    }
    const text = (await file.text()).replace(/\u0000/g, '')
    setReferenceText(text)
    setReferenceFileName(file.name)
  }

  async function start() {
    if (busy || normalizing) return
    setImageError(images.length ? '' : 'Add at least one handwritten note image')
    setTitleError(title.trim() ? '' : 'Add a title for this analysis')
    if (!images.length || !title.trim()) return
    setBusy(true)
    setStartedAt(new Date().toISOString())
    setFormError('')
    try {
      const imageFiles: ImageFile[] = images.map((image, index) => ({ key: String(index), name: image.file.name, mimeType: image.file.type as ImageFile['mimeType'], size: image.file.size, width: image.width, height: image.height }))
      const result = await sessionApi.analyze({
        requestId: crypto.randomUUID(),
        title: title.trim(), subject: subject.trim(), topic: topic.trim(),
        referenceText, referenceFileName, imageFiles,
        imageDataUrls: images.map((image) => image.dataUrl),
      })
      navigate(`/analysis/${result.recordId}`)
    } catch (cause) {
      setFormError(cause instanceof Error ? cause.message : 'Analysis could not be started')
      setBusy(false)
    }
  }

  function onDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault()
    if (!busy && !normalizing) void addFiles(Array.from(event.dataTransfer.files))
  }

  if (busy) return <PageShell><AnalysisProgress title={title} fileName={images[0]?.file.name} pageCount={images.length} stage="preparing" startedAt={startedAt} hasReference={Boolean(referenceText.trim())} /></PageShell>

  return <PageShell width="max-w-5xl">
    <PageHeader eyebrow="New analysis" title="Analyze handwritten notes" description="Upload your notes. Add a reference if you want a comparison." />

    <div className="mt-8 divide-y divide-border overflow-hidden rounded-xl border border-border bg-card">
      <section className="grid gap-6 p-5 sm:p-7 lg:grid-cols-[250px_1fr]">
        <StepHeading number="01" title="Pages" description="HEIC, JPG, PNG, or WebP · 8 MB each · 30 MB total · up to 6" />
        <div>
          <div role="button" tabIndex={normalizing ? -1 : 0} aria-busy={normalizing} aria-disabled={normalizing} aria-label="Drop note images here; upload files or take a photo" onKeyDown={(event) => { if (!normalizing && (event.key === 'Enter' || event.key === ' ')) { event.preventDefault(); setShowSourceOptions(true) } }} onDragOver={(event) => event.preventDefault()} onDrop={onDrop} onClick={() => { if (!normalizing) setShowSourceOptions(true) }} className="cursor-pointer rounded-xl border border-dashed border-input bg-background/55 px-5 py-9 text-center transition-colors hover:border-primary"><UploadCloud className="mx-auto text-primary" /><p className="mt-3 font-semibold">{normalizing ? 'Optimizing images…' : 'Drop note images here'}</p><p className="mt-1 text-sm text-muted-foreground">{normalizing ? 'Keeping handwriting clear for analysis' : 'Upload files or take a photo'}</p></div>
          <input ref={inputRef} className="sr-only" type="file" multiple accept=".heic,.heif,image/heic,image/heif,image/jpeg,image/png,image/webp" onChange={(event) => { setShowSourceOptions(false); void addFiles(Array.from(event.target.files ?? [])); event.target.value = '' }} />
          <input ref={cameraRef} className="sr-only" type="file" accept=".heic,.heif,image/heic,image/heif,image/jpeg,image/png,image/webp" capture="environment" onChange={(event) => { setShowSourceOptions(false); void addFiles(Array.from(event.target.files ?? [])); event.target.value = '' }} />
          {imageError && <p role="alert" className="mt-3 text-sm text-destructive">{imageError}</p>}
          {images.length > 0 && <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">{images.map((image, index) => <div key={`${image.file.name}-${index}`} className="group relative overflow-hidden rounded-lg border border-border bg-background"><img src={image.preview} alt={`Preview of ${image.file.name}`} className="aspect-[4/3] w-full object-cover" /><button aria-label={`Remove ${image.file.name}`} onClick={() => { URL.revokeObjectURL(image.preview); setImages((current) => current.filter((_, itemIndex) => itemIndex !== index)) }} className="absolute right-2 top-2 grid h-9 w-9 place-items-center rounded-lg bg-black/75 text-white"><Trash2 size={14} /></button><p className="truncate p-2 text-xs">{image.file.name}{image.optimized ? ' · Optimized' : ''}</p></div>)}</div>}
        </div>
      </section>

      <section className="grid gap-6 p-5 sm:p-7 lg:grid-cols-[250px_1fr]">
        <StepHeading number="02" title="Details" />
        <div className="grid gap-4 sm:grid-cols-2"><div className="sm:col-span-2"><Label htmlFor="title">Title <span aria-hidden="true" className="text-destructive">*</span></Label><Input id="title" className="mt-1.5" value={title} onChange={(event) => { setTitle(event.target.value); if (event.target.value.trim()) setTitleError('') }} aria-invalid={Boolean(titleError)} aria-describedby={titleError ? 'title-error' : undefined} maxLength={140} placeholder="e.g. Calculus lecture 7" />{titleError && <p id="title-error" role="alert" className="mt-2 text-sm text-destructive">{titleError}</p>}</div><div><Label htmlFor="subject">Subject <span className="font-normal text-muted-foreground">(optional)</span></Label><Input id="subject" className="mt-1.5" value={subject} onChange={(event) => setSubject(event.target.value)} maxLength={100} placeholder="e.g. Mathematics" /></div><div><Label htmlFor="topic">Topic <span className="font-normal text-muted-foreground">(optional)</span></Label><Input id="topic" className="mt-1.5" value={topic} onChange={(event) => setTopic(event.target.value)} maxLength={140} placeholder="e.g. Integration by parts" /></div></div>
      </section>

      <section className="grid gap-6 p-5 sm:p-7 lg:grid-cols-[250px_1fr]">
        <StepHeading number="03" title="Reference" description="Optional · text or Markdown · 1 MB max" />
        <div><Textarea className="min-h-44 resize-y" value={referenceText} onChange={(event) => { setReferenceText(event.target.value); if (!event.target.value) setReferenceFileName('') }} placeholder="Paste reference material…" maxLength={120000} /><div className="mt-3 flex flex-wrap items-center gap-3"><label className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-lg border border-input bg-card px-3 text-sm font-semibold hover:bg-accent"><FileText size={15} /> Upload .txt or .md<input type="file" className="sr-only" accept=".txt,.md,.markdown,text/plain,text/markdown" onChange={(event) => void readReference(event.target.files?.[0])} /></label>{referenceFileName && <span className="text-xs text-muted-foreground">Loaded {referenceFileName}</span>}</div>{referenceError && <p role="alert" className="mt-3 text-sm text-destructive">{referenceError}</p>}</div>
      </section>

      <section className="grid gap-6 p-5 sm:p-7 lg:grid-cols-[250px_1fr]">
        <StepHeading number="04" title="Analyze" />
        <div className="flex justify-end"><Button size="lg" onClick={() => void start()} loading={busy} disabled={normalizing}><Sparkles /> Start analysis</Button></div>
      </section>
    </div>

    {formError && <div role="alert" className="mt-5 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">{formError}</div>}

    <Modal open={showSourceOptions} onClose={() => setShowSourceOptions(false)} size="sm">
      <Modal.Header><Modal.Title>Add note images</Modal.Title></Modal.Header>
      <Modal.Body className="grid gap-3 sm:grid-cols-2"><Button variant="outline" className="h-24 flex-col" onClick={() => inputRef.current?.click()}><Files /> Upload files</Button><Button className="h-24 flex-col" onClick={() => cameraRef.current?.click()}><Camera /> Take photo</Button></Modal.Body>
    </Modal>
  </PageShell>
}
