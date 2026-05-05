import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

const DEFAULT_ID_UPLOAD_POLICY = {
  canUpload: true,
  blockType: "",
  message: "You can upload an ID now.",
  lockedUntil: null,
  secondsRemaining: 0,
};

const NAV_ITEMS = [
  { label: "Home", path: "/hotel-resort" },
  { label: "Virtual Tour", path: "/virtual-tour" },
  { label: "Recommendations", path: "/hotel-recommendations" },
  { label: "FAQs", path: "/hotel-faqs" },
  { label: "Profile", path: "/hotel-profile" },
  { label: "Contact", path: "/hotel-contact-us" },
];

const BOT_KNOWLEDGE = [
  {
    question: "How do I book a hotel room?",
    keywords: ["hotel", "room", "condo", "book", "booking", "stay"],
    answer:
      "To book a hotel or condo room, go to Hotel & Condo, choose a room package, select duration, date, time slot, pax, payment method, then upload proof of payment.",
  },
  {
    question: "How do I book a resort or venue?",
    keywords: ["resort", "venue", "lorenzo", "hall", "veranda", "cavanas", "campsite"],
    answer:
      "To book a resort or venue, go to Resort & Venue, choose your venue, select available duration and time slot, enter pax, choose payment method, upload proof of payment, then submit.",
  },
  {
    question: "How do I book an event package?",
    keywords: ["event", "package", "wedding", "debut", "birthday", "corporate"],
    answer:
      "To book an event package, open Event Package, choose package, venue, capacity variation, event date, time slot, menu choices, payment method, and proof of payment.",
  },
  {
    question: "What payment methods are accepted?",
    keywords: ["payment", "pay", "gcash", "bank", "transfer", "proof", "receipt"],
    answer:
      "The system accepts GCash and Bank Transfer. You must upload a valid proof of payment image or PDF before submitting your booking.",
  },
  {
    question: "What does pending booking mean?",
    keywords: ["pending", "confirmed", "cancelled", "approved", "status", "rejected"],
    answer:
      "Pending means your booking is waiting for admin approval. Confirmed means it was approved. Cancelled means it was rejected, cancelled, or no longer active.",
  },
  {
    question: "Why is my time slot unavailable?",
    keywords: ["time", "slot", "unavailable", "conflict", "available", "date"],
    answer:
      "A time slot can be unavailable if another pending or confirmed booking overlaps with it. Some bookings require at least a 1-hour gap before or after another booking.",
  },
  {
    question: "Why did the price increase?",
    keywords: ["price", "increase", "expensive", "dynamic", "weekend", "seasonal", "pax"],
    answer:
      "Prices may increase because of seasonal dates, weekends, monthly booking demand, or additional pax beyond the base capacity.",
  },
  {
    question: "Why do I need ID verification?",
    keywords: ["id", "verification", "verify", "identity", "government", "upload id"],
    answer:
      "ID verification helps confirm that bookings are made by a real guest. Upload a clear valid government ID from your profile and wait for admin review.",
  },
  {
    question: "Why is my ID pending?",
    keywords: ["pending id", "manual review", "pending", "review", "waiting"],
    answer:
      "Pending ID verification means your uploaded ID is waiting for admin review. You can upload again only after the admin rejects your current ID.",
  },
  {
    question: "Why was my ID rejected?",
    keywords: ["rejected", "invalid id", "not id", "ai rejected", "auto rejected"],
    answer:
      "Your ID may be rejected if the file is unclear, unreadable, not a government ID, expired, or does not show enough identity details. Upload a clearer valid government ID when allowed.",
  },
  {
    question: "How do I reset my password?",
    keywords: ["forgot", "password", "reset", "login"],
    answer:
      "Go to Forgot Password, enter your registered email, and check your email for the reset link. Use the reset link before it expires.",
  },
  {
    question: "How do I change my password?",
    keywords: ["change password", "otp", "current password", "new password"],
    answer:
      "From your profile, click Change Password. Enter your current password and new password, then verify the OTP sent to your registered email.",
  },
  {
    question: "Where can I get recommendations?",
    keywords: ["recommend", "recommendation", "suggest", "best", "package"],
    answer:
      "Open Hotel Recommendations to get suggested hotel, resort, and event options based on your preferences.",
    route: "/hotel-recommendations",
    routeLabel: "Open Recommendations",
  },
  {
    question: "Where can I read all FAQs?",
    keywords: ["faq", "faqs", "help", "questions", "guide"],
    answer:
      "Open the Hotel FAQs page to read detailed answers about booking, payment, ID verification, account, and support concerns.",
    route: "/hotel-faqs",
    routeLabel: "Open FAQs",
  },
];

function getHotelApiBase() {
  const raw = (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(
    /\/+$/,
    ""
  );

  if (raw.endsWith("/api/hotel")) return raw;
  if (raw.endsWith("/api")) return `${raw}/hotel`;

  return `${raw}/api/hotel`;
}

function getServerBase() {
  const raw = (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(
    /\/+$/,
    ""
  );

  return raw.replace(/\/api\/.*$/, "");
}

function normalizeIdUploadPolicy(policy, data = {}) {
  if (policy && typeof policy.canUpload === "boolean") {
    return {
      ...DEFAULT_ID_UPLOAD_POLICY,
      ...policy,
    };
  }

  if (data.isIdentityVerified || data.idVerificationStatus === "verified") {
    return {
      canUpload: false,
      blockType: "verified",
      message: "Your ID is already approved. Uploading another ID is disabled.",
      lockedUntil: null,
      secondsRemaining: 0,
    };
  }

  if (data.idVerificationStatus === "pending") {
    return {
      canUpload: false,
      blockType: "manual_review",
      message:
        "Your uploaded ID is still under manual review. You can upload again only after the admin rejects it.",
      lockedUntil: null,
      secondsRemaining: 0,
    };
  }

  return DEFAULT_ID_UPLOAD_POLICY;
}

function formatRemaining(seconds) {
  const safeSeconds = Math.max(0, Number(seconds || 0));

  if (safeSeconds <= 0) return "0 seconds";

  if (safeSeconds < 60) {
    return `${safeSeconds} second${safeSeconds === 1 ? "" : "s"}`;
  }

  const minutes = Math.floor(safeSeconds / 60);
  const rest = safeSeconds % 60;

  return `${minutes} minute${minutes === 1 ? "" : "s"}${
    rest ? ` and ${rest} second${rest === 1 ? "" : "s"}` : ""
  }`;
}

function humanize(value = "unknown") {
  return String(value || "unknown").replaceAll("_", " ");
}

function getBotReply(message = "") {
  const input = String(message || "").toLowerCase().trim();

  if (!input) {
    return {
      answer: "Please type a hotel question first.",
      matched: null,
    };
  }

  let bestMatch = null;
  let bestScore = 0;

  BOT_KNOWLEDGE.forEach((item) => {
    let score = 0;

    item.keywords.forEach((keyword) => {
      const cleanKeyword = keyword.toLowerCase();

      if (input.includes(cleanKeyword)) {
        score += cleanKeyword.length > 6 ? 2 : 1;
      }
    });

    if (input.includes(item.question.toLowerCase())) {
      score += 5;
    }

    if (score > bestScore) {
      bestScore = score;
      bestMatch = item;
    }
  });

  if (!bestMatch || bestScore === 0) {
    return {
      answer:
        "I can answer basic hotel questions about booking, payment, ID verification, booking status, time slots, prices, password reset, FAQs, and recommendations. Try asking: “How do I book a resort?” or “Why is my ID pending?”",
      matched: null,
    };
  }

  return {
    answer: bestMatch.answer,
    matched: bestMatch,
  };
}

const HotelProfile = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const idFileInputRef = useRef(null);

  const API_BASE = useMemo(() => getHotelApiBase(), []);
  const SERVER_BASE = useMemo(() => getServerBase(), []);

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    phone: "",
    profilePicture: "",
    idVerificationStatus: "not_submitted",
    isIdentityVerified: false,
    idVerificationRemarks: "",
    idUploadPolicy: DEFAULT_ID_UPLOAD_POLICY,
    aiConnected: false,
    aiConnectionStatus: "not_checked",
    aiSummary: "",
    aiDecision: "unknown",
    aiRiskLevel: "unknown",
    aiDocumentType: "unknown",
    aiCheckedAt: null,
    aiError: "",
  });

  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState("");
  const [status, setStatus] = useState({ type: "", message: "" });
  const [isOpen, setIsOpen] = useState(false);

  const [idFile, setIdFile] = useState(null);
  const [consentGiven, setConsentGiven] = useState(false);
  const [idUploading, setIdUploading] = useState(false);
  const [lastAiResult, setLastAiResult] = useState(null);
  const [now, setNow] = useState(Date.now());
  const [imageFailed, setImageFailed] = useState(false);
  const [isBotOpen, setIsBotOpen] = useState(false);

  const getHotelToken = () =>
    localStorage.getItem("token") || localStorage.getItem("hotelToken") || "";

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const resolveImageUrl = (url) => {
    if (!url) return "";

    if (
      url.startsWith("http://") ||
      url.startsWith("https://") ||
      url.startsWith("blob:") ||
      url.startsWith("data:")
    ) {
      return url;
    }

    return `${SERVER_BASE}${url.startsWith("/") ? url : `/${url}`}`;
  };

  const fetchProfile = async () => {
    const token = getHotelToken();

    if (!token) {
      navigate("/hotel-login", { replace: true });
      return;
    }

    setLoading(true);
    setStatus({ type: "", message: "" });

    try {
      const res = await fetch(`${API_BASE}/hotel-user-profile`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        localStorage.removeItem("token");
        localStorage.removeItem("hotelToken");
        navigate("/hotel-login", { replace: true });
        return;
      }

      const verification = data.hotelIdVerificationId || {};

      setForm({
        firstName: data.firstName || "",
        lastName: data.lastName || "",
        username: data.username || "",
        email: data.email || "",
        phone: data.phone || "",
        profilePicture: data.profilePicture || "",
        idVerificationStatus: data.idVerificationStatus || "not_submitted",
        isIdentityVerified: Boolean(data.isIdentityVerified),
        idVerificationRemarks: data.idVerificationRemarks || "",
        idUploadPolicy: normalizeIdUploadPolicy(data.idUploadPolicy, data),
        aiConnected: Boolean(verification.aiConnected),
        aiConnectionStatus: verification.aiConnectionStatus || "not_checked",
        aiSummary: verification.aiSummary || "",
        aiDecision: verification.aiDecision || "unknown",
        aiRiskLevel: verification.aiRiskLevel || "unknown",
        aiDocumentType: verification.aiDocumentType || "unknown",
        aiCheckedAt: verification.aiCheckedAt || null,
        aiError: verification.aiError || "",
      });

      setImageFailed(false);
    } catch (err) {
      console.error("fetchProfile error:", err);

      setStatus({
        type: "error",
        message: "Network error. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate, API_BASE]);

  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const idUploadPolicy = form.idUploadPolicy || DEFAULT_ID_UPLOAD_POLICY;

  const cooldownSeconds = useMemo(() => {
    if (!idUploadPolicy.lockedUntil) return 0;

    const target = new Date(idUploadPolicy.lockedUntil).getTime();

    if (!Number.isFinite(target)) return 0;

    return Math.max(0, Math.ceil((target - now) / 1000));
  }, [idUploadPolicy.lockedUntil, now]);

  const cooldownActive =
    idUploadPolicy.blockType === "cooldown" && cooldownSeconds > 0;

  const hardBlocked =
    !idUploadPolicy.canUpload && idUploadPolicy.blockType !== "cooldown";

  const canUploadIdNow =
    !loading && !idUploading && !hardBlocked && !cooldownActive;

  const uploadBlockMessage = useMemo(() => {
    if (cooldownActive) {
      return `Please wait ${formatRemaining(
        cooldownSeconds
      )} before uploading another ID.`;
    }

    if (hardBlocked) {
      return idUploadPolicy.message || "ID upload is currently disabled.";
    }

    return "";
  }, [cooldownActive, cooldownSeconds, hardBlocked, idUploadPolicy.message]);

  const handleSignOut = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("hotelToken");
    navigate("/hotel-resort", { replace: true });
  };

  const handleChoosePhoto = () => {
    fileInputRef.current?.click();
  };

  const handleChooseId = () => {
    if (!canUploadIdNow) {
      setStatus({
        type: "info",
        message: uploadBlockMessage || "ID upload is currently disabled.",
      });
      return;
    }

    idFileInputRef.current?.click();
  };

  const handleProfilePictureChange = async (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setStatus({
        type: "error",
        message: "Please select a valid image file.",
      });

      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    const maxSize = 5 * 1024 * 1024;

    if (file.size > maxSize) {
      setStatus({
        type: "error",
        message: "Image must be 5MB or smaller.",
      });

      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    const token = getHotelToken();

    if (!token) {
      navigate("/hotel-login", { replace: true });
      return;
    }

    if (previewUrl && previewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl);
    }

    const tempPreview = URL.createObjectURL(file);

    setPreviewUrl(tempPreview);
    setUploading(true);
    setImageFailed(false);
    setStatus({ type: "", message: "" });

    try {
      const formData = new FormData();
      formData.append("profilePicture", file);

      const res = await fetch(`${API_BASE}/profile-picture`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.message || "Failed to upload profile picture.");
      }

      const savedUrl =
        data.profilePicture ||
        data.user?.profilePicture ||
        data.data?.profilePicture ||
        "";

      setForm((prev) => ({
        ...prev,
        profilePicture: savedUrl,
      }));

      if (savedUrl) {
        URL.revokeObjectURL(tempPreview);
        setPreviewUrl("");
      }

      setStatus({
        type: "success",
        message: "Profile picture uploaded successfully.",
      });
    } catch (err) {
      console.error("handleProfilePictureChange error:", err);

      setPreviewUrl("");

      setStatus({
        type: "error",
        message: err.message || "Failed to upload profile picture.",
      });
    } finally {
      setUploading(false);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleIdFileChange = (event) => {
    if (!canUploadIdNow) {
      setStatus({
        type: "info",
        message: uploadBlockMessage || "ID upload is currently disabled.",
      });

      if (idFileInputRef.current) idFileInputRef.current.value = "";
      return;
    }

    const file = event.target.files?.[0];

    if (!file) return;

    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
      "application/pdf",
    ];

    if (!allowedTypes.includes(file.type)) {
      setStatus({
        type: "error",
        message: "Only JPG, JPEG, PNG, WEBP, and PDF files are allowed.",
      });

      if (idFileInputRef.current) idFileInputRef.current.value = "";
      return;
    }

    const maxSize = 8 * 1024 * 1024;

    if (file.size > maxSize) {
      setStatus({
        type: "error",
        message: "ID file must be 8MB or smaller.",
      });

      if (idFileInputRef.current) idFileInputRef.current.value = "";
      return;
    }

    setIdFile(file);
    setStatus({ type: "", message: "" });
  };

  const handleUploadId = async () => {
    const token = getHotelToken();

    if (!token) {
      navigate("/hotel-login", { replace: true });
      return;
    }

    if (!canUploadIdNow) {
      setStatus({
        type: "info",
        message: uploadBlockMessage || "ID upload is currently disabled.",
      });
      return;
    }

    if (!idFile) {
      setStatus({
        type: "error",
        message: "Please select an ID file to upload.",
      });
      return;
    }

    if (!consentGiven) {
      setStatus({
        type: "error",
        message: "You must agree before submitting your ID.",
      });
      return;
    }

    setIdUploading(true);
    setStatus({ type: "", message: "" });

    try {
      const formData = new FormData();
      formData.append("idImage", idFile);
      formData.append("consentGiven", "true");

      const res = await fetch(`${API_BASE}/upload-id`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        if (data.idUploadPolicy) {
          setForm((prev) => ({
            ...prev,
            idUploadPolicy: normalizeIdUploadPolicy(data.idUploadPolicy, data),
            idVerificationStatus:
              data.idVerificationStatus || prev.idVerificationStatus,
            isIdentityVerified:
              data.isIdentityVerified ?? prev.isIdentityVerified,
          }));
        }

        throw new Error(data.message || "Failed to upload ID.");
      }

      const aiResult = {
        aiConnected: Boolean(data.aiConnected),
        aiConnectionStatus: data.aiConnectionStatus || "not_checked",
        aiSummary: data.aiSummary || "",
        aiDecision: data.aiDecision || "unknown",
        aiRiskLevel: data.aiRiskLevel || "unknown",
        aiDocumentType: data.aiDocumentType || "unknown",
        aiCheckedAt: data.aiCheckedAt || null,
        aiError: data.aiError || "",
        confidenceScore: data.confidenceScore,
        reasons: Array.isArray(data.reasons) ? data.reasons : [],
      };

      setLastAiResult(aiResult);

      setForm((prev) => ({
        ...prev,
        idVerificationStatus: data.idVerificationStatus || prev.idVerificationStatus,
        isIdentityVerified: Boolean(data.isIdentityVerified),
        idVerificationRemarks:
          data.idVerificationRemarks || data.message || prev.idVerificationRemarks,
        idUploadPolicy: normalizeIdUploadPolicy(data.idUploadPolicy, data),
        aiConnected: Boolean(data.aiConnected),
        aiConnectionStatus: data.aiConnectionStatus || "not_checked",
        aiSummary: data.aiSummary || "",
        aiDecision: data.aiDecision || "unknown",
        aiRiskLevel: data.aiRiskLevel || "unknown",
        aiDocumentType: data.aiDocumentType || "unknown",
        aiCheckedAt: data.aiCheckedAt || null,
        aiError: data.aiError || "",
      }));

      setStatus({
        type: data.idVerificationStatus === "rejected" ? "error" : "success",
        message: data.message || "ID uploaded successfully.",
      });

      setIdFile(null);
      setConsentGiven(false);

      if (idFileInputRef.current) {
        idFileInputRef.current.value = "";
      }

      await fetchProfile();
    } catch (err) {
      console.error("handleUploadId error:", err);

      setStatus({
        type: "error",
        message: err.message || "Failed to upload ID.",
      });
    } finally {
      setIdUploading(false);
    }
  };

  const displayName = useMemo(() => {
    if (loading) return "Full Name";

    const full = `${form.firstName} ${form.lastName}`.trim();

    return full || "Full Name";
  }, [loading, form.firstName, form.lastName]);

  const initials = useMemo(() => {
    const first = form.firstName?.trim()?.[0] || "";
    const last = form.lastName?.trim()?.[0] || "";
    const user = form.username?.trim()?.[0] || "";

    return (first + last || user || "U").toUpperCase();
  }, [form.firstName, form.lastName, form.username]);

  const resolvedProfilePicture = resolveImageUrl(form.profilePicture);
  const profileImageSrc = previewUrl || resolvedProfilePicture;

  const verificationBadge = useMemo(() => {
    if (form.idVerificationStatus === "verified") {
      return {
        label: "Verified",
        className: "bg-emerald-100 text-emerald-700 border border-emerald-200",
      };
    }

    if (form.idVerificationStatus === "pending") {
      return {
        label: "Pending Review",
        className: "bg-amber-100 text-amber-700 border border-amber-200",
      };
    }

    if (form.idVerificationStatus === "rejected") {
      return {
        label: "Rejected",
        className: "bg-rose-100 text-rose-700 border border-rose-200",
      };
    }

    return {
      label: "Not Submitted",
      className: "bg-slate-100 text-slate-700 border border-slate-200",
    };
  }, [form.idVerificationStatus]);

  const aiBadge = useMemo(() => {
    const source = lastAiResult || form;
    const aiStatus = source.aiConnectionStatus || "not_checked";

    if (aiStatus === "connected") {
      return {
        label: "AI Connected",
        className: "border-emerald-200 bg-emerald-50 text-emerald-700",
      };
    }

    if (aiStatus === "missing_key") {
      return {
        label: "AI Key Missing",
        className: "border-amber-200 bg-amber-50 text-amber-700",
      };
    }

    if (aiStatus === "error") {
      return {
        label: "AI Check Failed",
        className: "border-rose-200 bg-rose-50 text-rose-700",
      };
    }

    if (aiStatus === "not_supported") {
      return {
        label: "AI Not Supported",
        className: "border-slate-200 bg-slate-50 text-slate-700",
      };
    }

    return {
      label: "AI Not Checked",
      className: "border-slate-200 bg-slate-50 text-slate-700",
    };
  }, [form, lastAiResult]);

  const aiDisplay = lastAiResult || form;

  const statusClass =
    status.type === "success"
      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
      : status.type === "info"
      ? "border-amber-200 bg-amber-50 text-amber-700"
      : "border-rose-200 bg-rose-50 text-rose-700";

  const uploadButtonText = idUploading
    ? "Uploading ID..."
    : form.idVerificationStatus === "verified"
    ? "ID Already Approved"
    : form.idVerificationStatus === "pending"
    ? "Waiting for Admin Review"
    : cooldownActive
    ? `Wait ${cooldownSeconds}s`
    : "Upload ID for Verification";

  return (
    <div className="min-h-screen bg-[#f6f6f3] font-['Inter',sans-serif] text-[#36523d]">
      <section className="relative overflow-hidden">
        <img
          src="/LogInSignUpBG.jpg"
          alt="My Profile"
          className="absolute inset-0 h-full w-full object-cover"
        />

        <div className="absolute inset-0 bg-gradient-to-b from-black/65 via-black/45 to-black/30" />

        <div className="relative z-10 mx-auto max-w-[1280px] px-4 pb-10 pt-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4 rounded-full border border-white/10 bg-black/10 px-4 py-3 backdrop-blur-md">
            <button
              type="button"
              onClick={() => navigate("/hotel-resort")}
              className="flex items-center gap-3"
              aria-label="Go to Hotel Home"
            >
              <img
                src="/Logo.jpg"
                alt="Logo"
                className="h-11 w-11 rounded-full object-cover ring-2 ring-white/50 sm:h-12 sm:w-12"
              />

              <span className="hidden font-['Montserrat',sans-serif] text-sm font-extrabold uppercase tracking-[0.24em] text-white sm:block">
                Lumispire
              </span>
            </button>

            <nav className="hidden items-center gap-6 lg:flex">
              {NAV_ITEMS.map((item) => (
                <button
                  key={item.path}
                  type="button"
                  onClick={() => navigate(item.path)}
                  className="font-['Montserrat',sans-serif] text-[13px] font-bold uppercase tracking-wide text-white transition hover:text-white/75"
                >
                  {item.label}
                </button>
              ))}
            </nav>

            <div className="hidden items-center gap-2 md:flex">
              <button
                type="button"
                onClick={() => navigate("/hotel-recommendations")}
                className="rounded-full border border-white/25 bg-white/10 px-4 py-2.5 text-xs font-extrabold uppercase tracking-wide text-white transition hover:bg-white/20"
              >
                Recommendations
              </button>

              <button
                type="button"
                onClick={() => setIsBotOpen(true)}
                className="rounded-full bg-white px-4 py-2.5 text-xs font-extrabold uppercase tracking-wide text-[#355E3B] shadow-lg transition hover:-translate-y-0.5 hover:bg-white/90"
              >
                Hotel Chatbot
              </button>
            </div>

            <button
              type="button"
              className="rounded-md p-2 text-white lg:hidden"
              onClick={() => setIsOpen(true)}
              aria-label="Open menu"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-7 w-7"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>

          <div className="mt-12 grid gap-8 lg:grid-cols-[1fr_360px] lg:items-end">
            <div>
              <p className="font-['Montserrat',sans-serif] text-xs font-extrabold uppercase tracking-[0.35em] text-white/75">
                Guest Account
              </p>

              <h1 className="mt-3 font-['Montserrat',sans-serif] text-[44px] font-extrabold leading-none text-white sm:text-[68px]">
                My Profile
              </h1>

              <p className="mt-4 max-w-2xl text-sm font-semibold leading-7 text-white/80 sm:text-base">
                Manage your profile, upload your ID, view recommended packages,
                and use the hotel chatbot for basic booking questions.
              </p>

              <div className="mt-6 flex flex-wrap items-center gap-3">
                <HeroButton onClick={() => navigate("/hotel-change-password")}>
                  Change Password
                </HeroButton>

                <HeroButton onClick={() => navigate("/hotel-recommendations")}>
                  Hotel Recommendations
                </HeroButton>

                <HeroButton onClick={() => setIsBotOpen(true)}>
                  Hotel Chatbot
                </HeroButton>

                <button
                  type="button"
                  onClick={handleSignOut}
                  className="rounded-full border-2 border-white bg-white/10 px-6 py-3 text-sm font-extrabold uppercase tracking-wide text-white shadow-md backdrop-blur-sm transition hover:bg-white/20"
                >
                  Sign Out
                </button>
              </div>
            </div>

            <div className="rounded-3xl border border-white/20 bg-white/15 p-5 text-white shadow-2xl backdrop-blur-md">
              <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-white/65">
                Basic Help
              </p>

              <h2 className="mt-2 text-2xl font-extrabold">Hotel FAQ Chatbot</h2>

              <p className="mt-2 text-sm font-semibold leading-6 text-white/75">
                Ask basic questions about booking, payment, time slots, ID
                verification, prices, and recommendations.
              </p>

              <button
                type="button"
                onClick={() => setIsBotOpen(true)}
                className="mt-4 w-full rounded-2xl bg-white px-5 py-3 text-sm font-extrabold text-[#355E3B] transition hover:bg-white/90"
              >
                OPEN HOTEL CHATBOT
              </button>

              <button
                type="button"
                onClick={() => navigate("/hotel-recommendations")}
                className="mt-3 w-full rounded-2xl border border-white/35 bg-white/10 px-5 py-3 text-sm font-extrabold text-white transition hover:bg-white/20"
              >
                VIEW RECOMMENDATIONS
              </button>
            </div>
          </div>
        </div>
      </section>

      <main className="bg-[#f6f6f3]">
        <div className="mx-auto max-w-[1280px] px-4 py-8 sm:px-6 lg:px-8">
          {status.message ? (
            <div
              className={`mb-6 rounded-2xl border px-5 py-4 text-sm font-semibold shadow-sm ${statusClass}`}
            >
              {status.message}
            </div>
          ) : null}

          <section className="grid gap-6 lg:grid-cols-[320px_1fr]">
            <aside className="rounded-[28px] border border-black/10 bg-white p-6 shadow-sm">
              <div className="mx-auto h-[220px] w-[220px] overflow-hidden rounded-full border-4 border-[#d8dacd] bg-[#e5e7df] shadow-inner">
                {profileImageSrc && !imageFailed ? (
                  <img
                    src={profileImageSrc}
                    alt="Profile"
                    className="h-full w-full object-cover"
                    onError={() => {
                      setImageFailed(true);
                      setStatus({
                        type: "error",
                        message: "Uploaded image could not be displayed.",
                      });
                    }}
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-[#e5e7df] font-['Montserrat',sans-serif] text-6xl font-extrabold text-[#3f5b44]">
                    {initials}
                  </div>
                )}
              </div>

              <div className="mt-5 text-center">
                <h2 className="font-['Montserrat',sans-serif] text-2xl font-extrabold text-[#36523d]">
                  {displayName}
                </h2>

                <p className="mt-1 text-sm font-bold text-[#36523d]/70">
                  {loading
                    ? "@username"
                    : form.username
                    ? `@${form.username}`
                    : "@username"}
                </p>

                <span
                  className={`mt-4 inline-flex rounded-full px-4 py-1.5 text-xs font-extrabold ${verificationBadge.className}`}
                >
                  {verificationBadge.label}
                </span>
              </div>

              <div className="mt-6 space-y-3">
                <button
                  type="button"
                  onClick={handleChoosePhoto}
                  disabled={uploading}
                  className="w-full rounded-2xl bg-gradient-to-b from-[#60765d] to-[#354a38] px-5 py-3 text-sm font-extrabold text-white shadow transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {uploading ? "Uploading Photo..." : "Upload Photo"}
                </button>

                <button
                  type="button"
                  onClick={() => navigate("/hotel-recommendations")}
                  className="w-full rounded-2xl border border-[#355E3B]/20 bg-[#355E3B]/10 px-5 py-3 text-sm font-extrabold text-[#355E3B] transition hover:bg-[#355E3B]/15"
                >
                  Hotel Recommendations
                </button>

                <button
                  type="button"
                  onClick={() => setIsBotOpen(true)}
                  className="w-full rounded-2xl border border-[#355E3B]/20 bg-white px-5 py-3 text-sm font-extrabold text-[#355E3B] transition hover:bg-[#355E3B]/5"
                >
                  Open Hotel Chatbot
                </button>

                <button
                  type="button"
                  onClick={() => navigate("/hotel-guest-reviews")}
                  className="w-full rounded-2xl border border-[#355E3B]/20 bg-white px-5 py-3 text-sm font-extrabold text-[#355E3B] transition hover:bg-[#355E3B]/5"
                >
                  My Approved Booking Reviews
                </button>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleProfilePictureChange}
                className="hidden"
              />
            </aside>

            <section className="space-y-6">
              <div className="rounded-[28px] border border-black/10 bg-white p-6 shadow-sm">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-[#6f806d]">
                      Account Information
                    </p>

                    <h3 className="mt-1 font-['Montserrat',sans-serif] text-2xl font-extrabold text-[#36523d]">
                      Personal Details
                    </h3>
                  </div>

                  <button
                    type="button"
                    onClick={() => navigate("/hotel-change-password")}
                    className="rounded-full bg-[#355E3B] px-5 py-2.5 text-xs font-extrabold uppercase tracking-wide text-white shadow transition hover:opacity-95"
                  >
                    Change Password
                  </button>
                </div>

                <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                  <ProfileField title="First Name" value={loading ? "Loading..." : form.firstName || "—"} />
                  <ProfileField title="Last Name" value={loading ? "Loading..." : form.lastName || "—"} />
                  <ProfileField title="Username" value={loading ? "Loading..." : form.username || "—"} />
                  <ProfileField title="Email" value={loading ? "Loading..." : form.email || "—"} />
                  <ProfileField title="Phone Number" value={loading ? "Loading..." : form.phone || "—"} />
                  <ProfileField
                    title="Identity Verification"
                    value={
                      loading
                        ? "Loading..."
                        : form.isIdentityVerified
                        ? "Verified"
                        : form.idVerificationStatus === "pending"
                        ? "Pending Review"
                        : form.idVerificationStatus === "rejected"
                        ? "Rejected"
                        : "Not Submitted"
                    }
                  />
                </div>
              </div>

              <div className="rounded-[28px] border border-black/10 bg-white p-6 shadow-sm">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-[#6f806d]">
                      Identity Verification
                    </p>

                    <h3 className="mt-1 font-['Montserrat',sans-serif] text-2xl font-extrabold text-[#36523d]">
                      Upload Government ID
                    </h3>

                    <p className="mt-2 max-w-3xl text-sm font-medium leading-7 text-[#36523d]/70">
                      Upload a valid government ID. The backend will run an AI
                      pre-check. Valid-looking IDs still wait for admin review.
                    </p>
                  </div>

                  <span
                    className={`inline-flex w-fit rounded-full px-4 py-1.5 text-xs font-extrabold ${verificationBadge.className}`}
                  >
                    {verificationBadge.label}
                  </span>
                </div>

                {uploadBlockMessage ? (
                  <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-700">
                    {uploadBlockMessage}
                  </div>
                ) : null}

                <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_auto] lg:items-end">
                  <div>
                    <label className="mb-2 block text-sm font-extrabold text-[#36523d]">
                      Selected File
                    </label>

                    <div className="rounded-2xl border border-[#cfd3c9] bg-[#f8f8f5] px-4 py-3 text-sm font-semibold text-[#36523d]/80">
                      {idFile ? idFile.name : "No file selected"}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleChooseId}
                    disabled={!canUploadIdNow}
                    className="rounded-2xl bg-[#355E3B] px-6 py-3 text-sm font-extrabold text-white shadow transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Choose ID File
                  </button>

                  <input
                    ref={idFileInputRef}
                    type="file"
                    accept=".jpg,.jpeg,.png,.webp,.pdf"
                    onChange={handleIdFileChange}
                    disabled={!canUploadIdNow}
                    className="hidden"
                  />
                </div>

                <label className="mt-5 flex items-start gap-3 rounded-2xl bg-[#f6f6f3] px-4 py-4 text-sm font-semibold text-[#36523d]/90">
                  <input
                    type="checkbox"
                    checked={consentGiven}
                    onChange={(event) => setConsentGiven(event.target.checked)}
                    disabled={!canUploadIdNow}
                    className="mt-1 h-4 w-4 disabled:cursor-not-allowed"
                  />

                  <span>
                    I agree to submit my ID for account verification and admin
                    review.
                  </span>
                </label>

                <div className="mt-5 rounded-2xl bg-[#f6f6f3] px-4 py-4">
                  <p className="text-sm font-semibold text-[#36523d]">
                    Current Status:{" "}
                    <span className="font-extrabold">
                      {form.idVerificationStatus === "verified"
                        ? "Verified"
                        : form.idVerificationStatus === "pending"
                        ? "Pending Review"
                        : form.idVerificationStatus === "rejected"
                        ? "Rejected"
                        : "Not Submitted"}
                    </span>
                  </p>

                  {form.idVerificationRemarks ? (
                    <p className="mt-2 text-sm font-medium text-[#36523d]/80">
                      Remarks: {form.idVerificationRemarks}
                    </p>
                  ) : null}

                  <p className="mt-2 text-xs font-bold text-[#36523d]/65">
                    Upload Rule:{" "}
                    {canUploadIdNow
                      ? "You can upload an ID now."
                      : uploadBlockMessage || "ID upload is currently blocked."}
                  </p>
                </div>

                <div className={`mt-5 rounded-2xl border px-4 py-4 ${aiBadge.className}`}>
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="text-sm font-extrabold">OpenAI ID Pre-check</p>

                    <span className="rounded-full bg-white/70 px-3 py-1 text-xs font-bold">
                      {aiBadge.label}
                    </span>
                  </div>

                  <div className="mt-4 grid grid-cols-1 gap-3 text-sm md:grid-cols-3">
                    <AiInfo title="AI Decision" value={humanize(aiDisplay.aiDecision)} />
                    <AiInfo title="Risk Level" value={aiDisplay.aiRiskLevel || "unknown"} />
                    <AiInfo title="Document Type" value={humanize(aiDisplay.aiDocumentType)} />
                  </div>

                  <p className="mt-4 text-sm font-medium leading-7">
                    {aiDisplay.aiSummary || "Upload your ID to run the AI pre-check."}
                  </p>

                  {aiDisplay.aiError ? (
                    <p className="mt-2 text-xs font-semibold text-rose-700">
                      AI Error: {aiDisplay.aiError}
                    </p>
                  ) : null}
                </div>

                <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
                  <button
                    type="button"
                    onClick={handleUploadId}
                    disabled={!canUploadIdNow || !idFile || idUploading}
                    className="rounded-2xl bg-gradient-to-b from-[#60765d] to-[#354a38] px-6 py-3 text-sm font-extrabold text-white shadow transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {uploadButtonText}
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsBotOpen(true)}
                    className="rounded-2xl border border-[#355E3B]/20 bg-white px-6 py-3 text-sm font-extrabold text-[#355E3B] transition hover:bg-[#355E3B]/5"
                  >
                    Ask Chatbot About ID
                  </button>
                </div>
              </div>
            </section>
          </section>
        </div>
      </main>

      <footer className="bg-[#355240] text-white">
        <div className="mx-auto max-w-[1280px] px-6 py-8">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
            <FooterColumn
              title="Menu"
              items={[
                { label: "Home", path: "/hotel-resort" },
                { label: "Recommendations", path: "/hotel-recommendations" },
                { label: "FAQs", path: "/hotel-faqs" },
                { label: "Hotel Chatbot", action: () => setIsBotOpen(true) },
              ]}
              navigate={navigate}
            />

            <div className="border-white/30 md:border-r md:pr-8">
              <h3 className="font-['Montserrat',sans-serif] text-[22px] font-bold">
                Contact Information
              </h3>

              <div className="mt-3 space-y-1 font-['Inter',sans-serif] text-[13px] text-white/90">
                <p>ltc.tami@gmail.com</p>
                <p>lorengladis@ltcmultiservices.com</p>
                <p>0995906805 / 09516281271</p>
              </div>
            </div>

            <div className="border-white/30 md:border-r md:pr-8">
              <h3 className="font-['Montserrat',sans-serif] text-[22px] font-bold">
                Address
              </h3>

              <div className="mt-3 space-y-1 font-['Inter',sans-serif] text-[13px] text-white/90">
                <p>2/F SGA Curie Street, Palanan,</p>
                <p>Makati City</p>
              </div>
            </div>

            <div>
              <h3 className="font-['Montserrat',sans-serif] text-[22px] font-bold">
                Basic Help
              </h3>

              <button
                type="button"
                onClick={() => setIsBotOpen(true)}
                className="mt-3 rounded-full bg-white px-5 py-2.5 text-xs font-extrabold uppercase tracking-wide text-[#355240] transition hover:bg-white/90"
              >
                Open Hotel Chatbot
              </button>
            </div>
          </div>

          <div className="mt-6 flex flex-col justify-between gap-2 border-t border-white/20 pt-4 text-[11px] text-white/90 md:flex-row">
            <p>© 2026 LTC GROUP OF COMPANIES. All rights reserved.</p>
            <p>Developed by CRMS Tech Alliance</p>
          </div>
        </div>
      </footer>

      <HotelFaqBot
        isOpen={isBotOpen}
        onClose={() => setIsBotOpen(false)}
        navigate={navigate}
      />

      <FloatingChatbotButton onClick={() => setIsBotOpen(true)} />

      {isOpen && (
        <div className="fixed inset-0 z-[70] lg:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setIsOpen(false)}
          />

          <div className="absolute right-0 top-0 h-full w-[320px] max-w-[88vw] bg-white p-5 shadow-2xl">
            <div className="mb-6 flex items-center justify-between">
              <div className="font-['Montserrat',sans-serif] text-lg font-bold text-[#355E3B]">
                MENU
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-md p-2 hover:bg-black/5"
                aria-label="Close menu"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-7 w-7 text-[#355E3B]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="space-y-3">
              {NAV_ITEMS.map((item) => (
                <MenuItem
                  key={item.path}
                  label={item.label.toUpperCase()}
                  onClick={() => {
                    setIsOpen(false);
                    navigate(item.path);
                  }}
                />
              ))}

              <MenuItem
                label="HOTEL CHATBOT"
                onClick={() => {
                  setIsOpen(false);
                  setIsBotOpen(true);
                }}
              />

              <MenuItem
                label="SIGN OUT"
                onClick={() => {
                  setIsOpen(false);
                  handleSignOut();
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

function HotelFaqBot({ isOpen, onClose, navigate }) {
  const [messages, setMessages] = useState([
    {
      role: "bot",
      text:
        "Hi! I am your Hotel FAQ Chatbot. Ask me basic questions about booking, payment, ID verification, booking status, prices, password reset, FAQs, and recommendations.",
      matched: null,
    },
  ]);
  const [input, setInput] = useState("");

  const quickQuestions = [
    "How do I book a resort?",
    "What payment methods are accepted?",
    "Why is my ID pending?",
    "Why is my time slot unavailable?",
    "Where can I get recommendations?",
  ];

  const sendMessage = (textValue = input) => {
    const clean = String(textValue || "").trim();

    if (!clean) return;

    const reply = getBotReply(clean);

    setMessages((prev) => [
      ...prev,
      { role: "user", text: clean, matched: null },
      { role: "bot", text: reply.answer, matched: reply.matched },
    ]);

    setInput("");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-end bg-black/30 p-4 sm:p-6">
      <div className="flex h-[620px] max-h-[88vh] w-full max-w-[430px] flex-col overflow-hidden rounded-[28px] bg-white shadow-2xl">
        <div className="bg-[#355240] px-5 py-4 text-white">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-white/60">
                Basic Questions
              </p>

              <h2 className="text-xl font-extrabold">Hotel FAQ Chatbot</h2>

              <p className="mt-1 text-xs font-semibold text-white/70">
                Automated answers for common hotel questions.
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="rounded-full bg-white/10 px-3 py-2 text-sm font-extrabold hover:bg-white/20"
              aria-label="Close chatbot"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="flex-1 space-y-3 overflow-y-auto bg-[#f6f6f3] p-4">
          {messages.map((message, index) => {
            const isBot = message.role === "bot";

            return (
              <div
                key={`${message.role}-${index}`}
                className={`flex ${isBot ? "justify-start" : "justify-end"}`}
              >
                <div
                  className={`max-w-[86%] rounded-2xl px-4 py-3 text-sm leading-6 shadow-sm ${
                    isBot
                      ? "bg-white text-[#36523d]"
                      : "bg-[#355240] text-white"
                  }`}
                >
                  <p className="font-semibold">{message.text}</p>

                  {isBot && message.matched?.route ? (
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        navigate(message.matched.route);
                      }}
                      className="mt-3 rounded-full bg-[#355240] px-4 py-2 text-xs font-extrabold text-white hover:opacity-90"
                    >
                      {message.matched.routeLabel || "Open Page"}
                    </button>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>

        <div className="border-t border-black/10 bg-white p-4">
          <div className="mb-3 flex gap-2 overflow-x-auto pb-1">
            {quickQuestions.map((question) => (
              <button
                key={question}
                type="button"
                onClick={() => sendMessage(question)}
                className="shrink-0 rounded-full border border-[#355240]/15 bg-[#355240]/5 px-3 py-2 text-xs font-bold text-[#355240] hover:bg-[#355240]/10"
              >
                {question}
              </button>
            ))}
          </div>

          <form
            onSubmit={(event) => {
              event.preventDefault();
              sendMessage();
            }}
            className="flex gap-2"
          >
            <input
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Ask a basic hotel question..."
              className="h-12 flex-1 rounded-2xl border border-black/10 bg-[#fafaf7] px-4 text-sm font-semibold text-[#36523d] outline-none focus:border-[#355240]"
            />

            <button
              type="submit"
              className="rounded-2xl bg-[#355240] px-5 text-sm font-extrabold text-white hover:bg-[#2b4334]"
            >
              Send
            </button>
          </form>

          <button
            type="button"
            onClick={() => {
              onClose();
              navigate("/hotel-faqs");
            }}
            className="mt-3 w-full rounded-2xl border border-[#355240]/15 bg-white px-4 py-3 text-xs font-extrabold uppercase tracking-wide text-[#355240] hover:bg-[#355240]/5"
          >
            View Complete FAQs
          </button>
        </div>
      </div>
    </div>
  );
}

function HeroButton({ children, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-full border-2 border-white bg-white/20 px-6 py-3 text-sm font-extrabold uppercase tracking-wide text-white shadow-md backdrop-blur-sm transition hover:bg-white/25"
    >
      {children}
    </button>
  );
}

function ProfileField({ title, value }) {
  return (
    <div className="rounded-2xl border border-black/5 bg-[#f8f8f5] p-4">
      <h3 className="font-['Montserrat',sans-serif] text-sm font-extrabold uppercase tracking-wide text-[#36523d]/65">
        {title}
      </h3>

      <p className="mt-2 break-words font-['Inter',sans-serif] text-sm font-bold leading-snug text-[#36523d]">
        {value}
      </p>
    </div>
  );
}

function AiInfo({ title, value }) {
  return (
    <div className="rounded-xl bg-white/60 px-3 py-3">
      <span className="block text-xs font-bold uppercase opacity-70">
        {title}
      </span>

      <span className="font-semibold capitalize">{value}</span>
    </div>
  );
}

function MenuItem({ label, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full rounded-xl bg-[#355E3B]/10 py-4 font-['Montserrat',sans-serif] text-sm font-semibold tracking-wide text-[#355E3B] transition hover:bg-[#355E3B]/20"
    >
      {label}
    </button>
  );
}

function FloatingChatbotButton({ onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="fixed bottom-6 right-6 z-[60] flex items-center gap-3 rounded-full bg-[#355240] px-5 py-4 text-white shadow-2xl transition hover:-translate-y-1 hover:bg-[#2a4233] focus:outline-none focus:ring-4 focus:ring-[#355240]/25"
      aria-label="Open hotel chatbot"
    >
      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-xl text-[#355240]">
        ?
      </span>

      <span className="hidden text-sm font-extrabold sm:block">
        Hotel Chatbot
      </span>
    </button>
  );
}

function FooterColumn({ title, items, navigate }) {
  return (
    <div className="border-white/30 md:border-r md:pr-8">
      <h3 className="font-['Montserrat',sans-serif] text-[22px] font-bold">
        {title}
      </h3>

      <div className="mt-3 space-y-1 font-['Inter',sans-serif] text-[13px] text-white/90">
        {items.map((item) => (
          <button
            key={item.path || item.label}
            type="button"
            onClick={() => {
              if (item.action) {
                item.action();
                return;
              }

              navigate(item.path);
            }}
            className="block transition hover:text-white/70"
          >
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export default HotelProfile;