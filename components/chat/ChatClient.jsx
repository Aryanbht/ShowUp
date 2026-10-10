'use client'

import { useState, useEffect } from 'react'
import Header from '@/components/layout/Header'
import MobileNav from '@/components/layout/MobileNav'
import ChatSidebar from './ChatSidebar'
import ChatWindow from './ChatWindow'
import useSWR from 'swr'
import { ChatItemSkeleton } from '@/components/ui/Skeletons'
import GlassLayout from '@/components/layout/GlassLayout'
import { MessageSquare } from 'lucide-react'

const fetcher = (url) => fetch(url).then((res) => {
  if (!res.ok) throw new Error('Failed to fetch')
  return res.json()
})

export default function ChatClient({ initialUser, currentUserId }) {
  const [activeUserId, setActiveUserId] = useState(initialUser)

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
      <main 
        className="max-w-6xl mx-auto w-full px-4 md:px-6 py-4 flex-1 flex flex-col"
      >
        <div 
          className="w-full flex bg-white border-2 border-ink rounded-2xl shadow-brutal overflow-hidden" 
          style={{ height: isMobile ? 'calc(100vh - 64px - 72px - 2rem)' : 'calc(100vh - 64px - 2rem)' }}
        >

          {/* Sidebar */}
          {showSidebar && (
            <div className={`${isMobile ? 'w-full' : 'w-80'} flex-shrink-0 border-r-2 border-ink flex flex-col bg-white overflow-hidden`}>
              
              {isLoading && !connections ? (
                <div className="flex flex-col mt-4">
                  {Array(5).fill(null).map((_, i) => <ChatItemSkeleton key={i} />)}
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
            <div className="flex-1 flex flex-col overflow-hidden relative bg-white">
              {activeUserId ? (
                <ChatWindow
                  key={activeUserId}
                  connection={activeConnection || { id: activeUserId }}
                  currentUserId={currentUserId}
                  onBack={isMobile ? () => setActiveUserId(null) : undefined}
                />
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center p-6 text-center bg-white">
                  <div className="w-20 h-20 mb-5 bg-sky-100 border-2 border-ink rounded-2xl flex items-center justify-center shadow-brutal">
                    <MessageSquare size={32} className="text-muted" />
                  </div>
                  <h2 className="font-grotesk font-extrabold text-2xl mb-2 text-ink tracking-tight">Select a conversation</h2>
                  <p className="font-inter text-muted text-sm max-w-xs">
                    Choose a teammate from the sidebar to start chatting.
                  </p>
                </div>
              )}
            </div>
          )}

        </div>
      </main>
      <MobileNav />
    </GlassLayout>
  )
}
