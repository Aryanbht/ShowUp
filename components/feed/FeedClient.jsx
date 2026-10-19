'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import useSWR from 'swr'
import useSWRInfinite from 'swr/infinite'
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

const fetcher = (url) => fetch(url).then((res) => {
  if (!res.ok) throw new Error('Network response was not ok')
  return res.json()
})

export default function FeedClient() {
  const [selectedProject, setSelectedProject] = useState(null)
  const [showPost, setShowPost] = useState(false)
  const sentinelRef = useRef(null)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      if (params.get('post') === 'true') {
        setShowPost(true)
        window.history.replaceState({}, '', window.location.pathname)
      }
    }
  }, [])

  // 1. SWR Infinite Feed Key Generator
  const getKey = (pageIndex, previousPageData) => {
    if (previousPageData && !previousPageData.nextCursor) return null
    if (pageIndex === 0) return '/api/project/feed?limit=10'
    return `/api/project/feed?limit=10&cursor=${previousPageData.nextCursor}`
  }

  // 2. SWR Infinite Hook with caching and background revalidation
  const {
    data,
    size,
    setSize,
    isValidating,
    isLoading,
    mutate,
  } = useSWRInfinite(getKey, fetcher, {
    revalidateOnFocus: false,
    revalidateFirstPage: false,
    revalidateIfStale: true,
    keepPreviousData: true,
    dedupingInterval: 20000,
  })

  // 3. Dedicated lightweight SWR for recommended teammates
  const { data: recommendedTeammates } = useSWR(
    '/api/teammates/suggested?limit=2',
    fetcher,
    {
      revalidateOnFocus: false,
      keepPreviousData: true,
      dedupingInterval: 60000,
    }
  )

  // Flatten paginated projects
  const projects = data ? data.flatMap((page) => page?.projects || []) : []
  const isEmpty = data?.[0]?.projects?.length === 0
  const isReachingEnd = isEmpty || (data && !data[data.length - 1]?.nextCursor)
  const isLoadingMore =
    isLoading || (size > 0 && data && typeof data[size - 1] === 'undefined')

  // Infinite scroll intersection observer
  useEffect(() => {
    if (!sentinelRef.current || isReachingEnd || isLoadingMore || isValidating) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isReachingEnd && !isValidating) {
          setSize((prev) => prev + 1)
        }
      },
      { threshold: 0.1 }
    )

    observer.observe(sentinelRef.current)
    return () => observer.disconnect()
  }, [isReachingEnd, isLoadingMore, isValidating, setSize])

  // Handle new project creation: prepend to SWR cache optimistically
  const handleProjectCreated = (newProject) => {
    mutate(
      (currentPages) => {
        if (!currentPages || currentPages.length === 0) {
          return [{ projects: [newProject], nextCursor: null }]
        }
        return [
          {
            ...currentPages[0],
            projects: [newProject, ...(currentPages[0]?.projects || [])],
          },
          ...currentPages.slice(1),
        ]
      },
      { revalidate: false }
    )
  }

  // Optimistic like handling with rollback on error
  const handleLike = async (projectId, liked) => {
    // Optimistically update SWR cache
    await mutate(
      (currentPages) => {
        if (!currentPages) return currentPages
        return currentPages.map((page) => ({
          ...page,
          projects: (page.projects || []).map((p) =>
            p.id === projectId
              ? {
                  ...p,
                  liked,
                  _count: {
                    ...p._count,
                    likes: liked
                      ? (p._count?.likes || 0) + 1
                      : Math.max(0, (p._count?.likes || 0) - 1),
                  },
                }
              : p
          ),
        }))
      },
      { revalidate: false }
    )

    if (selectedProject?.id === projectId) {
      setSelectedProject((prev) => ({
        ...prev,
        liked,
        _count: {
          ...prev._count,
          likes: liked
            ? (prev._count?.likes || 0) + 1
            : Math.max(0, (prev._count?.likes || 0) - 1),
        },
      }))
    }

    try {
      const res = await fetch(`/api/project/${projectId}/like`, { method: 'POST' })
      if (!res.ok) {
        // Rollback on non-200 response
        mutate()
      }
    } catch (err) {
      // Rollback on network error
      mutate()
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

          {/* Skeletons on initial load */}
          {isLoading ? (
            <div className="flex flex-col gap-5">
              {Array(4)
                .fill(null)
                .map((_, i) => (
                  <ProjectCardSkeleton key={i} />
                ))}
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
                {projects.map((project, idx) => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    priority={idx === 0}
                    onClick={setSelectedProject}
                    onLike={handleLike}
                  />
                ))}
              </div>

              {/* Infinite scroll sentinel & end state */}
              <div ref={sentinelRef} className="py-8 flex justify-center">
                {isValidating && !isReachingEnd && (
                  <div className="flex items-center gap-2">
                    <LoadingSpinner size="sm" />
                    <span className="font-grotesk font-bold text-xs text-muted">
                      Loading more...
                    </span>
                  </div>
                )}
                {isReachingEnd && projects.length > 0 && (
                  <div className="w-full text-center py-6 border-t-2 border-ink/10 mt-4">
                    <p className="font-inter text-sm text-muted">You&apos;re all caught up.</p>
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
              
              {Array.isArray(recommendedTeammates) && recommendedTeammates.length > 0 ? (
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
                      <ConnectionButton
                        targetUserId={user.id}
                        initialStatus={user.connectionStatus}
                        initialConnectionId={user.connectionId}
                      />
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
      <MobileNav />

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
