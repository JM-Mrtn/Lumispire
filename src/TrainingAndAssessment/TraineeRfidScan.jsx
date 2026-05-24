import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

function normalizeApiOrigin(raw) {
  const fallback = "http://localhost:5000";
  const r = String(raw || fallback).replace(/\/+$/, "");

  if (r.endsWith("/api")) return r.replace(/\/api$/i, "");
  if (r.includes("/api/")) return r.replace(/\/api\/.*$/i, "");

  return r;
}

const API_ORIGIN = normalizeApiOrigin(
  import.meta.env.VITE_TRAINING_API_URL || import.meta.env.VITE_API_URL
);

const fontMontserrat = { fontFamily: "'Montserrat', sans-serif" };
const fontPontano = { fontFamily: "'Pontano Sans', sans-serif" };
const fontPoppins = { fontFamily: "'Poppins', sans-serif" };

const pageStyles = `
  @import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap");

  .ltc-trainee-rfid-page {
    --green-950: #071f14;
    --green-900: #0e3321;
    --green-800: #174a30;
    --green-700: #235f3e;
    --footer-green: #082719;
    --gold: #d7a84d;
    --gold-soft: #f4d484;
    --dark: #101828;
    --muted: #667085;
    --glass: rgba(255,255,255,.88);
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

  .ltc-trainee-rfid-page * { box-sizing: border-box; }
  .ltc-container { width: min(1180px, 92%); margin: auto; }


  .ltc-hero {
    position: relative;
    overflow: hidden;
    color: white;
    isolation: isolate;
    background: linear-gradient(120deg, #03180f 0%, #082719 42%, #155f3b 100%);
    padding: 78px 0 74px;
  }

  .ltc-hero-slide {
    position: absolute;
    inset: 0;
    z-index: -4;
    width: 100%;
    height: 100%;
    object-fit: cover;
    opacity: .32;
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
      radial-gradient(circle at 88% 44%, rgba(244,212,132,.14), transparent 28%);
    filter: blur(30px);
    pointer-events: none;
  }

  .ltc-hero-content {
    position: relative;
    z-index: 2;
    max-width: 980px;
    margin: 0 auto;
    text-align: center;
    animation: ltcFadeUp .75s var(--ease) both;
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
    font-size: clamp(36px, 5vw, 66px);
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

  .ltc-section { padding: 62px 0 72px; }

  .rfid-shell {
    position: relative;
    overflow: hidden;
    border-radius: var(--radius);
    background: var(--glass);
    border: 1px solid rgba(255,255,255,.76);
    box-shadow: var(--shadow-md);
    backdrop-filter: blur(18px);
    padding: 34px;
    animation: ltcFadeUp .85s var(--ease) .12s both;
  }

  .rfid-shell::before {
    content: "";
    position: absolute;
    inset: 0 0 auto;
    height: 6px;
    background: linear-gradient(90deg,var(--green-700),var(--gold));
    z-index: 3;
  }

  .rfid-shell:hover {
    box-shadow: var(--shadow-lg);
    border-color: rgba(215,168,77,.45);
  }

  .rfid-topbar {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 18px;
    margin-bottom: 26px;
  }

  .rfid-section-heading {
    margin: 0;
    color: var(--green-950);
    font-size: clamp(26px,3vw,40px);
    line-height: 1.08;
    letter-spacing: -.05em;
    font-weight: 900;
  }

  .rfid-section-line {
    margin-top: 12px;
    width: 180px;
    height: 3px;
    border-radius: 999px;
    background: linear-gradient(90deg,var(--green-700),var(--gold));
  }

  .rfid-section-intro {
    max-width: 760px;
    margin: 14px 0 0;
    color: var(--muted);
    font-size: 15px;
    font-weight: 700;
  }

  .rfid-back-button,
  .rfid-action-button {
    border: 0;
    cursor: pointer;
    border-radius: 999px;
    padding: 13px 18px;
    color: #102418;
    background: linear-gradient(135deg,#f4d484,#d7a84d);
    box-shadow: 0 14px 28px rgba(215,168,77,.18);
    font-size: 12px;
    font-weight: 900;
    letter-spacing: .1em;
    text-transform: uppercase;
    transition: .25s var(--ease);
    white-space: nowrap;
  }

  .rfid-back-button:hover,
  .rfid-action-button:hover {
    transform: translateY(-3px);
    box-shadow: 0 18px 34px rgba(215,168,77,.28);
  }

  .rfid-grid {
    display: grid;
    grid-template-columns: minmax(0, 1.12fr) minmax(320px, .88fr);
    gap: 22px;
    align-items: start;
  }

  .rfid-card {
    position: relative;
    overflow: hidden;
    border: 1px solid rgba(35,95,62,.12);
    border-radius: 24px;
    background: white;
    padding: 28px;
    box-shadow: 0 16px 34px rgba(8,39,25,.08);
    transition: .25s var(--ease);
  }

  .rfid-card:hover {
    transform: translateY(-5px);
    border-color: rgba(215,168,77,.48);
    box-shadow: 0 24px 50px rgba(8,39,25,.14);
  }

  .rfid-card.dark {
    color: white;
    background: linear-gradient(145deg, var(--green-900), var(--green-700));
    border-color: rgba(255,255,255,.12);
  }

  .rfid-status-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 16px;
    margin-bottom: 20px;
  }

  .rfid-card-title {
    margin: 0;
    color: var(--green-950);
    font-size: 25px;
    line-height: 1.15;
    font-weight: 900;
    letter-spacing: -.04em;
  }

  .rfid-card.dark .rfid-card-title { color: white; }

  .rfid-muted {
    margin: 8px 0 0;
    color: rgba(16,24,40,.65);
    font-size: 14px;
    font-weight: 700;
  }

  .rfid-card.dark .rfid-muted { color: rgba(255,255,255,.78); }

  .rfid-pill {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: 999px;
    padding: 9px 15px;
    font-size: 11px;
    font-weight: 900;
    text-transform: uppercase;
    letter-spacing: .12em;
  }

  .rfid-pill.open { color: #047857; background: #d1fae5; }
  .rfid-pill.closed { color: #b91c1c; background: #fee2e2; }

  .rfid-uid-box {
    border: 1px solid rgba(35,95,62,.12);
    border-radius: 24px;
    background: #f8fbf9;
    padding: 22px;
    transition: .25s var(--ease);
  }

  .rfid-uid-box:hover {
    background: #ffffff;
    border-color: rgba(215,168,77,.45);
  }

  .rfid-label {
    margin: 0;
    color: rgba(16,24,40,.55);
    font-size: 11px;
    font-weight: 900;
    text-transform: uppercase;
    letter-spacing: .22em;
  }

  .rfid-uid {
    margin: 12px 0 0;
    color: var(--green-950);
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
    font-size: clamp(26px, 4vw, 42px);
    font-weight: 900;
    overflow-wrap: anywhere;
  }

  .rfid-buffer {
    margin: 14px 0 0;
    color: rgba(16,24,40,.58);
    font-size: 12px;
    font-weight: 800;
  }

  .rfid-message {
    margin-top: 18px;
    border: 1px solid transparent;
    border-radius: 18px;
    padding: 15px 17px;
    font-size: 14px;
    font-weight: 900;
  }

  .rfid-message.success { border-color: #bbf7d0; background: #f0fdf4; color: #166534; }
  .rfid-message.error { border-color: #fecaca; background: #fef2f2; color: #991b1b; }
  .rfid-message.info { border-color: #bfdbfe; background: #eff6ff; color: #1e40af; }

  .rfid-trainee-card {
    margin-top: 18px;
    border: 1px solid #bbf7d0;
    border-radius: 20px;
    background: #f0fdf4;
    padding: 18px;
    animation: ltcFadeUp .45s var(--ease) both;
  }

  .rfid-trainee-name {
    margin: 0;
    color: #14532d;
    font-size: 21px;
    font-weight: 900;
  }

  .rfid-trainee-text {
    margin: 5px 0 0;
    color: #166534;
    font-size: 14px;
    font-weight: 800;
  }

  .rfid-actions {
    display: grid;
    grid-template-columns: repeat(2, minmax(0,1fr));
    gap: 12px;
    margin-top: 22px;
  }

  .rfid-action-button.secondary {
    color: var(--green-950);
    background: white;
    border: 1px solid rgba(35,95,62,.14);
    box-shadow: none;
  }

  .rfid-action-button:disabled {
    cursor: not-allowed;
    opacity: .58;
    transform: none;
  }

  .rfid-help {
    margin-top: 18px;
    border: 1px solid rgba(30,64,175,.16);
    border-radius: 18px;
    background: #eff6ff;
    color: #1e40af;
    padding: 16px 18px;
    font-size: 13px;
    font-weight: 800;
  }

  .rfid-log-list {
    margin-top: 22px;
    display: grid;
    gap: 12px;
  }

  .rfid-log-item {
    border-radius: 18px;
    background: rgba(255,255,255,.10);
    border: 1px solid rgba(255,255,255,.08);
    padding: 15px;
    transition: .25s var(--ease);
  }

  .rfid-log-item:hover {
    transform: translateX(5px);
    background: rgba(255,255,255,.15);
  }

  .rfid-log-head {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 12px;
  }

  .rfid-log-title {
    margin: 0;
    color: white;
    font-size: 15px;
    font-weight: 900;
  }

  .rfid-log-message {
    margin: 5px 0 0;
    color: rgba(255,255,255,.72);
    font-size: 12px;
    font-weight: 700;
  }

  .rfid-log-date {
    margin: 5px 0 0;
    color: rgba(255,255,255,.52);
    font-size: 11px;
    font-weight: 700;
  }

  .rfid-log-pill {
    border-radius: 999px;
    padding: 5px 9px;
    font-size: 10px;
    font-weight: 900;
    text-transform: uppercase;
    letter-spacing: .08em;
    white-space: nowrap;
  }

  .rfid-log-pill.success { color: #047857; background: #d1fae5; }
  .rfid-log-pill.error { color: #b91c1c; background: #fee2e2; }

  .rfid-empty {
    border-radius: 20px;
    background: rgba(255,255,255,.10);
    padding: 28px 18px;
    text-align: center;
    color: rgba(255,255,255,.76);
    font-size: 14px;
    font-weight: 800;
  }

  @media (max-width: 1180px) {
    .rfid-grid { grid-template-columns: 1fr; }
  }

  @media (max-width: 900px) {
    .ltc-hero { padding: 70px 0 66px; }
    .ltc-section { padding: 50px 0 58px; }
    .rfid-shell { padding: 28px 22px; }
    .rfid-topbar { flex-direction: column; }
  }

  @media (max-width: 600px) {
    .ltc-hero-title { font-size: clamp(34px, 11vw, 46px); letter-spacing: -.045em; }
    .ltc-hero-text { font-size: 15px; }
    .rfid-shell { padding: 26px 18px; }
    .rfid-card { padding: 22px 18px; }
    .rfid-status-header,
    .rfid-log-head { flex-direction: column; }
    .rfid-actions { grid-template-columns: 1fr; }
  }
`;

function normalizeUid(value = "") {
  return String(value || "")
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "");
}

function getProfessorToken() {
  return localStorage.getItem("professorToken") || "";
}

function formatDateTime(value) {
  if (!value) return "-";

  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "-";

  return d.toLocaleString("en-PH", {
    timeZone: "Asia/Manila",
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function TraineeRfidScan() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const courseFromUrl = searchParams.get("course") || "";
  const [buffer, setBuffer] = useState("");
  const [lastUid, setLastUid] = useState("");
  const [message, setMessage] = useState("Ready to scan trainee RFID card...");
  const [messageType, setMessageType] = useState("info");
  const [trainee, setTrainee] = useState(null);
  const [session, setSession] = useState(null);
  const [logs, setLogs] = useState([]);
  const [scanning, setScanning] = useState(false);
  const [nfcSupported, setNfcSupported] = useState(false);

  const bufferRef = useRef("");
  const timeoutRef = useRef(null);
  const submittingRef = useRef(false);

  const activeCourse = useMemo(() => {
    return session?.course || courseFromUrl || "";
  }, [session, courseFromUrl]);

  async function fetchRfidStatus() {
    const token = getProfessorToken();
    if (!token) return;

    const qs = new URLSearchParams();
    if (courseFromUrl) qs.set("course", courseFromUrl);

    try {
      const res = await fetch(
        `${API_ORIGIN}/api/training/rfid/professor/status${
          qs.toString() ? `?${qs.toString()}` : ""
        }`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setSession(null);
        return;
      }

      setSession(data?.session || null);
      setLogs(Array.isArray(data?.logs) ? data.logs : []);
    } catch {
      // Scanner still works without status display.
    }
  }

  async function submitScan(incomingUid) {
    const cleanUid = normalizeUid(incomingUid);

    if (!cleanUid || submittingRef.current) return;

    submittingRef.current = true;
    setScanning(true);
    setLastUid(cleanUid);
    setMessage("Processing RFID scan...");
    setMessageType("info");

    try {
      const res = await fetch(`${API_ORIGIN}/api/training/rfid/scan`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          uid: cleanUid,
          station: session?.station || `${activeCourse || "Training"} RFID Station`,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setTrainee(data?.trainee || null);
        setMessage(data?.message || "RFID scan failed.");
        setMessageType("error");

        if (data?.log) {
          setLogs((prev) => [data.log, ...prev].slice(0, 20));
        }

        return;
      }

      setTrainee(data?.trainee || null);
      setMessage(data?.message || "RFID scan successful.");
      setMessageType("success");

      if (data?.session) setSession(data.session);
      if (data?.log) {
        setLogs((prev) => [data.log, ...prev].slice(0, 20));
      }

      await fetchRfidStatus();
    } catch (error) {
      setMessage(error?.message || "RFID scan failed.");
      setMessageType("error");
      setTrainee(null);
    } finally {
      setBuffer("");
      bufferRef.current = "";
      setScanning(false);
      submittingRef.current = false;
    }
  }

  async function startWebNfc() {
    try {
      if (!("NDEFReader" in window)) {
        setMessage("Web NFC is not supported in this browser. Use your USB RFID keyboard reader.");
        setMessageType("error");
        return;
      }

      const reader = new window.NDEFReader();
      await reader.scan();

      setMessage("Web NFC started. Tap an NFC card.");
      setMessageType("info");

      reader.onreading = (event) => {
        const serial = normalizeUid(event.serialNumber || "");
        if (serial) {
          submitScan(serial);
        } else {
          setMessage("NFC card detected, but no UID/serial number was readable.");
          setMessageType("error");
        }
      };
    } catch (error) {
      setMessage(error?.message || "Failed to start Web NFC.");
      setMessageType("error");
    }
  }

  function clearDisplay() {
    setBuffer("");
    bufferRef.current = "";
    setLastUid("");
    setTrainee(null);
    setMessage("Ready to scan trainee RFID card...");
    setMessageType("info");
  }

  useEffect(() => {
    setNfcSupported("NDEFReader" in window);
    fetchRfidStatus();

    const interval = setInterval(fetchRfidStatus, 5000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseFromUrl]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      const tag = document.activeElement?.tagName;
      const isTypingField =
        tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT";

      if (isTypingField) return;

      if (event.key === "Enter") {
        event.preventDefault();

        const cleanUid = normalizeUid(bufferRef.current || buffer);
        if (cleanUid) submitScan(cleanUid);

        return;
      }

      if (event.key.length === 1) {
        const nextValue = normalizeUid(`${bufferRef.current}${event.key}`);
        bufferRef.current = nextValue;
        setBuffer(nextValue);

        if (timeoutRef.current) clearTimeout(timeoutRef.current);

        timeoutRef.current = setTimeout(() => {
          bufferRef.current = "";
          setBuffer("");
        }, 1200);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [buffer]);

  const isOpen = session?.isOpen === true;

  return (
    <div className="ltc-trainee-rfid-page">
      <style>{pageStyles}</style>

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
              Trainee <span>RFID Scan</span>
            </h2>
            <p className="ltc-hero-text" style={fontPontano}>
              Scan trainee RFID cards, monitor the active session, and review recent attendance scans.
            </p>
          </div>
        </section>

        <section className="ltc-section">
          <div className="ltc-container">
            <div className="rfid-shell">
              <div className="rfid-topbar">
                <div>
                  <h2 className="rfid-section-heading" style={fontMontserrat}>
                    RFID Attendance Scanner
                  </h2>
                  <div className="rfid-section-line" />
                  <p className="rfid-section-intro" style={fontPoppins}>
                    Keep the scanner focused on this page. USB RFID keyboard readers work automatically after a card tap.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => navigate("/professor-attendance")}
                  className="rfid-back-button"
                  style={fontPoppins}
                >
                  Back to Attendance
                </button>
              </div>

              <div className="rfid-grid">
                <section className="rfid-card">
                  <div className="rfid-status-header">
                    <div>
                      <h3 className="rfid-card-title" style={fontMontserrat}>
                        RFID attendance is {isOpen ? "OPEN" : "CLOSED"}
                      </h3>
                      <p className="rfid-muted" style={fontPoppins}>
                        {session
                          ? `Session date: ${session.attendanceDate} • ${session.course} • ${session.station}`
                          : courseFromUrl
                          ? `No open ${courseFromUrl} RFID session found.`
                          : "No open RFID session found."}
                      </p>
                    </div>

                    <span className={`rfid-pill ${isOpen ? "open" : "closed"}`} style={fontPoppins}>
                      {isOpen ? "Open" : "Closed"}
                    </span>
                  </div>

                  <div className="rfid-uid-box">
                    <p className="rfid-label" style={fontPoppins}>Last scanned UID</p>
                    <p className="rfid-uid">{lastUid || buffer || "-"}</p>
                    <p className="rfid-buffer" style={fontPoppins}>
                      Keyboard reader buffer: {buffer ? "capturing..." : "waiting"}
                    </p>
                  </div>

                  <div className={`rfid-message ${messageType}`} style={fontPoppins}>
                    {message}
                  </div>

                  {trainee ? (
                    <div className="rfid-trainee-card">
                      <p className="rfid-trainee-name" style={fontMontserrat}>
                        {trainee.fullName}
                      </p>
                      <p className="rfid-trainee-text" style={fontPoppins}>
                        {trainee.email}
                      </p>
                      <p className="rfid-trainee-text" style={fontPoppins}>
                        Course: {trainee.course || "-"}
                      </p>
                    </div>
                  ) : null}

                  <div className="rfid-actions">
                    <button
                      type="button"
                      onClick={startWebNfc}
                      disabled={!nfcSupported || scanning}
                      className="rfid-action-button"
                      style={fontPoppins}
                    >
                      Start Web NFC
                    </button>

                    <button
                      type="button"
                      onClick={clearDisplay}
                      disabled={scanning}
                      className="rfid-action-button secondary"
                      style={fontPoppins}
                    >
                      Clear Display
                    </button>
                  </div>

                  <div className="rfid-help" style={fontPoppins}>
                    USB RFID keyboard readers work automatically: tap card, UID is typed, then Enter submits the scan.
                  </div>
                </section>

                <section className="rfid-card dark">
                  <h3 className="rfid-card-title" style={fontMontserrat}>Recent Scans</h3>
                  <p className="rfid-muted" style={fontPoppins}>
                    This list updates after successful scans and while the professor session is available.
                  </p>

                  <div className="rfid-log-list">
                    {logs.length ? (
                      logs.slice(0, 12).map((log) => (
                        <div
                          key={log.id || `${log.uid}-${log.createdAt}`}
                          className="rfid-log-item"
                        >
                          <div className="rfid-log-head">
                            <div>
                              <p className="rfid-log-title" style={fontMontserrat}>
                                {log.traineeName || log.uid || "RFID Scan"}
                              </p>
                              <p className="rfid-log-message" style={fontPoppins}>
                                {log.message || "RFID scan processed."}
                              </p>
                              <p className="rfid-log-date" style={fontPoppins}>
                                {formatDateTime(log.createdAt)}
                              </p>
                            </div>

                            <span
                              className={`rfid-log-pill ${
                                log.status === "success" ? "success" : "error"
                              }`}
                              style={fontPoppins}
                            >
                              {log.action || log.status || "scan"}
                            </span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="rfid-empty" style={fontPoppins}>
                        No RFID scans yet.
                      </div>
                    )}
                  </div>
                </section>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

