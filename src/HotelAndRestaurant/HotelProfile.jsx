import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

const HotelProfile = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const idFileInputRef = useRef(null);

  const API_BASE = useMemo(() => {
    const raw = (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/+$/, "");
    if (raw.includes("/api/hotel")) return raw;
    if (raw.includes("/api/")) return raw;
    return `${raw}/api/hotel`;
  }, []);

  const SERVER_BASE = useMemo(() => {
    const raw = (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/+$/, "");
    return raw.replace(/\/api\/.*$/, "");
  }, []);

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

  const goToProfile = () => navigate("/hotel-profile");

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
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/hotel-login");
      return;
    }

    setLoading(true);
    setStatus({ type: "", message: "" });

    try {
      const res = await fetch(`${API_BASE}/hotel-user-profile`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        localStorage.removeItem("token");
        navigate("/hotel-login");
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
        aiConnected: Boolean(verification.aiConnected),
        aiConnectionStatus: verification.aiConnectionStatus || "not_checked",
        aiSummary: verification.aiSummary || "",
        aiDecision: verification.aiDecision || "unknown",
        aiRiskLevel: verification.aiRiskLevel || "unknown",
        aiDocumentType: verification.aiDocumentType || "unknown",
        aiCheckedAt: verification.aiCheckedAt || null,
        aiError: verification.aiError || "",
      });
    } catch (err) {
      console.error(err);
      setStatus({ type: "error", message: "Network error. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [navigate, API_BASE]);

  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleSignOut = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  const handleChoosePhoto = () => {
    fileInputRef.current?.click();
  };

  const handleChooseId = () => {
    idFileInputRef.current?.click();
  };

  const handleProfilePictureChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setStatus({ type: "error", message: "Please select a valid image file." });
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      setStatus({ type: "error", message: "Image must be 5MB or smaller." });
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/hotel-login");
      return;
    }

    if (previewUrl && previewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl);
    }

    const tempPreview = URL.createObjectURL(file);
    setPreviewUrl(tempPreview);
    setUploading(true);
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

      setStatus({ type: "success", message: "Profile picture uploaded successfully." });
    } catch (err) {
      console.error(err);
      setPreviewUrl("");
      setStatus({
        type: "error",
        message: err.message || "Failed to upload profile picture.",
      });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleIdFileChange = (e) => {
    const file = e.target.files?.[0];
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
      setStatus({ type: "error", message: "ID file must be 8MB or smaller." });
      if (idFileInputRef.current) idFileInputRef.current.value = "";
      return;
    }

    setIdFile(file);
    setStatus({ type: "", message: "" });
  };

  const handleUploadId = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/hotel-login");
      return;
    }

    if (!idFile) {
      setStatus({ type: "error", message: "Please select an ID file to upload." });
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
      setStatus({
        type: data.aiConnectionStatus === "connected" ? "success" : "error",
        message: data.message || "ID uploaded successfully.",
      });

      setIdFile(null);
      setConsentGiven(false);
      if (idFileInputRef.current) idFileInputRef.current.value = "";

      await fetchProfile();
    } catch (err) {
      console.error(err);
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

  const profileImageSrc =
    previewUrl ||
    resolveImageUrl(form.profilePicture) ||
    "https://placehold.co/320x320?text=Photo";

  const initials = useMemo(() => {
    const first = form.firstName?.trim()?.[0] || "";
    const last = form.lastName?.trim()?.[0] || "";
    const user = form.username?.trim()?.[0] || "";
    return (first + last || user || "U").toUpperCase();
  }, [form.firstName, form.lastName, form.username]);

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
    const status = source.aiConnectionStatus || "not_checked";

    if (status === "connected") {
      return {
        label: "AI Connected",
        className: "border-emerald-200 bg-emerald-50 text-emerald-700",
      };
    }

    if (status === "missing_key") {
      return {
        label: "AI Key Missing",
        className: "border-amber-200 bg-amber-50 text-amber-700",
      };
    }

    if (status === "error") {
      return {
        label: "AI Check Failed",
        className: "border-rose-200 bg-rose-50 text-rose-700",
      };
    }

    if (status === "not_supported") {
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

  return (
    <div className="min-h-screen bg-[#f6f6f3] font-['Inter',sans-serif] text-[#36523d]">
      <section className="relative overflow-hidden">
        <img
          src="/LogInSignUpBG.jpg"
          alt="My Profile"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-black/35" />

        <div className="relative z-10 mx-auto max-w-[1280px] px-4 pb-7 pt-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4">
            <button
              onClick={() => navigate("/")}
              className="flex items-center"
              aria-label="Go to Home"
            >
              <img
                src="/Logo.jpg"
                alt="Logo"
                className="h-12 w-12 rounded-full object-cover sm:h-14 sm:w-14"
              />
            </button>

            <nav className="hidden items-center gap-8 md:flex">
              <button
                onClick={() => navigate("/")}
                className="font-['Montserrat',sans-serif] text-[15px] font-semibold uppercase tracking-wide text-white transition hover:text-white/80"
              >
                Home
              </button>
              <button
                onClick={() => navigate("/virtual-tour")}
                className="font-['Montserrat',sans-serif] text-[15px] font-semibold uppercase tracking-wide text-white transition hover:text-white/80"
              >
                Virtual Tour
              </button>
              <button
                onClick={goToProfile}
                className="font-['Montserrat',sans-serif] text-[15px] font-semibold uppercase tracking-wide text-white transition hover:text-white/80"
              >
                Profile
              </button>
              <button
                onClick={() => navigate("/hotel-contact-us")}
                className="font-['Montserrat',sans-serif] text-[15px] font-semibold uppercase tracking-wide text-white transition hover:text-white/80"
              >
                Contact
              </button>
              
            </nav>

            <button
              className="rounded-md p-2 text-white md:hidden"
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

          <div className="mt-3 flex flex-col items-center justify-center text-center">
            <h1 className="font-['Montserrat',sans-serif] text-[42px] font-extrabold leading-none text-white sm:text-[64px]">
              My Profile
            </h1>

            <div className="mt-5 flex flex-wrap items-center justify-center gap-4">
              <button
                onClick={() => navigate("/hotel-edit-profile")}
                disabled={loading}
                className="min-w-[190px] rounded-full border-2 border-white bg-gradient-to-b from-[#7b8c72] to-[#455746] px-7 py-[10px] font-['Inter',sans-serif] text-[16px] font-bold text-white shadow-md disabled:opacity-60"
              >
                Edit Profile
              </button>

              <button
                onClick={() => navigate("/hotel-change-password")}
                disabled={loading}
                className="min-w-[210px] rounded-full border-2 border-white bg-white/20 px-7 py-[10px] font-['Inter',sans-serif] text-[16px] font-bold text-white shadow-md backdrop-blur-sm hover:bg-white/25 disabled:opacity-60"
              >
                Change Password
              </button>

              <button
                onClick={handleSignOut}
                className="min-w-[170px] rounded-full border-2 border-white bg-white/20 px-7 py-[10px] font-['Inter',sans-serif] text-[16px] font-bold text-white shadow-md backdrop-blur-sm hover:bg-white/25"
              >
                Sign Out
              </button>
              <button
  type="button"
  onClick={() => navigate("/hotel-guest-reviews")}
  className="rounded-full bg-[#355E3B] px-6 py-[10px] text-sm font-bold text-white shadow hover:opacity-95"
>
  My Approved Booking Reviews
</button>
            </div>
          </div>
        </div>
      </section>

      <main className="bg-[#f6f6f3]">
        <div className="mx-auto max-w-[1280px] px-4 py-8 sm:px-6 lg:px-8">
          <div className="rounded-none bg-transparent">
            <div className="flex flex-col gap-8 md:flex-row md:items-start">
              <div className="mx-auto md:mx-0 md:w-[240px]">
                <div className="relative mx-auto h-[210px] w-[210px] overflow-hidden rounded-full border-2 border-[#a9aaa4] bg-[#ececeb]">
                  {profileImageSrc ? (
                    <img
                      src={profileImageSrc}
                      alt="Profile"
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                        setStatus({
                          type: "error",
                          message: "Uploaded image could not be displayed.",
                        });
                      }}
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-[#e5e7df] font-['Montserrat',sans-serif] text-6xl font-bold text-[#3f5b44]">
                      {initials}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex-1 pt-2">
                <h2 className="font-['Montserrat',sans-serif] text-[34px] font-extrabold leading-none text-[#36523d] sm:text-[54px]">
                  {displayName}
                </h2>

                <p className="mt-1 font-['Inter',sans-serif] text-[22px] font-semibold text-[#36523d]/85">
                  {loading ? "@Username" : form.username ? `@${form.username}` : "@Username"}
                </p>

                <div className="mt-3 flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={handleChoosePhoto}
                    disabled={uploading}
                    className="rounded-full bg-gradient-to-b from-[#60765d] to-[#354a38] px-6 py-[7px] font-['Inter',sans-serif] text-[13px] font-bold text-white shadow hover:opacity-95 disabled:opacity-60"
                  >
                    {uploading ? "Uploading..." : "Upload Photo"}
                  </button>

                  <span
                    className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${verificationBadge.className}`}
                  >
                    {verificationBadge.label}
                  </span>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleProfilePictureChange}
                  className="hidden"
                />
              </div>
            </div>

            {status.message && (
              <div
                className={`mt-5 rounded-xl border px-4 py-3 text-sm ${
                  status.type === "success"
                    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                    : "border-rose-200 bg-rose-50 text-rose-700"
                }`}
              >
                {status.message}
              </div>
            )}

            <div className="mt-8 rounded-[8px] bg-[#ddddd3] px-8 py-10 shadow-sm">
              <div className="grid grid-cols-1 gap-x-12 gap-y-10 md:grid-cols-3">
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

            <div className="mt-8 rounded-[8px] bg-white px-8 py-8 shadow-sm">
              <h3 className="font-['Montserrat',sans-serif] text-[24px] font-extrabold text-[#36523d]">
                ID Verification
              </h3>

              <p className="mt-2 text-sm text-[#36523d]/80">
                Upload a valid government ID. After upload, the backend will try to connect to OpenAI and run an AI pre-check. The hotel admin still makes the final approval or rejection.
              </p>

              <div className="mt-5">
                <label className="mb-2 block text-sm font-semibold text-[#36523d]">
                  Selected File
                </label>
                <div className="rounded-xl border border-[#cfd3c9] bg-[#f8f8f5] px-4 py-3 text-sm text-[#36523d]/80">
                  {idFile ? idFile.name : "No file selected"}
                </div>
              </div>

              <div className="mt-5">
                <button
                  type="button"
                  onClick={handleChooseId}
                  className="rounded-full bg-[#355E3B] px-6 py-[10px] text-sm font-bold text-white shadow hover:opacity-95"
                >
                  Choose ID File
                </button>

                <input
                  ref={idFileInputRef}
                  type="file"
                  accept=".jpg,.jpeg,.png,.webp,.pdf"
                  onChange={handleIdFileChange}
                  className="hidden"
                />
              </div>

              <label className="mt-5 flex items-start gap-3 text-sm text-[#36523d]/90">
                <input
                  type="checkbox"
                  checked={consentGiven}
                  onChange={(e) => setConsentGiven(e.target.checked)}
                  className="mt-1 h-4 w-4"
                />
                <span>
                  I agree to submit my ID for account verification and review.
                </span>
              </label>

              <div className="mt-5 rounded-xl bg-[#f6f6f3] px-4 py-4">
                <p className="text-sm font-semibold text-[#36523d]">
                  Current Status:{" "}
                  <span className="font-bold">
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
                  <p className="mt-2 text-sm text-[#36523d]/80">
                    Remarks: {form.idVerificationRemarks}
                  </p>
                ) : null}
              </div>

              <div className={`mt-4 rounded-xl border px-4 py-4 ${aiBadge.className}`}>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="text-sm font-extrabold">OpenAI ID Pre-check</p>
                  <span className="rounded-full bg-white/70 px-3 py-1 text-xs font-bold">
                    {aiBadge.label}
                  </span>
                </div>

                <div className="mt-3 grid grid-cols-1 gap-3 text-sm md:grid-cols-3">
                  <div>
                    <span className="block text-xs font-bold uppercase opacity-70">AI Decision</span>
                    <span className="font-semibold capitalize">
                      {String(aiDisplay.aiDecision || "unknown").replaceAll("_", " ")}
                    </span>
                  </div>
                  <div>
                    <span className="block text-xs font-bold uppercase opacity-70">Risk Level</span>
                    <span className="font-semibold capitalize">{aiDisplay.aiRiskLevel || "unknown"}</span>
                  </div>
                  <div>
                    <span className="block text-xs font-bold uppercase opacity-70">Document Type</span>
                    <span className="font-semibold capitalize">
                      {String(aiDisplay.aiDocumentType || "unknown").replaceAll("_", " ")}
                    </span>
                  </div>
                </div>

                {aiDisplay.aiSummary ? (
                  <p className="mt-3 text-sm leading-relaxed">{aiDisplay.aiSummary}</p>
                ) : (
                  <p className="mt-3 text-sm leading-relaxed">
                    Upload your ID to test if OpenAI is connected. If credits are not added yet, the upload will still be saved and the admin can rerun the AI check later.
                  </p>
                )}

                {aiDisplay.aiError ? (
                  <p className="mt-2 text-xs font-semibold text-rose-700">AI Error: {aiDisplay.aiError}</p>
                ) : null}
              </div>

              <div className="mt-5">
                <button
                  type="button"
                  onClick={handleUploadId}
                  disabled={idUploading}
                  className="rounded-full bg-gradient-to-b from-[#60765d] to-[#354a38] px-6 py-[10px] text-sm font-bold text-white shadow hover:opacity-95 disabled:opacity-60"
                >
                  {idUploading ? "Uploading ID..." : "Upload ID for Verification"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-[#355240] text-white">
        <div className="mx-auto max-w-[1280px] px-6 py-6">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
            <div className="border-white/30 md:border-r md:pr-8">
              <h3 className="font-['Montserrat',sans-serif] text-[22px] font-bold">Menu</h3>
              <div className="mt-3 space-y-1 font-['Inter',sans-serif] text-[13px] text-white/90">
                <p>Home</p>
                <p>Course</p>
                <p>Requirements</p>
                <p>Profile</p>
              </div>
            </div>

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
              <h3 className="font-['Montserrat',sans-serif] text-[22px] font-bold">Address</h3>
              <div className="mt-3 space-y-1 font-['Inter',sans-serif] text-[13px] text-white/90">
                <p>2/F SGA Curie Street, Palanan,</p>
                <p>Makati City</p>
              </div>
            </div>

            <div>
              <h3 className="font-['Montserrat',sans-serif] text-[22px] font-bold">Follow Us</h3>
              <div className="mt-3">
                <img
                  src="https://placehold.co/120x40?text=Socials"
                  alt="Social links"
                  className="h-10 w-auto rounded object-cover opacity-90"
                />
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-col justify-between gap-2 border-t border-white/20 pt-4 text-[11px] text-white/90 md:flex-row">
            <p>© 2026 LTC GROUP OF COMPANIES. All rights reserved.</p>
            <p>Developed by CRMS Tech Alliance</p>
          </div>
        </div>
      </footer>

      {isOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 top-0 h-full w-[300px] bg-white p-5 shadow-2xl">
            <div className="mb-6 flex items-center justify-between">
              <div className="font-['Montserrat',sans-serif] text-lg font-bold text-[#355E3B]">
                MENU
              </div>

              <button
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
              <MenuItem
                label="HOME"
                onClick={() => {
                  setIsOpen(false);
                  navigate("/");
                }}
              />
              <MenuItem
                label="VIRTUAL TOUR"
                onClick={() => {
                  setIsOpen(false);
                  navigate("/virtual-tour");
                }}
              />
              <MenuItem
                label="PROFILE"
                onClick={() => {
                  setIsOpen(false);
                  navigate("/hotel-profile");
                }}
              />
              <MenuItem
                label="CONTACT"
                onClick={() => {
                  setIsOpen(false);
                  navigate("/hotel-contact-us");
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

function ProfileField({ title, value }) {
  return (
    <div>
      <h3 className="font-['Montserrat',sans-serif] text-[18px] font-extrabold text-[#36523d]">
        {title}
      </h3>
      <p className="mt-1 font-['Inter',sans-serif] text-[13px] font-medium leading-snug text-[#36523d]/90">
        {value}
      </p>
    </div>
  );
}

function MenuItem({ label, onClick }) {
  return (
    <button
      onClick={onClick}
      className="w-full rounded-xl bg-[#355E3B]/10 py-4 font-['Montserrat',sans-serif] text-sm font-semibold tracking-wide text-[#355E3B] transition hover:bg-[#355E3B]/20"
    >
      {label}
    </button>
  );
}

export default HotelProfile;