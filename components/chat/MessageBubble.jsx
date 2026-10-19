'use client'

import { Clock, CheckCheck, AlertCircle } from 'lucide-react'

export default function MessageBubble({ message, isMine, isFirstInGroup, showTimestamp = true, onRetry }) {
  const timeStr = new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

  // Ensure bottom corner is always squared for this brutalist design
  const bubbleRadius = isMine 
    ? 'rounded-2xl rounded-br-sm' 
    : 'rounded-2xl rounded-bl-sm'

  const isPending = message.isPending || message.id?.startsWith?.('temp-')
  const isFailed = message.isFailed
  const shouldShowStatus = showTimestamp || isPending || isFailed

  // Determine delivery / read status for messages sent by current user
  let statusIcon = null
  let statusText = ''
  let statusColor = 'text-muted'

  if (isMine) {
    if (isFailed) {
      statusIcon = <AlertCircle size={12} className="text-red-500 flex-shrink-0" />
      statusText = 'Failed to deliver'
      statusColor = 'text-red-500 font-bold'
    } else if (isPending) {
      statusIcon = <Clock size={11} className="text-muted flex-shrink-0 animate-pulse" />
      statusText = 'Yet to deliver'
      statusColor = 'text-muted font-medium'
    } else if (message.readAt) {
      statusIcon = <CheckCheck size={13} className="text-violet flex-shrink-0" strokeWidth={2.5} />
      statusText = 'Seen'
      statusColor = 'text-violet font-bold'
    } else {
      statusIcon = <CheckCheck size={13} className="text-muted/80 flex-shrink-0" strokeWidth={2} />
      statusText = 'Delivered'
      statusColor = 'text-muted font-medium'
    }
  }

  const bubbleTooltip = isMine
    ? isFailed
      ? 'Failed to deliver'
      : isPending
      ? 'Sending... Yet to deliver'
      : message.readAt
      ? `Seen at ${new Date(message.readAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
      : `Delivered at ${timeStr}`
    : timeStr

  return (
    <div className={`flex flex-col w-full mb-1 ${isFirstInGroup ? 'mt-3' : 'mt-0.5'}`}>
      <div className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
        <div
          title={bubbleTooltip}
          className={`
            relative max-w-[70%] px-3.5 py-2.5 border-2 border-ink
            ${isMine
              ? isFailed
                ? 'bg-red-50 border-red-500 text-ink shadow-brutal-sm'
                : 'bg-accent text-ink shadow-brutal-sm'
              : 'bg-cream text-ink shadow-brutal-sm'}
            ${bubbleRadius}
          `}
          style={{ wordBreak: 'break-word', whiteSpace: 'pre-wrap' }}
        >
          <p className="font-inter text-sm leading-relaxed">{message.content}</p>
        </div>
      </div>
      
      {/* Timestamp & Delivery/Seen Status underneath */}
      {(showTimestamp || (isMine && shouldShowStatus)) && (
        <div className={`flex items-center gap-1.5 mt-1 ${isMine ? 'justify-end pr-1' : 'justify-start pl-1'}`}>
          {showTimestamp && (
            <span className="font-inter text-[10px] text-muted">{timeStr}</span>
          )}
          
          {isMine && shouldShowStatus && (
            <div
              className={`flex items-center gap-1 text-[10px] ${statusColor}`}
              title={
                isFailed
                  ? 'Failed to deliver - click to retry'
                  : isPending
                  ? 'Sending... Yet to deliver to recipient'
                  : message.readAt
                  ? `Seen by recipient at ${new Date(message.readAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                  : 'Delivered to server'
              }
            >
              {showTimestamp && <span className="text-muted/60">•</span>}
              <span>{statusText}</span>
              {statusIcon}

              {isFailed && onRetry && (
                <button
                  type="button"
                  onClick={() => onRetry(message)}
                  className="ml-1 underline text-red-600 font-bold hover:text-red-800"
                >
                  Retry
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
