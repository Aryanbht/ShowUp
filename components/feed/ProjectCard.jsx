'use client'

import Image from 'next/image'
import { Heart, MessageCircle } from 'lucide-react'
import Avatar from '@/components/ui/Avatar'
import { SkillPill } from '@/components/ui/SkillPill'
import { useState } from 'react'

export default function ProjectCard({ project, onClick, onLike }) {
  const [liked, setLiked] = useState(project.liked)
  const [likeCount, setLikeCount] = useState(project._count?.likes || 0)
  const [liking, setLiking] = useState(false)

  const visibleTech = project.techStack?.slice(0, 3) || []
  const extraTech = (project.techStack?.length || 0) - 3

  const handleLike = async (e) => {
    e.stopPropagation()
    if (liking) return
    setLiking(true)
    // Optimistic update
    const wasLiked = liked
    setLiked(!wasLiked)
    setLikeCount((c) => (wasLiked ? c - 1 : c + 1))

    try {
      const res = await fetch(`/api/project/${project.id}/like`, { method: 'POST' })
      if (!res.ok) {
        // Revert
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

  return (
    <article
      className="card-brutal cursor-pointer overflow-hidden flex flex-col animate-fade-in"
      onClick={() => onClick(project)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onClick(project)}
      aria-label={`View project: ${project.title}`}
    >
      {/* Cover Image */}
      <div className="relative w-full aspect-video bg-canvas border-b-3 border-ink">
        {project.coverImage ? (
          <Image
            src={project.coverImage}
            alt={project.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="w-full h-full bg-primary flex items-center justify-center">
            <span className="font-grotesk font-bold text-ink text-lg">No Image</span>
          </div>
        )}
      </div>

      {/* Card Body */}
      <div className="p-4 flex flex-col gap-3 flex-1">
        {/* Author */}
        <div className="flex items-center gap-2.5">
          <Avatar src={project.user?.avatar} name={project.user?.name} size="sm" />
          <div className="min-w-0">
            <p className="font-grotesk font-bold text-sm text-ink truncate leading-tight">
              {project.user?.name}
            </p>
            {project.user?.college && (
              <p className="font-inter text-xs text-ink/50 truncate">{project.user.college}</p>
            )}
          </div>
        </div>

        {/* Title */}
        <h2 className="font-grotesk font-bold text-base text-ink leading-tight line-clamp-2">
          {project.title}
        </h2>

        {/* Tech Stack */}
        {visibleTech.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {visibleTech.map((tech) => (
              <SkillPill key={tech} label={tech} />
            ))}
            {extraTech > 0 && (
              <span className="skill-pill text-ink/60">+{extraTech} more</span>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-4 pt-1 border-t-2 border-ink/10 mt-auto">
          <button
            onClick={handleLike}
            className={`flex items-center gap-1.5 font-grotesk font-bold text-xs uppercase tracking-wider transition-all duration-150 ${
              liked ? 'text-red-500' : 'text-ink/50 hover:text-red-500'
            }`}
            aria-label={liked ? 'Unlike' : 'Like'}
            disabled={liking}
          >
            <Heart
              size={16}
              strokeWidth={2.5}
              className={liked ? 'fill-red-500 stroke-red-500' : ''}
            />
            {likeCount}
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation()
              onClick(project)
            }}
            className="flex items-center gap-1.5 font-grotesk font-bold text-xs uppercase tracking-wider text-ink/50 hover:text-ink transition-colors"
            aria-label="Comments"
          >
            <MessageCircle size={16} strokeWidth={2.5} />
            {project._count?.comments || 0}
          </button>
        </div>
      </div>
    </article>
  )
}
