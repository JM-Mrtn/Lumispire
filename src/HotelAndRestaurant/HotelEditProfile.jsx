import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

const getUserIdFromToken = (token) => {
  try {
    const payload = token.split(".")[1];
    const json = JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")));
    return json.userId || null;
  } catch {
    return null;
  }
};

const HotelEditProfile = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);

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
  });

  const [original, setOriginal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState("");
  const [status, setStatus] = useState({ type: "", message: "" });
  const [fieldErrors, setFieldErrors] = useState({});

  const nameRegex = /^[A-Za-z\s]+$/;
  const usernameRegex = /^[A-Za-z0-9]+$/;
  const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

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

  const validate = (data) => {
    const e = {};
    const f = (data.firstName || "").trim();
    const l = (data.lastName || "").trim();
    const u = (data.username || "").trim();
    const em = (data.email || "").trim().toLowerCase();
    const p = (data.phone || "").trim();

    if (!f) e.firstName = "First name is required";
    else if (f.length > 20) e.firstName = "Max 20 characters";
    else if (!nameRegex.test(f)) e.firstName = "Letters only";

    if (!l) e.lastName = "Last name is required";
    else if (l.length > 20) e.lastName = "Max 20 characters";
    else if (!nameRegex.test(l)) e.lastName = "Letters only";

    if (!u) e.username = "Username is required";
    else if (u.length > 20) e.username = "Max 20 characters";
    else if (!usernameRegex.test(u)) e.username = "Letters/numbers only";

    if (!em) e.email = "Email is required";
    else if (em.length > 50) e.email = "Max 50 characters";
    else if (!emailRegex.test(em)) e.email = "Invalid email format";

    if (!p) e.phone = "Phone is required";
    else if (!/^\d+$/.test(p)) e.phone = "Numbers only";
    else if (p.length !== 11) e.phone = "Must be 11 digits";
    else if (!p.startsWith("09")) e.phone = "Must start with 09";

    return e;
  };

  const onChange = (key, val) => {
    let next = val;

    if (key === "firstName" || key === "lastName") next = next.replace(/[^A-Za-z\s]/g, "").slice(0, 20);
    if (key === "username") next = next.replace(/[^A-Za-z0-9]/g, "").slice(0, 20);
    if (key === "email") next = next.replace(/\s/g, "").slice(0, 50);
    if (key === "phone") next = next.replace(/\D/g, "").slice(0, 11);

    setForm((p) => ({ ...p, [key]: next }));
    setFieldErrors((p) => ({ ...p, [key]: "" }));
    setStatus({ type: "", message: "" });
  };

  const onBlurTrim = (key) => {
    setForm((p) => ({ ...p, [key]: (p[key] || "").trim() }));
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/hotel-login");
      return;
    }

    const fetchProfile = async () => {
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

        const next = {
          firstName: data.firstName || "",
          lastName: data.lastName || "",
          username: data.username || "",
          email: data.email || "",
          phone: data.phone || "",
          profilePicture: data.profilePicture || "",
        };

        setForm(next);
        setOriginal(next);
      } catch (err) {
        console.error(err);
        setStatus({ type: "error", message: "Network error. Please try again." });
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate, API_BASE]);

  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

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

  const profileImageSrc =
    previewUrl ||
    resolveImageUrl(form.profilePicture) ||
    "https://placehold.co/320x320?text=Photo";

  const handleChoosePhoto = () => {
    fileInputRef.current?.click();
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

      setOriginal((prev) =>
        prev
          ? {
              ...prev,
              profilePicture: savedUrl,
            }
          : prev
      );

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

  const handleSaveProfile = async () => {
    const token = localStorage.getItem("token");
    if (!token) return navigate("/hotel-login");

    const errs = validate(form);
    setFieldErrors(errs);

    if (Object.keys(errs).length > 0) {
      setStatus({ type: "error", message: "Please fix the highlighted fields." });
      return;
    }

    const userId = getUserIdFromToken(token);
    if (!userId) {
      localStorage.removeItem("token");
      navigate("/hotel-login");
      return;
    }

    setSaving(true);
    setStatus({ type: "", message: "" });

    try {
      const payload = {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        username: form.username.trim(),
        email: form.email.toLowerCase().trim(),
        phone: form.phone,
      };

      const res = await fetch(`${API_BASE}/update-user/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setStatus({ type: "error", message: data.message || "Update failed." });
        return;
      }

      setOriginal((prev) => ({
        ...(prev || {}),
        ...form,
      }));
      setStatus({ type: "success", message: "Profile updated successfully!" });
      setTimeout(() => navigate("/hotel-profile"), 600);
    } catch (err) {
      console.error(err);
      setStatus({ type: "error", message: "Network error while saving." });
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  const statusStyles =
    status.type === "success"
      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
      : status.type === "error"
      ? "border-rose-200 bg-rose-50 text-rose-700"
      : "border-slate-200 bg-slate-50 text-slate-700";

  return (
    <div className="min-h-screen bg-[#f6f6f3] font-['Inter',sans-serif] text-[#36523d]">
      {/* HERO */}
      <section className="relative overflow-hidden">
        <img
          src="/LogInSignUpBG.jpg"
          alt="Edit Profile"
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
                onClick={handleSaveProfile}
                disabled={loading || saving || uploading}
                className="min-w-[190px] rounded-full border-2 border-white bg-gradient-to-b from-[#7b8c72] to-[#455746] px-7 py-[10px] font-['Inter',sans-serif] text-[16px] font-bold text-white shadow-md disabled:opacity-60"
              >
                {saving ? "Saving..." : "Save Profile"}
              </button>

              <button
                onClick={() => navigate("/hotel-change-password")}
                disabled={loading || saving || uploading}
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
            </div>
          </div>
        </div>
      </section>

      {/* BODY */}
      <main className="bg-[#f6f6f3]">
        <div className="mx-auto max-w-[1280px] px-4 py-8 sm:px-6 lg:px-8">
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

              <div className="mt-3">
                <button
                  type="button"
                  onClick={handleChoosePhoto}
                  disabled={uploading || loading || saving}
                  className="rounded-full bg-gradient-to-b from-[#60765d] to-[#354a38] px-6 py-[7px] font-['Inter',sans-serif] text-[13px] font-bold text-white shadow hover:opacity-95 disabled:opacity-60"
                >
                  {uploading ? "Uploading..." : "Upload Photo"}
                </button>
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
            <div className={`mt-5 rounded-xl border px-4 py-3 text-sm ${statusStyles}`}>
              {status.message}
            </div>
          )}

          <div className="mt-8 rounded-[8px] bg-[#ddddd3] px-8 py-10 shadow-sm">
            <div className="grid grid-cols-1 gap-x-12 gap-y-8 md:grid-cols-3">
              <InputLikeShot
                label="First Name"
                value={form.firstName}
                disabled={loading || saving || uploading}
                onChange={(v) => onChange("firstName", v)}
                onBlur={() => onBlurTrim("firstName")}
                error={fieldErrors.firstName}
              />
              <InputLikeShot
                label="Last Name"
                value={form.lastName}
                disabled={loading || saving || uploading}
                onChange={(v) => onChange("lastName", v)}
                onBlur={() => onBlurTrim("lastName")}
                error={fieldErrors.lastName}
              />
              <InputLikeShot
                label="Username"
                value={form.username}
                disabled={loading || saving || uploading}
                onChange={(v) => onChange("username", v)}
                onBlur={() => onBlurTrim("username")}
                error={fieldErrors.username}
              />
              <InputLikeShot
                label="Email"
                type="email"
                value={form.email}
                disabled={loading || saving || uploading}
                onChange={(v) => onChange("email", v)}
                onBlur={() => onBlurTrim("email")}
                error={fieldErrors.email}
              />
              <InputLikeShot
                label="Phone Number"
                value={form.phone}
                disabled={loading || saving || uploading}
                inputMode="numeric"
                onChange={(v) => onChange("phone", v)}
                onBlur={() => onBlurTrim("phone")}
                error={fieldErrors.phone}
              />
            </div>
          </div>
        </div>
      </main>

      {/* FOOTER */}
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

      {/* MOBILE MENU */}
      {isOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setIsOpen(false)}
          />
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

function InputLikeShot({
  label,
  value,
  onChange,
  onBlur,
  disabled,
  type = "text",
  inputMode,
  error,
}) {
  return (
    <div>
      <label className="mb-2 block font-['Montserrat',sans-serif] text-[18px] font-extrabold text-[#36523d]">
        {label}
      </label>
      <input
        type={type}
        value={value}
        disabled={disabled}
        inputMode={inputMode}
        onBlur={onBlur}
        onChange={(e) => onChange(e.target.value)}
        className={`h-[38px] w-full rounded-full border bg-[#efefe7] px-4 font-['Inter',sans-serif] text-[#36523d] outline-none transition focus:ring-2 focus:ring-[#36523d]/20 ${
          error ? "border-rose-400" : "border-[#9f9f98]"
        } disabled:opacity-60`}
      />
      {error ? <p className="mt-1 text-xs text-rose-700">{error}</p> : null}
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

export default HotelEditProfile;