'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Bell, Search, Plus, Users, Home } from 'lucide-react'
import { useEffect, useState } from 'react'
import Avatar from '@/components/ui/Avatar'

export default function Header({ onPost, onSearch }) {
  const pathname = usePathname()
  const { data: session } = useSession()
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    async function fetchUnread() {
      try {
        const res = await fetch('/api/notifications')
        if (res.ok) {
          const data = await res.json()
          setUnreadCount(data.filter((n) => !n.read).length)
        }
      } catch {}
    }
    if (session) fetchUnread()
    // Refresh every 30s
    const interval = setInterval(() => { if (session) fetchUnread() }, 30000)
    return () => clearInterval(interval)
  }, [session, pathname])

  const navLinks = [
    { href: '/feed', label: 'Feed', icon: Home },
    { href: '/teammates', label: 'Teammates', icon: Users },
  ]

  return (
    <header className="sticky top-0 z-30 bg-surface border-b-3 border-ink shadow-brutal">
      <div className="max-w-6xl mx-auto px-4 md:px-6 h-14 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link href="/feed" className="flex items-center gap-1 flex-shrink-0">
          <span className="font-grotesk font-extrabold text-xl text-ink tracking-tight leading-none">
            Show<span className="bg-primary px-1">Up</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-1.5 px-3 py-1.5 font-grotesk font-bold text-xs uppercase tracking-wider border-2 transition-all duration-150 ${
                pathname === link.href
                  ? 'bg-primary border-ink shadow-brutal-sm -translate-x-0.5 -translate-y-0.5'
                  : 'border-transparent hover:border-ink hover:shadow-brutal-sm hover:-translate-x-0.5 hover:-translate-y-0.5'
              }`}
            >
              <link.icon size={14} />
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          {/* Search */}
          {onSearch && (
            <button
              onClick={onSearch}
              className="btn-icon"
              aria-label="Search"
            >
              <Search size={18} strokeWidth={2.5} />
            </button>
          )}

          {/* Post Button */}
          {onPost && (
            <button
              onClick={onPost}
              className="hidden md:flex btn-primary items-center gap-1.5 py-2 text-xs"
              aria-label="Post project"
            >
              <Plus size={14} strokeWidth={3} />
              Post
            </button>
          )}

          {/* Notifications */}
          <Link href="/notifications" className="relative btn-icon" aria-label="Notifications">
            <Bell size={18} strokeWidth={2} />
            {unreadCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[9px] font-grotesk font-bold min-w-[18px] h-[18px] rounded-full flex items-center justify-center border-2 border-ink px-0.5">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </Link>

          {/* Avatar */}
          {session?.user && (
            <Link href={session.user.username ? `/profile/${session.user.username}` : '/feed'}>
              <Avatar
                src={session.user.avatar || session.user.image}
                name={session.user.name}
                size="sm"
                className="cursor-pointer hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-brutal-sm transition-all"
              />
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}
