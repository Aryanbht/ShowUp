'use client'

import { useState, useEffect } from 'react'
import Header from '@/components/layout/Header'
import MobileNav from '@/components/layout/MobileNav'
import TeammateCard from '@/components/teammates/TeammateCard'
import FilterBar from '@/components/teammates/FilterBar'
import EmptyState from '@/components/ui/EmptyState'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

export default function TeammatesPage() {
  const [teammates, setTeammates] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    branch: '',
    year: '',
    skills: [],
    interests: [],
  })

  useEffect(() => {
    async function fetchTeammates() {
      setLoading(true)
      try {
        const params = new URLSearchParams()
        if (filters.branch) params.set('branch', filters.branch)
        if (filters.year) params.set('year', filters.year)
        if (filters.skills?.length) params.set('skills', filters.skills.join(','))
        if (filters.interests?.length) params.set('interests', filters.interests.join(','))

        const res = await fetch(`/api/teammates?${params.toString()}`)
        if (res.ok) {
          const data = await res.json()
          setTeammates(data)
        }
      } catch {}
      setLoading(false)
    }
    fetchTeammates()
  }, [filters])

  return (
    <>
      <Header />
      <main className="max-w-5xl mx-auto px-4 md:px-6 py-6 pb-24 md:pb-6">
        {/* Page Header with marquee banner */}
        <div className="mb-6">
          <div className="bg-primary border-3 border-ink shadow-brutal mb-4 overflow-hidden">
            <div className="py-2.5 px-4 flex items-center gap-2 overflow-hidden">
              <div className="whitespace-nowrap animate-marquee flex gap-8 items-center font-grotesk font-extrabold text-xs uppercase tracking-widest text-ink">
                {Array(6).fill('🔍 Find Your Hackathon Team · ').map((t, i) => <span key={i}>{t}</span>)}
              </div>
            </div>
          </div>
          <h1 className="font-grotesk font-extrabold text-2xl text-ink">Find Teammates</h1>
          <p className="font-inter text-sm text-ink/50 mt-1">
            Connect with students open to hackathon teaming
          </p>
        </div>

        {/* Filters */}
        <FilterBar filters={filters} onChange={setFilters} />

        {/* Results */}
        {loading ? (
          <div className="flex items-center justify-center py-32">
            <div className="flex flex-col items-center gap-3">
              <LoadingSpinner size="lg" />
              <p className="font-grotesk font-bold text-sm text-ink/50 uppercase tracking-wider">Finding teammates...</p>
            </div>
          </div>
        ) : teammates.length === 0 ? (
          <EmptyState
            icon="🤝"
            title="No teammates found"
            description="Try adjusting your filters or check back later!"
            action={{ label: 'Clear Filters', onClick: () => setFilters({ branch: '', year: '', skills: [], interests: [] }) }}
          />
        ) : (
          <>
            <p className="font-grotesk font-bold text-xs text-ink/50 uppercase tracking-wider mb-4">
              {teammates.length} student{teammates.length !== 1 ? 's' : ''} looking for teams
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {teammates.map((user) => (
                <TeammateCard key={user.id} user={user} />
              ))}
            </div>
          </>
        )}
      </main>
      <MobileNav />
    </>
  )
}
