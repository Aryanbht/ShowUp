import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import CustomPortfolio from '../components/portfolio/CustomPortfolio'
import NeuralOS from '../components/portfolio/NeuralOS'
import TerminalCore from '../components/portfolio/TerminalCore'
import ObsidianIridescence from '../components/portfolio/ObsidianIridescence'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

export default function PublicPortfolio() {
  const { username } = useParams()
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [selectedProject, setSelectedProject] = useState(null)

  useEffect(() => {
    axios.get(`${API_URL}/api/portfolio/${username}`)
      .then(res => setData(res.data.data))
      .catch(err => {
        if (err.response?.status === 404) setNotFound(true)
      })
      .finally(() => setLoading(false))
  }, [username])

  const handleJoinShowUp = (e) => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('preview') === 'true') {
      if (e && e.preventDefault) e.preventDefault();
      return;
    }
    const token = localStorage.getItem('showup_access_token')
    navigate(token ? '/feed' : '/auth')
  }

  if (loading) return (
    <div style={{
      height: '100vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', fontFamily: 'Inter, sans-serif',
      fontSize: '14px', color: '#999'
    }}>
      Loading portfolio...
    </div>
  )

  if (notFound) return (
    <div style={{
      height: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      fontFamily: 'Inter, sans-serif', gap: '12px'
    }}>
      <p style={{ fontSize: '24px', fontWeight: '700', color: '#1A1A1A', margin: 0 }}>
        Portfolio not found
      </p>
      <p style={{ fontSize: '14px', color: '#999', margin: 0 }}>
        This ShowUp portfolio doesn't exist yet.
      </p>
      <button
        onClick={() => navigate('/auth')}
        style={{
          marginTop: '8px', padding: '10px 24px', background: '#1A1A1A',
          color: '#FFFFFF', border: 'none', borderRadius: '6px',
          fontSize: '14px', cursor: 'pointer'
        }}
      >
        Create yours →
      </button>
    </div>
  )

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

  // Template overrides for midnight / blueprint presets (legacy)
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

  // Template overrides for obsidian_iridescence
  if (customization.template === 'obsidian_iridescence' || customization.template === 'neural_interface') {
    Object.assign(theme, {
      pageBg: '#13131b', textPrimary: '#e4e1ed', cardBg: '#1b1b23',
      border: '#464554', tagBg: '#292932',
      textSecondary: '#c7c4d7',
      accent: '#c0c1ff',
      font: 'Geist',
    })
  }

  if (selectedProject) {
    return (
      <div style={{
        minHeight: '100vh',
        background: theme.pageBg,
        fontFamily: `${theme.font}, sans-serif`,
        color: theme.textPrimary,
        transition: 'all 0.2s ease'
      }}>
        <ProjectDetail
          project={selectedProject}
          theme={theme}
          onBack={() => setSelectedProject(null)}
          student={student}
        />
      </div>
    )
  }

  const props = {
    data,
    handleJoinShowUp,
    selectedProject,
    setSelectedProject
  }

  if (customization.template === 'obsidian_iridescence' || customization.template === 'neural_interface') {
    return <ObsidianIridescence {...props} />
  }

  switch (customization.template) {
    case 'neural_os':
    case 'modern_midnight':
    case 'game_dev_edition':
      return <NeuralOS {...props} />
    case 'terminal_core':
      return <TerminalCore {...props} />
    case 'neural_interface':
      return <NeuralInterface {...props} />
    case 'custom':
    case 'classic':
    case 'midnight':
    case 'blueprint':
    default:
      return <CustomPortfolio {...props} />
  }
}

// ── Project Detail within the portfolio ──────────────
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

      {analysis && analysis.overall_score && (
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
              <p style={{ fontSize: '11px', color: theme.accent, textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 8px' }}>AI Final Summary</p>
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
