'use client'

import Image from 'next/image'
import { Heart, MessageCircle, Share2 } from 'lucide-react'
import Avatar from '@/components/ui/Avatar'
import { SkillPill } from '@/components/ui/SkillPill'
import { useState } from 'react'

// Simple helper to format time
function timeAgo(dateString) {
  if (!dateString) return '2h ago'
  const date = new Date(dateString)
  const seconds = Math.floor((new Date() - date) / 1000)
  let interval = seconds / 31536000
  if (interval > 1) return Math.floor(interval) + 'y ago'
  interval = seconds / 2592000
  if (interval > 1) return Math.floor(interval) + 'mo ago'
  interval = seconds / 86400
  if (interval > 1) return Math.floor(interval) + 'd ago'
  interval = seconds / 3600
  if (interval > 1) return Math.floor(interval) + 'h ago'
  interval = seconds / 60
  if (interval > 1) return Math.floor(interval) + 'm ago'
  return Math.floor(seconds) + 's ago'
}

export default function ProjectCard({ project, onClick, onLike }) {
  const [liked, setLiked] = useState(project.liked)
  const [likeCount, setLikeCount] = useState(project._count?.likes || 0)
  const [liking, setLiking] = useState(false)
  const [isBouncing, setIsBouncing] = useState(false)

  const visibleTech = project.techStack?.slice(0, 3) || []
  const extraTech = (project.techStack?.length || 0) - 3

  const handleLike = async (e) => {
    e.stopPropagation()
    if (liking) return
    setLiking(true)
    const wasLiked = liked
    setLiked(!wasLiked)
    setLikeCount((c) => (wasLiked ? c - 1 : c + 1))
    
    if (!wasLiked) {
      setIsBouncing(true)
      setTimeout(() => setIsBouncing(false), 300)
    }

    try {
      const res = await fetch(`/api/project/${project.id}/like`, { method: 'POST' })
      if (!res.ok) {
        setLiked(wasLiked)
        setLikeCount((c) => (wasLiked ? c + 1 : c - 1))
      } else {
        if (onLike) onLike(project.id, !wasLiked)
      }
    } catch {
      setLiked(wasLiked)
      setLikeCount((c) => (wasLiked ? c + 1 : c - 1))
    } finally {
      setLiking(false)
    }
  }

  const handleShare = (e) => {
    e.stopPropagation()
    // Mock share
    navigator.clipboard?.writeText(window.location.origin + `/project/${project.id}`)
  }

  return (
    <article
      className="bg-white border-2 border-ink rounded-2xl shadow-brutal cursor-pointer overflow-hidden flex flex-col w-full
                 transition-all duration-[120ms]
                 hover:-translate-x-[1px] hover:-translate-y-[1px] hover:shadow-brutal-lg"
      onClick={() => onClick(project)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onClick(project)}
      aria-label={`View project: ${project.title}`}
    >
      <div className="p-5 flex flex-col gap-4">
        {/* Author row */}
        <div className="flex items-center gap-3">
          <Avatar src={project.user?.avatar} name={project.user?.name} size="md" />
          <div className="flex-1 min-w-0">
            <p className="font-grotesk font-bold text-sm text-ink truncate leading-tight">
              {project.user?.name}
            </p>
            {(project.user?.college || project.user?.year) && (
              <p className="font-inter text-xs text-muted truncate">
                {project.user?.college}
                {project.user?.college && project.user?.year && ' ┬╖ '}
                {project.user?.year && `${project.user.year} Year`}
              </p>
            )}
          </div>
          <span className="font-inter text-xs text-muted whitespace-nowrap self-start">
            {timeAgo(project.createdAt)}
          </span>
        </div>

        {/* Title & Description */}
        <div>
          <h2 className="font-grotesk font-bold text-xl text-ink leading-tight tracking-tight mb-1.5">
            {project.title}
          </h2>
          {project.description && (
            <p className="font-inter text-sm text-ink line-clamp-2 leading-relaxed">
              {project.description}
            </p>
          )}
        </div>

        {/* Cover Image */}
        <div className="relative w-full aspect-video rounded-xl border-2 border-ink overflow-hidden bg-sky-100">
          {project.coverImage ? (
            <Image
              src={project.coverImage}
              alt={project.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="w-full h-full bg-sky-200 flex items-center justify-center">
              <span className="font-grotesk font-bold text-muted text-sm">No image</span>
            </div>
          )}
        </div>

        {/* Tech Stack */}
        {visibleTech.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {visibleTech.map((tech) => (
              <SkillPill key={tech} label={tech} />
            ))}
            {extraTech > 0 && (
              <span className="skill-pill">+{extraTech} more</span>
            )}
          </div>
        )}

        {/* Actions Footer */}
        <div className="flex items-center gap-6 pt-1">
          <button
            onClick={handleLike}
            className={`flex items-center gap-1.5 font-grotesk font-bold text-sm transition-colors duration-[120ms] ${
              liked ? 'text-red-500' : 'text-ink hover:text-red-500'
            }`}
            aria-label={liked ? 'Unlike' : 'Like'}
            disabled={liking}
          >
            <Heart
              size={18}
              strokeWidth={2.5}
              className={`transition-transform duration-300 ${liked ? 'fill-red-500 stroke-red-500' : ''} ${isBouncing ? 'scale-125' : 'scale-100'}`}
            />
            {likeCount}
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation()
              onClick(project)
            }}
            className="flex items-center gap-1.5 font-grotesk font-bold text-sm text-ink hover:text-accent transition-colors duration-[120ms]"
            aria-label="Comments"
          >
            <MessageCircle size={18} strokeWidth={2.5} />
            {project._count?.comments || 0}
          </button>

          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 font-grotesk font-bold text-sm text-ink hover:text-accent transition-colors duration-[120ms] ml-auto"
            aria-label="Share"
          >
            <Share2 size={18} strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </article>
  )
}
