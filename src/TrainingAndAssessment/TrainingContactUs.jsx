// src/TrainingAndAssessment/TrainingContactUs.jsx
import React, { useState } from "react";
import { TrainingPublicShell } from "./TrainingRequirements";

const HEADER_LOGO_IMAGE = "/TamsiLogo.png";
const FOOTER_LOGO_IMAGE = "/TrainingLumispireLogo.png";
const TRAINING_HOME_ROUTE = "/training";
const TRAINING_COURSE_ROUTE = "/training-course";
const TRAINING_REQUIREMENTS_ROUTE = "/training-requirements";
const TRAINING_LOGIN_ROUTE = "/training-login";
const TRAINING_CONTACT_ROUTE = "/training-contact-us";
const TRAINING_FAQS_ROUTE = "/training-faqs";
const TRAINING_CERTIFICATE_VALIDATION_ROUTE = "/training-certificate-validation";

const TRAINING_CONTACT_INFO = {
  email1: "lorengladius@ltcmultiservices.com",
  email2: "ltc.tamsi@gmail.com",
  phone: "+639516281271 / +639959808051",
  addressLine1: "2/F 5441 CURRIE STREET,",
  addressLine2: "PALANAN, MAKATI CITY",
  addressFull: "2/F 5441 CURRIE STREET, PALANAN, MAKATI CITY",
  hours: "Monday to Friday, 8:00 AM to 5:00 PM",
};

const TRAINING_NAV_ITEMS = [
  { key: "home", label: "Home", path: TRAINING_HOME_ROUTE },
  { key: "course", label: "Course", path: TRAINING_COURSE_ROUTE },
  { key: "requirements", label: "Requirements", path: TRAINING_REQUIREMENTS_ROUTE },
  { key: "contact", label: "Contact", path: TRAINING_CONTACT_ROUTE },
  { key: "faqs", label: "FAQs", path: TRAINING_FAQS_ROUTE },
  {
    key: "certificate-validation",
    label: "Certificate Validation",
    path: TRAINING_CERTIFICATE_VALIDATION_ROUTE,
  },
];

const TRAINING_FOOTER_NAV_ITEMS = [
  { key: "home", label: "Home", path: TRAINING_HOME_ROUTE },
  { key: "course", label: "Course", path: TRAINING_COURSE_ROUTE },
  {
    key: "certificate-validation",
    label: "Certificate Validation",
    path: TRAINING_CERTIFICATE_VALIDATION_ROUTE,
  },
  { key: "sign-in", label: "Sign In", path: TRAINING_LOGIN_ROUTE },
];

const fontMontserrat = { fontFamily: "'Montserrat', sans-serif" };
const fontPontano = { fontFamily: "'Pontano Sans', sans-serif" };
const fontPoppins = { fontFamily: "'Poppins', sans-serif" };

const publicChromeStyles = `
  .ltc-training-home { --green-950:#071f14; --green-800:#174a30; --footer-green:#082719; --gold-soft:#f4d484; min-height:100vh; overflow-x:hidden; font-family:"Inter",Arial,sans-serif; }
  .ltc-training-home * { box-sizing:border-box; }
  .ltc-container { width:min(1180px,92%); margin:auto; }
  .ltc-header { position:sticky; top:0; z-index:50; width:100%; background:var(--footer-green); border-bottom:1px solid rgba(255,255,255,.1); box-shadow:0 10px 34px rgba(7,31,20,.14); }
  .ltc-header .ltc-container { width:100%; max-width:none; margin:0; padding:0 32px; }
  .ltc-nav { min-height:76px; display:flex; justify-content:space-between; align-items:center; gap:24px; }
  .ltc-logo { display:flex; align-items:center; gap:13px; color:white; border:0; background:transparent; cursor:pointer; text-align:left; padding:0; }
  .ltc-logo-icon { width:42px; height:42px; border-radius:999px; background:white; object-fit:contain; box-shadow:0 0 0 5px rgba(255,255,255,.08),0 12px 24px rgba(0,0,0,.12); }
  .ltc-logo h1 { margin:0; color:white; font-size:18px; line-height:1; font-weight:900; text-transform:uppercase; letter-spacing:-.04em; }
  .ltc-logo p { margin:5px 0 0; color:rgba(255,255,255,.62); font-size:11px; line-height:1.2; }
  .ltc-desktop-nav { display:flex; align-items:center; gap:8px; margin-left:auto; }
  .ltc-nav-link { position:relative; border:0; background:transparent; color:rgba(255,255,255,.78); padding:27px 14px 25px; cursor:pointer; font-size:12px; font-weight:800; }
  .ltc-nav-link::after { content:""; position:absolute; left:14px; right:14px; bottom:19px; height:2px; border-radius:999px; background:var(--gold-soft); transform:scaleX(0); transition:.25s; }
  .ltc-nav-link:hover,.ltc-nav-link.active { color:white; }
  .ltc-nav-link:hover::after,.ltc-nav-link.active::after { transform:scaleX(1); }
  .ltc-profile-wrap { display:flex; align-items:center; }
  .ltc-sign-in-button { border:1px solid rgba(255,255,255,.22); border-radius:999px; padding:10px 18px; background:rgba(255,255,255,.08); }
  .ltc-sign-in-button::after { display:none; }
  .ltc-menu-button { display:none; width:42px; height:42px; border-radius:12px; border:1px solid rgba(255,255,255,.16); background:rgba(255,255,255,.08); color:white; cursor:pointer; }
  .ltc-menu-button svg { width:22px; height:22px; }
  .ltc-footer { width:100%; background:var(--footer-green); color:white; padding:30px 0 12px; }
  .ltc-footer .ltc-container { width:100%; max-width:none; padding-left:40px; padding-right:40px; }
  .ltc-footer-grid { display:grid; grid-template-columns:1.35fr .75fr 1.05fr 1fr .7fr; column-gap:clamp(28px,4vw,76px); row-gap:22px; padding-bottom:24px; border-bottom:1px solid rgba(255,255,255,.1); }
  .ltc-footer-brand { display:flex; align-items:center; gap:14px; width:100%; color:white; text-align:left; border:0; background:transparent; padding:0; cursor:pointer; }
  .ltc-footer-brand img { width:110px; height:auto; object-fit:contain; display:block; }
  .ltc-footer-brand-copy { min-width:0; display:flex; flex-direction:column; align-items:flex-start; gap:6px; }
  .ltc-footer h4 { margin:0; color:white; font-size:20px; line-height:1.2; font-weight:900; text-transform:uppercase; }
  .ltc-footer-brand-description { max-width:300px; margin:0!important; color:rgba(255,255,255,.72)!important; }
  .ltc-footer h5 { margin:0 0 10px; color:var(--gold-soft); font-size:12px; font-weight:900; text-transform:uppercase; letter-spacing:.14em; }
  .ltc-footer p,.ltc-footer-link { display:block; margin:5px 0; color:rgba(255,255,255,.68); font-size:13px; line-height:1.55; text-decoration:none; }
  .ltc-footer-link { border:0; background:transparent; padding:0; cursor:pointer; text-align:left; }
  .ltc-footer-link:hover { color:white; text-decoration:underline; }
  .ltc-copyright { padding-top:14px; display:flex; justify-content:space-between; gap:12px; color:rgba(255,255,255,.52); font-size:12px; }
  .ltc-sidebar-overlay { position:fixed; inset:0; z-index:80; background:rgba(0,0,0,.42); }
  .ltc-sidebar-panel { position:absolute; right:0; top:0; height:100%; width:min(310px,86vw); background:white; box-shadow:-20px 0 60px rgba(0,0,0,.25); padding:20px; }
  .ltc-sidebar-top { display:flex; align-items:center; justify-content:space-between; border-bottom:1px solid rgba(16,24,40,.1); padding-bottom:16px; margin-bottom:16px; }
  .ltc-sidebar-title { color:var(--green-950); font-weight:900; letter-spacing:.14em; font-size:12px; margin:0; }
  .ltc-sidebar-close { width:38px; height:38px; border-radius:12px; border:0; background:#f2f4f7; cursor:pointer; }
  .ltc-sidebar-link { display:block; width:100%; border:0; background:transparent; color:#101828; text-align:left; border-radius:14px; padding:13px 14px; font-weight:800; margin-bottom:8px; cursor:pointer; }
  .ltc-sidebar-link:hover,.ltc-sidebar-link.active { background:var(--green-800); color:white; }
  @media (max-width:900px) { .ltc-desktop-nav,.ltc-profile-wrap { display:none; } .ltc-menu-button { display:grid; place-items:center; } .ltc-footer-grid { grid-template-columns:repeat(2,minmax(0,1fr)); } }
  @media (max-width:640px) { .ltc-header .ltc-container { padding:0 18px; } .ltc-logo h1 { font-size:15px; } .ltc-logo p { display:none; } .ltc-footer .ltc-container { padding-left:20px; padding-right:20px; } .ltc-footer-grid { grid-template-columns:1fr; } .ltc-copyright { flex-direction:column; } }
`;

export default function TrainingContactUs() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setFormData({ name: "", email: "", subject: "", message: "" });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Message submitted.");
    resetForm();
  };

  return (
    <TrainingPublicShell
      active="contact"
      title="Contact Us"
      subtitle="Reach our training and assessment team for inquiries and assistance."
    >
      <>
        <style>{contactPageStyleFixes}</style>

        <section className="bg-[#2e5038] px-5 py-10 text-white sm:px-8 lg:px-12">
          <div className="mx-auto grid max-w-[1280px] gap-8 lg:grid-cols-2">
            <div className="rounded-2xl bg-[#2e5038] p-6 lg:border-r lg:border-white/15 lg:pr-10">
              <SectionHeading title="Get in touch" />

              <div className="mt-8 space-y-6">
                <ContactItem icon={<LocationIcon />}>
                  <span>{TRAINING_CONTACT_INFO.addressFull}</span>
                </ContactItem>

                <ContactItem icon={<PhoneIcon />}>
                  <span>{TRAINING_CONTACT_INFO.phone}</span>
                </ContactItem>

                <ContactItem icon={<MailIcon />}>
                  <span>{TRAINING_CONTACT_INFO.email1}</span>
                  <span>{TRAINING_CONTACT_INFO.email2}</span>
                </ContactItem>

                <ContactItem icon={<ClockIcon />}>
                  <span>{TRAINING_CONTACT_INFO.hours}</span>
                </ContactItem>
              </div>
            </div>

            <div className="rounded-2xl bg-[#2e5038] p-6 lg:pl-10">
              <SectionHeading title="Send us Message" />

              <form onSubmit={handleSubmit} className="mt-7 space-y-4">
                <ContactField
                  label="Your Name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />

                <ContactField
                  label="Email Address"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />

                <ContactField
                  label="Subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                />

                <div>
                  <label className="mb-1 block text-xs font-extrabold text-white">
                    Message
                  </label>

                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows={5}
                    required
                    className="w-full resize-none rounded-xl border-2 border-white/80 bg-transparent px-4 py-3 text-sm font-semibold text-white outline-none transition placeholder:text-white/50 focus:border-white"
                  />
                </div>

                <div className="flex flex-col gap-3 pt-2 sm:flex-row">
                  <button
                    type="submit"
                    className="h-10 flex-1 rounded-full bg-white px-6 text-xs font-extrabold uppercase tracking-wide text-[#45674b] transition hover:bg-[#eef1e7]"
                  >
                    Submit
                  </button>

                  <button
                    type="button"
                    onClick={resetForm}
                    className="h-10 flex-1 rounded-full border-2 border-white bg-transparent px-6 text-xs font-extrabold uppercase tracking-wide text-white transition hover:bg-white hover:text-[#45674b]"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </section>

        <section className="bg-[#123a20] px-5 py-8 text-white sm:px-8 lg:px-12">
          <div className="mx-auto max-w-[1280px]">
            <div className="text-center">
              <h2 className="font-['Montserrat',sans-serif] text-2xl font-extrabold sm:text-3xl">
                Our Location Guide Map
              </h2>
              <div className="mx-auto mt-3 h-[3px] max-w-[380px] rounded-full bg-white/45" />
            </div>

            <div className="mt-8 overflow-hidden rounded-2xl bg-white shadow-xl">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3861.6479398832357!2d120.99862151086919!3d14.562114277958653!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3397c991472da61b%3A0x3a4930acd0ee798d!2s5441%20Curie%20St%2C%20Makati%20City%2C%201235%20Metro%20Manila!5e0!3m2!1sen!2sph!4v1774615488486!5m2!1sen!2sph"
                width="100%"
                height="420"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="TAMSI Location Guide Map"
                className="block w-full"
              />
            </div>
          </div>
        </section>
      </>
    </TrainingPublicShell>
  );
}

function Header({ goTo, onOpenMenu }) {
  return (
    <header className="ltc-header">
      <div className="ltc-container">
        <div className="ltc-nav">
          <button type="button" onClick={() => goTo(TRAINING_HOME_ROUTE)} className="ltc-logo">
            <img src={HEADER_LOGO_IMAGE} alt="TAMSI Logo" className="ltc-logo-icon" />
            <div>
              <h1 style={fontMontserrat}>TRAINING &amp; ASSESSMENT</h1>
              <p style={fontPontano}>Training and assessment portal.</p>
            </div>
          </button>

          <nav className="ltc-desktop-nav" aria-label="Training navigation">
            {TRAINING_NAV_ITEMS.map((item) => (
              <HeaderNavButton
                key={item.key}
                label={item.label}
                active={item.key === "contact"}
                onClick={() => goTo(item.path)}
              />
            ))}
          </nav>

          <div className="ltc-profile-wrap">
            <HeaderNavButton
              label="Sign In"
              className="ltc-sign-in-button"
              onClick={() => goTo(TRAINING_LOGIN_ROUTE)}
            />
          </div>

          <button type="button" onClick={onOpenMenu} className="ltc-menu-button" aria-label="Open menu">
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}

function HeaderNavButton({ label, active = false, onClick, className = "" }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`ltc-nav-link ${active ? "active" : ""} ${className}`}
      style={fontPoppins}
    >
      {label}
    </button>
  );
}

function Footer({ goTo }) {
  return (
    <footer className="ltc-footer">
      <div className="ltc-container ltc-footer-grid">
        <div>
          <button type="button" onClick={() => goTo(TRAINING_HOME_ROUTE)} className="ltc-footer-brand">
            <img src={FOOTER_LOGO_IMAGE} alt="Training Lumispire Logo" />
            <div className="ltc-footer-brand-copy">
              <h4 style={fontMontserrat}>TRAINING &amp; ASSESSMENT</h4>
              <p className="ltc-footer-brand-description" style={fontPontano}>
                Practical training, assessment, and learner support.
              </p>
            </div>
          </button>
        </div>

        <FooterColumn title="Menu">
          {TRAINING_FOOTER_NAV_ITEMS.map((item) => (
            <FooterLink key={item.key} onClick={() => goTo(item.path)}>
              {item.label}
            </FooterLink>
          ))}
        </FooterColumn>

        <FooterColumn title="Contact Information">
          <FooterText>{TRAINING_CONTACT_INFO.email1}</FooterText>
          <FooterText>{TRAINING_CONTACT_INFO.email2}</FooterText>
          <FooterText>{TRAINING_CONTACT_INFO.phone}</FooterText>
        </FooterColumn>

        <FooterColumn title="Address">
          <FooterText>{TRAINING_CONTACT_INFO.addressLine1}</FooterText>
          <FooterText>{TRAINING_CONTACT_INFO.addressLine2}</FooterText>
        </FooterColumn>

        <FooterColumn title="Follow Us">
          <a
            className="ltc-footer-link"
            href="https://www.facebook.com/profile.php?id=61571746334920&rdid=3bcMsbFVo3PBobtd&share_url=https%3A%2F%2Fwww.facebook.com%2Fshare%2F1D1g1d614L#"
            target="_blank"
            rel="noreferrer"
          >
            Facebook
          </a>
        </FooterColumn>
      </div>

      <div className="ltc-container ltc-copyright">
        <span style={fontPontano}>© 2026 LTC GROUP OF COMPANIES. All rights reserved.</span>
        <span style={fontPontano}>Developed by CRMS Tech Alliance</span>
      </div>
    </footer>
  );
}

function FooterColumn({ title, children }) {
  return (
    <div>
      <h5 style={fontMontserrat}>{title}</h5>
      <div>{children}</div>
    </div>
  );
}

function FooterLink({ children, onClick }) {
  return (
    <button type="button" onClick={onClick} className="ltc-footer-link" style={fontPontano}>
      {children}
    </button>
  );
}

function FooterText({ children }) {
  return <p style={fontPontano}>{children}</p>;
}

function MobileMenu({ onClose, goTo }) {
  return (
    <div className="ltc-sidebar-overlay">
      <div style={{ position: "absolute", inset: 0 }} onClick={onClose} />
      <div className="ltc-sidebar-panel">
        <div className="ltc-sidebar-top">
          <p className="ltc-sidebar-title" style={fontPoppins}>MENU</p>
          <button type="button" onClick={onClose} className="ltc-sidebar-close" aria-label="Close menu">✕</button>
        </div>

        {TRAINING_NAV_ITEMS.map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => goTo(item.path)}
            className={`ltc-sidebar-link ${item.key === "contact" ? "active" : ""}`}
            style={fontPoppins}
          >
            {item.label}
          </button>
        ))}

        <button type="button" onClick={() => goTo(TRAINING_LOGIN_ROUTE)} className="ltc-sidebar-link" style={fontPoppins}>
          Sign In
        </button>
      </div>
    </div>
  );
}

const contactPageStyleFixes = `
  .ltc-eyebrow,
  .training-hero-badge,
  .training-program-badge {
    font-size: 0 !important;
    line-height: 0 !important;
    color: transparent !important;
  }

  .ltc-eyebrow::before,
  .ltc-eyebrow::after {
    color: var(--gold-soft, #f6d77a) !important;
  }
`;

function FloatingHomeIconButton({ onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title="Back to Home"
      aria-label="Back to Home"
      className="group fixed bottom-28 right-6 z-[80] flex h-[74px] w-[74px] items-center justify-center rounded-full border-2 border-white/80 bg-[#2e5038] text-white shadow-2xl transition duration-300 hover:-translate-y-1 hover:scale-105 hover:bg-[#21442d] focus:outline-none focus:ring-4 focus:ring-white/30"
    >
      <span className="pointer-events-none absolute right-[86px] top-1/2 hidden -translate-y-1/2 whitespace-nowrap rounded-full bg-[#123a20] px-4 py-2 text-xs font-extrabold uppercase tracking-wide text-white shadow-xl group-hover:block">
        Back to Home
      </span>

      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.3"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-9 w-9"
      >
        <path d="m3 10.5 9-7 9 7" />
        <path d="M5 10v10h14V10" />
        <path d="M9 20v-6h6v6" />
      </svg>
    </button>
  );
}

function SectionHeading({ title }) {
  return (
    <div>
      <h2 className="text-center font-['Montserrat',sans-serif] text-2xl font-extrabold text-white sm:text-3xl">
        {title}
      </h2>
      <div className="mx-auto mt-3 h-[2px] max-w-[300px] rounded-full bg-white/45" />
    </div>
  );
}

function ContactField({ label, type = "text", name, value, onChange, required = false }) {
  return (
    <div>
      <label className="mb-1 block text-xs font-extrabold text-white">
        {label}
      </label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        className="h-9 w-full rounded-full border-2 border-white/80 bg-transparent px-4 text-sm font-semibold text-white outline-none transition placeholder:text-white/50 focus:border-white"
      />
    </div>
  );
}

function ContactItem({ icon, children }) {
  return (
    <div className="flex items-start gap-4">
      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center text-white">
        {icon}
      </div>
      <div className="space-y-1 text-sm font-extrabold leading-snug text-white">
        {children}
      </div>
    </div>
  );
}

function LocationIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none">
      <path
        d="M12 21C12 21 18 15.6 18 10.5C18 7.186 15.314 4.5 12 4.5C8.686 4.5 6 7.186 6 10.5C6 15.6 12 21 12 21Z"
        stroke="currentColor"
        strokeWidth="2"
      />
      <circle cx="12" cy="10.5" r="2.5" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none">
      <path
        d="M6.6 10.8C8.2 13.9 10.7 16.4 13.8 18L16.2 15.6C16.5 15.3 17 15.2 17.4 15.3C18.7 15.7 20.1 16 21.5 16C22.1 16 22.5 16.4 22.5 17V21C22.5 21.6 22.1 22 21.5 22C10.7 22 2 13.3 2 2.5C2 1.9 2.4 1.5 3 1.5H7C7.6 1.5 8 1.9 8 2.5C8 3.9 8.3 5.3 8.7 6.6C8.8 7 8.7 7.5 8.4 7.8L6.6 10.8Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none">
      <rect x="3" y="5" width="18" height="14" rx="1.5" stroke="currentColor" strokeWidth="1.8" />
      <path d="M4 7L12 13L20 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none">
      <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.8" />
      <path d="M12 7V12L15.5 14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
