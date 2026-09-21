'use client'

import TagInput from '@/components/ui/TagInput'

export default function StepTwo({ data, onChange }) {
  return (
    <div className="flex flex-col gap-5">
      {/* Skills */}
      <div>
        <label className="block font-grotesk font-bold text-xs uppercase tracking-wider mb-2">
          Skills <span className="text-ink/40 normal-case font-inter font-normal text-xs">(press Enter to add)</span>
        </label>
        <TagInput
          tags={data.skills}
          onChange={(skills) => onChange({ skills })}
          placeholder="React, Python, Figma, ML..."
        />
        {data.skills.length === 0 && (
          <p className="font-inter text-xs text-ink/40 mt-1">Add the technologies and tools you know</p>
        )}
        <div className="flex flex-wrap gap-1.5 mt-3">
          {['React', 'Python', 'Node.js', 'Flutter', 'ML/AI', 'Figma', 'Java', 'C++', 'Go', 'Rust', 'Next.js', 'MongoDB'].map((skill) => (
            <button
              key={skill}
              type="button"
              onClick={() => {
                if (!data.skills.includes(skill)) onChange({ skills: [...data.skills, skill] })
              }}
              disabled={data.skills.includes(skill)}
              className={`font-grotesk font-bold text-xs px-2.5 py-1 border-2 border-ink transition-all ${
                data.skills.includes(skill)
                  ? 'bg-primary cursor-default'
                  : 'bg-surface hover:bg-primary/30 cursor-pointer hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-brutal-sm'
              }`}
            >
              {data.skills.includes(skill) ? '✓ ' : '+ '}{skill}
            </button>
          ))}
        </div>
      </div>

      {/* GitHub */}
      <div>
        <label className="block font-grotesk font-bold text-xs uppercase tracking-wider mb-2">
          🐙 GitHub URL <span className="text-ink/40 normal-case font-inter font-normal">(optional)</span>
        </label>
        <input
          type="url"
          value={data.githubUrl}
          onChange={(e) => onChange({ githubUrl: e.target.value })}
          placeholder="https://github.com/yourusername"
          className="input-brutal"
        />
      </div>

      {/* LinkedIn */}
      <div>
        <label className="block font-grotesk font-bold text-xs uppercase tracking-wider mb-2">
          💼 LinkedIn URL <span className="text-ink/40 normal-case font-inter font-normal">(optional)</span>
        </label>
        <input
          type="url"
          value={data.linkedinUrl}
          onChange={(e) => onChange({ linkedinUrl: e.target.value })}
          placeholder="https://linkedin.com/in/yourprofile"
          className="input-brutal"
        />
      </div>
    </div>
  )
}
