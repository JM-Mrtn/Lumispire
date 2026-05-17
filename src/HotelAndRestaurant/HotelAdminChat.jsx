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
      maxWidth="max-w-[1500px]"
      contentClassName="min-h-[calc(100vh-120px)]"
    >
      <div className="ltc-admin-chat">
        <style>{`
          @import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap");

          .ltc-admin-chat {
            --green-950: #071f14;
            --green-900: #0e3321;
            --green-800: #174a30;
            --green-700: #235f3e;
            --green-600: #2f754c;
            --footer-green: #082719;
            --gold: #d7a84d;
            --gold-soft: #f4d484;
            --dark: #101828;
            --muted: #667085;
            --glass: rgba(255,255,255,.78);
            --shadow-md: 0 18px 45px rgba(8,39,25,.12);
            --shadow-lg: 0 32px 80px rgba(8,39,25,.18);
            --radius: 24px;
            --ease: cubic-bezier(.22,1,.36,1);

            min-height: calc(100vh - 150px);
            margin: -8px;
            padding: clamp(16px, 2vw, 24px);
            border-radius: 30px;
            background:
              radial-gradient(circle at 12% 0%, rgba(215,168,77,.12), transparent 28%),
              radial-gradient(circle at 92% 12%, rgba(35,95,62,.12), transparent 30%),
              linear-gradient(180deg,#f8fbf9 0%,#fff 42%,#f5faf7 100%);
            color: var(--dark);
            font-family: "Inter", Arial, sans-serif;
          }

          .ltc-admin-chat * { box-sizing: border-box; }

          .ltc-chat-notice {
            margin-bottom: 16px;
            border-radius: 20px;
            padding: 14px 18px;
            font-size: 13px;
            font-weight: 800;
            box-shadow: var(--shadow-md);
          }

          .ltc-chat-notice.error {
            border: 1px solid rgba(244,63,94,.24);
            background: rgba(255,241,242,.92);
            color: #be123c;
          }

          .ltc-chat-notice.success {
            border: 1px solid rgba(35,95,62,.20);
            background: rgba(236,253,245,.92);
            color: var(--green-800);
          }

          .ltc-chat-panel {
            position: relative;
            overflow: hidden;
            display: grid;
            grid-template-columns: minmax(300px, 390px) minmax(0, 1fr);
            height: calc(100vh - 190px);
            min-height: 620px;
            border-radius: var(--radius);
            background: var(--glass);
            border: 1px solid rgba(255,255,255,.76);
            box-shadow: var(--shadow-lg);
            backdrop-filter: blur(18px);
            animation: ltcChatReveal .7s var(--ease) both;
          }

          .ltc-chat-panel.with-notice {
            height: calc(100vh - 250px);
          }

          .ltc-chat-panel::before {
            content: "";
            position: absolute;
            inset: 0 0 auto;
            height: 6px;
            background: linear-gradient(90deg,var(--green-700),var(--gold));
            z-index: 5;
          }

          .ltc-chat-sidebar {
            min-height: 0;
            display: flex;
            flex-direction: column;
            border-right: 1px solid rgba(35,95,62,.10);
            background:
              radial-gradient(circle at 100% 0%, rgba(215,168,77,.16), transparent 26%),
              rgba(246,250,247,.88);
          }

          .ltc-chat-sidebar-head {
            flex-shrink: 0;
            border-bottom: 1px solid rgba(35,95,62,.10);
            padding: 24px 20px 18px;
          }

          .ltc-chat-kicker {
            margin: 0;
            color: rgba(16,24,40,.46);
            font-size: 11px;
            font-weight: 900;
            letter-spacing: .18em;
            text-transform: uppercase;
          }

          .ltc-chat-title {
            margin: 8px 0 0;
            color: var(--green-950);
            font-size: 27px;
            line-height: 1.06;
            font-weight: 900;
            letter-spacing: -.05em;
          }

          .ltc-chat-count {
            margin: 8px 0 0;
            color: var(--muted);
            font-size: 12px;
            font-weight: 800;
          }

          .ltc-chat-filter-grid {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 9px;
            margin-top: 16px;
          }

          .ltc-chat-filter-btn,
          .ltc-chat-send-btn {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            min-height: 40px;
            border-radius: 999px;
            border: 1px solid rgba(35,95,62,.14);
            background: rgba(255,255,255,.82);
            color: rgba(16,24,40,.64);
            padding: 0 14px;
            font-size: 12px;
            font-weight: 900;
            cursor: pointer;
            transition: .25s var(--ease);
          }

          .ltc-chat-filter-btn:hover,
          .ltc-chat-filter-btn.active {
            color: #102418;
            border-color: rgba(215,168,77,.54);
            background: linear-gradient(135deg,#f4d484,#d7a84d);
            transform: translateY(-2px);
          }

          .ltc-chat-field-label {
            display: block;
            margin: 16px 0 8px;
            color: rgba(16,24,40,.46);
            font-size: 11px;
            font-weight: 900;
            letter-spacing: .16em;
            text-transform: uppercase;
          }

          .ltc-chat-search,
          .ltc-chat-textarea {
            width: 100%;
            border-radius: 18px;
            border: 1px solid rgba(35,95,62,.12);
            background: rgba(255,255,255,.86);
            color: var(--green-950);
            outline: none;
            font-size: 13px;
            font-weight: 700;
            transition: .25s var(--ease);
          }

          .ltc-chat-search {
            min-height: 46px;
            padding: 0 15px;
          }

          .ltc-chat-textarea {
            min-height: 58px;
            resize: none;
            padding: 14px 16px;
            line-height: 1.45;
          }

          .ltc-chat-search:focus,
          .ltc-chat-textarea:focus {
            border-color: var(--green-700);
            background: white;
            box-shadow: 0 0 0 4px rgba(35,95,62,.08);
          }

          .ltc-chat-conversation-list {
            min-height: 0;
            flex: 1;
            overflow-y: auto;
            padding: 14px;
          }

          .ltc-chat-conversation-list::-webkit-scrollbar,
          .ltc-chat-messages::-webkit-scrollbar {
            width: 8px;
          }

          .ltc-chat-conversation-list::-webkit-scrollbar-track,
          .ltc-chat-messages::-webkit-scrollbar-track {
            background: rgba(7,31,20,.05);
            border-radius: 999px;
          }

          .ltc-chat-conversation-list::-webkit-scrollbar-thumb,
          .ltc-chat-messages::-webkit-scrollbar-thumb {
            background: rgba(35,95,62,.34);
            border-radius: 999px;
          }

          .ltc-chat-empty-card,
          .ltc-chat-user-card {
            position: relative;
            overflow: hidden;
            width: 100%;
            border-radius: 22px;
            border: 1px solid rgba(35,95,62,.10);
            background: rgba(255,255,255,.86);
            box-shadow: 0 12px 28px rgba(8,39,25,.06);
          }

          .ltc-chat-empty-card {
            padding: 18px;
            color: rgba(16,24,40,.52);
            font-size: 13px;
            font-weight: 800;
          }

          .ltc-chat-user-card {
            margin-bottom: 10px;
            padding: 16px;
            text-align: left;
            cursor: pointer;
            transition: .28s var(--ease);
          }

          .ltc-chat-user-card:hover,
          .ltc-chat-user-card.active {
            transform: translateY(-3px);
            border-color: rgba(215,168,77,.54);
            background: rgba(255,255,255,.96);
            box-shadow: 0 18px 45px rgba(8,39,25,.12);
          }

          .ltc-chat-user-card.active {
            color: white;
            border-color: rgba(255,255,255,.16);
            background: linear-gradient(135deg,var(--green-900),var(--green-700));
          }

          .ltc-chat-user-top {
            display: flex;
            align-items: flex-start;
            justify-content: space-between;
            gap: 12px;
          }

          .ltc-chat-user-main { min-width: 0; }

          .ltc-chat-user-name {
            margin: 0;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            color: var(--green-950);
            font-size: 14px;
            font-weight: 900;
          }

          .ltc-chat-user-card.active .ltc-chat-user-name { color: white; }

          .ltc-chat-user-email,
          .ltc-chat-preview,
          .ltc-chat-time {
            margin: 0;
            color: rgba(16,24,40,.48);
            font-size: 11px;
            font-weight: 700;
          }

          .ltc-chat-user-email { margin-top: 3px; }
          .ltc-chat-preview { margin-top: 10px; line-height: 1.5; }
          .ltc-chat-time { margin-top: 8px; color: rgba(16,24,40,.34); }

          .ltc-chat-user-card.active .ltc-chat-user-email,
          .ltc-chat-user-card.active .ltc-chat-preview,
          .ltc-chat-user-card.active .ltc-chat-time { color: rgba(255,255,255,.68); }

          .ltc-chat-unread {
            display: inline-flex;
            min-width: 24px;
            height: 24px;
            align-items: center;
            justify-content: center;
            border-radius: 999px;
            background: #e11d48;
            color: white;
            padding: 0 7px;
            font-size: 10px;
            font-weight: 900;
          }

          .ltc-chat-pills {
            display: flex;
            flex-wrap: wrap;
            gap: 7px;
            margin-top: 12px;
          }

          .ltc-chat-pill {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            border-radius: 999px;
            padding: 6px 10px;
            background: rgba(244,212,132,.42);
            color: var(--green-800);
            font-size: 10px;
            font-weight: 900;
            letter-spacing: .04em;
            text-transform: uppercase;
          }

          .ltc-chat-user-card.active .ltc-chat-pill {
            background: rgba(255,255,255,.14);
            color: white;
          }

          .ltc-chat-main {
            min-height: 0;
            display: flex;
            flex-direction: column;
            background: rgba(255,255,255,.74);
          }

          .ltc-chat-main-head {
            flex-shrink: 0;
            border-bottom: 1px solid rgba(35,95,62,.10);
            background: rgba(255,255,255,.80);
            padding: 20px 24px;
          }

          .ltc-chat-main-head-row {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 16px;
          }

          .ltc-chat-main-name {
            margin: 0;
            color: var(--green-950);
            font-size: 24px;
            line-height: 1.1;
            font-weight: 900;
            letter-spacing: -.04em;
          }

          .ltc-chat-main-email {
            margin: 5px 0 0;
            color: rgba(16,24,40,.45);
            font-size: 12px;
            font-weight: 800;
          }

          .ltc-chat-main-tags {
            display: flex;
            flex-wrap: wrap;
            justify-content: flex-end;
            gap: 8px;
          }

          .ltc-chat-main-tag {
            display: inline-flex;
            align-items: center;
            min-height: 34px;
            border-radius: 999px;
            background: rgba(35,95,62,.10);
            color: var(--green-800);
            padding: 0 14px;
            font-size: 11px;
            font-weight: 900;
            letter-spacing: .04em;
            text-transform: uppercase;
          }

          .ltc-chat-main-tag.gold {
            background: rgba(244,212,132,.42);
            color: #8a5a00;
          }

          .ltc-chat-messages {
            min-height: 0;
            flex: 1;
            overflow-y: auto;
            padding: 22px 24px;
            background:
              radial-gradient(circle at 100% 100%, rgba(215,168,77,.10), transparent 28%),
              #fafaf7;
          }

          .ltc-chat-loading {
            border-radius: 18px;
            background: white;
            border: 1px solid rgba(35,95,62,.10);
            padding: 16px;
            color: rgba(16,24,40,.50);
            font-size: 13px;
            font-weight: 800;
          }

          .ltc-chat-message-stack {
            display: grid;
            gap: 12px;
          }

          .ltc-chat-row {
            display: flex;
          }

          .ltc-chat-row.staff { justify-content: flex-end; }
          .ltc-chat-row.guest { justify-content: flex-start; }

          .ltc-chat-bubble {
            max-width: min(76%, 680px);
            border-radius: 24px;
            padding: 13px 16px;
            box-shadow: 0 12px 30px rgba(8,39,25,.08);
          }

          .ltc-chat-bubble.staff {
            border-bottom-right-radius: 8px;
            background: linear-gradient(135deg,var(--green-900),var(--green-700));
            color: white;
          }

          .ltc-chat-bubble.bot {
            border: 1px solid rgba(215,168,77,.32);
            border-bottom-right-radius: 8px;
            background: rgba(255,248,231,.92);
            color: var(--green-950);
          }

          .ltc-chat-bubble.guest {
            border: 1px solid rgba(35,95,62,.10);
            border-bottom-left-radius: 8px;
            background: rgba(255,255,255,.94);
            color: var(--green-950);
          }

          .ltc-chat-bubble-meta {
            display: flex;
            flex-wrap: wrap;
            gap: 7px;
            align-items: center;
            margin-bottom: 5px;
          }

          .ltc-chat-owner {
            margin: 0;
            color: rgba(16,24,40,.45);
            font-size: 10px;
            font-weight: 900;
            letter-spacing: .08em;
            text-transform: uppercase;
          }

          .ltc-chat-bubble.staff .ltc-chat-owner { color: rgba(255,255,255,.64); }
          .ltc-chat-bubble.bot .ltc-chat-owner { color: rgba(16,24,40,.45); }

          .ltc-chat-message-text {
            margin: 0;
            white-space: pre-wrap;
            overflow-wrap: break-word;
            font-size: 14px;
            line-height: 1.65;
            font-weight: 600;
          }

          .ltc-chat-faq-note {
            margin: 8px 0 0;
            color: #a16207;
            font-size: 11px;
            font-weight: 900;
          }

          .ltc-chat-message-time {
            margin: 8px 0 0;
            color: rgba(16,24,40,.36);
            font-size: 10px;
            font-weight: 700;
          }

          .ltc-chat-bubble.staff .ltc-chat-message-time { color: rgba(255,255,255,.55); }
          .ltc-chat-bubble.bot .ltc-chat-message-time { color: rgba(16,24,40,.36); }

          .ltc-chat-compose {
            flex-shrink: 0;
            border-top: 1px solid rgba(35,95,62,.10);
            background: rgba(255,255,255,.88);
            padding: 16px 18px;
          }

          .ltc-chat-compose-row {
            display: flex;
            gap: 12px;
            align-items: stretch;
          }

          .ltc-chat-send-btn {
            min-width: 118px;
            min-height: 54px;
            border: 0;
            color: #102418;
            background: linear-gradient(135deg,#f4d484,#d7a84d);
            box-shadow: 0 16px 35px rgba(215,168,77,.22);
          }

          .ltc-chat-send-btn:hover { transform: translateY(-2px); }
          .ltc-chat-send-btn:disabled { opacity: .55; cursor: not-allowed; transform: none; }

          .ltc-chat-help {
            margin: 8px 0 0;
            color: rgba(16,24,40,.42);
            font-size: 11px;
            font-weight: 700;
          }

          .ltc-chat-empty-state {
            height: 100%;
            display: grid;
            place-items: center;
            padding: 36px;
            text-align: center;
            background:
              radial-gradient(circle at 50% 30%, rgba(215,168,77,.13), transparent 25%),
              #fafaf7;
          }

          .ltc-chat-empty-icon {
            margin: 0 auto;
            display: grid;
            place-items: center;
            width: 70px;
            height: 70px;
            border-radius: 999px;
            background: rgba(35,95,62,.10);
            color: var(--green-800);
            font-size: 30px;
          }

          .ltc-chat-empty-state h3 {
            margin: 16px 0 0;
            color: var(--green-950);
            font-size: 22px;
            font-weight: 900;
            letter-spacing: -.03em;
          }

          .ltc-chat-empty-state p {
            margin: 6px 0 0;
            color: rgba(16,24,40,.46);
            font-size: 13px;
            font-weight: 700;
          }

          @keyframes ltcChatReveal {
            from { opacity: 0; transform: translateY(26px) scale(.99); }
            to { opacity: 1; transform: translateY(0) scale(1); }
          }

          @media (max-width: 1100px) {
            .ltc-chat-panel {
              grid-template-columns: 330px minmax(0, 1fr);
            }
          }

          @media (max-width: 900px) {
            .ltc-admin-chat {
              margin: -4px;
              padding: 14px;
            }

            .ltc-chat-panel,
            .ltc-chat-panel.with-notice {
              height: auto;
              min-height: 0;
              grid-template-columns: 1fr;
            }

            .ltc-chat-sidebar {
              max-height: 460px;
              border-right: 0;
              border-bottom: 1px solid rgba(35,95,62,.10);
            }

            .ltc-chat-main {
              min-height: 560px;
            }

            .ltc-chat-main-head-row,
            .ltc-chat-compose-row {
              flex-direction: column;
            }

            .ltc-chat-main-tags {
              justify-content: flex-start;
            }

            .ltc-chat-send-btn {
              width: 100%;
            }
          }
        `}</style>

        {status.message ? (
          <div className={`ltc-chat-notice ${status.type === "error" ? "error" : "success"}`}>
            {status.message}
          </div>
        ) : null}

        <div className={`ltc-chat-panel ${status.message ? "with-notice" : ""}`}>
          <aside className="ltc-chat-sidebar">
            <div className="ltc-chat-sidebar-head">
              <p className="ltc-chat-kicker">Support Inbox</p>
              <h2 className="ltc-chat-title">Guests</h2>
              <p className="ltc-chat-count">
                {loadingConversations
                  ? "Loading..."
                  : `${sortedConversations.length} shown / ${conversations.length} total`}
              </p>

              <div className="ltc-chat-filter-grid">
                {CONCERN_FILTERS.map((item) => {
                  const active = concernFilter === item.id;

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setConcernFilter(item.id)}
                      className={`ltc-chat-filter-btn ${active ? "active" : ""}`}
                    >
                      {item.label} ({counts[item.id] || 0})
                    </button>
                  );
                })}
              </div>

              <label className="ltc-chat-field-label">Search</label>
              <input
                value={bookingIdSearch}
                onChange={(e) => setBookingIdSearch(e.target.value)}
                placeholder="Booking ID, name, or email"
                className="ltc-chat-search"
              />
            </div>

            <div className="ltc-chat-conversation-list">
              {loadingConversations ? (
                <div className="ltc-chat-empty-card">Loading conversations...</div>
              ) : sortedConversations.length === 0 ? (
                <div className="ltc-chat-empty-card">No conversations for this filter.</div>
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
                      className={`ltc-chat-user-card ${active ? "active" : ""}`}
                    >
                      <div className="ltc-chat-user-top">
                        <div className="ltc-chat-user-main">
                          <p className="ltc-chat-user-name">{getUserName(user)}</p>
                          <p className="ltc-chat-user-email">{user?.email || "No email"}</p>
                        </div>

                        {conversation.unreadCount > 0 ? (
                          <span className="ltc-chat-unread">{conversation.unreadCount}</span>
                        ) : null}
                      </div>

                      <div className="ltc-chat-pills">
                        <span className="ltc-chat-pill">{getConcernLabel(concernType)}</span>
                      </div>

                      {bookingId ? (
                        <p className="ltc-chat-preview">Booking ID: {bookingId}</p>
                      ) : null}

                      <p className="ltc-chat-preview">
                        {getConversationPrefix(conversation.lastSenderRole)}
                        {conversation.lastMessage || "Open conversation"}
                      </p>

                      <p className="ltc-chat-time">{formatTime(conversation.lastMessageAt)}</p>
                    </button>
                  );
                })
              )}
            </div>
          </aside>

          <section className="ltc-chat-main">
            {selectedUser ? (
              <>
                <div className="ltc-chat-main-head">
                  <div className="ltc-chat-main-head-row">
                    <div>
                      <p className="ltc-chat-kicker">Active Conversation</p>
                      <h3 className="ltc-chat-main-name">{getUserName(selectedUser)}</h3>
                      <p className="ltc-chat-main-email">{selectedUser.email || "No email"}</p>
                    </div>

                    <div className="ltc-chat-main-tags">
                      <span className="ltc-chat-main-tag">
                        Concern: {getConcernLabel(selectedConversation?.latestConcernType)}
                      </span>

                      {selectedConversation?.latestConcernDetails?.bookingId ? (
                        <span className="ltc-chat-main-tag gold">
                          Booking ID: {selectedConversation.latestConcernDetails.bookingId}
                        </span>
                      ) : null}
                    </div>
                  </div>
                </div>

                <div className="ltc-chat-messages">
                  {loadingMessages ? (
                    <div className="ltc-chat-loading">Loading messages...</div>
                  ) : messages.length === 0 ? (
                    <div className="ltc-chat-loading">No messages yet.</div>
                  ) : (
                    <div className="ltc-chat-message-stack">
                      {messages.map((msg, index) => {
                        const staff = isStaff(msg);
                        const bot = isBot(msg);

                        return (
                          <div
                            key={msg._id || index}
                            className={`ltc-chat-row ${staff ? "staff" : "guest"}`}
                          >
                            <div
                              className={`ltc-chat-bubble ${
                                staff ? (bot ? "bot" : "staff") : "guest"
                              }`}
                            >
                              <div className="ltc-chat-bubble-meta">
                                <p className="ltc-chat-owner">
                                  {getMessageOwnerLabel(msg, selectedUser)}
                                </p>

                                {msg.concernType ? (
                                  <span className="ltc-chat-pill">
                                    {getConcernLabel(msg.concernType)}
                                  </span>
                                ) : null}
                              </div>

                              <p className="ltc-chat-message-text">{msg.message}</p>

                              {msg.autoReplyKind === "after_hours" ? (
                                <p className="ltc-chat-faq-note">FAQ suggested</p>
                              ) : null}

                              <p className="ltc-chat-message-time">{formatTime(msg.createdAt)}</p>
                            </div>
                          </div>
                        );
                      })}
                      <div ref={bottomRef} />
                    </div>
                  )}
                </div>

                <form onSubmit={sendMessage} className="ltc-chat-compose">
                  <div className="ltc-chat-compose-row">
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
                      className="ltc-chat-textarea"
                    />

                    <button
                      type="submit"
                      disabled={sending || !messageText.trim()}
                      className="ltc-chat-send-btn"
                    >
                      {sending ? "SENDING..." : "SEND"}
                    </button>
                  </div>
                  <p className="ltc-chat-help">Press Enter to send. Shift + Enter for a new line.</p>
                </form>
              </>
            ) : (
              <div className="ltc-chat-empty-state">
                <div>
                  <div className="ltc-chat-empty-icon">💬</div>
                  <h3>Select a conversation</h3>
                  <p>Guest conversations will appear here after they send a concern.</p>
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    </HotelAdminShell>
  );
}
