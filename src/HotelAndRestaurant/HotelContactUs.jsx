// HotelContactUs.jsx
import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import HotelFaqBot from "./HotelFaqBot";
import HotelHeader from "./HotelHeader";

const contactDetails = [
  {
    title: "Visit us",
    value: "Eco Trend, San Nicolas, Bacoor, Cavite",
    icon: (
      <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21s7-4.5 7-11a7 7 0 1 0-14 0c0 6.5 7 11 7 11z" />
        <circle cx="12" cy="10" r="2.5" />
      </svg>
    ),
  },
  {
    title: "Call us",
    value: "09338699988 / 09064191405",
    icon: (
      <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M22 16.92v3a2 2 0 0 1-2.18 2A19.8 19.8 0 0 1 3 5.18 2 2 0 0 1 5 3h3a2 2 0 0 1 2 1.72c.12.9.33 1.77.62 2.6a2 2 0 0 1-.45 2.11L9 10a16 16 0 0 0 5 5l.57-.17a2 2 0 0 1 2.11.45c.83.29 1.7.5 2.6.62A2 2 0 0 1 22 16.92z" />
      </svg>
    ),
  },
  {
    title: "Email us",
    value: "lorenzoeventandvenue@gmail.com",
    icon: (
      <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path strokeLinecap="round" strokeLinejoin="round" d="m3 7 9 6 9-6" />
      </svg>
    ),
  },
  {
    title: "Office hours",
    value: "Mon - Fri, 8:00 AM - 5:00 PM\nSaturday, 9:00 AM - 12:00 PM\nSunday, Closed",
    icon: (
      <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="9" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 7v6l3 2" />
      </svg>
    ),
  },
];

const inquiryTypes = ["Room Booking", "Resort Venue", "Event Package", "Payment Concern", "Other Concern"];

const HotelContactUs = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    inquiryType: "",
    subject: "",
    message: "",
  });

  const [status, setStatus] = useState({ type: "", text: "" });

  const setField = (key, value) => {
    setForm((previous) => ({ ...previous, [key]: value }));
  };

  const canSend = useMemo(() => {
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim());

    return (
      form.name.trim().length >= 2 &&
      emailOk &&
      form.inquiryType.trim() &&
      form.subject.trim().length >= 2 &&
      form.message.trim().length >= 5
    );
  }, [form]);

  const onSubmit = (event) => {
    event.preventDefault();
    setStatus({ type: "", text: "" });

    if (!canSend) {
      setStatus({
        type: "error",
        text: "Please complete all fields with valid information.",
      });
      return;
    }

    // Connect your API here when the backend endpoint is ready.
    setStatus({
      type: "success",
      text: "Your message has been prepared successfully. Our team will contact you soon.",
    });

    setForm({
      name: "",
      email: "",
      inquiryType: "",
      subject: "",
      message: "",
    });
  };

  return (
    <div className="min-h-screen bg-[#f8f6ee] text-[#24382b]">
      <HotelHeader />

      <main className="overflow-hidden">
        <section className="relative isolate px-5 py-10 sm:px-8 lg:px-12 lg:py-14">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,rgba(56,85,65,0.18),transparent_34%),linear-gradient(180deg,#ffffff_0%,#f8f6ee_78%)]" />
          <div className="absolute right-[-120px] top-16 -z-10 h-[280px] w-[280px] rounded-full bg-[#385541]/10 blur-3xl" />
          <div className="absolute bottom-[-100px] left-[-120px] -z-10 h-[260px] w-[260px] rounded-full bg-[#bca46b]/20 blur-3xl" />

          <div className="mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="max-w-2xl">
              <p className="mb-4 inline-flex rounded-full border border-[#385541]/15 bg-white/80 px-4 py-2 text-xs font-bold uppercase tracking-[0.28em] text-[#385541] shadow-sm">
                Contact Lumispire
              </p>

              <h1 className="font-['Montserrat',sans-serif] text-4xl font-black leading-tight text-[#385541] sm:text-5xl lg:text-6xl">
                Let us help plan your stay, event, or resort visit.
              </h1>

              <p className="mt-5 max-w-xl text-base leading-8 text-[#59685e] sm:text-lg">
                Send us your questions, booking concerns, event inquiries, or special requests. Our team will assist you with the best available options.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => navigate("/hotel-resort")}
                  className="rounded-full bg-[#385541] px-6 py-3 text-sm font-bold text-white shadow-[0_14px_30px_rgba(56,85,65,0.25)] transition hover:bg-[#2d4435]"
                >
                  Explore Rooms
                </button>
                <button
                  type="button"
                  onClick={() => navigate("/hotel-faqs")}
                  className="rounded-full border border-[#385541]/20 bg-white px-6 py-3 text-sm font-bold text-[#385541] shadow-sm transition hover:bg-[#385541]/10"
                >
                  Read FAQs
                </button>
              </div>
            </div>

            <div className="rounded-[2rem] border border-white/70 bg-white/80 p-3 shadow-[0_24px_70px_rgba(36,56,43,0.16)] backdrop-blur">
              <div className="rounded-[1.5rem] bg-[#385541] p-6 text-white sm:p-8">
                <p className="text-sm font-bold uppercase tracking-[0.28em] text-white/70">
                  Need immediate assistance?
                </p>
                <h2 className="mt-4 font-['Montserrat',sans-serif] text-2xl font-black sm:text-3xl">
                  Reach our front desk directly.
                </h2>
                <p className="mt-4 max-w-xl text-sm leading-7 text-white/80">
                  For urgent booking updates, payment verification, or same-day concerns, calling is the fastest way to reach us.
                </p>

                <div className="mt-7 grid gap-3 sm:grid-cols-2">
                  <a
                    href="tel:09338699988"
                    className="rounded-2xl bg-white px-5 py-4 text-sm font-bold text-[#385541] transition hover:bg-[#f8f6ee]"
                  >
                    Call 09338699988
                  </a>
                  <a
                    href="mailto:lorenzoeventandvenue@gmail.com"
                    className="rounded-2xl border border-white/20 bg-white/10 px-5 py-4 text-sm font-bold text-white transition hover:bg-white/15"
                  >
                    Send Email
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="px-5 pb-16 sm:px-8 lg:px-12">
          <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[0.85fr_1.15fr]">
            <aside className="space-y-4">
              {contactDetails.map((item) => (
                <article
                  key={item.title}
                  className="rounded-3xl border border-[#385541]/10 bg-white p-5 shadow-[0_14px_35px_rgba(36,56,43,0.08)]"
                >
                  <div className="flex gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#385541]/10 text-[#385541]">
                      {item.icon}
                    </div>
                    <div>
                      <h3 className="font-['Montserrat',sans-serif] text-sm font-extrabold uppercase tracking-[0.18em] text-[#385541]">
                        {item.title}
                      </h3>
                      <p className="mt-2 whitespace-pre-line text-sm leading-7 text-[#65736a]">
                        {item.value}
                      </p>
                    </div>
                  </div>
                </article>
              ))}
            </aside>

            <section className="rounded-[2rem] border border-[#385541]/10 bg-white p-5 shadow-[0_18px_50px_rgba(36,56,43,0.1)] sm:p-8">
              <div className="mb-7">
                <p className="text-sm font-bold uppercase tracking-[0.24em] text-[#b09658]">
                  Message Form
                </p>
                <h2 className="mt-2 font-['Montserrat',sans-serif] text-2xl font-black text-[#385541] sm:text-3xl">
                  Tell us how we can help.
                </h2>
                <p className="mt-3 text-sm leading-7 text-[#65736a]">
                  Complete the form below and include enough details so our team can respond accurately.
                </p>
              </div>

              <form onSubmit={onSubmit} className="space-y-5">
                <div className="grid gap-5 md:grid-cols-2">
                  <FormField
                    label="Full name"
                    placeholder="Enter your full name"
                    value={form.name}
                    onChange={(event) => setField("name", event.target.value)}
                  />

                  <FormField
                    label="Email address"
                    placeholder="Enter your email"
                    type="email"
                    value={form.email}
                    onChange={(event) => setField("email", event.target.value)}
                  />
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-bold text-[#385541]">
                      Inquiry type
                    </label>
                    <select
                      value={form.inquiryType}
                      onChange={(event) => setField("inquiryType", event.target.value)}
                      className="w-full rounded-2xl border border-[#385541]/15 bg-[#f8f6ee] px-5 py-3 text-sm font-semibold text-[#385541] outline-none transition focus:border-[#385541] focus:ring-4 focus:ring-[#385541]/10"
                    >
                      <option value="">Select inquiry type</option>
                      {inquiryTypes.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>

                  <FormField
                    label="Subject"
                    placeholder="Example: Reschedule my event"
                    value={form.subject}
                    onChange={(event) => setField("subject", event.target.value)}
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold text-[#385541]">
                    Message
                  </label>
                  <textarea
                    value={form.message}
                    onChange={(event) => setField("message", event.target.value)}
                    placeholder="Write your message here..."
                    rows={7}
                    className="w-full resize-none rounded-2xl border border-[#385541]/15 bg-[#f8f6ee] px-5 py-4 text-sm font-medium text-[#385541] outline-none transition placeholder:text-[#8a968d] focus:border-[#385541] focus:ring-4 focus:ring-[#385541]/10"
                  />
                </div>

                {status.text ? (
                  <div
                    className={`rounded-2xl px-5 py-4 text-sm font-bold ${
                      status.type === "success"
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-red-50 text-red-600"
                    }`}
                  >
                    {status.text}
                  </div>
                ) : null}

                <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-xs leading-6 text-[#7a877e]">
                    Make sure your email is correct so we can reply to your concern.
                  </p>
                  <button
                    type="submit"
                    disabled={!canSend}
                    className="rounded-full bg-[#385541] px-8 py-3 text-sm font-bold text-white shadow-[0_14px_30px_rgba(56,85,65,0.22)] transition hover:bg-[#2d4435] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Send Message
                  </button>
                </div>
              </form>
            </section>
          </div>
        </section>
      </main>

      <HotelFaqBot />
    </div>
  );
};

const FormField = ({ label, placeholder, value, onChange, type = "text" }) => {
  return (
    <div>
      <label className="mb-2 block text-sm font-bold text-[#385541]">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full rounded-2xl border border-[#385541]/15 bg-[#f8f6ee] px-5 py-3 text-sm font-medium text-[#385541] outline-none transition placeholder:text-[#8a968d] focus:border-[#385541] focus:ring-4 focus:ring-[#385541]/10"
      />
    </div>
  );
};

export default HotelContactUs;
