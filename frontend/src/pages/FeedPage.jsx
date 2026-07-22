import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { projectsApi, feedApi } from "../api";
import ProjectCard from "../components/ProjectCard";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";

const FILTERS = [
  { key: "newest", label: "Newest", icon: "schedule" },
  { key: "this_week", label: "This Week", icon: "local_fire_department" },
  { key: "most_viewed", label: "Most Viewed", icon: "trending_up" },
];

export default function FeedPage() {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [filter, setFilter] = useState("newest");
  const [page, setPage] = useState(1);
  const [hasNext, setHasNext] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");

  const fetchProjects = useCallback(async (pageNum = 1, activeFilter = filter, append = false) => {
    try {
      if (pageNum === 1) setLoading(true);
      else setLoadingMore(true);

      const res = await projectsApi.list({ page: pageNum, limit: 12, filter: activeFilter });
      const data = res.data.data;

      if (append) {
        setProjects((prev) => [...prev, ...data.projects]);
      } else {
        setProjects(data.projects);
      }
      setHasNext(data.has_next);
      setPage(pageNum);
    } catch {
      setError("Failed to load projects. Please try again.");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchProjects(1, filter, false);
  }, [filter]);

  const handleFilterChange = (key) => {
    if (key === filter) return;
    setFilter(key);
    setPage(1);
  };

  const handleLoadMore = () => {
    fetchProjects(page + 1, filter, true);
  };

  return (
    <div className="flex min-h-screen w-full bg-transparent overflow-x-hidden">
      <Navbar />

      {/* Main content */}
      <main className="flex-1 min-w-0 md:ml-64 pb-20 md:pb-0">
        {/* Page header */}
        <div className="topbar-dark">
          <div className="flex items-center justify-between mb-3">
            <h1 className="font-grotesk font-bold text-xl text-on-surface">Discovery Feed</h1>
          </div>

          {/* Filter bar */}
          <div className="flex gap-1.5">
            {FILTERS.map((f) => (
              <button
                key={f.key}
                onClick={() => handleFilterChange(f.key)}
                className={`flex items-center gap-1.5 px-4 py-1.5 font-nunito text-xs font-semibold uppercase tracking-wide rounded-lg transition-all ${
                  filter === f.key
                    ? "bg-brand-gradient text-white shadow-glow-brand-sm"
                    : "text-on-surface-variant hover:text-on-surface hover:bg-white/5"
                }`}
              >
                <span className="material-symbols-outlined text-sm">{f.icon}</span>
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <div className="p-6">
          {/* Loading skeleton */}
          {loading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="rounded-2xl overflow-hidden animate-pulse bg-surface-container border border-white/[0.06]">
                  <div className="aspect-video bg-surface-container-high" />
                  <div className="p-4 space-y-3">
                    <div className="h-4 rounded-lg w-3/4 bg-surface-container-high" />
                    <div className="h-3 rounded-lg w-1/2 bg-surface-container-high" />
                    <div className="flex gap-2">
                      <div className="h-5 rounded-full w-16 bg-surface-container-high" />
                      <div className="h-5 rounded-full w-16 bg-surface-container-high" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Error */}
          {error && !loading && (
            <div className="rounded-2xl p-6 text-center" style={{ background: "rgba(58,10,10,0.6)", border: "1px solid rgba(248,113,113,0.25)" }}>
              <p className="font-nunito text-sm text-red-400">{error}</p>
              <button onClick={() => fetchProjects(1, filter, false)} className="btn-secondary mt-4 text-xs">
                Retry
              </button>
            </div>
          )}

          {/* Projects grid */}
          {!loading && !error && (
            <>
              {projects.length === 0 ? (
                <div className="text-center py-20">
                  <div className="w-16 h-16 rounded-2xl mx-auto mb-5 flex items-center justify-center" style={{ background: "rgba(109,40,217,0.15)", border: "1px solid rgba(139,92,246,0.25)" }}>
                    <span className="material-symbols-outlined text-3xl text-violet-400">folder_open</span>
                  </div>
                  <p className="font-grotesk font-bold text-lg text-on-surface mb-2">Nothing here yet</p>
                  <p className="font-nunito text-sm text-on-surface-variant max-w-xs mx-auto">
                    Upload your first project or explore what others are building.
                  </p>
                  <div className="flex gap-3 justify-center mt-5">
                    <Link to="/upload" className="btn-primary text-xs py-2">
                      <span className="material-symbols-outlined text-sm">add_circle</span>
                      Upload a project
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
                  {projects.map((project) => (
                    <ProjectCard key={project.id} project={project} />
                  ))}
                </div>
              )}

              {/* Load more */}
              {hasNext && (
                <div className="flex justify-center mt-10">
                  <button
                    onClick={handleLoadMore}
                    disabled={loadingMore}
                    className="btn-secondary"
                  >
                    {loadingMore ? (
                      <>
                        <span className="material-symbols-outlined text-base animate-spin">progress_activity</span>
                        Loading...
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-base">expand_more</span>
                        Load More Projects
                      </>
                    )}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
