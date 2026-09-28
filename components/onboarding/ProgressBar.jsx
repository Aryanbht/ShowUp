'use client'

const STEP_LABELS = ['Identity', 'Skills & Links', 'Team & Avatar']

export default function ProgressBar({ currentStep, totalSteps = 3 }) {
  return (
    <div className="mb-6 relative flex justify-between px-8">
      {/* Connecting Line */}
      <div className="absolute top-1/2 left-10 right-10 h-[2px] bg-white -translate-y-1/2 z-0" />
      
      {/* Steps */}
      {[1, 2, 3].map((stepNumber) => (
        <div 
          key={stepNumber} 
          className={`relative z-10 w-10 h-10 bg-white border-b-2 border-r-2 border-black/20 flex items-center justify-center shadow-md ${currentStep >= stepNumber ? 'opacity-100' : 'opacity-60'}`}
        >
          <span className="font-bold text-black text-lg" style={{ fontFamily: "'Playfair Display', serif" }}>
            {stepNumber}
          </span>
        </div>
      ))}
    </div>
  )
}
