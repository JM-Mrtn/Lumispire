import React, { useEffect, useMemo, useRef, useState } from "react";

const FIRST_VISIT_KEY = "tamsi_training_chatbot_first_visit_seen_v1";
const STORAGE_KEY = "tamsi_training_chatbot_messages_v1";

const starterSuggestions = [
  "How do I enroll?",
  "What are the requirements?",
  "What courses are available?",
  "What is an open batch?",
  "What happens after I submit?",
];

const knowledgeBase = [
  {
    id: "greeting",
    keywords: [
      "hello",
      "hi",
      "hey",
      "good morning",
      "good afternoon",
      "good evening",
    ],
    response:
      "Hello. I’m the TAMSI Enrollment Assistant. I mainly help first-time website visitors understand how to enroll, what documents to prepare, what courses are available, how open batches work, and what happens after submission.",
  },
  {
    id: "enroll_steps",
    keywords: [
      "how do i enroll",
      "how to enroll",
      "enroll",
      "apply",
      "application",
      "how to apply",
      "start enrollment",
      "where to enroll",
    ],
    response:
      "To enroll, open the enrollment form, choose your course, select an open batch, complete your personal information, upload the required documents, and submit your application. After submission, your enrollment will go under review.",
  },
  {
    id: "requirements",
    keywords: [
      "requirements",
      "requirement",
      "documents",
      "document",
      "files",
      "upload",
      "birth certificate",
      "diploma",
      "tor",
      "2x2",
      "picture",
      "application form",
      "marriage contract",
      "form 137",
      "form 138",
    ],
    response:
      "The main required documents are Birth Certificate, Diploma or TOR, 2X2 Picture with Name, and Application Form. Some applicants may also upload Form 137/138 and Marriage Contract when applicable.",
  },
  {
    id: "courses",
    keywords: [
      "course",
      "courses",
      "course offer",
      "available course",
      "housekeeping",
      "event management",
    ],
    response:
      "The Training & Assessment system currently supports Housekeeping and Event Management. You can view the course page first, then proceed to enrollment when you are ready.",
  },
  {
    id: "open_batch",
    keywords: [
      "batch",
      "open batch",
      "batch code",
      "slot",
      "slots",
      "available slots",
      "section",
      "full batch",
    ],
    response:
      "An open batch is the class schedule currently available for enrollment. You must select a valid open batch, the batch must match your chosen course, and the batch can become unavailable if its window closes or if all slots are taken.",
  },
  {
    id: "validation",
    keywords: [
      "age",
      "eligible",
      "who can enroll",
      "18",
      "mobile number",
      "phone number",
      "email",
      "duplicate email",
      "validation",
      "invalid",
    ],
    response:
      "Important enrollment checks include: the applicant must be 18 years old and above, the email must be valid and not already used in another enrollment, the mobile number must follow the PH format, only one educational attainment should be selected, and at least one employment status must be selected.",
  },
  {
    id: "after_submit",
    keywords: [
      "after submit",
      "after i submit",
      "after submitting",
      "what happens next",
      "approval",
      "review",
      "pending",
      "credentials",
      "login details",
      "account",
      "email update",
    ],
    response:
      "After you submit, your application is stored and reviewed by the training admin. While waiting, your status is pending. If your enrollment is approved, your trainee login credentials are sent to your personal email.",
  },
  {
    id: "signin",
    keywords: [
      "sign in",
      "login",
      "log in",
      "trainee login",
      "where to login",
      "how to login",
    ],
    response:
      "For first-time visitors, enrollment comes first. The trainee login page is mainly for applicants who were already approved and already received their TAMSI trainee credentials by email.",
  },
  {
    id: "contact",
    keywords: [
      "contact",
      "faq",
      "faqs",
      "address",
      "location",
      "where are you located",
      "phone",
      "email address",
      "help desk",
    ],
    response:
      "You can open the Training contact or FAQs page if you need more help. That page is the best place for contact details, location, and general website guidance.",
  },
];

const normalize = (text = "") =>
  String(text || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const scoreIntent = (message, item) => {
  const normalizedMessage = normalize(message);

  return item.keywords.reduce((score, keyword) => {
    const normalizedKeyword = normalize(keyword);
    return normalizedMessage.includes(normalizedKeyword)
      ? score + normalizedKeyword.length
      : score;
  }, 0);
};

const getBotReply = (message) => {
  const ranked = knowledgeBase
    .map((item) => ({ ...item, score: scoreIntent(message, item) }))
    .sort((a, b) => b.score - a.score);

  const best = ranked[0];

  if (!best || best.score === 0) {
    return "I can help with enrollment, requirements, open batches, available courses, and what happens after submission. Try asking: How do I enroll?";
  }

  return best.response;
};

function createId() {
  if (globalThis.crypto?.randomUUID) {
    return globalThis.crypto.randomUUID();
  }

  return `id-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
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
        className={`max-w-[85%] whitespace-pre-line rounded-2xl px-4 py-3 text-sm leading-6 shadow-sm ${
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

export default function TrainingChatbot() {
  const bodyRef = useRef(null);

  const defaultMessages = useMemo(
    () => [
      {
        id: createId(),
        role: "assistant",
        text: "Hi. I’m the TAMSI Enrollment Assistant. If this is your first time using the website, I can help you understand how to enroll, what requirements to prepare, what an open batch means, and what happens after you submit.",
      },
    ],
    []
  );

  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      return defaultMessages;
    }

    return defaultMessages;
  });

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
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    } catch {}
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

  const sendMessage = (customText) => {
    const finalText = String(customText ?? input).trim();
    if (!finalText || isTyping) return;

    const userMessage = {
      id: createId(),
      role: "user",
      text: finalText,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    window.setTimeout(() => {
      const botMessage = {
        id: createId(),
        role: "assistant",
        text: getBotReply(finalText),
      };

      setMessages((prev) => [...prev, botMessage]);
      setIsTyping(false);
    }, 700);
  };

  const resetChat = () => {
    const initialMessages = [
      {
        id: createId(),
        role: "assistant",
        text: "Chat reset. I can help you with TAMSI enrollment, requirements, open batches, courses, and first-time website questions.",
      },
    ];

    setMessages(initialMessages);

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initialMessages));
    } catch {}
  };

  return (
    <>
      {isOpen && (
        <div className="fixed bottom-5 right-5 z-[120] w-[calc(100vw-2rem)] max-w-[390px] overflow-hidden rounded-[28px] border border-[#d7decf] bg-white shadow-[0_18px_48px_rgba(0,0,0,0.18)]">
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
                  First-time visitor help for enrollment, batches, and requirements.
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
                  onClick={() => setIsOpen(false)}
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
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
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