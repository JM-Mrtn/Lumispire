// src/TrainingAndAssessment/TraineeHome.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { buildTrainingFileUrl } from "./trainingFileUrl";

function normalizeApiBase(raw) {
  if (!raw) return "http://localhost:5000/api";

  const r = String(raw).replace(/\/+$/, "");

  if (r.endsWith("/api/hotel")) {
    return r.replace(/\/api\/hotel$/i, "/api");
  }

  if (r.endsWith("/api")) return r;

  if (r.includes("/api/")) {
    return r.replace(/\/api\/hotel.*$/i, "/api");
  }

  return `${r}/api`;
}

const API_BASE = normalizeApiBase(
  import.meta.env.VITE_TRAINING_API_URL || import.meta.env.VITE_API_URL
);

const API_ORIGIN = API_BASE.replace(/\/api$/i, "");

const TRAINING_CONTACT_INFO = {
  email1: "ltc.tamsi@gmail.com",
  email2: "lorengladis@ltcmultiservices.com",
  phone: "09959808051 / 09516281271",
  addressLine1: "2/F 5441 Curie Street,",
  addressLine2: "Palanan, Makati City",
};

const TRAINEE_NAV_ITEMS = [
  { key: "home", label: "Home", path: "/trainee-home" },
  { key: "roadmap", label: "Roadmap", path: "/trainee-roadmap" },
  { key: "attendance", label: "Attendance", path: "/trainee-attendance" },
  { key: "modules", label: "Modules", path: "/trainee-modules" },
  { key: "assignment", label: "Assignment", path: "/trainee-assignment" },
  { key: "progress", label: "Progress", path: "/trainee-progress" },
];

const fontMontserrat = { fontFamily: "'Montserrat', sans-serif" };
const fontPontano = { fontFamily: "'Pontano Sans', sans-serif" };
const fontPoppins = { fontFamily: "'Poppins', sans-serif" };

const pageStyles = `
  @import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap");

  .ltc-trainee-home-page {
    --green-950: #071f14;
    --green-900: #0e3321;
    --green-800: #174a30;
    --green-700: #235f3e;
    --footer-green: #082719;
    --gold: #d7a84d;
    --gold-soft: #f4d484;
    --dark: #101828;
    --muted: #667085;
    --glass: rgba(255,255,255,.84);
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

  .ltc-trainee-home-page * { box-sizing: border-box; }
  .ltc-container { width: min(1180px, 92%); margin: auto; }

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
    margin-left: auto;
  }

  .ltc-profile-wrap {
    display: flex;
    align-items: center;
    gap: 12px;
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
    white-space: nowrap;
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

  .ltc-profile-avatar {
    width: 42px;
    height: 42px;
    overflow: hidden;
    border-radius: 999px;
    border: 0;
    background: rgba(255,255,255,.9);
    cursor: pointer;
    padding: 0;
    box-shadow: 0 0 0 4px rgba(255,255,255,.08), 0 12px 24px rgba(0,0,0,.14);
  }

  .ltc-profile-avatar img { width: 100%; height: 100%; object-fit: cover; }

  .ltc-menu-button {
    display: none;
    color: white;
    border: 0;
    background: rgba(255,255,255,.1);
    border-radius: 12px;
    padding: 10px;
    cursor: pointer;
  }

  .ltc-menu-button svg { width: 24px; height: 24px; }

  .ltc-hero {
    position: relative;
    overflow: hidden;
    color: white;
    isolation: isolate;
    background: linear-gradient(120deg, #03180f 0%, #082719 42%, #155f3b 100%);
    padding: 92px 0 86px;
  }

  .ltc-hero-slide {
    position: absolute;
    inset: 0;
    z-index: -4;
    width: 100%;
    height: 100%;
    object-fit: cover;
    opacity: .34;
  }

  .ltc-hero::before {
    content: "";
    position: absolute;
    inset: 0;
    z-index: -3;
    background: linear-gradient(120deg, rgba(2,18,11,.96) 0%, rgba(5,37,23,.88) 42%, rgba(12,64,39,.76) 100%);
  }

  .ltc-hero::after {
    content: "";
    position: absolute;
    inset: -16% -10% -24% -10%;
    z-index: -2;
    background:
      radial-gradient(circle at 16% 82%, rgba(19,120,72,.36), transparent 24%),
      radial-gradient(circle at 36% 92%, rgba(7,76,47,.46), transparent 30%),
      radial-gradient(circle at 72% 18%, rgba(28,108,68,.28), transparent 30%),
      radial-gradient(circle at 88% 44%, rgba(244,212,132,.14), transparent 28%),
      radial-gradient(circle at 90% 84%, rgba(22,108,66,.30), transparent 26%);
    filter: blur(30px);
    pointer-events: none;
  }

  .ltc-hero-content {
    position: relative;
    z-index: 2;
    max-width: 980px;
    margin: 0 auto;
    text-align: center;
  }

  .ltc-eyebrow {
    display: inline-flex;
    color: var(--gold-soft);
    background: rgba(255,255,255,.12);
    border: 1px solid rgba(255,255,255,.24);
    border-radius: 999px;
    padding: 12px 22px;
    font-size: 12px;
    font-weight: 900;
    letter-spacing: .22em;
    text-transform: uppercase;
    backdrop-filter: blur(8px);
  }

  .ltc-hero-title {
    margin: 18px 0 0;
    color: white;
    font-size: clamp(38px, 6vw, 76px);
    line-height: 1.05;
    font-weight: 900;
    letter-spacing: -.055em;
    text-shadow: 0 8px 26px rgba(0,0,0,.22);
  }

  .ltc-hero-title span { color: var(--gold-soft); }

  .ltc-hero-text {
    max-width: 760px;
    margin: 18px auto 0;
    color: rgba(255,255,255,.82);
    font-size: 17px;
    line-height: 1.8;
  }

  .ltc-section { padding: 74px 0; }

  .ltc-home-shell {
    position: relative;
    overflow: hidden;
    border-radius: var(--radius);
    background: var(--glass);
    border: 1px solid rgba(255,255,255,.76);
    box-shadow: var(--shadow-md);
    backdrop-filter: blur(18px);
    padding: 34px;
  }

  .ltc-home-shell::before {
    content: "";
    position: absolute;
    inset: 0 0 auto;
    height: 6px;
    background: linear-gradient(90deg,var(--green-700),var(--gold));
    z-index: 3;
  }

  .ltc-home-shell:hover {
    box-shadow: var(--shadow-lg);
    border-color: rgba(215,168,77,.45);
  }

  .ltc-section-heading {
    margin: 0;
    color: var(--green-950);
    font-size: clamp(28px,3vw,42px);
    line-height: 1.08;
    letter-spacing: -.05em;
    font-weight: 900;
  }

  .ltc-section-line {
    margin-top: 12px;
    width: 180px;
    height: 3px;
    border-radius: 999px;
    background: linear-gradient(90deg,var(--green-700),var(--gold));
  }

  .ltc-section-intro {
    max-width: 760px;
    margin: 16px 0 0;
    color: var(--muted);
    font-size: 15px;
    font-weight: 700;
  }

  .ltc-quick-grid {
    margin-top: 32px;
    display: grid;
    grid-template-columns: repeat(5, minmax(0, 1fr));
    gap: 18px;
  }

  .ltc-quick-card {
    position: relative;
    overflow: hidden;
    min-height: 238px;
    border: 1px solid rgba(35,95,62,.12);
    border-radius: 22px;
    background: white;
    padding: 24px 18px;
    text-align: center;
    cursor: pointer;
    box-shadow: 0 16px 34px rgba(8,39,25,.08);
    transition: .25s var(--ease);
  }

  .ltc-quick-card::before {
    content: "";
    position: absolute;
    inset: 0 0 auto;
    height: 5px;
    background: linear-gradient(90deg,var(--green-700),var(--gold));
    opacity: .92;
  }

  .ltc-quick-card:hover {
    transform: translateY(-6px);
    border-color: rgba(215,168,77,.55);
    box-shadow: 0 22px 44px rgba(8,39,25,.14);
  }

  .ltc-icon-frame {
    display: grid;
    place-items: center;
    width: 88px;
    height: 88px;
    margin: 0 auto;
    border-radius: 26px;
    color: var(--green-800);
    background: rgba(35,95,62,.08);
    box-shadow: inset 0 0 0 1px rgba(35,95,62,.08);
  }

  .ltc-icon-frame svg { width: 58px; height: 58px; }

  .ltc-quick-title {
    margin: 18px 0 0;
    color: var(--green-950);
    font-size: 19px;
    line-height: 1.2;
    font-weight: 900;
    letter-spacing: -.03em;
  }

  .ltc-card-action {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 130px;
    min-height: 42px;
    margin-top: 22px;
    border-radius: 999px;
    color: #102418;
    background: linear-gradient(135deg,#f4d484,#d7a84d);
    box-shadow: 0 14px 28px rgba(215,168,77,.18);
    font-size: 12px;
    font-weight: 900;
    letter-spacing: .1em;
    text-transform: uppercase;
    transition: .25s var(--ease);
  }

  .ltc-quick-card:hover .ltc-card-action {
    transform: translateY(-2px);
    background: linear-gradient(135deg,#f7dc93,#c99634);
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
    background: white;
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

  .ltc-footer-link:hover { color: white; text-decoration: underline; }
  .ltc-socials { display: flex; gap: 8px; }
  .ltc-socials span { width: 26px; height: 26px; border-radius: 999px; background: rgba(255,255,255,.13); }

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

  .ltc-sidebar-overlay { position: fixed; inset: 0; z-index: 80; background: rgba(0,0,0,.42); }
  .ltc-sidebar-panel { position: absolute; right: 0; top: 0; height: 100%; width: min(310px,86vw); background: white; box-shadow: -20px 0 60px rgba(0,0,0,.25); padding: 20px; }
  .ltc-sidebar-top { display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid rgba(16,24,40,.1); padding-bottom: 16px; margin-bottom: 16px; }
  .ltc-sidebar-title { color: var(--green-950); font-weight: 900; letter-spacing: .14em; font-size: 12px; margin: 0; }
  .ltc-sidebar-close { width: 38px; height: 38px; border-radius: 12px; border: 0; background: #f2f4f7; color: #101828; cursor: pointer; }
  .ltc-sidebar-link { display: block; width: 100%; border: 0; background: transparent; color: #101828; text-align: left; border-radius: 14px; padding: 13px 14px; font-weight: 800; margin-bottom: 8px; cursor: pointer; }
  .ltc-sidebar-link:hover,
  .ltc-sidebar-link.active { background: var(--green-800); color: white; }

  @media (max-width: 1180px) {
    .ltc-quick-grid { grid-template-columns: repeat(3, minmax(0,1fr)); }
    .ltc-footer-grid { grid-template-columns: 1fr 1fr; }
  }

  @media (max-width: 900px) {
    .ltc-header .ltc-container { padding-left: 22px; padding-right: 22px; }
    .ltc-nav { min-height: auto; padding: 18px 0; }
    .ltc-desktop-nav,
    .ltc-profile-wrap { display: none; }
    .ltc-menu-button { display: grid; place-items: center; }
    .ltc-hero { padding: 76px 0 74px; }
    .ltc-section { padding: 58px 0; }
    .ltc-home-shell { padding: 28px 22px; }
    .ltc-quick-grid { grid-template-columns: repeat(2, minmax(0,1fr)); }
    .ltc-footer { padding: 28px 0 12px; }
    .ltc-footer-grid { grid-template-columns: 1fr; gap: 18px; padding-bottom: 22px; }
    .ltc-footer .ltc-container { padding-left: 22px; padding-right: 22px; }
    .ltc-copyright { flex-direction: column; }
  }

  @media (max-width: 600px) {
    .ltc-header .ltc-container,
    .ltc-footer .ltc-container { padding-left: 16px; padding-right: 16px; }
    .ltc-logo h1 { font-size: 14px; }
    .ltc-logo p { font-size: 10px; }
    .ltc-hero-title { font-size: clamp(34px, 11vw, 46px); letter-spacing: -.045em; }
    .ltc-hero-text { font-size: 15px; }
    .ltc-home-shell { padding: 26px 18px; }
    .ltc-quick-grid { grid-template-columns: 1fr; }
  }
`;

function getToken() {
  return localStorage.getItem("trainingToken") || "";
}

async function readJsonSafe(res) {
  const text = await res.text();

  try {
    return JSON.parse(text);
  } catch {
    throw new Error(text?.slice(0, 180) || "Invalid server response.");
  }
}

function normalizeSlashes(value) {
  return String(value || "")
    .trim()
    .replace(/\\/g, "/");
}

function getObjectIdString(value) {
  if (!value) return "";

  if (typeof value === "string") return value;

  if (typeof value === "object") {
    if (value.$oid) return String(value.$oid);

    if (value.toString && value.toString() !== "[object Object]") {
      return String(value.toString());
    }
  }

  return "";
}

function getFilePath(file) {
  if (!file) return "";

  if (typeof file === "string") {
    return normalizeSlashes(file);
  }

  if (typeof file === "object") {
    return normalizeSlashes(
      file.filePath ||
        file.path ||
        file.url ||
        file.secure_url ||
        file.location ||
        file.file ||
        ""
    );
  }

  return "";
}

function getFileId(file) {
  if (!file || typeof file !== "object") return "";
  return getObjectIdString(file.fileId);
}

function buildFileUrl(file) {
  const fileId = getFileId(file);

  if (fileId) {
    return buildTrainingFileUrl(fileId);
  }

  const filePath = getFilePath(file);

  if (!filePath) return "";

  if (/^https?:\/\//i.test(filePath)) {
    return filePath;
  }

  const fileIdMatch = filePath.match(/(?:^|\/)api\/training-files\/([^/?#]+)/i);

  if (fileIdMatch?.[1]) {
    return buildTrainingFileUrl(fileIdMatch[1]);
  }

  return `${API_ORIGIN}${filePath.startsWith("/") ? filePath : `/${filePath}`}`;
}

const TraineeHome = () => {
  const navigate = useNavigate();
  const token = useMemo(() => getToken(), []);

  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("trainingUser") || "null");
    } catch {
      return null;
    }
  });

  useEffect(() => {
    const loadProfile = async () => {
      if (!token) {
        navigate("/trainee-login", { replace: true });
        return;
      }

      try {
        const res = await fetch(`${API_BASE}/training/profile`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await readJsonSafe(res);

        if (res.status === 401 || res.status === 403) {
          localStorage.removeItem("trainingToken");
          localStorage.removeItem("trainingUser");
          localStorage.removeItem("trainingPretestState");
          navigate("/trainee-login", { replace: true });
          return;
        }

        if (!res.ok) {
          throw new Error(data?.message || "Failed to load profile.");
        }

        const fetchedUser = data?.user || null;

        if (fetchedUser) {
          setUser(fetchedUser);
          localStorage.setItem("trainingUser", JSON.stringify(fetchedUser));
        }
      } catch (error) {
        console.error("Failed to load trainee profile:", error);
      }
    };

    loadProfile();
  }, [token, navigate]);

  const goTo = (path) => {
    setMobileOpen(false);
    navigate(path);
  };

  const goToProfile = () => {
    const savedToken = localStorage.getItem("trainingToken");
    goTo(savedToken ? "/trainee-profile" : "/trainee-login");
  };

  const profilePhotoUrl = buildFileUrl(user?.profilePhoto);

  const quickCards = [
    { title: "Roadmap", action: "View", route: "/trainee-roadmap" },
    { title: "Attendance", action: "Submit", route: "/trainee-attendance" },
    { title: "Modules", action: "View", route: "/trainee-modules" },
    { title: "Assignment", action: "Answer", route: "/trainee-assignment" },
    { title: "Progress", action: "View", route: "/trainee-progress" },
  ];

  return (
    <div className="ltc-trainee-home-page">
      <style>{pageStyles}</style>

      <Header
        goTo={goTo}
        goToProfile={goToProfile}
        profilePhotoUrl={profilePhotoUrl}
        onOpenMenu={() => setMobileOpen(true)}
      />

      <main>
        <section className="ltc-hero">
          <img
            src="/TrainingBanner.png"
            alt="TAMSI Training Banner"
            className="ltc-hero-slide"
            onError={(event) => {
              event.currentTarget.style.display = "none";
            }}
          />

          <div className="ltc-container ltc-hero-content">
            <h2 className="ltc-hero-title" style={fontMontserrat}>
              TAMSI Training <span>And Assessment</span>
            </h2>
            <p className="ltc-hero-text" style={fontPontano}>
              Welcome to your trainee dashboard. View your roadmap, submit attendance, access modules, answer assignments, and check your progress.
            </p>
          </div>
        </section>

        <section className="ltc-section">
          <div className="ltc-container">
            <div className="ltc-home-shell">
              <h2 className="ltc-section-heading" style={fontMontserrat}>
                Welcome to Training &amp; Assessment
              </h2>
              <div className="ltc-section-line" />
              <p className="ltc-section-intro" style={fontPoppins}>
                Choose one of the trainee actions below to continue your training workflow.
              </p>

              <div className="ltc-quick-grid">
                {quickCards.map((item) => (
                  <QuickCard
                    key={item.title}
                    title={item.title}
                    action={item.action}
                    onClick={() => goTo(item.route)}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer goTo={goTo} />

      {mobileOpen ? (
        <MobileMenu
          onClose={() => setMobileOpen(false)}
          goTo={goTo}
          goToProfile={goToProfile}
        />
      ) : null}
    </div>
  );
};

function Header({ goTo, goToProfile, profilePhotoUrl, onOpenMenu }) {
  return (
    <header className="ltc-header">
      <div className="ltc-container">
        <div className="ltc-nav">
          <button
            type="button"
            onClick={() => goTo("/trainee-home")}
            className="ltc-logo"
            aria-label="TAMSI Trainee Home"
          >
            <img
              src="/TamsiLogo.png"
              alt="TAMSI Logo"
              className="ltc-logo-icon"
              onError={(event) => {
                event.currentTarget.src =
                  "https://placehold.co/80x80/ffffff/45674b?text=T";
              }}
            />
            <div>
              <h1 style={fontMontserrat}>TRAINING & ASSESSMENT</h1>
            </div>
          </button>

          <nav className="ltc-desktop-nav" aria-label="Trainee navigation">
            {TRAINEE_NAV_ITEMS.map((item) => (
              <HeaderNavButton
                key={item.key}
                label={item.label}
                active={item.key === "home"}
                onClick={() => goTo(item.path)}
              />
            ))}
          </nav>

          <div className="ltc-profile-wrap">
            <HeaderNavButton
              label="Profile"
              className="ltc-profile-button"
              onClick={goToProfile}
            />
            <button
              type="button"
              onClick={goToProfile}
              className="ltc-profile-avatar"
              aria-label="Profile"
            >
              <ProfileImage profilePhotoUrl={profilePhotoUrl} />
            </button>
          </div>

          <button
            type="button"
            onClick={onOpenMenu}
            className="ltc-menu-button"
            aria-label="Open menu"
          >
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M4 7h16M4 12h16M4 17h16"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}

function HeaderNavButton({ label, active = false, onClick, className = "" }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`ltc-nav-link ${active ? "active" : ""} ${className}`}
      style={fontPoppins}
    >
      {label}
    </button>
  );
}

function QuickCard({ title, action, onClick }) {
  return (
    <button type="button" onClick={onClick} className="ltc-quick-card">
      <span className="ltc-icon-frame">
        <PaperIcon />
      </span>
      <h3 className="ltc-quick-title" style={fontMontserrat}>{title}</h3>
      <span className="ltc-card-action" style={fontPoppins}>{action}</span>
    </button>
  );
}

function ProfileImage({ profilePhotoUrl }) {
  if (profilePhotoUrl) {
    return (
      <img
        src={profilePhotoUrl}
        alt="Profile"
        onError={(e) => {
          e.currentTarget.src =
            "https://placehold.co/80x80/d7ddd4/45674b?text=P";
        }}
      />
    );
  }

  return (
    <img
      src="https://placehold.co/80x80/d7ddd4/45674b?text=P"
      alt="Profile"
    />
  );
}

function Footer({ goTo }) {
  return (
    <footer className="ltc-footer">
      <div className="ltc-container ltc-footer-grid">
        <div>
          <div className="ltc-footer-brand">
            <img
              src="/TamsiLogo.png"
              alt="TAMSI Logo"
              onError={(event) => {
                event.currentTarget.src =
                  "https://placehold.co/80x80/ffffff/4d6f55?text=T";
              }}
            />
            <h4 style={fontMontserrat}>TAMSI</h4>
          </div>
        </div>

        <FooterColumn title="Menu">
          {TRAINEE_NAV_ITEMS.map((item) => (
            <FooterLink key={item.key} onClick={() => goTo(item.path)}>
              {item.label}
            </FooterLink>
          ))}
        </FooterColumn>

        <FooterColumn title="Contact Information">
          <FooterText>{TRAINING_CONTACT_INFO.email1}</FooterText>
          <FooterText>{TRAINING_CONTACT_INFO.email2}</FooterText>
          <FooterText>{TRAINING_CONTACT_INFO.phone}</FooterText>
        </FooterColumn>

        <FooterColumn title="Address">
          <FooterText>{TRAINING_CONTACT_INFO.addressLine1}</FooterText>
          <FooterText>{TRAINING_CONTACT_INFO.addressLine2}</FooterText>
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
    <button
      type="button"
      onClick={onClick}
      className="ltc-footer-link"
      style={fontPontano}
    >
      {children}
    </button>
  );
}

function FooterText({ children }) {
  return <p style={fontPontano}>{children}</p>;
}

function MobileMenu({ onClose, goTo, goToProfile }) {
  return (
    <div className="ltc-sidebar-overlay">
      <div style={{ position: "absolute", inset: 0 }} onClick={onClose} />

      <div className="ltc-sidebar-panel">
        <div className="ltc-sidebar-top">
          <p className="ltc-sidebar-title" style={fontPoppins}>MENU</p>
          <button
            type="button"
            onClick={onClose}
            className="ltc-sidebar-close"
            aria-label="Close menu"
          >
            ✕
          </button>
        </div>

        {TRAINEE_NAV_ITEMS.map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => goTo(item.path)}
            className={`ltc-sidebar-link ${item.key === "home" ? "active" : ""}`}
            style={fontPoppins}
          >
            {item.label}
          </button>
        ))}

        <button
          type="button"
          onClick={goToProfile}
          className="ltc-sidebar-link"
          style={fontPoppins}
        >
          Profile
        </button>
      </div>
    </div>
  );
}

function PaperIcon() {
  return (
    <svg
      viewBox="0 0 90 90"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M28 18H58L68 28V68C68 70.2 66.2 72 64 72H28C25.8 72 24 70.2 24 68V22C24 19.8 25.8 18 28 18Z"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <path d="M58 18V29H68" stroke="currentColor" strokeWidth="3" strokeLinejoin="round" />
      <path d="M19 25H53L61 33V75" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" opacity="0.75" />
      <path d="M34 36H55" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      <path d="M34 46H55" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      <path d="M34 56H50" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      <path d="M29 36L31 38L34 34" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M29 46L31 48L34 44" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M29 56L31 58L34 54" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default TraineeHome;
