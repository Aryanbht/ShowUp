'use client'

import { useRef, useState } from 'react'
import Image from 'next/image'
import { Upload, Camera } from 'lucide-react'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import toast from 'react-hot-toast'

const HACKATHON_INTERESTS = [
  'Web Dev', 'App Dev', 'AI-ML', 'Blockchain', 'Design', 'Other',
]

export default function StepThree({ data, onChange }) {
  const fileInputRef = useRef(null)
  const [uploading, setUploading] = useState(false)

  const handleAvatarUpload = async (file) => {
    if (!file) return
    if (!file.type.startsWith('image/')) { toast.error('Select an image file'); return }
    if (file.size > 5 * 1024 * 1024) { toast.error('Image must be under 5MB'); return }

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET)

      const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
      const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: 'POST',
        body: formData,
      })
      if (!res.ok) throw new Error('Upload failed')
      const uploadData = await res.json()
      onChange({ avatar: uploadData.secure_url })
      toast.success('Avatar uploaded!')
    } catch {
      toast.error('Failed to upload avatar')
    }
    setUploading(false)
  }

  const toggleInterest = (interest) => {
    const current = data.hackathonInterests || []
    const updated = current.includes(interest)
      ? current.filter((i) => i !== interest)
      : [...current, interest]
    onChange({ hackathonInterests: updated })
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Avatar Upload */}
      <div>
        <label className="block font-grotesk font-bold text-xs uppercase tracking-wider mb-3">
          Profile Photo <span className="text-red-500">*</span>
        </label>
        <div className="flex items-center gap-6">
          {/* Preview */}
          <div
            className="relative w-24 h-24 border-3 border-ink bg-canvas flex items-center justify-center cursor-pointer overflow-hidden flex-shrink-0 group"
            onClick={() => fileInputRef.current?.click()}
          >
            {uploading ? (
              <LoadingSpinner size="md" />
            ) : data.avatar ? (
              <>
                <Image src={data.avatar} alt="Avatar" fill className="object-cover" />
                <div className="absolute inset-0 bg-ink/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Camera size={20} className="text-primary" />
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center gap-1 text-ink/30">
                <Camera size={28} />
                <span className="font-grotesk font-bold text-[10px] uppercase">Upload</span>
              </div>
            )}
          </div>

          <div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="btn-secondary flex items-center gap-2 text-xs mb-2"
            >
              {uploading ? <LoadingSpinner size="sm" /> : <Upload size={13} />}
              {data.avatar ? 'Change Photo' : 'Upload Photo'}
            </button>
            <p className="font-inter text-xs text-ink/40">JPG, PNG · Max 5MB</p>
          </div>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => handleAvatarUpload(e.target.files?.[0])}
        />
      </div>

      {/* Teaming Toggle */}
      <div className="flex items-center justify-between bg-cream border-3 border-ink p-4">
        <div>
          <p className="font-grotesk font-bold text-sm text-ink">Open to Hackathon Teaming</p>
          <p className="font-inter text-xs text-ink/50 mt-0.5">Show up in the teammates finder</p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={data.lookingForTeam}
          onClick={() => onChange({ lookingForTeam: !data.lookingForTeam, hackathonInterests: data.lookingForTeam ? [] : data.hackathonInterests })}
          className={`relative w-12 h-6 border-3 border-ink transition-all duration-200 ${data.lookingForTeam ? 'bg-primary' : 'bg-surface-dim'}`}
        >
          <span
            className={`absolute top-0.5 w-4 h-4 bg-ink transition-all duration-200 ${
              data.lookingForTeam ? 'right-0.5' : 'left-0.5'
            }`}
          />
        </button>
      </div>

      {/* Hackathon Interests (only if looking for team) */}
      {data.lookingForTeam && (
        <div className="animate-fade-in">
          <label className="block font-grotesk font-bold text-xs uppercase tracking-wider mb-3">
            Hackathon Interests
          </label>
          <div className="flex flex-wrap gap-2">
            {HACKATHON_INTERESTS.map((interest) => (
              <button
                key={interest}
                type="button"
                onClick={() => toggleInterest(interest)}
                className={
                  (data.hackathonInterests || []).includes(interest)
                    ? 'skill-pill-active'
                    : 'skill-pill hover:bg-primary/20 transition-colors'
                }
              >
                {interest}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
