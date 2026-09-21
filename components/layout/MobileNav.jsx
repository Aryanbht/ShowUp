'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Bell, Home, Users, Plus, User } from 'lucide-react'
import { useEffect, useState } from 'react'

export default function MobileNav({ onPost }) {
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
  }, [session, pathname])

  const navItems = [
    { href: '/feed', icon: Home, label: 'Feed' },
    { href: '/teammates', icon: Users, label: 'Team' },
    { action: onPost, icon: Plus, label: 'Post', special: true },
    { href: '/notifications', icon: Bell, label: 'Alerts', badge: unreadCount },
    { href: session?.user?.username ? `/profile/${session.user.username}` : '/feed', icon: User, label: 'Me' },
  ]

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-surface border-t-3 border-ink z-40 flex">
      {navItems.map((item, i) => {
        const isActive = item.href && pathname === item.href

        if (item.special) {
          return (
            <button
              key={i}
              onClick={item.action}
              className="flex-1 flex flex-col items-center justify-center py-2 gap-1 group"
              aria-label={item.label}
            >
              <div className="bg-primary border-3 border-ink p-2 shadow-brutal-sm group-active:shadow-brutal-none group-active:translate-x-0.5 group-active:translate-y-0.5 transition-all">
                <item.icon size={18} strokeWidth={2.5} className="text-ink" />
              </div>
            </button>
          )
        }

        return (
          <Link
            key={i}
            href={item.href}
            className={`flex-1 flex flex-col items-center justify-center py-2 gap-0.5 relative transition-colors ${
              isActive ? 'text-ink' : 'text-ink/40'
            }`}
          >
            <div className="relative">
              <item.icon size={20} strokeWidth={isActive ? 2.5 : 2} />
              {item.badge > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-grotesk font-bold w-4 h-4 rounded-full flex items-center justify-center border border-ink">
                  {item.badge > 9 ? '9+' : item.badge}
                </span>
              )}
            </div>
            <span className={`text-[9px] font-grotesk font-bold uppercase tracking-wider ${isActive ? 'text-ink' : 'text-ink/40'}`}>
              {item.label}
            </span>
            {isActive && (
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-primary" />
            )}
          </Link>
        )
      })}
    </nav>
  )
}
