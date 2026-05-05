import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import HotelAdminShell from "./HotelAdminShell";

const HotelAdminIDVerify = () => {
  const navigate = useNavigate();

  const API_BASE = useMemo(() => {
    const raw = (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/+$/, "");
    if (raw.includes("/api/hotel-admin")) return raw;
    return `${raw}/api/hotel-admin`;
  }, []);

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

  const adminToken = localStorage.getItem("adminToken") || localStorage.getItem("hotelAdminToken") || "";

  const registerObjectUrl = (url) => {
    if (url) objectUrlsRef.current.push(url);
  };

  const cleanupObjectUrls = () => {
    objectUrlsRef.current.forEach((url) => {
      try {
        URL.revokeObjectURL(url);
      } catch {
        //
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

  const fetchUsers = async () => {
    if (!adminToken) {
      navigate("/hotel-admin-login");
      return;
    }

    setLoading(true);
    setPageStatus({ type: "", message: "" });

    try {
      const res = await fetch(`${API_BASE}/hotel-users`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      });

      const data = await res.json().catch(() => []);

      if (!res.ok) {
        throw new Error(data.message || "Failed to fetch users.");
      }

      setUsers(Array.isArray(data) ? data : []);
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
  }, []);

  const filteredUsers = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return users;

    return users.filter((user) => {
      const fullName = `${user.firstName || ""} ${user.lastName || ""}`.toLowerCase();
      const username = String(user.username || "").toLowerCase();
      const email = String(user.email || "").toLowerCase();
      const phone = String(user.phone || "").toLowerCase();

      return (
        fullName.includes(q) ||
        username.includes(q) ||
        email.includes(q) ||
        phone.includes(q)
      );
    });
  }, [users, query]);

  const fetchVerificationBlob = async (verificationId) => {
    const res = await fetch(`${API_BASE}/admin-hotel-id-file/${verificationId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${adminToken}`,
      },
    });

    if (!res.ok) {
      let message = "Failed to load uploaded file.";
      try {
        const data = await res.json();
        message = data.message || message;
      } catch {
        //
      }
      throw new Error(message);
    }

    const blob = await res.blob();
    const mimeType = res.headers.get("Content-Type") || blob.type || "application/octet-stream";
    const url = URL.createObjectURL(blob);
    registerObjectUrl(url);

    return { url, mimeType };
  };

  const handlePreview = async (user) => {
    const verification = user?.hotelIdVerificationId;
    const verificationId = verification?._id;

    if (!verificationId) {
      setPageStatus({
        type: "error",
        message: "No uploaded ID found for this user.",
      });
      return;
    }

    if (!adminToken) {
      navigate("/hotel-admin-login");
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
    const verification = user?.hotelIdVerificationId;
    const verificationId = verification?._id;

    if (!verificationId) {
      setPageStatus({
        type: "error",
        message: "No uploaded ID found for this user.",
      });
      return;
    }

    if (!adminToken) {
      navigate("/hotel-admin-login");
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

    if (!verificationId) {
      setPageStatus({
        type: "error",
        message: "No uploaded ID found for this user.",
      });
      return;
    }

    if (!adminToken) {
      navigate("/hotel-admin-login");
      return;
    }

    setActionLoadingId(`ai-${verificationId}`);
    setPageStatus({ type: "", message: "" });

    try {
      const res = await fetch(`${API_BASE}/admin-run-ai-id-check/${verificationId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`,
        },
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.message || "Failed to run AI ID check.");
      }

      setPageStatus({
        type: data.verification?.aiConnectionStatus === "connected" ? "success" : "error",
        message: data.message || "AI ID check finished.",
      });

      await fetchUsers();
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

  const handleApprove = async (userId) => {
    if (!adminToken) {
      navigate("/hotel-admin-login");
      return;
    }

    setActionLoadingId(String(userId));
    setPageStatus({ type: "", message: "" });

    try {
      const res = await fetch(`${API_BASE}/admin-approve-id/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          remarks: "ID approved by admin.",
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.message || "Failed to approve ID.");
      }

      setPageStatus({
        type: "success",
        message: "User ID approved successfully.",
      });

      await fetchUsers();
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
    if (!rejectingUserId) return;

    if (!adminToken) {
      navigate("/hotel-admin-login");
      return;
    }

    setActionLoadingId(String(rejectingUserId));
    setPageStatus({ type: "", message: "" });

    try {
      const res = await fetch(`${API_BASE}/admin-reject-id/${rejectingUserId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          remarks: rejectRemarks.trim() || "Uploaded ID was rejected by admin.",
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.message || "Failed to reject ID.");
      }

      setPageStatus({
        type: "success",
        message: "User ID rejected successfully.",
      });

      closeRejectModal();
      await fetchUsers();
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


  const getAiChip = (status) => {
    switch (status) {
      case "connected":
        return "bg-emerald-100 text-emerald-700 border border-emerald-200";
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

  const getAiLabel = (status) => {
    switch (status) {
      case "connected":
        return "AI Connected";
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

  const formatValue = (value) => String(value || "unknown").replaceAll("_", " ");

  return (
    <HotelAdminShell
      title="Hotel ID Verification"
      subtitle="Review uploaded IDs, preview files, and approve or reject hotel user verification requests."
      activePage="idVerify"
      maxWidth="max-w-7xl"
      actions={
        <button
          type="button"
          onClick={fetchUsers}
          disabled={loading}
          className="h-10 rounded-2xl bg-[#2A4F33] px-5 text-xs font-extrabold text-white shadow-sm hover:opacity-90 disabled:opacity-60"
        >
          {loading ? "REFRESHING..." : "REFRESH"}
        </button>
      }
    >
        {pageStatus.message ? (
          <div
            className={`mb-5 rounded-xl px-4 py-3 text-sm ${
              pageStatus.type === "success"
                ? "border border-emerald-200 bg-emerald-50 text-emerald-700"
                : "border border-rose-200 bg-rose-50 text-rose-700"
            }`}
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
                  <th className="px-4 py-3 text-sm font-semibold">Email Verified</th>
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
                    <td colSpan="10" className="px-4 py-8 text-center text-sm text-[#355E3B]/70">
                      Loading users...
                    </td>
                  </tr>
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan="10" className="px-4 py-8 text-center text-sm text-[#355E3B]/70">
                      No users found.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => {
                    const fullName =
                      `${user.firstName || ""} ${user.lastName || ""}`.trim() || "—";
                    const status = user.idVerificationStatus || "not_submitted";
                    const isBusy = actionLoadingId === String(user._id);

                    const verification = user.hotelIdVerificationId || null;
                    const verificationId = verification?._id;
                    const hasFile = Boolean(verificationId);
                    const aiStatus = verification?.aiConnectionStatus || "not_checked";
                    const aiBusy = actionLoadingId === `ai-${verificationId}`;

                    return (
                      <tr key={user._id} className="border-b border-[#edf0ea] align-top">
                        <td className="px-4 py-4 text-sm text-[#355E3B]">{fullName}</td>
                        <td className="px-4 py-4 text-sm text-[#355E3B]">
                          {user.username || "—"}
                        </td>
                        <td className="px-4 py-4 text-sm text-[#355E3B]">{user.email || "—"}</td>
                        <td className="px-4 py-4 text-sm text-[#355E3B]">{user.phone || "—"}</td>
                        <td className="px-4 py-4 text-sm text-[#355E3B]">
                          {user.emailVerified ? "Yes" : "No"}
                        </td>
                        <td className="px-4 py-4 text-sm">
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getStatusChip(
                              status
                            )}`}
                          >
                            {status === "verified"
                              ? "Verified"
                              : status === "pending"
                              ? "Pending"
                              : status === "rejected"
                              ? "Rejected"
                              : "Not Submitted"}
                          </span>
                        </td>

                        <td className="px-4 py-4 text-sm text-[#355E3B]">
                          {hasFile ? (
                            <div className="flex flex-col gap-2">
                              <button
                                onClick={() => handlePreview(user)}
                                className="rounded-lg bg-[#355E3B] px-3 py-2 text-xs font-semibold text-white hover:opacity-95"
                              >
                                View ID
                              </button>

                              <button
                                onClick={() => handleOpenFile(user)}
                                className="text-left text-xs font-semibold text-[#355E3B] underline"
                              >
                                Open file
                              </button>

                              <span className="text-[11px] text-[#355E3B]/70">
                                {verification?.idFile?.originalName || "Uploaded file"}
                              </span>
                            </div>
                          ) : (
                            "—"
                          )}
                        </td>

                        <td className="min-w-[260px] px-4 py-4 text-sm text-[#355E3B]">
                          {hasFile ? (
                            <div className="space-y-2">
                              <span
                                className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getAiChip(
                                  aiStatus
                                )}`}
                              >
                                {getAiLabel(aiStatus)}
                              </span>

                              <div className="space-y-1 text-xs text-[#355E3B]/80">
                                <p>
                                  <span className="font-bold">Decision:</span>{" "}
                                  <span className="capitalize">{formatValue(verification?.aiDecision)}</span>
                                </p>
                                <p>
                                  <span className="font-bold">Risk:</span>{" "}
                                  <span className="capitalize">{formatValue(verification?.aiRiskLevel)}</span>
                                </p>
                                <p>
                                  <span className="font-bold">Score:</span>{" "}
                                  {Number.isFinite(Number(verification?.confidenceScore))
                                    ? `${verification.confidenceScore}%`
                                    : "—"}
                                </p>
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

                              <button
                                onClick={() => handleRunAiCheck(user)}
                                disabled={aiBusy || !hasFile}
                                className="rounded-lg bg-indigo-600 px-3 py-2 text-xs font-semibold text-white hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                {aiBusy ? "Checking AI..." : aiStatus === "connected" ? "Rerun AI Check" : "Run AI Check"}
                              </button>
                            </div>
                          ) : (
                            "—"
                          )}
                        </td>

                        <td className="max-w-[280px] px-4 py-4 text-sm text-[#355E3B]/80">
                          {user.idVerificationRemarks || "—"}
                        </td>

                        <td className="px-4 py-4">
                          <div className="flex flex-wrap gap-2">
                            <button
                              onClick={() => handleApprove(user._id)}
                              disabled={isBusy || status === "verified" || !hasFile}
                              className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              {isBusy ? "Processing..." : "Approve"}
                            </button>

                            <button
                              onClick={() => openRejectModal(user._id)}
                              disabled={isBusy || !hasFile}
                              className="rounded-lg bg-rose-600 px-3 py-2 text-xs font-semibold text-white hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              Reject
                            </button>
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
                onClick={closeRejectModal}
                className="rounded-xl border border-[#355E3B] px-4 py-2 text-sm font-semibold text-[#355E3B]"
              >
                Cancel
              </button>

              <button
                onClick={handleReject}
                disabled={actionLoadingId === rejectingUserId}
                className="rounded-xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
              >
                {actionLoadingId === rejectingUserId ? "Rejecting..." : "Confirm Reject"}
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
                  {`${previewUser.firstName || ""} ${previewUser.lastName || ""}`.trim() || "User"}
                </p>
                {previewUser?.hotelIdVerificationId ? (
                  <div className="mt-2 flex flex-wrap gap-2 text-xs">
                    <span
                      className={`rounded-full px-3 py-1 font-semibold ${getAiChip(
                        previewUser.hotelIdVerificationId.aiConnectionStatus || "not_checked"
                      )}`}
                    >
                      {getAiLabel(previewUser.hotelIdVerificationId.aiConnectionStatus || "not_checked")}
                    </span>
                    <span className="rounded-full bg-[#f6f6f3] px-3 py-1 font-semibold text-[#355E3B]">
                      Decision: {formatValue(previewUser.hotelIdVerificationId.aiDecision)}
                    </span>
                    <span className="rounded-full bg-[#f6f6f3] px-3 py-1 font-semibold text-[#355E3B]">
                      Risk: {formatValue(previewUser.hotelIdVerificationId.aiRiskLevel)}
                    </span>
                  </div>
                ) : null}
              </div>

              <button
                onClick={closePreview}
                className="rounded-xl border border-[#355E3B] px-4 py-2 text-sm font-semibold text-[#355E3B]"
              >
                Close
              </button>
            </div>

            {previewUser?.hotelIdVerificationId?.aiSummary ? (
              <div className="mb-4 rounded-xl border border-[#d7dbd2] bg-[#f6f6f3] p-4 text-sm text-[#355E3B]">
                <p className="font-extrabold">AI ID Pre-check Summary</p>
                <p className="mt-1 leading-relaxed">{previewUser.hotelIdVerificationId.aiSummary}</p>
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
                className="max-h-[75vh] w-full rounded-xl object-contain bg-[#f6f6f3]"
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
};

export default HotelAdminIDVerify;