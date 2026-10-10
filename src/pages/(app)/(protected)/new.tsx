import { useRef, useState, type DragEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Camera, FileText, Files, ImagePlus, LockKeyhole, Sparkles, Trash2, UploadCloud, X } from 'lucide-react'
import { Eyebrow, PageShell, Panel } from '../../../components/AppShell'
import { Button, Input, Label, Textarea } from '../../../components/ui'
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
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [stage, setStage] = useState('')
  const [showSourceOptions, setShowSourceOptions] = useState(false)

  async function addFiles(files: File[]) {
    setError('')
    try {
      if (images.length + files.length > MAX_IMAGES) throw new Error(`You can upload up to ${MAX_IMAGES} images`)
      const inspected = await Promise.all(files.map(inspectImage))
      const total = [...images, ...inspected].reduce((sum, image) => sum + image.file.size, 0)
      if (total > MAX_TOTAL_IMAGE_BYTES) {
        inspected.forEach((image) => URL.revokeObjectURL(image.preview))
        throw new Error('Images exceed the 14 MB total limit')
      }
      setImages((current) => [...current, ...inspected])
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Could not add images') }
  }

  async function readReference(file?: File) {
    if (!file) return
    setError('')
    if (!/\.(txt|md|markdown)$/i.test(file.name) || file.size > MAX_REFERENCE_BYTES) {
      setError('Reference files must be plain text or Markdown and no larger than 1 MB')
      return
    }
    const text = (await file.text()).replace(/\u0000/g, '')
    setReferenceText(text)
    setReferenceFileName(file.name)
  }

  async function start() {
    if (!images.length) { setError('Add at least one handwritten note image'); return }
    if (!title.trim()) { setError('Add a title for this analysis'); return }
    setBusy(true); setError('')
    const requestId = crypto.randomUUID()
    try {
      setStage('Securing your images in this temporary session…')
      const imageFiles: ImageFile[] = images.map((image, index) => ({ key: String(index), name: image.file.name, mimeType: image.file.type as ImageFile['mimeType'], size: image.file.size, width: image.width, height: image.height }))
      setStage(referenceText.trim() ? 'Transcribing and comparing evidence…' : 'Transcribing your handwriting…')
      const result = await sessionApi.analyze({
        requestId,
        title: title.trim(), subject: subject.trim(), topic: topic.trim(),
        referenceText, referenceFileName, imageFiles,
        imageDataUrls: images.map((image) => image.dataUrl),
      })
      navigate(`/analysis/${result.recordId}`)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Analysis could not be started')
      setBusy(false); setStage('')
    }
  }

  function onDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault()
    if (!busy) void addFiles(Array.from(event.dataTransfer.files))
  }

  return <PageShell width="max-w-5xl">
    <Eyebrow>New analysis</Eyebrow><h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Bring your notes into focus.</h1><p className="mt-2 max-w-2xl text-muted-foreground">Upload clear photos or scans. A reference is optional; without one, H.A.N.D. transcribes and organizes your notes without inventing an accuracy score.</p>
    {busy ? <Panel className="mt-8 py-20 text-center"><span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-primary/10 text-primary"><Sparkles className="animate-pulse" /></span><h2 className="mt-6 text-xl font-bold">H.A.N.D. is reading your notes</h2><p className="mt-2 text-muted-foreground">{stage}</p><p className="mt-5 text-xs text-muted-foreground">Keep this page open while the vision model completes the analysis.</p></Panel> : <div className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_.9fr]">
      <div className="space-y-6">
        <Panel><div className="flex items-start justify-between gap-4"><div><h2 className="font-bold">Handwritten pages</h2><p className="mt-1 text-sm text-muted-foreground">JPG, PNG, or WebP · 4 MB each · 14 MB total · up to 6 pages</p></div><LockKeyhole size={18} className="text-primary" /></div>
          <div role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setShowSourceOptions(true) }} onDragOver={(e) => e.preventDefault()} onDrop={onDrop} onClick={() => setShowSourceOptions(true)} className="mt-5 cursor-pointer rounded-2xl border-2 border-dashed border-border bg-background/50 px-5 py-10 text-center transition hover:border-primary/50"><UploadCloud className="mx-auto text-primary" /><p className="mt-3 font-semibold">Drop note images here</p><p className="mt-1 text-sm text-muted-foreground">or click to upload files or take a photo</p></div>
          <input ref={inputRef} className="sr-only" type="file" multiple accept="image/jpeg,image/png,image/webp" onChange={(e) => { setShowSourceOptions(false); void addFiles(Array.from(e.target.files ?? [])); e.target.value = '' }} />
          <input ref={cameraRef} className="sr-only" type="file" accept="image/jpeg,image/png,image/webp" capture="environment" onChange={(e) => { setShowSourceOptions(false); void addFiles(Array.from(e.target.files ?? [])); e.target.value = '' }} />
          {images.length > 0 && <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">{images.map((image, index) => <div key={`${image.file.name}-${index}`} className="group relative overflow-hidden rounded-xl border border-border bg-background"><img src={image.preview} alt={`Preview of ${image.file.name}`} className="aspect-[4/3] w-full object-cover" /><button aria-label={`Remove ${image.file.name}`} onClick={() => { URL.revokeObjectURL(image.preview); setImages((current) => current.filter((_, i) => i !== index)) }} className="absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-full bg-black/70 text-white"><Trash2 size={14} /></button><p className="truncate p-2 text-xs">{image.file.name}</p></div>)}</div>}
        </Panel>
        <Panel><h2 className="font-bold">Reference transcript <span className="font-normal text-muted-foreground">(optional)</span></h2><p className="mt-1 text-sm text-muted-foreground">Paste lecture or source material, or upload a plain-text/Markdown file.</p><Textarea className="mt-4 min-h-52 resize-y" value={referenceText} onChange={(e) => { setReferenceText(e.target.value); if (!e.target.value) setReferenceFileName('') }} placeholder="Paste the reference material here…" maxLength={120000} /><div className="mt-3 flex flex-wrap items-center gap-3"><label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm font-semibold"><FileText size={15} /> Upload .txt or .md<input type="file" className="sr-only" accept=".txt,.md,.markdown,text/plain,text/markdown" onChange={(e) => void readReference(e.target.files?.[0])} /></label>{referenceFileName && <span className="text-xs text-muted-foreground">Loaded {referenceFileName}</span>}</div></Panel>
      </div>
      <div className="space-y-6"><Panel><h2 className="font-bold">Analysis details</h2><div className="mt-5 space-y-4"><div><Label htmlFor="title">Title</Label><Input id="title" className="mt-1.5" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={140} placeholder="e.g. Calculus lecture 7" /></div><div><Label htmlFor="subject">Subject</Label><Input id="subject" className="mt-1.5" value={subject} onChange={(e) => setSubject(e.target.value)} maxLength={100} placeholder="e.g. Mathematics" /></div><div><Label htmlFor="topic">Topic</Label><Input id="topic" className="mt-1.5" value={topic} onChange={(e) => setTopic(e.target.value)} maxLength={140} placeholder="e.g. Integration by parts" /></div></div></Panel>
        <Panel className="bg-primary text-primary-foreground"><ImagePlus /><h2 className="mt-5 text-xl font-bold">Ready when you are.</h2><p className="mt-2 text-sm leading-6 text-primary-foreground/80">The original AI output stays separate from later corrections. If you edit scored text, H.A.N.D. marks the comparison stale until you rerun it.</p><Button onClick={() => void start()} className="mt-6 w-full bg-white text-primary hover:bg-white/90" disabled={!images.length || !title.trim()}>Start analysis <Sparkles /></Button></Panel>
      </div>
    </div>}
    {error && <div role="alert" className="mt-5 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</div>}
    {showSourceOptions && <div className="fixed inset-0 z-50 grid place-items-center bg-black/55 p-4" role="dialog" aria-modal="true" aria-label="Add note images" onClick={() => setShowSourceOptions(false)}><div className="w-full max-w-sm rounded-2xl border border-border bg-card p-5 shadow-2xl" onClick={(e) => e.stopPropagation()}><div className="flex items-center justify-between"><div><h2 className="text-lg font-bold">Add note images</h2><p className="mt-1 text-sm text-muted-foreground">Choose an existing image or use your camera.</p></div><button aria-label="Close" onClick={() => setShowSourceOptions(false)} className="grid h-9 w-9 place-items-center rounded-full hover:bg-accent"><X size={17} /></button></div><div className="mt-5 grid gap-3 sm:grid-cols-2"><Button variant="outline" className="h-24 flex-col" onClick={() => inputRef.current?.click()}><Files /> Upload files</Button><Button className="h-24 flex-col" onClick={() => cameraRef.current?.click()}><Camera /> Take photo</Button></div></div></div>}
  </PageShell>
}
