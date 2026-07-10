import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { studentsApi } from "../api";
import api from "../api";
import { useAuth } from "../context/AuthContext";
import SkillsInput from "../components/SkillsInput";


const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

export default function EditProfilePage() {
  const { user, updateUser, logout } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: user?.name || "",
    college: user?.college || "",
    course: user?.course || "",
    college_start_year: user?.college_start_year || "",
    college_end_year: user?.college_end_year || "",
    bio: user?.bio || "",
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
  const [custSaving, setCustSaving] = useState(false);
  const [custMsg, setCustMsg] = useState('');

  const PRESET_TEMPLATES = {
    modern_midnight: { bg: '#101415', text: '#e0e3e5', accent: '#c0c1ff', card: '#272a2c', font: 'Sora' },
    terminal_core: { bg: '#131313', text: '#e5e2e1', accent: '#4be277', card: '#1c1b1b', font: 'JetBrains Mono' },
    neural_interface: { bg: '#0e131f', text: '#dde2f3', accent: '#8aebff', card: '#1a202c', font: 'Inter' },
  };

  const handleTemplateChange = (tId) => {
    setTemplate(tId);
    if (tId !== 'custom' && PRESET_TEMPLATES[tId]) {
      setBgColor(PRESET_TEMPLATES[tId].bg);
      setTextColor(PRESET_TEMPLATES[tId].text);
      setAccentColor(PRESET_TEMPLATES[tId].accent);
      setCardColor(PRESET_TEMPLATES[tId].card);
      setPortfolioFont(PRESET_TEMPLATES[tId].font);
    }
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

  return (
    <div className="flex min-h-screen w-full bg-surface overflow-x-hidden">
      <Navbar />

      <main className="flex-1 w-full md:ml-64 pb-24 md:pb-0">
        {/* Header */}
        <div className="border-b-2 border-ink px-4 py-4 sticky top-0 z-20 bg-surface">
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
                <div className="relative w-full mb-3 overflow-hidden border-2 border-ink bg-surface-container"
                     style={{ paddingTop: "56.25%" /* 16:9 */ }}>
                  <img
                    src={form.avatar_url}
                    alt="Profile"
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, avatar_url: "" }))}
                    className="absolute top-2 right-2 bg-error text-white border border-ink p-1"
                    title="Remove"
                  >
                    <span className="material-symbols-outlined text-sm">close</span>
                  </button>
                </div>
              )}

              {/* Upload button */}
              <label
                htmlFor="avatar-file"
                className={`flex items-center justify-center gap-2 w-full border-2 border-dashed border-ink py-3 font-mono text-xs uppercase font-bold cursor-pointer transition-colors ${
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
              <label style={{
                display: 'block',
                fontSize: '12px',
                fontWeight: '600',
                color: '#666',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                marginBottom: '8px'
              }}>
                Bio
              </label>
              <textarea
                value={form.bio}
                onChange={handleBioChange}
                placeholder="Tell recruiters about yourself..."
                rows={5}
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  border: bioError ? '1.5px solid #FF4444' : '1.5px solid #E5E5E5',
                  borderRadius: '6px',
                  fontSize: '14px',
                  resize: 'vertical',
                  outline: 'none',
                  fontFamily: 'Inter, sans-serif',
                  lineHeight: '1.6',
                  boxSizing: 'border-box'
                }}
              />
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginTop: '6px'
              }}>
                <p style={{
                  fontSize: '12px',
                  color: bioError ? '#FF4444' : '#999',
                  margin: 0
                }}>
                  {bioError || ''}
                </p>
                <p style={{
                  fontSize: '12px',
                  color: countWords(form.bio) > 500 ? '#FF4444' : '#999',
                  margin: 0
                }}>
                  {countWords(form.bio)} / 500 words
                </p>
              </div>
            </div>

            {/* ── Portfolio Link ── */}
            <div className="border-2 border-ink p-3 bg-surface-container-low">
              <p className="label-mono mb-2">Your Portfolio Link</p>
              <div className="flex items-center gap-2 min-w-0">
                <code className="font-mono text-xs text-primary flex-1 min-w-0 truncate block">
                  {window.location.origin}/portfolio/{username || user?.username || user?.id}
                </code>
                <button
                  type="button"
                  onClick={() => navigator.clipboard.writeText(`${window.location.origin}/portfolio/${username || user?.username || user?.id}`)}
                  className="border border-ink p-1.5 hover:bg-surface-container transition-colors flex-shrink-0"
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
            <div style={{ borderTop: '1px solid #E5E5E5', paddingTop: '32px', marginTop: '32px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '700', margin: '0 0 24px', letterSpacing: '0.01em' }}>
                Portfolio Customization
              </h3>

              {/* Username / Portfolio URL */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ fontSize: '12px', fontWeight: '600', color: '#666', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '8px' }}>
                  Your Portfolio URL
                </label>
                <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '13px', color: '#999' }}>{window.location.origin}/portfolio/</span>
                  <input
                    value={username}
                    onChange={e => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                    style={{ padding: '8px 12px', border: '1.5px solid #E5E5E5', borderRadius: '6px', fontSize: '13px', width: '160px' }}
                    placeholder="yourusername"
                  />
                </div>
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



              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                <a
                  href={`/portfolio/${username || user?.username}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ fontSize: '13px', color: '#1A1A1A', textDecoration: 'underline' }}
                >
                  Preview portfolio →
                </a>
                <button
                  type="button"
                  onClick={handleSaveCustomization}
                  disabled={custSaving}
                  style={{
                    padding: '10px 24px',
                    background: custSaving ? '#E5E5E5' : '#1A1A1A',
                    color: custSaving ? '#999' : '#FFFFFF',
                    border: 'none', borderRadius: '6px',
                    fontSize: '13px', fontWeight: '600',
                    cursor: custSaving ? 'not-allowed' : 'pointer',
                  }}
                >
                  {custSaving ? 'Saving...' : 'Save Portfolio →'}
                </button>
              </div>

              {custMsg && (
                <p style={{ fontSize: '13px', color: custMsg.includes('✓') ? '#16A34A' : '#FF4444', margin: '10px 0 0' }}>
                  {custMsg}
                </p>
              )}
            </div>

            {/* ── Danger Zone ── */}
            <div className="border-t-2 border-ink pt-6 mt-4">
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
          <div className="bg-surface border-4 border-ink p-6 w-full max-w-sm shadow-[8px_8px_0px_#111]">
            <h2 className="font-grotesk font-bold text-xl text-error mb-2">Are you absolutely sure?</h2>
            <p className="text-on-surface text-sm mb-6">
              This will permanently delete your account, projects, and reviews from ShowUp.
            </p>
            <div className="flex flex-col gap-2">
              <button
                onClick={handleDeleteAccount}
                className="bg-error text-white border-2 border-ink px-4 py-2 font-mono text-xs uppercase font-bold hover:opacity-90 w-full"
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
          <div className="bg-surface border-4 border-ink p-6 w-full max-w-sm shadow-[8px_8px_0px_#111]">
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
