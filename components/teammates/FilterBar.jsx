'use client'

import { useState } from 'react'
import { ChevronDown, X } from 'lucide-react'
import { SkillPill } from '@/components/ui/SkillPill'

const BRANCHES = ['CSE', 'ECE', 'ME', 'Civil', 'MBA', 'Design', 'Other']
const YEARS = ['1', '2', '3', '4']
const YEAR_LABELS = { '1': '1st Year', '2': '2nd Year', '3': '3rd Year', '4': '4th Year' }
const INTEREST_OPTIONS = ['Web Dev', 'App Dev', 'AI-ML', 'Blockchain', 'Design', 'Other']
const COMMON_SKILLS = ['React', 'Python', 'Node.js', 'Flutter', 'ML', 'Figma', 'Java', 'C++']

export default function FilterBar({ filters, onChange }) {
  const [showSkillSuggestions, setShowSkillSuggestions] = useState(false)
  const [skillInput, setSkillInput] = useState('')

  const handleBranch = (val) => onChange({ ...filters, branch: filters.branch === val ? '' : val })
  const handleYear = (val) => onChange({ ...filters, year: filters.year === val ? '' : val })

  const toggleInterest = (interest) => {
    const current = filters.interests || []
    const updated = current.includes(interest)
      ? current.filter((i) => i !== interest)
      : [...current, interest]
    onChange({ ...filters, interests: updated })
  }

  const addSkill = (skill) => {
    const current = filters.skills || []
    if (!current.includes(skill)) {
      onChange({ ...filters, skills: [...current, skill] })
    }
    setSkillInput('')
    setShowSkillSuggestions(false)
  }

  const removeSkill = (skill) => {
    onChange({ ...filters, skills: (filters.skills || []).filter((s) => s !== skill) })
  }

  const clearAll = () => onChange({ branch: '', year: '', skills: [], interests: [] })

  const hasFilters = filters.branch || filters.year || filters.skills?.length || filters.interests?.length

  return (
    <div className="bg-surface border-3 border-ink shadow-brutal p-4 mb-6">
      {/* Row 1: Branch + Year */}
      <div className="flex flex-wrap gap-3 mb-4">
        {/* Branch Filter */}
        <div className="flex flex-col gap-1">
          <p className="font-grotesk font-bold text-xs uppercase tracking-wider text-ink/50">Branch</p>
          <div className="flex flex-wrap gap-1.5">
            {BRANCHES.map((b) => (
              <button
                key={b}
                onClick={() => handleBranch(b)}
                className={filters.branch === b ? 'skill-pill-active' : 'skill-pill hover:bg-primary/20 transition-colors'}
              >
                {b}
              </button>
            ))}
          </div>
        </div>

        {/* Year Filter */}
        <div className="flex flex-col gap-1">
          <p className="font-grotesk font-bold text-xs uppercase tracking-wider text-ink/50">Year</p>
          <div className="flex gap-1.5">
            {YEARS.map((y) => (
              <button
                key={y}
                onClick={() => handleYear(y)}
                className={filters.year === y ? 'skill-pill-active' : 'skill-pill hover:bg-primary/20 transition-colors'}
              >
                {YEAR_LABELS[y]}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Row 2: Skills */}
      <div className="mb-4">
        <p className="font-grotesk font-bold text-xs uppercase tracking-wider text-ink/50 mb-2">Skills</p>
        <div className="flex flex-wrap gap-1.5 mb-2">
          {(filters.skills || []).map((skill) => (
            <SkillPill key={skill} label={skill} active onRemove={() => removeSkill(skill)} />
          ))}
          {COMMON_SKILLS.filter((s) => !(filters.skills || []).includes(s)).map((s) => (
            <button key={s} onClick={() => addSkill(s)} className="skill-pill hover:bg-primary/20 transition-colors">
              + {s}
            </button>
          ))}
        </div>
        <div className="relative inline-block">
          <input
            type="text"
            value={skillInput}
            onChange={(e) => { setSkillInput(e.target.value); setShowSkillSuggestions(true) }}
            onKeyDown={(e) => { if (e.key === 'Enter' && skillInput.trim()) addSkill(skillInput.trim()) }}
            placeholder="Add skill..."
            className="input-brutal py-1.5 text-xs w-36"
          />
        </div>
      </div>

      {/* Row 3: Hackathon Interests */}
      <div className="mb-4">
        <p className="font-grotesk font-bold text-xs uppercase tracking-wider text-ink/50 mb-2">Interests</p>
        <div className="flex flex-wrap gap-1.5">
          {INTEREST_OPTIONS.map((interest) => (
            <button
              key={interest}
              onClick={() => toggleInterest(interest)}
              className={(filters.interests || []).includes(interest) ? 'skill-pill-active' : 'skill-pill hover:bg-primary/20 transition-colors'}
            >
              {interest}
            </button>
          ))}
        </div>
      </div>

      {/* Clear */}
      {hasFilters && (
        <button onClick={clearAll} className="flex items-center gap-1.5 font-grotesk font-bold text-xs text-ink/50 hover:text-red-500 transition-colors">
          <X size={12} /> Clear all filters
        </button>
      )}
    </div>
  )
}
