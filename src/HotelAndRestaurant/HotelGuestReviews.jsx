// HotelGuestReviews.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

const COLORS = {
  green: "#3f5b44",
  soft: "#ECE9E1",
  border: "rgba(63, 91, 68, 0.28)",
};

const STATUS_FILTERS = [
  { id: "ALL", label: "All" },
  { id: "PENDING", label: "Submitted / Pending" },
  { id: "APPROVED", label: "Approved" },
  { id: "CANCELLED", label: "Cancelled / Rejected" },
  { id: "NOT_REVIEWED", label: "Not Reviewed" },
  { id: "REVIEWED", label: "Reviewed" },
];

const SERVICE_FILTERS = [
  { id: "ALL", label: "All Services" },
  { id: "hotel_room", label: "Hotel" },
  { id: "resort", label: "Resort" },
  { id: "event", label: "Event" },
];

const BOOKINGS_PER_PAGE = 6;

function getToken() {
  return localStorage.getItem("token") || localStorage.getItem("hotelToken") || "";
}

function normalizeApiBase() {
  const raw = (
    import.meta.env.VITE_API_URL ||
    import.meta.env.VITE_API_BASE ||
    "http://localhost:5000"
  ).replace(/\/+$/, "");

  if (raw.endsWith("/api/hotel")) return raw;
  if (raw.endsWith("/api")) return `${raw}/hotel`;
  if (raw.includes("/api/hotel")) return raw;

  return `${raw}/api/hotel`;
}

function normalizeStatus(value) {
  const status = String(value || "PENDING").toUpperCase();

  if (status === "CONFIRMED" || status === "APPROVED") return "CONFIRMED";

  if (
    status === "CANCELLED" ||
    status === "CANCELED" ||
    status === "REJECTED" ||
    status === "DECLINED"
  ) {
    return "CANCELLED";
  }

  return "PENDING";
}

function formatDate(value) {
  if (!value) return "—";

  if (/^\d{4}-\d{2}-\d{2}$/.test(String(value))) {
    const [year, month, day] = String(value).split("-");
    return `${month}/${day}/${year}`;
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value || "—";

  return parsed.toLocaleDateString("en-PH", {
    month: "2-digit",
    day: "2-digit",
    year: "numeric",
  });
}

function formatPeso(value) {
  const amount = Number(value || 0);

  if (!Number.isFinite(amount) || amount <= 0) return "—";

  return `₱${amount.toLocaleString("en-PH")}`;
}

function getStatusInfo(status) {
  if (status === "CONFIRMED") {
    return {
      label: "APPROVED",
      badge: "bg-emerald-100 text-emerald-700",
      box: "bg-emerald-50 text-emerald-700",
      heading: "Your booking has been approved.",
      description:
        "Admin has confirmed your booking. You can now submit a rating and review for this booking.",
    };
  }

  if (status === "CANCELLED") {
    return {
      label: "CANCELLED / REJECTED",
      badge: "bg-rose-100 text-rose-700",
      box: "bg-rose-50 text-rose-700",
      heading: "Your booking was cancelled or rejected.",
      description:
        "This booking is no longer active. If you need help, please contact hotel support or create another booking.",
    };
  }

  return {
    label: "SUBMITTED",
    badge: "bg-amber-100 text-amber-700",
    box: "bg-amber-50 text-amber-700",
    heading: "Your booking has been sent.",
    description:
      "Your booking is waiting for admin review. Once approved, it will become available for guest review.",
  };
}

function getServiceLabel(type) {
  if (type === "hotel_room") return "Hotel";
  if (type === "resort") return "Resort";
  if (type === "event") return "Event";
  return "service";
}

function getBookingServiceBadge(type) {
  if (type === "hotel_room") return "Hotel";
  if (type === "resort") return "Resort";
  if (type === "event") return "Event";
  return "Booking";
}

function getReviewMapKey(type, id) {
  return `${String(type || "").toLowerCase()}:${String(id || "")}`;
}

function getBookAgainRouteAndState(booking) {
  const raw = booking?.raw || {};

  if (booking.bookingType === "hotel_room") {
    const selectedPackageTitle =
      raw.packageTitle ||
      raw.selectedPackageTitle ||
      raw.selectedPackage ||
      booking.bookingTitle ||
      "";

    return {
      route: "/hotel-booking-form",
      state: {
        bookAgain: true,
        previousBookingId: booking._id,
        selectedPackageId:
          raw.packageId || raw.selectedPackageId || raw.package?._id || "",
        selectedPackage: selectedPackageTitle,
        selectedPackageTitle,
        selectedDuration: raw.duration || raw.selectedDuration || "",
        selectedRoomType:
          raw.roomType ||
          raw.selectedRoomType ||
          String(booking.bookingTitle || "").split(" - ")[0] ||
          "",
        selectedPrice: raw.price || raw.totalAmount || booking.amount || "",
        selectedCapacity: raw.capacity || raw.selectedCapacity || "",
      },
    };
  }

  if (booking.bookingType === "resort") {
    const selectedVenue =
      raw.venue ||
      raw.selectedVenue ||
      raw.selectedPackage ||
      raw.selectedPackageTitle ||
      booking.bookingTitle ||
      "";

    return {
      route: "/resort-form",
      state: {
        bookAgain: true,
        previousBookingId: booking._id,
        selectedPackageId:
          raw.packageId || raw.selectedPackageId || raw.package?._id || "",
        selectedPackage: selectedVenue,
        selectedVenue,
        selectedDuration:
          raw.category || raw.duration || raw.selectedDuration || "",
        selectedPrice: raw.price || raw.totalAmount || booking.amount || "",
        selectedCapacity: raw.capacity || raw.selectedCapacity || "",
      },
    };
  }

  if (booking.bookingType === "event") {
    const selectedPackageTitle =
      raw.eventPackage ||
      raw.selectedPackageTitle ||
      raw.selectedPackage ||
      raw.packageName ||
      booking.bookingTitle ||
      "";

    return {
      route: "/event-form",
      state: {
        bookAgain: true,
        previousBookingId: booking._id,
        selectedPackageId:
          raw.packageId || raw.selectedPackageId || raw.package?._id || "",
        selectedPackage: selectedPackageTitle,
        selectedPackageTitle,
        selectedPrice: raw.totalAmount || raw.price || booking.amount || "",
        selectedCapacity: raw.capacity || raw.selectedCapacity || "",
      },
    };
  }

  return {
    route: "/hotel-resort",
    state: {},
  };
}

export default function HotelGuestReviews() {
  const navigate = useNavigate();
  const API_BASE = useMemo(() => normalizeApiBase(), []);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [bookings, setBookings] = useState([]);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [serviceFilter, setServiceFilter] = useState("ALL");
  const [page, setPage] = useState(1);

  const [selectedBooking, setSelectedBooking] = useState(null);
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState("");

  const [status, setStatus] = useState({ type: "", message: "" });

  const authHeaders = () => ({
    Authorization: `Bearer ${getToken()}`,
  });

  const kickToLogin = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("hotelToken");
    navigate("/hotel-login", { replace: true });
  };

  const fetchJson = async (url) => {
    const response = await fetch(url, {
      method: "GET",
      headers: authHeaders(),
    });

    const data = await response.json().catch(() => ({}));

    if (response.status === 401 || response.status === 403) {
      kickToLogin();
      return {
        kicked: true,
        ok: false,
        data: null,
      };
    }

    return {
      kicked: false,
      ok: response.ok,
      data,
      status: response.status,
    };
  };

  const normalizeResortBooking = (booking) => ({
    _id: String(booking?._id || ""),
    bookingType: "resort",
    serviceType: booking?.serviceType || "Resort & Venue",
    bookingTitle: booking?.venue || booking?.packageName || "Resort & Venue Booking",
    bookingDate: booking?.date || booking?.bookingDate || "",
    bookingTime: booking?.time || booking?.bookingTime || "",
    status: normalizeStatus(booking?.status),
    paymentMethod: booking?.paymentMethod || "",
    amount: Number(booking?.price || booking?.totalAmount || 0),
    pax:
      Number(
        booking?.pax ||
          booking?.totalGuests ||
          Number(booking?.adults || 0) + Number(booking?.kids || 0)
      ) || 0,
    createdAt: booking?.createdAt || "",
    updatedAt: booking?.updatedAt || "",
    raw: booking,
  });

  const normalizeEventBooking = (booking) => ({
    _id: String(booking?._id || ""),
    bookingType: "event",
    serviceType: booking?.serviceType || "Event Package",
    bookingTitle:
      booking?.eventPackage ||
      booking?.packageName ||
      booking?.eventType ||
      "Event Package Booking",
    bookingDate: booking?.eventDate || booking?.date || booking?.bookingDate || "",
    bookingTime: booking?.time || booking?.bookingTime || "",
    status: normalizeStatus(booking?.status),
    paymentMethod: booking?.paymentMethod || "",
    amount: Number(booking?.totalAmount || booking?.price || 0),
    pax: Number(booking?.pax || booking?.guests || 0),
    createdAt: booking?.createdAt || "",
    updatedAt: booking?.updatedAt || "",
    raw: booking,
  });

  const normalizeHotelRoomBooking = (booking) => ({
    _id: String(booking?._id || ""),
    bookingType: "hotel_room",
    serviceType: booking?.serviceType || "Hotel",
    bookingTitle: `${booking?.roomType || "Hotel Room"}${
      booking?.duration ? ` - ${booking.duration}` : ""
    }`,
    bookingDate: booking?.date || booking?.bookingDate || booking?.checkInDate || "",
    bookingTime: booking?.time || booking?.bookingTime || "",
    status: normalizeStatus(booking?.status),
    paymentMethod: booking?.paymentMethod || "",
    amount: Number(booking?.price || booking?.totalAmount || 0),
    pax: Number(booking?.pax || booking?.guests || 0),
    createdAt: booking?.createdAt || "",
    updatedAt: booking?.updatedAt || "",
    raw: booking,
  });

  const buildReviewMap = (approvedRows) => {
    const map = new Map();

    approvedRows.forEach((item) => {
      const id = String(item?._id || item?.bookingId || "");
      const type = String(item?.bookingType || "").toLowerCase();

      if (!id) return;

      const reviewInfo = {
        reviewed: Boolean(item?.reviewed),
        review: item?.review || null,
      };

      map.set(getReviewMapKey(type, id), reviewInfo);

      if (type === "hotel") {
        map.set(getReviewMapKey("hotel_room", id), reviewInfo);
      }

      if (type === "hotel_room") {
        map.set(getReviewMapKey("hotel", id), reviewInfo);
      }
    });

    return map;
  };

  const fetchBookingsAndReviews = async () => {
    if (!getToken()) {
      navigate("/hotel-login", { replace: true });
      return;
    }

    setLoading(true);
    setStatus({ type: "", message: "" });

    try {
      const [resortResult, eventResult, hotelResult, approvedResult] =
        await Promise.all([
          fetchJson(`${API_BASE}/my-resort-bookings`),
          fetchJson(`${API_BASE}/my-event-bookings`),
          fetchJson(`${API_BASE}/my-hotel-room-bookings`),
          fetchJson(`${API_BASE}/approved-booking-history`),
        ]);

      if (
        resortResult.kicked ||
        eventResult.kicked ||
        hotelResult.kicked ||
        approvedResult.kicked
      ) {
        return;
      }

      const resortRows =
        resortResult.ok && Array.isArray(resortResult.data) ? resortResult.data : [];

      const eventRows =
        eventResult.ok && Array.isArray(eventResult.data) ? eventResult.data : [];

      const hotelRows =
        hotelResult.ok && Array.isArray(hotelResult.data) ? hotelResult.data : [];

      const approvedRows =
        approvedResult.ok && Array.isArray(approvedResult.data?.history)
          ? approvedResult.data.history
          : [];

      const reviewMap = buildReviewMap(approvedRows);

      const merged = [
        ...resortRows.map(normalizeResortBooking),
        ...eventRows.map(normalizeEventBooking),
        ...hotelRows.map(normalizeHotelRoomBooking),
      ]
        .filter((booking) => booking._id)
        .map((booking) => {
          const reviewInfo = reviewMap.get(
            getReviewMapKey(booking.bookingType, booking._id)
          );

          return {
            ...booking,
            reviewed: Boolean(reviewInfo?.reviewed),
            review: reviewInfo?.review || null,
          };
        })
        .sort((a, b) => {
          const bTime = new Date(b.createdAt || b.bookingDate || 0).getTime();
          const aTime = new Date(a.createdAt || a.bookingDate || 0).getTime();
          return bTime - aTime;
        });

      setBookings(merged);

      if (
        !resortResult.ok ||
        !eventResult.ok ||
        !hotelResult.ok ||
        !approvedResult.ok
      ) {
        setStatus({
          type: "warning",
          message:
            "Some booking records could not be loaded. Please refresh if something is missing.",
        });
      }
    } catch (error) {
      console.error("fetchBookingsAndReviews error:", error);
      setBookings([]);
      setStatus({
        type: "error",
        message: "Network error while loading your bookings.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookingsAndReviews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const totals = useMemo(() => {
    const totalBookings = bookings.length;
    const totalPending = bookings.filter((item) => item.status === "PENDING").length;
    const totalApproved = bookings.filter((item) => item.status === "CONFIRMED").length;
    const totalCancelled = bookings.filter((item) => item.status === "CANCELLED").length;
    const totalReviewed = bookings.filter((item) => item.reviewed).length;

    return {
      totalBookings,
      totalPending,
      totalApproved,
      totalCancelled,
      totalReviewed,
    };
  }, [bookings]);

  const filteredByStatus = useMemo(() => {
    if (statusFilter === "PENDING") {
      return bookings.filter((item) => item.status === "PENDING");
    }

    if (statusFilter === "APPROVED") {
      return bookings.filter((item) => item.status === "CONFIRMED");
    }

    if (statusFilter === "CANCELLED") {
      return bookings.filter((item) => item.status === "CANCELLED");
    }

    if (statusFilter === "NOT_REVIEWED") {
      return bookings.filter((item) => item.status === "CONFIRMED" && !item.reviewed);
    }

    if (statusFilter === "REVIEWED") {
      return bookings.filter((item) => item.reviewed);
    }

    return bookings;
  }, [bookings, statusFilter]);

  const serviceCounts = useMemo(() => {
    return {
      ALL: filteredByStatus.length,
      hotel_room: filteredByStatus.filter((item) => item.bookingType === "hotel_room")
        .length,
      resort: filteredByStatus.filter((item) => item.bookingType === "resort").length,
      event: filteredByStatus.filter((item) => item.bookingType === "event").length,
    };
  }, [filteredByStatus]);

  const filteredBookings = useMemo(() => {
    if (serviceFilter === "ALL") return filteredByStatus;

    return filteredByStatus.filter((item) => item.bookingType === serviceFilter);
  }, [filteredByStatus, serviceFilter]);

  useEffect(() => {
    setPage(1);
  }, [statusFilter, serviceFilter, bookings.length]);

  const totalPages = useMemo(() => {
    return Math.max(1, Math.ceil(filteredBookings.length / BOOKINGS_PER_PAGE));
  }, [filteredBookings.length]);

  const safePage = Math.min(page, totalPages);

  const paginatedBookings = useMemo(() => {
    const start = (safePage - 1) * BOOKINGS_PER_PAGE;
    return filteredBookings.slice(start, start + BOOKINGS_PER_PAGE);
  }, [filteredBookings, safePage]);

  const averageRating = useMemo(() => {
    const reviewed = bookings.filter((item) => item.reviewed && item.review?.rating);

    if (!reviewed.length) return "";

    const total = reviewed.reduce(
      (sum, item) => sum + Number(item.review?.rating || 0),
      0
    );

    return (total / reviewed.length).toFixed(1);
  }, [bookings]);

  const activeStatusLabel =
    STATUS_FILTERS.find((item) => item.id === statusFilter)?.label || "All";

  const statusBoxClass =
    status.type === "success"
      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
      : status.type === "error"
      ? "border-rose-200 bg-rose-50 text-rose-700"
      : status.type === "warning"
      ? "border-amber-200 bg-amber-50 text-amber-700"
      : "border-slate-200 bg-slate-50 text-slate-700";

  const openReviewModal = (booking) => {
    if (!booking || booking.reviewed) return;

    if (booking.status !== "CONFIRMED") {
      setStatus({
        type: "error",
        message: "Only approved bookings can receive a review.",
      });
      return;
    }

    setSelectedBooking(booking);
    setRating(5);
    setReviewText("");
    setStatus({ type: "", message: "" });
  };

  const closeReviewModal = () => {
    if (submitting) return;

    setSelectedBooking(null);
    setRating(5);
    setReviewText("");
  };

  const handleBookAgain = (booking) => {
    if (!booking) return;

    const config = getBookAgainRouteAndState(booking);

    sessionStorage.setItem(
      "hotelBookAgainSource",
      JSON.stringify({
        bookingType: booking.bookingType,
        bookingId: booking._id,
        bookingTitle: booking.bookingTitle,
        bookingDate: booking.bookingDate,
        bookingTime: booking.bookingTime,
        createdAt: new Date().toISOString(),
      })
    );

    navigate(config.route, {
      state: config.state,
    });
  };

  const submitReview = async () => {
    if (!selectedBooking) return;

    if (!getToken()) {
      navigate("/hotel-login", { replace: true });
      return;
    }

    if (selectedBooking.status !== "CONFIRMED") {
      setStatus({
        type: "error",
        message: "Only approved bookings can receive a review.",
      });
      return;
    }

    if (!Number.isFinite(Number(rating)) || Number(rating) < 1 || Number(rating) > 5) {
      setStatus({
        type: "error",
        message: "Please choose a rating from 1 to 5.",
      });
      return;
    }

    if (!reviewText.trim() || reviewText.trim().length < 5) {
      setStatus({
        type: "error",
        message: "Please write a review with at least 5 characters.",
      });
      return;
    }

    setSubmitting(true);
    setStatus({ type: "", message: "" });

    try {
      const response = await fetch(`${API_BASE}/guest-reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({
          bookingType: selectedBooking.bookingType,
          bookingId: selectedBooking._id,
          rating: Number(rating),
          reviewText: reviewText.trim(),
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (response.status === 401 || response.status === 403) {
        kickToLogin();
        return;
      }

      if (!response.ok) {
        setStatus({
          type: "error",
          message: data.message || "Failed to submit review.",
        });
        return;
      }

      setStatus({
        type: "success",
        message: "Review submitted successfully.",
      });

      closeReviewModal();
      await fetchBookingsAndReviews();
    } catch (error) {
      console.error("submitReview error:", error);
      setStatus({
        type: "error",
        message: "Network error while submitting review.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen" style={{ background: COLORS.soft }}>
      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-sm font-extrabold uppercase tracking-[0.22em] text-[#3f5b44]/70">
              Booking Status & Guest Feedback
            </p>

            <h1 className="mt-2 text-4xl font-extrabold tracking-tight text-[#3f5b44] md:text-5xl">
              My Booking Process
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-black/60">
              Track if your hotel, resort, or event booking is submitted, approved,
              cancelled, not reviewed, or reviewed.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={fetchBookingsAndReviews}
              disabled={loading}
              className="h-10 rounded-full border border-black/10 bg-white px-6 text-sm font-bold text-[#3f5b44] hover:bg-black/5 disabled:opacity-60"
            >
              {loading ? "Refreshing..." : "Refresh"}
            </button>

            <button
              type="button"
              onClick={() => navigate("/hotel-profile")}
              className="h-10 rounded-full bg-[#3f5b44] px-6 text-sm font-bold text-white shadow-sm hover:opacity-90"
            >
              Back to Profile
            </button>
          </div>
        </div>

        {status.message ? (
          <div className={`mt-5 rounded-xl border px-4 py-3 text-sm ${statusBoxClass}`}>
            {status.message}
          </div>
        ) : null}

        <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-5">
          <StatCard label="Total Bookings" value={totals.totalBookings} />
          <StatCard label="Submitted / Pending" value={totals.totalPending} />
          <StatCard label="Approved" value={totals.totalApproved} />
          <StatCard label="Cancelled / Rejected" value={totals.totalCancelled} />
          <StatCard label="Reviews" value={totals.totalReviewed} />
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
          <StatCard
            label="Waiting for Review"
            value={Math.max(0, totals.totalApproved - totals.totalReviewed)}
          />
          <StatCard label="Average Rating" value={averageRating ? `${averageRating} ★` : "—"} />
        </div>

        <div
          className="mt-8 rounded-3xl border bg-white p-5 shadow-sm"
          style={{ borderColor: COLORS.border }}
        >
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#3f5b44]/60">
              Step 1: Choose booking process status
            </p>

            <div className="mt-3 flex flex-wrap gap-2">
              {STATUS_FILTERS.map((item) => (
                <FilterButton
                  key={item.id}
                  label={item.label}
                  active={statusFilter === item.id}
                  onClick={() => {
                    setStatusFilter(item.id);
                    setServiceFilter("ALL");
                    setPage(1);
                  }}
                />
              ))}
            </div>
          </div>

          <div className="mt-5 rounded-2xl bg-[#3f5b44]/5 p-4">
            <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#3f5b44]/60">
              Step 2: Filter inside "{activeStatusLabel}"
            </p>

            <div className="mt-3 flex flex-wrap gap-2">
              {SERVICE_FILTERS.map((item) => (
                <ServiceFilterButton
                  key={item.id}
                  label={`${item.label} (${serviceCounts[item.id] || 0})`}
                  active={serviceFilter === item.id}
                  onClick={() => {
                    setServiceFilter(item.id);
                    setPage(1);
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-2">
          {loading ? (
            <div className="col-span-full rounded-3xl border bg-white p-10 text-center text-black/50">
              Loading your bookings...
            </div>
          ) : filteredBookings.length === 0 ? (
            <div className="col-span-full rounded-3xl border bg-white p-10 text-center">
              <p className="font-bold text-[#3f5b44]">No bookings found.</p>
              <p className="mt-2 text-sm text-black/50">
                No {serviceFilter === "ALL" ? "service" : getServiceLabel(serviceFilter)}{" "}
                bookings found under "{activeStatusLabel}".
              </p>
            </div>
          ) : (
            paginatedBookings.map((booking) => (
              <BookingProcessCard
                key={`${booking.bookingType}-${booking._id}`}
                booking={booking}
                onReview={() => openReviewModal(booking)}
                onBookAgain={() => handleBookAgain(booking)}
              />
            ))
          )}
        </div>

        {!loading && filteredBookings.length > 0 ? (
          <PaginationBar
            page={safePage}
            totalPages={totalPages}
            totalItems={filteredBookings.length}
            onPageChange={setPage}
          />
        ) : null}
      </div>

      {selectedBooking ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 px-4">
          <div className="w-full max-w-xl rounded-3xl bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-[#3f5b44]/70">
                  Submit Review
                </p>

                <h2 className="mt-2 text-2xl font-extrabold text-[#3f5b44]">
                  {selectedBooking.bookingTitle}
                </h2>

                <p className="mt-1 text-sm text-black/50">
                  {selectedBooking.serviceType} • {formatDate(selectedBooking.bookingDate)}
                </p>
              </div>

              <button
                type="button"
                onClick={closeReviewModal}
                disabled={submitting}
                className="rounded-full px-3 py-2 text-sm font-bold text-black/50 hover:bg-black/5 disabled:opacity-60"
              >
                ✕
              </button>
            </div>

            <div className="mt-6">
              <label className="mb-2 block text-sm font-extrabold text-[#3f5b44]">
                Rating
              </label>

              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className={`text-4xl transition ${
                      star <= rating ? "text-amber-400" : "text-black/20"
                    }`}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-6">
              <label className="mb-2 block text-sm font-extrabold text-[#3f5b44]">
                Review
              </label>

              <textarea
                value={reviewText}
                onChange={(event) => setReviewText(event.target.value.slice(0, 1000))}
                rows={5}
                placeholder="Write your experience here..."
                className="w-full rounded-2xl border border-[#3f5b44]/25 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#3f5b44]/20"
              />

              <p className="mt-2 text-xs text-black/45">
                {reviewText.length}/1000 characters
              </p>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={closeReviewModal}
                disabled={submitting}
                className="h-10 rounded-full border border-black/10 bg-white px-6 text-sm font-extrabold text-black/60 hover:bg-black/5 disabled:opacity-60"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={submitReview}
                disabled={submitting}
                className="h-10 rounded-full bg-[#3f5b44] px-8 text-sm font-extrabold text-white hover:opacity-90 disabled:opacity-60"
              >
                {submitting ? "Submitting..." : "Submit Review"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}


function PaginationBar({ page, totalPages, totalItems, onPageChange }) {
  const pages = buildPageNumbers(page, totalPages);

  return (
    <div className="mt-6 rounded-3xl border border-black/10 bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <p className="text-sm font-bold text-black/55">
          Page {page} of {totalPages} • {totalItems} result
          {totalItems === 1 ? "" : "s"}
        </p>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => onPageChange(Math.max(1, page - 1))}
            disabled={page <= 1}
            className="h-9 rounded-full border border-black/10 px-4 text-xs font-extrabold text-black/60 hover:bg-black/5 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Previous
          </button>

          {pages.map((item, index) =>
            item === "..." ? (
              <span key={`dots-${index}`} className="px-2 text-black/35">
                ...
              </span>
            ) : (
              <button
                key={item}
                type="button"
                onClick={() => onPageChange(item)}
                className={`h-9 min-w-9 rounded-full border px-3 text-xs font-extrabold ${
                  item === page
                    ? "border-[#3f5b44] bg-[#3f5b44] text-white"
                    : "border-black/10 bg-white text-black/60 hover:bg-black/5"
                }`}
              >
                {item}
              </button>
            )
          )}

          <button
            type="button"
            onClick={() => onPageChange(Math.min(totalPages, page + 1))}
            disabled={page >= totalPages}
            className="h-9 rounded-full border border-black/10 px-4 text-xs font-extrabold text-black/60 hover:bg-black/5 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

function buildPageNumbers(page, totalPages) {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const pages = new Set([1, totalPages, page, page - 1, page + 1]);
  const sorted = [...pages]
    .filter((item) => item >= 1 && item <= totalPages)
    .sort((a, b) => a - b);

  const result = [];
  sorted.forEach((item, index) => {
    if (index > 0 && item - sorted[index - 1] > 1) {
      result.push("...");
    }
    result.push(item);
  });

  return result;
}

function BookingProcessCard({ booking, onReview, onBookAgain }) {
  const serviceBadge = getBookingServiceBadge(booking.bookingType);
  const statusInfo = getStatusInfo(booking.status);
  const canReview = booking.status === "CONFIRMED" && !booking.reviewed;

  return (
    <div className="overflow-hidden rounded-3xl border border-black/10 bg-white shadow-sm">
      <div className="bg-gradient-to-br from-[#3f5b44] to-[#7b8c72] p-5 text-white">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-white/70">
              {serviceBadge}
            </p>

            <h3 className="mt-2 text-2xl font-extrabold leading-tight">
              {booking.bookingTitle}
            </h3>

            <p className="mt-2 text-xs font-semibold text-white/70">
              Booking ID: {booking._id}
            </p>
          </div>

          <span className={`rounded-full px-3 py-1 text-xs font-extrabold ${statusInfo.badge}`}>
            {statusInfo.label}
          </span>
        </div>
      </div>

      <div className="p-5">
        <BookingTimeline status={booking.status} />

        <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
          <Info label="Service" value={booking.serviceType} />
          <Info label="Date" value={formatDate(booking.bookingDate)} />
          <Info label="Time" value={booking.bookingTime || "—"} />
          <Info label="Pax" value={booking.pax || "—"} />
          <Info label="Payment" value={booking.paymentMethod || "—"} />
          <Info label="Amount" value={formatPeso(booking.amount)} />
        </div>

        <div className={`mt-5 rounded-2xl p-4 ${statusInfo.box}`}>
          <p className="text-sm font-extrabold">{statusInfo.heading}</p>
          <p className="mt-1 text-sm leading-6">{statusInfo.description}</p>
        </div>

        {booking.reviewed ? (
          <>
            <div className="mt-5 rounded-2xl bg-[#3f5b44]/10 p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-extrabold text-[#3f5b44]">
                  Your Review
                </p>

                <p className="text-sm font-extrabold text-amber-500">
                  {"★".repeat(Number(booking.review?.rating || 0))}
                </p>
              </div>

              <p className="mt-2 text-sm leading-6 text-black/65">
                {booking.review?.reviewText || "No review text."}
              </p>

              {booking.review?.adminReply ? (
                <div className="mt-4 rounded-2xl bg-white p-4">
                  <p className="text-xs font-extrabold uppercase tracking-wide text-[#3f5b44]/60">
                    Admin Reply
                  </p>

                  <p className="mt-2 text-sm text-black/65">
                    {booking.review.adminReply}
                  </p>
                </div>
              ) : null}
            </div>

            <button
              type="button"
              onClick={onBookAgain}
              className="mt-5 h-10 w-full rounded-full bg-[#3f5b44] text-sm font-extrabold text-white shadow-sm hover:opacity-90"
            >
              BOOK IT AGAIN
            </button>
          </>
        ) : canReview ? (
          <button
            type="button"
            onClick={onReview}
            className="mt-5 h-10 w-full rounded-full bg-[#3f5b44] text-sm font-extrabold text-white shadow-sm hover:opacity-90"
          >
            WRITE REVIEW
          </button>
        ) : (
          <button
            type="button"
            disabled
            className="mt-5 h-10 w-full cursor-not-allowed rounded-full bg-black/10 text-sm font-extrabold text-black/35"
          >
            {booking.status === "PENDING"
              ? "WAITING FOR ADMIN APPROVAL"
              : booking.status === "CANCELLED"
              ? "BOOKING CANCELLED / REJECTED"
              : "REVIEW NOT AVAILABLE"}
          </button>
        )}
      </div>
    </div>
  );
}

function BookingTimeline({ status }) {
  const steps = [
    {
      key: "SUBMITTED",
      title: "Submitted",
      description: "Booking sent",
    },
    {
      key: "PENDING",
      title: "Admin Review",
      description: "Waiting approval",
    },
    {
      key: "CONFIRMED",
      title: "Approved",
      description: "Confirmed booking",
    },
  ];

  const isCancelled = status === "CANCELLED";

  const activeIndex =
    status === "CONFIRMED" ? 2 : status === "PENDING" ? 1 : isCancelled ? 1 : 0;

  return (
    <div className="rounded-2xl border border-black/10 bg-black/[0.025] p-4">
      <div className="flex items-start justify-between gap-2">
        {steps.map((step, index) => {
          const active = index <= activeIndex && !isCancelled;
          const current = index === activeIndex && !isCancelled;

          return (
            <div key={step.key} className="flex flex-1 flex-col items-center text-center">
              <div
                className={`flex h-9 w-9 items-center justify-center rounded-full text-xs font-extrabold ${
                  active
                    ? "bg-[#3f5b44] text-white"
                    : "border border-black/10 bg-white text-black/35"
                }`}
              >
                {active ? "✓" : index + 1}
              </div>

              <p
                className={`mt-2 text-xs font-extrabold ${
                  current
                    ? "text-[#3f5b44]"
                    : active
                    ? "text-black/70"
                    : "text-black/35"
                }`}
              >
                {step.title}
              </p>

              <p className="mt-1 text-[11px] text-black/40">{step.description}</p>
            </div>
          );
        })}
      </div>

      {isCancelled ? (
        <div className="mt-4 rounded-2xl bg-rose-50 p-3 text-center text-xs font-bold text-rose-700">
          This booking was cancelled or rejected by admin.
        </div>
      ) : null}
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="rounded-3xl border border-black/10 bg-white p-5 shadow-sm">
      <p className="text-xs font-extrabold uppercase tracking-wide text-black/45">
        {label}
      </p>
      <p className="mt-2 text-3xl font-extrabold text-[#3f5b44]">{value}</p>
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div className="rounded-2xl bg-black/[0.035] p-3">
      <p className="text-[11px] font-bold uppercase tracking-wide text-black/40">
        {label}
      </p>
      <p className="mt-1 break-words text-sm font-extrabold text-[#3f5b44]">
        {value || "—"}
      </p>
    </div>
  );
}

function FilterButton({ label, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`h-9 rounded-full border px-5 text-xs font-extrabold ${
        active
          ? "border-[#3f5b44] bg-[#3f5b44] text-white"
          : "border-black/10 bg-white text-black/60 hover:bg-black/5"
      }`}
    >
      {label}
    </button>
  );
}

function ServiceFilterButton({ label, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`h-9 rounded-full border px-5 text-xs font-extrabold ${
        active
          ? "border-[#7b8c72] bg-[#7b8c72] text-white"
          : "border-[#3f5b44]/15 bg-white text-[#3f5b44] hover:bg-[#3f5b44]/5"
      }`}
    >
      {label}
    </button>
  );
}