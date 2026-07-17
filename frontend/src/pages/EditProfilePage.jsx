import { useState, useCallback, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import { studentsApi, githubApi } from "../api";
import api from "../api";
import { useAuth } from "../context/AuthContext";
import SkillsInput from "../components/SkillsInput";
import LocationInput from "../components/LocationInput";


const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

export default function EditProfilePage() {
  const { user, updateUser, logout } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [form, setForm] = useState({
    name: user?.name || "",
    college: user?.college || "",
    course: user?.course || "",
    college_start_year: user?.college_start_year || "",
    college_end_year: user?.college_end_year || "",
    bio: user?.bio || "",
    location: user?.location || "",
    github_url: user?.github_url || "",
    avatar_url: user?.avatar_url || "",
  });
  const [skills, setSkills] = useState(user?.skills || []);
  const [bioError, setBioError] = useState("");

  const countWords = (text) => {
    if (!text.trim()) return 0;
    return text.trim().split(/\s+/).length;
  };

  const handleBioChange = (e) => {
    const value = e.target.value;
    const words = countWords(value);
    if (words > 500) {
      setBioError(`${words}/500 words — limit exceeded`);
    } else {
      setBioError("");
    }
    setForm((f) => ({ ...f, bio: value }));
  };
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showSurveyModal, setShowSurveyModal] = useState(false);
  const [surveyFeedback, setSurveyFeedback] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  // Portfolio customization state
  const [template, setTemplate] = useState(user?.portfolio_template || 'classic');
  const [bgColor, setBgColor] = useState(user?.portfolio_bg_color || '#FFFFFF');
  const [textColor, setTextColor] = useState(user?.portfolio_text_color || '#1A1A1A');
  const [accentColor, setAccentColor] = useState(user?.portfolio_accent_color || '#1A1A1A');
  const [cardColor, setCardColor] = useState(user?.portfolio_card_color || '#F8F8F8');
  const [portfolioFont, setPortfolioFont] = useState(user?.portfolio_font || 'Inter');
  const [username, setUsername] = useState(user?.username || '');
  const [usernameError, setUsernameError] = useState('');
  const [usernameChecking, setUsernameChecking] = useState(false);
  const [custSaving, setCustSaving] = useState(false);
  const [custMsg, setCustMsg] = useState('');
  const [previewView, setPreviewView] = useState('desktop');
  const usernameTimer = useRef(null);

  const PRESET_TEMPLATES = {
    modern_midnight: { bg: '#101415', text: '#e0e3e5', accent: '#c0c1ff', card: '#272a2c', font: 'Sora' },
    terminal_core: { bg: '#131313', text: '#e5e2e1', accent: '#4be277', card: '#1c1b1b', font: 'JetBrains Mono' },
    neural_interface: { bg: '#0e131f', text: '#dde2f3', accent: '#8aebff', card: '#1a202c', font: 'Inter' },
  };

  const handleTemplateChange = async (tId) => {
    setTemplate(tId);
    if (tId !== 'custom' && PRESET_TEMPLATES[tId]) {
      setBgColor(PRESET_TEMPLATES[tId].bg);
      setTextColor(PRESET_TEMPLATES[tId].text);
      setAccentColor(PRESET_TEMPLATES[tId].accent);
      setCardColor(PRESET_TEMPLATES[tId].card);
      setPortfolioFont(PRESET_TEMPLATES[tId].font);
    }
    // Auto-save template selection immediately
    try {
      const res = await api.patch('/api/portfolio/customization', { template: tId });
      updateUser({ ...user, ...res.data.data });
    } catch { /* silent */ }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    setSuccess("");
    setError("");
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { setError("File must be under 10MB"); return; }
    setUploading(true);
    setError("");
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", UPLOAD_PRESET);
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
        { method: "POST", body: formData }
      );
      const data = await res.json();
      setForm((f) => ({ ...f, avatar_url: data.secure_url }));
    } catch {
      setError("Photo upload failed. Try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (countWords(form.bio) > 500) {
      setError("Please fix errors before saving.");
      return;
    }
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const res = await studentsApi.update(user.id, { ...form, skills });
      updateUser(res.data.data);
      setSuccess("Profile updated successfully!");
    } catch (err) {
      setError(err.response?.data?.message || "Update failed. Try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveCustomization = async () => {
    if (usernameError) return;
    setCustSaving(true);
    setCustMsg('');
    try {
      const res = await api.patch('/api/portfolio/customization', {
        template,
        bg_color: bgColor,
        text_color: textColor,
        accent_color: accentColor,
        card_color: cardColor,
        font: portfolioFont,
        username,
      });
      updateUser({ ...user, ...res.data.data });
      setCustMsg('Portfolio saved ✓');
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

  const handleDeleteAccount = async () => {
    setDeleting(true);
    try {
      await studentsApi.delete(user.id);
      setShowDeleteModal(false);
      setShowSurveyModal(true);
    } catch {
      alert("Failed to delete account.");
      setDeleting(false);
    }
  };

  const handleSurveySubmit = async () => {
    try {
      if (surveyFeedback.trim()) {
        await studentsApi.submitExitSurvey({ email: user.email, feedback: surveyFeedback });
      }
    } catch (err) {
      console.error(err);
    } finally {
      logout();
      navigate("/");
    }
  };

  const [githubLoading, setGithubLoading] = useState(false);
  const handleConnectGithub = async () => {
    setGithubLoading(true);
    try {
      const res = await githubApi.getConnectUrl();
      if (res.data.success && res.data.data.oauth_url) {
        window.location.href = res.data.data.oauth_url;
      }
    } catch (err) {
      console.error(err);
      alert("Failed to connect GitHub");
      setGithubLoading(false);
    }
  };

  const handleDisconnectGithub = async () => {
    if (!window.confirm("Disconnect your GitHub account?")) return;
    setGithubLoading(true);
    try {
      await githubApi.disconnect();
      // Update local context
      updateUser({ ...user, github_username: null, github_access_token: null });
    } catch (err) {
      console.error(err);
      alert("Failed to disconnect GitHub");
    } finally {
      setGithubLoading(false);
    }
  };


  return (
    <div className="flex min-h-screen w-full bg-surface-container overflow-x-hidden">
      <Navbar />

      <main className="flex-1 min-w-0 w-full md:ml-64 pb-24 md:pb-0">
        {/* Header */}
        <div className="border-b-2 border-outline-variant px-4 py-4 sticky top-0 z-20 bg-surface-container">
          <h1 className="font-grotesk font-bold text-lg sm:text-xl text-on-surface">Edit Profile</h1>
          <p className="label-mono text-on-surface-variant mt-0.5">Update your public profile info</p>
        </div>

        <div className="w-full max-w-xl mx-auto px-4 py-6">
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* ── Avatar ── */}
            <div>
              <label className="label-mono block mb-2">Profile Photo</label>

              {/* Big photo preview */}
              {form.avatar_url && (
                <div className="relative w-full mb-3 overflow-hidden border-2 border-outline-variant bg-surface-container"
                     style={{ paddingTop: "56.25%" /* 16:9 */ }}>
                  <img
                    src={form.avatar_url}
                    alt="Profile"
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, avatar_url: "" }))}
                    className="absolute top-2 right-2 bg-error text-white border border-outline-variant p-1"
                    title="Remove"
                  >
                    <span className="material-symbols-outlined text-sm">close</span>
                  </button>
                </div>
              )}

              {/* Upload button */}
              <label
                htmlFor="avatar-file"
                className={`flex items-center justify-center gap-2 w-full border-2 border-dashed border-outline-variant py-3 font-mono text-xs uppercase font-bold cursor-pointer transition-colors ${
                  uploading ? "opacity-60 cursor-wait bg-surface-container" : "hover:bg-surface-container"
                }`}
              >
                <span className="material-symbols-outlined text-base">
                  {uploading ? "progress_activity" : "cloud_upload"}
                </span>
                {uploading ? "Uploading..." : form.avatar_url ? "Change Photo" : "Upload Photo"}
              </label>
              <input
                id="avatar-file"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarUpload}
                disabled={uploading}
              />
              <p className="font-mono text-xs text-on-surface-variant mt-1">PNG, JPG up to 10MB</p>
            </div>

            {/* ── Full Name ── */}
            <div>
              <label className="label-mono block mb-1.5">Full Name</label>
              <input
                name="name"
                type="text"
                value={form.name}
                onChange={handleChange}
                className="input-brutal w-full"
                placeholder="Your full name"
                required
              />
            </div>

            {/* ── College ── */}
            <div>
              <label className="label-mono block mb-1.5">College</label>
              <input
                name="college"
                type="text"
                value={form.college}
                onChange={handleChange}
                className="input-brutal w-full"
                placeholder="IIT Delhi, NIT Trichy..."
                required
              />
            </div>

            {/* ── Location / State ── */}
            <div>
              <label className="label-mono block mb-1.5">Location</label>
              <LocationInput
                value={form.location}
                onChange={(val) => setForm(f => ({ ...f, location: val }))}
              />
              <p className="font-mono text-xs text-on-surface-variant mt-1">City or State in India</p>
            </div>

            {/* ── GitHub ── */}
            <div>
              <label className="label-mono block mb-1.5">GitHub Profile</label>
              
              {user?.github_username ? (
                <div className="flex items-center justify-between border-2 border-outline-variant p-3 bg-surface-container-low">
                  <div className="flex items-center gap-2">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
                    </svg>
                    <span className="font-mono text-sm font-bold text-on-surface">@{user.github_username}</span>
                  </div>
                  <button 
                    type="button" 
                    onClick={handleDisconnectGithub}
                    disabled={githubLoading}
                    className="font-mono text-xs text-error hover:underline disabled:opacity-50"
                  >
                    Disconnect
                  </button>
                </div>
              ) : (
                <div>
                  <button 
                    type="button" 
                    onClick={handleConnectGithub}
                    disabled={githubLoading}
                    className="w-full flex items-center justify-center gap-2 border-2 border-outline-variant p-3 bg-[#1A1A1A] text-white hover:bg-[#333] transition-colors disabled:opacity-50"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
                    </svg>
                    <span className="font-mono text-sm font-bold">Connect GitHub</span>
                  </button>
                  {searchParams.get('github') === 'error' && (
                    <p className="font-mono text-xs text-error mt-2">Failed to connect to GitHub. Please try again.</p>
                  )}
                  {searchParams.get('github') === 'success' && (
                    <p className="font-mono text-xs text-[#22c55e] mt-2">GitHub connected successfully!</p>
                  )}
                </div>
              )}
              <p className="font-mono text-xs text-on-surface-variant mt-2">
                Connect your GitHub to import projects and display a link on your profile.
              </p>
            </div>

            {/* ── Course & Timeline — stack on very small screens ── */}
            <div className="grid grid-cols-1 xs:grid-cols-3 sm:grid-cols-3 gap-3">
              <div>
                <label className="label-mono block mb-1.5">Start Year</label>
                <input
                  name="college_start_year"
                  type="number"
                  min="1990"
                  max="2030"
                  value={form.college_start_year}
                  onChange={handleChange}
                  className="input-brutal w-full"
                  placeholder="2024"
                  required
                />
              </div>
              <div>
                <label className="label-mono block mb-1.5">End Year</label>
                <input
                  name="college_end_year"
                  type="number"
                  min="1990"
                  max="2035"
                  value={form.college_end_year}
                  onChange={handleChange}
                  className="input-brutal w-full"
                  placeholder="2028"
                  required
                />
              </div>
              <div>
                <label className="label-mono block mb-1.5">Course</label>
                <input
                  name="course"
                  type="text"
                  list="course-options"
                  value={form.course}
                  onChange={handleChange}
                  className="input-brutal w-full"
                  placeholder="B.Tech CS..."
                  required
                />
                <datalist id="course-options">
                  <option value="B.Tech Computer Science" />
                  <option value="B.Tech IT" />
                  <option value="B.Tech Electronics" />
                  <option value="BCA" />
                  <option value="MCA" />
                  <option value="B.Sc Computer Science" />
                  <option value="Diploma in CS" />
                </datalist>
              </div>
            </div>

            {/* ── Skills ── */}
            <div>
              <SkillsInput
                value={skills}
                onChange={setSkills}
              />
            </div>

            {/* ── Bio ── */}
            <div style={{ marginBottom: '20px' }}>
              <label className="label-mono block mb-1.5" style={{ color: '#8A8AAE' }}>
                Bio
              </label>
              <textarea
                value={form.bio}
                onChange={handleBioChange}
                placeholder="Tell recruiters about yourself..."
                rows={5}
                className="placeholder-white/40"
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  border: bioError ? '1.5px solid #EF4444' : '1.5px solid rgba(255,255,255,0.1)',
                  borderRadius: '6px',
                  fontSize: '14px',
                  resize: 'vertical',
                  outline: 'none',
                  fontFamily: 'Inter, sans-serif',
                  lineHeight: '1.6',
                  boxSizing: 'border-box',
                  background: 'rgba(255,255,255,0.03)',
                  color: '#fff'
                }}
              />
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginTop: '6px'
              }}>
                <p style={{
                  fontSize: '12px',
                  color: bioError ? '#EF4444' : '#8A8AAE',
                  margin: 0
                }}>
                  {bioError || ''}
                </p>
                <p style={{
                  fontSize: '12px',
                  color: countWords(form.bio) > 500 ? '#EF4444' : '#8A8AAE',
                  margin: 0
                }}>
                  {countWords(form.bio)} / 500 words
                </p>
              </div>
            </div>

            {/* ── Portfolio Link ── */}
            <div className="border-2 border-outline-variant p-3 bg-surface-container-low">
              <p className="label-mono mb-2">Your Portfolio Link</p>
              <div className="flex items-center gap-2 min-w-0">
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
              </div>
            </div>

            {/* ── Feedback ── */}
            {success && (
              <div className="border border-green-600 bg-green-50 px-4 py-3 flex items-center gap-2">
                <span className="material-symbols-outlined text-green-600 text-sm">check_circle</span>
                <p className="font-mono text-sm text-green-700">{success}</p>
              </div>
            )}
            {error && (
              <div className="border border-error bg-error-container px-4 py-3">
                <p className="font-mono text-sm text-on-error-container">{error}</p>
              </div>
            )}

            {/* ── Action Buttons ── */}
            <div className="flex flex-col gap-3 pt-2">
              <button
                type="submit"
                disabled={saving}
                className="btn-primary w-full justify-center py-3"
              >
                {saving ? (
                  <>
                    <span className="material-symbols-outlined text-base animate-spin">progress_activity</span>
                    Saving...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-base">save</span>
                    Save Changes
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => navigate(`/u/${user?.id}`)}
                className="btn-secondary w-full justify-center py-3"
              >
                View Profile
              </button>
            </div>



            {/* ── Portfolio Customization ── */}
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '32px', marginTop: '32px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '700', margin: '0 0 24px', letterSpacing: '0.01em', color: '#ECEEF5' }}>
                Portfolio Customization
              </h3>

              {/* Username / Portfolio URL */}
              <div style={{ marginBottom: '20px' }}>
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
                      style={{ padding: '8px 12px', border: `1.5px solid ${usernameError ? '#EF4444' : usernameError === '' && username && username !== user?.username ? '#10B981' : 'rgba(255,255,255,0.1)'}`, borderRadius: '6px', fontSize: '13px', width: '160px', background: 'rgba(255,255,255,0.03)', color: '#fff' }}
                      placeholder="yourusername"
                    />
                    {usernameChecking && <span style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', fontSize: '11px', color: '#8A8AAE' }}>…</span>}
                  </div>
                </div>
                {usernameError && <p style={{ fontSize: '11px', color: '#EF4444', margin: '6px 0 0', display: 'flex', alignItems: 'center', gap: '4px' }}>⚠ {usernameError}</p>}
              </div>

              {/* Template picker */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ fontSize: '12px', fontWeight: '600', color: '#666', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '12px' }}>
                  Template
                </label>
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                  {[
                    { id: 'neural_os', name: 'Neural OS', bg: '#101415', accent: '#00f3ff' },
                    { id: 'terminal_core', name: 'Terminal Core', bg: '#131313', accent: '#4be277' },
                    { id: 'obsidian_iridescence', name: 'Obsidian Iridescence', bg: '#0e131f', accent: '#8aebff' },
                    { id: 'shaolin_zen', name: 'Shaolin Zen', bg: '#121414', accent: '#d84315' },
                  ].map(t => (
                    <div
                      key={t.id}
                      onClick={() => handleTemplateChange(t.id)}
                      style={{
                        width: '100px', cursor: 'pointer',
                        border: template === t.id ? '2px solid #1A1A1A' : '1.5px solid #E5E5E5',
                        borderRadius: '6px', overflow: 'hidden'
                      }}
                    >
                      <div style={{ height: '60px', background: t.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <div style={{ width: '40px', height: '6px', background: t.accent, borderRadius: '2px' }} />
                      </div>
                      <div style={{ padding: '6px 8px', background: '#FAFAFA' }}>
                        <p style={{ fontSize: '12px', fontWeight: '500', margin: 0, color: '#1A1A1A', textAlign: 'center' }}>{t.name}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>




              {custMsg && (
                <p style={{ fontSize: '13px', color: custMsg.includes('✓') ? '#16A34A' : '#FF4444', margin: '10px 0 0' }}>
                  {custMsg}
                </p>
              )}

              {/* ── Live Portfolio Preview ── */}
              <div style={{ marginTop: '32px', borderTop: '1px solid #E5E5E5', paddingTop: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
                  <div>
                    <p style={{ fontSize: '12px', fontWeight: '600', color: '#666', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 4px' }}>Live Preview</p>
                    <p style={{ fontSize: '11px', color: '#999', margin: 0 }}>See how your portfolio looks</p>
                  </div>
                  <div style={{ display: 'flex', gap: '4px', background: '#F0F0F0', borderRadius: '8px', padding: '3px' }}>
                    <button
                      type="button"
                      onClick={() => setPreviewView('desktop')}
                      style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 14px', borderRadius: '6px', border: 'none', fontSize: '12px', fontWeight: '500', cursor: 'pointer', background: previewView === 'desktop' ? '#FFFFFF' : 'transparent', color: previewView === 'desktop' ? '#1A1A1A' : '#777', boxShadow: previewView === 'desktop' ? '0 1px 4px rgba(0,0,0,0.12)' : 'none', transition: 'all 0.2s' }}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>desktop_windows</span>
                      Desktop
                    </button>
                    <button
                      type="button"
                      onClick={() => setPreviewView('mobile')}
                      style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 14px', borderRadius: '6px', border: 'none', fontSize: '12px', fontWeight: '500', cursor: 'pointer', background: previewView === 'mobile' ? '#FFFFFF' : 'transparent', color: previewView === 'mobile' ? '#1A1A1A' : '#777', boxShadow: previewView === 'mobile' ? '0 1px 4px rgba(0,0,0,0.12)' : 'none', transition: 'all 0.2s' }}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>smartphone</span>
                      Mobile
                    </button>
                  </div>
                </div>

                {/* Preview frame */}
                <div style={{ background: '#F5F5F5', borderRadius: '10px', padding: previewView === 'desktop' ? '12px' : '12px', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: previewView === 'desktop' ? '420px' : '580px' }}>
                  {previewView === 'desktop' ? (
                    <div style={{ width: '100%', borderRadius: '8px', overflow: 'hidden', border: '1px solid #DDD', boxShadow: '0 4px 24px rgba(0,0,0,0.10)', background: '#fff' }}>
                      {/* Browser chrome */}
                      <div style={{ background: '#E8E8E8', padding: '8px 12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#FF5F57' }} />
                        <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#FEBC2E' }} />
                        <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#28C840' }} />
                        <div style={{ flex: 1, background: '#FFF', borderRadius: '4px', padding: '2px 8px', fontSize: '10px', color: '#999', marginLeft: '8px' }}>
                          {window.location.origin}/portfolio/{username || user?.username}
                        </div>
                      </div>
                      <iframe
                        key={`desktop-${username || user?.username}-${template}`}
                        src={`/portfolio/${username || user?.username}?preview=true`}
                        style={{ width: '100%', height: '380px', border: 'none', display: 'block' }}
                        title="Portfolio Desktop Preview"
                      />
                    </div>
                  ) : (
                    // Mobile: scale iframe to simulate 390px phone viewport inside 268px phone frame
                    <div style={{ width: '268px' }}>
                      {/* Phone frame */}
                      <div style={{ border: '6px solid #1A1A1A', borderRadius: '32px', overflow: 'hidden', boxShadow: '0 8px 32px rgba(0,0,0,0.2)', background: '#000', position: 'relative' }}>
                        <div style={{ background: '#1A1A1A', height: '20px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                          <div style={{ width: '60px', height: '4px', borderRadius: '2px', background: '#444' }} />
                        </div>
                        {/* Clipping container at phone width */}
                        <div style={{ width: '256px', height: '520px', overflow: 'hidden', position: 'relative' }}>
                          <iframe
                            key={`mobile-${username || user?.username}-${template}`}
                            src={`/portfolio/${username || user?.username}?preview=true`}
                            style={{
                              width: '390px',
                              height: '844px',
                              border: 'none',
                              display: 'block',
                              transformOrigin: 'top left',
                              transform: 'scale(0.6564)',
                            }}
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

            {/* ── Danger Zone ── */}
            <div className="border-t-2 border-outline-variant pt-6 mt-4">
              <h2 className="font-grotesk font-bold text-lg text-error mb-2">Danger Zone</h2>
              <p className="font-mono text-sm text-on-surface-variant mb-4">
                Once you delete your account, there is no going back.
              </p>
              <button
                type="button"
                onClick={() => setShowDeleteModal(true)}
                className="border-2 border-error text-error hover:bg-error hover:text-white px-4 py-2 font-mono text-xs uppercase font-bold transition-colors w-full sm:w-auto"
              >
                Delete Account
              </button>
            </div>
          </form>
        </div>
      </main>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-ink/50 z-50 flex items-center justify-center p-4">
          <div className="bg-surface-container border-4 border-outline-variant p-6 w-full max-w-sm shadow-glow-violet-sm">
            <h2 className="font-grotesk font-bold text-xl text-error mb-2">Are you absolutely sure?</h2>
            <p className="text-on-surface text-sm mb-6">
              This will permanently delete your account, projects, and reviews from ShowUp.
            </p>
            <div className="flex flex-col gap-2">
              <button
                onClick={handleDeleteAccount}
                className="bg-error text-white border-2 border-outline-variant px-4 py-2 font-mono text-xs uppercase font-bold hover:opacity-90 w-full"
                disabled={deleting}
              >
                {deleting ? "Deleting..." : "Yes, Delete My Account"}
              </button>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="btn-secondary py-2 w-full justify-center"
                disabled={deleting}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Exit Survey Modal */}
      {showSurveyModal && (
        <div className="fixed inset-0 bg-ink/50 z-50 flex items-center justify-center p-4">
          <div className="bg-surface-container border-4 border-outline-variant p-6 w-full max-w-sm shadow-glow-violet-sm">
            <h2 className="font-grotesk font-bold text-xl text-on-surface mb-2">We're sorry to see you go</h2>
            <p className="text-on-surface-variant text-sm mb-4">
              Your account has been deleted. Could you tell us why you decided to leave?
            </p>
            <textarea
              className="input-brutal w-full mb-4 resize-none"
              rows={4}
              placeholder="Your feedback..."
              value={surveyFeedback}
              onChange={(e) => setSurveyFeedback(e.target.value)}
            />
            <button onClick={handleSurveySubmit} className="btn-primary py-2 w-full justify-center">
              Submit & Leave
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
