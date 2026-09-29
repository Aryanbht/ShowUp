'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { Bell, Search, Plus, Users, Home, LogOut, MessageSquare } from 'lucide-react'
import { useEffect, useState } from 'react'
import Avatar from '@/components/ui/Avatar'

export default function Header({ onPost, onSearch }) {
  const pathname = usePathname()
  const { data: session } = useSession()
  const [unreadCount, setUnreadCount] = useState(0)

  const [unreadChatCount, setUnreadChatCount] = useState(0)

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
    
    async function fetchUnreadChat() {
      try {
        const res = await fetch('/api/chat/unread-count')
        if (res.ok) {
          const data = await res.json()
          setUnreadChatCount(data.count)
        }
      } catch {}
    }

    if (session) {
      fetchUnread()
      fetchUnreadChat()
    }
    // Refresh every 30s
    const interval = setInterval(() => { 
      if (session) {
        fetchUnread()
        fetchUnreadChat()
      }
    }, 30000)
    // Refresh chat specifically every 15s
    const chatInterval = setInterval(() => {
      if (session) fetchUnreadChat()
    }, 15000)
    
    return () => {
      clearInterval(interval)
      clearInterval(chatInterval)
    }
  }, [session, pathname])

  const navLinks = [
    { href: '/feed', label: 'Feed', icon: Home },
    { href: '/teammates', label: 'Teammates', icon: Users },
    { href: '/messages', label: 'Messages', icon: MessageSquare, badge: unreadChatCount },
  ]

  return (
    <header className="sticky top-0 z-30 bg-white/20 backdrop-blur-md border-b border-white/40 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 md:px-6 h-14 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link href="/feed" className="flex items-center gap-1 flex-shrink-0 py-2">
          <img
            src="/logo.png"
            alt="ShowUp Logo"
            className="h-14 w-auto object-contain drop-shadow-md scale-[1.5] origin-left hover:scale-[1.6] transition-transform"
          />
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`relative flex items-center gap-1.5 px-3 py-1.5 font-grotesk font-bold text-xs uppercase tracking-wider border transition-all duration-150 rounded-md ${
                pathname.startsWith(link.href)
                  ? 'bg-white/40 border-white/60 shadow-sm text-black'
                  : 'border-transparent text-black/70 hover:bg-white/20 hover:border-white/40 hover:text-black'
              }`}
            >
              <link.icon size={14} />
              {link.label}
              {link.badge > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[9px] font-grotesk font-bold min-w-[16px] h-[16px] rounded-full flex items-center justify-center border-2 border-ink px-0.5">
                  {link.badge > 9 ? '9+' : link.badge}
                </span>
              )}
            </Link>
          ))}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          {/* Search */}
          {onSearch && (
            <button
              onClick={onSearch}
              className="bg-white/40 hover:bg-white/60 border border-white/60 text-black shadow-sm rounded-md p-2 flex items-center justify-center transition-colors"
              aria-label="Search"
            >
              <Search size={18} strokeWidth={2.5} />
            </button>
          )}

          {/* Post Button */}
          {onPost && (
            <button
              onClick={onPost}
              className="hidden md:flex bg-white/70 hover:bg-white text-black font-bold border border-white/40 rounded-md shadow-sm items-center gap-1.5 py-2 px-4 text-xs transition-colors"
              aria-label="Post project"
            >
              <Plus size={14} strokeWidth={3} />
              Post
            </button>
          )}

          {/* Notifications */}
          <Link href="/notifications" className="relative bg-white/40 hover:bg-white/60 border border-white/60 text-black shadow-sm rounded-md p-2 flex items-center justify-center transition-colors" aria-label="Notifications">
            <Bell size={18} strokeWidth={2} />
            {unreadCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[9px] font-grotesk font-bold min-w-[18px] h-[18px] rounded-full flex items-center justify-center border-2 border-ink px-0.5">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </Link>

          {/* Avatar */}
          {session?.user && (
            <div className="flex items-center gap-3 ml-2 border-l border-white/40 pl-3">
              <Link href={session.user.username ? `/profile/${session.user.username}` : '/feed'}>
                <Avatar
                  src={session.user.avatar || session.user.image}
                  name={session.user.name}
                  size="sm"
                  className="cursor-pointer hover:scale-105 shadow-sm transition-transform border border-white/40"
                />
              </Link>
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="bg-white/40 hover:bg-red-500 hover:text-white hover:border-red-600 text-red-600 border border-white/60 shadow-sm rounded-md p-2 flex items-center justify-center transition-colors"
                title="Log Out"
                aria-label="Log Out"
              >
                <LogOut size={18} strokeWidth={2.5} />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
