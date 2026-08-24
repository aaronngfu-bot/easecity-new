'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Plus, Trash2, Eye, EyeOff, Loader2, RefreshCw } from 'lucide-react'
import { cn } from '@/lib/utils'

interface BlogItem {
  id: string
  slug: string
  title: string
  excerpt: string | null
  published: boolean
  publishedAt: string | null
  updatedAt: string
}

interface EditorState {
  id?: string
  originalSlug?: string
  title: string
  title_zh: string
  slug: string
  excerpt: string
  excerpt_zh: string
  image: string
  content: string
  content_zh: string
  published: boolean
}

const EMPTY: EditorState = {
  title: '',
  title_zh: '',
  slug: '',
  excerpt: '',
  excerpt_zh: '',
  image: '',
  content: '',
  content_zh: '',
  published: false,
}

function slugify(s: string) {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export default function AdminBlogPage() {
  const [items, setItems] = useState<BlogItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editor, setEditor] = useState<EditorState | null>(null)
  const [editorLang, setEditorLang] = useState<'en' | 'zh'>('zh')
  const [saving, setSaving] = useState(false)
  const [saveMsg, setSaveMsg] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/blog')
      const d = await res.json()
      if (!res.ok || !d.success) throw new Error(d.error?.message || 'Failed to load')
      setItems(d.data)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const openNew = () => setEditor({ ...EMPTY })

  const openEdit = async (slug: string) => {
    setSaveMsg('')
    try {
      const res = await fetch(`/api/admin/blog/${slug}`)
      const d = await res.json()
      if (!res.ok) throw new Error('Failed to load post')
      // GET returns full post with content
      setEditor({
        id: d.data.id,
        originalSlug: d.data.slug,
        title: d.data.title,
        title_zh: d.data.title_zh ?? '',
        slug: d.data.slug,
        excerpt: d.data.excerpt ?? '',
        excerpt_zh: d.data.excerpt_zh ?? '',
        image: d.data.image ?? '',
        content: d.data.content ?? '',
        content_zh: d.data.content_zh ?? '',
        published: d.data.published,
      })
      setEditorLang('zh')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load post')
    }
  }

  const save = async () => {
    if (!editor) return
    if (!editor.title.trim() || !editor.slug.trim() || !editor.content.trim()) {
      setSaveMsg('Title, slug, and content are required')
      return
    }
    setSaving(true)
    setSaveMsg('')
    try {
      if (editor.originalSlug) {
        const res = await fetch(`/api/admin/blog/${editor.originalSlug}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: editor.title,
            title_zh: editor.title_zh,
            slug: editor.slug,
            excerpt: editor.excerpt,
            excerpt_zh: editor.excerpt_zh,
            image: editor.image,
            content: editor.content,
            content_zh: editor.content_zh,
            published: editor.published,
          }),
        })
        const d = await res.json()
        if (!res.ok || !d.success) throw new Error(d.error?.message || 'Save failed')
      } else {
        const res = await fetch('/api/admin/blog', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: editor.title,
            title_zh: editor.title_zh,
            slug: editor.slug,
            excerpt: editor.excerpt,
            excerpt_zh: editor.excerpt_zh,
            image: editor.image,
            content: editor.content,
            content_zh: editor.content_zh,
            published: editor.published,
          }),
        })
        const d = await res.json()
        if (!res.ok || !d.success) throw new Error(d.error?.message || 'Save failed')
      }
      setSaveMsg('Saved ✓')
      setEditor(null)
      load()
    } catch (e) {
      setSaveMsg(e instanceof Error ? e.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  const remove = async (slug: string) => {
    if (!confirm(`Delete "${slug}"? This cannot be undone.`)) return
    try {
      await fetch(`/api/admin/blog/${slug}`, { method: 'DELETE' })
      load()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Delete failed')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="label-mono mb-2 text-signal">ADMIN.BLOG</p>
          <h1 className="font-display text-3xl font-semibold tracking-[-0.05em] text-text-primary">Blog</h1>
          <p className="mt-1 text-sm text-text-secondary">Markdown posts shown on the public site timeline.</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={load} className="signal-secondary" aria-label="Refresh">
            <RefreshCw size={15} />
          </button>
          <button onClick={openNew} className="signal-cta">
            <Plus size={16} />
            New post
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-md border border-status-danger/25 bg-status-danger/10 p-3 text-sm text-status-danger">{error}</div>
      )}

      {editor ? (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
          className="rounded-lg border border-border bg-bg-surface p-5"
        >
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold text-text-primary">{editor.originalSlug ? 'Edit post' : 'New post'}</h2>
            <div className="flex items-center gap-3">
              {editorLang === 'zh' && (
                <span className="text-xs text-status-success">繁中</span>
              )}
              <button onClick={() => setEditor(null)} className="text-sm text-text-muted hover:text-text-primary">Cancel</button>
            </div>
          </div>

          <div className="mb-4 inline-flex rounded-md border border-border bg-bg-elevated p-0.5 text-sm">
            {(['en', 'zh'] as const).map((lang) => (
              <button
                key={lang}
                type="button"
                onClick={() => setEditorLang(lang)}
                className={`rounded px-3 py-1.5 transition-colors ${editorLang === lang ? 'bg-signal text-signal-ink' : 'text-text-muted hover:text-text-primary'}`}
              >
                {lang === 'en' ? 'EN' : '繁中'}
              </button>
            ))}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-text-secondary">
                {editorLang === 'en' ? 'Title' : '標題（繁中）'}
              </label>
              <input
                value={editorLang === 'en' ? editor.title : editor.title_zh}
                onChange={(e) => setEditor({ ...editor, ...(editorLang === 'en' ? { title: e.target.value } : { title_zh: e.target.value }) })}
                className="glass-input"
                placeholder={editorLang === 'en' ? 'Brand refresh & transparent mark' : '品牌重塑與透明標記'}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-text-secondary">Slug</label>
              <div className="flex gap-2">
                <input
                  value={editor.slug}
                  onChange={(e) => setEditor({ ...editor, slug: e.target.value })}
                  className="glass-input font-mono"
                  placeholder="brand-refresh"
                />
                <button
                  type="button"
                  onClick={() => setEditor({ ...editor, slug: slugify(editorLang === 'en' ? editor.title : editor.title_zh) })}
                  className="signal-secondary shrink-0"
                  title="Auto-generate from title"
                >
                  auto
                </button>
              </div>
            </div>
          </div>

          <div className="mt-4">
            <label className="mb-1.5 block text-sm font-medium text-text-secondary">
              {editorLang === 'en' ? 'Excerpt (optional)' : '摘要（繁中，選填）'}
            </label>
            <input
              value={editorLang === 'en' ? editor.excerpt : editor.excerpt_zh}
              onChange={(e) => setEditor({ ...editor, ...(editorLang === 'en' ? { excerpt: e.target.value } : { excerpt_zh: e.target.value }) })}
              className="glass-input"
              placeholder="One-line summary shown on the timeline"
            />
          </div>

          <div className="mt-4">
            <label className="mb-1.5 block text-sm font-medium text-text-secondary">Cover image</label>
            <div className="flex items-start gap-3">
              {editor.image && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={editor.image} alt="cover" className="h-20 w-20 shrink-0 rounded-md border border-border object-cover" />
              )}
              <div className="flex-1 space-y-2">
                <input
                  value={editor.image}
                  onChange={(e) => setEditor({ ...editor, image: e.target.value })}
                  className="glass-input"
                  placeholder="Image URL (or upload below)"
                />
                <label className="inline-flex cursor-pointer items-center gap-2 text-xs text-text-muted hover:text-signal">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={async (e) => {
                      const file = e.target.files?.[0]
                      if (!file) return
                      setSaving(true)
                      setSaveMsg('Uploading…')
                      try {
                        const buf = await file.arrayBuffer()
                        const bytes = new Uint8Array(buf)
                        let binary = ''
                        const chunk = 0x8000
                        for (let i = 0; i < bytes.length; i += chunk) {
                          const end = Math.min(i + chunk, bytes.length)
                          let part = ''
                          for (let j = i; j < end; j++) part += String.fromCharCode(bytes[j])
                          binary += part
                        }
                        const data = btoa(binary)
                        const res = await fetch('/api/admin/blog/upload', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ filename: file.name, contentType: file.type, data }),
                        })
                        const d = await res.json()
                        if (!res.ok || !d.success) throw new Error(d.error?.message || 'Upload failed')
                        setEditor((prev) => (prev ? { ...prev, image: d.data.url } : prev))
                        setSaveMsg('Uploaded ✓')
                      } catch (err) {
                        setSaveMsg(err instanceof Error ? err.message : 'Upload failed')
                      } finally {
                        setSaving(false)
                      }
                    }}
                  />
                  <span className="signal-secondary min-h-0 px-3 py-1.5 text-xs">Upload image</span>
                  Uploads to Vercel Blob storage
                </label>
              </div>
            </div>
          </div>

          <div className="mt-4">
            <label className="mb-1.5 block text-sm font-medium text-text-secondary">
              {editorLang === 'en' ? 'Content (Markdown)' : '內容（繁中，Markdown）'}
            </label>
            <textarea
              value={editorLang === 'en' ? editor.content : editor.content_zh}
              onChange={(e) => setEditor({ ...editor, ...(editorLang === 'en' ? { content: e.target.value } : { content_zh: e.target.value }) })}
              rows={14}
              className="glass-input resize-y font-mono text-sm"
              placeholder={'## What shipped\n\n- item one\n- item two\n\nDetails here…'}
            />
          </div>

          <div className="mt-4 flex items-center justify-between">
            <label className="flex cursor-pointer items-center gap-2 text-sm text-text-secondary">
              <input
                type="checkbox"
                checked={editor.published}
                onChange={(e) => setEditor({ ...editor, published: e.target.checked })}
                className="h-4 w-4 accent-[var(--signal)]"
              />
              {editor.published ? <Eye size={15} className="text-signal" /> : <EyeOff size={15} />}
              Published
            </label>
            <div className="flex items-center gap-3">
              {saveMsg && <span className={cn('text-sm', saveMsg.startsWith('Saved') ? 'text-status-success' : 'text-status-danger')}>{saveMsg}</span>}
              <button onClick={save} disabled={saving} className="signal-cta disabled:opacity-60">
                {saving ? <Loader2 size={16} className="animate-spin" /> : null}
                Save
              </button>
            </div>
          </div>
        </motion.div>
      ) : null}

      <div className="space-y-3">
        {loading ? (
          <div className="rounded-lg border border-border bg-bg-surface p-8 text-center text-sm text-text-muted">Loading…</div>
        ) : items.length === 0 ? (
          <div className="rounded-lg border border-border bg-bg-surface p-8 text-center text-sm text-text-muted">
            No posts yet. Click “New post” to write the first update.
          </div>
        ) : (
          items.map((item) => (
            <div key={item.id} className="flex items-center justify-between rounded-lg border border-border bg-bg-surface p-4">
              <button onClick={() => openEdit(item.slug)} className="flex-1 text-left">
                <div className="flex items-center gap-3">
                  <span className={cn('rounded-sm border px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.12em]', item.published ? 'bg-signal/15 text-signal border-signal/25' : 'bg-bg-elevated/50 text-text-muted border-border')}>
                    {item.published ? 'live' : 'draft'}
                  </span>
                  <h3 className="text-sm font-semibold text-text-primary">{item.title}</h3>
                </div>
                <p className="mt-1 font-mono text-xs text-text-muted">
                  /{item.slug} · updated {new Date(item.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </p>
              </button>
              <button onClick={() => remove(item.slug)} className="ml-4 p-2 text-text-muted transition-colors hover:text-status-danger" aria-label="Delete">
                <Trash2 size={16} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  )
}