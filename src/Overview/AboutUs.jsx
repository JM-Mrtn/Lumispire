import React, { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import ChatbotWidget from "./ChatbotWidget";
import { getPublicLtcContent, pickPublicLtcImage } from "./ltcContentApi";

const LOGO = "/LTCLogo.jpg";

const fontMontserrat = { fontFamily: "'Montserrat', sans-serif" };
const fontPontano = { fontFamily: "'Pontano Sans', sans-serif" };
const fontActor = { fontFamily: "'Actor', sans-serif" };
const fontPoppins = { fontFamily: "'Poppins', sans-serif" };

const RevealOnScroll = ({ children, className = "", delay = 0, y = 20 }) => {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(element);
        }
      },
      {
        threshold: 0.12,
        rootMargin: "0px 0px -40px 0px",
      }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? "translateY(0px)" : `translateY(${y}px)`,
        transition: "opacity 650ms ease, transform 650ms ease",
        transitionDelay: `${delay}ms`,
        willChange: "opacity, transform",
      }}
    >
      {children}
    </div>
  );
};

const EyeIcon = () => (
  <svg
    viewBox="0 0 24 24"
    className="h-8 w-8 text-[#355E3B]"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M2.5 12s3.5-7 9.5-7 9.5 7 9.5 7-3.5 7-9.5 7-9.5-7-9.5-7z"
    />
    <circle cx="12" cy="12" r="2.75" />
  </svg>
);

const FlagIcon = () => (
  <svg
    viewBox="0 0 24 24"
    className="h-8 w-8 text-[#355E3B]"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v18" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 4h12l-1.5 3L17 10H5V4z" />
  </svg>
);

const StarIcon = () => (
  <svg viewBox="0 0 24 24" className="h-9 w-9 text-[#F3C326]" fill="currentColor">
    <path d="M12 2.5l2.86 6.12 6.64.57-5.03 4.35 1.52 6.46L12 16.9 6.01 20l1.52-6.46L2.5 9.19l6.64-.57L12 2.5z" />
  </svg>
);

const AboutUs = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("All Photos");
  const [ltcContent, setLtcContent] = useState(null);

  const goTo = (path) => {
    navigate(path);
    setIsSidebarOpen(false);
  };

  const navLinks = [
    { label: "HOME", to: "/" },
    { label: "ABOUT US", to: "/about-us" },
    { label: "TEAM", to: "/team" },
    { label: "CONTACT", to: "/contact" },
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

  const defaultTimeline = [
    {
      side: "right",
      date: "May 1989",
      title: "LTC Staffing Center, Inc.",
      body:
        "Started as LTC Staffing Center, Inc., duly authorized under DOLE Department Order Number 174 with License Number NCR-MFPO-7B10-041223-499-R.",
    },
    {
      side: "left",
      date: "January 2013",
      title: "LTC-Multi Services and Training Center, Inc.",
      body:
        "By majority vote of the Board of Directors and Stock Holders, the corporate name was changed to provide different business sectors a total solution for HR support services and quality training.",
    },
    {
      side: "right",
      date: "September 24, 2019",
      title: "LTC Training Assessment and Multi Services, Inc.",
      body: [
        "The company again considered amending its name to assist the country's nation building and economic recovery, now with different business models spearheaded by competent managers.",
        "1. Manpower Services",
        "2. Training & Assessment",
        "3. System Services",
        "4. Hotel & Resort",
      ],
    },
    {
      side: "left",
      date: "Present Day",
      title: "Strategic Location",
      body:
        "Our business office is strategically located at 5411 Light Tower Center & Realty Development, Inc., Building II, Curie Street, Palanan, Makati City.",
    },
  ];

  const timeline = ltcContent?.timeline?.length ? ltcContent.timeline : defaultTimeline;

  const lightCards = [
    {
      letter: "L",
      title: "LOYALTY",
      body:
        "We take pride in recognizing our employees as our most valuable assets for they are the ones who remain with us for a lengthy period because they are valued, appreciated, and contribute to the company's overall mission and success.",
    },
    {
      letter: "I",
      title: "INTEGRITY",
      body:
        "We honor our word and keep our commitments. We keep ourselves a reliable source of information because it is the foundation of our individual and corporate actions that drives the organization of which we are proud.",
    },
    {
      letter: "G",
      title: "GOD-FEARING",
      body:
        "We put GOD first in everything that we do. We respect individual differences and take control to overcome issues that may affect a harmonious working relationship.",
    },
    {
      letter: "H",
      title: "HARDWORK",
      body:
        "We convert ideas into action, tackle tasks without delay as we respond rapidly to changing information or business needs. In order to achieve true success, we all need the strength of mind and body to struggle and work hard to reach our fullest potential.",
    },
    {
      letter: "T",
      title: "TRUSTWORTHINESS",
      body:
        "We take accountability for our actions and required results. We work using our intelligent judgment to execute actions and decisions that need to be made. It is an essential moral value that ensures dependability, credibility, and truthfulness.",
    },
  ];

  const defaultAchievements = [
    {
      title: "NUMBER ONE PLACEMENT AGENCY (2012)",
      body:
        "For having most number of local placements during the 2012 Labor Day Job & Livelihood Fair",
      footer:
        "Awarded by: Department of Labor & Employment (DOLE)\nGiven: May 1, 2012 | World Trade Center, Pasay City",
    },
    {
      title: "GINTONG LANDAS PROJECT SUPPORT",
      body: "For generous support to Gintong Landas Project 2018 & 2022",
      footer:
        "Awarded by: Create a Job for Disabled Association, Inc.\nGiven: 2018 & 2022 | City of Manila",
    },
    {
      title: "APPRECIATION TO MS. LORNA T. CASTIGADOR",
      body:
        "For her unselfish devotion, continuous support and efforts to help members attain professional, spiritual, economic & social goals",
      footer:
        "Awarded by: Philippine Cocoa Corporation\nGiven: July 17, 1996 | LTC Staffing Center, Inc.",
    },
  ];

  const defaultHighlightCategories = [
    "All Photos",
    "Hotel & Resort",
    "Training & Assessment",
    "Manpower",
  ];

  const defaultHighlightItems = [
    {
      title: "Training Facility",
      subtitle: "Skills development and classroom sessions",
      category: "Training & Assessment",
      image: "/training-facility.png",
    },
    {
      title: "Hotel Operations",
      subtitle: "Hospitality and guest service area",
      category: "Hotel & Resort",
      image: "/hotel-resort.png",
    },
    {
      title: "Manpower Deployment",
      subtitle: "Reliable staffing support solutions",
      category: "Manpower",
      image: "/manpower-services.png",
    },
    {
      title: "Assessment Center",
      subtitle: "Evaluation and certification support",
      category: "Training & Assessment",
      image: "/assessment-center.png",
    },
    {
      title: "Workforce Support",
      subtitle: "Professional business assistance",
      category: "Manpower",
      image: "/workforce-support.png",
    },
    {
      title: "Guest Experience",
      subtitle: "Hospitality-focused operations",
      category: "Hotel & Resort",
      image: "/guest-experience.png",
    },
  ];

  const apiAchievements = Array.isArray(ltcContent?.achievements)
    ? ltcContent.achievements
    : [];
  const achievements = apiAchievements.length ? apiAchievements : defaultAchievements;

  const apiHighlights = Array.isArray(ltcContent?.highlights)
    ? ltcContent.highlights.map((item) => ({
        ...item,
        image: pickPublicLtcImage(item.image),
      }))
    : [];
  const highlightItems = apiHighlights.length ? apiHighlights : defaultHighlightItems;

  const highlightCategories = useMemo(() => {
    const categories = [
      "All Photos",
      ...Array.from(new Set(highlightItems.map((item) => item.category).filter(Boolean))),
    ];

    return categories.length > 1 ? categories : defaultHighlightCategories;
  }, [highlightItems]);

  useEffect(() => {
    if (selectedCategory === "All Photos") return;

    const exists = highlightCategories.includes(selectedCategory);

    if (!exists) setSelectedCategory("All Photos");
  }, [highlightCategories, selectedCategory]);

  const visibleHighlights = useMemo(() => {
    if (selectedCategory === "All Photos") return highlightItems;

    return highlightItems.filter((item) => item.category === selectedCategory);
  }, [selectedCategory, highlightItems]);

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
        <section className="mx-auto max-w-[1400px] bg-[#F5F5F3] px-4 py-7 md:px-8 md:py-8">
          <RevealOnScroll className="text-center">
            <h2
              className="text-[30px] font-extrabold tracking-tight text-black md:text-[44px]"
              style={fontMontserrat}
            >
              About us
            </h2>

            <div className="mx-auto mt-2.5 h-[4px] w-16 rounded-full bg-[#355E3B]" />

            <p className="mt-3 text-[13px] text-gray-500 md:text-[15px]" style={fontPontano}>
              Learn about our history, mission, vision, and values
            </p>

            <h3
              className="mt-7 text-[28px] font-black uppercase tracking-tight text-[#355E3B] md:text-[40px]"
              style={fontMontserrat}
            >
              OUR COMPANY
            </h3>

            <div className="mx-auto mt-2.5 h-[4px] w-28 rounded-full bg-[#355E3B]" />
          </RevealOnScroll>

          <div className="relative mx-auto mt-10 max-w-5xl">
            <div className="absolute bottom-0 left-4 top-0 w-[2px] bg-[#C9D7CB] md:left-1/2 md:-translate-x-1/2" />

            <div className="space-y-1 md:space-y-0">
              {timeline.map((item, index) => {
                const isLeft = item.side === "left";

                return (
                  <RevealOnScroll
                    key={`${item.title}-${index}`}
                    delay={index * 90}
                    className={`relative flex py-5 md:min-h-[170px] md:items-center ${
                      isLeft ? "md:justify-start" : "md:justify-end"
                    }`}
                  >
                    <div className="absolute left-4 top-1/2 h-3.5 w-3.5 -translate-y-1/2 rounded-full bg-[#355E3B] ring-4 ring-[#F5F5F3] md:left-1/2 md:-translate-x-1/2" />

                    <div
                      className={`w-full pl-10 md:w-[40%] md:pl-0 ${
                        isLeft ? "md:pr-12 md:text-right" : "md:pl-12 md:text-left"
                      }`}
                    >
                      <p
                        className="text-[15px] font-bold text-[#3E7146] md:text-[18px]"
                        style={fontPoppins}
                      >
                        {item.date}
                      </p>

                      <h4
                        className="mt-1 text-[22px] font-extrabold leading-tight text-[#1B1B1B] md:text-[32px]"
                        style={fontMontserrat}
                      >
                        {item.title}
                      </h4>

                      {(() => {
                        const bodyLines = Array.isArray(item.body)
                          ? item.body
                          : String(item.body || "")
                              .split(/\r?\n/)
                              .map((line) => line.trim())
                              .filter(Boolean);

                        if (!bodyLines.length) return null;

                        if (bodyLines.length === 1) {
                          return (
                            <p
                              className="mt-2.5 text-[12.5px] leading-relaxed text-gray-500 md:text-[14px]"
                              style={fontPontano}
                            >
                              {bodyLines[0]}
                            </p>
                          );
                        }

                        return (
                          <div
                            className="mt-2.5 space-y-1.5 text-[12.5px] leading-relaxed text-gray-500 md:text-[14px]"
                            style={fontPontano}
                          >
                            <p>{bodyLines[0]}</p>

                            <div className="space-y-1">
                              {bodyLines.slice(1).map((line, lineIndex) => (
                                <p key={lineIndex}>{line}</p>
                              ))}
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  </RevealOnScroll>
                );
              })}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-[1200px] px-4 py-5 md:px-8 md:py-6">
          <div className="mx-auto grid max-w-5xl grid-cols-1 gap-5 md:grid-cols-2">
            <RevealOnScroll>
              <div className="flex h-[240px] flex-col overflow-hidden rounded-2xl bg-[#EFEFEF] shadow-[0_12px_26px_rgba(0,0,0,0.14)] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_18px_34px_rgba(0,0,0,0.18)] md:h-[255px]">
                <div className="bg-[#355E3B] px-5 py-3.5 md:px-6">
                  <h3
                    className="text-[21px] font-black uppercase tracking-tight text-white md:text-[28px]"
                    style={fontMontserrat}
                  >
                    OUR VISION
                  </h3>
                </div>

                <div className="flex flex-1 flex-col items-center justify-center px-5 py-5 text-center md:px-7">
                  <EyeIcon />

                  <p
                    className="mx-auto mt-4 max-w-[500px] text-[13px] leading-relaxed text-gray-500 md:text-[15px]"
                    style={fontActor}
                  >
                    "To be the most reliable partner of government and corporate industry in
                    providing quality technical vocational training, hospitality services,
                    assessment, and job services Globally."
                  </p>
                </div>
              </div>
            </RevealOnScroll>

            <RevealOnScroll delay={100}>
              <div className="flex h-[240px] flex-col overflow-hidden rounded-2xl bg-[#EFEFEF] shadow-[0_12px_26px_rgba(0,0,0,0.14)] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_18px_34px_rgba(0,0,0,0.18)] md:h-[255px]">
                <div className="bg-[#355E3B] px-5 py-3.5 md:px-6">
                  <h3
                    className="text-[21px] font-black uppercase tracking-tight text-white md:text-[28px]"
                    style={fontMontserrat}
                  >
                    OUR MISSION
                  </h3>
                </div>

                <div className="flex flex-1 flex-col items-center justify-center px-5 py-5 text-center md:px-7">
                  <FlagIcon />

                  <p
                    className="mx-auto mt-4 max-w-[500px] text-[13px] leading-relaxed text-gray-500 md:text-[15px]"
                    style={fontActor}
                  >
                    "To be the Top of the Mind provider of training, assessment and job services
                    for professionals and business partners that value high level of technical
                    proficiency, competence, and reliability without compromising workforce
                    quality."
                  </p>
                </div>
              </div>
            </RevealOnScroll>
          </div>

          <RevealOnScroll delay={80} className="mt-8 text-center md:mt-10">
            <h3
              className="text-[24px] font-black uppercase tracking-tight text-[#355E3B] md:text-[38px]"
              style={fontMontserrat}
            >
              OUR CORPORATE VALUES
            </h3>

            <div className="mx-auto mt-3 h-[4px] w-28 rounded-full bg-[#355E3B] md:w-[220px]" />

            <p
              className="mx-auto mt-4 max-w-4xl text-[13px] leading-relaxed text-gray-600 md:text-[16px]"
              style={fontPontano}
            >
              Values are the principles or standards of behavior that are considered important in
              life. Our values are the rules by which we operate. We carry out our business in
              Quality Relationship, which are honest, ethical, caring and God-Fearing.
            </p>
          </RevealOnScroll>
        </section>

        <section className="mx-auto max-w-[1400px] px-4 pb-6 pt-1 md:px-8 md:pb-8">
          <div className="mx-auto max-w-5xl space-y-4">
            {lightCards.map((card, index) => (
              <RevealOnScroll key={card.title} delay={index * 80}>
                <div className="overflow-hidden rounded-2xl bg-[#EFEFEF] shadow-[0_12px_28px_rgba(0,0,0,0.14)] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_18px_36px_rgba(0,0,0,0.18)]">
                  <div className="flex min-h-[110px]">
                    <div
                      className="flex w-[70px] shrink-0 items-center justify-center bg-[#F5F5F5] text-[50px] font-black text-[#2D6242] md:w-[84px] md:text-[62px]"
                      style={fontMontserrat}
                    >
                      {card.letter}
                    </div>

                    <div className="w-[2px] bg-[#8AAC8D]" />

                    <div className="flex-1 px-4 py-4 md:px-5">
                      <h4
                        className="text-[18px] font-black uppercase leading-none text-black md:text-[28px]"
                        style={fontMontserrat}
                      >
                        {card.title}
                      </h4>

                      <p
                        className="mt-2 text-[12.5px] leading-relaxed text-gray-600 md:text-[14px]"
                        style={fontPontano}
                      >
                        {card.body}
                      </p>
                    </div>
                  </div>
                </div>
              </RevealOnScroll>
            ))}
          </div>

          <RevealOnScroll delay={100} className="mx-auto mt-6 max-w-4xl text-center">
            <p
              className="mx-auto max-w-3xl text-[20px] italic leading-relaxed text-[#4C7A4E] md:text-[28px]"
              style={fontActor}
            >
              A symbol of holiness, goodness, knowledge, wisdom, grace, hope, and God&apos;s
              revelation.
            </p>
          </RevealOnScroll>
        </section>

        <section className="mx-auto max-w-[1400px] px-4 pb-8 pt-2 md:px-8 md:pb-10">
          <RevealOnScroll className="text-center">
            <h3
              className="text-[24px] font-black uppercase tracking-tight text-[#355E3B] md:text-[38px]"
              style={fontMontserrat}
            >
              OUR ACHIEVEMENTS
            </h3>

            <div className="mx-auto mt-3 h-[4px] w-28 rounded-full bg-[#355E3B] md:w-[200px]" />
          </RevealOnScroll>

          <div className="mt-7 flex flex-wrap justify-center gap-6">
            {achievements.map((item, index) => (
              <RevealOnScroll
                key={`${item.title}-${index}`}
                delay={index * 80}
                className="w-full max-w-[360px] md:w-[calc(50%_-_12px)] lg:w-[calc(33.333%_-_16px)]"
              >
                <div className="flex h-[250px] flex-col overflow-hidden rounded-xl bg-[#EFEFEF] shadow-[0_12px_26px_rgba(0,0,0,0.14)] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_18px_34px_rgba(0,0,0,0.18)]">
                  <div className="h-[8px] shrink-0 bg-[#355E3B]" />

                  <div className="flex flex-1 flex-col px-4 py-5 text-center md:px-5 md:py-6">
                    <div className="flex justify-center">
                      <StarIcon />
                    </div>

                    <h4
                      className="mt-3 min-h-[34px] text-[11px] font-black uppercase tracking-wide text-gray-900 md:text-[13px]"
                      style={fontMontserrat}
                    >
                      {item.title}
                    </h4>

                    <p
                      className="mt-3 line-clamp-3 text-[12.5px] leading-relaxed text-gray-600 md:text-[13px]"
                      style={fontPontano}
                    >
                      {item.body}
                    </p>

                    <p
                      className="mt-3 line-clamp-2 whitespace-pre-line text-[11.5px] leading-relaxed text-gray-500"
                      style={fontActor}
                    >
                      {item.footer}
                    </p>
                  </div>
                </div>
              </RevealOnScroll>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-[1400px] px-4 pb-12 pt-1 md:px-8 md:pb-14">
          <RevealOnScroll className="text-center">
            <h3
              className="text-[26px] font-black tracking-tight text-[#355E3B] md:text-[40px]"
              style={fontMontserrat}
            >
              Our Highlights
            </h3>

            <div className="mx-auto mt-3 h-[4px] w-28 rounded-full bg-[#355E3B] md:w-[180px]" />
          </RevealOnScroll>

          <RevealOnScroll delay={60} className="mt-6">
            <div
              className="flex flex-wrap items-center justify-center gap-2.5 md:gap-3"
              style={fontPoppins}
            >
              {highlightCategories.map((category) => {
                const active = selectedCategory === category;

                return (
                  <button
                    key={category}
                    type="button"
                    onClick={() => setSelectedCategory(category)}
                    className={`rounded-full px-4 py-2 text-[12px] font-medium shadow-sm transition-all duration-300 md:min-w-[150px] ${
                      active
                        ? "bg-[#355E3B] text-white shadow-md"
                        : "bg-[#355E3B] text-white/90 hover:-translate-y-1 hover:bg-[#2B4F31]"
                    }`}
                  >
                    {category}
                  </button>
                );
              })}
            </div>
          </RevealOnScroll>

          <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-3">
            {visibleHighlights.slice(0, 6).map((item, index) => (
              <RevealOnScroll key={`${item.title}-${index}`} delay={index * 70}>
                <div className="group overflow-hidden rounded-xl bg-[#EFEFEF] shadow-[0_12px_26px_rgba(0,0,0,0.14)] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_18px_34px_rgba(0,0,0,0.18)]">
                  <div className="h-[8px] bg-[#355E3B]" />

                  <div className="relative h-[180px] overflow-hidden bg-[#F6F6F6]">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>

                  <div className="px-4 py-4">
                    <p className="text-[15px] font-bold text-[#355E3B]" style={fontMontserrat}>
                      {item.title}
                    </p>

                    <p className="mt-1 text-[12.5px] text-gray-500" style={fontPontano}>
                      {item.subtitle}
                    </p>
                  </div>
                </div>
              </RevealOnScroll>
            ))}
          </div>
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
                    <button onClick={() => goTo("/contact")} className="hover:text-white">
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

export default AboutUs;