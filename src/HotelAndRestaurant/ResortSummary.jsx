import React, { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const BANK_QR_IMAGE = "/QRImage.jpg";
const GCASH_QR_IMAGE = "/QRImage.jpg";
const HOTEL_LOGO = "/HotelLogo.png";
const LUMISPIRE_LOGO = "/HotelLumispireLogo.png";
const HERO_IMAGES = ["/HotelLanding1.png", "/HotelLanding2.png"];

const fontMontserrat = { fontFamily: "'Montserrat', sans-serif" };
const fontPontano = { fontFamily: "'Pontano Sans', sans-serif" };
const fontPoppins = { fontFamily: "'Poppins', sans-serif" };

const RESORT_BOOKING_POLICY_TEXT = `# 1. LUMISPIRE RESORT BOOKING POLICY

For HotelResortBookingBookingForm

**Effective Date:** September 2026
**Last Updated:** 2026

Welcome to **LUMISPIRE Hotel & Resort Services of LTC Group**. This Resort Booking Policy outlines the terms and conditions governing resort reservations, payments, cancellations, modifications, venue use, and other booking-related matters when using LUMISPIRE.
By making a resort reservation through LUMISPIRE, you acknowledge that you have read, understood, and agreed to the policies stated below.

---

## 1. Reservation and Booking Process

Guests may make resort reservations through the LUMISPIRE platform by providing the required information, which may include:

- Full name of guest or booking representative
- Contact information
- Email address
- Reservation date
- Check-in and check-out details, when applicable
- Number of guests
- Selected resort accommodation or facility
- Selected amenities or services
- Additional requests or special requirements

All information provided must be accurate, complete, and updated.
Guests are responsible for reviewing all reservation details before submitting the booking.
A reservation will only be considered confirmed once the required booking process has been completed and any applicable payment has been submitted, verified, and approved.

---

## 2. Guest Information Requirements

Guests may be required to provide valid identification and other necessary information for reservation verification, security, guest management, and service delivery.
The resort may verify submitted guest and booking information before confirming a reservation.
Personal information collected during the booking process will be handled in accordance with the **LUMISPIRE Hotel & Resort Privacy Policy** and applicable Philippine data privacy laws.

---

## 3. Resort Availability and Booking Confirmation

All resort reservations are subject to availability at the time of booking.
LTC Group Hotel & Resort Services reserves the right to:

- Confirm or decline reservations based on availability
- Correct errors in booking details or pricing
- Update available dates, accommodations, amenities, and services
- Request additional information before approving a reservation
- Reschedule a booking when reasonably required by operational circumstances

Guests will receive confirmation through their registered email address, contact information, or LUMISPIRE notification when available.
Submission of a booking request does not automatically mean that the reservation has been approved.

---

## 4. Check-in and Check-out Policy

### Check-in Time:

**[Insert Time]**

### Check-out Time:

**[Insert Time]**
Guests must present required identification and booking confirmation upon arrival when requested.
Early check-in or late check-out requests are subject to availability and approval and may involve additional charges.
Guests who remain beyond the approved reservation period may be charged additional fees.

---

## 5. Payment Policy

Guests may be required to complete full or partial payment to secure their resort reservation.

### GCash Payment

Guests may make payments through the officially designated GCash account.
Guests must:

- Send payment only to the officially provided GCash account
- Verify the recipient details before completing payment
- Upload or submit valid proof of payment
- Provide the correct reference number and amount
- Ensure that the proof of payment is readable and authentic

### Bank Transfer Payment

Guests may also make payments through the authorized bank account provided by LTC Group Hotel & Resort Services.
Guests must:

- Transfer payment only to the officially provided bank account
- Submit valid proof of successful transfer
- Provide accurate transaction information
- Wait for payment verification before considering the reservation confirmed

All payments are subject to verification.
Failure to complete the required payment within the specified period may result in the booking being cancelled or released to other guests.
LTC Group shall not be responsible for payments sent to unauthorized accounts or incorrect recipients.

---

## 6. Cancellation and Modification Policy

Guests may request cancellation or modification of their resort reservation through:

- LUMISPIRE
- Official Hotel & Resort communication channels

Cancellation and modification conditions may depend on:

- Reservation date
- Accommodation or facility selected
- Promotional conditions
- Payment status
- Notice period
- Availability

Changes to reservation dates, guest count, accommodations, facilities, or services are subject to availability and approval.

---

## 7. Refund Policy

Refund requests may be considered depending on the applicable cancellation and payment conditions.
Approved refunds may be returned through the original payment method, subject to verification and processing requirements.
Guests who paid through GCash or bank transfer must provide complete and accurate transaction information.
Processing time may vary depending on the payment method and verification process.
Approval of a refund is not automatic unless required by applicable law or specifically provided under an applicable booking condition.

---

## 8. No-Show Policy

A no-show occurs when a guest fails to arrive on the scheduled reservation date without prior notice.
In the event of a no-show:

- The reservation may be cancelled
- Advance payments or deposits may be forfeited subject to applicable policy
- Reserved facilities or accommodations may be released
- Future booking arrangements may be affected

Guests should contact Hotel & Resort Services as soon as possible if they are unable to arrive as scheduled.

---

## 9. Early Departure Policy

Guests who leave the resort before their scheduled departure may remain responsible for applicable booking charges.
Refunds for unused accommodations, amenities, or services are not guaranteed and will depend on the approved refund and cancellation conditions.

---

## 10. Special Requests

Guests may submit special requests such as:

- Preferred accommodation arrangements
- Additional amenities
- Accessibility requirements
- Celebration arrangements
- Event setup requests
- Additional tables, chairs, or equipment when available
- Other reasonable service preferences

All requests are subject to availability, approval, and possible additional charges.

---

## 11. Guest Responsibilities

Guests agree to:

- Provide accurate booking information
- Observe resort rules and safety requirements
- Respect other guests, employees, facilities, and property
- Maintain cleanliness and proper conduct
- Pay applicable charges
- Take responsibility for damages caused by themselves or persons included in their booking
- Follow capacity and facility-use restrictions
- Avoid illegal, dangerous, disruptive, or prohibited activities

LTC Group reserves the right to refuse or discontinue service when there is misconduct, illegal activity, serious safety risk, property damage, or substantial violation of resort policies.

---

## 12. Children and Additional Guests Policy

The correct number of guests must be declared during booking.
Children, additional guests, and visitors may be subject to applicable capacity restrictions and additional charges.
Guests must not exceed the approved capacity of the accommodation, venue, or resort facility.

---

## 13. Promotions and Special Offers

Promotional packages and discounts may have specific conditions including:

- Limited booking periods
- Limited availability
- Specific dates
- Required advance payment
- Non-transferable reservations
- Restrictions on cancellation or modification

Promotions may not be combined unless expressly permitted.

---

## 14. Force Majeure

LTC Group shall not be held responsible for delays, cancellations, or inability to provide resort services because of circumstances beyond reasonable control, including:

- Typhoons and severe weather
- Flooding
- Earthquakes and natural disasters
- Government restrictions
- Public emergencies
- Utility interruptions
- Other unforeseen events

Reasonable efforts will be made to assist affected guests when possible.

---

## 15. Privacy and Data Protection

Personal information collected during resort bookings may be used for:

- Reservation processing
- Guest verification
- Payment verification
- Service delivery
- Guest communication
- Security
- Record management

Information will be processed in accordance with the **LUMISPIRE Hotel & Resort Privacy Policy** and applicable Philippine data privacy laws.

---

## 16. Policy Updates

LTC Group may modify this Resort Booking Policy when necessary due to operational, service, technological, legal, or regulatory changes.
Updated policies may be provided through LUMISPIRE or official Hotel & Resort communication channels.

---

## 17. Contact Information

For resort reservations, payments, modifications, cancellations, or other concerns:
**Service:** LTC Group – Hotel & Resort Services
**Resort Location:** Patio de Lorenzo, CXRC+76G, Bacoor, Cavite
**Email:** lorenzoeventandvenue@gmail.com
**Contact Numbers:** 09338699988 / 09064191405

**By completing a resort reservation through LUMISPIRE, you confirm that you have read, understood, and agreed to this Resort Booking Policy.**`;

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
    width: min(1040px, 100%);
    margin: 0 auto;
    border-radius: 22px;
    background: var(--glass);
    border: 1px solid rgba(255,255,255,.76);
    box-shadow: var(--shadow-md);
    backdrop-filter: blur(18px);
    padding: 24px 26px;
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
    margin-top: 24px;
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
    margin-top: 8px;
    width: 150px;
    height: 3px;
    border-radius: 999px;
    background: linear-gradient(90deg,var(--green-700),var(--gold));
  }

  .ltc-fields-grid {
    margin-top: 18px;
    display: grid;
    grid-template-columns: repeat(3, minmax(0,1fr));
    gap: 14px 18px;
  }

  .ltc-booking-header {
    margin-bottom: 18px;
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
    min-height: 46px;
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

  .ltc-policy-consent {
    margin-top: 18px;
    border: 1px solid rgba(35,95,62,.14);
    border-radius: 16px;
    background: rgba(35,95,62,.055);
    padding: 13px 15px;
  }

  .ltc-policy-consent.error {
    border-color: rgba(239,68,68,.5);
    background: rgba(239,68,68,.055);
  }

  .ltc-policy-consent-row {
    display: flex;
    align-items: flex-start;
    gap: 10px;
  }

  .ltc-policy-checkbox {
    width: 18px;
    height: 18px;
    min-width: 18px;
    margin: 2px 0 0;
    accent-color: var(--green-800);
    cursor: pointer;
  }

  .ltc-policy-consent-text {
    color: #475467;
    font-size: 12px;
    line-height: 1.55;
    font-weight: 700;
  }

  .ltc-policy-consent-text label {
    cursor: pointer;
  }

  .ltc-policy-link {
    border: 0;
    background: transparent;
    padding: 0;
    color: var(--green-800);
    font: inherit;
    font-weight: 900;
    text-decoration: underline;
    text-underline-offset: 3px;
    cursor: pointer;
  }

  .ltc-policy-link:hover {
    color: var(--green-950);
  }

  .ltc-policy-consent-error {
    margin: 6px 0 0 28px;
    color: #b42318;
    font-size: 11px;
    line-height: 1.45;
    font-weight: 800;
  }

  .ltc-policy-modal-overlay {
    position: fixed;
    inset: 0;
    z-index: 1000;
    display: grid;
    place-items: center;
    padding: 20px;
    background: rgba(2,18,11,.72);
    backdrop-filter: blur(7px);
  }

  .ltc-policy-modal {
    width: min(860px, 100%);
    max-height: 86vh;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    border-radius: 22px;
    border: 1px solid rgba(255,255,255,.65);
    background: white;
    box-shadow: 0 34px 90px rgba(0,0,0,.34);
  }

  .ltc-policy-modal-header {
    flex: 0 0 auto;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    padding: 16px 18px;
    color: white;
    background: linear-gradient(135deg,var(--green-950),var(--green-800));
    border-bottom: 3px solid var(--gold);
  }

  .ltc-policy-modal-kicker {
    margin: 0 0 3px;
    color: var(--gold-soft);
    font-size: 10px;
    font-weight: 900;
    letter-spacing: .16em;
    text-transform: uppercase;
  }

  .ltc-policy-modal-title {
    margin: 0;
    color: white;
    font-size: clamp(19px,2.5vw,25px);
    line-height: 1.15;
    font-weight: 900;
  }

  .ltc-policy-modal-close {
    width: 40px;
    height: 40px;
    min-width: 40px;
    border: 1px solid rgba(255,255,255,.18);
    border-radius: 999px;
    background: rgba(255,255,255,.1);
    color: white;
    font-size: 23px;
    line-height: 1;
    cursor: pointer;
  }

  .ltc-policy-modal-body {
    min-height: 0;
    flex: 1;
    overflow-y: auto;
    padding: 24px 28px 30px;
    background: white;
  }

  .ltc-policy-document {
    width: min(740px,100%);
    margin: 0 auto;
    color: #25352d;
    font-size: 13px;
    line-height: 1.68;
  }

  .ltc-policy-document h1 {
    margin: 0 0 14px;
    color: var(--green-950);
    font-size: clamp(23px,3vw,30px);
    line-height: 1.15;
    font-weight: 900;
  }

  .ltc-policy-document h2 {
    margin: 22px 0 8px;
    color: var(--green-800);
    font-size: 17px;
    line-height: 1.3;
    font-weight: 900;
  }

  .ltc-policy-document h3 {
    margin: 16px 0 7px;
    color: var(--green-900);
    font-size: 14px;
    line-height: 1.35;
    font-weight: 900;
  }

  .ltc-policy-document p {
    margin: 0 0 10px;
  }

  .ltc-policy-document strong {
    color: #13281d;
    font-weight: 900;
  }

  .ltc-policy-document ul {
    margin: 4px 0 14px;
    padding-left: 22px;
  }

  .ltc-policy-document li {
    margin: 3px 0;
  }

  .ltc-policy-document li::marker {
    color: var(--green-700);
  }

  .ltc-policy-modal-footer {
    flex: 0 0 auto;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    padding: 11px 16px;
    border-top: 1px solid rgba(16,24,40,.08);
    background: #f8faf8;
  }

  .ltc-policy-modal-done {
    min-width: 108px;
    height: 40px;
    border: 0;
    border-radius: 999px;
    color: #102418;
    background: linear-gradient(135deg,#f4d484,#d7a84d);
    font-weight: 900;
    cursor: pointer;
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
    margin-top: 24px;
  }

  .ltc-payment-grid {
    margin-top: 14px;
    display: grid;
    grid-template-columns: repeat(2, minmax(0,1fr));
    gap: 18px;
  }

  .ltc-qr-placeholder {
    width: min(220px, 100%);
    aspect-ratio: 1 / 1;
    border-radius: 18px;
    display: grid;
    place-items: center;
    margin: 0 auto;
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
    padding: 14px 14px 16px;
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
    width: min(220px, 100%);
    aspect-ratio: 1 / 1;
    margin: 0 auto;
    border-radius: 18px;
    background: rgba(35,95,62,.08);
    overflow: hidden;
  }

  .ltc-qr-frame img {
    width: 100%;
    height: 100%;
    object-fit: contain;
    padding: 8px;
    background: white;
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
    margin-top: 22px;
    border-radius: 18px;
    background: white;
    border: 1px solid rgba(35,95,62,.10);
    padding: 16px 18px;
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
    font-size: clamp(19px,2.4vw,26px);
    font-weight: 900;
    letter-spacing: -.035em;
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
    margin-top: 22px;
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
      width: min(96%, 1040px);
      padding: 22px 18px;
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
      width: 96%;
      padding: 20px 16px;
    }

    .ltc-primary-button,
    .ltc-secondary-button {
      width: 100%;
    }


    .ltc-policy-modal-overlay {
      padding: 10px;
    }

    .ltc-policy-modal {
      max-height: 92vh;
      border-radius: 18px;
    }

    .ltc-policy-modal-header {
      padding: 13px 14px;
    }

    .ltc-policy-modal-body {
      padding: 20px 16px 24px;
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

function safeParseBookingDraft() {
  try {
    return JSON.parse(sessionStorage.getItem("resortBookingDraft") || "null");
  } catch {
    return null;
  }
}

export default function ResortSummary() {
  const navigate = useNavigate();
  const { state } = useLocation();

  const API_BASE = useMemo(() => getApiBase(), []);
  const bookingData = state || safeParseBookingDraft();

  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: "", message: "" });
  const [paymentMethod, setPaymentMethod] = useState("");
  const [isDownPayment, setIsDownPayment] = useState(false);
  const [proofFile, setProofFile] = useState(null);
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [agreedToBookingPolicy, setAgreedToBookingPolicy] = useState(false);
  const [policyModalOpen, setPolicyModalOpen] = useState(false);

  const fullTotalAmount = Number(
    bookingData?.price || bookingData?.totalAmount || 0
  );

  const amountToPay = isDownPayment
    ? Math.ceil(fullTotalAmount / 2)
    : fullTotalAmount;

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

    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "application/pdf"];

    if (!allowedTypes.includes(file.type)) {
      setProofFile(null);
      setStatus({
        type: "error",
        message: "Only JPG, PNG, or PDF files are allowed.",
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setProofFile(null);
      setStatus({
        type: "error",
        message: "File size must not exceed 5MB.",
      });
      return;
    }

    setStatus({ type: "", message: "" });
    setProofFile(file);
  };

  const submitBooking = async () => {
    setSubmitAttempted(true);
    setStatus({ type: "", message: "" });

    if (!agreedToBookingPolicy) {
      setStatus({
        type: "error",
        message: "Please read and agree to the Resort Booking Policy before submitting your booking.",
      });
      return;
    }

    if (!paymentMethod) {
      setStatus({
        type: "error",
        message: "Please select a payment method by clicking a QR card.",
      });
      return;
    }

    if (!proofFile) {
      setStatus({
        type: "error",
        message: "Please upload proof of payment.",
      });
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

      formData.append("serviceType", "Resort & Venue");
      formData.append(
        "packageId",
        bookingData.packageId || bookingData.selectedPackageId || ""
      );
      formData.append(
        "venue",
        bookingData.venue || bookingData.selectedPackageTitle || ""
      );
      formData.append("date", bookingData.date || "");
      formData.append(
        "category",
        bookingData.category ||
          bookingData.selectedVariantLabel ||
          bookingData.selectedDuration ||
          ""
      );
      formData.append("time", bookingData.time || "");
      formData.append(
        "pax",
        String(bookingData.pax || bookingData.totalGuests || "")
      );
      formData.append(
        "totalGuests",
        String(bookingData.totalGuests || bookingData.pax || "")
      );

      formData.append("price", String(fullTotalAmount));
      formData.append("totalAmount", String(fullTotalAmount));
      formData.append("amountToPay", String(amountToPay));
      formData.append("paidAmount", String(amountToPay));
      formData.append("balanceAmount", String(balanceAmount));
      formData.append(
        "paymentTerm",
        isDownPayment ? "DOWN_PAYMENT" : "FULL_PAYMENT"
      );
      formData.append(
        "paymentStatus",
        isDownPayment ? "PARTIALLY_PAID" : "FULLY_PAID"
      );
      formData.append("paymentMethod", paymentMethod);
      formData.append("proof", proofFile);

      const response = await fetch(`${API_BASE}/resort-bookings`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
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
        setStatus({
          type: "error",
          message: data.message || "Resort booking failed.",
        });
        return;
      }

      sessionStorage.removeItem("resortBookingDraft");

      setStatus({
        type: "success",
        message: "Submitted! Waiting for admin approval.",
      });

      setTimeout(() => {
        navigate("/booking-successful", {
          state: {
            serviceType: "Resort & Venue",
            booking: bookingData,
            amountPaid: amountToPay,
            totalAmount: fullTotalAmount,
            paymentTerm: isDownPayment ? "Down Payment" : "Full Payment",
            paymentMethod,
          },
        });
      }, 1000);
    } catch (error) {
      console.error("submit resort booking error:", error);

      setStatus({
        type: "error",
        message: "Network error. Please try again.",
      });
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
              alt="Resort booking background"
              className="ltc-hero-slide"
              onError={(event) => {
                event.currentTarget.style.display = "none";
              }}
            />

            <div className="ltc-container ltc-hero-content">
              <span className="ltc-eyebrow" style={fontMontserrat}>
                Resort & Venue Booking
              </span>

              <h1 className="ltc-hero-title" style={fontMontserrat}>
                No <span>Booking Data</span>
              </h1>

              <p className="ltc-hero-text" style={fontPontano}>
                Please complete the resort booking form first before reviewing your summary.
              </p>
            </div>
          </section>

          <section className="ltc-section">
            <div className="ltc-container">
              <div className="ltc-form-shell" style={{ textAlign: "center" }}>
                <h2 className="ltc-section-heading" style={fontMontserrat}>
                  No Booking Data Found
                </h2>

                <p className="ltc-info-box" style={{ ...fontPoppins, maxWidth: 560, marginLeft: "auto", marginRight: "auto" }}>
                  Please complete the booking form first.
                </p>

                <div className="ltc-actions">
                  <button
                    onClick={() => navigate("/resort-form")}
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
            alt="Resort booking background"
            className="ltc-hero-slide"
            onError={(event) => {
              event.currentTarget.style.display = "none";
            }}
          />

          <div className="ltc-container ltc-hero-content">
            <span className="ltc-eyebrow" style={fontMontserrat}>
              Resort & Venue Booking
            </span>

            <h1 className="ltc-hero-title" style={fontMontserrat}>
              Booking <span>Summary</span>
            </h1>

            <p className="ltc-hero-text" style={fontPontano}>
              Review your resort and venue booking details, choose your payment option,
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
                    value="Resort & Venue"
                    disabled
                    readOnly
                    className="ltc-service-pill"
                    style={fontPoppins}
                  />
                </div>

                <div className="ltc-fields-grid">
                  <ReadOnlyField
                    label="Package"
                    value={
                      bookingData.selectedPackageTitle ||
                      bookingData.selectedPackage ||
                      bookingData.venue
                    }
                  />

                  <ReadOnlyField
                    label="Venue"
                    value={bookingData.venue || bookingData.selectedVenue}
                  />

                  <ReadOnlyField
                    label="Choose Date"
                    value={formatDateMMDDYYYY(bookingData.date)}
                  />

                  <ReadOnlyField
                    label="Variation"
                    value={
                      bookingData.category ||
                      bookingData.selectedVariantLabel ||
                      bookingData.selectedDuration
                    }
                  />

                  <ReadOnlyField label="Time" value={bookingData.time} />

                  <ReadOnlyField
                    label="Number of Pax"
                    value={bookingData.pax || bookingData.totalGuests}
                  />
                </div>
              </section>

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

              <BookingPolicyConsent
                agreed={agreedToBookingPolicy}
                onChange={(checked) => {
                  setAgreedToBookingPolicy(checked);
                  setStatus({ type: "", message: "" });
                }}
                onOpen={() => setPolicyModalOpen(true)}
                showError={submitAttempted && !agreedToBookingPolicy}
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
                  disabled={loading}
                  type="button"
                  className="ltc-primary-button"
                  style={fontMontserrat}
                >
                  {loading ? "Submitting..." : "Submit Booking"}
                </button>

                <button
                  onClick={() => navigate("/resort-form", { state: bookingData })}
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

      {policyModalOpen ? (
        <BookingPolicyModal onClose={() => setPolicyModalOpen(false)} />
      ) : null}
    </div>
  );
}

function BookingPolicyConsent({ agreed, onChange, onOpen, showError }) {
  return (
    <div className={`ltc-policy-consent ${showError ? "error" : ""}`}>
      <div className="ltc-policy-consent-row" style={fontPoppins}>
        <input
          id="resort-booking-policy-consent"
          type="checkbox"
          className="ltc-policy-checkbox"
          checked={agreed}
          onChange={(event) => onChange(event.target.checked)}
          aria-required="true"
          aria-invalid={showError ? "true" : "false"}
        />

        <div className="ltc-policy-consent-text">
          <label htmlFor="resort-booking-policy-consent">
            I have read and agree to the 
          </label>
          <button type="button" className="ltc-policy-link" onClick={onOpen}>
            LUMISPIRE Resort Booking Policy
          </button>
          <span>.</span>
        </div>
      </div>

      {showError ? (
        <p className="ltc-policy-consent-error" style={fontPoppins}>
          You must agree to the Resort Booking Policy before submitting your booking.
        </p>
      ) : null}
    </div>
  );
}

function renderPolicyInline(text) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g).filter(Boolean);

  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={`${part}-${index}`}>{part.slice(2, -2)}</strong>;
    }

    return <React.Fragment key={`${part}-${index}`}>{part}</React.Fragment>;
  });
}

function ResortPolicyDocument({ content }) {
  const lines = content.split("\n");
  const elements = [];
  let listItems = [];

  const flushList = () => {
    if (!listItems.length) return;

    elements.push(
      <ul key={`resort-policy-list-${elements.length}`}>
        {listItems.map((item, index) => (
          <li key={`${item}-${index}`}>{renderPolicyInline(item)}</li>
        ))}
      </ul>
    );

    listItems = [];
  };

  lines.forEach((rawLine, index) => {
    const line = rawLine.trim();

    if (!line || line === "---") {
      flushList();
      return;
    }

    if (line.startsWith("- ")) {
      listItems.push(line.slice(2));
      return;
    }

    flushList();

    if (line.startsWith("# ")) {
      elements.push(
        <h1 key={`resort-policy-h1-${index}`} style={fontMontserrat}>
          {renderPolicyInline(line.slice(2))}
        </h1>
      );
      return;
    }

    if (line.startsWith("## ")) {
      elements.push(
        <h2 key={`resort-policy-h2-${index}`} style={fontMontserrat}>
          {renderPolicyInline(line.slice(3))}
        </h2>
      );
      return;
    }

    if (line.startsWith("### ")) {
      elements.push(
        <h3 key={`resort-policy-h3-${index}`} style={fontMontserrat}>
          {renderPolicyInline(line.slice(4))}
        </h3>
      );
      return;
    }

    elements.push(
      <p key={`resort-policy-p-${index}`} style={fontPoppins}>
        {renderPolicyInline(line)}
      </p>
    );
  });

  flushList();
  return <div className="ltc-policy-document">{elements}</div>;
}

function BookingPolicyModal({ onClose }) {
  return (
    <div
      className="ltc-policy-modal-overlay"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        className="ltc-policy-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="resort-booking-policy-title"
      >
        <div className="ltc-policy-modal-header">
          <div>
            <p className="ltc-policy-modal-kicker" style={fontMontserrat}>
              LUMISPIRE HOTEL &amp; RESORT
            </p>
            <h2
              id="resort-booking-policy-title"
              className="ltc-policy-modal-title"
              style={fontMontserrat}
            >
              Resort Booking Policy
            </h2>
          </div>

          <button
            type="button"
            className="ltc-policy-modal-close"
            onClick={onClose}
            aria-label="Close Resort Booking Policy"
          >
            ×
          </button>
        </div>

        <div className="ltc-policy-modal-body">
          <ResortPolicyDocument content={RESORT_BOOKING_POLICY_TEXT} />
        </div>

        <div className="ltc-policy-modal-footer">
          <button
            type="button"
            className="ltc-policy-modal-done"
            style={fontMontserrat}
            onClick={onClose}
          >
            DONE
          </button>
        </div>
      </section>
    </div>
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
