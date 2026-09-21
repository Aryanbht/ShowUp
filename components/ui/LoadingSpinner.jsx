'use client'

export default function LoadingSpinner({ size = 'md', color = 'ink' }) {
  const sizes = { sm: 'w-4 h-4', md: 'w-5 h-5', lg: 'w-8 h-8' }
  const colors = { ink: 'border-ink', primary: 'border-primary', white: 'border-white' }

  return (
    <div
      className={`${sizes[size]} border-2 ${colors[color]} border-t-transparent rounded-full animate-spin`}
      role="status"
      aria-label="Loading"
    />
  )
}
