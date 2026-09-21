'use client'

import { useState, useEffect } from 'react'
import { CheckCircle } from 'lucide-react'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

const BRANCH_OPTIONS = ['CSE', 'ECE', 'ME', 'Civil', 'MBA', 'Design', 'Other']
const YEAR_OPTIONS = [
  { value: '1', label: '1st Year' },
  { value: '2', label: '2nd Year' },
  { value: '3', label: '3rd Year' },
  { value: '4', label: '4th Year' },
]

export default function StepOne({ data, onChange }) {
  const [usernameStatus, setUsernameStatus] = useState('idle') // idle, checking, available, taken
  const MAX_BIO = 160

  // Auto-suggest username from name
  useEffect(() => {
    if (data.name && !data.usernameManuallyEdited) {
      const suggested = data.name
        .toLowerCase()
        .replace(/\s+/g, '_')
        .replace(/[^a-z0-9_]/g, '')
        .slice(0, 20)
      onChange({ username: suggested })
    }
  }, [data.name])

  const checkUsername = async (username) => {
    if (!username || username.length < 3) { setUsernameStatus('idle'); return }
    setUsernameStatus('checking')
    try {
      const res = await fetch(`/api/user/${username}`, { method: 'POST' })
      if (res.ok) {
        const { available } = await res.json()
        setUsernameStatus(available ? 'available' : 'taken')
      }
    } catch {
      setUsernameStatus('idle')
    }
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Full Name */}
      <div>
        <label className="block font-grotesk font-bold text-xs uppercase tracking-wider mb-2">
          Full Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={data.name}
          onChange={(e) => onChange({ name: e.target.value })}
          placeholder="Aryan Sharma"
          className="input-brutal"
          maxLength={60}
          required
        />
      </div>

      {/* Username */}
      <div>
        <label className="block font-grotesk font-bold text-xs uppercase tracking-wider mb-2">
          Username <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 font-grotesk font-bold text-ink/40 text-sm">@</span>
          <input
            type="text"
            value={data.username}
            onChange={(e) => {
              const val = e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '')
              onChange({ username: val, usernameManuallyEdited: true })
              setUsernameStatus('idle')
            }}
            onBlur={() => checkUsername(data.username)}
            placeholder="aryan_sharma"
            className="input-brutal pl-8 pr-10"
            maxLength={20}
            required
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {usernameStatus === 'checking' && <LoadingSpinner size="sm" />}
            {usernameStatus === 'available' && <CheckCircle size={16} className="text-green-600" />}
            {usernameStatus === 'taken' && <span className="text-red-500 text-xs font-grotesk font-bold">Taken!</span>}
          </div>
        </div>
        <p className="font-inter text-xs text-ink/40 mt-1">Lowercase letters, numbers, underscores only</p>
      </div>

      {/* College */}
      <div>
        <label className="block font-grotesk font-bold text-xs uppercase tracking-wider mb-2">
          College <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={data.college}
          onChange={(e) => onChange({ college: e.target.value })}
          placeholder="IIT Delhi / BITS Pilani / VIT..."
          className="input-brutal"
          maxLength={100}
          required
        />
      </div>

      {/* Branch + Year Grid */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block font-grotesk font-bold text-xs uppercase tracking-wider mb-2">
            Branch <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <select
              value={data.branch}
              onChange={(e) => onChange({ branch: e.target.value })}
              className="input-brutal appearance-none cursor-pointer"
              required
            >
              <option value="">Select branch</option>
              {BRANCH_OPTIONS.map((b) => <option key={b} value={b}>{b}</option>)}
            </select>
            <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-ink">▾</div>
          </div>
        </div>
        <div>
          <label className="block font-grotesk font-bold text-xs uppercase tracking-wider mb-2">
            Year <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <select
              value={data.year}
              onChange={(e) => onChange({ year: e.target.value })}
              className="input-brutal appearance-none cursor-pointer"
              required
            >
              <option value="">Select year</option>
              {YEAR_OPTIONS.map((y) => <option key={y.value} value={y.value}>{y.label}</option>)}
            </select>
            <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-ink">▾</div>
          </div>
        </div>
      </div>

      {/* Bio */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <label className="font-grotesk font-bold text-xs uppercase tracking-wider">Bio</label>
          <span className={`font-inter text-xs ${data.bio?.length >= MAX_BIO ? 'text-red-500' : 'text-ink/40'}`}>
            {data.bio?.length || 0}/{MAX_BIO}
          </span>
        </div>
        <textarea
          value={data.bio}
          onChange={(e) => onChange({ bio: e.target.value.slice(0, MAX_BIO) })}
          placeholder="Full-stack dev from Delhi. Building things that matter."
          className="input-brutal resize-none"
          rows={3}
        />
      </div>
    </div>
  )
}
