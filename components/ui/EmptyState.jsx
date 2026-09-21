'use client'

export default function EmptyState({ icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
      {icon && (
        <div className="text-5xl mb-4">{icon}</div>
      )}
      <h3 className="font-grotesk font-bold text-xl text-ink mb-2">{title}</h3>
      {description && (
        <p className="font-inter text-sm text-ink/60 mb-6 max-w-xs">{description}</p>
      )}
      {action && (
        <button
          onClick={action.onClick}
          className="btn-primary text-xs"
        >
          {action.label}
        </button>
      )}
    </div>
  )
}
