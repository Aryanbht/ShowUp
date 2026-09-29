'use client'

export default function EmptyState({ icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
      {icon && (
        <div className="text-5xl mb-4">{icon}</div>
      )}
      <h3 className="font-grotesk font-bold text-xl text-black mb-2 drop-shadow-sm">{title}</h3>
      {description && (
        <p className="font-inter text-sm text-gray-700 mb-6 max-w-xs">{description}</p>
      )}
      {action && (
        <button
          onClick={action.onClick}
          className="bg-blue-400 hover:bg-blue-500 text-white font-bold border border-white/60 rounded-md shadow-sm py-3 px-6 text-xs transition-all hover:scale-105 active:scale-95 uppercase tracking-widest"
        >
          {action.label}
        </button>
      )}
    </div>
  )
}
