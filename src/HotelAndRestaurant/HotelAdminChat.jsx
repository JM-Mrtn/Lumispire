import React, { useEffect, useMemo, useRef, useState } from "react";
import { io } from "socket.io-client";
import { useNavigate } from "react-router-dom";
import HotelAdminShell from "./HotelAdminShell";

function getHotelApiBase() {
  const raw =
    import.meta.env.VITE_HOTEL_API_BASE ||
    import.meta.env.VITE_API_BASE ||
    import.meta.env.VITE_API_URL ||
    "http://localhost:5000";

  const cleaned = String(raw).replace(/\/+$/, "");
  if (cleaned.endsWith("/api/hotel")) return cleaned;
  if (cleaned.endsWith("/api")) return `${cleaned}/hotel`;
  return `${cleaned}/api/hotel`;
}

const API_BASE = getHotelApiBase();
const SOCKET_BASE = API_BASE.replace(/\/api\/hotel$/i, "").replace(/\/api$/i, "");

const CONCERN_FILTERS = [
  { id: "all", label: "All" },
  { id: "reschedule", label: "Reschedule" },
  { id: "cancel", label: "Cancel" },
  { id: "others", label: "Others" },
];

function getAdminToken() {
  return localStorage.getItem("hotelAdminToken") || localStorage.getItem("adminToken") || "";
}

function getUserName(user) {
  return (
    user?.fullName ||
    user?.name ||
    `${user?.firstName || ""} ${user?.lastName || ""}`.trim() ||
    user?.email ||
    "Hotel User"
  );
}

function formatTime(value) {
  if (!value) return "";
  try {
    return new Date(value).toLocaleString("en-PH", {
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}

function getConcernLabel(type) {
  if (type === "reschedule") return "Reschedule";
  if (type === "cancel") return "Cancel";
  if (type === "others") return "Others";
  return "No Concern";
}

function getConversationUserId(conversation = {}) {
  return String(
    conversation?.user?._id ||
      conversation?.conversationUser ||
      conversation?._id ||
      ""
  );
}

function getIncomingUserId(payload = {}, incoming = {}) {
  return String(
    payload?.conversationUser ||
      incoming?.conversationUser?._id ||
      incoming?.conversationUser ||
      incoming?.user?._id ||
      incoming?.user ||
      ""
  );
}

function addMessageWithoutDuplicate(prevMessages, newMessage) {
  if (!newMessage) return prevMessages;

  const id = String(newMessage._id || "");
  if (id && prevMessages.some((item) => String(item._id || "") === id)) {
    return prevMessages;
  }

  return [...prevMessages, newMessage];
}

function upsertConversation(prevConversations, incomingMessage) {
  if (!incomingMessage) return prevConversations;

  const incomingUserId = getIncomingUserId({}, incomingMessage);
  if (!incomingUserId) return prevConversations;

  const userObject =
    typeof incomingMessage.conversationUser === "object"
      ? incomingMessage.conversationUser
      : null;

  const incomingConcern = ["reschedule", "cancel", "others"].includes(
    String(incomingMessage.concernType || "")
  )
    ? incomingMessage.concernType
    : "";

  const existingIndex = prevConversations.findIndex(
    (item) => getConversationUserId(item) === incomingUserId
  );

  const unreadIncrement = incomingMessage.senderRole === "user" ? 1 : 0;

  if (existingIndex === -1) {
    return [
      {
        conversationUser: incomingUserId,
        user: userObject || {
          _id: incomingUserId,
          fullName: "Hotel User",
          name: "Hotel User",
          email: "",
        },
        lastMessage: incomingMessage.message || "",
        lastMessageAt: incomingMessage.createdAt || new Date().toISOString(),
        lastSenderRole: incomingMessage.senderRole || "user",
        latestConcernType: incomingConcern,
        latestConcernDetails: incomingMessage.concernDetails || {},
        unreadCount: unreadIncrement,
      },
      ...prevConversations,
    ];
  }

  const next = [...prevConversations];
  const oldItem = next[existingIndex];

  next[existingIndex] = {
    ...oldItem,
    user: oldItem.user || userObject,
    lastMessage: incomingMessage.message || oldItem.lastMessage || "",
    lastMessageAt:
      incomingMessage.createdAt || oldItem.lastMessageAt || new Date().toISOString(),
    lastSenderRole: incomingMessage.senderRole || oldItem.lastSenderRole,
    latestConcernType: incomingConcern || oldItem.latestConcernType || "",
    latestConcernDetails:
      incomingConcern && incomingMessage.concernDetails
        ? incomingMessage.concernDetails
        : oldItem.latestConcernDetails || {},
    unreadCount: Number(oldItem.unreadCount || 0) + unreadIncrement,
  };

  return next;
}

function getConversationPrefix(role) {
  if (role === "admin") return "Admin: ";
  if (role === "bot") return "Bot: ";
  return "Guest: ";
}

function getMessageOwnerLabel(message, selectedUser) {
  if (message?.senderRole === "bot") return "Hotel Support Bot";
  if (message?.senderRole === "admin") return "Hotel Admin";
  return getUserName(selectedUser);
}

export default function HotelAdminChat() {
  const navigate = useNavigate();
  const socketRef = useRef(null);
  const bottomRef = useRef(null);
  const selectedUserIdRef = useRef("");

  const token = useMemo(() => getAdminToken(), []);

  const [conversations, setConversations] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState("");
  const [concernFilter, setConcernFilter] = useState("all");
  const [bookingIdSearch, setBookingIdSearch] = useState("");

  const [loadingConversations, setLoadingConversations] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState({ type: "", message: "" });

  const selectedUserId = selectedUser?._id || "";

  useEffect(() => {
    selectedUserIdRef.current = selectedUserId;
  }, [selectedUserId]);

  const counts = useMemo(() => {
    const next = { all: conversations.length, reschedule: 0, cancel: 0, others: 0 };

    conversations.forEach((conversation) => {
      const type = String(conversation.latestConcernType || "");
      if (next[type] !== undefined) next[type] += 1;
    });

    return next;
  }, [conversations]);

  const sortedConversations = useMemo(() => {
    const search = bookingIdSearch.trim().toLowerCase();

    return [...conversations]
      .filter((conversation) => {
        if (concernFilter !== "all") {
          if (String(conversation.latestConcernType || "") !== concernFilter) return false;
        }

        if (!search) return true;

        const bookingId = String(conversation.latestConcernDetails?.bookingId || "").toLowerCase();
        const userName = getUserName(conversation.user).toLowerCase();
        const email = String(conversation.user?.email || "").toLowerCase();

        return bookingId.includes(search) || userName.includes(search) || email.includes(search);
      })
      .sort((a, b) => {
        return new Date(b.lastMessageAt || 0).getTime() - new Date(a.lastMessageAt || 0).getTime();
      });
  }, [conversations, concernFilter, bookingIdSearch]);

  const selectedConversation = useMemo(() => {
    return conversations.find((item) => getConversationUserId(item) === String(selectedUserId));
  }, [conversations, selectedUserId]);

  const adminHeaders = () => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  });

  const scrollToBottom = () => {
    window.setTimeout(() => {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 80);
  };

  const goLogin = () => {
    localStorage.removeItem("hotelAdminToken");
    localStorage.removeItem("adminToken");
    navigate("/hotel-admin-login", { replace: true });
  };

  const markConversationRead = (userId) => {
    setConversations((prev) =>
      prev.map((item) => {
        if (getConversationUserId(item) !== String(userId)) return item;
        return { ...item, unreadCount: 0 };
      })
    );
  };

  const fetchConversations = async ({ silent = false } = {}) => {
    if (!token) {
      goLogin();
      return;
    }

    if (!silent) setLoadingConversations(true);

    try {
      const res = await fetch(`${API_BASE}/chat/admin/conversations`, {
        headers: adminHeaders(),
      });

      const data = await res.json().catch(() => ({}));

      if (res.status === 401 || res.status === 403) {
        goLogin();
        return;
      }

      if (!res.ok) throw new Error(data.message || "Failed to load conversations.");

      const list = Array.isArray(data.conversations) ? data.conversations : [];
      setConversations(list);

      if (!selectedUserIdRef.current && list.length > 0) {
        setSelectedUser(list[0].user);
      }
    } catch (error) {
      console.error("fetchConversations error:", error);
      setStatus({
        type: "error",
        message: error.message || "Failed to load conversations.",
      });
    } finally {
      if (!silent) setLoadingConversations(false);
    }
  };

  const fetchMessages = async (userId) => {
    if (!userId) return;

    setLoadingMessages(true);
    setStatus({ type: "", message: "" });

    try {
      const res = await fetch(`${API_BASE}/chat/admin/conversations/${userId}/messages`, {
        headers: adminHeaders(),
      });

      const data = await res.json().catch(() => ({}));

      if (res.status === 401 || res.status === 403) {
        goLogin();
        return;
      }

      if (!res.ok) throw new Error(data.message || "Failed to load messages.");

      setMessages(Array.isArray(data.messages) ? data.messages : []);
      if (data.user) setSelectedUser(data.user);
      markConversationRead(userId);
      scrollToBottom();
    } catch (error) {
      console.error("fetchMessages error:", error);
      setStatus({ type: "error", message: error.message || "Failed to load messages." });
    } finally {
      setLoadingMessages(false);
    }
  };

  const sendMessage = async (event) => {
    event?.preventDefault();

    const text = messageText.trim();
    if (!text || !selectedUserId || sending) return;

    setSending(true);
    setStatus({ type: "", message: "" });

    try {
      const res = await fetch(`${API_BASE}/chat/admin/conversations/${selectedUserId}/messages`, {
        method: "POST",
        headers: adminHeaders(),
        body: JSON.stringify({ message: text }),
      });

      const data = await res.json().catch(() => ({}));

      if (res.status === 401 || res.status === 403) {
        goLogin();
        return;
      }

      if (!res.ok) throw new Error(data.message || "Failed to send reply.");

      const savedMessage = data.message;
      setMessages((prev) => addMessageWithoutDuplicate(prev, savedMessage));
      setConversations((prev) => upsertConversation(prev, savedMessage));
      markConversationRead(selectedUserId);
      setMessageText("");
      scrollToBottom();
    } catch (error) {
      console.error("sendMessage error:", error);
      setStatus({ type: "error", message: error.message || "Failed to send reply." });
    } finally {
      setSending(false);
    }
  };

  useEffect(() => {
    if (!token) {
      goLogin();
      return undefined;
    }

    fetchConversations();

    const socket = io(SOCKET_BASE, {
      transports: ["websocket", "polling"],
      auth: { token, role: "admin" },
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      socket.emit("hotelChat:joinAdmin");
      if (selectedUserIdRef.current) {
        socket.emit("hotelChat:joinConversation", { userId: selectedUserIdRef.current });
      }
    });

    const handleIncoming = (payload) => {
      const incoming = payload?.message || payload;
      if (!incoming) return;

      const incomingUserId = getIncomingUserId(payload, incoming);
      const activeUserId = selectedUserIdRef.current;

      setConversations((prev) => upsertConversation(prev, incoming));

      if (activeUserId && incomingUserId === String(activeUserId)) {
        setMessages((prev) => addMessageWithoutDuplicate(prev, incoming));
        markConversationRead(activeUserId);
        scrollToBottom();
      }
    };

    socket.on("hotelChat:newConversationMessage", handleIncoming);
    socket.on("hotelChat:message", handleIncoming);

    socket.on("connect_error", (error) => {
      console.error("Socket connect error:", error.message);
    });

    return () => {
      socket.off("connect");
      socket.off("hotelChat:newConversationMessage", handleIncoming);
      socket.off("hotelChat:message", handleIncoming);
      socket.off("connect_error");
      socket.disconnect();
      socketRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!selectedUserId) return;

    fetchMessages(selectedUserId);
    socketRef.current?.emit("hotelChat:joinConversation", { userId: selectedUserId });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedUserId]);

  const isStaff = (msg) => msg.senderRole === "admin" || msg.senderRole === "bot";
  const isBot = (msg) => msg.senderRole === "bot" || msg.isAutoReply === true;

  return (
    <HotelAdminShell
      title="Guest Conversations"
      subtitle="Filter guest chats by concern type, search by Booking ID or guest, and reply in real time."
      activePage="chat"
      maxWidth="max-w-7xl"
      contentClassName="h-[calc(100vh-106px)] overflow-hidden"
    >
      {status.message ? (
        <div
          className={`mb-4 rounded-2xl border px-4 py-3 text-sm font-semibold ${
            status.type === "error"
              ? "border-rose-200 bg-rose-50 text-rose-700"
              : "border-emerald-200 bg-emerald-50 text-emerald-700"
          }`}
        >
          {status.message}
        </div>
      ) : null}

      <div
        className={`grid overflow-hidden rounded-3xl border border-black/10 bg-white shadow-sm lg:grid-cols-[390px_1fr] ${
          status.message ? "h-[calc(100%-76px)]" : "h-full"
        }`}
      >
        <aside className="flex min-h-0 flex-col border-b border-black/10 bg-[#f3f2ea] lg:border-b-0 lg:border-r">
          <div className="shrink-0 border-b border-black/10 p-5">
            <h2 className="text-lg font-extrabold text-[#355240]">Guests</h2>
            <p className="mt-1 text-xs font-semibold text-black/45">
              {loadingConversations
                ? "Loading..."
                : `${sortedConversations.length} shown / ${conversations.length} total`}
            </p>

            <div className="mt-4 grid grid-cols-2 gap-2">
              {CONCERN_FILTERS.map((item) => {
                const active = concernFilter === item.id;

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setConcernFilter(item.id)}
                    className={`rounded-2xl border px-3 py-2 text-xs font-extrabold transition ${
                      active
                        ? "border-[#355240] bg-[#355240] text-white"
                        : "border-black/10 bg-white text-[#355240] hover:bg-[#355240]/5"
                    }`}
                  >
                    {item.label} ({counts[item.id] || 0})
                  </button>
                );
              })}
            </div>

            <div className="mt-4">
              <label className="mb-2 block text-xs font-extrabold uppercase tracking-wide text-[#355240]/70">
                Search
              </label>
              <input
                value={bookingIdSearch}
                onChange={(e) => setBookingIdSearch(e.target.value)}
                placeholder="Booking ID, name, or email"
                className="h-11 w-full rounded-2xl border border-black/10 bg-white px-4 text-sm font-semibold text-[#2f4d36] outline-none focus:border-[#355240]"
              />
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto p-3">
            {loadingConversations ? (
              <div className="rounded-2xl bg-white p-4 text-sm font-semibold text-black/50">
                Loading conversations...
              </div>
            ) : sortedConversations.length === 0 ? (
              <div className="rounded-2xl bg-white p-4 text-sm font-semibold text-black/50">
                No conversations for this filter.
              </div>
            ) : (
              sortedConversations.map((conversation) => {
                const user = conversation.user;
                const conversationUserId = getConversationUserId(conversation);
                const active = conversationUserId === String(selectedUserId);
                const concernType = String(conversation.latestConcernType || "");
                const bookingId = conversation.latestConcernDetails?.bookingId || "";

                return (
                  <button
                    key={conversationUserId}
                    type="button"
                    onClick={() =>
                      setSelectedUser(
                        user || {
                          _id: conversationUserId,
                          fullName: "Hotel User",
                          name: "Hotel User",
                          email: "",
                        }
                      )
                    }
                    className={`mb-2 w-full rounded-2xl border p-4 text-left transition ${
                      active
                        ? "border-[#355240] bg-[#355240] text-white"
                        : "border-black/10 bg-white text-[#355240] hover:bg-[#355240]/5"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-extrabold">
                          {getUserName(user)}
                        </p>
                        <p
                          className={`mt-1 truncate text-xs font-semibold ${
                            active ? "text-white/75" : "text-black/45"
                          }`}
                        >
                          {user?.email || "No email"}
                        </p>
                      </div>

                      {conversation.unreadCount > 0 ? (
                        <span className="rounded-full bg-rose-500 px-2 py-1 text-[10px] font-extrabold text-white">
                          {conversation.unreadCount}
                        </span>
                      ) : null}
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-[10px] font-extrabold uppercase ${
                          active
                            ? "bg-white/15 text-white"
                            : concernType === "reschedule"
                            ? "bg-blue-50 text-blue-700"
                            : concernType === "cancel"
                            ? "bg-rose-50 text-rose-700"
                            : concernType === "others"
                            ? "bg-amber-50 text-amber-700"
                            : "bg-slate-50 text-slate-600"
                        }`}
                      >
                        {getConcernLabel(concernType)}
                      </span>
                    </div>

                    {bookingId ? (
                      <p
                        className={`mt-2 text-[11px] font-extrabold ${
                          active ? "text-white/75" : "text-[#355240]/70"
                        }`}
                      >
                        Booking ID: {bookingId}
                      </p>
                    ) : null}

                    <p
                      className={`mt-3 line-clamp-2 text-xs ${
                        active ? "text-white/75" : "text-black/50"
                      }`}
                    >
                      {getConversationPrefix(conversation.lastSenderRole)}
                      {conversation.lastMessage || "Open conversation"}
                    </p>

                    <p
                      className={`mt-2 text-[11px] font-bold ${
                        active ? "text-white/60" : "text-black/35"
                      }`}
                    >
                      {formatTime(conversation.lastMessageAt)}
                    </p>
                  </button>
                );
              })
            )}
          </div>
        </aside>

        <section className="flex min-h-0 flex-col bg-white">
          {selectedUser ? (
            <>
              <div className="shrink-0 border-b border-black/10 px-5 py-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-lg font-extrabold text-[#355240]">
                      {getUserName(selectedUser)}
                    </p>
                    <p className="text-xs font-semibold text-black/45">
                      {selectedUser.email || "No email"}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <span className="w-fit rounded-full bg-[#355240]/10 px-4 py-2 text-xs font-extrabold uppercase text-[#355240]">
                      Concern: {getConcernLabel(selectedConversation?.latestConcernType)}
                    </span>

                    {selectedConversation?.latestConcernDetails?.bookingId ? (
                      <span className="w-fit rounded-full bg-blue-50 px-4 py-2 text-xs font-extrabold uppercase text-blue-700">
                        Booking ID: {selectedConversation.latestConcernDetails.bookingId}
                      </span>
                    ) : null}
                  </div>
                </div>
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto bg-[#fafaf7] p-5">
                {loadingMessages ? (
                  <div className="rounded-2xl bg-white p-4 text-sm font-semibold text-black/50">
                    Loading messages...
                  </div>
                ) : messages.length === 0 ? (
                  <div className="rounded-2xl bg-white p-4 text-sm font-semibold text-black/50">
                    No messages yet.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {messages.map((msg, index) => {
                      const staff = isStaff(msg);
                      const bot = isBot(msg);

                      return (
                        <div
                          key={msg._id || index}
                          className={`flex ${staff ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`max-w-[78%] rounded-3xl px-4 py-3 shadow-sm ${
                              staff
                                ? bot
                                  ? "rounded-br-md border border-amber-200 bg-amber-50 text-[#2f4d36]"
                                  : "rounded-br-md bg-[#355240] text-white"
                                : "rounded-bl-md border border-black/10 bg-white text-[#2f4d36]"
                            }`}
                          >
                            <div className="mb-1 flex flex-wrap items-center gap-2">
                              <p
                                className={`text-[11px] font-extrabold uppercase tracking-wide ${
                                  staff
                                    ? bot
                                      ? "text-black/40"
                                      : "text-white/65"
                                    : "text-black/40"
                                }`}
                              >
                                {getMessageOwnerLabel(msg, selectedUser)}
                              </p>

                              {msg.concernType ? (
                                <span
                                  className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold uppercase ${
                                    staff
                                      ? bot
                                        ? "bg-white text-[#355240]"
                                        : "bg-white/15 text-white"
                                      : "bg-[#355240]/10 text-[#355240]"
                                  }`}
                                >
                                  {getConcernLabel(msg.concernType)}
                                </span>
                              ) : null}
                            </div>

                            <p className="whitespace-pre-wrap break-words text-sm leading-6">
                              {msg.message}
                            </p>

                            {msg.autoReplyKind === "after_hours" ? (
                              <p className="mt-2 text-xs font-extrabold text-amber-700">
                                FAQ suggested
                              </p>
                            ) : null}

                            <p
                              className={`mt-2 text-[10px] font-semibold ${
                                staff ? (bot ? "text-black/35" : "text-white/55") : "text-black/35"
                              }`}
                            >
                              {formatTime(msg.createdAt)}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={bottomRef} />
                  </div>
                )}
              </div>

              <form onSubmit={sendMessage} className="shrink-0 border-t border-black/10 bg-white p-4">
                <div className="flex flex-col gap-3 sm:flex-row">
                  <textarea
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        sendMessage(e);
                      }
                    }}
                    placeholder="Type your reply..."
                    rows={2}
                    className="min-h-[52px] flex-1 resize-none rounded-2xl border border-black/10 bg-[#f8f8f5] px-4 py-3 text-sm font-semibold text-[#2f4d36] outline-none focus:border-[#355240]"
                  />

                  <button
                    type="submit"
                    disabled={sending || !messageText.trim()}
                    className="rounded-2xl bg-[#355240] px-7 py-3 text-sm font-extrabold text-white shadow-sm hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {sending ? "SENDING..." : "SEND"}
                  </button>
                </div>
                <p className="mt-2 text-xs font-semibold text-black/40">
                  Press Enter to send. Shift + Enter for a new line.
                </p>
              </form>
            </>
          ) : (
            <div className="flex h-full items-center justify-center bg-[#fafaf7] p-8 text-center">
              <div>
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#355240]/10 text-3xl">
                  💬
                </div>
                <h3 className="mt-4 text-lg font-extrabold text-[#355240]">
                  Select a conversation
                </h3>
                <p className="mt-1 text-sm font-semibold text-black/45">
                  Guest conversations will appear here after they send a concern.
                </p>
              </div>
            </div>
          )}
        </section>
      </div>
    </HotelAdminShell>
  );
}
