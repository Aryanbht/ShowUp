import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { studentsApi, projectsApi, chatApi } from "../api";
import Navbar from "../components/Navbar";
import ProjectCard from "../components/ProjectCard";
import CredibilityBadge from "../components/CredibilityBadge";
import { useAuth } from "../context/AuthContext";

export default function StudentPortfolioPage() {
  const { student_id } = useParams();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  // Connect / chat state
  const [connectStatus, setConnectStatus] = useState(null); // null | 'none' | 'pending' | 'connected' | 'incoming'
  const [connectConvoId, setConnectConvoId] = useState(null);
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [connectNote, setConnectNote] = useState("");
  const [connectLoading, setConnectLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [studentRes, projectsRes] = await Promise.all([
          studentsApi.getById(student_id),
          projectsApi.byStudent(student_id),
        ]);
        setStudent(studentRes.data.data);
        setProjects(projectsRes.data.data.projects);
      } catch {
        setError("Student not found");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [student_id]);

  // Fetch connection status when viewing someone else's profile
  useEffect(() => {
    if (!user || !student_id || user.id === student_id) return;
    chatApi.getRequestStatus(student_id)
      .then((res) => {
        const d = res.data.data;
        setConnectStatus(d.status);
        if (d.conversation_id) setConnectConvoId(d.conversation_id);
      })
      .catch(() => {});
  }, [user, student_id]);

  const handleShare = () => {
    const portfolioUrl = `${window.location.origin}/portfolio/${student.username || student.id}`;
    navigator.clipboard.writeText(portfolioUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendConnect = async () => {
    if (!user) { navigate("/auth"); return; }
    setConnectLoading(true);
    try {
      await chatApi.sendRequest(student_id, connectNote);
      setConnectStatus('pending');
      setShowConnectModal(false);
      setConnectNote("");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to send request");
    } finally {
      setConnectLoading(false);
    }
  };

  const handleUnblock = async () => {
    if (!window.confirm("Are you sure you want to unblock this user?")) return;
    try {
      await chatApi.unblockUser(student_id);
      setConnectStatus('none');
    } catch (e) {
      alert("Failed to unblock user");
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-transparent flex items-center justify-center">
        <p className="font-mono text-sm text-on-surface-variant animate-pulse uppercase">Loading profile...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-transparent flex items-center justify-center">
        <div className="text-center">
          <span className="material-symbols-outlined text-5xl text-error mb-4 block">error</span>
          <p className="font-grotesk font-bold text-xl">{error}</p>
        </div>
      </div>
    );
  }

  const isOwn = user?.id === student.id;

  return (
    <div className="flex min-h-screen bg-transparent overflow-x-hidden">
      <Navbar />

      <main className="flex-1 min-w-0 md:ml-64 pb-20 md:pb-0 min-h-screen flex flex-col">
        <div className="flex-1 w-full">
          {/* Header */}
          <header className="topbar-dark flex items-center justify-between">
            <div className="md:hidden">
              <Link to="/feed" className="font-mono font-black text-base uppercase text-on-surface tracking-tight">ShowUp</Link>
            </div>
            <div className="hidden md:block">
              <h1 className="font-grotesk font-bold text-xl text-on-surface">Student Profile</h1>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <button
                onClick={handleShare}
                className="btn-secondary py-1.5 px-2 sm:px-3 text-xs"
                title="Share Portfolio"
              >
                <span className="material-symbols-outlined text-sm">{copied ? "check" : "link"}</span>
                <span className="hidden sm:inline">{copied ? "Copied!" : "Share"}</span>
              </button>
              {student.github_url && (
                <a
                  href={student.github_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-secondary py-1.5 px-2 sm:px-3 text-xs"
                  title="View GitHub"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="flex-shrink-0">
                    <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
                  </svg>
                  <span className="hidden sm:inline">GitHub</span>
                </a>
              )}
              {/* Connect / Chat button — only for other users */}
              {user && !isOwn && (
                <div className="flex gap-2 w-full sm:w-auto">
                  {connectStatus === 'blocked' ? (
                    <button
                      onClick={handleUnblock}
                      className="border-2 border-outline-variant bg-surface-container px-4 py-2 flex items-center justify-center gap-2 font-mono font-bold text-sm hover:bg-surface-container transition-all"
                      style={{ boxShadow: "4px 4px 0 #1A1A1A" }}
                    >
                      <span className="material-symbols-outlined text-sm">lock_open</span>
                      <span className="hidden sm:inline">Unblock</span>
                    </button>
                  ) : connectStatus === 'connected' ? (
                    <button
                      onClick={() => navigate(`/inbox/chat/${connectConvoId}`)}
                      className="flex items-center gap-1 sm:gap-1.5 border border-outline-variant px-2 sm:px-3 py-1.5 font-mono text-xs uppercase hover:bg-surface-container transition-colors bg-primary-container text-on-primary-container"
                    >
                      <span className="material-symbols-outlined text-sm">chat</span>
                      <span className="hidden sm:inline">Message</span>
                    </button>
                  ) : connectStatus === 'pending' ? (
                    <span className="flex items-center gap-1 sm:gap-1.5 border border-outline-variant px-2 sm:px-3 py-1.5 font-mono text-xs uppercase text-on-surface-variant bg-surface-container">
                      <span className="material-symbols-outlined text-sm">schedule</span>
                      <span className="hidden sm:inline">Pending</span>
                    </span>
                  ) : connectStatus === 'incoming' ? (
                    <button
                      onClick={() => navigate('/inbox')}
                      className="flex items-center gap-1 sm:gap-1.5 btn-primary py-1.5 px-2 sm:px-3 text-xs"
                    >
                      <span className="material-symbols-outlined text-sm">person_add</span>
                      <span className="hidden sm:inline">Respond</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => setShowConnectModal(true)}
                      className="flex items-center gap-1 sm:gap-1.5 btn-primary py-1.5 px-2 sm:px-3 text-xs"
                    >
                      <span className="material-symbols-outlined text-sm">person_add</span>
                      <span className="hidden sm:inline">Connect</span>
                    </button>
                  )}
                </div>
              )}
              {isOwn && (
                <a
                  href={`/portfolio/${student.username || student.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 border border-outline-variant px-2 py-1 font-mono text-xs uppercase hover:bg-surface-container transition-colors"
                  title="View Portfolio"
                >
                  <span className="material-symbols-outlined text-sm">open_in_new</span>
                  <span className="hidden sm:inline">Portfolio</span>
                </a>
              )}
              {isOwn && (
                <Link to="/profile/edit" className="btn-primary py-1 px-2 text-xs" title="Edit Profile">
                  <span className="material-symbols-outlined text-sm">edit</span>
                  <span className="hidden sm:inline">Edit</span>
                </Link>
              )}
              {isOwn && (
                <button 
                  onClick={handleLogout}
                  className="md:hidden flex items-center gap-1 border border-red-500/30 text-red-400 bg-red-500/10 px-2 py-1 font-mono text-xs uppercase hover:bg-red-500/20 transition-colors"
                  title="Sign Out"
                >
                  <span className="material-symbols-outlined text-sm">logout</span>
                  <span className="hidden sm:inline">Sign Out</span>
                </button>
              )}
              {!user && (
                <Link to="/auth" className="btn-primary py-1.5 px-2 sm:px-3 text-xs">Join ShowUp</Link>
              )}
            </div>
          </header>

          {/* Profile header */}
          <div className="border-b-2 border-outline-variant bg-surface-container-low px-4 sm:px-6 py-6 sm:py-10">
            <div className="max-w-5xl mx-auto">
              <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6">
                {/* Avatar */}
                <div className="flex-shrink-0">
                  {student.avatar_url ? (
                    <img
                      src={student.avatar_url}
                      alt={student.name}
                      className="w-20 h-20 sm:w-24 sm:h-24 border-2 border-outline-variant object-cover"
                      style={{ boxShadow: "4px 4px 0 #4f378a" }}
                    />
                  ) : (
                    <div
                      className="w-20 h-20 sm:w-24 sm:h-24 bg-primary-container border-2 border-outline-variant flex items-center justify-center"
                      style={{ boxShadow: "4px 4px 0 #4f378a" }}
                    >
                      <span className="font-mono font-black text-2xl sm:text-3xl text-on-primary-container">
                        {student.name?.[0]?.toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0 w-full">
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2">
                    <h1 className="font-grotesk font-bold text-2xl sm:text-3xl text-on-surface leading-tight">{student.name}</h1>
                    <CredibilityBadge score={student.credibility_score} level={student.credibility_level} />
                    {student.is_verified_senior && (
                      <span className="inline-flex items-center gap-1 border border-primary bg-primary-fixed px-2 py-0.5 font-mono text-xs text-on-primary-fixed">
                        <span className="material-symbols-outlined text-sm">verified</span>
                        Verified Senior
                      </span>
                    )}
                  </div>

                  <div className="flex flex-col gap-1 mb-3 sm:mb-4 text-on-surface-variant font-mono text-xs sm:text-sm">
                    <p className="truncate">
                      <span className="material-symbols-outlined text-sm align-middle mr-1">school</span>
                      {student.college}
                    </p>
                    {(student.course || student.college_start_year) && (
                      <p>
                        <span className="material-symbols-outlined text-sm align-middle mr-1">menu_book</span>
                        {student.course}{student.college_start_year && student.college_end_year
                          ? ` (${student.college_start_year} - ${student.college_end_year})`
                          : ""}
                      </p>
                    )}
                    {student.location && (
                      <p>
                        <span className="material-symbols-outlined text-sm align-middle mr-1">location_on</span>
                        {student.location}
                      </p>
                    )}
                    {student.github_url && (
                      <a
                        href={student.github_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 hover:text-on-surface transition-colors w-fit"
                      >
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" className="flex-shrink-0">
                          <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
                        </svg>
                        View GitHub
                      </a>
                    )}
                  </div>

                  {student.skills && student.skills.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-3 sm:mb-4">
                      {student.skills.map((skill, idx) => (
                        <span key={idx} className="bg-surface-container border border-outline-variant px-2 py-0.5 font-mono text-[10px] sm:text-xs text-on-surface">
                          {skill}
                        </span>
                      ))}
                    </div>
                  )}

                  {student.bio && (
                    <p className="text-on-surface leading-relaxed text-sm sm:text-base max-w-2xl break-words">{student.bio}</p>
                  )}

                  {/* Stats row */}
                  <div className="flex gap-4 sm:gap-6 mt-3 sm:mt-4">
                    <div>
                      <p className="font-mono font-bold text-lg sm:text-xl text-on-surface">{projects.length}</p>
                      <p className="font-mono text-[10px] sm:text-xs text-on-surface-variant uppercase">Projects</p>
                    </div>
                    <div>
                      <p className="font-mono font-bold text-lg sm:text-xl text-on-surface">{student.credibility_score}</p>
                      <p className="font-mono text-[10px] sm:text-xs text-on-surface-variant uppercase">Credibility</p>
                    </div>
                    <div>
                      <p className="font-mono font-bold text-lg sm:text-xl text-on-surface">
                        {projects.filter((p) => p.ai_analysis_used).length}
                      </p>
                      <p className="font-mono text-[10px] sm:text-xs text-on-surface-variant uppercase">AI Reviews</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Projects grid */}
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h2 className="font-grotesk font-bold text-lg sm:text-xl text-on-surface">
                Projects <span className="text-on-surface-variant font-normal">({projects.length})</span>
              </h2>
              {isOwn && (
                <Link to="/upload" className="btn-primary text-xs sm:text-sm py-1.5 sm:py-2">
                  <span className="material-symbols-outlined text-sm">add</span>
                  <span className="hidden xs:inline">Add Project</span>
                </Link>
              )}
            </div>

            {projects.length === 0 ? (
              <div className="text-center py-16 border-2 border-dashed border-outline-variant">
                <span className="material-symbols-outlined text-5xl text-outline mb-4 block">folder_open</span>
                <p className="font-grotesk font-bold text-lg text-on-surface mb-2">
                  {isOwn ? "You haven't added anything yet" : "No projects posted yet"}
                </p>
                <p className="font-nunito text-sm text-on-surface-variant mb-4 max-w-xs mx-auto">
                  {isOwn
                    ? "Add your first project and start building your credibility."
                    : `${student.name} hasn't uploaded any projects yet — check back later.`}
                </p>
                {isOwn && (
                  <Link to="/upload" className="btn-primary text-sm mt-2 inline-flex">
                    <span className="material-symbols-outlined text-sm">add</span>
                    Upload First Project
                  </Link>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {projects.map((project) => (
                  <ProjectCard
                    key={project.id}
                    project={{ ...project, student }}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <footer className="border-t-2 border-outline-variant py-6 px-6 text-center mt-auto bg-surface-container">
          <p className="font-mono text-xs text-on-surface-variant mb-3">
            <span className="font-bold text-on-surface">{student.name}</span>'s profile on ShowUp — built for Indian students 🇮🇳
          </p>
          <div className="flex justify-center gap-4 text-xs">
            <Link to="/privacy" className="text-on-surface-variant hover:text-on-surface transition-colors" style={{ textDecoration: 'none' }}>Privacy Policy</Link>
            <span className="text-on-surface-variant">·</span>
            <Link to="/terms" className="text-on-surface-variant hover:text-on-surface transition-colors" style={{ textDecoration: 'none' }}>Terms of Service</Link>
          </div>
        </footer>
      </main>

      {/* Connect Modal */}
      {showConnectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
          <div className="bg-surface-container border-2 border-outline-variant w-full max-w-md" style={{ boxShadow: "6px 6px 0 #4f378a" }}>
            <div className="border-b-2 border-outline-variant px-5 py-4 flex items-center justify-between">
              <h3 className="font-grotesk font-bold text-base uppercase">Connect with {student?.name}</h3>
              <button onClick={() => setShowConnectModal(false)} className="p-1 hover:bg-surface-container">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="p-5">
              <p className="text-sm font-mono text-on-surface-variant mb-4">
                Send a connection request with an optional note explaining why you want to connect.
              </p>
              <label className="label-mono block mb-1.5">Note (optional)</label>
              <textarea
                value={connectNote}
                onChange={(e) => setConnectNote(e.target.value)}
                placeholder="Hi! I'd love to collaborate on a hackathon project..."
                maxLength={500}
                rows={3}
                className="input-brutal w-full resize-none text-sm"
              />
              <p className="text-[10px] font-mono text-on-surface-variant mt-1 text-right">{connectNote.length}/500</p>
            </div>
            <div className="border-t-2 border-outline-variant px-5 py-4 flex gap-3">
              <button
                onClick={handleSendConnect}
                disabled={connectLoading}
                className="btn-primary flex-1 justify-center"
              >
                {connectLoading ? (
                  <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span>
                ) : (
                  <span className="material-symbols-outlined text-sm">send</span>
                )}
                Send Request
              </button>
              <button
                onClick={() => setShowConnectModal(false)}
                className="border-2 border-outline-variant px-4 py-2 font-mono text-xs uppercase hover:bg-surface-container"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
