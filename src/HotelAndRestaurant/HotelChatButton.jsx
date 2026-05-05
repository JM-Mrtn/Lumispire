import React, { useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

const FAQ_BOT_KNOWLEDGE = [
  {
    id: "book-hotel-room",
    question: "How do I book a hotel or condo room?",
    keywords: ["hotel", "condo", "room", "book", "booking", "stay", "duration"],
    answer:
      "To book a hotel or condo room, open Hotel & Condo, choose a package, select the duration, date, time slot, pax, and payment method, then upload proof of payment before submitting.",
  },
  {
    id: "book-resort",
    question: "How do I book a resort or venue?",
    keywords: ["resort", "venue", "lorenzo", "hall", "veranda", "cavanas", "cabanas", "campsite"],
    answer:
      "To book a resort or venue, open Resort & Venue, choose the venue, select an available duration and time slot, enter pax, choose a payment method, upload proof of payment, and submit your booking.",
  },
  {
    id: "book-event",
    question: "How do I book an event package?",
    keywords: ["event", "package", "wedding", "debut", "birthday", "corporate", "menu", "food"],
    answer:
      "To book an event package, open Event Package, choose the package, venue, capacity variation, event date, time slot, menu choices, payment method, and proof of payment.",
  },
  {
    id: "payment",
    question: "What payment methods are accepted?",
    keywords: ["payment", "pay", "gcash", "bank", "transfer", "proof", "receipt", "down payment", "downpayment"],
    answer:
      "The booking forms accept GCash and Bank Transfer. You must upload a valid proof of payment image or PDF before submitting your booking request.",
  },
  {
    id: "booking-status",
    question: "What do booking statuses mean?",
    keywords: ["status", "pending", "confirmed", "approved", "cancelled", "canceled", "rejected"],
    answer:
      "Pending means your booking is waiting for admin approval. Confirmed means it was approved. Cancelled means it was rejected, cancelled, or no longer active.",
  },
  {
    id: "time-slot",
    question: "Why is my time slot unavailable?",
    keywords: ["time", "slot", "unavailable", "conflict", "available", "date", "overlap", "1 hour", "gap"],
    answer:
      "A time slot can be unavailable when another pending or confirmed booking overlaps with it. Some booking types also require at least a 1-hour gap before or after another booking.",
  },
  {
    id: "price",
    question: "Why did my booking price increase?",
    keywords: ["price", "increase", "expensive", "dynamic", "weekend", "seasonal", "pax", "additional", "charge"],
    answer:
      "Prices may increase because of seasonal dates, weekends, monthly booking demand, or additional pax beyond the base capacity.",
  },
  {
    id: "id-verification",
    question: "Why do I need ID verification?",
    keywords: ["id", "verification", "verify", "identity", "government", "upload id", "valid id"],
    answer:
      "ID verification helps confirm that bookings are made by a real guest. Upload a clear valid government ID from your profile and wait for admin review.",
  },
  {
    id: "id-pending",
    question: "Why is my ID pending?",
    keywords: ["pending id", "manual review", "pending", "review", "waiting"],
    answer:
      "Pending ID verification means your uploaded ID is waiting for admin review. You can upload another ID only after the admin rejects the current submission.",
  },
  {
    id: "id-rejected",
    question: "Why was my ID rejected?",
    keywords: ["rejected", "invalid id", "not id", "ai rejected", "auto rejected", "unclear", "unreadable"],
    answer:
      "Your ID may be rejected if the file is unclear, unreadable, not a government ID, expired, or missing important identity details. Upload a clearer valid government ID when the system allows you to re-upload.",
  },
  {
    id: "forgot-password",
    question: "How do I reset my password?",
    keywords: ["forgot", "password", "reset", "login", "cannot login"],
    answer:
      "Go to Forgot Password, enter your registered email, and check your email for the reset link. Use the reset link before it expires.",
  },
  {
    id: "change-password",
    question: "How do I change my password?",
    keywords: ["change password", "otp", "current password", "new password"],
    answer:
      "From your profile, click Change Password. Enter your current password and new password, then verify the OTP sent to your registered email.",
  },
  {
    id: "recommendations",
    question: "Where can I get hotel recommendations?",
    keywords: ["recommend", "recommendation", "suggest", "best", "package", "option"],
    answer:
      "Open Hotel Recommendations to get suggested hotel, resort, and event options based on your preferences.",
    route: "/hotel-recommendations",
    routeLabel: "Open Recommendations",
  },
  {
    id: "faqs",
    question: "Where can I read all FAQs?",
    keywords: ["faq", "faqs", "help", "questions", "guide", "support"],
    answer:
      "Open the Hotel FAQs page to read detailed answers about booking, payment, ID verification, account, and common hotel concerns.",
    route: "/hotel-faqs",
    routeLabel: "Open FAQs",
  },
];

const QUICK_QUESTIONS = [
  "How do I book a resort?",
  "What payment methods are accepted?",
  "Why is my ID pending?",
  "Why is my time slot unavailable?",
  "Where can I get recommendations?",
];

function getBotReply(message = "") {
  const input = String(message || "").toLowerCase().trim();

  if (!input) {
    return {
      answer: "Please type a hotel question first.",
      matched: null,
    };
  }

  let bestMatch = null;
  let bestScore = 0;

  FAQ_BOT_KNOWLEDGE.forEach((item) => {
    let score = 0;

    item.keywords.forEach((keyword) => {
      const cleanKeyword = String(keyword).toLowerCase();

      if (input.includes(cleanKeyword)) {
        score += cleanKeyword.length > 6 ? 2 : 1;
      }
    });

    if (input.includes(item.question.toLowerCase())) {
      score += 5;
    }

    if (score > bestScore) {
      bestScore = score;
      bestMatch = item;
    }
  });

  if (!bestMatch || bestScore === 0) {
    return {
      answer:
        "I can answer basic hotel questions about booking, payment, ID verification, booking status, time slots, prices, password reset, FAQs, and recommendations. Try asking: \"How do I book a resort?\" or \"Why is my ID pending?\"",
      matched: null,
    };
  }

  return {
    answer: bestMatch.answer,
    matched: bestMatch,
  };
}

export default function HotelChatButton() {
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);

  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    {
      role: "bot",
      text:
        "Hi! I am the Hotel FAQ Bot. I answer basic questions about bookings, payment, ID verification, prices, password reset, FAQs, and recommendations.",
      matched: null,
    },
  ]);

  const suggestedQuestions = useMemo(() => QUICK_QUESTIONS, []);

  const scrollToBottom = () => {
    window.requestAnimationFrame(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    });
  };

  const sendMessage = (value = input) => {
    const clean = String(value || "").trim();
    if (!clean) return;

    const reply = getBotReply(clean);

    setMessages((prev) => [
      ...prev,
      { role: "user", text: clean, matched: null },
      { role: "bot", text: reply.answer, matched: reply.matched },
    ]);

    setInput("");
    scrollToBottom();
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-[60] flex items-center gap-3 rounded-full bg-[#355240] px-5 py-4 text-white shadow-2xl transition hover:-translate-y-1 hover:bg-[#2a4233] focus:outline-none focus:ring-4 focus:ring-[#355240]/25"
        aria-label="Open hotel FAQ bot"
      >
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-xl font-extrabold text-[#355240]">
          ?
        </span>

        <span className="hidden text-sm font-extrabold sm:block">
          Help Bot
        </span>
      </button>

      {isOpen ? (
        <div className="fixed inset-0 z-[80] flex items-end justify-end bg-black/30 p-4 sm:p-6">
          <div className="flex h-[620px] max-h-[88vh] w-full max-w-[430px] flex-col overflow-hidden rounded-[28px] bg-white shadow-2xl">
            <div className="bg-[#355240] px-5 py-4 text-white">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-white/60">
                    Basic Questions
                  </p>

                  <h2 className="text-xl font-extrabold">Hotel FAQ Bot</h2>

                  <p className="mt-1 text-xs font-semibold text-white/70">
                    Automated help for common hotel questions.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="rounded-full bg-white/10 px-3 py-2 text-sm font-extrabold hover:bg-white/20"
                  aria-label="Close FAQ bot"
                >
                  X
                </button>
              </div>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto bg-[#f6f6f3] p-4">
              {messages.map((message, index) => {
                const isBot = message.role === "bot";

                return (
                  <div
                    key={`${message.role}-${index}`}
                    className={`flex ${isBot ? "justify-start" : "justify-end"}`}
                  >
                    <div
                      className={`max-w-[86%] rounded-2xl px-4 py-3 text-sm leading-6 shadow-sm ${
                        isBot
                          ? "bg-white text-[#36523d]"
                          : "bg-[#355240] text-white"
                      }`}
                    >
                      <p className="font-semibold">{message.text}</p>

                      {isBot && message.matched?.route ? (
                        <button
                          type="button"
                          onClick={() => {
                            setIsOpen(false);
                            navigate(message.matched.route);
                          }}
                          className="mt-3 rounded-full bg-[#355240] px-4 py-2 text-xs font-extrabold text-white hover:opacity-90"
                        >
                          {message.matched.routeLabel || "Open Page"}
                        </button>
                      ) : null}
                    </div>
                  </div>
                );
              })}

              <div ref={messagesEndRef} />
            </div>

            <div className="border-t border-black/10 bg-white p-4">
              <div className="mb-3 flex gap-2 overflow-x-auto pb-1">
                {suggestedQuestions.map((question) => (
                  <button
                    key={question}
                    type="button"
                    onClick={() => sendMessage(question)}
                    className="shrink-0 rounded-full border border-[#355240]/15 bg-[#355240]/5 px-3 py-2 text-xs font-bold text-[#355240] hover:bg-[#355240]/10"
                  >
                    {question}
                  </button>
                ))}
              </div>

              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  sendMessage();
                }}
                className="flex gap-2"
              >
                <input
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  placeholder="Ask a basic hotel question..."
                  className="h-12 flex-1 rounded-2xl border border-black/10 bg-[#fafaf7] px-4 text-sm font-semibold text-[#36523d] outline-none focus:border-[#355240]"
                />

                <button
                  type="submit"
                  className="rounded-2xl bg-[#355240] px-5 text-sm font-extrabold text-white hover:bg-[#2b4334]"
                >
                  Send
                </button>
              </form>

              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  navigate("/hotel-faqs");
                }}
                className="mt-3 w-full rounded-2xl border border-[#355240]/15 bg-white px-4 py-3 text-xs font-extrabold uppercase tracking-wide text-[#355240] hover:bg-[#355240]/5"
              >
                View Complete FAQs
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
