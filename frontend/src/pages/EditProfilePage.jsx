import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import { studentsApi, githubApi } from "../api";
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
