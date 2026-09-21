'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Check, X, Bell, BellOff } from 'lucide-react'
import Header from '@/components/layout/Header'
import MobileNav from '@/components/layout/MobileNav'
import Avatar from '@/components/ui/Avatar'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import EmptyState from '@/components/ui/EmptyState'
import toast from 'react-hot-toast'

const TYPE_ICONS = {
  CONNECTION_REQUEST: '🤝',
  CONNECTION_ACCEPTED: '✅',
  PROJECT_LIKE: '❤️',
  PROJECT_COMMENT: '💬',
}

function NotificationItem({ notification, onAction, onRead }) {
  const [acting, setActing] = useState(false)

  const handleAction = async (action) => {
    if (!notification.connectionData?.id) return
    setActing(true)
    try {
      const res = await fetch(`/api/connection/${notification.connectionData.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      })
      if (res.ok) {
        onAction(notification.id, action)
        toast.success(action === 'accept' ? 'Connection accepted!' : 'Connection declined')
      }
    } catch {
      toast.error('Something went wrong')
    }
    setActing(false)
  }

  const timeAgo = (date) => {
    const now = new Date()
    const diff = now - new Date(date)
    const mins = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)
    if (mins < 1) return 'just now'
    if (mins < 60) return `${mins}m ago`
    if (hours < 24) return `${hours}h ago`
    return `${days}d ago`
  }

  return (
    <div
      className={`flex items-start gap-4 p-4 border-b-2 border-ink/10 last:border-0 transition-colors ${
        !notification.read ? 'bg-cream' : 'bg-surface'
      }`}
      onClick={() => !notification.read && onRead(notification.id)}
    >
      {/* Dot indicator */}
      <div className="relative flex-shrink-0 mt-1">
        <span className="text-xl">{TYPE_ICONS[notification.type] || '🔔'}</span>
        {!notification.read && (
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-primary border-2 border-ink rounded-full" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className="font-inter text-sm text-ink">{notification.message}</p>
        <p className="font-inter text-xs text-ink/40 mt-1">{timeAgo(notification.createdAt)}</p>

        {/* Accept/Decline for connection requests */}
        {notification.type === 'CONNECTION_REQUEST' && notification.connectionData && (
          <div className="flex gap-2 mt-3">
            <button
              onClick={(e) => { e.stopPropagation(); handleAction('accept') }}
              disabled={acting}
              className="btn-primary flex items-center gap-1.5 text-xs py-1.5 px-3"
            >
              {acting ? <LoadingSpinner size="sm" color="ink" /> : <Check size={12} strokeWidth={3} />}
              Accept
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); handleAction('decline') }}
              disabled={acting}
              className="btn-destructive flex items-center gap-1.5 text-xs py-1.5 px-3"
            >
              <X size={12} strokeWidth={3} /> Decline
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default function NotificationsPage() {
  const { data: session } = useSession()
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [markingRead, setMarkingRead] = useState(false)

  useEffect(() => {
    async function fetchNotifications() {
      try {
        const res = await fetch('/api/notifications')
        if (res.ok) setNotifications(await res.json())
      } catch {}
      setLoading(false)
    }
    fetchNotifications()
  }, [])

  const unreadCount = notifications.filter((n) => !n.read).length

  const handleMarkAllRead = async () => {
    setMarkingRead(true)
    try {
      await fetch('/api/notifications/read', { method: 'PATCH' })
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
      toast.success('All notifications marked as read')
    } catch {
      toast.error('Failed to mark as read')
    }
    setMarkingRead(false)
  }

  const handleRead = (id) => {
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n))
  }

  const handleAction = (notifId, action) => {
    setNotifications((prev) => prev.filter((n) => n.id !== notifId))
  }

  return (
    <>
      <Header />
      <main className="max-w-2xl mx-auto px-4 md:px-6 py-6 pb-24 md:pb-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 border-b-3 border-ink pb-4">
          <div>
            <h1 className="font-grotesk font-extrabold text-2xl text-ink">Notifications</h1>
            {unreadCount > 0 && (
              <p className="font-inter text-sm text-ink/50 mt-0.5">{unreadCount} unread</p>
            )}
          </div>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              disabled={markingRead}
              className="btn-secondary flex items-center gap-2 text-xs"
            >
              {markingRead ? <LoadingSpinner size="sm" /> : <BellOff size={13} />}
              Mark all read
            </button>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center py-32"><LoadingSpinner size="lg" /></div>
        ) : notifications.length === 0 ? (
          <EmptyState
            icon="🔔"
            title="No notifications yet"
            description="When someone likes your project or wants to connect, you'll see it here."
          />
        ) : (
          <div className="bg-surface border-3 border-ink shadow-brutal overflow-hidden">
            {notifications.map((n) => (
              <NotificationItem
                key={n.id}
                notification={n}
                onAction={handleAction}
                onRead={handleRead}
              />
            ))}
          </div>
        )}
      </main>
      <MobileNav />
    </>
  )
}
