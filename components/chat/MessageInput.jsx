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
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }

    try {
      await onSend(trimmed)
    } catch (err) {
      toast.error('Failed to send message')
      setContent(trimmed)
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

  const isDisabled = !content.trim() || sending

  return (
    <div className="p-3 border-t-2 border-ink bg-white flex items-end gap-3 shrink-0">
      <textarea
        ref={textareaRef}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Message..."
        className="flex-1 bg-white border-2 border-ink rounded-xl p-2.5 px-3.5 text-sm font-inter focus:outline-none focus:shadow-brutal resize-none max-h-[120px] text-ink placeholder:text-muted transition-all duration-[120ms]"
        rows={1}
      />
      <button
        onClick={handleSend}
        disabled={isDisabled}
        aria-label="Send message"
        className={`w-11 h-11 flex-shrink-0 flex items-center justify-center bg-accent text-ink border-2 border-ink rounded-full transition-all duration-[120ms] ${
          isDisabled 
            ? 'opacity-40 cursor-not-allowed'
            : 'shadow-brutal hover:-translate-x-[1px] hover:-translate-y-[1px] hover:shadow-brutal-lg active:translate-x-[2px] active:translate-y-[2px] active:shadow-brutal-none'
        }`}
      >
        <SendHorizontal size={18} strokeWidth={2.5} />
      </button>
    </div>
  )
}
