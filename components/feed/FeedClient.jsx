'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import ProjectCard from './ProjectCard'
import ProjectModal from './ProjectModal'
import PostModal from './PostModal'
import Header from '@/components/layout/Header'
import MobileNav from '@/components/layout/MobileNav'
import EmptyState from '@/components/ui/EmptyState'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

export default function FeedClient() {
  const [projects, setProjects] = useState([])
  const [nextCursor, setNextCursor] = useState(null)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [selectedProject, setSelectedProject] = useState(null)
  const [showPost, setShowPost] = useState(false)
  const observerRef = useRef(null)
  const sentinelRef = useRef(null)

  const fetchFeed = useCallback(async (cursor = null) => {
    if (cursor) setLoadingMore(true)
    else setLoading(true)

    try {
      const url = `/api/project/feed?limit=10${cursor ? `&cursor=${cursor}` : ''}`
      const res = await fetch(url)
      if (!res.ok) throw new Error('Failed to fetch feed')
      const data = await res.json()

      setProjects((prev) => (cursor ? [...prev, ...data.projects] : data.projects))
      setNextCursor(data.nextCursor)
      setHasMore(!!data.nextCursor)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }, [])

  useEffect(() => {
    fetchFeed()
  }, [fetchFeed])

  // Infinite scroll observer
  useEffect(() => {
    if (!sentinelRef.current || !hasMore || loadingMore) return

    observerRef.current = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && hasMore && !loadingMore && nextCursor) {
          fetchFeed(nextCursor)
        }
      },
      { threshold: 0.1 }
    )

    observerRef.current.observe(sentinelRef.current)
    return () => observerRef.current?.disconnect()
  }, [hasMore, loadingMore, nextCursor, fetchFeed])

  const handleProjectCreated = (newProject) => {
    setProjects((prev) => [newProject, ...prev])
  }

  const handleLike = (projectId, liked) => {
    setProjects((prev) =>
      prev.map((p) =>
        p.id === projectId
          ? {
              ...p,
              liked,
              _count: { ...p._count, likes: liked ? p._count.likes + 1 : p._count.likes - 1 },
            }
          : p
      )
    )
    if (selectedProject?.id === projectId) {
      setSelectedProject((prev) => ({
        ...prev,
        liked,
        _count: { ...prev._count, likes: liked ? prev._count.likes + 1 : prev._count.likes - 1 },
      }))
    }
  }

  return (
    <>
      <Header onPost={() => setShowPost(true)} />

      <main className="max-w-4xl mx-auto px-4 md:px-6 py-6 pb-24 md:pb-6">
        {/* Page Title */}
        <div className="mb-6 border-b-3 border-ink pb-4">
          <h1 className="font-grotesk font-extrabold text-2xl text-ink">Feed</h1>
          <p className="font-inter text-sm text-ink/50 mt-1">Latest projects from the community</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-32">
            <div className="flex flex-col items-center gap-3">
              <LoadingSpinner size="lg" />
              <p className="font-grotesk font-bold text-sm text-ink/50 uppercase tracking-wider">
                Loading Feed...
              </p>
            </div>
          </div>
        ) : projects.length === 0 ? (
          <EmptyState
            icon="🚀"
            title="No projects yet"
            description="Be the first to share something amazing!"
            action={{ label: 'Post Your First Project', onClick: () => setShowPost(true) }}
          />
        ) : (
          <>
            {/* Projects Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-5">
              {projects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  onClick={setSelectedProject}
                  onLike={handleLike}
                />
              ))}
            </div>

            {/* Infinite scroll sentinel */}
            <div ref={sentinelRef} className="py-4 flex justify-center">
              {loadingMore && (
                <div className="flex items-center gap-2">
                  <LoadingSpinner size="sm" />
                  <span className="font-grotesk font-bold text-xs text-ink/50 uppercase tracking-wider">
                    Loading more...
                  </span>
                </div>
              )}
              {!hasMore && projects.length > 0 && (
                <div className="badge-status text-xs px-4 py-2">
                  You've seen it all! 🎉
                </div>
              )}
            </div>
          </>
        )}
      </main>

      {/* Mobile Nav */}
      <MobileNav onPost={() => setShowPost(true)} />

      {/* Modals */}
      {selectedProject && (
        <ProjectModal
          project={selectedProject}
          onClose={() => setSelectedProject(null)}
          onLike={handleLike}
        />
      )}
      {showPost && (
        <PostModal
          onClose={() => setShowPost(false)}
          onCreated={handleProjectCreated}
        />
      )}
    </>
  )
}
