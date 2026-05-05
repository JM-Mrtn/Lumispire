import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import ChatbotWidget from "./ChatbotWidget";
import { getPublicLtcContent, pickPublicLtcImage } from "./ltcContentApi";

const LOGO = "/LTCLogo.jpg";

const BRAND = "#355E3B";
const ACCENT = "#1F8F5A";
const CONTACT_ROUTE = "/contact";

const fontMontserrat = { fontFamily: "'Montserrat', sans-serif" };
const fontPontano = { fontFamily: "'Pontano Sans', sans-serif" };
const fontActor = { fontFamily: "'Actor', sans-serif" };
const fontPoppins = { fontFamily: "'Poppins', sans-serif" };

const RevealOnScroll = ({ children, className = "", delay = 0, y = 24 }) => {
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

const CheckItem = ({ children }) => (
  <li className="flex items-start gap-3 text-sm text-gray-600 md:text-[15px]" style={fontPontano}>
    <span className="mt-[2px] inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#355E3B]">
      <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none">
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

const TeamProfileCard = ({ person, founder = false }) => {
  return (
    <div className="overflow-hidden rounded-2xl bg-[#F3F3F3] shadow-[0_18px_35px_rgba(0,0,0,0.15)] transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_28px_55px_rgba(0,0,0,0.22)]">
      <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr]">
        <div className="bg-[#2F5E40] px-6 py-8 text-white md:px-8 lg:min-h-full">
          <div className="flex h-full flex-col items-center justify-center text-center">
            <img
              src={person.avatar}
              alt={person.name}
              className="h-28 w-28 rounded-full bg-white object-cover md:h-32 md:w-32"
            />

            <h4
              className="mt-6 text-[18px] font-extrabold leading-tight md:text-[22px]"
              style={fontMontserrat}
            >
              {person.name}
            </h4>

            <p className="mt-2 text-sm text-white/90 md:text-[15px]" style={fontPontano}>
              {person.role}
            </p>

            <p
              className="mt-5 text-xs text-white/85 underline underline-offset-4 md:text-[13px]"
              style={fontPontano}
            >
              {person.email}
            </p>
          </div>
        </div>

        <div className="bg-[#F1F1F1] px-5 py-5 md:px-8 md:py-6">
          {founder ? (
            <>
              <h3
                className="text-[26px] font-extrabold leading-tight text-black md:text-[24px] lg:text-[26px]"
                style={fontMontserrat}
              >
                {person.title}
              </h3>

              <p className="mt-2 text-sm text-gray-500 md:text-[15px]" style={fontPontano}>
                {person.practiceAreas}
              </p>

              {person.sections?.map((section, index) => (
                <div key={index} className="mt-4">
                  {section.heading ? (
                    <h4
                      className="text-[17px] font-extrabold uppercase text-black md:text-[18px]"
                      style={fontMontserrat}
                    >
                      {section.heading}
                    </h4>
                  ) : null}

                  <div className="mt-2 space-y-3">
                    {section.body.map((paragraph, paragraphIndex) => (
                      <p
                        key={paragraphIndex}
                        className="text-sm leading-relaxed text-gray-600 md:text-[14px]"
                        style={fontPontano}
                      >
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </div>
              ))}
            </>
          ) : (
            <>
              <div className="space-y-4">
                <div>
                  <h4
                    className="text-[18px] font-extrabold uppercase text-black md:text-[20px]"
                    style={fontMontserrat}
                  >
                    EDUCATION
                  </h4>
                  <p className="mt-2 text-sm leading-relaxed text-gray-600 md:text-[15px]" style={fontPontano}>
                    {person.education}
                  </p>
                </div>

                <div>
                  <h4
                    className="text-[18px] font-extrabold uppercase text-black md:text-[20px]"
                    style={fontMontserrat}
                  >
                    PROFESSIONAL AFFILIATIONS
                  </h4>
                  <div className="mt-2 space-y-3">
                    {person.affiliations.map((paragraph, index) => (
                      <p
                        key={index}
                        className="text-sm leading-relaxed text-gray-600 md:text-[15px]"
                        style={fontPontano}
                      >
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </div>

                <div>
                  <h4
                    className="text-[18px] font-extrabold uppercase text-black md:text-[20px]"
                    style={fontMontserrat}
                  >
                    PRACTICE AREAS
                  </h4>
                  <p className="mt-2 text-sm leading-relaxed text-gray-600 md:text-[15px]" style={fontPontano}>
                    {person.practiceAreas}
                  </p>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

const Team = () => {
  const navigate = useNavigate();
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
          "She has always been involved and actively participates in all the Department of Labor & Employment (DOLE) regular meetings, seminars, events, and activities for the past ten (10) years now. She joined the Makati Tripartite Industrial Peace Council as member from 2013-2015, elected as Alternate Vice-Chairman for Management Sector from 2015-2017, and unanimously voted as Chairman for Management Sector for three (3) consecutive terms from 2017-2020, 2020-2022 and 2022-2024.",
          "Many successful people boast that they are self-made men or women; that they have become successful in life due to their own effort, because of their own strengths and abilities. But in the case of our founder Ms. Lorna Ta-a Castigador, being self-made is untrue. Her triumphant tale is entirely different from usual rags to riches biographies of other successful people. In fact, Lorna's success derived from the initials of her name and her business name reflects her client trust and confidence in her. Since 1982 until now. After Studying in Loyola High School-Bukidnon, she pursued her studies in FEATI University and University of Sto.Tomas and she graduated with a degree of Bachelor of Science in Accountancy.",
          "The founder journey to success began in Makati in 1985 when she started a company name Pinnacle Manpower Services Inc. with business partners. After 4 years she established her own namely LTC Staffing Center and now LTC Group of Companies. She rented a small office in Buendia avenue until she was able to build her own building and set up her present office.",
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
        "As the newly appointed General Manager for LTC Training and Assessment Multi-Services, Inc. (TAMSI) he will now be responsible for the overall accounting practices and in overseeing the Human Resources Department in the attainment of company goals in supporting the organization in the areas of manpower services and compensation and benefits administration.",
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
        "Currently working as General Manager for Information Technology at LTC Training and Assessment Multi-Services, Inc. responsible for the overall integrity of the network, server deployment, security, and ensuring that the network connectivity throughout the company's Local Area Network (LAN) / Wide Area Network (WAN) infrastructure is on par with technical considerations at the network level of an organization's hierarchy.",
        "Also connected with Zinunta Holdings Corporation as IT Specialist handling System and Network.",
        "Loren Narcissus has previously worked at Telus International as IT Specialist and managed a Restaurant called 'AT Wings' located at Bacoor Cavite for two (2) years. Earlier he has also worked at Metrobank under Strategic Network, as IT Programmer and Specialist tasked to resolve computer hardware, software and system problems of clients and on the application of internet resources.",
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
        "He is concurrently the General Manager for Training Assessment & Multi-Services, Inc. (TAMSI) and the one in-charge of TESDA Housekeeping, Events Management and Domestic Helper Training & Assessment Center that provide technical and vocational, skills development, and training for those interested in the field of hospitality.",
        "He is also an Insurance Agent of Cocolife where he managed to be one of the Top Rookie Sellers for one (1) year.",
        "Prior to joining TAMSI, he was a Technical Support at Hewlett-Packard and eventually joined the LTC Multi-Services and Training Center who assisted HR and Accounting Department for manpower and payroll requirements, including that of Technical and Infrastructure services of the company.",
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
        "Loren Christian, together with his groupmates in college, received the 2019 'Best Thesis Award' (University-wide) for the research entitled, Chuskits: Development of Fiber Biscuit using Corn Husk Powder. With the efficient innovation of the corn husk waste, they were cordially invited to participate in the 2019 Asean Food Conference held in Bali, Indonesia.",
        "Apart from the aforementioned recognition they were also awarded 'The Best Healthy Bento Meal' year 2016 by the Manila Tytana Colleges and the United States Department of Agriculture (USDA).",
        "He is currently the Operations Manager of Patio de Lorenzo, one of the prime events places in Bacoor Cavite and Makati City.",
        "With his competence, valuable skills, and experience, he is now the duly appointed General Manager for Hotel and Restaurant of LTC Training and Assessment Multi-Services, Inc. for the upcoming Food Hub and Resto Bar located at 5441 Curie Street: Food Station Makati.",
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
        sections: Array.isArray(member.sections) ? member.sections : [],
      }))
    : [];

  const apiFounder = apiTeamMembers.find((member) => member.isFounder);
  const apiExecutives = apiTeamMembers.filter((member) => !member.isFounder);

  const founder = apiFounder || defaultFounder;
  const executives = apiExecutives.length ? apiExecutives : defaultExecutives;

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
              const isActive = link.to === "/team";
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
                const isActive = link.to === "/team";
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
            backgroundImage:
              "url('https://placehold.co/1600x700/284A35/FFFFFF?text=LTC+BUILDING+FACADE')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="absolute inset-0 bg-[#183B29]/55" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#183B29]/20 to-[#183B29]/50" />

          <div className="relative mx-auto flex h-full max-w-[1600px] items-center justify-center px-6 text-center">
            <div className="max-w-5xl">
              <h2
                className="text-[42px] font-extrabold leading-tight text-white md:text-[64px]"
                style={fontMontserrat}
              >
                Our Management Team
              </h2>
              <p className="mt-4 text-[17px] text-white/85 md:text-[19px]" style={fontPontano}>
                Meet the exceptional leaders driving our vision forward
              </p>
              <div className="mx-auto mt-6 h-[5px] w-20 rounded-full bg-[#1F8F5A]" />
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-[1600px] px-4 py-12 md:px-8 md:py-14">
          <RevealOnScroll className="text-center">
            <h3
              className="text-[34px] font-extrabold leading-tight text-black md:text-[62px]"
              style={fontMontserrat}
            >
              Leadership with Purpose
            </h3>
            <p
              className="mx-auto mt-5 max-w-4xl text-sm leading-relaxed text-gray-500 md:text-[18px]"
              style={fontPontano}
            >
              Our management team combines decades of industry experience with innovative thinking
              to ensure LTC Group of Companies remains at the forefront of service excellence. Each
              leader brings unique expertise and passion to our organization, guiding our teams to
              deliver exceptional solutions to our clients and partners.
            </p>
          </RevealOnScroll>

          <RevealOnScroll delay={80} className="mt-12">
            <TeamProfileCard person={founder} founder />
          </RevealOnScroll>

          <RevealOnScroll delay={100} className="mt-16 text-center">
            <h3
              className="text-[38px] font-black uppercase tracking-tight text-[#355E3B] md:text-[64px]"
              style={fontMontserrat}
            >
              EXECUTIVE TEAM
            </h3>
            <div className="mx-auto mt-4 h-[5px] w-72 rounded-full bg-[#355E3B]" />
          </RevealOnScroll>

          <div className="mt-10 space-y-8">
            {executives.map((person, index) => (
              <RevealOnScroll key={person.name} delay={index * 90}>
                <TeamProfileCard person={person} />
              </RevealOnScroll>
            ))}
          </div>

          <section className="mt-14 grid grid-cols-1 gap-8 lg:grid-cols-2">
            <RevealOnScroll>
              <div className="overflow-hidden rounded-2xl bg-[#F3F3F3] shadow-[0_18px_35px_rgba(0,0,0,0.15)] transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_28px_55px_rgba(0,0,0,0.22)]">
                <div className="h-5 bg-[#355E3B]" />
                <div className="p-7 md:p-8">
                  <h4
                    className="text-[32px] font-medium leading-tight text-black md:text-[40px]"
                    style={fontActor}
                  >
                    Our Leadership Philosophy
                  </h4>

                  <p className="mt-5 text-sm leading-relaxed text-gray-600 md:text-[16px]" style={fontPontano}>
                    At LTC Group of Companies, our leadership team is committed to fostering a
                    culture of excellence, innovation, and integrity. We believe in empowering our
                    employees, valuing diversity, and building lasting relationships with our
                    clients and partners.
                  </p>

                  <p className="mt-5 text-sm leading-relaxed text-gray-600 md:text-[16px]" style={fontPontano}>
                    Our management approach combines strategic vision with hands-on expertise,
                    ensuring that we consistently deliver exceptional service while adapting to the
                    evolving needs of the industries we serve.
                  </p>

                  <ul className="mt-6 space-y-3">
                    <CheckItem>Client-focused service delivery</CheckItem>
                    <CheckItem>Ethical business practices</CheckItem>
                    <CheckItem>Continuous professional development</CheckItem>
                    <CheckItem>Community engagement</CheckItem>
                  </ul>
                </div>
              </div>
            </RevealOnScroll>

            <RevealOnScroll delay={80}>
              <div className="overflow-hidden rounded-2xl bg-[#F3F3F3] shadow-[0_18px_35px_rgba(0,0,0,0.15)] transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_28px_55px_rgba(0,0,0,0.22)]">
                <div className="h-5 bg-[#355E3B]" />
                <div className="p-7 text-center md:p-8">
                  <h4
                    className="text-[34px] font-extrabold leading-tight text-[#355E3B] md:text-[56px]"
                    style={fontMontserrat}
                  >
                    Join Our Growing Team
                  </h4>

                  <p
                    className="mx-auto mt-5 max-w-xl text-[16px] leading-relaxed text-gray-600 md:text-[18px]"
                    style={fontPontano}
                  >
                    We're always looking for talented individuals to join our team. If you're
                    passionate about excellence and innovation, we'd love to hear from you.
                  </p>

                  <button
                    onClick={() => navigate(CONTACT_ROUTE)}
                    className="mt-8 inline-flex items-center justify-center gap-3 rounded-full bg-[#355E3B] px-9 py-4 text-[20px] font-semibold text-white transition-all duration-300 hover:-translate-y-1 hover:bg-[#2C5233] hover:shadow-lg md:px-12 md:text-[28px]"
                    style={fontMontserrat}
                  >
                    Contact Us <span className="text-2xl md:text-3xl">→</span>
                  </button>
                </div>
              </div>
            </RevealOnScroll>
          </section>
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
                <ul className="mt-2 space-y-[4px] text-[12px] leading-relaxed text-white/90" style={fontPontano}>
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
                <ul className="mt-2 space-y-[6px] text-[12px] leading-relaxed text-white/90" style={fontPontano}>
                  <li>
                    5411 Light Tower Center &amp; Realty Development, Inc. Building II, Curie
                    Street, Palanan, Makati City.
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

export default Team;