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
    keywords: [
      "resort",
      "venue",
      "lorenzo",
      "hall",
      "veranda",
      "cavanas",
      "campsite",
    ],
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
    keywords: [
      "price",
      "increase",
      "expensive",
      "dynamic",
      "weekend",
      "seasonal",
      "pax",
    ],
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

const QUICK_QUESTIONS = [
  "How do I book a resort?",
  "What payment methods are accepted?",
  "Why is my ID pending?",
  "Why is my time slot unavailable?",
  "Where can I get recommendations?",
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
        "I can answer basic hotel questions about booking, payment, ID verification, booking status, time slots, prices, password reset, FAQs, and recommendations. Try asking: 'How do I book a resort?' or 'Why is my ID pending?'",
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
        idVerificationStatus:
          data.idVerificationStatus || prev.idVerificationStatus,
        isIdentityVerified: Boolean(data.isIdentityVerified),
        idVerificationRemarks:
          data.idVerificationRemarks ||
          data.message ||
          prev.idVerificationRemarks,
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
        className: "border-emerald-200 bg-emerald-50 text-emerald-700",
        dotClassName: "bg-emerald-500",
      };
    }

    if (form.idVerificationStatus === "pending") {
      return {
        label: "Pending Review",
        className: "border-amber-200 bg-amber-50 text-amber-700",
        dotClassName: "bg-amber-500",
      };
    }

    if (form.idVerificationStatus === "rejected") {
      return {
        label: "Rejected",
        className: "border-rose-200 bg-rose-50 text-rose-700",
        dotClassName: "bg-rose-500",
      };
    }

    return {
      label: "Not Submitted",
      className: "border-slate-200 bg-slate-50 text-slate-700",
      dotClassName: "bg-slate-400",
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

  const uploadButtonText = idUploading
    ? "Uploading ID..."
    : form.idVerificationStatus === "verified"
    ? "ID Already Approved"
    : form.idVerificationStatus === "pending"
    ? "Waiting for Admin Review"
    : cooldownActive
    ? `Wait ${cooldownSeconds}s`
    : "Upload ID for Verification";

  const accountFields = [
    { title: "First Name", value: loading ? "Loading..." : form.firstName || "-" },
    { title: "Last Name", value: loading ? "Loading..." : form.lastName || "-" },
    { title: "Username", value: loading ? "Loading..." : form.username || "-" },
    { title: "Email", value: loading ? "Loading..." : form.email || "-" },
    { title: "Phone Number", value: loading ? "Loading..." : form.phone || "-" },
    {
      title: "Identity Verification",
      value: loading
        ? "Loading..."
        : form.isIdentityVerified
        ? "Verified"
        : form.idVerificationStatus === "pending"
        ? "Pending Review"
        : form.idVerificationStatus === "rejected"
        ? "Rejected"
        : "Not Submitted",
    },
  ];

  const aiStats = [
    { title: "AI Decision", value: humanize(aiDisplay.aiDecision) },
    { title: "Risk Level", value: humanize(aiDisplay.aiRiskLevel) },
    { title: "Document Type", value: humanize(aiDisplay.aiDocumentType) },
  ];

  return (
    <div className="min-h-screen bg-[#f8f6ee] font-['Inter',sans-serif] text-[#24382b]">
      <section className="relative isolate overflow-hidden">
        <img
          src="/LogInSignUpBG.jpg"
          alt="Lumispire resort background"
          className="absolute inset-0 -z-20 h-full w-full object-cover"
        />
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(120deg,rgba(21,34,25,0.92),rgba(35,56,43,0.78),rgba(35,56,43,0.45))]" />
        <div className="absolute -right-28 top-24 -z-10 h-80 w-80 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-32 left-10 -z-10 h-96 w-96 rounded-full bg-[#c8b36f]/20 blur-3xl" />

        <ProfileHeader
          isOpen={isOpen}
          setIsOpen={setIsOpen}
          navigate={navigate}
          onOpenBot={() => setIsBotOpen(true)}
          onSignOut={handleSignOut}
        />

        <div className="mx-auto grid max-w-7xl gap-8 px-5 pb-12 pt-10 sm:px-8 lg:grid-cols-[1fr_380px] lg:px-12 lg:pb-16 lg:pt-14">
          <div className="max-w-3xl">
            <p className="inline-flex rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-extrabold uppercase tracking-[0.3em] text-white/75 backdrop-blur">
              Guest Account
            </p>

            <h1 className="mt-5 font-['Montserrat',sans-serif] text-4xl font-black leading-tight text-white sm:text-6xl lg:text-7xl">
              Welcome back,
              <span className="block text-white/85">{displayName}</span>
            </h1>

            <p className="mt-5 max-w-2xl text-base font-medium leading-8 text-white/75 sm:text-lg">
              Manage your profile photo, account details, ID verification, and
              hotel support tools in one clean dashboard.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <ActionButton onClick={() => navigate("/hotel-change-password")}>
                Change Password
              </ActionButton>
              <ActionButton onClick={() => navigate("/hotel-recommendations")}>
                Recommendations
              </ActionButton>
              <ActionButton onClick={() => setIsBotOpen(true)}>
                Hotel Chatbot
              </ActionButton>
              <button
                type="button"
                onClick={handleSignOut}
                className="rounded-full border border-white/25 bg-white px-6 py-3 text-sm font-extrabold uppercase tracking-wide text-[#385541] shadow-lg transition hover:-translate-y-0.5 hover:bg-white/90"
              >
                Sign Out
              </button>
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/20 bg-white/15 p-5 text-white shadow-2xl backdrop-blur-md lg:self-end">
            <div className="flex items-center gap-4">
              <AvatarPreview
                src={profileImageSrc}
                initials={initials}
                imageFailed={imageFailed}
                setImageFailed={setImageFailed}
                setStatus={setStatus}
                compact
              />

              <div className="min-w-0">
                <p className="truncate font-['Montserrat',sans-serif] text-xl font-black">
                  {displayName}
                </p>
                <p className="mt-1 truncate text-sm font-semibold text-white/70">
                  {form.email || "Guest email"}
                </p>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <HeroMiniStat label="Status" value={verificationBadge.label} />
              <HeroMiniStat label="AI Check" value={aiBadge.label} />
            </div>

            <button
              type="button"
              onClick={() => setIsBotOpen(true)}
              className="mt-5 w-full rounded-2xl bg-white px-5 py-3 text-sm font-extrabold uppercase tracking-wide text-[#385541] transition hover:bg-white/90"
            >
              Open Help Bot
            </button>
          </div>
        </div>
      </section>

      <main className="relative">
        <div className="absolute inset-x-0 top-0 -z-10 h-48 bg-gradient-to-b from-white/70 to-transparent" />

        <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:px-12 lg:py-10">
          {status.message ? (
            <StatusBanner type={status.type} message={status.message} />
          ) : null}

          <section className="grid gap-6 lg:grid-cols-[340px_1fr]">
            <aside className="h-fit rounded-[2rem] border border-[#385541]/10 bg-white p-6 shadow-[0_20px_50px_rgba(36,56,43,0.08)]">
              <div className="flex flex-col items-center text-center">
                <AvatarPreview
                  src={profileImageSrc}
                  initials={initials}
                  imageFailed={imageFailed}
                  setImageFailed={setImageFailed}
                  setStatus={setStatus}
                />

                <h2 className="mt-5 font-['Montserrat',sans-serif] text-2xl font-black text-[#385541]">
                  {displayName}
                </h2>

                <p className="mt-1 max-w-full break-words text-sm font-bold text-[#68776c]">
                  {loading
                    ? "@username"
                    : form.username
                    ? `@${form.username}`
                    : "@username"}
                </p>

                <Badge
                  label={verificationBadge.label}
                  className={`${verificationBadge.className} mt-4`}
                  dotClassName={verificationBadge.dotClassName}
                />
              </div>

              <div className="mt-6 space-y-3">
                <button
                  type="button"
                  onClick={handleChoosePhoto}
                  disabled={uploading}
                  className="w-full rounded-2xl bg-[#385541] px-5 py-3 text-sm font-extrabold text-white shadow-lg shadow-[#385541]/20 transition hover:-translate-y-0.5 hover:bg-[#2d4435] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {uploading ? "Uploading Photo..." : "Upload Photo"}
                </button>

                <SideActionButton onClick={() => navigate("/hotel-recommendations")}>
                  Hotel Recommendations
                </SideActionButton>

                <SideActionButton onClick={() => setIsBotOpen(true)}>
                  Open Hotel Chatbot
                </SideActionButton>

                <SideActionButton onClick={() => navigate("/hotel-guest-reviews")}>
                  My Approved Booking Reviews
                </SideActionButton>
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
              <DashboardCard
                eyebrow="Account Information"
                title="Personal Details"
                action={
                  <button
                    type="button"
                    onClick={() => navigate("/hotel-change-password")}
                    className="rounded-full bg-[#385541] px-5 py-2.5 text-xs font-extrabold uppercase tracking-wide text-white shadow transition hover:bg-[#2d4435]"
                  >
                    Change Password
                  </button>
                }
              >
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {accountFields.map((field) => (
                    <ProfileField
                      key={field.title}
                      title={field.title}
                      value={field.value}
                    />
                  ))}
                </div>
              </DashboardCard>

              <DashboardCard
                eyebrow="Identity Verification"
                title="Upload Government ID"
                action={
                  <Badge
                    label={verificationBadge.label}
                    className={verificationBadge.className}
                    dotClassName={verificationBadge.dotClassName}
                  />
                }
              >
                <p className="max-w-3xl text-sm font-medium leading-7 text-[#647268]">
                  Upload a valid government ID. The backend will run an AI
                  pre-check first, then your document will wait for admin review
                  when needed.
                </p>

                {uploadBlockMessage ? (
                  <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-700">
                    {uploadBlockMessage}
                  </div>
                ) : null}

                <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_auto] lg:items-end">
                  <div>
                    <label className="mb-2 block text-sm font-extrabold text-[#385541]">
                      Selected File
                    </label>

                    <div className="flex min-h-[52px] items-center rounded-2xl border border-[#385541]/15 bg-[#f8f6ee] px-4 py-3 text-sm font-semibold text-[#5f6d63]">
                      {idFile ? idFile.name : "No file selected"}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleChooseId}
                    disabled={!canUploadIdNow}
                    className="rounded-2xl bg-[#385541] px-6 py-3 text-sm font-extrabold text-white shadow-lg shadow-[#385541]/15 transition hover:-translate-y-0.5 hover:bg-[#2d4435] disabled:cursor-not-allowed disabled:opacity-50"
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

                <label className="mt-5 flex items-start gap-3 rounded-2xl border border-[#385541]/10 bg-[#f8f6ee] px-4 py-4 text-sm font-semibold leading-6 text-[#4d5d52]">
                  <input
                    type="checkbox"
                    checked={consentGiven}
                    onChange={(event) => setConsentGiven(event.target.checked)}
                    disabled={!canUploadIdNow}
                    className="mt-1 h-4 w-4 accent-[#385541] disabled:cursor-not-allowed"
                  />

                  <span>
                    I agree to submit my ID for account verification and admin
                    review.
                  </span>
                </label>

                <div className="mt-5 grid gap-4 rounded-[1.5rem] border border-[#385541]/10 bg-[#f8f6ee] p-4 md:grid-cols-[1fr_1.3fr]">
                  <div>
                    <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#7a887d]">
                      Current Status
                    </p>
                    <p className="mt-2 font-['Montserrat',sans-serif] text-xl font-black text-[#385541]">
                      {verificationBadge.label}
                    </p>
                  </div>

                  <div>
                    {form.idVerificationRemarks ? (
                      <p className="text-sm font-medium leading-7 text-[#5f6d63]">
                        <span className="font-extrabold text-[#385541]">
                          Remarks:{" "}
                        </span>
                        {form.idVerificationRemarks}
                      </p>
                    ) : (
                      <p className="text-sm font-medium leading-7 text-[#5f6d63]">
                        No admin remarks yet.
                      </p>
                    )}

                    <p className="mt-2 text-xs font-bold leading-6 text-[#6f7c72]">
                      Upload Rule:{" "}
                      {canUploadIdNow
                        ? "You can upload an ID now."
                        : uploadBlockMessage || "ID upload is currently blocked."}
                    </p>
                  </div>
                </div>

                <div className={`mt-5 rounded-[1.5rem] border p-4 ${aiBadge.className}`}>
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-extrabold uppercase tracking-[0.18em] opacity-70">
                        AI Pre-check
                      </p>
                      <h4 className="mt-1 font-['Montserrat',sans-serif] text-lg font-black">
                        OpenAI ID Review
                      </h4>
                    </div>

                    <span className="rounded-full bg-white/70 px-3 py-1 text-xs font-extrabold">
                      {aiBadge.label}
                    </span>
                  </div>

                  <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
                    {aiStats.map((item) => (
                      <AiInfo key={item.title} title={item.title} value={item.value} />
                    ))}
                  </div>

                  <p className="mt-4 text-sm font-medium leading-7">
                    {aiDisplay.aiSummary ||
                      "Upload your ID to run the AI pre-check."}
                  </p>

                  {aiDisplay.aiCheckedAt ? (
                    <p className="mt-2 text-xs font-bold opacity-70">
                      Last checked: {new Date(aiDisplay.aiCheckedAt).toLocaleString()}
                    </p>
                  ) : null}

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
                    className="rounded-2xl bg-[#385541] px-6 py-3 text-sm font-extrabold text-white shadow-lg shadow-[#385541]/15 transition hover:-translate-y-0.5 hover:bg-[#2d4435] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {uploadButtonText}
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsBotOpen(true)}
                    className="rounded-2xl border border-[#385541]/15 bg-white px-6 py-3 text-sm font-extrabold text-[#385541] transition hover:bg-[#385541]/5"
                  >
                    Ask Chatbot About ID
                  </button>
                </div>
              </DashboardCard>
            </section>
          </section>
        </div>
      </main>

      <Footer navigate={navigate} onOpenBot={() => setIsBotOpen(true)} />

      <ProfileFaqBot
        isOpen={isBotOpen}
        onClose={() => setIsBotOpen(false)}
        navigate={navigate}
      />

      <FloatingChatbotButton onClick={() => setIsBotOpen(true)} />
    </div>
  );
};

function ProfileHeader({ isOpen, setIsOpen, navigate, onOpenBot, onSignOut }) {
  return (
    <header className="relative z-30 px-5 pt-4 sm:px-8 lg:px-12">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 rounded-full border border-white/15 bg-white/10 px-4 py-3 shadow-2xl shadow-black/10 backdrop-blur-md">
        <button
          type="button"
          onClick={() => navigate("/hotel-resort")}
          className="flex min-w-0 items-center gap-3"
          aria-label="Go to hotel home"
        >
          <img
            src="/HotelLumispireLogo.png"
            alt="Lumispire Logo"
            className="h-11 w-11 rounded-full object-cover ring-2 ring-white/50"
            onError={(event) => {
              event.currentTarget.src = "/Logo.jpg";
            }}
          />
          <span className="hidden truncate font-['Montserrat',sans-serif] text-sm font-black uppercase tracking-[0.22em] text-white sm:block">
            Lumispire
          </span>
        </button>

        <nav className="hidden items-center gap-6 lg:flex">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.path}
              type="button"
              onClick={() => navigate(item.path)}
              className="font-['Montserrat',sans-serif] text-[12px] font-extrabold uppercase tracking-wide text-white/85 transition hover:text-white"
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <button
            type="button"
            onClick={onOpenBot}
            className="rounded-full border border-white/25 bg-white/10 px-4 py-2.5 text-xs font-extrabold uppercase tracking-wide text-white transition hover:bg-white/20"
          >
            Help Bot
          </button>
          <button
            type="button"
            onClick={onSignOut}
            className="rounded-full bg-white px-4 py-2.5 text-xs font-extrabold uppercase tracking-wide text-[#385541] transition hover:bg-white/90"
          >
            Sign Out
          </button>
        </div>

        <button
          type="button"
          className="rounded-full border border-white/20 bg-white/10 p-2 text-white lg:hidden"
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

      {isOpen ? (
        <div className="fixed inset-0 z-[70] lg:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setIsOpen(false)}
          />

          <div className="absolute right-0 top-0 h-full w-[320px] max-w-[88vw] bg-white p-5 shadow-2xl">
            <div className="mb-6 flex items-center justify-between">
              <div className="font-['Montserrat',sans-serif] text-lg font-black text-[#385541]">
                Menu
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-md p-2 text-[#385541] hover:bg-black/5"
                aria-label="Close menu"
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
                  onOpenBot();
                }}
              />

              <MenuItem
                label="SIGN OUT"
                onClick={() => {
                  setIsOpen(false);
                  onSignOut();
                }}
              />
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
}

function AvatarPreview({
  src,
  initials,
  imageFailed,
  setImageFailed,
  setStatus,
  compact = false,
}) {
  return (
    <div
      className={
        compact
          ? "h-20 w-20 overflow-hidden rounded-3xl border border-white/25 bg-white/20 shadow-inner"
          : "h-[210px] w-[210px] overflow-hidden rounded-[2rem] border-4 border-[#e6e1d2] bg-[#eef0e8] shadow-inner"
      }
    >
      {src && !imageFailed ? (
        <img
          src={src}
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
        <div
          className={
            compact
              ? "flex h-full w-full items-center justify-center font-['Montserrat',sans-serif] text-2xl font-black text-white"
              : "flex h-full w-full items-center justify-center font-['Montserrat',sans-serif] text-6xl font-black text-[#385541]"
          }
        >
          {initials}
        </div>
      )}
    </div>
  );
}

function DashboardCard({ eyebrow, title, action, children }) {
  return (
    <section className="rounded-[2rem] border border-[#385541]/10 bg-white p-5 shadow-[0_20px_50px_rgba(36,56,43,0.08)] sm:p-6">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-[#7a887d]">
            {eyebrow}
          </p>
          <h3 className="mt-1 font-['Montserrat',sans-serif] text-2xl font-black text-[#385541]">
            {title}
          </h3>
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>

      {children}
    </section>
  );
}

function ProfileField({ title, value }) {
  return (
    <div className="rounded-2xl border border-[#385541]/10 bg-[#f8f6ee] p-4 transition hover:-translate-y-0.5 hover:border-[#385541]/20 hover:bg-white hover:shadow-sm">
      <h4 className="font-['Montserrat',sans-serif] text-xs font-extrabold uppercase tracking-[0.16em] text-[#7a887d]">
        {title}
      </h4>

      <p className="mt-2 break-words text-sm font-bold leading-6 text-[#385541]">
        {value}
      </p>
    </div>
  );
}

function AiInfo({ title, value }) {
  return (
    <div className="rounded-2xl bg-white/70 px-4 py-3">
      <span className="block text-xs font-extrabold uppercase tracking-wide opacity-70">
        {title}
      </span>

      <span className="mt-1 block font-bold capitalize">{value}</span>
    </div>
  );
}

function Badge({ label, className, dotClassName }) {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-extrabold ${className}`}
    >
      {dotClassName ? <span className={`h-2 w-2 rounded-full ${dotClassName}`} /> : null}
      {label}
    </span>
  );
}

function StatusBanner({ type, message }) {
  const className =
    type === "success"
      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
      : type === "info"
      ? "border-amber-200 bg-amber-50 text-amber-700"
      : "border-rose-200 bg-rose-50 text-rose-700";

  return (
    <div className={`mb-6 rounded-2xl border px-5 py-4 text-sm font-semibold shadow-sm ${className}`}>
      {message}
    </div>
  );
}

function ActionButton({ children, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-full border border-white/25 bg-white/15 px-6 py-3 text-sm font-extrabold uppercase tracking-wide text-white shadow-md backdrop-blur-sm transition hover:-translate-y-0.5 hover:bg-white/25"
    >
      {children}
    </button>
  );
}

function SideActionButton({ children, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full rounded-2xl border border-[#385541]/15 bg-white px-5 py-3 text-sm font-extrabold text-[#385541] transition hover:-translate-y-0.5 hover:bg-[#385541]/5"
    >
      {children}
    </button>
  );
}

function HeroMiniStat({ label, value }) {
  return (
    <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm">
      <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-white/55">
        {label}
      </p>
      <p className="mt-1 line-clamp-2 text-sm font-black text-white">
        {value}
      </p>
    </div>
  );
}

function MenuItem({ label, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full rounded-2xl bg-[#385541]/10 py-4 font-['Montserrat',sans-serif] text-sm font-extrabold tracking-wide text-[#385541] transition hover:bg-[#385541]/20"
    >
      {label}
    </button>
  );
}

function ProfileFaqBot({ isOpen, onClose, navigate }) {
  const [messages, setMessages] = useState([
    {
      role: "bot",
      text:
        "Hi! I am your Hotel FAQ Chatbot. Ask me basic questions about booking, payment, ID verification, booking status, prices, password reset, FAQs, and recommendations.",
      matched: null,
    },
  ]);
  const [input, setInput] = useState("");

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
    <div className="fixed inset-0 z-[80] flex items-end justify-end bg-black/35 p-4 backdrop-blur-sm sm:p-6">
      <div className="flex h-[620px] max-h-[88vh] w-full max-w-[430px] flex-col overflow-hidden rounded-[2rem] bg-white shadow-2xl">
        <div className="bg-[#385541] px-5 py-4 text-white">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-white/60">
                Basic Questions
              </p>

              <h2 className="text-xl font-black">Hotel FAQ Chatbot</h2>

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
              X
            </button>
          </div>
        </div>

        <div className="flex-1 space-y-3 overflow-y-auto bg-[#f8f6ee] p-4">
          {messages.map((message, index) => {
            const isBot = message.role === "bot";

            return (
              <div
                key={`${message.role}-${index}`}
                className={`flex ${isBot ? "justify-start" : "justify-end"}`}
              >
                <div
                  className={`max-w-[86%] rounded-2xl px-4 py-3 text-sm leading-6 shadow-sm ${
                    isBot ? "bg-white text-[#385541]" : "bg-[#385541] text-white"
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
                      className="mt-3 rounded-full bg-[#385541] px-4 py-2 text-xs font-extrabold text-white hover:opacity-90"
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
            {QUICK_QUESTIONS.map((question) => (
              <button
                key={question}
                type="button"
                onClick={() => sendMessage(question)}
                className="shrink-0 rounded-full border border-[#385541]/15 bg-[#385541]/5 px-3 py-2 text-xs font-bold text-[#385541] hover:bg-[#385541]/10"
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
              className="h-12 flex-1 rounded-2xl border border-black/10 bg-[#fafaf7] px-4 text-sm font-semibold text-[#385541] outline-none focus:border-[#385541]"
            />

            <button
              type="submit"
              className="rounded-2xl bg-[#385541] px-5 text-sm font-extrabold text-white hover:bg-[#2d4435]"
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
            className="mt-3 w-full rounded-2xl border border-[#385541]/15 bg-white px-4 py-3 text-xs font-extrabold uppercase tracking-wide text-[#385541] hover:bg-[#385541]/5"
          >
            View Complete FAQs
          </button>
        </div>
      </div>
    </div>
  );
}

function FloatingChatbotButton({ onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="fixed bottom-6 right-6 z-[60] flex items-center gap-3 rounded-full bg-[#385541] px-5 py-4 text-white shadow-2xl shadow-[#24382b]/25 transition hover:-translate-y-1 hover:bg-[#2d4435] focus:outline-none focus:ring-4 focus:ring-[#385541]/25"
      aria-label="Open hotel chatbot"
    >
      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-xl font-black text-[#385541]">
        ?
      </span>

      <span className="hidden text-sm font-extrabold sm:block">
        Hotel Chatbot
      </span>
    </button>
  );
}

function Footer({ navigate, onOpenBot }) {
  return (
    <footer className="bg-[#385541] text-white">
      <div className="mx-auto max-w-7xl px-6 py-9 sm:px-8 lg:px-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <FooterColumn
            title="Menu"
            items={[
              { label: "Home", path: "/hotel-resort" },
              { label: "Recommendations", path: "/hotel-recommendations" },
              { label: "FAQs", path: "/hotel-faqs" },
              { label: "Hotel Chatbot", action: onOpenBot },
            ]}
            navigate={navigate}
          />

          <div className="border-white/20 md:border-r md:pr-8">
            <h3 className="font-['Montserrat',sans-serif] text-xl font-black">
              Contact Information
            </h3>

            <div className="mt-3 space-y-1 text-sm text-white/85">
              <p>ltc.tami@gmail.com</p>
              <p>lorengladis@ltcmultiservices.com</p>
              <p>0995906805 / 09516281271</p>
            </div>
          </div>

          <div className="border-white/20 md:border-r md:pr-8">
            <h3 className="font-['Montserrat',sans-serif] text-xl font-black">
              Address
            </h3>

            <div className="mt-3 space-y-1 text-sm text-white/85">
              <p>2/F SGA Curie Street, Palanan,</p>
              <p>Makati City</p>
            </div>
          </div>

          <div>
            <h3 className="font-['Montserrat',sans-serif] text-xl font-black">
              Basic Help
            </h3>

            <button
              type="button"
              onClick={onOpenBot}
              className="mt-3 rounded-full bg-white px-5 py-2.5 text-xs font-extrabold uppercase tracking-wide text-[#385541] transition hover:bg-white/90"
            >
              Open Hotel Chatbot
            </button>
          </div>
        </div>

        <div className="mt-7 flex flex-col justify-between gap-2 border-t border-white/20 pt-5 text-xs text-white/80 md:flex-row">
          <p>Copyright 2026 LTC GROUP OF COMPANIES. All rights reserved.</p>
          <p>Developed by CRMS Tech Alliance</p>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({ title, items, navigate }) {
  return (
    <div className="border-white/20 md:border-r md:pr-8">
      <h3 className="font-['Montserrat',sans-serif] text-xl font-black">
        {title}
      </h3>

      <div className="mt-3 space-y-2 text-sm text-white/85">
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
            className="block transition hover:text-white"
          >
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export default HotelProfile;