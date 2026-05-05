import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

const FIRST_VISIT_KEY = "tamsi_training_chatbot_first_visit_seen_v2";
const STORAGE_KEY = "tamsi_training_chatbot_messages_v2";
const MAX_STORED_MESSAGES = 40;

const ROUTES = {
  enroll: "/training-enroll",
  courses: "/training-course",
  requirements: "/training-requirements",
  contact: "/training-contact-us",
  faqs: "/training-faqs",
  traineeLogin: "/trainee-login",
};

const starterSuggestions = [
  "How do I enroll?",
  "What requirements do I need?",
  "What courses are available?",
  "Are there open batches?",
  "What happens after I submit?",
];

const fallbackCourses = ["Housekeeping", "Event Management"];

function normalizeApiBase(raw) {
  if (!raw) return "http://localhost:5000/api";

  const value = String(raw).replace(/\/+$/, "");

  if (value.endsWith("/api/hotel")) {
    return value.replace(/\/api\/hotel$/i, "/api");
  }

  if (value.endsWith("/api")) return value;

  if (value.includes("/api/")) {
    return value.replace(/\/api\/hotel.*$/i, "/api");
  }

  return `${value}/api`;
}

const API_BASE = normalizeApiBase(
  import.meta.env.VITE_TRAINING_API_URL || import.meta.env.VITE_API_URL
);

function createId() {
  if (globalThis.crypto?.randomUUID) {
    return globalThis.crypto.randomUUID();
  }

  return `id-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function normalizeText(value = "") {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokenize(value = "") {
  return normalizeText(value)
    .split(" ")
    .map((item) => item.trim())
    .filter((item) => item.length >= 2);
}

function uniqueStrings(values = []) {
  return [
    ...new Set(
      (Array.isArray(values) ? values : [])
        .map((item) => String(item || "").trim())
        .filter(Boolean)
    ),
  ];
}

function formatDateTime(value) {
  if (!value) return "Not set";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not set";

  return date.toLocaleString("en-PH", {
    month: "short",
    day: "2-digit",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function normalizeCourseName(value = "") {
  const clean = String(value || "").trim();
  const lower = clean.toLowerCase();

  if (lower === "housekeeping") return "Housekeeping";
  if (lower === "event management" || lower === "events management") {
    return "Event Management";
  }

  return clean;
}

function getCoursesFromBatches(batches = []) {
  const courses = uniqueStrings(
    batches.map((batch) => normalizeCourseName(batch?.course || ""))
  );

  return courses.length ? courses : fallbackCourses;
}

function formatOpenBatches(context) {
  const { loading, error, batches } = context || {};

  if (loading) {
    return "I am still checking the latest open batch list. You may also open the enrollment form to refresh the available batch options.";
  }

  if (error) {
    return "I could not load the latest open batch list right now. You can still check the enrollment form, or contact TAMSI if you need the current schedule.";
  }

  if (!Array.isArray(batches) || !batches.length) {
    return "There are no open batches available for online enrollment right now. Please check again later or contact TAMSI for the next schedule.";
  }

  const lines = batches.slice(0, 6).map((batch, index) => {
    const course = normalizeCourseName(batch?.course || "Training Course");
    const name = batch?.batchName || batch?.batchCode || `Batch ${index + 1}`;
    const code = batch?.batchCode ? ` (${batch.batchCode})` : "";
    const slots = Number.isFinite(Number(batch?.availableSlots))
      ? ` - ${Number(batch.availableSlots)} slot(s) left`
      : "";
    const closeAt = batch?.enrollmentCloseAt
      ? ` - closes ${formatDateTime(batch.enrollmentCloseAt)}`
      : "";

    return `${index + 1}. ${course}: ${name}${code}${slots}${closeAt}`;
  });

  const moreCount = batches.length - lines.length;
  const moreText = moreCount > 0 ? `\nPlus ${moreCount} more open batch(es).` : "";

  return `These are the open enrollment batches I found:\n${lines.join("\n")}${moreText}`;
}

async function loadOpenBatches(signal) {
  const response = await fetch(`${API_BASE}/enrollments/open-batches`, {
    signal,
    headers: {
      Accept: "application/json",
    },
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data?.message || "Failed to load open batches.");
  }

  return Array.isArray(data?.batches) ? data.batches : [];
}

function buildActions(keys = []) {
  return keys
    .map((key) => {
      if (key === "enroll") return { label: "Open Enrollment Form", route: ROUTES.enroll };
      if (key === "courses") return { label: "View Courses", route: ROUTES.courses };
      if (key === "requirements") return { label: "View Requirements", route: ROUTES.requirements };
      if (key === "contact") return { label: "Contact TAMSI", route: ROUTES.contact };
      if (key === "faqs") return { label: "Open FAQs", route: ROUTES.faqs };
      if (key === "traineeLogin") return { label: "Trainee Login", route: ROUTES.traineeLogin };
      return null;
    })
    .filter(Boolean);
}

const intentRules = [
  {
    id: "greeting",
    phrases: ["hello", "hi", "hey", "good morning", "good afternoon", "good evening"],
    keywords: ["hello", "hi", "hey"],
    answer: () => ({
      text:
        "Hello. I am the TAMSI Training Enrollment Assistant. I can help you with enrollment steps, requirements, available courses, open batches, trainee login guidance, and what happens after submission.",
      actions: buildActions(["enroll", "courses", "requirements"]),
    }),
  },
  {
    id: "enroll_steps",
    phrases: [
      "how do i enroll",
      "how to enroll",
      "start enrollment",
      "where to enroll",
      "how to apply",
      "apply for training",
    ],
    keywords: ["enroll", "enrollment", "apply", "application", "register", "start"],
    answer: () => ({
      text:
        "To enroll: open the enrollment form, choose your course, select an open batch, complete your personal information, upload the required documents, review your details, then submit. Your application will be marked pending until the training admin reviews it.",
      actions: buildActions(["enroll", "requirements"]),
    }),
  },
  {
    id: "requirements",
    phrases: [
      "what requirements",
      "requirements do i need",
      "required documents",
      "documents to upload",
      "what files",
    ],
    keywords: [
      "requirement",
      "requirements",
      "document",
      "documents",
      "upload",
      "birth",
      "certificate",
      "diploma",
      "tor",
      "picture",
      "2x2",
      "application",
      "marriage",
      "form",
      "137",
      "138",
    ],
    answer: () => ({
      text:
        "Prepare these main enrollment documents: Birth Certificate, Diploma or TOR, 2x2 Picture with Name, and Application Form. If applicable, you may also upload Form 137/138 and Marriage Contract. Accepted files are usually PDF or image files, with DOC/DOCX supported for some requirement uploads.",
      actions: buildActions(["requirements", "enroll"]),
    }),
  },
  {
    id: "courses",
    phrases: [
      "what courses are available",
      "available courses",
      "course offer",
      "courses offered",
      "what course",
    ],
    keywords: ["course", "courses", "housekeeping", "event", "management", "offered", "available"],
    answer: (context) => {
      const courses = getCoursesFromBatches(context?.batches || []);
      return {
        text: `Available training courses include: ${courses.join(", ")}. You can view the course page first, then continue to enrollment when you are ready.`,
        actions: buildActions(["courses", "enroll"]),
      };
    },
  },
  {
    id: "open_batches",
    phrases: [
      "open batch",
      "open batches",
      "available batch",
      "available batches",
      "batch schedule",
      "are there open batches",
      "slots left",
      "available slots",
    ],
    keywords: ["batch", "batches", "slot", "slots", "schedule", "section", "open", "available", "full"],
    answer: (context) => ({
      text: `${formatOpenBatches(context)}\n\nA batch must match your selected course, must still be open, and must still have available slots before you can submit enrollment.`,
      actions: buildActions(["enroll", "contact"]),
    }),
  },
  {
    id: "validation",
    phrases: [
      "who can enroll",
      "am i eligible",
      "minimum age",
      "phone number format",
      "duplicate email",
    ],
    keywords: ["eligible", "age", "18", "email", "duplicate", "phone", "mobile", "invalid", "validation"],
    answer: () => ({
      text:
        "Important checks before submitting: applicants must be 18 years old and above, the email must be valid and not already used for another enrollment, the mobile number should follow PH format such as 09XXXXXXXXX or +639XXXXXXXXX, one educational attainment should be selected, and at least one employment status should be selected.",
      actions: buildActions(["enroll"]),
    }),
  },
  {
    id: "after_submit",
    phrases: [
      "what happens after i submit",
      "after i submit",
      "after submitting",
      "what happens next",
      "application status",
    ],
    keywords: ["after", "submit", "submitted", "pending", "approve", "approved", "review", "credentials", "account", "email"],
    answer: () => ({
      text:
        "After submission, your application stays pending while the training admin reviews it. If approved, the system creates your trainee account and sends your trainee email and temporary password to your personal email. Use those credentials on the trainee login page.",
      actions: buildActions(["traineeLogin", "contact"]),
    }),
  },
  {
    id: "login",
    phrases: ["where to login", "trainee login", "how to login", "sign in", "log in"],
    keywords: ["login", "signin", "sign", "password", "credentials", "account", "trainee"],
    answer: () => ({
      text:
        "The trainee login page is for applicants who are already approved and received their TAMSI trainee credentials by email. If you are a first-time visitor and do not have credentials yet, submit an enrollment application first.",
      actions: buildActions(["traineeLogin", "enroll"]),
    }),
  },
  {
    id: "contact",
    phrases: ["contact", "where are you located", "need help", "help desk", "faq", "faqs"],
    keywords: ["contact", "location", "address", "phone", "email", "faq", "faqs", "help"],
    answer: () => ({
      text:
        "For contact details, location, or questions that require staff confirmation, please open the Training Contact or FAQs page. For private application concerns, contact TAMSI directly instead of sharing personal information in chat.",
      actions: buildActions(["contact", "faqs"]),
    }),
  },
];

function scoreIntent(message, rule) {
  const normalizedMessage = normalizeText(message);
  const words = new Set(tokenize(normalizedMessage));

  const phraseScore = (rule.phrases || []).reduce((score, phrase) => {
    const normalizedPhrase = normalizeText(phrase);
    if (!normalizedPhrase) return score;
    return normalizedMessage.includes(normalizedPhrase)
      ? score + normalizedPhrase.length * 4
      : score;
  }, 0);

  const keywordScore = (rule.keywords || []).reduce((score, keyword) => {
    const normalizedKeyword = normalizeText(keyword);
    if (!normalizedKeyword) return score;

    if (normalizedKeyword.includes(" ")) {
      return normalizedMessage.includes(normalizedKeyword)
        ? score + normalizedKeyword.length * 2
        : score;
    }

    return words.has(normalizedKeyword) ? score + normalizedKeyword.length + 4 : score;
  }, 0);

  return phraseScore + keywordScore;
}

function getBotReply(message, context) {
  const ranked = intentRules
    .map((rule) => ({ rule, score: scoreIntent(message, rule) }))
    .sort((a, b) => b.score - a.score);

  const best = ranked[0];

  if (!best || best.score <= 0) {
    return {
      text:
        "I can help with TAMSI enrollment, requirements, open batches, available courses, trainee login, and what happens after submission. Try asking: 'How do I enroll?' or 'Are there open batches?'",
      actions: buildActions(["enroll", "courses", "requirements"]),
    };
  }

  return best.rule.answer(context);
}

function normalizeStoredMessages(value, fallback) {
  if (!Array.isArray(value)) return fallback;

  const cleaned = value
    .map((item) => ({
      id: String(item?.id || createId()),
      role: item?.role === "user" ? "user" : "assistant",
      text: String(item?.text || "").trim(),
      actions: Array.isArray(item?.actions) ? item.actions : [],
    }))
    .filter((item) => item.text)
    .slice(-MAX_STORED_MESSAGES);

  return cleaned.length ? cleaned : fallback;
}

function ChatIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <path d="M8 10h8M8 14h5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M7 20 4 21l1-3a8 8 0 1 1 2 2Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
    </svg>
  );
}

function SendIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <path d="M3 11.5 21 3l-6.5 18-2.8-6.7L3 11.5Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M21 3 11.7 14.3" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
    </svg>
  );
}

function CloseIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <path d="M6 6 18 18M18 6 6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function ResetIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <path d="M20 11a8 8 0 1 1-2.34-5.66L20 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M20 4v4h-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function RefreshIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <path d="M21 12a9 9 0 0 1-15.36 6.36L3 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M3 20v-4h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M3 12A9 9 0 0 1 18.36 5.64L21 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M21 4v4h-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function MessageBubble({ role, text, actions = [], onAction }) {
  const isUser = role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div className={`max-w-[88%] ${isUser ? "items-end" : "items-start"}`}>
        <div
          className={`whitespace-pre-line rounded-2xl px-4 py-3 text-sm leading-6 shadow-sm ${
            isUser
              ? "rounded-br-md bg-[#395345] text-white"
              : "rounded-bl-md border border-[#d7decf] bg-[#f8faf6] text-[#24352c]"
          }`}
        >
          {text}
        </div>

        {!isUser && Array.isArray(actions) && actions.length > 0 ? (
          <div className="mt-2 flex flex-wrap gap-2">
            {actions.map((action) => (
              <button
                key={`${action.label}-${action.route}`}
                type="button"
                onClick={() => onAction?.(action)}
                className="rounded-full border border-[#cdd8c8] bg-white px-3 py-1.5 text-xs font-bold text-[#395345] shadow-sm transition hover:bg-[#eef3ea]"
              >
                {action.label}
              </button>
            ))}
          </div>
        ) : null}
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

export default function TrainingChatbot() {
  const navigate = useNavigate();
  const bodyRef = useRef(null);

  const defaultMessages = useMemo(
    () => [
      {
        id: createId(),
        role: "assistant",
        text:
          "Hi. I am the TAMSI Training Enrollment Assistant. Ask me about enrollment steps, requirements, courses, open batches, trainee login, or what happens after submission.",
        actions: buildActions(["enroll", "courses", "requirements"]),
      },
    ],
    []
  );

  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [batchState, setBatchState] = useState({
    batches: [],
    loading: true,
    error: "",
    loadedAt: null,
  });
  const [messages, setMessages] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : null;
      return normalizeStoredMessages(parsed, defaultMessages);
    } catch {
      return defaultMessages;
    }
  });

  const refreshOpenBatches = useCallback(async () => {
    const controller = new AbortController();

    setBatchState((prev) => ({
      ...prev,
      loading: true,
      error: "",
    }));

    try {
      const batches = await loadOpenBatches(controller.signal);
      setBatchState({
        batches,
        loading: false,
        error: "",
        loadedAt: new Date().toISOString(),
      });
    } catch (error) {
      if (error?.name === "AbortError") return;

      setBatchState({
        batches: [],
        loading: false,
        error: error?.message || "Failed to load open batches.",
        loadedAt: null,
      });
    }

    return () => controller.abort();
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    async function run() {
      setBatchState((prev) => ({ ...prev, loading: true, error: "" }));

      try {
        const batches = await loadOpenBatches(controller.signal);
        setBatchState({
          batches,
          loading: false,
          error: "",
          loadedAt: new Date().toISOString(),
        });
      } catch (error) {
        if (error?.name === "AbortError") return;

        setBatchState({
          batches: [],
          loading: false,
          error: error?.message || "Failed to load open batches.",
          loadedAt: null,
        });
      }
    }

    run();

    return () => controller.abort();
  }, []);

  useEffect(() => {
    try {
      const hasSeen = localStorage.getItem(FIRST_VISIT_KEY) === "1";

      if (!hasSeen) {
        setIsOpen(true);
        localStorage.setItem(FIRST_VISIT_KEY, "1");
      }
    } catch {
      setIsOpen(true);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(messages.slice(-MAX_STORED_MESSAGES))
      );
    } catch {
      // Ignore storage errors so the chatbot still works in private browsing.
    }
  }, [messages]);

  useEffect(() => {
    if (!isOpen) return;

    const node = bodyRef.current;
    if (!node) return;

    node.scrollTop = node.scrollHeight;
  }, [messages, isTyping, isOpen]);

  const canSend = useMemo(
    () => input.trim().length > 0 && !isTyping,
    [input, isTyping]
  );

  const sendMessage = useCallback(
    (customText) => {
      const finalText = String(customText ?? input).trim();
      if (!finalText || isTyping) return;

      const userMessage = {
        id: createId(),
        role: "user",
        text: finalText,
      };

      setMessages((prev) => [...prev, userMessage].slice(-MAX_STORED_MESSAGES));
      setInput("");
      setIsTyping(true);

      window.setTimeout(() => {
        const reply = getBotReply(finalText, batchState);
        const botMessage = {
          id: createId(),
          role: "assistant",
          text: reply.text,
          actions: reply.actions || [],
        };

        setMessages((prev) => [...prev, botMessage].slice(-MAX_STORED_MESSAGES));
        setIsTyping(false);
      }, 450);
    },
    [batchState, input, isTyping]
  );

  const resetChat = () => {
    const initialMessages = [
      {
        id: createId(),
        role: "assistant",
        text:
          "Chat reset. I can help you with TAMSI enrollment, requirements, open batches, courses, trainee login, and first-time website questions.",
        actions: buildActions(["enroll", "courses", "requirements"]),
      },
    ];

    setMessages(initialMessages);

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initialMessages));
    } catch {
      // Ignore storage errors.
    }
  };

  const handleAction = (action) => {
    if (!action?.route) return;
    setIsOpen(false);
    navigate(action.route);
  };

  const batchStatusText = batchState.loading
    ? "Checking batches..."
    : batchState.error
    ? "Batch list unavailable"
    : `${batchState.batches.length} open batch(es)`;

  return (
    <>
      {isOpen && (
        <div className="fixed bottom-5 right-5 z-[120] w-[calc(100vw-2rem)] max-w-[410px] overflow-hidden rounded-[28px] border border-[#d7decf] bg-white shadow-[0_18px_48px_rgba(0,0,0,0.18)]">
          <div className="bg-gradient-to-r from-[#395345] to-[#4f6e5d] px-4 py-4 text-white">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-white/75">
                  AI Assistant
                </p>
                <h3 className="mt-1 text-lg font-black">
                  TAMSI Enrollment Assistant
                </h3>
                <p className="mt-1 text-xs text-white/85">
                  Enrollment help, requirements, courses, and live open-batch guidance.
                </p>
                <p className="mt-2 inline-flex rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-bold text-white/85">
                  {batchStatusText}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={refreshOpenBatches}
                  className="rounded-full bg-white/10 p-2 text-white transition hover:bg-white/20"
                  aria-label="Refresh open batches"
                  title="Refresh open batches"
                >
                  <RefreshIcon className="h-4 w-4" />
                </button>

                <button
                  type="button"
                  onClick={resetChat}
                  className="rounded-full bg-white/10 p-2 text-white transition hover:bg-white/20"
                  aria-label="Reset chat"
                  title="Reset chat"
                >
                  <ResetIcon className="h-4 w-4" />
                </button>

                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="rounded-full bg-white/10 p-2 text-white transition hover:bg-white/20"
                  aria-label="Close chatbot"
                  title="Close chatbot"
                >
                  <CloseIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          <div
            ref={bodyRef}
            className="max-h-[430px] space-y-3 overflow-y-auto bg-[#f5f7f3] px-4 py-4"
          >
            {messages.map((message) => (
              <MessageBubble
                key={message.id}
                role={message.role}
                text={message.text}
                actions={message.actions}
                onAction={handleAction}
              />
            ))}

            {isTyping && <TypingBubble />}
          </div>

          <div className="border-t border-[#e6ece1] bg-white px-4 py-3">
            <div className="mb-3 flex flex-wrap gap-2">
              {starterSuggestions.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => sendMessage(suggestion)}
                  disabled={isTyping}
                  className="rounded-full border border-[#d7decf] bg-[#f8faf6] px-3 py-1.5 text-xs font-semibold text-[#395345] transition hover:bg-[#eef3ea] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {suggestion}
                </button>
              ))}
            </div>

            <div className="flex items-end gap-2">
              <textarea
                rows={1}
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    sendMessage();
                  }
                }}
                placeholder="Ask about enrollment..."
                className="max-h-28 min-h-[46px] flex-1 resize-none rounded-2xl border border-[#cfd7cb] bg-[#f8faf6] px-4 py-3 text-sm text-[#24352c] outline-none transition focus:border-[#395345]"
              />

              <button
                type="button"
                onClick={() => sendMessage()}
                disabled={!canSend}
                className="flex h-[46px] w-[46px] items-center justify-center rounded-2xl bg-[#395345] text-white transition hover:bg-[#2c4136] disabled:cursor-not-allowed disabled:opacity-60"
                aria-label="Send message"
              >
                <SendIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="fixed bottom-5 right-5 z-[120] inline-flex items-center gap-3 rounded-full bg-[#395345] px-5 py-3 text-sm font-bold text-white shadow-[0_14px_32px_rgba(57,83,69,0.35)] transition hover:bg-[#2c4136]"
        >
          <ChatIcon className="h-5 w-5" />
          Ask AI
        </button>
      )}
    </>
  );
}
