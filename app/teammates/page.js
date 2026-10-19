'use client'

import { useState, useEffect, useMemo } from 'react'
import Header from '@/components/layout/Header'
import MobileNav from '@/components/layout/MobileNav'
import TeammateCard from '@/components/teammates/TeammateCard'
import EmptyState from '@/components/ui/EmptyState'
import { TeammateCardSkeleton } from '@/components/ui/Skeletons'
import GlassLayout from '@/components/layout/GlassLayout'
import { Users, Search } from 'lucide-react'

const FILTERS = ['All', 'Frontend', 'Backend', 'ML', 'Design', 'Mobile', 'Looking for team']

export default function TeammatesPage() {
  const [teammates, setTeammates] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeFilter, setActiveFilter] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    async function fetchTeammates() {
      setLoading(true)
      try {
        // Fetch all teammates initially, we'll do client-side filtering for this demo UI update
        const res = await fetch('/api/teammates')
        if (res.ok) {
          const data = await res.json()
          setTeammates(Array.isArray(data) ? data : data.teammates || [])
        }
      } catch {}
      setLoading(false)
    }
    fetchTeammates()
  }, [])

  const filteredTeammates = useMemo(() => {
    return teammates.filter(user => {
      // 1. Text/Multi-skill search
      const tokens = searchQuery.toLowerCase().split(/[\s,]+/).filter(Boolean)
      const matchesSearch = tokens.length === 0 || tokens.every(token => 
        user.name?.toLowerCase().includes(token) ||
        user.bio?.toLowerCase().includes(token) ||
        user.skills?.some(s => s.toLowerCase().includes(token))
      )
      if (!matchesSearch) return false

      // 2. Chip filters
      if (activeFilter === 'All') return true
      if (activeFilter === 'Looking for team') return user.openToTeaming !== false // Assume true if not explicitly false for now, or match actual prop
      
      const skillMatch = user.skills?.some(s => 
        s.toLowerCase().includes(activeFilter.toLowerCase()) || 
        (activeFilter === 'ML' && s.toLowerCase().includes('machine learning')) ||
        (activeFilter === 'Frontend' && (s.toLowerCase().includes('react') || s.toLowerCase().includes('vue') || s.toLowerCase().includes('html'))) ||
        (activeFilter === 'Backend' && (s.toLowerCase().includes('node') || s.toLowerCase().includes('python') || s.toLowerCase().includes('django')))
      )
      return skillMatch
    })
  }, [teammates, searchQuery, activeFilter])

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
          {FILTERS.map(filter => (
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
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {Array(6).fill(null).map((_, i) => <TeammateCardSkeleton key={i} />)}
            </div>
          ) : filteredTeammates.length === 0 ? (
            <div className="mt-12">
              <EmptyState
                icon={Users}
                title="No teammates found"
                description="Try adjusting your filters or check back later!"
                action={{ label: 'Clear filters', onClick: () => { setActiveFilter('All'); setSearchQuery('') } }}
              />
            </div>
          ) : (
            <>
              <p className="font-inter text-sm text-muted mb-4">
                Showing {filteredTeammates.length} student{filteredTeammates.length !== 1 ? 's' : ''}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredTeammates.map((user) => (
                  <TeammateCard key={user.id} user={user} />
                ))}
              </div>
            </>
          )}
        </div>
      </main>
      <MobileNav />
    </GlassLayout>
  )
}
