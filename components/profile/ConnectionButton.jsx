'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { UserPlus, Clock, CheckCircle, Check, X } from 'lucide-react'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import toast from 'react-hot-toast'

export default function ConnectionButton({ targetUserId, initialStatus = null, initialConnectionId = null }) {
  const { data: session } = useSession()
  const [status, setStatus] = useState(initialStatus) // NONE, PENDING_SENT, PENDING_RECEIVED, ACCEPTED
  const [connectionId, setConnectionId] = useState(initialConnectionId)
  const [loading, setLoading] = useState(!initialStatus)
  const [acting, setActing] = useState(false)

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
    return <div className="btn-secondary opacity-50 flex items-center gap-2 text-xs"><LoadingSpinner size="sm" /> Loading...</div>
  }

  if (status === 'ACCEPTED') {
    return (
      <div className="btn-secondary flex items-center gap-2 text-xs cursor-default opacity-80">
        <CheckCircle size={14} className="text-green-600" /> Connected ✓
      </div>
    )
  }

  if (status === 'PENDING_SENT') {
    return (
      <div className="btn-secondary flex items-center gap-2 text-xs cursor-not-allowed opacity-70">
        <Clock size={14} /> Pending
      </div>
    )
  }

  if (status === 'PENDING_RECEIVED') {
    return (
      <div className="flex gap-2">
        <button
          onClick={() => handleAction('accept')}
          disabled={acting}
          className="btn-primary flex items-center gap-1.5 text-xs py-2 px-3"
        >
          {acting ? <LoadingSpinner size="sm" color="ink" /> : <Check size={13} strokeWidth={3} />}
          Accept
        </button>
        <button
          onClick={() => handleAction('decline')}
          disabled={acting}
          className="btn-destructive flex items-center gap-1.5 text-xs py-2 px-3"
        >
          <X size={13} strokeWidth={3} /> Decline
        </button>
      </div>
    )
  }

  // NONE
  return (
    <button
      onClick={handleConnect}
      disabled={acting}
      className="btn-primary flex items-center gap-2 text-xs"
    >
      {acting ? <LoadingSpinner size="sm" color="ink" /> : <UserPlus size={14} strokeWidth={2.5} />}
      Connect
    </button>
  )
}
