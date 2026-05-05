import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import ChatbotWidget from "./ChatbotWidget";
import { getPublicLtcContent, pickPublicLtcImage } from "./ltcContentApi";

const LOGO = "/LTCLogo.jpg";

const fontMontserrat = { fontFamily: "'Montserrat', sans-serif" };
const fontPontano = { fontFamily: "'Pontano Sans', sans-serif" };
const fontActor = { fontFamily: "'Actor', sans-serif" };
const fontPoppins = { fontFamily: "'Poppins', sans-serif" };

const RevealOnScroll = ({ children, className = "", delay = 0, y = 28 }) => {
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
        rootMargin: "0px 0px -50px 0px",
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
        transition: "opacity 700ms ease, transform 700ms ease",
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
    className="h-12 w-12 text-[#355E3B]"
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
    className="h-12 w-12 text-[#355E3B]"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v18" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 4h12l-1.5 3L17 10H5V4z" />
  </svg>
);

const StarIcon = () => (
  <svg viewBox="0 0 24 24" className="h-10 w-10 text-[#F3C326]" fill="currentColor">
    <path d="M12 2.5l2.86 6.12 6.64.57-5.03 4.35 1.52 6.46L12 16.9 6.01 20l1.52-6.46L2.5 9.19l6.64-.57L12 2.5z" />
  </svg>
);

const AboutUs = () => {
  const navigate = useNavigate();
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
        <div className="mx-auto flex h-[74px] max-w-[1600px] items-center justify-between px-4 md:h-[84px] md:px-6 lg:h-[88px] lg:px-8">
          <div className="flex min-w-0 items-center gap-2 md:gap-3 lg:gap-4">
            <img
              src={LOGO}
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
              const isActive = link.to === "/about-us";
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
                const isActive = link.to === "/about-us";
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
        <section className="mx-auto max-w-[1600px] bg-[#F5F5F3] px-4 py-10 md:px-8 md:py-14">
          <RevealOnScroll className="text-center">
            <h2
              className="text-4xl font-extrabold tracking-tight text-black md:text-[58px]"
              style={fontMontserrat}
            >
              About us
            </h2>
            <div className="mx-auto mt-3 h-[4px] w-24 rounded-full bg-[#355E3B]" />
            <p className="mt-4 text-sm text-gray-500 md:text-[18px]" style={fontPontano}>
              Learn about our history, mission, vision, and values
            </p>

            <h3
              className="mt-10 text-[28px] font-black uppercase tracking-tight text-[#355E3B] md:text-[48px]"
              style={fontMontserrat}
            >
              OUR COMPANY
            </h3>
            <div className="mx-auto mt-3 h-[4px] w-40 rounded-full bg-[#355E3B]" />
          </RevealOnScroll>

          <div className="relative mx-auto mt-14 max-w-6xl">
            <div className="absolute bottom-0 left-4 top-0 w-[3px] bg-[#BFD1C1] md:left-1/2 md:-translate-x-1/2" />

            <div className="space-y-3 md:space-y-0">
              {timeline.map((item, index) => {
                const isLeft = item.side === "left";

                return (
                  <RevealOnScroll
                    key={`${item.title}-${index}`}
                    delay={index * 120}
                    className={`relative flex py-8 md:min-h-[220px] md:items-center ${
                      isLeft ? "md:justify-start" : "md:justify-end"
                    }`}
                  >
                    <div className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 rounded-full bg-[#2D6B45] ring-8 ring-[#F5F5F3] md:left-1/2 md:-translate-x-1/2" />

                    <div
                      className={`w-full pl-12 md:w-[42%] md:pl-0 ${
                        isLeft ? "md:pr-16 md:text-right" : "md:pl-16 md:text-left"
                      }`}
                    >
                      <p
                        className="text-[18px] font-bold text-[#3E7146] md:text-[22px]"
                        style={fontPoppins}
                      >
                        {item.date}
                      </p>

                      <h4
                        className="mt-1 text-[26px] font-extrabold leading-tight text-[#1B1B1B] md:text-[42px]"
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
                              className="mt-3 text-sm leading-relaxed text-gray-500 md:text-[15px]"
                              style={fontPontano}
                            >
                              {bodyLines[0]}
                            </p>
                          );
                        }

                        return (
                          <div
                            className="mt-3 space-y-2 text-sm leading-relaxed text-gray-500 md:text-[15px]"
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

        <section className="mx-auto max-w-[1600px] px-4 py-8 md:px-8 md:py-12">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 md:gap-14">
            <RevealOnScroll>
              <div className="overflow-hidden rounded-[18px] bg-[#EFEFEF] shadow-[0_18px_35px_rgba(0,0,0,0.16)] transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_24px_50px_rgba(0,0,0,0.20)]">
                <div className="bg-[#355E3B] px-6 py-5 md:px-8 md:py-6">
                  <h3
                    className="text-[28px] font-black uppercase tracking-tight text-white md:text-[46px]"
                    style={fontMontserrat}
                  >
                    OUR VISION
                  </h3>
                </div>
                <div className="px-6 py-8 text-center md:px-12 md:py-10">
                  <div className="flex justify-center">
                    <EyeIcon />
                  </div>
                  <p
                    className="mx-auto mt-6 max-w-[560px] text-[18px] leading-relaxed text-gray-500 md:text-[20px]"
                    style={fontActor}
                  >
                    "To be the most reliable partner of government and corporate industry in
                    providing quality technical vocational training, hospitality services,
                    assessment, and job services Globally."
                  </p>
                </div>
              </div>
            </RevealOnScroll>

            <RevealOnScroll delay={120}>
              <div className="overflow-hidden rounded-[18px] bg-[#EFEFEF] shadow-[0_18px_35px_rgba(0,0,0,0.16)] transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_24px_50px_rgba(0,0,0,0.20)]">
                <div className="bg-[#355E3B] px-6 py-5 md:px-8 md:py-6">
                  <h3
                    className="text-[28px] font-black uppercase tracking-tight text-white md:text-[46px]"
                    style={fontMontserrat}
                  >
                    OUR MISSION
                  </h3>
                </div>
                <div className="px-6 py-8 text-center md:px-12 md:py-10">
                  <div className="flex justify-center">
                    <FlagIcon />
                  </div>
                  <p
                    className="mx-auto mt-6 max-w-[560px] text-[18px] leading-relaxed text-gray-500 md:text-[20px]"
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

          <RevealOnScroll delay={100} className="mt-12 text-center md:mt-16">
            <h3
              className="text-[30px] font-black uppercase tracking-tight text-[#355E3B] md:text-[60px]"
              style={fontMontserrat}
            >
              OUR CORPORATE VALUES
            </h3>
            <div className="mx-auto mt-4 h-[4px] w-40 rounded-full bg-[#355E3B] md:w-[390px]" />
            <p
              className="mx-auto mt-6 max-w-5xl text-[18px] leading-relaxed text-gray-600 md:text-[24px]"
              style={fontPontano}
            >
              Values are the principles or standards of behavior that are considered important in
              life. Our values are the rules by which we operate. We carry out our business in
              Quality Relationship, which are honest, ethical, caring and God-Fearing.
            </p>
          </RevealOnScroll>
        </section>

        <section className="mx-auto max-w-[1600px] px-4 pb-8 pt-2 md:px-8 md:pb-14">
          <div className="mx-auto max-w-6xl space-y-6">
            {lightCards.map((card, index) => (
              <RevealOnScroll key={card.title} delay={index * 90}>
                <div className="overflow-hidden rounded-2xl bg-[#EFEFEF] shadow-[0_16px_30px_rgba(0,0,0,0.16)] transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_24px_50px_rgba(0,0,0,0.22)]">
                  <div className="flex min-h-[132px]">
                    <div
                      className="flex w-[92px] shrink-0 items-center justify-center bg-[#F5F5F5] text-[72px] font-black text-[#2D6242] transition-transform duration-300 hover:scale-105 md:w-[110px] md:text-[86px]"
                      style={fontMontserrat}
                    >
                      {card.letter}
                    </div>
                    <div className="w-[2px] bg-[#8AAC8D]" />
                    <div className="flex-1 px-5 py-4 md:px-6 md:py-5">
                      <h4
                        className="text-[22px] font-black uppercase leading-none text-black md:text-[38px]"
                        style={fontMontserrat}
                      >
                        {card.title}
                      </h4>
                      <p
                        className="mt-2 text-sm leading-relaxed text-gray-600 md:text-[16px]"
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

          <RevealOnScroll delay={120} className="relative mx-auto mt-12 min-h-[290px] max-w-6xl">
            <div className="mx-auto max-w-4xl px-4 pt-4 text-center">
              <p
                className="text-[28px] font-medium leading-snug text-[#4C7A4E] md:text-[34px]"
                style={fontActor}
              >
                A symbol of holiness, goodness,
                <br />
                knowledge, wisdom, grace, hope, and
                <br />
                God's revelation
              </p>
            </div>

            <img
              src="https://placehold.co/340x520/F7F1E4/9C7A50?text=Lamp+Image"
              alt="Lamp"
              className="pointer-events-none absolute bottom-0 right-0 hidden w-[180px] object-contain md:block lg:w-[230px]"
            />
          </RevealOnScroll>
        </section>

        <section className="mx-auto max-w-[1600px] px-4 pb-10 pt-4 md:px-8 md:pb-16">
          <RevealOnScroll className="text-center">
            <h3
              className="text-[30px] font-black uppercase tracking-tight text-[#355E3B] md:text-[58px]"
              style={fontMontserrat}
            >
              OUR ACHIEVEMENTS
            </h3>
            <div className="mx-auto mt-4 h-[4px] w-44 rounded-full bg-[#355E3B] md:w-[320px]" />
          </RevealOnScroll>

          <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3 md:gap-8">
            {achievements.map((item, index) => (
              <RevealOnScroll key={item.title} delay={index * 110}>
                <div className="overflow-hidden rounded-xl bg-[#EFEFEF] shadow-[0_16px_28px_rgba(0,0,0,0.16)] transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_24px_50px_rgba(0,0,0,0.22)]">
                  <div className="h-[10px] bg-[#355E3B]" />
                  <div className="px-5 py-7 text-center md:px-6 md:py-8">
                    <div className="flex justify-center transition-transform duration-300 hover:scale-110">
                      <StarIcon />
                    </div>

                    <h4
                      className="mt-4 text-[12px] font-black uppercase tracking-wide text-gray-900 md:text-[14px]"
                      style={fontMontserrat}
                    >
                      {item.title}
                    </h4>

                    <p
                      className="mt-4 text-[13px] leading-relaxed text-gray-600 md:text-[14px]"
                      style={fontPontano}
                    >
                      {item.body}
                    </p>

                    <p
                      className="mt-4 whitespace-pre-line text-[12px] leading-relaxed text-gray-500"
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

        <section className="mx-auto max-w-[1600px] px-4 pb-16 pt-2 md:px-8 md:pb-20">
          <RevealOnScroll className="text-center">
            <h3
              className="text-[34px] font-black tracking-tight text-[#355E3B] md:text-[60px]"
              style={fontMontserrat}
            >
              Our Highlights
            </h3>
            <div className="mx-auto mt-3 h-[4px] w-40 rounded-full bg-[#355E3B] md:w-[230px]" />
          </RevealOnScroll>

          <RevealOnScroll delay={80} className="mt-8">
            <div
              className="flex flex-wrap items-center justify-center gap-3 md:gap-4"
              style={fontPoppins}
            >
              {highlightCategories.map((category) => {
                const active = selectedCategory === category;
                return (
                  <button
                    key={category}
                    type="button"
                    onClick={() => setSelectedCategory(category)}
                    className={`rounded-full px-5 py-3 text-sm font-medium shadow-sm transition-all duration-300 md:min-w-[170px] ${
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

          <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
            {visibleHighlights.slice(0, 6).map((item, index) => (
              <RevealOnScroll key={`${item.title}-${index}`} delay={index * 90}>
                <div className="group overflow-hidden rounded-xl bg-[#EFEFEF] shadow-[0_16px_28px_rgba(0,0,0,0.16)] transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_24px_50px_rgba(0,0,0,0.22)]">
                  <div className="h-[10px] bg-[#355E3B]" />
                  <div className="relative h-[220px] overflow-hidden bg-[#F6F6F6]">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className="px-5 py-4">
                    <p className="text-base font-bold text-[#355E3B]" style={fontMontserrat}>
                      {item.title}
                    </p>
                    <p className="mt-1 text-sm text-gray-500" style={fontPontano}>
                      {item.subtitle}
                    </p>
                  </div>
                </div>
              </RevealOnScroll>
            ))}
          </div>
        </section>

        <footer className="bg-[#355E3B] text-white">
          <div className="mx-auto max-w-[1600px] px-4 py-3 md:px-6 md:py-4">
            <div className="grid grid-cols-1 gap-5 md:grid-cols-[1.35fr_1fr_1.2fr_1.2fr] md:gap-0">
              <div className="flex items-center gap-3 pr-0 md:pr-6">
                <img
                  src={LOGO}
                  alt="LTC Logo"
                  className="h-10 w-10 shrink-0 rounded-full bg-white object-cover md:h-[44px] md:w-[44px]"
                />
                <div className="min-w-0">
                  <h2
                    className="text-[32px] font-black uppercase leading-none md:text-[42px]"
                    style={fontMontserrat}
                  >
                    LUMISPIRE
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
                    <button onClick={() => goTo("/contact")} className="hover:text-white">
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
                    Street, Palanan, Makati City
                  </li>
                  <li>Light Tower Center, 1730 Dian Street, Palanan, Makati City</li>
                </ul>
              </div>
            </div>

            <div className="mt-3 flex flex-col gap-1 border-t border-white/15 pt-2 text-[10px] text-white/90 md:flex-row md:items-center md:justify-between">
              <p style={fontPontano}>© 2026 LTC GROUP OF COMPANIES. All rights</p>
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