import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import ChatbotWidget from "./ChatbotWidget";
import { getPublicLtcContent, pickPublicLtcImage } from "./ltcContentApi";

const CONTACT_ROUTE = "/contact";
const PROMO_SESSION_KEY = "ltc_home_promo_seen_session";

const LOGO_SRC = "/LTCLogo.jpg";
const BANNER_SRC = "/LTCBanner.png";

const fontMontserrat = { fontFamily: "'Montserrat', sans-serif" };
const fontPontano = { fontFamily: "'Pontano Sans', sans-serif" };
const fontPoppins = { fontFamily: "'Poppins', sans-serif" };

const Home = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isPromoOpen, setIsPromoOpen] = useState(() => {
    try {
      return sessionStorage.getItem(PROMO_SESSION_KEY) !== "true";
    } catch {
      return true;
    }
  });
  const [currentPromoIndex, setCurrentPromoIndex] = useState(0);
  const [ltcContent, setLtcContent] = useState(null);

  const navigate = useNavigate();
  const location = useLocation();

  const promoItems = [
    {
      image: "/HotelAds.png",
      title: "Hotel & Resort Services",
      description:
        "Discover hospitality-focused services designed to deliver excellent guest experiences.",
      buttonText: "View Hotel & Resort",
      route: "/hotel-resort",
    },
    {
      image: "/TrainingAds.png",
      title: "Training & Assessment",
      description:
        "Explore skills training, development programs, and assessment services for learners and professionals.",
      buttonText: "View Training & Assessment",
      route: "/training-assessment",
    },
    {
      image: "/ManpowerAds.png",
      title: "Manpower Services",
      description:
        "Find reliable staffing and workforce support solutions tailored for your organization.",
      buttonText: "View Manpower Services",
      route: "/manpower-services",
    },
  ];

  const goTo = (path) => {
    navigate(path);
    setIsSidebarOpen(false);
  };

  const closePromo = () => {
    try {
      sessionStorage.setItem(PROMO_SESSION_KEY, "true");
    } catch {}
    setIsPromoOpen(false);
  };

  const goToPromoRoute = () => {
    const activePromo = promoItems[currentPromoIndex];
    if (!activePromo?.route) return;
    closePromo();
    navigate(activePromo.route);
  };

  const navLinks = [
    { label: "HOME", to: "/" },
    { label: "ABOUT US", to: "/about-us" },
    { label: "TEAM", to: "/team" },
    { label: "CONTACT", to: CONTACT_ROUTE },
  ];

  useEffect(() => {
    let mounted = true;

    getPublicLtcContent()
      .then((data) => {
        if (mounted) setLtcContent(data.content || null);
      })
      .catch(() => {
        if (mounted) setLtcContent(null);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const defaultValues = [
    {
      title: "INTEGRITY",
      body:
        "We honor our word and keep our commitments. We keep ourselves a reliable source of information because it is the foundation of our individual and corporate actions that drives the organization of which we are proud. We keep ourselves objective, honest and balanced in making decisions and actions for the common good of our stakeholders.",
    },
    {
      title: "GOD-FEARING",
      body:
        "We put GOD first into Everything that we do. We respect individual differences and take control to overcome issues that may affect a harmonious working relationship. We seek to understand all aspects of every problem and get to the real issue to give immediate remedial action, even if it would take so much effort from our end.",
    },
    {
      title: "HARDWORK",
      body:
        "We convert ideas into action, tackle tasks without delay as we respond rapidly to changing information or business needs. In order to achieve true success, we all need the strength of mind and body to struggle and work hard to reach our fullest potential. As we seek to understand the true meaning of hard work, it means exceeding expectations or going the extra mile.",
    },
  ];

  const company = ltcContent?.company || {};
  const logoSrc = pickPublicLtcImage(company.logoUrl, LOGO_SRC);
  const bannerSrc = pickPublicLtcImage(company.bannerUrl, BANNER_SRC);
  const heroTitle =
    company.heroTitle ||
    "We Specialize in Training, Assessment, Manpower & Hotel & Restaurant Services";
  const heroSubtitle =
    company.heroSubtitle || "Delivering excellence and professional solutions for your business needs";
  const values = Array.isArray(company.values) && company.values.length ? company.values : defaultValues;

  useEffect(() => {
    if (!isPromoOpen || promoItems.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentPromoIndex((prev) => (prev + 1) % promoItems.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isPromoOpen, promoItems.length]);

  useEffect(() => {
    if (isPromoOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isPromoOpen]);

  const ServiceIconHotel = () => (
    <svg
      viewBox="0 0 24 24"
      className="h-12 w-12"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 10.5 12 4l9 6.5" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 10.5V20h14v-9.5" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 20v-7h6v7" />
    </svg>
  );

  const ServiceIconTraining = () => (
    <svg
      viewBox="0 0 24 24"
      className="h-12 w-12"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4 6h8a2 2 0 0 1 2 2v13H6a2 2 0 0 0-2 2V6z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M14 8h4a2 2 0 0 1 2 2v13a2 2 0 0 0-2-2h-4V8z"
      />
    </svg>
  );

  const ServiceIconManpower = () => (
    <svg
      viewBox="0 0 24 24"
      className="h-12 w-12"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M16 11a4 4 0 1 0-8 0" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 21a7 7 0 0 1 18 0" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 11v2" />
    </svg>
  );

  return (
    <div className="min-h-screen bg-white text-gray-900" style={fontPontano}>
      {isPromoOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 px-4">
          <div className="relative w-full max-w-5xl overflow-hidden rounded-2xl bg-white shadow-2xl">
            <button
              onClick={closePromo}
              className="absolute right-3 top-3 z-30 flex h-10 w-10 items-center justify-center rounded-full bg-black/60 text-white transition hover:bg-black/80"
              aria-label="Close promotional popup"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="relative h-[300px] w-full bg-gray-200 sm:h-[380px] md:h-[500px]">
              <img
                src={promoItems[currentPromoIndex].image}
                alt={promoItems[currentPromoIndex].title}
                className="h-full w-full object-cover"
                onError={(e) => {
                  e.currentTarget.src =
                    "https://placehold.co/1600x900/355E3B/FFFFFF?text=Promotional+Ad";
                }}
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/20 to-black/10" />

              <div className="absolute bottom-16 left-6 right-6 text-white md:left-10 md:right-10">
                <h2 className="text-2xl font-extrabold md:text-4xl" style={fontMontserrat}>
                  {promoItems[currentPromoIndex].title}
                </h2>

                <p className="mt-2 max-w-2xl text-sm text-white/90 md:text-base" style={fontPontano}>
                  {promoItems[currentPromoIndex].description}
                </p>

                <button
                  type="button"
                  onClick={goToPromoRoute}
                  className="mt-5 inline-flex items-center justify-center rounded-full bg-[#355E3B] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#2c5233] md:text-base"
                  style={fontMontserrat}
                >
                  {promoItems[currentPromoIndex].buttonText}
                </button>
              </div>

              <div className="absolute bottom-5 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2 rounded-full bg-black/30 px-3 py-2 backdrop-blur-sm">
                {promoItems.map((item, index) => (
                  <button
                    key={item.title}
                    onClick={() => setCurrentPromoIndex(index)}
                    aria-label={`Go to ${item.title}`}
                    className={`h-2.5 w-2.5 rounded-full transition-all ${
                      currentPromoIndex === index
                        ? "scale-125 bg-white"
                        : "bg-white/50 hover:bg-white/80"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <header className="fixed left-0 right-0 top-0 z-50 border-b border-white/10 bg-[#355E3B] text-white shadow-md">
        <div className="mx-auto flex h-[74px] max-w-[1600px] items-center justify-between px-4 md:h-[84px] md:px-6 lg:h-[88px] lg:px-8">
          <div className="flex min-w-0 items-center gap-2 md:gap-3 lg:gap-4">
            <img
              src={logoSrc}
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
              const isActive = location.pathname === link.to;
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
            onClick={() => setIsSidebarOpen(true)}
            className="rounded-md p-2 hover:bg-white/10 md:hidden"
            aria-label="Open menu"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
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
                onClick={() => setIsSidebarOpen(false)}
                className="rounded-md p-2 hover:bg-gray-100"
                aria-label="Close menu"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-gray-700"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
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
            backgroundImage: `url('${bannerSrc}')`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="absolute inset-0 bg-[#183B29]/55" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#183B29]/20 to-[#183B29]/50" />

          <div className="relative mx-auto flex h-full max-w-[1600px] items-center justify-center px-6 text-center">
            <div className="max-w-5xl">
              <h2
                className="text-[34px] font-extrabold leading-tight text-white md:text-[56px]"
                style={fontMontserrat}
              >
                {heroTitle}
              </h2>

              <p className="mt-4 text-[16px] text-white/85 md:text-[19px]" style={fontPontano}>
                {heroSubtitle}
              </p>

              <div className="mx-auto mt-6 h-[5px] w-20 rounded-full bg-[#1F8F5A]" />
            </div>
          </div>
        </section>

        <section className="bg-[#F5F5F3]">
          <div className="mx-auto max-w-[1600px] px-4 py-12 md:px-8 md:py-14">
            <div className="text-center">
              <h3
                className="text-[34px] font-extrabold leading-tight text-[#355E3B] md:text-[56px]"
                style={fontMontserrat}
              >
                Our Services
              </h3>
              <div className="mx-auto mt-4 h-[5px] w-24 rounded-full bg-[#355E3B]" />
              <p
                className="mx-auto mt-6 max-w-3xl text-sm text-gray-500 md:text-[18px]"
                style={fontPontano}
              >
                Our comprehensive range of professional services designed to meet your business
                needs and exceed expectations.
              </p>
            </div>

            <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-3">
              <button
                onClick={() => navigate("/hotel-resort")}
                className="group overflow-hidden rounded-2xl bg-[#F3F3F3] text-left shadow-[0_18px_35px_rgba(0,0,0,0.15)] transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_28px_55px_rgba(0,0,0,0.22)]"
              >
                <div className="h-5 bg-[#355E3B]" />
                <div className="p-8">
                  <div className="text-[#355E3B] transition-transform duration-300 group-hover:scale-105">
                    <ServiceIconHotel />
                  </div>
                  <h4
                    className="mt-5 text-[28px] font-extrabold leading-tight text-black"
                    style={fontMontserrat}
                  >
                    Hotel &amp; Resort
                  </h4>
                  <p
                    className="mt-4 text-sm leading-relaxed text-gray-600 md:text-[15px]"
                    style={fontPontano}
                  >
                    Professional hospitality services tailored to meet the highest industry
                    standards. Our team ensures exceptional customer experiences.
                  </p>
                </div>
              </button>

              <button
                onClick={() => navigate("/training-assessment")}
                className="group overflow-hidden rounded-2xl bg-[#F3F3F3] text-left shadow-[0_18px_35px_rgba(0,0,0,0.15)] transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_28px_55px_rgba(0,0,0,0.22)]"
              >
                <div className="h-5 bg-[#355E3B]" />
                <div className="p-8">
                  <div className="text-[#355E3B] transition-transform duration-300 group-hover:scale-105">
                    <ServiceIconTraining />
                  </div>
                  <h4
                    className="mt-5 text-[28px] font-extrabold leading-tight text-black"
                    style={fontMontserrat}
                  >
                    Training &amp; Assessment
                  </h4>
                  <p
                    className="mt-4 text-sm leading-relaxed text-gray-600 md:text-[15px]"
                    style={fontPontano}
                  >
                    Comprehensive training programs designed to develop and enhance professional
                    skills for individuals and organizations.
                  </p>
                </div>
              </button>

              <button
                onClick={() => navigate("/manpower-services")}
                className="group overflow-hidden rounded-2xl bg-[#F3F3F3] text-left shadow-[0_18px_35px_rgba(0,0,0,0.15)] transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_28px_55px_rgba(0,0,0,0.22)]"
              >
                <div className="h-5 bg-[#355E3B]" />
                <div className="p-8">
                  <div className="text-[#355E3B] transition-transform duration-300 group-hover:scale-105">
                    <ServiceIconManpower />
                  </div>
                  <h4
                    className="mt-5 text-[28px] font-extrabold leading-tight text-black"
                    style={fontMontserrat}
                  >
                    Manpower Services
                  </h4>
                  <p
                    className="mt-4 text-sm leading-relaxed text-gray-600 md:text-[15px]"
                    style={fontPontano}
                  >
                    Quality staffing solutions to meet your organization's personnel requirements.
                    We connect you with skilled professionals.
                  </p>
                </div>
              </button>
            </div>
          </div>
        </section>

        <section className="bg-white">
          <div className="w-full bg-[#355E3B]">
            <div className="mx-auto max-w-[1600px] px-4 py-10 text-center md:px-8">
              <h2
                className="text-[30px] font-extrabold text-white md:text-[48px]"
                style={fontMontserrat}
              >
                Let's Meet Our Loyalty
              </h2>
              <div className="mx-auto mt-4 h-[6px] w-44 rounded-full bg-white" />
            </div>
          </div>

          <div className="mx-auto max-w-[1600px] px-4 py-10 text-center md:px-8">
            <h3
              className="text-[34px] font-extrabold leading-tight text-black md:text-[56px]"
              style={fontMontserrat}
            >
              Work With Us
            </h3>
            <div className="mx-auto mt-3 h-[5px] w-28 rounded-full bg-[#355E3B]" />
            <p className="mt-5 text-sm text-gray-500 md:text-[18px]" style={fontPontano}>
              Our Specialize in Training, Assessment, Manpower &amp; Hotel &amp; Resort Services
            </p>

            <div className="mt-10 grid gap-8 md:grid-cols-3">
              {values.map((value) => (
                <div
                  key={value.title}
                  className="overflow-hidden rounded-2xl bg-[#F3F3F3] text-left shadow-[0_18px_35px_rgba(0,0,0,0.15)] transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_28px_55px_rgba(0,0,0,0.22)]"
                >
                  <div className="h-5 bg-[#355E3B]" />
                  <div className="p-8">
                    <h4
                      className="text-[26px] font-extrabold uppercase tracking-tight text-[#355E3B]"
                      style={fontMontserrat}
                    >
                      {value.title}
                    </h4>
                    <p
                      className="mt-4 text-sm leading-relaxed text-gray-600 md:text-[15px]"
                      style={fontPontano}
                    >
                      {value.body}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mx-auto max-w-[1600px] px-4 pb-14 text-center md:px-8">
            <h4
              className="text-[30px] font-extrabold leading-tight text-black md:text-[42px]"
              style={fontMontserrat}
            >
              Ready to Experience Our Services
            </h4>
            <p className="mt-3 text-sm text-gray-500 md:text-[18px]" style={fontPontano}>
              Join our growing list of satisfied clients and experience our exceptional services
              firsthand.
            </p>
          </div>
        </section>

        <footer className="bg-[#355E3B] text-white">
          <div className="mx-auto max-w-[1600px] px-4 py-3 md:px-6 md:py-4">
            <div className="grid grid-cols-1 gap-5 md:grid-cols-[1.35fr_1fr_1.2fr_1.2fr] md:gap-0">
              <div className="flex items-center gap-3 pr-0 md:pr-6">
                <img
                  src={logoSrc}
                  alt="LTC Logo"
                  className="h-10 w-10 shrink-0 rounded-full bg-white object-cover md:h-[44px] md:w-[44px]"
                />
                <div className="min-w-0">
                  <h2
                    className="text-[20px] font-black uppercase leading-none md:text-[24px]"
                    style={fontMontserrat}
                  >
                    LTC GROUP OF COMPANIES
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
                    5411 Light Tower Center &amp; Realty Development, Inc., Building II, Curie
                    Street, Palanan, Makati City.
                  </li>
                  <li>Light Tower Center, 1730 Dian Street, Palanan, Makati City.</li>
                </ul>
              </div>
            </div>

            <div className="mt-3 flex flex-col gap-1 border-t border-white/15 pt-2 text-[10px] text-white/90 md:flex-row md:items-center md:justify-between">
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

export default Home;