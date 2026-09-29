'use client'

import formPageImg from '@/public/form-page-2.png'

export default function GlassLayout({ children }) {
  return (
    <div className="min-h-screen relative font-sans overflow-hidden">
      {/* Background Image */}
      <div
        className="fixed inset-0 z-0"
        style={{
          backgroundImage: `url(${formPageImg.src})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      />

      {/* Vignette Overlay */}
      <div 
        className="fixed inset-0 z-0 pointer-events-none" 
        style={{ background: 'radial-gradient(circle, rgba(0,0,0,0) 60%, rgba(0,0,0,0.35) 100%)' }} 
      />

      {/* Main Content Area */}
      <div className="relative z-10 w-full min-h-screen flex flex-col">
        {children}
      </div>
    </div>
  )
}
