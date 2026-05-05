import React, { useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "react-router-dom";

function normalizeApiBase(raw) {
  const clean = String(raw || "http://localhost:5000").replace(/\/+$/, "");

  if (clean.endsWith("/api")) return clean;

  if (clean.includes("/api/")) {
    return clean.replace(/\/api\/.*$/i, "/api");
  }

  return `${clean}/api`;
}

const API_BASE = normalizeApiBase(import.meta.env.VITE_API_URL);
const STORAGE_KEY = "manpower-chatbot-messages-v3";
const REQUEST_TIMEOUT_MS = 15000;
const MAX_STORED_MESSAGES = 30;

const INITIAL_MESSAGES = [
  {
    id: "welcome",
    role: "assistant",
    text: "Hi. I’m the LTC Manpower Services assistant. Ask me about job openings, requirements, application steps, exams, interview schedules, payroll, leave requests, employee login, OTP password change, or contact details.",
  },
];

const QUICK_ACTIONS = [
  "What job openings are available?",
  "What requirements do I need?",
  "How do I apply?",
  "How can I check my payroll?",
];

function shouldShowChatbot(pathname = "") {
  const path = String(pathname || "").toLowerCase();

  if (!path.startsWith("/manpower")) return false;
  if (path.startsWith("/manpower-hr")) return false;
  if (path.startsWith("/manpower-admin")) return false;
  if (path.startsWith("/manpower-employee")) return false;
  if (path.startsWith("/manpower-exam")) return false;

  return true;
}

function createMessage(role, text) {
  return {
    id: `${role}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    role,
    text: String(text || "").trim(),
  };
}

function sanitizeMessages(value) {
  if (!Array.isArray(value)) return INITIAL_MESSAGES;

  const cleaned = value
    .map((item) => ({
      id: String(item?.id || `${item?.role || "message"}-${Date.now()}`),
      role: item?.role === "user" ? "user" : "assistant",
      text: String(item?.text || "").trim(),
    }))
    .filter((item) => item.text)
    .slice(-MAX_STORED_MESSAGES);

  return cleaned.length ? cleaned : INITIAL_MESSAGES;
}

function loadStoredMessages() {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return INITIAL_MESSAGES;

    return sanitizeMessages(JSON.parse(raw));
  } catch {
    return INITIAL_MESSAGES;
  }
}

function ChatIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <path
        d="M8 10h8M8 14h5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M7 20 4 21l1-3a8 8 0 1 1 2 2Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SendIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <path
        d="M3 11.5 21 3l-6.5 18-2.8-6.7L3 11.5Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M21 3 11.7 14.3"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CloseIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <path
        d="M6 6 18 18M18 6 6 18"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ResetIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <path
        d="M20 11a8 8 0 1 1-2.34-5.66L20 8"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M20 4v4h-4"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function MessageBubble({ role, text }) {
  const isUser = role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[85%] whitespace-pre-line break-words rounded-2xl px-4 py-3 text-sm leading-6 shadow-sm ${
          isUser
            ? "rounded-br-md bg-[#395345] text-white"
            : "rounded-bl-md border border-[#d7decf] bg-[#f8faf6] text-[#24352c]"
        }`}
      >
        {text}
      </div>
    </div>
  );
}

function TypingBubble() {
  return (
    <div className="flex justify-start">
      <div className="rounded-2xl rounded-bl-md border border-[#d7decf] bg-[#f8faf6] px-4 py-3 text-sm text-[#5f6f61] shadow-sm">
        Thinking...
      </div>
    </div>
  );
}

async function postChatbotMessage({ question, history }) {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const res = await fetch(`${API_BASE}/manpower/chatbot`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ question, history }),
      signal: controller.signal,
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      throw new Error(data?.message || "Failed to contact the chatbot.");
    }

    return (
      String(data?.reply || "").trim() ||
      "Sorry, I could not answer that right now."
    );
  } catch (error) {
    if (error?.name === "AbortError") {
      throw new Error("The chatbot took too long to respond. Please try again.");
    }

    throw error;
  } finally {
    window.clearTimeout(timeoutId);
  }
}

export default function ManpowerChatbot() {
  const location = useLocation();

  const showChatbot = useMemo(
    () => shouldShowChatbot(location.pathname),
    [location.pathname]
  );

  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState(loadStoredMessages);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const bodyRef = useRef(null);

  useEffect(() => {
    const cleaned = sanitizeMessages(messages);
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(cleaned));
  }, [messages]);

  useEffect(() => {
    if (!open) return;

    const node = bodyRef.current;
    if (!node) return;

    node.scrollTop = node.scrollHeight;
  }, [messages, loading, open]);

  if (!showChatbot) return null;

  async function sendMessage(rawText = "") {
    const question = String(rawText || input).trim();
    if (!question || loading) return;

    const userMessage = createMessage("user", question);
    const nextMessages = sanitizeMessages([...messages, userMessage]);

    setMessages(nextMessages);
    setInput("");
    setLoading(true);

    try {
      const reply = await postChatbotMessage({
        question,
        history: nextMessages.slice(-8).map((item) => ({
          role: item.role,
          text: item.text,
        })),
      });

      setMessages((prev) =>
        sanitizeMessages([...prev, createMessage("assistant", reply)])
      );
    } catch (error) {
      setMessages((prev) =>
        sanitizeMessages([
          ...prev,
          createMessage(
            "assistant",
            error?.message ||
              "Sorry, something went wrong while contacting the chatbot. Please check if the backend server is running."
          ),
        ])
      );
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(e) {
    e.preventDefault();
    sendMessage();
  }

  function resetChat() {
    setMessages(INITIAL_MESSAGES);
    setInput("");
    setLoading(false);
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_MESSAGES));
  }

  return (
    <>
      {open && (
        <div className="fixed bottom-5 right-5 z-[9999] w-[calc(100vw-2rem)] max-w-[390px] overflow-hidden rounded-[28px] border border-[#d7decf] bg-white shadow-[0_18px_48px_rgba(0,0,0,0.18)]">
          <div className="bg-gradient-to-r from-[#395345] to-[#4f6e5d] px-4 py-4 text-white">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-white/75">
                  AI Assistant
                </p>
                <h3 className="mt-1 text-lg font-black">
                  Manpower Services Chat
                </h3>
                <p className="mt-1 text-xs text-white/85">
                  Ask about jobs, requirements, application steps, exams,
                  payroll, leave requests, and contact details.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={resetChat}
                  className="rounded-full bg-white/10 p-2 text-white transition hover:bg-white/20"
                  aria-label="Reset chat"
                >
                  <ResetIcon className="h-4 w-4" />
                </button>

                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-full bg-white/10 p-2 text-white transition hover:bg-white/20"
                  aria-label="Close chatbot"
                >
                  <CloseIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          <div
            ref={bodyRef}
            className="max-h-[420px] space-y-3 overflow-y-auto bg-[#f5f7f3] px-4 py-4"
          >
            {messages.map((message) => (
              <MessageBubble
                key={message.id}
                role={message.role}
                text={message.text}
              />
            ))}

            {loading && <TypingBubble />}
          </div>

          <div className="border-t border-[#e6ece1] bg-white px-4 py-3">
            <div className="mb-3 flex flex-wrap gap-2">
              {QUICK_ACTIONS.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => sendMessage(item)}
                  disabled={loading}
                  className="rounded-full border border-[#d7decf] bg-[#f8faf6] px-3 py-1.5 text-xs font-semibold text-[#395345] transition hover:bg-[#eef3ea] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {item}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="flex items-end gap-2">
              <textarea
                rows={1}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
                placeholder="Type your question..."
                className="max-h-28 min-h-[46px] flex-1 resize-none rounded-2xl border border-[#cfd7cb] bg-[#f8faf6] px-4 py-3 text-sm text-[#24352c] outline-none transition focus:border-[#395345]"
              />

              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="flex h-[46px] w-[46px] items-center justify-center rounded-2xl bg-[#395345] text-white transition hover:bg-[#2c4136] disabled:cursor-not-allowed disabled:opacity-60"
                aria-label="Send message"
              >
                <SendIcon className="h-5 w-5" />
              </button>
            </form>
          </div>
        </div>
      )}

      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="fixed bottom-5 right-5 z-[9999] inline-flex items-center gap-3 rounded-full bg-[#395345] px-5 py-3 text-sm font-bold text-white shadow-[0_14px_32px_rgba(57,83,69,0.35)] transition hover:bg-[#2c4136]"
        >
          <ChatIcon className="h-5 w-5" />
          Ask AI
        </button>
      )}
    </>
  );
}
