'use client'

import { AlertCircle } from 'lucide-react'

/**
 * EmptyState ΓÇö lucide icon in a cream circle, bold title, muted description, primary CTA.
 *
 * Props:
 *   icon      ΓÇô a lucide-react component (e.g. Users). Falls back to a box emoji string for legacy callers.
 *   title     ΓÇô bold one-liner
 *   description ΓÇô muted supporting text
 *   action    ΓÇô { label, onClick } for primary CTA
 *   error     ΓÇô if true, shows a red tint ring and changes CTA label to "Retry"
 */
export default function EmptyState({ icon: Icon, title, description, action, error = false }) {
  // Support legacy callers passing an emoji string as `icon`
  const isLegacyEmoji = typeof Icon === 'string'

  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
      {/* Icon circle */}
      <div
        className={`w-16 h-16 rounded-full border-2 flex items-center justify-center mb-5 ${
          error
            ? 'bg-red-50 border-red-400'
            : 'bg-cream border-ink'
        }`}
      >
        {isLegacyEmoji ? (
          <span className="text-2xl leading-none">{Icon}</span>
        ) : Icon ? (
          <Icon size={28} strokeWidth={1.75} className={error ? 'text-red-500' : 'text-ink'} />
        ) : (
          <AlertCircle size={28} strokeWidth={1.75} className="text-muted" />
        )}
      </div>

      {/* Title */}
      <h3 className="font-grotesk font-bold text-xl text-ink mb-1.5 tracking-tight">
        {title}
      </h3>

      {/* Description */}
      {description && (
        <p className="font-inter text-sm text-muted mb-6 max-w-xs leading-relaxed">
          {description}
        </p>
      )}

      {/* CTA */}
      {action && (
        <button
          onClick={action.onClick}
          className={error ? 'btn-destructive' : 'btn-primary'}
        >
          {error ? (action.label ?? 'Retry') : action.label}
        </button>
      )}
    </div>
  )
}
