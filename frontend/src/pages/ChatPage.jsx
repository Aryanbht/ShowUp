import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate, Link, useLocation } from "react-router-dom";
import { chatApi } from "../api";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";

// ─── Instagram-style smart timestamp ──────────────────────────────────────────
function formatMessageTime(isoStr) {
  if (!isoStr) return "";
  // Append Z to enforce UTC if the backend returned a naive datetime string
  if (!isoStr.endsWith("Z") && !isoStr.match(/[\+\-]\d{2}:?\d{2}$/)) {
    isoStr += "Z";
  }
  const date = new Date(isoStr);
  const now = new Date();
  const diffMs = now - date;
  const diffSec = diffMs / 1000;
  const diffMin = diffSec / 60;
  const diffHour = diffMin / 60;
  const diffDay = diffHour / 24;

  // Within the last minute
  if (diffSec < 60) return "Just now";

  // Within the last hour → show "Xm"
  if (diffMin < 60) return `${Math.floor(diffMin)}m`;

  // Same calendar day → show time like "3:42 PM"
  const isToday =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();
  if (isToday) {
    return date.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit", hour12: true });
  }

  // Yesterday
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const isYesterday =
    date.getDate() === yesterday.getDate() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getFullYear() === yesterday.getFullYear();
  if (isYesterday) {
    return `Yesterday ${date.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit", hour12: true })}`;
  }

  // Within the last 7 days → "Mon 3:20 PM"
  if (diffDay < 7) {
    const dayName = date.toLocaleDateString("en-IN", { weekday: "short" });
    return `${dayName} ${date.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit", hour12: true })}`;
  }

  // Older → "12 Jul 3:20 PM"
  return date.toLocaleDateString("en-IN", { day: "numeric", month: "short" }) +
    " " + date.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit", hour12: true });
}

// Show a date divider only when dates change between messages
function shouldShowDateDivider(curr, prev) {
  if (!prev) return true;
  const c = new Date(curr.created_at);
  const p = new Date(prev.created_at);
  return (
    c.getDate() !== p.getDate() ||
    c.getMonth() !== p.getMonth() ||
    c.getFullYear() !== p.getFullYear()
  );
}

function DateDivider({ isoStr }) {
  // Append Z to enforce UTC if the backend returned a naive datetime string
  if (isoStr && !isoStr.endsWith("Z") && !isoStr.match(/[\+\-]\d{2}:?\d{2}$/)) {
    isoStr += "Z";
  }
  const date = new Date(isoStr);
  const now = new Date();
  const diffDay = (now - date) / 86400000;
  let label;
  if (diffDay < 1 && date.getDate() === now.getDate()) label = "Today";
  else if (diffDay < 2) label = "Yesterday";
  else if (diffDay < 7) label = date.toLocaleDateString("en-IN", { weekday: "long" });
  else label = date.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });

  return (
    <div className="flex items-center gap-3 my-2">
      <div className="flex-1 h-px bg-ink opacity-20" />
      <span className="text-[10px] font-mono text-on-surface-variant px-2">{label}</span>
      <div className="flex-1 h-px bg-ink opacity-20" />
    </div>
  );
}

// Upload voice blob to Cloudinary
async function uploadVoiceToCloudinary(blob) {
  const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
  const formData = new FormData();
  formData.append("file", blob, "voice_note.webm");
  formData.append("upload_preset", UPLOAD_PRESET);
  formData.append("resource_type", "video");
  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/video/upload`, {
    method: "POST",
    body: formData,
  });
  const data = await res.json();
  return data.secure_url;
}

export default function ChatPage() {
  const { conversationId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [messages, setMessages] = useState([]);
  const [otherUser, setOtherUser] = useState(null);
  const [isBlockedByMe, setIsBlockedByMe] = useState(false);
  const [isBlockedByThem, setIsBlockedByThem] = useState(false);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [hoveredMsgId, setHoveredMsgId] = useState(null);
  const [editingMessage, setEditingMessage] = useState(null);
  const [showMsgMenu, setShowMsgMenu] = useState(null);

  // Trust & Safety State
  const [showMenu, setShowMenu] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [reportLoading, setReportLoading] = useState(false);

  // Voice note state
  const [recording, setRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [uploading, setUploading] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const recordingTimerRef = useRef(null);

  const bottomRef = useRef(null);
  const messagesAreaRef = useRef(null);
  const pollIntervalRef = useRef(null);
  const inputRef = useRef(null);

  const fetchMessages = useCallback(async (silent = false) => {
    try {
      const res = await chatApi.getMessages(conversationId);
      const msgs = res.data.data?.messages || [];
      setMessages(msgs);
      if (!silent) {
        const convoRes = await chatApi.listConversations();
        const convo = (convoRes.data.data || []).find((c) => c.id === conversationId);
        if (convo) {
          setOtherUser(convo.other_user);
          setIsBlockedByMe(convo.is_blocked_by_me);
          setIsBlockedByThem(convo.is_blocked_by_them);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [conversationId]);

  useEffect(() => {
    fetchMessages(false);
    pollIntervalRef.current = setInterval(() => fetchMessages(true), 3000);
    return () => clearInterval(pollIntervalRef.current);
  }, [fetchMessages]);

  // Scroll to bottom only when we're near the bottom or on initial load
  const prevMsgCountRef = useRef(0);
  useEffect(() => {
    if (messages.length === 0) return;
    const area = messagesAreaRef.current;
    const isNearBottom = area ? area.scrollHeight - area.scrollTop - area.clientHeight < 120 : true;
    const isNewMessage = messages.length > prevMsgCountRef.current;
    if (isNearBottom || !isNewMessage) {
      bottomRef.current?.scrollIntoView({ behavior: prevMsgCountRef.current === 0 ? "instant" : "smooth" });
    }
    prevMsgCountRef.current = messages.length;
  }, [messages]);

  const handleSendText = async (e) => {
    e.preventDefault();
    if (!text.trim() || sending) return;
    setSending(true);
    const content = text.trim();
    if (editingMessage) {
      try {
        await chatApi.editMessage(editingMessage.id, content);
        setEditingMessage(null);
        await fetchMessages(true);
      } catch (err) {
        setText(content);
        alert(err.response?.data?.message || "Failed to edit message");
      } finally {
        setSending(false);
      }
      return;
    }

    setText("");
    inputRef.current?.focus();
    try {
      await chatApi.sendMessage(conversationId, { content, message_type: "text" });
      await fetchMessages(true);
    } catch (err) {
      setText(content);
      alert(err.response?.data?.message || "Failed to send message");
    } finally {
      setSending(false);
    }
  };

  // Trust & Safety Handlers
  const handleDeleteMessage = async (msgId) => {
    if (!window.confirm("Are you sure you want to delete this message?")) return;
    try {
      await chatApi.deleteMessage(msgId);
      setShowMsgMenu(null);
      await fetchMessages(true);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete message");
    }
  };
  const handleStop = async () => {
    setShowMenu(false);
    if (!window.confirm("Are you sure you want to stop this conversation? You will have to send a new request to connect again.")) return;
    try {
      await chatApi.stopConversation(conversationId);
      navigate("/inbox");
    } catch (e) {
      alert("Failed to stop conversation: " + (e.response?.data?.message || e.message));
    }
  };

  const handleBlock = async () => {
    setShowMenu(false);
    if (!window.confirm("Are you sure you want to block this user? They will not be able to contact you anymore.")) return;
    try {
      await chatApi.blockUser(otherUser.id);
      setIsBlockedByMe(true);
    } catch (e) {
      alert("Failed to block user: " + (e.response?.data?.message || e.message));
    }
  };

  const handleUnblock = async () => {
    try {
      await chatApi.unblockUser(otherUser.id);
      setIsBlockedByMe(false);
    } catch (e) {
      alert("Failed to unblock user: " + (e.response?.data?.message || e.message));
    }
  };

  const handleReport = async () => {
    if (!reportReason.trim()) { alert("Please provide a reason."); return; }
    setReportLoading(true);
    try {
      await chatApi.reportUser(otherUser.id, reportReason);
      alert("User reported successfully. Our team will review it.");
      setShowReportModal(false);
      setReportReason("");
    } catch (e) {
      alert("Failed to report user: " + (e.response?.data?.message || e.message));
    } finally {
      setReportLoading(false);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      audioChunksRef.current = [];
      setRecordingDuration(0);
      recordingTimerRef.current = setInterval(() => setRecordingDuration((d) => d + 1), 1000);
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };
      recorder.onstop = async () => {
        clearInterval(recordingTimerRef.current);
        setRecordingDuration(0);
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        setUploading(true);
        try {
          const url = await uploadVoiceToCloudinary(blob);
          await chatApi.sendMessage(conversationId, { voice_url: url, message_type: "voice" });
          await fetchMessages(true);
        } catch {
          alert("Failed to send voice note. Please try again.");
        } finally {
          setUploading(false);
        }
      };
      mediaRecorderRef.current = recorder;
      recorder.start();
      setRecording(true);
    } catch {
      alert("Microphone permission denied. Please allow microphone access.");
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setRecording(false);
  };

  const isOwn = (msg) => msg.sender_id === user?.id;

  // Get the last message sent BY ME to determine seen status
  const lastOwnMsgIdx = messages.reduceRight((found, msg, idx) => {
    return found === -1 && isOwn(msg) ? idx : found;
  }, -1);

  return (
    <div className="flex h-[100dvh] bg-surface-container overflow-hidden">
      <Navbar />
      <main className="flex-1 md:ml-64 flex flex-col min-w-0 h-[100dvh]">
        {/* ── Header ── */}
        <header className="flex-shrink-0 border-b-2 border-outline-variant px-3 sm:px-4 py-2.5 bg-surface-container flex items-center gap-2 sm:gap-3">
          <button
            onClick={() => navigate("/inbox")}
            className="p-1.5 hover:bg-surface-container transition-colors rounded flex-shrink-0"
          >
            <span className="material-symbols-outlined text-xl">arrow_back</span>
          </button>
          {otherUser ? (
            <>
              <Link to={`/u/${otherUser.id}`} className="flex items-center gap-2 sm:gap-3 hover:opacity-80 transition-opacity min-w-0 flex-1">
                {otherUser.avatar_url ? (
                  <img
                    src={otherUser.avatar_url}
                    alt={otherUser.name}
                    className="w-9 h-9 border-2 border-outline-variant object-cover rounded-full flex-shrink-0"
                  />
                ) : (
                  <div className="w-9 h-9 bg-primary-container border-2 border-outline-variant rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="font-mono font-bold text-sm">{otherUser.name?.[0]?.toUpperCase()}</span>
                  </div>
                )}
                <div className="min-w-0">
                  <p className="font-bold text-sm truncate">{otherUser.name}</p>
                  <p className="text-[10px] font-mono text-on-surface-variant truncate">{otherUser.college}</p>
                </div>
              </Link>
              
              <div className="relative">
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className="p-1.5 hover:bg-surface-container transition-colors rounded"
                >
                  <span className="material-symbols-outlined text-xl">more_vert</span>
                </button>
                {showMenu && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
                    <div className="absolute right-0 top-full mt-1 w-48 bg-surface-container border-2 border-outline-variant z-20 shadow-[4px_4px_0_#4f378a] flex flex-col font-mono text-sm">
                      <button onClick={handleStop} className="px-4 py-3 text-left hover:bg-surface-container transition-colors font-bold text-on-surface-variant border-b border-outline-variant/20">Stop Conversation</button>
                      <button onClick={handleBlock} className="px-4 py-3 text-left hover:bg-error hover:text-on-error transition-colors text-error font-bold border-b border-outline-variant/20">Block User</button>
                      <button onClick={() => { setShowMenu(false); setShowReportModal(true); }} className="px-4 py-3 text-left hover:bg-surface-container transition-colors text-error font-bold">Report User</button>
                    </div>
                  </>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2 flex-1">
              <div className="w-9 h-9 bg-surface-container border-2 border-outline-variant rounded-full animate-pulse" />
              <div className="space-y-1">
                <div className="h-3 w-28 bg-surface-container animate-pulse rounded" />
                <div className="h-2 w-20 bg-surface-container animate-pulse rounded" />
              </div>
            </div>
          )}
        </header>

        {/* ── Messages area ── */}
        <div
          ref={messagesAreaRef}
          className="flex-1 overflow-y-auto px-3 sm:px-5 py-4 space-y-1"
          style={{ scrollbarWidth: "thin" }}
        >
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <span className="material-symbols-outlined animate-spin text-3xl text-on-surface-variant">progress_activity</span>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center px-4">
              {otherUser?.avatar_url ? (
                <img src={otherUser.avatar_url} alt="" className="w-16 h-16 rounded-full border-2 border-outline-variant object-cover mb-3" />
              ) : (
                <div className="w-16 h-16 bg-primary-container border-2 border-outline-variant rounded-full flex items-center justify-center mb-3">
                  <span className="font-mono font-bold text-2xl">{otherUser?.name?.[0]?.toUpperCase()}</span>
                </div>
              )}
              <p className="font-bold text-base">{otherUser?.name}</p>
              <p className="font-mono text-xs text-on-surface-variant mt-1">{otherUser?.college}</p>
              <p className="font-mono text-xs text-on-surface-variant mt-4 bg-surface-container px-4 py-2 border border-outline-variant">
                You're now connected 🎉 Say hi!
              </p>
            </div>
          ) : (
            <>
              {messages.map((msg, idx) => {
                const own = isOwn(msg);
                const prevMsg = messages[idx - 1] || null;
                const nextMsg = messages[idx + 1] || null;
                const showDivider = shouldShowDateDivider(msg, prevMsg);
                const isLastOwn = idx === lastOwnMsgIdx;
                // Group consecutive messages from same sender
                const isFirstInGroup = !prevMsg || prevMsg.sender_id !== msg.sender_id;
                const isLastInGroup = !nextMsg || nextMsg.sender_id !== msg.sender_id;

                return (
                  <div key={msg.id}>
                    {showDivider && <DateDivider isoStr={msg.created_at} />}

                    <div
                      className={`flex flex-col ${own ? "items-end" : "items-start"} ${isLastInGroup ? "mb-3" : "mb-0.5"}`}
                      onMouseEnter={() => setHoveredMsgId(msg.id)}
                      onMouseLeave={() => setHoveredMsgId(null)}
                      onContextMenu={(e) => {
                        e.preventDefault();
                        setShowMsgMenu(msg.id);
                      }}
                    >
                      <div className={`relative flex items-end gap-1.5 max-w-[80%] sm:max-w-[68%] ${own ? "flex-row-reverse" : "flex-row"}`}>
                        {/* Avatar — show only for first in group for other user */}
                        {!own && isLastInGroup ? (
                          otherUser?.avatar_url ? (
                            <img src={otherUser.avatar_url} alt="" className="w-6 h-6 rounded-full border border-outline-variant object-cover flex-shrink-0 mb-0.5" />
                          ) : (
                            <div className="w-6 h-6 bg-primary-container border border-outline-variant rounded-full flex items-center justify-center flex-shrink-0 mb-0.5">
                              <span className="font-mono font-bold text-[9px]">{otherUser?.name?.[0]?.toUpperCase()}</span>
                            </div>
                          )
                        ) : !own ? (
                          <div className="w-6 flex-shrink-0" />
                        ) : null}

                        {/* Bubble */}
                        <div
                          className={`px-3 py-2 text-sm leading-relaxed break-words
                            ${own
                              ? `bg-primary text-on-primary ${isFirstInGroup ? "rounded-tl-2xl rounded-tr-md" : "rounded-tl-2xl rounded-tr-2xl"} rounded-bl-2xl rounded-br-sm`
                              : `bg-surface-container border border-outline-variant text-on-surface ${isFirstInGroup ? "rounded-tl-md rounded-tr-2xl" : "rounded-tl-2xl rounded-tr-2xl"} rounded-bl-sm rounded-br-2xl`
                            }`}
                        >
                          {msg.is_deleted ? (
                            <p className="italic opacity-70 flex items-center gap-1">
                              <span className="material-symbols-outlined text-[14px]">block</span>
                              {own ? "You deleted this message" : "This message was deleted"}
                            </p>
                          ) : msg.message_type === "voice" ? (
                            <div className="flex items-center gap-2 py-0.5">
                              <span className="material-symbols-outlined text-base">mic</span>
                              <audio
                                src={msg.voice_url}
                                controls
                                className="h-7"
                                style={{ minWidth: "160px", maxWidth: "220px", colorScheme: own ? "dark" : "light" }}
                              />
                            </div>
                          ) : (
                            <p className="whitespace-pre-wrap">{msg.content}</p>
                          )}
                        </div>

                        {/* Message Context Menu */}
                        {showMsgMenu === msg.id && own && !msg.is_deleted && (
                          <div className={`absolute bottom-full mb-1 z-10 bg-surface-container border-2 border-outline-variant shadow-[4px_4px_0_#4f378a] flex flex-col font-mono text-sm ${own ? "right-0" : "left-0"}`}>
                            {msg.message_type === 'text' && (
                              <button
                                onClick={() => {
                                  setEditingMessage(msg);
                                  setText(msg.content);
                                  setShowMsgMenu(null);
                                  inputRef.current?.focus();
                                }}
                                className="px-4 py-2 text-left hover:bg-surface-container transition-colors font-bold text-on-surface border-b border-outline-variant/20 whitespace-nowrap"
                              >
                                Edit
                              </button>
                            )}
                            <button
                              onClick={() => handleDeleteMessage(msg.id)}
                              className="px-4 py-2 text-left hover:bg-error hover:text-on-error transition-colors text-error font-bold whitespace-nowrap"
                            >
                              Delete
                            </button>
                            <button
                              onClick={() => setShowMsgMenu(null)}
                              className="px-4 py-2 text-left hover:bg-surface-container transition-colors font-bold text-on-surface-variant border-t border-outline-variant/20 whitespace-nowrap"
                            >
                              Cancel
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Timestamp + seen status — show on hover or for last message */}
                      {(hoveredMsgId === msg.id || isLastOwn || showMsgMenu === msg.id) && (
                        <div className={`flex items-center gap-1 mt-0.5 px-2 ${own ? "flex-row-reverse" : "flex-row"}`}>
                          <span className="text-[10px] font-mono text-on-surface-variant">
                            {formatMessageTime(msg.created_at)}
                            {msg.is_edited && !msg.is_deleted && " (edited)"}
                          </span>
                          {/* Seen / Delivered indicators — only for own messages */}
                          {own && (
                            <span
                              className={`material-symbols-outlined text-[12px] ${msg.is_read ? "text-primary" : "text-on-surface-variant"}`}
                              title={msg.is_read ? "Seen" : "Delivered"}
                            >
                              {msg.is_read ? "done_all" : "done"}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </>
          )}
          <div ref={bottomRef} />
        </div>

        {/* ── Input area ── */}
        <div className="flex-shrink-0 border-t-2 border-outline-variant bg-surface-container">
          {(uploading || recording) && (
            <div className="px-4 pt-2 pb-1">
              {uploading && (
                <div className="flex items-center gap-2 text-xs font-mono text-on-surface-variant">
                  <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span>
                  Uploading voice note...
                </div>
              )}
              {recording && (
                <div className="flex items-center gap-2 animate-pulse">
                  <div className="w-2 h-2 bg-error rounded-full animate-ping" />
                  <span className="text-xs font-mono text-error font-bold">
                    Recording {Math.floor(recordingDuration / 60).toString().padStart(2, "0")}:{(recordingDuration % 60).toString().padStart(2, "0")} — Release to send
                  </span>
                </div>
              )}
            </div>
          )}

          {editingMessage && (
            <div className="px-4 py-2 bg-primary-container border-b-2 border-outline-variant flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-sm">edit</span>
                <span className="text-xs font-mono text-on-surface">Editing message</span>
              </div>
              <button
                onClick={() => {
                  setEditingMessage(null);
                  setText("");
                }}
                className="p-1 hover:bg-surface-container rounded"
              >
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            </div>
          )}

          {isBlockedByMe ? (
            <div className="p-4 text-center">
              <p className="text-on-surface-variant font-mono text-sm mb-3">You have blocked this user.</p>
              <button
                onClick={handleUnblock}
                className="btn-primary py-2 px-6"
              >
                Unblock to send messages
              </button>
            </div>
          ) : isBlockedByThem ? (
            <div className="p-4 text-center">
              <p className="text-on-surface-variant font-mono text-sm">You can no longer send messages to this user.</p>
            </div>
          ) : (
            <form onSubmit={handleSendText} className="flex items-center gap-2 p-2 sm:p-3">
              <input
              ref={inputRef}
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) handleSendText(e); }}
              placeholder="Message..."
              disabled={recording || uploading}
              className="flex-1 min-w-0 border-2 border-outline-variant px-3 py-2 text-sm bg-surface-container focus:outline-none focus:ring-2 focus:ring-primary placeholder:text-on-surface-variant"
            />

            {/* Mic button — hold to record */}
            {!editingMessage && (
              <button
                type="button"
                onMouseDown={startRecording}
                onMouseUp={stopRecording}
                onTouchStart={(e) => { e.preventDefault(); startRecording(); }}
                onTouchEnd={(e) => { e.preventDefault(); stopRecording(); }}
                disabled={uploading || sending}
                className={`flex-shrink-0 w-10 h-10 border-2 border-outline-variant flex items-center justify-center transition-all select-none
                  ${recording ? "bg-error text-on-error scale-110" : "hover:bg-surface-container active:scale-95"}`}
                title="Hold to record"
              >
                <span className="material-symbols-outlined text-xl">{recording ? "mic" : "mic_none"}</span>
              </button>
            )}

            {/* Send button */}
            <button
              type="submit"
              disabled={!text.trim() || sending || recording}
              className="flex-shrink-0 w-10 h-10 bg-primary text-on-primary border-2 border-outline-variant flex items-center justify-center disabled:opacity-40 hover:opacity-90 active:scale-95 transition-all"
            >
              {sending ? (
                <span className="material-symbols-outlined animate-spin text-xl">progress_activity</span>
              ) : (
                <span className="material-symbols-outlined text-xl">send</span>
              )}
            </button>
            </form>
          )}
        </div>
      </main>

      {/* Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
          <div className="bg-surface-container border-2 border-outline-variant w-full max-w-md" style={{ boxShadow: "6px 6px 0 #ba1a1a" }}>
            <div className="border-b-2 border-outline-variant px-5 py-4 flex items-center justify-between">
              <h3 className="font-grotesk font-bold text-base uppercase text-error">Report {otherUser?.name}</h3>
              <button onClick={() => setShowReportModal(false)} className="p-1 hover:bg-surface-container">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="p-5">
              <p className="text-sm font-mono text-on-surface-variant mb-4">
                Please let us know why you are reporting this user.
              </p>
              <textarea
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
                placeholder="Reason for report..."
                maxLength={500}
                rows={4}
                className="input-brutal w-full resize-none text-sm border-error focus:ring-error focus:border-error"
              />
              <p className="text-[10px] font-mono text-on-surface-variant mt-1 text-right">{reportReason.length}/500</p>
            </div>
            <div className="border-t-2 border-outline-variant px-5 py-4 flex gap-3">
              <button
                onClick={handleReport}
                disabled={reportLoading}
                className="btn-primary flex-1 justify-center bg-error hover:bg-[#93000a] text-on-error"
              >
                {reportLoading ? (
                  <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span>
                ) : (
                  <span className="material-symbols-outlined text-sm">flag</span>
                )}
                Submit Report
              </button>
              <button
                onClick={() => setShowReportModal(false)}
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
