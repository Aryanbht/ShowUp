import { useState, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import CloudinaryUpload from "../components/CloudinaryUpload";
import TechPill from "../components/TechPill";
import api, { projectsApi, githubApi } from "../api";
import { SKILLS_LIST } from "../data/skills";
import { useAuth } from "../context/AuthContext";

const MAX_DESC = 500;

export default function UploadPage({ editMode }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();
  const [form, setForm] = useState({
    title: "",
    description: "",
    tech_stack: [],
    live_url: "",
    github_url: "",
    screenshot_url: "",
    show_ai_analysis: true,
    readme: "",
  });
  const [techInput, setTechInput] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(editMode);
  const [error, setError] = useState("");
// Tanay Ko samajha Rha hu
  useEffect(() => {
    if (editMode && id) {
      projectsApi.getById(id)
        .then((res) => {
          const p = res.data.data;
          setForm({
            title: p.title || "",
            description: p.description || "",
            tech_stack: Array.isArray(p.tech_stack) ? p.tech_stack : [],
            live_url: p.live_url || "",
            github_url: p.github_url || "",
            screenshot_url: p.screenshot_url || "",
            show_ai_analysis: p.show_ai_analysis ?? true,
            readme: p.readme || "",
          });
        })
        .catch(() => {
          setError("Failed to load project for editing.");
        })
        .finally(() => setLoading(false));
    }
  }, [editMode, id]);

  const [repos, setRepos] = useState([]);
  const [loadingRepos, setLoadingRepos] = useState(false);
  const [importingRepo, setImportingRepo] = useState(null); // stores repo full_name
  const [githubError, setGithubError] = useState('');

  // Fetch repos if user is connected
  useEffect(() => {
    if (user?.github_username && !editMode) {
      setLoadingRepos(true);
      githubApi.listRepos(1)
        .then(res => setRepos(res.data.data))
        .catch(err => setGithubError("Failed to fetch your GitHub repositories."))
        .finally(() => setLoadingRepos(false));
    }
  }, [user, editMode]);

  const handleImportRepo = async (fullName) => {
    setImportingRepo(fullName);
    setGithubError('');
    try {
      const res = await githubApi.importRepo(fullName);
      const newProject = res.data.data;
      navigate(`/project/${newProject.id}/edit`);
    } catch (err) {
      setGithubError(err.response?.data?.message || 'Failed to import repository.');
    } finally {
      setImportingRepo(null);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === "checkbox" ? checked : value }));
  };

  const handleAddTag = (e) => {
    if (["Enter", ","].includes(e.key) && techInput.trim()) {
      e.preventDefault();
      const tag = techInput.trim().replace(/,$/, "");
      if (tag && !form.tech_stack.includes(tag)) {
        setForm((f) => ({ ...f, tech_stack: [...f.tech_stack, tag] }));
      }
      setTechInput("");
    }
  };

  const handleRemoveTag = (tag) => {
    setForm((f) => ({ ...f, tech_stack: f.tech_stack.filter((t) => t !== tag) }));
  };

  const handleScreenshot = (url) => {
    setForm((f) => ({ ...f, screenshot_url: url || "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.title.trim()) {
      setError("Project title is required");
      return;
    }

    setSubmitting(true);
    try {
      if (editMode) {
        await projectsApi.update(id, form);
        navigate(`/project/${id}`);
      } else {
        const res = await projectsApi.create(form);
        navigate(`/project/${res.data.data.id}`);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to publish project. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-transparent">
      <Navbar />
      <main className="flex-1 md:ml-64 pb-20 md:pb-0">
        {/* Header */}
        <div className="topbar-dark">
          <h1 className="font-grotesk font-bold text-xl text-on-surface">{editMode ? "Edit Project" : "Publish Your Work"}</h1>
          <p className="label-mono text-on-surface-variant mt-0.5">{editMode ? "Update your project details" : "Share what you've built with the world"}</p>
        </div>

        <div className="max-w-2xl mx-auto p-6">
          {loading ? (
            <p className="font-mono text-sm text-on-surface-variant animate-pulse uppercase text-center mt-10">Loading project...</p>
          ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* ── Quick Import ── */}
            {!editMode && (
              <div className="mb-8 p-4 md:p-6 rounded-2xl" style={{ background: "#111122", border: "1px solid rgba(255,255,255,0.08)" }}>
                <h2 className="font-grotesk font-bold text-lg mb-2 flex items-center gap-2 text-on-surface">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="text-on-surface">
                    <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
                  </svg>
                  Import from GitHub
                </h2>
                <p className="font-mono text-sm text-on-surface-variant mb-4">
                  Quickly import your public repositories directly as ShowUp projects.
                </p>

                {user?.github_username ? (
                  <div>
                    {loadingRepos ? (
                      <p className="font-mono text-sm text-on-surface-variant">Loading repositories...</p>
                    ) : repos.length > 0 ? (
                      <div className="flex gap-4 overflow-x-auto pb-4">
                        {repos.map(repo => (
                          <div key={repo.id} className="min-w-[280px] p-4 rounded-xl flex flex-col justify-between" style={{ background: "#18182E", border: "1px solid rgba(255,255,255,0.07)" }}>
                            <div>
                              <div className="font-bold text-[15px] truncate text-on-surface" title={repo.name}>{repo.name}</div>
                              <p className="font-mono text-xs text-on-surface-variant mt-1 line-clamp-2 min-h-[32px]">
                                {repo.description || "No description provided."}
                              </p>
                              <div className="flex items-center gap-4 mt-3 mb-4 font-mono text-[11px] text-on-surface-variant">
                                {repo.language && <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-primary"></span>{repo.language}</span>}
                                <span>⭐ {repo.stars}</span>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleImportRepo(repo.full_name)}
                              disabled={importingRepo === repo.full_name}
                              className="w-full py-1.5 bg-[#F4F4F5] hover:bg-[#E4E4E7] text-[#1A1A1A] font-mono text-xs font-bold rounded transition-colors disabled:opacity-50 border border-[#E5E5E5]"
                            >
                              {importingRepo === repo.full_name ? 'Importing...' : 'Import Project'}
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="font-mono text-sm text-[#666]">No public repositories found.</p>
                    )}
                    
                    {githubError && (
                      <p className="font-mono text-xs text-[#EF4444] mt-2">{githubError}</p>
                    )}
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => navigate('/profile/edit')}
                    className="py-2 px-4 bg-[#1A1A1A] hover:bg-[#333] text-white font-mono text-sm font-bold rounded flex items-center gap-2 transition-colors"
                  >
                    Connect GitHub in Settings
                  </button>
                )}
              </div>
            )}

            {/* Title */}
            <div>
              <label className="label-mono block mb-1.5">Project Title *</label>
              <input
                name="title"
                type="text"
                placeholder="e.g. EduTrack — Student Progress Dashboard"
                value={form.title}
                onChange={handleChange}
                className="input-brutal"
                required
              />
            </div>

            {/* Description */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="label-mono">Description</label>
                <span className={`font-mono text-xs ${form.description.length > MAX_DESC ? "text-error" : "text-on-surface-variant"}`}>
                  {form.description.length}/{MAX_DESC}
                </span>
              </div>
              <textarea
                name="description"
                rows={4}
                placeholder="What does your project do? What problem does it solve? What did you learn building it?"
                value={form.description}
                onChange={handleChange}
                className="input-brutal resize-none"
                maxLength={MAX_DESC + 10}
                required
              />
            </div>

            {/* Tech Stack */}
            <div>
              <label className="label-mono block mb-1.5">Tech Stack</label>
              <div className="border-2 border-outline-variant p-3 bg-surface-container min-h-[52px] flex flex-wrap gap-2 items-center focus-within:shadow-glow-violet-sm">
                {form.tech_stack.map((tag) => (
                  <span key={tag} className="tech-pill flex items-center gap-1">
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="hover:text-error ml-1"
                    >
                      <span className="material-symbols-outlined text-xs">close</span>
                    </button>
                  </span>
                ))}
                <input
                  type="text"
                  list="tech-options"
                  placeholder={form.tech_stack.length === 0 ? "Type a tech and press Enter (e.g. React)" : "Add more..."}
                  value={techInput}
                  onChange={(e) => setTechInput(e.target.value)}
                  onKeyDown={handleAddTag}
                  className="flex-1 min-w-[120px] bg-transparent outline-none font-mono text-sm placeholder-on-surface-variant"
                />
                <datalist id="tech-options">
                  <option value="React" />
                  <option value="Node.js" />
                  <option value="Python" />
                  <option value="Django" />
                  <option value="Flask" />
                  <option value="Next.js" />
                  <option value="Tailwind CSS" />
                  <option value="MongoDB" />
                  <option value="PostgreSQL" />
                  <option value="AWS" />
                  <option value="Docker" />
                  <option value="Java" />
                  <option value="Spring Boot" />
                  <option value="C++" />
                </datalist>
              </div>
              <p className="font-mono text-xs text-on-surface-variant mt-1">Type and press Enter or comma to add</p>
            </div>

            {/* URLs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label-mono block mb-1.5">
                  <span className="material-symbols-outlined text-sm align-middle mr-1">open_in_new</span>
                  Live URL
                </label>
                <input
                  name="live_url"
                  type="url"
                  placeholder="https://yourproject.com"
                  value={form.live_url}
                  onChange={handleChange}
                  className="input-brutal"
                />
              </div>
              <div>
                <label className="label-mono block mb-1.5">
                  <span className="material-symbols-outlined text-sm align-middle mr-1">code</span>
                  GitHub URL
                </label>
                <input
                  name="github_url"
                  type="url"
                  placeholder="https://github.com/you/repo"
                  value={form.github_url}
                  onChange={handleChange}
                  className="input-brutal"
                />
              </div>
            </div>

            {/* Screenshot upload */}
            <div>
              <label className="label-mono block mb-1.5">Project Screenshot</label>
              <CloudinaryUpload
                onUpload={handleScreenshot}
                label="Upload Screenshot"
                currentUrl={form.screenshot_url || null}
              />
            </div>

            {/* Error */}
            {error && (
              <div className="border border-error bg-error-container px-4 py-3">
                <p className="font-mono text-sm text-on-error-container">{error}</p>
              </div>
            )}

            {/* Privacy Toggle */}
          <div className="flex items-center gap-3 bg-surface-container p-4 border border-outline shadow-card-dark mt-8">
            <input
              type="checkbox"
              id="show_ai_analysis"
              name="show_ai_analysis"
              checked={form.show_ai_analysis}
              onChange={handleChange}
              className="w-5 h-5 accent-primary cursor-pointer"
            />
            <label htmlFor="show_ai_analysis" className="font-grotesk font-bold cursor-pointer select-none">
              Make AI Analysis Public
              <p className="font-mono text-xs font-normal text-on-surface-variant mt-0.5">
                If unchecked, only you will be able to see the AI feedback for this project.
              </p>
            </label>
          </div>

          <div className="pt-6">
              <button
                type="submit"
                disabled={submitting || form.description.length > MAX_DESC}
                className="btn-primary w-full justify-center py-4"
              >
                {submitting ? (
                  <>
                    <span className="material-symbols-outlined text-base animate-spin">progress_activity</span>
                    {editMode ? "Updating..." : "Publishing..."}
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-base">{editMode ? "save" : "rocket_launch"}</span>
                    {editMode ? "Save Changes" : "Publish Project"}
                  </>
                )}
              </button>
            </div>
          </form>
          )}
        </div>
      </main>
    </div>
  );
}
