import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  isTrainingAuthResponse,
  redirectToTraineeLogin,
} from "./trainingSession";

function normalizeApiBase(raw) {
  if (!raw) return "http://localhost:5000/api";
  const r = String(raw).replace(/\/+$/, "");
  if (r.endsWith("/api/hotel")) return r.replace(/\/api\/hotel$/i, "/api");
  if (r.endsWith("/api")) return r;
  if (r.includes("/api/")) return r.replace(/\/api\/hotel.*$/i, "/api");
  return `${r}/api`;
}

const API_BASE = normalizeApiBase(
  import.meta.env.VITE_TRAINING_API_URL || import.meta.env.VITE_API_URL
);

const DESIGN_WIDTH = 1536;
const DESIGN_HEIGHT = 1024;

const CERTIFICATE_TEMPLATE_CANDIDATES = [
  "/certificates/CertificateTemplate.png",
  "/certificates/CertificateTemplate.jpg",
  "/certificates/CertificateTemplate.jpeg",
  "/certificates/CertificateTemplate.webp",
  "/certificates/CertificateTemplate",
];

const FULL_VENUE =
  "Light Tower Center II, 2nd Floor, 5441 Curie St., Barangay Palanan Makati City";

function normalizeCourseName(value = "") {
  const clean = String(value || "").trim().toLowerCase();

  if (clean === "housekeeping") return "Housekeeping";
  if (clean === "event management") return "Event Management";

  return String(value || "").trim();
}

async function readJsonSafe(res) {
  const text = await res.text();

  try {
    return JSON.parse(text);
  } catch {
    throw new Error(text?.slice(0, 180) || "Invalid server response.");
  }
}

function toTitleCase(value = "") {
  return String(value || "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase()
    .replace(/\b[a-z]/g, (char) => char.toUpperCase());
}

function getCourseDisplayTitle(course = "") {
  const normalized = normalizeCourseName(course);

  if (normalized === "Housekeeping") return "Housekeeping NC II";
  if (normalized === "Event Management") return "Event Management Services";

  return normalized || "Training Qualification";
}

function getQualificationTitle(certificate) {
  return (
    certificate?.qualificationTitle ||
    certificate?.courseDisplayName ||
    getCourseDisplayTitle(certificate?.course)
  );
}

function getCertificateVenue(certificate) {
  const raw = String(
    certificate?.trainingVenueAddress ||
      certificate?.trainingVenueDisplay ||
      FULL_VENUE
  )
    .replace(/^LTC TRAINING, ASSESSMENT AND MULTI SERVICES, INC\.\s*-\s*/i, "")
    .replace(/^LTC TRAINING, ASSESSMENT AND MULTI SERVICES, INC\.\s*/i, "")
    .replace(/\s+/g, " ")
    .trim();

  if (!raw || /^makati city$/i.test(raw)) return FULL_VENUE;

  return raw;
}

function getCertificateSerial(certificate) {
  return certificate?.serialNo || certificate?.certificateSerialNo || "-";
}

function getCertificateDate(value) {
  const fallback = new Date();

  if (!value) return fallback;

  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? fallback : date;
}

function getManilaDateParts(value) {
  const date = getCertificateDate(value);

  const parts = new Intl.DateTimeFormat("en-PH", {
    timeZone: "Asia/Manila",
    year: "numeric",
    month: "long",
    day: "numeric",
  }).formatToParts(date);

  const day = Number(parts.find((part) => part.type === "day")?.value || 0);
  const month = parts.find((part) => part.type === "month")?.value || "Month";
  const year = parts.find((part) => part.type === "year")?.value || "";

  return {
    day,
    month,
    year,
  };
}

function getOrdinalSuffix(day) {
  const mod100 = day % 100;

  if (mod100 >= 11 && mod100 <= 13) return "th";

  switch (day % 10) {
    case 1:
      return "st";
    case 2:
      return "nd";
    case 3:
      return "rd";
    default:
      return "th";
  }
}

function formatLongDate(value) {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleDateString("en-PH", {
    timeZone: "Asia/Manila",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function buildVerifyUrl(code = "") {
  const verificationCode = String(code || "").trim();

  if (!verificationCode) return "";

  return `${API_BASE}/training/certificate/verify/${encodeURIComponent(
    verificationCode
  )}`;
}

function buildPdfFileName(certificate) {
  const rawName = String(certificate?.traineeName || "trainee-certificate")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/gi, "-")
    .replace(/^-+|-+$/g, "");

  return `${rawName || "trainee-certificate"}.pdf`;
}

function getNameFontSize(name = "") {
  const length = String(name || "").trim().length;

  if (length >= 48) return 74;
  if (length >= 40) return 82;
  if (length >= 32) return 92;
  if (length >= 24) return 104;

  return 118;
}

async function waitForImages(container) {
  if (!container) return;

  const images = Array.from(container.querySelectorAll("img"));

  await Promise.all(
    images.map((img) => {
      if (img.complete && img.naturalWidth > 0) return Promise.resolve();

      return new Promise((resolve) => {
        const done = () => {
          img.removeEventListener("load", done);
          img.removeEventListener("error", done);
          resolve();
        };

        img.addEventListener("load", done);
        img.addEventListener("error", done);
      });
    })
  );
}

function sanitizeCaptureTree(root) {
  if (!root) return;

  const nodes = [root, ...root.querySelectorAll("*")];

  nodes.forEach((node) => {
    if (!(node instanceof HTMLElement)) return;

    node.style.boxShadow = "none";
    node.style.textShadow = "none";
    node.style.filter = "none";
    node.style.backdropFilter = "none";
    node.style.webkitBackdropFilter = "none";
    node.style.outline = "none";
    node.style.outlineColor = "transparent";
  });
}

function useCanvasScale() {
  const wrapRef = useRef(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const updateScale = () => {
      const el = wrapRef.current;
      if (!el) return;

      const availableWidth = Math.max(320, el.clientWidth - 8);
      const nextScale = Math.min(1, availableWidth / DESIGN_WIDTH);

      setScale(nextScale);
    };

    updateScale();

    const observer = new ResizeObserver(updateScale);

    if (wrapRef.current) observer.observe(wrapRef.current);

    window.addEventListener("resize", updateScale);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", updateScale);
    };
  }, []);

  return { wrapRef, scale };
}

function TemplateBackground() {
  const [index, setIndex] = useState(0);
  const src = CERTIFICATE_TEMPLATE_CANDIDATES[index];

  return (
    <img
      src={src}
      alt="Certificate Template"
      draggable={false}
      onError={() => {
        setIndex((current) =>
          current < CERTIFICATE_TEMPLATE_CANDIDATES.length - 1
            ? current + 1
            : current
        );
      }}
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        objectFit: "cover",
        userSelect: "none",
      }}
    />
  );
}

function CertificateTextOverlay({ certificate, pdfMode = false }) {
  const traineeName = toTitleCase(certificate?.traineeName || "Trainee Name");
  const courseTitle = getQualificationTitle(certificate);
  const issuedAt =
    certificate?.issuedAt || certificate?.completedAt || certificate?.trainingEndDate;
  const venue = getCertificateVenue(certificate);

  const { day, month, year } = getManilaDateParts(issuedAt);
  const daySuffix = getOrdinalSuffix(day);
  const serialNo = getCertificateSerial(certificate);

  return (
    <>
      <div
        style={{
          position: "absolute",
          right: 25,
          top: 18,
          width: 380,
          display: "flex",
          alignItems: "baseline",
          justifyContent: "flex-end",
          gap: "16px",
          color: "#3d3d3d",
          fontFamily: '"Times New Roman", Georgia, serif',
          fontWeight: 700,
          lineHeight: 1,
          textAlign: "right",
          whiteSpace: "nowrap",
        }}
      >
        <span
          style={{
            fontSize: "32px",
            letterSpacing: "0.01em",
          }}
        >
          SERIAL NO.
        </span>
        <span
          style={{
            fontSize: "28px",
            letterSpacing: "0.03em",
          }}
        >
          {serialNo}
        </span>
      </div>
      <div
        style={{
          position: "absolute",
          left: 438,
          top: pdfMode ? 330 : 370,
          width: 970,
          height: pdfMode ? 132 : 140,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#00533e",
          fontFamily:
            '"Great Vibes", "Allura", "Edwardian Script ITC", "Segoe Script", "Brush Script MT", cursive',
          fontSize: `${pdfMode ? Math.max(68, getNameFontSize(traineeName) - 8) : getNameFontSize(traineeName)}px`,
          fontWeight: 400,
          lineHeight: 1,
          whiteSpace: "nowrap",
          textAlign: "center",
          fontKerning: "normal",
          textRendering: "geometricPrecision",
        }}
      >
        {traineeName}
      </div>

      <div
        style={{
          position: "absolute",
          left: 438,
          top: 585,
          width: 1000,
          color: "#34363a",
          fontFamily: "Arial, Helvetica, sans-serif",
          fontSize: "29px",
          fontWeight: 400,
          lineHeight: 1.25,
          letterSpacing: "-0.02em",
        }}
      >
        <div>
          After Having Successfully Completed the Competency Requirements of a Full
        </div>

        <div>
          Qualification in{" "}
          <span
            style={{
              color: "#00533e",
              fontWeight: 800,
            }}
          >
            “{courseTitle}”
          </span>{" "}
          Given this{" "}
          <span style={{ fontWeight: 800 }}>
            {day}
            <sup style={{ fontSize: "0.6em", lineHeight: 0 }}>{daySuffix}</sup>{" "}
            Day
          </span>{" "}
          of{" "}
          <span style={{ fontWeight: 800 }}>
            {month} {year}
          </span>
        </div>

        <div>at {venue}</div>
      </div>
    </>
  );
}

function CertificateArt({ certificate, pdfMode = false }) {
  return (
    <div
      data-pdf-capture-root="true"
      style={{
        position: "relative",
        overflow: "hidden",
        width: `${DESIGN_WIDTH}px`,
        height: `${DESIGN_HEIGHT}px`,
        background: "#fffef8",
      }}
    >
      <TemplateBackground />
      <CertificateTextOverlay certificate={certificate} pdfMode={pdfMode} />
    </div>
  );
}

function MetaCard({ label, value }) {
  return (
    <div className="rounded-2xl border border-[#dfe5d7] bg-white p-4 shadow-sm">
      <div className="text-xs font-bold uppercase tracking-[0.16em] text-[#7a8678]">
        {label}
      </div>
      <div className="mt-2 break-words text-sm font-semibold text-[#395345]">
        {value || "-"}
      </div>
    </div>
  );
}

function CertificateTemplate({ certificate, captureRef }) {
  const { wrapRef, scale } = useCanvasScale();

  const courseTitle = getQualificationTitle(certificate);
  const serialNo = getCertificateSerial(certificate);
  const verificationCode = certificate?.verificationCode || "-";
  const verifyUrl = buildVerifyUrl(verificationCode);

  return (
    <div className="w-full">
      <div
        ref={wrapRef}
        className="w-full overflow-x-auto rounded-[28px] bg-white/50 p-2 sm:p-3"
      >
        <div className="flex min-w-full justify-center">
          <div
            className="relative shrink-0"
            style={{
              width: `${DESIGN_WIDTH * scale}px`,
              height: `${DESIGN_HEIGHT * scale}px`,
            }}
          >
            <div
              style={{
                transform: `scale(${scale})`,
                transformOrigin: "top left",
                width: `${DESIGN_WIDTH}px`,
                height: `${DESIGN_HEIGHT}px`,
              }}
            >
              <CertificateArt certificate={certificate} />
            </div>
          </div>
        </div>
      </div>

      <div
        ref={captureRef}
        className="pdf-capture fixed left-[-10000px] top-0"
        aria-hidden="true"
      >
        <CertificateArt certificate={certificate} pdfMode />
      </div>

      <div className="print:hidden mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetaCard label="Trainee Name" value={certificate?.traineeName} />
        <MetaCard label="Course" value={courseTitle} />
        <MetaCard label="Certificate No" value={certificate?.certificateNo} />
        <MetaCard label="Serial No" value={serialNo} />
        <MetaCard label="Verification Code" value={verificationCode} />
        <MetaCard label="Issued At" value={formatLongDate(certificate?.issuedAt)} />
        <MetaCard
          label="Completed At"
          value={formatLongDate(certificate?.completedAt)}
        />
        <MetaCard label="Verify URL" value={verifyUrl} />
      </div>
    </div>
  );
}

export default function TraineeCertificate() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [certificate, setCertificate] = useState(null);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [downloadingPdf, setDownloadingPdf] = useState(false);

  const captureRef = useRef(null);

  useEffect(() => {
    const run = async () => {
      try {
        const token = localStorage.getItem("trainingToken") || "";

        if (!token) {
          redirectToTraineeLogin(navigate);
          return;
        }

        const res = await fetch(`${API_BASE}/training/certificate`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await readJsonSafe(res);

        if (!res.ok) {
          if (isTrainingAuthResponse(res, data)) {
            redirectToTraineeLogin(navigate, {
              message: data?.message || "Please login again.",
            });
            return;
          }

          throw new Error(data?.message || "Failed to load certificate.");
        }

        setCertificate(data?.certificate || null);
      } catch (err) {
        setError(err.message || "Failed to load certificate.");
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [navigate]);

  const certificateTitle = useMemo(() => {
    if (!certificate) return "Training Certificate";
    return `${getQualificationTitle(certificate)} Certificate`;
  }, [certificate]);

  const handleDownloadPdf = async () => {
    if (!captureRef.current || downloadingPdf || !certificate) return;

    try {
      setActionError("");
      setDownloadingPdf(true);

      if (document.fonts?.ready) {
        await document.fonts.ready;
      }

      await waitForImages(captureRef.current);

      const html2canvasModule = await import("html2canvas");
      const html2canvas = html2canvasModule.default || html2canvasModule;

      const jspdfModule = await import("jspdf");
      const { jsPDF } = jspdfModule;

      const captureNode = captureRef.current;
      sanitizeCaptureTree(captureNode);

      const canvas = await html2canvas(captureNode, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#fffef8",
        logging: false,
        width: DESIGN_WIDTH,
        height: DESIGN_HEIGHT,
        windowWidth: DESIGN_WIDTH,
        windowHeight: DESIGN_HEIGHT,
        onclone: (clonedDoc) => {
          const clonedRoot = clonedDoc.querySelector(
            "[data-pdf-capture-root='true']"
          );

          if (clonedRoot) {
            sanitizeCaptureTree(clonedRoot);
          }
        },
      });

      const imageData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "px",
        format: [canvas.width, canvas.height],
        compress: true,
      });

      pdf.addImage(imageData, "PNG", 0, 0, canvas.width, canvas.height);
      pdf.save(buildPdfFileName(certificate));
    } catch (err) {
      setActionError(err?.message || "Failed to download PDF.");
    } finally {
      setDownloadingPdf(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#eef1e7] p-6 text-[#395345]">
        <div className="mx-auto max-w-[1700px] rounded-[28px] bg-white p-8 shadow-xl">
          Loading certificate...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#eef1e7] p-6 text-[#395345]">
        <div className="mx-auto max-w-[1700px] rounded-[28px] bg-white p-8 shadow-xl">
          <div className="rounded-2xl bg-red-50 px-4 py-3 text-red-800 ring-1 ring-red-200">
            {error}
          </div>
        </div>
      </div>
    );
  }

  if (!certificate) {
    return (
      <div className="min-h-screen bg-[#eef1e7] p-6 text-[#395345]">
        <div className="mx-auto max-w-[1700px] rounded-[28px] bg-white p-8 shadow-xl">
          No certificate found.
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#eef1e7] p-4 text-[#395345] sm:p-6">
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Great+Vibes&display=swap');

          @media print {
            @page {
              size: landscape;
              margin: 0;
            }

            html,
            body {
              background: white !important;
            }

            .print-hide {
              display: none !important;
            }

            .print-wrap {
              max-width: none !important;
              width: 100% !important;
              margin: 0 !important;
              padding: 0 !important;
            }

            .pdf-capture {
              display: none !important;
            }
          }
        `}
      </style>

      <div className="print-wrap mx-auto w-full max-w-[1700px]">
        <div className="print-hide mb-5 flex flex-col gap-3 rounded-[24px] bg-white p-4 shadow-sm ring-1 ring-[#dde3d6] sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-extrabold text-[#25382d]">
              {certificateTitle}
            </h1>
            <p className="mt-1 text-sm text-[#697866]">
              Certificate generated from your issued training record.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => navigate("/trainee-progress")}
              className="rounded-full border border-[#c7d0bf] bg-white px-5 py-2 text-sm font-semibold text-[#395345] shadow-sm transition hover:bg-[#f3f5ef]"
            >
              Back to Progress
            </button>

            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={downloadingPdf}
              className="rounded-full border border-[#395345] bg-white px-5 py-2 text-sm font-semibold text-[#395345] shadow-sm transition hover:bg-[#f3f5ef] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {downloadingPdf ? "Generating PDF..." : "Download PDF"}
            </button>

            <button
              type="button"
              onClick={() => window.print()}
              className="rounded-full bg-[#395345] px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#2f463a]"
            >
              Print Certificate
            </button>
          </div>
        </div>

        {actionError ? (
          <div className="print-hide mb-5 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-800 ring-1 ring-red-200">
            {actionError}
          </div>
        ) : null}

        <CertificateTemplate certificate={certificate} captureRef={captureRef} />
      </div>
    </div>
  );
}
