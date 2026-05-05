import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import ChatbotWidget from "./ChatbotWidget";

const LOGO = "/LTCLogo.jpg";

const BRAND = "#355E3B";
const ACCENT = "#1F8F5A";
const CONTACT_ROUTE = "/contact";

const fontMontserrat = { fontFamily: "'Montserrat', sans-serif" };
const fontPontano = { fontFamily: "'Pontano Sans', sans-serif" };
const fontActor = { fontFamily: "'Actor', sans-serif" };
const fontPoppins = { fontFamily: "'Poppins', sans-serif" };

const Contact = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", message: "" });

  const navigate = useNavigate();

  const goTo = (path) => {
    navigate(path);
    setIsSidebarOpen(false);
  };

  const MAPS_LINK = "https://maps.app.goo.gl/F7xcQs3L9EgGhChJ8";

  const MAP_EMBED_URL =
    "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3861.647939883225!2d120.99862151054666!3d14.56211427795927!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3397c991472da61b%3A0x3a4930acd0ee798d!2s5441%20Curie%20St%2C%20Makati%20City%2C%201235%20Metro%20Manila!5e0!3m2!1sen!2sph!4v1772554535835!5m2!1sen!2sph";

  const navLinks = [
    { label: "HOME", to: "/" },
    { label: "ABOUT US", to: "/about-us" },
    { label: "TEAM", to: "/team" },
    { label: "CONTACT", to: CONTACT_ROUTE },
  ];

  const onChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const onSubmit = (e) => {
    e.preventDefault();
    alert("Message sent!");
    setForm({ name: "", email: "", message: "" });
  };

  const Row = ({ icon, title, children }) => (
    <div className="flex gap-4">
      <div className="mt-0.5 text-[#355E3B]">{icon}</div>
      <div>
        <p className="text-[15px] font-bold text-gray-900 md:text-[16px]" style={fontMontserrat}>
          {title}
        </p>
        <div
          className="mt-1 text-sm leading-relaxed text-gray-600 md:text-[15px]"
          style={fontPontano}
        >
          {children}
        </div>
      </div>
    </div>
  );

  const IconPin = () => (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 21s7-4.5 7-11a7 7 0 1 0-14 0c0 6.5 7 11 7 11z"
      />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  );

  const IconBuilding = () => (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 21V3h10v18" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M14 21V7h6v14" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h2M8 11h2M8 15h2" />
    </svg>
  );

  const IconPhone = () => (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M22 16.9v3a2 2 0 0 1-2.2 2c-9.9-.9-17.8-8.8-18.7-18.7A2 2 0 0 1 3.1 1h3a2 2 0 0 1 2 1.7c.1.9.3 1.8.6 2.7a2 2 0 0 1-.5 2.1L7 9c1.5 3 4 5.5 7 7l1.5-1.2a2 2 0 0 1 2.1-.5c.9.3 1.8.5 2.7.6A2 2 0 0 1 22 16.9z"
      />
    </svg>
  );

  const IconMail = () => (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 4h16v16H4V4z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="m4 7 8 6 8-6" />
    </svg>
  );

  const IconClock = () => (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 22a10 10 0 1 0-10-10 10 10 0 0 0 10 10z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2" />
    </svg>
  );

  return (
    <div className="min-h-screen bg-white text-gray-900" style={fontPontano}>
      <header className="fixed left-0 right-0 top-0 z-50 border-b border-white/10 bg-[#355E3B] text-white shadow-md">
        <div className="mx-auto flex h-[74px] max-w-[1600px] items-center justify-between px-4 md:h-[84px] md:px-6 lg:h-[88px] lg:px-8">
          <div className="flex min-w-0 items-center gap-2 md:gap-3 lg:gap-4">
            <img
              src={LOGO}
              alt="LTC Logo"
              className="h-10 w-10 shrink-0 rounded-full bg-white object-cover md:h-[50px] md:w-[50px] lg:h-[56px] lg:w-[56px]"
            />

            <div className="min-w-0 leading-tight">
              <h1
                className="truncate text-[16px] font-extrabold uppercase tracking-tight md:text-[24px] lg:text-[28px]"
                style={fontMontserrat}
              >
                LTC GROUP OF COMPANIES
                <span className="align-top text-[8px] md:text-[10px] lg:text-[11px]">®</span>
              </h1>
              <p
                className="truncate text-[8px] text-white/90 md:text-[12px] lg:text-[13px]"
                style={fontPontano}
              >
                Providing quality services and training solutions.
              </p>
            </div>
          </div>

          <nav className="hidden items-center gap-5 md:flex lg:gap-6" style={fontPoppins}>
            {navLinks.map((link) => {
              const isActive = link.to === CONTACT_ROUTE;
              return (
                <button
                  key={link.label}
                  onClick={() => goTo(link.to)}
                  className={`text-[12px] font-medium uppercase tracking-tight transition ${
                    isActive ? "text-white" : "text-white/90 hover:text-white"
                  }`}
                >
                  {link.label}
                </button>
              );
            })}
          </nav>

          <button
            type="button"
            className="rounded-md p-2 hover:bg-white/10 md:hidden"
            onClick={() => setIsSidebarOpen(true)}
            aria-label="Open menu"
          >
            <svg
              viewBox="0 0 24 24"
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </header>

      {isSidebarOpen && (
        <div className="fixed inset-0 z-[60] md:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setIsSidebarOpen(false)} />
          <div className="absolute right-0 top-0 h-full w-[300px] bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b px-4 py-4">
              <p className="text-sm font-bold tracking-widest text-gray-800" style={fontPoppins}>
                MENU
              </p>
              <button
                type="button"
                className="rounded-md p-2 hover:bg-gray-100"
                onClick={() => setIsSidebarOpen(false)}
                aria-label="Close menu"
              >
                <svg
                  viewBox="0 0 24 24"
                  className="h-6 w-6 text-gray-700"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-4" style={fontPoppins}>
              {navLinks.map((link) => {
                const isActive = link.to === CONTACT_ROUTE;
                return (
                  <button
                    key={link.label}
                    onClick={() => goTo(link.to)}
                    className={`mb-2 w-full rounded-lg px-4 py-3 text-left text-sm font-semibold tracking-wide ${
                      isActive ? "bg-[#355E3B] text-white" : "text-gray-800 hover:bg-gray-100"
                    }`}
                  >
                    {link.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <main className="bg-[#F5F5F3] pt-[74px] md:pt-[84px] lg:pt-[88px]">
        <section
          className="relative h-[280px] w-full md:h-[360px]"
          style={{
            backgroundImage:
              "url('https://placehold.co/1600x700/284A35/FFFFFF?text=CONTACT+US')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="absolute inset-0 bg-[#183B29]/55" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#183B29]/20 to-[#183B29]/50" />

          <div className="relative mx-auto flex h-full max-w-[1600px] items-center justify-center px-6 text-center">
            <div className="max-w-4xl">
              <h2
                className="text-[42px] font-extrabold leading-tight text-white md:text-[64px]"
                style={fontMontserrat}
              >
                Contact Us
              </h2>
              <p className="mt-4 text-[17px] text-white/85 md:text-[19px]" style={fontPontano}>
                We're here to help with all your inquiries and needs
              </p>
              <div className="mx-auto mt-6 h-[5px] w-20 rounded-full bg-[#1F8F5A]" />
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-[1600px] px-4 py-12 md:px-8 md:py-14">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            <div className="overflow-hidden rounded-2xl bg-[#F3F3F3] shadow-[0_18px_35px_rgba(0,0,0,0.15)] transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_28px_55px_rgba(0,0,0,0.22)]">
              <div className="h-5 bg-[#355E3B]" />
              <div className="p-7 md:p-8">
                <h3
                  className="text-[34px] font-extrabold leading-tight text-[#355E3B] md:text-[52px]"
                  style={fontMontserrat}
                >
                  Get in Touch
                </h3>

                <div className="mt-7 space-y-6">
                  <Row icon={<IconPin />} title="Main Office">
                    5411 Light Tower Center &amp; Realty Development, Inc., Building II,
                    <br />
                    Curie Street, Palanan, Makati City
                  </Row>

                  <Row icon={<IconBuilding />} title="Training Center">
                    Light Tower Center, 1730 Dian Street, Palanan, Makati City
                  </Row>

                  <Row icon={<IconPhone />} title="Phone Numbers">
                    (02) 8632 6513
                    <br />
                    (02) 7254 0275
                  </Row>

                  <Row icon={<IconMail />} title="Email Contacts">
                    lornacastigador@ltcmultiservices.com
                    <br />
                    lorengladius@ltcmultiservices.com
                    <br />
                    Admin@ltcmultiservices.com
                  </Row>

                  <Row icon={<IconClock />} title="Operating Hours">
                    Monday - Friday : 8:00 AM - 5:00 PM
                    <br />
                    Saturday : 9:00 AM - 12:00 PM
                    <br />
                    Sunday : Closed
                  </Row>
                </div>
              </div>
            </div>

            <div className="overflow-hidden rounded-2xl bg-[#F3F3F3] shadow-[0_18px_35px_rgba(0,0,0,0.15)] transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_28px_55px_rgba(0,0,0,0.22)]">
              <div className="h-5 bg-[#355E3B]" />
              <div className="p-7 md:p-8">
                <h3
                  className="text-center text-[34px] font-extrabold leading-tight text-[#355E3B] md:text-left md:text-[52px]"
                  style={fontMontserrat}
                >
                  Send Us a Message
                </h3>

                <form onSubmit={onSubmit} className="mt-7">
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div>
                      <label
                        className="mb-2 block text-sm font-bold text-[#355E3B]"
                        style={fontMontserrat}
                      >
                        Name
                      </label>
                      <input
                        name="name"
                        value={form.name}
                        onChange={onChange}
                        className="h-12 w-full rounded-md bg-gray-200/90 px-4 outline-none transition focus:ring-2 focus:ring-emerald-300"
                        style={fontPontano}
                      />
                    </div>

                    <div>
                      <label
                        className="mb-2 block text-sm font-bold text-[#355E3B]"
                        style={fontMontserrat}
                      >
                        Email Address
                      </label>
                      <input
                        name="email"
                        value={form.email}
                        onChange={onChange}
                        className="h-12 w-full rounded-md bg-gray-200/90 px-4 outline-none transition focus:ring-2 focus:ring-emerald-300"
                        style={fontPontano}
                      />
                    </div>
                  </div>

                  <div className="mt-6">
                    <label
                      className="mb-2 block text-sm font-bold text-[#355E3B]"
                      style={fontMontserrat}
                    >
                      Your Message
                    </label>
                    <textarea
                      name="message"
                      value={form.message}
                      onChange={onChange}
                      rows={8}
                      className="w-full resize-none rounded-md bg-gray-200/90 px-4 py-3 outline-none transition focus:ring-2 focus:ring-emerald-300"
                      style={fontPontano}
                    />
                  </div>

                  <div className="mt-8 flex justify-center md:justify-start">
                    <button
                      type="submit"
                      className="inline-flex items-center justify-center rounded-full bg-[#355E3B] px-10 py-4 text-[18px] font-semibold text-white transition-all duration-300 hover:-translate-y-1 hover:bg-[#2C5233] hover:shadow-lg md:text-[20px]"
                      style={fontMontserrat}
                    >
                      Send Message
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>

          <section className="mt-14">
            <div className="overflow-hidden rounded-2xl bg-[#F3F3F3] shadow-[0_18px_35px_rgba(0,0,0,0.15)] transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_28px_55px_rgba(0,0,0,0.22)]">
              <div className="h-5 bg-[#355E3B]" />
              <div className="p-7 md:p-10">
                <div className="text-center">
                  <h3
                    className="text-[34px] font-extrabold leading-tight text-[#355E3B] md:text-[56px]"
                    style={fontMontserrat}
                  >
                    Find Us
                  </h3>
                  <div className="mx-auto mt-4 h-[5px] w-24 rounded-full bg-[#355E3B]" />
                </div>

                <div className="mt-8 overflow-hidden rounded-xl bg-gray-100">
                  <iframe
                    title="LTC Location Map"
                    src={MAP_EMBED_URL}
                    className="h-[260px] w-full md:h-[420px]"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                </div>

                <div className="mt-7 flex justify-center">
                  <a
                    href={MAPS_LINK}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center rounded-full bg-[#355E3B] px-10 py-4 text-[18px] font-semibold text-white transition-all duration-300 hover:-translate-y-1 hover:bg-[#2C5233] hover:shadow-lg md:text-[20px]"
                    style={fontMontserrat}
                  >
                    Open in Google Maps
                  </a>
                </div>
              </div>
            </div>
          </section>
        </section>

        <footer className="bg-[#355E3B] text-white">
          <div className="mx-auto max-w-[1600px] px-4 py-3 md:px-6 md:py-4">
            <div className="grid grid-cols-1 gap-5 md:grid-cols-[1.35fr_1fr_1.2fr_1.2fr] md:gap-0">
              <div className="flex items-center gap-3 pr-0 md:pr-6">
                <img
                  src={LOGO}
                  alt="LTC Logo"
                  className="h-10 w-10 shrink-0 rounded-full bg-white object-cover md:h-[44px] md:w-[44px]"
                />
                <div className="min-w-0">
                  <h2
                    className="text-[32px] font-black uppercase leading-none md:text-[42px]"
                    style={fontMontserrat}
                  >
                    LUMISPIRE
                  </h2>
                </div>
              </div>

              <div className="md:border-l md:border-white/35 md:px-6">
                <h3
                  className="text-[11px] font-bold uppercase tracking-wide"
                  style={fontMontserrat}
                >
                  MENU
                </h3>
                <div className="mt-1 h-[2px] w-[110px] bg-white/35" />
                <ul className="mt-2 space-y-[4px] text-[12px] text-white/90" style={fontPontano}>
                  <li>
                    <button onClick={() => goTo("/")} className="hover:text-white">
                      Home
                    </button>
                  </li>
                  <li>
                    <button onClick={() => goTo("/about-us")} className="hover:text-white">
                      About Us
                    </button>
                  </li>
                  <li>
                    <button onClick={() => goTo("/team")} className="hover:text-white">
                      Team
                    </button>
                  </li>
                  <li>
                    <button onClick={() => goTo(CONTACT_ROUTE)} className="hover:text-white">
                      Contact Us
                    </button>
                  </li>
                </ul>
              </div>

              <div className="md:border-l md:border-white/35 md:px-6">
                <h3
                  className="text-[11px] font-bold uppercase tracking-wide"
                  style={fontMontserrat}
                >
                  CONTACT
                </h3>
                <div className="mt-1 h-[2px] w-[110px] bg-white/35" />
                <ul
                  className="mt-2 space-y-[4px] text-[12px] leading-relaxed text-white/90"
                  style={fontPontano}
                >
                  <li>lornacastigador@ltcmultiservices.com</li>
                  <li>lorengladius@ltcmultiservices.com</li>
                  <li>Admin@ltcmultiservices.com</li>
                </ul>
              </div>

              <div className="md:border-l md:border-white/35 md:px-6">
                <h3
                  className="text-[11px] font-bold uppercase tracking-wide"
                  style={fontMontserrat}
                >
                  ADDRESS
                </h3>
                <div className="mt-1 h-[2px] w-[110px] bg-white/35" />
                <ul
                  className="mt-2 space-y-[6px] text-[12px] leading-relaxed text-white/90"
                  style={fontPontano}
                >
                  <li>
                    5411 Light Tower Center &amp; Realty Development, Inc. Building II, Curie
                    Street, Palanan, Makati City.
                  </li>
                  <li>Light Tower Center, 1730 Dian Street, Palanan, Makati City.</li>
                </ul>
              </div>
            </div>

            <div className="mt-3 flex flex-col gap-1 border-t border-white/15 pt-2 text-[10px] text-white/90 md:flex-row md:items-center md:justify-between">
              <p style={fontPontano}>© 2026 LTC GROUP OF COMPANIES. All rights</p>
              <p className="text-left md:text-right" style={fontPontano}>
                Developed by CRMS Tech Alliance
              </p>
            </div>
          </div>
        </footer>
      </main>
      <ChatbotWidget />
    </div>
  );
};

export default Contact;