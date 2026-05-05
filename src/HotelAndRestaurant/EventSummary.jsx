import React, { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const BANK_QR_IMAGE = "/bank-transfer-qr.png";
const GCASH_QR_IMAGE = "/gcash-qr.png";

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

  const fullTotalAmount = Number(bookingData?.totalAmount || bookingData?.price || 0);
  const amountToPay = isDownPayment ? Math.ceil(fullTotalAmount / 2) : fullTotalAmount;
  const balanceAmount = isDownPayment ? fullTotalAmount - amountToPay : 0;

  const goToProfile = () => {
    const token = localStorage.getItem("token") || localStorage.getItem("hotelToken");
    navigate(token ? "/hotel-profile" : "/hotel-login");
  };

  const statusStyles =
    status.type === "success"
      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
      : status.type === "error"
      ? "border-rose-200 bg-rose-50 text-rose-700"
      : "border-slate-200 bg-slate-50 text-slate-700";

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
    setStatus({ type: "", message: "" });

    if (!paymentMethod) {
      setStatus({ type: "error", message: "Please select a payment method by clicking a QR image or choosing from the dropdown." });
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
      formData.append("serviceType", bookingData.serviceType || "Event Package");
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
      setTimeout(() => navigate("/hotel-profile"), 1200);
    } catch (error) {
      console.error("submit event booking error:", error);
      setStatus({ type: "error", message: error.message || "Failed to submit event booking." });
    } finally {
      setLoading(false);
    }
  };

  if (!bookingData) {
    return (
      <div className="min-h-screen bg-[#2f523d] font-['Inter',sans-serif]">
        <Header navigate={navigate} goToProfile={goToProfile} openMenu={() => setIsOpen(true)} />
        <main className="flex min-h-[calc(100vh-180px)] items-center justify-center bg-[#2f523d] px-4 py-10">
          <div className="w-full max-w-md rounded-md bg-white/15 px-6 py-8 text-center shadow-[0_18px_45px_rgba(0,0,0,0.12)] backdrop-blur-[1px]">
            <h1 className="font-['Montserrat',sans-serif] text-[28px] font-extrabold text-white">No Booking Data Found</h1>
            <p className="mt-3 text-sm font-semibold text-white/80">Please complete the booking form first.</p>
            <button onClick={() => navigate("/event-form")} type="button" className="mt-6 h-9 rounded-full bg-white px-10 font-['Montserrat',sans-serif] text-[11px] font-extrabold uppercase text-[#3f5b44] shadow-sm transition hover:bg-[#fffde9]">Back to Form</button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#2f523d] font-['Inter',sans-serif]">
      <Header navigate={navigate} goToProfile={goToProfile} openMenu={() => setIsOpen(true)} />

      <main className="bg-[#2f523d] px-4 pb-7 pt-5 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[1180px]">
          <div className="mb-5 text-center">
            <h1 className="font-['Montserrat',sans-serif] text-[34px] font-extrabold leading-tight text-white sm:text-[42px]">Event Booking Summary</h1>
            <div className="mx-auto mt-2 h-[2px] w-[340px] bg-white/80" />
          </div>

          <div className="rounded-md bg-white/15 px-5 py-8 shadow-[0_18px_45px_rgba(0,0,0,0.12)] backdrop-blur-[1px] sm:px-7 lg:px-8">
            {status.message ? <div className={`mb-5 rounded-xl border px-4 py-3 text-sm font-semibold ${statusStyles}`}>{status.message}</div> : null}

            <SummarySection title="Personal Information">
              <ReadOnlyField label="First Name" value={bookingData.firstName} />
              <ReadOnlyField label="Last Name" value={bookingData.lastName} />
              <ReadOnlyField label="Email" value={bookingData.email} />
              <ReadOnlyField label="Phone Number" value={bookingData.phone} />
            </SummarySection>

            <div className="mt-9">
              <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center">
                <div>
                  <h2 className="font-['Montserrat',sans-serif] text-[25px] font-semibold text-white sm:text-[30px]">Booking Details</h2>
                  <div className="mt-1 h-[2px] w-[210px] bg-white/60" />
                </div>
                <input value={bookingData.serviceType || "Event Package"} disabled readOnly className="h-8 w-full rounded-md border-0 bg-white px-3 text-[12px] font-semibold text-[#3f5b44] outline-none sm:w-[250px]" />
              </div>

              <div className="grid grid-cols-1 gap-x-10 gap-y-5 md:grid-cols-3">
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

              <div className="mt-9">
                <SummarySection title="Food Menu Choices">
                  <ReadOnlyField label="Appetizer / Soup" value={formatArray(bookingData.appetizer)} />
                  <ReadOnlyField label="Main Dish" value={formatArray(bookingData.mainDish)} />
                  <ReadOnlyField label="Dessert" value={formatArray(bookingData.dessert)} />
                  <ReadOnlyField label="Drinks" value={formatArray(bookingData.drinks)} />
                </SummarySection>
              </div>

              <PaymentSection paymentMethod={paymentMethod} setPaymentMethod={setPaymentMethod} isDownPayment={isDownPayment} setIsDownPayment={setIsDownPayment} proofFile={proofFile} handleProofChange={handleProofChange} />

              <div className="mt-9 rounded-md bg-[#f7f7f2] px-4 py-4 text-[#314f3b]">
                <div className="flex items-start justify-between gap-5">
                  <div>
                    <p className="font-['Montserrat',sans-serif] text-[20px] font-extrabold sm:text-[25px]">Total Amount:</p>
                    <div className="mt-3 space-y-2 text-sm font-semibold sm:text-base"><p>{isDownPayment ? "Down payment" : "Full Payment"}</p><p>Total Balance</p></div>
                  </div>
                  <div className="text-right">
                    <p className="font-['Montserrat',sans-serif] text-[20px] font-extrabold sm:text-[25px]">{formatPeso(amountToPay)}</p>
                    <div className="mt-3 space-y-2 text-sm font-semibold sm:text-base"><p>{formatPeso(amountToPay)}</p><p>{formatPeso(balanceAmount)}</p></div>
                  </div>
                </div>
              </div>

              <div className="mt-9 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <button onClick={submitBooking} disabled={loading} type="button" className="h-8 w-full rounded-full bg-white px-12 font-['Montserrat',sans-serif] text-[10px] font-extrabold uppercase text-[#3f5b44] shadow-sm transition hover:bg-[#fffde9] disabled:cursor-not-allowed disabled:opacity-60 sm:w-[220px]">{loading ? "Submitting..." : "Submit Booking"}</button>
                <button onClick={() => navigate("/event-form", { state: bookingData })} disabled={loading} type="button" className="h-8 w-full rounded-full bg-white px-12 font-['Montserrat',sans-serif] text-[10px] font-extrabold uppercase text-[#3f5b44] shadow-sm transition hover:bg-[#fffde9] disabled:cursor-not-allowed disabled:opacity-60 sm:w-[220px]">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
      {isOpen && <MobileMenu onClose={() => setIsOpen(false)} navigate={navigate} goToProfile={goToProfile} />}
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
}) {
  return (
    <div className="mt-10">
      <div className="mb-7 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div>
          <h2 className="font-['Montserrat',sans-serif] text-[25px] font-semibold text-white sm:text-[30px]">
            Payment Method
          </h2>

          <div className="mt-1 h-[2px] w-[250px] bg-white/60" />
        </div>

        <select
          value={paymentMethod}
          onChange={(event) => setPaymentMethod(event.target.value)}
          className={`h-9 w-full rounded-md border border-black/10 bg-white px-3 text-sm font-semibold outline-none transition focus:ring-2 focus:ring-white/70 sm:w-[350px] ${
            paymentMethod ? "text-[#3f5b44]" : "text-[#3f5b44]/45"
          }`}
        >
          <option value="">Bank Transfer / GCASH</option>
          <option value="BANK TRANSFER">Bank Transfer</option>
          <option value="GCASH">GCASH</option>
        </select>
      </div>

      <div className="mb-7 max-w-[360px]">
        <label className="mb-2 block text-[16px] font-extrabold text-white">
          Payment Terms
        </label>

        <div className="rounded-md bg-white px-3 py-3 text-[#3f5b44]">
          <label className="flex items-center gap-3 text-sm font-extrabold">
            <input
              type="checkbox"
              checked={isDownPayment}
              onChange={(event) => setIsDownPayment(event.target.checked)}
              className="h-4 w-4 accent-[#3f5b44]"
            />
            Down payment only 50%
          </label>

          <p className="mt-2 text-xs font-semibold text-[#3f5b44]/70">
            Leave unchecked for full payment.
          </p>
        </div>
      </div>

      <div className="rounded-md bg-white px-5 py-7 shadow-sm">
        <p className="mb-5 text-center font-['Montserrat',sans-serif] text-sm font-extrabold uppercase tracking-wide text-[#3f5b44]">
          Click a QR image to select payment method
        </p>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <QrImageCard
            title="Bank Transfer QR"
            method="BANK TRANSFER"
            src={BANK_QR_IMAGE}
            selected={paymentMethod === "BANK TRANSFER"}
            onSelect={setPaymentMethod}
          />

          <QrImageCard
            title="GCASH QR"
            method="GCASH"
            src={GCASH_QR_IMAGE}
            selected={paymentMethod === "GCASH"}
            onSelect={setPaymentMethod}
          />
        </div>
      </div>

      <div className="mt-6">
        <FileField
          label="Upload Proof of Payment"
          file={proofFile}
          onChange={handleProofChange}
        />
      </div>
    </div>
  );
}

function QrImageCard({ title, method, src, selected, onSelect }) {
  const [hasError, setHasError] = useState(false);

  return (
    <button
      type="button"
      onClick={() => onSelect(method)}
      className={`relative flex flex-col items-center rounded-xl border-4 p-3 transition ${
        selected
          ? "border-[#3f5b44] bg-[#3f5b44]/10 shadow-[0_0_0_4px_rgba(63,91,68,0.16)]"
          : "border-transparent bg-transparent hover:border-[#3f5b44]/35 hover:bg-[#3f5b44]/5"
      }`}
    >
      {selected ? (
        <span className="absolute right-3 top-3 z-10 rounded-full bg-[#3f5b44] px-3 py-1 text-[10px] font-extrabold uppercase tracking-wide text-white shadow">
          ✓ Selected
        </span>
      ) : null}

      <div className="flex h-[190px] w-full max-w-[330px] items-center justify-center overflow-hidden rounded-md bg-[#b8b8b8]">
        {!hasError ? (
          <img
            src={src}
            alt={title}
            className="h-full w-full object-contain"
            onError={() => setHasError(true)}
          />
        ) : (
          <div className="px-4 text-center">
            <p className="font-['Montserrat',sans-serif] text-sm font-extrabold text-white">
              {title}
            </p>
            <p className="mt-1 text-xs font-semibold text-white/80">
              Add image in public folder
            </p>
          </div>
        )}
      </div>

      <p
        className={`mt-3 text-center text-xs font-extrabold uppercase tracking-wide ${
          selected ? "text-[#2f523d]" : "text-[#3f5b44]/80"
        }`}
      >
        {title}
      </p>
    </button>
  );
}

function Header({ navigate, goToProfile, openMenu }) {
  return (
    <header className="relative z-30 w-full bg-white shadow-[0_3px_0_rgba(0,0,0,0.18)]">
      <div className="flex h-[78px] w-full items-center justify-between px-5 sm:px-8 lg:px-12">
        <button
          onClick={() => navigate("/")}
          type="button"
          className="flex items-center gap-4"
          aria-label="Go to home"
        >
          <img
            src="/Logo.jpg"
            alt="Hotel logo"
            className="h-[52px] w-[52px] rounded-full object-cover"
            onError={(event) => {
              event.currentTarget.style.display = "none";
            }}
          />

          <span className="font-['Montserrat',sans-serif] text-[20px] font-extrabold uppercase tracking-wide text-[#385541] sm:text-[24px]">
            Hotel &amp; Resort
          </span>
        </button>

        <nav className="hidden items-center gap-9 md:flex">
          <NavButton label="Home" onClick={() => navigate("/")} />
          <NavButton label="Virtual Tour" onClick={() => navigate("/virtual-tour")} />
          <NavButton label="Contact" onClick={() => navigate("/hotel-contact-us")} />
        </nav>

        <button
          onClick={goToProfile}
          type="button"
          className="hidden font-['Montserrat',sans-serif] text-[14px] font-bold uppercase tracking-wide text-[#385541] transition hover:text-[#1f3528] md:block"
        >
          Profile
        </button>

        <button
          onClick={openMenu}
          type="button"
          aria-label="Open menu"
          className="rounded-md p-2 text-[#385541] md:hidden"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-7 w-7"
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

function NavButton({ label, onClick }) {
  return (
    <button
      onClick={onClick}
      type="button"
      className="font-['Montserrat',sans-serif] text-[14px] font-bold uppercase tracking-wide text-[#385541] transition hover:text-[#1f3528]"
    >
      {label}
    </button>
  );
}

function SummarySection({ title, children }) {
  return (
    <section>
      <h2 className="font-['Montserrat',sans-serif] text-[25px] font-semibold text-white sm:text-[30px]">
        {title}
      </h2>

      <div className="mt-1 h-[2px] w-[260px] bg-white/60" />

      <div className="mt-7 grid grid-cols-1 gap-x-10 gap-y-5 md:grid-cols-3">
        {children}
      </div>
    </section>
  );
}

function ReadOnlyField({ label, value }) {
  return (
    <div>
      <label className="mb-2 block text-[13px] font-extrabold text-white">
        {label}
      </label>

      <input
        readOnly
        value={value ?? ""}
        placeholder="—"
        className="h-9 w-full rounded-md border border-black/10 bg-white px-3 text-sm font-semibold text-[#3f5b44] outline-none placeholder:text-[#3f5b44]/45"
      />
    </div>
  );
}

function FileField({ label, file, onChange }) {
  return (
    <div>
      <label className="mb-2 block text-[13px] font-extrabold text-white">
        {label}
      </label>

      <input
        type="file"
        accept="image/*,.pdf"
        onChange={onChange}
        className="block h-9 w-full rounded-md border border-black/10 bg-white text-sm font-semibold text-[#3f5b44] file:mr-4 file:h-9 file:border-0 file:bg-[#f7f7f2] file:px-4 file:text-xs file:font-extrabold file:text-[#3f5b44] hover:file:bg-[#fffde9]"
      />

      <p className="mt-1 text-xs font-semibold text-white/75">
        {file ? file.name : "Accepted: JPG, PNG, PDF. Max 5MB."}
      </p>
    </div>
  );
}

function Footer() {
  return (
    <footer className="bg-[#f7f7f2] text-[#2f523d]">
      <div className="mx-auto grid max-w-[1280px] gap-5 px-5 py-4 sm:px-8 md:grid-cols-2 lg:grid-cols-[1.25fr_0.6fr_1.2fr_1fr_0.85fr] lg:gap-6 lg:px-10">
        <div className="flex items-center gap-3">
          <img
            src="/Logo.jpg"
            alt="Lumispire logo"
            className="h-[42px] w-[42px] rounded-full object-cover"
            onError={(event) => {
              event.currentTarget.style.display = "none";
            }}
          />

          <h2 className="font-['Montserrat',sans-serif] text-[25px] font-extrabold uppercase tracking-wide sm:text-[29px]">
            Lumispire
          </h2>
        </div>

        <FooterColumn title="Menu">
          <FooterLink>Home</FooterLink>
          <FooterLink>Course</FooterLink>
          <FooterLink>Requirements</FooterLink>
          <FooterLink>Profile</FooterLink>
        </FooterColumn>

        <FooterColumn title="Contact Information">
          <FooterText>ltc.amsi@gmail.com</FooterText>
          <FooterText>lorengladius@ltcmultiservices.com</FooterText>
          <FooterText>09959808051 / 09516281271</FooterText>
        </FooterColumn>

        <FooterColumn title="Address">
          <FooterText>2/F 5441 Currie Street,</FooterText>
          <FooterText>Palanan, Makati City</FooterText>
        </FooterColumn>

        <FooterColumn title="Follow Us">
          <div className="mt-2 flex gap-2">
            <span className="h-6 w-6 rounded-full bg-[#2f523d]/15" />
            <span className="h-6 w-6 rounded-full bg-[#2f523d]/15" />
            <span className="h-6 w-6 rounded-full bg-[#2f523d]/15" />
          </div>
        </FooterColumn>
      </div>

      <div className="mx-auto flex max-w-[1280px] flex-col gap-1 px-5 pb-2 text-[9px] font-bold tracking-wide text-[#2f523d]/80 sm:px-8 md:flex-row md:justify-between lg:px-10">
        <p>© 2026 LTC GROUP OF COMPANIES. All rights reserved.</p>
        <p>Developed by CRMS Tech Alliance</p>
      </div>
    </footer>
  );
}

function FooterColumn({ title, children }) {
  return (
    <div className="border-[#2f523d]/20 lg:border-l lg:pl-5">
      <h3 className="font-['Montserrat',sans-serif] text-[14px] font-extrabold leading-tight">
        {title}
      </h3>

      <div className="mt-2 space-y-1">{children}</div>
    </div>
  );
}

function FooterLink({ children }) {
  return (
    <button
      type="button"
      className="block text-left text-[10px] font-bold leading-4 text-[#2f523d]/85 transition hover:text-[#2f523d]"
    >
      {children}
    </button>
  );
}

function FooterText({ children }) {
  return (
    <p className="text-[10px] font-bold leading-4 text-[#2f523d]/85">
      {children}
    </p>
  );
}

function MobileMenu({ onClose, navigate, goToProfile }) {
  return (
    <div className="fixed inset-0 z-50 md:hidden">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      <div className="absolute right-0 top-0 h-full w-[300px] bg-white p-5 shadow-2xl">
        <div className="mb-6 flex items-center justify-between">
          <div className="font-['Montserrat',sans-serif] text-lg font-bold text-[#385541]">
            MENU
          </div>

          <button
            onClick={onClose}
            className="rounded-md p-2 hover:bg-black/5"
            aria-label="Close menu"
            type="button"
          >
            ✕
          </button>
        </div>

        <div className="space-y-3">
          <MenuItem
            label="HOME"
            onClick={() => {
              onClose();
              navigate("/");
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
            label="PROFILE"
            onClick={() => {
              onClose();
              goToProfile();
            }}
          />
        </div>
      </div>
    </div>
  );
}

function MenuItem({ label, onClick }) {
  return (
    <button
      onClick={onClick}
      type="button"
      className="w-full rounded-xl bg-[#385541]/10 py-4 font-['Montserrat',sans-serif] text-sm font-semibold tracking-wide text-[#385541] transition hover:bg-[#385541]/20"
    >
      {label}
    </button>
  );
}
