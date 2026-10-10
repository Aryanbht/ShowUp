'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Search } from 'lucide-react'

export default function ChatSidebar({ connections, activeUserId, onSelectUser }) {
  const [search, setSearch] = useState('')

  if (!connections || connections.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 mb-4 bg-sky-100 border-2 border-ink rounded-2xl flex items-center justify-center shadow-brutal-sm">
          <Search size={28} className="text-muted" />
        </div>
        <h3 className="font-grotesk font-bold text-base mb-1 text-ink">No connections yet</h3>
        <p className="font-inter text-xs text-muted mb-5">Find teammates to connect with and start building together.</p>
        <Link href="/teammates" className="btn-secondary text-xs px-4 py-2">
          Explore teammates
        </Link>
      </div>
    )
  }

  const filteredConnections = connections.filter(c =>
    c.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.username?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-white">
      {/* Search */}
      <div className="p-3 border-b-2 border-ink">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            type="text"
            placeholder="Search teammates..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-brutal pl-8 py-2 text-sm border-2 border-ink rounded-xl"
          />
        </div>
      </div>

      {/* Connection List */}
      <div className="flex-1 overflow-y-auto">
        {filteredConnections.length === 0 ? (
          <div className="p-6 text-center text-muted font-inter text-sm">No teammates found.</div>
        ) : (
          filteredConnections.map((user) => {
            const isActive = user.id === activeUserId

            return (
              <button
                key={user.id}
                onClick={() => onSelectUser(user.id)}
                className={`w-full text-left px-4 py-3 border-b-2 border-ink/10 flex items-center gap-3 transition-colors duration-[120ms] ${
                  isActive
                    ? 'bg-cream border-l-[3px] border-l-accent'
                    : 'bg-white hover:bg-sky-50 border-l-[3px] border-l-transparent'
                }`}
              >
                {/* Avatar */}
                <div className="relative flex-shrink-0 w-10 h-10 border-2 border-ink rounded-full overflow-hidden bg-sky-100 flex items-center justify-center shadow-brutal-sm">
                  {user.avatar ? (
                    <Image src={user.avatar} alt={user.name} fill className="object-cover" />
                  ) : (
                    <span className="font-grotesk font-bold text-sm uppercase text-ink">{user.name?.charAt(0)}</span>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline mb-0.5">
                    <span className="font-grotesk font-bold text-sm truncate text-ink pr-2">
                       {user.name}
                    </span>
                    {user.lastMessage && (
                      <span className="font-inter text-[10px] text-muted flex-shrink-0">
                        {new Date(user.lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    )}
                  </div>

                  <div className="flex justify-between items-center gap-2">
                    <p className={`font-inter text-xs truncate ${user.unreadCount > 0 ? 'font-bold text-ink' : 'text-muted'}`}>
                      {user.lastMessage ? user.lastMessage.content : 'Start a conversation'}
                    </p>

                    {user.unreadCount > 0 && (
                      <span className="flex-shrink-0 min-w-[20px] h-5 px-1.5 bg-violet text-white rounded-full text-[10px] font-bold flex items-center justify-center border-2 border-ink shadow-brutal-sm">
                        {user.unreadCount > 9 ? '9+' : user.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            )
          })
        )}
      </div>
    </div>
  )
}
