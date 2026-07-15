
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

export default function CustomPortfolio({ data, handleJoinShowUp, selectedProject, setSelectedProject }) {
  const { student, customization, projects } = data


  // Build theme from customization
  const theme = {
    pageBg: customization.bg_color,
    textPrimary: customization.text_color,
    accent: customization.accent_color,
    cardBg: customization.card_color,
    font: customization.font,
    textSecondary: customization.text_color + '99',
    border: customization.text_color + '22',
    tagBg: customization.text_color + '11',
  }

  // Template overrides for midnight / blueprint presets
  if (customization.template === 'midnight' && customization.bg_color === '#FFFFFF') {
    Object.assign(theme, {
      pageBg: '#0D0D0D', textPrimary: '#F0F0F0', cardBg: '#161616',
      border: '#2A2A2A', tagBg: '#1A1A1A',
      textSecondary: '#F0F0F099',
    })
  }
  if (customization.template === 'blueprint' && customization.bg_color === '#FFFFFF') {
    Object.assign(theme, {
      pageBg: '#0A1628', textPrimary: '#E8F4FD', cardBg: '#0D1F3C',
      border: '#1A3A5C', tagBg: '#0A1628',
      textSecondary: '#E8F4FD99',
    })
  }

  const skills = Array.isArray(student.skills)
    ? student.skills
    : typeof student.skills === 'string'
    ? student.skills.split(',').map(s => s.trim()).filter(Boolean)
    : []

  const getLevel = (score) => {
    if (score >= 200) return 'Elite'
    if (score >= 100) return 'Notable'
    if (score >= 50) return 'Rising'
    return 'Beginner'
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: theme.pageBg,
      fontFamily: `${theme.font}, sans-serif`,
      color: theme.textPrimary,
      transition: 'all 0.2s ease'
    }}>
      {selectedProject ? (
        <ProjectDetail
          project={selectedProject}
          theme={theme}
          onBack={() => setSelectedProject(null)}
          student={student}
        />
      ) : (
        <>
          {/* HEADER */}
          <div style={{
            borderBottom: `1px solid ${theme.border}`,
            padding: '48px 5% 40px',
            maxWidth: '960px',
            margin: '0 auto'
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '28px', flexWrap: 'wrap' }}>
              {student.avatar_url && (
                <img
                  src={student.avatar_url}
                  alt={student.name}
                  style={{
                    width: '88px', height: '88px', borderRadius: '50%',
                    objectFit: 'cover', border: `2px solid ${theme.border}`, flexShrink: 0
                  }}
                />
              )}
              <div style={{ flex: 1, minWidth: '200px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', marginBottom: '6px' }}>
                  <h1 style={{ fontSize: '32px', fontWeight: '700', margin: 0, color: theme.textPrimary }}>
                    {student.name}
                  </h1>
                  <span style={{
                    fontSize: '12px', padding: '4px 10px',
                    border: `1px solid ${theme.accent}`, color: theme.accent,
                    borderRadius: '4px', fontWeight: '600'
                  }}>
                    ⚡ {getLevel(student.credibility_score)} · {student.credibility_score}
                  </span>
                </div>

                <p style={{ fontSize: '14px', color: theme.textSecondary, margin: '0 0 12px' }}>
                  {student.college}
                  {student.course && ` · ${student.course}`}
                </p>

                <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap' }}>
                  {student.location && (
                    <span style={{ fontSize: '13px', color: theme.textSecondary, display: 'flex', alignItems: 'center', gap: '4px' }}>
                      📍 {student.location}
                    </span>
                  )}
                  {student.github_url && (
                    <a 
                      href={student.github_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      style={{ fontSize: '13px', color: theme.accent, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: '500' }}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
                      </svg>
                      View GitHub
                    </a>
                  )}
                </div>

                {student.bio && (
                  <p style={{
                    fontSize: '15px', color: theme.textPrimary, margin: '0 0 16px',
                    lineHeight: '1.7', maxWidth: '560px'
                  }}>
                    {student.bio}
                  </p>
                )}

                {skills.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {skills.map(skill => (
                      <span key={skill} style={{
                        fontSize: '12px', padding: '4px 10px',
                        background: theme.tagBg, border: `1px solid ${theme.border}`,
                        borderRadius: '4px', color: theme.textPrimary
                      }}>
                        {skill}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Stats row */}
            <div style={{ display: 'flex', gap: '40px', marginTop: '32px', flexWrap: 'wrap' }}>
              {[
                { label: 'PROJECTS', value: projects.length },
                { label: 'CREDIBILITY', value: student.credibility_score },
                { label: 'AI REVIEWS', value: projects.filter(p => p.ai_analysis_used).length },
              ].map(stat => (
                <div key={stat.label}>
                  <p style={{ fontSize: '24px', fontWeight: '700', margin: '0 0 2px', color: theme.textPrimary }}>
                    {stat.value}
                  </p>
                  <p style={{ fontSize: '11px', color: theme.textSecondary, margin: 0, letterSpacing: '0.08em' }}>
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* PROJECTS SECTION */}
          <div style={{ maxWidth: '960px', margin: '0 auto', padding: '40px 5%' }}>
            <h2 style={{
              fontSize: '14px', fontWeight: '600', letterSpacing: '0.08em',
              color: theme.textSecondary, textTransform: 'uppercase', margin: '0 0 24px'
            }}>
              Projects ({projects.length})
            </h2>

            {projects.length === 0 && (
              <p style={{ color: theme.textSecondary, fontSize: '14px' }}>No projects yet.</p>
            )}

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: '20px'
            }}>
              {projects.map(project => (
                <div
                  key={project.id}
                  onClick={() => setSelectedProject(project)}
                  style={{
                    background: theme.cardBg, border: `1px solid ${theme.border}`,
                    borderRadius: '8px', overflow: 'hidden', cursor: 'pointer',
                    transition: 'border-color 0.15s ease',
                  }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = theme.accent}
                  onMouseLeave={e => e.currentTarget.style.borderColor = theme.border}
                >
                  <div style={{ height: '180px', background: theme.border, position: 'relative', overflow: 'hidden' }}>
                    {project.screenshot_url ? (
                      <img src={project.screenshot_url} alt={project.title}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <div style={{
                        width: '100%', height: '100%', display: 'flex',
                        alignItems: 'center', justifyContent: 'center',
                        color: theme.textSecondary, fontSize: '13px'
                      }}>
                        No screenshot
                      </div>
                    )}
                    {project.ai_analysis && project.ai_analysis_used && (
                      <span style={{
                        position: 'absolute', top: '10px', right: '10px',
                        background: theme.accent, color: theme.pageBg,
                        fontSize: '11px', fontWeight: '700',
                        padding: '4px 8px', borderRadius: '4px'
                      }}>
                        AI {project.ai_analysis?.overall_score}/10
                      </span>
                    )}
                  </div>
                  <div style={{ padding: '16px' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: '600', margin: '0 0 8px', color: theme.textPrimary }}>
                      {project.title}
                    </h3>
                    <p style={{
                      fontSize: '13px', color: theme.textSecondary, margin: '0 0 12px',
                      lineHeight: '1.5', display: '-webkit-box',
                      WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden'
                    }}>
                      {project.description}
                    </p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {project.tech_stack?.split(',').slice(0, 3).map(tag => (
                        <span key={tag} style={{
                          fontSize: '11px', padding: '3px 8px',
                          background: theme.tagBg, border: `1px solid ${theme.border}`,
                          borderRadius: '4px', color: theme.textSecondary
                        }}>
                          {tag.trim()}
                        </span>
                      ))}
                    </div>
                    <p style={{ fontSize: '11px', color: theme.textSecondary, margin: '12px 0 0' }}>
                      👁 {project.view_count} views
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* FOOTER */}
          <div style={{
            borderTop: `1px solid ${theme.border}`, padding: '24px 5%',
            maxWidth: '960px', margin: '0 auto',
            display: 'flex', alignItems: 'center',
            justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px'
          }}>
            <p style={{ fontSize: '13px', color: theme.textSecondary, margin: 0 }}>
              Built on <strong style={{ color: theme.textPrimary }}>ShowUp</strong> — your work speaks first.
            </p>
            <button
              onClick={handleJoinShowUp}
              style={{
                padding: '8px 20px', background: theme.accent, color: theme.pageBg,
                border: 'none', borderRadius: '6px', fontSize: '13px',
                fontWeight: '600', cursor: 'pointer'
              }}
            >
              {localStorage.getItem('showup_access_token') ? 'Go to ShowUp →' : 'Create your portfolio →'}
            </button>
          </div>
        </>
      )}
    </div>
  )
}

// ── Project Detail within the portfolio (same theme, no navbar) ──────────────
function ProjectDetail({ project, theme, onBack, student }) {
  const analysis = project.ai_analysis

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 5%', minHeight: '100vh' }}>
      <button
        onClick={onBack}
        style={{
          background: 'none', border: `1px solid ${theme.border}`,
          color: theme.textPrimary, padding: '8px 16px', borderRadius: '6px',
          cursor: 'pointer', fontSize: '13px', marginBottom: '32px',
          display: 'flex', alignItems: 'center', gap: '6px'
        }}
      >
        ← Back to {student.name}'s portfolio
      </button>

      {project.screenshot_url && (
        <img
          src={project.screenshot_url} alt={project.title}
          style={{ width: '100%', borderRadius: '8px', border: `1px solid ${theme.border}`, marginBottom: '32px' }}
        />
      )}

      <h1 style={{ fontSize: '28px', fontWeight: '700', margin: '0 0 12px', color: theme.textPrimary }}>
        {project.title}
      </h1>

      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
        {project.live_url && (
          <a href={project.live_url} target="_blank" rel="noopener noreferrer" style={{
            padding: '8px 16px', background: theme.accent, color: theme.pageBg,
            borderRadius: '6px', fontSize: '13px', fontWeight: '600', textDecoration: 'none'
          }}>
            Live Demo →
          </a>
        )}
        {project.github_url && (
          <a href={project.github_url} target="_blank" rel="noopener noreferrer" style={{
            padding: '8px 16px', background: 'none', color: theme.textPrimary,
            border: `1px solid ${theme.border}`, borderRadius: '6px',
            fontSize: '13px', fontWeight: '600', textDecoration: 'none'
          }}>
            GitHub
          </a>
        )}
      </div>

      <p style={{ fontSize: '15px', color: theme.textPrimary, lineHeight: '1.8', margin: '0 0 24px' }}>
        {project.description}
      </p>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '32px' }}>
        {project.tech_stack?.split(',').map(tag => (
          <span key={tag} style={{
            fontSize: '12px', padding: '5px 12px', background: theme.tagBg,
            border: `1px solid ${theme.border}`, borderRadius: '4px', color: theme.textPrimary
          }}>
            {tag.trim()}
          </span>
        ))}
      </div>

      {analysis && (
        <div style={{ border: `1px solid ${theme.border}`, borderRadius: '8px', padding: '24px', background: theme.cardBg }}>
          <p style={{ fontSize: '11px', fontWeight: '600', letterSpacing: '0.08em', color: theme.textSecondary, textTransform: 'uppercase', margin: '0 0 16px' }}>
            AI Analysis
          </p>

          <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginBottom: '20px' }}>
            <span style={{ fontSize: '48px', fontWeight: '700', color: theme.accent }}>{analysis.overall_score}</span>
            <span style={{ fontSize: '20px', color: theme.textSecondary }}>/10</span>
            <span style={{ fontSize: '13px', color: theme.textSecondary, marginLeft: '8px' }}>{analysis.score_label}</span>
          </div>

          {analysis.project_tagline && (
            <p style={{ fontSize: '15px', fontStyle: 'italic', color: theme.textPrimary, margin: '0 0 20px', lineHeight: '1.6' }}>
              "{analysis.project_tagline}"
            </p>
          )}

          {analysis.dimensions && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '12px', marginBottom: '20px' }}>
              {Object.values(analysis.dimensions).map(dim => (
                <div key={dim.label} style={{ border: `1px solid ${theme.border}`, borderRadius: '6px', padding: '14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <p style={{ fontSize: '11px', color: theme.textSecondary, margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{dim.label}</p>
                    <p style={{ fontSize: '14px', fontWeight: '700', color: theme.accent, margin: 0 }}>{dim.score}/10</p>
                  </div>
                  <p style={{ fontSize: '12px', color: theme.textPrimary, margin: 0, lineHeight: '1.5' }}>{dim.feedback}</p>
                </div>
              ))}
            </div>
          )}

          {analysis.strengths?.length > 0 && (
            <div style={{ marginBottom: '16px' }}>
              <p style={{ fontSize: '11px', color: theme.textSecondary, textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 8px' }}>Strengths</p>
              {analysis.strengths.map((s, i) => (
                <p key={i} style={{ fontSize: '13px', color: theme.textPrimary, margin: '0 0 4px' }}>+ {s}</p>
              ))}
            </div>
          )}

          {analysis.next_steps?.length > 0 && (
            <div style={{ marginBottom: '16px' }}>
              <p style={{ fontSize: '11px', color: theme.textSecondary, textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 8px' }}>Next Steps</p>
              {analysis.next_steps.map((s, i) => (
                <p key={i} style={{ fontSize: '13px', color: theme.textPrimary, margin: '0 0 4px' }}>→ {s}</p>
              ))}
            </div>
          )}

          {analysis.brutal_honest_line && (
            <div style={{ border: `1px solid ${theme.accent}`, borderRadius: '6px', padding: '14px', marginTop: '16px' }}>
              <p style={{ fontSize: '11px', color: theme.accent, textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 8px' }}>Senior Review</p>
              <p style={{ fontSize: '13px', color: theme.textPrimary, margin: 0, lineHeight: '1.6', fontStyle: 'italic' }}>
                "{analysis.brutal_honest_line}"
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
