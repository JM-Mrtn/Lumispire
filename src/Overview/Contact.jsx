import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import ChatbotWidget from "./ChatbotWidget";

const LOGO = "/LTCLogo.jpg";
const CONTACT_ROUTE = "/contact";

const fontMontserrat = { fontFamily: "'Montserrat', sans-serif" };
const fontPontano = { fontFamily: "'Pontano Sans', sans-serif" };
const fontPoppins = { fontFamily: "'Poppins', sans-serif" };

const mapUrl =
  "https://www.google.com/maps?q=5411%20Light%20Tower%20Center%20Curie%20Street%20Palanan%20Makati%20City&output=embed";

const ContactIcon = ({ type }) => {
  const commonClass = "h-4 w-4 text-white";

  if (type === "location") {
    return (
      <svg
        viewBox="0 0 24 24"
        className={commonClass}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 21s7-4.6 7-11a7 7 0 1 0-14 0c0 6.4 7 11 7 11z"
        />
        <circle cx="12" cy="10" r="2.5" />
      </svg>
    );
  }

  if (type === "mail") {
    return (
      <svg
        viewBox="0 0 24 24"
        className={commonClass}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16v12H4V6z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="m4 7 8 6 8-6" />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 24 24"
      className={commonClass}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <circle cx="12" cy="12" r="9" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 7v5l3 2" />
    </svg>
  );
};

const ContactInfoItem = ({ icon, title, children }) => (
  <div className="flex gap-3">
    <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#355E3B]">
      <ContactIcon type={icon} />
    </div>

    <div className="min-w-0">
      <h4
        className="text-[14px] font-extrabold leading-tight text-black md:text-[15px]"
        style={fontMontserrat}
      >
        {title}
      </h4>

      <div
        className="mt-1 space-y-0.5 text-[12px] leading-relaxed text-gray-600 md:text-[13px]"
        style={fontPontano}
      >
        {children}
      </div>
    </div>
  </div>
);

const Contact = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const navLinks = [
    { label: "HOME", to: "/" },
    { label: "ABOUT US", to: "/about-us" },
    { label: "TEAM", to: "/team" },
    { label: "CONTACT", to: CONTACT_ROUTE },
  ];

  const goTo = (path) => {
    navigate(path);
    setIsSidebarOpen(false);
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    setFormData({
      name: "",
      email: "",
      message: "",
    });
  };

  return (
    <div className="min-h-screen bg-white text-gray-900" style={fontPontano}>
      <header className="fixed left-0 right-0 top-0 z-50 border-b border-white/10 bg-[#355E3B] text-white shadow-md">
        <div className="mx-auto flex h-[64px] max-w-[1600px] items-center justify-between px-4 md:h-[72px] md:px-6 lg:h-[76px] lg:px-8">
          <div className="flex min-w-0 items-center gap-2 md:gap-3">
            <img
              src={LOGO}
              alt="LTC Logo"
              className="h-9 w-9 shrink-0 rounded-full bg-white object-cover md:h-[44px] md:w-[44px] lg:h-[48px] lg:w-[48px]"
            />

            <div className="min-w-0 leading-tight">
              <h1
                className="truncate text-[15px] font-extrabold uppercase tracking-tight md:text-[21px] lg:text-[24px]"
                style={fontMontserrat}
              >
                LTC GROUP OF COMPANIES
                <span className="align-top text-[8px] md:text-[10px]">®</span>
              </h1>

              <p
                className="truncate text-[8px] text-white/90 md:text-[11px] lg:text-[12px]"
                style={fontPontano}
              >
                Providing quality services and training solutions.
              </p>
            </div>
          </div>

          <nav className="hidden items-center gap-5 md:flex lg:gap-7" style={fontPoppins}>
            {navLinks.map((link) => {
              const isActive = location.pathname === link.to;

              return (
                <button
                  key={link.label}
                  onClick={() => goTo(link.to)}
                  className={`group relative pb-1 text-[13px] font-semibold uppercase tracking-normal transition ${
                    isActive ? "text-white" : "text-white/85 hover:text-white"
                  }`}
                >
                  {link.label}

                  <span
                    className={`absolute -bottom-1 left-0 h-[2px] rounded-full bg-white transition-all duration-300 ${
                      isActive ? "w-full" : "w-0 group-hover:w-full"
                    }`}
                  />
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
                const isActive = location.pathname === link.to;

                return (
                  <button
                    key={link.label}
                    onClick={() => goTo(link.to)}
                    className={`mb-2 w-full rounded-lg px-4 py-3 text-left text-base font-medium tracking-normal transition ${
                      isActive
                        ? "bg-[#355E3B] text-white"
                        : "text-gray-800 hover:bg-gray-100 hover:text-[#355E3B]"
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

      <main className="bg-[#F5F5F3] pt-[64px] md:pt-[72px] lg:pt-[76px]">
        <section className="relative h-[200px] w-full overflow-hidden bg-[#183B29] md:h-[230px] lg:h-[250px]">
          <div className="absolute inset-0 bg-gradient-to-b from-[#183B29] via-[#204A32] to-[#183B29]" />

          <div
            className="absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 whitespace-nowrap text-[80px] font-black uppercase tracking-tight text-white/20 md:block lg:text-[105px]"
            style={fontMontserrat}
          >
            CONTACT US
          </div>

          <div className="relative mx-auto flex h-full max-w-[1600px] items-center justify-center px-6 text-center">
            <div className="max-w-4xl">
              <h2
                className="text-[30px] font-extrabold leading-tight text-white md:text-[44px]"
                style={fontMontserrat}
              >
                Contact Us
              </h2>

              <p
                className="mt-3 text-[14px] font-semibold text-white/95 md:text-[18px]"
                style={fontPontano}
              >
                We’d Love to Hear From You
              </p>

              <p
                className="mx-auto mt-2 max-w-2xl text-[12.5px] leading-relaxed text-white/80 md:text-[14px]"
                style={fontPontano}
              >
                Reach out to us through our contact details or send us a message.
              </p>

              <div className="mx-auto mt-4 h-[4px] w-16 rounded-full bg-[#1F8F5A]" />
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-[1250px] px-4 py-6 md:px-8 md:py-7">
          <div className="grid grid-cols-1 items-stretch gap-5 lg:grid-cols-2">
            <section className="flex h-full min-h-[405px] flex-col overflow-hidden rounded-2xl bg-[#F3F3F3] shadow-[0_12px_26px_rgba(0,0,0,0.13)] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_20px_40px_rgba(0,0,0,0.18)]">
              <div className="h-4 shrink-0 bg-[#355E3B]" />

              <div className="flex flex-1 flex-col px-5 py-4 md:px-6 md:py-5">
                <h3
                  className="text-[24px] font-extrabold leading-tight text-[#355E3B] md:text-[30px]"
                  style={fontMontserrat}
                >
                  Get in Touch
                </h3>

                <p
                  className="mt-2 max-w-3xl text-[12px] leading-relaxed text-gray-600 md:text-[13px]"
                  style={fontPontano}
                >
                  Reach us through our contact information below. We will be happy to assist you
                  with your questions about our services.
                </p>

                <div className="mt-5 grid flex-1 grid-cols-1 gap-4">
                  <ContactInfoItem icon="location" title="Main Office">
                    <p>
                      5411 Light Tower Center &amp; Realty Development, Inc., Building II, Curie
                      Street, Palanan, Makati City.
                    </p>
                  </ContactInfoItem>

                  <ContactInfoItem icon="location" title="Additional Address">
                    <p>Light Tower Center, 1730 Dian Street, Palanan, Makati City.</p>
                  </ContactInfoItem>

                  <ContactInfoItem icon="mail" title="Email Contacts">
                    <p>lornacastigador@ltcmultiservices.com</p>
                    <p>lorengladius@ltcmultiservices.com</p>
                    <p>Admin@ltcmultiservices.com</p>
                  </ContactInfoItem>

                  <ContactInfoItem icon="time" title="Operating Hours">
                    <p>Monday - Friday: 8:00 AM - 5:00 PM</p>
                    <p>Saturday: 9:00 AM - 12:00 PM</p>
                    <p>Sunday: Closed</p>
                  </ContactInfoItem>
                </div>
              </div>
            </section>

            <section className="flex h-full min-h-[405px] flex-col overflow-hidden rounded-2xl bg-[#F3F3F3] shadow-[0_12px_26px_rgba(0,0,0,0.13)] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_20px_40px_rgba(0,0,0,0.18)]">
              <div className="h-4 shrink-0 bg-[#355E3B]" />

              <form onSubmit={handleSubmit} className="flex flex-1 flex-col px-5 py-4 md:px-6 md:py-5">
                <h3
                  className="text-[24px] font-extrabold leading-tight text-[#355E3B] md:text-[30px]"
                  style={fontMontserrat}
                >
                  Send Us a Message
                </h3>

                <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label
                      htmlFor="name"
                      className="text-[12px] font-bold text-[#355E3B] md:text-[13px]"
                      style={fontMontserrat}
                    >
                      Name
                    </label>

                    <input
                      id="name"
                      name="name"
                      type="text"
                      value={formData.name}
                      onChange={handleChange}
                      className="mt-1.5 h-10 w-full rounded-lg border border-transparent bg-[#E6E9ED] px-3 text-[13px] outline-none transition focus:border-[#355E3B] focus:bg-white"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="email"
                      className="text-[12px] font-bold text-[#355E3B] md:text-[13px]"
                      style={fontMontserrat}
                    >
                      Email Address
                    </label>

                    <input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="mt-1.5 h-10 w-full rounded-lg border border-transparent bg-[#E6E9ED] px-3 text-[13px] outline-none transition focus:border-[#355E3B] focus:bg-white"
                    />
                  </div>
                </div>

                <div className="mt-4 flex flex-1 flex-col">
                  <label
                    htmlFor="message"
                    className="text-[12px] font-bold text-[#355E3B] md:text-[13px]"
                    style={fontMontserrat}
                  >
                    Your Message
                  </label>

                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    className="mt-1.5 min-h-[150px] flex-1 resize-none rounded-lg border border-transparent bg-[#E6E9ED] px-3 py-3 text-[13px] outline-none transition focus:border-[#355E3B] focus:bg-white"
                  />
                </div>

                <button
                  type="submit"
                  className="mt-5 inline-flex w-fit items-center justify-center rounded-full bg-[#355E3B] px-6 py-2.5 text-[13px] font-semibold text-white transition-all duration-300 hover:-translate-y-1 hover:bg-[#2C5233] hover:shadow-lg"
                  style={fontMontserrat}
                >
                  Send Message
                </button>
              </form>
            </section>
          </div>

          <section className="mt-5 overflow-hidden rounded-2xl bg-[#F3F3F3] shadow-[0_12px_26px_rgba(0,0,0,0.13)] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_20px_40px_rgba(0,0,0,0.18)]">
            <div className="h-4 bg-[#355E3B]" />

            <div className="px-5 py-5 md:px-6">
              <div className="mb-4 flex flex-col gap-1 md:flex-row md:items-end md:justify-between">
                <div>
                  <h3
                    className="text-[22px] font-extrabold leading-tight text-[#355E3B] md:text-[30px]"
                    style={fontMontserrat}
                  >
                    Find Us on Map
                  </h3>

                  <p
                    className="mt-1 text-[12px] leading-relaxed text-gray-600 md:text-[13px]"
                    style={fontPontano}
                  >
                    5411 Light Tower Center &amp; Realty Development, Inc., Building II, Curie
                    Street, Palanan, Makati City.
                  </p>
                </div>

                <a
                  href="https://www.google.com/maps/search/?api=1&query=5411%20Light%20Tower%20Center%20Curie%20Street%20Palanan%20Makati%20City"
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 inline-flex w-fit items-center justify-center rounded-full bg-[#355E3B] px-5 py-2 text-[12.5px] font-semibold text-white transition hover:bg-[#2C5233] md:mt-0"
                  style={fontMontserrat}
                >
                  Open Map
                </a>
              </div>

              <div className="h-[260px] overflow-hidden rounded-xl border border-[#D8DED8] bg-white md:h-[300px] lg:h-[320px]">
                <iframe
                  title="LTC Group of Companies Location Map"
                  src={mapUrl}
                  className="h-full w-full border-0"
                  loading="lazy"
                  allowFullScreen
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            </div>
          </section>
        </section>

        <footer className="bg-[#355E3B] text-white">
          <div className="mx-auto max-w-[1600px] px-4 py-1.5 md:px-6 md:py-2">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-[1.2fr_0.9fr_1fr_1fr] md:gap-0">
              <div className="flex items-center gap-2 pr-0 md:pr-4">
                <img
                  src={LOGO}
                  alt="LTC Logo"
                  className="h-7 w-7 shrink-0 rounded-full bg-white object-cover md:h-[32px] md:w-[32px]"
                />

                <div className="min-w-0">
                  <h2
                    className="text-[13px] font-black uppercase leading-tight md:text-[15px]"
                    style={fontMontserrat}
                  >
                    LTC GROUP OF COMPANIES
                  </h2>
                </div>
              </div>

              <div className="md:border-l md:border-white/35 md:px-4">
                <h3
                  className="text-[9.5px] font-bold uppercase tracking-wide"
                  style={fontMontserrat}
                >
                  MENU
                </h3>

                <div className="mt-1 h-[1px] w-[80px] bg-white/35" />

                <ul
                  className="mt-1.5 space-y-0.5 text-[10.5px] leading-snug text-white/90"
                  style={fontPontano}
                >
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

              <div className="md:border-l md:border-white/35 md:px-4">
                <h3
                  className="text-[9.5px] font-bold uppercase tracking-wide"
                  style={fontMontserrat}
                >
                  CONTACT
                </h3>

                <div className="mt-1 h-[1px] w-[80px] bg-white/35" />

                <ul
                  className="mt-1.5 space-y-0.5 text-[10.5px] leading-snug text-white/90"
                  style={fontPontano}
                >
                  <li>lornacastigador@ltcmultiservices.com</li>
                  <li>lorengladius@ltcmultiservices.com</li>
                  <li>Admin@ltcmultiservices.com</li>
                </ul>
              </div>

              <div className="md:border-l md:border-white/35 md:px-4">
                <h3
                  className="text-[9.5px] font-bold uppercase tracking-wide"
                  style={fontMontserrat}
                >
                  ADDRESS
                </h3>

                <div className="mt-1 h-[1px] w-[80px] bg-white/35" />

                <ul
                  className="mt-1.5 space-y-0.5 text-[10.5px] leading-snug text-white/90"
                  style={fontPontano}
                >
                  <li>
                    5411 Light Tower Center &amp; Realty Development, Inc., Building II, Curie
                    Street, Palanan, Makati City.
                  </li>

                  <li>Light Tower Center, 1730 Dian Street, Palanan, Makati City.</li>
                </ul>
              </div>
            </div>

            <div className="mt-2 flex flex-col gap-1 border-t border-white/15 pt-1.5 text-[9.5px] leading-snug text-white/90 md:flex-row md:items-center md:justify-between">
              <p style={fontPontano}>© 2026 LTC GROUP OF COMPANIES. All rights reserved.</p>

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