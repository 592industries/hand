import { useRef, useState, type DragEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Camera, FileText, Files, Sparkles, Trash2, UploadCloud } from 'lucide-react'
import { PageHeader, PageShell, StepHeading } from '../../../components/AppShell'
import { Button, Input, Label, Modal, Textarea } from '../../../components/ui'
import { sessionApi } from '../../../lib/session'
import {
  ACCEPTED_IMAGE_TYPES,
  MAX_IMAGE_BYTES,
  MAX_IMAGES,
  MAX_REFERENCE_BYTES,
  MAX_TOTAL_IMAGE_BYTES,
  matchesImageSignature,
} from '../../../domain/validation'
import type { ImageFile } from '../../../domain/types'

type PendingImage = { file: File; preview: string; dataUrl: string; width: number; height: number }

async function inspectImage(file: File): Promise<PendingImage> {
  if (!ACCEPTED_IMAGE_TYPES.includes(file.type as typeof ACCEPTED_IMAGE_TYPES[number])) throw new Error(`${file.name}: use JPG, PNG, or WebP`)
  if (file.size > MAX_IMAGE_BYTES) throw new Error(`${file.name}: maximum size is 4 MB`)
  const head = new Uint8Array(await file.slice(0, 16).arrayBuffer())
  if (!matchesImageSignature(head, file.type)) throw new Error(`${file.name}: file contents do not match the image type`)
  const preview = URL.createObjectURL(file)
  const dimensions = await new Promise<{ width: number; height: number }>((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve({ width: image.naturalWidth, height: image.naturalHeight })
    image.onerror = () => reject(new Error(`${file.name}: the image could not be decoded`))
    image.src = preview
  })
  if (dimensions.width < 64 || dimensions.height < 64 || dimensions.width > 12_000 || dimensions.height > 12_000) {
    URL.revokeObjectURL(preview)
    throw new Error(`${file.name}: dimensions must be between 64 and 12,000 pixels`)
  }
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(new Error(`${file.name}: the image could not be read`))
    reader.readAsDataURL(file)
  })
  return { file, preview, dataUrl, ...dimensions }
}

export default function NewAnalysisPage() {
  const navigate = useNavigate()
  const inputRef = useRef<HTMLInputElement>(null)
  const cameraRef = useRef<HTMLInputElement>(null)
  const [images, setImages] = useState<PendingImage[]>([])
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
  const [stage, setStage] = useState('')
  const [showSourceOptions, setShowSourceOptions] = useState(false)

  async function addFiles(files: File[]) {
    setImageError('')
    if (!files.length) return
    try {
      if (images.length + files.length > MAX_IMAGES) throw new Error(`You can upload up to ${MAX_IMAGES} images`)
      const inspected = await Promise.all(files.map(inspectImage))
      const total = [...images, ...inspected].reduce((sum, image) => sum + image.file.size, 0)
      if (total > MAX_TOTAL_IMAGE_BYTES) {
        inspected.forEach((image) => URL.revokeObjectURL(image.preview))
        throw new Error('Images exceed the 14 MB total limit')
      }
      setImages((current) => [...current, ...inspected])
    } catch (cause) { setImageError(cause instanceof Error ? cause.message : 'Could not add images') }
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
    setImageError(images.length ? '' : 'Add at least one handwritten note image')
    setTitleError(title.trim() ? '' : 'Add a title for this analysis')
    if (!images.length || !title.trim()) return
    setBusy(true)
    setFormError('')
    try {
      setStage('Preparing your images…')
      const imageFiles: ImageFile[] = images.map((image, index) => ({ key: String(index), name: image.file.name, mimeType: image.file.type as ImageFile['mimeType'], size: image.file.size, width: image.width, height: image.height }))
      setStage(referenceText.trim() ? 'Transcribing and comparing evidence…' : 'Transcribing your handwriting…')
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
      setStage('')
    }
  }

  function onDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault()
    if (!busy) void addFiles(Array.from(event.dataTransfer.files))
  }

  if (busy) return <PageShell width="max-w-4xl"><section aria-live="polite" className="rounded-xl border border-border bg-card px-6 py-20 text-center"><span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-primary/10 text-primary"><Sparkles className="animate-pulse" /></span><h1 className="mt-6 text-2xl font-bold">Analyzing your notes</h1><p className="mt-2 text-muted-foreground">{stage}</p><p className="mt-5 text-xs text-muted-foreground">Keep this page open.</p></section></PageShell>

  return <PageShell width="max-w-5xl">
    <PageHeader eyebrow="New analysis" title="Analyze handwritten notes" description="Upload your notes. Add a reference if you want a comparison." />

    <div className="mt-8 divide-y divide-border overflow-hidden rounded-xl border border-border bg-card">
      <section className="grid gap-6 p-5 sm:p-7 lg:grid-cols-[250px_1fr]">
        <StepHeading number="01" title="Pages" description="JPG, PNG, or WebP · 4 MB each · 14 MB total · up to 6" />
        <div>
          <div role="button" tabIndex={0} aria-label="Drop note images here; upload files or take a photo" onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); setShowSourceOptions(true) } }} onDragOver={(event) => event.preventDefault()} onDrop={onDrop} onClick={() => setShowSourceOptions(true)} className="cursor-pointer rounded-xl border border-dashed border-input bg-background/55 px-5 py-9 text-center transition-colors hover:border-primary"><UploadCloud className="mx-auto text-primary" /><p className="mt-3 font-semibold">Drop note images here</p><p className="mt-1 text-sm text-muted-foreground">Upload files or take a photo</p></div>
          <input ref={inputRef} className="sr-only" type="file" multiple accept="image/jpeg,image/png,image/webp" onChange={(event) => { setShowSourceOptions(false); void addFiles(Array.from(event.target.files ?? [])); event.target.value = '' }} />
          <input ref={cameraRef} className="sr-only" type="file" accept="image/jpeg,image/png,image/webp" capture="environment" onChange={(event) => { setShowSourceOptions(false); void addFiles(Array.from(event.target.files ?? [])); event.target.value = '' }} />
          {imageError && <p role="alert" className="mt-3 text-sm text-destructive">{imageError}</p>}
          {images.length > 0 && <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">{images.map((image, index) => <div key={`${image.file.name}-${index}`} className="group relative overflow-hidden rounded-lg border border-border bg-background"><img src={image.preview} alt={`Preview of ${image.file.name}`} className="aspect-[4/3] w-full object-cover" /><button aria-label={`Remove ${image.file.name}`} onClick={() => { URL.revokeObjectURL(image.preview); setImages((current) => current.filter((_, itemIndex) => itemIndex !== index)) }} className="absolute right-2 top-2 grid h-9 w-9 place-items-center rounded-lg bg-black/75 text-white"><Trash2 size={14} /></button><p className="truncate p-2 text-xs">{image.file.name}</p></div>)}</div>}
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
        <div className="flex justify-end"><Button size="lg" onClick={() => void start()}><Sparkles /> Start analysis</Button></div>
      </section>
    </div>

    {formError && <div role="alert" className="mt-5 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">{formError}</div>}

    <Modal open={showSourceOptions} onClose={() => setShowSourceOptions(false)} size="sm">
      <Modal.Header><Modal.Title>Add note images</Modal.Title></Modal.Header>
      <Modal.Body className="grid gap-3 sm:grid-cols-2"><Button variant="outline" className="h-24 flex-col" onClick={() => inputRef.current?.click()}><Files /> Upload files</Button><Button className="h-24 flex-col" onClick={() => cameraRef.current?.click()}><Camera /> Take photo</Button></Modal.Body>
    </Modal>
  </PageShell>
}
