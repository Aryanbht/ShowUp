import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api';

export default function GitHubCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { updateUser, user } = useAuth();
  const [status, setStatus] = useState('processing'); // processing | success | error

  useEffect(() => {
    const github = searchParams.get('github');
    const username = searchParams.get('username');
    const reason = searchParams.get('reason');

    if (github === 'success' && username) {
      // Refresh the user data from API so context has updated github_username
      api.get('/api/auth/me')
        .then(res => {
          updateUser(res.data.data);
          setStatus('success');
          setTimeout(() => navigate('/profile/edit'), 1800);
        })
        .catch(() => {
          setStatus('success');
          setTimeout(() => navigate('/profile/edit'), 1800);
        });
    } else {
      console.error('GitHub connect failed:', reason);
      setStatus('error');
      setTimeout(() => navigate('/profile/edit?github=error'), 2000);
    }
  }, []);

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#FAFAFA',
      fontFamily: 'Inter, sans-serif',
      gap: '16px',
    }}>
      {status === 'processing' && (
        <>
          <div style={{
            width: '48px', height: '48px', border: '3px solid #e0e0e0',
            borderTop: '3px solid #1A1A1A', borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
          }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          <p style={{ color: '#666', fontSize: '14px', margin: 0 }}>Connecting your GitHub account…</p>
        </>
      )}

      {status === 'success' && (
        <>
          <div style={{
            width: '56px', height: '56px', borderRadius: '50%',
            background: '#1A1A1A', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="white">
              <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
            </svg>
          </div>
          <p style={{ fontWeight: '700', fontSize: '18px', color: '#1A1A1A', margin: 0 }}>
            GitHub Connected! ✓
          </p>
          <p style={{ color: '#666', fontSize: '13px', margin: 0 }}>Redirecting back to your profile…</p>
        </>
      )}

      {status === 'error' && (
        <>
          <div style={{
            width: '56px', height: '56px', borderRadius: '50%',
            background: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{ color: 'white', fontSize: '24px', fontWeight: 'bold' }}>✕</span>
          </div>
          <p style={{ fontWeight: '700', fontSize: '18px', color: '#1A1A1A', margin: 0 }}>
            Connection Failed
          </p>
          <p style={{ color: '#666', fontSize: '13px', margin: 0 }}>Redirecting back…</p>
        </>
      )}
    </div>
  );
}
