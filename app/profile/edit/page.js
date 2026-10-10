'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession, signIn } from 'next-auth/react'
import Header from '@/components/layout/Header'
import MobileNav from '@/components/layout/MobileNav'
import GlassLayout from '@/components/layout/GlassLayout'
import StepOne from '@/components/onboarding/StepOne'
import StepTwo from '@/components/onboarding/StepTwo'
import StepThree from '@/components/onboarding/StepThree'
import toast from 'react-hot-toast'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

export default function EditProfilePage() {
  const router = useRouter()
  const { data: session, status, update } = useSession()

  const [data, setData] = useState(null)
  const [linkedAccounts, setLinkedAccounts] = useState([])
  const [submitting, setSubmitting] = useState(false)
  const [loading, setLoading] = useState(true)
  const [togglingGithub, setTogglingGithub] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/')
      return
    }

    if (status === 'authenticated') {
      // Fetch full user profile
      async function fetchProfile() {
        try {
          const [resProfile, resAccounts] = await Promise.all([
            fetch('/api/user/me'),
            fetch('/api/user/me/accounts')
          ])

          if (resProfile.ok) {
            const user = await resProfile.json()
            setData({
              name: user.name || '',
              username: user.username || '',
              usernameManuallyEdited: true,
              college: user.college || '',
              branch: user.branch || '',
              year: user.year || '',
              bio: user.bio || '',
              skills: user.skills || [],
              githubUrl: user.githubUrl || '',
              linkedinUrl: user.linkedinUrl || '',
              avatar: user.avatar || '',
              lookingForTeam: user.lookingForTeam || false,
              hackathonInterests: user.hackathonInterests || [],
            })
          }
          if (resAccounts.ok) {
            const accounts = await resAccounts.json()
            setLinkedAccounts(accounts.map(a => a.provider))
          }
        } catch (err) {
          console.error(err)
          toast.error('Failed to load profile')
        } finally {
          setLoading(false)
        }
      }
      fetchProfile()
    }
  }, [status, router])

  const updateData = (updates) => setData((prev) => ({ ...prev, ...updates }))

  const validate = () => {
    if (!data.name.trim()) { toast.error('Full name is required'); return false }
    if (!data.username.trim() || data.username.length < 3) { toast.error('Username must be at least 3 characters'); return false }
    if (!data.college.trim()) { toast.error('College is required'); return false }
    if (!data.branch) { toast.error('Please select your branch'); return false }
    if (!data.year) { toast.error('Please select your year'); return false }
    if (!data.avatar) { toast.error('Please upload a profile photo'); return false }
    return true
  }

  const handleSubmit = async () => {
    if (!validate()) return
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
        }),
      })

      if (!res.ok) {
        const err = await res.json()
        toast.error(err.error || 'Failed to update profile')
        setSubmitting(false)
        return
      }

      await update({ username: data.username, avatar: data.avatar })
      toast.success('Profile updated successfully!')
      router.push(`/profile/${data.username}`)
    } catch {
      toast.error('Something went wrong. Please try again.')
      setSubmitting(false)
    }
  }

  const isGithubConnected = linkedAccounts.includes('github')

  const toggleGithub = async () => {
    setTogglingGithub(true)
    try {
      if (isGithubConnected) {
        const res = await fetch('/api/user/me/accounts?provider=github', { method: 'DELETE' })
        if (res.ok) {
          setLinkedAccounts(prev => prev.filter(p => p !== 'github'))
          toast.success('GitHub disconnected successfully')
        } else {
          toast.error('Failed to disconnect GitHub')
        }
        setTogglingGithub(false)
      } else {
        // NextAuth will handle the redirect
        signIn('github', { callbackUrl: '/profile/edit' })
      }
    } catch {
      toast.error('Something went wrong')
      setTogglingGithub(false)
    }
  }

  if (loading || !data) {
    return (
      <GlassLayout>
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <LoadingSpinner size="lg" />
        </main>
      </GlassLayout>
    )
  }

  return (
    <GlassLayout>
      <Header />
      <main className="max-w-2xl mx-auto w-full px-4 py-8 pb-28 md:pb-12">
        <div className="bg-white border-2 border-ink rounded-2xl shadow-brutal p-6 md:p-8">
          <div className="mb-8">
            <h1 className="font-grotesk font-extrabold text-2xl text-ink tracking-tight">Edit Profile</h1>
            <p className="font-inter text-sm text-muted mt-1">Update your information and how you appear to others.</p>
          </div>

          <div className="flex flex-col gap-10">
            {/* Step 3 (Avatar) put at top for better settings UX */}
            <section>
              <h2 className="font-grotesk font-bold text-lg text-ink mb-4 border-b-2 border-ink/10 pb-2">Profile Photo</h2>
              <StepThree data={data} onChange={updateData} />
            </section>

            <section>
              <h2 className="font-grotesk font-bold text-lg text-ink mb-4 border-b-2 border-ink/10 pb-2">Basic Info</h2>
              <StepOne data={data} onChange={updateData} />
            </section>

            <section>
              <h2 className="font-grotesk font-bold text-lg text-ink mb-4 border-b-2 border-ink/10 pb-2">Experience & Skills</h2>
              <StepTwo data={data} onChange={updateData} />
            </section>

            <section>
              <h2 className="font-grotesk font-bold text-lg text-ink mb-4 border-b-2 border-ink/10 pb-2">Connected Accounts</h2>
              <div className="flex items-center justify-between p-4 bg-sky-50 border-2 border-ink rounded-xl shadow-brutal-sm">
                <div>
                  <h3 className="font-grotesk font-bold text-sm text-ink mb-0.5">GitHub Authentication</h3>
                  <p className="font-inter text-xs text-muted max-w-xs">Connect your GitHub to prevent duplicate projects and auto-fill repository info.</p>
                </div>
                <button
                  onClick={toggleGithub}
                  disabled={togglingGithub}
                  className={`relative w-12 h-6 flex items-center rounded-full border-2 border-ink transition-colors duration-[120ms] cursor-pointer shadow-brutal-sm ${
                    isGithubConnected ? 'bg-accent' : 'bg-white'
                  }`}
                >
                  <div className={`w-4 h-4 rounded-full bg-ink transition-transform duration-[120ms] ${
                    isGithubConnected ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
              </div>
            </section>
          </div>

          <div className="mt-10 pt-6 border-t-2 border-ink flex justify-end gap-4">
            <button
              onClick={() => router.push(`/profile/${data.username}`)}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="btn-primary min-w-[120px]"
            >
              {submitting ? <LoadingSpinner size="sm" color="ink" /> : 'Save Changes'}
            </button>
          </div>
        </div>
      </main>
      <MobileNav />
    </GlassLayout>
  )
}
