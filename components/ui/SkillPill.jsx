'use client'

import { X } from 'lucide-react'

export function SkillPill({ label, onRemove, active, onClick }) {
  const base = active ? 'skill-pill-active' : 'skill-pill'

  return (
    <span
      className={`${base} ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {label}
      {onRemove && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            onRemove()
          }}
          className="ml-1 hover:text-red-500 transition-colors"
          aria-label={`Remove ${label}`}
        >
          <X size={10} strokeWidth={3} />
        </button>
      )}
    </span>
  )
}
