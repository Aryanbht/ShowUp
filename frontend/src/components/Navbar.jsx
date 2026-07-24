import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useEffect, useState } from "react";
import { chatApi } from "../api";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [unreadCount, setUnreadCount] = useState(0);

  const isInboxRoute = location.pathname.startsWith("/inbox");

  useEffect(() => {
    if (!user) return;
    const fetchCount = () => {
      if (window.location.pathname.startsWith("/inbox")) {
        setUnreadCount(0);
        return;
      }
      chatApi.getUnreadCount().then((res) => {
        setUnreadCount(res.data.data?.total || 0);
      }).catch(() => {});
    };
    fetchCount();
    const interval = setInterval(fetchCount, 8000);
    return () => clearInterval(interval);
  }, [user]);

  useEffect(() => {
    if (isInboxRoute) setUnreadCount(0);
  }, [isInboxRoute]);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const navLinkClass = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-3 mx-2 rounded-xl transition-all duration-150 ${
      isActive
        ? "bg-violet-950/70 text-violet-200 border border-violet-800/50"
        : "text-on-surface-variant hover:text-on-surface hover:bg-white/5 border border-transparent"
    }`;

  return (
    <>
      {/* ─── Desktop Sidebar ─── */}
      <nav
        className="hidden md:flex fixed left-0 top-0 h-screen flex-col z-40 w-64 bg-gradient-to-b from-sidebar-from to-sidebar-to border-r border-white/[0.07]"
      >
        {/* Brand */}
        <div className="px-6 py-7 border-b border-white/[0.07]">
          <NavLink to="/" className="block">
            <div className="flex items-center gap-2.5">
              {/* Logo mark */}
              <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: "#0a0a0f", border: "1px solid rgba(139, 92, 246, 0.2)" }}>
                <svg viewBox="0 0 24 24" fill="#8b5cf6" width="16" height="16">
                  <path d="M5 8v6a7 7 0 0 0 14 0v-3h-3.5v3a3.5 3.5 0 0 1-7 0V8H5z" />
                  <path d="M17.25 2l-5 5h3.25v2h3.5V7h3.25L17.25 2z" />
                </svg>
              </div>
              <h1 className="font-mono font-bold text-lg text-white tracking-tight">ShowUp</h1>
            </div>
          </NavLink>
        </div>

        {/* Nav items */}
        <div className="flex-1 overflow-y-auto py-3 space-y-0.5">
          <NavLink to="/feed" className={navLinkClass}>
            <span className="material-symbols-outlined text-[20px]">home</span>
            <span className="font-nunito uppercase tracking-wider text-sm font-semibold">Feed</span>
          </NavLink>

          <NavLink to="/upload" className={navLinkClass}>
            <span className="material-symbols-outlined text-[20px]">add_circle</span>
            <span className="font-nunito uppercase tracking-wider text-sm font-semibold">Upload</span>
          </NavLink>

          <NavLink to="/portfolio/customize" className={navLinkClass}>
            <span className="material-symbols-outlined text-[20px]">dashboard_customize</span>
            <span className="font-nunito uppercase tracking-wider text-sm font-semibold">Portfolio</span>
          </NavLink>

          <NavLink to="/leaderboard" className={navLinkClass}>
            <span className="material-symbols-outlined text-[20px]">leaderboard</span>
            <span className="font-nunito uppercase tracking-wider text-sm font-semibold">Top Devs</span>
          </NavLink>

          <NavLink to="/find-teammate" className={navLinkClass}>
            <span className="material-symbols-outlined text-[20px]">group</span>
            <span className="font-nunito uppercase tracking-wider text-sm font-semibold">Find Teammate</span>
          </NavLink>

          {user && (
            <NavLink to="/inbox" className={navLinkClass}>
              <div className="relative">
                <span className="material-symbols-outlined text-[20px]">inbox</span>
                {unreadCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-brand-gradient text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </div>
              <span className="font-nunito uppercase tracking-wider text-sm font-semibold">Inbox</span>
              {unreadCount > 0 && (
                <span className="ml-auto bg-brand-gradient text-[10px] font-bold px-1.5 py-0.5 rounded-full text-white">
                  {unreadCount}
                </span>
              )}
            </NavLink>
          )}

          {user && (
            <NavLink to={`/u/${user.id}`} className={navLinkClass}>
              <span className="material-symbols-outlined text-[20px]">person</span>
              <span className="font-nunito uppercase tracking-wider text-sm font-semibold">Profile</span>
            </NavLink>
          )}

          <NavLink to="/profile/edit" className={navLinkClass}>
            <span className="material-symbols-outlined text-[20px]">settings</span>
            <span className="font-nunito uppercase tracking-wider text-sm font-semibold">Settings</span>
          </NavLink>
        </div>

        {/* User + Logout */}
        {user && (
          <div className="p-4" style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}>
            <div className="flex items-center gap-3 mb-3">
              {user.avatar_url ? (
                <img
                  src={user.avatar_url}
                  alt={user.name}
                  className="w-9 h-9 rounded-xl object-cover flex-shrink-0"
                  style={{ border: "1px solid rgba(255,255,255,0.12)" }}
                />
              ) : (
                <div className="w-9 h-9 rounded-xl bg-brand-gradient border border-violet-500/40 flex items-center justify-center flex-shrink-0">
                  <span className="font-mono font-bold text-sm text-white">
                    {user.name?.[0]?.toUpperCase()}
                  </span>
                </div>
              )}
              <div className="min-w-0">
                <p className="font-semibold text-sm text-on-surface truncate">{user.name}</p>
                <p className="font-nunito text-xs text-on-surface-variant truncate">{user.college}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-on-surface-variant hover:text-red-400 transition-colors font-nunito text-xs uppercase tracking-wide"
              style={{ hover: { background: "rgba(248,113,113,0.08)" } }}
            >
              <span className="material-symbols-outlined text-base">logout</span>
              Sign Out
            </button>
          </div>
        )}
      </nav>
      {/* ─── Mobile Bottom Nav ─── */}
      {!location.pathname.startsWith("/inbox/chat") && (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 flex bg-[#09090F]/95 backdrop-blur-[16px] border-t border-white/[0.07]">
          <NavLink
            to="/feed"
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center gap-1 py-3 transition-colors ${isActive ? "text-violet-300" : "text-on-surface-variant"}`
            }
          >
            <span className="material-symbols-outlined text-xl">home</span>
            <span className="font-nunito text-[10px] uppercase tracking-wide">Feed</span>
          </NavLink>

          <NavLink
            to="/upload"
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center gap-1 py-3 transition-colors ${isActive ? "text-violet-300" : "text-on-surface-variant"}`
            }
          >
            <span className="material-symbols-outlined text-xl">add_circle</span>
            <span className="font-nunito text-[10px] uppercase tracking-wide">Upload</span>
          </NavLink>

          <NavLink
            to="/portfolio/customize"
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center gap-1 py-3 transition-colors ${isActive ? "text-violet-300" : "text-on-surface-variant"}`
            }
          >
            <span className="material-symbols-outlined text-xl">dashboard_customize</span>
            <span className="font-nunito text-[10px] uppercase tracking-wide">Portfolio</span>
          </NavLink>

          {user && (
            <NavLink
              to="/inbox"
              className={({ isActive }) =>
                `flex-1 flex flex-col items-center gap-1 py-3 transition-colors relative ${isActive ? "text-violet-300" : "text-on-surface-variant"}`
              }
            >
              <div className="relative">
                <span className="material-symbols-outlined text-xl">inbox</span>
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-brand-gradient text-white text-[8px] font-bold w-3.5 h-3.5 rounded-full flex items-center justify-center">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </div>
              <span className="font-nunito text-[10px] uppercase tracking-wide">Inbox</span>
            </NavLink>
          )}

          {user ? (
            <NavLink
              to={`/u/${user.id}`}
              className={({ isActive }) =>
                `flex-1 flex flex-col items-center gap-1 py-3 transition-colors ${isActive ? "text-violet-300" : "text-on-surface-variant"}`
              }
            >
              <span className="material-symbols-outlined text-xl">person</span>
              <span className="font-nunito text-[10px] uppercase tracking-wide">Me</span>
            </NavLink>
          ) : (
            <NavLink
              to="/auth"
              className={({ isActive }) =>
                `flex-1 flex flex-col items-center gap-1 py-3 transition-colors ${isActive ? "text-violet-300" : "text-on-surface-variant"}`
              }
            >
              <span className="material-symbols-outlined text-xl">login</span>
              <span className="font-nunito text-[10px] uppercase tracking-wide">Login</span>
            </NavLink>
          )}
        </nav>
      )}
    </>
  );
}
