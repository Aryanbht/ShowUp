import { useNavigate } from 'react-router-dom'

export default function Privacy() {
  const navigate = useNavigate()

  return (
    <div style={{
      minHeight: '100vh',
      background: '#FFFFFF',
      fontFamily: 'Inter, sans-serif',
      color: '#1A1A1A'
    }}>

      {/* Header */}
      <div style={{
        borderBottom: '1px solid #E5E5E5',
        padding: '16px 5%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <span
          onClick={() => navigate('/')}
          style={{
            fontSize: '18px',
            fontWeight: '700',
            cursor: 'pointer',
            color: '#1A1A1A'
          }}
        >
          ShowUp.
        </span>
        <button
          onClick={() => navigate(-1)}
          style={{
            background: 'none',
            border: '1px solid #E5E5E5',
            borderRadius: '6px',
            padding: '6px 14px',
            fontSize: '13px',
            cursor: 'pointer',
            color: '#666'
          }}
        >
          ← Back
        </button>
      </div>

      {/* Content */}
      <div style={{
        maxWidth: '720px',
        margin: '0 auto',
        padding: '60px 5%'
      }}>

        <p style={{
          fontSize: '12px',
          color: '#999',
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          margin: '0 0 12px'
        }}>
          Legal
        </p>

        <h1 style={{
          fontSize: '36px',
          fontWeight: '700',
          margin: '0 0 8px',
          color: '#1A1A1A'
        }}>
          Privacy Policy
        </h1>

        <p style={{
          fontSize: '14px',
          color: '#999',
          margin: '0 0 48px'
        }}>
          Last updated: July 2026
        </p>

        {[
          {
            title: '1. Who We Are',
            content: 'ShowUp is a student portfolio and credibility platform built for Indian college students. We help students showcase their projects, get AI-powered feedback, connect with peers, and get discovered by opportunities. ShowUp is built and operated by students, for students.'
          },
          {
            title: '2. What Data We Collect',
            content: `When you create an account we collect:
- Your name, email address, and college name
- Profile photo if you choose to upload one
- Bio, skills, and graduation details you add to your profile
- Projects you upload including titles, descriptions, screenshots, and links
- GitHub repository data when you use our import feature
- Messages sent through our chat feature
- Voice notes recorded and sent in chat

We also automatically collect basic usage data — pages visited, features used, and general location (city level) to improve the platform.`
          },
          {
            title: '3. How We Use Your Data',
            content: `We use your data to:
- Provide and improve the ShowUp platform
- Generate AI analysis of your projects via Google Gemini
- Display your public portfolio to visitors
- Send verification codes and important account emails
- Show your profile in the discovery and collaboration features
- Calculate your credibility score based on platform activity

We do not sell your data to anyone. Ever.`
          },
          {
            title: '4. Third Party Services',
            content: `ShowUp uses the following trusted third-party services to operate:
- Google OAuth — for login authentication
- Google Gemini AI — for project analysis
- Supabase — for secure database storage
- Cloudinary — for image and voice note storage
- Resend — for sending verification emails
- Railway/Render — for backend hosting
- Vercel — for frontend hosting

Each of these services has their own privacy policy governing how they handle data.`
          },
          {
            title: '5. What Is Public',
            content: `By default the following is visible to anyone who visits your portfolio link:
- Your name, college, bio, and skills
- Projects you have uploaded
- Your credibility score and level
- AI analysis results (unless you set them to private)

You control the visibility of your AI analysis results. You can set any analysis to private from your project settings.

Your email address, messages, and voice notes are never public.`
          },
          {
            title: '6. Data Storage and Security',
            content: 'Your data is stored securely on Supabase PostgreSQL servers. We use JWT tokens for authentication, HTTPS for all data transmission, and rate limiting to prevent abuse. Passwords are hashed and never stored in plain text. We take reasonable measures to protect your information but no system is 100% secure.'
          },
          {
            title: '7. Your Rights',
            content: `You have the right to:
- Access all data we hold about you
- Edit your profile information at any time
- Delete your account and all associated data from Settings
- Set your AI analysis results to private
- Block users who make you uncomfortable
- Report abusive content or behavior

To request a full export of your data contact us at the email below.`
          },
          {
            title: '8. Data Retention',
            content: 'We keep your data for as long as your account is active. When you delete your account we permanently delete your profile, projects, messages, and all associated data within 30 days. Some anonymised usage data may be retained for analytics.'
          },
          {
            title: '9. Children and Age',
            content: 'ShowUp is intended for users aged 13 and above. If you are under 18 please ensure you have parental consent before creating an account. We do not knowingly collect data from children under 13.'
          },
          {
            title: '10. Changes to This Policy',
            content: 'We may update this privacy policy as ShowUp grows. We will notify you of significant changes via email or an in-app notice. Continued use of ShowUp after changes means you accept the updated policy.'
          },
          {
            title: '11. Contact Us',
            content: 'If you have any questions about this privacy policy or how we handle your data please contact us at:\n\nEmail: aryanmusicbht@gmail.com\nPlatform: show-up-ashy.vercel.app'
          }
        ].map((section, index) => (
          <div key={index} style={{ marginBottom: '40px' }}>
            <h2 style={{
              fontSize: '18px',
              fontWeight: '600',
              margin: '0 0 12px',
              color: '#1A1A1A'
            }}>
              {section.title}
            </h2>
            <p style={{
              fontSize: '15px',
              color: '#444',
              lineHeight: '1.8',
              margin: 0,
              whiteSpace: 'pre-line'
            }}>
              {section.content}
            </p>
          </div>
        ))}

        {/* Divider */}
        <div style={{
          borderTop: '1px solid #E5E5E5',
          paddingTop: '32px',
          marginTop: '40px'
        }}>
          <p style={{ fontSize: '13px', color: '#999', margin: 0 }}>
            ShowUp · Built by students, for students ·{' '}
            <span
              onClick={() => navigate('/terms')}
              style={{ color: '#1A1A1A', cursor: 'pointer', textDecoration: 'underline' }}
            >
              Terms of Service
            </span>
          </p>
        </div>
      </div>
    </div>
  )
}
