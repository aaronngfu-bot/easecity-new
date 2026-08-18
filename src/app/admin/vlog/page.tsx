'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Plus, Trash2, Eye, EyeOff, Loader2, RefreshCw } from 'lucide-react'
import { cn } from '@/lib/utils'

interface VlogItem {
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
  slug: string
  excerpt: string
  image: string
  content: string
  published: boolean
}

const EMPTY: EditorState = {
  title: '',
  slug: '',
  excerpt: '',
  image: '',
  content: '',
  published: false,
}

function slugify(s: string) {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export default function AdminVlogPage() {
  const [items, setItems] = useState<VlogItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editor, setEditor] = useState<EditorState | null>(null)
  const [saving, setSaving] = useState(false)
  const [saveMsg, setSaveMsg] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/vlog')
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
      const res = await fetch(`/api/admin/vlog/${slug}`)
      const d = await res.json()
      if (!res.ok) throw new Error('Failed to load post')
      // GET returns full post with content
      setEditor({
        id: d.data.id,
        originalSlug: d.data.slug,
        title: d.data.title,
        slug: d.data.slug,
        excerpt: d.data.excerpt ?? '',
        image: d.data.image ?? '',
        content: d.data.content ?? '',
        published: d.data.published,
      })
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
        const res = await fetch(`/api/admin/vlog/${editor.originalSlug}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: editor.title,
            slug: editor.slug,
            excerpt: editor.excerpt,
            image: editor.image,
            content: editor.content,
            published: editor.published,
          }),
        })
        const d = await res.json()
        if (!res.ok || !d.success) throw new Error(d.error?.message || 'Save failed')
      } else {
        const res = await fetch('/api/admin/vlog', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: editor.title,
            slug: editor.slug,
            excerpt: editor.excerpt,
            image: editor.image,
            content: editor.content,
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
      await fetch(`/api/admin/vlog/${slug}`, { method: 'DELETE' })
      load()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Delete failed')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="label-mono mb-2 text-signal">ADMIN.VLOG</p>
          <h1 className="font-display text-3xl font-semibold tracking-[-0.05em] text-text-primary">Updates / VLOG</h1>
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
          className="rounded-lg border border-border bg-bg-surface p-5"
        >
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold text-text-primary">{editor.originalSlug ? 'Edit post' : 'New post'}</h2>
            <button onClick={() => setEditor(null)} className="text-sm text-text-muted hover:text-text-primary">Cancel</button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-text-secondary">Title</label>
              <input
                value={editor.title}
                onChange={(e) => setEditor({ ...editor, title: e.target.value })}
                className="glass-input"
                placeholder="Brand refresh & transparent mark"
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
                  onClick={() => setEditor({ ...editor, slug: slugify(editor.title) })}
                  className="signal-secondary shrink-0"
                  title="Auto-generate from title"
                >
                  auto
                </button>
              </div>
            </div>
          </div>

          <div className="mt-4">
            <label className="mb-1.5 block text-sm font-medium text-text-secondary">Excerpt (optional)</label>
            <input
              value={editor.excerpt}
              onChange={(e) => setEditor({ ...editor, excerpt: e.target.value })}
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
                  value={editor.image.startsWith('data:') ? '' : editor.image}
                  onChange={(e) => setEditor({ ...editor, image: e.target.value })}
                  className="glass-input"
                  placeholder="URL, or upload a file below"
                />
                <label className="inline-flex cursor-pointer items-center gap-2 text-xs text-text-muted hover:text-signal">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (!file) return
                      const reader = new FileReader()
                      reader.onload = () => {
                        if (reader.result) {
                          setEditor((prev) => (prev ? { ...prev, image: reader.result as string } : prev))
                        }
                      }
                      reader.readAsDataURL(file)
                    }}
                  />
                  <span className="signal-secondary min-h-0 px-3 py-1.5 text-xs">Upload image</span>
                  Upload from this device (stored inline)
                </label>
              </div>
            </div>
          </div>

          <div className="mt-4">
            <label className="mb-1.5 block text-sm font-medium text-text-secondary">Content (Markdown)</label>
            <textarea
              value={editor.content}
              onChange={(e) => setEditor({ ...editor, content: e.target.value })}
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