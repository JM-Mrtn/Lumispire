import React, { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

function formatPeso(value) {
  const num = Number(value || 0);

  if (!num) return "PHP 0";

  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    maximumFractionDigits: 0,
  })
    .format(num)
    .replace("₱", "PHP ");
}

function formatPesoDisplay(value) {
  const num = Number(value || 0);

  if (!num) return "₱ 0";

  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    maximumFractionDigits: 0,
  }).format(num);
}

function formatDateMMDDYYYY(value) {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(String(value))) {
    return value || "";
  }

  const [year, month, day] = value.split("-");
  return `${month}/${day}/${year}`;
}

function sanitizeFileName(value = "booking-receipt") {
  return String(value || "booking-receipt")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function escapePdfText(value = "") {
  return String(value ?? "")
    .replace(/[^\x20-\x7E]/g, "")
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)")
    .replace(/\r?\n/g, " ");
}

function splitText(text = "", maxLength = 76) {
  const words = String(text || "").split(/\s+/).filter(Boolean);
  const lines = [];
  let current = "";

  words.forEach((word) => {
    const next = current ? `${current} ${word}` : word;

    if (next.length > maxLength) {
      if (current) lines.push(current);
      current = word;
    } else {
      current = next;
    }
  });

  if (current) lines.push(current);
  return lines.length ? lines : [""];
}

function pdfText(text, x, y, size = 10, font = "F1") {
  return [`/${font} ${size} Tf`, `1 0 0 1 ${x} ${y} Tm`, `(${escapePdfText(text)}) Tj`].join("\n");
}

function pdfLine(x1, y1, x2, y2) {
  return `${x1} ${y1} m ${x2} ${y2} l S`;
}

function pdfRect(x, y, w, h, stroke = true, fill = false) {
  if (fill && stroke) return `${x} ${y} ${w} ${h} re B`;
  if (fill) return `${x} ${y} ${w} ${h} re f`;
  return `${x} ${y} ${w} ${h} re S`;
}

function createProfessionalPdf({
  receiptNumber,
  receiptDate,
  guestName,
  email,
  phone,
  serviceType,
  packageName,
  date,
  time,
  pax,
  paymentMethod,
  paymentTerm,
  amountPaid,
  totalAmount,
  balanceAmount,
}) {
  const pageWidth = 612;
  const pageHeight = 792;
  const left = 48;
  const right = 564;

  const stream = [];

  stream.push("0.184 0.322 0.239 rg");
  stream.push(pdfRect(0, 704, 612, 88, false, true));

  stream.push("1 1 1 rg");
  stream.push("BT");
  stream.push(pdfText("LUMISPIRE", 48, 748, 24, "F2"));
  stream.push(pdfText("HOTEL & RESORT", 48, 728, 12, "F1"));
  stream.push(pdfText("BOOKING RECEIPT / BILLING STATEMENT", 332, 748, 12, "F2"));
  stream.push(pdfText(`Receipt No. ${receiptNumber}`, 332, 728, 10, "F1"));
  stream.push(pdfText(`Issued: ${receiptDate}`, 332, 712, 10, "F1"));
  stream.push("ET");

  stream.push("0.95 0.95 0.92 rg");
  stream.push(pdfRect(left, 664, 516, 24, false, true));
  stream.push("0.184 0.322 0.239 rg");
  stream.push("BT");
  stream.push(pdfText("STATUS: SUBMITTED - WAITING FOR ADMIN APPROVAL", 62, 672, 10, "F2"));
  stream.push("ET");

  stream.push("0 0 0 RG");
  stream.push("0.184 0.322 0.239 rg");
  stream.push("BT");
  stream.push(pdfText("Thank you for booking!", left, 632, 20, "F2"));
  stream.push("0.31 0.40 0.34 rg");
  stream.push(pdfText("Your booking request has been submitted successfully. Please keep this receipt for your records.", left, 612, 10, "F1"));
  stream.push("ET");

  stream.push("0.82 0.86 0.82 RG");
  stream.push(pdfRect(left, 500, 246, 88, true, false));
  stream.push(pdfRect(318, 500, 246, 88, true, false));

  stream.push("0.184 0.322 0.239 rg");
  stream.push("BT");
  stream.push(pdfText("BILLED TO", 62, 568, 10, "F2"));
  stream.push(pdfText(guestName || "Guest", 62, 548, 12, "F2"));
  stream.push("0.36 0.43 0.37 rg");
  stream.push(pdfText(email || "-", 62, 532, 9, "F1"));
  stream.push(pdfText(phone || "-", 62, 512, 9, "F1"));

  stream.push("0.184 0.322 0.239 rg");
  stream.push(pdfText("PAYMENT OVERVIEW", 332, 568, 10, "F2"));
  stream.push(pdfText(`Method: ${paymentMethod || "-"}`, 332, 548, 10, "F1"));
  stream.push(pdfText(`Term: ${paymentTerm || "-"}`, 332, 532, 10, "F1"));
  stream.push("ET");

  stream.push("0.184 0.322 0.239 rg");
  stream.push("BT");
  stream.push(pdfText("BOOKING DETAILS", left, 486, 13, "F2"));
  stream.push("ET");
  stream.push("0.82 0.86 0.82 RG");
  stream.push(pdfLine(left, 476, right, 476));

  const detailRows = [
    ["Service", serviceType || "-"],
    ["Package / Venue", packageName || "-"],
    ["Date", formatDateMMDDYYYY(date) || "-"],
    ["Time", time || "-"],
    ["Pax", pax ? `${pax} pax` : "-"],
  ];

  let y = 454;
  detailRows.forEach(([label, value]) => {
    stream.push("0.36 0.43 0.37 rg");
    stream.push("BT");
    stream.push(pdfText(label.toUpperCase(), left, y, 9, "F2"));
    stream.push("0.184 0.322 0.239 rg");

    const lines = splitText(value, 62);
    lines.forEach((line, index) => {
      stream.push(pdfText(index === 0 ? line : `  ${line}`, 190, y - index * 13, 10, "F1"));
    });

    stream.push("ET");
    y -= Math.max(22, lines.length * 13 + 8);
  });

  stream.push("0.184 0.322 0.239 rg");
  stream.push("BT");
  stream.push(pdfText("PAYMENT SUMMARY", left, 320, 13, "F2"));
  stream.push("ET");
  stream.push("0.82 0.86 0.82 RG");
  stream.push(pdfLine(left, 310, right, 310));

  stream.push("0.95 0.95 0.92 rg");
  stream.push(pdfRect(left, 282, 516, 26, false, true));
  stream.push("0.184 0.322 0.239 rg");
  stream.push("BT");
  stream.push(pdfText("DESCRIPTION", 62, 291, 9, "F2"));
  stream.push(pdfText("AMOUNT", 480, 291, 9, "F2"));
  stream.push("ET");

  const paymentRows = [
    ["Total Booking Amount", formatPeso(totalAmount)],
    ["Amount Paid", formatPeso(amountPaid)],
    ["Remaining Balance", formatPeso(balanceAmount)],
  ];

  y = 262;
  paymentRows.forEach(([label, value]) => {
    stream.push("0.82 0.86 0.82 RG");
    stream.push(pdfLine(left, y - 8, right, y - 8));

    stream.push("0.184 0.322 0.239 rg");
    stream.push("BT");
    stream.push(pdfText(label, 62, y, 10, "F1"));
    stream.push(pdfText(value, 450, y, 10, "F2"));
    stream.push("ET");

    y -= 28;
  });

  stream.push("0.184 0.322 0.239 rg");
  stream.push(pdfRect(348, 154, 216, 44, true, false));
  stream.push("BT");
  stream.push(pdfText("BALANCE DUE", 362, 178, 10, "F2"));
  stream.push(pdfText(formatPeso(balanceAmount), 450, 164, 14, "F2"));
  stream.push("ET");

  stream.push("0.95 0.95 0.92 rg");
  stream.push(pdfRect(left, 92, 516, 42, false, true));
  stream.push("0.36 0.43 0.37 rg");
  stream.push("BT");
  splitText(
    "Note: This receipt confirms that your booking request and proof of payment were submitted. Final confirmation is subject to admin approval. Please check your profile for booking status updates.",
    96
  ).forEach((line, index) => {
    stream.push(pdfText(line, 62, 116 - index * 13, 9, "F1"));
  });
  stream.push("ET");

  stream.push("0.184 0.322 0.239 rg");
  stream.push("BT");
  stream.push(pdfText("LTC GROUP OF COMPANIES", left, 54, 9, "F2"));
  stream.push(pdfText("Developed by CRMS Tech Alliance", left, 40, 8, "F1"));
  stream.push(pdfText("This is a system-generated receipt.", 386, 40, 8, "F1"));
  stream.push("ET");

  const content = stream.join("\n");
  const encoder = new TextEncoder();
  const contentLength = encoder.encode(content).length;

  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}] /Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> /Contents 6 0 R >>`,
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>",
    `<< /Length ${contentLength} >>\nstream\n${content}\nendstream`,
  ];

  const chunks = ["%PDF-1.4\n"];
  const offsets = [0];

  objects.forEach((body, index) => {
    offsets.push(chunks.join("").length);
    chunks.push(`${index + 1} 0 obj\n${body}\nendobj\n`);
  });

  const xrefOffset = chunks.join("").length;

  chunks.push(`xref\n0 ${objects.length + 1}\n`);
  chunks.push("0000000000 65535 f \n");

  offsets.slice(1).forEach((offset) => {
    chunks.push(`${String(offset).padStart(10, "0")} 00000 n \n`);
  });

  chunks.push(
    `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`
  );

  return new Blob(chunks, { type: "application/pdf" });
}

const HOTEL_LOGO = "/HotelLogo.png";
const LUMISPIRE_LOGO = "/HotelLumispireLogo.png";
const HERO_IMAGES = ["/HotelLanding1.png", "/HotelLanding2.png"];

const fontMontserrat = { fontFamily: "'Montserrat', sans-serif" };
const fontPontano = { fontFamily: "'Pontano Sans', sans-serif" };
const fontPoppins = { fontFamily: "'Poppins', sans-serif" };

const pageStyles = `
  @import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap");

  .ltc-resort-summary-page {
    --green-950: #071f14;
    --green-900: #0e3321;
    --green-800: #174a30;
    --green-700: #235f3e;
    --footer-green: #082719;
    --gold: #d7a84d;
    --gold-soft: #f4d484;
    --dark: #101828;
    --muted: #667085;
    --glass: rgba(255,255,255,.82);
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

  .ltc-resort-summary-page * {
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

  .ltc-hero {
    position: relative;
    overflow: hidden;
    color: white;
    isolation: isolate;
    background: linear-gradient(120deg, #03180f 0%, #082719 42%, #155f3b 100%);
    padding: 82px 0 78px;
  }

  .ltc-hero-slide {
    position: absolute;
    inset: 0;
    z-index: -4;
    width: 100%;
    height: 100%;
    object-fit: cover;
    opacity: .35;
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
    font-size: clamp(36px, 5vw, 62px);
    line-height: 1.05;
    font-weight: 900;
    letter-spacing: -.055em;
    text-shadow: 0 8px 26px rgba(0,0,0,.22);
  }

  .ltc-hero-title span {
    color: var(--gold-soft);
  }

  .ltc-hero-text {
    max-width: 760px;
    margin: 18px auto 0;
    color: rgba(255,255,255,.80);
    font-size: 17px;
    line-height: 1.8;
  }

  .ltc-section {
    padding: 84px 0;
  }

  .ltc-form-shell {
    position: relative;
    overflow: hidden;
    border-radius: var(--radius);
    background: var(--glass);
    border: 1px solid rgba(255,255,255,.76);
    box-shadow: var(--shadow-md);
    backdrop-filter: blur(18px);
    padding: 34px;
  }

  .ltc-form-shell::before {
    content: "";
    position: absolute;
    inset: 0 0 auto;
    height: 6px;
    background: linear-gradient(90deg,var(--green-700),var(--gold));
    z-index: 3;
  }

  .ltc-form-shell:hover {
    box-shadow: var(--shadow-lg);
    border-color: rgba(215,168,77,.45);
  }

  .ltc-status {
    margin-top: 24px;
    border-radius: 16px;
    border: 1px solid transparent;
    padding: 12px 14px;
    font-size: 13px;
    line-height: 1.55;
    font-weight: 800;
  }

  .ltc-status-success {
    color: #047857;
    background: rgba(16,185,129,.10);
    border-color: rgba(16,185,129,.25);
  }

  .ltc-status-error {
    color: #b42318;
    background: rgba(239,68,68,.10);
    border-color: rgba(239,68,68,.22);
  }

  .ltc-status-info {
    color: #475467;
    background: rgba(102,112,133,.09);
    border-color: rgba(102,112,133,.14);
  }

  .ltc-summary-section + .ltc-summary-section,
  .ltc-summary-section + .ltc-payment-section {
    margin-top: 34px;
  }

  .ltc-section-heading {
    margin: 0;
    color: var(--green-950);
    font-size: clamp(24px,3vw,34px);
    line-height: 1.08;
    letter-spacing: -.05em;
    font-weight: 900;
  }

  .ltc-section-line {
    margin-top: 10px;
    width: 180px;
    height: 3px;
    border-radius: 999px;
    background: linear-gradient(90deg,var(--green-700),var(--gold));
  }

  .ltc-fields-grid {
    margin-top: 24px;
    display: grid;
    grid-template-columns: repeat(3, minmax(0,1fr));
    gap: 18px 22px;
  }

  .ltc-booking-header {
    margin-bottom: 24px;
    display: flex;
    align-items: end;
    justify-content: space-between;
    gap: 18px;
    flex-wrap: wrap;
  }

  .ltc-service-pill {
    min-height: 44px;
    min-width: 220px;
    border-radius: 999px;
    border: 1px solid rgba(35,95,62,.14);
    background: rgba(255,255,255,.84);
    color: var(--green-800);
    padding: 0 18px;
    font-size: 13px;
    font-weight: 900;
    outline: none;
  }

  .ltc-field label {
    display: block;
    margin: 0 0 8px;
    color: var(--green-950);
    font-size: 12px;
    font-weight: 900;
    letter-spacing: .08em;
    text-transform: uppercase;
  }

  .ltc-input,
  .ltc-select,
  .ltc-file-input {
    width: 100%;
    min-height: 50px;
    border-radius: 999px;
    border: 1px solid rgba(35,95,62,.16);
    background: rgba(255,255,255,.88);
    color: var(--dark);
    outline: none;
    font-size: 14px;
    font-family: inherit;
    font-weight: 700;
    padding: 0 18px;
    transition: .25s var(--ease);
    box-shadow: 0 10px 24px rgba(8,39,25,.05);
  }

  .ltc-file-input {
    padding: 11px 18px;
  }

  .ltc-file-input::file-selector-button {
    margin-right: 14px;
    border: 0;
    border-radius: 999px;
    background: rgba(35,95,62,.10);
    color: var(--green-800);
    padding: 8px 14px;
    font-size: 12px;
    font-weight: 900;
    cursor: pointer;
  }

  .ltc-input::placeholder {
    color: rgba(102,112,133,.68);
  }

  .ltc-input:focus,
  .ltc-select:focus,
  .ltc-file-input:focus {
    border-color: var(--green-700);
    background: white;
    box-shadow: 0 0 0 4px rgba(35,95,62,.10);
  }

  .ltc-error-text {
    margin: 7px 0 0;
    color: #b42318;
    font-size: 12px;
    font-weight: 800;
  }

  .ltc-help-text {
    margin: 7px 0 0;
    color: var(--muted);
    font-size: 12px;
    font-weight: 800;
  }

  .ltc-info-box {
    margin-top: 18px;
    border-radius: 18px;
    background: rgba(35,95,62,.08);
    border: 1px solid rgba(35,95,62,.10);
    color: var(--green-800);
    padding: 14px 16px;
    font-size: 13px;
    line-height: 1.65;
    font-weight: 700;
  }

  .ltc-info-box p {
    margin: 0;
  }

  .ltc-info-box p + p {
    margin-top: 3px;
  }

  .ltc-payment-section {
    margin-top: 34px;
  }

  .ltc-payment-grid {
    margin-top: 24px;
    display: grid;
    grid-template-columns: repeat(2, minmax(0,1fr));
    gap: 18px;
  }

  .ltc-qr-card {
    position: relative;
    width: 100%;
    border-radius: 22px;
    border: 1px solid rgba(35,95,62,.12);
    background: white;
    padding: 18px;
    box-shadow: 0 16px 34px rgba(8,39,25,.08);
    cursor: pointer;
    transition: .25s var(--ease);
  }

  .ltc-qr-card:hover {
    transform: translateY(-4px);
    border-color: rgba(215,168,77,.55);
    box-shadow: 0 22px 44px rgba(8,39,25,.12);
  }

  .ltc-qr-card.selected {
    border-color: var(--green-700);
    box-shadow: 0 0 0 4px rgba(35,95,62,.12), 0 22px 44px rgba(8,39,25,.12);
  }

  .ltc-qr-card.error {
    border-color: rgba(239,68,68,.55);
    box-shadow: 0 0 0 4px rgba(239,68,68,.10), 0 16px 34px rgba(8,39,25,.08);
  }

  .ltc-selected-badge {
    position: absolute;
    right: 16px;
    top: 16px;
    border-radius: 999px;
    background: var(--green-800);
    color: white;
    padding: 7px 12px;
    font-size: 10px;
    font-weight: 900;
    letter-spacing: .08em;
    text-transform: uppercase;
    box-shadow: 0 10px 22px rgba(8,39,25,.16);
  }

  .ltc-qr-frame {
    display: grid;
    place-items: center;
    height: 230px;
    border-radius: 18px;
    background: rgba(35,95,62,.08);
    overflow: hidden;
  }

  .ltc-qr-frame img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }

  .ltc-qr-title {
    margin: 14px 0 0;
    color: var(--green-800);
    text-align: center;
    font-size: 13px;
    font-weight: 900;
    letter-spacing: .08em;
    text-transform: uppercase;
  }

  .ltc-price-card {
    margin-top: 32px;
    border-radius: 20px;
    background: white;
    border: 1px solid rgba(35,95,62,.10);
    padding: 22px;
    box-shadow: 0 16px 34px rgba(8,39,25,.08);
  }

  .ltc-price-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 18px;
  }

  .ltc-price-label,
  .ltc-price-value {
    margin: 0;
    color: var(--green-950);
    font-size: clamp(22px,3vw,30px);
    font-weight: 900;
    letter-spacing: -.04em;
  }

  .ltc-price-breakdown {
    margin-top: 14px;
    display: grid;
    grid-template-columns: repeat(3,minmax(0,1fr));
    gap: 10px;
    color: var(--muted);
    font-size: 12px;
    font-weight: 800;
  }

  .ltc-actions {
    margin-top: 32px;
    display: flex;
    justify-content: center;
    gap: 18px;
    flex-wrap: wrap;
  }

  .ltc-primary-button,
  .ltc-secondary-button {
    min-height: 52px;
    min-width: 210px;
    border-radius: 999px;
    padding: 0 28px;
    cursor: pointer;
    font-size: 13px;
    font-weight: 900;
    transition: all .28s var(--ease);
  }

  .ltc-primary-button {
    border: 0;
    color: #102418;
    background: linear-gradient(135deg, #f4d484, #d7a84d);
    box-shadow: 0 16px 35px rgba(215,168,77,.22);
  }

  .ltc-primary-button:hover {
    transform: translateY(-4px);
    background: linear-gradient(135deg, #f7dc93, #c99634);
    box-shadow: 0 22px 45px rgba(215,168,77,.32);
  }

  .ltc-primary-button:active {
    transform: translateY(-1px) scale(.98);
    box-shadow: 0 10px 24px rgba(215,168,77,.22);
  }

  .ltc-secondary-button {
    border: 1px solid rgba(35,95,62,.18);
    color: var(--green-800);
    background: white;
    box-shadow: 0 12px 28px rgba(8,39,25,.06);
  }

  .ltc-secondary-button:hover {
    transform: translateY(-4px);
    color: white;
    background: var(--green-800);
    border-color: var(--green-800);
    box-shadow: 0 18px 38px rgba(8,39,25,.18);
  }

  .ltc-secondary-button:active,
  .ltc-secondary-button:focus {
    transform: translateY(-1px) scale(.98);
    color: white;
    background: var(--footer-green);
    border-color: var(--footer-green);
  }

  .ltc-primary-button:disabled,
  .ltc-secondary-button:disabled {
    opacity: .6;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
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
    grid-template-columns: 1.1fr .75fr 1.1fr 1.1fr 1fr;
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

  .ltc-footer-small-text {
    font-size: 12px !important;
    line-height: 1.42 !important;
    margin: 4px 0 !important;
  }

  .ltc-footer-small-text strong {
    font-size: 12px !important;
    line-height: 1.42 !important;
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

  .ltc-facebook-link {
    width: 34px;
    height: 34px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border: 1px solid rgba(255,255,255,.16);
    border-radius: 999px;
    background: rgba(255,255,255,.10);
    color: white;
    cursor: pointer;
    transition: .25s var(--ease);
    margin-top: 6px;
  }

  .ltc-facebook-link:hover {
    color: #f4d484;
    border-color: rgba(244,212,132,.42);
    background: rgba(244,212,132,.12);
    transform: translateY(-2px);
  }

  .ltc-facebook-link svg {
    width: 18px;
    height: 18px;
    fill: currentColor;
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

  .ltc-sidebar-overlay {
    position: fixed;
    inset: 0;
    z-index: 80;
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

  @media (max-width: 1100px) {
    .ltc-fields-grid,
    .ltc-price-breakdown,
    .ltc-payment-grid,
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

    .ltc-hero {
      padding: 76px 0 74px;
    }

    .ltc-section {
      padding: 64px 0;
    }

    .ltc-form-shell {
      padding: 28px 22px;
    }

    .ltc-booking-header,
    .ltc-price-row {
      flex-direction: column;
      align-items: flex-start;
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

    .ltc-hero-title {
      font-size: clamp(34px, 11vw, 46px);
      letter-spacing: -.045em;
    }

    .ltc-hero-text {
      font-size: 15px;
    }

    .ltc-form-shell {
      padding: 26px 18px;
    }

    .ltc-primary-button,
    .ltc-secondary-button {
      width: 100%;
    }
  }
`;


const successPageStyles = `
  .ltc-success-shell {
    position: relative;
    overflow: hidden;
    padding: 38px;
  }

  .ltc-success-shell::before {
    content: "";
    position: absolute;
    inset: 0;
    background:
      radial-gradient(circle at 0% 0%, rgba(215,168,77,.16), transparent 28%),
      radial-gradient(circle at 100% 16%, rgba(35,95,62,.12), transparent 34%);
    pointer-events: none;
  }

  .ltc-success-content {
    position: relative;
    z-index: 1;
  }

  .ltc-success-icon {
    width: 88px;
    height: 88px;
    margin: 0 auto;
    display: grid;
    place-items: center;
    border-radius: 999px;
    color: white;
    font-size: 42px;
    font-weight: 900;
    background: linear-gradient(135deg, var(--green-800), var(--green-700));
    box-shadow: 0 18px 40px rgba(35,95,62,.24), 0 0 0 12px rgba(35,95,62,.08);
  }

  .ltc-success-title {
    margin: 28px 0 0;
    color: var(--green-950);
    font-size: clamp(32px, 5vw, 48px);
    line-height: 1.05;
    font-weight: 900;
    letter-spacing: -.045em;
    text-align: center;
  }

  .ltc-success-title span {
    color: var(--gold);
  }

  .ltc-success-copy {
    max-width: 660px;
    margin: 16px auto 0;
    color: var(--muted);
    font-size: 16px;
    line-height: 1.8;
    text-align: center;
  }

  .ltc-success-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 18px;
    margin-top: 30px;
  }

  .ltc-success-note {
    margin-top: 26px;
    border: 1px solid rgba(35,95,62,.14);
    background: rgba(35,95,62,.06);
    border-radius: 22px;
    padding: 20px;
  }

  .ltc-success-note strong {
    display: block;
    color: var(--green-950);
    font-size: 14px;
    font-weight: 900;
    letter-spacing: .08em;
    text-transform: uppercase;
    margin-bottom: 8px;
  }

  .ltc-success-note p {
    color: var(--muted);
    font-size: 14px;
    line-height: 1.8;
    margin: 0;
  }

  .ltc-success-actions {
    margin-top: 30px;
    justify-content: center;
  }

  .ltc-success-page-main {
    min-height: calc(100vh - 76px);
    display: flex;
    align-items: center;
  }

  .ltc-success-page-main .ltc-section {
    width: 100%;
    padding: 34px 0;
  }

  .ltc-success-page-main .ltc-container {
    width: min(980px, 92%);
  }

  .ltc-success-shell {
    max-width: 940px;
    margin: 0 auto;
    padding: 26px 28px;
    border-radius: 22px;
  }

  .ltc-success-icon {
    width: 62px;
    height: 62px;
    font-size: 30px;
    box-shadow: 0 12px 28px rgba(35,95,62,.20), 0 0 0 8px rgba(35,95,62,.07);
  }

  .ltc-success-title {
    margin-top: 16px;
    font-size: clamp(26px, 3.2vw, 36px);
  }

  .ltc-success-copy {
    max-width: 620px;
    margin-top: 10px;
    font-size: 14px;
    line-height: 1.6;
  }

  .ltc-success-shell .ltc-summary-section {
    margin-top: 22px !important;
  }

  .ltc-success-shell .ltc-booking-header {
    margin-bottom: 16px;
  }

  .ltc-success-shell .ltc-section-heading {
    font-size: clamp(20px, 2.4vw, 26px);
  }

  .ltc-success-shell .ltc-section-line {
    margin-top: 8px;
  }

  .ltc-success-shell .ltc-fields-grid {
    margin-top: 18px;
    gap: 12px 14px;
  }

  .ltc-success-shell .ltc-input {
    min-height: 43px;
    font-size: 13px;
    padding: 0 15px;
  }

  .ltc-success-shell .ltc-field label {
    margin-bottom: 6px;
    font-size: 10.5px;
  }

  .ltc-success-note {
    margin-top: 18px;
    border-radius: 18px;
    padding: 15px 16px;
  }

  .ltc-success-note p {
    font-size: 13px;
    line-height: 1.55;
  }

  .ltc-success-actions {
    margin-top: 20px;
    gap: 12px;
  }

  .ltc-success-actions .ltc-primary-button,
  .ltc-success-actions .ltc-secondary-button {
    min-height: 44px;
    min-width: 190px;
    padding: 0 22px;
    font-size: 11px;
  }

  .ltc-receipt-modal-overlay {
    position: fixed;
    inset: 0;
    z-index: 120;
    display: flex;
    align-items: flex-start;
    justify-content: center;
    padding: 32px 22px;
    background: rgba(0,0,0,.55);
    backdrop-filter: blur(6px);
    overflow-y: auto;
    overscroll-behavior: contain;
  }

  .ltc-receipt-modal {
    position: relative;
    z-index: 121;
    width: min(840px, 96vw);
    max-height: calc(100vh - 64px);
    display: flex;
    flex-direction: column;
    overflow: hidden;
    border-radius: 24px;
    background: #ffffff;
    border: 1px solid rgba(255,255,255,.72);
    box-shadow: 0 34px 90px rgba(0,0,0,.28);
  }

  .ltc-receipt-modal-scroll {
    flex: 1;
    min-height: 0;
    overflow-y: auto;
    overscroll-behavior: contain;
    -webkit-overflow-scrolling: touch;
  }

  .ltc-receipt-modal-header {
    position: sticky;
    top: 0;
    z-index: 2;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    padding: 18px 22px;
    background: var(--footer-green);
    color: white;
  }

  .ltc-receipt-modal-header h3 {
    margin: 0;
    font-size: 18px;
    line-height: 1.2;
    font-weight: 900;
    letter-spacing: -.02em;
  }

  .ltc-receipt-close {
    width: 40px;
    height: 40px;
    border: 0;
    border-radius: 999px;
    background: rgba(255,255,255,.12);
    color: white;
    cursor: pointer;
    font-size: 18px;
    font-weight: 900;
    transition: .25s var(--ease);
  }

  .ltc-receipt-close:hover {
    background: rgba(255,255,255,.22);
    transform: scale(1.04);
  }

  .ltc-receipt-paper {
    margin: 24px;
    border-radius: 20px;
    overflow: hidden;
    border: 1px solid rgba(35,95,62,.12);
    background: white;
  }

  .ltc-receipt-top {
    display: flex;
    justify-content: space-between;
    gap: 18px;
    padding: 26px;
    color: white;
    background: var(--green-800);
  }

  .ltc-receipt-brand h4,
  .ltc-receipt-meta h4 {
    margin: 0;
    font-size: 22px;
    line-height: 1.1;
    font-weight: 900;
    text-transform: uppercase;
  }

  .ltc-receipt-brand p,
  .ltc-receipt-meta p {
    margin: 6px 0 0;
    color: rgba(255,255,255,.78);
    font-size: 12px;
    font-weight: 700;
  }

  .ltc-receipt-meta {
    text-align: right;
  }

  .ltc-receipt-status {
    margin: 22px 26px 0;
    border-radius: 14px;
    padding: 12px 14px;
    background: rgba(244,212,132,.32);
    color: var(--green-950);
    font-size: 12px;
    font-weight: 900;
    letter-spacing: .06em;
    text-transform: uppercase;
  }

  .ltc-receipt-body {
    padding: 24px 26px 28px;
  }

  .ltc-receipt-body h5 {
    margin: 0 0 12px;
    color: var(--green-950);
    font-size: 13px;
    font-weight: 900;
    letter-spacing: .08em;
    text-transform: uppercase;
  }

  .ltc-receipt-two-col {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 18px;
    margin-bottom: 24px;
  }

  .ltc-receipt-box {
    border-radius: 16px;
    border: 1px solid rgba(35,95,62,.12);
    background: rgba(35,95,62,.04);
    padding: 16px;
  }

  .ltc-receipt-name {
    margin: 0;
    color: var(--green-950);
    font-size: 15px;
    font-weight: 900;
  }

  .ltc-receipt-muted {
    margin: 5px 0 0;
    color: var(--muted);
    font-size: 13px;
    font-weight: 700;
  }

  .ltc-receipt-table {
    width: 100%;
    border-collapse: collapse;
    overflow: hidden;
    border-radius: 16px;
    border: 1px solid rgba(35,95,62,.12);
    margin-bottom: 24px;
  }

  .ltc-receipt-table th,
  .ltc-receipt-table td {
    padding: 12px 14px;
    border-bottom: 1px solid rgba(35,95,62,.10);
    text-align: left;
    vertical-align: top;
    font-size: 13px;
  }

  .ltc-receipt-table th {
    width: 34%;
    color: var(--muted);
    font-weight: 900;
    letter-spacing: .05em;
    text-transform: uppercase;
    background: rgba(35,95,62,.04);
  }

  .ltc-receipt-table td {
    color: var(--green-950);
    font-weight: 800;
  }

  .ltc-receipt-table tr:last-child th,
  .ltc-receipt-table tr:last-child td {
    border-bottom: 0;
  }

  .ltc-receipt-summary {
    border-radius: 16px;
    border: 1px solid rgba(35,95,62,.12);
    overflow: hidden;
  }

  .ltc-receipt-summary-row {
    display: flex;
    justify-content: space-between;
    gap: 16px;
    padding: 13px 16px;
    border-bottom: 1px solid rgba(35,95,62,.10);
    color: var(--green-950);
    font-size: 13px;
    font-weight: 800;
  }

  .ltc-receipt-summary-row:last-child {
    border-bottom: 0;
  }

  .ltc-receipt-summary-row.balance {
    background: var(--green-800);
    color: white;
    font-size: 15px;
    font-weight: 900;
  }

  .ltc-receipt-note {
    margin-top: 18px;
    border-radius: 16px;
    background: rgba(102,112,133,.08);
    color: var(--muted);
    padding: 14px 16px;
    font-size: 13px;
    line-height: 1.65;
    font-weight: 700;
  }

  @media (max-width: 900px) {
    .ltc-success-page-main {
      align-items: flex-start;
    }

    .ltc-success-page-main .ltc-section {
      padding: 26px 0;
    }

    .ltc-success-shell {
      padding: 24px 18px;
    }

    .ltc-success-grid,
    .ltc-success-shell .ltc-fields-grid,
    .ltc-receipt-two-col {
      grid-template-columns: 1fr;
    }

    .ltc-receipt-paper {
      margin: 14px;
    }

    .ltc-receipt-top {
      flex-direction: column;
    }

    .ltc-receipt-meta {
      text-align: left;
    }

    .ltc-receipt-body {
      padding: 18px;
    }

    .ltc-receipt-modal-overlay {
      padding: 14px;
    }

    .ltc-receipt-modal {
      max-height: calc(100vh - 28px);
    }
  }
`;

export default function BookingSuccessful() {
  const navigate = useNavigate();
  const { state } = useLocation();

  const [isOpen, setIsOpen] = useState(false);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);

  const booking = state?.booking || {};
  const serviceType = state?.serviceType || booking.serviceType || "Booking";

  const amountPaid = Number(
    state?.amountPaid ||
      booking.amountToPay ||
      booking.paidAmount ||
      booking.amountPaid ||
      0
  );

  const totalAmount = Number(
    state?.totalAmount ||
      booking.totalAmount ||
      booking.price ||
      0
  );

  const balanceAmount = Math.max(0, totalAmount - amountPaid);

  const details = useMemo(() => {
    const date = booking.date || booking.eventDate || "";
    const packageName =
      booking.selectedPackageTitle ||
      booking.selectedPackage ||
      booking.eventPackage ||
      booking.packageTitle ||
      booking.venue ||
      booking.roomType ||
      "";

    return {
      packageName,
      date,
      time: booking.time || "",
      pax: booking.pax || booking.totalGuests || "",
      paymentTerm: state?.paymentTerm || booking.paymentTerm || "",
      paymentMethod: state?.paymentMethod || booking.paymentMethod || "",
      firstName: booking.firstName || "",
      lastName: booking.lastName || "",
      email: booking.email || "",
      phone: booking.phone || "",
    };
  }, [booking, state]);

  const receiptNumber = useMemo(() => {
    const base = `${Date.now()}`.slice(-8);
    return `LMS-${base}`;
  }, []);

  const goToProfile = () => {
    navigate("/hotel-guest-reviews");
  };

  const goHome = () => {
    navigate("/resort-venue");
  };

  const downloadReceiptPdf = () => {
    const receiptDate = new Date().toLocaleDateString("en-PH", {
      year: "numeric",
      month: "long",
      day: "2-digit",
    });

    const guestName = `${details.firstName} ${details.lastName}`.trim() || "Guest";

    const pdfBlob = createProfessionalPdf({
      receiptNumber,
      receiptDate,
      guestName,
      email: details.email,
      phone: details.phone,
      serviceType,
      packageName: details.packageName,
      date: details.date,
      time: details.time,
      pax: details.pax,
      paymentMethod: details.paymentMethod,
      paymentTerm: details.paymentTerm,
      amountPaid,
      totalAmount,
      balanceAmount,
    });

    const url = URL.createObjectURL(pdfBlob);
    const fileName = `${sanitizeFileName(serviceType)}-${sanitizeFileName(guestName)}-receipt.pdf`;

    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    link.style.display = "none";

    document.body.appendChild(link);
    link.click();
    link.remove();

    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  return (
    <div className="ltc-resort-summary-page" style={fontPontano}>
      <style>{pageStyles}</style>
      <style>{successPageStyles}</style>

      <Header
        navigate={navigate}
        goToProfile={goToProfile}
        openMenu={() => setIsOpen(true)}
      />

      <main className="ltc-success-page-main">
        <section className="ltc-section">
          <div className="ltc-container">
            <div className="ltc-form-shell ltc-success-shell">
              <div className="ltc-success-content">
                <div className="ltc-success-icon" aria-hidden="true">
                  ✓
                </div>

                <h2 className="ltc-success-title" style={fontMontserrat}>
                  Thank you for <span>booking!</span>
                </h2>

                <p className="ltc-success-copy" style={fontPontano}>
                  Your {serviceType} request has been submitted successfully and is now waiting for admin approval.
                  Please check your profile for booking status updates.
                </p>

                <section className="ltc-summary-section" style={{ marginTop: 34 }}>
                  <div className="ltc-booking-header">
                    <div>
                      <h2 className="ltc-section-heading" style={fontMontserrat}>
                        Booking Details
                      </h2>
                      <div className="ltc-section-line" />
                    </div>

                    <input
                      value={serviceType}
                      disabled
                      readOnly
                      className="ltc-service-pill"
                      style={fontPoppins}
                    />
                  </div>

                  <div className="ltc-fields-grid">
                    <ReadOnlyField label="Service" value={serviceType} />
                    <ReadOnlyField label="Package / Venue" value={details.packageName || "—"} />
                    <ReadOnlyField label="Date" value={formatDateMMDDYYYY(details.date) || "—"} />
                    <ReadOnlyField label="Time" value={details.time || "—"} />
                    <ReadOnlyField label="Pax" value={details.pax ? `${details.pax} pax` : "—"} />
                    <ReadOnlyField label="Payment Method" value={details.paymentMethod || "—"} />
                    <ReadOnlyField label="Payment Term" value={details.paymentTerm || "—"} />
                    <ReadOnlyField label="Amount Paid" value={formatPesoDisplay(amountPaid)} />
                    <ReadOnlyField label="Total Amount" value={formatPesoDisplay(totalAmount)} />
                    <ReadOnlyField label="Remaining Balance" value={formatPesoDisplay(balanceAmount)} />
                  </div>
                </section>

                <div className="ltc-success-note" style={fontPoppins}>
                  <strong style={fontMontserrat}>What happens next?</strong>
                  <p>
                    Admin will review your booking details and proof of payment. Once approved,
                    your booking status will update in your profile.
                  </p>
                </div>

                <div className="ltc-actions ltc-success-actions">
                  <button
                    onClick={() => setIsReceiptModalOpen(true)}
                    type="button"
                    className="ltc-secondary-button"
                    style={fontMontserrat}
                  >
                    View Receipt
                  </button>

                  <button
                    onClick={downloadReceiptPdf}
                    type="button"
                    className="ltc-primary-button"
                    style={fontMontserrat}
                  >
                    Download Receipt PDF
                  </button>

                  <button
                    onClick={goToProfile}
                    type="button"
                    className="ltc-primary-button"
                    style={fontMontserrat}
                  >
                    View My Bookings
                  </button>

                  <button
                    onClick={goHome}
                    type="button"
                    className="ltc-secondary-button"
                    style={fontMontserrat}
                  >
                    Back to Home
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />

      {isOpen ? (
        <MobileMenu
          onClose={() => setIsOpen(false)}
          navigate={navigate}
          goToProfile={goToProfile}
        />
      ) : null}

      {isReceiptModalOpen ? (
        <ReceiptModal
          onClose={() => setIsReceiptModalOpen(false)}
          receiptNumber={receiptNumber}
          serviceType={serviceType}
          details={details}
          amountPaid={amountPaid}
          totalAmount={totalAmount}
          balanceAmount={balanceAmount}
        />
      ) : null}
    </div>
  );
}

function ReceiptModal({
  onClose,
  receiptNumber,
  serviceType,
  details,
  amountPaid,
  totalAmount,
  balanceAmount,
}) {
  const receiptDate = new Date().toLocaleDateString("en-PH", {
    year: "numeric",
    month: "long",
    day: "2-digit",
  });

  const guestName = `${details.firstName} ${details.lastName}`.trim() || "Guest";

  return (
    <div
      className="ltc-receipt-modal-overlay"
      role="dialog"
      aria-modal="true"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        className="ltc-receipt-modal"
        onMouseDown={(event) => event.stopPropagation()}
        onClick={(event) => event.stopPropagation()}
        onTouchStart={(event) => event.stopPropagation()}
      >
        <div className="ltc-receipt-modal-header">
          <h3 style={fontMontserrat}>Booking Receipt Preview</h3>

          <button
            type="button"
            onClick={onClose}
            className="ltc-receipt-close"
            aria-label="Close receipt preview"
          >
            ×
          </button>
        </div>

        <div className="ltc-receipt-modal-scroll">
          <div className="ltc-receipt-paper">
            <div className="ltc-receipt-top">
              <div className="ltc-receipt-brand">
                <h4 style={fontMontserrat}>Lumispire</h4>
                <p style={fontPontano}>Hotel &amp; Resort</p>
              </div>

              <div className="ltc-receipt-meta">
                <h4 style={fontMontserrat}>Booking Receipt</h4>
                <p style={fontPontano}>Receipt No. {receiptNumber}</p>
                <p style={fontPontano}>Issued: {receiptDate}</p>
              </div>
            </div>

            <div className="ltc-receipt-status" style={fontMontserrat}>
              Status: Submitted — Waiting for Admin Approval
            </div>

            <div className="ltc-receipt-body">
              <div className="ltc-receipt-two-col">
                <div className="ltc-receipt-box">
                  <h5 style={fontMontserrat}>Billed To</h5>
                  <p className="ltc-receipt-name" style={fontMontserrat}>
                    {guestName}
                  </p>
                  <p className="ltc-receipt-muted" style={fontPontano}>
                    {details.email || "—"}
                  </p>
                  <p className="ltc-receipt-muted" style={fontPontano}>
                    {details.phone || "—"}
                  </p>
                </div>

                <div className="ltc-receipt-box">
                  <h5 style={fontMontserrat}>Payment Overview</h5>
                  <p className="ltc-receipt-muted" style={fontPontano}>
                    Method: {details.paymentMethod || "—"}
                  </p>
                  <p className="ltc-receipt-muted" style={fontPontano}>
                    Term: {details.paymentTerm || "—"}
                  </p>
                </div>
              </div>

              <h5 style={fontMontserrat}>Booking Details</h5>
              <table className="ltc-receipt-table">
                <tbody>
                  <ReceiptRow label="Service" value={serviceType || "—"} />
                  <ReceiptRow label="Package / Venue" value={details.packageName || "—"} />
                  <ReceiptRow label="Date" value={formatDateMMDDYYYY(details.date) || "—"} />
                  <ReceiptRow label="Time" value={details.time || "—"} />
                  <ReceiptRow label="Pax" value={details.pax ? `${details.pax} pax` : "—"} />
                </tbody>
              </table>

              <h5 style={fontMontserrat}>Payment Summary</h5>
              <div className="ltc-receipt-summary">
                <div className="ltc-receipt-summary-row" style={fontPontano}>
                  <span>Total Booking Amount</span>
                  <strong>{formatPesoDisplay(totalAmount)}</strong>
                </div>

                <div className="ltc-receipt-summary-row" style={fontPontano}>
                  <span>Amount Paid</span>
                  <strong>{formatPesoDisplay(amountPaid)}</strong>
                </div>

                <div className="ltc-receipt-summary-row balance" style={fontMontserrat}>
                  <span>Remaining Balance</span>
                  <strong>{formatPesoDisplay(balanceAmount)}</strong>
                </div>
              </div>

              <div className="ltc-receipt-note" style={fontPontano}>
                This receipt preview confirms that your booking request and proof of payment were submitted.
                Final confirmation is subject to admin approval. Please check your profile for booking status updates.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ReceiptRow({ label, value }) {
  return (
    <tr>
      <th style={fontMontserrat}>{label}</th>
      <td style={fontPontano}>{value}</td>
    </tr>
  );
}

function Header({ navigate, goToProfile, openMenu }) {
  return (
    <header className="ltc-header">
      <div className="ltc-container ltc-nav">
        <button
          onClick={() => navigate("/resort-venue")}
          type="button"
          className="ltc-logo"
          aria-label="Go to home"
        >
          <img
            src={HOTEL_LOGO}
            alt="Hotel logo"
            className="ltc-logo-icon"
            onError={(event) => {
              event.currentTarget.style.display = "none";
            }}
          />

          <div>
            <h1 style={fontMontserrat}>Hotel &amp; Resort</h1>
            <p style={fontPontano}>Resort, venue, hotel, and events booking services.</p>
          </div>
        </button>

        <nav className="ltc-desktop-nav" style={fontPoppins}>
          <NavButton label="Home" onClick={() => navigate("/resort-venue")} />
          <NavButton label="Virtual Tour" onClick={() => navigate("/virtual-tour")} />
          <NavButton label="Contact" onClick={() => navigate("/hotel-contact-us")} />
          <NavButton label="FAQs" onClick={() => navigate("/hotel-faqs")} />
          <NavButton
            label={
              localStorage.getItem("token") || localStorage.getItem("hotelToken")
                ? "Profile"
                : "Sign In"
            }
            onClick={goToProfile}
            className="ltc-profile-button"
          />
        </nav>

        <button
          onClick={openMenu}
          type="button"
          aria-label="Open menu"
          className="ltc-menu-button"
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

function ReadOnlyField({ label, value }) {
  return (
    <div className="ltc-field">
      <label style={fontMontserrat}>{label}</label>

      <input
        readOnly
        value={value ?? ""}
        placeholder="—"
        className="ltc-input"
        style={fontPoppins}
      />
    </div>
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
          <FooterLink onClick={() => (window.location.href = "/resort-venue")}>
            Home
          </FooterLink>
          <FooterLink onClick={() => (window.location.href = "/virtual-tour")}>
            Virtual Tour
          </FooterLink>
          <FooterLink onClick={() => (window.location.href = "/hotel-contact-us")}>
            Contact
          </FooterLink>
          <FooterLink onClick={() => (window.location.href = "/hotel-faqs")}>
            FAQs
          </FooterLink>
          <FooterLink
            onClick={() => {
              window.location.href =
                localStorage.getItem("token") || localStorage.getItem("hotelToken")
                  ? "/hotel-profile"
                  : "/hotel-login";
            }}
          >
            {localStorage.getItem("token") || localStorage.getItem("hotelToken")
              ? "Profile"
              : "Sign In"}
          </FooterLink>
        </FooterColumn>

        <FooterColumn title="Resort">
          <FooterText className="ltc-footer-small-text">
            <strong>Address:</strong>
          </FooterText>
          <FooterText className="ltc-footer-small-text">
            Ecotrend Subdivision San Nicolas, Bacoor Cavite
          </FooterText>

          <FooterText className="ltc-footer-small-text">
            <strong>Contact No.:</strong>
          </FooterText>
          <FooterText className="ltc-footer-small-text">+63 9953781962</FooterText>
          <FooterText className="ltc-footer-small-text">+63 9064191405</FooterText>
          <FooterText className="ltc-footer-small-text">+63 9338699988</FooterText>
        </FooterColumn>

        <FooterColumn title="Hotel">
          <FooterText className="ltc-footer-small-text">
            <strong>Address:</strong>
          </FooterText>
          <FooterText className="ltc-footer-small-text">
            2/F 5441 Currie Street, Palanan, Makati City
          </FooterText>

          <FooterText className="ltc-footer-small-text">
            <strong>Contact No.:</strong>
          </FooterText>
          <FooterText className="ltc-footer-small-text">+63 9064191405</FooterText>
          <FooterText className="ltc-footer-small-text">+63 9338699988</FooterText>
        </FooterColumn>

        <FooterColumn title="Contact Information">
          <FooterText>recruitment@ltcmultiservices.com</FooterText>
          <FooterText>marketing@ltcmultiservices.com</FooterText>
          <FooterText>lorenzoeventandvenue@gmail.com</FooterText>
          <FacebookLink />
        </FooterColumn>
      </div>

      <div className="ltc-container ltc-copyright">
        <span style={fontPontano}>© 2026 LTC GROUP OF COMPANIES. All rights reserved.</span>
        <span style={fontPontano}>Developed by CRMS Tech Alliance</span>
      </div>
    </footer>
  );
}

function FacebookLink() {
  return (
    <button
      type="button"
      className="ltc-facebook-link"
      aria-label="Open Facebook page"
      title="Facebook"
      onClick={() => {
        window.open(
          "https://www.facebook.com/4delorenzo?rdid=2DsYHS1ll77JUW6K&share_url=https%3A%2F%2Fwww.facebook.com%2Fshare%2F18wf6uHcfv%2F#",
          "_blank",
          "noopener,noreferrer"
        );
      }}
    >
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M22 12.06C22 6.48 17.52 2 11.94 2S2 6.48 2 12.06c0 5.02 3.66 9.18 8.44 9.94v-7.03H7.9v-2.91h2.54V9.84c0-2.5 1.49-3.89 3.77-3.89 1.09 0 2.23.2 2.23.2v2.45h-1.26c-1.24 0-1.63.77-1.63 1.56v1.9h2.77l-.44 2.91h-2.33V22c4.78-.76 8.45-4.92 8.45-9.94Z" />
      </svg>
    </button>
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
      onClick={onClick}
      type="button"
      className="ltc-footer-link"
      style={fontPontano}
    >
      {children}
    </button>
  );
}

function FooterText({ children, className = "" }) {
  return (
    <p className={className} style={fontPontano}>
      {children}
    </p>
  );
}

function MobileMenu({ onClose, navigate, goToProfile }) {
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
            navigate("/resort-venue");
          }}
        />

        <MenuItem
          label="VIRTUAL TOUR"
          onClick={() => {
            onClose();
            navigate("/virtual-tour");
          }}
        />

        <MenuItem
          label="CONTACT"
          onClick={() => {
            onClose();
            navigate("/hotel-contact-us");
          }}
        />

        <MenuItem
          label="FAQS"
          onClick={() => {
            onClose();
            navigate("/hotel-faqs");
          }}
        />

        <MenuItem
          label="PROFILE"
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
