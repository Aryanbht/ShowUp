'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import ProjectCard from './ProjectCard'
import ProjectModal from './ProjectModal'
import PostModal from './PostModal'
import Header from '@/components/layout/Header'
import MobileNav from '@/components/layout/MobileNav'
import EmptyState from '@/components/ui/EmptyState'
import { ProjectCardSkeleton } from '@/components/ui/Skeletons'
import GlassLayout from '@/components/layout/GlassLayout'
import { Rocket } from 'lucide-react'
import Avatar from '@/components/ui/Avatar'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import ConnectionButton from '@/components/profile/ConnectionButton'

export default function FeedClient() {
  const [projects, setProjects] = useState([])
  const [nextCursor, setNextCursor] = useState(null)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [selectedProject, setSelectedProject] = useState(null)
  const [showPost, setShowPost] = useState(false)
  const [recommendedTeammates, setRecommendedTeammates] = useState([])
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

    async function fetchRecommendedTeammates() {
      try {
        const res = await fetch('/api/teammates')
        if (res.ok) {
          const data = await res.json()
          if (data && data.length > 0) {
            const shuffled = data.sort(() => 0.5 - Math.random())
            setRecommendedTeammates(shuffled.slice(0, 2))
          }
        }
      } catch (err) {
        console.error('Failed to fetch recommended teammates', err)
      }
    }
    fetchRecommendedTeammates()
  }, [fetchFeed])

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
    <GlassLayout>
      <Header onPost={() => setShowPost(true)} />

      <main className="max-w-6xl mx-auto px-4 w-full flex-1 flex gap-8 items-start py-8 pb-28 md:pb-10">
        
        {/* Main Column */}
        <div className="flex-1 w-full max-w-2xl mx-auto lg:mx-0">
          
          {/* Page header */}
          <div className="mb-6">
            <h1 className="font-grotesk font-extrabold text-3xl text-ink tracking-tight">Feed</h1>
            <p className="font-inter text-sm text-muted mt-1">Latest projects from the community</p>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
            {['Latest', 'Trending', 'Looking for team'].map((tab, i) => (
              <button
                key={tab}
                className={`whitespace-nowrap px-4 py-1.5 rounded-full font-grotesk font-semibold text-sm transition-all duration-[120ms] ${
                  i === 0
                    ? 'bg-ink text-white shadow-brutal-sm'
                    : 'bg-white border-2 border-ink text-ink hover:bg-sky-50'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="flex flex-col gap-5">
              {Array(4).fill(null).map((_, i) => <ProjectCardSkeleton key={i} />)}
            </div>
          ) : projects.length === 0 ? (
            <EmptyState
              icon={Rocket}
              title="No projects yet"
              description="Be the first to share something amazing!"
              action={{ label: 'Post your first project', onClick: () => setShowPost(true) }}
            />
          ) : (
            <>
              {/* Projects List (1 col) */}
              <div className="flex flex-col gap-6">
                {projects.map((project) => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    onClick={setSelectedProject}
                    onLike={handleLike}
                  />
                ))}
              </div>

              {/* Infinite scroll sentinel & end state */}
              <div ref={sentinelRef} className="py-8 flex justify-center">
                {loadingMore && (
                  <div className="flex items-center gap-2">
                    <LoadingSpinner size="sm" />
                    <span className="font-grotesk font-bold text-xs text-muted">
                      Loading more...
                    </span>
                  </div>
                )}
                {!hasMore && projects.length > 0 && (
                  <div className="w-full text-center py-6 border-t-2 border-ink/10 mt-4">
                    <p className="font-inter text-sm text-muted">You're all caught up.</p>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Right Rail (lg up) */}
        <aside className="hidden lg:flex flex-col gap-6 w-80 flex-shrink-0 sticky top-24 h-fit">
          {/* Looking for teammates card */}
          <div className="bg-cream border-2 border-ink rounded-2xl p-5 shadow-brutal">
            <h3 className="font-grotesk font-bold text-lg text-ink mb-4">Looking for teammates</h3>
            <div className="flex flex-col gap-4">
              
              {recommendedTeammates.length > 0 ? (
                recommendedTeammates.map((user) => (
                  <div key={user.id} className="flex items-center gap-3">
                    <Avatar src={user.avatar} name={user.name} size="sm" />
                    <div className="flex-1 min-w-0">
                      <Link href={`/profile/${user.username}`} className="font-grotesk font-bold text-sm text-ink hover:underline decoration-2 truncate block">
                        {user.name}
                      </Link>
                      <div className="flex gap-1 mt-1">
                        {user.skills?.slice(0, 2).map((skill) => (
                          <span key={skill} className="skill-pill !text-[10px] !px-2 !py-0">{skill}</span>
                        ))}
                      </div>
                    </div>
                    <div className="w-fit flex-shrink-0">
                      <ConnectionButton targetUserId={user.id} />
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-2">
                  <p className="font-inter text-xs text-muted">No one is currently looking for a team.</p>
                </div>
              )}

            </div>
          </div>

          {/* Quick links card */}
          <div className="bg-cream border-2 border-ink rounded-2xl p-5 shadow-brutal">
            <h3 className="font-grotesk font-bold text-lg text-ink mb-3">Quick links</h3>
            <div className="flex flex-col gap-2">
              <button onClick={() => setShowPost(true)} className="text-left font-grotesk font-semibold text-sm text-ink hover:text-accent transition-colors w-fit">
                Post a project →
              </button>
              <Link href="/teammates" className="text-left font-grotesk font-semibold text-sm text-ink hover:text-accent transition-colors w-fit">
                Find teammates →
              </Link>
            </div>
          </div>
        </aside>

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
    </GlassLayout>
  )
}
