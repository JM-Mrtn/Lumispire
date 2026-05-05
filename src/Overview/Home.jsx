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

  const navLinks = [
    { label: "HOME", to: "/" },
    { label: "ABOUT US", to: "/about-us" },
    { label: "TEAM", to: "/team" },
    { label: "CONTACT", to: CONTACT_ROUTE },
  ];

  const defaultValues = [
    {
      title: "INTEGRITY",
      body:
        "We honor our word and keep our commitments. We keep ourselves objective, honest and balanced in making decisions and actions for the common good of our stakeholders.",
    },
    {
      title: "GOD-FEARING",
      body:
        "We put GOD first in everything that we do. We respect individual differences and take control to overcome issues that may affect a harmonious working relationship.",
    },
    {
      title: "HARDWORK",
      body:
        "We convert ideas into action, tackle tasks without delay as we respond rapidly to changing information or business needs.",
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

  useEffect(() => {
    if (!isPromoOpen || promoItems.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentPromoIndex((prev) => (prev + 1) % promoItems.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isPromoOpen, promoItems.length]);

  useEffect(() => {
    document.body.style.overflow = isPromoOpen ? "hidden" : "auto";

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isPromoOpen]);

  const company = ltcContent?.company || {};
  const logoSrc = pickPublicLtcImage(company.logoUrl, LOGO_SRC);
  const bannerSrc = pickPublicLtcImage(company.bannerUrl, BANNER_SRC);

  const heroTitle =
    company.heroTitle ||
    "We Specialize in Training, Assessment, Manpower & Hotel & Restaurant Services";

  const heroSubtitle =
    company.heroSubtitle ||
    "Delivering excellence and professional solutions for your business needs";

  const values =
    Array.isArray(company.values) && company.values.length
      ? company.values
      : defaultValues;

  const ServiceIconHotel = () => (
    <svg
      viewBox="0 0 24 24"
      className="h-9 w-9"
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
      className="h-9 w-9"
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
      className="h-9 w-9"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M16 11a4 4 0 1 0-8 0" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 21a7 7 0 0 1 18 0" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 11v2" />
    </svg>
  );

  const serviceCards = [
    {
      title: "Hotel & Resort",
      description:
        "Professional hospitality services tailored to meet the highest industry standards. Our team ensures exceptional customer experiences.",
      route: "/hotel-resort",
      Icon: ServiceIconHotel,
    },
    {
      title: "Training & Assessment",
      description:
        "Comprehensive training programs designed to develop and enhance professional skills for individuals and organizations.",
      route: "/training-assessment",
      Icon: ServiceIconTraining,
    },
    {
      title: "Manpower Services",
      description:
        "Quality staffing solutions to meet your organization's personnel requirements. We connect you with skilled professionals.",
      route: "/manpower-services",
      Icon: ServiceIconManpower,
    },
  ];

  const getValueCardClass = (index, total) => {
    const baseClass =
      "flex h-[190px] w-full flex-col overflow-hidden rounded-2xl bg-[#F3F3F3] text-left shadow-[0_12px_26px_rgba(0,0,0,0.13)] transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_22px_42px_rgba(0,0,0,0.2)] md:h-[205px]";

    if (total === 1) {
      return `${baseClass} md:col-start-2`;
    }

    if (total > 3 && total % 3 === 1 && index === total - 1) {
      return `${baseClass} md:col-start-2`;
    }

    return baseClass;
  };

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

                <p
                  className="mt-2 max-w-2xl text-sm text-white/90 md:text-base"
                  style={fontPontano}
                >
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
        <div className="mx-auto flex h-[64px] max-w-[1600px] items-center justify-between px-4 md:h-[72px] md:px-6 lg:h-[76px] lg:px-8">
          <div className="flex min-w-0 items-center gap-2 md:gap-3">
            <img
              src={logoSrc}
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
        <section
          className="relative h-[220px] w-full md:h-[250px] lg:h-[280px]"
          style={{
            backgroundImage: `url('${bannerSrc}')`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="absolute inset-0 bg-[#183B29]/60" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#183B29]/20 to-[#183B29]/55" />

          <div className="relative mx-auto flex h-full max-w-[1600px] items-center justify-center px-6 text-center">
            <div className="max-w-5xl">
              <h2
                className="text-[28px] font-extrabold leading-tight text-white md:text-[42px] lg:text-[50px]"
                style={fontMontserrat}
              >
                {heroTitle}
              </h2>

              <p
                className="mt-3 text-[13px] text-white/90 md:text-[16px]"
                style={fontPontano}
              >
                {heroSubtitle}
              </p>

              <div className="mx-auto mt-5 h-[4px] w-16 rounded-full bg-[#1F8F5A]" />
            </div>
          </div>
        </section>

        <section className="bg-[#F5F5F3]">
          <div className="mx-auto max-w-[1600px] px-4 py-7 md:px-8 md:py-8">
            <div className="text-center">
              <h3
                className="text-[30px] font-extrabold leading-tight text-[#355E3B] md:text-[44px]"
                style={fontMontserrat}
              >
                Our Services
              </h3>

              <div className="mx-auto mt-3 h-[4px] w-16 rounded-full bg-[#355E3B]" />

              <p
                className="mx-auto mt-4 max-w-3xl text-[13px] text-gray-500 md:text-[15px]"
                style={fontPontano}
              >
                Our comprehensive range of professional services designed to meet your business
                needs and exceed expectations.
              </p>
            </div>

            <div className="mt-7 grid grid-cols-1 items-stretch gap-5 md:grid-cols-3">
              {serviceCards.map(({ title, description, route, Icon }) => (
                <button
                  key={title}
                  onClick={() => navigate(route)}
                  className="group flex h-full min-h-[230px] flex-col overflow-hidden rounded-2xl bg-[#F3F3F3] text-left shadow-[0_10px_24px_rgba(0,0,0,0.12)] transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(0,0,0,0.2)]"
                >
                  <div className="h-4 w-full bg-[#355E3B]" />

                  <div className="flex flex-1 flex-col p-5">
                    <div className="text-[#355E3B] transition-transform duration-300 group-hover:scale-105">
                      <Icon />
                    </div>

                    <h4
                      className="mt-3 min-h-[44px] text-[21px] font-extrabold leading-tight text-black md:text-[23px]"
                      style={fontMontserrat}
                    >
                      {title}
                    </h4>

                    <p
                      className="mt-1 text-[12.5px] leading-relaxed text-gray-600 md:text-[13.5px]"
                      style={fontPontano}
                    >
                      {description}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-white">
          <div className="w-full bg-[#355E3B]">
            <div className="mx-auto max-w-[1600px] px-4 py-5 text-center md:px-8 md:py-6">
              <h2
                className="text-[24px] font-extrabold text-white md:text-[34px]"
                style={fontMontserrat}
              >
                Let's Meet Our Loyalty
              </h2>

              <div className="mx-auto mt-3 h-[4px] w-28 rounded-full bg-white" />
            </div>
          </div>

          <div className="mx-auto max-w-[1600px] px-4 py-6 text-center md:px-8 md:py-7">
            <h3
              className="text-[30px] font-extrabold leading-tight text-black md:text-[35px]"
              style={fontMontserrat}
            >
              Work With Us
            </h3>

            <div className="mx-auto mt-2.5 h-[4px] w-20 rounded-full bg-[#355E3B]" />

            <p className="mt-3 text-[13px] text-gray-500 md:text-[15px]" style={fontPontano}>
              Our Specialize in Training, Assessment, Manpower &amp; Hotel &amp; Resort Services
            </p>

            <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-3">
              {values.map((value, index) => (
                <div key={value.title} className={getValueCardClass(index, values.length)}>
                  <div className="h-4 shrink-0 bg-[#355E3B]" />

                  <div className="flex flex-1 flex-col p-5">
                    <h4
                      className="min-h-[28px] text-[20px] font-extrabold uppercase tracking-tight text-[#355E3B] md:text-[22px]"
                      style={fontMontserrat}
                    >
                      {value.title}
                    </h4>

                    <p
                      className="mt-2 line-clamp-4 text-[12.5px] leading-relaxed text-gray-600 md:text-[13px]"
                      style={fontPontano}
                    >
                      {value.body}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mx-auto max-w-[1600px] px-4 pb-8 text-center md:px-8">
            <h4
              className="text-[24px] font-extrabold leading-tight text-black md:text-[32px]"
              style={fontMontserrat}
            >
              Ready to Experience Our Services
            </h4>

            <p className="mt-2 text-[13px] text-gray-500 md:text-[15px]" style={fontPontano}>
              Join our growing list of satisfied clients and experience our exceptional services
              firsthand.
            </p>
          </div>
        </section>

        <footer className="bg-[#355E3B] text-white">
          <div className="mx-auto max-w-[1600px] px-4 py-1.5 md:px-6 md:py-2">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-[1.2fr_0.9fr_1fr_1fr] md:gap-0">
              <div className="flex items-center gap-2 pr-0 md:pr-4">
                <img
                  src={logoSrc}
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

export default Home;