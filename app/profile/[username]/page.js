import { notFound } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import Image from 'next/image'
import Link from 'next/link'
import { Globe } from 'lucide-react'
import Avatar from '@/components/ui/Avatar'
import { SkillPill } from '@/components/ui/SkillPill'
import ProjectCard from '@/components/feed/ProjectCard'
import ConnectionButton from '@/components/profile/ConnectionButton'
import Header from '@/components/layout/Header'
import MobileNav from '@/components/layout/MobileNav'
import ProfileProjectGrid from '@/components/profile/ProfileProjectGrid'
import GlassLayout from '@/components/layout/GlassLayout'

export async function generateMetadata({ params }) {
  const user = await prisma.user.findUnique({
    where: { username: params.username },
    select: { name: true, college: true, bio: true },
  })
  if (!user) return { title: 'User Not Found — ShowUp' }
  return {
    title: `${user.name} — ShowUp`,
    description: user.bio || `${user.name}'s profile on ShowUp${user.college ? ` — ${user.college}` : ''}`,
  }
}

const YEAR_LABELS = { '1': '1st Year', '2': '2nd Year', '3': '3rd Year', '4': '4th Year' }

export default async function ProfilePage({ params }) {
  const session = await getServerSession(authOptions)

  const user = await prisma.user.findUnique({
    where: { username: params.username },
    include: {
      projects: {
        orderBy: { createdAt: 'desc' },
        include: {
          _count: { select: { likes: true, comments: true } },
          likes: session ? { where: { userId: session.user.id }, select: { id: true } } : false,
        },
      },
      _count: {
        select: {
          connectionsFrom: { where: { status: 'ACCEPTED' } },
          connectionsTo: { where: { status: 'ACCEPTED' } },
        },
      },
    },
  })

  if (!user) notFound()

  const connectionCount =
    (user._count?.connectionsFrom || 0) + (user._count?.connectionsTo || 0)

  const isOwnProfile = session?.user?.id === user.id

  const projectsWithLiked = user.projects.map((p) => ({
    ...p,
    liked: session ? (p.likes?.length > 0) : false,
  }))

  return (
    <GlassLayout>
      <Header />
      <main className="max-w-4xl mx-auto px-4 md:px-6 py-6 pb-24 md:pb-6 w-full flex-1">
        
        {/* Profile Container */}
        <div className="w-full bg-white/20 backdrop-blur-md rounded-2xl md:rounded-3xl p-5 sm:p-6 md:p-10 shadow-[0_20px_80px_rgba(0,0,0,0.8)] border border-white/40 flex flex-col mb-6">
          <div className="flex flex-col sm:flex-row sm:items-end gap-4 mb-5">
            {/* Avatar */}
            <Avatar
              src={user.avatar}
              name={user.name}
              size="xl"
              className="border-4 border-white/40 shadow-sm"
            />

              {/* Name + Actions */}
              <div className="flex-1 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <h1 className="font-grotesk font-extrabold text-2xl text-black">{user.name}</h1>
                  <p className="font-inter text-sm text-black/60">@{user.username}</p>
                </div>
                <div className="flex items-center gap-3">
                  {isOwnProfile ? (
                    <Link href="/onboarding" className="bg-white/40 hover:bg-white/60 text-black font-bold border border-white/60 shadow-sm text-xs px-4 py-2 rounded-md transition-colors">Edit Profile</Link>
                  ) : (
                    <ConnectionButton targetUserId={user.id} />
                  )}
                </div>
              </div>
            </div>

            {/* Info Row */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mb-3">
              {user.college && (
                <span className="font-inter text-sm text-black/70">🎓 {user.college}</span>
              )}
              {user.branch && (
                <span className="font-inter text-sm text-black/70">{user.branch}</span>
              )}
              {user.year && (
                <span className="font-inter text-sm text-black/70">{YEAR_LABELS[user.year] || user.year}</span>
              )}
              <span className="font-grotesk font-bold text-sm text-black">
                {connectionCount} {connectionCount === 1 ? 'connection' : 'connections'}
              </span>
            </div>

            {/* Bio */}
            {user.bio && (
              <p className="font-inter text-sm text-black/80 mb-4 leading-relaxed max-w-lg">{user.bio}</p>
            )}

            {/* Teaming Badge */}
            {user.lookingForTeam && (
              <div className="bg-white/50 border border-white/60 text-black rounded-md px-2 py-1 font-bold inline-flex items-center gap-1 self-start text-xs shadow-sm mb-4">
                🔍 Open to Teaming
              </div>
            )}

            {/* Skills */}
            {user.skills?.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {user.skills.map((skill) => (
                  <SkillPill key={skill} label={skill} />
                ))}
              </div>
            )}

            {/* Social Links */}
            <div className="flex gap-3">
              {user.githubUrl && (
                <a
                  href={user.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white/40 hover:bg-white/60 text-black rounded-full w-10 h-10 flex items-center justify-center text-xl shadow-sm transition-colors no-underline"
                  aria-label="GitHub"
                >
                  🐙
                </a>
              )}
              {user.linkedinUrl && (
                <a
                  href={user.linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white/40 hover:bg-white/60 text-black rounded-full w-10 h-10 flex items-center justify-center text-xl shadow-sm transition-colors no-underline"
                  aria-label="LinkedIn"
                >
                  💼
                </a>
              )}
            </div>
        </div>

        {/* Projects */}
        <div className="w-full bg-white/20 backdrop-blur-md rounded-2xl md:rounded-3xl p-5 sm:p-6 md:p-10 shadow-[0_20px_80px_rgba(0,0,0,0.8)] border border-white/40 flex flex-col">
          <div className="flex items-center justify-between mb-4 border-b border-black/20 pb-3">
            <h2 className="font-grotesk font-extrabold text-xl text-black">
              Projects <span className="text-black/50 font-bold text-lg">({user.projects.length})</span>
            </h2>
          </div>

          {user.projects.length === 0 ? (
            <div className="bg-white/30 border border-white/40 shadow-sm rounded-xl p-12 text-center">
              <p className="text-3xl mb-3">🚀</p>
              <p className="font-grotesk font-bold text-lg text-black mb-1">No projects yet</p>
              <p className="font-inter text-sm text-black/60">
                {isOwnProfile ? "You haven't shared any projects yet." : `${user.name} hasn't shared any projects yet.`}
              </p>
            </div>
          ) : (
            <ProfileProjectGrid projects={projectsWithLiked} />
          )}
        </div>
      </main>
      <MobileNav />
    </GlassLayout>
  )
}
