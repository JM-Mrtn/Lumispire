// src/TrainingAndAssessment/TrainingSubmit.jsx
import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import TrainingChatbot from "./TrainingChatbot";

const HEADER_LOGO_IMAGE = "/TamsiLogo.png";
const FOOTER_LOGO_IMAGE = "/TrainingLumispireLogo.png";
const HERO_IMAGE = "/tamsi-banner.jpg";

const NAV_ITEMS = [
  { label: "Home", path: "/training" },
  { label: "Course", path: "/training-course" },
  { label: "Requirements", path: "/training-requirements" },
  { label: "Contact", path: "/training-contact-us" },
  { label: "FAQs", path: "/training-faqs" },
  { label: "Certificate Validation", path: "/training-certificate-validation" },
];

export default function TrainingSubmit() {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const state = location.state || {};
  const firstName = state.firstName || "Applicant";
  const email = state.email || "";
  const course = state.course || "";
  const emailNoticeSent = Boolean(state.emailNoticeSent);

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#f8fbf9] text-[#071f14]">
      <SubmitHeader navigate={navigate} onOpenMenu={() => setMobileOpen(true)} />

      <main>
        <section className="relative isolate overflow-hidden bg-gradient-to-r from-[#03180f] via-[#082719] to-[#155f3b] text-white">
          <img
            src={HERO_IMAGE}
            alt=""
            aria-hidden="true"
            loading="eager"
            decoding="async"
            className="absolute inset-0 -z-20 h-full w-full object-cover opacity-30"
          />
          <div
            className="absolute inset-0 -z-10 bg-gradient-to-r from-[#02120bf5] via-[#052517e8] to-[#0c4027c2]"
            aria-hidden="true"
          />
          <div className="mx-auto w-[92%] max-w-[1180px] py-20 text-center sm:py-24">
            <h1 className="text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl">
              Application Submitted
            </h1>
            <p className="mx-auto mt-5 max-w-3xl text-base font-semibold leading-7 text-white/80">
              Your enrollment request has been sent to TAMSI for review.
            </p>
          </div>
        </section>

        <section className="bg-[#2e5038] px-5 py-12 text-white sm:px-8 lg:px-12">
          <div className="mx-auto grid max-w-[1280px] gap-8 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="rounded-[28px] bg-white p-6 text-[#395345] shadow-xl sm:p-8">
              <div className="inline-flex rounded-full bg-[#eef1e7] px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-[#6f7c71]">
                Success
              </div>

              <h2 className="mt-5 font-['Montserrat',sans-serif] text-3xl font-extrabold text-[#395345] sm:text-4xl">
                Thank you, {firstName}!
              </h2>

              <p className="mt-4 max-w-2xl text-sm leading-7 text-[#5f6e63] sm:text-base">
                Your TAMSI enrollment application was submitted successfully.
                Please wait while the training admin reviews your information and
                uploaded requirements.
              </p>

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <InfoCard label="Submitted Name" value={firstName} />
                <InfoCard label="Course" value={course || "Not specified"} />
                <InfoCard label="Email" value={email || "Not specified"} />
                <InfoCard
                  label="Email Notice"
                  value={emailNoticeSent ? "Sent" : "Recorded"}
                />
              </div>

              <div className="mt-8 rounded-2xl bg-[#f7f8f3] p-5 ring-1 ring-[#e4e9de]">
                <h3 className="font-['Montserrat',sans-serif] text-xl font-extrabold text-[#395345]">
                  What happens next?
                </h3>

                <ul className="mt-4 space-y-3 text-sm leading-7 text-[#5f6e63]">
                  <li>• Your submitted documents will be reviewed by the training admin.</li>
                  <li>• Wait for an update regarding your application approval.</li>
                  <li>• Once approved, your trainee account details will be sent to your email.</li>
                </ul>
              </div>

              <div className="mt-8 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => navigate("/training")}
                  className="rounded-full bg-[#395345] px-6 py-3 text-sm font-bold uppercase tracking-[0.14em] text-white transition hover:bg-[#2f463a]"
                >
                  Back to Training
                </button>

                <button
                  type="button"
                  onClick={() => navigate("/training-login")}
                  className="rounded-full border border-[#c8ccbf] bg-white px-6 py-3 text-sm font-bold uppercase tracking-[0.14em] text-[#395345] transition hover:bg-[#f1f4ec]"
                >
                  Go to Sign In
                </button>
              </div>
            </div>

            <div className="rounded-[28px] bg-[#dbe2d1] p-6 shadow-xl ring-1 ring-black/5 sm:p-8">
              <div className="inline-flex rounded-full bg-white/80 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-[#6f7c71]">
                Reminder
              </div>

              <h3 className="mt-5 font-['Montserrat',sans-serif] text-2xl font-extrabold text-[#395345]">
                Keep your email active
              </h3>

              <p className="mt-4 text-sm leading-7 text-[#5f6e63]">
                Make sure the email you used in your enrollment form stays active,
                because TAMSI will use it for updates and approval notices.
              </p>

              <div className="mt-6 rounded-2xl bg-white/85 p-5 ring-1 ring-black/5">
                <div className="text-xs font-bold uppercase tracking-[0.16em] text-[#748175]">
                  Note
                </div>
                <p className="mt-3 text-sm leading-7 text-[#627165]">
                  {emailNoticeSent
                    ? "A confirmation email has been sent to your submitted email address."
                    : "Your application was saved successfully. If no confirmation email arrives, your submission is still recorded in the system."}
                </p>
              </div>

              <div className="mt-6 rounded-2xl bg-white/85 p-5 ring-1 ring-black/5">
                <div className="text-xs font-bold uppercase tracking-[0.16em] text-[#748175]">
                  Support
                </div>
                <p className="mt-3 text-sm leading-7 text-[#627165]">
                  If you need help with your application, contact the TAMSI training
                  office through the contact details on the training pages.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <SubmitFooter navigate={navigate} />

      {mobileOpen ? (
        <SubmitMobileMenu navigate={navigate} onClose={() => setMobileOpen(false)} />
      ) : null}

      <button
        type="button"
        onClick={() => navigate("/")}
        aria-label="Back to LTC Group home"
        title="Back to Home"
        className="fixed bottom-[104px] right-6 z-[80] inline-flex h-16 w-16 items-center justify-center rounded-full border border-black/10 bg-white p-1.5 shadow-xl transition hover:-translate-y-1"
      >
        <img
          src={HEADER_LOGO_IMAGE}
          alt=""
          aria-hidden="true"
          width="52"
          height="52"
          className="h-full w-full rounded-full object-contain"
        />
      </button>

      <TrainingChatbot />
    </div>
  );
}

function SubmitHeader({ navigate, onOpenMenu }) {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#082719] shadow-[0_10px_34px_rgba(7,31,20,.14)]">
      <div className="mx-auto flex min-h-[76px] w-full max-w-[1440px] items-center justify-between gap-5 px-4 sm:px-6 lg:px-10">
        <button
          type="button"
          onClick={() => navigate("/training")}
          className="flex min-h-[44px] items-center gap-3 text-left text-white"
          aria-label="Training and Assessment Home"
        >
          <img
            src={HEADER_LOGO_IMAGE}
            alt="TAMSI Logo"
            width="42"
            height="42"
            decoding="async"
            className="h-[42px] w-[42px] rounded-full bg-white object-contain"
          />
          <span>
            <span className="block text-[18px] font-black uppercase leading-none tracking-tight">
              TRAINING &amp; ASSESSMENT
            </span>
            <span className="mt-1 block text-[11px] font-semibold text-white/70">
              Training and assessment portal.
            </span>
          </span>
        </button>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Training navigation">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.path}
              type="button"
              onClick={() => navigate(item.path)}
              className="min-h-[44px] rounded-full px-4 text-[12px] font-extrabold uppercase tracking-wide text-white/80 transition hover:bg-white/10 hover:text-white"
            >
              {item.label}
            </button>
          ))}
          <button
            type="button"
            onClick={() => navigate("/training-login")}
            className="ml-2 min-h-[44px] rounded-full bg-gradient-to-r from-[#f4d484] to-[#d7a84d] px-5 text-[12px] font-black uppercase tracking-wide text-[#102418]"
          >
            Sign In
          </button>
        </nav>

        <button
          type="button"
          onClick={onOpenMenu}
          className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 text-white lg:hidden"
          aria-label="Open menu"
        >
          <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" aria-hidden="true">
            <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
      </div>
    </header>
  );
}

function SubmitMobileMenu({ navigate, onClose }) {
  return (
    <div className="fixed inset-0 z-[100] lg:hidden">
      <button
        type="button"
        aria-label="Close menu"
        onClick={onClose}
        className="absolute inset-0 bg-black/45"
      />
      <aside className="absolute right-0 top-0 h-full w-[310px] max-w-[86vw] bg-white p-5 shadow-2xl">
        <div className="flex items-center justify-between border-b border-black/10 pb-4">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-[#174a30]">
            Menu
          </p>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-[#f2f4f2] text-lg font-black text-[#071f14]"
            aria-label="Close menu"
          >
            ✕
          </button>
        </div>

        <nav className="mt-4 grid gap-2" aria-label="Mobile training navigation">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.path}
              type="button"
              onClick={() => {
                onClose();
                navigate(item.path);
              }}
              className="min-h-[48px] rounded-xl px-4 text-left text-sm font-extrabold text-[#071f14] hover:bg-[#eef3e9]"
            >
              {item.label}
            </button>
          ))}
          <button
            type="button"
            onClick={() => {
              onClose();
              navigate("/training-login");
            }}
            className="min-h-[48px] rounded-xl bg-[#f4d484] px-4 text-left text-sm font-black text-[#102418]"
          >
            Sign In
          </button>
        </nav>
      </aside>
    </div>
  );
}

function FooterColumn({ title, children }) {
  return (
    <div>
      <div className="text-xs font-black uppercase tracking-[0.14em] text-[#f4d484]">
        {title}
      </div>
      <div className="mt-3 space-y-1.5 text-[13px] font-semibold leading-5 text-white/70">
        {children}
      </div>
    </div>
  );
}

function SubmitFooter({ navigate }) {
  return (
    <footer
      className="border-t border-white/10 bg-[#082719] text-white"
      aria-label="Training and Assessment footer"
    >
      <div className="mx-auto grid w-full max-w-[1440px] gap-7 px-4 py-8 sm:px-6 md:grid-cols-2 lg:grid-cols-[1.4fr_.8fr_1.2fr_1fr_.7fr] lg:px-10">
        <button
          type="button"
          onClick={() => navigate("/training")}
          className="flex min-h-[44px] items-center gap-4 text-left"
        >
          <img
            src={FOOTER_LOGO_IMAGE}
            alt="Training Lumispire Logo"
            width="110"
            loading="lazy"
            decoding="async"
            className="h-auto w-[110px] object-contain"
          />
          <span>
            <span className="block text-lg font-black uppercase leading-tight">
              TRAINING &amp; ASSESSMENT
            </span>
            <span className="mt-2 block max-w-[280px] text-[13px] font-semibold leading-5 text-white/70">
              Practical training, assessment, and learner support.
            </span>
          </span>
        </button>

        <FooterColumn title="Menu">
          <button type="button" onClick={() => navigate("/training")} className="block min-h-[44px] text-left hover:text-white">Home</button>
          <button type="button" onClick={() => navigate("/training-course")} className="block min-h-[44px] text-left hover:text-white">Course</button>
          <button type="button" onClick={() => navigate("/training-certificate-validation")} className="block min-h-[44px] text-left hover:text-white">Certificate Validation</button>
          <button type="button" onClick={() => navigate("/training-login")} className="block min-h-[44px] text-left hover:text-white">Sign In</button>
        </FooterColumn>

        <FooterColumn title="Contact Information">
          <p>lorengladius@ltcmultiservices.com</p>
          <p>ltc.tamsi@gmail.com</p>
          <p>+639516281271 / +639959808051</p>
        </FooterColumn>

        <FooterColumn title="Address">
          <p>2/F 5441 CURRIE STREET,</p>
          <p>PALANAN, MAKATI CITY</p>
        </FooterColumn>

        <FooterColumn title="Follow Us">
          <a
            href="https://www.facebook.com/profile.php?id=61571746334920"
            target="_blank"
            rel="noreferrer"
            className="inline-flex min-h-[44px] items-center hover:text-white"
          >
            Facebook
          </a>
        </FooterColumn>
      </div>

      <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-1 border-t border-white/10 px-4 py-4 text-[11px] font-semibold text-white/50 sm:flex-row sm:justify-between sm:px-6 lg:px-10">
        <span>© 2026 LTC GROUP OF COMPANIES. All rights reserved.</span>
        <span>Developed by CRMS Tech Alliance</span>
      </div>
    </footer>
  );
}

function InfoCard({ label, value }) {
  return (
    <div className="rounded-2xl bg-[#f7f8f3] p-4 ring-1 ring-[#e4e9de]">
      <div className="text-xs font-bold uppercase tracking-[0.16em] text-[#748175]">
        {label}
      </div>
      <div className="mt-2 break-words text-sm font-semibold text-[#395345]">
        {value}
      </div>
    </div>
  );
}
