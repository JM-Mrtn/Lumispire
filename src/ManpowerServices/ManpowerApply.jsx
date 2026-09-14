import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";

function normalizeApiBase(raw) {
  const clean = String(raw || "http://localhost:5000").replace(/\/+$/, "");
  if (clean.endsWith("/api")) return clean;
  if (clean.includes("/api/")) return clean.replace(/\/api\/.*$/i, "/api");
  return `${clean}/api`;
}

const API_BASE = normalizeApiBase(import.meta.env.VITE_API_URL);

const TERMS_AND_CONDITIONS_TEXT = `# LUMISPIRE TERMS AND CONDITIONS

**LUMISPIRE: An AI-Enabled Service Management System for Hospitality, Training, and Manpower Services of the LTC Group**
These Terms and Conditions govern your access to and use of LUMISPIRE and the services offered through the platform. By accessing, registering for, or using LUMISPIRE, you agree to comply with and be bound by these Terms and Conditions.

### 1. Acceptance of Terms

By accessing and using LUMISPIRE, you acknowledge that you have read, understood, and agreed to these Terms and Conditions.
If you do not agree with any part of these Terms and Conditions, you should discontinue your use of the system.

### 2. Use of the System

LUMISPIRE is provided for authorized users who access hospitality, training, manpower, administrative, and related services offered by the LTC Group.
Users are granted limited permission to access and use the system for legitimate and authorized purposes only.
You may not:

- Modify, reproduce, copy, distribute, or duplicate system materials without authorization
- Use LUMISPIRE for unlawful, fraudulent, or unauthorized purposes
- Attempt to reverse engineer, decompile, or gain unauthorized access to the system or its software
- Circumvent security features or access restrictions
- Copy, reproduce, or redistribute proprietary content without permission
- Attempt to access another user's account
- Upload malicious software, viruses, or harmful code
- Interfere with the normal operation or security of LUMISPIRE
- Remove copyright, ownership, or proprietary notices from system materials

### 3. User Registration

Certain features of LUMISPIRE may require users to create an account.
During registration, you must provide accurate, current, and complete information. You are responsible for updating your information whenever necessary.
You are also responsible for maintaining the confidentiality of your account credentials, including your username and password.
Any activities performed through your account may be considered your responsibility unless unauthorized access is reported promptly to the LUMISPIRE administration.

### 4. Account and Identity Verification

LUMISPIRE may require users to verify their identity, email address, contact number, or other submitted information before certain services or features can be accessed.
Registration or application processes may not be considered complete until the required verification has been successfully completed.
Providing false, misleading, incomplete, or fraudulent information may result in account restriction, rejection, suspension, or termination.

### 5. User Roles and Access

Access to LUMISPIRE may vary depending on the user's assigned role, service category, department, or authorization level.
Users may be provided access to specific functions related to:

- Hospitality services
- Training services
- Manpower services
- Applicant or employee management
- Client service requests
- Administrative functions
- Reports and records
- Other services authorized by the LTC Group

Users must not attempt to access system features, records, or information outside their authorized role or permission level.

### 6. Privacy and Data Protection

LUMISPIRE collects and processes personal information in accordance with its Privacy Policy and applicable Philippine data privacy laws.
Personal information may be collected and processed for purposes including account management, service delivery, bookings, training registration, manpower applications, employee or applicant management, communications, reporting, and system administration.
By using LUMISPIRE, you acknowledge that your personal information may be processed as described in the LUMISPIRE Privacy Policy.

### 7. User Conduct

You agree to use LUMISPIRE responsibly and professionally.
You must not use the system to:

- Upload, submit, or transmit harmful, abusive, threatening, discriminatory, defamatory, obscene, or unlawful content
- Violate applicable laws or regulations
- Impersonate another person, organization, employee, applicant, or client
- Submit false or misleading information
- Harass, threaten, or harm other users
- Attempt unauthorized access to records or accounts
- Manipulate system information or records
- Disrupt system operations, servers, databases, or networks
- Use automated tools, bots, or scripts without authorization
- Exploit system vulnerabilities or security weaknesses

Any misuse of LUMISPIRE may result in restricted access, account suspension, account termination, or other appropriate action.

### 8. Hospitality Services, Reservations, and Bookings

Hospitality-related reservations, bookings, inquiries, and service requests submitted through LUMISPIRE are subject to availability, confirmation, and applicable LTC Group policies.
Submitting a booking request does not automatically guarantee confirmation.
The LTC Group reserves the right to approve, reject, reschedule, modify, or cancel bookings when necessary due to availability, operational requirements, emergencies, incorrect information, or other reasonable circumstances.
Users are responsible for reviewing booking details before confirming their requests.

### 9. Training Services

Training registrations, schedules, attendance, assessments, certifications, and other training-related services may be managed through LUMISPIRE.
Enrollment in a training program is subject to availability, eligibility requirements, payment requirements when applicable, and approval by authorized LTC Group personnel.
Training schedules, instructors, venues, requirements, or program arrangements may be modified when necessary.
Users are responsible for complying with applicable training rules, attendance requirements, and program policies.

### 10. Manpower Services

LUMISPIRE may be used for manpower-related services including applicant registration, recruitment, screening, assignment, employee or personnel management, service requests, and related administrative activities.
Submission of an application or profile through LUMISPIRE does not guarantee employment, placement, deployment, assignment, or acceptance.
The LTC Group may evaluate applicants based on qualifications, experience, skills, availability, client requirements, screening results, and other legitimate criteria.
Users must ensure that all documents, qualifications, employment records, and information submitted through the system are accurate and authentic.

### 11. AI-Enabled Features

LUMISPIRE may use artificial intelligence or automated technologies to assist with certain system functions, such as:

- Organizing and retrieving information
- Processing service requests
- Generating recommendations
- Supporting administrative workflows
- Summarizing or analyzing records
- Assisting with scheduling or resource management
- Identifying relevant applicants, services, or information
- Supporting reporting and operational decision-making

AI-generated outputs are intended to assist users and authorized personnel and should not always be considered final or independently authoritative.
Where appropriate, significant administrative, employment, financial, training, or service-related decisions may be reviewed or confirmed by authorized LTC Group personnel.
Users should report suspected errors, inaccurate recommendations, or unexpected AI-generated results to the system administrator.

### 12. Payments and Fees

Certain hospitality, training, manpower, or other services available through LUMISPIRE may require payment.
Applicable fees, payment schedules, methods, and conditions will be communicated to users before or during the relevant transaction.
Users are responsible for providing accurate payment information and completing required payments within the specified period.
Failure to make required payments may result in cancellation, suspension, or delay of the requested service.
Any applicable refund, cancellation, or rescheduling rules will be governed by the relevant LTC Group service policies.

### 13. Accuracy of Information

While the LTC Group makes reasonable efforts to maintain accurate and updated information within LUMISPIRE, the system may occasionally contain technical, typographical, administrative, or other errors.
Information such as schedules, availability, prices, training details, assignments, applicant status, or service information may change.
The LTC Group reserves the right to correct errors, update information, or modify system content when necessary.

### 14. System Availability

LUMISPIRE may occasionally become unavailable due to maintenance, upgrades, technical problems, cybersecurity measures, Internet disruptions, or circumstances beyond the LTC Group's reasonable control.
The LTC Group does not guarantee uninterrupted or error-free access to the system at all times.
Scheduled maintenance or system updates may temporarily affect access to certain services.

### 15. Limitation of Liability

To the extent permitted by applicable law, the LTC Group shall not be liable for indirect, incidental, special, or consequential damages arising from the use of or inability to use LUMISPIRE.
This may include losses resulting from system interruptions, Internet connectivity issues, unauthorized account access, inaccurate information provided by users, or circumstances beyond the reasonable control of the LTC Group.
Nothing in these Terms and Conditions excludes liabilities that cannot legally be excluded under applicable law.

### 16. Intellectual Property

The LUMISPIRE system, including its interface, design, software, graphics, databases, documentation, branding, content, and other materials, may be protected by applicable intellectual property laws.
Unless otherwise stated, these materials are owned by or licensed to the LTC Group.
Users may not reproduce, distribute, modify, publish, sell, license, or commercially exploit any portion of LUMISPIRE without prior authorization.

### 17. Account Suspension and Termination

The LTC Group reserves the right to suspend, restrict, or terminate a user's access to LUMISPIRE when there is reasonable basis to believe that the user:

- Violated these Terms and Conditions
- Submitted fraudulent or misleading information
- Attempted unauthorized access
- Misused the platform
- Compromised the security of the system
- Harmed or attempted to harm other users or the LTC Group
- Violated applicable laws or organizational policies

Where appropriate, users may be notified regarding account restrictions or termination.

### 18. Third-Party Services

LUMISPIRE may integrate with or rely on third-party technologies and service providers for functions such as hosting, communications, payment processing, analytics, security, or AI-enabled services.
The availability and operation of third-party services may be subject to their own terms, conditions, and privacy policies.
The LTC Group is not responsible for disruptions or failures caused solely by third-party platforms outside its reasonable control.

### 19. Changes to the Terms and Conditions

The LTC Group may revise or update these Terms and Conditions when necessary to reflect changes in services, system functions, policies, technologies, or legal requirements.
Significant changes may be communicated through LUMISPIRE or other appropriate communication channels.
Your continued use of LUMISPIRE after updated Terms and Conditions take effect indicates your acknowledgment of the revised terms, subject to applicable laws.

### 20. Governing Law

These Terms and Conditions shall be governed by and interpreted in accordance with the laws of the **Republic of the Philippines**.
Any dispute arising from the use of LUMISPIRE shall be handled in accordance with applicable Philippine laws and appropriate legal procedures.

### 21. Contact Information

If you have questions, concerns, or requests regarding these Terms and Conditions, please contact:
**LTC Group – LUMISPIRE Administration**
Email: **Admin@ltcmultiservices.com**
Contact Email: **lorengladius@ltcmultiservices.com**
You may also contact the LTC Group through the official inquiry or support features available within LUMISPIRE.
By clicking **“I Understand,” “I Agree,”** creating an account, or continuing to use LUMISPIRE, you acknowledge that you have read, understood, and agree to be bound by these **LUMISPIRE Terms and Conditions**.`;

const PRIVACY_POLICY_TEXT = `# LUMISPIRE PRIVACY POLICY

**LUMISPIRE: An AI-Enabled Service Management System for Hospitality, Training, and Manpower Services of the LTC Group**
LUMISPIRE and the LTC Group value your privacy and are committed to protecting the personal information you provide while using the system. This Privacy Policy explains what information may be collected, how it is used, and the measures taken to protect it.

### 1. Information We Collect

We may collect personal information that you provide directly when you register for an account, submit an inquiry, request or book a service, enroll in a training program, apply for manpower-related opportunities, complete forms, upload documents, or communicate with the LTC Group through LUMISPIRE.
The information collected may include your:

- Full name
- Email address
- Contact number
- Address
- Account and login information
- Service or booking details
- Training and enrollment information
- Employment or manpower application information
- Educational background, qualifications, skills, and work experience
- Documents submitted through the system
- Payment and transaction information, when applicable
- Messages, inquiries, feedback, and other information voluntarily provided through LUMISPIRE

We may also collect limited technical information related to your use of the system, such as device information, browser type, login activity, and system usage data.

### 2. How We Use Your Information

We use the information collected through LUMISPIRE to:

- Create and manage user accounts
- Process inquiries, bookings, reservations, and service requests
- Manage hospitality-related services and customer transactions
- Process training registrations, schedules, attendance, and related records
- Manage manpower applications, applicant information, personnel records, assignments, and service requests
- Communicate important notices, confirmations, schedules, and service updates
- Assist authorized LTC Group personnel in managing operations and responding to users
- Support LUMISPIRE's AI-enabled features in organizing, processing, retrieving, and analyzing relevant information
- Improve the functionality, performance, security, and overall user experience of the system
- Generate administrative reports and operational insights
- Prevent unauthorized access, fraud, misuse, and other security threats
- Comply with applicable legal and regulatory requirements

AI-enabled features within LUMISPIRE may assist in processing and organizing information, generating recommendations, identifying relevant records, and supporting administrative tasks. Where appropriate, important decisions involving users remain subject to review by authorized personnel.

### 3. Information Sharing

LUMISPIRE and the LTC Group do not sell, trade, or rent your personal information to third parties.
Personal information may only be shared with authorized LTC Group personnel and trusted service providers when necessary to operate, maintain, secure, or support the system and its services.
Information may also be disclosed when required by applicable law, regulation, court order, or lawful request from government authorities.
Access to personal information is limited to individuals who require such information to perform legitimate and authorized functions.

### 4. Data Security

We implement reasonable administrative, technical, and organizational security measures to protect personal information against unauthorized access, alteration, loss, misuse, disclosure, or destruction.
These measures may include access controls, account authentication, secure data storage, system monitoring, and appropriate restrictions on access to personal information.
However, no electronic system or method of transmitting information over the Internet can be guaranteed to be completely secure. Users are also responsible for keeping their account credentials and passwords confidential.

### 5. Cookies and System Usage Data

LUMISPIRE may use cookies or similar technologies to improve system functionality and user experience.
Cookies are small files stored on your device that may help the system maintain login sessions, remember user preferences, improve system performance, and understand how users interact with LUMISPIRE.
You may manage or disable cookies through your browser settings; however, certain system features may not function properly when cookies are disabled.

### 6. Data Retention

Personal information will only be retained for as long as necessary to fulfill the purposes for which it was collected, provide the requested services, maintain appropriate business and administrative records, and comply with applicable legal or regulatory requirements.
When personal information is no longer required, appropriate measures may be taken to securely delete, anonymize, or dispose of the information in accordance with applicable policies and laws.

### 7. Your Rights

Subject to applicable data privacy laws and regulations, you may have the right to:

- Request access to your personal information
- Request correction of inaccurate or incomplete information
- Request deletion or removal of personal information when legally permitted
- Object to or restrict certain types of personal information processing
- Withdraw consent when processing is based on your consent
- Request information regarding how your personal data is being processed
- Raise concerns regarding the handling or protection of your personal information

To exercise these rights, you may contact the LTC Group through its official contact information.

### 8. Third-Party Services

LUMISPIRE may use authorized third-party technologies or service providers to support functions such as hosting, communications, payment processing, system security, analytics, or AI-enabled services.
When third-party services are used, only information reasonably necessary for the intended function should be processed, subject to appropriate privacy and security safeguards.
LUMISPIRE is not responsible for the privacy practices of external websites or services that users independently access through third-party links.

### 9. Changes to This Privacy Policy

LUMISPIRE and the LTC Group may update this Privacy Policy when necessary to reflect changes in the system, services, operational practices, technologies, or applicable legal requirements.
Users may be notified of significant changes through LUMISPIRE or other appropriate communication channels. Continued use of the system following an updated Privacy Policy constitutes acknowledgment of the revised policy, subject to applicable laws.

### 10. Contact Us

If you have questions, concerns, or requests regarding this Privacy Policy or the handling of your personal information, please contact:
**LTC Group – LUMISPIRE Administration**
Email: **Admin@ltcmultiservices.com**
Contact Email: **lorengladius@ltcmultiservices.com**
By clicking **“I Understand,” “I Agree,”** or by continuing to use LUMISPIRE, you acknowledge that you have read and understood this Privacy Policy and consent to the collection and processing of your personal information in accordance with this policy and applicable data privacy laws.`;

const DEFAULT_VACANCIES = [
  "Accounting Clerk",
  "General Clerk",
  "Money Sorter",
  "Data Encoder",
  "Admin Assistant",
  "HR Assistant",
  "Production Worker",
  "Warehouseman",
  "Stockman",
  "Sales Coordinator",
  "Financial Advisor",
  "Engineer",
  "Driver",
  "Promodiser",
  "Merchandiser",
  "Messenger",
  "Forklift Operator",
  "Janitor",
];

const CIVIL_STATUS_OPTIONS = [
  "Single",
  "Married",
  "Widowed",
  "Divorced",
  "Separated",
  "Annulled",
];

const GENDER_OPTIONS = ["Male", "Female", "Prefer not to say"];

const REQUIREMENT_FIELDS = [
  { key: "validId", label: "Valid ID", accept: ".jpg,.jpeg,.png,.webp,.pdf" },
  { key: "resume", label: "Resume", accept: ".pdf,.txt,.jpg,.jpeg,.png,.webp" },
  { key: "nbi", label: "NBI", accept: ".pdf,.jpg,.jpeg,.png,.doc,.docx" },
  {
    key: "barangayClearance",
    label: "Barangay Clearance",
    accept: ".pdf,.jpg,.jpeg,.png,.doc,.docx",
  },
  { key: "sss", label: "SSS", accept: ".pdf,.jpg,.jpeg,.png,.doc,.docx" },
  {
    key: "philhealth",
    label: "PhilHealth",
    accept: ".pdf,.jpg,.jpeg,.png,.doc,.docx",
  },
  { key: "pagibig", label: "Pag-IBIG", accept: ".pdf,.jpg,.jpeg,.png,.doc,.docx" },
  { key: "tin", label: "TIN", accept: ".pdf,.jpg,.jpeg,.png,.doc,.docx" },
  {
    key: "transcriptOfRecords",
    label: "Transcript of Records",
    accept: ".pdf,.jpg,.jpeg,.png,.doc,.docx",
  },
  { key: "diploma", label: "Diploma", accept: ".pdf,.jpg,.jpeg,.png,.doc,.docx" },
  {
    key: "birthCertificate",
    label: "Birth Certificate",
    accept: ".pdf,.jpg,.jpeg,.png,.doc,.docx",
  },
  { key: "photo1x1", label: "1x1 Picture", accept: ".jpg,.jpeg,.png,.pdf" },
  { key: "photo2x2", label: "2x2 Picture", accept: ".jpg,.jpeg,.png,.pdf" },
];

function digitsOnly(value = "") {
  return String(value || "").replace(/\D/g, "");
}

function sanitizeName(value = "") {
  return String(value || "").replace(/[^A-Za-zÀ-ÿ\s.'-]/g, "");
}

function sanitizeAlphaText(value = "") {
  return String(value || "").replace(/[^A-Za-zÀ-ÿ\s.'-]/g, "");
}

function sanitizeBirthPlace(value = "") {
  return String(value || "").replace(/[^A-Za-zÀ-ÿ\s,.'-]/g, "");
}

function isValidEmail(value = "") {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || "").trim());
}

function isValidName(value = "") {
  return /^[A-Za-zÀ-ÿ][A-Za-zÀ-ÿ\s.'-]{1,49}$/.test(String(value || "").trim());
}

function isValidOptionalName(value = "") {
  const trimmed = String(value || "").trim();
  if (!trimmed) return true;
  return isValidName(trimmed);
}

function isValidContact(value = "") {
  const digits = digitsOnly(value);
  return digits.length === 11;
}

function isValidTin(value = "") {
  const digits = digitsOnly(value);
  return digits.length === 9 || digits.length === 12;
}

function isValidBirthPlace(value = "") {
  return /^[A-Za-zÀ-ÿ][A-Za-zÀ-ÿ\s,.'-]{1,99}$/.test(
    String(value || "").trim()
  );
}

function isValidReligion(value = "") {
  return /^[A-Za-zÀ-ÿ][A-Za-zÀ-ÿ\s.'-]{1,59}$/.test(
    String(value || "").trim()
  );
}

function isValidNationality(value = "") {
  return /^[A-Za-zÀ-ÿ][A-Za-zÀ-ÿ\s.'-]{1,59}$/.test(
    String(value || "").trim()
  );
}

function BrandLogo() {
  return (
    <div className="flex items-center gap-3">
      <img
        src="/ManpowerLogo.webp"
        alt="Manpower Logo"
        className="h-10 w-10 rounded-full object-cover"
      />
      <h1 className="text-[22px] font-black tracking-wide text-[#2f5a45] md:text-[28px]">
        LTC MANPOWER
      </h1>
    </div>
  );
}

function FooterLogo() {
  return (
    <div className="flex items-center gap-3">
      <img
        src="/ManpowerLogo.webp"
        alt="Lumispire Logo"
        className="h-9 w-9 rounded-full object-cover"
      />
      <p className="text-2xl font-black tracking-wide text-white">LTC MANPOWER</p>
    </div>
  );
}


const manpowerApplyEnrollmentStyles = `
  @import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Montserrat:wght@700;800;900&display=swap");

  .ltc-enrollment-page {
    --green-950: #071f14;
    --green-900: #0e3321;
    --green-800: #174a30;
    --green-700: #235f3e;
    --green-600: #2f754c;
    --footer-green: #082719;
    --gold: #d7a84d;
    --gold-soft: #f4d484;
    --white: #ffffff;
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
      linear-gradient(180deg,#f8fbf9 0%,#fff 42%,#f5faf7 100%) !important;
    line-height: 1.65;
    letter-spacing: -.01em;
    overflow-x: hidden;
    font-family: "Inter", Arial, sans-serif;
  }

  .ltc-enrollment-page * { box-sizing: border-box; }


  .ltc-enrollment-page .mp-header {
    position: sticky;
    top: 0;
    z-index: 50;
    width: 100%;
    background: var(--footer-green) !important;
    border-bottom: 1px solid rgba(255,255,255,.1) !important;
    box-shadow: 0 10px 34px rgba(7,31,20,.14) !important;
    margin: 0 !important;
  }

  .ltc-enrollment-page .mp-header .mp-container {
    width: 100% !important;
    max-width: none !important;
    margin: 0 !important;
    padding-left: 32px !important;
    padding-right: 32px !important;
  }

  .ltc-enrollment-page .mp-nav {
    min-height: 76px !important;
    display: flex !important;
    justify-content: space-between !important;
    align-items: center !important;
    gap: 24px !important;
  }

  .ltc-enrollment-page .mp-logo {
    display: flex !important;
    align-items: center !important;
    gap: 13px !important;
    color: white !important;
    border: 0 !important;
    background: transparent !important;
    cursor: pointer !important;
    text-align: left !important;
    padding: 0 !important;
    text-decoration: none !important;
    flex-shrink: 0 !important;
  }

  .ltc-enrollment-page .mp-logo-icon {
    width: 42px !important;
    height: 42px !important;
    display: grid !important;
    place-items: center !important;
    border-radius: 50% !important;
    background: linear-gradient(145deg,#fff,#e3f4ea) !important;
    box-shadow: 0 0 0 5px rgba(255,255,255,.08), 0 12px 24px rgba(0,0,0,.12) !important;
    object-fit: cover !important;
  }

  .ltc-enrollment-page .mp-logo h1 {
    color: white !important;
    font-size: 18px !important;
    line-height: 1 !important;
    font-weight: 900 !important;
    text-transform: uppercase !important;
    letter-spacing: -.04em !important;
    margin: 0 !important;
  }

  .ltc-enrollment-page .mp-logo p {
    font-size: 11px !important;
    color: rgba(255,255,255,.72) !important;
    margin: 3px 0 0 !important;
  }

  .ltc-enrollment-page .mp-desktop-nav {
    display: flex !important;
    align-items: center !important;
    gap: 8px !important;
    margin-left: auto !important;
  }

  .ltc-enrollment-page .mp-nav-link {
    color: rgba(255,255,255,.78) !important;
    font-size: 12px !important;
    font-weight: 800 !important;
    letter-spacing: .08em !important;
    text-transform: uppercase !important;
    padding: 10px 14px !important;
    border-radius: 999px !important;
    transition: .25s var(--ease) !important;
    text-decoration: none !important;
    white-space: nowrap !important;
  }

  .ltc-enrollment-page .mp-nav-link:hover,
  .ltc-enrollment-page .mp-nav-link.active {
    color: white !important;
    background: rgba(255,255,255,.13) !important;
    transform: translateY(-1px) !important;
  }

  .ltc-enrollment-page .mp-sign-in {
    color: #102418 !important;
    background: linear-gradient(135deg,#f4d484,#d7a84d) !important;
    box-shadow: 0 16px 35px rgba(215,168,77,.22) !important;
  }

  .ltc-enrollment-page .mp-sign-in:hover {
    color: #102418 !important;
    background: linear-gradient(135deg,#f8dc8c,#d7a84d) !important;
  }

  .ltc-enrollment-page main > section:first-child {
    width: 100% !important;
    max-width: none !important;
    padding: 0 !important;
    margin: 0 !important;
  }

  .ltc-enrollment-page main > section:first-child > div {
    position: relative;
    min-height: 420px !important;
    border-radius: 0 !important;
    overflow: hidden;
    color: white !important;
    isolation: isolate;
    background: linear-gradient(120deg, #03180f 0%, #082719 42%, #155f3b 100%) !important;
  }

  .ltc-enrollment-page main > section:first-child > div::before {
    content: "";
    position: absolute;
    inset: 0;
    z-index: 0;
    background:
      radial-gradient(circle at 12% 20%, rgba(244,212,132,.16), transparent 28%),
      radial-gradient(circle at 90% 18%, rgba(35,95,62,.48), transparent 32%),
      linear-gradient(120deg, rgba(2,18,11,.96) 0%, rgba(5,37,23,.90) 46%, rgba(12,64,39,.76) 100%);
  }

  .ltc-enrollment-page main > section:first-child > div::after {
    content: "";
    position: absolute;
    inset: -16% -10% -24% -10%;
    z-index: 1;
    background:
      radial-gradient(circle at 16% 82%, rgba(19,120,72,.36), transparent 24%),
      radial-gradient(circle at 88% 44%, rgba(244,212,132,.14), transparent 28%),
      linear-gradient(135deg, rgba(3,24,15,.34), rgba(8,56,34,.08));
    filter: blur(30px);
    pointer-events: none;
  }

  .ltc-enrollment-page main > section:first-child > div > div {
    position: relative;
    z-index: 2;
    width: min(1180px, 92%);
    margin: 0 auto;
    min-height: 420px !important;
    padding: 76px 0 84px !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    text-align: center !important;
  }

  .ltc-enrollment-page main > section:first-child h2 {
    margin: 0 auto !important;
    max-width: 940px;
    color: white !important;
    font-size: clamp(42px, 6vw, 76px) !important;
    line-height: .98 !important;
    font-weight: 900 !important;
    letter-spacing: -.065em !important;
    text-shadow: 0 8px 26px rgba(0,0,0,.22);
    font-family: "Inter", Arial, sans-serif !important;
  }

  .ltc-enrollment-page main > section:first-child h2::after {
    content: " Now";
    color: var(--gold-soft);
  }

  .ltc-enrollment-page main > section:first-child p {
    max-width: 720px;
    margin: 24px auto 0 !important;
    color: rgba(255,255,255,.80) !important;
    font-size: 18px !important;
    line-height: 1.8 !important;
  }

  .ltc-enrollment-page main > section:nth-child(2) {
    width: min(1180px, 92%) !important;
    max-width: 1180px !important;
    margin: -68px auto 0 !important;
    padding: 0 0 84px !important;
    position: relative;
    z-index: 4;
  }

  .ltc-enrollment-page main > section:nth-child(2) > div {
    position: relative;
    overflow: hidden;
    border-radius: 32px !important;
    background: var(--glass) !important;
    border: 1px solid rgba(255,255,255,.82) !important;
    box-shadow: var(--shadow-lg) !important;
    backdrop-filter: blur(18px);
    padding: 30px !important;
    animation: ltcEnrollmentReveal .75s var(--ease) both;
  }

  .ltc-enrollment-page main > section:nth-child(2) > div::before {
    content: "";
    position: absolute;
    inset: 0 0 auto;
    height: 7px;
    background: linear-gradient(90deg,var(--green-700),var(--gold));
  }

  .ltc-enrollment-page form > section {
    position: relative;
    overflow: hidden;
    border-radius: 28px;
    background: rgba(255,255,255,.78);
    border: 1px solid rgba(35,95,62,.12);
    box-shadow: 0 12px 28px rgba(8,39,25,.06);
    padding: 26px;
  }

  .ltc-enrollment-page form > section h3 {
    margin: 0 !important;
    color: var(--green-950) !important;
    font-size: clamp(28px, 4vw, 42px) !important;
    line-height: 1.08 !important;
    font-weight: 900 !important;
    letter-spacing: -.055em !important;
    font-family: "Inter", Arial, sans-serif !important;
  }

  .ltc-enrollment-page form > section h3::before {
    content: "MANPOWER APPLICATION";
    display: block;
    margin-bottom: 10px;
    color: var(--green-700);
    font-size: 11px;
    font-weight: 900;
    text-transform: uppercase;
    letter-spacing: .18em;
  }

  .ltc-enrollment-page form > section:nth-of-type(2) h3::before {
    content: "REQUIREMENTS";
  }

  .ltc-enrollment-page form label {
    color: #506656 !important;
    font-size: 12px !important;
    font-weight: 900 !important;
    letter-spacing: .06em;
    text-transform: uppercase;
  }

  .ltc-enrollment-page input,
  .ltc-enrollment-page select,
  .ltc-enrollment-page textarea {
    min-height: 54px;
    border: 1px solid rgba(35,95,62,.18) !important;
    border-radius: 18px !important;
    background: #fff !important;
    padding: 0 18px !important;
    color: var(--green-950) !important;
    font-size: 14px !important;
    font-weight: 700 !important;
    outline: none !important;
    transition: .28s var(--ease) !important;
    box-shadow: 0 10px 22px rgba(8,39,25,.05) !important;
  }

  .ltc-enrollment-page textarea {
    padding-top: 14px !important;
    min-height: 106px;
  }

  .ltc-enrollment-page input[type="file"] {
    padding: 13px 16px 13px 48px !important;
    min-height: 54px;
  }

  .ltc-enrollment-page .mp-file-field {
    position: relative;
    margin-top: 8px;
  }

  .ltc-enrollment-page .mp-attachment-icon {
    position: absolute;
    left: 18px;
    top: 50%;
    width: 19px;
    height: 19px;
    transform: translateY(-50%);
    color: var(--green-700);
    pointer-events: none;
    z-index: 2;
    opacity: .9;
    transition: transform .28s var(--ease), color .28s var(--ease);
  }

  .ltc-enrollment-page .mp-file-field:focus-within .mp-attachment-icon,
  .ltc-enrollment-page .mp-file-field:hover .mp-attachment-icon {
    color: var(--gold);
    transform: translateY(-50%) rotate(-8deg) scale(1.06);
  }

  .ltc-enrollment-page input:focus,
  .ltc-enrollment-page select:focus,
  .ltc-enrollment-page textarea:focus {
    border-color: rgba(215,168,77,.72) !important;
    box-shadow: 0 16px 34px rgba(8,39,25,.10) !important;
    transform: translateY(-1px);
  }

  .ltc-enrollment-page form > div[class*="h-[2px]"] {
    height: 0 !important;
    background: transparent !important;
  }

  .ltc-enrollment-page button[type="submit"],
  .ltc-enrollment-page form button[type="button"] {
    min-height: 50px;
    min-width: 190px;
    border: 0 !important;
    border-radius: 999px !important;
    padding: 0 24px !important;
    font-size: 13px !important;
    font-weight: 900 !important;
    letter-spacing: .08em;
    text-transform: uppercase;
    transition: .28s var(--ease) !important;
  }

  .ltc-enrollment-page button[type="submit"] {
    color: #102418 !important;
    background: linear-gradient(135deg,#f4d484,#d7a84d) !important;
    box-shadow: 0 16px 35px rgba(215,168,77,.28) !important;
  }

  .ltc-enrollment-page form button[type="button"] {
    color: var(--green-950) !important;
    background: white !important;
    border: 1px solid rgba(35,95,62,.16) !important;
  }

  .ltc-enrollment-page button[type="submit"]:hover,
  .ltc-enrollment-page form button[type="button"]:hover {
    transform: translateY(-3px);
    box-shadow: 0 22px 45px rgba(8,39,25,.14);
  }

  .ltc-enrollment-page footer {
    width: 100%;
    background: var(--footer-green) !important;
    color: white !important;
    padding: 30px 0 12px !important;
    margin: 0 !important;
  }

  .ltc-enrollment-page footer > div:first-child,
  .ltc-enrollment-page footer > div:last-child {
    width: 100% !important;
    max-width: none !important;
    margin: 0 !important;
    padding-left: 32px !important;
    padding-right: 32px !important;
  }

  .ltc-enrollment-page footer h3 {
    color: #f4d484 !important;
    font-size: 12px !important;
    line-height: 1.2;
    font-weight: 900 !important;
    text-transform: uppercase;
    letter-spacing: .14em;
    margin: 0 0 10px !important;
  }

  .ltc-enrollment-page footer p {
    color: rgba(255,255,255,.68) !important;
    font-size: 13px !important;
    line-height: 1.55;
    margin: 5px 0 !important;
  }

  @keyframes ltcEnrollmentReveal {
    from { opacity: 0; transform: translateY(34px) scale(.98); }
    to { opacity: 1; transform: translateY(0) scale(1); }
  }

  .ltc-enrollment-page .mp-policy-box {
    border: 1px solid rgba(35,95,62,.14);
    border-radius: 18px;
    background: rgba(255,255,255,.88);
    padding: 16px 18px;
    box-shadow: 0 12px 28px rgba(8,39,25,.07);
  }

  .ltc-enrollment-page .mp-policy-row {
    display: flex;
    align-items: flex-start;
    gap: 11px;
  }

  .ltc-enrollment-page input.mp-policy-checkbox {
    appearance: none;
    -webkit-appearance: none;
    width: 20px !important;
    height: 20px !important;
    min-height: 20px !important;
    flex: 0 0 20px;
    margin: 2px 0 0 !important;
    padding: 0 !important;
    border: 2px solid var(--gold) !important;
    border-radius: 5px !important;
    background: #fff !important;
    box-shadow: none !important;
    cursor: pointer;
    display: grid;
    place-content: center;
  }

  .ltc-enrollment-page input.mp-policy-checkbox::before {
    content: "";
    width: 9px;
    height: 5px;
    border-left: 2px solid #102418;
    border-bottom: 2px solid #102418;
    transform: rotate(-45deg) scale(0);
    transform-origin: center;
    transition: transform .16s ease;
    margin-top: -2px;
  }

  .ltc-enrollment-page input.mp-policy-checkbox:checked {
    background: linear-gradient(135deg,#f4d484,#d7a84d) !important;
  }

  .ltc-enrollment-page input.mp-policy-checkbox:checked::before {
    transform: rotate(-45deg) scale(1);
  }

  .ltc-enrollment-page input.mp-policy-checkbox.error {
    border-color: #d92d20 !important;
    background: rgba(239,68,68,.06) !important;
    box-shadow: 0 0 0 4px rgba(239,68,68,.08) !important;
  }

  .ltc-enrollment-page .mp-policy-copy {
    color: #405a49;
    font-size: 12.5px;
    line-height: 1.55;
    font-weight: 700;
  }

  .ltc-enrollment-page form button.mp-policy-link {
    min-height: auto !important;
    min-width: 0 !important;
    display: inline !important;
    margin: 0 !important;
    padding: 0 !important;
    border: 0 !important;
    border-radius: 0 !important;
    background: transparent !important;
    box-shadow: none !important;
    color: #9b6a16 !important;
    font-size: inherit !important;
    font-weight: 900 !important;
    letter-spacing: normal !important;
    line-height: inherit !important;
    text-transform: none !important;
    vertical-align: baseline;
    cursor: pointer;
  }

  .ltc-enrollment-page form button.mp-policy-link:hover {
    transform: none !important;
    box-shadow: none !important;
    color: var(--green-800) !important;
    text-decoration: underline;
    text-underline-offset: 3px;
  }

  .ltc-enrollment-page .mp-policy-error {
    margin: 7px 0 0 31px;
    color: #b42318;
    font-size: 11px;
    line-height: 1.4;
    font-weight: 800;
  }

  .ltc-enrollment-page .mp-policy-overlay {
    position: fixed;
    inset: 0;
    z-index: 9999;
    display: grid;
    place-items: center;
    padding: 18px;
    background: rgba(2,18,11,.74);
    backdrop-filter: blur(7px);
  }

  .ltc-enrollment-page .mp-policy-modal {
    width: min(900px, 100%);
    height: min(84vh, 820px);
    display: flex;
    flex-direction: column;
    overflow: hidden;
    border: 1px solid rgba(255,255,255,.72);
    border-radius: 24px;
    background: #fff;
    box-shadow: 0 30px 90px rgba(0,0,0,.32);
  }

  .ltc-enrollment-page .mp-policy-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 18px;
    padding: 18px 20px;
    background: var(--footer-green);
    border-bottom: 1px solid rgba(255,255,255,.1);
  }

  .ltc-enrollment-page .mp-policy-kicker {
    margin: 0 0 4px !important;
    color: var(--gold-soft) !important;
    font-size: 10px !important;
    line-height: 1.2 !important;
    font-weight: 900 !important;
    letter-spacing: .12em;
    text-transform: uppercase;
  }

  .ltc-enrollment-page .mp-policy-title {
    margin: 0 !important;
    color: #fff !important;
    font-size: 24px !important;
    line-height: 1.2 !important;
    font-weight: 900 !important;
  }

  .ltc-enrollment-page .mp-policy-close {
    width: 38px;
    height: 38px;
    flex: 0 0 38px;
    border: 0;
    border-radius: 999px;
    background: rgba(255,255,255,.12);
    color: #fff;
    font-size: 24px;
    line-height: 1;
    cursor: pointer;
  }

  .ltc-enrollment-page .mp-policy-body {
    flex: 1;
    min-height: 0;
    overflow-y: auto;
    padding: 24px 28px 32px;
    background: #fff;
  }

  .ltc-enrollment-page .mp-policy-document {
    width: min(760px, 100%);
    margin: 0 auto;
    color: #25352d;
    font-size: 13.5px;
    line-height: 1.72;
  }

  .ltc-enrollment-page .mp-policy-document h1 {
    margin: 0 0 16px !important;
    color: var(--green-950) !important;
    font-size: clamp(23px, 3vw, 31px) !important;
    line-height: 1.15 !important;
    font-weight: 900 !important;
  }

  .ltc-enrollment-page .mp-policy-document h3 {
    margin: 24px 0 8px !important;
    color: var(--green-800) !important;
    font-size: 16px !important;
    line-height: 1.35 !important;
    font-weight: 900 !important;
  }

  .ltc-enrollment-page .mp-policy-document p {
    margin: 0 0 12px !important;
    color: #25352d !important;
    font-size: 13.5px !important;
    line-height: 1.72 !important;
  }

  .ltc-enrollment-page .mp-policy-document strong {
    color: #13281d;
    font-weight: 900;
  }

  .ltc-enrollment-page .mp-policy-document ul {
    margin: 4px 0 16px;
    padding-left: 24px;
  }

  .ltc-enrollment-page .mp-policy-document li {
    margin: 4px 0;
    color: #25352d;
  }

  .ltc-enrollment-page .mp-policy-document li::marker {
    color: var(--gold);
  }

  .ltc-enrollment-page .mp-policy-footer {
    display: flex;
    justify-content: flex-end;
    padding: 12px 18px 16px;
    border-top: 1px solid rgba(14,51,33,.10);
    background: #f8fbf9;
  }

  .ltc-enrollment-page .mp-policy-done {
    min-width: 118px;
    min-height: 42px;
    border: 0;
    border-radius: 999px;
    color: #102418;
    background: linear-gradient(135deg,#f4d484,#d7a84d);
    font-size: 12px;
    font-weight: 900;
    cursor: pointer;
  }

  @media (max-width: 900px) {
    .ltc-enrollment-page .mp-header .mp-container { padding-left: 22px !important; padding-right: 22px !important; }
    .ltc-enrollment-page .mp-desktop-nav { display: none !important; }
    .ltc-enrollment-page main > section:first-child > div,
    .ltc-enrollment-page main > section:first-child > div > div { min-height: 360px !important; }
    .ltc-enrollment-page main > section:nth-child(2) { margin-top: -46px !important; }
    .ltc-enrollment-page main > section:nth-child(2) > div { padding: 20px !important; border-radius: 26px !important; }
    .ltc-enrollment-page form > section { padding: 20px; }
    .ltc-enrollment-page footer > div:first-child { grid-template-columns: 1fr !important; }
  }

  @media (max-width: 600px) {
    .ltc-enrollment-page .mp-header .mp-container { padding-left: 16px !important; padding-right: 16px !important; }
    .ltc-enrollment-page .mp-policy-overlay { padding: 10px; }
    .ltc-enrollment-page .mp-policy-modal { height: 90vh; border-radius: 18px; }
    .ltc-enrollment-page .mp-policy-body { padding: 20px 16px 26px; }
    .ltc-enrollment-page .mp-policy-document { font-size: 13px; line-height: 1.68; }
    .ltc-enrollment-page .mp-logo h1 { font-size: 14px !important; }
    .ltc-enrollment-page .mp-logo p { font-size: 10px !important; }
    .ltc-enrollment-page main > section:first-child h2 { font-size: clamp(38px, 12vw, 54px) !important; }
    .ltc-enrollment-page main > section:first-child p { font-size: 15px !important; }
    .ltc-enrollment-page button[type="submit"], .ltc-enrollment-page form button[type="button"] { width: 100%; }
    .ltc-enrollment-page footer > div:first-child,
    .ltc-enrollment-page footer > div:last-child { padding-left: 16px !important; padding-right: 16px !important; }
  }

  /* ===== Unified LTC Manpower public-page refinements ===== */
  .ltc-enrollment-page h1,
  .ltc-enrollment-page h2,
  .ltc-enrollment-page h3,
  .ltc-enrollment-page h4,
  .ltc-enrollment-page h5 { font-family: "Montserrat", "Inter", Arial, sans-serif !important; }

  .ltc-enrollment-page .mp-menu-button {
    display: none;
    width: 44px;
    height: 44px;
    place-items: center;
    padding: 0 !important;
    border: 1px solid rgba(255,255,255,.12) !important;
    border-radius: 14px !important;
    color: #fff !important;
    background: rgba(255,255,255,.10) !important;
    cursor: pointer;
  }
  .ltc-enrollment-page .mp-menu-button svg { width: 24px; height: 24px; }

  .ltc-enrollment-page .mp-sidebar-overlay {
    position: fixed;
    inset: 0;
    z-index: 80;
    background: rgba(0,0,0,.48);
    backdrop-filter: blur(5px);
  }
  .ltc-enrollment-page .mp-sidebar-panel {
    position: absolute;
    top: 0;
    right: 0;
    width: min(320px,88vw);
    height: 100%;
    padding: 22px;
    background: #fff;
    box-shadow: -24px 0 70px rgba(0,0,0,.28);
  }
  .ltc-enrollment-page .mp-sidebar-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16px;
    padding-bottom: 16px;
    border-bottom: 1px solid rgba(16,24,40,.10);
  }
  .ltc-enrollment-page .mp-sidebar-title { margin: 0; color: var(--green-950); font-size: 12px; font-weight: 900; letter-spacing: .14em; }
  .ltc-enrollment-page .mp-sidebar-close { width: 40px; height: 40px; border: 0; border-radius: 13px; color: #101828; background: #f2f4f7; cursor: pointer; }
  .ltc-enrollment-page .mp-sidebar-link { display: block; width: 100%; margin: 0 0 8px; padding: 13px 14px; border: 0; border-radius: 14px; color: #101828; background: transparent; font-size: 13px; font-weight: 800; text-align: left; text-transform: uppercase; text-decoration: none; cursor: pointer; }
  .ltc-enrollment-page .mp-sidebar-link:hover,
  .ltc-enrollment-page .mp-sidebar-link.active { color: #fff; background: var(--green-800); }

  .ltc-enrollment-page main > section:first-child > div {
    background:
      linear-gradient(120deg, rgba(2,18,11,.95) 0%, rgba(5,37,23,.88) 44%, rgba(12,64,39,.72) 100%),
      url('/ManpowerBanner.webp') center center / cover no-repeat !important;
  }
  .ltc-enrollment-page main > section:first-child h2::after { content: none !important; }

  .ltc-enrollment-page form > section { border-radius: 26px !important; }
  .ltc-enrollment-page form > section h3::before { color: var(--green-700); }
  .ltc-enrollment-page input,
  .ltc-enrollment-page select,
  .ltc-enrollment-page textarea { border-radius: 16px !important; }

  .ltc-enrollment-page footer > div:first-child {
    display: grid !important;
    grid-template-columns: 1.5fr .9fr 1fr 1.4fr .8fr !important;
    gap: 22px !important;
    padding-bottom: 24px !important;
    border-bottom: 1px solid rgba(255,255,255,.10) !important;
  }
  .ltc-enrollment-page footer > div:first-child > div { border-left: 0 !important; padding-left: 0 !important; }
  .ltc-enrollment-page footer a { display: block; margin: 5px 0; color: rgba(255,255,255,.68); font-size: 13px; line-height: 1.55; text-decoration: none; }
  .ltc-enrollment-page footer a:hover { color: #fff; text-decoration: underline; }
  .ltc-enrollment-page footer > div:last-child { display: flex !important; justify-content: space-between !important; gap: 12px !important; padding-top: 14px !important; }

  @media (max-width: 1100px) {
    .ltc-enrollment-page footer > div:first-child { grid-template-columns: repeat(2,minmax(0,1fr)) !important; }
  }
  @media (max-width: 900px) {
    .ltc-enrollment-page .mp-nav { min-height: 72px !important; }
    .ltc-enrollment-page .mp-menu-button { display: grid !important; }
    .ltc-enrollment-page footer > div:first-child { grid-template-columns: 1fr !important; gap: 18px !important; }
    .ltc-enrollment-page footer > div:last-child { flex-direction: column !important; }
  }

`;

export default function ManpowerApplyPage() {
  const [jobs, setJobs] = useState([]);
  const [mobileOpen, setMobileOpen] = useState(false);
  const vacancies = jobs.length ? jobs.map((job) => job.title) : DEFAULT_VACANCIES;

  useEffect(() => {
    let active = true;

    async function loadJobs() {
      try {
        const res = await fetch(`${API_BASE}/manpower/vacancies`);
        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
          throw new Error(data?.message || "Failed to load job vacancies.");
        }

        if (active) {
          setJobs(Array.isArray(data?.jobs) ? data.jobs : []);
        }
      } catch (error) {
        console.error("loadManpowerJobs error:", error);
        if (active) setJobs([]);
      }
    }

    loadJobs();

    return () => {
      active = false;
    };
  }, []);

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const selectedVacancy = searchParams.get("vacancy") || "";

  const [form, setForm] = useState({
    vacancy: selectedVacancy,
    firstName: "",
    lastName: "",
    middleName: "",
    email: "",
    completeAddress: "",
    contactNo: "",
    age: "",
    gender: "",
    sssNumber: "",
    tinNumber: "",
    pagibigNumber: "",
    philhealthNumber: "",
    birthPlace: "",
    civilStatus: "",
    religion: "",
    nationality: "",
  });

  const [files, setFiles] = useState({});
  const [touched, setTouched] = useState({});
  const [agreedToPolicies, setAgreedToPolicies] = useState(false);
  const [policyTouched, setPolicyTouched] = useState(false);
  const [policyModal, setPolicyModal] = useState(null);
  const [status, setStatus] = useState({
    loading: false,
    error: "",
    success: "",
  });

  const [emailCheck, setEmailCheck] = useState({
    state: "idle",
    message: "",
  });

  function getFieldError(key, currentForm, currentFiles) {
    switch (key) {
      case "vacancy":
        return !currentForm.vacancy ? "Required" : "";

      case "firstName":
        if (!currentForm.firstName.trim()) return "Required";
        return !isValidName(currentForm.firstName) ? "Letters only" : "";

      case "lastName":
        if (!currentForm.lastName.trim()) return "Required";
        return !isValidName(currentForm.lastName) ? "Letters only" : "";

      case "middleName":
        return !isValidOptionalName(currentForm.middleName) ? "Letters only" : "";

      case "email":
        if (!currentForm.email.trim()) return "Required";
        if (!isValidEmail(currentForm.email)) return "Invalid email";
        if (emailCheck.state === "taken") return "Already used";
        if (emailCheck.state === "error") return emailCheck.message || "Check failed";
        return "";

      case "completeAddress":
        if (!currentForm.completeAddress.trim()) return "Required";
        return currentForm.completeAddress.trim().length < 5 ? "Too short" : "";

      case "contactNo":
        if (!currentForm.contactNo.trim()) return "Required";
        return !isValidContact(currentForm.contactNo) ? "11 digits only" : "";

      case "age": {
        if (!currentForm.age.trim()) return "Required";
        const age = Number(currentForm.age);
        return !Number.isFinite(age) || age < 18 || age > 60 ? "18-60 only" : "";
      }

      case "gender":
        return !GENDER_OPTIONS.includes(currentForm.gender) ? "Required" : "";

      case "sssNumber":
        if (!currentForm.sssNumber.trim()) return "Required";
        return digitsOnly(currentForm.sssNumber).length !== 10 ? "10 digits" : "";

      case "tinNumber":
        if (!currentForm.tinNumber.trim()) return "Required";
        return !isValidTin(currentForm.tinNumber) ? "9 or 12 digits" : "";

      case "pagibigNumber":
        if (!currentForm.pagibigNumber.trim()) return "Required";
        return digitsOnly(currentForm.pagibigNumber).length !== 12 ? "12 digits" : "";

      case "philhealthNumber":
        if (!currentForm.philhealthNumber.trim()) return "Required";
        return digitsOnly(currentForm.philhealthNumber).length !== 12 ? "12 digits" : "";

      case "birthPlace":
        if (!currentForm.birthPlace.trim()) return "Required";
        return !isValidBirthPlace(currentForm.birthPlace) ? "Invalid text" : "";

      case "civilStatus":
        return !CIVIL_STATUS_OPTIONS.includes(currentForm.civilStatus) ? "Required" : "";

      case "religion":
        if (!currentForm.religion.trim()) return "Required";
        return !isValidReligion(currentForm.religion) ? "Letters only" : "";

      case "nationality":
        if (!currentForm.nationality.trim()) return "Required";
        return !isValidNationality(currentForm.nationality) ? "Letters only" : "";

      default:
        if (REQUIREMENT_FIELDS.some((field) => field.key === key)) {
          return !currentFiles[key] ? "Required" : "";
        }
        return "";
    }
  }

  const formErrors = useMemo(() => {
    const keys = [
      "vacancy",
      "firstName",
      "lastName",
      "middleName",
      "email",
      "completeAddress",
      "contactNo",
      "age",
      "gender",
      "sssNumber",
      "tinNumber",
      "pagibigNumber",
      "philhealthNumber",
      "birthPlace",
      "civilStatus",
      "religion",
      "nationality",
      ...REQUIREMENT_FIELDS.map((field) => field.key),
    ];

    const errors = {};
    for (const key of keys) {
      const error = getFieldError(key, form, files);
      if (error) errors[key] = error;
    }
    return errors;
  }, [form, files, emailCheck]);

  useEffect(() => {
    if (!policyModal) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        setPolicyModal(null);
      }
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [policyModal]);

  useEffect(() => {
    const email = String(form.email || "").trim();

    if (!email) {
      setEmailCheck({ state: "idle", message: "" });
      return;
    }

    if (!isValidEmail(email)) {
      setEmailCheck({ state: "idle", message: "" });
      return;
    }

    setEmailCheck({ state: "checking", message: "Checking..." });

    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(
          `${API_BASE}/manpower/check-email?email=${encodeURIComponent(email)}`,
          { signal: controller.signal }
        );

        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
          throw new Error(data?.message || "Failed to check email.");
        }

        if (data?.available) {
          setEmailCheck({ state: "available", message: "Available" });
        } else {
          setEmailCheck({
            state: "taken",
            message: "This email is already used.",
          });
        }
      } catch (error) {
        if (error?.name === "AbortError") return;
        setEmailCheck({
          state: "error",
          message: error?.message || "Failed to check email.",
        });
      }
    }, 500);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [form.email]);

  function shouldShowError(key) {
    return Boolean(touched[key] && formErrors[key]);
  }

  function hasError(key) {
    return Boolean(shouldShowError(key));
  }

  function baseInputClass(key) {
    return `mt-1.5 w-full rounded-[6px] border bg-[#f7f7f4] px-3 py-2.5 text-sm text-[#30463a] outline-none transition ${
      hasError(key)
        ? "border-[#d92d20] bg-[#fff5f5] focus:border-[#d92d20]"
        : "border-[#b9bdb5] focus:border-[#456b56]"
    }`;
  }

  function fileInputClass(key) {
    return `mt-1.5 block w-full rounded-[6px] border bg-[#f7f7f4] px-3 py-2 text-sm text-[#30463a] transition ${
      hasError(key) ? "border-[#d92d20] bg-[#fff5f5]" : "border-[#b9bdb5]"
    }`;
  }

  function updateField(key, value) {
    let nextValue = value;

    if (["firstName", "lastName", "middleName"].includes(key)) {
      nextValue = sanitizeName(value).slice(0, 50);
    } else if (key === "religion" || key === "nationality") {
      nextValue = sanitizeAlphaText(value).slice(0, 60);
    } else if (key === "birthPlace") {
      nextValue = sanitizeBirthPlace(value).slice(0, 100);
    } else if (key === "contactNo") {
      nextValue = digitsOnly(value).slice(0, 11);
    } else if (key === "sssNumber") {
      nextValue = digitsOnly(value).slice(0, 10);
    } else if (key === "tinNumber") {
      nextValue = digitsOnly(value).slice(0, 12);
    } else if (key === "pagibigNumber" || key === "philhealthNumber") {
      nextValue = digitsOnly(value).slice(0, 12);
    } else if (key === "age") {
      nextValue = digitsOnly(value).slice(0, 2);
    }

    setForm((prev) => ({ ...prev, [key]: nextValue }));
    setTouched((prev) => ({ ...prev, [key]: true }));
    setStatus((prev) => ({ ...prev, error: "", success: "" }));
  }

  function updateFile(key, file) {
    setFiles((prev) => ({ ...prev, [key]: file || null }));
    setTouched((prev) => ({ ...prev, [key]: true }));
    setStatus((prev) => ({ ...prev, error: "", success: "" }));
  }

  async function submitApplication(e) {
    e.preventDefault();
    setPolicyTouched(true);

    const allTouched = {
      vacancy: true,
      firstName: true,
      lastName: true,
      middleName: true,
      email: true,
      completeAddress: true,
      contactNo: true,
      age: true,
      gender: true,
      sssNumber: true,
      tinNumber: true,
      pagibigNumber: true,
      philhealthNumber: true,
      birthPlace: true,
      civilStatus: true,
      religion: true,
      nationality: true,
    };

    for (const field of REQUIREMENT_FIELDS) {
      allTouched[field.key] = true;
    }

    setTouched((prev) => ({ ...prev, ...allTouched }));
    setStatus({ loading: false, error: "", success: "" });

    if (!agreedToPolicies) {
      setStatus({
        loading: false,
        error: "Please review the highlighted fields.",
        success: "",
      });
      return;
    }

    if (Object.keys(formErrors).length > 0 || emailCheck.state === "checking") {
      setStatus({
        loading: false,
        error:
          emailCheck.state === "checking"
            ? "Please wait while checking the email."
            : "Please fix the highlighted fields.",
        success: "",
      });
      return;
    }

    setStatus({ loading: true, error: "", success: "" });

    try {
      const payload = new FormData();
      payload.append("vacancy", form.vacancy);
      payload.append("firstName", form.firstName.trim());
      payload.append("lastName", form.lastName.trim());
      payload.append("middleName", form.middleName.trim());
      payload.append("email", form.email.trim());
      payload.append("completeAddress", form.completeAddress.trim());
      payload.append("contactNo", digitsOnly(form.contactNo));
      payload.append("age", form.age);
      payload.append("gender", form.gender);
      payload.append("sssNumber", digitsOnly(form.sssNumber));
      payload.append("tinNumber", digitsOnly(form.tinNumber));
      payload.append("pagibigNumber", digitsOnly(form.pagibigNumber));
      payload.append("philhealthNumber", digitsOnly(form.philhealthNumber));
      payload.append("birthPlace", form.birthPlace.trim());
      payload.append("civilStatus", form.civilStatus);
      payload.append("religion", form.religion.trim());
      payload.append("nationality", form.nationality.trim());

      for (const field of REQUIREMENT_FIELDS) {
        payload.append(field.key, files[field.key]);
      }

      const res = await fetch(`${API_BASE}/manpower/apply`, {
        method: "POST",
        body: payload,
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data?.message || "Failed to submit application.");
      }

      const applicationId = data?.application?._id;

      if (!applicationId) {
        throw new Error("Application was saved but no application ID was returned.");
      }

      navigate(`/manpower-exam/${applicationId}`);
      return;
    } catch (error) {
      setStatus({
        loading: false,
        error: error?.message || "Failed to submit application.",
        success: "",
      });
    }
  }

  function labelRow(label, key) {
    let message = "";

    if (key === "email" && touched.email && !formErrors.email) {
      if (emailCheck.state === "checking") message = "Checking...";
      if (emailCheck.state === "available") message = "Available";
    }

    if (shouldShowError(key)) {
      message = formErrors[key];
    }

    const messageColor =
      key === "email" && touched.email && !formErrors.email && emailCheck.state === "available"
        ? "text-[#1f6b38]"
        : key === "email" && touched.email && !formErrors.email && emailCheck.state === "checking"
        ? "text-[#667085]"
        : "text-[#b42318]";

    return (
      <div className="flex items-center justify-between gap-3">
        <label htmlFor={`mp-${key}`} className="text-[13px] font-medium text-[#45604f]">{label}</label>
        {message ? (
          <span className={`text-[11px] font-semibold ${messageColor}`}>{message}</span>
        ) : null}
      </div>
    );
  }

  return (
    <div className="ltc-enrollment-page min-h-screen bg-[#efefed] text-[#24372d]">
      <style>{manpowerApplyEnrollmentStyles}</style>
      <header className="mp-header">
        <div className="mp-container mp-nav">
          <Link to="/manpower-services" className="mp-logo">
            <img src="/ManpowerLogo.webp" alt="Manpower Logo" className="mp-logo-icon" />
            <div>
              <h1>LTC MANPOWER SERVICES</h1>
              <p>Professional staffing and workforce solutions.</p>
            </div>
          </Link>

          <nav className="mp-desktop-nav">
            <Link to="/manpower-services" className="mp-nav-link">
              Home
            </Link>
            <Link to="/manpower-positions" className="mp-nav-link active">
              Job Offer
            </Link>
            <Link to="/manpower-requirements" className="mp-nav-link">
              Requirements
            </Link>
            <Link to="/manpower-contact" className="mp-nav-link">
              Contact
            </Link>
            <Link to="/manpower-faqs" className="mp-nav-link">
              FAQs
            </Link>
            <Link to="/manpower-employee-login" className="mp-nav-link mp-sign-in">
              Sign In
            </Link>
          </nav>

          <button
            type="button"
            className="mp-menu-button"
            aria-label="Open menu"
            onClick={() => setMobileOpen(true)}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </header>

      {mobileOpen ? (
        <div className="mp-sidebar-overlay">
          <div style={{ position: "absolute", inset: 0 }} onClick={() => setMobileOpen(false)} />
          <aside className="mp-sidebar-panel">
            <div className="mp-sidebar-top">
              <p className="mp-sidebar-title">MENU</p>
              <button type="button" className="mp-sidebar-close" aria-label="Close menu" onClick={() => setMobileOpen(false)}>✕</button>
            </div>
            <Link to="/manpower-services" className="mp-sidebar-link" onClick={() => setMobileOpen(false)}>Home</Link>
            <Link to="/manpower-positions" className="mp-sidebar-link active" onClick={() => setMobileOpen(false)}>Job Offer</Link>
            <Link to="/manpower-requirements" className="mp-sidebar-link" onClick={() => setMobileOpen(false)}>Requirements</Link>
            <Link to="/manpower-contact" className="mp-sidebar-link" onClick={() => setMobileOpen(false)}>Contact</Link>
            <Link to="/manpower-faqs" className="mp-sidebar-link" onClick={() => setMobileOpen(false)}>FAQs</Link>
            <Link to="/manpower-employee-login" className="mp-sidebar-link" onClick={() => setMobileOpen(false)}>Sign In</Link>
          </aside>
        </div>
      ) : null}

      <main>
        <section className="mx-auto max-w-7xl px-4 pt-0 md:px-6">
          <div
            className="relative min-h-[180px] overflow-hidden md:min-h-[230px]"
            style={{
              backgroundImage:
                "linear-gradient(90deg, rgba(42,82,61,0.88) 0%, rgba(64,94,77,0.58) 38%, rgba(64,94,77,0.18) 100%), url('/ManpowerBanner.webp')",
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundColor: "#64766c",
            }}
          >
            <div className="flex min-h-[180px] items-center px-5 py-8 md:min-h-[230px] md:px-8">
              <div className="text-white">
                <h2 className="font-serif text-4xl leading-none md:text-6xl">
                  Application Form
                </h2>
                <p className="mt-4 text-base text-white/95 md:text-xl">
                  Begin your journey with Manpower Services today
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 pb-10 pt-4 md:px-6">
          <div className="bg-[#f4f4f1] px-4 py-5 md:px-6 md:py-6">
            <form onSubmit={submitApplication} className="space-y-10">
              <section>
                <h3 className="font-serif text-[28px] text-[#3f5e4d] md:text-[38px]">
                  Personal Information
                </h3>

                <div className="mt-6 grid gap-4 md:grid-cols-3">
                  <div className="md:col-span-3">
                    {labelRow("Job Offer", "vacancy")}
                    <select
                      id="mp-vacancy"
                      name="vacancy"
                      value={form.vacancy}
                      onChange={(e) => updateField("vacancy", e.target.value)}
                      onBlur={() => setTouched((prev) => ({ ...prev, vacancy: true }))}
                      className={baseInputClass("vacancy")}
                    >
                      <option value="">Select Job Offer</option>
                      {vacancies.map((item) => (
                        <option key={item} value={item}>
                          {item}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    {labelRow("First Name", "firstName")}
                    <input
                      id="mp-firstName"
                      name="firstName"
                      value={form.firstName}
                      onChange={(e) => updateField("firstName", e.target.value)}
                      onBlur={() => setTouched((prev) => ({ ...prev, firstName: true }))}
                      maxLength={50}
                      className={baseInputClass("firstName")}
                    />
                  </div>

                  <div>
                    {labelRow("Last Name", "lastName")}
                    <input
                      id="mp-lastName"
                      name="lastName"
                      value={form.lastName}
                      onChange={(e) => updateField("lastName", e.target.value)}
                      onBlur={() => setTouched((prev) => ({ ...prev, lastName: true }))}
                      maxLength={50}
                      className={baseInputClass("lastName")}
                    />
                  </div>

                  <div>
                    {labelRow("Middle Name", "middleName")}
                    <input
                      id="mp-middleName"
                      name="middleName"
                      value={form.middleName}
                      onChange={(e) => updateField("middleName", e.target.value)}
                      onBlur={() => setTouched((prev) => ({ ...prev, middleName: true }))}
                      maxLength={50}
                      className={baseInputClass("middleName")}
                    />
                  </div>

                  <div>
                    {labelRow("Phone Number", "contactNo")}
                    <input
                      id="mp-contactNo"
                      name="contactNo"
                      value={form.contactNo}
                      onChange={(e) => updateField("contactNo", e.target.value)}
                      onBlur={() => setTouched((prev) => ({ ...prev, contactNo: true }))}
                      maxLength={11}
                      placeholder="09123456789"
                      className={baseInputClass("contactNo")}
                    />
                  </div>

                  <div>
                    {labelRow("Email", "email")}
                    <input
                      id="mp-email"
                      name="email"
                      type="email"
                      value={form.email}
                      onChange={(e) => updateField("email", e.target.value)}
                      onBlur={() => setTouched((prev) => ({ ...prev, email: true }))}
                      className={baseInputClass("email")}
                    />
                  </div>

                  <div>
                    {labelRow("Birth Place", "birthPlace")}
                    <input
                      id="mp-birthPlace"
                      name="birthPlace"
                      value={form.birthPlace}
                      onChange={(e) => updateField("birthPlace", e.target.value)}
                      onBlur={() => setTouched((prev) => ({ ...prev, birthPlace: true }))}
                      maxLength={100}
                      className={baseInputClass("birthPlace")}
                    />
                  </div>

                  <div>
                    {labelRow("Age", "age")}
                    <input
                      id="mp-age"
                      name="age"
                      type="text"
                      inputMode="numeric"
                      value={form.age}
                      onChange={(e) => updateField("age", e.target.value)}
                      onBlur={() => setTouched((prev) => ({ ...prev, age: true }))}
                      maxLength={2}
                      className={baseInputClass("age")}
                    />
                  </div>

                  <div>
                    {labelRow("Gender", "gender")}
                    <select
                      id="mp-gender"
                      name="gender"
                      value={form.gender}
                      onChange={(e) => updateField("gender", e.target.value)}
                      onBlur={() => setTouched((prev) => ({ ...prev, gender: true }))}
                      className={baseInputClass("gender")}
                    >
                      <option value="">Select gender</option>
                      {GENDER_OPTIONS.map((item) => (
                        <option key={item} value={item}>
                          {item}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    {labelRow("Status", "civilStatus")}
                    <select
                      id="mp-civilStatus"
                      name="civilStatus"
                      value={form.civilStatus}
                      onChange={(e) => updateField("civilStatus", e.target.value)}
                      onBlur={() =>
                        setTouched((prev) => ({ ...prev, civilStatus: true }))
                      }
                      className={baseInputClass("civilStatus")}
                    >
                      <option value="">Select status</option>
                      {CIVIL_STATUS_OPTIONS.map((item) => (
                        <option key={item} value={item}>
                          {item}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="md:col-span-3">
                    {labelRow("Complete Address", "completeAddress")}
                    <textarea
                      id="mp-completeAddress"
                      name="completeAddress"
                      rows={3}
                      value={form.completeAddress}
                      onChange={(e) => updateField("completeAddress", e.target.value)}
                      onBlur={() =>
                        setTouched((prev) => ({ ...prev, completeAddress: true }))
                      }
                      className={baseInputClass("completeAddress")}
                    />
                  </div>

                  <div>
                    {labelRow("SSS Number", "sssNumber")}
                    <input
                      id="mp-sssNumber"
                      name="sssNumber"
                      value={form.sssNumber}
                      onChange={(e) => updateField("sssNumber", e.target.value)}
                      onBlur={() => setTouched((prev) => ({ ...prev, sssNumber: true }))}
                      maxLength={10}
                      className={baseInputClass("sssNumber")}
                    />
                  </div>

                  <div>
                    {labelRow("Pag-Ibig Number", "pagibigNumber")}
                    <input
                      id="mp-pagibigNumber"
                      name="pagibigNumber"
                      value={form.pagibigNumber}
                      onChange={(e) => updateField("pagibigNumber", e.target.value)}
                      onBlur={() =>
                        setTouched((prev) => ({ ...prev, pagibigNumber: true }))
                      }
                      maxLength={12}
                      className={baseInputClass("pagibigNumber")}
                    />
                  </div>

                  <div>
                    {labelRow("PhilHealth Number", "philhealthNumber")}
                    <input
                      id="mp-philhealthNumber"
                      name="philhealthNumber"
                      value={form.philhealthNumber}
                      onChange={(e) => updateField("philhealthNumber", e.target.value)}
                      onBlur={() =>
                        setTouched((prev) => ({ ...prev, philhealthNumber: true }))
                      }
                      maxLength={12}
                      className={baseInputClass("philhealthNumber")}
                    />
                  </div>

                  <div>
                    {labelRow("TIN Number", "tinNumber")}
                    <input
                      id="mp-tinNumber"
                      name="tinNumber"
                      value={form.tinNumber}
                      onChange={(e) => updateField("tinNumber", e.target.value)}
                      onBlur={() => setTouched((prev) => ({ ...prev, tinNumber: true }))}
                      maxLength={12}
                      className={baseInputClass("tinNumber")}
                    />
                  </div>

                  <div>
                    {labelRow("Religion", "religion")}
                    <input
                      id="mp-religion"
                      name="religion"
                      value={form.religion}
                      onChange={(e) => updateField("religion", e.target.value)}
                      onBlur={() => setTouched((prev) => ({ ...prev, religion: true }))}
                      maxLength={60}
                      className={baseInputClass("religion")}
                    />
                  </div>

                  <div>
                    {labelRow("Nationality", "nationality")}
                    <input
                      id="mp-nationality"
                      name="nationality"
                      value={form.nationality}
                      onChange={(e) => updateField("nationality", e.target.value)}
                      onBlur={() =>
                        setTouched((prev) => ({ ...prev, nationality: true }))
                      }
                      maxLength={60}
                      className={baseInputClass("nationality")}
                    />
                  </div>
                </div>
              </section>

              <div className="mx-auto h-[2px] w-[90%] bg-[#617b6a]" />

              <section>
                <h3 className="font-serif text-[28px] text-[#3f5e4d] md:text-[38px]">
                  Upload Documents
                </h3>

                <div className="mt-6 grid gap-4 md:grid-cols-3">
                  {REQUIREMENT_FIELDS.map((field) => (
                    <div key={field.key}>
                      <div className="flex items-center justify-between gap-2">
                        <label
                          htmlFor={`mp-file-${field.key}`}
                          className="text-[13px] font-medium text-[#45604f]"
                        >
                          {field.label}
                        </label>
                        {shouldShowError(field.key) ? (
                          <span className="text-[11px] font-semibold text-[#b42318]">
                            {formErrors[field.key]}
                          </span>
                        ) : null}
                      </div>

                      <div className="mp-file-field">
                        <svg
                          className="mp-attachment-icon"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                        >
                          <path d="M21.44 11.05 12.25 20.24a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
                        </svg>

                        <input
                          id={`mp-file-${field.key}`}
                          name={field.key}
                          type="file"
                          accept={field.accept}
                          onChange={(e) =>
                            updateFile(field.key, e.target.files?.[0] || null)
                          }
                          onBlur={() =>
                            setTouched((prev) => ({ ...prev, [field.key]: true }))
                          }
                          className={fileInputClass(field.key)}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <div className="mp-policy-box">
                <div className="mp-policy-row">
                  <input
                    id="manpower-policy-consent"
                    type="checkbox"
                    checked={agreedToPolicies}
                    onChange={(event) => {
                      setAgreedToPolicies(event.target.checked);
                      setPolicyTouched(true);
                      setStatus((prev) => ({ ...prev, error: "", success: "" }));
                    }}
                    className={`mp-policy-checkbox ${
                      policyTouched && !agreedToPolicies ? "error" : ""
                    }`}
                    aria-required="true"
                    aria-invalid={policyTouched && !agreedToPolicies}
                    aria-describedby={
                      policyTouched && !agreedToPolicies
                        ? "manpower-policy-consent-error"
                        : undefined
                    }
                  />

                  <div className="mp-policy-copy">
                    <label htmlFor="manpower-policy-consent">
                      I agree to the{" "}
                    </label>

                    <button
                      type="button"
                      className="mp-policy-link"
                      onClick={() => setPolicyModal("terms")}
                    >
                      Terms &amp; Conditions
                    </button>

                    <span> and </span>

                    <button
                      type="button"
                      className="mp-policy-link"
                      onClick={() => setPolicyModal("privacy")}
                    >
                      Privacy Policy
                    </button>
                  </div>
                </div>

                {policyTouched && !agreedToPolicies ? (
                  <p
                    id="manpower-policy-consent-error"
                    className="mp-policy-error"
                  >
                    You must agree to the Terms &amp; Conditions and Privacy Policy before submitting your application.
                  </p>
                ) : null}
              </div>

              {status.error ? (
                <div className="rounded-md border border-[#efc9c9] bg-[#fff2f2] px-4 py-3 text-sm text-[#912f2f]">
                  {status.error}
                </div>
              ) : null}

              {status.success ? (
                <div className="rounded-md border border-[#cbe0ca] bg-[#eff9ef] px-4 py-3 text-sm text-[#1f6b38]">
                  {status.success}
                </div>
              ) : null}

              <div className="flex flex-col items-center justify-center gap-4 pt-2 md:flex-row md:gap-16">
                <button
                  type="submit"
                  disabled={status.loading}
                  className="min-w-[170px] rounded-[10px] border border-[#91a691] bg-gradient-to-b from-[#e8f0e7] to-[#bccdbb] px-6 py-2.5 text-sm font-semibold text-[#345240] shadow-sm transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {status.loading ? "Submitting..." : "Submit Application"}
                </button>

                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="min-w-[170px] rounded-[10px] border border-[#91a691] bg-gradient-to-b from-[#e8f0e7] to-[#bccdbb] px-6 py-2.5 text-sm font-semibold text-[#345240] shadow-sm transition hover:brightness-95"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </section>
      </main>

      {policyModal ? (
        <ManpowerPolicyModal
          type={policyModal}
          onClose={() => setPolicyModal(null)}
        />
      ) : null}

      <footer className="bg-[#456b56] text-white">
        <div className="mx-auto max-w-7xl px-4 py-5 md:px-6">
          <div className="grid gap-5 md:grid-cols-5 md:items-start">
            <div className="md:pr-4">
              <FooterLogo />
            </div>

            <div className="md:border-l md:border-white/20 md:pl-5">
              <h3 className="text-lg font-extrabold">Menu</h3>
              <div className="mt-2 space-y-1 text-sm text-white/90">
                <Link to="/manpower-services">Home</Link>
                <Link to="/manpower-positions">Job Offer</Link>
                <Link to="/manpower-requirements">Requirements</Link>
                <Link to="/manpower-employee-login">Profile</Link>
              </div>
            </div>

            <div className="md:border-l md:border-white/20 md:pl-5">
              <h3 className="text-lg font-extrabold">Contact Information</h3>
              <div className="mt-2 space-y-1 text-sm text-white/90">
                <p><a href="mailto:ltc.tamsi@gmail.com">ltc.tamsi@gmail.com</a></p>
                <p><a href="mailto:lorengladius@ltcmultiservices.com">lorengladius@ltcmultiservices.com</a></p>
                <p><a href="tel:+639516281271">+639516281271</a></p>
            <p><a href="tel:+639959808051">+639959808051</a></p>
              </div>
            </div>

            <div className="md:border-l md:border-white/20 md:pl-5">
              <h3 className="text-lg font-extrabold">Address</h3>
              <div className="mt-2 space-y-1 text-sm text-white/90">
                <p>2/F 5441 Currie Street,</p>
                <p>Palanan, Makati City</p>
              </div>
            </div>

            <div className="md:border-l md:border-white/20 md:pl-5">
              <h3 className="text-lg font-extrabold">Follow Us</h3>
              <div className="mt-2 space-y-1 text-sm text-white/90">
                <p><a href={"https://www.facebook.com/profile.php?id=61571746334920&rdid=3bcMsbFVo3PBobtd&share_url=https%3A%2F%2Fwww.facebook.com%2Fshare%2F1D1g1d614L#"} target="_blank" rel="noopener noreferrer">Facebook</a></p>
                <p><a href="mailto:lorengladius@ltcmultiservices.com">Email</a></p>
              </div>
            </div>
          </div>

          <div className="mt-4 flex flex-col items-start justify-between gap-2 border-t border-white/15 pt-3 text-[10px] text-white/80 md:flex-row">
            <p>© 2026 LTC GROUP OF COMPANIES. All rights reserved.</p>
            <p>Developed by CRMS Tech Alliance</p>
          </div>
        </div>
      </footer>
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

function ManpowerPolicyDocument({ content }) {
  const lines = content.split("\n");
  const elements = [];
  let listItems = [];

  const flushList = () => {
    if (!listItems.length) return;

    elements.push(
      <ul key={`policy-list-${elements.length}`}>
        {listItems.map((item, index) => (
          <li key={`${item}-${index}`}>{renderPolicyInline(item)}</li>
        ))}
      </ul>
    );

    listItems = [];
  };

  lines.forEach((rawLine, index) => {
    const line = rawLine.trim();

    if (!line) {
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
        <h1 key={`policy-h1-${index}`}>
          {renderPolicyInline(line.slice(2))}
        </h1>
      );
      return;
    }

    if (line.startsWith("### ")) {
      elements.push(
        <h3 key={`policy-h3-${index}`}>
          {renderPolicyInline(line.slice(4))}
        </h3>
      );
      return;
    }

    elements.push(
      <p key={`policy-p-${index}`}>{renderPolicyInline(line)}</p>
    );
  });

  flushList();

  return <div className="mp-policy-document">{elements}</div>;
}

function ManpowerPolicyModal({ type, onClose }) {
  const isTerms = type === "terms";
  const title = isTerms ? "Terms & Conditions" : "Privacy Policy";
  const content = isTerms
    ? TERMS_AND_CONDITIONS_TEXT
    : PRIVACY_POLICY_TEXT;

  return (
    <div
      className="mp-policy-overlay"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <section
        className="mp-policy-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="manpower-policy-modal-title"
      >
        <div className="mp-policy-header">
          <div>
            <p className="mp-policy-kicker">LUMISPIRE LTC MANPOWER</p>
            <h2 id="manpower-policy-modal-title" className="mp-policy-title">
              {title}
            </h2>
          </div>

          <button
            type="button"
            className="mp-policy-close"
            onClick={onClose}
            aria-label={`Close ${title}`}
          >
            ×
          </button>
        </div>

        <div className="mp-policy-body">
          <ManpowerPolicyDocument content={content} />
        </div>

        <div className="mp-policy-footer">
          <button
            type="button"
            className="mp-policy-done"
            onClick={onClose}
          >
            DONE
          </button>
        </div>
      </section>
    </div>
  );
}

