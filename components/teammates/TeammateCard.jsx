'use client'

import Avatar from '@/components/ui/Avatar'
import { SkillPill } from '@/components/ui/SkillPill'
import ConnectionButton from '@/components/profile/ConnectionButton'
import Link from 'next/link'

const YEAR_LABELS = { '1': '1st Year', '2': '2nd Year', '3': '3rd Year', '4': '4th Year' }

export default function TeammateCard({ user }) {
  const topSkills = user.skills?.slice(0, 3) || []
  const topInterests = user.hackathonInterests?.slice(0, 3) || []

  return (
    <article className="card-brutal p-5 flex flex-col gap-4 animate-fade-in">
      {/* Header */}
      <div className="flex items-start gap-3">
        <Link href={`/profile/${user.username}`}>
          <Avatar src={user.avatar} name={user.name} size="md" className="cursor-pointer hover:shadow-brutal-sm transition-all" />
        </Link>
        <div className="flex-1 min-w-0">
          <Link href={`/profile/${user.username}`} className="font-grotesk font-bold text-base text-ink hover:underline decoration-2 truncate block">
            {user.name}
          </Link>
          {user.college && (
            <p className="font-inter text-xs text-ink/50 truncate">{user.college}</p>
          )}
          <div className="flex items-center gap-2 mt-1">
            {user.branch && (
              <span className="font-grotesk font-bold text-xs text-ink/70">{user.branch}</span>
            )}
            {user.year && (
              <>
                <span className="text-ink/30">·</span>
                <span className="font-grotesk font-bold text-xs text-ink/70">{YEAR_LABELS[user.year] || user.year}</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Teaming Badge */}
      <div className="badge-teaming inline-flex items-center gap-1 self-start text-xs">
        🔍 Open to Teaming
      </div>

      {/* Skills */}
      {topSkills.length > 0 && (
        <div>
          <p className="font-grotesk font-bold text-xs uppercase tracking-wider text-ink/50 mb-2">Skills</p>
          <div className="flex flex-wrap gap-1.5">
            {topSkills.map((skill) => <SkillPill key={skill} label={skill} />)}
            {(user.skills?.length || 0) > 3 && (
              <span className="skill-pill text-ink/50">+{user.skills.length - 3}</span>
            )}
          </div>
        </div>
      )}

      {/* Hackathon Interests */}
      {topInterests.length > 0 && (
        <div>
          <p className="font-grotesk font-bold text-xs uppercase tracking-wider text-ink/50 mb-2">Interests</p>
          <div className="flex flex-wrap gap-1.5">
            {topInterests.map((interest) => (
              <span key={interest} className="skill-pill-active text-xs">{interest}</span>
            ))}
          </div>
        </div>
      )}

      {/* Connect Button */}
      <div className="pt-2 border-t-2 border-ink/10">
        <ConnectionButton targetUserId={user.id} />
      </div>
    </article>
  )
}
