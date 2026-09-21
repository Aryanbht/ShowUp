'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { X, Heart, ExternalLink, Send } from 'lucide-react'
import Avatar from '@/components/ui/Avatar'
import { SkillPill } from '@/components/ui/SkillPill'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import toast from 'react-hot-toast'

export default function ProjectModal({ project, onClose, onLike }) {
  const { data: session } = useSession()
  const [fullProject, setFullProject] = useState(null)
  const [loading, setLoading] = useState(true)
  const [liked, setLiked] = useState(project?.liked)
  const [likeCount, setLikeCount] = useState(project?._count?.likes || 0)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [liking, setLiking] = useState(false)
  const commentInputRef = useRef(null)
  const overlayRef = useRef(null)

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/project/${project.id}`)
        if (res.ok) {
          const data = await res.json()
          setFullProject(data)
          setLiked(data.liked)
          setLikeCount(data._count?.likes || 0)
        }
      } catch {}
      setLoading(false)
    }
    load()

    // Trap focus / prevent body scroll
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [project.id])

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [onClose])

  const handleLike = async () => {
    if (liking) return
    setLiking(true)
    const wasLiked = liked
    setLiked(!wasLiked)
    setLikeCount((c) => (wasLiked ? c - 1 : c + 1))
    try {
      const res = await fetch(`/api/project/${project.id}/like`, { method: 'POST' })
      if (!res.ok) {
        setLiked(wasLiked)
        setLikeCount((c) => (wasLiked ? c + 1 : c - 1))
      } else if (onLike) {
        onLike(project.id, !wasLiked)
      }
    } catch {
      setLiked(wasLiked)
      setLikeCount((c) => (wasLiked ? c + 1 : c - 1))
    } finally {
      setLiking(false)
    }
  }

  const handleComment = async (e) => {
    e.preventDefault()
    if (!comment.trim() || submitting) return
    setSubmitting(true)
    try {
      const res = await fetch(`/api/project/${project.id}/comment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: comment }),
      })
      if (res.ok) {
        const newComment = await res.json()
        setFullProject((prev) => ({
          ...prev,
          comments: [...(prev?.comments || []), newComment],
          _count: { ...prev?._count, comments: (prev?._count?.comments || 0) + 1 },
        }))
        setComment('')
        toast.success('Comment added!')
      }
    } catch {
      toast.error('Failed to add comment')
    }
    setSubmitting(false)
  }

  const p = fullProject || project

  return (
    <div
      className="modal-overlay"
      onClick={(e) => e.target === overlayRef.current && onClose()}
      ref={overlayRef}
      role="dialog"
      aria-modal="true"
      aria-label={`Project: ${p.title}`}
    >
      <div className="modal-content w-full max-w-2xl mx-4 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b-3 border-ink">
          <div className="flex items-center gap-3">
            <Avatar src={p.user?.avatar} name={p.user?.name} size="sm" />
            <div>
              <Link
                href={`/profile/${p.user?.username}`}
                onClick={onClose}
                className="font-grotesk font-bold text-sm text-ink hover:underline decoration-2"
              >
                {p.user?.name}
              </Link>
              {p.user?.college && (
                <p className="font-inter text-xs text-ink/50">{p.user.college}</p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="btn-icon"
            aria-label="Close"
          >
            <X size={18} strokeWidth={2.5} />
          </button>
        </div>

        {/* Cover Image */}
        <div className="relative w-full aspect-video bg-canvas border-b-3 border-ink">
          {p.coverImage ? (
            <Image src={p.coverImage} alt={p.title} fill className="object-cover" sizes="672px" />
          ) : (
            <div className="w-full h-full bg-primary flex items-center justify-center">
              <span className="font-grotesk font-bold text-ink">No Image</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-5 flex flex-col gap-4 overflow-y-auto">
          {/* Title */}
          <h1 className="font-grotesk font-extrabold text-2xl text-ink leading-tight">
            {p.title}
          </h1>

          {/* Description */}
          <p className="font-inter text-sm text-ink/80 leading-relaxed whitespace-pre-wrap">
            {p.description}
          </p>

          {/* Tech Stack */}
          {p.techStack?.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {p.techStack.map((tech) => (
                <SkillPill key={tech} label={tech} />
              ))}
            </div>
          )}

          {/* Links */}
          <div className="flex flex-wrap gap-3">
            {p.projectUrl && (
              <a
                href={p.projectUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary flex items-center gap-2 text-xs py-2"
              >
                <ExternalLink size={14} /> Live Demo
              </a>
            )}
            {p.githubUrl && (
              <a
                href={p.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary flex items-center gap-2 text-xs py-2"
              >
                🐙 GitHub
              </a>
            )}
          </div>

          {/* Like */}
          <div className="flex items-center gap-2 border-t-2 border-ink/10 pt-3">
            <button
              onClick={handleLike}
              disabled={liking}
              className={`flex items-center gap-2 font-grotesk font-bold text-sm transition-all ${
                liked ? 'text-red-500' : 'text-ink/60 hover:text-red-500'
              }`}
            >
              <Heart size={18} strokeWidth={2} className={liked ? 'fill-red-500 stroke-red-500' : ''} />
              {likeCount} {likeCount === 1 ? 'like' : 'likes'}
            </button>
          </div>

          {/* Comments */}
          <div className="border-t-3 border-ink pt-4">
            <h3 className="font-grotesk font-bold text-sm uppercase tracking-wider mb-3">
              Comments ({fullProject?.comments?.length || 0})
            </h3>

            {loading ? (
              <div className="flex justify-center py-4"><LoadingSpinner /></div>
            ) : (
              <div className="flex flex-col gap-3 mb-4 max-h-48 overflow-y-auto">
                {(fullProject?.comments || []).length === 0 ? (
                  <p className="font-inter text-sm text-ink/40 italic">No comments yet. Be the first!</p>
                ) : (
                  (fullProject?.comments || []).map((c) => (
                    <div key={c.id} className="flex gap-2.5">
                      <Avatar src={c.user?.avatar} name={c.user?.name} size="xs" />
                      <div className="flex-1 bg-canvas border-2 border-ink p-2.5">
                        <p className="font-grotesk font-bold text-xs text-ink">{c.user?.name}</p>
                        <p className="font-inter text-sm text-ink/80 mt-0.5">{c.text}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Comment Input */}
            <form onSubmit={handleComment} className="flex gap-2">
              <Avatar src={session?.user?.avatar || session?.user?.image} name={session?.user?.name} size="xs" />
              <input
                ref={commentInputRef}
                type="text"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Add a comment..."
                className="input-brutal flex-1 py-2 text-sm"
                maxLength={500}
              />
              <button
                type="submit"
                disabled={!comment.trim() || submitting}
                className="btn-primary py-2 px-3"
                aria-label="Submit comment"
              >
                {submitting ? <LoadingSpinner size="sm" color="ink" /> : <Send size={14} strokeWidth={2.5} />}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
