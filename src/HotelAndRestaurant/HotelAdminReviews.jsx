// HotelAdminReviews.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import HotelAdminShell from "./HotelAdminShell";

const REVIEW_TABS = [
  { id: "ALL", label: "All" },
  { id: "HIGH", label: "High 4-5" },
  { id: "MID", label: "Average 3" },
  { id: "LOW", label: "Low 1-2" },
  { id: "NO_REPLY", label: "No Reply" },
];

const PAGE_SIZE = 6;

const HotelAdminReviews = () => {
  const navigate = useNavigate();

  const API_BASE = useMemo(() => {
    const raw = (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(
      /\/+$/,
      ""
    );
    if (raw.includes("/api/hotel")) return raw;
    if (raw.includes("/api/")) return raw;
    return `${raw}/api/hotel`;
  }, []);

  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState("");
  const [status, setStatus] = useState({ type: "", message: "" });

  const [reviews, setReviews] = useState([]);
  const [summary, setSummary] = useState({
    totalReviews: 0,
    averageRating: 0,
    lowRatings: 0,
    noReply: 0,
    filteredTotal: 0,
  });

  const [tab, setTab] = useState("ALL");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: PAGE_SIZE,
    totalItems: 0,
    totalPages: 1,
    hasPrevPage: false,
    hasNextPage: false,
  });
  const [replyDrafts, setReplyDrafts] = useState({});

  const getAdminToken = () =>
    localStorage.getItem("adminToken") ||
    localStorage.getItem("hotelAdminToken") ||
    localStorage.getItem("hotelAdmin") ||
    "";

  const kickToLogin = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("hotelAdminToken");
    navigate("/hotel-admin-login");
  };

  const fetchReviews = async ({ targetPage = page, targetTab = tab } = {}) => {
    const token = getAdminToken();

    if (!token) {
      kickToLogin();
      return;
    }

    setLoading(true);
    setStatus({ type: "", message: "" });

    try {
      const params = new URLSearchParams({
        page: String(targetPage),
        limit: String(PAGE_SIZE),
        filter: targetTab,
      });

      const res = await fetch(`${API_BASE}/admin/guest-reviews?${params}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json().catch(() => ({}));

      if (res.status === 401 || res.status === 403) {
        kickToLogin();
        return;
      }

      if (!res.ok) {
        setReviews([]);
        setStatus({
          type: "error",
          message: data.message || "Failed to load reviews.",
        });
        return;
      }

      const rows = Array.isArray(data.reviews) ? data.reviews : [];
      setReviews(rows);
      setSummary({
        totalReviews: Number(data.totalReviews || 0),
        averageRating: Number(data.averageRating || 0),
        lowRatings: Number(data.lowRatings || 0),
        noReply: Number(data.noReply || 0),
        filteredTotal: Number(data.filteredTotal || rows.length),
      });

      const nextPagination = data.pagination || {
        page: targetPage,
        limit: PAGE_SIZE,
        totalItems: rows.length,
        totalPages: 1,
        hasPrevPage: false,
        hasNextPage: false,
      };

      setPagination(nextPagination);

      if (Number(nextPagination.page || 1) !== page) {
        setPage(Number(nextPagination.page || 1));
      }

      setReplyDrafts((prev) => {
        const next = { ...prev };
        rows.forEach((item) => {
          next[item._id] = item.adminReply || "";
        });
        return next;
      });
    } catch (err) {
      console.error(err);
      setStatus({
        type: "error",
        message: "Network error while loading reviews.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews({ targetPage: page, targetTab: tab });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, tab]);

  const saveReply = async (reviewId) => {
    const token = getAdminToken();

    if (!token) {
      kickToLogin();
      return;
    }

    setBusyId(reviewId);
    setStatus({ type: "", message: "" });

    try {
      const res = await fetch(`${API_BASE}/admin/guest-reviews/${reviewId}/reply`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          adminReply: replyDrafts[reviewId] || "",
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (res.status === 401 || res.status === 403) {
        kickToLogin();
        return;
      }

      if (!res.ok) {
        setStatus({
          type: "error",
          message: data.message || "Failed to save reply.",
        });
        return;
      }

      setStatus({
        type: "success",
        message: "Reply saved successfully.",
      });

      await fetchReviews({ targetPage: page, targetTab: tab });
    } catch (err) {
      console.error(err);
      setStatus({
        type: "error",
        message: "Network error while saving reply.",
      });
    } finally {
      setBusyId("");
    }
  };

  const handleTabChange = (nextTab) => {
    setTab(nextTab);
    setPage(1);
  };

  const statusStyles =
    status.type === "success"
      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
      : status.type === "error"
      ? "border-rose-200 bg-rose-50 text-rose-700"
      : "border-slate-200 bg-slate-50 text-slate-700";

  return (
    <HotelAdminShell
      title="Guest Reviews"
      subtitle="Read guest feedback, filter by rating, and save admin replies."
      activePage="reviews"
      maxWidth="max-w-6xl"
      actions={
        <button
          type="button"
          onClick={() => fetchReviews({ targetPage: page, targetTab: tab })}
          disabled={loading}
          className="h-10 rounded-2xl bg-[#2A4F33] px-5 text-xs font-extrabold text-white shadow-sm hover:opacity-90 disabled:opacity-60"
        >
          {loading ? "REFRESHING..." : "REFRESH"}
        </button>
      }
    >
      {status.message ? (
        <div className={`mb-5 rounded-xl border px-4 py-3 text-sm ${statusStyles}`}>
          {status.message}
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <StatCard label="Total Reviews" value={summary.totalReviews} />
        <StatCard
          label="Average Rating"
          value={
            summary.averageRating
              ? `${Number(summary.averageRating).toFixed(1)} ★`
              : "—"
          }
        />
        <StatCard label="Low Ratings" value={summary.lowRatings} />
        <StatCard label="No Reply" value={summary.noReply} />
      </div>

      <div className="mt-6 rounded-2xl border border-black/10 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-2">
            {REVIEW_TABS.map((item) => (
              <Tab
                key={item.id}
                label={item.label}
                active={tab === item.id}
                onClick={() => handleTabChange(item.id)}
              />
            ))}
          </div>

          <p className="text-xs font-bold uppercase tracking-wide text-black/45">
            Showing {reviews.length} of {summary.filteredTotal} result
            {summary.filteredTotal === 1 ? "" : "s"}
          </p>
        </div>
      </div>

      <div className="mt-6 space-y-5">
        {loading ? (
          <div className="rounded-2xl border border-black/10 bg-white p-8 text-center text-black/50">
            Loading reviews...
          </div>
        ) : reviews.length === 0 ? (
          <div className="rounded-2xl border border-black/10 bg-white p-8 text-center">
            <p className="font-bold text-[#2A4F33]">No reviews found.</p>
          </div>
        ) : (
          reviews.map((review) => (
            <div
              key={review._id}
              className="rounded-3xl border border-black/10 bg-white p-5 shadow-sm"
            >
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-black/40">
                    {review.serviceType || review.bookingType}
                  </p>
                  <h3 className="mt-2 text-2xl font-extrabold text-[#2A4F33]">
                    {review.bookingTitle || "Booking Review"}
                  </h3>
                  <p className="mt-1 text-sm text-black/50">
                    {review.firstName} {review.lastName} • {review.email}
                  </p>
                  <p className="mt-1 text-xs text-black/45">
                    {formatDate(review.bookingDate)} • {review.bookingTime || "—"}
                  </p>
                </div>

                <div className="rounded-2xl bg-amber-50 px-4 py-3 text-center">
                  <p className="text-xs font-bold uppercase text-amber-700/70">
                    Rating
                  </p>
                  <p className="text-2xl font-extrabold text-amber-500">
                    {"★".repeat(Number(review.rating || 0))}
                  </p>
                </div>
              </div>

              <div className="mt-5 rounded-2xl bg-black/[0.035] p-4">
                <p className="text-xs font-extrabold uppercase tracking-wide text-black/40">
                  Guest Review
                </p>
                <p className="mt-2 text-sm leading-6 text-black/70">
                  {review.reviewText || "No review text."}
                </p>
              </div>

              <div className="mt-5">
                <label className="mb-2 block text-xs font-extrabold uppercase tracking-wide text-[#2A4F33]/70">
                  Admin Reply
                </label>

                <textarea
                  value={replyDrafts[review._id] || ""}
                  onChange={(e) =>
                    setReplyDrafts((prev) => ({
                      ...prev,
                      [review._id]: e.target.value.slice(0, 1000),
                    }))
                  }
                  rows={3}
                  placeholder="Write a reply to the guest..."
                  className="w-full rounded-2xl border border-black/10 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#2A4F33]/20"
                />

                <div className="mt-3 flex justify-end">
                  <button
                    onClick={() => saveReply(review._id)}
                    disabled={busyId === review._id}
                    className="h-10 rounded-full bg-[#2A4F33] px-6 text-sm font-extrabold text-white hover:opacity-90 disabled:opacity-60"
                  >
                    {busyId === review._id ? "Saving..." : "Save Reply"}
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {!loading && pagination.totalItems > 0 ? (
        <PaginationBar
          page={pagination.page}
          totalPages={pagination.totalPages}
          totalItems={pagination.totalItems}
          onPageChange={setPage}
        />
      ) : null}
    </HotelAdminShell>
  );
};

function StatCard({ label, value }) {
  return (
    <div className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm">
      <p className="text-xs font-extrabold uppercase tracking-wide text-black/45">
        {label}
      </p>
      <p className="mt-2 text-3xl font-extrabold text-[#2A4F33]">{value}</p>
    </div>
  );
}

function Tab({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`h-9 rounded-full border px-5 text-xs font-extrabold ${
        active
          ? "border-[#2A4F33] bg-[#2A4F33] text-white"
          : "border-black/10 bg-white text-black/60 hover:bg-black/5"
      }`}
    >
      {label}
    </button>
  );
}

function PaginationBar({ page, totalPages, totalItems, onPageChange }) {
  const pages = buildPageNumbers(page, totalPages);

  return (
    <div className="mt-6 rounded-2xl border border-black/10 bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <p className="text-sm font-bold text-black/55">
          Page {page} of {totalPages} • {totalItems} total review
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
                    ? "border-[#2A4F33] bg-[#2A4F33] text-white"
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

function formatDate(value) {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return value || "—";
  const [y, m, d] = value.split("-");
  return `${m}/${d}/${y}`;
}

export default HotelAdminReviews;
