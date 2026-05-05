import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

const PLACEHOLDER_IMAGE = "https://placehold.co/900x500?text=Hotel+Room";

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

function normalizeDuration(value = "") {
  const text = String(value || "").toLowerCase();

  if (text.includes("8")) return "8 Hours";
  if (text.includes("12")) return "12 Hours";
  if (text.includes("22")) return "22 Hours";

  return String(value || "").trim();
}

function getDurationOrder(duration = "") {
  const normalized = normalizeDuration(duration);

  if (normalized === "8 Hours") return 1;
  if (normalized === "12 Hours") return 2;
  if (normalized === "22 Hours") return 3;

  return 99;
}

function normalizeRoomType(title = "") {
  const lower = String(title || "").toLowerCase();

  if (lower.includes("nature")) return "Nature";
  if (lower.includes("simple")) return "Simple";
  if (lower.includes("standard")) return "Standard";
  if (lower.includes("deluxe")) return "Deluxe";
  if (lower.includes("condo")) return "Condo";

  return (
    String(title || "Room")
      .replace(/\s*-\s*\d+\s*hours?/i, "")
      .replace(/\s+\d+\s*hours?/i, "")
      .trim() || "Room"
  );
}

function getDisplayRoomTitle(roomType = "") {
  const normalized = normalizeRoomType(roomType);

  if (normalized === "Nature") return "Nature Room";
  if (normalized === "Simple") return "Simple Room";

  return `${normalized} Room`;
}

function parseMaxPax(capacity = "") {
  const matches = String(capacity || "").match(/\d+/g);
  if (!matches || !matches.length) return null;

  const numbers = matches
    .map((item) => Number(item))
    .filter((item) => Number.isFinite(item) && item > 0);

  if (!numbers.length) return null;

  return Math.max(...numbers);
}

function getMinPrice(rates = []) {
  const prices = rates
    .map((rate) => Number(rate.price || 0))
    .filter((price) => Number.isFinite(price) && price > 0);

  if (!prices.length) return 0;

  return Math.min(...prices);
}

function getPriceRange(rates = []) {
  const prices = rates
    .map((rate) => Number(rate.price || 0))
    .filter((price) => Number.isFinite(price) && price > 0)
    .sort((a, b) => a - b);

  if (!prices.length) return "Contact for price";

  const min = prices[0];
  const max = prices[prices.length - 1];

  if (min === max) return formatPeso(min);

  return `${formatPeso(min)} - ${formatPeso(max)}`;
}

function normalizeCapacityText(value = "") {
  let text = String(value || "").trim();

  if (!text) return "";

  text = text
    .replace(/^total\s+pax\s*:?\s*/i, "")
    .replace(/^venue\s+capacity\s*:?\s*/i, "")
    .replace(/^maximum\s+capacity\s*:?\s*/i, "")
    .replace(/^maximum\s+/i, "")
    .trim();

  if (!text) return "";

  if (/\b(max|maximum)\b/i.test(text)) return text;

  if (/\d/.test(text)) {
    if (/(pax|guest|guests)/i.test(text)) return `${text} max`;
    return `${text} pax max`;
  }

  return text;
}

function getCapacityText(packages = []) {
  const capacities = packages
    .map((pkg) => normalizeCapacityText(pkg.capacity))
    .filter(Boolean);

  if (capacities.length) {
    const unique = [...new Set(capacities)];
    return unique.join(" / ");
  }

  const maxPax = Math.max(
    ...packages.map((pkg) => parseMaxPax(pkg.capacity)).filter(Boolean),
    0
  );

  return maxPax ? `${maxPax} pax max` : "";
}

function getImageSrc(item) {
  return item?.imageUrl?.trim() || PLACEHOLDER_IMAGE;
}

function buildRatesFromPackage(pkg = {}) {
  const variants = Array.isArray(pkg.variants)
    ? pkg.variants.filter((variant) => variant?.isActive !== false)
    : [];

  if (variants.length) {
    return variants
      .map((variant, index) => ({
        packageId: pkg._id || "",
        packageTitle: pkg.title || "",
        duration: normalizeDuration(variant.label),
        price: Number(variant.price || 0),
        capacity: pkg.capacity || "",
        displayOrder: Number(variant.displayOrder || index + 1),
      }))
      .filter((rate) => rate.duration);
  }

  return [
    {
      packageId: pkg._id || "",
      packageTitle: pkg.title || "",
      duration: normalizeDuration(pkg.duration),
      price: Number(pkg.price || 0),
      capacity: pkg.capacity || "",
      displayOrder: Number(pkg.displayOrder || 0),
    },
  ].filter((rate) => rate.duration);
}

function buildRoomCards(packages = []) {
  const roomMap = new Map();

  packages
    .filter((pkg) => pkg?.isActive !== false)
    .forEach((pkg) => {
      const roomType = normalizeRoomType(pkg.title || "");
      const key = roomType.toLowerCase();

      if (!roomMap.has(key)) {
        roomMap.set(key, {
          _id: `room-${key}`,
          roomType,
          title: getDisplayRoomTitle(roomType),
          subtitle: "",
          description: "",
          duration: "",
          price: 0,
          priceRange: "",
          capacity: "",
          imageUrl: "",
          inclusions: [],
          displayOrder: Number(pkg.displayOrder || 0),
          packages: [],
          rates: [],
        });
      }

      const current = roomMap.get(key);

      current.packages.push(pkg);
      current.rates.push(...buildRatesFromPackage(pkg));

      if (!current.subtitle && pkg.subtitle) current.subtitle = pkg.subtitle;
      if (!current.description && pkg.description) current.description = pkg.description;
      if (!current.imageUrl && pkg.imageUrl) current.imageUrl = pkg.imageUrl;

      if (Array.isArray(pkg.inclusions)) {
        current.inclusions.push(...pkg.inclusions);
      }

      current.displayOrder = Math.min(
        Number(current.displayOrder || 0),
        Number(pkg.displayOrder || 0)
      );
    });

  return [...roomMap.values()]
    .map((room) => {
      const sortedRates = room.rates
        .filter((rate) => rate.duration)
        .sort(
          (a, b) =>
            getDurationOrder(a.duration) - getDurationOrder(b.duration) ||
            Number(a.displayOrder || 0) - Number(b.displayOrder || 0)
        );

      const uniqueRates = [];
      const seenDurations = new Set();

      sortedRates.forEach((rate) => {
        const key = normalizeDuration(rate.duration);

        if (seenDurations.has(key)) return;

        seenDurations.add(key);
        uniqueRates.push(rate);
      });

      const durations = uniqueRates.map((rate) => rate.duration).filter(Boolean);
      const inclusions = [...new Set(room.inclusions.filter(Boolean))];

      return {
        ...room,
        rates: uniqueRates,
        duration: durations.join(" / "),
        capacity: getCapacityText(room.packages),
        price: getMinPrice(uniqueRates),
        priceRange: getPriceRange(uniqueRates),
        inclusions,
      };
    })
    .sort((a, b) => {
      const orderA = Number(a.displayOrder || 0);
      const orderB = Number(b.displayOrder || 0);

      if (orderA !== orderB) return orderA - orderB;

      const priority = {
        Nature: 1,
        Simple: 2,
      };

      const priorityA = priority[a.roomType] || 99;
      const priorityB = priority[b.roomType] || 99;

      if (priorityA !== priorityB) return priorityA - priorityB;

      return String(a.title || "").localeCompare(String(b.title || ""));
    });
}

export default function HotelOrCondo() {
  const navigate = useNavigate();

  const [isOpen, setIsOpen] = useState(false);
  const [packages, setPackages] = useState([]);
  const [loadingPackages, setLoadingPackages] = useState(true);
  const [packageError, setPackageError] = useState("");
  const [selectedDetails, setSelectedDetails] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);

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

  const roomCards = useMemo(() => buildRoomCards(packages), [packages]);
  const cardsPerPage = 4;

  const pageCount = useMemo(() => {
    return Math.max(1, Math.ceil(roomCards.length / cardsPerPage));
  }, [roomCards.length]);

  const visibleRooms = useMemo(() => {
    const start = currentPage * cardsPerPage;
    return roomCards.slice(start, start + cardsPerPage);
  }, [roomCards, currentPage]);

  useEffect(() => {
    if (currentPage > pageCount - 1) {
      setCurrentPage(0);
    }
  }, [currentPage, pageCount]);

  const goToProfile = () => {
    navigate(getHotelToken() ? "/hotel-profile" : "/hotel-login");
  };

  const fetchPackages = async () => {
    setLoadingPackages(true);
    setPackageError("");

    try {
      const res = await fetch(`${API_BASE}/packages?type=hotel_condo`);
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.message || "Failed to load hotel packages.");
      }

      const list = Array.isArray(data.packages) ? data.packages : [];

      const activePackages = list
        .filter((item) => item?.isActive !== false)
        .sort((a, b) => {
          const orderA = Number(a.displayOrder || 0);
          const orderB = Number(b.displayOrder || 0);

          if (orderA !== orderB) return orderA - orderB;

          return String(a.title || "").localeCompare(String(b.title || ""));
        });

      setPackages(activePackages);
      setCurrentPage(0);
    } catch (error) {
      console.error("Failed to load hotel packages:", error);
      setPackageError(
        error.message ||
          "Unable to load Hotel & Condo packages. Please check your backend server."
      );
      setPackages([]);
    } finally {
      setLoadingPackages(false);
    }
  };

  useEffect(() => {
    fetchPackages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const goToBookNow = (room = null) => {
    const token = getHotelToken();

    if (!token) {
      navigate("/hotel-login");
      return;
    }

    navigate("/hotel-booking-form", {
      state: room
        ? {
            selectedCategory: "Hotel & Condo",
            selectedRoomType: room.roomType || normalizeRoomType(room.title || ""),
            selectedPackage: "",
            selectedPackageTitle: "",
            selectedPackageId: "",
            selectedDuration: "",
            selectedPrice: 0,
            selectedCapacity: room.capacity || "",
            selectedDescription: room.description || "",
            selectedInclusions: room.inclusions || [],
          }
        : {},
    });
  };

  return (
    <div className="min-h-screen bg-[#f4f3ef] font-['Inter',sans-serif] text-[#2f4f3b]">
      <main className="relative min-h-screen overflow-hidden">
        <img
          src="/LogInSignUpBG.jpg"
          alt="Hotel and resort background"
          className="absolute inset-0 h-full w-full object-cover"
          onError={(event) => {
            event.currentTarget.style.display = "none";
          }}
        />

        <div className="absolute inset-0 bg-black/45" />

        <Header
          navigate={navigate}
          goToProfile={goToProfile}
          openMenu={() => setIsOpen(true)}
        />

        <section className="relative z-10">
          <DecorativeWave />

          <div className="mx-auto max-w-[1240px] px-5 pb-6 pt-[95px] sm:px-8 lg:px-10 lg:pt-[110px]">
            <div className="max-w-[720px]">
              <h1 className="font-['Montserrat',sans-serif] text-[38px] font-extrabold leading-none text-[#fffde9] drop-shadow-sm sm:text-[50px]">
                Services We Offer
              </h1>

              <div className="mt-3 h-[2px] w-[390px] max-w-full bg-[#fffde9]/80" />

              <div className="mt-7 grid max-w-[680px] grid-cols-1 gap-4 sm:grid-cols-3">
                <ServiceTab
                  label="Resort & Venues"
                  onClick={() => navigate("/resort-venue")}
                />

                <ServiceTab
                  active
                  label="Hotel Condo"
                  onClick={() => navigate("/hotel-condo")}
                />

                <ServiceTab
                  label="Event Packages"
                  onClick={() => navigate("/event-package")}
                />
              </div>
            </div>
          </div>
        </section>

        <section className="relative z-10 bg-white/22 backdrop-blur-[1px]">
          <div className="mx-auto max-w-[1240px] px-5 py-7 sm:px-8 lg:px-10">
            <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="font-['Montserrat',sans-serif] text-[22px] font-extrabold uppercase text-white">
                  Hotel Condo
                </h2>

                <div className="mt-2 h-[2px] w-[200px] bg-white/75" />
              </div>

              <button
                onClick={() => goToBookNow(roomCards[0])}
                disabled={loadingPackages || !roomCards.length}
                type="button"
                className="w-full rounded-full bg-white px-8 py-3 font-['Montserrat',sans-serif] text-[14px] font-extrabold uppercase tracking-wide text-[#385541] shadow-lg transition hover:-translate-y-0.5 hover:bg-[#fffde9] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
              >
                Book Now
              </button>
            </div>

            {loadingPackages ? (
              <StatusCard message="Loading hotel packages..." />
            ) : packageError ? (
              <div className="rounded-2xl border border-red-200 bg-red-50/95 p-8 text-center shadow-lg">
                <p className="font-['Montserrat',sans-serif] text-lg font-extrabold text-red-700">
                  {packageError}
                </p>

                <button
                  onClick={fetchPackages}
                  type="button"
                  className="mt-4 rounded-full bg-[#385541] px-7 py-3 text-sm font-bold text-white transition hover:bg-[#2d4435]"
                >
                  Try Again
                </button>
              </div>
            ) : roomCards.length === 0 ? (
              <StatusCard
                message="No active Hotel & Condo packages available."
                sub="Please check again later."
              />
            ) : (
              <>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                  {visibleRooms.map((item) => (
                    <ServiceCard
                      key={item._id || item.title}
                      title={item.title}
                      imageSrc={getImageSrc(item)}
                      topLine={`Total Pax: ${item.capacity || "-"}`}
                      secondLine={item.priceRange || formatPeso(item.price)}
                      onDetails={() => setSelectedDetails(item)}
                    />
                  ))}
                </div>

                {pageCount > 1 && (
                  <div className="mt-7 flex items-center justify-center gap-3">
                    {Array.from({ length: pageCount }).map((_, index) => (
                      <button
                        key={`hotel-dot-${index}`}
                        onClick={() => setCurrentPage(index)}
                        aria-label={`Go to slide ${index + 1}`}
                        type="button"
                        className={`h-3 w-3 rounded-full border border-white transition ${
                          currentPage === index
                            ? "bg-white"
                            : "bg-transparent hover:bg-white/50"
                        }`}
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

      {selectedDetails && (
        <PackageDetailsModal
          item={selectedDetails}
          onClose={() => setSelectedDetails(null)}
          onBook={() => {
            const selectedRoom = selectedDetails;
            setSelectedDetails(null);
            goToBookNow(selectedRoom);
          }}
          getImageSrc={getImageSrc}
          formatPeso={formatPeso}
        />
      )}
    </div>
  );
}

function Header({ navigate, goToProfile, openMenu }) {
  return (
    <header className="absolute left-0 right-0 top-0 z-30 w-full bg-white shadow-[0_3px_0_rgba(0,0,0,0.18)]">
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

function DecorativeWave() {
  return (
    <svg
      className="pointer-events-none absolute left-0 right-0 top-[58px] z-[-1] h-[120px] w-full text-white"
      viewBox="0 0 1440 180"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <path
        fill="currentColor"
        d="M0,0H1440V74C1374,117,1307,63,1260,72C1216,80,1214,137,1167,143C1098,152,1027,87,945,85C865,83,827,130,736,151C650,171,579,157,489,124C408,95,352,53,260,79C187,99,160,133,89,114C49,103,26,81,0,74Z"
      />
    </svg>
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

function ServiceTab({ label, active = false, onClick }) {
  return (
    <button
      onClick={onClick}
      type="button"
      className={`rounded-md px-6 py-4 text-center font-['Montserrat',sans-serif] text-[13px] font-extrabold uppercase shadow-sm transition hover:-translate-y-0.5 ${
        active
          ? "bg-white text-[#385541]"
          : "bg-white text-[#385541] hover:bg-[#fffde9]"
      }`}
    >
      {label}
    </button>
  );
}

function ServiceCard({ title, imageSrc, topLine, secondLine, onDetails }) {
  return (
    <article className="group relative min-h-[275px] overflow-hidden rounded-lg bg-black shadow-[0_12px_30px_rgba(0,0,0,0.22)]">
      <img
        src={imageSrc}
        alt={title}
        className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105"
        onError={(event) => {
          event.currentTarget.src = PLACEHOLDER_IMAGE;
        }}
      />

      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-black/20" />

      <button
        onClick={onDetails}
        type="button"
        className="absolute right-3 top-4 rounded-full border border-white bg-black/15 px-4 py-1 font-['Montserrat',sans-serif] text-[10px] font-extrabold text-white backdrop-blur-sm transition hover:bg-white hover:text-[#385541]"
      >
        See Details
      </button>

      <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
        <p className="text-[13px] font-semibold">{topLine}</p>
        <p className="mt-1 text-[13px] font-semibold">{secondLine}</p>

        <h3 className="mt-1 font-['Montserrat',sans-serif] text-[20px] font-extrabold leading-tight">
          {title}
        </h3>
      </div>
    </article>
  );
}

function StatusCard({ message, sub = "" }) {
  return (
    <div className="rounded-2xl bg-white/90 p-8 text-center shadow-lg">
      <p className="font-['Montserrat',sans-serif] text-lg font-extrabold text-[#385541]">
        {message}
      </p>

      {sub ? <p className="mt-2 text-sm font-semibold text-black/45">{sub}</p> : null}
    </div>
  );
}

function Footer() {
  return (
    <footer className="relative z-10 bg-[#2f523d] text-white">
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
            <span className="h-6 w-6 rounded-full bg-white/15" />
            <span className="h-6 w-6 rounded-full bg-white/15" />
            <span className="h-6 w-6 rounded-full bg-white/15" />
          </div>
        </FooterColumn>
      </div>

      <div className="mx-auto flex max-w-[1280px] flex-col gap-1 px-5 pb-2 text-[9px] font-bold tracking-wide text-white/80 sm:px-8 md:flex-row md:justify-between lg:px-10">
        <p>© 2026 LTC GROUP OF COMPANIES. All rights reserved.</p>
        <p>Developed by CRMS Tech Alliance</p>
      </div>
    </footer>
  );
}

function FooterColumn({ title, children }) {
  return (
    <div className="border-white/30 lg:border-l lg:pl-5">
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
      className="block text-left text-[10px] font-bold leading-4 text-white/85 transition hover:text-white"
    >
      {children}
    </button>
  );
}

function FooterText({ children }) {
  return <p className="text-[10px] font-bold leading-4 text-white/85">{children}</p>;
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
            X
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

function PackageDetailsModal({ item, onClose, onBook, getImageSrc, formatPeso }) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center px-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-[2px]"
        onClick={onClose}
      />

      <div className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="font-['Montserrat',sans-serif] text-xs font-extrabold uppercase tracking-[0.25em] text-[#6f806d]">
              Hotel &amp; Condo
            </p>

            <h3 className="mt-2 font-['Montserrat',sans-serif] text-[26px] font-extrabold text-[#385541]">
              {item.title}
            </h3>

            {item.subtitle ? (
              <p className="mt-1 text-sm font-semibold text-black/50">
                {item.subtitle}
              </p>
            ) : null}
          </div>

          <button
            onClick={onClose}
            className="rounded-md p-2 text-[#6b7280] transition hover:bg-[#f3f4f6]"
            aria-label="Close details"
            type="button"
          >
            X
          </button>
        </div>

        <img
          src={getImageSrc(item)}
          alt={item.title}
          className="mt-5 h-[240px] w-full rounded-2xl object-cover"
          onError={(event) => {
            event.currentTarget.src = PLACEHOLDER_IMAGE;
          }}
        />

        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <InfoBox label="Total Pax" value={item.capacity || "-"} />
          <InfoBox label="Duration" value={item.duration || "-"} />
          <InfoBox label="Price Range" value={item.priceRange || formatPeso(item.price)} />
        </div>

        {Array.isArray(item.rates) && item.rates.length > 0 ? (
          <div className="mt-5 rounded-2xl bg-[#f7f7f5] p-5">
            <h4 className="font-['Montserrat',sans-serif] text-lg font-extrabold text-[#385541]">
              Room Rates
            </h4>

            <div className="mt-3 overflow-hidden rounded-2xl border border-[#385541]/10 bg-white">
              {item.rates.map((rate) => (
                <div
                  key={`${item.title}-modal-${rate.duration}`}
                  className="flex items-center justify-between gap-4 border-b border-[#385541]/10 px-4 py-3 last:border-b-0"
                >
                  <span className="text-sm font-extrabold text-[#385541]">
                    {rate.duration}
                  </span>

                  <span className="text-sm font-bold text-[#4b5563]">
                    {formatPeso(rate.price)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {item.description ? (
          <p className="mt-5 text-[15px] leading-7 text-[#4b5563]">
            {item.description}
          </p>
        ) : null}

        {Array.isArray(item.inclusions) && item.inclusions.length > 0 ? (
          <div className="mt-5 rounded-2xl bg-[#f7f7f5] p-5">
            <h4 className="font-['Montserrat',sans-serif] text-lg font-extrabold text-[#385541]">
              Details
            </h4>

            <ul className="mt-3 space-y-2 text-sm font-semibold text-[#4b5563]">
              {item.inclusions.map((inc, index) => (
                <li key={`${item._id || item.title}-detail-${index}`}>- {inc}</li>
              ))}
            </ul>
          </div>
        ) : null}

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            onClick={onClose}
            type="button"
            className="rounded-xl border border-[#d1d5db] px-5 py-2.5 text-[14px] font-semibold text-[#374151] transition hover:bg-[#f9fafb]"
          >
            Close
          </button>

          <button
            onClick={onBook}
            type="button"
            className="rounded-xl bg-[#385541] px-5 py-2.5 text-[14px] font-semibold text-white shadow transition hover:bg-[#2d4435]"
          >
            Book Now
          </button>
        </div>
      </div>
    </div>
  );
}

function InfoBox({ label, value }) {
  return (
    <div className="rounded-2xl bg-[#f3f3ee] p-4">
      <p className="text-xs font-extrabold uppercase tracking-wide text-black/40">
        {label}
      </p>

      <p className="mt-1 font-bold text-[#385541]">{value}</p>
    </div>
  );
}
