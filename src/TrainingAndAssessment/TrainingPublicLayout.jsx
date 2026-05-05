// src/TrainingAndAssessment/TrainingPublicLayout.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export const TRAINING_CONTACT_INFO = {
  addressLine1: "2/F 5441 Curie Street,",
  addressLine2: "Palanan, Makati City",
  addressFull: "2/F 5441 Curie Street, Palanan, Makati City",
  phone: "09959808051 / 09516281271",
  email1: "ltc.tamsi@gmail.com",
  email2: "lorengladis@ltcmultiservices.com",
  hours: "Monday - Thursday 8:00 AM - 5:00 PM",
};

const NAV_ITEMS = [
  { key: "home", label: "Home", path: "/training" },
  { key: "course", label: "Course", path: "/training-course" },
  { key: "requirements", label: "Requirements", path: "/training-requirements" },
  { key: "contact", label: "Contact", path: "/training-contact-us" },
  { key: "faqs", label: "FAQs", path: "/training-faqs" },
];

function getProfilePath() {
  const token = localStorage.getItem("trainingToken");
  return token ? "/trainee-profile" : "/trainee-login";
}

export function TrainingPublicShell({
  active = "home",
  title = "Training & Assessment",
  subtitle = "Begin your journey with TAMSI today",
  children,
  showHero = true,
  showTitle = true,
}) {
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const goTo = (path) => {
    setMobileOpen(false);
    navigate(path);
  };

  return (
    <div className="min-h-screen bg-[#123a20] text-[#395345]">
      <TrainingPublicHeader
        active={active}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
        goTo={goTo}
      />

      <main>
        {showHero ? <TrainingHero /> : null}
        {showTitle ? <TrainingPageTitle title={title} subtitle={subtitle} /> : null}
        {typeof children === "function" ? children({ goTo }) : children}
        <div className="h-[55px] bg-[#123a20]" />
      </main>

      <TrainingPublicFooter goTo={goTo} />
    </div>
  );
}

export function TrainingPublicHeader({ active, mobileOpen, setMobileOpen, goTo }) {
  const profilePath = getProfilePath();
  const profileLabel = localStorage.getItem("trainingToken") ? "Profile" : "Sign In";

  return (
    <header className="sticky top-0 z-50 border-b border-[#d7ddcf] bg-white/95 shadow-sm backdrop-blur">
      <div className="mx-auto flex h-[72px] max-w-[1440px] items-center justify-between px-5 sm:px-8 lg:px-12">
        <button
          type="button"
          onClick={() => goTo("/training")}
          className="flex items-center gap-3"
          aria-label="TAMSI Home"
        >
          <img
            src="/TAMSILogoTransparent.png"
            alt="TAMSI Logo"
            className="h-12 w-12 object-contain"
            onError={(e) => {
              e.currentTarget.src =
                "https://placehold.co/80x80/d7ddd4/45674b?text=T";
            }}
          />

          <span className="font-['Montserrat',sans-serif] text-2xl font-extrabold tracking-wide text-[#45674b] sm:text-[28px]">
            TAMSI
          </span>
        </button>

        <nav className="hidden items-center gap-5 lg:flex xl:gap-7">
          {NAV_ITEMS.map((item) => (
            <HeaderNavButton
              key={item.key}
              label={item.label}
              active={active === item.key}
              onClick={() => goTo(item.path)}
            />
          ))}
        </nav>

        <div className="hidden lg:block">
          <button
            type="button"
            onClick={() => goTo(profilePath)}
            className="text-[11px] font-bold uppercase tracking-wide text-[#58705d] transition hover:text-[#173d25] xl:text-[12px]"
          >
            {profileLabel}
          </button>
        </div>

        <button
          type="button"
          onClick={() => setMobileOpen((prev) => !prev)}
          className="rounded-md border border-[#45674b]/20 bg-[#f7faf2] px-3 py-2 text-xs font-bold uppercase tracking-wide text-[#45674b] lg:hidden"
        >
          Menu
        </button>
      </div>

      {mobileOpen ? (
        <div className="border-t border-[#d7ddcf] bg-white px-5 py-3 lg:hidden">
          <div className="space-y-1 rounded-xl bg-[#f4f7ef] p-2">
            {NAV_ITEMS.map((item) => (
              <MobileHeaderButton
                key={item.key}
                label={item.label}
                active={active === item.key}
                onClick={() => goTo(item.path)}
              />
            ))}

            <MobileHeaderButton
              label={profileLabel}
              onClick={() => goTo(profilePath)}
            />
          </div>
        </div>
      ) : null}
    </header>
  );
}

export function TrainingHero() {
  return (
    <section className="h-[180px] overflow-hidden bg-[#cad1c5] sm:h-[230px] md:h-[290px]">
      <img
        src="/tamsi-building.jpg"
        alt="TAMSI Building"
        className="h-full w-full object-cover"
        onError={(e) => {
          e.currentTarget.src =
            "https://placehold.co/1600x420/d7ddd4/45674b?text=TAMSI+Training+And+Assessment";
        }}
      />
    </section>
  );
}

export function TrainingPageTitle({ title, subtitle = "" }) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#486b4b] via-[#123a20] to-[#123a20] px-5 py-9 text-white sm:px-8 lg:px-12">
      <DecorativeCircles position="left" />
      <DecorativeCircles position="right" />

      <div className="relative mx-auto max-w-[1280px] text-center">
        <h1 className="font-['Montserrat',sans-serif] text-3xl font-extrabold drop-shadow-md sm:text-4xl md:text-5xl">
          {title}
        </h1>

        <div className="mx-auto mt-4 h-[3px] max-w-[520px] rounded-full bg-white/45" />

        {subtitle ? (
          <p className="mx-auto mt-4 max-w-3xl text-sm font-semibold leading-6 text-white/85 sm:text-base">
            {subtitle}
          </p>
        ) : null}
      </div>
    </section>
  );
}

export function TrainingPublicFooter({ goTo }) {
  return (
    <footer className="bg-white text-[#4d6f55]">
      <div className="mx-auto max-w-[1440px] px-5 py-3 sm:px-8 lg:px-12">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-[1.05fr_1.05fr_1.3fr_1fr_0.65fr]">
          <div className="border-[#d6ded2] md:border-r md:pr-5">
            <div className="flex items-center gap-3">
              <img
                src="/LTCLogo.png"
                alt="Lumispire Logo"
                className="h-10 w-10 object-contain"
                onError={(e) => {
                  e.currentTarget.src =
                    "https://placehold.co/80x80/ffffff/4d6f55?text=L";
                }}
              />

              <h2 className="font-['Montserrat',sans-serif] text-2xl font-extrabold tracking-wide text-[#45674b]">
                LUMISPIRE
              </h2>
            </div>
          </div>

          <div className="border-[#d6ded2] md:border-r md:px-5">
            <h3 className="text-xs font-extrabold text-[#45674b]">Menu</h3>

            <div className="mt-1 grid grid-cols-2 gap-x-5 gap-y-0.5 text-[11px] font-semibold text-[#6b776d]">
              <FooterButton label="Home" onClick={() => goTo("/training")} />
              <FooterButton
                label="Course"
                onClick={() => goTo("/training-course")}
              />
              <FooterButton
                label="Requirements"
                onClick={() => goTo("/training-requirements")}
              />
              <FooterButton
                label="Contact"
                onClick={() => goTo("/training-contact-us")}
              />
              <FooterButton label="FAQs" onClick={() => goTo("/training-faqs")} />
              <FooterButton label="Profile" onClick={() => goTo(getProfilePath())} />
            </div>
          </div>

          <div className="border-[#d6ded2] md:border-r md:px-5">
            <h3 className="text-xs font-extrabold text-[#45674b]">
              Contact Information
            </h3>

            <div className="mt-1 space-y-0.5 text-[11px] font-semibold leading-snug text-[#6b776d]">
              <p>{TRAINING_CONTACT_INFO.email1}</p>
              <p>{TRAINING_CONTACT_INFO.email2}</p>
              <p>{TRAINING_CONTACT_INFO.phone}</p>
            </div>
          </div>

          <div className="border-[#d6ded2] md:border-r md:px-5">
            <h3 className="text-xs font-extrabold text-[#45674b]">Address</h3>

            <div className="mt-1 space-y-0.5 text-[11px] font-semibold leading-snug text-[#6b776d]">
              <p>{TRAINING_CONTACT_INFO.addressLine1}</p>
              <p>{TRAINING_CONTACT_INFO.addressLine2}</p>
            </div>
          </div>

          <div className="md:pl-5">
            <h3 className="text-xs font-extrabold text-[#45674b]">Follow Us</h3>
          </div>
        </div>

        <div className="mt-2 flex flex-col gap-1 border-t border-[#d6ded2] pt-2 text-[9px] font-bold text-[#7b897e] sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 LTC GROUP OF COMPANIES. All rights reserved.</p>
          <p>Developed by CRMS Tech Alliance</p>
        </div>
      </div>
    </footer>
  );
}

export function PaperIcon({ className = "h-14 w-14" }) {
  return (
    <svg
      viewBox="0 0 90 90"
      className={`${className} shrink-0 text-[#8a936e]`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M28 18H58L68 28V68C68 70.2 66.2 72 64 72H28C25.8 72 24 70.2 24 68V22C24 19.8 25.8 18 28 18Z"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <path
        d="M58 18V29H68"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <path
        d="M19 25H53L61 33V75"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinejoin="round"
        opacity="0.75"
      />
      <path d="M34 36H55" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      <path d="M34 46H55" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      <path d="M34 56H50" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      <path
        d="M29 36L31 38L34 34"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M29 46L31 48L34 44"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M29 56L31 58L34 54"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function HeaderNavButton({ label, active = false, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "text-[11px] font-bold uppercase tracking-wide transition xl:text-[12px]",
        active
          ? "border-b-2 border-[#45674b] pb-1 text-[#173d25]"
          : "text-[#58705d] hover:text-[#173d25]",
      ].join(" ")}
    >
      {label}
    </button>
  );
}

function MobileHeaderButton({ label, active = false, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "block w-full rounded-lg px-4 py-3 text-left text-sm",
        active
          ? "bg-white font-bold text-[#173d25]"
          : "font-semibold text-[#45674b] hover:bg-white",
      ].join(" ")}
    >
      {label}
    </button>
  );
}

function FooterButton({ label, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="text-left hover:text-[#173d25]"
    >
      {label}
    </button>
  );
}

function DecorativeCircles({ position }) {
  const isLeft = position === "left";

  return (
    <div
      className={[
        "pointer-events-none absolute top-6 opacity-35",
        isLeft ? "left-8" : "right-20",
      ].join(" ")}
    >
      <span className="absolute left-0 top-0 h-11 w-11 rounded-full bg-[#a8c39f]" />
      <span className="absolute left-7 top-3 h-12 w-12 rounded-full bg-[#a8c39f]" />
      <span className="absolute left-0 top-16 h-9 w-9 rounded-full bg-[#a8c39f]" />
    </div>
  );
}
