'use client'

import Image from 'next/image'

export default function Avatar({ src, name, size = 'md', className = '' }) {
  const sizes = {
    xs: 'w-6 h-6 text-xs',
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-16 h-16 text-lg',
    xl: 'w-24 h-24 text-2xl',
  }

  const initials = name
    ? name
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : '?'

  if (src) {
    return (
      <div
        className={`${sizes[size]} relative border-3 border-ink overflow-hidden flex-shrink-0 ${className}`}
      >
        <Image
          src={src}
          alt={name || 'Avatar'}
          fill
          className="object-cover"
          sizes="96px"
        />
      </div>
    )
  }

  // Fallback initials
  return (
    <div
      className={`${sizes[size]} bg-primary border-3 border-ink flex items-center justify-center flex-shrink-0 ${className}`}
    >
      <span className="font-grotesk font-bold text-ink leading-none">{initials}</span>
    </div>
  )
}
