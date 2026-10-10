'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { UserPlus, Clock, CheckCircle, Check, X, MessageCircle } from 'lucide-react'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import toast from 'react-hot-toast'
import Link from 'next/link'

export default function ConnectionButton({ targetUserId, initialStatus = null, initialConnectionId = null, fullWidth = false }) {
  const { data: session } = useSession()
  const [status, setStatus] = useState(initialStatus) // NONE, PENDING_SENT, PENDING_RECEIVED, ACCEPTED
  const [connectionId, setConnectionId] = useState(initialConnectionId)
  const [loading, setLoading] = useState(!initialStatus)
  const [acting, setActing] = useState(false)

  const widthClass = fullWidth ? 'w-full justify-center' : ''
  const containerClass = fullWidth ? 'flex gap-2 w-full' : 'flex gap-2'
  const halfWidthClass = fullWidth ? 'flex-1 justify-center' : ''

  useEffect(() => {
    if (initialStatus) {
      setStatus(initialStatus)
      setLoading(false)
      return
    }
    if (!session || !targetUserId) return
    if (session.user.id === targetUserId) { setLoading(false); return }

    async function fetchStatus() {
      try {
        const res = await fetch(`/api/connection/status?userId=${targetUserId}`)
        if (res.ok) {
          const data = await res.json()
          setStatus(data.status)
          setConnectionId(data.connection?.id || null)
        }
      } catch {}
      setLoading(false)
    }
    fetchStatus()
  }, [targetUserId, session, initialStatus])

  // Don't show button for own profile
  if (!session || session.user.id === targetUserId) return null

  const handleConnect = async () => {
    setActing(true)
    try {
      const res = await fetch('/api/connection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ toUserId: targetUserId }),
      })
      if (res.ok) {
        const data = await res.json()
        setStatus('PENDING_SENT')
        setConnectionId(data.id)
        toast.success('Connection request sent!')
      } else {
        const err = await res.json()
        toast.error(err.error || 'Failed to send request')
      }
    } catch {
      toast.error('Something went wrong')
    }
    setActing(false)
  }

  const handleAction = async (action) => {
    if (!connectionId) return
    setActing(true)
    try {
      const res = await fetch(`/api/connection/${connectionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      })
      if (res.ok) {
        if (action === 'accept') {
          setStatus('ACCEPTED')
          toast.success('Connection accepted!')
        } else {
          setStatus('NONE')
          setConnectionId(null)
          toast.success('Connection declined')
        }
      }
    } catch {
      toast.error('Something went wrong')
    }
    setActing(false)
  }

  if (loading) {
    return <div className={`btn-secondary opacity-50 flex items-center gap-2 text-sm ${widthClass}`}><LoadingSpinner size="sm" /> Loading...</div>
  }

  if (status === 'ACCEPTED') {
    return (
      <Link href={`/messages?user=${targetUserId}`} className={`btn-primary flex items-center gap-2 text-sm ${widthClass}`}>
        <MessageCircle size={16} strokeWidth={2.5} /> Message
      </Link>
    )
  }

  if (status === 'PENDING_SENT') {
    return (
      <div className={`btn-secondary flex items-center gap-2 text-sm cursor-not-allowed opacity-70 ${widthClass}`}>
        <Clock size={16} strokeWidth={2.5} /> Pending
      </div>
    )
  }

  if (status === 'PENDING_RECEIVED') {
    return (
      <div className={containerClass}>
        <button
          onClick={() => handleAction('accept')}
          disabled={acting}
          className={`btn-primary flex items-center gap-1.5 text-sm ${halfWidthClass}`}
        >
          {acting ? <LoadingSpinner size="sm" color="ink" /> : <Check size={16} strokeWidth={3} />}
          Accept
        </button>
        <button
          onClick={() => handleAction('decline')}
          disabled={acting}
          className={`btn-secondary flex items-center gap-1.5 text-sm ${halfWidthClass}`}
        >
          <X size={16} strokeWidth={3} /> Decline
        </button>
      </div>
    )
  }

  // NONE
  return (
    <button
      onClick={handleConnect}
      disabled={acting}
      className={`btn-primary flex items-center gap-2 text-sm ${widthClass}`}
    >
      {acting ? <LoadingSpinner size="sm" color="ink" /> : <UserPlus size={16} strokeWidth={2.5} />}
      Connect
    </button>
  )
}
