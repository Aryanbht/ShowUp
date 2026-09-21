'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import ProgressBar from '@/components/onboarding/ProgressBar'
import StepOne from '@/components/onboarding/StepOne'
import StepTwo from '@/components/onboarding/StepTwo'
import StepThree from '@/components/onboarding/StepThree'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import toast from 'react-hot-toast'

const INITIAL_DATA = {
  name: '',
  username: '',
  usernameManuallyEdited: false,
  college: '',
  branch: '',
  year: '',
  bio: '',
  skills: [],
  githubUrl: '',
  linkedinUrl: '',
  avatar: '',
  lookingForTeam: false,
  hackathonInterests: [],
}

export default function OnboardingPage() {
  const router = useRouter()
  const { data: session, update } = useSession()
  const [step, setStep] = useState(1)
  const [data, setData] = useState(() => ({
    ...INITIAL_DATA,
    name: session?.user?.name || '',
  }))
  const [submitting, setSubmitting] = useState(false)

  const updateData = (updates) => setData((prev) => ({ ...prev, ...updates }))

  const validateStep = () => {
    if (step === 1) {
      if (!data.name.trim()) { toast.error('Full name is required'); return false }
      if (!data.username.trim() || data.username.length < 3) { toast.error('Username must be at least 3 characters'); return false }
      if (!data.college.trim()) { toast.error('College is required'); return false }
      if (!data.branch) { toast.error('Please select your branch'); return false }
      if (!data.year) { toast.error('Please select your year'); return false }
    }
    if (step === 3) {
      if (!data.avatar) { toast.error('Please upload a profile photo'); return false }
    }
    return true
  }

  const handleNext = () => {
    if (!validateStep()) return
    setStep((s) => s + 1)
    window.scrollTo(0, 0)
  }

  const handleBack = () => {
    setStep((s) => s - 1)
    window.scrollTo(0, 0)
  }

  const handleSubmit = async () => {
    if (!validateStep()) return
    setSubmitting(true)

    try {
      const res = await fetch('/api/user/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.name,
          username: data.username,
          college: data.college,
          branch: data.branch,
          year: data.year,
          bio: data.bio,
          skills: data.skills,
          githubUrl: data.githubUrl || undefined,
          linkedinUrl: data.linkedinUrl || undefined,
          avatar: data.avatar,
          lookingForTeam: data.lookingForTeam,
          hackathonInterests: data.hackathonInterests,
          onboarded: true,
        }),
      })

      if (!res.ok) {
        const err = await res.json()
        toast.error(err.error || 'Failed to save profile')
        setSubmitting(false)
        return
      }

      await update({ onboarded: true, username: data.username, avatar: data.avatar })
      toast.success('Welcome to ShowUp! 🚀')
      router.push('/feed')
    } catch {
      toast.error('Something went wrong. Please try again.')
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-canvas flex items-start justify-center py-12 px-4">
      <div className="w-full max-w-lg">
        {/* Logo */}
        <div className="text-center mb-8">
          <span className="font-grotesk font-extrabold text-3xl text-ink">
            Show<span className="bg-primary px-1">Up</span>
          </span>
          <p className="font-inter text-sm text-ink/50 mt-2">Set up your profile in 3 steps</p>
        </div>

        {/* Card */}
        <div className="bg-surface border-3 border-ink shadow-brutal-xl p-6 md:p-8">
          <ProgressBar currentStep={step} totalSteps={3} />

          <div className="min-h-[320px]">
            {step === 1 && <StepOne data={data} onChange={updateData} />}
            {step === 2 && <StepTwo data={data} onChange={updateData} />}
            {step === 3 && <StepThree data={data} onChange={updateData} />}
          </div>

          {/* Navigation */}
          <div className="flex gap-3 mt-8 pt-6 border-t-3 border-ink">
            {step > 1 && (
              <button onClick={handleBack} className="btn-secondary flex-1 text-xs">
                ← Back
              </button>
            )}
            {step < 3 ? (
              <button onClick={handleNext} className="btn-primary flex-1 text-xs">
                Next →
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="btn-primary flex-1 flex items-center justify-center gap-2 text-xs"
              >
                {submitting ? (
                  <>
                    <LoadingSpinner size="sm" color="ink" />
                    Saving...
                  </>
                ) : (
                  'Complete Setup 🚀'
                )}
              </button>
            )}
          </div>
        </div>

        {/* Decorative bottom text */}
        <p className="text-center font-inter text-xs text-ink/30 mt-6">
          You can always update your profile later
        </p>
      </div>
    </div>
  )
}
