// src/TrainingAndAssessment/TrainingFaqs.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

const TAMSI_LOGO = "/tamsi-logo.png";
const LUMISPIRE_LOGO = "/HotelLumispireLogo.png";
const HERO_IMAGES = ["/tamsi-banner.jpg", "/TrainingBanner.jpg", "/training-banner.jpg"];

const fontMontserrat = { fontFamily: "'Montserrat', sans-serif" };
const fontPontano = { fontFamily: "'Pontano Sans', sans-serif" };
const fontPoppins = { fontFamily: "'Poppins', sans-serif" };

function getTrainingToken() {
  return (
    localStorage.getItem("traineeToken") ||
    localStorage.getItem("trainingToken") ||
    localStorage.getItem("token") ||
    ""
  );
}

const FAQS = [
  {
    category: "Enrollment",
    question: "How can I enroll in TAMSI?",
    answer:
      "Go to the enrollment form, choose an available course and open batch, fill in your personal information, upload the required documents, then submit your application. After submission, wait for the admin or professor approval and account credentials.",
  },
  {
    category: "Enrollment",
    question: "What requirements do I need to submit?",
    answer:
      "You need to submit your Birth Certificate, 2x2 Picture with Name, Diploma/TOR, Application Form, and other applicable documents such as Form 137/138 or Marriage Contract if required.",
  },
  {
    category: "Course",
    question: "What courses are available?",
    answer:
      "The available courses depend on the batches opened by the professor or admin. Common courses include Housekeeping and Event Management. You can check the Course page to see the current course list.",
  },
  {
    category: "Account",
    question: "How will I know if my enrollment is approved?",
    answer:
      "After your application is reviewed and approved, your trainee account will be created. You may receive your login credentials through the registered email address or through the system notification process set by the admin.",
  },
  {
    category: "Account",
    question: "What should I do if I forgot my password?",
    answer:
      "Go to the trainee login page and click Forgot Password. Follow the OTP verification process to reset your password securely.",
  },
  {
    category: "Training",
    question: "Why do I need to take the pre-test?",
    answer:
      "The pre-test helps evaluate your current knowledge before you access assignments and learning activities. Assignments uploaded by the professor will stay locked until you complete the pre-test.",
  },
  {
    category: "Training",
    question: "How do I access my modules?",
    answer:
      "Log in to your trainee account and go to Modules. Modules are connected to your assigned course and may follow your personalized learning path based on your pre-test result.",
  },
  {
    category: "Training",
    question: "How does attendance work?",
    answer:
      "For online classes, the professor may post an attendance activity where you can upload proof during the allowed upload window. For face-to-face classes, attendance may be recorded through RFID tap-in and tap-out sessions.",
  },
  {
    category: "Roadmap",
    question: "How does the competency roadmap work?",
    answer:
      "The roadmap shows the competencies for your course. You can study each competency module, take the exam, and wait for your professor to check the competency. The next roadmap step unlocks only after both the exam and professor check are completed.",
  },
  {
    category: "Certificate",
    question: "When can I get my certificate?",
    answer:
      "Your certificate becomes available after completing the required training progress, competencies, attendance, pre-test, and professor or admin completion checks.",
  },
];

const CATEGORIES = [
  "All",
  "Enrollment",
  "Course",
  "Account",
  "Training",
  "Roadmap",
  "Certificate",
];

const RevealOnScroll = ({ children, className = "", delay = 0, y = 18 }) => {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return undefined;

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

export default function TrainingFaqs() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [heroIndex, setHeroIndex] = useState(0);
  const [activeCategory, setActiveCategory] = useState("All");
  const [openIndex, setOpenIndex] = useState(-1);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const timer = window.setInterval(() => {
      setHeroIndex((prev) => (prev + 1) % HERO_IMAGES.length);
    }, 5000);

    return () => window.clearInterval(timer);
  }, []);

  const filteredFaqs = useMemo(() => {
    const q = search.trim().toLowerCase();

    return FAQS.filter((item) => {
      const categoryMatched =
        activeCategory === "All" || item.category === activeCategory;

      const searchMatched =
        !q ||
        `${item.category} ${item.question} ${item.answer}`
          .toLowerCase()
          .includes(q);

      return categoryMatched && searchMatched;
    });
  }, [activeCategory, search]);

  const goToProfile = () => {
    navigate(getTrainingToken() ? "/trainee-dashboard" : "/trainee-login");
  };

  return (
    <div className="ltc-training-faq-page" style={fontPontano}>
      <style>{`
        @import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap");

        .ltc-training-faq-page {
          --green-950: #071f14;
          --green-900: #0e3321;
          --green-800: #174a30;
          --green-700: #235f3e;
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

        .ltc-training-faq-page * {
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
          border-radius: 999px;
          background: white;
          object-fit: cover;
          box-shadow: 0 0 0 5px rgba(255,255,255,.08), 0 12px 24px rgba(0,0,0,.12);
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

        .ltc-profile-button {
          color: #102418;
          background: linear-gradient(135deg,#f4d484,#d7a84d);
          box-shadow: 0 14px 28px rgba(215,168,77,.18);
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

        .ltc-hero {
          position: relative;
          overflow: hidden;
          color: white;
          isolation: isolate;
          background: linear-gradient(120deg, #03180f 0%, #082719 42%, #155f3b 100%);
          padding: 100px 0 96px;
        }

        .ltc-hero-slide {
          position: absolute;
          inset: 0;
          z-index: -4;
          width: 100%;
          height: 100%;
          object-fit: cover;
          opacity: 0;
          transition: opacity 1000ms ease;
        }

        .ltc-hero-slide.active {
          opacity: 1;
        }

        .ltc-hero::before {
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
            );
          opacity: .98;
        }

        .ltc-hero::after {
          content: "";
          position: absolute;
          inset: -16% -10% -24% -10%;
          z-index: -2;
          background:
            radial-gradient(circle at 16% 82%, rgba(19, 120, 72, 0.36), transparent 24%),
            radial-gradient(circle at 36% 92%, rgba(7, 76, 47, 0.46), transparent 30%),
            radial-gradient(circle at 72% 18%, rgba(28, 108, 68, 0.28), transparent 30%),
            radial-gradient(circle at 88% 44%, rgba(244, 212, 132, 0.14), transparent 28%),
            radial-gradient(circle at 90% 84%, rgba(22, 108, 66, 0.30), transparent 26%);
          filter: blur(30px);
          pointer-events: none;
        }

        .ltc-hero-content {
          position: relative;
          z-index: 2;
          max-width: 920px;
          margin: 0 auto;
          text-align: center;
        }

        .ltc-hero h2 {
          margin: 0;
          color: white;
          font-size: clamp(36px, 5vw, 62px);
          line-height: 1.05;
          font-weight: 900;
          letter-spacing: -.055em;
          text-shadow: 0 8px 26px rgba(0,0,0,.22);
        }

        .ltc-hero h2 span {
          color: var(--gold-soft);
        }

        .ltc-hero p {
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

        .ltc-faq-wrapper {
          max-width: 980px;
          margin: 0 auto;
        }

        .ltc-filter-card {
          position: relative;
          overflow: hidden;
          border-radius: var(--radius);
          background: var(--glass);
          border: 1px solid rgba(255,255,255,.76);
          box-shadow: var(--shadow-md);
          backdrop-filter: blur(18px);
          padding: 30px;
          margin-bottom: 26px;
        }

        .ltc-filter-card::before,
        .ltc-faq-card::before {
          content: "";
          position: absolute;
          inset: 0 0 auto;
          height: 6px;
          background: linear-gradient(90deg,var(--green-700),var(--gold));
          z-index: 3;
        }

        .ltc-search-row {
          display: grid;
          grid-template-columns: minmax(220px, .7fr) 1.3fr;
          gap: 18px;
          align-items: start;
        }

        .ltc-search-box h4,
        .ltc-category-box h4 {
          margin: 0;
          color: var(--green-950);
          font-size: 20px;
          line-height: 1.15;
          font-weight: 900;
          letter-spacing: -.04em;
        }

        .ltc-search-box p {
          margin: 8px 0 0;
          color: var(--muted);
          font-size: 14px;
        }

        .ltc-search-input {
          width: 100%;
          min-height: 48px;
          margin-top: 16px;
          border-radius: 999px;
          border: 1px solid rgba(35,95,62,.18);
          background: rgba(255,255,255,.86);
          color: var(--green-950);
          outline: none;
          padding: 0 18px;
          font-size: 14px;
          font-weight: 700;
          box-shadow: 0 10px 22px rgba(8,39,25,.055);
        }

        .ltc-search-input:focus {
          border-color: rgba(215,168,77,.8);
          box-shadow: 0 0 0 4px rgba(215,168,77,.16);
        }

        .ltc-category-list {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          margin-top: 16px;
        }

        .ltc-category-button {
          border: 0;
          border-radius: 999px;
          padding: 10px 16px;
          cursor: pointer;
          color: var(--green-900);
          background: rgba(35,95,62,.08);
          font-size: 12px;
          font-weight: 900;
          letter-spacing: .08em;
          text-transform: uppercase;
          transition: .25s var(--ease);
        }

        .ltc-category-button:hover,
        .ltc-category-button.active {
          color: white;
          background: linear-gradient(135deg, var(--green-800), var(--green-700));
          transform: translateY(-2px);
        }

        .ltc-faq-card {
          position: relative;
          overflow: hidden;
          border-radius: var(--radius);
          background: var(--glass);
          border: 1px solid rgba(255,255,255,.76);
          box-shadow: var(--shadow-md);
          backdrop-filter: blur(18px);
          padding: 34px;
          transition: .38s var(--ease);
        }

        .ltc-faq-card:hover {
          transform: translateY(-8px);
          box-shadow: var(--shadow-lg);
          border-color: rgba(215,168,77,.45);
        }

        .ltc-faq-card-top {
          display: flex;
          align-items: end;
          justify-content: space-between;
          gap: 18px;
          margin-bottom: 20px;
          padding-top: 4px;
        }

        .ltc-faq-card-top h4 {
          margin: 0;
          color: var(--green-950);
          font-size: 24px;
          line-height: 1.15;
          font-weight: 900;
          letter-spacing: -.04em;
        }

        .ltc-faq-card-top p {
          margin: 6px 0 0;
          color: var(--muted);
          font-size: 14px;
        }

        .ltc-active-pill {
          flex: 0 0 auto;
          border-radius: 999px;
          padding: 9px 14px;
          color: #102418;
          background: linear-gradient(135deg,#f4d484,#d7a84d);
          font-size: 12px;
          font-weight: 900;
          letter-spacing: .08em;
          text-transform: uppercase;
        }

        .ltc-faq-list {
          display: grid;
          gap: 14px;
        }

        .ltc-faq-item {
          overflow: hidden;
          border-radius: 20px;
          background: rgba(255,255,255,.86);
          border: 1px solid rgba(35,95,62,.10);
          box-shadow: 0 10px 24px rgba(8,39,25,.055);
          transition: .28s var(--ease);
        }

        .ltc-faq-item:hover {
          transform: translateY(-3px);
          box-shadow: 0 18px 38px rgba(8,39,25,.10);
        }

        .ltc-faq-question {
          width: 100%;
          min-height: 68px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 18px;
          border: 0;
          cursor: pointer;
          text-align: left;
          padding: 18px 22px;
          background: white;
          color: var(--green-950);
          transition: .25s var(--ease);
        }

        .ltc-faq-question.active {
          color: white;
          background: linear-gradient(135deg, var(--green-800), var(--green-700));
        }

        .ltc-faq-question:hover {
          background: rgba(35,95,62,.08);
        }

        .ltc-faq-question.active:hover {
          background: linear-gradient(135deg, var(--green-800), var(--green-700));
        }

        .ltc-faq-question-main {
          display: grid;
          gap: 7px;
        }

        .ltc-faq-category {
          width: max-content;
          border-radius: 999px;
          padding: 5px 10px;
          color: var(--green-900);
          background: rgba(35,95,62,.08);
          font-size: 10px;
          font-weight: 900;
          letter-spacing: .12em;
          text-transform: uppercase;
        }

        .ltc-faq-question.active .ltc-faq-category {
          color: var(--gold-soft);
          background: rgba(255,255,255,.16);
        }

        .ltc-faq-question-text {
          font-size: 15px;
          line-height: 1.35;
          font-weight: 900;
          letter-spacing: -.02em;
        }

        .ltc-faq-icon {
          flex: 0 0 auto;
          width: 34px;
          height: 34px;
          border-radius: 999px;
          display: grid;
          place-items: center;
          background: rgba(35,95,62,.08);
          color: var(--green-800);
          font-size: 22px;
          font-weight: 900;
          line-height: 1;
          transition: .25s var(--ease);
        }

        .ltc-faq-question.active .ltc-faq-icon {
          background: rgba(255,255,255,.18);
          color: var(--gold-soft);
        }

        .ltc-faq-answer {
          padding: 18px 22px 20px;
          color: var(--muted);
          background: rgba(255,255,255,.72);
          font-size: 14px;
          line-height: 1.8;
        }

        .ltc-empty-state {
          border-radius: 20px;
          background: rgba(255,255,255,.86);
          border: 1px solid rgba(35,95,62,.10);
          color: var(--muted);
          padding: 22px;
          font-size: 14px;
          font-weight: 700;
        }

        .ltc-help-card {
          margin-top: 26px;
          position: relative;
          overflow: hidden;
          border-radius: var(--radius);
          background: linear-gradient(135deg, var(--green-900), var(--green-700));
          box-shadow: var(--shadow-md);
          padding: 30px;
          color: white;
        }

        .ltc-help-card::after {
          content: "";
          position: absolute;
          inset: -40% -20% auto auto;
          width: 260px;
          height: 260px;
          border-radius: 999px;
          background: rgba(244,212,132,.16);
          filter: blur(10px);
        }

        .ltc-help-card-content {
          position: relative;
          z-index: 2;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 22px;
        }

        .ltc-help-card h4 {
          margin: 0;
          color: white;
          font-size: 24px;
          line-height: 1.15;
          font-weight: 900;
          letter-spacing: -.04em;
        }

        .ltc-help-card p {
          margin: 8px 0 0;
          color: rgba(255,255,255,.74);
          font-size: 14px;
          line-height: 1.7;
        }

        .ltc-help-actions {
          flex: 0 0 auto;
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
          justify-content: flex-end;
        }

        .ltc-help-button {
          min-height: 48px;
          border: 0;
          border-radius: 999px;
          padding: 0 22px;
          cursor: pointer;
          color: #102418;
          background: linear-gradient(135deg,#f4d484,#d7a84d);
          box-shadow: 0 16px 35px rgba(215,168,77,.22);
          font-size: 13px;
          font-weight: 900;
          transition: .28s var(--ease);
        }

        .ltc-help-button.secondary {
          color: white;
          background: rgba(255,255,255,.13);
          box-shadow: none;
          border: 1px solid rgba(255,255,255,.16);
        }

        .ltc-help-button:hover {
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
          grid-template-columns: 1.2fr .8fr 1.2fr 1fr .8fr;
          gap: 22px;
          padding-bottom: 24px;
          border-bottom: 1px solid rgba(255,255,255,.1);
        }

        .ltc-footer-brand {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .ltc-footer-brand img {
          width: 42px;
          height: 42px;
          border-radius: 999px;
          object-fit: cover;
        }

        .ltc-footer h4 {
          color: white;
          font-weight: 900;
          font-size: 20px;
          line-height: 1.2;
          margin: 0;
          text-transform: uppercase;
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

        .ltc-socials {
          display: flex;
          gap: 8px;
        }

        .ltc-socials span {
          width: 26px;
          height: 26px;
          border-radius: 999px;
          background: rgba(255,255,255,.13);
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

        @media (max-width: 1100px) {
          .ltc-footer-grid {
            grid-template-columns: 1fr;
          }
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

          .ltc-search-row {
            grid-template-columns: 1fr;
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

          .ltc-help-card-content {
            flex-direction: column;
            align-items: flex-start;
          }

          .ltc-help-actions {
            width: 100%;
            justify-content: flex-start;
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

          .ltc-hero {
            padding: 76px 0 74px;
          }

          .ltc-hero h2 {
            font-size: clamp(34px, 11vw, 46px);
            letter-spacing: -.045em;
          }

          .ltc-hero p {
            font-size: 15px;
          }

          .ltc-section {
            padding: 64px 0;
          }

          .ltc-filter-card,
          .ltc-faq-card {
            padding: 24px 18px;
          }

          .ltc-faq-card-top {
            align-items: flex-start;
            flex-direction: column;
          }

          .ltc-faq-question {
            min-height: 62px;
            padding: 16px;
          }

          .ltc-faq-answer {
            padding: 16px;
          }

          .ltc-help-card {
            padding: 24px;
          }

          .ltc-help-button {
            width: 100%;
          }
        }
      `}</style>

      <Header navigate={navigate} goToProfile={goToProfile} openMenu={() => setIsOpen(true)} />

      <main>
        <section className="ltc-hero">
          {HERO_IMAGES.map((image, index) => (
            <img
              key={image}
              src={image}
              alt="TAMSI training background"
              className={`ltc-hero-slide ${heroIndex === index ? "active" : ""}`}
              onError={(event) => {
                event.currentTarget.style.display = "none";
              }}
            />
          ))}

          <div className="ltc-container ltc-hero-content">
            <RevealOnScroll>
              <h2 style={fontMontserrat}>
                Frequently Asked <span>Questions</span>
              </h2>

              <p style={fontPontano}>
                Find quick answers about enrollment, requirements, courses, trainee access, roadmap, modules, assignments, attendance, and certificates.
              </p>
            </RevealOnScroll>
          </div>
        </section>

        <section className="ltc-section">
          <div className="ltc-container">
            <RevealOnScroll className="ltc-section-title">
              <span>FAQs</span>
              <h3 style={fontMontserrat}>How can we help you?</h3>
              <p style={fontPontano}>
                Search a question, choose a category, or select a question below to view the answer.
              </p>
            </RevealOnScroll>

            <div className="ltc-faq-wrapper">
              <RevealOnScroll className="ltc-filter-card">
                <div className="ltc-search-row">
                  <div className="ltc-search-box">
                    <h4 style={fontMontserrat}>Search FAQs</h4>
                    <p style={fontPontano}>Type a keyword to quickly find training information.</p>
                    <input
                      type="text"
                      value={search}
                      onChange={(event) => {
                        setSearch(event.target.value);
                        setOpenIndex(-1);
                      }}
                      placeholder="Search FAQs"
                      className="ltc-search-input"
                      style={fontPontano}
                    />
                  </div>

                  <div className="ltc-category-box">
                    <h4 style={fontMontserrat}>Categories</h4>
                    <div className="ltc-category-list" style={fontPoppins}>
                      {CATEGORIES.map((category) => {
                        const active = activeCategory === category;

                        return (
                          <button
                            key={category}
                            type="button"
                            onClick={() => {
                              setActiveCategory(category);
                              setOpenIndex(-1);
                            }}
                            className={`ltc-category-button ${active ? "active" : ""}`}
                          >
                            {category}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </RevealOnScroll>

              <RevealOnScroll className="ltc-faq-card">
                <div className="ltc-faq-card-top">
                  <div>
                    <h4 style={fontMontserrat}>Questions &amp; Answers</h4>
                    <p style={fontPontano}>
                      Showing {filteredFaqs.length} result{filteredFaqs.length === 1 ? "" : "s"}
                    </p>
                  </div>

                  <span className="ltc-active-pill" style={fontPoppins}>{activeCategory}</span>
                </div>

                {filteredFaqs.length ? (
                  <div className="ltc-faq-list">
                    {filteredFaqs.map((item, index) => {
                      const isActive = openIndex === index;

                      return (
                        <article key={`${item.category}-${item.question}`} className="ltc-faq-item">
                          <button
                            type="button"
                            onClick={() => setOpenIndex(isActive ? -1 : index)}
                            className={`ltc-faq-question ${isActive ? "active" : ""}`}
                          >
                            <span className="ltc-faq-question-main">
                              <span className="ltc-faq-category" style={fontPoppins}>{item.category}</span>
                              <span className="ltc-faq-question-text" style={fontMontserrat}>{item.question}</span>
                            </span>

                            <span className="ltc-faq-icon">{isActive ? "−" : "+"}</span>
                          </button>

                          {isActive ? (
                            <div className="ltc-faq-answer" style={fontPontano}>
                              {item.answer}
                            </div>
                          ) : null}
                        </article>
                      );
                    })}
                  </div>
                ) : (
                  <div className="ltc-empty-state" style={fontPontano}>
                    No FAQs matched your search. Try another keyword or choose another category.
                  </div>
                )}
              </RevealOnScroll>

              <RevealOnScroll className="ltc-help-card" delay={80}>
                <div className="ltc-help-card-content">
                  <div>
                    <h4 style={fontMontserrat}>Still need assistance?</h4>
                    <p style={fontPontano}>
                      Contact TAMSI directly if your question is not listed here, or view the available courses and requirements.
                    </p>
                  </div>

                  <div className="ltc-help-actions">
                    <button
                      type="button"
                      onClick={() => navigate("/training-contact-us")}
                      className="ltc-help-button"
                      style={fontMontserrat}
                    >
                      Contact Us
                    </button>

                    <button
                      type="button"
                      onClick={() => navigate("/training-requirements")}
                      className="ltc-help-button secondary"
                      style={fontMontserrat}
                    >
                      Requirements
                    </button>
                  </div>
                </div>
              </RevealOnScroll>
            </div>
          </div>
        </section>

        <Footer />
      </main>

      {isOpen ? (
        <MobileMenu onClose={() => setIsOpen(false)} navigate={navigate} goToProfile={goToProfile} />
      ) : null}
    </div>
  );
}

function Header({ navigate, goToProfile, openMenu }) {
  const signedIn = getTrainingToken();

  return (
    <header className="ltc-header">
      <div className="ltc-container ltc-nav">
        <button
          onClick={() => navigate("/training")}
          type="button"
          className="ltc-logo"
          aria-label="Go to Training and Assessment home"
        >
          <img
            src={TAMSI_LOGO}
            alt="TAMSI logo"
            className="ltc-logo-icon"
            onError={(event) => {
              event.currentTarget.style.display = "none";
            }}
          />

          <div>
            <h1 style={fontMontserrat}>TAMSI</h1>
            <p style={fontPontano}>Training and assessment programs.</p>
          </div>
        </button>

        <nav className="ltc-desktop-nav" style={fontPoppins}>
          <NavButton label="Home" onClick={() => navigate("/training")} />
          <NavButton label="Course" onClick={() => navigate("/training-course")} />
          <NavButton label="Requirements" onClick={() => navigate("/training-requirements")} />
          <NavButton label="Contact" onClick={() => navigate("/training-contact-us")} />
          <NavButton active label="FAQs" onClick={() => navigate("/training-faqs")} />
          <NavButton
            label={signedIn ? "Profile" : "Sign In"}
            onClick={goToProfile}
            className="ltc-profile-button"
          />
        </nav>

        <button onClick={openMenu} type="button" aria-label="Open menu" className="ltc-menu-button">
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
  );
}

function NavButton({ label, onClick, active = false, className = "" }) {
  return (
    <button
      onClick={onClick}
      type="button"
      className={`ltc-nav-link ${active ? "active" : ""} ${className}`}
    >
      {label}
    </button>
  );
}

function Footer() {
  return (
    <footer className="ltc-footer">
      <div className="ltc-container ltc-footer-grid">
        <div>
          <div className="ltc-footer-brand">
            <img
              src={LUMISPIRE_LOGO}
              alt="Lumispire logo"
              onError={(event) => {
                event.currentTarget.style.display = "none";
              }}
            />

            <h4 style={fontMontserrat}>Lumispire</h4>
          </div>
        </div>

        <FooterColumn title="Menu">
          <FooterLink onClick={() => (window.location.href = "/training")}>Home</FooterLink>
          <FooterLink onClick={() => (window.location.href = "/training-course")}>Course</FooterLink>
          <FooterLink onClick={() => (window.location.href = "/training-requirements")}>Requirements</FooterLink>
          <FooterLink onClick={() => (window.location.href = "/training-contact-us")}>Contact</FooterLink>
          <FooterLink onClick={() => (window.location.href = "/training-faqs")}>FAQs</FooterLink>
          <FooterLink
            onClick={() => {
              window.location.href = getTrainingToken() ? "/trainee-dashboard" : "/trainee-login";
            }}
          >
            {getTrainingToken() ? "Profile" : "Sign In"}
          </FooterLink>
        </FooterColumn>

        <FooterColumn title="Contact Information">
          <FooterText>ltc.amsi@gmail.com</FooterText>
          <FooterText>lorengladius@ltcmultiservices.com</FooterText>
          <FooterText>09959808051 / 09516281271</FooterText>
        </FooterColumn>

        <FooterColumn title="Address">
          <FooterText>2/F 5441 Currie Street,</FooterText>
          <FooterText>Palanan, Makati City</FooterText>
        </FooterColumn>

        <FooterColumn title="Follow Us">
          <div className="ltc-socials">
            <span />
            <span />
            <span />
          </div>
        </FooterColumn>
      </div>

      <div className="ltc-container ltc-copyright">
        <span style={fontPontano}>© 2026 LTC GROUP OF COMPANIES. All rights reserved.</span>
        <span style={fontPontano}>Developed by CRMS Tech Alliance</span>
      </div>
    </footer>
  );
}

function FooterColumn({ title, children }) {
  return (
    <div>
      <h5 style={fontMontserrat}>{title}</h5>
      <div>{children}</div>
    </div>
  );
}

function FooterLink({ children, onClick }) {
  return (
    <button onClick={onClick} type="button" className="ltc-footer-link" style={fontPontano}>
      {children}
    </button>
  );
}

function FooterText({ children }) {
  return <p style={fontPontano}>{children}</p>;
}

function MobileMenu({ onClose, navigate, goToProfile }) {
  const signedIn = getTrainingToken();

  return (
    <div className="ltc-sidebar-overlay">
      <div style={{ position: "absolute", inset: 0 }} onClick={onClose} />

      <div className="ltc-sidebar-panel">
        <div className="ltc-sidebar-top">
          <p className="ltc-sidebar-title" style={fontPoppins}>
            MENU
          </p>

          <button
            onClick={onClose}
            className="ltc-sidebar-close"
            aria-label="Close menu"
            type="button"
          >
            ✕
          </button>
        </div>

        <MenuItem
          label="HOME"
          onClick={() => {
            onClose();
            navigate("/training");
          }}
        />

        <MenuItem
          label="COURSE"
          onClick={() => {
            onClose();
            navigate("/training-course");
          }}
        />

        <MenuItem
          label="REQUIREMENTS"
          onClick={() => {
            onClose();
            navigate("/training-requirements");
          }}
        />

        <MenuItem
          label="CONTACT"
          onClick={() => {
            onClose();
            navigate("/training-contact-us");
          }}
        />

        <MenuItem
          label="FAQS"
          active
          onClick={() => {
            onClose();
            navigate("/training-faqs");
          }}
        />

        <MenuItem
          label={signedIn ? "PROFILE" : "SIGN IN"}
          onClick={() => {
            onClose();
            goToProfile();
          }}
        />
      </div>
    </div>
  );
}

function MenuItem({ label, onClick, active = false }) {
  return (
    <button
      onClick={onClick}
      type="button"
      className={`ltc-sidebar-link ${active ? "active" : ""}`}
      style={fontPoppins}
    >
      {label}
    </button>
  );
}
