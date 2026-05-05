import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import HotelAdminShell from "./HotelAdminShell";

const AUTO_APPROVE_MIN_SCORE = 90;

function getHotelAdminApiBase() {
  const raw = (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(
    /\/+$/,
    ""
  );

  if (raw.endsWith("/api/hotel-admin")) return raw;
  if (raw.endsWith("/api")) return `${raw}/hotel-admin`;
  if (raw.includes("/api/hotel-admin")) return raw;

  return `${raw}/api/hotel-admin`;
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

  const getPageStatusClass = () => {
    if (pageStatus.type === "success") {
      return "border border-emerald-200 bg-emerald-50 text-emerald-700";
    }

    if (pageStatus.type === "warning") {
      return "border border-amber-200 bg-amber-50 text-amber-700";
    }

    return "border border-rose-200 bg-rose-50 text-rose-700";
  };

  return (
    <HotelAdminShell
      title="Hotel ID Verification"
      subtitle="Review uploaded IDs, preview files, and approve or reject hotel user verification requests."
      activePage="idVerify"
      maxWidth="max-w-7xl"
      actions={
        <button
          type="button"
          onClick={() => fetchUsers()}
          disabled={loading}
          className="h-10 rounded-2xl bg-[#2A4F33] px-5 text-xs font-extrabold text-white shadow-sm hover:opacity-90 disabled:opacity-60"
        >
          {loading ? "REFRESHING..." : "REFRESH"}
        </button>
      }
    >
      {pageStatus.message ? (
        <div
          className={`mb-5 rounded-xl px-4 py-3 text-sm font-semibold ${getPageStatusClass()}`}
        >
          {pageStatus.message}
        </div>
      ) : null}

      <div className="mb-5 rounded-2xl bg-white p-4 shadow-sm">
        <input
          type="text"
          placeholder="Search by name, username, email, or phone"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full rounded-xl border border-[#d7dbd2] px-4 py-3 outline-none focus:border-[#355E3B]"
        />
      </div>

      <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left">
            <thead className="bg-[#355E3B] text-white">
              <tr>
                <th className="px-4 py-3 text-sm font-semibold">Name</th>
                <th className="px-4 py-3 text-sm font-semibold">Username</th>
                <th className="px-4 py-3 text-sm font-semibold">Email</th>
                <th className="px-4 py-3 text-sm font-semibold">Phone</th>
                <th className="px-4 py-3 text-sm font-semibold">
                  Email Verified
                </th>
                <th className="px-4 py-3 text-sm font-semibold">ID Status</th>
                <th className="px-4 py-3 text-sm font-semibold">Uploaded ID</th>
                <th className="px-4 py-3 text-sm font-semibold">AI Check</th>
                <th className="px-4 py-3 text-sm font-semibold">Remarks</th>
                <th className="px-4 py-3 text-sm font-semibold">Actions</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan="10"
                    className="px-4 py-8 text-center text-sm text-[#355E3B]/70"
                  >
                    Loading users...
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td
                    colSpan="10"
                    className="px-4 py-8 text-center text-sm text-[#355E3B]/70"
                  >
                    No users found.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => {
                  const verification = user?.hotelIdVerificationId || null;
                  const verificationId = verification?._id || "";
                  const hasFile = Boolean(verificationId);

                  const aiApproved = isAiAutoApproved(verification);
                  const aiRejected = isRejectedByAi(verification);

                  const status =
                    user?.idVerificationStatus || "not_submitted";

                  const fullName =
                    `${user?.firstName || ""} ${user?.lastName || ""}`.trim() ||
                    "—";

                  const isBusy = actionLoadingId === String(user?._id);
                  const aiBusy = actionLoadingId === `ai-${verificationId}`;
                  const autoApproving = autoApprovingRef.current.has(
                    String(user?._id)
                  );

                  return (
                    <tr
                      key={user._id}
                      className="border-b border-[#edf0ea] align-top"
                    >
                      <td className="px-4 py-4 text-sm text-[#355E3B]">
                        {fullName}
                      </td>

                      <td className="px-4 py-4 text-sm text-[#355E3B]">
                        {user?.username || "—"}
                      </td>

                      <td className="px-4 py-4 text-sm text-[#355E3B]">
                        {user?.email || "—"}
                      </td>

                      <td className="px-4 py-4 text-sm text-[#355E3B]">
                        {user?.phone || "—"}
                      </td>

                      <td className="px-4 py-4 text-sm text-[#355E3B]">
                        {user?.emailVerified ||
                        user?.isEmailVerified ||
                        user?.verified
                          ? "Yes"
                          : "No"}
                      </td>

                      <td className="px-4 py-4 text-sm">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold capitalize ${getStatusChip(
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
                      </td>

                      <td className="px-4 py-4 text-sm text-[#355E3B]">
                        {hasFile ? (
                          <div className="flex flex-col gap-2">
                            <button
                              type="button"
                              onClick={() => handlePreview(user)}
                              className="rounded-lg bg-[#355E3B] px-3 py-2 text-xs font-semibold text-white hover:opacity-95"
                            >
                              View ID
                            </button>

                            <button
                              type="button"
                              onClick={() => handleOpenFile(user)}
                              className="text-left text-xs font-semibold text-[#355E3B] underline"
                            >
                              Open file
                            </button>

                            <span className="text-[11px] text-[#355E3B]/70">
                              {verification?.idFile?.originalName ||
                                "Uploaded file"}
                            </span>
                          </div>
                        ) : (
                          "—"
                        )}
                      </td>

                      <td className="min-w-[280px] px-4 py-4 text-sm text-[#355E3B]">
                        {hasFile ? (
                          <div className="space-y-2">
                            <span
                              className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getAiChip(
                                verification
                              )}`}
                            >
                              {getAiLabel(verification)}
                            </span>

                            <div className="space-y-1 text-xs text-[#355E3B]/80">
                              <p>
                                <span className="font-bold">Decision:</span>{" "}
                                <span className="capitalize">
                                  {aiApproved
                                    ? "Approve"
                                    : formatValue(verification?.aiDecision)}
                                </span>
                              </p>

                              <p>
                                <span className="font-bold">Risk:</span>{" "}
                                <span className="capitalize">
                                  {formatValue(verification?.aiRiskLevel)}
                                </span>
                              </p>

                              <p>
                                <span className="font-bold">Score:</span>{" "}
                                {Number.isFinite(
                                  Number(verification?.confidenceScore)
                                )
                                  ? `${verification.confidenceScore}%`
                                  : "—"}
                              </p>

                              {aiApproved && status !== "verified" ? (
                                <p className="font-bold text-emerald-700">
                                  This ID passed AI auto-approval rules.
                                </p>
                              ) : null}

                              {aiRejected ? (
                                <p className="font-bold text-rose-700">
                                  AI marked this ID as unsafe or invalid.
                                </p>
                              ) : null}
                            </div>

                            {verification?.aiSummary ? (
                              <p className="text-xs leading-relaxed text-[#355E3B]/70">
                                {verification.aiSummary}
                              </p>
                            ) : null}

                            {verification?.aiError ? (
                              <p className="text-xs font-semibold text-rose-700">
                                {verification.aiError}
                              </p>
                            ) : null}

                            {status !== "verified" ? (
                              <button
                                type="button"
                                onClick={() => handleRunAiCheck(user)}
                                disabled={aiBusy || !hasFile}
                                className="rounded-lg bg-indigo-600 px-3 py-2 text-xs font-semibold text-white hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                {aiBusy
                                  ? "Checking AI..."
                                  : verification?.aiConnectionStatus ===
                                    "connected"
                                  ? "Rerun AI Check"
                                  : "Run AI Check"}
                              </button>
                            ) : null}
                          </div>
                        ) : (
                          "—"
                        )}
                      </td>

                      <td className="max-w-[280px] px-4 py-4 text-sm text-[#355E3B]/80">
                        {user?.idVerificationRemarks || "—"}
                      </td>

                      <td className="px-4 py-4">
                        <div className="flex flex-wrap gap-2">
                          {status === "verified" ? (
                            <span className="rounded-lg bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700">
                              Verified
                            </span>
                          ) : aiApproved && !aiRejected ? (
                            <span className="rounded-lg bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700">
                              {autoApproving
                                ? "Auto Approving..."
                                : "AI Approved"}
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleApprove(user)}
                              disabled={isBusy || !hasFile || aiRejected}
                              className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              {isBusy ? "Processing..." : "Approve"}
                            </button>
                          )}

                          {status !== "verified" ? (
                            <button
                              type="button"
                              onClick={() => openRejectModal(user._id)}
                              disabled={isBusy || !hasFile}
                              className="rounded-lg bg-rose-600 px-3 py-2 text-xs font-semibold text-white hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              Reject
                            </button>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {rejectingUserId ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
            <h2 className="font-['Montserrat',sans-serif] text-xl font-extrabold text-[#355E3B]">
              Reject ID Verification
            </h2>

            <p className="mt-2 text-sm text-[#355E3B]/80">
              Add a reason for rejection.
            </p>

            <textarea
              value={rejectRemarks}
              onChange={(e) => setRejectRemarks(e.target.value)}
              rows={5}
              placeholder="Enter rejection remarks..."
              className="mt-4 w-full rounded-xl border border-[#d7dbd2] px-4 py-3 outline-none focus:border-[#355E3B]"
            />

            <div className="mt-5 flex justify-end gap-3">
              <button
                type="button"
                onClick={closeRejectModal}
                className="rounded-xl border border-[#355E3B] px-4 py-2 text-sm font-semibold text-[#355E3B]"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleReject}
                disabled={actionLoadingId === rejectingUserId}
                className="rounded-xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
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
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 px-4 py-6">
          <div className="max-h-full w-full max-w-4xl overflow-auto rounded-2xl bg-white p-5 shadow-2xl">
            <div className="mb-4 flex items-center justify-between gap-4">
              <div>
                <h2 className="font-['Montserrat',sans-serif] text-xl font-extrabold text-[#355E3B]">
                  Uploaded ID Preview
                </h2>

                <p className="text-sm text-[#355E3B]/80">
                  {`${previewUser?.firstName || ""} ${
                    previewUser?.lastName || ""
                  }`.trim() || "User"}
                </p>

                {previewUser?.hotelIdVerificationId ? (
                  <div className="mt-2 flex flex-wrap gap-2 text-xs">
                    <span
                      className={`rounded-full px-3 py-1 font-semibold ${getAiChip(
                        previewUser.hotelIdVerificationId
                      )}`}
                    >
                      {getAiLabel(previewUser.hotelIdVerificationId)}
                    </span>

                    <span className="rounded-full bg-[#f6f6f3] px-3 py-1 font-semibold text-[#355E3B]">
                      Decision:{" "}
                      {isAiAutoApproved(previewUser.hotelIdVerificationId)
                        ? "approve"
                        : formatValue(
                            previewUser.hotelIdVerificationId.aiDecision
                          )}
                    </span>

                    <span className="rounded-full bg-[#f6f6f3] px-3 py-1 font-semibold text-[#355E3B]">
                      Risk:{" "}
                      {formatValue(
                        previewUser.hotelIdVerificationId.aiRiskLevel
                      )}
                    </span>
                  </div>
                ) : null}
              </div>

              <button
                type="button"
                onClick={closePreview}
                className="rounded-xl border border-[#355E3B] px-4 py-2 text-sm font-semibold text-[#355E3B]"
              >
                Close
              </button>
            </div>

            {previewUser?.hotelIdVerificationId?.aiSummary ? (
              <div className="mb-4 rounded-xl border border-[#d7dbd2] bg-[#f6f6f3] p-4 text-sm text-[#355E3B]">
                <p className="font-extrabold">AI ID Pre-check Summary</p>
                <p className="mt-1 leading-relaxed">
                  {previewUser.hotelIdVerificationId.aiSummary}
                </p>

                {previewUser.hotelIdVerificationId.aiError ? (
                  <p className="mt-2 text-xs font-semibold text-rose-700">
                    {previewUser.hotelIdVerificationId.aiError}
                  </p>
                ) : null}
              </div>
            ) : null}

            {previewLoading ? (
              <div className="rounded-xl bg-[#f6f6f3] p-6 text-sm text-[#355E3B]/80">
                Loading preview...
              </div>
            ) : !previewUrl ? (
              <div className="rounded-xl bg-[#f6f6f3] p-6 text-sm text-[#355E3B]/80">
                No uploaded file found.
              </div>
            ) : isImageMime(previewMimeType) ? (
              <img
                src={previewUrl}
                alt="Uploaded ID"
                className="max-h-[75vh] w-full rounded-xl bg-[#f6f6f3] object-contain"
              />
            ) : isPdfMime(previewMimeType) ? (
              <div className="space-y-4">
                <iframe
                  src={previewUrl}
                  title="Uploaded ID PDF"
                  className="h-[75vh] w-full rounded-xl border"
                />

                <a
                  href={previewUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-block rounded-lg bg-[#355E3B] px-4 py-2 text-sm font-semibold text-white"
                >
                  Open file in new tab
                </a>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="rounded-xl bg-[#f6f6f3] p-6 text-sm text-[#355E3B]/80">
                  Preview is not supported for this file type.
                </div>

                <a
                  href={previewUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-block rounded-lg bg-[#355E3B] px-4 py-2 text-sm font-semibold text-white"
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