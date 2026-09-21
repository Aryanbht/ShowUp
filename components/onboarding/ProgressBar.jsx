'use client'

const STEP_LABELS = ['Identity', 'Skills & Links', 'Team & Avatar']

export default function ProgressBar({ currentStep, totalSteps = 3 }) {
  return (
    <div className="mb-8">
      {/* Step labels */}
      <div className="flex justify-between mb-3">
        {STEP_LABELS.map((label, i) => (
          <div key={i} className="flex flex-col items-center gap-1">
            <div
              className={`w-7 h-7 border-3 border-ink flex items-center justify-center font-grotesk font-bold text-xs transition-all ${
                i + 1 < currentStep
                  ? 'bg-ink text-primary'
                  : i + 1 === currentStep
                  ? 'bg-primary text-ink shadow-brutal-sm'
                  : 'bg-surface text-ink/30'
              }`}
            >
              {i + 1 < currentStep ? '✓' : i + 1}
            </div>
            <span
              className={`font-grotesk font-bold text-[10px] uppercase tracking-wider hidden sm:block ${
                i + 1 === currentStep ? 'text-ink' : 'text-ink/30'
              }`}
            >
              {label}
            </span>
          </div>
        ))}
      </div>

      {/* Progress track */}
      <div className="relative h-2 bg-surface border-2 border-ink overflow-hidden">
        <div
          className="absolute left-0 top-0 h-full bg-primary transition-all duration-500 ease-out"
          style={{ width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%` }}
        />
      </div>

      <p className="font-inter text-xs text-ink/40 mt-2 text-center">
        Step {currentStep} of {totalSteps} — {STEP_LABELS[currentStep - 1]}
      </p>
    </div>
  )
}
