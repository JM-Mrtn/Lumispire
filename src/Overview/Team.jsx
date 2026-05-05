import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import ChatbotWidget from "./ChatbotWidget";
import { getPublicLtcContent, pickPublicLtcImage } from "./ltcContentApi";

const LOGO = "/LTCLogo.jpg";
const CONTACT_ROUTE = "/contact";

const fontMontserrat = { fontFamily: "'Montserrat', sans-serif" };
const fontPontano = { fontFamily: "'Pontano Sans', sans-serif" };
const fontPoppins = { fontFamily: "'Poppins', sans-serif" };

const RevealOnScroll = ({ children, className = "", delay = 0, y = 18 }) => {
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

const CheckItem = ({ children }) => (
  <li className="flex items-start gap-2 text-[12.5px] text-gray-600 md:text-[13px]" style={fontPontano}>
    <span className="mt-[2px] inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#355E3B]">
      <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none">
        <path
          d="M20 6L9 17l-5-5"
          stroke="white"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
    <span className="leading-relaxed">{children}</span>
  </li>
);

const SectionBlock = ({ title, children }) => (
  <div>
    <h4
      className="text-[13px] font-extrabold uppercase tracking-wide text-black md:text-[14px]"
      style={fontMontserrat}
    >
      {title}
    </h4>

    <div className="mt-1.5">{children}</div>
  </div>
);

const TeamProfileCard = ({ person, founder = false }) => {
  const founderSections = Array.isArray(person.sections) ? person.sections : [];
  const affiliations = Array.isArray(person.affiliations) ? person.affiliations : [];

  return (
    <div className="group overflow-hidden rounded-2xl bg-[#F3F3F3] shadow-[0_12px_26px_rgba(0,0,0,0.13)] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_20px_40px_rgba(0,0,0,0.18)]">
      <div className="grid grid-cols-1 md:h-[270px] md:grid-cols-[210px_1fr] lg:grid-cols-[230px_1fr]">
        <aside className="bg-[#355E3B] px-5 py-5 text-white md:h-full">
          <div className="flex h-full flex-col items-center justify-center text-center">
            <img
              src={person.avatar}
              alt={person.name}
              className="h-[86px] w-[86px] rounded-full bg-white object-cover md:h-[96px] md:w-[96px]"
              onError={(e) => {
                e.currentTarget.src = "https://placehold.co/220x220/F3F3F3/355E3B?text=Avatar";
              }}
            />

            <h4
              className="mt-4 text-[16px] font-extrabold leading-tight md:text-[18px]"
              style={fontMontserrat}
            >
              {person.name}
            </h4>

            <p className="mt-1.5 text-[12px] leading-snug text-white/90 md:text-[13px]" style={fontPontano}>
              {person.role}
            </p>

            <p
              className="mt-3 max-w-full break-words text-[10.5px] leading-snug text-white/85 underline underline-offset-4 md:text-[11px]"
              style={fontPontano}
            >
              {person.email}
            </p>
          </div>
        </aside>

        <article className="flex min-h-[270px] flex-col bg-[#F3F3F3] px-5 py-5 md:h-full md:min-h-0 md:px-6">
          {founder ? (
            <>
              <h3
                className="text-[20px] font-extrabold leading-tight text-black md:text-[24px]"
                style={fontMontserrat}
              >
                {person.title}
              </h3>

              <p
                className="mt-1.5 text-[12.5px] font-semibold leading-relaxed text-[#355E3B] md:text-[13px]"
                style={fontPontano}
              >
                {person.practiceAreas}
              </p>

              <div className="mt-4 flex-1 space-y-3 overflow-y-auto pr-2">
                {founderSections.map((section, index) => (
                  <div key={index}>
                    {section.heading ? (
                      <h4
                        className="text-[14px] font-extrabold uppercase text-black md:text-[15px]"
                        style={fontMontserrat}
                      >
                        {section.heading}
                      </h4>
                    ) : null}

                    <div className="mt-2 space-y-2">
                      {(Array.isArray(section.body) ? section.body : []).map(
                        (paragraph, paragraphIndex) => (
                          <p
                            key={paragraphIndex}
                            className="text-[12.5px] leading-relaxed text-gray-600 md:text-[13px]"
                            style={fontPontano}
                          >
                            {paragraph}
                          </p>
                        )
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="flex-1 space-y-3 overflow-y-auto pr-2">
              <SectionBlock title="Education">
                <p className="text-[12.5px] leading-relaxed text-gray-600 md:text-[13px]" style={fontPontano}>
                  {person.education}
                </p>
              </SectionBlock>

              <SectionBlock title="Professional Affiliations">
                <div className="space-y-2">
                  {affiliations.map((paragraph, index) => (
                    <p
                      key={index}
                      className="text-[12.5px] leading-relaxed text-gray-600 md:text-[13px]"
                      style={fontPontano}
                    >
                      {paragraph}
                    </p>
                  ))}
                </div>
              </SectionBlock>

              <SectionBlock title="Practice Areas">
                <p className="text-[12.5px] leading-relaxed text-gray-600 md:text-[13px]" style={fontPontano}>
                  {person.practiceAreas}
                </p>
              </SectionBlock>
            </div>
          )}
        </article>
      </div>
    </div>
  );
};

const CompactInfoCard = ({ title, children }) => (
  <div className="h-full rounded-2xl bg-[#F3F3F3] p-5 shadow-[0_12px_26px_rgba(0,0,0,0.13)] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_20px_40px_rgba(0,0,0,0.18)] md:p-6">
    <h4
      className="text-[22px] font-extrabold leading-tight text-black md:text-[28px]"
      style={fontMontserrat}
    >
      {title}
    </h4>

    {children}
  </div>
);

const Team = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [ltcContent, setLtcContent] = useState(null);

  const goTo = (path) => {
    navigate(path);
    setIsSidebarOpen(false);
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

  const defaultFounder = {
    name: "Lorna T. Castigador",
    role: "Founder & President",
    email: "lornacastigador@ltcmultiservices.com",
    title: "Founder, LTC Group of Companies",
    practiceAreas:
      "PRACTICE AREAS: Training, Marketing, Accounting, Realty, Manpower and Hotel & Restaurant Services",
    avatar: "https://placehold.co/220x220/F3F3F3/355E3B?text=Avatar",
    sections: [
      {
        heading: "PROFESSIONAL AFFILIATIONS:",
        body: [
          "As the founder of LTC Staffing Center, Inc., she aims to provide the different business sectors a total solution for quality training and HR support services. Prior to this, she worked as Assistant Marketing Manager of Staff Builders International, Assistant Marketing Manager of CMO Manpower, Recruitment & Marketing Manager for Human Resource & Services, Inc., and General Manager & Founder of Pinnacle Manpower Services, companies that focused on workforce management solutions.",
          "She is the former PALSCON Director & Chairman of Ways & Means from 1995-1998, Treasurer & Director from 1998 to 2008, Vice-President from 2008-2010 and Director from 2010-2012 respectively.",
          "She has always been involved and actively participates in all the Department of Labor & Employment regular meetings, seminars, events, and activities for the past ten years now.",
          "The founder journey to success began in Makati in 1985 when she started a company named Pinnacle Manpower Services Inc. with business partners. After 4 years she established her own namely LTC Staffing Center and now LTC Group of Companies.",
        ],
      },
    ],
  };

  const defaultExecutives = [
    {
      name: "Loren Gladius T. Castigador",
      role: "General Manager for Manpower Services (TAMSI)",
      email: "lorengladius1224@yahoo.com",
      avatar: "https://placehold.co/220x220/F3F3F3/355E3B?text=Avatar",
      education:
        "Graduated from Adamson University with a Bachelor of Science degree in Business Administration major in Operation Management.",
      affiliations: [
        "He has previously worked with LTC Multi-Services and Training Center as the Head of Accounting Department overseeing the overall daily operations of the Accounting Department.",
        "As the newly appointed General Manager for LTC Training and Assessment Multi-Services, Inc. he will now be responsible for the overall accounting practices and overseeing the Human Resources Department.",
      ],
      practiceAreas: "Human Resource, Accounting, & Manpower Services",
    },
    {
      name: "Loren Narcissus T. Castigador",
      role: "General Manager for System Services",
      email: "lorengladius1224@yahoo.com",
      avatar: "https://placehold.co/220x220/F3F3F3/355E3B?text=Avatar",
      education:
        "He finished his course of Bachelor of Science in Information System from the De La Salle College of Saint Benilde.",
      affiliations: [
        "Currently working as General Manager for Information Technology at LTC Training and Assessment Multi-Services, Inc.",
        "Also connected with Zinunta Holdings Corporation as IT Specialist handling System and Network.",
        "Previously worked at Telus International as IT Specialist and earlier worked at Metrobank under Strategic Network.",
      ],
      practiceAreas: "Technical Support, and IT Infrastructure",
    },
    {
      name: "Loren Larkspur T. Castigador",
      role: "General Manager for Training & Assessment (TAMSI)",
      email: "lorengladius1224@yahoo.com",
      avatar: "https://placehold.co/220x220/F3F3F3/355E3B?text=Avatar",
      education:
        "Earned his Bachelor of Science in Business Administration Major in Computer Application from the De La Salle College of Saint Benilde.",
      affiliations: [
        "He is concurrently the General Manager for Training Assessment & Multi-Services, Inc. and is in-charge of TESDA Housekeeping, Events Management and Domestic Helper Training & Assessment Center.",
        "He is also an Insurance Agent of Cocolife where he managed to be one of the Top Rookie Sellers for one year.",
        "Prior to joining TAMSI, he was a Technical Support at Hewlett-Packard and eventually joined LTC Multi-Services and Training Center.",
      ],
      practiceAreas: "IT Infrastructure, Technical Support, Training & Assessment Services.",
    },
    {
      name: "Loren Christian T. Castigador",
      role: "General Manager for Hotel & Restaurant",
      email: "christcastigador1220@gmail.com",
      avatar: "https://placehold.co/220x220/F3F3F3/355E3B?text=Avatar",
      education:
        "Earned his Bachelor of Science in Business Administration Major in Computer Application from the De La Salle College of Saint Benilde.",
      affiliations: [
        "Together with his groupmates in college, he received the 2019 Best Thesis Award for the research entitled Chuskits: Development of Fiber Biscuit using Corn Husk Powder.",
        "He is currently the Operations Manager of Patio de Lorenzo, one of the prime events places in Bacoor Cavite and Makati City.",
        "He is now the duly appointed General Manager for Hotel and Restaurant of LTC Training and Assessment Multi-Services, Inc.",
      ],
      practiceAreas: "Hotel & Restaurant, Events Places, Food Hub, Resto Bar and Condotel.",
    },
  ];

  const apiTeamMembers = Array.isArray(ltcContent?.teamMembers)
    ? ltcContent.teamMembers.map((member) => ({
        ...member,
        avatar: pickPublicLtcImage(
          member.avatar,
          "https://placehold.co/220x220/F3F3F3/355E3B?text=Avatar"
        ),
        affiliations: Array.isArray(member.affiliations) ? member.affiliations : [],
        sections: Array.isArray(member.sections)
          ? member.sections.map((section) => ({
              ...section,
              body: Array.isArray(section.body) ? section.body : [],
            }))
          : [],
      }))
    : [];

  const apiFounder = apiTeamMembers.find((member) => member.isFounder);
  const apiExecutives = apiTeamMembers.filter((member) => !member.isFounder);

  const founder = apiFounder || defaultFounder;
  const executives = apiExecutives.length ? apiExecutives : defaultExecutives;

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
        <section
          className="relative h-[200px] w-full md:h-[230px] lg:h-[250px]"
          style={{
            backgroundImage:
              "url('https://placehold.co/1600x700/284A35/FFFFFF?text=LTC+BUILDING+FACADE')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="absolute inset-0 bg-[#183B29]/60" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#183B29]/20 to-[#183B29]/55" />

          <div className="relative mx-auto flex h-full max-w-[1600px] items-center justify-center px-6 text-center">
            <div className="max-w-4xl">
              <h2
                className="text-[30px] font-extrabold leading-tight text-white md:text-[44px]"
                style={fontMontserrat}
              >
                Our Management Team
              </h2>

              <p className="mt-3 text-[13px] text-white/90 md:text-[15px]" style={fontPontano}>
                Meet the leaders driving our vision forward
              </p>

              <div className="mx-auto mt-4 h-[4px] w-16 rounded-full bg-[#1F8F5A]" />
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-[1300px] px-4 py-7 md:px-8 md:py-8">
          <RevealOnScroll className="text-center">
            <h3
              className="text-[30px] font-extrabold leading-tight text-black md:text-[42px]"
              style={fontMontserrat}
            >
              Leadership with Purpose
            </h3>

            <p
              className="mx-auto mt-3 max-w-3xl text-[13px] leading-relaxed text-gray-500 md:text-[15px]"
              style={fontPontano}
            >
              Built with strong leadership, professional experience, and a commitment to quality
              service.
            </p>
          </RevealOnScroll>

          <RevealOnScroll delay={80} className="mt-7">
            <TeamProfileCard person={founder} founder />
          </RevealOnScroll>

          <RevealOnScroll delay={100} className="mt-9 text-center">
            <h3
              className="text-[28px] font-black uppercase tracking-tight text-[#355E3B] md:text-[40px]"
              style={fontMontserrat}
            >
              Executive Team
            </h3>

            <div className="mx-auto mt-3 h-[4px] w-36 rounded-full bg-[#355E3B]" />
          </RevealOnScroll>

          <div className="mt-7 space-y-5">
            {executives.map((person, index) => (
              <RevealOnScroll key={person.name} delay={index * 80}>
                <TeamProfileCard person={person} />
              </RevealOnScroll>
            ))}
          </div>

          <section className="mt-8 grid grid-cols-1 gap-5 lg:grid-cols-2">
            <RevealOnScroll>
              <CompactInfoCard title="Our Leadership Philosophy">
                <p
                  className="mt-3 text-[12.5px] leading-relaxed text-gray-600 md:text-[13.5px]"
                  style={fontPontano}
                >
                  At LTC Group of Companies, our leadership team is committed to excellence,
                  innovation, integrity, and lasting relationships with clients and partners.
                </p>

                <p
                  className="mt-3 text-[12.5px] leading-relaxed text-gray-600 md:text-[13.5px]"
                  style={fontPontano}
                >
                  Our management approach combines strategic vision with hands-on expertise to
                  deliver consistent and reliable service.
                </p>

                <ul className="mt-4 space-y-2">
                  <CheckItem>Client-focused service delivery</CheckItem>
                  <CheckItem>Ethical business practices</CheckItem>
                  <CheckItem>Continuous professional development</CheckItem>
                  <CheckItem>Community engagement</CheckItem>
                </ul>
              </CompactInfoCard>
            </RevealOnScroll>

            <RevealOnScroll delay={80}>
              <CompactInfoCard title="Join Our Growing Team">
                <p
                  className="mt-3 text-[12.5px] leading-relaxed text-gray-600 md:text-[13.5px]"
                  style={fontPontano}
                >
                  We are always looking for talented individuals who are passionate about service,
                  professionalism, and excellence.
                </p>

                <button
                  onClick={() => navigate(CONTACT_ROUTE)}
                  className="mt-5 inline-flex items-center justify-center rounded-full bg-[#355E3B] px-6 py-2.5 text-[13px] font-semibold text-white transition-all duration-300 hover:-translate-y-1 hover:bg-[#2C5233] hover:shadow-lg"
                  style={fontMontserrat}
                >
                  Contact Us <span className="ml-2">→</span>
                </button>
              </CompactInfoCard>
            </RevealOnScroll>
          </section>
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

export default Team;