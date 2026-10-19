'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, User } from 'lucide-react'
import MessageBubble from './MessageBubble'
import MessageInput from './MessageInput'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

// Helper for date separators
function isSameDay(date1, date2) {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  )
}

function getDateLabel(date) {
  const now = new Date()
  if (isSameDay(date, now)) return 'Today'
  
  const yesterday = new Date(now)
  yesterday.setDate(yesterday.getDate() - 1)
  if (isSameDay(date, yesterday)) return 'Yesterday'
  
  return date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function ChatWindow({ connection, currentUserId, onBack }) {
  const [conversationId, setConversationId] = useState(null)
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const messagesEndRef = useRef(null)
  const scrollContainerRef = useRef(null)

  // 1. Get or create conversation
  useEffect(() => {
    let isMounted = true
    const initConversation = async () => {
      try {
        const res = await fetch('/api/chat/conversations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: connection.id })
        })
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}))
          throw new Error(errData.error || 'Failed to get conversation')
        }
        const data = await res.json()
        if (isMounted) {
          setConversationId(data.id)
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message)
          setLoading(false)
        }
      }
    }

    if (connection.id) {
      initConversation()
    }

    return () => { isMounted = false }
  }, [connection.id])

  // 2. Fetch and poll messages
  useEffect(() => {
    if (!conversationId) return

    let isMounted = true
    let pollInterval
    let lastMessageDate = null

    const fetchMessages = async () => {
      if (typeof document !== 'undefined' && document.hidden) return

      try {
        const url = `/api/chat/conversations/${conversationId}/messages`
        const res = await fetch(url)
        if (!res.ok) throw new Error('Failed to fetch messages')
        const newMessages = await res.json()

        if (!isMounted) return

        if (Array.isArray(newMessages)) {
          setMessages(prev => {
            // Keep any in-flight temporary messages that haven't finished sending
            const tempMessages = prev.filter(m => m.id?.startsWith?.('temp-') || m.isPending || m.isFailed)
            const map = new Map()

            // Update or add messages from the server (this updates readAt!)
            newMessages.forEach(m => map.set(m.id, m))

            // Keep in-flight or failed messages
            tempMessages.forEach(m => {
              if (!map.has(m.id)) {
                map.set(m.id, m)
              }
            })

            return Array.from(map.values()).sort(
              (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
            )
          })
        }
      } catch (err) {
        console.error('Error fetching messages:', err)
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    fetchMessages()
    pollInterval = setInterval(fetchMessages, 3000)

    return () => {
      isMounted = false
      clearInterval(pollInterval)
    }
  }, [conversationId])

  // 3. Auto-scroll
  useEffect(() => {
    if (!scrollContainerRef.current || messages.length === 0) return

    const container = scrollContainerRef.current
    const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 150

    if (isNearBottom || messages.length <= 100) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages])

  // 4. Mark as read
  useEffect(() => {
    if (!conversationId || messages.length === 0) return

    const markRead = async () => {
      const hasUnread = messages.some(m => m.senderId !== currentUserId && !m.readAt)
      if (!hasUnread) return

      try {
        await fetch(`/api/chat/conversations/${conversationId}/read`, { method: 'PATCH' })
        setMessages(prev => prev.map(m =>
          m.senderId !== currentUserId && !m.readAt
            ? { ...m, readAt: new Date().toISOString() }
            : m
        ))
      } catch (err) {
        console.error('Failed to mark as read', err)
      }
    }

    const handleFocus = () => {
      if (document.hasFocus()) markRead()
    }

    handleFocus()
    window.addEventListener('focus', handleFocus)

    return () => window.removeEventListener('focus', handleFocus)
  }, [conversationId, messages, currentUserId])

  const handleSendMessage = async (content) => {
    const tempId = `temp-${Date.now()}`
    const tempMessage = {
      id: tempId,
      conversationId,
      senderId: currentUserId,
      content,
      createdAt: new Date().toISOString(),
      readAt: null,
      isPending: true,
      isFailed: false,
    }

    setMessages(prev => [...prev, tempMessage])

    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, 50)

    try {
      const res = await fetch(`/api/chat/conversations/${conversationId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content })
      })

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        throw new Error(errorData.error || `Failed to send (${res.status})`)
      }
      const savedMessage = await res.json()

      setMessages(prev => prev.map(m => m.id === tempId ? { ...savedMessage, isPending: false, isFailed: false } : m))

    } catch (err) {
      console.error('Failed to send message:', err)
      setMessages(prev => prev.map(m => m.id === tempId ? { ...m, isPending: false, isFailed: true } : m))
    }
  }

  const handleRetryMessage = async (failedMsg) => {
    setMessages(prev => prev.filter(m => m.id !== failedMsg.id))
    await handleSendMessage(failedMsg.content)
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-white relative">
      {/* Chat Header */}
      <div className="h-[72px] border-b-2 border-ink flex items-center px-4 md:px-5 bg-white z-10 flex-shrink-0 justify-between">
        <div className="flex items-center">
          {onBack && (
            <button onClick={onBack} aria-label="Go back" className="mr-4 btn-icon shadow-none">
              <ArrowLeft size={18} className="text-ink" strokeWidth={2.5} />
            </button>
          )}

          {connection.name ? (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 border-2 border-ink bg-sky-100 rounded-full overflow-hidden relative flex items-center justify-center flex-shrink-0">
                {connection.avatar ? (
                  <Image src={connection.avatar} alt={connection.name} fill className="object-cover" />
                ) : (
                  <span className="font-grotesk font-bold uppercase text-ink text-sm">{connection.name.charAt(0)}</span>
                )}
              </div>
              <div>
                <h3 className="font-grotesk font-bold text-base text-ink leading-tight tracking-tight">{connection.name}</h3>
                <p className="font-inter text-xs text-muted">@{connection.username}</p>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 border-2 border-ink/20 bg-sky-100 rounded-full animate-pulse" />
              <div className="h-4 w-24 bg-sky-200 animate-pulse rounded-md" />
            </div>
          )}
        </div>

        {/* View Profile Ghost Button */}
        {connection.username && (
          <Link href={`/profile/${connection.username}`} className="btn-ghost hidden md:flex !py-1.5 !px-3 !text-xs items-center gap-1.5">
            <User size={14} strokeWidth={2.5} /> View profile
          </Link>
        )}
      </div>

      {/* Messages Area */}
      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto px-4 py-4 bg-white"
      >
        {loading ? (
          <div className="h-full flex items-center justify-center">
            <LoadingSpinner size="md" />
          </div>
        ) : error ? (
          <div className="h-full flex items-center justify-center flex-col gap-2 p-6 text-center">
            <div className="w-12 h-12 bg-sky-100 border-2 border-ink rounded-full flex items-center justify-center mb-1">
              <span className="text-ink font-bold text-lg">💬</span>
            </div>
            <p className="text-ink font-bold font-grotesk text-base">{error}</p>
            <p className="text-xs text-muted max-w-xs">
              {error.toLowerCase().includes('connect')
                ? 'You can only message teammates once a connection request is accepted.'
                : 'Please try refreshing the page.'}
            </p>
          </div>
        ) : messages.length === 0 ? (
          <div className="h-full flex items-center justify-center flex-col gap-3 text-muted">
            <div className="w-12 h-12 bg-cream border-2 border-ink rounded-full flex items-center justify-center">
              <span className="font-grotesk font-bold text-xl text-ink">👋</span>
            </div>
            <p className="font-inter text-sm">Send a message to start chatting</p>
          </div>
        ) : (
          <div className="flex flex-col justify-end min-h-full pb-2">
            {messages.map((msg, index) => {
              const prevMsg = messages[index - 1]
              const nextMsg = messages[index + 1]
              
              const msgDate = new Date(msg.createdAt)
              const prevMsgDate = prevMsg ? new Date(prevMsg.createdAt) : null
              const nextMsgDate = nextMsg ? new Date(nextMsg.createdAt) : null

              const isTimeApart = nextMsgDate && !isNaN(nextMsgDate) && !isNaN(msgDate) && (nextMsgDate - msgDate > 5 * 60 * 1000)
              const isPrevTimeApart = prevMsgDate && !isNaN(prevMsgDate) && !isNaN(msgDate) && (msgDate - prevMsgDate > 5 * 60 * 1000)

              const isFirstInGroup = !prevMsg || prevMsg.senderId !== msg.senderId || isPrevTimeApart
              const isLastInGroup = !nextMsg || nextMsg.senderId !== msg.senderId || isTimeApart
              const showTimestamp = isLastInGroup

              // Date separator logic
              const showDateSeparator = !prevMsgDate || !isSameDay(msgDate, prevMsgDate)

              return (
                <div key={msg.id}>
                  {showDateSeparator && (
                    <div className="flex justify-center my-6">
                      <span className="bg-sky-50 border-2 border-ink/10 rounded-full px-3 py-1 font-inter font-bold text-[10px] text-muted uppercase tracking-wider">
                        {getDateLabel(msgDate)}
                      </span>
                    </div>
                  )}
                  <MessageBubble
                    message={msg}
                    isMine={msg.senderId === currentUserId}
                    isFirstInGroup={isFirstInGroup}
                    showTimestamp={showTimestamp}
                    onRetry={handleRetryMessage}
                  />
                </div>
              )
            })}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input */}
      {conversationId && !loading && !error && (
        <MessageInput onSend={handleSendMessage} />
      )}
    </div>
  )
}
