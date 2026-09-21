'use client'

import { signIn } from 'next-auth/react'
import { useState } from 'react'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

export default function LandingClient() {
  const [loading, setLoading] = useState(false)

  const handleSignIn = async () => {
    setLoading(true)
    await signIn('google', { callbackUrl: '/feed' })
  }

  const features = [
    {
      number: '01',
      label: 'Project Feed',
      title: 'Share What You Build',
      description:
        "Post your projects. Get discovered by peers, mentors, and recruiters from India's top colleges.",
    },
    {
      number: '02',
      label: 'Teammates',
      title: 'Find Hackathon Partners',
      description:
        'Filter by skill, college, and interest. Connect with builders who complement your stack.',
    },
    {
      number: '03',
      label: 'Coming Soon',
      title: 'Internship Board',
      description:
        'Student-to-student internship referrals. Built for India. Launching soon.',
      dim: true,
    },
  ]

  const techMarqueeItems = [
    'React', 'Python', 'Node.js', 'Flutter', 'ML/AI', 'Figma',
    'Next.js', 'Firebase', 'Go', 'Django', 'TypeScript', 'Rust',
  ]

  return (
    <div className="min-h-screen bg-canvas">
      {/* ===== NAV ===== */}
      <nav className="border-b-3 border-ink bg-surface sticky top-0 z-10 shadow-brutal">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <span className="font-grotesk font-extrabold text-xl text-ink tracking-tight">
            Show<span className="bg-primary px-1">Up</span>
          </span>
          <button
            onClick={handleSignIn}
            disabled={loading}
            className="btn-primary flex items-center gap-2 text-xs py-2"
          >
            {loading ? <LoadingSpinner size="sm" color="ink" /> : null}
            Sign In
          </button>
        </div>
      </nav>

      {/* ===== HERO ===== */}
      <section className="max-w-6xl mx-auto px-6 pt-20 pb-16 md:pt-28 md:pb-20">
        <div className="max-w-3xl">
          {/* Overline badge */}
          <div className="badge-status inline-flex items-center gap-2 mb-6 text-xs">
            🇮🇳 For Indian College Students
          </div>

          {/* Headline */}
          <h1 className="font-grotesk font-extrabold text-5xl md:text-7xl text-ink leading-none tracking-tight mb-6">
            Build.
            <br />
            <span className="text-ink relative inline-block">
              Share.
              <span className="absolute bottom-1 left-0 w-full h-3 bg-primary -z-10" />
            </span>
            <br />
            Connect.
          </h1>

          {/* Sub-headline */}
          <p className="font-inter text-base md:text-lg text-ink/70 leading-relaxed max-w-xl mb-10">
            Where Indian college students share projects, find hackathon teammates, and get discovered.
            No LinkedIn noise. Just builders.
          </p>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row gap-4 items-start">
            <button
              id="google-signin-btn"
              onClick={handleSignIn}
              disabled={loading}
              className="btn-primary flex items-center gap-3 text-sm py-3 px-7 w-full sm:w-auto justify-center"
            >
              {loading ? (
                <LoadingSpinner size="sm" color="ink" />
              ) : (
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z" fill="#1A1A1A"/>
                  <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z" fill="#1A1A1A"/>
                  <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z" fill="#1A1A1A"/>
                  <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58Z" fill="#1A1A1A"/>
                </svg>
              )}
              Get started with Google
            </button>
            <p className="font-inter text-xs text-ink/40 mt-2 sm:mt-3">Free · No credit card · 2 min setup</p>
          </div>
        </div>
      </section>

      {/* ===== MARQUEE STRIP ===== */}
      <div className="border-y-3 border-ink bg-primary overflow-hidden py-2.5">
        <div className="flex gap-6 animate-marquee whitespace-nowrap">
          {[...techMarqueeItems, ...techMarqueeItems].map((item, i) => (
            <span key={i} className="font-grotesk font-extrabold text-xs text-ink uppercase tracking-widest">
              {item} ·
            </span>
          ))}
        </div>
      </div>

      {/* ===== FEATURES ===== */}
      <section className="max-w-6xl mx-auto px-6 py-16 md:py-24">
        <div className="mb-12">
          <span className="font-grotesk font-bold text-xs uppercase tracking-widest text-ink/40">What's on ShowUp</span>
          <h2 className="font-grotesk font-extrabold text-3xl md:text-4xl text-ink mt-2 leading-tight">
            Everything a builder needs.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border-3 border-ink">
          {features.map((feature, i) => (
            <div
              key={i}
              className={`p-8 ${i < features.length - 1 ? 'border-b-3 md:border-b-0 md:border-r-3' : ''} border-ink ${
                feature.dim ? 'opacity-50' : ''
              }`}
            >
              <div className="flex items-start justify-between mb-6">
                <span className="font-grotesk font-extrabold text-5xl text-ink/10 leading-none">{feature.number}</span>
                <span className="badge-status text-[10px]">{feature.label}</span>
              </div>
              <h3 className="font-grotesk font-bold text-xl text-ink mb-3">{feature.title}</h3>
              <p className="font-inter text-sm text-ink/60 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ===== STATS STRIP ===== */}
      <section className="border-y-3 border-ink bg-ink">
        <div className="max-w-6xl mx-auto px-6 py-10 grid grid-cols-3 divide-x-3 divide-ink/30">
          {[
            { num: '500+', label: 'Colleges' },
            { num: '10K+', label: 'Projects Shared' },
            { num: '2K+', label: 'Teams Formed' },
          ].map((stat, i) => (
            <div key={i} className="px-6 text-center">
              <p className="font-grotesk font-extrabold text-3xl md:text-4xl text-primary">{stat.num}</p>
              <p className="font-grotesk font-bold text-xs uppercase tracking-wider text-surface/50 mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ===== CTA SECTION ===== */}
      <section className="max-w-6xl mx-auto px-6 py-20 text-center">
        <h2 className="font-grotesk font-extrabold text-4xl md:text-5xl text-ink leading-tight mb-4">
          Your next hackathon team<br />is already here.
        </h2>
        <p className="font-inter text-sm text-ink/50 mb-8">
          Join hundreds of builders shipping from IITs, NITs, BITs, and beyond.
        </p>
        <button
          onClick={handleSignIn}
          disabled={loading}
          className="btn-primary flex items-center gap-3 text-sm py-3 px-8 mx-auto"
        >
          {loading && <LoadingSpinner size="sm" color="ink" />}
          Get started for free →
        </button>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="border-t-3 border-ink bg-surface">
        <div className="max-w-6xl mx-auto px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span className="font-grotesk font-extrabold text-base text-ink">
            Show<span className="bg-primary px-0.5">Up</span>
          </span>
          <p className="font-inter text-xs text-ink/40">
            Built for India's builders · {new Date().getFullYear()}
          </p>
        </div>
      </footer>
    </div>
  )
}
