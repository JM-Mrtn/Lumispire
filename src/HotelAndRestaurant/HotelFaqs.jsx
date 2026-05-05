import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import HotelFaqBot from "./HotelFaqBot";

const FAQ_CATEGORIES = [
  { id: "all", label: "All" },
  { id: "account", label: "Account" },
  { id: "id", label: "ID Verification" },
  { id: "booking", label: "Booking" },
  { id: "payment", label: "Payment" },
  { id: "reschedule", label: "Reschedule / Cancel" },
  { id: "bot", label: "Help Bot" },
];

const FAQS = [
  {
    id: "create-account",
    category: "account",
    question: "How do I create a hotel account?",
    answer:
      "Go to the Hotel Sign Up page, fill in your name, username, email, phone number, and password, then submit the form. After signing up, check your email and click the verification link before using protected hotel features.",
    tags: ["signup", "register", "email verification"],
  },
  {
    id: "login-problem",
    category: "account",
    question: "Why can I not log in?",
    answer:
      "Make sure your email or username and password are correct. If your password is forgotten, use Forgot Password. If your account was deactivated by the admin, you need to contact hotel support.",
    tags: ["login", "password", "deactivated"],
  },
  {
    id: "forgot-password",
    category: "account",
    question: "How do I reset my password?",
    answer:
      "Open the Forgot Password page, enter your registered email, then check your email for the reset link. The reset link should be used before it expires.",
    tags: ["forgot password", "reset password"],
  },
  {
    id: "change-password",
    category: "account",
    question: "How do I change my password while logged in?",
    answer:
      "Go to your Hotel Profile, open Change Password, enter your current password and new password, then verify the OTP sent to your registered email.",
    tags: ["change password", "otp", "profile"],
  },
  {
    id: "id-required",
    category: "id",
    question: "Why do I need to verify my ID?",
    answer:
      "ID verification helps the hotel confirm that bookings and chat requests are made by a real guest. You need an approved ID before using hotel FAQ bot support.",
    tags: ["id", "verification", "bot"],
  },
  {
    id: "upload-id",
    category: "id",
    question: "How do I upload my ID?",
    answer:
      "Go to Hotel Profile, find the ID verification section, give consent, then upload a clear JPG, JPEG, PNG, WEBP, or PDF file of your valid government ID.",
    tags: ["upload", "government id", "profile"],
  },
  {
    id: "id-pending",
    category: "id",
    question: "What does pending ID verification mean?",
    answer:
      "Pending means your uploaded ID is waiting for admin review. You cannot upload another ID while it is pending. If the admin rejects it, you may upload again after the cooldown period.",
    tags: ["pending", "admin review", "reupload"],
  },
  {
    id: "book-hotel-room",
    category: "booking",
    question: "How do I book a hotel or condo room?",
    answer:
      "Open Hotel & Condo, choose a room package, select duration, date, time slot, pax, and payment method, then upload proof of payment before submitting your booking.",
    tags: ["hotel", "condo", "room", "proof"],
  },
  {
    id: "book-resort",
    category: "booking",
    question: "How do I book a resort or venue?",
    answer:
      "Open Resort & Venue, choose your venue, select the available duration and time slot, enter the pax count, choose payment method, upload proof of payment, and submit the booking.",
    tags: ["resort", "venue", "lorenzo"],
  },
  {
    id: "book-event",
    category: "booking",
    question: "How do I book an event package?",
    answer:
      "Open Event Package, choose the package, venue, capacity variation, event date, time slot, food menu choices, payment method, and proof of payment, then submit your event booking.",
    tags: ["event", "wedding", "debut", "birthday", "corporate"],
  },
  {
    id: "booking-status",
    category: "booking",
    question: "What do the booking statuses mean?",
    answer:
      "Pending means your booking is waiting for admin approval. Confirmed means the admin approved it. Cancelled means the booking was rejected, cancelled, or no longer active.",
    tags: ["pending", "confirmed", "cancelled", "status"],
  },
  {
    id: "time-slot-unavailable",
    category: "booking",
    question: "Why is my selected time slot unavailable?",
    answer:
      "A time slot can become unavailable when another pending or confirmed booking overlaps with it. Some booking types also require at least a 1-hour gap before or after another booking.",
    tags: ["unavailable", "conflict", "time slot", "1 hour gap"],
  },
  {
    id: "dynamic-pricing",
    category: "booking",
    question: "Why did my booking price increase?",
    answer:
      "Prices may increase because of seasonal dates, weekends, monthly confirmed booking demand, or additional pax charges beyond the base capacity.",
    tags: ["price", "dynamic", "weekend", "seasonal", "additional pax"],
  },
  {
    id: "payment-methods",
    category: "payment",
    question: "What payment methods are accepted?",
    answer:
      "The hotel booking forms accept Bank Transfer and GCash. You must upload a valid proof of payment image or PDF before submitting a booking.",
    tags: ["gcash", "bank transfer", "proof of payment"],
  },
  {
    id: "proof-required",
    category: "payment",
    question: "Why is proof of payment required?",
    answer:
      "Proof of payment is required so the admin can validate your booking request before approving it. Accepted proof files are usually images or PDFs within the file size limit.",
    tags: ["proof", "receipt", "payment"],
  },
  {
    id: "downpayment",
    category: "payment",
    question: "Can I pay a down payment?",
    answer:
      "Some summary pages allow a down payment option. If you select it, the system shows the amount to pay now and the remaining balance. Always keep your payment proof for admin checking.",
    tags: ["down payment", "balance", "summary"],
  },
  {
    id: "request-reschedule",
    category: "reschedule",
    question: "How do I request a reschedule?",
    answer:
      "For reschedule guidance, ask the Hotel FAQ Bot or read this FAQ page. For an official reschedule request, use the Contact Us page or call the hotel with your Booking ID, requested date/time, and reason.",
    tags: ["reschedule", "booking id", "bot"],
  },
  {
    id: "request-cancel",
    category: "reschedule",
    question: "How do I request a cancellation?",
    answer:
      "For cancellation guidance, ask the Hotel FAQ Bot or read this FAQ page. For an official cancellation request, use the Contact Us page or call the hotel with your Booking ID and cancellation reason.",
    tags: ["cancel", "cancellation", "booking id"],
  },
  {
    id: "bot-basic-help",
    category: "bot",
    question: "What can the Hotel FAQ Bot answer?",
    answer:
      "The Hotel FAQ Bot answers basic questions about bookings, payment, ID verification, password reset, booking status, prices, recommendations, and FAQs. It does not submit official requests.",
    tags: ["reply", "working hours", "bot"],
  },
  {
    id: "bot-not-official-request",
    category: "bot",
    question: "Can the FAQ bot approve, cancel, or reschedule my booking?",
    answer:
      "No. The FAQ bot only gives basic answers. For official booking changes, contact the hotel through the Contact Us page or the listed phone/email details.",
    tags: ["locked", "concern", "message box"],
  },
  {
    id: "bot-id-help",
    category: "bot",
    question: "Can the FAQ bot help with ID verification questions?",
    answer:
      "Yes. The FAQ bot can explain ID upload rules, pending review, rejected IDs, and basic verification steps. Final approval still depends on admin review.",
    tags: ["verified", "id", "support"],
  },
];

const QUICK_ACTIONS = [
  {
    title: "Hotel FAQ Bot",
    description: "Ask basic hotel booking, payment, ID, and account questions.",
    button: "OPEN HELP BOT",
    route: "/hotel-faqs",
  },
  {
    title: "My Profile",
    description: "Check your account, ID status, and profile details.",
    button: "GO TO PROFILE",
    route: "/hotel-profile",
  },
  {
    title: "Book Again",
    description: "Browse hotel, resort, and event services.",
    button: "VIEW SERVICES",
    route: "/hotel-resort",
  },
];

function normalizeText(value = "") {
  return String(value || "").toLowerCase().trim();
}

function getCategoryLabel(categoryId = "") {
  return FAQ_CATEGORIES.find((item) => item.id === categoryId)?.label || "FAQ";
}

function HighlightText({ text, query }) {
  const original = String(text || "");
  const search = String(query || "").trim();

  if (!search) return original;

  const index = original.toLowerCase().indexOf(search.toLowerCase());
  if (index === -1) return original;

  const before = original.slice(0, index);
  const match = original.slice(index, index + search.length);
  const after = original.slice(index + search.length);

  return (
    <>
      {before}
      <mark className="rounded bg-yellow-200 px-1 text-[#2f4d36]">{match}</mark>
      {after}
    </>
  );
}

export default function HotelFaqs() {
  const navigate = useNavigate();

  const [activeCategory, setActiveCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [openId, setOpenId] = useState(FAQS[0]?.id || "");

  const filteredFaqs = useMemo(() => {
    const search = normalizeText(searchTerm);

    return FAQS.filter((faq) => {
      const categoryMatch = activeCategory === "all" || faq.category === activeCategory;

      if (!categoryMatch) return false;
      if (!search) return true;

      const searchableText = [
        faq.question,
        faq.answer,
        getCategoryLabel(faq.category),
        ...(faq.tags || []),
      ]
        .join(" ")
        .toLowerCase();

      return searchableText.includes(search);
    });
  }, [activeCategory, searchTerm]);

  const popularFaqs = FAQS.filter((faq) =>
    ["id-required", "time-slot-unavailable", "request-reschedule", "chat-locked"].includes(faq.id)
  );

  const clearFilters = () => {
    setActiveCategory("all");
    setSearchTerm("");
    setOpenId(FAQS[0]?.id || "");
  };

  const handleCategoryClick = (categoryId) => {
    setActiveCategory(categoryId);
    const firstMatch = FAQS.find((faq) => categoryId === "all" || faq.category === categoryId);
    setOpenId(firstMatch?.id || "");
  };

  return (
    <div className="min-h-screen bg-[#f6f6f1] text-[#2f4d36]">
      <header className="border-b border-black/10 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-5 px-5 py-7 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="mb-4 rounded-full border border-[#355240]/20 bg-white px-4 py-2 text-xs font-extrabold text-[#355240] hover:bg-[#355240]/5"
            >
              ← BACK
            </button>

            <p className="text-xs font-extrabold uppercase tracking-[0.25em] text-[#6f806d]">
              Hotel Help Center
            </p>
            <h1 className="mt-2 text-4xl font-extrabold tracking-tight text-[#355240] sm:text-5xl">
              Frequently Asked Questions
            </h1>
            <p className="mt-3 max-w-2xl text-sm font-semibold leading-6 text-[#355240]/70">
              Find answers about hotel accounts, bookings, payments, ID verification,
              rescheduling, cancellation requests, and FAQ bot support.
            </p>
          </div>

          <div className="rounded-3xl border border-[#355240]/15 bg-[#355240] p-5 text-white shadow-sm lg:w-[330px]">
            <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-white/60">
              Need quick answers?
            </p>
            <h2 className="mt-2 text-2xl font-extrabold">Hotel FAQ Bot</h2>
            <p className="mt-2 text-sm font-semibold leading-6 text-white/70">
              For basic booking, payment, ID, and account questions, open the Hotel FAQ Bot. For official requests, use Contact Us.
            </p>
            <button
              type="button"
              onClick={() => setSearchTerm("help bot") || setActiveCategory("bot")}
              className="mt-4 w-full rounded-2xl bg-white px-5 py-3 text-sm font-extrabold text-[#355240] hover:opacity-90"
            >
              OPEN HELP BOT
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-5 py-7">
        <section className="grid gap-4 lg:grid-cols-[1fr_340px]">
          <div className="rounded-3xl border border-black/10 bg-white p-5 shadow-sm">
            <label className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#6f806d]">
              Search FAQs
            </label>
            <div className="mt-3 flex flex-col gap-3 sm:flex-row">
              <input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by keyword, like payment, ID, reschedule..."
                className="h-12 flex-1 rounded-2xl border border-black/10 bg-[#fafaf7] px-4 text-sm font-semibold text-[#2f4d36] outline-none focus:border-[#355240]"
              />

              <button
                type="button"
                onClick={clearFilters}
                className="rounded-2xl border border-[#355240]/20 bg-white px-5 py-3 text-xs font-extrabold text-[#355240] hover:bg-[#355240]/5"
              >
                CLEAR
              </button>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {FAQ_CATEGORIES.map((category) => {
                const isActive = activeCategory === category.id;

                return (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => handleCategoryClick(category.id)}
                    className={`rounded-full px-4 py-2 text-xs font-extrabold transition ${
                      isActive
                        ? "bg-[#355240] text-white shadow-sm"
                        : "border border-black/10 bg-[#fafaf7] text-[#355240] hover:bg-[#355240]/5"
                    }`}
                  >
                    {category.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="rounded-3xl border border-black/10 bg-white p-5 shadow-sm">
            <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#6f806d]">
              Quick Actions
            </p>
            <div className="mt-4 space-y-3">
              {QUICK_ACTIONS.map((action) => (
                <button
                  key={action.route}
                  type="button"
                  onClick={() => navigate(action.route)}
                  className="w-full rounded-2xl border border-black/10 bg-[#fafaf7] p-4 text-left transition hover:-translate-y-0.5 hover:border-[#355240]/35 hover:bg-[#355240]/5"
                >
                  <p className="text-sm font-extrabold text-[#355240]">{action.title}</p>
                  <p className="mt-1 text-xs font-semibold leading-5 text-black/45">
                    {action.description}
                  </p>
                  <p className="mt-3 text-xs font-extrabold text-[#355240]">
                    {action.button} →
                  </p>
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-6 grid gap-6 lg:grid-cols-[300px_1fr]">
          <aside className="rounded-3xl border border-black/10 bg-white p-5 shadow-sm lg:sticky lg:top-5 lg:h-fit">
            <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#6f806d]">
              Popular Questions
            </p>
            <div className="mt-4 space-y-2">
              {popularFaqs.map((faq) => (
                <button
                  key={faq.id}
                  type="button"
                  onClick={() => {
                    setActiveCategory("all");
                    setSearchTerm("");
                    setOpenId(faq.id);
                  }}
                  className={`w-full rounded-2xl px-4 py-3 text-left text-sm font-bold transition ${
                    openId === faq.id
                      ? "bg-[#355240] text-white"
                      : "bg-[#fafaf7] text-[#355240] hover:bg-[#355240]/5"
                  }`}
                >
                  {faq.question}
                </button>
              ))}
            </div>

            <div className="mt-5 rounded-2xl bg-[#355240]/10 p-4">
              <p className="text-sm font-extrabold text-[#355240]">
                Tip for faster support
              </p>
              <p className="mt-2 text-xs font-semibold leading-5 text-black/50">
                When asking about rescheduling or cancellation, include your Booking ID,
                service type, date, time, and reason.
              </p>
            </div>
          </aside>

          <section className="rounded-3xl border border-black/10 bg-white p-5 shadow-sm">
            <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#6f806d]">
                  Results
                </p>
                <h2 className="text-2xl font-extrabold text-[#355240]">
                  {filteredFaqs.length} question{filteredFaqs.length === 1 ? "" : "s"} found
                </h2>
              </div>

              <p className="rounded-full bg-[#355240]/10 px-4 py-2 text-xs font-extrabold text-[#355240]">
                Category: {getCategoryLabel(activeCategory)}
              </p>
            </div>

            {filteredFaqs.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-[#355240]/25 bg-[#fafaf7] p-8 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#355240]/10 text-3xl">
                  🔎
                </div>
                <h3 className="mt-4 text-2xl font-extrabold text-[#355240]">
                  No FAQ matched your search
                </h3>
                <p className="mx-auto mt-2 max-w-md text-sm font-semibold leading-6 text-black/45">
                  Try a different keyword, clear your filters, or open the Hotel FAQ Bot for basic guidance.
                </p>
                <div className="mt-5 flex flex-col justify-center gap-3 sm:flex-row">
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="rounded-full border border-[#355240]/20 bg-white px-5 py-2.5 text-xs font-extrabold text-[#355240] hover:bg-[#355240]/5"
                  >
                    CLEAR FILTERS
                  </button>
                  <button
                    type="button"
                    onClick={() => setSearchTerm("help bot") || setActiveCategory("bot")}
                    className="rounded-full bg-[#355240] px-5 py-2.5 text-xs font-extrabold text-white hover:opacity-90"
                  >
                    OPEN HELP BOT
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredFaqs.map((faq) => {
                  const isOpen = openId === faq.id;

                  return (
                    <article
                      key={faq.id}
                      className="overflow-hidden rounded-3xl border border-black/10 bg-[#fafaf7]"
                    >
                      <button
                        type="button"
                        onClick={() => setOpenId(isOpen ? "" : faq.id)}
                        className="flex w-full items-start justify-between gap-4 px-5 py-4 text-left"
                      >
                        <div>
                          <span className="rounded-full bg-[#355240]/10 px-3 py-1 text-[10px] font-extrabold uppercase tracking-wide text-[#355240]">
                            {getCategoryLabel(faq.category)}
                          </span>
                          <h3 className="mt-3 text-base font-extrabold text-[#355240] sm:text-lg">
                            <HighlightText text={faq.question} query={searchTerm} />
                          </h3>
                        </div>

                        <span
                          className={`mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-lg font-extrabold transition ${
                            isOpen ? "bg-[#355240] text-white" : "bg-white text-[#355240]"
                          }`}
                        >
                          {isOpen ? "−" : "+"}
                        </span>
                      </button>

                      {isOpen ? (
                        <div className="border-t border-black/10 bg-white px-5 py-4">
                          <p className="text-sm font-semibold leading-7 text-black/60">
                            <HighlightText text={faq.answer} query={searchTerm} />
                          </p>

                          {faq.tags?.length ? (
                            <div className="mt-4 flex flex-wrap gap-2">
                              {faq.tags.map((tag) => (
                                <span
                                  key={tag}
                                  className="rounded-full bg-[#f6f6f1] px-3 py-1 text-[11px] font-bold text-black/45"
                                >
                                  #{tag}
                                </span>
                              ))}
                            </div>
                          ) : null}
                        </div>
                      ) : null}
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        </section>
      </main>
      <HotelFaqBot />
    </div>
  );
}
