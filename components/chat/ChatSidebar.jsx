'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'

export default function ChatSidebar({ connections, activeUserId, onSelectUser }) {
  const [search, setSearch] = useState('')

  if (!connections || connections.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 mb-4 border border-white/40 bg-white/30 rounded-2xl flex items-center justify-center text-2xl shadow-sm backdrop-blur-sm">
          🤷
        </div>
        <h3 className="font-grotesk font-bold text-lg mb-2 uppercase tracking-wide text-black">No connections yet</h3>
        <p className="font-inter text-xs text-black/60 mb-6">Find teammates to connect with and start building together.</p>
        <Link href="/feed" className="bg-white/70 hover:bg-white text-black font-bold border border-white/40 rounded-md shadow-sm items-center gap-1.5 py-2 px-4 text-xs transition-colors inline-block">
          Explore Feed
        </Link>
      </div>
    )
  }

  const filteredConnections = connections.filter(c => 
    c.name?.toLowerCase().includes(search.toLowerCase()) || 
    c.username?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Search Bar */}
      <div className="p-4 border-b border-white/40 bg-white/20 backdrop-blur-md">
        <input 
          type="text" 
          placeholder="Search teammates..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-white/40 border border-white/60 px-3 py-2 text-sm font-inter focus:outline-none focus:bg-white/60 transition-colors rounded-md text-black placeholder:text-black/50 shadow-sm"
        />
      </div>

      {/* Connection List */}
      <div className="flex-1 overflow-y-auto bg-transparent custom-scrollbar">
        {filteredConnections.length === 0 ? (
          <div className="p-6 text-center text-ink/50 font-inter text-sm">No teammates found.</div>
        ) : (
          filteredConnections.map((user) => {
            const isActive = user.id === activeUserId
            
            return (
              <button
                key={user.id}
                onClick={() => onSelectUser(user.id)}
                className={`w-full text-left p-4 border-b border-white/40 hover:bg-white/30 transition-colors flex items-center gap-3 relative ${
                  isActive ? 'bg-blue-300/40 backdrop-blur-md' : 'bg-transparent'
                }`}
              >
                {isActive && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500"></div>
                )}
                
                <div className="relative flex-shrink-0 w-12 h-12 border border-white/60 rounded-full overflow-hidden bg-white/40 shadow-sm flex items-center justify-center">
                  {user.avatar ? (
                    <Image src={user.avatar} alt={user.name} fill className="object-cover" />
                  ) : (
                    <span className="font-grotesk font-bold text-lg uppercase">{user.name?.charAt(0)}</span>
                  )}
                </div>
                
                <div className="flex-1 min-w-0 flex flex-col justify-center">
                  <div className="flex justify-between items-baseline mb-1">
                    <span className="font-grotesk font-bold text-sm truncate uppercase tracking-tight text-black pr-2">
                      {user.name}
                    </span>
                    {user.lastMessage && (
                      <span className="font-inter text-[10px] text-black/50 flex-shrink-0">
                        {new Date(user.lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    )}
                  </div>
                  
                  <div className="flex justify-between items-center gap-2">
                    <p className={`font-inter text-xs truncate ${user.unreadCount > 0 ? 'font-bold text-black' : 'text-black/60'}`}>
                      {user.lastMessage ? user.lastMessage.content : 'Start a conversation'}
                    </p>
                    
                    {user.unreadCount > 0 && (
                      <span className="flex-shrink-0 w-5 h-5 bg-blue-500 text-white rounded-full shadow-sm text-[10px] font-bold flex items-center justify-center">
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
