// HotelAdminLogIn.jsx
import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

const HOTEL_LOGO = "/HotelLogo.png";
const LUMISPIRE_LOGO = "/HotelLumispireLogo.png";
const HERO_IMAGES = ["/HotelLanding1.png", "/HotelLanding2.png"];

const fontMontserrat = { fontFamily: "'Montserrat', sans-serif" };
const fontPontano = { fontFamily: "'Pontano Sans', sans-serif" };
const fontPoppins = { fontFamily: "'Poppins', sans-serif" };

const pageStyles = `
  @import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap");

  .ltc-admin-login-page {
    --green-950: #071f14;
    --green-900: #0e3321;
    --green-800: #174a30;
    --green-700: #235f3e;
    --footer-green: #082719;
    --gold: #d7a84d;
    --gold-soft: #f4d484;
    --dark: #101828;
    --muted: #667085;
    --glass: rgba(255,255,255,.86);
    --shadow-md: 0 18px 45px rgba(8,39,25,.14);
    --shadow-lg: 0 34px 90px rgba(8,39,25,.24);
    --radius: 28px;
    --ease: cubic-bezier(.22,1,.36,1);

    height: 100vh;
    min-height: 100vh;
    color: var(--dark);
    background:
      radial-gradient(circle at 12% 0%, rgba(215,168,77,.16), transparent 30%),
      radial-gradient(circle at 92% 8%, rgba(35,95,62,.16), transparent 32%),
      linear-gradient(180deg,#f8fbf9 0%,#fff 45%,#f5faf7 100%);
    overflow: hidden;
    font-family: "Inter", Arial, sans-serif;
  }

  .ltc-admin-login-page * {
    box-sizing: border-box;
  }

  .ltc-admin-login-shell {
    height: 100vh;
    min-height: 100vh;
    display: grid;
    place-items: center;
    padding: 20px;
    position: relative;
    overflow: hidden;
    isolation: isolate;
  }

  .ltc-admin-login-shell::before {
    content: "";
    position: absolute;
    inset: 0;
    z-index: -3;
    background: linear-gradient(120deg, rgba(3,24,15,.96), rgba(8,39,25,.88), rgba(21,95,59,.74));
  }

  .ltc-admin-login-bg {
    position: absolute;
    inset: 0;
    z-index: -4;
    width: 100%;
    height: 100%;
    object-fit: cover;
    opacity: .32;
  }

  .ltc-admin-login-shell::after {
    content: "";
    position: absolute;
    inset: -15% -10%;
    z-index: -2;
    background:
      radial-gradient(circle at 16% 82%, rgba(19, 120, 72, 0.35), transparent 24%),
      radial-gradient(circle at 34% 94%, rgba(7, 76, 47, 0.45), transparent 30%),
      radial-gradient(circle at 82% 22%, rgba(244, 212, 132, 0.18), transparent 28%);
    filter: blur(30px);
    pointer-events: none;
  }

  .ltc-admin-login-card {
    width: min(1120px, 100%);
    height: min(680px, calc(100vh - 40px));
    min-height: 0;
    max-height: calc(100vh - 40px);
    overflow: hidden;
    border-radius: var(--radius);
    display: grid;
    grid-template-columns: 1.08fr .92fr;
    background: var(--glass);
    border: 1px solid rgba(255,255,255,.72);
    box-shadow: var(--shadow-lg);
    backdrop-filter: blur(18px);
  }

  .ltc-admin-login-panel {
    position: relative;
    overflow: hidden;
    color: white;
    padding: clamp(24px, 3vw, 42px);
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    background: linear-gradient(135deg, rgba(7,31,20,.94), rgba(14,51,33,.90));
  }

  .ltc-admin-login-panel::before {
    content: "";
    position: absolute;
    inset: 0;
    background:
      radial-gradient(circle at 18% 15%, rgba(244,212,132,.18), transparent 26%),
      radial-gradient(circle at 78% 82%, rgba(35,95,62,.48), transparent 34%);
    pointer-events: none;
  }

  .ltc-admin-login-panel-content {
    position: relative;
    z-index: 2;
  }

  .ltc-admin-brand {
    display: flex;
    align-items: center;
    gap: 14px;
  }

  .ltc-admin-brand img {
    width: 54px;
    height: 54px;
    border-radius: 999px;
    object-fit: cover;
    background: white;
    box-shadow: 0 0 0 6px rgba(255,255,255,.08), 0 14px 28px rgba(0,0,0,.16);
  }

  .ltc-admin-brand h1 {
    margin: 0;
    color: white;
    font-size: 20px;
    line-height: 1;
    font-weight: 900;
    text-transform: uppercase;
    letter-spacing: -.04em;
  }

  .ltc-admin-brand p {
    margin: 4px 0 0;
    color: rgba(255,255,255,.70);
    font-size: 11px;
    font-weight: 700;
  }

  .ltc-admin-eyebrow {
    display: inline-flex;
    margin-top: clamp(28px, 7vh, 82px);
    color: var(--gold-soft);
    background: rgba(255,255,255,.10);
    border: 1px solid rgba(255,255,255,.20);
    border-radius: 999px;
    padding: 10px 18px;
    font-size: 11px;
    font-weight: 900;
    letter-spacing: .22em;
    text-transform: uppercase;
  }

  .ltc-admin-title {
    margin: 18px 0 0;
    color: white;
    font-size: clamp(32px, 4.4vw, 56px);
    line-height: 1.02;
    font-weight: 900;
    letter-spacing: -.06em;
  }

  .ltc-admin-title span {
    color: var(--gold-soft);
  }

  .ltc-admin-copy {
    max-width: 520px;
    margin: 18px 0 0;
    color: rgba(255,255,255,.76);
    font-size: 15px;
    line-height: 1.65;
  }

  .ltc-admin-login-features {
    position: relative;
    z-index: 2;
    display: grid;
    gap: 10px;
    margin-top: 22px;
  }

  .ltc-admin-feature {
    display: flex;
    align-items: center;
    gap: 12px;
    color: rgba(255,255,255,.78);
    font-size: 13px;
    font-weight: 800;
  }

  .ltc-admin-feature span {
    width: 10px;
    height: 10px;
    border-radius: 999px;
    background: var(--gold);
    box-shadow: 0 0 0 6px rgba(215,168,77,.12);
  }

  .ltc-admin-copyright {
    position: relative;
    z-index: 2;
    color: rgba(255,255,255,.52);
    font-size: 12px;
    font-weight: 700;
  }

  .ltc-admin-form-panel {
    position: relative;
    padding: clamp(28px, 4vw, 48px);
    display: flex;
    min-height: 0;
    overflow: hidden;
    flex-direction: column;
    justify-content: center;
    background:
      radial-gradient(circle at 100% 0%, rgba(215,168,77,.12), transparent 30%),
      rgba(255,255,255,.92);
  }

  .ltc-admin-mobile-brand {
    display: none;
    align-items: center;
    gap: 12px;
    margin-bottom: 28px;
  }

  .ltc-admin-mobile-brand img {
    width: 48px;
    height: 48px;
    border-radius: 999px;
    object-fit: cover;
  }

  .ltc-admin-mobile-brand p:first-of-type {
    margin: 0;
    color: var(--muted);
    font-size: 11px;
    font-weight: 900;
    letter-spacing: .18em;
    text-transform: uppercase;
  }

  .ltc-admin-mobile-brand p:last-of-type {
    margin: 2px 0 0;
    color: var(--green-800);
    font-size: 18px;
    font-weight: 900;
  }

  .ltc-login-heading {
    margin: 0;
    color: var(--green-950);
    font-size: clamp(30px, 3vw, 42px);
    line-height: 1.08;
    letter-spacing: -.05em;
    font-weight: 900;
  }

  .ltc-login-subtitle {
    margin: 10px 0 0;
    color: var(--muted);
    font-size: 14px;
    line-height: 1.7;
    font-weight: 700;
  }

  .ltc-login-error {
    margin-top: 22px;
    border-radius: 18px;
    border: 1px solid rgba(244,63,94,.24);
    background: rgba(255,228,230,.75);
    color: #be123c;
    padding: 13px 15px;
    font-size: 13px;
    line-height: 1.55;
    font-weight: 800;
  }

  .ltc-admin-login-form {
    margin-top: 22px;
    display: grid;
    gap: 16px;
  }

  .ltc-login-field label {
    display: block;
    margin-bottom: 9px;
    color: rgba(16,24,40,.52);
    font-size: 12px;
    font-weight: 900;
    letter-spacing: .10em;
    text-transform: uppercase;
  }

  .ltc-login-input-wrap {
    position: relative;
  }

  .ltc-login-input {
    width: 100%;
    min-height: 50px;
    border-radius: 18px;
    border: 1px solid rgba(35,95,62,.14);
    background: rgba(248,250,247,.95);
    color: var(--dark);
    outline: none;
    padding: 0 18px;
    font-size: 14px;
    font-weight: 750;
    transition: .25s var(--ease);
    box-shadow: 0 10px 24px rgba(8,39,25,.04);
  }

  .ltc-login-input.with-toggle {
    padding-right: 72px;
  }

  .ltc-login-input::placeholder {
    color: rgba(102,112,133,.62);
  }

  .ltc-login-input:focus {
    border-color: var(--green-700);
    background: white;
    box-shadow: 0 0 0 4px rgba(35,95,62,.10);
  }

  .ltc-login-input:disabled {
    opacity: .62;
    cursor: not-allowed;
  }

  .ltc-password-toggle {
    position: absolute;
    right: 8px;
    top: 50%;
    transform: translateY(-50%);
    border: 0;
    border-radius: 14px;
    background: rgba(35,95,62,.09);
    color: var(--green-800);
    padding: 10px 12px;
    font-size: 11px;
    font-weight: 900;
    cursor: pointer;
    transition: .2s var(--ease);
  }

  .ltc-password-toggle:hover {
    background: rgba(35,95,62,.15);
  }

  .ltc-password-toggle:disabled {
    opacity: .55;
    cursor: not-allowed;
  }

  .ltc-login-button {
    min-height: 50px;
    border: 0;
    border-radius: 18px;
    color: #102418;
    background: linear-gradient(135deg,#f4d484,#d7a84d);
    box-shadow: 0 16px 35px rgba(215,168,77,.22);
    font-size: 13px;
    font-weight: 900;
    letter-spacing: .06em;
    text-transform: uppercase;
    cursor: pointer;
    transition: all .28s var(--ease);
  }

  .ltc-login-button:hover {
    transform: translateY(-3px);
    background: linear-gradient(135deg,#f7dc93,#c99634);
    box-shadow: 0 22px 45px rgba(215,168,77,.30);
  }

  .ltc-login-button:active {
    transform: translateY(-1px) scale(.99);
  }

  .ltc-login-button:disabled {
    opacity: .62;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }

  .ltc-login-note {
    margin-top: 14px;
    color: rgba(102,112,133,.70);
    font-size: 12px;
    line-height: 1.65;
    font-weight: 700;
  }


  @media (max-height: 760px) and (min-width: 981px) {
    .ltc-admin-login-card {
      height: calc(100vh - 32px);
      max-height: calc(100vh - 32px);
    }

    .ltc-admin-login-shell {
      padding: 16px;
    }

    .ltc-admin-brand img {
      width: 46px;
      height: 46px;
    }

    .ltc-admin-eyebrow {
      margin-top: 28px;
      padding: 8px 14px;
      font-size: 10px;
    }

    .ltc-admin-title {
      margin-top: 14px;
      font-size: clamp(30px, 4vw, 48px);
    }

    .ltc-admin-copy {
      margin-top: 12px;
      font-size: 14px;
      line-height: 1.55;
    }

    .ltc-admin-login-features {
      margin-top: 18px;
      gap: 8px;
    }

    .ltc-admin-feature {
      font-size: 12px;
    }

    .ltc-login-heading {
      font-size: clamp(28px, 3vw, 38px);
    }

    .ltc-login-subtitle {
      margin-top: 8px;
      line-height: 1.55;
    }

    .ltc-login-error {
      margin-top: 14px;
      padding: 10px 13px;
    }

    .ltc-login-input,
    .ltc-login-button {
      min-height: 46px;
    }

    .ltc-login-note {
      margin-top: 12px;
      line-height: 1.45;
    }
  }

  @media (max-width: 980px) {
    .ltc-admin-login-card {
      max-width: 560px;
      min-height: auto;
      grid-template-columns: 1fr;
    }

    .ltc-admin-login-panel {
      display: none;
    }

    .ltc-admin-form-panel {
      padding: 36px 26px;
    }

    .ltc-admin-mobile-brand {
      display: flex;
    }
  }

  @media (max-width: 560px) {
    .ltc-admin-login-shell {
      padding: 22px 14px;
    }

    .ltc-admin-form-panel {
      padding: 30px 18px;
    }

    .ltc-admin-login-card {
      border-radius: 22px;
    }
  }
`;

export default function HotelAdminLogIn() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const API_BASE = useMemo(() => {
    const raw = (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/+$/, "");
    if (raw.includes("/api/hotel")) return raw;
    if (raw.includes("/api/")) return raw;
    return `${raw}/api/hotel`;
  }, []);

  const handleAdminLogin = async () => {
    setErrorMessage("");

    if (!username.trim() || !password) {
      setErrorMessage("Please enter your admin username and password.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/admin-login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username.trim(), password }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setErrorMessage(data.message || "Invalid admin credentials.");
        return;
      }

      if (!data?.token) {
        setErrorMessage("Login succeeded but token is missing.");
        return;
      }

      localStorage.setItem("adminToken", data.token);
      localStorage.setItem("hotelAdminToken", data.token);
      navigate("/hotel-admin-dashboard", { replace: true });
    } catch (err) {
      console.error(err);
      setErrorMessage("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ltc-admin-login-page" style={fontPontano}>
      <style>{pageStyles}</style>

      <main className="ltc-admin-login-shell">
        <img
          src={HERO_IMAGES[0]}
          alt="Hotel and resort background"
          className="ltc-admin-login-bg"
          onError={(event) => {
            event.currentTarget.style.display = "none";
          }}
        />

        <section className="ltc-admin-login-card">
          <aside className="ltc-admin-login-panel">
            <div className="ltc-admin-login-panel-content">
              <div className="ltc-admin-brand">
                <img
                  src={HOTEL_LOGO}
                  alt="Hotel logo"
                  onError={(event) => {
                    event.currentTarget.src = LUMISPIRE_LOGO;
                  }}
                />

                <div>
                  <h1 style={fontMontserrat}>Hotel &amp; Resort</h1>
                  <p style={fontPontano}>Admin Management Portal</p>
                </div>
              </div>

              <span className="ltc-admin-eyebrow" style={fontMontserrat}>
                Hotel & Resort Admin
              </span>

              <h2 className="ltc-admin-title" style={fontMontserrat}>
                Welcome back, <span>Admin</span>
              </h2>

              <p className="ltc-admin-copy" style={fontPontano}>
                Sign in to manage accounts, bookings, packages, guest reviews,
                chat support, and ID verification from one secure dashboard.
              </p>

              <div className="ltc-admin-login-features" style={fontPoppins}>
                <div className="ltc-admin-feature">
                  <span />
                  Manage hotel, resort, venue, and event bookings.
                </div>
                <div className="ltc-admin-feature">
                  <span />
                  Review proof of payment and guest verification requests.
                </div>
                <div className="ltc-admin-feature">
                  <span />
                  Respond to guest concerns through admin chat support.
                </div>
              </div>
            </div>

            <p className="ltc-admin-copyright" style={fontPoppins}>
              © 2026 LTC GROUP OF COMPANIES. Developed by CRMS Tech Alliance.
            </p>
          </aside>

          <div className="ltc-admin-form-panel">
            <div className="ltc-admin-mobile-brand">
              <img
                src={HOTEL_LOGO}
                alt="Hotel logo"
                onError={(event) => {
                  event.currentTarget.src = LUMISPIRE_LOGO;
                }}
              />
              <div>
                <p style={fontMontserrat}>Hotel Admin</p>
                <p style={fontMontserrat}>Hotel &amp; Resort</p>
              </div>
            </div>

            <h2 className="ltc-login-heading" style={fontMontserrat}>
              Admin Login
            </h2>

            <p className="ltc-login-subtitle" style={fontPontano}>
              Enter your admin credentials to continue to the management dashboard.
            </p>

            {errorMessage ? (
              <p className="ltc-login-error" style={fontPoppins}>
                {errorMessage}
              </p>
            ) : null}

            <form
              className="ltc-admin-login-form"
              onSubmit={(e) => {
                e.preventDefault();
                if (!loading) handleAdminLogin();
              }}
            >
              <div className="ltc-login-field">
                <label style={fontMontserrat}>Username</label>
                <input
                  className="ltc-login-input"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoComplete="username"
                  placeholder="admin username"
                  disabled={loading}
                  style={fontPoppins}
                />
              </div>

              <div className="ltc-login-field">
                <label style={fontMontserrat}>Password</label>
                <div className="ltc-login-input-wrap">
                  <input
                    className="ltc-login-input with-toggle"
                    type={showPw ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    placeholder="admin password"
                    disabled={loading}
                    style={fontPoppins}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw((value) => !value)}
                    className="ltc-password-toggle"
                    disabled={loading}
                    style={fontMontserrat}
                  >
                    {showPw ? "HIDE" : "SHOW"}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="ltc-login-button"
                style={fontMontserrat}
              >
                {loading ? "SIGNING IN..." : "SIGN IN"}
              </button>
            </form>

            <p className="ltc-login-note" style={fontPoppins}>
              Use your authorized hotel admin account. For security, your token is stored only after a successful login.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
