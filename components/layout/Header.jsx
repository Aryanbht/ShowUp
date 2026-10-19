'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { Bell, Plus, Users, Home, LogOut, MessageSquare, User, ChevronDown } from 'lucide-react'
import { useEffect, useState, useRef } from 'react'
import useSWR, { preload } from 'swr'
import Avatar from '@/components/ui/Avatar'

const badgeFetcher = (url) => fetch(url).then(r => r.ok ? r.json() : null)

export default function Header({ onPost }) {
  const pathname = usePathname()
  const router = useRouter()
  const { data: session } = useSession()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef(null)

  // Use SWR with 15s-30s intervals and automatic cross-component deduplication
  const { data: notifications } = useSWR(
    session ? '/api/notifications' : null,
    badgeFetcher,
    { refreshInterval: 30000, dedupingInterval: 10000 }
  )
  const { data: chatUnread } = useSWR(
    session ? '/api/chat/unread-count' : null,
    badgeFetcher,
    { refreshInterval: 15000, dedupingInterval: 10000 }
  )

  const unreadCount = Array.isArray(notifications) ? notifications.filter((n) => !n.read).length : 0
  const unreadChatCount = chatUnread?.count || 0

  // Prefetch route code and SWR API data on hover/focus/touch
  const handlePrefetch = (link) => {
    if (link?.href) {
      try { router.prefetch(link.href) } catch {}
    }
    if (link?.api) {
      try { preload(link.api, badgeFetcher) } catch {}
    }
  }

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const navLinks = [
    { href: '/feed',       label: 'Feed',       icon: Home,          api: '/api/project/feed?limit=10' },
    { href: '/teammates',  label: 'Teammates',  icon: Users,         api: '/api/teammates?limit=20&paginate=true' },
    { href: '/messages',   label: 'Messages',   icon: MessageSquare, badge: unreadChatCount },
  ]

  return (
    <header className="sticky top-0 z-30 bg-white border-b-2 border-ink h-16">
      <div className="max-w-6xl mx-auto px-4 md:px-6 h-full flex items-center justify-between gap-4">

        {/* ΓöÇΓöÇ Left: Logo ΓöÇΓöÇ */}
        <Link
          href="/feed"
          className="flex items-center flex-shrink-0"
          onMouseEnter={() => handlePrefetch({ href: '/feed', api: '/api/project/feed?limit=10' })}
          onFocus={() => handlePrefetch({ href: '/feed', api: '/api/project/feed?limit=10' })}
          onTouchStart={() => handlePrefetch({ href: '/feed', api: '/api/project/feed?limit=10' })}
        >
          <img
            src="/logo.png"
            alt="ShowUp"
            className="h-12 w-auto object-contain scale-[1.4] origin-left hover:scale-[1.5] transition-transform duration-[120ms]"
          />
        </Link>

        {/* Center: Nav pills */}
        <nav className="hidden md:flex items-center gap-1 absolute left-1/2 -translate-x-1/2">
          {navLinks.map((link) => {
            const active = pathname.startsWith(link.href)
            return (
              <Link
                key={link.href}
                href={link.href}
                onMouseEnter={() => handlePrefetch(link)}
                onFocus={() => handlePrefetch(link)}
                onTouchStart={() => handlePrefetch(link)}
                className={`relative flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-semibold font-grotesk border-2 transition-all duration-[120ms] ${
                  active
                    ? 'bg-accent border-ink shadow-brutal text-ink'
                    : 'border-transparent text-ink/70 hover:text-ink hover:bg-sky-100 hover:border-sky-100'
                }`}
              >
                <link.icon size={14} strokeWidth={active ? 2.5 : 2} />
                {link.label}
                {/* Unread badge */}
                {link.badge > 0 && (
                  <span className="absolute -top-1.5 -right-1 w-4 h-4 bg-violet border-2 border-white rounded-full text-white text-[8px] font-bold flex items-center justify-center">
                    {link.badge > 9 ? '9+' : link.badge}
                  </span>
                )}
              </Link>
            )
          })}
        </nav>

        {/* ΓöÇΓöÇ Right: Post + Bell + Avatar dropdown ΓöÇΓöÇ */}
        <div className="flex items-center gap-2">

          {/* Post button ΓÇö only shown if onPost is passed */}
          {session?.user && (
            <button
              onClick={onPost ? onPost : () => router.push('/feed?post=true')}
              className="flex items-center btn-primary px-2.5 py-1.5 md:px-3.5 md:py-1.5 text-xs md:text-sm gap-1"
              aria-label="Upload project"
            >
              <Plus size={14} strokeWidth={3} />
              <span>Upload</span>
            </button>
          )}

          {/* Bell */}
          <Link
            href="/notifications"
            className="btn-icon relative"
            aria-label="Notifications"
          >
            <Bell size={16} strokeWidth={2} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-violet rounded-full border-2 border-white" />
            )}
          </Link>

          {/* Avatar dropdown */}
          {session?.user && (
            <div className="relative ml-1" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen((o) => !o)}
                className="flex items-center gap-1.5 pl-1 py-0.5 rounded-full border-2 border-transparent hover:border-ink transition-all duration-[120ms]"
                aria-label="Account menu"
                aria-expanded={dropdownOpen}
              >
                <Avatar
                  src={session.user.avatar || session.user.image}
                  name={session.user.name}
                  size="sm"
                  className="cursor-pointer"
                />
                <ChevronDown
                  size={13}
                  strokeWidth={2.5}
                  className={`text-muted transition-transform duration-[120ms] ${dropdownOpen ? 'rotate-180' : ''}`}
                />
              </button>

              {/* Dropdown panel */}
              {dropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-52 bg-white border-2 border-ink rounded-2xl shadow-brutal overflow-hidden z-50 animate-fade-in">
                  {/* User info */}
                  <div className="px-4 py-3 border-b-2 border-ink/10">
                    <p className="font-grotesk font-bold text-sm text-ink truncate">{session.user.name}</p>
                    <p className="font-inter text-xs text-muted truncate">@{session.user.username || 'ΓÇö'}</p>
                  </div>

                  {/* Links */}
                  <div className="py-1">
                    <Link
                      href={session.user.username ? `/profile/${session.user.username}` : '/feed'}
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-semibold font-grotesk text-ink hover:bg-sky-50 transition-colors duration-[120ms]"
                    >
                      <User size={14} strokeWidth={2} />
                      View profile
                    </Link>
                    <button
                      onClick={() => { setDropdownOpen(false); signOut({ callbackUrl: '/' }) }}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm font-semibold font-grotesk text-red-500 hover:bg-red-50 transition-colors duration-[120ms]"
                    >
                      <LogOut size={14} strokeWidth={2} />
                      Sign out
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
