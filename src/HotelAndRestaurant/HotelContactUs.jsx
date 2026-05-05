// HotelContactUs.jsx
import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import HotelFaqBot from "./HotelFaqBot";

const HotelContactUs = () => {
  const navigate = useNavigate();

  const GREEN = "#2F5E3A";
  const CARD_BG = "#F3F1E8";

  // ✅ Profile nav logic (same behavior as your other pages)
  const goToProfile = () => {
    const token = localStorage.getItem("token") || localStorage.getItem("hotelToken");
    if (token) navigate("/hotel-profile");
    else navigate("/hotel-login");
  };

  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [status, setStatus] = useState({ type: "", text: "" });

  const setField = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const canSend = useMemo(() => {
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim());
    return (
      form.name.trim().length >= 2 &&
      emailOk &&
      form.subject.trim().length >= 2 &&
      form.message.trim().length >= 5
    );
  }, [form]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setStatus({ type: "", text: "" });

    if (!canSend) {
      setStatus({ type: "error", text: "Please complete the form correctly." });
      return;
    }

    // 🔧 If you have an API endpoint, call it here.
    // For now, we just show a success message to match the UI.
    setStatus({ type: "success", text: "Message sent successfully!" });
    setForm({ name: "", email: "", subject: "", message: "" });
  };

  const Input = ({ label, placeholder, value, onChange, type = "text" }) => (
    <div>
      <label className="block text-lg font-medium mb-2" style={{ color: GREEN }}>
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full rounded-2xl px-5 py-3 bg-transparent focus:outline-none focus:ring-2"
        style={{
          border: `1px solid ${GREEN}55`,
          color: GREEN,
        }}
      />
    </div>
  );

  return (
    <div className="min-h-screen bg-white">
      {/* TOP BAR */}
      <header className="bg-white">
        <div className="mx-auto max-w-6xl px-6 pt-10 pb-6 flex items-start justify-between">
          <h1 className="text-6xl md:text-7xl font-extrabold leading-none" style={{ color: GREEN }}>
            Contact Us
          </h1>

          <nav className="flex gap-10 pt-3">
            <button
              onClick={() => navigate("/hotel-resort")}
              className="text-sm font-semibold tracking-wide hover:opacity-80"
              style={{ color: GREEN }}
            >
              HOME
            </button>
            <button
              onClick={() => navigate("/hotel-contact-us")}
              className="text-sm font-semibold tracking-wide hover:opacity-80"
              style={{ color: GREEN }}
            >
              CONTACT
            </button>
            <button
              onClick={() => navigate("/hotel-faqs")}
              className="text-sm font-semibold tracking-wide hover:opacity-80"
              style={{ color: GREEN }}
            >
              FAQS
            </button>
            <button
              onClick={goToProfile}
              className="text-sm font-semibold tracking-wide hover:opacity-80"
              style={{ color: GREEN }}
            >
              {localStorage.getItem("token") || localStorage.getItem("hotelToken") ? "PROFILE" : "SIGN IN"}
            </button>
          </nav>
        </div>
      </header>

      {/* CONTENT */}
      <main className="mx-auto max-w-6xl px-6 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
          {/* LEFT CONTACT CARD */}
          <div
            className="rounded-2xl shadow-[0_10px_24px_rgba(0,0,0,0.12)] border border-black/5 p-8"
            style={{ backgroundColor: CARD_BG }}
          >
            <div className="space-y-8 text-sm text-gray-700">
              {/* Location */}
              <div className="flex gap-4">
                <div className="mt-1 text-[#2F5E3A]">
                  <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 21s7-4.5 7-11a7 7 0 1 0-14 0c0 6.5 7 11 7 11z" />
                    <circle cx="12" cy="10" r="2.5" />
                  </svg>
                </div>
                <p className="leading-relaxed">
                  Eco Trend, San Nicolas Bacoor Cavite
                </p>
              </div>

              {/* Phone */}
              <div className="flex gap-4">
                <div className="mt-1 text-[#2F5E3A]">
                  <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M22 16.92v3a2 2 0 0 1-2.18 2A19.8 19.8 0 0 1 3 5.18 2 2 0 0 1 5 3h3a2 2 0 0 1 2 1.72c.12.9.33 1.77.62 2.6a2 2 0 0 1-.45 2.11L9 10a16 16 0 0 0 5 5l.57-.17a2 2 0 0 1 2.11.45c.83.29 1.7.5 2.6.62A2 2 0 0 1 22 16.92z" />
                  </svg>
                </div>
                <p className="leading-relaxed">
                  09338699988 / 09064191405
                </p>
              </div>

              {/* Email */}
              <div className="flex gap-4">
                <div className="mt-1 text-[#2F5E3A]">
                  <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 4h16v16H4V4z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="m22 6-10 7L2 6" />
                  </svg>
                </div>
                <p className="leading-relaxed">
                  lorenzoeventandvenue@gmail.com
                </p>
              </div>

              {/* Hours */}
              <div className="flex gap-4">
                <div className="mt-1 text-[#2F5E3A]">
                  <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="9" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 7v6l3 2" />
                  </svg>
                </div>
                <div className="leading-relaxed">
                  <p>Monday - Friday: 8:00 AM - 5:00 PM</p>
                  <p>Saturday: 9:00 AM - 12:00 PM</p>
                  <p>Sunday: Closed</p>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT FORM CARD */}
          <div
            className="rounded-2xl shadow-[0_10px_24px_rgba(0,0,0,0.12)] border border-black/5 p-10"
            style={{ backgroundColor: CARD_BG }}
          >
            <form onSubmit={onSubmit} className="space-y-7">
              <Input
                label="Your name"
                placeholder="Enter your name"
                value={form.name}
                onChange={(e) => setField("name", e.target.value)}
              />

              <Input
                label="Email Address"
                placeholder="Enter your email"
                type="email"
                value={form.email}
                onChange={(e) => setField("email", e.target.value)}
              />

              <Input
                label="Subject"
                placeholder="Rescheduling of event"
                value={form.subject}
                onChange={(e) => setField("subject", e.target.value)}
              />

              <div>
                <label className="block text-lg font-medium mb-2" style={{ color: GREEN }}>
                  Message
                </label>
                <textarea
                  value={form.message}
                  onChange={(e) => setField("message", e.target.value)}
                  placeholder="Type here"
                  rows={7}
                  className="w-full rounded-2xl px-5 py-3 bg-transparent focus:outline-none focus:ring-2 resize-none"
                  style={{
                    border: `1px solid ${GREEN}55`,
                    color: GREEN,
                  }}
                />
              </div>

              {status.text && (
                <p
                  className={`text-sm font-semibold ${
                    status.type === "success" ? "text-emerald-700" : "text-red-600"
                  }`}
                >
                  {status.text}
                </p>
              )}

              <div className="pt-2 flex justify-center">
                <button
                  type="submit"
                  disabled={!canSend}
                  className="rounded-full px-14 py-3 text-white font-semibold shadow-sm hover:opacity-95 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ backgroundColor: GREEN }}
                >
                  Send Message
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
      <HotelFaqBot />
    </div>
  );
};

export default HotelContactUs;