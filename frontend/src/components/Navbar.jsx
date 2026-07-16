import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useEffect, useState } from "react";
import { chatApi } from "../api";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [unreadCount, setUnreadCount] = useState(0);

  // When user is actively in inbox/chat, don't show badge
  const isInboxRoute = location.pathname.startsWith("/inbox");

  useEffect(() => {
    if (!user) return;
    const fetchCount = () => {
      // Don't fetch (and thus won't flash badge) when user is already looking at inbox
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

  // Clear badge immediately when navigating to inbox
  useEffect(() => {
    if (isInboxRoute) setUnreadCount(0);
  }, [isInboxRoute]);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const navLinkClass = ({ isActive }) =>
    `flex items-center gap-3 px-6 py-4 transition-all duration-75 active:translate-x-0.5 active:translate-y-0.5 border-l-4 ${
      isActive
        ? "border-tertiary-container text-on-surface font-bold bg-surface-container-high"
        : "border-transparent text-on-surface-variant hover:text-on-surface hover:bg-surface-container"
    }`;

  return (
    <>
      {/* ─── Desktop Sidebar ─── */}
      <nav className="hidden md:flex fixed left-0 top-0 h-screen flex-col z-40 w-64 border-r-2 border-ink" style={{ backgroundColor: "hsla(270, 60%, 95%, 1.00)" }}>
        {/* Brand */}
        <div className="p-8 border-b-2 border-ink">
          <NavLink to="/">
            <h1 className="font-mono font-black text-2xl uppercase text-on-surface tracking-tight">
              ShowUp
            </h1>
            <p className="font-nunito uppercase tracking-tighter text-xs text-on-surface-variant mt-1">
              PORTFOLIO V1.0
            </p>
          </NavLink>
        </div>

        {/* Nav items */}
        <div className="flex-1 overflow-y-auto py-4">
          <NavLink to="/feed" className={navLinkClass}>
            <span className="material-symbols-outlined text-xl">home</span>
            <span className="font-nunito uppercase tracking-tighter text-sm">FEED</span>
          </NavLink>

          <NavLink to="/upload" className={navLinkClass}>
            <span className="material-symbols-outlined text-xl">add_circle</span>
            <span className="font-nunito uppercase tracking-tighter text-sm">UPLOAD</span>
          </NavLink>

          <NavLink to="/leaderboard" className={navLinkClass}>
            <span className="material-symbols-outlined text-xl">leaderboard</span>
            <span className="font-nunito uppercase tracking-tighter text-sm">TOP DEVS</span>
          </NavLink>

          <NavLink to="/find-teammate" className={navLinkClass}>
            <span className="material-symbols-outlined text-xl">group</span>
            <span className="font-nunito uppercase tracking-tighter text-sm">FIND TEAMMATE</span>
          </NavLink>

          {user && (
            <NavLink to="/inbox" className={navLinkClass}>
              <div className="relative">
                <span className="material-symbols-outlined text-xl">inbox</span>
                {unreadCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-primary text-on-primary text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </div>
              <span className="font-nunito uppercase tracking-tighter text-sm">INBOX</span>
              {unreadCount > 0 && (
                <span className="ml-auto bg-primary text-on-primary text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  {unreadCount}
                </span>
              )}
            </NavLink>
          )}

          {user && (
            <NavLink to={`/u/${user.id}`} className={navLinkClass}>
              <span className="material-symbols-outlined text-xl">person</span>
              <span className="font-nunito uppercase tracking-tighter text-sm">PROFILE</span>
            </NavLink>
          )}

          <NavLink to="/profile/edit" className={navLinkClass}>
            <span className="material-symbols-outlined text-xl">settings</span>
            <span className="font-nunito uppercase tracking-tighter text-sm">SETTINGS</span>
          </NavLink>
        </div>

        {/* User + Logout */}
        {user && (
          <div className="p-4 border-t-2 border-ink">
            <div className="flex items-center gap-3 mb-3">
              {user.avatar_url ? (
                <img
                  src={user.avatar_url}
                  alt={user.name}
                  className="w-9 h-9 brutalist-border object-cover flex-shrink-0"
                />
              ) : (
                <div className="w-9 h-9 bg-primary-container border-2 border-ink flex items-center justify-center flex-shrink-0">
                  <span className="font-mono font-bold text-sm text-on-primary-container">
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
              className="w-full flex items-center gap-2 px-3 py-2 text-on-surface-variant hover:text-error hover:bg-error-container transition-colors font-nunito text-xs uppercase"
            >
              <span className="material-symbols-outlined text-base">logout</span>
              SIGN OUT
            </button>
          </div>
        )}
      </nav>

      {/* ─── Mobile Bottom Nav ─── */}
      {!location.pathname.startsWith("/inbox/chat") && (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-surface border-t-2 border-ink flex">
        <NavLink
          to="/feed"
          className={({ isActive }) =>
            `flex-1 flex flex-col items-center gap-1 py-3 transition-colors ${isActive ? "text-on-surface bg-surface-container-high" : "text-on-surface-variant"}`
          }
        >
          <span className="material-symbols-outlined text-xl">home</span>
          <span className="font-nunito text-[10px] uppercase">Feed</span>
        </NavLink>

        <NavLink
          to="/upload"
          className={({ isActive }) =>
            `flex-1 flex flex-col items-center gap-1 py-3 transition-colors ${isActive ? "text-on-surface bg-surface-container-high" : "text-on-surface-variant"}`
          }
        >
          <span className="material-symbols-outlined text-xl">add_circle</span>
          <span className="font-nunito text-[10px] uppercase">Upload</span>
        </NavLink>

        <NavLink
          to="/find-teammate"
          className={({ isActive }) =>
            `flex-1 flex flex-col items-center gap-1 py-3 transition-colors ${isActive ? "text-on-surface bg-surface-container-high" : "text-on-surface-variant"}`
          }
        >
          <span className="material-symbols-outlined text-xl">group</span>
          <span className="font-nunito text-[10px] uppercase">Team</span>
        </NavLink>

        {user && (
          <NavLink
            to="/inbox"
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center gap-1 py-3 transition-colors relative ${isActive ? "text-on-surface bg-surface-container-high" : "text-on-surface-variant"}`
            }
          >
            <div className="relative">
              <span className="material-symbols-outlined text-xl">inbox</span>
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-on-primary text-[8px] font-bold w-3.5 h-3.5 rounded-full flex items-center justify-center">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </div>
            <span className="font-nunito text-[10px] uppercase">Inbox</span>
          </NavLink>
        )}

        {user ? (
          <NavLink
            to={`/u/${user.id}`}
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center gap-1 py-3 transition-colors ${isActive ? "text-on-surface bg-surface-container-high" : "text-on-surface-variant"}`
            }
          >
            <span className="material-symbols-outlined text-xl">person</span>
            <span className="font-nunito text-[10px] uppercase">Me</span>
          </NavLink>
        ) : (
          <NavLink
            to="/auth"
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center gap-1 py-3 transition-colors ${isActive ? "text-on-surface bg-surface-container-high" : "text-on-surface-variant"}`
            }
          >
            <span className="material-symbols-outlined text-xl">login</span>
            <span className="font-mono text-[10px] uppercase">Login</span>
          </NavLink>
        )}
        </nav>
      )}
    </>
  );
}
