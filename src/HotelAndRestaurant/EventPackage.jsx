import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

const PLACEHOLDER_IMAGE = "https://placehold.co/900x500?text=Event+Package";

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

export default function EventPackage() {
  const navigate = useNavigate();

  const [isOpen, setIsOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [eventPackages, setEventPackages] = useState([]);
  const [loadingPackages, setLoadingPackages] = useState(true);
  const [packageError, setPackageError] = useState("");
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

  const cardsPerPage = 4;

  const pageCount = useMemo(() => {
    return Math.max(1, Math.ceil(eventPackages.length / cardsPerPage));
  }, [eventPackages.length]);

  const visiblePackages = useMemo(() => {
    const start = currentPage * cardsPerPage;
    return eventPackages.slice(start, start + cardsPerPage);
  }, [eventPackages, currentPage]);

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
                  label="Hotel Condo"
                  onClick={() => navigate("/hotel-condo")}
                />

                <ServiceTab
                  active
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
                  Event Packages
                </h2>

                <div className="mt-2 h-[2px] w-[200px] bg-white/75" />
              </div>

              <button
                onClick={() => goToBookNow(eventPackages[0])}
                disabled={loadingPackages || !eventPackages.length}
                type="button"
                className="w-full rounded-full bg-white px-8 py-3 font-['Montserrat',sans-serif] text-[14px] font-extrabold uppercase tracking-wide text-[#385541] shadow-lg transition hover:-translate-y-0.5 hover:bg-[#fffde9] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
              >
                Book Now
              </button>
            </div>

            {loadingPackages ? (
              <StatusCard message="Loading event packages..." />
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
            ) : eventPackages.length === 0 ? (
              <StatusCard
                message="No active Event Packages available."
                sub="Please add Event Packages in the admin side."
              />
            ) : (
              <>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                  {visiblePackages.map((item) => (
                    <ServiceCard
                      key={item._id || item.seedKey || item.id || item.name}
                      title={item.name}
                      imageSrc={getImageSrc(item)}
                      topLine={item.capacity ? `Capacity: ${item.capacity}` : item.duration || "Event Package"}
                      secondLine={item.shortPrice}
                      onDetails={() => setSelectedPackage(item)}
                    />
                  ))}
                </div>

                {pageCount > 1 && (
                  <div className="mt-7 flex items-center justify-center gap-3">
                    {Array.from({ length: pageCount }).map((_, index) => (
                      <button
                        key={`event-dot-${index}`}
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
  return (
    <header className="absolute left-0 right-0 top-0 z-30 w-full bg-white shadow-[0_3px_0_rgba(0,0,0,0.18)]">
      <div className="flex h-[78px] w-full items-center justify-between px-5 sm:px-8 lg:px-12">
        <button
          onClick={() => navigate("/hotel-resort")}
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
          <NavButton label="Home" onClick={() => navigate("/hotel-resort")} />
          <NavButton label="Virtual Tour" onClick={() => navigate("/virtual-tour")} />
          <NavButton label="Contact" onClick={() => navigate("/hotel-contact-us")} />
        </nav>

        <button
          onClick={goToProfile}
          type="button"
          className="hidden font-['Montserrat',sans-serif] text-[14px] font-bold uppercase tracking-wide text-[#385541] transition hover:text-[#1f3528] md:block"
        >
          {localStorage.getItem("token") || localStorage.getItem("hotelToken") ? "Profile" : "Sign In"}
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
          <FooterLink onClick={() => { window.location.href = "/hotel-resort"; }}>Home</FooterLink>
          <FooterLink>Course</FooterLink>
          <FooterLink>Requirements</FooterLink>
          <FooterLink onClick={() => { window.location.href = localStorage.getItem("token") || localStorage.getItem("hotelToken") ? "/hotel-profile" : "/hotel-login"; }}>{localStorage.getItem("token") || localStorage.getItem("hotelToken") ? "Profile" : "Sign In"}</FooterLink>
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

function FooterLink({ children, onClick }) {
  return (
    <button
      onClick={onClick}
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
              navigate("/hotel-resort");
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
            label={localStorage.getItem("token") || localStorage.getItem("hotelToken") ? "PROFILE" : "SIGN IN"}
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

function PackageModal({ data, onClose, onBook, getImageSrc }) {
  const prices = Array.isArray(data.prices) ? data.prices : [];
  const inclusions = Array.isArray(data.inclusions) ? data.inclusions : [];

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center px-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-[2px]"
        onClick={onClose}
      />

      <div className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="font-['Montserrat',sans-serif] text-xs font-extrabold uppercase tracking-[0.25em] text-[#6f806d]">
              Event Package
            </p>

            <h3 className="mt-2 font-['Montserrat',sans-serif] text-[26px] font-extrabold text-[#385541]">
              {data.name}
            </h3>

            <p className="mt-1 text-sm font-semibold text-black/50">
              {data.shortPrice}
            </p>
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
          src={getImageSrc(data)}
          alt={data.name}
          className="mt-5 h-[240px] w-full rounded-2xl object-cover"
          onError={(event) => {
            event.currentTarget.src = PLACEHOLDER_IMAGE;
          }}
        />

        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <InfoBox label="Duration" value={data.duration || "-"} />
          <InfoBox label="Capacity" value={data.capacity || "-"} />
          <InfoBox label="Price" value={data.shortPrice || "Contact"} />
        </div>

        {data.description ? (
          <p className="mt-5 text-[15px] leading-7 text-[#4b5563]">
            {data.description}
          </p>
        ) : null}

        {prices.length > 0 ? (
          <ListBlock
            title="Capacity and Price Options"
            items={prices.map(
              (option) =>
                `${option.label || option.pax || "Rate"} - ${option.timeLabel || "8 Hours"} - ${
                  option.price || "Contact for price"
                }`
            )}
          />
        ) : null}

        {inclusions.length > 0 ? (
          <ListBlock title="Package Inclusions" items={inclusions} />
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

function ListBlock({ title, items }) {
  return (
    <div className="mt-6 rounded-2xl bg-[#f7f7f5] p-5">
      <h4 className="font-['Montserrat',sans-serif] text-lg font-extrabold text-[#385541]">
        {title}
      </h4>

      <ul className="mt-3 space-y-2 text-sm font-semibold text-[#4b5563]">
        {items.map((item, index) => (
          <li key={`${title}-${index}`}>- {item}</li>
        ))}
      </ul>
    </div>
  );
}
