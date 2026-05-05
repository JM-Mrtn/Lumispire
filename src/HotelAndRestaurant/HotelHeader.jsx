import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function getHotelToken() {
  return localStorage.getItem("token") || localStorage.getItem("hotelToken") || "";
}

export default function HotelHeader({ variant = "light", fixed = false }) {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const isDark = variant === "dark";
  const textClass = isDark ? "text-white hover:text-white/80" : "text-[#385541] hover:text-[#1f3528]";
  const borderClass = isDark ? "border-white/20 bg-white/10" : "border-[#385541]/15 bg-white";
  const headerBg = isDark ? "bg-black/10 backdrop-blur-sm" : "bg-white shadow-[0_3px_0_rgba(0,0,0,0.18)]";
  const position = fixed ? "fixed left-0 right-0 top-0" : "relative w-full";

  const goToProfileOrSignIn = () => {
    navigate(getHotelToken() ? "/hotel-profile" : "/hotel-login");
  };

  const navItems = [
    { label: "HOME", path: "/hotel-resort" },
    { label: "VIRTUAL TOUR", path: "/virtual-tour" },
    { label: "FAQS", path: "/hotel-faqs" },
    { label: "CONTACT", path: "/hotel-contact-us" },
  ];

  return (
    <header className={`${position} z-40 ${headerBg}`}>
      <div className="flex h-[78px] w-full items-center justify-between px-5 sm:px-8 lg:px-12">
        <button
          type="button"
          onClick={() => navigate("/hotel-resort")}
          className="flex items-center gap-4"
          aria-label="Go to Hotel and Resort home"
        >
          <img
            src="/HotelLumispireLogo.png"
            alt="Lumispire Logo"
            className="h-[52px] w-[52px] rounded-full object-cover"
            onError={(event) => {
              event.currentTarget.src = "/Logo.jpg";
            }}
          />
          <span className={`font-['Montserrat',sans-serif] text-[20px] font-extrabold uppercase tracking-wide sm:text-[24px] ${isDark ? "text-white" : "text-[#385541]"}`}>
            Hotel &amp; Resort
          </span>
        </button>

        <nav className="hidden items-center gap-8 md:flex">
          {navItems.map((item) => (
            <button
              key={item.path}
              type="button"
              onClick={() => navigate(item.path)}
              className={`font-['Montserrat',sans-serif] text-[14px] font-bold uppercase tracking-wide transition ${textClass}`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <button
          type="button"
          onClick={goToProfileOrSignIn}
          className={`hidden font-['Montserrat',sans-serif] text-[14px] font-bold uppercase tracking-wide transition md:block ${textClass}`}
        >
          {getHotelToken() ? "PROFILE" : "SIGN IN"}
        </button>

        <button
          type="button"
          onClick={() => setIsOpen(true)}
          aria-label="Open menu"
          className={`rounded-full border p-2 md:hidden ${borderClass} ${isDark ? "text-white" : "text-[#385541]"}`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      {isOpen ? (
        <div className="fixed inset-0 z-[1000] md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 top-0 h-full w-[300px] bg-white p-5 shadow-2xl">
            <div className="mb-6 flex items-center justify-between">
              <div className="font-['Montserrat',sans-serif] text-lg font-bold text-[#385541]">
                MENU
              </div>
              <button type="button" onClick={() => setIsOpen(false)} className="rounded-md p-2 text-[#385541] hover:bg-black/5" aria-label="Close menu">
                ✕
              </button>
            </div>
            <div className="space-y-3">
              {navItems.map((item) => (
                <button
                  key={item.path}
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    navigate(item.path);
                  }}
                  className="w-full rounded-xl bg-[#385541]/10 py-4 font-['Montserrat',sans-serif] text-sm font-semibold tracking-wide text-[#385541] transition hover:bg-[#385541]/20"
                >
                  {item.label}
                </button>
              ))}
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  goToProfileOrSignIn();
                }}
                className="w-full rounded-xl bg-[#385541] py-4 font-['Montserrat',sans-serif] text-sm font-semibold tracking-wide text-white transition hover:bg-[#2d4435]"
              >
                {getHotelToken() ? "PROFILE" : "SIGN IN"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
}
