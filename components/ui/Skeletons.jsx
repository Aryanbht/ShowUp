'use client'

/** ProjectCard skeleton — mirrors the real card structure */
export function ProjectCardSkeleton() {
  return (
    <div className="bg-white border-2 border-ink rounded-2xl shadow-brutal overflow-hidden animate-pulse">
      {/* Cover image */}
      <div className="w-full aspect-video bg-sky-200" />
      {/* Body */}
      <div className="p-4 flex flex-col gap-3">
        {/* Author row */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-sky-200 flex-shrink-0" />
          <div className="flex flex-col gap-1.5 flex-1">
            <div className="h-3 w-28 bg-sky-200 rounded-lg" />
            <div className="h-2.5 w-20 bg-sky-200/70 rounded-lg" />
          </div>
        </div>
        {/* Title */}
        <div className="h-4 w-full bg-sky-200 rounded-lg" />
        <div className="h-4 w-3/4 bg-sky-200 rounded-lg" />
        {/* Chips */}
        <div className="flex gap-1.5">
          <div className="h-5 w-16 bg-sky-200 rounded-full" />
          <div className="h-5 w-12 bg-sky-200 rounded-full" />
          <div className="h-5 w-14 bg-sky-200 rounded-full" />
        </div>
        {/* Actions */}
        <div className="pt-2 border-t-2 border-ink/10 flex gap-4">
          <div className="h-3.5 w-10 bg-sky-200 rounded-lg" />
          <div className="h-3.5 w-10 bg-sky-200 rounded-lg" />
        </div>
      </div>
    </div>
  )
}

/** TeammateCard skeleton */
export function TeammateCardSkeleton() {
  return (
    <div className="bg-white border-2 border-ink rounded-2xl shadow-brutal p-5 flex flex-col gap-4 animate-pulse">
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-sky-200 flex-shrink-0" />
        <div className="flex flex-col gap-2 flex-1">
          <div className="h-4 w-32 bg-sky-200 rounded-lg" />
          <div className="h-3 w-24 bg-sky-200/70 rounded-lg" />
          <div className="h-3 w-20 bg-sky-200/70 rounded-lg" />
        </div>
      </div>
      {/* Badge */}
      <div className="h-6 w-32 bg-sky-200 rounded-full" />
      {/* Skills label + pills */}
      <div className="flex flex-col gap-2">
        <div className="h-3 w-12 bg-sky-200/70 rounded-lg" />
        <div className="flex gap-1.5">
          <div className="h-5 w-14 bg-sky-200 rounded-full" />
          <div className="h-5 w-16 bg-sky-200 rounded-full" />
          <div className="h-5 w-10 bg-sky-200 rounded-full" />
        </div>
      </div>
      {/* Button */}
      <div className="pt-2 border-t-2 border-ink/10">
        <div className="h-9 w-full bg-sky-200 rounded-xl" />
      </div>
    </div>
  )
}

/** Chat sidebar item skeleton */
export function ChatItemSkeleton() {
  return (
    <div className="flex items-center gap-3 px-4 py-3 border-b-2 border-ink/10 animate-pulse">
      <div className="w-10 h-10 rounded-full bg-sky-200 flex-shrink-0" />
      <div className="flex-1 flex flex-col gap-2">
        <div className="h-3.5 w-24 bg-sky-200 rounded-lg" />
        <div className="h-3 w-40 bg-sky-200/70 rounded-lg" />
      </div>
    </div>
  )
}
