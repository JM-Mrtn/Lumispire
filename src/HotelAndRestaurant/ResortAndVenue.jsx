import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

const PLACEHOLDER_IMAGE = "https://placehold.co/900x500?text=Image";

const ResortAndVenue = () => {
  const navigate = useNavigate();

  const [isOpen, setIsOpen] = useState(false);
  const [checkingTitle, setCheckingTitle] = useState(null);

  const [services, setServices] = useState([]);
  const [loadingServices, setLoadingServices] = useState(true);
  const [serviceError, setServiceError] = useState("");

  const [selectedDetails, setSelectedDetails] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);

  const [modal, setModal] = useState({
    open: false,
    title: "",
    message: "",
    actionType: null,
    actionLabel: "",
  });

  const API_BASE = useMemo(() => {
    const raw = (
      import.meta.env.VITE_HOTEL_API_BASE ||
      import.meta.env.VITE_API_BASE ||
      import.meta.env.VITE_API_URL ||
      "http://localhost:5000"
    ).replace(/\/+$/, "");

    if (raw.includes("/api/hotel")) return raw;
    if (raw.endsWith("/api")) return `${raw}/hotel`;
    if (raw.includes("/api/")) return raw;

    return `${raw}/api/hotel`;
  }, []);

  const cardsPerPage = 4;

  const pageCount = useMemo(() => {
    return Math.max(1, Math.ceil(services.length / cardsPerPage));
  }, [services.length]);

  const visibleServices = useMemo(() => {
    const start = currentPage * cardsPerPage;
    return services.slice(start, start + cardsPerPage);
  }, [services, currentPage]);

  useEffect(() => {
    if (currentPage > pageCount - 1) {
      setCurrentPage(0);
    }
  }, [currentPage, pageCount]);

  const openModal = ({ title, message, actionType = null, actionLabel = "" }) => {
    setModal({
      open: true,
      title,
      message,
      actionType,
      actionLabel,
    });
  };

  const closeModal = () => {
    setModal({
      open: false,
      title: "",
      message: "",
      actionType: null,
      actionLabel: "",
    });
  };

  const handleModalAction = () => {
    const actionType = modal.actionType;
    closeModal();

    if (actionType === "login") {
      navigate("/hotel-login");
    } else if (actionType === "profile") {
      navigate("/hotel-profile");
    }
  };

  const goToProfile = () => {
    const token = localStorage.getItem("token") || localStorage.getItem("hotelToken");
    navigate(token ? "/hotel-profile" : "/hotel-login");
  };

  const isUserIdVerified = (user) => {
    const normalizedStatus = String(
      user?.idVerificationStatus ||
        user?.verificationStatus ||
        user?.idStatus ||
        user?.status ||
        ""
    )
      .trim()
      .toLowerCase();

    return (
      user?.idVerified === true ||
      user?.isIdVerified === true ||
      user?.isIdentityVerified === true ||
      user?.verified === true ||
      normalizedStatus === "approved" ||
      normalizedStatus === "verified"
    );
  };

  const fetchServices = async () => {
    setLoadingServices(true);
    setServiceError("");

    try {
      const res = await fetch(`${API_BASE}/packages?type=resort_venue`);
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.message || "Failed to load resort packages.");
      }

      const list = Array.isArray(data.packages) ? data.packages : [];

      const normalized = list
        .filter((item) => item?.isActive !== false)
        .sort((a, b) => {
          const orderA = Number(a.displayOrder || 0);
          const orderB = Number(b.displayOrder || 0);

          if (orderA !== orderB) return orderA - orderB;

          return String(a.title || "").localeCompare(String(b.title || ""));
        });

      setServices(normalized);
      setCurrentPage(0);
    } catch (error) {
      console.error("Failed to load resort packages:", error);
      setServiceError(
        error.message ||
          "Unable to load resort packages. Please check your backend server."
      );
      setServices([]);
    } finally {
      setLoadingServices(false);
    }
  };

  useEffect(() => {
    fetchServices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getInclusionValue = (item, label) => {
    const found = Array.isArray(item?.inclusions)
      ? item.inclusions.find((entry) =>
          String(entry || "").toLowerCase().startsWith(label.toLowerCase())
        )
      : "";

    if (!found) return "";

    return String(found)
      .replace(new RegExp(`^${label}\\s*:?\\s*`, "i"), "")
      .trim();
  };

  const formatPeso = (value) => {
    const num = Number(value || 0);

    if (!num) return "Contact for price";

    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
      maximumFractionDigits: 0,
    }).format(num);
  };

  const normalizeCapacityText = (value = "") => {
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
  };

  const getDisplayCapacity = (item) => {
    const inclusionPax = getInclusionValue(item, "Total Pax");
    const capacity = normalizeCapacityText(inclusionPax || item?.capacity);
    return capacity || "20-50";
  };

  const getDisplayAvailability = (item) => {
    const inclusionAvailability = getInclusionValue(item, "Availability");
    return inclusionAvailability || item?.duration || "";
  };

  const getDisplayPrice = (item) => {
    const priceRange = getInclusionValue(item, "Price range");
    return priceRange || formatPeso(item?.price);
  };

  const getImageSrc = (item) => {
    return item?.imageUrl?.trim() || PLACEHOLDER_IMAGE;
  };

  const goToBookNow = async (service) => {
    if (!service) {
      openModal({
        title: "No Package Selected",
        message: "Please select a resort or venue package before booking.",
      });
      return;
    }

    const token = localStorage.getItem("token") || localStorage.getItem("hotelToken");

    if (!token) {
      openModal({
        title: "Login Required",
        message: "Please log in to continue with your booking.",
        actionType: "login",
        actionLabel: "Go to Login",
      });
      return;
    }

    try {
      setCheckingTitle(service.title);

      const res = await fetch(`${API_BASE}/hotel-user-profile`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        localStorage.removeItem("token");
        localStorage.removeItem("hotelToken");

        openModal({
          title: "Session Expired",
          message:
            "Your session is no longer valid. Please log in again to continue.",
          actionType: "login",
          actionLabel: "Go to Login",
        });
        return;
      }

      const data = await res.json();
      const user = data?.user || data?.hotelUser || data?.profile || data;

      if (!isUserIdVerified(user)) {
        openModal({
          title: "Verification Required",
          message:
            "Your account must be ID verified before you can place a booking request. Please upload a valid ID in your profile and wait for admin approval.",
          actionType: "profile",
          actionLabel: "Go to Profile",
        });
        return;
      }

      navigate("/resort-form", {
        state: {
          selectedCategory: "Resort & Venue",
          selectedPackageId: service._id,
          selectedPackage: service.title,
          selectedVenue: String(service.title || "").toUpperCase(),
          selectedDuration: service.duration || "",
          selectedPrice: service.price || 0,
          selectedCapacity: service.capacity || "",
        },
      });
    } catch (error) {
      console.error("Booking verification error:", error);

      openModal({
        title: "Unable to Proceed",
        message:
          "Something went wrong while checking your account status. Please try again.",
      });
    } finally {
      setCheckingTitle(null);
    }
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
                  active
                  label="Resort & Venues"
                  onClick={() => navigate("/resort-venue")}
                />

                <ServiceTab
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
                  Resort &amp; Venues
                </h2>

                <div className="mt-2 h-[2px] w-[200px] bg-white/75" />
              </div>

              <button
                onClick={() => goToBookNow(services[0])}
                disabled={loadingServices || !services.length || Boolean(checkingTitle)}
                type="button"
                className="w-full rounded-full bg-white px-8 py-3 font-['Montserrat',sans-serif] text-[14px] font-extrabold uppercase tracking-wide text-[#385541] shadow-lg transition hover:-translate-y-0.5 hover:bg-[#fffde9] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
              >
                {checkingTitle ? "Checking..." : "Book Now"}
              </button>
            </div>

            {loadingServices ? (
              <StatusCard message="Loading resort packages..." />
            ) : serviceError ? (
              <div className="rounded-2xl border border-red-200 bg-red-50/95 p-8 text-center shadow-lg">
                <p className="font-['Montserrat',sans-serif] text-lg font-extrabold text-red-700">
                  {serviceError}
                </p>

                <button
                  onClick={fetchServices}
                  type="button"
                  className="mt-4 rounded-full bg-[#385541] px-7 py-3 text-sm font-bold text-white transition hover:bg-[#2d4435]"
                >
                  Try Again
                </button>
              </div>
            ) : services.length === 0 ? (
              <StatusCard
                message="No active Resort & Venue packages available."
                sub="Please check again later."
              />
            ) : (
              <>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                  {visibleServices.map((item) => (
                    <ServiceCard
                      key={item._id || item.seedKey || item.title}
                      item={item}
                      imageSrc={getImageSrc(item)}
                      capacity={getDisplayCapacity(item)}
                      price={getDisplayPrice(item)}
                      onDetails={() => setSelectedDetails(item)}
                    />
                  ))}
                </div>

                {pageCount > 1 && (
                  <div className="mt-7 flex items-center justify-center gap-3">
                    {Array.from({ length: pageCount }).map((_, index) => (
                      <button
                        key={`dot-${index}`}
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
        <DetailsModal
          item={selectedDetails}
          getImageSrc={getImageSrc}
          getDisplayCapacity={getDisplayCapacity}
          getDisplayAvailability={getDisplayAvailability}
          getDisplayPrice={getDisplayPrice}
          onClose={() => setSelectedDetails(null)}
          onBook={() => {
            const service = selectedDetails;
            setSelectedDetails(null);
            goToBookNow(service);
          }}
        />
      )}

      {modal.open && (
        <MessageModal
          modal={modal}
          closeModal={closeModal}
          handleModalAction={handleModalAction}
        />
      )}
    </div>
  );
};

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

function ServiceCard({ item, imageSrc, capacity, price, onDetails }) {
  return (
    <article className="group relative min-h-[275px] overflow-hidden rounded-lg bg-black shadow-[0_12px_30px_rgba(0,0,0,0.22)]">
      <img
        src={imageSrc}
        alt={item.title}
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
        <p className="text-[13px] font-semibold">Total Pax: {capacity}</p>
        <p className="mt-1 text-[13px] font-semibold">{price}</p>

        <h3 className="mt-1 font-['Montserrat',sans-serif] text-[20px] font-extrabold leading-tight">
          {item.title}
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
            ✕
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

function DetailsModal({
  item,
  getImageSrc,
  getDisplayCapacity,
  getDisplayAvailability,
  getDisplayPrice,
  onClose,
  onBook,
}) {
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
              Resort &amp; Venue
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
            ✕
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
          <InfoBox label="Total Pax" value={getDisplayCapacity(item)} />
          <InfoBox label="Availability" value={getDisplayAvailability(item) || "—"} />
          <InfoBox label="Price" value={getDisplayPrice(item)} />
        </div>

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
              {item.inclusions.map((entry, index) => (
                <li key={`${entry}-${index}`}>• {entry}</li>
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

function MessageModal({ modal, closeModal, handleModalAction }) {
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center px-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-[2px]"
        onClick={closeModal}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="booking-modal-title"
        className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3
              id="booking-modal-title"
              className="font-['Montserrat',sans-serif] text-[22px] font-extrabold text-[#385541]"
            >
              {modal.title}
            </h3>

            <p className="mt-3 text-[15px] leading-7 text-[#4b5563]">
              {modal.message}
            </p>
          </div>

          <button
            onClick={closeModal}
            className="rounded-md p-2 text-[#6b7280] transition hover:bg-[#f3f4f6]"
            aria-label="Close modal"
            type="button"
          >
            ✕
          </button>
        </div>

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            onClick={closeModal}
            type="button"
            className="rounded-xl border border-[#d1d5db] px-5 py-2.5 text-[14px] font-semibold text-[#374151] transition hover:bg-[#f9fafb]"
          >
            Close
          </button>

          {modal.actionType && (
            <button
              onClick={handleModalAction}
              type="button"
              className="rounded-xl bg-[#385541] px-5 py-2.5 text-[14px] font-semibold text-white shadow transition hover:bg-[#2d4435]"
            >
              {modal.actionLabel}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default ResortAndVenue;