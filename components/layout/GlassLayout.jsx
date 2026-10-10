'use client'

export default function GlassLayout({ children }) {
  return (
    <div className="min-h-screen relative font-sans flex flex-col">
      {/* Main Content Area ΓÇö page bg comes from body in globals.css */}
      <div className="relative z-10 w-full min-h-screen flex flex-col">
        {children}
      </div>
    </div>
  )
}
