import React, { useEffect, useMemo, useRef, useState } from "react";

const STORAGE_KEY = "ltc_local_chatbot_messages_v2";

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
      "Hello. I’m the LTC virtual assistant. You can ask me about services, company history, operating hours, contact details, address, or the management team.",
  },
  {
    id: "services",
    keywords: ["services", "offer", "provide", "business", "solutions"],
    response:
      "LTC Group of Companies highlights three main service areas: Hotel & Resort, Training & Assessment, and Manpower Services. You can also ask me for a specific service category.",
  },
  {
    id: "hotel",
    keywords: ["hotel", "resort", "hospitality", "guest"],
    response:
      "The Hotel & Resort service focuses on hospitality solutions and customer experience support. It is presented as one of LTC’s core service offerings on the site.",
  },
  {
    id: "training",
    keywords: [
      "training",
      "assessment",
      "tesda",
      "skills",
      "certification",
      "classroom",
    ],
    response:
      "The Training & Assessment side covers skills development, assessment support, and hospitality-related technical and vocational training programs.",
  },
  {
    id: "manpower",
    keywords: [
      "manpower",
      "staffing",
      "recruitment",
      "workforce",
      "deployment",
      "hiring",
    ],
    response:
      "LTC also provides manpower services, helping organizations with staffing support and workforce solutions.",
  },
  {
    id: "about",
    keywords: ["about", "company", "history", "started", "founded", "timeline"],
    response:
      "LTC started as LTC Staffing Center, Inc. in May 1989, changed to LTC-Multi Services and Training Center, Inc. in January 2013, and later became LTC Training Assessment and Multi Services, Inc. in September 2019.",
  },
  {
    id: "vision",
    keywords: ["vision", "goal", "future"],
    response:
      "LTC’s vision is to be a reliable partner of government and corporate industry in providing quality technical vocational training, hospitality services, assessment, and job services globally.",
  },
  {
    id: "mission",
    keywords: ["mission", "purpose"],
    response:
      "LTC’s mission is to be a top-of-mind provider of training, assessment, and job services for professionals and business partners that value technical proficiency, competence, reliability, and workforce quality.",
  },
  {
    id: "values",
    keywords: [
      "values",
      "loyalty",
      "integrity",
      "god-fearing",
      "hardwork",
      "trustworthiness",
    ],
    response:
      "The company values highlighted on the site are Loyalty, Integrity, God-Fearing, Hardwork, and Trustworthiness.",
  },
  {
    id: "team",
    keywords: ["team", "leader", "management", "executive", "founder", "president"],
    response:
      "The founder and president shown on the site is Lorna T. Castigador. You can also ask about the executive team or a specific department head.",
  },
  {
    id: "founder",
    keywords: ["lorna", "castigador", "founder", "president"],
    response:
      "Lorna T. Castigador is presented as the Founder and President of LTC Group of Companies.",
  },
  {
    id: "executives",
    keywords: [
      "executives",
      "general manager",
      "manpower head",
      "training head",
      "system head",
      "hotel head",
    ],
    response:
      "The site lists general managers for Manpower Services, System Services, Training & Assessment, and Hotel & Restaurant operations.",
  },
  {
    id: "contact",
    keywords: ["contact", "email", "phone", "call", "reach", "number"],
    response:
      "You can contact LTC through (02) 8632 6513 or (02) 7254 0275. Email contacts listed are lornacastigador@ltcmultiservices.com, lorengladius@ltcmultiservices.com, and Admin@ltcmultiservices.com.",
  },
  {
    id: "hours",
    keywords: ["hours", "open", "schedule", "office hours", "operating hours", "time"],
    response:
      "Operating hours shown on the site are Monday to Friday, 8:00 AM to 5:00 PM; Saturday, 9:00 AM to 12:00 PM; Sunday, closed.",
  },
  {
    id: "location",
    keywords: ["address", "location", "where", "makati", "office", "map"],
    response:
      "The main office listed is 5411 Light Tower Center & Realty Development, Inc., Building II, Curie Street, Palanan, Makati City. The training center is at Light Tower Center, 1730 Dian Street, Palanan, Makati City.",
  },
];

const starterSuggestions = [
  "What services do you offer?",
  "What are your office hours?",
  "Where is your office located?",
  "Who is the founder?",
  "Tell me about the company history.",
];

const normalize = (text = "") =>
  text
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
    return "I can help with LTC services, company history, team information, contact details, office hours, and location. Try asking something like: What services do you offer?";
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
        className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-6 shadow-sm ${
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

const ChatbotWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}

    return [
      {
        id: createId(),
        role: "assistant",
        text: "Hi. I’m the LTC virtual assistant. Ask me about services, company history, office hours, contact details, or location.",
      },
    ];
  });

  const bodyRef = useRef(null);

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
        text: "Chat reset. Ask me anything about LTC services, contact details, team members, or company information.",
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
                  LTC Virtual Assistant
                </h3>
                <p className="mt-1 text-xs text-white/85">
                  Ask about services, company details, hours, contacts, and
                  location.
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
                placeholder="Type your question..."
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
};

export default ChatbotWidget;