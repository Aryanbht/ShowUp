import { useNavigate } from 'react-router-dom'

export default function Terms() {
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
          Terms of Service
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
            title: '1. Acceptance of Terms',
            content: 'By creating an account on ShowUp you agree to these Terms of Service. If you do not agree please do not use the platform. These terms apply to all users of ShowUp including students, visitors, and any future collaborators or partners.'
          },
          {
            title: '2. Who Can Use ShowUp',
            content: `ShowUp is open to:
- Students and recent graduates looking to showcase their work
- Developers and builders at any stage
- Anyone interested in discovering student talent

You must be at least 13 years old to use ShowUp. If you are under 18 you confirm you have parental consent to use the platform.`
          },
          {
            title: '3. Your Account',
            content: `You are responsible for:
- Keeping your account credentials secure
- All activity that happens under your account
- Providing accurate information in your profile

Do not share your account with others. If you suspect your account has been compromised contact us immediately.`
          },
          {
            title: '4. What You Can Upload',
            content: `You can upload:
- Your own projects, code, and creative work
- Screenshots and images you have the right to use
- Links to your GitHub repositories and live projects
- A professional bio and skill information

All content you upload must be your own original work or content you have the rights to share.`
          },
          {
            title: '5. What You Cannot Do',
            content: `The following are strictly prohibited on ShowUp:
- Uploading content that belongs to someone else without permission
- Harassing, threatening, or abusing other users
- Sending spam connection requests or messages
- Impersonating another person or organisation
- Uploading inappropriate, offensive, or adult content
- Using ShowUp to scrape or harvest user data
- Attempting to hack, exploit, or disrupt the platform
- Creating fake accounts or misrepresenting your identity
- Using abusive or profane language in any public field

Violation of these rules can result in immediate account suspension.`
          },
          {
            title: '6. Your Content',
            content: 'You own everything you upload to ShowUp. By uploading content you give ShowUp a non-exclusive licence to display it on the platform and in your public portfolio. You can delete your content at any time. When you delete your account all your content is permanently removed.'
          },
          {
            title: '7. AI Analysis',
            content: 'ShowUp uses Google Gemini AI to analyse your projects. The AI analysis is generated automatically and represents a general technical assessment. It is not a professional code review or career advice. ShowUp does not guarantee any specific outcome from AI analysis results including job offers or internship placements.'
          },
          {
            title: '8. Chat and Messaging',
            content: 'ShowUp provides real-time chat between connected users. You are responsible for the content of your messages. Do not use the chat feature to harass, threaten, or send inappropriate content to other users. We reserve the right to review reported conversations and take action including account suspension.'
          },
          {
            title: '9. Credibility Score',
            content: 'Your credibility score is calculated based on your platform activity including projects uploaded, AI analyses completed, and community engagement. The score is for informational purposes on the platform only. ShowUp makes no guarantees about how third parties will interpret or value your credibility score.'
          },
          {
            title: '10. Availability',
            content: 'We work hard to keep ShowUp running smoothly but we cannot guarantee 100% uptime. We may occasionally take the platform down for maintenance or updates. We are not liable for any loss caused by platform downtime or technical issues.'
          },
          {
            title: '11. Termination',
            content: 'You can delete your account at any time from Settings. We reserve the right to suspend or terminate accounts that violate these terms without prior notice. If your account is terminated for violations you may not create a new account without our permission.'
          },
          {
            title: '12. Limitation of Liability',
            content: 'ShowUp is provided as-is. We are not liable for any indirect, incidental, or consequential damages arising from your use of the platform. Our total liability to you for any claim shall not exceed the amount you have paid us in the past 12 months which for free users is zero.'
          },
          {
            title: '13. Changes to Terms',
            content: 'We may update these terms as ShowUp grows. We will notify you of significant changes via email or an in-app notice at least 7 days before they take effect. Continued use of ShowUp after changes means you accept the updated terms.'
          },
          {
            title: '14. Contact',
            content: 'For any questions about these terms or to report a violation contact us at:\n\nEmail: your@email.com\nPlatform: show-up-ashy.vercel.app'
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
              onClick={() => navigate('/privacy')}
              style={{ color: '#1A1A1A', cursor: 'pointer', textDecoration: 'underline' }}
            >
              Privacy Policy
            </span>
          </p>
        </div>
      </div>
    </div>
  )
}
