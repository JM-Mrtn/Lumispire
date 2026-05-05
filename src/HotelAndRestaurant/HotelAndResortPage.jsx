import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const HERO_IMAGES = ["/HotelLanding1.png", "/HotelLanding2.png"];

const HotelAndResortPage = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [currentBg, setCurrentBg] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBg((prev) => (prev + 1) % HERO_IMAGES.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const goToProfile = () => {
    const token = localStorage.getItem("token");
    if (token) {
      navigate("/hotel-profile");
    } else {
      navigate("/hotel-login");
    }
  };

  return (
    <div className="min-h-screen bg-black font-['Inter',sans-serif]">
      <section className="relative min-h-screen overflow-hidden bg-black">
        {/* Background Images */}
        {HERO_IMAGES.map((image, index) => (
          <img
            key={index}
            src={image}
            alt={`Hotel and Resort background ${index + 1}`}
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${
              currentBg === index ? "opacity-100" : "opacity-0"
            }`}
          />
        ))}

        {/* Overlays */}
        <div className="absolute inset-0 bg-black/30" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/45 via-black/15 to-black/35" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-black/10" />

        {/* Top Navigation */}
        <div className="absolute inset-x-0 top-0 z-30">
          <div className="mx-auto flex w-full max-w-[1800px] items-center justify-between px-6 py-6 md:px-10 xl:px-14">
            {/* Logo */}
            <button
              onClick={() => navigate("/")}
              className="flex items-center gap-3 text-left"
              aria-label="Go to Home"
              type="button"
            >
              <img
                src="/HotelLumispireLogo.png"
                alt="Lumispire Logo"
                className="h-12 w-12 rounded-full object-cover md:h-14 md:w-14"
              />
              <span className="font-['Montserrat',sans-serif] text-[20px] font-semibold tracking-[0.24em] text-white md:text-[26px]">
                LUMISPIRE
              </span>
            </button>

            {/* Desktop Nav */}
            <nav className="absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 items-center gap-10 lg:flex xl:gap-14">
              <NavButton label="HOME" onClick={() => navigate("/")} />
              <NavButton
                label="VIRTUAL TOUR"
                onClick={() => navigate("/virtual-tour")}
              />
              <NavButton
                label="CONTACT"
                onClick={() => navigate("/hotel-contact-us")}
              />
            </nav>

            {/* Desktop Profile */}
            <div className="hidden lg:block">
              <button
                onClick={goToProfile}
                type="button"
                className="font-['Montserrat',sans-serif] text-[17px] font-semibold uppercase tracking-wide text-white transition hover:text-white/80"
              >
                PROFILE
              </button>
            </div>

            {/* Mobile Menu */}
            <button
              className="rounded-full border border-white/20 bg-white/10 p-2 text-white backdrop-blur-sm lg:hidden"
              onClick={() => setIsOpen(true)}
              aria-label="Open menu"
              type="button"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-7 w-7"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.9}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Hero Content */}
        <div className="relative z-20 flex min-h-screen items-center">
          <div className="mx-auto w-full max-w-[1800px] px-6 pb-[190px] pt-[130px] md:px-10 md:pb-[150px] xl:px-14">
            <div className="max-w-[1100px]">
              <h1 className="font-['Montserrat',sans-serif] text-[58px] font-extrabold uppercase leading-[0.92] tracking-[-0.05em] text-white sm:text-[78px] md:text-[106px] lg:text-[128px] xl:text-[145px] xl:whitespace-nowrap">
                HOTEL &amp; RESORT
              </h1>

              <p className="mt-4 max-w-[780px] font-['Inter',sans-serif] text-[18px] leading-[1.08] text-white/95 sm:text-[24px] md:text-[30px] lg:text-[31px]">
                Seamless events, comfortable stays, and flexible spaces that
                feel like home.
              </p>

              <button
                onClick={() => navigate("/resort-venue")}
                type="button"
                className="mt-10 inline-flex h-[74px] min-w-[260px] items-center justify-center rounded-[26px] border border-white/40 bg-[linear-gradient(180deg,rgba(118,132,73,0.78)_0%,rgba(74,88,48,0.78)_100%)] px-10 font-['Poppins',sans-serif] text-[27px] font-semibold text-white shadow-[0_14px_35px_rgba(0,0,0,0.28)] backdrop-blur-md transition hover:scale-[1.02]"
              >
                Explore
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Slider Dots */}
        <div className="absolute bottom-6 left-1/2 z-30 flex -translate-x-1/2 items-center gap-3">
          {HERO_IMAGES.map((_, index) => (
            <button
              key={index}
              type="button"
              onClick={() => setCurrentBg(index)}
              aria-label={`Show image ${index + 1}`}
              className={`h-4 w-4 rounded-full border transition ${
                currentBg === index
                  ? "scale-110 border-white bg-white"
                  : "border-white/70 bg-white/30 hover:bg-white/55"
              }`}
            />
          ))}
        </div>

        {/* Desktop Bottom Locations */}
        <div className="pointer-events-none absolute inset-x-0 bottom-8 z-20 hidden px-6 md:block md:px-10 xl:px-14">
          <div className="mx-auto flex w-full max-w-[1800px] items-end justify-between">
            <LocationBlock
              title="Makati City"
              address="2/F 5441 Currie Street, Palanan, Makati City"
              align="left"
            />

            <LocationBlock
              title="Bacoor Cavite"
              address="2/F 5441 Currie Street, Palanan, Makati City"
              align="right"
            />
          </div>
        </div>

        {/* Mobile Bottom Locations */}
        <div className="relative z-20 -mt-24 px-6 pb-8 md:hidden">
          <div className="space-y-4">
            <LocationBlock
              title="Makati City"
              address="2/F 5441 Currie Street, Palanan, Makati City"
              align="left"
            />
            <LocationBlock
              title="Bacoor Cavite"
              address="2/F 5441 Currie Street, Palanan, Makati City"
              align="left"
            />
          </div>
        </div>

        {/* Mobile Slide Menu */}
        {isOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div
              className="absolute inset-0 bg-black/55"
              onClick={() => setIsOpen(false)}
            />

            <div className="absolute right-0 top-0 h-full w-[300px] border-l border-white/10 bg-[#111111]/95 p-5 shadow-2xl backdrop-blur-md">
              <div className="mb-6 flex items-center justify-between">
                <div className="font-['Montserrat',sans-serif] text-lg font-bold tracking-[0.18em] text-white">
                  MENU
                </div>

                <button
                  onClick={() => setIsOpen(false)}
                  className="rounded-full border border-white/20 p-2 text-white transition hover:bg-white/10"
                  aria-label="Close menu"
                  type="button"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.8}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <div className="space-y-3">
                <MenuItem
                  label="HOME"
                  onClick={() => {
                    setIsOpen(false);
                    navigate("/");
                  }}
                />
                <MenuItem
                  label="VIRTUAL TOUR"
                  onClick={() => {
                    setIsOpen(false);
                    navigate("/virtual-tour");
                  }}
                />
                <MenuItem
                  label="CONTACT"
                  onClick={() => {
                    setIsOpen(false);
                    navigate("/hotel-contact-us");
                  }}
                />
                <MenuItem
                  label="PROFILE"
                  onClick={() => {
                    setIsOpen(false);
                    goToProfile();
                  }}
                />
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};

function NavButton({ label, onClick }) {
  return (
    <button
      onClick={onClick}
      type="button"
      className="font-['Montserrat',sans-serif] text-[16px] font-semibold uppercase tracking-wide text-white transition hover:text-white/80 xl:text-[18px]"
    >
      {label}
    </button>
  );
}

function MenuItem({ label, onClick }) {
  return (
    <button
      onClick={onClick}
      type="button"
      className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-left font-['Montserrat',sans-serif] text-sm font-semibold tracking-[0.16em] text-white transition hover:bg-white/10"
    >
      {label}
    </button>
  );
}

function LocationBlock({ title, address, align = "left" }) {
  const rightSide = align === "right";

  return (
    <div
      className={`flex items-start gap-2 text-white ${
        rightSide ? "text-right" : "text-left"
      }`}
    >
      {!rightSide && <LocationIcon />}

      <div className="max-w-[320px]">
        <div className="font-['Montserrat',sans-serif] text-[24px] font-medium leading-none md:text-[34px]">
          {title}
        </div>
        <div className="mt-1 font-['Inter',sans-serif] text-[12px] font-medium leading-tight text-white/90 md:text-[15px]">
          {address}
        </div>
      </div>

      {rightSide && <LocationIcon />}
    </div>
  );
}

function LocationIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="mt-1 h-6 w-6 shrink-0 md:h-8 md:w-8"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.9}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 11.25a2.25 2.25 0 100-4.5 2.25 2.25 0 000 4.5z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M19.5 10.875C19.5 17.25 12 21.75 12 21.75s-7.5-4.5-7.5-10.875a7.5 7.5 0 1115 0z"
      />
    </svg>
  );
}

export default HotelAndResortPage;