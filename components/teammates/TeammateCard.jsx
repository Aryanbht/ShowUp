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
    <article className="bg-white/30 backdrop-blur-md border border-white/40 shadow-sm rounded-xl p-5 flex flex-col gap-4 animate-fade-in hover:bg-white/40 transition-colors">
      {/* Header */}
      <div className="flex items-start gap-3">
        <Link href={`/profile/${user.username}`}>
          <Avatar src={user.avatar} name={user.name} size="md" className="cursor-pointer hover:scale-105 transition-all shadow-sm" />
        </Link>
        <div className="flex-1 min-w-0">
          <Link href={`/profile/${user.username}`} className="font-grotesk font-bold text-base text-black hover:underline decoration-2 truncate block">
            {user.name}
          </Link>
          {user.college && (
            <p className="font-inter text-xs text-black/60 truncate">{user.college}</p>
          )}
          <div className="flex items-center gap-2 mt-1">
            {user.branch && (
              <span className="font-grotesk font-bold text-xs text-black/70">{user.branch}</span>
            )}
            {user.year && (
              <>
                <span className="text-black/30">·</span>
                <span className="font-grotesk font-bold text-xs text-black/70">{YEAR_LABELS[user.year] || user.year}</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Teaming Badge */}
      <div className="bg-white/50 border border-white/60 text-black rounded-md px-2 py-1 font-bold inline-flex items-center gap-1 self-start text-xs shadow-sm">
        🔍 Open to Teaming
      </div>

      {/* Skills */}
      {topSkills.length > 0 && (
        <div>
          <p className="font-grotesk font-bold text-xs uppercase tracking-wider text-black/60 mb-2">Skills</p>
          <div className="flex flex-wrap gap-1.5">
            {topSkills.map((skill) => <SkillPill key={skill} label={skill} />)}
            {(user.skills?.length || 0) > 3 && (
              <span className="bg-white/40 border border-white/60 text-black/80 text-xs px-2 py-1 rounded-full font-bold">+{user.skills.length - 3}</span>
            )}
          </div>
        </div>
      )}

      {/* Hackathon Interests */}
      {topInterests.length > 0 && (
        <div>
          <p className="font-grotesk font-bold text-xs uppercase tracking-wider text-black/60 mb-2">Interests</p>
          <div className="flex flex-wrap gap-1.5">
            {topInterests.map((interest) => (
              <span key={interest} className="bg-white/60 border border-white/80 text-black text-xs px-2 py-1 rounded-full font-bold">{interest}</span>
            ))}
          </div>
        </div>
      )}

      {/* Connect Button */}
      <div className="pt-2 border-t border-black/10">
        <ConnectionButton targetUserId={user.id} />
      </div>
    </article>
  )
}
