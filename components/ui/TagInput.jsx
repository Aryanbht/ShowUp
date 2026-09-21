'use client'

import { useState } from 'react'
import { SkillPill } from './SkillPill'

export default function TagInput({ tags, onChange, placeholder = 'Type and press Enter...', max = 20 }) {
  const [input, setInput] = useState('')

  const handleKeyDown = (e) => {
    if ((e.key === 'Enter' || e.key === ',') && input.trim()) {
      e.preventDefault()
      const newTag = input.trim().replace(/,$/, '')
      if (newTag && !tags.includes(newTag) && tags.length < max) {
        onChange([...tags, newTag])
      }
      setInput('')
    } else if (e.key === 'Backspace' && !input && tags.length > 0) {
      onChange(tags.slice(0, -1))
    }
  }

  const removeTag = (index) => {
    onChange(tags.filter((_, i) => i !== index))
  }

  return (
    <div className="input-brutal min-h-[48px] flex flex-wrap gap-2 cursor-text" onClick={(e) => e.currentTarget.querySelector('input')?.focus()}>
      {tags.map((tag, i) => (
        <SkillPill key={i} label={tag} onRemove={() => removeTag(i)} />
      ))}
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={tags.length === 0 ? placeholder : ''}
        className="flex-1 min-w-[120px] bg-transparent outline-none text-sm font-inter text-ink placeholder:text-ink/40"
      />
    </div>
  )
}
