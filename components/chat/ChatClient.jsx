'use client'

import { useState, useEffect } from 'react'
import Header from '@/components/layout/Header'
import ChatSidebar from './ChatSidebar'
import ChatWindow from './ChatWindow'
import useSWR from 'swr'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import GlassLayout from '@/components/layout/GlassLayout'

const fetcher = (url) => fetch(url).then((res) => {
  if (!res.ok) throw new Error('Failed to fetch')
  return res.json()
})

export default function ChatClient({ initialUser, currentUserId }) {
  const [activeUserId, setActiveUserId] = useState(initialUser)
  
  // Update URL without reloading when active user changes
  useEffect(() => {
    if (activeUserId) {
      window.history.replaceState(null, '', `/messages?user=${activeUserId}`)
    } else {
      window.history.replaceState(null, '', '/messages')
    }
  }, [activeUserId])

  const { data: connections, error, isLoading } = useSWR('/api/chat/connections', fetcher, {
    refreshInterval: 5000,
  })

  // Mobile layout handling
  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768)
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const activeConnection = connections?.find(c => c.id === activeUserId)

  const showSidebar = !isMobile || (isMobile && !activeUserId)
  const showChatWindow = !isMobile || (isMobile && activeUserId)

  return (
    <GlassLayout>
      <Header />
      
      <main className="flex-1 flex overflow-hidden pt-4 max-w-7xl mx-auto w-full px-4 md:px-6 pb-24 md:pb-6">
        <div className="w-full flex bg-white/20 backdrop-blur-md rounded-2xl md:rounded-3xl shadow-[0_20px_80px_rgba(0,0,0,0.8)] border border-white/40 overflow-hidden">
        {/* Sidebar */}
        {showSidebar && (
          <div className={`${isMobile ? 'w-full' : 'w-[320px]'} flex-shrink-0 border-r border-white/40 flex flex-col bg-white/10 overflow-hidden`}>
            {isLoading && !connections ? (
              <div className="flex-1 flex items-center justify-center">
                <LoadingSpinner size="md" />
              </div>
            ) : error ? (
              <div className="p-4 text-center text-red-500 font-inter text-sm">Failed to load connections.</div>
            ) : (
              <ChatSidebar 
                connections={connections} 
                activeUserId={activeUserId} 
                onSelectUser={setActiveUserId} 
              />
            )}
          </div>
        )}

        {/* Chat Window */}
        {showChatWindow && (
          <div className="flex-1 flex flex-col bg-transparent overflow-hidden relative">
            {activeUserId ? (
              <ChatWindow 
                key={activeUserId} // force remount when switching users
                connection={activeConnection || { id: activeUserId }} // Pass minimal id if not yet loaded in connections
                currentUserId={currentUserId}
                onBack={isMobile ? () => setActiveUserId(null) : undefined}
              />
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                <div className="w-24 h-24 mb-6 border border-white/40 bg-white/30 rounded-2xl flex items-center justify-center text-4xl shadow-sm backdrop-blur-sm">
                  💬
                </div>
                <h2 className="font-grotesk font-extrabold text-2xl mb-2 text-black uppercase">Select a Conversation</h2>
                <p className="font-inter text-black/60 text-sm max-w-sm">
                  Choose a teammate from the sidebar to start chatting.
                </p>
              </div>
            )}
          </div>
        )}

        </div>
      </main>
    </GlassLayout>
  )
}
