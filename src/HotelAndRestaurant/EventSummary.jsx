import React, { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const BANK_QR_IMAGE = "/bank-transfer-qr.png";
const GCASH_QR_IMAGE = "/gcash-qr.png";

const HOTEL_LOGO = "/HotelLogo.png";
const LUMISPIRE_LOGO = "/HotelLumispireLogo.png";
const HERO_IMAGES = ["/HotelLanding1.png", "/HotelLanding2.png"];

const fontMontserrat = { fontFamily: "'Montserrat', sans-serif" };
const fontPontano = { fontFamily: "'Pontano Sans', sans-serif" };
const fontPoppins = { fontFamily: "'Poppins', sans-serif" };


const EVENT_PACKAGE_POLICY_SECTIONS = [
  {
    title: "1. Reservation and Booking Process",
    paragraphs: [
      "Customers may submit an Event Package booking through LUMISPIRE by providing information including:",
    ],
    bullets: [
      "Full name of customer or event organizer",
      "Contact information",
      "Email address",
      "Event date",
      "Event type",
      "Selected event package",
      "Preferred venue",
      "Expected number of guests",
      "Event schedule",
      "Additional services",
      "Special requests",
    ],
    after: [
      "Examples of events may include celebrations, gatherings, corporate functions, receptions, and other approved events.",
      "Customers must ensure that all information provided is accurate.",
      "An Event Package booking is confirmed only after availability, package details, and required payment have been reviewed and approved.",
    ],
  },
  {
    title: "2. Customer and Event Information Requirements",
    paragraphs: [
      "The customer or authorized event representative must provide complete information necessary to arrange the event.",
      "Additional identification or documentation may be requested when reasonably necessary.",
      "Customers must immediately inform Hotel & Resort Services of significant changes to the event information.",
      "Personal information will be processed according to the LUMISPIRE Hotel & Resort Privacy Policy.",
    ],
  },
  {
    title: "3. Venue and Package Availability",
    paragraphs: [
      "Event packages, venues, dates, amenities, equipment, and related services are subject to availability.",
      "LTC Group Hotel & Resort Services may:",
    ],
    bullets: [
      "Confirm or decline requested event dates",
      "Recommend alternative schedules",
      "Offer alternative packages or venue arrangements",
      "Correct errors in package information or pricing",
      "Modify availability when operationally necessary",
    ],
    after: [
      "Submission of an event request does not guarantee reservation of the venue or package until confirmation is issued.",
    ],
  },
  {
    title: "4. Event Schedule and Venue Access",
    subsections: [
      { title: "Event Start Time:", text: "As stated in the confirmed booking" },
      { title: "Event End Time:", text: "As stated in the confirmed booking" },
    ],
    after: [
      "Customers and guests must observe the approved event schedule.",
      "Setup, ingress, preparation, event duration, and egress schedules may be subject to venue rules.",
      "Additional time beyond the confirmed schedule may result in additional charges and requires approval.",
    ],
  },
  {
    title: "5. Payment Policy",
    paragraphs: [
      "Event packages may require a deposit, partial payment, or full payment according to the applicable package.",
    ],
    subsections: [
      {
        title: "GCash Payment",
        bullets: [
          "Pay only through the officially provided GCash account",
          "Submit valid proof of payment",
          "Provide the correct transaction reference and amount",
          "Allow payment verification",
        ],
      },
      {
        title: "Bank Transfer Payment",
        bullets: [
          "Transfer funds only to the authorized bank account",
          "Submit proof of transfer",
          "Provide accurate transaction details",
          "Wait for confirmation",
        ],
      },
    ],
    after: [
      "The booking is not fully secured until required payment has been verified.",
      "Failure to complete payment within the required period may result in release of the event date or venue.",
    ],
  },
  {
    title: "6. Cancellation and Modification Policy",
    paragraphs: ["Customers may request cancellation or modification of:"],
    bullets: [
      "Event date",
      "Event schedule",
      "Venue",
      "Event package",
      "Guest count",
      "Food or service arrangements when applicable",
      "Additional amenities",
      "Other booking details",
    ],
    after: [
      "All changes are subject to availability, operational capacity, package conditions, and approval.",
      "A change in guest count or services may result in adjustment of the total price.",
    ],
  },
  {
    title: "7. Refund Policy",
    paragraphs: [
      "Refund eligibility depends on the applicable cancellation conditions, amount already paid, and timing of the cancellation.",
      "Expenses already incurred in preparation for the event may affect refund eligibility where legally permitted and properly disclosed.",
      "Approved refunds may be processed through the original payment method.",
      "Complete transaction information is required for GCash and bank-transfer refunds.",
    ],
  },
  {
    title: "8. No-Show Policy",
    paragraphs: [
      "Failure to conduct or attend the event on the confirmed date without prior approved cancellation may be treated as a no-show.",
      "In such circumstances:",
    ],
    bullets: [
      "The venue reservation may be considered consumed or cancelled",
      "Applicable deposits or advance payments may be forfeited according to the confirmed booking conditions",
      "Prepared services may remain chargeable where applicable",
    ],
    after: [
      "Customers should immediately contact Hotel & Resort Services when an event cannot proceed as scheduled.",
    ],
  },
  {
    title: "9. Early Termination of Event",
    paragraphs: [
      "If the customer voluntarily ends an event before its scheduled completion, unused time or services do not automatically qualify for a refund.",
      "An event may also be terminated when necessary because of serious safety concerns, prohibited conduct, illegal activities, or significant violations of venue rules.",
    ],
  },
  {
    title: "10. Special Requests",
    paragraphs: ["Customers may request:"],
    bullets: [
      "Event decorations",
      "Seating arrangements",
      "Table arrangements",
      "Audio or visual equipment",
      "Accessibility arrangements",
      "Celebration setups",
      "Additional amenities",
      "Other event-related preferences",
    ],
    after: [
      "Special requests remain subject to availability, approval, technical feasibility, and possible additional fees.",
    ],
  },
  {
    title: "11. Customer and Guest Responsibilities",
    paragraphs: [
      "The customer or event organizer is responsible for ensuring that event participants comply with applicable venue policies.",
      "Customers agree to:",
    ],
    bullets: [
      "Provide accurate event information",
      "Observe venue capacity",
      "Follow approved schedules",
      "Maintain appropriate conduct",
      "Respect employees and property",
      "Follow safety requirements",
      "Pay applicable additional charges",
      "Take responsibility for damage caused by participants under their booking",
      "Obtain any permits or approvals specifically required for their event where applicable",
    ],
    after: ["Illegal, dangerous, disruptive, or unauthorized activities are prohibited."],
  },
  {
    title: "12. Children and Additional Guests Policy",
    paragraphs: [
      "The expected guest count must be declared accurately.",
      "Any increase in attendance requires approval.",
      "Venue capacity must not be exceeded.",
      "Additional charges may apply when actual attendance exceeds the number covered by the confirmed event package.",
      "Children must be properly supervised by responsible adults.",
    ],
  },
  {
    title: "13. Promotions and Special Offers",
    paragraphs: ["Promotional Event Packages may be limited by:"],
    bullets: [
      "Specific event dates",
      "Booking periods",
      "Venue availability",
      "Minimum or maximum guest requirements",
      "Required payment schedules",
      "Package-specific inclusions",
      "Restrictions on modifications or refunds",
    ],
    after: ["Promotions cannot be combined unless specifically allowed."],
  },
  {
    title: "14. Force Majeure",
    paragraphs: [
      "LTC Group shall not be held responsible for failure or delay in providing event services due to circumstances outside reasonable control, including:",
    ],
    bullets: [
      "Typhoons",
      "Flooding",
      "Natural disasters",
      "Government restrictions",
      "Public emergencies",
      "Serious utility interruptions",
      "Other unforeseen events",
    ],
    after: [
      "Where possible, the parties may discuss reasonable rescheduling or alternative arrangements.",
    ],
  },
  {
    title: "15. Privacy and Data Protection",
    paragraphs: ["Personal information collected for Event Package bookings may be used for:"],
    bullets: [
      "Event reservation processing",
      "Customer verification",
      "Payment verification",
      "Event coordination",
      "Communication",
      "Guest and venue management",
      "Administrative records",
    ],
    after: [
      "Information will be processed in accordance with the LUMISPIRE Hotel & Resort Privacy Policy and applicable Philippine data privacy laws.",
    ],
  },
  {
    title: "16. Policy Updates",
    paragraphs: [
      "LTC Group may revise this Event Package Booking Policy when operational, legal, service, pricing, or technical requirements change.",
      "Updated policies may be made available through LUMISPIRE or other official channels.",
    ],
  },
  {
    title: "17. Contact Information",
    contact: [
      ["Service", "LTC Group – Hotel & Resort Services"],
      ["Resort / Event Location", "Patio de Lorenzo, CXRC+76G, Bacoor, Cavite"],
      ["Email", "lorenzoeventandvenue@gmail.com"],
      ["Contact Numbers", "09338699988 / 09064191405"],
    ],
  },
];

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


  .ltc-field-full {
    grid-column: 1 / -1;
  }

  .ltc-readonly-textarea {
    width: 100%;
    min-height: 96px;
    border-radius: 22px;
    border: 1px solid rgba(35,95,62,.16);
    background: rgba(255,255,255,.88);
    color: var(--dark);
    outline: none;
    font-size: 14px;
    font-family: inherit;
    font-weight: 700;
    padding: 14px 18px;
    line-height: 1.6;
    resize: vertical;
    box-shadow: 0 10px 24px rgba(8,39,25,.05);
    white-space: pre-wrap;
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
    margin-top: 18px;
    display: grid;
    grid-template-columns: repeat(2, minmax(0,1fr));
    gap: 18px;
  }

  .ltc-qr-placeholder {
    height: 230px;
    border-radius: 18px;
    display: grid;
    place-items: center;
    text-align: center;
    padding: 18px;
    color: white;
    font-weight: 900;
    letter-spacing: .08em;
    text-transform: uppercase;
  }

  .ltc-qr-placeholder-bank {
    background: linear-gradient(135deg, #174a30, #2f6848);
  }

  .ltc-qr-placeholder-gcash {
    background: linear-gradient(135deg, #1d4ed8, #38bdf8);
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


  .ltc-policy-agreement {
    margin-top: 26px;
    min-height: 56px;
    display: flex;
    align-items: center;
    gap: 10px;
    border: 1px solid rgba(35,95,62,.16);
    border-radius: 18px;
    background: rgba(255,255,255,.78);
    padding: 12px 15px;
  }

  .ltc-policy-agreement input {
    width: 18px;
    height: 18px;
    flex: 0 0 auto;
    accent-color: var(--green-700);
    cursor: pointer;
  }

  .ltc-policy-agreement-text {
    margin: 0;
    color: #475467;
    font-size: 12px;
    line-height: 1.5;
    font-weight: 800;
  }

  .ltc-policy-link {
    border: 0;
    background: transparent;
    padding: 0;
    color: var(--green-800);
    font: inherit;
    font-weight: 900;
    text-decoration: underline;
    text-underline-offset: 2px;
    cursor: pointer;
  }

  .ltc-policy-link:hover,
  .ltc-policy-link:focus-visible {
    color: var(--green-950);
  }

  .ltc-policy-modal-shell {
    position: fixed;
    inset: 0;
    z-index: 120;
    display: grid;
    place-items: center;
    padding: 18px;
  }

  .ltc-policy-modal-backdrop {
    position: absolute;
    inset: 0;
    background: rgba(2,18,11,.72);
    backdrop-filter: blur(5px);
  }

  .ltc-policy-modal-card {
    position: relative;
    z-index: 1;
    width: min(900px,100%);
    max-height: 90vh;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    border-radius: 26px;
    background: white;
    box-shadow: 0 32px 90px rgba(0,0,0,.30);
  }

  .ltc-policy-modal-header {
    display: flex;
    justify-content: space-between;
    gap: 18px;
    padding: 24px 26px 18px;
    border-bottom: 1px solid rgba(35,95,62,.10);
    background: linear-gradient(180deg,#fbfdfb,#f7faf8);
  }

  .ltc-policy-modal-eyebrow {
    margin: 0;
    color: var(--green-700);
    font-size: 11px;
    font-weight: 900;
    letter-spacing: .16em;
    text-transform: uppercase;
  }

  .ltc-policy-modal-title {
    margin: 7px 0 0;
    color: var(--green-950);
    font-size: clamp(24px,3vw,34px);
    line-height: 1.08;
    font-weight: 900;
    letter-spacing: -.04em;
  }

  .ltc-policy-modal-meta {
    margin: 8px 0 0;
    color: var(--muted);
    font-size: 12px;
    font-weight: 700;
  }

  .ltc-policy-modal-close {
    width: 40px;
    height: 40px;
    flex: 0 0 auto;
    border: 0;
    border-radius: 12px;
    background: rgba(35,95,62,.08);
    color: var(--green-950);
    font-size: 20px;
    cursor: pointer;
  }

  .ltc-policy-modal-body {
    overflow-y: auto;
    padding: 24px 26px 28px;
  }

  .ltc-policy-intro,
  .ltc-policy-final {
    margin: 0;
    color: var(--muted);
    font-size: 14px;
    line-height: 1.75;
  }

  .ltc-policy-final {
    margin-top: 22px;
    color: var(--green-900);
    font-weight: 900;
  }

  .ltc-policy-section {
    margin-top: 24px;
  }

  .ltc-policy-section h4 {
    margin: 0;
    color: var(--green-950);
    font-size: 18px;
    font-weight: 900;
  }

  .ltc-policy-section h5 {
    margin: 14px 0 0;
    color: var(--green-900);
    font-size: 14px;
    font-weight: 900;
  }

  .ltc-policy-section p {
    margin: 9px 0 0;
    color: var(--muted);
    font-size: 13px;
    line-height: 1.7;
  }

  .ltc-policy-section ul {
    margin: 10px 0 0;
    padding-left: 20px;
    color: var(--muted);
    font-size: 13px;
    line-height: 1.75;
  }

  .ltc-policy-contact {
    margin-top: 10px;
    display: grid;
    gap: 5px;
    color: var(--muted);
    font-size: 13px;
    line-height: 1.6;
  }

  .ltc-policy-modal-footer {
    padding: 16px 26px 20px;
    border-top: 1px solid rgba(35,95,62,.10);
    display: flex;
    justify-content: flex-end;
  }

  .ltc-policy-modal-footer .ltc-primary-button {
    min-width: 180px;
  }

  .ltc-footer {
    width: 100%;
    margin: 0;
    padding: 30px 0 12px;
    background: var(--footer-green);
    color: white;
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
    margin: 0;
    color: white;
    font-size: 20px;
    line-height: 1.2;
    font-weight: 900;
    text-transform: uppercase;
  }

  .ltc-footer h5 {
    margin: 0 0 10px;
    color: #f4d484;
    font-size: 12px;
    line-height: 1.2;
    font-weight: 900;
    text-transform: uppercase;
    letter-spacing: .14em;
  }

  .ltc-footer p,
  .ltc-footer-link {
    display: block;
    margin: 5px 0;
    color: rgba(255,255,255,.68);
    font-size: 13px;
    line-height: 1.55;
  }

  .ltc-footer-small-text {
    margin: 4px 0 !important;
    font-size: 12px !important;
    line-height: 1.42 !important;
  }

  .ltc-footer-small-text strong {
    font-size: 12px !important;
    line-height: 1.42 !important;
  }

  .ltc-footer-link {
    width: auto;
    min-height: 0;
    border: 0;
    padding: 0;
    background: transparent;
    text-align: left;
    cursor: pointer;
  }

  .ltc-footer-link:hover,
  .ltc-footer-link:focus-visible {
    color: white;
    text-decoration: underline;
  }

  .ltc-facebook-link {
    width: 34px;
    height: 34px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    margin-top: 6px;
    border: 1px solid rgba(255,255,255,.16);
    border-radius: 999px;
    background: rgba(255,255,255,.10);
    color: white;
    cursor: pointer;
    transition: .25s var(--ease);
  }

  .ltc-facebook-link:hover,
  .ltc-facebook-link:focus-visible {
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
    .ltc-payment-grid {
      grid-template-columns: 1fr;
    }

    .ltc-footer-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
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
      grid-template-columns: 1fr;
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


function getApiBase() {
  const raw = (
    import.meta.env.VITE_HOTEL_API_BASE ||
    import.meta.env.VITE_API_BASE ||
    import.meta.env.VITE_API_URL ||
    "http://localhost:5000"
  ).replace(/\/+$/, "");

  if (raw.endsWith("/api/hotel")) return raw;
  if (raw.endsWith("/api")) return `${raw}/hotel`;
  if (raw.includes("/api/hotel")) return raw;

  return `${raw}/api/hotel`;
}

function formatPeso(value) {
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

function formatArray(value) {
  return Array.isArray(value) ? value.join(", ") : value || "";
}

function getSavedDraft() {
  try {
    return JSON.parse(sessionStorage.getItem("eventBookingDraft") || "null");
  } catch {
    return null;
  }
}

export default function EventSummary() {
  const navigate = useNavigate();
  const { state } = useLocation();

  const API_BASE = useMemo(() => getApiBase(), []);
  const bookingData = state || getSavedDraft();

  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: "", message: "" });
  const [paymentMethod, setPaymentMethod] = useState("");
  const [isDownPayment, setIsDownPayment] = useState(false);
  const [proofFile, setProofFile] = useState(null);
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [policyAccepted, setPolicyAccepted] = useState(false);
  const [policyOpen, setPolicyOpen] = useState(false);

  const fullTotalAmount = Number(bookingData?.totalAmount || bookingData?.price || 0);
  const amountToPay = isDownPayment ? Math.ceil(fullTotalAmount / 2) : fullTotalAmount;
  const balanceAmount = isDownPayment ? fullTotalAmount - amountToPay : 0;

  const goToProfile = () => {
    const token = localStorage.getItem("token") || localStorage.getItem("hotelToken");
    navigate(token ? "/hotel-profile" : "/hotel-login");
  };

  const statusClass =
    status.type === "success"
      ? "ltc-status-success"
      : status.type === "error"
      ? "ltc-status-error"
      : "ltc-status-info";

  const handleProofChange = (event) => {
    const file = event.target.files?.[0] || null;

    if (!file) {
      setProofFile(null);
      return;
    }

    const allowed = ["image/jpeg", "image/jpg", "image/png", "application/pdf"];

    if (!allowed.includes(file.type)) {
      setStatus({ type: "error", message: "Only JPG, PNG, or PDF files are allowed." });
      setProofFile(null);
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setStatus({ type: "error", message: "File size must not exceed 5MB." });
      setProofFile(null);
      return;
    }

    setStatus({ type: "", message: "" });
    setProofFile(file);
  };

  const submitBooking = async () => {
    setSubmitAttempted(true);
    setStatus({ type: "", message: "" });

    if (!policyAccepted) {
      setStatus({
        type: "error",
        message: "Please agree to the LUMISPIRE Event Package Booking Policy before submitting.",
      });
      return;
    }

    if (!paymentMethod) {
      setStatus({ type: "error", message: "Please select a payment method by clicking a QR card." });
      return;
    }

    if (!proofFile) {
      setStatus({ type: "error", message: "Please upload proof of payment." });
      return;
    }

    const token = localStorage.getItem("token") || localStorage.getItem("hotelToken");
    if (!token) {
      navigate("/hotel-login");
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("serviceType", "Event Package");
      formData.append("packageId", bookingData.packageId || bookingData.selectedPackageId || "");
      formData.append("variantId", bookingData.variantId || bookingData.selectedVariantId || "");
      formData.append("selectedVariantId", bookingData.selectedVariantId || bookingData.variantId || "");
      formData.append("selectedVariantLabel", bookingData.selectedVariantLabel || "");
      formData.append("timeVariationLabel", bookingData.timeVariationLabel || "");
      formData.append("eventPackage", bookingData.eventPackage || bookingData.selectedPackageTitle || "");
      formData.append("eventDate", bookingData.eventDate || "");
      formData.append("venue", bookingData.venue || "");
      formData.append("time", bookingData.time || "");
      formData.append("basePax", String(bookingData.basePax || ""));
      formData.append("pax", String(bookingData.pax || ""));
      formData.append("venueCapacity", String(bookingData.venueCapacity || ""));
      formData.append("additionalPax", String(bookingData.additionalPax || 0));
      formData.append("additionalPaxRate", String(bookingData.additionalPaxRate || 500));
      formData.append("baseAmount", String(bookingData.baseAmount || 0));
      formData.append("additionalPaxCharge", String(bookingData.additionalPaxCharge || 0));
      formData.append("eventTheme", bookingData.eventTheme || "");
      formData.append("eventType", bookingData.eventType || "");
      formData.append("foodAllergy", bookingData.foodAllergy || "");
      formData.append("specialRequest", bookingData.specialRequest || "");
      formData.append("appetizer", formatArray(bookingData.appetizer));
      formData.append("mainDish", formatArray(bookingData.mainDish));
      formData.append("dessert", formatArray(bookingData.dessert));
      formData.append("drinks", formatArray(bookingData.drinks));
      formData.append("price", String(fullTotalAmount));
      formData.append("totalAmount", String(fullTotalAmount));
      formData.append("amountToPay", String(amountToPay));
      formData.append("paidAmount", String(amountToPay));
      formData.append("balanceAmount", String(balanceAmount));
      formData.append("paymentTerm", isDownPayment ? "DOWN_PAYMENT" : "FULL_PAYMENT");
      formData.append(
        "paymentStatus",
        isDownPayment ? "PARTIALLY_PAID" : "FULLY_PAID"
      );
      formData.append("paymentMethod", paymentMethod);
      formData.append("proof", proofFile);

      const response = await fetch(`${API_BASE}/event-bookings`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await response.json().catch(() => ({}));

      if (response.status === 401 || response.status === 403) {
        localStorage.removeItem("token");
        localStorage.removeItem("hotelToken");
        navigate("/hotel-login");
        return;
      }

      if (!response.ok) {
        throw new Error(data.message || "Failed to submit event booking.");
      }

      sessionStorage.removeItem("eventBookingDraft");
      setStatus({ type: "success", message: data.message || "Event booking submitted successfully." });

      setTimeout(() => {
        navigate("/booking-successful", {
          state: {
            serviceType: "Event Package",
            booking: bookingData,
            amountPaid: amountToPay,
            totalAmount: fullTotalAmount,
            paymentTerm: isDownPayment ? "Down Payment" : "Full Payment",
            paymentMethod,
          },
        });
      }, 1000);
    } catch (error) {
      console.error("submit event booking error:", error);
      setStatus({ type: "error", message: error.message || "Failed to submit event booking." });
    } finally {
      setLoading(false);
    }
  };

  if (!bookingData) {
    return (
      <div className="ltc-resort-summary-page" style={fontPontano}>
        <style>{pageStyles}</style>

        <Header
          navigate={navigate}
          goToProfile={goToProfile}
          openMenu={() => setIsOpen(true)}
        />

        <main>
          <section className="ltc-hero">
            <img
              src={HERO_IMAGES[0]}
              alt="Event booking background"
              className="ltc-hero-slide"
              onError={(event) => {
                event.currentTarget.style.display = "none";
              }}
            />

            <div className="ltc-container ltc-hero-content">
              <span className="ltc-eyebrow" style={fontMontserrat}>
                Event Package Booking
              </span>

              <h1 className="ltc-hero-title" style={fontMontserrat}>
                No <span>Booking Data</span>
              </h1>

              <p className="ltc-hero-text" style={fontPontano}>
                Please complete the event booking form first before reviewing your summary.
              </p>
            </div>
          </section>

          <section className="ltc-section">
            <div className="ltc-container">
              <div className="ltc-form-shell" style={{ textAlign: "center" }}>
                <h2 className="ltc-section-heading" style={fontMontserrat}>
                  No Booking Data Found
                </h2>

                <p
                  className="ltc-info-box"
                  style={{ ...fontPoppins, maxWidth: 560, marginLeft: "auto", marginRight: "auto" }}
                >
                  Please complete the booking form first.
                </p>

                <div className="ltc-actions">
                  <button
                    onClick={() => navigate("/event-form")}
                    type="button"
                    className="ltc-primary-button"
                    style={fontMontserrat}
                  >
                    Back to Form
                  </button>
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

      </div>
    );
  }

  return (
    <div className="ltc-resort-summary-page" style={fontPontano}>
      <style>{pageStyles}</style>

      <Header
        navigate={navigate}
        goToProfile={goToProfile}
        openMenu={() => setIsOpen(true)}
      />

      <main>
        <section className="ltc-hero">
          <img
            src={HERO_IMAGES[0]}
            alt="Event booking background"
            className="ltc-hero-slide"
            onError={(event) => {
              event.currentTarget.style.display = "none";
            }}
          />

          <div className="ltc-container ltc-hero-content">
            <span className="ltc-eyebrow" style={fontMontserrat}>
              Event Package Booking
            </span>

            <h1 className="ltc-hero-title" style={fontMontserrat}>
              Event Booking <span>Summary</span>
            </h1>

            <p className="ltc-hero-text" style={fontPontano}>
              Review your event package details, choose your payment option,
              and upload your proof of payment before submitting.
            </p>
          </div>
        </section>

        <section className="ltc-section">
          <div className="ltc-container">
            <div className="ltc-form-shell">
              <SummarySection title="Personal Information">
                <ReadOnlyField label="First Name" value={bookingData.firstName} />
                <ReadOnlyField label="Last Name" value={bookingData.lastName} />
                <ReadOnlyField label="Email" value={bookingData.email} />
                <ReadOnlyField label="Phone Number" value={bookingData.phone} />
              </SummarySection>

              <section className="ltc-summary-section">
                <div className="ltc-booking-header">
                  <div>
                    <h2 className="ltc-section-heading" style={fontMontserrat}>
                      Booking Details
                    </h2>
                    <div className="ltc-section-line" />
                  </div>

                  <input
                    value="Event Package"
                    disabled
                    readOnly
                    className="ltc-service-pill"
                    style={fontPoppins}
                  />
                </div>

                <div className="ltc-fields-grid">
                  <ReadOnlyField label="Package" value={bookingData.eventPackage || bookingData.selectedPackageTitle} />
                  <ReadOnlyField label="Venue" value={bookingData.venueDisplayName || bookingData.venue} />
                  <ReadOnlyField label="Date" value={formatDateMMDDYYYY(bookingData.eventDate)} />
                  <ReadOnlyField label="Time" value={bookingData.time} />
                  <ReadOnlyField label="Time Variation" value={bookingData.timeVariationLabel || "8 Hours"} />
                  <ReadOnlyField label="Package Capacity" value={`${bookingData.basePax || ""} Pax`} />
                  <ReadOnlyField label="Actual Pax" value={`${bookingData.pax || ""} Pax`} />
                  <ReadOnlyField label="Event Type" value={bookingData.eventType} />
                  <ReadOnlyField label="Event Theme" value={bookingData.eventTheme} />
                  <ReadOnlyField label="Food Allergy" value={bookingData.foodAllergy || "None"} />
                  <ReadOnlyField label="Special Request" value={bookingData.specialRequest || "None"} />
                  <ReadOnlyField label="Extra Pax Charge" value={formatPeso(bookingData.additionalPaxCharge)} />
                </div>
              </section>

              <SummarySection title="Food Menu Choices">
                <ReadOnlyField label="Appetizer / Soup" value={formatArray(bookingData.appetizer)} />
                <ReadOnlyField label="Main Dish" value={formatArray(bookingData.mainDish)} full multiline />
                <ReadOnlyField label="Dessert" value={formatArray(bookingData.dessert)} />
                <ReadOnlyField label="Drinks" value={formatArray(bookingData.drinks)} />
              </SummarySection>

              <PaymentSection
                paymentMethod={paymentMethod}
                setPaymentMethod={(value) => {
                  setPaymentMethod(value);
                  setStatus({ type: "", message: "" });
                }}
                isDownPayment={isDownPayment}
                setIsDownPayment={setIsDownPayment}
                proofFile={proofFile}
                handleProofChange={handleProofChange}
                submitAttempted={submitAttempted}
              />

              <div className="ltc-price-card">
                <div className="ltc-price-row">
                  <p className="ltc-price-label" style={fontMontserrat}>
                    Total Amount:
                  </p>

                  <p className="ltc-price-value" style={fontMontserrat}>
                    {formatPeso(amountToPay)}
                  </p>
                </div>

                <div className="ltc-price-breakdown" style={fontPoppins}>
                  <p>Payment type: {isDownPayment ? "Down payment" : "Full payment"}</p>
                  <p>Amount to pay: {formatPeso(amountToPay)}</p>
                  <p>Total balance: {formatPeso(balanceAmount)}</p>
                </div>
              </div>

              <PolicyAgreement
                accepted={policyAccepted}
                onAcceptedChange={(value) => {
                  setPolicyAccepted(value);
                  if (value) setStatus({ type: "", message: "" });
                }}
                onOpen={() => setPolicyOpen(true)}
              />

              {status.message ? (
                <div className={`ltc-status ${statusClass}`} style={fontPoppins}>
                  {status.type === "error" ? (
                    <p style={{ ...fontMontserrat, margin: "0 0 4px" }}>
                      Please fix this before submitting
                    </p>
                  ) : null}
                  <p style={{ margin: 0 }}>{status.message}</p>
                </div>
              ) : null}

              <div className="ltc-actions">
                <button
                  onClick={submitBooking}
                  disabled={loading || !policyAccepted}
                  type="button"
                  className="ltc-primary-button"
                  style={fontMontserrat}
                >
                  {loading ? "Submitting..." : "Submit Booking"}
                </button>

                <button
                  onClick={() => navigate("/event-form", { state: bookingData })}
                  disabled={loading}
                  type="button"
                  className="ltc-secondary-button"
                  style={fontMontserrat}
                >
                  Cancel
                </button>
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

      
      {policyOpen ? (
        <EventPackageBookingPolicyModal
          onClose={() => setPolicyOpen(false)}
          onAgree={() => {
            setPolicyAccepted(true);
            setPolicyOpen(false);
            setStatus({ type: "", message: "" });
          }}
        />
      ) : null}

    </div>
  );
}

function PolicyAgreement({ accepted, onAcceptedChange, onOpen }) {
  return (
    <label className="ltc-policy-agreement" style={fontPoppins}>
      <input
        type="checkbox"
        checked={accepted}
        onChange={(event) => onAcceptedChange(event.target.checked)}
      />

      <p className="ltc-policy-agreement-text">
        I have read and agree to the{" "}
        <button
          type="button"
          className="ltc-policy-link"
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            onOpen();
          }}
        >
          LUMISPIRE Event Package Booking Policy
        </button>
        .
      </p>
    </label>
  );
}

function EventPackageBookingPolicyModal({ onClose, onAgree }) {
  return (
    <div className="ltc-policy-modal-shell">
      <div className="ltc-policy-modal-backdrop" onClick={onClose} />

      <div
        className="ltc-policy-modal-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="event-package-policy-title"
      >
        <div className="ltc-policy-modal-header">
          <div>
            <p className="ltc-policy-modal-eyebrow" style={fontMontserrat}>
              LUMISPIRE Hotel & Resort Services of LTC Group
            </p>

            <h2
              id="event-package-policy-title"
              className="ltc-policy-modal-title"
              style={fontMontserrat}
            >
              Event Package Booking Policy
            </h2>

            <p className="ltc-policy-modal-meta" style={fontPoppins}>
              Effective Date: September 2026 · Last Updated: 2026
            </p>
          </div>

          <button
            type="button"
            className="ltc-policy-modal-close"
            aria-label="Close booking policy"
            onClick={onClose}
          >
            ✕
          </button>
        </div>

        <div className="ltc-policy-modal-body">
          <p className="ltc-policy-intro" style={fontPontano}>
            Welcome to LUMISPIRE Hotel & Resort Services of LTC Group. This Event Package Booking
            Policy governs event package reservations, venue arrangements, guest information,
            payments, cancellations, modifications, and related services booked through LUMISPIRE.
            By submitting an Event Package reservation, you acknowledge that you have read,
            understood, and agreed to this Booking Policy.
          </p>

          {EVENT_PACKAGE_POLICY_SECTIONS.map((section) => (
            <PolicySection key={section.title} section={section} />
          ))}

          <p className="ltc-policy-final" style={fontPontano}>
            By completing an Event Package reservation through LUMISPIRE, you confirm that you have
            read, understood, and agreed to this Event Package Booking Policy.
          </p>
        </div>

        <div className="ltc-policy-modal-footer">
          <button
            type="button"
            className="ltc-primary-button"
            onClick={onAgree}
            style={fontMontserrat}
          >
            I Agree
          </button>
        </div>
      </div>
    </div>
  );
}

function PolicySection({ section }) {
  return (
    <section className="ltc-policy-section">
      <h4 style={fontMontserrat}>{section.title}</h4>

      {section.paragraphs?.map((paragraph, index) => (
        <p key={`p-${index}`} style={fontPontano}>
          {paragraph}
        </p>
      ))}

      {section.bullets?.length ? (
        <ul style={fontPontano}>
          {section.bullets.map((item, index) => (
            <li key={`b-${index}`}>{item}</li>
          ))}
        </ul>
      ) : null}

      {section.subsections?.map((subsection, index) => (
        <div key={`s-${index}`}>
          <h5 style={fontMontserrat}>{subsection.title}</h5>

          {subsection.text ? (
            <p style={fontPontano}>
              <strong>{subsection.text}</strong>
            </p>
          ) : null}

          {subsection.bullets?.length ? (
            <ul style={fontPontano}>
              {subsection.bullets.map((item, bulletIndex) => (
                <li key={`sb-${bulletIndex}`}>{item}</li>
              ))}
            </ul>
          ) : null}
        </div>
      ))}

      {section.after?.map((paragraph, index) => (
        <p key={`a-${index}`} style={fontPontano}>
          {paragraph}
        </p>
      ))}

      {section.contact?.length ? (
        <div className="ltc-policy-contact" style={fontPontano}>
          {section.contact.map(([label, value]) => (
            <span key={label}>
              <strong>{label}:</strong> {value}
            </span>
          ))}
        </div>
      ) : null}
    </section>
  );
}

function PaymentSection({
  paymentMethod,
  setPaymentMethod,
  isDownPayment,
  setIsDownPayment,
  proofFile,
  handleProofChange,
  submitAttempted,
}) {
  const showPaymentMethodError = submitAttempted && !paymentMethod;
  const showProofFileError = submitAttempted && !proofFile;

  return (
    <section className="ltc-payment-section">
      <div className="ltc-booking-header">
        <div>
          <h2 className="ltc-section-heading" style={fontMontserrat}>
            Payment Method
          </h2>
          <div className="ltc-section-line" />
        </div>
      </div>

      <div className="ltc-info-box" style={fontPoppins}>
        <label style={{ display: "flex", alignItems: "center", gap: 10, fontWeight: 900 }}>
          <input
            type="checkbox"
            checked={isDownPayment}
            onChange={(event) => setIsDownPayment(event.target.checked)}
            style={{ accentColor: "#174a30", width: 16, height: 16 }}
          />
          Down payment only 50%
        </label>
        <p>Leave unchecked for full payment.</p>
      </div>

      <p className="ltc-help-text" style={{ ...fontPoppins, marginTop: 20 }}>
        Click a QR card below to select and reveal the payment QR image.
      </p>

      {showPaymentMethodError ? (
        <p className="ltc-error-text" style={{ ...fontPoppins, marginTop: 12 }}>
          Please select a payment method by clicking a QR card.
        </p>
      ) : null}

      <div className="ltc-payment-grid">
        <QrImageCard
          title="Bank Transfer QR"
          method="BANK TRANSFER"
          src={BANK_QR_IMAGE}
          selected={paymentMethod === "BANK TRANSFER"}
          visible={paymentMethod === "BANK TRANSFER"}
          placeholderClassName="ltc-qr-placeholder-bank"
          hasValidationError={showPaymentMethodError}
          onSelect={setPaymentMethod}
        />

        <QrImageCard
          title="GCASH QR"
          method="GCASH"
          src={GCASH_QR_IMAGE}
          selected={paymentMethod === "GCASH"}
          visible={paymentMethod === "GCASH"}
          placeholderClassName="ltc-qr-placeholder-gcash"
          hasValidationError={showPaymentMethodError}
          onSelect={setPaymentMethod}
        />
      </div>

      <div style={{ marginTop: 24 }}>
        <FileField
          label="Upload Proof of Payment"
          file={proofFile}
          onChange={handleProofChange}
          showError={showProofFileError}
        />
      </div>
    </section>
  );
}

function QrImageCard({
  title,
  method,
  src,
  selected,
  visible,
  placeholderClassName,
  hasValidationError,
  onSelect,
}) {
  const [hasError, setHasError] = useState(false);

  return (
    <button
      type="button"
      onClick={() => onSelect(method)}
      className={`ltc-qr-card ${selected ? "selected" : ""} ${
        hasValidationError ? "error" : ""
      }`}
    >
      {selected ? (
        <span className="ltc-selected-badge">Selected</span>
      ) : null}

      <div className="ltc-qr-frame">
        {visible ? (
          !hasError ? (
            <img
              src={src}
              alt={title}
              onError={() => setHasError(true)}
            />
          ) : (
            <div style={{ padding: 18, textAlign: "center" }}>
              <p style={{ ...fontMontserrat, margin: 0, color: "#174a30", fontWeight: 900 }}>
                {title}
              </p>
              <p style={{ ...fontPoppins, margin: "4px 0 0", color: "#667085", fontSize: 12 }}>
                Add image in public folder.
              </p>
            </div>
          )
        ) : (
          <div className={`ltc-qr-placeholder ${placeholderClassName || ""}`}>
            <div>
              <p style={{ margin: 0 }}>{method}</p>
              <p style={{ margin: "6px 0 0", fontSize: 11, opacity: 0.82 }}>
                Click this QR card to reveal QR
              </p>
            </div>
          </div>
        )}
      </div>

      <p className="ltc-qr-title" style={fontMontserrat}>
        {visible ? title : `${title} Hidden`}
      </p>
    </button>
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

function SummarySection({ title, children }) {
  return (
    <section className="ltc-summary-section">
      <h2 className="ltc-section-heading" style={fontMontserrat}>
        {title}
      </h2>
      <div className="ltc-section-line" />

      <div className="ltc-fields-grid">{children}</div>
    </section>
  );
}

function ReadOnlyField({ label, value, full = false, multiline = false }) {
  const safeValue = value ?? "";
  const shouldUseMultiline = multiline || String(safeValue).length > 55;

  return (
    <div className={`ltc-field ${full || shouldUseMultiline ? "ltc-field-full" : ""}`}>
      <label style={fontMontserrat}>{label}</label>

      {shouldUseMultiline ? (
        <textarea
          readOnly
          value={safeValue}
          placeholder="—"
          rows={3}
          className="ltc-readonly-textarea"
          style={fontPoppins}
        />
      ) : (
        <input
          readOnly
          value={safeValue}
          placeholder="—"
          className="ltc-input"
          style={fontPoppins}
        />
      )}
    </div>
  );
}

function FileField({ label, file, onChange, showError }) {
  return (
    <div className="ltc-field">
      <label style={fontMontserrat}>{label}</label>

      <input
        type="file"
        accept="image/*,.pdf"
        onChange={onChange}
        aria-invalid={showError ? "true" : "false"}
        className="ltc-file-input"
        style={fontPoppins}
      />

      {showError ? (
        <p className="ltc-error-text" style={fontPoppins}>
          Please upload proof of payment.
        </p>
      ) : (
        <p className="ltc-help-text" style={fontPoppins}>
          {file ? file.name : "Accepted: JPG, PNG, PDF. Max 5MB."}
        </p>
      )}
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
              width="42"
              height="42"
              loading="lazy"
              decoding="async"
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
          label={
            localStorage.getItem("token") || localStorage.getItem("hotelToken")
              ? "PROFILE"
              : "SIGN IN"
          }
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
