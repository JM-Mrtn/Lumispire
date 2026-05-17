import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import ChatbotWidget from "./ChatbotWidget";
import { getPublicLtcContent, pickPublicLtcImage } from "./ltcContentApi";

const LOGO = "/LTCLogo.jpg";
const BANNER_SRC = "/LTCBanner.png";
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
  <li className="ltc-check-item" style={fontPontano}>
    <span className="ltc-check-icon">
      <svg viewBox="0 0 24 24" fill="none">
        <path
          d="M20 6L9 17l-5-5"
          stroke="white"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>

    <span>{children}</span>
  </li>
);

const SectionBlock = ({ title, children }) => (
  <div className="ltc-profile-section">
    <h4 style={fontMontserrat}>{title}</h4>
    <div className="ltc-profile-section-body">{children}</div>
  </div>
);

const TeamProfileCard = ({ person, founder = false }) => {
  const founderSections = Array.isArray(person.sections) ? person.sections : [];
  const affiliations = Array.isArray(person.affiliations) ? person.affiliations : [];

  return (
    <div className="ltc-team-card">
      <div className="ltc-team-card-inner">
        <aside className="ltc-team-card-side">
          <div className="ltc-team-side-content">
            <img
              src={person.avatar}
              alt={person.name}
              className="ltc-team-avatar"
              onError={(e) => {
                e.currentTarget.src = "https://placehold.co/220x220/F3F3F3/355E3B?text=Avatar";
              }}
            />

            <h4 style={fontMontserrat}>{person.name}</h4>

            <p className="ltc-team-role" style={fontPontano}>
              {person.role}
            </p>

            <p className="ltc-team-email" style={fontPontano}>
              {person.email}
            </p>
          </div>
        </aside>

        <article className="ltc-team-card-main">
          {founder ? (
            <>
              <h3 style={fontMontserrat}>{person.title}</h3>

              <p className="ltc-practice" style={fontPontano}>
                {person.practiceAreas}
              </p>

              <div className="ltc-scroll-content">
                {founderSections.map((section, index) => (
                  <div key={index} className="ltc-founder-section">
                    {section.heading ? <h4 style={fontMontserrat}>{section.heading}</h4> : null}

                    <div className="ltc-founder-body">
                      {(Array.isArray(section.body) ? section.body : []).map(
                        (paragraph, paragraphIndex) => (
                          <p key={paragraphIndex} style={fontPontano}>
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
            <div className="ltc-scroll-content">
              <SectionBlock title="Education">
                <p style={fontPontano}>{person.education}</p>
              </SectionBlock>

              <SectionBlock title="Professional Affiliations">
                <div className="ltc-paragraph-stack">
                  {affiliations.map((paragraph, index) => (
                    <p key={index} style={fontPontano}>
                      {paragraph}
                    </p>
                  ))}
                </div>
              </SectionBlock>

              <SectionBlock title="Practice Areas">
                <p style={fontPontano}>{person.practiceAreas}</p>
              </SectionBlock>
            </div>
          )}
        </article>
      </div>
    </div>
  );
};

const CompactInfoCard = ({ title, children }) => (
  <div className="ltc-compact-card">
    <h4 style={fontMontserrat}>{title}</h4>
    {children}
  </div>
);

const FooterLink = ({ children, onClick }) => (
  <li>
    <button type="button" onClick={onClick} className="ltc-footer-link">
      {children}
    </button>
  </li>
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

  const logoSrc = pickPublicLtcImage(ltcContent?.company?.logoUrl, LOGO);
  const bannerSrc = pickPublicLtcImage(ltcContent?.company?.bannerUrl, BANNER_SRC);

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
    <div className="ltc-team" style={fontPontano}>
      <style>{`
        @import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap");

        .ltc-team {
          --green-950: #071f14;
          --green-900: #0e3321;
          --green-800: #174a30;
          --green-700: #235f3e;
          --green-600: #2f754c;
          --footer-green: #082719;
          --gold: #d7a84d;
          --gold-soft: #f4d484;
          --dark: #101828;
          --muted: #667085;
          --glass: rgba(255,255,255,.78);
          --shadow-md: 0 18px 45px rgba(8,39,25,.12);
          --shadow-lg: 0 32px 80px rgba(8,39,25,.18);
          --radius: 24px;
          --ease: cubic-bezier(.22,1,.36,1);

          min-height: 100vh;
          color: var(--dark);
          background:
            radial-gradient(circle at 12% 0%, rgba(215,168,77,.12), transparent 28%),
            radial-gradient(circle at 92% 12%, rgba(35,95,62,.12), transparent 30%),
            linear-gradient(180deg,#f8fbf9 0%,#fff 42%,#f5faf7 100%);
          line-height: 1.65;
          letter-spacing: -.01em;
          overflow-x: hidden;
          font-family: "Inter", Arial, sans-serif;
        }

        .ltc-team * {
          box-sizing: border-box;
        }

        .ltc-container {
          width: min(1180px, 92%);
          margin: auto;
        }

        .ltc-header {
          position: sticky;
          top: 0;
          z-index: 50;
          width: 100%;
          background: var(--footer-green);
          border-bottom: 1px solid rgba(255,255,255,.1);
          box-shadow: 0 10px 34px rgba(7,31,20,.14);
          margin: 0;
        }

        .ltc-header .ltc-container {
          width: 100%;
          max-width: none;
          margin: 0;
          padding-left: 32px;
          padding-right: 32px;
        }

        .ltc-nav {
          min-height: 76px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 24px;
        }

        .ltc-logo {
          display: flex;
          align-items: center;
          gap: 13px;
          color: white;
          border: 0;
          background: transparent;
          cursor: pointer;
          text-align: left;
          padding: 0;
        }

        .ltc-logo-icon {
          width: 42px;
          height: 42px;
          display: grid;
          place-items: center;
          border-radius: 50%;
          background: linear-gradient(145deg,#fff,#e3f4ea);
          color: var(--green-800);
          font-weight: 900;
          box-shadow: 0 0 0 5px rgba(255,255,255,.08), 0 12px 24px rgba(0,0,0,.12);
          object-fit: cover;
        }

        .ltc-logo h1 {
          font-size: 18px;
          line-height: 1;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: -.04em;
          margin: 0;
        }

        .ltc-logo p {
          font-size: 11px;
          color: rgba(255,255,255,.72);
          margin: 3px 0 0;
        }

        .ltc-desktop-nav {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .ltc-nav-link {
          color: rgba(255,255,255,.78);
          font-size: 12px;
          font-weight: 800;
          letter-spacing: .08em;
          text-transform: uppercase;
          padding: 10px 14px;
          border-radius: 999px;
          transition: .25s var(--ease);
          border: 0;
          background: transparent;
          cursor: pointer;
        }

        .ltc-nav-link:hover,
        .ltc-nav-link.active {
          color: white;
          background: rgba(255,255,255,.13);
          transform: translateY(-1px);
        }

        .ltc-menu-button {
          display: none;
          color: white;
          border: 0;
          background: rgba(255,255,255,.1);
          border-radius: 12px;
          padding: 10px;
          cursor: pointer;
        }

        .ltc-menu-button svg {
          width: 24px;
          height: 24px;
        }

        .ltc-sidebar-overlay {
          position: fixed;
          inset: 0;
          z-index: 60;
          background: rgba(0,0,0,.42);
        }

        .ltc-sidebar-panel {
          position: absolute;
          right: 0;
          top: 0;
          height: 100%;
          width: min(310px, 86vw);
          background: white;
          box-shadow: -20px 0 60px rgba(0,0,0,.25);
          padding: 20px;
        }

        .ltc-sidebar-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid rgba(16,24,40,.1);
          padding-bottom: 16px;
          margin-bottom: 16px;
        }

        .ltc-sidebar-title {
          color: var(--green-950);
          font-weight: 900;
          letter-spacing: .14em;
          font-size: 12px;
          margin: 0;
        }

        .ltc-sidebar-close {
          width: 38px;
          height: 38px;
          border-radius: 12px;
          border: 0;
          background: #f2f4f7;
          color: #101828;
          cursor: pointer;
        }

        .ltc-sidebar-close svg {
          width: 22px;
          height: 22px;
          margin: auto;
        }

        .ltc-sidebar-link {
          display: block;
          width: 100%;
          border: 0;
          background: transparent;
          color: #101828;
          text-align: left;
          border-radius: 14px;
          padding: 13px 14px;
          font-weight: 800;
          margin-bottom: 8px;
          cursor: pointer;
        }

        .ltc-sidebar-link:hover,
        .ltc-sidebar-link.active {
          background: var(--green-800);
          color: white;
        }

        .ltc-team-hero {
          position: relative;
          overflow: hidden;
          color: white;
          isolation: isolate;
          background: linear-gradient(120deg, #03180f 0%, #082719 42%, #155f3b 100%);
          padding: 82px 0 78px;
        }

        .ltc-team-hero::before {
          content: "";
          position: absolute;
          inset: 0;
          z-index: -3;
          background:
            linear-gradient(
              120deg,
              rgba(2, 18, 11, 0.96) 0%,
              rgba(5, 37, 23, 0.88) 42%,
              rgba(12, 64, 39, 0.76) 100%
            ),
            var(--hero-image) center center / cover no-repeat;
          background-blend-mode: multiply;
          opacity: 0.96;
          transform: scale(1.02);
        }

        .ltc-team-hero::after {
          content: "";
          position: absolute;
          inset: -16% -10% -24% -10%;
          z-index: -2;
          background:
            radial-gradient(circle at 16% 82%, rgba(19, 120, 72, 0.36), transparent 24%),
            radial-gradient(circle at 36% 92%, rgba(7, 76, 47, 0.46), transparent 30%),
            radial-gradient(circle at 72% 18%, rgba(28, 108, 68, 0.28), transparent 30%),
            radial-gradient(circle at 88% 44%, rgba(244, 212, 132, 0.14), transparent 28%),
            radial-gradient(circle at 90% 84%, rgba(22, 108, 66, 0.30), transparent 26%),
            linear-gradient(135deg, rgba(3, 24, 15, 0.34), rgba(8, 56, 34, 0.08));
          filter: blur(30px);
          pointer-events: none;
        }

        .ltc-team-hero-content {
          position: relative;
          z-index: 2;
          max-width: 900px;
          margin: 0 auto;
          text-align: center;
        }

        .ltc-team-hero h2 {
          margin: 0;
          color: white;
          font-size: clamp(34px, 5vw, 58px);
          line-height: 1.05;
          font-weight: 900;
          letter-spacing: -.055em;
          text-shadow: 0 8px 26px rgba(0,0,0,.22);
        }

        .ltc-team-hero h2 span {
          color: var(--gold-soft);
        }

        .ltc-team-hero p {
          max-width: 760px;
          margin: 18px auto 0;
          color: rgba(255,255,255,.80);
          font-size: 17px;
          line-height: 1.8;
        }

        .ltc-section {
          padding: 84px 0;
        }

        .ltc-section-title {
          text-align: center;
          margin-bottom: 42px;
        }

        .ltc-section-title span {
          color: var(--green-700);
          font-size: 12px;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: .18em;
        }

        .ltc-section-title h3 {
          margin: 10px 0 0;
          color: var(--green-950);
          font-size: clamp(32px,4vw,50px);
          line-height: 1.08;
          letter-spacing: -.055em;
          font-weight: 900;
        }

        .ltc-section-title p {
          max-width: 760px;
          margin: 15px auto 0;
          color: var(--muted);
        }

        .ltc-team-card,
        .ltc-compact-card {
          position: relative;
          overflow: hidden;
          border-radius: var(--radius);
          background: var(--glass);
          border: 1px solid rgba(255,255,255,.76);
          box-shadow: var(--shadow-md);
          backdrop-filter: blur(18px);
          transition: .38s var(--ease);
        }

        .ltc-team-card::before,
        .ltc-compact-card::before {
          content: "";
          position: absolute;
          inset: 0 0 auto;
          height: 6px;
          background: linear-gradient(90deg,var(--green-700),var(--gold));
          z-index: 3;
        }

        .ltc-team-card:hover,
        .ltc-compact-card:hover {
          transform: translateY(-10px);
          box-shadow: var(--shadow-lg);
          border-color: rgba(215,168,77,.45);
        }

        .ltc-team-card-inner {
          display: grid;
          grid-template-columns: 260px 1fr;
          min-height: 310px;
        }

        .ltc-team-card-side {
          background: linear-gradient(160deg, var(--footer-green), var(--green-800));
          color: white;
          padding: 30px 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
        }

        .ltc-team-side-content {
          width: 100%;
          min-height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          margin: 0 auto;
        }

        .ltc-team-avatar {
          width: 108px;
          height: 108px;
          display: block;
          margin: 0 auto;
          border-radius: 999px;
          object-fit: cover;
          object-position: center center;
          background: #f3f3f3;
          border: 5px solid rgba(255,255,255,.92);
          box-shadow: 0 18px 38px rgba(0,0,0,.22);
        }

        .ltc-team-card-side h4 {
          width: 100%;
          margin: 18px 0 0;
          font-size: 19px;
          line-height: 1.15;
          font-weight: 900;
          letter-spacing: -.035em;
          text-align: center;
        }

        .ltc-team-role {
          width: 100%;
          margin: 8px 0 0;
          color: rgba(255,255,255,.84);
          font-size: 13px;
          line-height: 1.45;
          text-align: center;
        }

        .ltc-team-email {
          width: 100%;
          margin: 14px auto 0;
          max-width: 210px;
          color: rgba(255,255,255,.78);
          font-size: 11.5px;
          line-height: 1.35;
          text-align: center;
          text-decoration: underline;
          text-underline-offset: 4px;
          overflow-wrap: anywhere;
        }

        .ltc-team-card-main {
          background: rgba(255,255,255,.72);
          padding: 32px;
          min-height: 310px;
          display: flex;
          flex-direction: column;
        }

        .ltc-team-card-main h3 {
          margin: 0;
          color: var(--green-950);
          font-size: clamp(24px, 3vw, 34px);
          line-height: 1.1;
          font-weight: 900;
          letter-spacing: -.055em;
        }

        .ltc-practice {
          margin: 10px 0 0;
          color: var(--green-700);
          font-size: 13px;
          font-weight: 800;
          line-height: 1.6;
        }

        .ltc-scroll-content {
          margin-top: 18px;
          padding-right: 8px;
          max-height: 250px;
          overflow-y: auto;
        }

        .ltc-scroll-content::-webkit-scrollbar {
          width: 6px;
        }

        .ltc-scroll-content::-webkit-scrollbar-thumb {
          background: rgba(35,95,62,.28);
          border-radius: 999px;
        }

        .ltc-founder-section h4,
        .ltc-profile-section h4 {
          margin: 0;
          color: var(--green-950);
          font-size: 14px;
          line-height: 1.35;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: .04em;
        }

        .ltc-founder-body,
        .ltc-profile-section-body,
        .ltc-paragraph-stack {
          display: grid;
          gap: 10px;
          margin-top: 10px;
        }

        .ltc-founder-body p,
        .ltc-profile-section-body p,
        .ltc-paragraph-stack p {
          margin: 0;
          color: var(--muted);
          font-size: 13px;
          line-height: 1.7;
        }

        .ltc-profile-section + .ltc-profile-section {
          margin-top: 18px;
        }

        .ltc-team-list {
          display: grid;
          gap: 24px;
        }

        .ltc-info-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 24px;
          margin-top: 34px;
        }

        .ltc-compact-card {
          min-height: 260px;
          padding: 34px;
        }

        .ltc-compact-card h4 {
          margin: 0;
          color: var(--green-950);
          font-size: clamp(24px, 3vw, 34px);
          line-height: 1.12;
          font-weight: 900;
          letter-spacing: -.055em;
        }

        .ltc-compact-card p {
          margin: 14px 0 0;
          color: var(--muted);
          font-size: 14px;
          line-height: 1.75;
        }

        .ltc-check-list {
          list-style: none;
          padding: 0;
          margin: 18px 0 0;
          display: grid;
          gap: 10px;
        }

        .ltc-check-item {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          color: var(--muted);
          font-size: 13px;
          line-height: 1.6;
        }

        .ltc-check-icon {
          flex: 0 0 auto;
          width: 18px;
          height: 18px;
          margin-top: 2px;
          display: grid;
          place-items: center;
          border-radius: 999px;
          background: var(--green-800);
        }

        .ltc-check-icon svg {
          width: 12px;
          height: 12px;
        }

        .ltc-contact-button {
          margin-top: 22px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-height: 48px;
          padding: 0 24px;
          border-radius: 999px;
          border: 0;
          color: #102418;
          background: linear-gradient(135deg,#f4d484,#d7a84d);
          box-shadow: 0 16px 35px rgba(215,168,77,.28);
          font-size: 14px;
          font-weight: 900;
          cursor: pointer;
          transition: .28s var(--ease);
        }

        .ltc-contact-button:hover {
          transform: translateY(-3px);
        }

        .ltc-footer {
          width: 100%;
          background: var(--footer-green);
          color: white;
          padding: 30px 0 12px;
          margin: 0;
        }

        .ltc-footer .ltc-container {
          width: 100%;
          max-width: none;
          margin: 0;
          padding-left: 32px;
          padding-right: 32px;
        }

        .ltc-footer-grid {
          width: 100%;
          display: grid;
          grid-template-columns: 1.5fr .9fr 1fr 1.65fr;
          gap: 22px;
          padding-bottom: 24px;
          border-bottom: 1px solid rgba(255,255,255,.1);
        }

        .ltc-footer h4 {
          color: white;
          font-weight: 900;
          font-size: 18px;
          line-height: 1.2;
          margin: 0 0 10px;
        }

        .ltc-footer h5 {
          color: #f4d484;
          font-size: 12px;
          line-height: 1.2;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: .14em;
          margin: 0 0 10px;
        }

        .ltc-footer p,
        .ltc-footer-link {
          display: block;
          color: rgba(255,255,255,.68);
          font-size: 13px;
          line-height: 1.55;
          margin: 5px 0;
        }

        .ltc-footer-link {
          border: 0;
          background: transparent;
          padding: 0;
          cursor: pointer;
          text-align: left;
        }

        .ltc-footer-link:hover {
          color: white;
          text-decoration: underline;
        }

        .ltc-copyright {
          width: 100%;
          padding-top: 14px;
          display: flex;
          justify-content: space-between;
          gap: 12px;
          color: rgba(255,255,255,.52);
          font-size: 12px;
          line-height: 1.4;
        }

        @media (max-width: 900px) {
          .ltc-header .ltc-container {
            padding-left: 22px;
            padding-right: 22px;
          }

          .ltc-nav {
            min-height: auto;
            padding: 18px 0;
          }

          .ltc-desktop-nav {
            display: none;
          }

          .ltc-menu-button {
            display: grid;
            place-items: center;
          }

          .ltc-team-card-inner,
          .ltc-info-grid,
          .ltc-footer-grid {
            grid-template-columns: 1fr;
          }

          .ltc-team-card-side {
            padding: 32px 24px;
            min-height: 245px;
          }

          .ltc-team-side-content {
            justify-content: center;
            align-items: center;
          }

          .ltc-team-card-main {
            padding: 28px 24px;
          }

          .ltc-scroll-content {
            max-height: none;
            overflow: visible;
            padding-right: 0;
          }

          .ltc-footer {
            padding: 28px 0 12px;
          }

          .ltc-footer-grid {
            gap: 18px;
            padding-bottom: 22px;
          }

          .ltc-footer .ltc-container {
            padding-left: 22px;
            padding-right: 22px;
          }

          .ltc-copyright {
            flex-direction: column;
          }
        }

        @media (max-width: 600px) {
          .ltc-header .ltc-container,
          .ltc-footer .ltc-container {
            padding-left: 16px;
            padding-right: 16px;
          }

          .ltc-logo h1 {
            font-size: 14px;
          }

          .ltc-logo p {
            font-size: 10px;
          }

          .ltc-team-hero {
            padding: 70px 0 66px;
          }

          .ltc-team-hero h2 {
            font-size: clamp(34px, 11vw, 46px);
            letter-spacing: -.045em;
          }

          .ltc-team-hero p {
            font-size: 15px;
          }

          .ltc-section {
            padding: 64px 0;
          }

          .ltc-team-card-main,
          .ltc-compact-card {
            padding: 24px 20px;
          }

          .ltc-team-card-side {
            min-height: 230px;
          }

          .ltc-team-avatar {
            width: 96px;
            height: 96px;
          }

          .ltc-contact-button {
            width: 100%;
          }
        }
      `}</style>

      <header className="ltc-header">
        <div className="ltc-container ltc-nav">
          <button type="button" onClick={() => goTo("/")} className="ltc-logo">
            <img src={logoSrc} alt="LTC Logo" className="ltc-logo-icon" />

            <div>
              <h1 style={fontMontserrat}>
                LTC Group of Companies
                <span style={{ fontSize: "10px", verticalAlign: "super" }}>®</span>
              </h1>
              <p style={fontPontano}>Providing quality services and training solutions.</p>
            </div>
          </button>

          <nav className="ltc-desktop-nav" style={fontPoppins}>
            {navLinks.map((link) => {
              const isActive = location.pathname === link.to;

              return (
                <button
                  key={link.label}
                  onClick={() => goTo(link.to)}
                  className={`ltc-nav-link ${isActive ? "active" : ""}`}
                  type="button"
                >
                  {link.label}
                </button>
              );
            })}
          </nav>

          <button
            onClick={() => setIsSidebarOpen(true)}
            className="ltc-menu-button"
            aria-label="Open menu"
            type="button"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
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
        <div className="ltc-sidebar-overlay">
          <div
            style={{ position: "absolute", inset: 0 }}
            onClick={() => setIsSidebarOpen(false)}
          />

          <div className="ltc-sidebar-panel">
            <div className="ltc-sidebar-top">
              <p className="ltc-sidebar-title" style={fontPoppins}>
                MENU
              </p>

              <button
                onClick={() => setIsSidebarOpen(false)}
                className="ltc-sidebar-close"
                aria-label="Close menu"
                type="button"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div style={fontPoppins}>
              {navLinks.map((link) => {
                const isActive = location.pathname === link.to;

                return (
                  <button
                    key={link.label}
                    onClick={() => goTo(link.to)}
                    className={`ltc-sidebar-link ${isActive ? "active" : ""}`}
                    type="button"
                  >
                    {link.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <main>
        <section
          className="ltc-team-hero"
          style={{
            "--hero-image": `url('${bannerSrc}')`,
          }}
        >
          <div className="ltc-container ltc-team-hero-content">
            <RevealOnScroll>
              <h2 style={fontMontserrat}>
                Our Management <span>Team</span>
              </h2>

              <p style={fontPontano}>Meet the leaders driving our vision forward.</p>
            </RevealOnScroll>
          </div>
        </section>

        <section className="ltc-section">
          <div className="ltc-container">
            <RevealOnScroll className="ltc-section-title">
              <span>LTC Group of Companies</span>
              <h3 style={fontMontserrat}>Leadership with Purpose</h3>
              <p style={fontPontano}>
                Built with strong leadership, professional experience, and a commitment to quality
                service.
              </p>
            </RevealOnScroll>

            <RevealOnScroll delay={80}>
              <TeamProfileCard person={founder} founder />
            </RevealOnScroll>

            <RevealOnScroll delay={100} className="ltc-section-title">
              <span>Executive Team</span>
              <h3 style={fontMontserrat}>Meet Our Executives</h3>
            </RevealOnScroll>

            <div className="ltc-team-list">
              {executives.map((person, index) => (
                <RevealOnScroll key={person.name} delay={index * 80}>
                  <TeamProfileCard person={person} />
                </RevealOnScroll>
              ))}
            </div>

            <section className="ltc-info-grid">
              <RevealOnScroll>
                <CompactInfoCard title="Our Leadership Philosophy">
                  <p style={fontPontano}>
                    At LTC Group of Companies, our leadership team is committed to excellence,
                    innovation, integrity, and lasting relationships with clients and partners.
                  </p>

                  <p style={fontPontano}>
                    Our management approach combines strategic vision with hands-on expertise to
                    deliver consistent and reliable service.
                  </p>

                  <ul className="ltc-check-list">
                    <CheckItem>Client-focused service delivery</CheckItem>
                    <CheckItem>Ethical business practices</CheckItem>
                    <CheckItem>Continuous professional development</CheckItem>
                    <CheckItem>Community engagement</CheckItem>
                  </ul>
                </CompactInfoCard>
              </RevealOnScroll>

              <RevealOnScroll delay={80}>
                <CompactInfoCard title="Join Our Growing Team">
                  <p style={fontPontano}>
                    We are always looking for talented individuals who are passionate about service,
                    professionalism, and excellence.
                  </p>

                  <button
                    onClick={() => navigate(CONTACT_ROUTE)}
                    className="ltc-contact-button"
                    style={fontMontserrat}
                    type="button"
                  >
                    Contact Us <span style={{ marginLeft: "8px" }}>→</span>
                  </button>
                </CompactInfoCard>
              </RevealOnScroll>
            </section>
          </div>
        </section>
      </main>

      <footer className="ltc-footer">
        <div className="ltc-container ltc-footer-grid">
          <div>
            <h4 style={fontMontserrat}>LTC Group of Companies</h4>
            <p style={fontPontano}>
              Professional training, assessment, manpower, hotel and restaurant service solutions.
            </p>
          </div>

          <div>
            <h5 style={fontMontserrat}>Menu</h5>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, ...fontPontano }}>
              <FooterLink onClick={() => goTo("/")}>Home</FooterLink>
              <FooterLink onClick={() => goTo("/about-us")}>About Us</FooterLink>
              <FooterLink onClick={() => goTo("/team")}>Team</FooterLink>
              <FooterLink onClick={() => goTo("/contact")}>Contact Us</FooterLink>
            </ul>
          </div>

          <div>
            <h5 style={fontMontserrat}>Contact</h5>
            <p style={fontPontano}>lornacastigador@ltcmultiservices.com</p>
            <p style={fontPontano}>lorengladius@ltcmultiservices.com</p>
            <p style={fontPontano}>Admin@ltcmultiservices.com</p>
          </div>

          <div>
            <h5 style={fontMontserrat}>Address</h5>
            <p style={fontPontano}>
              5411 Light Tower Center &amp; Realty Development, Inc., Building II, Curie Street,
              Palanan, Makati City.
            </p>
            <p style={fontPontano}>Light Tower Center, 1730 Dian Street, Palanan, Makati City.</p>
          </div>
        </div>

        <div className="ltc-container ltc-copyright">
          <span style={fontPontano}>© 2026 LTC GROUP OF COMPANIES. All rights reserved.</span>
          <span style={fontPontano}>Developed by CRMS Tech Alliance</span>
        </div>
      </footer>

      <ChatbotWidget />
    </div>
  );
};

export default Team;