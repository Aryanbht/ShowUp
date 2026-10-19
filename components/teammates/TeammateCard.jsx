'use client'

import Avatar from '@/components/ui/Avatar'
import { SkillPill } from '@/components/ui/SkillPill'
import ConnectionButton from '@/components/profile/ConnectionButton'
import Link from 'next/link'
import { Search } from 'lucide-react'

const YEAR_LABELS = { '1': '1st year', '2': '2nd year', '3': '3rd year', '4': '4th year' }

export default function TeammateCard({ user }) {
  const topSkills = user.skills?.slice(0, 4) || []
  const extraSkills = (user.skills?.length || 0) - 4
  
  // Fake bio if none provided, to show layout
  const bio = user.bio || "Passionate about building cool things. Always learning new technologies and looking for challenging hackathons."

  return (
    <article className="relative bg-white border-2 border-ink rounded-2xl shadow-brutal p-5 flex flex-col gap-4 animate-fade-in
                        transition-all duration-[120ms] w-full
                        hover:-translate-x-[1px] hover:-translate-y-[1px] hover:shadow-brutal-lg">
      
      {/* "Open to team" badge in top-right corner */}
      {user.openToTeaming !== false && (
        <div className="absolute top-4 right-4 bg-accent text-ink border-2 border-ink rounded-full px-2 py-0.5 flex items-center gap-1 shadow-brutal-sm">
          <Search size={10} strokeWidth={3} />
          <span className="font-grotesk font-bold text-[10px] tracking-wide uppercase">Open</span>
        </div>
      )}

      {/* Top: Avatar & Info */}
      <div className="flex flex-col gap-3">
        <Link href={`/profile/${user.username}`} className="w-fit">
          <Avatar src={user.avatar} name={user.name} size="lg" className="cursor-pointer hover:scale-105 transition-all duration-[120ms]" />
        </Link>
        <div>
          <Link href={`/profile/${user.username}`} className="font-grotesk font-bold text-xl text-ink hover:underline decoration-2 tracking-tight block">
            {user.name}
          </Link>
          <div className="flex flex-wrap items-center gap-1 mt-1 font-inter text-xs text-muted">
            {user.college && <span>{user.college}</span>}
            {user.college && (user.branch || user.year) && <span>·</span>}
            {user.branch && <span>{user.branch}</span>}
            {user.branch && user.year && <span>·</span>}
            {user.year && <span>{YEAR_LABELS[user.year] || user.year}</span>}
          </div>
        </div>
      </div>

      {/* Middle: Bio & Skills */}
      <div className="flex-1 flex flex-col gap-3">
        <p className="font-inter text-sm text-ink line-clamp-2 leading-relaxed">
          {bio}
        </p>

        {topSkills.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-auto">
            {topSkills.map((skill) => <SkillPill key={skill} label={skill} />)}
            {extraSkills > 0 && (
              <span className="skill-pill !text-muted">+{extraSkills}</span>
            )}
          </div>
        )}
      </div>

      {/* Bottom: Connection Button */}
      <div className="pt-3 border-t-2 border-ink/10 mt-1">
        <ConnectionButton
          targetUserId={user.id}
          initialStatus={user.connectionStatus}
          initialConnectionId={user.connectionId}
          fullWidth={true}
        />
      </div>
    </article>
  )
}
