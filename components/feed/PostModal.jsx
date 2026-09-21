'use client'

import { useState, useRef, useEffect } from 'react'
import { X, Upload, ImageIcon } from 'lucide-react'
import Image from 'next/image'
import TagInput from '@/components/ui/TagInput'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import toast from 'react-hot-toast'

export default function PostModal({ onClose, onCreated }) {
  const [form, setForm] = useState({
    title: '',
    description: '',
    techStack: [],
    projectUrl: '',
    githubUrl: '',
  })
  const [coverImage, setCoverImage] = useState(null)
  const [coverPreview, setCoverPreview] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const fileInputRef = useRef(null)
  const overlayRef = useRef(null)

  const MAX_DESC = 300

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    const handleKey = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handleKey)
    return () => {
      document.body.style.overflow = ''
      document.removeEventListener('keydown', handleKey)
    }
  }, [onClose])

  const handleFileSelect = (file) => {
    if (!file) return
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file')
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image must be under 10MB')
      return
    }
    setCoverImage(file)
    setCoverPreview(URL.createObjectURL(file))
  }

  const handleDrop = (e) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) handleFileSelect(file)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!coverImage) { toast.error('Cover image is required!'); return }
    if (!form.title.trim()) { toast.error('Title is required'); return }
    if (!form.description.trim()) { toast.error('Description is required'); return }

    setSubmitting(true)

    try {
      // 1. Upload image
      setUploading(true)
      const formData = new FormData()
      formData.append('file', coverImage)
      formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET)

      const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
      const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: 'POST',
        body: formData,
      })
      if (!uploadRes.ok) throw new Error('Image upload failed')
      const uploadData = await uploadRes.json()
      const coverUrl = uploadData.secure_url
      setUploading(false)

      // 2. Create project
      const res = await fetch('/api/project', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: form.title.trim(),
          description: form.description.trim(),
          coverImage: coverUrl,
          techStack: form.techStack,
          projectUrl: form.projectUrl.trim() || undefined,
          githubUrl: form.githubUrl.trim() || undefined,
        }),
      })

      if (!res.ok) throw new Error('Failed to create project')
      const project = await res.json()

      toast.success('Project posted! 🚀')
      onCreated(project)
      onClose()
    } catch (err) {
      toast.error(err.message || 'Something went wrong')
      setUploading(false)
    }
    setSubmitting(false)
  }

  return (
    <div
      className="modal-overlay"
      onClick={(e) => e.target === overlayRef.current && onClose()}
      ref={overlayRef}
      role="dialog"
      aria-modal="true"
      aria-label="Create new project"
    >
      <div className="modal-content w-full max-w-xl mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b-3 border-ink">
          <h2 className="font-grotesk font-extrabold text-lg text-ink uppercase tracking-wide">
            Post Project
          </h2>
          <button onClick={onClose} className="btn-icon" aria-label="Close">
            <X size={18} strokeWidth={2.5} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-4">
          {/* Cover Image Upload */}
          <div>
            <label className="block font-grotesk font-bold text-xs uppercase tracking-wider mb-2">
              Cover Image <span className="text-red-500">*</span>
            </label>
            {coverPreview ? (
              <div className="relative aspect-video border-3 border-ink overflow-hidden group">
                <Image src={coverPreview} alt="Cover preview" fill className="object-cover" />
                <button
                  type="button"
                  onClick={() => { setCoverImage(null); setCoverPreview(null) }}
                  className="absolute top-2 right-2 bg-ink text-primary p-1 border-2 border-primary opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <div
                className="border-3 border-dashed border-ink bg-canvas hover:bg-cream transition-colors cursor-pointer aspect-video flex flex-col items-center justify-center gap-3"
                onClick={() => fileInputRef.current?.click()}
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
              >
                <ImageIcon size={32} className="text-ink/40" />
                <div className="text-center">
                  <p className="font-grotesk font-bold text-sm text-ink">Drop image or click to upload</p>
                  <p className="font-inter text-xs text-ink/50 mt-1">PNG, JPG, WebP · Max 10MB</p>
                </div>
                <button type="button" className="btn-secondary text-xs py-1.5 px-3">
                  <Upload size={12} className="inline mr-1" /> Browse Files
                </button>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleFileSelect(e.target.files?.[0])}
            />
          </div>

          {/* Title */}
          <div>
            <label className="block font-grotesk font-bold text-xs uppercase tracking-wider mb-2">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="What did you build?"
              className="input-brutal"
              maxLength={100}
              required
            />
          </div>

          {/* Description */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="font-grotesk font-bold text-xs uppercase tracking-wider">
                Description <span className="text-red-500">*</span>
              </label>
              <span className={`font-inter text-xs ${form.description.length >= MAX_DESC ? 'text-red-500' : 'text-ink/40'}`}>
                {form.description.length}/{MAX_DESC}
              </span>
            </div>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value.slice(0, MAX_DESC) })}
              placeholder="Describe your project — what problem does it solve?"
              className="input-brutal resize-none"
              rows={4}
              required
            />
          </div>

          {/* Tech Stack */}
          <div>
            <label className="block font-grotesk font-bold text-xs uppercase tracking-wider mb-2">
              Tech Stack
            </label>
            <TagInput
              tags={form.techStack}
              onChange={(tags) => setForm({ ...form, techStack: tags })}
              placeholder="React, Python, Firebase... (Enter to add)"
            />
          </div>

          {/* URLs */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="block font-grotesk font-bold text-xs uppercase tracking-wider mb-2">
                Live URL
              </label>
              <input
                type="url"
                value={form.projectUrl}
                onChange={(e) => setForm({ ...form, projectUrl: e.target.value })}
                placeholder="https://myproject.com"
                className="input-brutal text-sm"
              />
            </div>
            <div>
              <label className="block font-grotesk font-bold text-xs uppercase tracking-wider mb-2">
                GitHub URL
              </label>
              <input
                type="url"
                value={form.githubUrl}
                onChange={(e) => setForm({ ...form, githubUrl: e.target.value })}
                placeholder="https://github.com/..."
                className="input-brutal text-sm"
              />
            </div>
          </div>

          {/* Submit */}
          <div className="flex gap-3 pt-2 border-t-3 border-ink">
            <button type="button" onClick={onClose} className="btn-secondary flex-1 text-xs">
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || uploading || !coverImage}
              className="btn-primary flex-1 flex items-center justify-center gap-2 text-xs"
            >
              {(submitting || uploading) ? (
                <>
                  <LoadingSpinner size="sm" color="ink" />
                  {uploading ? 'Uploading...' : 'Posting...'}
                </>
              ) : (
                'Post Project 🚀'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
