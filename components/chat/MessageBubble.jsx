'use client'

export default function MessageBubble({ message, isMine, isFirstInGroup, showSeen, showTimestamp }) {
  const timeStr = new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

  // Ensure bottom corner is always squared for this design
  const bubbleRadius = isMine 
    ? 'rounded-2xl rounded-br-sm' 
    : 'rounded-2xl rounded-bl-sm'

  return (
    <div className={`flex flex-col w-full mb-1 ${isFirstInGroup ? 'mt-3' : 'mt-0.5'}`}>
      <div className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
        <div
          className={`
            relative max-w-[70%] px-3.5 py-2.5 border-2 border-ink
            ${isMine
              ? 'bg-accent text-ink shadow-brutal-sm'
              : 'bg-cream text-ink shadow-brutal-sm'}
            ${bubbleRadius}
          `}
          style={{ wordBreak: 'break-word', whiteSpace: 'pre-wrap' }}
        >
          <p className="font-inter text-sm leading-relaxed">{message.content}</p>
        </div>
      </div>
      
      {/* Show timestamp underneath if requested (last of group) */}
      {(showTimestamp || showSeen) && (
        <div className={`flex items-center gap-2 mt-1 ${isMine ? 'justify-end pr-1' : 'justify-start pl-1'}`}>
          {showTimestamp && (
            <span className="font-inter text-[10px] text-muted">{timeStr}</span>
          )}
          {showSeen && (
            <span className="font-inter font-bold text-[10px] text-muted tracking-wider">Seen</span>
          )}
        </div>
      )}
    </div>
  )
}
