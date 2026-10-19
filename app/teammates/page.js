'use client'

import { useState, useEffect, useMemo, useRef } from 'react'
import useSWRInfinite from 'swr/infinite'
import Header from '@/components/layout/Header'
import MobileNav from '@/components/layout/MobileNav'
import TeammateCard from '@/components/teammates/TeammateCard'
import EmptyState from '@/components/ui/EmptyState'
import { TeammateCardSkeleton } from '@/components/ui/Skeletons'
import GlassLayout from '@/components/layout/GlassLayout'
import { Users, Search, ChevronDown } from 'lucide-react'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

const FILTERS = ['All', 'Frontend', 'Backend', 'ML', 'Design', 'Mobile', 'Looking for team']

const fetcher = (url) => fetch(url).then((res) => {
  if (!res.ok) throw new Error('Failed to fetch teammates')
  return res.json()
})

export default function TeammatesPage() {
  const [activeFilter, setActiveFilter] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const sentinelRef = useRef(null)

  // 1. Debounce search query by 300ms so keystrokes don't flood the network
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery.trim())
    }, 300)
    return () => clearTimeout(handler)
  }, [searchQuery])

  // Map chip filter to skills query param
  const filterSkills = useMemo(() => {
    if (activeFilter === 'Frontend') return 'react,vue,html,css,frontend'
    if (activeFilter === 'Backend') return 'node,python,django,backend,express,sql'
    if (activeFilter === 'ML') return 'machine learning,ml,ai,python,deep learning'
    if (activeFilter === 'Design') return 'design,ui,ux,figma'
    if (activeFilter === 'Mobile') return 'mobile,flutter,react native,android,ios'
    return ''
  }, [activeFilter])

  // 2. Cursor-based SWR Infinite key generator
  const getKey = (pageIndex, previousPageData) => {
    if (previousPageData && !previousPageData.nextCursor) return null
    const params = new URLSearchParams()
    params.set('limit', '20')
    params.set('paginate', 'true')
    if (debouncedSearch) params.set('search', debouncedSearch)
    if (filterSkills) params.set('skills', filterSkills)
    if (previousPageData?.nextCursor) params.set('cursor', previousPageData.nextCursor)
    return `/api/teammates?${params.toString()}`
  }

  // 3. SWR Infinite with memory caching and background revalidation
  const {
    data,
    size,
    setSize,
    isValidating,
    isLoading,
  } = useSWRInfinite(getKey, fetcher, {
    revalidateOnFocus: false,
    revalidateFirstPage: false,
    revalidateIfStale: true,
    keepPreviousData: true,
    dedupingInterval: 20000,
  })

  // Flatten teammates across pages
  const teammates = data
    ? data.flatMap((page) => page?.teammates || (Array.isArray(page) ? page : []))
    : []

  const lastPage = data && data.length > 0 ? data[data.length - 1] : null
  const isEmpty = data?.[0]?.teammates?.length === 0 || (Array.isArray(data?.[0]) && data[0].length === 0)
  const isReachingEnd = isEmpty || !lastPage?.nextCursor
  const isLoadingMore = isLoading || (size > 0 && data && typeof data[size - 1] === 'undefined')

  // 4. Infinite scroll intersection observer
  useEffect(() => {
    if (!sentinelRef.current || isReachingEnd || isValidating) return

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
  }, [isReachingEnd, isValidating, setSize])

  return (
    <GlassLayout>
      <Header />
      <main className="max-w-6xl mx-auto px-4 md:px-6 py-8 pb-28 md:pb-10 w-full flex-1 flex flex-col items-center">
        
        {/* Header Row */}
        <div className="w-full flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <h1 className="font-grotesk font-extrabold text-3xl text-ink tracking-tight flex-shrink-0">Find teammates</h1>
          
          {/* Search Input */}
          <div className="relative w-full md:max-w-sm">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input
              type="text"
              placeholder="Search by name or skill..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-brutal pl-9 py-2"
            />
          </div>
        </div>

        {/* Filter Chips */}
        <div className="w-full flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-hide">
          {FILTERS.map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`whitespace-nowrap px-4 py-1.5 rounded-full font-grotesk font-semibold text-sm transition-all duration-[120ms] ${
                activeFilter === filter
                  ? 'bg-ink text-white shadow-brutal-sm border-2 border-ink'
                  : 'bg-white border-2 border-ink text-ink hover:bg-sky-50'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        {/* Results */}
        <div className="w-full">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {Array(6)
                .fill(null)
                .map((_, i) => (
                  <TeammateCardSkeleton key={i} />
                ))}
            </div>
          ) : teammates.length === 0 ? (
            <div className="mt-12">
              <EmptyState
                icon={Users}
                title="No teammates found"
                description="Try adjusting your filters or search terms!"
                action={{
                  label: 'Clear filters',
                  onClick: () => {
                    setActiveFilter('All')
                    setSearchQuery('')
                  },
                }}
              />
            </div>
          ) : (
            <>
              <p className="font-inter text-sm text-muted mb-4">
                Showing {teammates.length} student{teammates.length !== 1 ? 's' : ''}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {teammates.map((user) => (
                  <TeammateCard key={user.id} user={user} />
                ))}
              </div>

              {/* Sentinel and Load More button */}
              <div ref={sentinelRef} className="py-8 flex flex-col items-center gap-3">
                {isValidating && !isReachingEnd && (
                  <div className="flex items-center gap-2">
                    <LoadingSpinner size="sm" />
                    <span className="font-grotesk font-bold text-xs text-muted">
                      Loading more teammates...
                    </span>
                  </div>
                )}
                {!isReachingEnd && !isValidating && (
                  <button
                    onClick={() => setSize((prev) => prev + 1)}
                    className="btn-ghost text-sm font-grotesk font-bold px-6 py-2 border-2 border-ink shadow-brutal-sm hover:shadow-brutal transition-all"
                  >
                    Load more teammates
                  </button>
                )}
                {isReachingEnd && teammates.length > 0 && (
                  <div className="w-full text-center py-6 border-t-2 border-ink/10 mt-4">
                    <p className="font-inter text-sm text-muted">You&apos;ve reached the end of the list.</p>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </main>
      <MobileNav />
    </GlassLayout>
  )
}
