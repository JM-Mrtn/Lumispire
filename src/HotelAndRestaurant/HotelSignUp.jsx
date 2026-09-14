import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

const BACKGROUND_IMAGES = ["/HotelLanding1.webp", "/HotelLanding2.webp"];

const PHONE_PLACEHOLDER = "Phone Number";
const USERNAME_MIN_LENGTH = 5;
const USERNAME_MAX_LENGTH = 20;



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

const SYSTEM_FONT = 'system-ui, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Arial, sans-serif';
const fontMontserrat = { fontFamily: SYSTEM_FONT };
const fontPontano = { fontFamily: SYSTEM_FONT };
const fontPoppins = { fontFamily: SYSTEM_FONT };

function getHotelToken() {
  return localStorage.getItem("token") || localStorage.getItem("hotelToken") || "";
}

const HotelSignUp = () => {
  const navigate = useNavigate();

  const API_BASE = useMemo(() => {
    const raw = (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/+$/, "");
    if (raw.includes("/api/hotel")) return raw;
    if (raw.includes("/api/")) return raw;
    return `${raw}/api/hotel`;
  }, []);

  const [form, setForm] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    username: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const [touched, setTouched] = useState({});
  const [errors, setErrors] = useState({});
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [agreedToPolicies, setAgreedToPolicies] = useState(false);
  const [policyTouched, setPolicyTouched] = useState(false);
  const [policyModal, setPolicyModal] = useState(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bgIndex, setBgIndex] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  const [checkingUsername, setCheckingUsername] = useState(false);
  const [checkingEmail, setCheckingEmail] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState(null);
  const [emailAvailable, setEmailAvailable] = useState(null);

  const nameRegex = /^[A-Za-z\s]+$/;
  const usernameRegex = /^[A-Za-z0-9]+$/;
  const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  const setField = (key, value) => {
    setForm((p) => ({ ...p, [key]: value }));
    setTouched((p) => ({ ...p, [key]: true }));
    setErrorMessage("");
    setSuccessMessage("");
  };

  const validateFirstName = (v) => {
    if (!v) return "First name is required";
    if (v.length > 20) return "First name must be max 20 characters";
    if (!nameRegex.test(v)) return "First name must contain letters only";
    return "";
  };

  const validateMiddleName = (v) => {
    if (!v) return "";
    if (v.length > 20) return "Middle name must be max 20 characters";
    if (!nameRegex.test(v)) return "Middle name must contain letters only";
    return "";
  };

  const validateLastName = (v) => {
    if (!v) return "Last name is required";
    if (v.length > 20) return "Last name must be max 20 characters";
    if (!nameRegex.test(v)) return "Last name must contain letters only";
    return "";
  };

  const validateUsername = (v) => {
    if (!v) return "Username is required";
    if (v.length < USERNAME_MIN_LENGTH) {
      return `Username must be at least ${USERNAME_MIN_LENGTH} characters`;
    }
    if (v.length > USERNAME_MAX_LENGTH) {
      return `Username must be max ${USERNAME_MAX_LENGTH} characters`;
    }
    if (!usernameRegex.test(v)) return "Username must be letters/numbers only";
    return "";
  };

  const validateEmail = (v) => {
    if (!v) return "Email is required";
    if (v.length > 50) return "Email must be max 50 characters";
    if (!emailRegex.test(v)) return "Invalid email format";
    return "";
  };

  const validatePhone = (v) => {
    if (!v) return "Phone number is required";
    if (!/^\d+$/.test(v)) return "Phone number must be numeric only";
    if (!/^09\d{9}$/.test(v)) {
      return "Phone number must start with 09 and be exactly 11 digits.";
    }

    return "";
  };

  const validatePassword = (v) => {
    if (!v) return "Password is required";
    if (v.length < 6 || v.length > 20) return "Password must be 6–20 characters";
    if (!/[A-Z]/.test(v) || !/[a-z]/.test(v)) {
      return "Password must include uppercase and lowercase letters";
    }
    if (!/\d/.test(v)) return "Password must contain at least one number";
    if (!/[^A-Za-z0-9]/.test(v)) return "Password must contain at least one symbol";
    if (form.username && v === form.username) return "Password must not match the username";
    return "";
  };

  const validateConfirmPassword = (v) => {
    if (!v) return "Confirm password is required";
    if (v !== form.password) return "Passwords do not match";
    return "";
  };

  const runAllValidation = () => {
    const next = {
      firstName: validateFirstName(form.firstName),
      middleName: validateMiddleName(form.middleName),
      lastName: validateLastName(form.lastName),
      email: validateEmail(form.email),
      phone: validatePhone(form.phone),
      username: validateUsername(form.username),
      password: validatePassword(form.password),
      confirmPassword: validateConfirmPassword(form.confirmPassword),
    };

    if (!next.username && usernameAvailable === false) next.username = "Username already taken";
    if (!next.email && emailAvailable === false) next.email = "Email already exists";

    setErrors(next);
    return next;
  };

  const onNameChange = (key, raw) => {
    setField(key, raw.replace(/[^A-Za-z\s]/g, "").slice(0, 20));
  };

  const onUsernameChange = (raw) => {
    setField("username", raw.replace(/[^A-Za-z0-9]/g, "").slice(0, USERNAME_MAX_LENGTH));
    setUsernameAvailable(null);
  };

  const onEmailChange = (raw) => {
    setField("email", raw.replace(/\s/g, "").slice(0, 50));
    setEmailAvailable(null);
  };

  const onPhoneChange = (raw) => {
    setField("phone", raw.replace(/\D/g, "").slice(0, 11));
  };


  const onBlurTrim = (key) => {
    setForm((p) => ({ ...p, [key]: (p[key] || "").trim() }));
  };

  useEffect(() => {
    const timer = window.setInterval(() => {
      setBgIndex((prev) => (prev + 1) % BACKGROUND_IMAGES.length);
    }, 15000);

    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!policyModal) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setPolicyModal(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [policyModal]);

  useEffect(() => {
    const u = form.username.trim();
    const localErr = validateUsername(u);

    if (!u || localErr) {
      setCheckingUsername(false);
      setUsernameAvailable(null);
      return;
    }

    setCheckingUsername(true);

    const t = setTimeout(async () => {
      try {
        const res = await fetch(`${API_BASE}/check-username?username=${encodeURIComponent(u)}`);

        if (!res.ok) {
          setUsernameAvailable(null);
          return;
        }

        const data = await res.json();
        setUsernameAvailable(data.available === true);
      } catch {
        setUsernameAvailable(null);
      } finally {
        setCheckingUsername(false);
      }
    }, 450);

    return () => clearTimeout(t);
  }, [form.username, API_BASE]);

  useEffect(() => {
    const e = form.email.toLowerCase().trim();
    const localErr = validateEmail(e);

    if (!e || localErr) {
      setCheckingEmail(false);
      setEmailAvailable(null);
      return;
    }

    setCheckingEmail(true);

    const t = setTimeout(async () => {
      try {
        const res = await fetch(`${API_BASE}/check-email?email=${encodeURIComponent(e)}`);

        if (!res.ok) {
          setEmailAvailable(null);
          return;
        }

        const data = await res.json();
        setEmailAvailable(data.available === true);
      } catch {
        setEmailAvailable(null);
      } finally {
        setCheckingEmail(false);
      }
    }, 450);

    return () => clearTimeout(t);
  }, [form.email, API_BASE]);

  useEffect(() => {
    if (Object.keys(touched).length === 0) return;
    runAllValidation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form, usernameAvailable, emailAvailable]);

  const canSubmit = useMemo(() => {
    const localErrors = {
      firstName: validateFirstName(form.firstName),
      middleName: validateMiddleName(form.middleName),
      lastName: validateLastName(form.lastName),
      email: validateEmail(form.email),
      phone: validatePhone(form.phone),
      username: validateUsername(form.username),
      password: validatePassword(form.password),
      confirmPassword: validateConfirmPassword(form.confirmPassword),
    };

    const localOk = Object.values(localErrors).every((x) => !x);
    const uniqueOk = usernameAvailable !== false && emailAvailable !== false;
    const doneChecking = !checkingUsername && !checkingEmail;

    return localOk && uniqueOk && doneChecking && agreedToPolicies && !isSubmitting;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    form,
    usernameAvailable,
    emailAvailable,
    checkingUsername,
    checkingEmail,
    agreedToPolicies,
    isSubmitting,
  ]);

  const fieldError = (key) => (touched[key] ? errors[key] : "");

  const getStatusColor = (type) => {
    if (type === "ok") return "ltc-status-ok";
    if (type === "bad") return "ltc-status-bad";
    return "ltc-status-neutral";
  };

  const handleSignUp = async () => {
    setErrorMessage("");
    setSuccessMessage("");
    setIsSubmitting(true);
    setPolicyTouched(true);

    setTouched({
      firstName: true,
      middleName: true,
      lastName: true,
      email: true,
      phone: true,
      username: true,
      password: true,
      confirmPassword: true,
    });

    const v = runAllValidation();
    const hasErrors = Object.values(v).some(Boolean);

    if (hasErrors || !agreedToPolicies || !canSubmit) {
      setIsSubmitting(false);
      return;
    }

    try {
      const signupEmail = form.email.toLowerCase().trim();

      const response = await fetch(`${API_BASE}/hotel-signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: form.firstName.trim(),
          middleName: form.middleName.trim(),
          lastName: form.lastName.trim(),
          username: form.username.trim(),
          email: signupEmail,
          phone: form.phone,
          password: form.password,
          confirmPassword: form.confirmPassword,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (response.status === 201) {
        sessionStorage.setItem("pendingVerificationEmail", signupEmail);
        setSuccessMessage("Account created successfully.");
        navigate("/email-confirmation", { state: { email: signupEmail } });
        return;
      }

      setErrorMessage(data.message || "There was an error during sign-up.");
    } catch (err) {
      console.error(err);
      setErrorMessage("There was an error signing up.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const goToHome = () => navigate("/resort-venue");
  const goToContact = () => navigate("/hotel-contact-us");
  const goToLogIn = () => navigate("/hotel-login");

  const UserIcon = () => (
    <svg viewBox="0 0 24 24" className="ltc-input-icon-svg" fill="none" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M20 21a8 8 0 0 0-16 0" />
      <circle cx="12" cy="8" r="4" />
    </svg>
  );

  const LockIcon = () => (
    <svg viewBox="0 0 24 24" className="ltc-input-icon-svg" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="5" y="11" width="14" height="10" rx="2" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 11V8a4 4 0 0 1 8 0v3" />
    </svg>
  );

  const MailIcon = () => (
    <svg viewBox="0 0 24 24" className="ltc-input-icon-svg" fill="none" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16v12H4z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="m4 8 8 6 8-6" />
    </svg>
  );

  const PhoneIcon = () => (
    <svg viewBox="0 0 24 24" className="ltc-input-icon-svg" fill="none" stroke="currentColor" strokeWidth="2">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M22 16.92v3a2 2 0 0 1-2.18 2 19.86 19.86 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.86 19.86 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.12.9.35 1.78.68 2.62a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.46-1.25a2 2 0 0 1 2.11-.45c.84.33 1.72.56 2.62.68A2 2 0 0 1 22 16.92Z"
      />
    </svg>
  );

  const EyeIcon = ({ open }) => (
    <svg
      viewBox="0 0 24 24"
      className="ltc-input-icon-svg"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
      focusable="false"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.5 12s3.5-7 9.5-7 9.5 7 9.5 7-3.5 7-9.5 7-9.5-7-9.5-7z"
      />
      <circle cx="12" cy="12" r="2.75" />
      {!open && <path strokeLinecap="round" d="M4 20L20 4" />}
    </svg>
  );

  const CrownLogo = () => (
    <button type="button" onClick={() => navigate("/resort-venue")} className="ltc-logo" aria-label="Go to hotel home">
      <img
        src="/HotelLogo.webp"
        alt="Hotel logo"
        className="ltc-logo-icon"
        onError={(event) => {
          event.currentTarget.style.display = "none";
        }}
      />

      <div>
        <span className="ltc-logo-title" style={fontMontserrat}>Hotel &amp; Resort</span>
        <p style={fontPontano}>Resort, venue, hotel, and events booking services.</p>
      </div>
    </button>
  );


  return (
    <div className="ltc-hotel-signup-page" style={fontPontano}>
      <style>{`
        

        .ltc-hotel-signup-page {
          --green-950: #071f14;
          --green-900: #0e3321;
          --green-800: #174a30;
          --green-700: #235f3e;
          --footer-green: #082719;
          --gold: #d7a84d;
          --gold-soft: #f4d484;
          --dark: #101828;
          --muted: #667085;
          --shadow-lg: 0 28px 70px rgba(8,39,25,.18);
          --radius: 24px;
          --ease: cubic-bezier(.22,1,.36,1);

          min-height: 100vh;
          color: var(--dark);
          overflow-x: hidden;
          font-family: "Inter", Arial, sans-serif;
        }

        .ltc-hotel-signup-page * {
          box-sizing: border-box;
        }

        .ltc-signup-shell {
          position: relative;
          min-height: 100vh;
          overflow: hidden;
          isolation: isolate;
          color: white;
          background: linear-gradient(120deg, #03180f 0%, #082719 42%, #155f3b 100%);
        }

        .ltc-login-bg {
          position: absolute;
          inset: 0;
          z-index: -4;
          width: 100%;
          height: 100%;
          background-size: cover;
          background-position: center;
          opacity: 0;
          transform: scale(1.04);
          transition: opacity 1000ms ease;
        }

        .ltc-login-bg.active {
          opacity: 1;
        }

        .ltc-signup-shell::before {
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

        .ltc-signup-shell::after {
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

        .ltc-container {
          width: min(1180px, 92%);
          margin: auto;
        }

        .ltc-header {
          position: relative;
          z-index: 20;
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

        .ltc-logo-title {
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

        .ltc-signup-main {
          position: relative;
          z-index: 5;
          min-height: calc(100vh - 76px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 44px 0;
        }

        .ltc-login-card {
          position: relative;
          overflow: hidden;
          width: min(720px, 100%);
          border-radius: 28px;
          background: rgba(231,238,233,.88);
          border: 1px solid rgba(255,255,255,.78);
          box-shadow: var(--shadow-lg);
          backdrop-filter: blur(18px);
          padding: 28px 34px 30px;
        }

        .ltc-login-card::before {
          content: "";
          position: absolute;
          inset: 0 0 auto;
          height: 5px;
          background: linear-gradient(90deg,var(--green-700),var(--gold));
          z-index: 3;
        }

        .ltc-card-title {
          text-align: center;
          margin-bottom: 24px;
        }

        .ltc-card-title p {
          margin: 0;
          color: var(--green-700);
          font-size: 12px;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: .2em;
        }

        .ltc-card-title h1 {
          margin: 8px 0 0;
          color: var(--green-950);
          font-size: clamp(36px, 4vw, 50px);
          line-height: 1.02;
          font-weight: 900;
          letter-spacing: -.055em;
        }

        .ltc-card-title h1 span {
          color: var(--gold);
        }

        .ltc-error-alert,
        .ltc-success-alert {
          margin-bottom: 14px;
          border-radius: 14px;
          padding: 10px 14px;
          text-align: center;
          font-size: 12px;
          line-height: 1.45;
          font-weight: 700;
        }

        .ltc-error-alert {
          border: 1px solid rgba(239,68,68,.22);
          background: rgba(239,68,68,.10);
          color: #b42318;
        }

        .ltc-success-alert {
          border: 1px solid rgba(16,185,129,.25);
          background: rgba(16,185,129,.10);
          color: #047857;
        }

        .ltc-login-form {
          display: grid;
          gap: 12px;
        }

        .ltc-form-grid {
          display: grid;
          gap: 12px;
        }

        .ltc-form-grid.three {
          grid-template-columns: repeat(3, minmax(0, 1fr));
        }

        .ltc-form-grid.two {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }

        .ltc-field-wrap {
          display: grid;
          grid-template-rows: 48px minmax(14px, auto);
          gap: 5px;
          min-width: 0;
          align-content: start;
        }

        .ltc-input-shell {
          position: relative;
          min-width: 0;
          height: 48px;
          min-height: 48px;
          flex: 0 0 48px;
        }

        .ltc-input-icon {
          pointer-events: none;
          position: absolute;
          left: 15px;
          top: 24px;
          transform: translateY(-50%);
          color: var(--green-700);
          display: grid;
          place-items: center;
          z-index: 2;
        }

        .ltc-input-icon-svg {
          width: 18px;
          height: 18px;
        }

        .ltc-password-control {
          display: grid;
          grid-template-columns: minmax(0, 1fr) 48px;
          align-items: center;
          gap: 8px;
          width: 100%;
          min-width: 0;
          height: 48px;
        }

        .ltc-eye-button {
          width: 48px;
          height: 48px;
          min-width: 48px;
          min-height: 48px;
          border: 1px solid rgba(35,95,62,.12);
          border-radius: 999px;
          background: rgba(255,255,255,.92);
          color: var(--green-700);
          cursor: pointer;
          display: grid;
          place-items: center;
          padding: 0;
          transition: .25s var(--ease);
          box-shadow: 0 8px 18px rgba(8,39,25,.045);
        }

        .ltc-eye-button:hover {
          color: var(--green-950);
          border-color: rgba(35,95,62,.28);
          background: #fff;
        }

        .ltc-eye-button:focus-visible {
          outline: 3px solid rgba(215,168,77,.55);
          outline-offset: 2px;
        }

        .ltc-input,
        .ltc-select {
          display: block;
          width: 100%;
          height: 48px;
          min-height: 48px;
          max-height: 48px;
          border: 1px solid rgba(35,95,62,.10);
          background: rgba(255,255,255,.92);
          color: var(--dark);
          border-radius: 999px;
          font-size: 13.5px;
          line-height: 48px;
          outline: none;
          transition: .25s var(--ease);
          font-family: inherit;
          box-shadow: 0 8px 18px rgba(8,39,25,.045);
        }

        .ltc-input {
          padding: 0 15px 0 45px;
        }

        .ltc-select {
          padding: 0 16px;
          cursor: pointer;
          appearance: auto;
        }

        .ltc-input.has-eye {
          padding-right: 15px;
        }

        .ltc-input::placeholder {
          color: rgba(102,112,133,.74);
        }

        .ltc-input:focus,
        .ltc-select:focus {
          border-color: var(--green-700);
          background: white;
          box-shadow: 0 0 0 4px rgba(35,95,62,.10);
        }

        .ltc-input.error,
        .ltc-select.error {
          border-color: rgba(239,68,68,.55);
          box-shadow: 0 0 0 4px rgba(239,68,68,.08);
        }

        .ltc-field-error,
        .ltc-status-text {
          min-height: 14px;
          margin: 0;
          padding: 0 14px;
          font-size: 10.5px;
          line-height: 1.35;
        }

        .ltc-field-error,
        .ltc-status-bad {
          color: #b42318;
        }

        .ltc-status-ok {
          color: #047857;
        }

        .ltc-status-neutral {
          color: var(--muted);
        }

        .ltc-policy-wrap {
          margin-top: 2px;
        }

        .ltc-policy-consent {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          color: #425466;
          font-size: 12.5px;
          line-height: 1.55;
        }

        .ltc-policy-checkbox {
          appearance: none;
          -webkit-appearance: none;
          width: 20px;
          height: 20px;
          min-width: 20px;
          margin: 0;
          margin-top: 1px;
          border: 2px solid var(--gold);
          border-radius: 5px;
          background: rgba(255,255,255,.92);
          cursor: pointer;
          display: grid;
          place-content: center;
          transition: .2s var(--ease);
        }

        .ltc-policy-checkbox::before {
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

        .ltc-policy-checkbox:checked {
          background: linear-gradient(135deg,#f4d484,#d7a84d);
          border-color: var(--gold);
        }

        .ltc-policy-checkbox.error {
          border-color: #d92d20;
          background: rgba(239,68,68,.06);
          box-shadow: 0 0 0 4px rgba(239,68,68,.08);
        }

        .ltc-policy-checkbox:checked::before {
          transform: rotate(-45deg) scale(1);
        }

        .ltc-policy-checkbox:focus-visible {
          outline: 3px solid rgba(215,168,77,.35);
          outline-offset: 2px;
        }

        .ltc-policy-text {
          flex: 1;
          min-width: 0;
        }

        .ltc-policy-text label {
          cursor: pointer;
        }

        .ltc-policy-link {
          display: inline;
          border: 0;
          background: transparent;
          padding: 0;
          margin: 0;
          color: #b98523;
          font: inherit;
          font-weight: 900;
          text-decoration: none;
          cursor: pointer;
          transition: .2s var(--ease);
        }

        .ltc-policy-link:hover {
          color: var(--green-800);
          text-decoration: underline;
          text-underline-offset: 3px;
        }

        .ltc-policy-link:focus-visible {
          outline: 2px solid rgba(215,168,77,.7);
          outline-offset: 3px;
          border-radius: 3px;
        }

        .ltc-policy-error {
          margin: 5px 0 0 30px;
          color: #b42318;
          font-size: 10.5px;
          line-height: 1.35;
        }

        .ltc-policy-modal-overlay {
          position: fixed;
          inset: 0;
          z-index: 1000;
          display: grid;
          place-items: center;
          padding: 24px;
          background: rgba(2, 18, 11, .72);
          backdrop-filter: blur(8px);
          animation: ltcPolicyFadeIn .18s ease-out;
        }

        .ltc-policy-modal {
          width: min(920px, 100%);
          height: min(86vh, 820px);
          min-height: 520px;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          border-radius: 24px;
          border: 1px solid rgba(255,255,255,.7);
          background: #f8faf8;
          box-shadow: 0 34px 90px rgba(0,0,0,.34);
          animation: ltcPolicyScaleIn .2s var(--ease);
        }

        .ltc-policy-modal-header {
          flex: 0 0 auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          padding: 18px 20px;
          color: white;
          background: linear-gradient(135deg, var(--green-950), var(--green-800));
          border-bottom: 3px solid var(--gold);
        }

        .ltc-policy-modal-heading {
          min-width: 0;
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
          font-size: clamp(19px, 2.5vw, 26px);
          line-height: 1.15;
          font-weight: 900;
        }

        .ltc-policy-modal-close {
          width: 42px;
          height: 42px;
          min-width: 42px;
          border: 1px solid rgba(255,255,255,.18);
          border-radius: 999px;
          background: rgba(255,255,255,.1);
          color: white;
          display: grid;
          place-items: center;
          font-size: 24px;
          line-height: 1;
          cursor: pointer;
          transition: .2s var(--ease);
        }

        .ltc-policy-modal-close:hover {
          background: rgba(255,255,255,.2);
          transform: rotate(4deg);
        }

        .ltc-policy-modal-close:focus-visible {
          outline: 3px solid rgba(244,212,132,.6);
          outline-offset: 2px;
        }

        .ltc-policy-modal-body {
          min-height: 0;
          flex: 1;
          display: flex;
          flex-direction: column;
          padding: 0;
          background: white;
        }

        .ltc-policy-document-scroll {
          width: 100%;
          height: 100%;
          flex: 1;
          overflow-y: auto;
          overscroll-behavior: contain;
          padding: 26px 30px 34px;
          background: white;
          scrollbar-width: thin;
          scrollbar-color: rgba(35,95,62,.38) transparent;
        }

        .ltc-policy-document {
          width: min(760px, 100%);
          margin: 0 auto;
          color: #25352d;
          font-size: 13.5px;
          line-height: 1.72;
        }

        .ltc-policy-document h1 {
          margin: 0 0 16px;
          color: var(--green-950);
          font-size: clamp(23px, 3vw, 31px);
          line-height: 1.15;
          font-weight: 900;
          letter-spacing: -.025em;
        }

        .ltc-policy-document h3 {
          margin: 24px 0 8px;
          color: var(--green-800);
          font-size: 16px;
          line-height: 1.35;
          font-weight: 900;
        }

        .ltc-policy-document p {
          margin: 0 0 12px;
        }

        .ltc-policy-document strong {
          color: #13281d;
          font-weight: 900;
        }

        .ltc-policy-document ul {
          margin: 4px 0 16px;
          padding-left: 24px;
        }

        .ltc-policy-document li {
          margin: 4px 0;
          padding-left: 2px;
        }

        .ltc-policy-document li::marker {
          color: var(--gold);
        }

        .ltc-policy-modal-footer {
          flex: 0 0 auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 14px;
          padding: 12px 18px;
          border-top: 1px solid rgba(16,24,40,.08);
          background: #f8faf8;
        }

        .ltc-policy-modal-note {
          margin: 0;
          color: var(--muted);
          font-size: 11.5px;
          line-height: 1.45;
        }

        .ltc-policy-modal-done {
          min-width: 110px;
          height: 40px;
          border: 0;
          border-radius: 999px;
          color: #102418;
          background: linear-gradient(135deg,#f4d484,#d7a84d);
          font-weight: 900;
          cursor: pointer;
          box-shadow: 0 10px 22px rgba(215,168,77,.22);
        }

        @keyframes ltcPolicyFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes ltcPolicyScaleIn {
          from { opacity: 0; transform: translateY(10px) scale(.985); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        .ltc-submit-button {
          margin: 8px auto 0;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          height: 48px;
          width: 100%;
          border-radius: 999px;
          border: 0;
          color: #102418;
          background: linear-gradient(135deg,#f4d484,#d7a84d);
          box-shadow: 0 14px 30px rgba(215,168,77,.25);
          font-size: 13.5px;
          font-weight: 900;
          cursor: pointer;
          transition: .28s var(--ease);
        }

        .ltc-submit-button:hover {
          transform: translateY(-2px);
        }

        .ltc-submit-button:disabled {
          cursor: not-allowed;
          opacity: .6;
          transform: none;
        }

        .ltc-auth-links {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          margin-top: 8px;
          color: var(--muted);
          font-size: 13px;
          line-height: 1.5;
          text-align: center;
        }

        .ltc-auth-links button {
          border: 0;
          background: transparent;
          color: var(--green-800);
          font-weight: 900;
          cursor: pointer;
          padding: 0;
          transition: .25s var(--ease);
        }

        .ltc-auth-links button:hover {
          color: var(--green-950);
          text-decoration: underline;
          text-underline-offset: 4px;
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

        .ltc-footer-brand-name {
          color: white;
          font-weight: 900;
          font-size: 20px;
          line-height: 1.2;
          margin: 0;
          text-transform: uppercase;
        }

        .ltc-footer-heading {
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

        @media (prefers-reduced-motion: reduce) {
          .ltc-login-bg,
          .ltc-nav-link,
          .ltc-eye-button,
          .ltc-submit-button,
          .ltc-auth-links button,
          .ltc-facebook-link {
            transition: none !important;
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

          .ltc-form-grid.three,
          .ltc-form-grid.two {
            grid-template-columns: 1fr;
          }

          .ltc-login-card {
            width: min(520px, 100%);
          }
        }

        @media (max-width: 600px) {
          .ltc-header .ltc-container,
          .ltc-footer .ltc-container {
            padding-left: 16px;
            padding-right: 16px;
          }

          .ltc-logo-title {
            font-size: 14px;
          }

          .ltc-logo p {
            font-size: 10px;
          }



          .ltc-policy-modal-overlay {
            padding: 10px;
          }

          .ltc-policy-modal {
            width: 100%;
            height: 92vh;
            min-height: 0;
            border-radius: 18px;
          }

          .ltc-policy-modal-header {
            padding: 14px 14px;
          }

          .ltc-policy-modal-footer {
            align-items: stretch;
            flex-direction: column;
            padding: 10px 12px 12px;
          }

          .ltc-policy-document-scroll {
            padding: 20px 16px 26px;
          }

          .ltc-policy-document {
            font-size: 13px;
            line-height: 1.68;
          }

          .ltc-policy-document h3 {
            margin-top: 21px;
          }

          .ltc-policy-modal-done {
            width: 100%;
          }

          .ltc-signup-main {
            min-height: auto;
            padding: 32px 0 44px;
          }

          .ltc-login-card {
            padding: 24px 18px;
            border-radius: 24px;
          }

          .ltc-card-title h1 {
            font-size: 36px;
          }

          .ltc-auth-links {
            flex-wrap: wrap;
          }
        }
      `}</style>

      <div className="ltc-signup-shell">
        {BACKGROUND_IMAGES.map((image, index) => (
          <div
            key={image}
            className={`ltc-login-bg ${bgIndex === index ? "active" : ""}`}
            style={{
              backgroundImage: `url('${image}')`,
            }}
          />
        ))}

        <header className="ltc-header">
          <div className="ltc-container ltc-nav">
            <CrownLogo />

            <nav className="ltc-desktop-nav" style={fontPoppins}>
              <button type="button" onClick={goToHome} className="ltc-nav-link">
                HOME
              </button>

              <button
                type="button"
                onClick={() => navigate("/virtual-tour")}
                className="ltc-nav-link"
              >
                VIRTUAL TOUR
              </button>

              <button type="button" onClick={goToContact} className="ltc-nav-link">
                CONTACT
              </button>

              <button
                type="button"
                onClick={() => navigate("/hotel-faqs")}
                className="ltc-nav-link"
              >
                FAQS
              </button>

              <button
                type="button"
                onClick={goToLogIn}
                className="ltc-nav-link ltc-profile-button"
              >
                SIGN IN
              </button>
            </nav>

            <button
              onClick={() => setIsOpen(true)}
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

        <main className="ltc-container ltc-signup-main">
          <section className="ltc-login-card">
            <div className="ltc-card-title">
              <p style={fontMontserrat}>Hotel &amp; Resort Account</p>
              <h1 style={fontMontserrat}>Create Your Account</h1>
            </div>

            {errorMessage ? (
              <div className="ltc-error-alert" style={fontPoppins}>
                {errorMessage}
              </div>
            ) : null}

            {successMessage ? (
              <div className="ltc-success-alert" style={fontPoppins}>
                {successMessage}
              </div>
            ) : null}

            <form
              className="ltc-login-form"
              onSubmit={(e) => {
                e.preventDefault();
                if (!isSubmitting) handleSignUp();
              }}
            >
              <div className="ltc-form-grid three">
                <div className="ltc-field-wrap">
                  <div className="ltc-input-shell">
                    <span className="ltc-input-icon">
                      <UserIcon />
                    </span>

                    <input
                      type="text"
                      maxLength={20}
                      placeholder="First Name"
                      className={`ltc-input ${fieldError("firstName") ? "error" : ""}`}
                      style={fontPoppins}
                      value={form.firstName}
                      onChange={(e) => onNameChange("firstName", e.target.value)}
                      onBlur={() => onBlurTrim("firstName")}
                    />
                  </div>

                  {fieldError("firstName") ? (
                    <p className="ltc-field-error" style={fontPoppins}>
                      {fieldError("firstName")}
                    </p>
                  ) : null}
                </div>

                <div className="ltc-field-wrap">
                  <div className="ltc-input-shell">
                    <span className="ltc-input-icon">
                      <UserIcon />
                    </span>

                    <input
                      type="text"
                      maxLength={20}
                      placeholder="Middle Name"
                      className={`ltc-input ${fieldError("middleName") ? "error" : ""}`}
                      style={fontPoppins}
                      value={form.middleName}
                      onChange={(e) => onNameChange("middleName", e.target.value)}
                      onBlur={() => onBlurTrim("middleName")}
                    />
                  </div>

                  {fieldError("middleName") ? (
                    <p className="ltc-field-error" style={fontPoppins}>
                      {fieldError("middleName")}
                    </p>
                  ) : null}
                </div>

                <div className="ltc-field-wrap">
                  <div className="ltc-input-shell">
                    <span className="ltc-input-icon">
                      <UserIcon />
                    </span>

                    <input
                      type="text"
                      maxLength={20}
                      placeholder="Last Name"
                      className={`ltc-input ${fieldError("lastName") ? "error" : ""}`}
                      style={fontPoppins}
                      value={form.lastName}
                      onChange={(e) => onNameChange("lastName", e.target.value)}
                      onBlur={() => onBlurTrim("lastName")}
                    />
                  </div>

                  {fieldError("lastName") ? (
                    <p className="ltc-field-error" style={fontPoppins}>
                      {fieldError("lastName")}
                    </p>
                  ) : null}
                </div>
              </div>

              <div className="ltc-form-grid two">
                <div className="ltc-field-wrap">
                  <div className="ltc-input-shell">
                    <span className="ltc-input-icon">
                      <PhoneIcon />
                    </span>

                    <input
                      type="tel"
                      inputMode="numeric"
                      maxLength={11}
                      placeholder={PHONE_PLACEHOLDER}
                      className={`ltc-input ${fieldError("phone") ? "error" : ""}`}
                      style={fontPoppins}
                      value={form.phone}
                      onChange={(e) => onPhoneChange(e.target.value)}
                    />
                  </div>

                  {fieldError("phone") ? (
                    <p className="ltc-field-error" style={fontPoppins}>
                      {fieldError("phone")}
                    </p>
                  ) : null}
                </div>

                <div className="ltc-field-wrap">
                  <div className="ltc-input-shell">
                    <span className="ltc-input-icon">
                      <UserIcon />
                    </span>

                    <input
                      type="text"
                      maxLength={USERNAME_MAX_LENGTH}
                      placeholder="Username"
                      className={`ltc-input ${fieldError("username") ? "error" : ""}`}
                      style={fontPoppins}
                      value={form.username}
                      onChange={(e) => onUsernameChange(e.target.value)}
                      onBlur={() => onBlurTrim("username")}
                    />
                  </div>

                  {fieldError("username") ? (
                    <p className="ltc-field-error" style={fontPoppins}>
                      {fieldError("username")}
                    </p>
                  ) : null}

                  {!errors.username && usernameAvailable === false ? (
                    <p className={`ltc-status-text ${getStatusColor("bad")}`} style={fontPoppins}>
                      Username already taken
                    </p>
                  ) : null}

                  {!errors.username && usernameAvailable === true ? (
                    <p className={`ltc-status-text ${getStatusColor("ok")}`} style={fontPoppins}>
                      Username is available
                    </p>
                  ) : null}

                  {checkingUsername ? (
                    <p className={`ltc-status-text ${getStatusColor("neutral")}`} style={fontPoppins}>
                      Checking...
                    </p>
                  ) : null}
                </div>
              </div>

              <div className="ltc-form-grid two">
                <div className="ltc-field-wrap">
                  <div className="ltc-password-control">
                    <div className="ltc-input-shell">
                      <span className="ltc-input-icon">
                        <LockIcon />
                      </span>

                      <input
                        id="hotel-signup-password"
                        type={showPassword ? "text" : "password"}
                        maxLength={20}
                        placeholder="Password"
                        className={`ltc-input has-eye ${fieldError("password") ? "error" : ""}`}
                        style={fontPoppins}
                        value={form.password}
                        onChange={(e) => setField("password", e.target.value)}
                        autoComplete="new-password"
                        aria-invalid={fieldError("password") ? "true" : "false"}
                        aria-describedby={fieldError("password") ? "hotel-signup-password-error" : undefined}
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="ltc-eye-button"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      aria-controls="hotel-signup-password"
                    >
                      <EyeIcon open={showPassword} />
                    </button>
                  </div>

                  {fieldError("password") ? (
                    <p id="hotel-signup-password-error" className="ltc-field-error" style={fontPoppins}>
                      {fieldError("password")}
                    </p>
                  ) : null}
                </div>

                <div className="ltc-field-wrap">
                  <div className="ltc-password-control">
                    <div className="ltc-input-shell">
                      <span className="ltc-input-icon">
                        <LockIcon />
                      </span>

                      <input
                        id="hotel-signup-confirm-password"
                        type={showConfirmPassword ? "text" : "password"}
                        maxLength={20}
                        placeholder="Confirm Password"
                        className={`ltc-input has-eye ${fieldError("confirmPassword") ? "error" : ""}`}
                        style={fontPoppins}
                        value={form.confirmPassword}
                        onChange={(e) => setField("confirmPassword", e.target.value)}
                        autoComplete="new-password"
                        aria-invalid={fieldError("confirmPassword") ? "true" : "false"}
                        aria-describedby={fieldError("confirmPassword") ? "hotel-signup-confirm-password-error" : undefined}
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((v) => !v)}
                      className="ltc-eye-button"
                      aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                      aria-controls="hotel-signup-confirm-password"
                    >
                      <EyeIcon open={showConfirmPassword} />
                    </button>
                  </div>

                  {fieldError("confirmPassword") ? (
                    <p id="hotel-signup-confirm-password-error" className="ltc-field-error" style={fontPoppins}>
                      {fieldError("confirmPassword")}
                    </p>
                  ) : null}
                </div>
              </div>

              <div className="ltc-field-wrap">
                <div className="ltc-input-shell">
                  <span className="ltc-input-icon">
                    <MailIcon />
                  </span>

                  <input
                    type="email"
                    maxLength={50}
                    placeholder="Email"
                    className={`ltc-input ${fieldError("email") ? "error" : ""}`}
                    style={fontPoppins}
                    value={form.email}
                    onChange={(e) => onEmailChange(e.target.value)}
                    onBlur={() => onBlurTrim("email")}
                  />
                </div>

                {fieldError("email") ? (
                  <p className="ltc-field-error" style={fontPoppins}>
                    {fieldError("email")}
                  </p>
                ) : null}

                {!errors.email && emailAvailable === false ? (
                  <p className={`ltc-status-text ${getStatusColor("bad")}`} style={fontPoppins}>
                    Email already exists
                  </p>
                ) : null}

                {!errors.email && emailAvailable === true ? (
                  <p className={`ltc-status-text ${getStatusColor("ok")}`} style={fontPoppins}>
                    Email is available
                  </p>
                ) : null}

                {checkingEmail ? (
                  <p className={`ltc-status-text ${getStatusColor("neutral")}`} style={fontPoppins}>
                    Checking...
                  </p>
                ) : null}
              </div>

              <div className="ltc-policy-wrap">
                <div className="ltc-policy-consent" style={fontPoppins}>
                  <input
                    id="hotel-policy-consent"
                    type="checkbox"
                    className={`ltc-policy-checkbox ${
                      policyTouched && !agreedToPolicies ? "error" : ""
                    }`}
                    checked={agreedToPolicies}
                    onChange={(e) => {
                      setAgreedToPolicies(e.target.checked);
                      setPolicyTouched(true);
                      setErrorMessage("");
                    }}
                    aria-required="true"
                    aria-invalid={policyTouched && !agreedToPolicies ? "true" : "false"}
                    aria-describedby={
                      policyTouched && !agreedToPolicies
                        ? "hotel-policy-consent-error"
                        : undefined
                    }
                  />

                  <div className="ltc-policy-text">
                    <label htmlFor="hotel-policy-consent">I agree to the </label>

                    <button
                      type="button"
                      className="ltc-policy-link"
                      onClick={() => setPolicyModal("terms")}
                    >
                      Terms &amp; Conditions
                    </button>

                    <span> and </span>

                    <button
                      type="button"
                      className="ltc-policy-link"
                      onClick={() => setPolicyModal("privacy")}
                    >
                      Privacy Policy
                    </button>
                  </div>
                </div>

                {policyTouched && !agreedToPolicies ? (
                  <p
                    id="hotel-policy-consent-error"
                    className="ltc-policy-error"
                    style={fontPoppins}
                  >
                    You must agree to the Terms &amp; Conditions and Privacy Policy before creating an account.
                  </p>
                ) : null}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="ltc-submit-button"
                style={fontMontserrat}
              >
                {isSubmitting ? "CREATING..." : "SIGN UP"}
              </button>

              <div className="ltc-auth-links" style={fontPoppins}>
                <span>Already have an account?</span>

                <button type="button" onClick={goToLogIn}>
                  Sign In
                </button>
              </div>
            </form>
          </section>
        </main>
      </div>

      {isOpen ? (
        <MobileMenu
          onClose={() => setIsOpen(false)}
          navigate={navigate}
          goToProfile={() => navigate(getHotelToken() ? "/hotel-profile" : "/hotel-login")}
        />
      ) : null}

      {policyModal ? (
        <PolicyModal
          type={policyModal}
          onClose={() => setPolicyModal(null)}
        />
      ) : null}

      <Footer />
    </div>
  );
};


function renderPolicyInline(text) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g).filter(Boolean);

  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={`${part}-${index}`}>{part.slice(2, -2)}</strong>;
    }

    return <React.Fragment key={`${part}-${index}`}>{part}</React.Fragment>;
  });
}

function PolicyDocument({ content }) {
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
        <h1 key={`policy-h1-${index}`} style={fontMontserrat}>
          {renderPolicyInline(line.slice(2))}
        </h1>
      );
      return;
    }

    if (line.startsWith("### ")) {
      elements.push(
        <h3 key={`policy-h3-${index}`} style={fontMontserrat}>
          {renderPolicyInline(line.slice(4))}
        </h3>
      );
      return;
    }

    elements.push(
      <p key={`policy-p-${index}`} style={fontPoppins}>
        {renderPolicyInline(line)}
      </p>
    );
  });

  flushList();

  return <div className="ltc-policy-document">{elements}</div>;
}

function PolicyModal({ type, onClose }) {
  const isTerms = type === "terms";
  const title = isTerms ? "Terms & Conditions" : "Privacy Policy";
  const content = isTerms
    ? TERMS_AND_CONDITIONS_TEXT
    : PRIVACY_POLICY_TEXT;

  return (
    <div
      className="ltc-policy-modal-overlay"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <section
        className="ltc-policy-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="ltc-policy-modal-title"
      >
        <div className="ltc-policy-modal-header">
          <div className="ltc-policy-modal-heading">
            <p className="ltc-policy-modal-kicker" style={fontMontserrat}>
              LUMISPIRE HOTEL &amp; RESORT
            </p>

            <h2
              id="ltc-policy-modal-title"
              className="ltc-policy-modal-title"
              style={fontMontserrat}
            >
              {title}
            </h2>
          </div>

          <button
            type="button"
            className="ltc-policy-modal-close"
            onClick={onClose}
            aria-label={`Close ${title}`}
            title="Close"
          >
            ×
          </button>
        </div>

        <div className="ltc-policy-modal-body">
          <div className="ltc-policy-document-scroll">
            <PolicyDocument content={content} />
          </div>
        </div>

        <div className="ltc-policy-modal-footer">
          <p className="ltc-policy-modal-note" style={fontPoppins}>
            Review the information above, then select DONE to continue creating your account.
          </p>

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


function Footer() {
  return (
    <footer className="ltc-footer">
      <div className="ltc-container ltc-footer-grid">
        <div>
          <div className="ltc-footer-brand">
            <img
              src="/HotelLumispireLogo.webp"
              alt="Lumispire logo"
              onError={(event) => {
                event.currentTarget.style.display = "none";
              }}
            />

            <p className="ltc-footer-brand-name" style={fontMontserrat}>Lumispire</p>
          </div>
        </div>

        <FooterColumn title="Menu">
          <FooterLink onClick={() => (window.location.href = "/resort-venue")}>Home</FooterLink>
          <FooterLink onClick={() => (window.location.href = "/virtual-tour")}>
            Virtual Tour
          </FooterLink>
          <FooterLink onClick={() => (window.location.href = "/hotel-contact-us")}>
            Contact
          </FooterLink>
          <FooterLink onClick={() => (window.location.href = "/hotel-faqs")}>FAQs</FooterLink>
          <FooterLink
            onClick={() => {
              window.location.href = getHotelToken() ? "/hotel-profile" : "/hotel-login";
            }}
          >
            {getHotelToken() ? "Profile" : "Sign In"}
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
    <section>
      <h2 className="ltc-footer-heading" style={fontMontserrat}>{title}</h2>
      <div>{children}</div>
    </section>
  );
}

function FooterLink({ children, onClick }) {
  return (
    <button onClick={onClick} type="button" className="ltc-footer-link" style={fontPontano}>
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
  const signedIn = getHotelToken();

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
          label={signedIn ? "PROFILE" : "SIGN IN"}
          active={!signedIn}
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


export default HotelSignUp;