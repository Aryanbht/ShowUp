'use client'

import { useState, useRef, useEffect } from 'react'
import { SendHorizontal } from 'lucide-react'
import toast from 'react-hot-toast'

export default function MessageInput({ onSend }) {
  const [content, setContent] = useState('')
  const [sending, setSending] = useState(false)
  const textareaRef = useRef(null)

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`
    }
  }, [content])

  const handleSend = async () => {
    const trimmed = content.trim()
    if (!trimmed || sending) return
    
    if (trimmed.length > 2000) {
      toast.error('Message is too long (max 2000 characters)')
      return
    }

    setSending(true)
    setContent('')
    // reset height manually immediately
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
    
    try {
      await onSend(trimmed)
    } catch (err) {
      toast.error('Failed to send message')
      setContent(trimmed) // rollback input
    } finally {
      setSending(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="p-3 border-t border-white/40 bg-white/20 backdrop-blur-md flex items-end gap-2">
      <textarea
        ref={textareaRef}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Type a message..."
        className="flex-1 bg-white/40 border border-white/60 p-2 px-3 text-sm font-inter rounded-md focus:outline-none focus:bg-white/60 resize-none custom-scrollbar max-h-[120px] text-black placeholder:text-black/50 shadow-sm transition-colors"
        rows={1}
      />
      <button
        onClick={handleSend}
        disabled={!content.trim() || sending}
        className="w-10 h-10 flex-shrink-0 flex items-center justify-center bg-blue-400 text-white border border-white/60 rounded-full shadow-sm disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 hover:bg-blue-500 active:scale-95 transition-all"
      >
        <SendHorizontal size={18} />
      </button>
    </div>
  )
}
