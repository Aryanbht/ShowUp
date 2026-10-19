'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Bell, Home, Users, MessageSquare, User } from 'lucide-react'
import useSWR from 'swr'

const badgeFetcher = (url) => fetch(url).then(r => r.ok ? r.json() : null)

export default function MobileNav() {
  const pathname = usePathname()
  const { data: session } = useSession()

  // SWR automatically deduplicates in-flight requests and shares cache with Header
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

  const tabs = [
    { href: '/feed',      icon: Home,          label: 'Feed' },
    { href: '/teammates', icon: Users,         label: 'Team' },
    { href: '/messages',  icon: MessageSquare, label: 'Chat',   badge: unreadChatCount },
    { href: '/notifications', icon: Bell,      label: 'Alerts', badge: unreadCount },
    {
      href: session?.user?.username ? `/profile/${session.user.username}` : '/feed',
      icon: User,
      label: 'Me',
    },
  ]

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t-2 border-ink z-40 flex safe-area-pb items-center">
      {tabs.map((tab, i) => {
        const isActive = pathname.startsWith(tab.href)

        return (
          <Link
            key={i}
            href={tab.href}
            className="flex-1 flex flex-col items-center justify-center py-2 gap-0.5 relative transition-colors duration-[120ms]"
            aria-label={tab.label}
          >
            {/* Yellow pill behind icon when active */}
            <div
              className={`relative flex items-center justify-center w-10 h-7 rounded-full transition-all duration-[120ms] ${
                isActive ? 'bg-accent border-2 border-ink shadow-brutal-sm' : ''
              }`}
            >
              <tab.icon
                size={18}
                strokeWidth={isActive ? 2.5 : 2}
                className={isActive ? 'text-ink' : 'text-muted'}
              />
              {/* Unread dot */}
              {tab.badge > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-violet rounded-full border-2 border-white" />
              )}
            </div>

            <span
              className={`text-[9px] font-grotesk font-semibold ${
                isActive ? 'text-ink' : 'text-muted'
              }`}
            >
              {tab.label}
            </span>
          </Link>
        )
      })}
    </nav>
  )
}

