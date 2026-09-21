'use client'

import { useState } from 'react'
import ProjectCard from '@/components/feed/ProjectCard'
import ProjectModal from '@/components/feed/ProjectModal'

export default function ProfileProjectGrid({ projects }) {
  const [selectedProject, setSelectedProject] = useState(null)
  const [localProjects, setLocalProjects] = useState(projects)

  const handleLike = (projectId, liked) => {
    setLocalProjects((prev) =>
      prev.map((p) =>
        p.id === projectId
          ? { ...p, liked, _count: { ...p._count, likes: liked ? p._count.likes + 1 : p._count.likes - 1 } }
          : p
      )
    )
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {localProjects.map((project) => (
          <ProjectCard
            key={project.id}
            project={project}
            onClick={setSelectedProject}
            onLike={handleLike}
          />
        ))}
      </div>

      {selectedProject && (
        <ProjectModal
          project={selectedProject}
          onClose={() => setSelectedProject(null)}
          onLike={handleLike}
        />
      )}
    </>
  )
}
