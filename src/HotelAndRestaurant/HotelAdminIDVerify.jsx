import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import HotelAdminShell from "./HotelAdminShell";

const AUTO_APPROVE_MIN_SCORE = 90;

function getHotelAdminApiBase() {
  const raw = (
    import.meta.env.VITE_HOTEL_API_BASE ||
    import.meta.env.VITE_API_BASE ||
    import.meta.env.VITE_API_URL ||
    import.meta.env.VITE_SERVER_URL ||
    "http://localhost:5000"
  ).replace(/\/+$/, "");

  // Already correct admin route
  if (raw.endsWith("/api/hotel-admin")) {
    return raw;
  }

  // Already correct hotel route
  if (raw.endsWith("/api/hotel")) {
    return raw;
  }

  // Example: https://lumispire-api.onrender.com/api
  if (raw.endsWith("/api")) {
    return `${raw}/hotel`;
  }

  // Example wrong value: https://lumispire-api.onrender.com/api/hotel/api/hotel-admin
  if (raw.includes("/api/hotel/api/hotel-admin")) {
    return raw.replace(/\/api\/hotel\/api\/hotel-admin.*$/i, "/api/hotel");
  }

  // Example: https://lumispire-api.onrender.com/api/something
  if (raw.includes("/api/")) {
    return raw.replace(/\/api\/.*$/i, "/api/hotel");
  }

  // Example: https://lumispire-api.onrender.com
  return `${raw}/api/hotel`;
}

function getAdminToken() {
  return (
    localStorage.getItem("adminToken") ||
    localStorage.getItem("hotelAdminToken") ||
    ""
  );
}

function normalizeText(value = "") {
  return String(value || "").trim();
}

function normalizeLower(value = "") {
  return normalizeText(value).toLowerCase().replace(/\s+/g, "_");
}

function formatValue(value) {
  return normalizeText(value || "unknown").replaceAll("_", " ");
}

function isRejectedByAi(verification) {
  if (!verification || typeof verification !== "object") return false;

  const aiDecision = normalizeLower(verification.aiDecision);
  const aiRisk = normalizeLower(verification.aiRiskLevel);
  const reviewDecision = normalizeLower(verification.reviewDecision);
  const screeningStatus = normalizeLower(verification.screeningStatus);

  return (
    aiDecision === "reject" ||
    aiRisk === "high" ||
    reviewDecision === "auto_rejected" ||
    screeningStatus === "suspicious" ||
    screeningStatus === "unreadable"
  );
}

function isAiAutoApproved(verification) {
  if (!verification || typeof verification !== "object") return false;

  const aiStatus = normalizeLower(verification.aiConnectionStatus);
  const aiDecision = normalizeLower(verification.aiDecision);
  const aiRisk = normalizeLower(verification.aiRiskLevel);
  const screeningStatus = normalizeLower(verification.screeningStatus);
  const reviewDecision = normalizeLower(verification.reviewDecision);
  const score = Number(verification.confidenceScore || 0);

  if (isRejectedByAi(verification)) return false;
  if (aiStatus !== "connected") return false;
  if (score < AUTO_APPROVE_MIN_SCORE) return false;
  if (aiRisk !== "low") return false;

  return (
    aiDecision === "approve" ||
    reviewDecision === "auto_approved" ||
    screeningStatus === "likely_valid" ||
    score >= AUTO_APPROVE_MIN_SCORE
  );
}


function getStatusBoxClass(type = "") {
  if (type === "success") {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }

  if (type === "warning") {
    return "border-amber-200 bg-amber-50 text-amber-700";
  }

  return "border-rose-200 bg-rose-50 text-rose-700";
}

function StatCard({ label, value, helper }) {
  return (
    <div className="relative overflow-hidden rounded-[24px] border border-white/80 bg-white/90 p-5 shadow-[0_18px_45px_rgba(8,39,25,0.12)] backdrop-blur-xl">
      <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-[#082719] via-[#235F3E] to-[#D7A84D]" />
      <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-black/50">
        {label}
      </p>
      <p className="mt-4 text-4xl font-black tracking-[-0.05em] text-[#082719]">
        {value}
      </p>
      {helper ? (
        <p className="mt-3 text-sm font-semibold text-black/55">{helper}</p>
      ) : null}
    </div>
  );
}

function Th({ children, className = "" }) {
  return (
    <th className={`px-5 py-4 text-xs font-extrabold uppercase tracking-[0.18em] text-[#667085] ${className}`}>
      {children}
    </th>
  );
}

function Td({ children, className = "" }) {
  return (
    <td className={`border-t border-[#082719]/10 px-5 py-5 align-top text-[13px] font-semibold text-[#102418] ${className}`}>
      {children}
    </td>
  );
}

export default function HotelAdminIDVerify() {
  const navigate = useNavigate();
  const API_BASE = useMemo(() => getHotelAdminApiBase(), []);

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageStatus, setPageStatus] = useState({ type: "", message: "" });
  const [query, setQuery] = useState("");
  const [actionLoadingId, setActionLoadingId] = useState("");
  const [rejectingUserId, setRejectingUserId] = useState("");
  const [rejectRemarks, setRejectRemarks] = useState("");

  const [previewUser, setPreviewUser] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [previewMimeType, setPreviewMimeType] = useState("");
  const [previewLoading, setPreviewLoading] = useState(false);

  const objectUrlsRef = useRef([]);
  const autoApprovingRef = useRef(new Set());

  const goToLogin = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("hotelAdminToken");
    localStorage.removeItem("hotelAdmin");
    navigate("/hotel-admin-login", { replace: true });
  };

  const registerObjectUrl = (url) => {
    if (url) objectUrlsRef.current.push(url);
  };

  const cleanupObjectUrls = () => {
    objectUrlsRef.current.forEach((url) => {
      try {
        URL.revokeObjectURL(url);
      } catch {
        // Ignore cleanup error
      }
    });

    objectUrlsRef.current = [];
  };

  useEffect(() => {
    return () => {
      cleanupObjectUrls();
    };
  }, []);

  const isImageMime = (mimeType = "") => mimeType.startsWith("image/");
  const isPdfMime = (mimeType = "") => mimeType === "application/pdf";

  const approveUser = async (
    userId,
    remarks = "Automatically approved by AI ID pre-check."
  ) => {
    const token = getAdminToken();

    if (!token) {
      goToLogin();
      return false;
    }

    const res = await fetch(`${API_BASE}/admin-approve-id/${userId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ remarks }),
    });

    const data = await res.json().catch(() => ({}));

    if (res.status === 401 || res.status === 403) {
      goToLogin();
      return false;
    }

    if (!res.ok) {
      throw new Error(data.message || "Failed to approve ID.");
    }

    return true;
  };

  const autoApproveAiVerifiedUsers = async (rows = []) => {
    const candidates = rows.filter((user) => {
      const verification = user?.hotelIdVerificationId || null;
      const status = normalizeLower(user?.idVerificationStatus);

      return (
        verification &&
        verification._id &&
        status !== "verified" &&
        isAiAutoApproved(verification) &&
        !autoApprovingRef.current.has(String(user._id))
      );
    });

    if (!candidates.length) return false;

    let approvedCount = 0;

    for (const user of candidates) {
      const userId = String(user._id);
      const verification = user.hotelIdVerificationId;

      autoApprovingRef.current.add(userId);

      try {
        await approveUser(
          userId,
          `Automatically approved by AI ID pre-check. Score: ${
            verification?.confidenceScore || 0
          }%, Risk: ${formatValue(verification?.aiRiskLevel || "low")}.`
        );

        approvedCount += 1;
      } catch (err) {
        console.error("autoApproveAiVerifiedUsers error:", err);
      }
    }

    if (approvedCount > 0) {
      setPageStatus({
        type: "success",
        message: `${approvedCount} ID verification request${
          approvedCount === 1 ? "" : "s"
        } automatically approved by AI.`,
      });

      return true;
    }

    return false;
  };

  const fetchUsers = async ({ allowAutoApprove = true } = {}) => {
    const token = getAdminToken();

    if (!token) {
      goToLogin();
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/hotel-users`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      const data = await res.json().catch(() => []);

      if (res.status === 401 || res.status === 403) {
        goToLogin();
        return;
      }

      if (!res.ok) {
        throw new Error(data.message || "Failed to fetch users.");
      }

      const safeRows = Array.isArray(data) ? data : [];
      setUsers(safeRows);

      if (allowAutoApprove) {
        const changed = await autoApproveAiVerifiedUsers(safeRows);

        if (changed) {
          await fetchUsers({ allowAutoApprove: false });
          return;
        }
      }
    } catch (err) {
      console.error("fetchUsers error:", err);

      setPageStatus({
        type: "error",
        message: err.message || "Failed to load hotel users.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredUsers = useMemo(() => {
    const q = query.trim().toLowerCase();

    if (!q) return users;

    return users.filter((user) => {
      const fullName = `${user?.firstName || ""} ${
        user?.lastName || ""
      }`.toLowerCase();

      const username = String(user?.username || "").toLowerCase();
      const email = String(user?.email || "").toLowerCase();
      const phone = String(user?.phone || "").toLowerCase();

      return (
        fullName.includes(q) ||
        username.includes(q) ||
        email.includes(q) ||
        phone.includes(q)
      );
    });
  }, [users, query]);

  const fetchVerificationBlob = async (verificationId) => {
    const token = getAdminToken();

    if (!token) {
      goToLogin();
      throw new Error("Missing admin token.");
    }

    const res = await fetch(`${API_BASE}/admin-hotel-id-file/${verificationId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (res.status === 401 || res.status === 403) {
      goToLogin();
      throw new Error("Unauthorized.");
    }

    if (!res.ok) {
      let message = "Failed to load uploaded file.";

      try {
        const data = await res.json();
        message = data.message || message;
      } catch {
        // Ignore JSON parse error
      }

      throw new Error(message);
    }

    const blob = await res.blob();
    const mimeType =
      res.headers.get("Content-Type") ||
      blob.type ||
      "application/octet-stream";

    const url = URL.createObjectURL(blob);
    registerObjectUrl(url);

    return { url, mimeType };
  };

  const handlePreview = async (user) => {
    const verification = user?.hotelIdVerificationId || null;
    const verificationId = verification?._id;

    if (!verificationId) {
      setPageStatus({
        type: "error",
        message: "No uploaded ID found for this user.",
      });
      return;
    }

    setPreviewLoading(true);
    setPageStatus({ type: "", message: "" });

    try {
      const { url, mimeType } = await fetchVerificationBlob(verificationId);

      setPreviewUser(user);
      setPreviewUrl(url);
      setPreviewMimeType(mimeType);
    } catch (err) {
      console.error("handlePreview error:", err);

      setPageStatus({
        type: "error",
        message: err.message || "Failed to preview uploaded ID.",
      });
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleOpenFile = async (user) => {
    const verification = user?.hotelIdVerificationId || null;
    const verificationId = verification?._id;

    if (!verificationId) {
      setPageStatus({
        type: "error",
        message: "No uploaded ID found for this user.",
      });
      return;
    }

    setPageStatus({ type: "", message: "" });

    try {
      const { url } = await fetchVerificationBlob(verificationId);
      window.open(url, "_blank", "noopener,noreferrer");
    } catch (err) {
      console.error("handleOpenFile error:", err);

      setPageStatus({
        type: "error",
        message: err.message || "Failed to open uploaded file.",
      });
    }
  };

  const handleRunAiCheck = async (user) => {
    const verificationId = user?.hotelIdVerificationId?._id;
    const token = getAdminToken();

    if (!verificationId) {
      setPageStatus({
        type: "error",
        message: "No uploaded ID found for this user.",
      });
      return;
    }

    if (!token) {
      goToLogin();
      return;
    }

    setActionLoadingId(`ai-${verificationId}`);
    setPageStatus({ type: "", message: "" });

    try {
      const res = await fetch(
        `${API_BASE}/admin-run-ai-id-check/${verificationId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json().catch(() => ({}));

      if (res.status === 401 || res.status === 403) {
        goToLogin();
        return;
      }

      if (!res.ok) {
        throw new Error(data.message || "Failed to run AI ID check.");
      }

      const verification = data?.verification || {};

      if (isAiAutoApproved(verification)) {
        await approveUser(
          user._id,
          `Automatically approved after AI rerun. Score: ${
            verification?.confidenceScore || 0
          }%, Risk: ${formatValue(verification?.aiRiskLevel || "low")}.`
        );

        setPageStatus({
          type: "success",
          message: "AI approved this ID. User has been verified automatically.",
        });
      } else {
        setPageStatus({
          type:
            verification?.aiConnectionStatus === "connected"
              ? "warning"
              : "error",
          message:
            data.message ||
            "AI ID check finished. Manual review is still required.",
        });
      }

      await fetchUsers({ allowAutoApprove: false });
    } catch (err) {
      console.error("handleRunAiCheck error:", err);

      setPageStatus({
        type: "error",
        message: err.message || "Failed to run AI ID check.",
      });
    } finally {
      setActionLoadingId("");
    }
  };

  const handleApprove = async (user) => {
    const userId = user?._id;

    if (!userId) return;

    setActionLoadingId(String(userId));
    setPageStatus({ type: "", message: "" });

    try {
      await approveUser(userId, "ID approved by admin.");

      setPageStatus({
        type: "success",
        message: "User ID approved successfully.",
      });

      await fetchUsers({ allowAutoApprove: false });
    } catch (err) {
      console.error("handleApprove error:", err);

      setPageStatus({
        type: "error",
        message: err.message || "Failed to approve ID.",
      });
    } finally {
      setActionLoadingId("");
    }
  };

  const openRejectModal = (userId) => {
    setRejectingUserId(String(userId));
    setRejectRemarks("");
  };

  const closeRejectModal = () => {
    setRejectingUserId("");
    setRejectRemarks("");
  };

  const handleReject = async () => {
    const token = getAdminToken();

    if (!rejectingUserId) return;

    if (!token) {
      goToLogin();
      return;
    }

    setActionLoadingId(String(rejectingUserId));
    setPageStatus({ type: "", message: "" });

    try {
      const res = await fetch(`${API_BASE}/admin-reject-id/${rejectingUserId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          remarks: rejectRemarks.trim() || "Uploaded ID was rejected by admin.",
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (res.status === 401 || res.status === 403) {
        goToLogin();
        return;
      }

      if (!res.ok) {
        throw new Error(data.message || "Failed to reject ID.");
      }

      setPageStatus({
        type: "success",
        message: "User ID rejected successfully.",
      });

      closeRejectModal();
      await fetchUsers({ allowAutoApprove: false });
    } catch (err) {
      console.error("handleReject error:", err);

      setPageStatus({
        type: "error",
        message: err.message || "Failed to reject ID.",
      });
    } finally {
      setActionLoadingId("");
    }
  };

  const closePreview = () => {
    setPreviewUser(null);
    setPreviewUrl("");
    setPreviewMimeType("");
  };

  const getStatusChip = (status) => {
    switch (status) {
      case "verified":
        return "bg-emerald-100 text-emerald-700 border border-emerald-200";
      case "pending":
        return "bg-amber-100 text-amber-700 border border-amber-200";
      case "rejected":
        return "bg-rose-100 text-rose-700 border border-rose-200";
      default:
        return "bg-slate-100 text-slate-700 border border-slate-200";
    }
  };

  const getAiChip = (verification) => {
    if (!verification || typeof verification !== "object") {
      return "bg-slate-100 text-slate-700 border border-slate-200";
    }

    if (isAiAutoApproved(verification)) {
      return "bg-emerald-100 text-emerald-700 border border-emerald-200";
    }

    if (isRejectedByAi(verification)) {
      return "bg-rose-100 text-rose-700 border border-rose-200";
    }

    const status = verification.aiConnectionStatus || "not_checked";

    switch (status) {
      case "connected":
        return "bg-amber-100 text-amber-700 border border-amber-200";
      case "missing_key":
        return "bg-amber-100 text-amber-700 border border-amber-200";
      case "error":
        return "bg-rose-100 text-rose-700 border border-rose-200";
      case "not_supported":
        return "bg-slate-100 text-slate-700 border border-slate-200";
      default:
        return "bg-slate-100 text-slate-700 border border-slate-200";
    }
  };

  const getAiLabel = (verification) => {
    if (!verification || typeof verification !== "object") return "No ID";

    if (isAiAutoApproved(verification)) return "AI Approved";
    if (isRejectedByAi(verification)) return "AI Rejected";

    const status = verification.aiConnectionStatus || "not_checked";

    switch (status) {
      case "connected":
        return "Needs Manual Review";
      case "missing_key":
        return "AI Key Missing";
      case "error":
        return "AI Failed";
      case "not_supported":
        return "Not Supported";
      default:
        return "Not Checked";
    }
  };

  const getPageStatusClass = () => getStatusBoxClass(pageStatus.type);

  const counts = useMemo(() => {
    const result = {
      total: users.length,
      pending: 0,
      verified: 0,
      rejected: 0,
      submitted: 0,
      aiApproved: 0,
    };

    users.forEach((user) => {
      const verification = user?.hotelIdVerificationId || null;
      const status = normalizeLower(user?.idVerificationStatus || "not_submitted");

      if (status === "verified") result.verified += 1;
      else if (status === "rejected") result.rejected += 1;
      else if (status === "pending") result.pending += 1;

      if (verification?._id) result.submitted += 1;
      if (isAiAutoApproved(verification)) result.aiApproved += 1;
    });

    return result;
  }, [users]);

  return (
    <HotelAdminShell
      title="Hotel ID Verification"
      subtitle="Review uploaded IDs, preview files, run AI checks, and approve or reject hotel user verification requests."
      activePage="idVerify"
      maxWidth="max-w-7xl"
      actions={
        <button
          type="button"
          onClick={() => fetchUsers()}
          disabled={loading}
          className="h-10 rounded-2xl bg-[#082719] px-5 text-xs font-extrabold text-white shadow-sm hover:opacity-90 disabled:opacity-60"
        >
          {loading ? "REFRESHING..." : "REFRESH"}
        </button>
      }
    >
      {pageStatus.message ? (
        <div
          className={`mb-5 rounded-xl border px-4 py-3 text-sm font-semibold ${getPageStatusClass()}`}
        >
          {pageStatus.message}
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3 xl:grid-cols-6">
        <StatCard label="All Users" value={counts.total} />
        <StatCard label="Submitted IDs" value={counts.submitted} />
        <StatCard label="Pending" value={counts.pending} />
        <StatCard label="Verified" value={counts.verified} />
        <StatCard label="Rejected" value={counts.rejected} />
        <StatCard label="AI Approved" value={counts.aiApproved} />
      </div>

      <div className="relative mt-6 overflow-hidden rounded-[24px] border border-white/80 bg-white/90 p-5 shadow-[0_18px_45px_rgba(8,39,25,0.12)] backdrop-blur-xl md:p-6">
        <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-[#082719] via-[#235F3E] to-[#D7A84D]" />
        <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_auto] md:items-end">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-black/50">
              Search verification records
            </p>
            <label className="mb-2 mt-4 block text-xs font-bold text-black/60">
              Search
            </label>
            <input
              type="text"
              placeholder="Search by name, username, email, or phone"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="h-10 w-full rounded-full border border-black/10 bg-white px-4 text-sm font-semibold text-[#082719] outline-none focus:ring-2 focus:ring-[#082719]/20"
            />
          </div>

          <p className="rounded-full border border-[#082719]/10 bg-white px-4 py-2 text-xs font-extrabold text-[#174A30] shadow-sm">
            {filteredUsers.length} record{filteredUsers.length === 1 ? "" : "s"}
          </p>
        </div>
      </div>

      <div className="mt-6 overflow-hidden rounded-[28px] border border-white/80 bg-white/90 shadow-[0_18px_45px_rgba(8,39,25,0.12)] backdrop-blur-xl">
        <div className="h-1.5 bg-gradient-to-r from-[#082719] via-[#235F3E] to-[#D7A84D]" />

        <div className="flex flex-col gap-2 border-b border-[#082719]/10 bg-[#F8FBF9]/90 px-5 py-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#D7A84D]">
              Verification Queue
            </p>
            <h3 className="mt-1 text-2xl font-black tracking-[-0.04em] text-[#082719]">
              Hotel User ID Requests
            </h3>
          </div>

          <p className="rounded-full border border-[#082719]/10 bg-white px-4 py-2 text-xs font-extrabold text-[#174A30] shadow-sm">
            {filteredUsers.length} request{filteredUsers.length === 1 ? "" : "s"}
          </p>
        </div>

        <div className="overflow-x-auto bg-white/70">
          <table className="w-full min-w-[1320px] border-separate border-spacing-0 text-sm">
            <thead>
              <tr className="bg-[#F6F3EA] text-left">
                <Th>Name</Th>
                <Th>Username</Th>
                <Th>Email</Th>
                <Th>Phone</Th>
                <Th>Email</Th>
                <Th>ID Status</Th>
                <Th>Uploaded ID</Th>
                <Th>AI Check</Th>
                <Th>Remarks</Th>
                <Th className="text-right">Actions</Th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[#082719]/5">
              {loading ? (
                <tr>
                  <td colSpan={10} className="p-8 text-center text-black/50">
                    Loading users...
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={10} className="p-8 text-center text-black/50">
                    <p className="font-bold text-[#082719]">No users found.</p>
                    <p className="mt-1 text-xs">
                      Try clearing the search field or refreshing the records.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => {
                  const verification = user?.hotelIdVerificationId || null;
                  const verificationId = verification?._id || "";
                  const hasFile = Boolean(verificationId);

                  const aiApproved = isAiAutoApproved(verification);
                  const aiRejected = isRejectedByAi(verification);

                  const status = user?.idVerificationStatus || "not_submitted";

                  const fullName =
                    `${user?.firstName || ""} ${user?.lastName || ""}`.trim() ||
                    "—";

                  const isBusy = actionLoadingId === String(user?._id);
                  const aiBusy = actionLoadingId === `ai-${verificationId}`;
                  const autoApproving = autoApprovingRef.current.has(
                    String(user?._id)
                  );

                  return (
                    <tr key={user._id} className="group transition hover:bg-[#F8FBF9]">
                      <Td>
                        <p className="font-extrabold text-[#082719]">{fullName}</p>
                      </Td>

                      <Td>{user?.username || "—"}</Td>

                      <Td>
                        <p className="max-w-[210px] truncate" title={user?.email || ""}>
                          {user?.email || "—"}
                        </p>
                      </Td>

                      <Td>{user?.phone || "—"}</Td>

                      <Td>
                        <span
                          className={`inline-flex rounded-full border px-3 py-1 text-[11px] font-extrabold ${
                            user?.emailVerified || user?.isEmailVerified || user?.verified
                              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                              : "border-amber-200 bg-amber-50 text-amber-700"
                          }`}
                        >
                          {user?.emailVerified || user?.isEmailVerified || user?.verified
                            ? "Verified"
                            : "Not verified"}
                        </span>
                      </Td>

                      <Td>
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-[11px] font-extrabold capitalize ${getStatusChip(
                            status
                          )}`}
                        >
                          {status === "verified"
                            ? "Verified"
                            : status === "pending"
                            ? aiApproved
                              ? "Auto Approving"
                              : "Pending"
                            : status === "rejected"
                            ? "Rejected"
                            : "Not Submitted"}
                        </span>
                      </Td>

                      <Td>
                        {hasFile ? (
                          <div className="flex flex-col gap-2">
                            <button
                              type="button"
                              onClick={() => handlePreview(user)}
                              className="inline-flex h-10 w-[104px] items-center justify-center rounded-full border border-[#D7A84D]/70 bg-white text-xs font-extrabold text-[#082719] shadow-sm transition hover:-translate-y-0.5 hover:bg-[#FFF7DC] hover:shadow-md"
                            >
                              View ID
                            </button>

                            <button
                              type="button"
                              onClick={() => handleOpenFile(user)}
                              className="inline-flex h-10 w-[104px] items-center justify-center rounded-full border border-[#082719]/15 bg-[#F8FBF9] text-xs font-extrabold text-[#174A30] shadow-sm transition hover:-translate-y-0.5 hover:bg-white hover:shadow-md"
                            >
                              Open File
                            </button>

                            <span className="max-w-[150px] truncate text-[11px] font-bold text-black/45" title={verification?.idFile?.originalName || "Uploaded file"}>
                              {verification?.idFile?.originalName || "Uploaded file"}
                            </span>
                          </div>
                        ) : (
                          "—"
                        )}
                      </Td>

                      <Td className="min-w-[280px]">
                        {hasFile ? (
                          <div className="space-y-2">
                            <span
                              className={`inline-flex rounded-full px-3 py-1 text-[11px] font-extrabold ${getAiChip(
                                verification
                              )}`}
                            >
                              {getAiLabel(verification)}
                            </span>

                            <div className="space-y-1 text-xs font-semibold text-black/60">
                              <p>
                                <span className="font-extrabold text-[#082719]">Decision:</span>{" "}
                                <span className="capitalize">
                                  {aiApproved
                                    ? "Approve"
                                    : formatValue(verification?.aiDecision)}
                                </span>
                              </p>

                              <p>
                                <span className="font-extrabold text-[#082719]">Risk:</span>{" "}
                                <span className="capitalize">
                                  {formatValue(verification?.aiRiskLevel)}
                                </span>
                              </p>

                              <p>
                                <span className="font-extrabold text-[#082719]">Score:</span>{" "}
                                {Number.isFinite(Number(verification?.confidenceScore))
                                  ? `${verification.confidenceScore}%`
                                  : "—"}
                              </p>

                              {aiApproved && status !== "verified" ? (
                                <p className="font-extrabold text-emerald-700">
                                  Passed AI auto-approval rules.
                                </p>
                              ) : null}

                              {aiRejected ? (
                                <p className="font-extrabold text-rose-700">
                                  AI marked this ID as unsafe or invalid.
                                </p>
                              ) : null}
                            </div>

                            {verification?.aiSummary ? (
                              <p className="text-xs font-semibold leading-relaxed text-black/50">
                                {verification.aiSummary}
                              </p>
                            ) : null}

                            {verification?.aiError ? (
                              <p className="text-xs font-extrabold text-rose-700">
                                {verification.aiError}
                              </p>
                            ) : null}

                            {status !== "verified" ? (
                              <button
                                type="button"
                                onClick={() => handleRunAiCheck(user)}
                                disabled={aiBusy || !hasFile}
                                className="inline-flex h-10 w-[132px] items-center justify-center rounded-full border border-[#D7A84D] bg-[#D7A84D] text-xs font-extrabold text-[#082719] shadow-sm transition hover:-translate-y-0.5 hover:bg-[#F4D484] hover:shadow-md disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                {aiBusy
                                  ? "Checking..."
                                  : verification?.aiConnectionStatus === "connected"
                                  ? "Rerun AI"
                                  : "Run AI"}
                              </button>
                            ) : null}
                          </div>
                        ) : (
                          "—"
                        )}
                      </Td>

                      <Td className="max-w-[240px]">
                        <p className="line-clamp-4 text-xs font-semibold leading-5 text-black/55">
                          {user?.idVerificationRemarks || "—"}
                        </p>
                      </Td>

                      <Td className="text-right">
                        <div className="flex flex-col items-end justify-center gap-2">
                          {status === "verified" ? (
                            <span className="inline-flex h-10 w-[104px] items-center justify-center rounded-full border border-emerald-200 bg-emerald-50 text-xs font-extrabold text-emerald-700">
                              Verified
                            </span>
                          ) : aiApproved && !aiRejected ? (
                            <span className="inline-flex h-10 w-[104px] items-center justify-center rounded-full border border-emerald-200 bg-emerald-50 text-xs font-extrabold text-emerald-700">
                              {autoApproving ? "Auto..." : "AI Approved"}
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleApprove(user)}
                              disabled={isBusy || !hasFile || aiRejected}
                              className="inline-flex h-10 w-[104px] items-center justify-center rounded-full border border-[#235F3E] bg-[#235F3E] text-xs font-extrabold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-[#174A30] hover:shadow-md disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              {isBusy ? "Saving..." : "Approve"}
                            </button>
                          )}

                          {status !== "verified" ? (
                            <button
                              type="button"
                              onClick={() => openRejectModal(user._id)}
                              disabled={isBusy || !hasFile}
                              className="inline-flex h-10 w-[104px] items-center justify-center rounded-full border border-[#D7A84D] bg-[#D7A84D] text-xs font-extrabold text-[#082719] shadow-sm transition hover:-translate-y-0.5 hover:bg-[#F4D484] hover:shadow-md disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              Reject
                            </button>
                          ) : null}
                        </div>
                      </Td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {rejectingUserId ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-6 backdrop-blur-sm">
          <div className="relative w-full max-w-lg overflow-hidden rounded-[28px] border border-white/80 bg-white p-6 shadow-2xl">
            <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-[#082719] via-[#235F3E] to-[#D7A84D]" />
            <h2 className="text-xl font-black tracking-[-0.04em] text-[#082719]">
              Reject ID Verification
            </h2>

            <p className="mt-2 text-sm font-semibold text-black/55">
              Add a reason for rejection.
            </p>

            <textarea
              value={rejectRemarks}
              onChange={(e) => setRejectRemarks(e.target.value)}
              rows={5}
              placeholder="Enter rejection remarks..."
              className="mt-4 w-full rounded-2xl border border-black/10 bg-[#F8FBF9] px-4 py-3 text-sm font-semibold text-[#082719] outline-none focus:ring-2 focus:ring-[#082719]/20"
            />

            <div className="mt-5 flex justify-end gap-3">
              <button
                type="button"
                onClick={closeRejectModal}
                className="inline-flex h-10 min-w-[104px] items-center justify-center rounded-full border border-[#082719]/15 bg-white px-4 text-xs font-extrabold text-[#082719] shadow-sm transition hover:bg-[#F8FBF9]"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleReject}
                disabled={actionLoadingId === rejectingUserId}
                className="inline-flex h-10 min-w-[128px] items-center justify-center rounded-full border border-[#D7A84D] bg-[#D7A84D] px-4 text-xs font-extrabold text-[#082719] shadow-sm transition hover:bg-[#F4D484] disabled:opacity-50"
              >
                {actionLoadingId === rejectingUserId
                  ? "Rejecting..."
                  : "Confirm Reject"}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {previewUser ? (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 px-4 py-6 backdrop-blur-sm">
          <div className="relative max-h-full w-full max-w-4xl overflow-auto rounded-[28px] border border-white/80 bg-white p-5 shadow-2xl">
            <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-[#082719] via-[#235F3E] to-[#D7A84D]" />
            <div className="mb-4 flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#D7A84D]">
                  Uploaded ID Preview
                </p>
                <h2 className="mt-1 text-xl font-black tracking-[-0.04em] text-[#082719]">
                  {`${previewUser?.firstName || ""} ${
                    previewUser?.lastName || ""
                  }`.trim() || "User"}
                </h2>

                {previewUser?.hotelIdVerificationId ? (
                  <div className="mt-3 flex flex-wrap gap-2 text-xs">
                    <span
                      className={`rounded-full px-3 py-1 font-extrabold ${getAiChip(
                        previewUser.hotelIdVerificationId
                      )}`}
                    >
                      {getAiLabel(previewUser.hotelIdVerificationId)}
                    </span>

                    <span className="rounded-full border border-[#082719]/10 bg-[#F8FBF9] px-3 py-1 font-extrabold text-[#082719]">
                      Decision: {" "}
                      {isAiAutoApproved(previewUser.hotelIdVerificationId)
                        ? "approve"
                        : formatValue(previewUser.hotelIdVerificationId.aiDecision)}
                    </span>

                    <span className="rounded-full border border-[#082719]/10 bg-[#F8FBF9] px-3 py-1 font-extrabold text-[#082719]">
                      Risk: {formatValue(previewUser.hotelIdVerificationId.aiRiskLevel)}
                    </span>
                  </div>
                ) : null}
              </div>

              <button
                type="button"
                onClick={closePreview}
                className="inline-flex h-10 min-w-[96px] items-center justify-center rounded-full border border-[#082719]/15 bg-white px-4 text-xs font-extrabold text-[#082719] shadow-sm transition hover:bg-[#F8FBF9]"
              >
                Close
              </button>
            </div>

            {previewUser?.hotelIdVerificationId?.aiSummary ? (
              <div className="mb-4 rounded-2xl border border-[#082719]/10 bg-[#F8FBF9] p-4 text-sm text-[#082719]">
                <p className="font-extrabold">AI ID Pre-check Summary</p>
                <p className="mt-1 font-semibold leading-relaxed text-black/60">
                  {previewUser.hotelIdVerificationId.aiSummary}
                </p>

                {previewUser.hotelIdVerificationId.aiError ? (
                  <p className="mt-2 text-xs font-extrabold text-rose-700">
                    {previewUser.hotelIdVerificationId.aiError}
                  </p>
                ) : null}
              </div>
            ) : null}

            {previewLoading ? (
              <div className="rounded-2xl bg-[#F8FBF9] p-8 text-center text-sm font-semibold text-black/55">
                Loading preview...
              </div>
            ) : !previewUrl ? (
              <div className="rounded-2xl bg-[#F8FBF9] p-8 text-center text-sm font-semibold text-black/55">
                No uploaded file found.
              </div>
            ) : isImageMime(previewMimeType) ? (
              <img
                src={previewUrl}
                alt="Uploaded ID"
                className="max-h-[75vh] w-full rounded-2xl bg-[#F8FBF9] object-contain"
              />
            ) : isPdfMime(previewMimeType) ? (
              <div className="space-y-4">
                <iframe
                  src={previewUrl}
                  title="Uploaded ID PDF"
                  className="h-[75vh] w-full rounded-2xl border border-black/10 bg-[#F8FBF9]"
                />

                <a
                  href={previewUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-10 items-center justify-center rounded-full border border-[#235F3E] bg-[#235F3E] px-5 text-xs font-extrabold text-white shadow-sm transition hover:bg-[#174A30]"
                >
                  Open file in new tab
                </a>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="rounded-2xl bg-[#F8FBF9] p-8 text-center text-sm font-semibold text-black/55">
                  Preview is not supported for this file type.
                </div>

                <a
                  href={previewUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-10 items-center justify-center rounded-full border border-[#235F3E] bg-[#235F3E] px-5 text-xs font-extrabold text-white shadow-sm transition hover:bg-[#174A30]"
                >
                  Open file in new tab
                </a>
              </div>
            )}
          </div>
        </div>
      ) : null}
    </HotelAdminShell>
  );
}