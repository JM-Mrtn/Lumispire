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
      maxWidth="max-w-7xl"
      actions={
        <button
          type="button"
          onClick={() => fetchReviews({ targetPage: page, targetTab: tab })}
          disabled={loading}
          className="ltc-admin-refresh"
        >
          {loading ? "Refreshing..." : "Refresh"}
        </button>
      }
    >
      <style>{`
        .ltc-reviews-page {
          --green-950: #071f14;
          --green-900: #0e3321;
          --green-800: #174a30;
          --green-700: #235f3e;
          --gold: #d7a84d;
          --gold-soft: #f4d484;
          --muted: #667085;
          --glass: rgba(255,255,255,.78);
          --shadow-md: 0 18px 45px rgba(8,39,25,.12);
          --shadow-lg: 0 32px 80px rgba(8,39,25,.18);
          --radius: 24px;
          --ease: cubic-bezier(.22,1,.36,1);
        }

        .ltc-reviews-page * {
          box-sizing: border-box;
        }

        .ltc-admin-refresh {
          min-height: 42px;
          border-radius: 999px;
          border: 0;
          color: #102418;
          background: linear-gradient(135deg,#f4d484,#d7a84d);
          box-shadow: 0 16px 35px rgba(215,168,77,.24);
          padding: 0 22px;
          font-size: 12px;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: .08em;
          cursor: pointer;
          transition: .28s var(--ease);
        }

        .ltc-admin-refresh:hover {
          transform: translateY(-3px);
        }

        .ltc-admin-refresh:disabled {
          cursor: not-allowed;
          opacity: .6;
          transform: none;
        }

        .ltc-admin-alert {
          margin-bottom: 18px;
          border-radius: 20px;
          border: 1px solid rgba(215,168,77,.32);
          background: rgba(244,212,132,.18);
          color: var(--green-900);
          padding: 14px 18px;
          font-size: 14px;
          font-weight: 800;
        }

        .ltc-admin-alert.error {
          border-color: rgba(225,29,72,.24);
          background: rgba(255,241,242,.9);
          color: #be123c;
        }

        .ltc-admin-alert.success {
          border-color: rgba(35,95,62,.24);
          background: rgba(236,253,245,.9);
          color: var(--green-800);
        }

        .ltc-admin-stats-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 18px;
        }

        .ltc-admin-stat-card,
        .ltc-admin-panel,
        .ltc-admin-review-card,
        .ltc-admin-empty,
        .ltc-admin-pagination {
          position: relative;
          overflow: hidden;
          border-radius: var(--radius);
          background: var(--glass);
          border: 1px solid rgba(255,255,255,.76);
          box-shadow: var(--shadow-md);
          backdrop-filter: blur(18px);
          animation: ltcAppleReveal .7s var(--ease) both;
        }

        .ltc-admin-stat-card {
          min-height: 126px;
          padding: 26px;
          transition: transform .38s var(--ease), box-shadow .38s var(--ease), border-color .38s var(--ease), background .38s var(--ease);
        }

        .ltc-admin-stat-card::before,
        .ltc-admin-panel::before,
        .ltc-admin-review-card::before,
        .ltc-admin-pagination::before {
          content: "";
          position: absolute;
          inset: 0 0 auto;
          height: 6px;
          background: linear-gradient(90deg,var(--green-700),var(--gold));
        }

        .ltc-admin-stat-card::after,
        .ltc-admin-review-card::after {
          content: "";
          position: absolute;
          width: 170px;
          height: 170px;
          right: -80px;
          bottom: -80px;
          border-radius: 50%;
          background:
            radial-gradient(circle, rgba(215,168,77,.22), transparent 58%),
            radial-gradient(circle, rgba(47,117,76,.18), transparent 66%);
          opacity: .85;
          transition: transform .45s var(--ease), opacity .45s var(--ease);
        }

        .ltc-admin-stat-card:hover,
        .ltc-admin-review-card:hover {
          transform: translateY(-10px) scale(1.01);
          box-shadow: 0 34px 85px rgba(8,39,25,.20);
          border-color: rgba(215,168,77,.54);
          background: rgba(255,255,255,.92);
        }

        .ltc-admin-stat-card:hover::after,
        .ltc-admin-review-card:hover::after {
          transform: translate(-18px, -16px) scale(1.18);
        }

        .ltc-admin-stat-title,
        .ltc-admin-panel-kicker,
        .ltc-admin-review-kicker {
          position: relative;
          z-index: 1;
          margin: 0;
          color: rgba(16,24,40,.46);
          font-size: 12px;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: .18em;
        }

        .ltc-admin-stat-value {
          position: relative;
          z-index: 1;
          margin: 12px 0 0;
          color: var(--green-800);
          font-size: 42px;
          line-height: 1;
          font-weight: 900;
          letter-spacing: -.055em;
        }

        .ltc-admin-stat-note,
        .ltc-admin-muted {
          position: relative;
          z-index: 1;
          margin: 10px 0 0;
          color: var(--muted);
          font-size: 13px;
          font-weight: 700;
        }

        .ltc-admin-panel {
          margin-top: 22px;
          padding: 24px;
        }

        .ltc-admin-panel-head {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 18px;
        }

        .ltc-admin-filter-row,
        .ltc-admin-page-row {
          display: flex;
          flex-wrap: wrap;
          gap: 9px;
        }

        .ltc-admin-filter,
        .ltc-admin-page-btn {
          min-height: 38px;
          border-radius: 999px;
          border: 1px solid rgba(35,95,62,.14);
          background: rgba(255,255,255,.8);
          color: rgba(16,24,40,.58);
          padding: 0 15px;
          font-size: 12px;
          font-weight: 900;
          cursor: pointer;
          transition: .25s var(--ease);
        }

        .ltc-admin-filter:hover,
        .ltc-admin-filter.active,
        .ltc-admin-page-btn:hover,
        .ltc-admin-page-btn.active {
          color: #102418;
          border-color: rgba(215,168,77,.54);
          background: linear-gradient(135deg,#f4d484,#d7a84d);
          transform: translateY(-2px);
        }

        .ltc-admin-page-btn:disabled {
          cursor: not-allowed;
          opacity: .45;
          transform: none;
        }

        .ltc-admin-page-dots {
          display: inline-flex;
          min-height: 38px;
          align-items: center;
          color: rgba(16,24,40,.4);
          padding: 0 6px;
          font-weight: 900;
        }

        .ltc-admin-result-count {
          margin: 0;
          color: rgba(16,24,40,.46);
          font-size: 12px;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: .12em;
        }

        .ltc-admin-review-list {
          display: grid;
          gap: 18px;
          margin-top: 22px;
        }

        .ltc-admin-review-card {
          padding: 26px;
          transition: transform .38s var(--ease), box-shadow .38s var(--ease), border-color .38s var(--ease), background .38s var(--ease);
        }

        .ltc-admin-review-top {
          position: relative;
          z-index: 1;
          display: flex;
          justify-content: space-between;
          gap: 18px;
          align-items: flex-start;
        }

        .ltc-admin-review-title {
          margin: 10px 0 0;
          color: var(--green-950);
          font-size: 26px;
          line-height: 1.1;
          font-weight: 900;
          letter-spacing: -.045em;
        }

        .ltc-admin-review-meta {
          margin: 7px 0 0;
          color: rgba(16,24,40,.56);
          font-size: 13px;
          font-weight: 700;
        }

        .ltc-admin-rating-box {
          flex: 0 0 auto;
          min-width: 132px;
          border-radius: 20px;
          border: 1px solid rgba(215,168,77,.25);
          background: rgba(244,212,132,.18);
          padding: 12px 16px;
          text-align: center;
        }

        .ltc-admin-rating-label {
          margin: 0;
          color: rgba(124,74,3,.72);
          font-size: 10px;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: .15em;
        }

        .ltc-admin-rating-stars {
          margin: 4px 0 0;
          color: var(--gold);
          font-size: 22px;
          line-height: 1;
          font-weight: 900;
          letter-spacing: .03em;
        }

        .ltc-admin-text-box {
          position: relative;
          z-index: 1;
          margin-top: 18px;
          border-radius: 22px;
          border: 1px solid rgba(35,95,62,.08);
          background:
            radial-gradient(circle at 100% 0%, rgba(215,168,77,.10), transparent 26%),
            rgba(246,250,247,.88);
          padding: 18px;
        }

        .ltc-admin-text-label,
        .ltc-admin-reply-label {
          margin: 0;
          color: rgba(16,24,40,.46);
          font-size: 11px;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: .16em;
        }

        .ltc-admin-text-value {
          margin: 8px 0 0;
          color: rgba(16,24,40,.68);
          font-size: 14px;
          font-weight: 700;
          line-height: 1.75;
        }

        .ltc-admin-reply-block {
          position: relative;
          z-index: 1;
          margin-top: 18px;
        }

        .ltc-admin-reply-textarea {
          margin-top: 9px;
          width: 100%;
          min-height: 110px;
          resize: vertical;
          border: 1px solid rgba(35,95,62,.14);
          background: rgba(255,255,255,.88);
          color: var(--green-950);
          border-radius: 22px;
          padding: 14px 16px;
          font-size: 14px;
          font-weight: 700;
          outline: none;
          transition: .25s var(--ease);
        }

        .ltc-admin-reply-textarea:focus {
          border-color: rgba(35,95,62,.46);
          background: white;
          box-shadow: 0 0 0 4px rgba(35,95,62,.10);
        }

        .ltc-admin-save-wrap {
          margin-top: 12px;
          display: flex;
          justify-content: flex-end;
        }

        .ltc-admin-save-btn {
          min-height: 40px;
          min-width: 126px;
          border-radius: 999px;
          border: 0;
          color: #102418;
          background: linear-gradient(135deg,#f4d484,#d7a84d);
          box-shadow: 0 12px 24px rgba(215,168,77,.20);
          padding: 0 20px;
          font-size: 12px;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: .04em;
          cursor: pointer;
          transition: .25s var(--ease);
        }

        .ltc-admin-save-btn:hover {
          transform: translateY(-2px);
        }

        .ltc-admin-save-btn:disabled {
          cursor: not-allowed;
          opacity: .6;
          transform: none;
        }

        .ltc-admin-empty {
          margin-top: 22px;
          padding: 34px;
          text-align: center;
        }

        .ltc-admin-empty-title {
          margin: 0;
          color: var(--green-800);
          font-size: 20px;
          font-weight: 900;
        }

        .ltc-admin-pagination {
          margin-top: 22px;
          padding: 18px;
        }

        .ltc-admin-pagination-inner {
          position: relative;
          z-index: 1;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
        }

        .ltc-admin-pagination-text {
          margin: 0;
          color: rgba(16,24,40,.56);
          font-size: 13px;
          font-weight: 800;
        }

        @keyframes ltcAppleReveal {
          from { opacity: 0; transform: translateY(34px) scale(.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        @media (max-width: 1000px) {
          .ltc-admin-stats-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 700px) {
          .ltc-admin-stats-grid {
            grid-template-columns: 1fr;
          }

          .ltc-admin-panel-head,
          .ltc-admin-review-top,
          .ltc-admin-pagination-inner {
            flex-direction: column;
            align-items: stretch;
          }

          .ltc-admin-rating-box {
            width: 100%;
          }

          .ltc-admin-review-card,
          .ltc-admin-panel,
          .ltc-admin-stat-card {
            padding: 20px;
          }
        }
      `}</style>

      <div className="ltc-reviews-page">
        {status.message ? (
          <div className={`ltc-admin-alert ${status.type || ""}`}>
            {status.message}
          </div>
        ) : null}

        <div className="ltc-admin-stats-grid">
          <StatCard label="Total Reviews" value={summary.totalReviews} note="All submitted guest feedback" />
          <StatCard
            label="Average Rating"
            value={
              summary.averageRating
                ? `${Number(summary.averageRating).toFixed(1)} ★`
                : "—"
            }
            note="Overall guest satisfaction"
          />
          <StatCard label="Low Ratings" value={summary.lowRatings} note="Needs review or follow-up" />
          <StatCard label="No Reply" value={summary.noReply} note="Waiting for admin reply" />
        </div>

        <section className="ltc-admin-panel">
          <div className="ltc-admin-panel-head">
            <div className="ltc-admin-filter-row">
              {REVIEW_TABS.map((item) => (
                <Tab
                  key={item.id}
                  label={item.label}
                  active={tab === item.id}
                  onClick={() => handleTabChange(item.id)}
                />
              ))}
            </div>

            <p className="ltc-admin-result-count">
              Showing {reviews.length} of {summary.filteredTotal} result
              {summary.filteredTotal === 1 ? "" : "s"}
            </p>
          </div>
        </section>

        <div className="ltc-admin-review-list">
          {loading ? (
            <div className="ltc-admin-empty">
              <p className="ltc-admin-empty-title">Loading reviews...</p>
            </div>
          ) : reviews.length === 0 ? (
            <div className="ltc-admin-empty">
              <p className="ltc-admin-empty-title">No reviews found.</p>
            </div>
          ) : (
            reviews.map((review) => (
              <article key={review._id} className="ltc-admin-review-card">
                <div className="ltc-admin-review-top">
                  <div>
                    <p className="ltc-admin-review-kicker">
                      {review.serviceType || review.bookingType}
                    </p>
                    <h3 className="ltc-admin-review-title">
                      {review.bookingTitle || "Booking Review"}
                    </h3>
                    <p className="ltc-admin-review-meta">
                      {review.firstName} {review.lastName} • {review.email}
                    </p>
                    <p className="ltc-admin-review-meta">
                      {formatDate(review.bookingDate)} • {review.bookingTime || "—"}
                    </p>
                  </div>

                  <div className="ltc-admin-rating-box">
                    <p className="ltc-admin-rating-label">Rating</p>
                    <p className="ltc-admin-rating-stars">
                      {"★".repeat(Number(review.rating || 0)) || "—"}
                    </p>
                  </div>
                </div>

                <div className="ltc-admin-text-box">
                  <p className="ltc-admin-text-label">Guest Review</p>
                  <p className="ltc-admin-text-value">
                    {review.reviewText || "No review text."}
                  </p>
                </div>

                <div className="ltc-admin-reply-block">
                  <label className="ltc-admin-reply-label">
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
                    className="ltc-admin-reply-textarea"
                  />

                  <div className="ltc-admin-save-wrap">
                    <button
                      type="button"
                      onClick={() => saveReply(review._id)}
                      disabled={busyId === review._id}
                      className="ltc-admin-save-btn"
                    >
                      {busyId === review._id ? "Saving..." : "Save Reply"}
                    </button>
                  </div>
                </div>
              </article>
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
      </div>
    </HotelAdminShell>
  );
};

function StatCard({ label, value, note }) {
  return (
    <div className="ltc-admin-stat-card">
      <p className="ltc-admin-stat-title">{label}</p>
      <p className="ltc-admin-stat-value">{value}</p>
      {note ? <p className="ltc-admin-stat-note">{note}</p> : null}
    </div>
  );
}

function Tab({ label, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`ltc-admin-filter ${active ? "active" : ""}`}
    >
      {label}
    </button>
  );
}

function PaginationBar({ page, totalPages, totalItems, onPageChange }) {
  const pages = buildPageNumbers(page, totalPages);

  return (
    <div className="ltc-admin-pagination">
      <div className="ltc-admin-pagination-inner">
        <p className="ltc-admin-pagination-text">
          Page {page} of {totalPages} • {totalItems} total review
          {totalItems === 1 ? "" : "s"}
        </p>

        <div className="ltc-admin-page-row">
          <button
            type="button"
            onClick={() => onPageChange(Math.max(1, page - 1))}
            disabled={page <= 1}
            className="ltc-admin-page-btn"
          >
            Previous
          </button>

          {pages.map((item, index) =>
            item === "..." ? (
              <span key={`dots-${index}`} className="ltc-admin-page-dots">
                ...
              </span>
            ) : (
              <button
                key={item}
                type="button"
                onClick={() => onPageChange(item)}
                className={`ltc-admin-page-btn ${item === page ? "active" : ""}`}
              >
                {item}
              </button>
            )
          )}

          <button
            type="button"
            onClick={() => onPageChange(Math.min(totalPages, page + 1))}
            disabled={page >= totalPages}
            className="ltc-admin-page-btn"
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
