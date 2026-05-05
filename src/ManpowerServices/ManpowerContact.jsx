import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const HERO_IMAGE = "/images/manpower-hero.jpg";
const MANPOWER_HOME_ROUTE = "/manpower-services";

function BrandSeal({ small = false }) {
  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-full border-[3px] border-[#315b42] bg-white text-center font-black leading-none text-[#315b42] ${
        small ? "h-9 w-9 text-[9px]" : "h-12 w-12 text-[10px]"
      }`}
    >
      LTC
    </div>
  );
}

function HeaderNavLink({ to, children, active = false }) {
  return (
    <Link
      to={to}
      className={`relative pb-1 transition hover:text-[#6f8a66] ${
        active
          ? "text-[#315b42] after:absolute after:bottom-[-6px] after:left-0 after:h-[2px] after:w-full after:rounded-full after:bg-[#315b42]"
          : "text-[#405549]"
      }`}
    >
      {children}
    </Link>
  );
}

function FooterColumn({ title, children }) {
  return (
    <div className="border-[#d8ded5] md:border-l md:pl-5">
      <h4 className="text-[14px] font-black text-[#315b42]">{title}</h4>
      <div className="mt-2 space-y-1 text-[11px] font-semibold leading-snug text-[#496252]">
        {children}
      </div>
    </div>
  );
}

function LocationIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <path
        d="M12 21s6-5.4 6-11a6 6 0 1 0-12 0c0 5.6 6 11 6 11Z"
        stroke="currentColor"
        strokeWidth="2"
      />
      <circle cx="12" cy="10" r="2.3" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

function PhoneIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <path
        d="M7.8 4.8c.6-.6 1.6-.7 2.3-.2l1.9 1.4c.7.5 1 1.4.6 2.2l-.8 1.9c-.2.4-.1.9.2 1.3l.9 1.2c.3.3.8.5 1.3.3l2-.6c.8-.2 1.7.1 2.2.8l1.3 1.8c.5.7.4 1.7-.3 2.3l-1 .9c-1.4 1.2-3.2 1.5-4.9.8-2.7-1.1-5.2-3.4-7.6-6.8C4.7 10 4.2 8 5.2 6.5l2.6-1.7Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function MailIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <path
        d="M4 7h16v10H4z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="m5 8 7 6 7-6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ClockIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="2" />
      <path
        d="M12 8v5l3 2"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function ManpowerContactPage({ onSubmitMessage }) {
  const navigate = useNavigate();

  const [mobileOpen, setMobileOpen] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [status, setStatus] = useState({
    loading: false,
    success: "",
    error: "",
  });

  const inputClass =
    "mt-1 w-full rounded-full border-2 border-white bg-transparent px-4 py-1.5 text-[12px] font-semibold text-white outline-none placeholder:text-white/60 focus:border-[#cfe6c2]";

  const textAreaClass =
    "mt-1 w-full resize-none rounded-[14px] border-2 border-white bg-transparent px-4 py-2 text-[12px] font-semibold text-white outline-none placeholder:text-white/60 focus:border-[#cfe6c2]";

  function goTo(path) {
    setMobileOpen(false);
    navigate(path);
  }

  function updateField(key, value) {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));

    setStatus({
      loading: false,
      success: "",
      error: "",
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();

    const payload = {
      name: form.name.trim(),
      email: form.email.trim(),
      subject: form.subject.trim(),
      message: form.message.trim(),
    };

    if (!payload.name || !payload.email || !payload.subject || !payload.message) {
      setStatus({
        loading: false,
        success: "",
        error: "Please complete all fields.",
      });
      return;
    }

    try {
      setStatus({
        loading: true,
        success: "",
        error: "",
      });

      if (typeof onSubmitMessage === "function") {
        await onSubmitMessage(payload);
      }

      setForm({
        name: "",
        email: "",
        subject: "",
        message: "",
      });

      setStatus({
        loading: false,
        success: "Message sent successfully.",
        error: "",
      });
    } catch (error) {
      setStatus({
        loading: false,
        success: "",
        error: error?.message || "Failed to send message.",
      });
    }
  }

  return (
    <div className="min-h-screen bg-[#0f3a1e] font-sans text-[#24372d]">
      <header className="sticky top-0 z-50 border-b border-[#d5ddd2] bg-[#f7f9f5]/95 backdrop-blur">
        <div className="mx-auto flex h-[74px] max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link to={MANPOWER_HOME_ROUTE} className="flex items-center gap-3">
            <BrandSeal />
            <span className="text-[24px] font-black tracking-wide text-[#315b42] sm:text-[28px]">
              MANPOWER
            </span>
          </Link>

          <nav className="hidden items-center gap-9 text-[12px] font-black uppercase tracking-wide lg:flex">
            <HeaderNavLink to={MANPOWER_HOME_ROUTE}>
              Home
            </HeaderNavLink>

            <HeaderNavLink to="/manpower-positions">
              Job Offer
            </HeaderNavLink>

            <HeaderNavLink to="/manpower-requirements">
              Requirements
            </HeaderNavLink>

            <HeaderNavLink to="/manpower-contact" active>
              Contact
            </HeaderNavLink>

            <HeaderNavLink to="/manpower-faqs">
              FAQs
            </HeaderNavLink>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              to="/manpower-employee-login"
              className="hidden text-[12px] font-black uppercase tracking-wide text-[#405549] transition hover:text-[#6f8a66] lg:inline-block"
            >
              Sign In
            </Link>

            <button
              type="button"
              onClick={() => setMobileOpen((prev) => !prev)}
              className="rounded-md border border-[#cfd6ca] px-3 py-2 text-xs font-black uppercase tracking-wide text-[#405549] lg:hidden"
            >
              Menu
            </button>
          </div>
        </div>

        {mobileOpen && (
          <div className="border-t border-[#dde2db] bg-[#f7f9f5] lg:hidden">
            <div className="mx-auto flex max-w-7xl flex-col px-4 py-3 text-sm font-bold text-[#405549] sm:px-6">
              <button
                type="button"
                onClick={() => goTo(MANPOWER_HOME_ROUTE)}
                className="py-2 text-left"
              >
                Home
              </button>

              <button
                type="button"
                onClick={() => goTo("/manpower-positions")}
                className="py-2 text-left"
              >
                Job Offer
              </button>

              <button
                type="button"
                onClick={() => goTo("/manpower-requirements")}
                className="py-2 text-left"
              >
                Requirements
              </button>

              <button
                type="button"
                onClick={() => goTo("/manpower-contact")}
                className="py-2 text-left text-[#315b42] underline underline-offset-4"
              >
                Contact
              </button>

              <button
                type="button"
                onClick={() => goTo("/manpower-faqs")}
                className="py-2 text-left"
              >
                FAQs
              </button>

              <button
                type="button"
                onClick={() => goTo("/manpower-employee-login")}
                className="py-2 text-left"
              >
                Sign In
              </button>
            </div>
          </div>
        )}
      </header>

      <main>
        <section
          className="relative h-[165px] bg-[#526b5a] bg-cover bg-center sm:h-[190px] md:h-[230px]"
          style={{
            backgroundImage: `url(${HERO_IMAGE})`,
          }}
        >
          <div className="absolute inset-0 bg-black/10" />
        </section>

        <section className="relative overflow-hidden bg-[#0f3a1e]">
          <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-[#9ab987] to-transparent opacity-80" />

          <div className="relative z-10 mx-auto max-w-7xl px-4 py-7 text-center sm:px-6 lg:px-8">
            <h1 className="text-[25px] font-black leading-tight text-white drop-shadow sm:text-[31px] md:text-[34px]">
              Contact Us
            </h1>
            <div className="mx-auto mt-3 h-[3px] w-[280px] max-w-[75%] bg-white/45" />
          </div>
        </section>

        <section className="bg-[#294f35]">
          <div className="mx-auto grid max-w-7xl gap-10 px-6 py-6 md:grid-cols-2 md:px-16 md:py-8 lg:px-28">
            <div className="text-white">
              <h2 className="text-center text-[26px] font-black leading-tight sm:text-[30px]">
                Get in touch
              </h2>
              <div className="mx-auto mt-2 h-[3px] w-[235px] max-w-[80%] bg-white/55" />

              <div className="mt-9 space-y-8">
                <div className="flex items-start gap-5">
                  <LocationIcon className="mt-1 h-5 w-5 shrink-0 text-black" />
                  <p className="text-[11px] font-black leading-snug">
                    2/F 544 Curie Street, Palanan, Makati
                    <br />
                    City
                  </p>
                </div>

                <div className="flex items-start gap-5">
                  <PhoneIcon className="mt-0.5 h-5 w-5 shrink-0 text-black" />
                  <p className="text-[11px] font-black leading-snug">
                    09959808051 / 09516281271
                  </p>
                </div>

                <div className="flex items-start gap-5">
                  <MailIcon className="mt-0.5 h-5 w-5 shrink-0 text-black" />
                  <div className="text-[11px] font-black leading-snug">
                    <p>ltc.tamis@gmail.com</p>
                    <p>lorengladisu@ltcmultiservices.com</p>
                  </div>
                </div>

                <div className="flex items-start gap-5">
                  <ClockIcon className="mt-0.5 h-5 w-5 shrink-0 text-black" />
                  <p className="text-[11px] font-black leading-snug">
                    Monday - Thursday | 8:00 AM - 5:00 PM
                  </p>
                </div>
              </div>
            </div>

            <div className="text-white">
              <h2 className="text-center text-[26px] font-black leading-tight sm:text-[30px]">
                Send us Message
              </h2>
              <div className="mx-auto mt-2 h-[3px] w-[235px] max-w-[80%] bg-white/55" />

              <form onSubmit={handleSubmit} className="mt-7 space-y-3">
                <div>
                  <label className="text-[11px] font-black">Your Name</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => updateField("name", e.target.value)}
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className="text-[11px] font-black">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => updateField("email", e.target.value)}
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className="text-[11px] font-black">Subject</label>
                  <input
                    type="text"
                    value={form.subject}
                    onChange={(e) => updateField("subject", e.target.value)}
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className="text-[11px] font-black">Message</label>
                  <textarea
                    rows={4}
                    value={form.message}
                    onChange={(e) => updateField("message", e.target.value)}
                    className={textAreaClass}
                  />
                </div>

                {status.error && (
                  <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-[11px] font-semibold text-red-700">
                    {status.error}
                  </div>
                )}

                {status.success && (
                  <div className="rounded-md border border-green-200 bg-green-50 px-3 py-2 text-[11px] font-semibold text-green-700">
                    {status.success}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={status.loading}
                  className="w-full rounded-full bg-white px-6 py-2 text-[11px] font-black uppercase tracking-wide text-[#294f35] transition hover:bg-[#e7eee3] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {status.loading ? "Sending..." : "Submit"}
                </button>
              </form>
            </div>
          </div>
        </section>

        <section className="bg-[#0f3a1e] pb-24 pt-16">
          <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
            <h2 className="text-[25px] font-black leading-tight text-white drop-shadow sm:text-[30px] md:text-[34px]">
              Our Location Guide Map
            </h2>
            <div className="mx-auto mt-4 h-[3px] w-[390px] max-w-[75%] bg-white/45" />

            <div className="mx-auto mt-10 max-w-[1320px] overflow-hidden rounded-[14px] border border-white/10 bg-[#294f35] shadow-[0_12px_30px_rgba(0,0,0,0.25)]">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d965.431002803793!2d121.00279826952298!3d14.55776879716882!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3397c90045cecd85%3A0xffb8e8e0364e81e7!2sLTC%20Properties%20and%20Services%20Group%20of%20Companies%20OPC!5e0!3m2!1sen!2sph!4v1775494820080!5m2!1sen!2sph"
                width="100%"
                height="455"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="LTC Properties and Services Group of Companies OPC Map"
                className="h-[360px] w-full sm:h-[420px] lg:h-[455px]"
              />
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-[#d8ded5] bg-[#f7f9f5]">
        <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
          <div className="grid gap-4 md:grid-cols-[1.2fr_0.75fr_1.35fr_1.05fr_0.85fr] md:items-start">
            <div>
              <div className="flex items-center gap-2.5">
                <div className="flex h-10 w-10 items-center justify-center rounded-full text-[#c7a23a]">
                  <span className="text-[28px] leading-none">♛</span>
                </div>
                <h3 className="text-[24px] font-black tracking-wide text-[#315b42]">
                  LUMISPIRE
                </h3>
              </div>
            </div>

            <FooterColumn title="Menu">
              <Link
                className="block hover:text-[#315b42]"
                to={MANPOWER_HOME_ROUTE}
              >
                Home
              </Link>

              <Link
                className="block hover:text-[#315b42]"
                to="/manpower-positions"
              >
                Course
              </Link>

              <Link
                className="block hover:text-[#315b42]"
                to="/manpower-requirements"
              >
                Requirements
              </Link>

              <Link
                className="block hover:text-[#315b42]"
                to="/manpower-employee-login"
              >
                Profile
              </Link>
            </FooterColumn>

            <FooterColumn title="Contact Information">
              <p>ltc.tamis@gmail.com</p>
              <p>lorengladisu@ltcmultiservices.com</p>
              <p>09959808051 / 09516281271</p>
            </FooterColumn>

            <FooterColumn title="Address">
              <p>2/F 544 Curie Street,</p>
              <p>Palanan, Makati City</p>
            </FooterColumn>

            <FooterColumn title="Follow Us">
              <p>Facebook</p>
              <p>Email</p>
              <p>LinkedIn</p>
            </FooterColumn>
          </div>

          <div className="mt-2 flex flex-col gap-1 border-t border-[#d8ded5] pt-1.5 text-[10px] font-semibold text-[#4c6556] sm:flex-row sm:items-center sm:justify-between">
            <p>© 2026 LTC GROUP OF COMPANIES. All rights reserved.</p>
            <p>Developed by CRMS Tech Alliance</p>
          </div>
        </div>
      </footer>
    </div>
  );
}