import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

const PLACEHOLDER_IMAGE = "https://placehold.co/900x500?text=Event+Package";
const HERO_IMAGES = ["/HotelLanding1.png", "/HotelLanding2.png"];

const fontMontserrat = { fontFamily: "'Montserrat', sans-serif" };
const fontPontano = { fontFamily: "'Pontano Sans', sans-serif" };
const fontPoppins = { fontFamily: "'Poppins', sans-serif" };

function getHotelToken() {
  return localStorage.getItem("token") || localStorage.getItem("hotelToken") || "";
}

function formatPeso(value) {
  const num = Number(value || 0);

  if (!num) return "Contact for price";

  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    maximumFractionDigits: 0,
  }).format(num);
}

function parsePaxFromLabel(value = "") {
  const match = String(value || "").match(/(\d+)/);
  return match ? Number(match[1]) : 0;
}

function inferTimeLabelFromSlots(slots = []) {
  const normalized = Array.isArray(slots) ? slots.length : 0;

  if (normalized === 3) return "22 Hours";
  if (normalized === 11) return "12 Hours";
  if (normalized >= 10) return "8 Hours";

  return normalized ? "Custom Time" : "8 Hours";
}

function buildPriceOptions(pkg) {
  if (!pkg) return [];

  if (Array.isArray(pkg.variants) && pkg.variants.length > 0) {
    return pkg.variants
      .filter((variant) => variant?.isActive !== false)
      .map((variant, index) => {
        const paxNumber = Number(variant.pax || parsePaxFromLabel(variant.label));
        const label = String(variant.label || (paxNumber ? `${paxNumber} Pax` : "")).trim();
        const rawPrice = Number(variant.price || 0);
        const timeLabel = variant.timeVariationLabel || inferTimeLabelFromSlots(variant.timeSlots);

        return {
          pax: label || "Package Rate",
          label: label || "Package Rate",
          timeLabel,
          paxNumber,
          price: formatPeso(rawPrice),
          rawPrice,
          displayOrder: Number(variant.displayOrder || index + 1),
        };
      })
      .filter((item) => item.label && item.paxNumber > 0 && item.rawPrice > 0)
      .sort(
        (a, b) =>
          Number(a.displayOrder || 0) - Number(b.displayOrder || 0) ||
          Number(a.paxNumber || 0) - Number(b.paxNumber || 0)
      );
  }

  if (Array.isArray(pkg.prices) && pkg.prices.length > 0) {
    return pkg.prices;
  }

  if (pkg.capacity && pkg.price) {
    return [
      {
        pax: pkg.capacity,
        label: pkg.capacity,
        paxNumber: parsePaxFromLabel(pkg.capacity),
        price: formatPeso(pkg.price),
        rawPrice: Number(pkg.price || 0),
      },
    ];
  }

  if (pkg.price) {
    return [
      {
        pax: "Package Rate",
        label: "Package Rate",
        paxNumber: 0,
        price: formatPeso(pkg.price),
        rawPrice: Number(pkg.price || 0),
      },
    ];
  }

  return [];
}

function getPriceLabel(pkg) {
  const options = buildPriceOptions(pkg);
  const prices = options
    .map((item) => Number(item.rawPrice || 0))
    .filter((price) => Number.isFinite(price) && price > 0);

  if (prices.length) {
    const min = Math.min(...prices);
    const max = Math.max(...prices);

    if (min === max) return formatPeso(min);

    return `${formatPeso(min)} - ${formatPeso(max)}`;
  }

  if (pkg?.subtitle) return pkg.subtitle;

  return formatPeso(pkg?.price);
}

function normalizeEventPackage(pkg = {}) {
  const prices = buildPriceOptions(pkg);

  return {
    ...pkg,
    id: pkg._id || pkg.seedKey || pkg.id,
    name: pkg.title || pkg.name || "Event Package",
    shortPrice: getPriceLabel(pkg),
    banner: pkg.imageUrl || PLACEHOLDER_IMAGE,
    prices,
    menuTitle: pkg.menuTitle || "Package Details",
    menu: Array.isArray(pkg.menu) ? pkg.menu : [],
    freebies: Array.isArray(pkg.freebies) ? pkg.freebies : [],
    inclusions: Array.isArray(pkg.inclusions) ? pkg.inclusions : [],
  };
}

const RevealOnScroll = ({ children, className = "", delay = 0, y = 18 }) => {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(element);
        }
      },
      {
        threshold: 0.12,
        rootMargin: "0px 0px -40px 0px",
      }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? "translateY(0px)" : `translateY(${y}px)`,
        transition: "opacity 650ms ease, transform 650ms ease",
        transitionDelay: `${delay}ms`,
        willChange: "opacity, transform",
      }}
    >
      {children}
    </div>
  );
};

export default function EventPackage() {
  const navigate = useNavigate();

  const [isOpen, setIsOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [eventPackages, setEventPackages] = useState([]);
  const [loadingPackages, setLoadingPackages] = useState(true);
  const [packageError, setPackageError] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [heroIndex, setHeroIndex] = useState(0);

  const API_BASE = useMemo(() => {
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
  }, []);

  const cardsPerPage = 4;

  const pageCount = useMemo(() => {
    return Math.max(1, Math.ceil(eventPackages.length / cardsPerPage));
  }, [eventPackages.length]);

  const visiblePackages = useMemo(() => {
    const start = currentPage * cardsPerPage;
    return eventPackages.slice(start, start + cardsPerPage);
  }, [eventPackages, currentPage]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setHeroIndex((prev) => (prev + 1) % HERO_IMAGES.length);
    }, 5000);

    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (pageCount <= 1 || loadingPackages || packageError || eventPackages.length === 0) {
      return undefined;
    }

    const timer = window.setInterval(() => {
      setCurrentPage((prev) => (prev + 1) % pageCount);
    }, 5000);

    return () => window.clearInterval(timer);
  }, [pageCount, loadingPackages, packageError, eventPackages.length]);

  useEffect(() => {
    if (currentPage > pageCount - 1) {
      setCurrentPage(0);
    }
  }, [currentPage, pageCount]);

  const goToProfile = () => {
    navigate(getHotelToken() ? "/hotel-profile" : "/hotel-login");
  };

  const getImageSrc = (pkg) => {
    return pkg?.imageUrl?.trim() || pkg?.banner || PLACEHOLDER_IMAGE;
  };

  const fetchPackages = async () => {
    setLoadingPackages(true);
    setPackageError("");

    try {
      const res = await fetch(`${API_BASE}/packages?type=event_package`);
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.message || "Failed to load event packages.");
      }

      const list = Array.isArray(data.packages) ? data.packages : [];

      const normalized = list
        .filter((item) => item?.isActive !== false)
        .sort((a, b) => {
          const orderA = Number(a.displayOrder || 0);
          const orderB = Number(b.displayOrder || 0);

          if (orderA !== orderB) return orderA - orderB;

          return String(a.title || "").localeCompare(String(b.title || ""));
        })
        .map(normalizeEventPackage);

      setEventPackages(normalized);
      setCurrentPage(0);
    } catch (error) {
      console.error("Failed to load event packages:", error);
      setPackageError(
        error.message ||
          "Unable to load Event Package listings. Please check your backend server."
      );
      setEventPackages([]);
    } finally {
      setLoadingPackages(false);
    }
  };

  useEffect(() => {
    fetchPackages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const goToBookNow = (pkg = null) => {
    const token = getHotelToken();

    if (!token) {
      navigate("/hotel-login");
      return;
    }

    navigate("/event-form", {
      state: pkg
        ? {
            selectedCategory: "Event Package",
            selectedPackageId: pkg._id || pkg.id || "",
            selectedPackage: pkg.title || pkg.name || "",
            selectedPackageTitle: pkg.title || pkg.name || "",
            selectedPackagePrice: Number(pkg.price || 0),
            selectedPriceOptions: pkg.prices || [],
            selectedCapacity: pkg.capacity || "",
            selectedDuration: pkg.duration || "",
            selectedDescription: pkg.description || "",
            selectedInclusions: pkg.inclusions || [],
          }
        : {},
    });
  };

  return (
    <div className="ltc-event-package-page" style={fontPontano}>
      <style>{`
        @import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap");

        .ltc-event-package-page {
          --green-950: #071f14;
          --green-900: #0e3321;
          --green-800: #174a30;
          --green-700: #235f3e;
          --footer-green: #082719;
          --gold: #d7a84d;
          --gold-soft: #f4d484;
          --dark: #101828;
          --muted: #667085;
          --glass: rgba(255,255,255,.78);
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

        .ltc-event-package-page * {
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
          opacity: 0;
          transition: opacity 1000ms ease;
        }

        .ltc-hero-slide.active {
          opacity: 1;
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
          opacity: .98;
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
          max-width: 900px;
          margin: 0 auto;
          text-align: center;
        }

        .ltc-hero h2 {
          margin: 0;
          color: white;
          font-size: clamp(34px, 5vw, 58px);
          line-height: 1.05;
          font-weight: 900;
          letter-spacing: -.055em;
          text-shadow: 0 8px 26px rgba(0,0,0,.22);
        }

        .ltc-hero h2 span {
          color: var(--gold-soft);
        }

        .ltc-hero p {
          max-width: 760px;
          margin: 18px auto 0;
          color: rgba(255,255,255,.80);
          font-size: 17px;
          line-height: 1.8;
        }

        .ltc-service-tabs {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 14px;
          max-width: 780px;
          margin: 30px auto 0;
        }

        .ltc-service-tab {
          min-height: 48px;
          border: 1px solid rgba(255,255,255,.22);
          border-radius: 999px;
          background: rgba(255,255,255,.12);
          color: white;
          padding: 0 18px;
          font-size: 13px;
          font-weight: 900;
          cursor: pointer;
          backdrop-filter: blur(8px);
          transition: .28s var(--ease);
        }

        .ltc-service-tab:hover,
        .ltc-service-tab.active {
          transform: translateY(-3px);
          color: #102418;
          background: linear-gradient(135deg,#f4d484,#d7a84d);
          border-color: transparent;
          box-shadow: 0 16px 35px rgba(215,168,77,.28);
        }

        .ltc-section {
          padding: 84px 0;
        }

        .ltc-section-title {
          text-align: center;
          margin-bottom: 42px;
        }

        .ltc-section-title span {
          color: var(--green-700);
          font-size: 12px;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: .18em;
        }

        .ltc-section-title h3 {
          margin: 10px 0 0;
          color: var(--green-950);
          font-size: clamp(32px,4vw,50px);
          line-height: 1.08;
          letter-spacing: -.055em;
          font-weight: 900;
        }

        .ltc-section-title p {
          max-width: 760px;
          margin: 15px auto 0;
          color: var(--muted);
        }

        .ltc-services-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          margin-bottom: 24px;
        }

        .ltc-book-button,
        .ltc-modal-button,
        .ltc-retry-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-height: 48px;
          padding: 0 24px;
          border-radius: 999px;
          border: 0;
          color: #102418;
          background: linear-gradient(135deg,#f4d484,#d7a84d);
          box-shadow: 0 16px 35px rgba(215,168,77,.28);
          font-size: 14px;
          font-weight: 900;
          cursor: pointer;
          transition: .28s var(--ease);
          text-decoration: none;
        }

        .ltc-book-button:hover,
        .ltc-modal-button:hover,
        .ltc-retry-button:hover {
          transform: translateY(-3px);
        }

        .ltc-book-button:disabled {
          cursor: not-allowed;
          opacity: .6;
          transform: none;
        }

        .ltc-card-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 24px;
          align-items: stretch;
        }

        .ltc-card-grid > div {
          height: 100%;
        }

        .ltc-service-card,
        .ltc-status-card,
        .ltc-error-card {
          position: relative;
          overflow: hidden;
          border-radius: var(--radius);
          background: var(--glass);
          border: 1px solid rgba(255,255,255,.76);
          box-shadow: var(--shadow-md);
          backdrop-filter: blur(18px);
          transition: .38s var(--ease);
        }

        .ltc-service-card::before,
        .ltc-status-card::before,
        .ltc-error-card::before {
          content: "";
          position: absolute;
          inset: 0 0 auto;
          height: 6px;
          background: linear-gradient(90deg,var(--green-700),var(--gold));
          z-index: 3;
        }

        .ltc-service-card:hover,
        .ltc-status-card:hover,
        .ltc-error-card:hover {
          transform: translateY(-10px);
          box-shadow: var(--shadow-lg);
          border-color: rgba(215,168,77,.45);
        }

        .ltc-service-card {
          height: 430px;
          min-height: 430px;
          max-height: 430px;
          display: flex;
          flex-direction: column;
          cursor: pointer;
        }

        .ltc-service-card:focus {
          outline: none;
          border-color: rgba(215,168,77,.70);
          box-shadow: 0 0 0 4px rgba(215,168,77,.18), var(--shadow-lg);
        }

        .ltc-service-media {
          height: 195px;
          min-height: 195px;
          max-height: 195px;
          overflow: hidden;
          background: #e4e7ec;
          flex: 0 0 195px;
        }

        .ltc-service-media img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          transition: .45s var(--ease);
        }

        .ltc-service-card:hover .ltc-service-media img {
          transform: scale(1.06);
        }

        .ltc-service-content {
          padding: 20px;
          flex: 1;
          display: flex;
          flex-direction: column;
          min-height: 0;
        }

        .ltc-service-meta {
          display: flex;
          flex-wrap: wrap;
          align-items: flex-start;
          gap: 8px;
          min-height: 72px;
          max-height: 72px;
          overflow: hidden;
          margin-bottom: 10px;
        }

        .ltc-pill {
          display: inline-flex;
          align-items: center;
          min-height: 34px;
          max-width: 100%;
          border-radius: 999px;
          background: rgba(35,95,62,.08);
          color: var(--green-800);
          padding: 6px 12px;
          font-size: 11px;
          line-height: 1.25;
          font-weight: 900;
        }

        .ltc-service-content h3 {
          margin: 0;
          color: var(--green-950);
          font-size: 20px;
          line-height: 1.18;
          font-weight: 900;
          letter-spacing: -.035em;
          min-height: 48px;
          max-height: 48px;
          overflow: hidden;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
        }

        .ltc-pagination {
          margin-top: 30px;
          display: flex;
          justify-content: center;
          gap: 10px;
        }

        .ltc-dot {
          width: 12px;
          height: 12px;
          border-radius: 999px;
          border: 1px solid var(--green-800);
          background: transparent;
          cursor: pointer;
          transition: .25s var(--ease);
        }

        .ltc-dot.active,
        .ltc-dot:hover {
          background: var(--green-800);
          transform: scale(1.15);
        }

        .ltc-status-card,
        .ltc-error-card {
          padding: 34px;
          text-align: center;
        }

        .ltc-status-card p,
        .ltc-error-card p {
          margin: 0;
          color: var(--green-950);
          font-size: 18px;
          line-height: 1.35;
          font-weight: 900;
        }

        .ltc-status-card small {
          display: block;
          margin-top: 8px;
          color: var(--muted);
          font-size: 13px;
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

        .ltc-socials {
          display: flex;
          gap: 8px;
        }

        .ltc-socials span {
          width: 26px;
          height: 26px;
          border-radius: 999px;
          background: rgba(255,255,255,.13);
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

        .ltc-modal-shell {
          position: fixed;
          inset: 0;
          z-index: 70;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 16px;
        }

        .ltc-modal-backdrop {
          position: absolute;
          inset: 0;
          background: rgba(0,0,0,.6);
          backdrop-filter: blur(3px);
        }

        .ltc-modal-card {
          position: relative;
          width: min(680px, 100%);
          max-height: 90vh;
          overflow-y: auto;
          border-radius: 26px;
          background: white;
          box-shadow: 0 32px 90px rgba(0,0,0,.34);
          padding: 28px;
        }

        .ltc-modal-top {
          display: flex;
          justify-content: space-between;
          gap: 18px;
        }

        .ltc-modal-eyebrow {
          margin: 0 0 8px;
          color: var(--green-700);
          font-size: 12px;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: .18em;
        }

        .ltc-modal-card h3 {
          margin: 0;
          color: var(--green-950);
          font-size: 28px;
          line-height: 1.12;
          font-weight: 900;
          letter-spacing: -.045em;
        }

        .ltc-modal-close {
          flex: 0 0 auto;
          width: 38px;
          height: 38px;
          border-radius: 12px;
          border: 0;
          background: #f2f4f7;
          color: #101828;
          cursor: pointer;
        }

        .ltc-modal-image {
          margin-top: 20px;
          width: 100%;
          height: 250px;
          object-fit: cover;
          border-radius: 22px;
        }

        .ltc-info-grid {
          margin-top: 18px;
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 12px;
        }

        .ltc-info-box {
          border-radius: 18px;
          background: rgba(35,95,62,.08);
          padding: 14px;
        }

        .ltc-info-box span {
          display: block;
          color: var(--muted);
          font-size: 11px;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: .08em;
        }

        .ltc-info-box strong {
          display: block;
          margin-top: 4px;
          color: var(--green-800);
          font-size: 14px;
          line-height: 1.35;
        }

        .ltc-modal-desc {
          margin: 18px 0 0;
          color: var(--muted);
          font-size: 14px;
          line-height: 1.75;
        }

        .ltc-list-block {
          margin-top: 18px;
          padding: 18px;
          border-radius: 20px;
          background: #f7f7f5;
        }

        .ltc-list-block h4 {
          margin: 0;
          color: var(--green-950);
          font-size: 18px;
          font-weight: 900;
        }

        .ltc-list-block ul {
          margin: 12px 0 0;
          padding-left: 0;
          color: var(--muted);
          font-size: 14px;
          line-height: 1.7;
          list-style: none;
        }

        .ltc-rate-list {
          margin-top: 12px;
          overflow: hidden;
          border-radius: 18px;
          border: 1px solid rgba(35,95,62,.12);
          background: white;
        }

        .ltc-rate-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 14px;
          padding: 13px 15px;
          border-bottom: 1px solid rgba(35,95,62,.1);
        }

        .ltc-rate-row:last-child {
          border-bottom: 0;
        }

        .ltc-rate-row span {
          color: var(--green-800);
          font-size: 13px;
          font-weight: 900;
        }

        .ltc-rate-row strong {
          color: var(--muted);
          font-size: 13px;
          font-weight: 800;
          text-align: right;
        }

        .ltc-modal-actions {
          margin-top: 22px;
          display: flex;
          justify-content: flex-end;
          gap: 12px;
        }

        .ltc-secondary-button {
          min-height: 44px;
          padding: 0 20px;
          border-radius: 999px;
          border: 1px solid rgba(35,95,62,.18);
          background: white;
          color: var(--green-800);
          font-size: 14px;
          font-weight: 900;
          cursor: pointer;
        }

        @media (max-width: 1100px) {
          .ltc-card-grid,
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

          .ltc-services-header {
            flex-direction: column;
            align-items: stretch;
          }

          .ltc-book-button {
            width: 100%;
          }

          .ltc-service-tabs,
          .ltc-card-grid,
          .ltc-footer-grid {
            grid-template-columns: 1fr;
          }

          .ltc-service-card {
            height: 430px;
            min-height: 430px;
            max-height: 430px;
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

          .ltc-copyright,
          .ltc-modal-actions {
            flex-direction: column;
          }

          .ltc-secondary-button,
          .ltc-modal-button {
            width: 100%;
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

          .ltc-hero {
            padding: 70px 0 66px;
          }

          .ltc-hero h2 {
            font-size: clamp(34px, 11vw, 46px);
            letter-spacing: -.045em;
          }

          .ltc-hero p {
            font-size: 15px;
          }

          .ltc-section {
            padding: 64px 0;
          }

          .ltc-info-grid {
            grid-template-columns: 1fr;
          }

          .ltc-modal-card {
            padding: 22px;
          }

          .ltc-modal-image {
            height: 210px;
          }

          .ltc-service-card {
            height: 410px;
            min-height: 410px;
            max-height: 410px;
          }

          .ltc-service-media {
            height: 185px;
            min-height: 185px;
            max-height: 185px;
            flex-basis: 185px;
          }
        }
      `}</style>

      <Header navigate={navigate} goToProfile={goToProfile} openMenu={() => setIsOpen(true)} />

      <main>
        <section className="ltc-hero">
          {HERO_IMAGES.map((image, index) => (
            <img
              key={image}
              src={image}
              alt="Hotel and resort background"
              className={`ltc-hero-slide ${heroIndex === index ? "active" : ""}`}
              onError={(event) => {
                event.currentTarget.style.display = "none";
              }}
            />
          ))}

          <div className="ltc-container ltc-hero-content">
            <RevealOnScroll>
              <h2 style={fontMontserrat}>
                Event <span>Packages</span>
              </h2>

              <p style={fontPontano}>
                Explore event packages designed for celebrations, gatherings, meetings, and special
                occasions with clear package details and price options.
              </p>

              <div className="ltc-service-tabs" style={fontPoppins}>
                <ServiceTab label="Resort & Venues" onClick={() => navigate("/resort-venue")} />
                <ServiceTab label="Hotel Condo" onClick={() => navigate("/hotel-condo")} />
                <ServiceTab
                  active
                  label="Event Packages"
                  onClick={() => navigate("/event-package")}
                />
              </div>
            </RevealOnScroll>
          </div>
        </section>

        <section className="ltc-section">
          <div className="ltc-container">
            <RevealOnScroll className="ltc-section-title">
              <span>Services We Offer</span>
              <h3 style={fontMontserrat}>Event Packages</h3>
              <p style={fontPontano}>
                Browse available event packages and check the details before sending your booking
                request.
              </p>
            </RevealOnScroll>

            <div className="ltc-services-header">
              <div>
                <h3
                  style={{
                    ...fontMontserrat,
                    margin: 0,
                    color: "var(--green-950)",
                    fontSize: "24px",
                    fontWeight: 900,
                    letterSpacing: "-.04em",
                    lineHeight: 1.15,
                  }}
                >
                  Available Event Packages
                </h3>
              </div>

              <button
                onClick={() => goToBookNow()}
                disabled={loadingPackages}
                type="button"
                className="ltc-book-button"
                style={fontMontserrat}
              >
                Book Now
              </button>
            </div>

            {loadingPackages ? (
              <StatusCard message="Loading event packages..." />
            ) : packageError ? (
              <div className="ltc-error-card">
                <p style={fontMontserrat}>{packageError}</p>

                <button
                  onClick={fetchPackages}
                  type="button"
                  className="ltc-retry-button"
                  style={{ ...fontMontserrat, marginTop: "18px" }}
                >
                  Try Again
                </button>
              </div>
            ) : eventPackages.length === 0 ? (
              <StatusCard
                message="No active Event Packages available."
                sub="Please add Event Packages in the admin side."
              />
            ) : (
              <>
                <div className="ltc-card-grid">
                  {visiblePackages.map((item, index) => (
                    <RevealOnScroll
                      key={item._id || item.seedKey || item.id || item.name}
                      delay={index * 70}
                    >
                      <ServiceCard
                        title={item.name}
                        imageSrc={getImageSrc(item)}
                        topLine={
                          item.capacity
                            ? `Capacity: ${item.capacity}`
                            : item.duration || "Event Package"
                        }
                        secondLine={item.shortPrice}
                        onDetails={() => setSelectedPackage(item)}
                      />
                    </RevealOnScroll>
                  ))}
                </div>

                {pageCount > 1 && (
                  <div className="ltc-pagination">
                    {Array.from({ length: pageCount }).map((_, index) => (
                      <button
                        key={`event-dot-${index}`}
                        onClick={() => setCurrentPage(index)}
                        aria-label={`Go to slide ${index + 1}`}
                        type="button"
                        className={`ltc-dot ${currentPage === index ? "active" : ""}`}
                      />
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </section>

        <Footer />
      </main>

      {isOpen && (
        <MobileMenu
          onClose={() => setIsOpen(false)}
          navigate={navigate}
          goToProfile={goToProfile}
        />
      )}

      {selectedPackage && (
        <PackageModal
          data={selectedPackage}
          getImageSrc={getImageSrc}
          onClose={() => setSelectedPackage(null)}
          onBook={() => {
            const pkg = selectedPackage;
            setSelectedPackage(null);
            goToBookNow(pkg);
          }}
        />
      )}
    </div>
  );
}

function Header({ navigate, goToProfile, openMenu }) {
  const signedIn = localStorage.getItem("token") || localStorage.getItem("hotelToken");

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
            src="/HotelLogo.png"
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
            label={signedIn ? "Profile" : "Sign In"}
            onClick={goToProfile}
            className="ltc-profile-button"
          />
        </nav>

        <button onClick={openMenu} type="button" aria-label="Open menu" className="ltc-menu-button">
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

function ServiceTab({ label, active = false, onClick }) {
  return (
    <button
      onClick={onClick}
      type="button"
      className={`ltc-service-tab ${active ? "active" : ""}`}
      style={fontMontserrat}
    >
      {label}
    </button>
  );
}

function ServiceCard({ title, imageSrc, topLine, secondLine, onDetails }) {
  return (
    <article
      className="ltc-service-card"
      role="button"
      tabIndex={0}
      aria-label={`View details for ${title}`}
      onClick={onDetails}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onDetails();
        }
      }}
    >
      <div className="ltc-service-media">
        <img
          src={imageSrc}
          alt={title}
          onError={(event) => {
            event.currentTarget.src = PLACEHOLDER_IMAGE;
          }}
        />
      </div>

      <div className="ltc-service-content">
        <div className="ltc-service-meta">
          <span className="ltc-pill" style={fontMontserrat}>
            {topLine}
          </span>

          <span className="ltc-pill" style={fontMontserrat}>
            {secondLine}
          </span>
        </div>

        <h3 style={fontMontserrat}>{title}</h3>
      </div>
    </article>
  );
}

function StatusCard({ message, sub = "" }) {
  return (
    <div className="ltc-status-card">
      <p style={fontMontserrat}>{message}</p>
      {sub ? <small style={fontPontano}>{sub}</small> : null}
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
              src="/HotelLumispireLogo.png"
              alt="Lumispire logo"
              onError={(event) => {
                event.currentTarget.style.display = "none";
              }}
            />

            <h4 style={fontMontserrat}>Lumispire</h4>
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
  const signedIn = localStorage.getItem("token") || localStorage.getItem("hotelToken");

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

function PackageModal({ data, onClose, onBook, getImageSrc }) {
  const prices = Array.isArray(data.prices) ? data.prices : [];
  const inclusions = Array.isArray(data.inclusions) ? data.inclusions : [];

  return (
    <div className="ltc-modal-shell">
      <div className="ltc-modal-backdrop" onClick={onClose} />

      <div className="ltc-modal-card">
        <div className="ltc-modal-top">
          <div>
            <p className="ltc-modal-eyebrow" style={fontMontserrat}>
              Event Package
            </p>

            <h3 style={fontMontserrat}>{data.name}</h3>

            <p className="ltc-modal-desc" style={{ ...fontPontano, marginTop: "8px" }}>
              {data.shortPrice}
            </p>
          </div>

          <button
            onClick={onClose}
            className="ltc-modal-close"
            aria-label="Close details"
            type="button"
          >
            ✕
          </button>
        </div>

        <img
          src={getImageSrc(data)}
          alt={data.name}
          className="ltc-modal-image"
          onError={(event) => {
            event.currentTarget.src = PLACEHOLDER_IMAGE;
          }}
        />

        <div className="ltc-info-grid">
          <InfoBox label="Duration" value={data.duration || "-"} />
          <InfoBox label="Capacity" value={data.capacity || "-"} />
          <InfoBox label="Price" value={data.shortPrice || "Contact"} />
        </div>

        {data.description ? (
          <p className="ltc-modal-desc" style={fontPontano}>
            {data.description}
          </p>
        ) : null}

        {prices.length > 0 ? (
          <ListBlock
            title="Capacity and Price Options"
            items={prices.map(
              (option) =>
                `${option.label || option.pax || "Rate"} - ${
                  option.timeLabel || "8 Hours"
                } - ${option.price || "Contact for price"}`
            )}
          />
        ) : null}

        {inclusions.length > 0 ? (
          <ListBlock title="Package Inclusions" items={inclusions} />
        ) : null}

        <div className="ltc-modal-actions">
          <button
            onClick={onClose}
            type="button"
            className="ltc-secondary-button"
            style={fontMontserrat}
          >
            Close
          </button>

          <button onClick={onBook} type="button" className="ltc-modal-button" style={fontMontserrat}>
            Book Now
          </button>
        </div>
      </div>
    </div>
  );
}

function InfoBox({ label, value }) {
  return (
    <div className="ltc-info-box">
      <span style={fontMontserrat}>{label}</span>
      <strong style={fontPontano}>{value}</strong>
    </div>
  );
}

function ListBlock({ title, items }) {
  return (
    <div className="ltc-list-block">
      <h4 style={fontMontserrat}>{title}</h4>

      <ul style={fontPontano}>
        {items.map((item, index) => (
          <li key={`${title}-${index}`}>- {item}</li>
        ))}
      </ul>
    </div>
  );
}