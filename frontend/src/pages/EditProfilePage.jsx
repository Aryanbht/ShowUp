import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { studentsApi } from "../api";
import { useAuth } from "../context/AuthContext";


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
    skills: user?.skills ? user.skills.join(", ") : "",
    bio: user?.bio || "",
    avatar_url: user?.avatar_url || "",
  });
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
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const res = await studentsApi.update(user.id, form);
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

  return (
    <div className="flex min-h-screen w-full bg-surface overflow-x-hidden">
      <Navbar />

      <main className="flex-1 w-full md:ml-64 pb-24 md:pb-0">
        {/* Header */}
        <div className="border-b-2 border-ink px-4 py-4 sticky top-0 z-20 bg-surface">
          <h1 className="font-grotesk font-bold text-lg sm:text-xl text-on-surface">Edit Profile</h1>
          <p className="label-mono text-on-surface-variant mt-0.5">Update your public portfolio info</p>
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
              <label className="label-mono block mb-1.5">Skills (comma separated)</label>
              <input
                name="skills"
                type="text"
                value={form.skills}
                onChange={handleChange}
                className="input-brutal w-full"
                placeholder="React, Python, Tailwind..."
              />
            </div>

            {/* ── Bio ── */}
            <div>
              <label className="label-mono block mb-1.5">Bio</label>
              <textarea
                name="bio"
                rows={4}
                value={form.bio}
                onChange={handleChange}
                className="input-brutal w-full resize-none"
                placeholder="Tell the world what you build, what you're learning..."
              />
            </div>

            {/* ── Portfolio Link ── */}
            <div className="border-2 border-ink p-3 bg-surface-container-low">
              <p className="label-mono mb-2">Your Portfolio Link</p>
              <div className="flex items-center gap-2 min-w-0">
                <code className="font-mono text-xs text-primary flex-1 min-w-0 truncate block">
                  {window.location.origin}/u/{user?.id}
                </code>
                <button
                  type="button"
                  onClick={() => navigator.clipboard.writeText(`${window.location.origin}/u/${user?.id}`)}
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
                View Portfolio
              </button>
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
