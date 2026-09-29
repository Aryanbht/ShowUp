'use client'

export default function MessageBubble({ message, isMine, isFirstInGroup, showSeen }) {
  const timeStr = new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  
  return (
    <div className={`flex flex-col w-full mb-1 ${isFirstInGroup ? 'mt-3' : 'mt-1'}`}>
      <div className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
        <div 
          className={`
            relative max-w-[80%] md:max-w-[70%] px-3 py-2 border border-white/60 shadow-sm backdrop-blur-md
            ${isMine ? 'bg-blue-300/80 text-black' : 'bg-white/60 text-black'}
            ${isMine 
              ? (isFirstInGroup ? 'rounded-tl-xl rounded-tr-xl rounded-bl-xl rounded-br-sm' : 'rounded-l-xl rounded-r-sm') 
              : (isFirstInGroup ? 'rounded-tr-xl rounded-tl-xl rounded-br-xl rounded-bl-sm' : 'rounded-r-xl rounded-l-sm')}
          `}
          style={{ wordBreak: 'break-word', whiteSpace: 'pre-wrap' }}
        >
          <p className="font-inter text-sm leading-relaxed">{message.content}</p>
          
          <div className={`flex items-center gap-1 mt-1 text-[10px] opacity-60 justify-end ${isMine ? 'text-black' : 'text-black'}`}>
            <span>{timeStr}</span>
          </div>
        </div>
      </div>
      
      {showSeen && (
        <div className="flex justify-end mt-1 pr-1">
          <span className="font-inter font-bold text-[10px] text-black/50 tracking-wider">SEEN</span>
        </div>
      )}
    </div>
  )
}
