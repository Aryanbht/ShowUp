'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import ProgressBar from '@/components/onboarding/ProgressBar'
import StepOne from '@/components/onboarding/StepOne'
import StepTwo from '@/components/onboarding/StepTwo'
import StepThree from '@/components/onboarding/StepThree'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import toast from 'react-hot-toast'
import formPageImg from '@/public/form-page-2.png'

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
    <div className="min-h-screen relative flex items-center justify-center p-4 pt-24 md:pt-4 font-sans overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `url(${formPageImg.src})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      />

      {/* Vignette Overlay */}
      <div 
        className="absolute inset-0 z-0 pointer-events-none" 
        style={{ background: 'radial-gradient(circle, rgba(0,0,0,0) 60%, rgba(0,0,0,0.35) 100%)' }} 
      />

      {/* Top Left Logo */}
      <div className="absolute top-4 left-4 md:-top-10 md:left-0 w-full px-0 md:px-6 md:pb-6 flex items-center z-50">
        <Link href="/" className="flex justify-start md:-ml-16">
          <img
            src="/logo.png"
            alt="ShowUp Logo"
            className="h-20 sm:h-24 md:h-48 lg:h-64 w-auto object-contain hover:scale-105 transition-transform cursor-pointer drop-shadow-md"
          />
        </Link>
      </div>

      {/* Main Content Area */}
      <div className="relative z-10 w-full max-w-lg flex flex-col items-center">

        {/* Header Title */}
        <div className="bg-white/40 backdrop-blur-md px-6 md:px-10 py-2 mb-6 md:mb-8 border-[2px] border-slate-800 rounded-full shadow-sm max-w-full text-center">
          <h1 className="text-base sm:text-lg md:text-2xl font-extrabold uppercase text-black tracking-wide font-sans">
            SETUP YOUR PROFILE
          </h1>
        </div>

        {/* Glassmorphism Container */}
        <div className="w-full bg-white/20 backdrop-blur-md rounded-2xl md:rounded-3xl p-5 sm:p-6 md:p-10 shadow-[0_20px_80px_rgba(0,0,0,0.8)] border border-white/40 flex flex-col min-h-[500px]">

          <ProgressBar currentStep={step} totalSteps={3} />

          <div className="flex-1 mt-6">
            {step === 1 && <StepOne data={data} onChange={updateData} />}
            {step === 2 && <StepTwo data={data} onChange={updateData} />}
            {step === 3 && <StepThree data={data} onChange={updateData} />}
          </div>

          {/* Navigation */}
          <div className="flex justify-center mt-8 pt-4">
            {step > 1 && (
              <button onClick={handleBack} className="bg-white text-black font-bold px-10 py-3 mx-2 shadow-sm uppercase tracking-widest text-sm hover:bg-gray-100 transition-colors border border-black/20">
                Back
              </button>
            )}
            {step < 3 ? (
              <button onClick={handleNext} className="bg-white text-black font-bold px-10 py-3 mx-2 shadow-sm uppercase tracking-widest text-sm hover:bg-gray-100 transition-colors border border-black/20">
                Next
              </button>
            ) : (
              <button onClick={handleSubmit} disabled={submitting} className="bg-white text-black font-bold px-10 py-3 mx-2 shadow-sm uppercase tracking-widest text-sm hover:bg-gray-100 transition-colors border border-black/20 flex items-center gap-2">
                {submitting ? 'Saving...' : 'Complete'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
