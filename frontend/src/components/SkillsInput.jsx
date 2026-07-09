import { useState, useRef, useEffect } from 'react'
import { SKILLS_LIST } from '../data/skills'
import api from '../api'

export default function SkillsInput({ value = [], onChange }) {
  const [inputVal, setInputVal] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [activeSuggestion, setActiveSuggestion] = useState(-1)
  const [showDropdown, setShowDropdown] = useState(false)
  const [customSkills, setCustomSkills] = useState([])
  const inputRef = useRef(null)
  const dropdownRef = useRef(null)

  // Fetch custom skills from backend
  useEffect(() => {
    const fetchCustomSkills = async () => {
      try {
        const res = await api.get('/api/skills/custom');
        if (res.data && res.data.success) {
          setCustomSkills(res.data.data || []);
        }
      } catch (err) {
        console.error("Failed to fetch custom skills", err);
      }
    };
    fetchCustomSkills();
  }, []);

  // Filter suggestions based on input
  const getSuggestions = (query) => {
    if (!query.trim() || query.length < 1) return []
    const q = query.toLowerCase()

    const combinedList = Array.from(new Set([...SKILLS_LIST, ...customSkills]));

    // Exact starts-with matches first, then contains
    const startsWith = combinedList.filter(s =>
      s.toLowerCase().startsWith(q) && !value.includes(s)
    )
    const contains = combinedList.filter(s =>
      s.toLowerCase().includes(q) &&
      !s.toLowerCase().startsWith(q) &&
      !value.includes(s)
    )
    return [...startsWith, ...contains].slice(0, 8)
  }

  const handleInputChange = (e) => {
    const val = e.target.value
    setInputVal(val)
    const filtered = getSuggestions(val)
    setSuggestions(filtered)
    setShowDropdown(filtered.length > 0 || val.trim().length > 0)
    setActiveSuggestion(-1)
  }

  const addSkill = async (skill) => {
    const trimmed = skill.trim()
    if (!trimmed || value.includes(trimmed)) return

    // Add to current list
    const newSkills = [...value, trimmed]
    onChange(newSkills)
    setInputVal('')
    setSuggestions([])
    setShowDropdown(false)
    setActiveSuggestion(-1)

    // If skill not in master list — save to backend for future suggestions
    if (!SKILLS_LIST.includes(trimmed)) {
      try {
        await api.post('/api/skills/custom', { skill: trimmed })
      } catch {}
      // Fail silently — skill is still added locally
    }
  }

  const removeSkill = (skillToRemove) => {
    onChange(value.filter(s => s !== skillToRemove))
  }

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveSuggestion(prev =>
        prev < suggestions.length - 1 ? prev + 1 : prev
      )
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveSuggestion(prev => prev > 0 ? prev - 1 : -1)
    } else if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      if (activeSuggestion >= 0 && suggestions[activeSuggestion]) {
        addSkill(suggestions[activeSuggestion])
      } else if (inputVal.trim()) {
        addSkill(inputVal)
      }
    } else if (e.key === 'Backspace' && !inputVal && value.length > 0) {
      removeSkill(value[value.length - 1])
    } else if (e.key === 'Escape') {
      setShowDropdown(false)
    }
  }

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target) &&
          inputRef.current && !inputRef.current.contains(e.target)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  return (
    <div style={{ position: 'relative' }}>
      <label style={{
        display: 'block',
        fontSize: '12px',
        fontWeight: '600',
        color: '#666',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        marginBottom: '8px'
      }}>
        Skills
      </label>

      {/* Skills tags + input box */}
      <div
        onClick={() => inputRef.current?.focus()}
        style={{
          minHeight: '48px',
          padding: '8px 12px',
          border: '1.5px solid #E5E5E5',
          borderRadius: '6px',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '6px',
          alignItems: 'center',
          cursor: 'text',
          background: '#FFFFFF'
        }}
      >
        {/* Existing skill tags */}
        {value.map(skill => (
          <span
            key={skill}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              background: '#F5F5F5',
              border: '1px solid #E5E5E5',
              borderRadius: '4px',
              padding: '4px 8px',
              fontSize: '13px',
              color: '#333',
              fontWeight: '500'
            }}
          >
            {skill}
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); removeSkill(skill) }}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#999',
                fontSize: '14px',
                lineHeight: 1,
                padding: '0',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              ×
            </button>
          </span>
        ))}

        {/* Text input */}
        <input
          ref={inputRef}
          type="text"
          value={inputVal}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (inputVal.trim()) setShowDropdown(true)
          }}
          placeholder={value.length === 0 ? 'Type a skill and press Enter...' : ''}
          style={{
            border: 'none',
            outline: 'none',
            fontSize: '13px',
            flex: 1,
            minWidth: '140px',
            padding: '4px 0',
            background: 'transparent'
          }}
        />
      </div>

      <p style={{ fontSize: '11px', color: '#999', margin: '6px 0 0' }}>
        Type to search · Press Enter or comma to add · Backspace to remove last
      </p>

      {/* Dropdown suggestions */}
      {showDropdown && (
        <div
          ref={dropdownRef}
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            background: '#FFFFFF',
            border: '1.5px solid #E5E5E5',
            borderRadius: '6px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
            zIndex: 100,
            maxHeight: '240px',
            overflowY: 'auto',
            marginTop: '4px'
          }}
        >
          {suggestions.length > 0 ? (
            suggestions.map((suggestion, index) => (
              <div
                key={suggestion}
                onMouseDown={() => addSkill(suggestion)}
                style={{
                  padding: '10px 14px',
                  fontSize: '13px',
                  cursor: 'pointer',
                  background: index === activeSuggestion ? '#F5F5F5' : '#FFFFFF',
                  color: '#1A1A1A',
                  borderBottom: index < suggestions.length - 1 ? '1px solid #F0F0F0' : 'none'
                }}
              >
                {suggestion}
              </div>
            ))
          ) : inputVal.trim() ? (
            <div
              onMouseDown={() => addSkill(inputVal)}
              style={{
                padding: '10px 14px',
                fontSize: '13px',
                cursor: 'pointer',
                color: '#666',
                fontStyle: 'italic'
              }}
            >
              Add "{inputVal}" as custom skill
            </div>
          ) : null}
        </div>
      )}
    </div>
  )
}
