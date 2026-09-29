'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import MessageBubble from './MessageBubble'
import MessageInput from './MessageInput'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

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
        if (!res.ok) throw new Error('Failed to get conversation')
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
      try {
        const url = `/api/chat/conversations/${conversationId}/messages${lastMessageDate ? `?after=${lastMessageDate.toISOString()}` : ''}`
        const res = await fetch(url)
        if (!res.ok) throw new Error('Failed to fetch messages')
        const newMessages = await res.json()
        
        if (!isMounted) return
        
        if (newMessages.length > 0) {
          lastMessageDate = new Date(newMessages[newMessages.length - 1].createdAt)
          
          setMessages(prev => {
            const existingIds = new Set(prev.map(m => m.id))
            const filtered = newMessages.filter(m => !existingIds.has(m.id))
            return [...prev, ...filtered]
          })
        }
        setLoading(false)
      } catch (err) {
        console.error(err)
      }
    }

    // Initial fetch
    fetchMessages()

    // Poll every 3 seconds
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
    
    // Always scroll on first load or if near bottom
    if (isNearBottom || messages.length <= 100) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages])

  // 4. Mark as read
  useEffect(() => {
    if (!conversationId || messages.length === 0) return
    
    const markRead = async () => {
      // Check if there are any unread messages from the other user
      const hasUnread = messages.some(m => m.senderId !== currentUserId && !m.readAt)
      if (!hasUnread) return
      
      try {
        await fetch(`/api/chat/conversations/${conversationId}/read`, { method: 'PATCH' })
        // Optimistically update local messages
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
    
    // Run initially and on focus
    handleFocus()
    window.addEventListener('focus', handleFocus)
    
    return () => window.removeEventListener('focus', handleFocus)
  }, [conversationId, messages, currentUserId])

  const handleSendMessage = async (content) => {
    // Optimistic UI
    const tempId = `temp-${Date.now()}`
    const tempMessage = {
      id: tempId,
      conversationId,
      senderId: currentUserId,
      content,
      createdAt: new Date().toISOString(),
      readAt: null
    }
    
    setMessages(prev => [...prev, tempMessage])
    
    // Scroll to bottom immediately
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, 50)
    
    try {
      const res = await fetch(`/api/chat/conversations/${conversationId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content })
      })
      
      if (!res.ok) throw new Error('Failed to send')
      const savedMessage = await res.json()
      
      // Replace temp message with real one
      setMessages(prev => prev.map(m => m.id === tempId ? savedMessage : m))
      
    } catch (err) {
      // Rollback
      setMessages(prev => prev.filter(m => m.id !== tempId))
      throw err // will be caught by MessageInput to show toast
    }
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-transparent relative">
      {/* Header */}
      <div className="h-16 border-b border-white/40 flex items-center px-4 bg-white/20 backdrop-blur-md z-10">
        {onBack && (
          <button onClick={onBack} className="mr-3 p-1 hover:bg-black/10 rounded">
            <ArrowLeft size={20} className="text-black" />
          </button>
        )}
        
        {connection.name ? (
          <Link href={`/profile/${connection.username}`} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="w-10 h-10 border border-white/60 bg-white/40 rounded-full overflow-hidden relative flex items-center justify-center shadow-sm">
              {connection.avatar ? (
                <Image src={connection.avatar} alt={connection.name} fill className="object-cover" />
              ) : (
                <span className="font-grotesk font-bold uppercase text-black">{connection.name.charAt(0)}</span>
              )}
            </div>
            <div>
              <h3 className="font-grotesk font-bold text-base uppercase text-black leading-tight drop-shadow-sm">{connection.name}</h3>
              <p className="font-inter text-xs text-black/60">@{connection.username}</p>
            </div>
          </Link>
        ) : (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 border border-white/40 bg-white/20 rounded-full animate-pulse" />
            <div className="h-4 w-24 bg-white/20 animate-pulse rounded-md" />
          </div>
        )}
      </div>

      {/* Messages Area */}
      <div 
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto p-4 bg-transparent custom-scrollbar"
      >
        {loading ? (
          <div className="h-full flex items-center justify-center">
            <LoadingSpinner size="md" />
          </div>
        ) : error ? (
          <div className="h-full flex items-center justify-center flex-col gap-2">
            <p className="text-red-500 font-bold font-grotesk">Failed to load chat</p>
            <p className="text-xs text-black/50">{error}</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="h-full flex items-center justify-center flex-col gap-3 text-black/40">
            <div className="text-4xl opacity-50 drop-shadow-md">👋</div>
            <p className="font-inter text-sm">Send a message to start chatting</p>
          </div>
        ) : (
          <div className="flex flex-col justify-end min-h-full pb-2">
            {messages.map((msg, index) => {
              const prevMsg = messages[index - 1]
              const isFirstInGroup = !prevMsg || prevMsg.senderId !== msg.senderId
              
              // Only show "Seen" on the VERY LAST message if it's sent by me and is read
              const isLastMessage = index === messages.length - 1
              const showSeen = isLastMessage && msg.senderId === currentUserId && msg.readAt
              
              return (
                <MessageBubble 
                  key={msg.id}
                  message={msg}
                  isMine={msg.senderId === currentUserId}
                  isFirstInGroup={isFirstInGroup}
                  showSeen={showSeen}
                />
              )
            })}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Area */}
      {conversationId && !loading && !error && (
        <MessageInput onSend={handleSendMessage} />
      )}
    </div>
  )
}
