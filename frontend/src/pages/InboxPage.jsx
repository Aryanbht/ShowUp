import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { chatApi } from "../api";
import { useAuth } from "../context/AuthContext";

function timeAgo(isoStr) {
  if (!isoStr) return "";
  // Append Z to enforce UTC if the backend returned a naive datetime string
  if (!isoStr.endsWith("Z") && !isoStr.match(/[\+\-]\d{2}:?\d{2}$/)) {
    isoStr += "Z";
  }
  const date = new Date(isoStr);
  const now = new Date();
  const diffSec = (now - date) / 1000;
  const diffMin = diffSec / 60;

  if (diffSec < 60) return "Just now";
  if (diffMin < 60) return `${Math.floor(diffMin)}m`;

  const isToday =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();
  if (isToday) return date.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit", hour12: true });

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const isYesterday =
    date.getDate() === yesterday.getDate() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getFullYear() === yesterday.getFullYear();
  if (isYesterday) return "Yesterday";

  if ((now - date) / 86400000 < 7)
    return date.toLocaleDateString("en-IN", { weekday: "short" });

  return date.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

export default function InboxPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState("requests");

  const [requests, setRequests] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  const fetchData = async () => {
    try {
      const [reqRes, convoRes, notifRes] = await Promise.all([
        chatApi.getInboxRequests(),
        chatApi.listConversations(),
        chatApi.getNotifications(),
      ]);
      setRequests(reqRes.data.data || []);
      setConversations(convoRes.data.data || []);
      setNotifications(notifRes.data.data?.notifications || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Auto-mark notifications as read when user opens the tab
  useEffect(() => {
    if (tab === "notifications") {
      const hasUnread = notifications.some((n) => !n.is_read);
      if (hasUnread) {
        chatApi.markNotificationsRead().then(() => {
          setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
        }).catch(() => {});
      }
    }
  }, [tab]);

  const handleAccept = async (reqId) => {
    setActionLoading(reqId + "_accept");
    try {
      const res = await chatApi.acceptRequest(reqId);
      const convoId = res.data.data?.conversation_id;
      await fetchData();
      if (convoId) navigate(`/inbox/chat/${convoId}`);
    } catch (e) {
      alert(e.response?.data?.message || "Failed to accept");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDecline = async (reqId) => {
    setActionLoading(reqId + "_decline");
    try {
      await chatApi.declineRequest(reqId);
      setRequests((prev) => prev.filter((r) => r.id !== reqId));
    } catch (e) {
      alert(e.response?.data?.message || "Failed to decline");
    } finally {
      setActionLoading(null);
    }
  };

  const handleMarkNotificationsRead = async () => {
    await chatApi.markNotificationsRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
  };

  const totalUnread = requests.length +
    notifications.filter((n) => !n.is_read).length +
    conversations.reduce((acc, c) => acc + (c.unread_count || 0), 0);

  const tabs = [
    { id: "requests", label: "Requests", icon: "person_add", count: requests.length },
    { id: "chats", label: "Chats", icon: "chat", count: conversations.reduce((a, c) => a + (c.unread_count || 0), 0) },
    { id: "notifications", label: "Notifications", icon: "notifications", count: notifications.filter((n) => !n.is_read).length },
  ];

  return (
    <div className="flex min-h-screen bg-transparent overflow-x-hidden">
      <Navbar />
      <main className="flex-1 min-w-0 md:ml-64 pb-20 md:pb-0">
        <header className="topbar-dark flex items-center justify-between">
          <div>
            <h1 className="font-grotesk font-bold text-xl text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined">inbox</span>
              Inbox
              {totalUnread > 0 && (
                <span className="text-white text-xs font-mono font-bold px-2 py-0.5 rounded-full"
                  style={{ background: "linear-gradient(135deg,#7c3aed,#8b5cf6)" }}>
                  {totalUnread}
                </span>
              )}
            </h1>
            <p className="label-mono text-on-surface-variant mt-0.5">Manage your connections and messages</p>
          </div>
        </header>

        <div className="max-w-3xl mx-auto p-4 sm:p-6">
          {/* Tabs */}
          <div className="flex gap-1.5 mb-6 p-1 rounded-xl" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex-1 flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 py-2 sm:py-2.5 font-nunito text-[10px] sm:text-xs uppercase font-semibold tracking-wide rounded-lg transition-all ${
                  tab === t.id ? "text-white" : "text-on-surface-variant hover:text-on-surface"}`}
                style={tab === t.id ? { background: "linear-gradient(135deg,#7c3aed,#8b5cf6)", boxShadow: "0 0 12px rgba(124,58,237,0.3)" } : {}}
              >
                <div className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px] sm:text-sm">{t.icon}</span>
                  {t.count > 0 && (
                    <span className={`px-1.5 py-0.5 rounded-full text-[9px] sm:text-[10px] font-bold leading-none ${
                      tab === t.id ? "bg-white/20 text-white" : "bg-violet-900/50 text-violet-300"}`}>
                      {t.count}
                    </span>
                  )}
                </div>
                <span className="hidden sm:inline">{t.label}</span>
                <span className="sm:hidden mt-0.5 text-[8px] leading-none tracking-tighter">{t.label}</span>
              </button>
            ))}
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <span className="material-symbols-outlined animate-spin text-3xl text-on-surface-variant">progress_activity</span>
            </div>
          ) : (
            <>
              {/* ── REQUESTS TAB ── */}
              {tab === "requests" && (
                <div className="space-y-4">
                  {requests.length === 0 ? (
                    <div className="text-center py-16 rounded-2xl" style={{ background: "rgba(255,255,255,0.03)", border: "1px dashed rgba(139,92,246,0.2)" }}>
                      <div className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center" style={{ background: "rgba(109,40,217,0.15)", border: "1px solid rgba(139,92,246,0.25)" }}>
                        <span className="material-symbols-outlined text-3xl text-violet-400">person_add</span>
                      </div>
                      <p className="font-nunito text-sm text-on-surface-variant">No pending connection requests</p>
                    </div>
                  ) : (
                    requests.map((req) => (
                      <div key={req.id} className="glass-card p-5">
                        <div className="flex items-start gap-4">
                          {req.sender?.avatar_url ? (
                            <img src={req.sender.avatar_url} alt={req.sender.name} className="w-12 h-12 rounded-xl object-cover flex-shrink-0" style={{ border: "1px solid rgba(255,255,255,0.12)" }} />
                          ) : (
                            <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "linear-gradient(135deg,#7c3aed,#8b5cf6)" }}>
                              <span className="font-mono font-bold text-lg text-white">{req.sender?.name?.[0]?.toUpperCase()}</span>
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-bold text-base">{req.sender?.name}</span>
                              <span className="label-mono text-on-surface-variant">{timeAgo(req.created_at)}</span>
                            </div>
                            <p className="text-xs font-mono text-on-surface-variant">{req.sender?.college}</p>
                            {req.note && (
                              <div className="mt-2 p-3 bg-surface-container border border-outline-variant text-sm font-mono">
                                <span className="text-on-surface-variant text-[10px] uppercase font-bold block mb-1">Note</span>
                                "{req.note}"
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-3 mt-4 pt-3 border-t border-dashed border-outline-variant">
                          <button
                            onClick={() => handleAccept(req.id)}
                            disabled={actionLoading === req.id + "_accept"}
                            className="btn-primary flex-1 justify-center py-1.5 text-xs"
                          >
                            {actionLoading === req.id + "_accept" ? (
                              <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span>
                            ) : (
                              <span className="material-symbols-outlined text-sm">check</span>
                            )}
                            Accept
                          </button>
                          <button
                            onClick={() => handleDecline(req.id)}
                            disabled={actionLoading === req.id + "_decline"}
                            className="flex-1 justify-center flex items-center gap-1 border-2 border-outline-variant py-1.5 font-mono text-xs uppercase font-bold hover:bg-error hover:text-on-error transition-colors"
                          >
                            {actionLoading === req.id + "_decline" ? (
                              <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span>
                            ) : (
                              <span className="material-symbols-outlined text-sm">close</span>
                            )}
                            Decline
                          </button>
                          <a
                            href={`/u/${req.sender?.id}`}
                            className="border-2 border-outline-variant px-3 py-1.5 font-mono text-xs uppercase font-bold hover:bg-surface-container transition-colors flex items-center gap-1"
                          >
                            <span className="material-symbols-outlined text-sm">person</span>
                          </a>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* ── CHATS TAB ── */}
              {tab === "chats" && (
                <div className="space-y-2">
                  {conversations.length === 0 ? (
                    <div className="text-center py-16 border-2 border-dashed border-outline-variant bg-surface-container">
                      <span className="material-symbols-outlined text-4xl text-on-surface-variant mb-3 block">chat_bubble</span>
                      <p className="font-mono text-sm text-on-surface-variant">No active chats yet</p>
                      <p className="font-mono text-xs text-on-surface-variant mt-1">Accept a connection request to start chatting</p>
                    </div>
                  ) : (
                    conversations.map((convo) => (
                      <button
                        key={convo.id}
                        onClick={() => navigate(`/inbox/chat/${convo.id}`)}
                        className="w-full glass-card p-4 flex items-center gap-4 hover:bg-surface-container text-left transition-colors"
                      >
                        <div className="relative flex-shrink-0">
                          {convo.other_user?.avatar_url ? (
                            <img src={convo.other_user.avatar_url} alt={convo.other_user.name} className="w-12 h-12 border-2 border-outline-variant object-cover" />
                          ) : (
                            <div className="w-12 h-12 bg-primary-container border-2 border-outline-variant flex items-center justify-center">
                              <span className="font-mono font-bold text-lg text-on-primary-container">{convo.other_user?.name?.[0]?.toUpperCase()}</span>
                            </div>
                          )}
                          {convo.unread_count > 0 && (
                            <span className="absolute -top-1 -right-1 bg-primary text-on-primary text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                              {convo.unread_count}
                            </span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-bold truncate">{convo.other_user?.name}</span>
                            <span className="label-mono text-on-surface-variant text-[10px] flex-shrink-0">{timeAgo(convo.last_message_at)}</span>
                          </div>
                          <p className="text-xs font-mono text-on-surface-variant truncate mt-0.5">
                            {convo.last_message?.message_type === "voice" ? (
                              <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[12px]">mic</span> Voice note</span>
                            ) : convo.last_message?.content || "Start the conversation!"}
                          </p>
                        </div>
                        <span className="material-symbols-outlined text-on-surface-variant text-sm">arrow_forward_ios</span>
                      </button>
                    ))
                  )}
                </div>
              )}

              {/* ── NOTIFICATIONS TAB ── */}
              {tab === "notifications" && (
                <div>
                  {notifications.filter((n) => !n.is_read).length > 0 && (
                    <button onClick={handleMarkNotificationsRead} className="mb-4 text-xs font-mono text-on-surface-variant hover:text-primary underline">
                      Mark all as read
                    </button>
                  )}
                  <div className="space-y-3">
                    {notifications.length === 0 ? (
                      <div className="text-center py-16 border-2 border-dashed border-outline-variant bg-surface-container">
                        <span className="material-symbols-outlined text-4xl text-on-surface-variant mb-3 block">notifications_none</span>
                        <p className="font-mono text-sm text-on-surface-variant">No notifications yet</p>
                      </div>
                    ) : (
                      notifications.map((notif) => (
                        <div
                          key={notif.id}
                          className={`p-4 border-2 border-outline-variant flex items-start gap-3 ${!notif.is_read ? "bg-primary-container" : "bg-surface-container"}`}
                        >
                          <span className={`material-symbols-outlined text-xl mt-0.5 ${notif.notification_type === "request_accepted" ? "text-primary" : "text-error"}`}>
                            {notif.notification_type === "request_accepted" ? "check_circle" : "cancel"}
                          </span>
                          <div className="flex-1">
                            <p className="text-sm font-mono">{notif.message}</p>
                            <p className="text-[10px] font-mono text-on-surface-variant mt-1">{timeAgo(notif.created_at)}</p>
                            {notif.notification_type === "request_accepted" && notif.conversation_id && (
                              <button
                                onClick={() => navigate(`/inbox/chat/${notif.conversation_id}`)}
                                className="mt-2 text-xs font-bold font-mono text-primary hover:underline flex items-center gap-1"
                              >
                                Open Chat <span className="material-symbols-outlined text-sm">arrow_forward</span>
                              </button>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
