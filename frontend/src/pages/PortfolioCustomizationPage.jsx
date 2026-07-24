import { useState, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import api from "../api";
import { useAuth } from "../context/AuthContext";

const PRESET_TEMPLATES = {
  neural_os: { bg: '#131313', text: '#e5e2e1', accent: '#00f3ff', card: '#1c1b1b', font: 'Hanken Grotesk' },
  terminal_core: { bg: '#131313', text: '#e5e2e1', accent: '#4be277', card: '#000000', font: 'JetBrains Mono' },
  obsidian_iridescence: { bg: '#13131b', text: '#e4e1ed', accent: '#c0c1ff', card: '#1b1b23', font: 'Geist' },
  shaolin_zen: { bg: '#121414', text: '#e1e3e3', accent: '#d84315', card: '#1e2020', font: 'Libre Caslon Text' },
};

export default function PortfolioCustomizationPage() {
  const { user, updateUser } = useAuth();

  const [template, setTemplate]           = useState(user?.portfolio_template  || 'terminal_core');
  const [bgColor, setBgColor]             = useState(user?.portfolio_bg_color   || '#131313');
  const [textColor, setTextColor]         = useState(user?.portfolio_text_color || '#e5e2e1');
  const [accentColor, setAccentColor]     = useState(user?.portfolio_accent_color || '#4be277');
  const [cardColor, setCardColor]         = useState(user?.portfolio_card_color  || '#1c1b1b');
  const [portfolioFont, setPortfolioFont] = useState(user?.portfolio_font || 'JetBrains Mono');
  const [username, setUsername]           = useState(user?.username || '');
  const [usernameError, setUsernameError] = useState('');
  const [usernameChecking, setUsernameChecking] = useState(false);
  const [custSaving, setCustSaving]       = useState(false);
  const [custMsg, setCustMsg]             = useState('');
  const [previewView, setPreviewView]     = useState('desktop');
  const [previewKey, setPreviewKey]       = useState(0);
  const usernameTimer = useRef(null);

  const handleTemplateChange = async (tId) => {
    setTemplate(tId);
    if (tId !== 'custom' && PRESET_TEMPLATES[tId]) {
      setBgColor(PRESET_TEMPLATES[tId].bg);
      setTextColor(PRESET_TEMPLATES[tId].text);
      setAccentColor(PRESET_TEMPLATES[tId].accent);
      setCardColor(PRESET_TEMPLATES[tId].card);
      setPortfolioFont(PRESET_TEMPLATES[tId].font);
    }
    // Auto-save template immediately, then reload preview
    try {
      const res = await api.patch('/api/portfolio/customization', { template: tId });
      updateUser({ ...user, ...res.data.data });
      setPreviewKey(k => k + 1);
    } catch { /* silent */ }
  };

  const handleSaveCustomization = async () => {
    if (usernameError) return;
    setCustSaving(true);
    setCustMsg('');
    try {
      const res = await api.patch('/api/portfolio/customization', {
        template,
        bg_color:     bgColor,
        text_color:   textColor,
        accent_color: accentColor,
        card_color:   cardColor,
        font:         portfolioFont,
        username,
      });
      updateUser({ ...user, ...res.data.data });
      setCustMsg('Portfolio saved ✓');
      setPreviewKey(k => k + 1);
      setTimeout(() => setCustMsg(''), 3000);
    } catch (err) {
      setCustMsg(err.response?.data?.message || 'Failed to save');
    } finally {
      setCustSaving(false);
    }
  };

  const checkUsernameAvailability = useCallback(async (val) => {
    if (!val || val === user?.username) { setUsernameError(''); return; }
    if (val.length < 3) { setUsernameError('Username must be at least 3 characters'); return; }
    setUsernameChecking(true);
    try {
      await api.get(`/api/portfolio/check-username?username=${val}`);
      setUsernameError('');
    } catch (err) {
      setUsernameError(err.response?.data?.message || 'Username already taken — choose another');
    } finally {
      setUsernameChecking(false);
    }
  }, [user?.username]);

  const handleUsernameChange = (e) => {
    const val = e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '');
    setUsername(val);
    setUsernameError('');
    clearTimeout(usernameTimer.current);
    usernameTimer.current = setTimeout(() => checkUsernameAvailability(val), 600);
  };

  return (
    <div className="flex min-h-screen w-full bg-surface-container overflow-x-hidden">
      <Navbar />

      <main className="flex-1 min-w-0 w-full md:ml-64 pb-24 md:pb-0">
        {/* Header */}
        <div className="border-b-2 border-outline-variant px-4 py-4 sticky top-0 z-20 bg-surface-container flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="font-grotesk font-bold text-lg sm:text-xl text-on-surface">Portfolio</h1>
            <p className="label-mono text-on-surface-variant mt-0.5">Customize your public portfolio page</p>
          </div>
          <div className="flex items-center gap-3">
            {custMsg && (
              <p style={{ fontSize: '13px', color: custMsg.includes('✓') ? '#16A34A' : '#FF4444' }}>
                {custMsg}
              </p>
            )}
            <button
              type="button"
              onClick={handleSaveCustomization}
              disabled={custSaving || !!usernameError}
              className="btn-primary py-2 px-4 text-sm"
            >
              {custSaving ? (
                <>
                  <span className="material-symbols-outlined text-base animate-spin">progress_activity</span>
                  Saving...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-base">save</span>
                  Save Portfolio
                </>
              )}
            </button>
          </div>
        </div>

        <div className="w-full max-w-xl mx-auto px-4 py-6 space-y-6">

          {/* ── Portfolio URL ── */}
          <div>
            <label style={{ fontSize: '12px', fontWeight: '600', color: '#8A8AAE', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '8px' }}>
              Your Portfolio URL
            </label>
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '13px', color: '#8A8AAE' }}>{window.location.origin}/portfolio/</span>
              <div style={{ position: 'relative' }}>
                <input
                  value={username}
                  onChange={handleUsernameChange}
                  className="placeholder-white/40 outline-none"
                  style={{
                    padding: '8px 12px',
                    border: `1.5px solid ${usernameError ? '#EF4444' : (usernameError === '' && username && username !== user?.username ? '#10B981' : 'rgba(255,255,255,0.1)')}`,
                    borderRadius: '6px',
                    fontSize: '13px',
                    width: '160px',
                    background: 'rgba(255,255,255,0.03)',
                    color: '#fff',
                  }}
                  placeholder="yourusername"
                />
                {usernameChecking && (
                  <span style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', fontSize: '11px', color: '#8A8AAE' }}>…</span>
                )}
              </div>
            </div>
            {usernameError && (
              <p style={{ fontSize: '11px', color: '#EF4444', margin: '6px 0 0', display: 'flex', alignItems: 'center', gap: '4px' }}>⚠ {usernameError}</p>
            )}
            {/* Quick-copy of full URL */}
            <div className="flex items-center gap-2 mt-3 border-2 border-outline-variant p-3 bg-surface-container-low min-w-0">
              <code className="font-mono text-xs text-primary flex-1 min-w-0 truncate block">
                {window.location.origin}/portfolio/{username || user?.username || user?.id}
              </code>
              <button
                type="button"
                onClick={() => navigator.clipboard.writeText(`${window.location.origin}/portfolio/${username || user?.username || user?.id}`)}
                className="border border-outline-variant p-1.5 hover:bg-surface-container transition-colors flex-shrink-0"
                title="Copy link"
              >
                <span className="material-symbols-outlined text-sm">content_copy</span>
              </button>
              <a
                href={`/portfolio/${username || user?.username || user?.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="border border-outline-variant p-1.5 hover:bg-surface-container transition-colors flex-shrink-0"
                title="Open portfolio"
              >
                <span className="material-symbols-outlined text-sm">open_in_new</span>
              </a>
            </div>
          </div>

          {/* ── Template Picker ── */}
          <div>
            <label style={{ fontSize: '12px', fontWeight: '600', color: '#666', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '12px' }}>
              Template
            </label>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              {[
                { id: 'neural_os',            name: 'Neural OS',            bg: '#101415', accent: '#00f3ff' },
                { id: 'terminal_core',         name: 'Terminal Core',        bg: '#131313', accent: '#4be277' },
                { id: 'obsidian_iridescence',  name: 'Obsidian Iridescence', bg: '#0e131f', accent: '#8aebff' },
                { id: 'shaolin_zen',           name: 'Shaolin Zen',          bg: '#121414', accent: '#d84315' },
              ].map(t => (
                <div
                  key={t.id}
                  onClick={() => handleTemplateChange(t.id)}
                  style={{
                    width: '100px',
                    cursor: 'pointer',
                    border: template === t.id ? '2px solid #8b5cf6' : '1.5px solid rgba(255,255,255,0.1)',
                    borderRadius: '6px',
                    overflow: 'hidden',
                    transition: 'border-color 0.15s',
                  }}
                >
                  <div style={{ height: '60px', background: t.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ width: '40px', height: '6px', background: t.accent, borderRadius: '2px' }} />
                  </div>
                  <div style={{ padding: '6px 8px', background: '#1a1a2e' }}>
                    <p style={{ fontSize: '11px', fontWeight: '500', margin: 0, color: '#ccc', textAlign: 'center' }}>{t.name}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Live Preview ── */}
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <p style={{ fontSize: '12px', fontWeight: '600', color: '#8A8AAE', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 4px' }}>Live Preview</p>
                <p style={{ fontSize: '11px', color: '#666', margin: 0 }}>See how your portfolio looks</p>
              </div>
              <div style={{ display: 'flex', gap: '4px', background: '#1a1a2e', borderRadius: '8px', padding: '3px' }}>
                <button
                  type="button"
                  onClick={() => setPreviewView('desktop')}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 14px', borderRadius: '6px', border: 'none', fontSize: '12px', fontWeight: '500', cursor: 'pointer', background: previewView === 'desktop' ? '#2d2d4e' : 'transparent', color: previewView === 'desktop' ? '#DDD6FE' : '#777', boxShadow: previewView === 'desktop' ? '0 1px 4px rgba(0,0,0,0.3)' : 'none', transition: 'all 0.2s' }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>desktop_windows</span>
                  Desktop
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewView('mobile')}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 14px', borderRadius: '6px', border: 'none', fontSize: '12px', fontWeight: '500', cursor: 'pointer', background: previewView === 'mobile' ? '#2d2d4e' : 'transparent', color: previewView === 'mobile' ? '#DDD6FE' : '#777', boxShadow: previewView === 'mobile' ? '0 1px 4px rgba(0,0,0,0.3)' : 'none', transition: 'all 0.2s' }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>smartphone</span>
                  Mobile
                </button>
              </div>
            </div>

            {/* Preview frame */}
            <div style={{ background: '#0d0d1a', borderRadius: '10px', padding: '12px', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: previewView === 'desktop' ? '420px' : '580px' }}>
              {previewView === 'desktop' ? (
                <div style={{ width: '100%', borderRadius: '8px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 4px 24px rgba(0,0,0,0.4)', background: '#fff' }}>
                  {/* Browser chrome */}
                  <div style={{ background: '#1a1a1a', padding: '8px 12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#FF5F57' }} />
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#FEBC2E' }} />
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#28C840' }} />
                    <div style={{ flex: 1, background: '#2d2d2d', borderRadius: '4px', padding: '2px 8px', fontSize: '10px', color: '#999', marginLeft: '8px' }}>
                      {window.location.origin}/portfolio/{username || user?.username}
                    </div>
                  </div>
                  <iframe
                    key={`desktop-${username || user?.username}-${previewKey}`}
                    src={`/portfolio/${username || user?.username}?preview=true`}
                    style={{ width: '100%', height: '380px', border: 'none', display: 'block' }}
                    title="Portfolio Desktop Preview"
                  />
                </div>
              ) : (
                <div style={{ width: '268px' }}>
                  {/* Phone frame */}
                  <div style={{ border: '6px solid #1A1A1A', borderRadius: '32px', overflow: 'hidden', boxShadow: '0 8px 32px rgba(0,0,0,0.5)', background: '#000', position: 'relative' }}>
                    <div style={{ background: '#1A1A1A', height: '20px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                      <div style={{ width: '60px', height: '4px', borderRadius: '2px', background: '#444' }} />
                    </div>
                    <div style={{ width: '256px', height: '520px', overflow: 'hidden', position: 'relative' }}>
                      <iframe
                        key={`mobile-${username || user?.username}-${previewKey}`}
                        src={`/portfolio/${username || user?.username}?preview=true`}
                        style={{ width: '390px', height: '844px', border: 'none', display: 'block', transformOrigin: 'top left', transform: 'scale(0.6564)' }}
                        title="Portfolio Mobile Preview"
                      />
                    </div>
                    <div style={{ background: '#1A1A1A', height: '18px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                      <div style={{ width: '40px', height: '4px', borderRadius: '2px', background: '#444' }} />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
