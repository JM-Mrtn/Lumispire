// src/TrainingAndAssessment/TrainingAdminEnrollments.jsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import TrainingAdminLayout from "./TrainingAdminLayout";

function normalizeApiBase(raw) {
  if (!raw) return "http://localhost:5000/api";

  const r = String(raw).replace(/\/+$/, "");

  if (r.endsWith("/api/hotel")) {
    return r.replace(/\/api\/hotel$/i, "/api");
  }

  if (r.endsWith("/api")) return r;

  if (r.includes("/api/")) {
    return r.replace(/\/api\/hotel.*$/i, "/api");
  }

  return `${r}/api`;
}

const API_BASE = normalizeApiBase(
  import.meta.env.VITE_TRAINING_API_URL || import.meta.env.VITE_API_URL
);

const API_ORIGIN = API_BASE.replace(/\/api$/i, "");
const ROWS_PER_PAGE = 5;

function getAdminToken() {
  return localStorage.getItem("trainingAdminToken") || "";
}

async function readJsonSafe(res) {
  const text = await res.text();

  try {
    return JSON.parse(text);
  } catch {
    throw new Error(text?.slice(0, 200) || "Invalid server response.");
  }
}

async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

function valueOf(obj, keys, fallback = "") {
  for (const key of keys) {
    const value = obj?.[key];

    if (value !== undefined && value !== null && value !== "") {
      return value;
    }
  }

  return fallback;
}

function toArray(value) {
  if (Array.isArray(value)) return value.filter(Boolean);
  if (!value) return [];
  return [value];
}

function normalizeSlashes(value) {
  return String(value || "")
    .trim()
    .replace(/\\/g, "/");
}

function getObjectIdString(value) {
  if (!value) return "";

  if (typeof value === "string") return value;

  if (typeof value === "object") {
    if (value.$oid) return String(value.$oid);

    if (
      typeof value.toString === "function" &&
      value.toString() !== "[object Object]"
    ) {
      return String(value.toString());
    }
  }

  return "";
}

function getFileId(file) {
  if (!file || typeof file !== "object") return "";
  return getObjectIdString(file.fileId || file.id || file._id);
}

function getFilePath(file) {
  if (!file) return "";

  if (typeof file === "string") {
    return normalizeSlashes(file);
  }

  if (typeof file === "object") {
    const fileId = getFileId(file);

    if (fileId) {
      return `/api/training-files/${fileId}`;
    }

    return normalizeSlashes(
      file.filePath ||
        file.path ||
        file.url ||
        file.secure_url ||
        file.location ||
        file.file ||
        ""
    );
  }

  return "";
}

function getFileName(file) {
  if (!file) return "File";

  if (typeof file === "string") {
    const clean = normalizeSlashes(file);
    return clean.split("/").pop()?.split("?")[0] || "File";
  }

  if (typeof file === "object") {
    return (
      file.originalName ||
      file.filename ||
      file.name ||
      getFilePath(file).split("/").pop()?.split("?")[0] ||
      "File"
    );
  }

  return "File";
}

function getFileMime(file) {
  if (!file || typeof file !== "object") return "";
  return String(file.mimetype || file.mimeType || file.type || "").toLowerCase();
}

function isTrainingFileApiUrl(url = "") {
  return /\/api\/training-files\//i.test(String(url || ""));
}

function appendTokenToUrl(url = "") {
  const cleanUrl = String(url || "").trim();

  if (!cleanUrl) return "";

  const token = getAdminToken();

  if (
    !token ||
    !isTrainingFileApiUrl(cleanUrl) ||
    /[?&](token|authToken|access_token)=/i.test(cleanUrl)
  ) {
    return cleanUrl;
  }

  return `${cleanUrl}${cleanUrl.includes("?") ? "&" : "?"}token=${encodeURIComponent(
    token
  )}`;
}

function buildFileUrl(file) {
  const filePath = getFilePath(file);

  if (!filePath) return "";

  if (/^https?:\/\//i.test(filePath)) {
    return appendTokenToUrl(filePath);
  }

  const url = `${API_ORIGIN}${filePath.startsWith("/") ? filePath : `/${filePath}`}`;

  return appendTokenToUrl(url);
}

function buildFetchFileUrl(file) {
  const filePath = getFilePath(file);

  if (!filePath) return "";

  if (/^https?:\/\//i.test(filePath)) {
    return filePath;
  }

  return `${API_ORIGIN}${filePath.startsWith("/") ? filePath : `/${filePath}`}`;
}

function revokePreviewUrl(url = "") {
  if (String(url || "").startsWith("blob:")) {
    URL.revokeObjectURL(url);
  }
}

async function createAuthenticatedPreviewUrl(file) {
  const url = buildFetchFileUrl(file);

  if (!url) return "";

  const token = getAdminToken();

  if (!token || !isTrainingFileApiUrl(url)) {
    return url;
  }

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error(`Unable to load file preview (${res.status}).`);
  }

  const blob = await res.blob();

  return URL.createObjectURL(blob);
}

function isPdfFile(file) {
  const mime = getFileMime(file);
  const fileName = getFileName(file).toLowerCase();
  const filePath = getFilePath(file).toLowerCase();

  return (
    mime === "application/pdf" ||
    /\.pdf(\?|#|$)/i.test(fileName) ||
    /\.pdf(\?|#|$)/i.test(filePath)
  );
}

function isImageFile(file) {
  const mime = getFileMime(file);
  const fileName = getFileName(file).toLowerCase();
  const filePath = getFilePath(file).toLowerCase();

  return (
    mime.startsWith("image/") ||
    /\.(jpg|jpeg|png|webp|gif|bmp|svg)(\?|#|$)/i.test(fileName) ||
    /\.(jpg|jpeg|png|webp|gif|bmp|svg)(\?|#|$)/i.test(filePath)
  );
}

function formatDate(dateValue) {
  if (!dateValue) return "-";

  try {
    return new Date(dateValue).toLocaleString("en-PH", {
      timeZone: "Asia/Manila",
    });
  } catch {
    return dateValue;
  }
}

function formatList(value) {
  if (Array.isArray(value)) return value.length ? value.join(", ") : "-";
  return value || "-";
}

function statusClass(value) {
  const clean = String(value || "").toLowerCase();

  if (clean === "approved") return "bg-[#bdf0a4] text-[#2d5038]";
  if (clean === "rejected") return "bg-red-100 text-red-800";

  return "bg-yellow-100 text-yellow-800";
}

function ModalShell({ open, onClose, title, children, maxWidth = "max-w-6xl" }) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center bg-black/50 px-4 py-6"
      onClick={onClose}
    >
      <div
        className={`max-h-[90vh] w-full ${maxWidth} overflow-hidden rounded-[28px] bg-white text-[#395345] shadow-2xl`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-[#e8ece2] px-6 py-4">
          <h3 className="text-xl font-black">{title}</h3>

          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-[#d7ddd0] px-4 py-2 text-xs font-black uppercase tracking-[0.14em] text-[#395345]"
          >
            Close
          </button>
        </div>

        <div className="max-h-[calc(90vh-80px)] overflow-y-auto p-6">
          {children}
        </div>
      </div>
    </div>
  );
}

export default function TrainingAdminEnrollments() {
  const navigate = useNavigate();

  const [status, setStatus] = useState("pending");
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [actingId, setActingId] = useState("");
  const [msg, setMsg] = useState({ type: "", text: "" });
  const [approvedCreds, setApprovedCreds] = useState({});
  const [selectedRow, setSelectedRow] = useState(null);
  const [fileModal, setFileModal] = useState({
    open: false,
    url: "",
    openUrl: "",
    fileName: "",
    isImage: false,
    isPdf: false,
    previewError: false,
    loading: false,
  });
  const [rejectModal, setRejectModal] = useState({
    open: false,
    id: "",
    remarks: "",
  });
  const [page, setPage] = useState(1);

  function openFilePreview(file) {
    const fileName = getFileName(file);
    const fallbackUrl = buildFileUrl(file);

    setFileModal((prev) => {
      revokePreviewUrl(prev.url);

      return {
        open: true,
        url: "",
        openUrl: fallbackUrl,
        fileName,
        isImage: isImageFile(file),
        isPdf: isPdfFile(file),
        previewError: false,
        loading: true,
      };
    });

    createAuthenticatedPreviewUrl(file)
      .then((nextUrl) => {
        setFileModal((prev) => {
          if (!prev.open || prev.fileName !== fileName) {
            revokePreviewUrl(nextUrl);
            return prev;
          }

          return {
            ...prev,
            url: nextUrl,
            loading: false,
            previewError: false,
          };
        });
      })
      .catch(() => {
        setFileModal((prev) => {
          if (!prev.open || prev.fileName !== fileName) return prev;

          return {
            ...prev,
            url: fallbackUrl,
            loading: false,
            previewError: true,
          };
        });
      });
  }

  function closeFilePreview() {
    setFileModal((prev) => {
      revokePreviewUrl(prev.url);

      return {
        open: false,
        url: "",
        openUrl: "",
        fileName: "",
        isImage: false,
        isPdf: false,
        previewError: false,
        loading: false,
      };
    });
  }

  async function load() {
    setMsg({ type: "", text: "" });

    const token = getAdminToken();

    if (!token) {
      setItems([]);
      setMsg({
        type: "error",
        text: "Unauthorized: Please login as ADMIN first. No admin token found.",
      });
      navigate("/training-admin-login", { replace: true });
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(
        `${API_BASE}/admin/enrollments?status=${encodeURIComponent(status)}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await readJsonSafe(res);

      if (!res.ok) {
        throw new Error(data?.message || `Request failed (${res.status})`);
      }

      const enrollments = Array.isArray(data?.enrollments)
        ? data.enrollments
        : Array.isArray(data)
        ? data
        : [];

      setItems(enrollments);
    } catch (err) {
      setItems([]);
      setMsg({
        type: "error",
        text: err.message || "Failed to load enrollments.",
      });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  async function approve(id) {
    setMsg({ type: "", text: "" });

    const token = getAdminToken();

    if (!token) {
      setMsg({
        type: "error",
        text: "Unauthorized: Please login as ADMIN first.",
      });
      return;
    }

    try {
      setActingId(id);

      const res = await fetch(`${API_BASE}/admin/enrollments/${id}/approve`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await readJsonSafe(res);

      if (!res.ok) {
        throw new Error(data?.message || `Approve failed (${res.status})`);
      }

      const traineeEmail =
        data?.traineeEmail ||
        data?.generatedTraineeEmail ||
        data?.enrollment?.generatedTraineeEmail ||
        "";

      const tempPassword =
        data?.tempPassword || data?.plainPassword || data?.temporaryPassword || "";

      if (traineeEmail || tempPassword) {
        setApprovedCreds((prev) => ({
          ...prev,
          [id]: {
            traineeEmail,
            tempPassword,
          },
        }));
      }

      setMsg({
        type: "success",
        text: tempPassword
          ? `Approved successfully. Trainee Email: ${traineeEmail} | Temp Password: ${tempPassword}`
          : "Enrollment approved successfully.",
      });

      setSelectedRow(null);
      await load();
    } catch (err) {
      setMsg({
        type: "error",
        text: err.message || "Approve failed.",
      });
    } finally {
      setActingId("");
    }
  }

  async function reject() {
    setMsg({ type: "", text: "" });

    const token = getAdminToken();

    if (!token) {
      setMsg({
        type: "error",
        text: "Unauthorized: Please login as ADMIN first.",
      });
      return;
    }

    try {
      setActingId(rejectModal.id);

      const res = await fetch(
        `${API_BASE}/admin/enrollments/${rejectModal.id}/reject`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            remarks: rejectModal.remarks?.trim() || "",
          }),
        }
      );

      const data = await readJsonSafe(res);

      if (!res.ok) {
        throw new Error(data?.message || `Reject failed (${res.status})`);
      }

      setMsg({
        type: "success",
        text: "Enrollment rejected successfully.",
      });

      setRejectModal({
        open: false,
        id: "",
        remarks: "",
      });

      setSelectedRow(null);
      await load();
    } catch (err) {
      setMsg({
        type: "error",
        text: err.message || "Reject failed.",
      });
    } finally {
      setActingId("");
    }
  }

  const rows = useMemo(() => {
    return items.map((it) => {
      const id = it._id;
      const lastName = valueOf(it, ["lastName"]);
      const firstName = valueOf(it, ["firstName"]);
      const middleName = valueOf(it, ["middleName"]);

      const fullName =
        `${lastName}${lastName ? ", " : ""}${firstName}${
          middleName ? ` ${middleName}` : ""
        }`.trim();

      const traineeEmail = valueOf(it, [
        "generatedTraineeEmail",
        "traineeEmail",
      ]);

      const creds = approvedCreds[id] || {};

      return {
        raw: it,
        id,
        fullName: fullName || "-",
        personalEmail: valueOf(it, ["email"]),
        phoneNumber: valueOf(it, ["phoneNumber", "phone"]),
        course: valueOf(it, ["course"]),
        gender: valueOf(it, ["gender"]),
        status: valueOf(it, ["status"]),
        birthDate: valueOf(it, ["birthDate"]),
        age: valueOf(it, ["age"]),
        completeAddress: valueOf(it, ["completeAddress"]),
        educationAttainment: toArray(valueOf(it, ["educationAttainment"], [])),
        otherEducationText: valueOf(it, ["otherEducationText"]),
        employmentStatus: toArray(valueOf(it, ["employmentStatus"], [])),
        createdAt: it.createdAt,
        approvalStatus: valueOf(it, ["approvalStatus"], status),
        remarks: valueOf(it, ["remarks"], ""),
        applicationForm: valueOf(it, ["applicationForm"]),
        birthCertificate: valueOf(it, ["birthCertificate"]),
        form137138: valueOf(it, ["form137138"]),
        diplomaTor: valueOf(it, ["diplomaTor"]),
        picture2x2: valueOf(it, ["picture2x2"]),
        marriageContract: valueOf(it, ["marriageContract"]),
        traineeEmail: creds.traineeEmail || traineeEmail || "",
        tempPassword: creds.tempPassword || "",
      };
    });
  }, [items, approvedCreds, status]);

  const filteredRows = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) return rows;

    return rows.filter((row) =>
      [
        row.fullName,
        row.personalEmail,
        row.phoneNumber,
        row.course,
        row.approvalStatus,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(keyword)
    );
  }, [rows, search]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredRows.length / ROWS_PER_PAGE)
  );

  const paginatedRows = useMemo(() => {
    const start = (page - 1) * ROWS_PER_PAGE;
    return filteredRows.slice(start, start + ROWS_PER_PAGE);
  }, [filteredRows, page]);

  useEffect(() => {
    setPage(1);
  }, [status, search]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  return (
    <TrainingAdminLayout
      active="enrollments"
      title="Manage Enrollments"
      subtitle="Review submitted trainee details and uploaded documents before approving or rejecting applications."
    >
      {msg.text ? (
        <div
          className={`mb-5 rounded-xl px-4 py-3 text-sm font-bold ring-1 ${
            msg.type === "success"
              ? "bg-green-50 text-green-800 ring-green-200"
              : "bg-red-50 text-red-800 ring-red-200"
          }`}
        >
          {msg.text}
        </div>
      ) : null}

      <div className="mb-7 rounded-lg bg-[#2d5038] px-5 py-4 shadow-sm">
        <div className="grid gap-5 lg:grid-cols-[1fr_auto_auto_auto_auto] lg:items-end">
          <div>
            <label className="text-base font-black uppercase text-white">
              Search
            </label>

            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="mt-1 h-8 w-full rounded-lg border-0 bg-white px-4 text-sm font-bold text-[#2d5038] outline-none"
              placeholder="Search applicant"
            />
          </div>

          {["pending", "approved", "rejected"].map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setStatus(item)}
              className={`h-8 rounded-md px-8 text-xs font-black transition ${
                status === item
                  ? "bg-[#d8e0da] text-[#1e3e2a]"
                  : "bg-white text-[#2d5038] hover:bg-[#eef1e7]"
              }`}
            >
              {item}
            </button>
          ))}

          <button
            type="button"
            onClick={load}
            disabled={loading}
            className="h-8 rounded-md bg-white px-8 text-xs font-black text-[#2d5038] transition hover:bg-[#eef1e7] disabled:opacity-60"
          >
            {loading ? "Loading..." : "Refresh"}
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg bg-[#2d5038] shadow-sm">
        <div className="bg-white px-4 py-4">
          <h3 className="text-lg font-black text-[#2d5038]">
            Enrollment Requests
          </h3>
        </div>

        <div className="min-h-[372px] divide-y divide-white/25">
          {loading ? (
            [1, 2].map((item) => (
              <div
                key={item}
                className="grid gap-4 px-3 py-4 md:grid-cols-[64px_1.3fr_1fr_1.2fr_.8fr_100px_170px] md:items-center"
              >
                <div className="h-11 w-11 rounded-full bg-white" />
                <div className="h-4 rounded-full bg-white/35" />
                <div className="h-4 rounded-full bg-white/35" />
                <div className="h-4 rounded-full bg-white/35" />
                <div className="h-4 rounded-full bg-white/35" />
                <div className="h-5 rounded-full bg-[#bdf0a4]" />
                <div className="h-5 rounded-full bg-white" />
              </div>
            ))
          ) : paginatedRows.length ? (
            paginatedRows.map((row) => (
              <div
                key={row.id}
                className="grid gap-4 px-3 py-4 text-sm font-black md:grid-cols-[64px_1.3fr_1fr_1.2fr_.8fr_100px_170px] md:items-center"
              >
                <div className="h-11 w-11 rounded-full bg-white" />

                <div className="text-white">
                  <div>{row.fullName}</div>
                  <div className="text-xs text-white/70">
                    {row.gender || "-"} • {row.status || "-"}
                  </div>
                </div>

                <div className="text-white/90">{row.course || "Course"}</div>

                <div className="break-words text-white/90">
                  {row.personalEmail || "-"}
                </div>

                <div className="text-white/90">{formatDate(row.createdAt)}</div>

                <div>
                  <span
                    className={`inline-flex min-w-[84px] justify-center rounded-full px-3 py-1 text-[10px] font-black ${statusClass(
                      row.approvalStatus
                    )}`}
                  >
                    {row.approvalStatus || "Pending"}
                  </span>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedRow(row)}
                    className="rounded-full bg-white px-3 py-1 text-[10px] font-black text-[#2d5038]"
                  >
                    View
                  </button>

                  {status === "pending" ? (
                    <button
                      type="button"
                      onClick={() => approve(row.id)}
                      disabled={actingId === row.id}
                      className="rounded-full bg-[#bdf0a4] px-3 py-1 text-[10px] font-black text-[#2d5038] disabled:opacity-60"
                    >
                      Approve
                    </button>
                  ) : null}

                  {status === "pending" ? (
                    <button
                      type="button"
                      onClick={() =>
                        setRejectModal({
                          open: true,
                          id: row.id,
                          remarks: "",
                        })
                      }
                      disabled={actingId === row.id}
                      className="rounded-full bg-red-100 px-3 py-1 text-[10px] font-black text-red-800 disabled:opacity-60"
                    >
                      Reject
                    </button>
                  ) : null}
                </div>
              </div>
            ))
          ) : (
            <div className="px-5 py-12 text-center text-sm font-bold text-white/80">
              No records.
            </div>
          )}
        </div>
      </div>

      <div className="mt-5 flex items-center justify-between px-2 text-base font-bold">
        <div>
          Page {page} / {totalPages}
        </div>

        <div className="flex items-center gap-5">
          <button
            type="button"
            onClick={() => setPage((prev) => Math.max(1, prev - 1))}
            disabled={page <= 1}
            className="text-3xl leading-none text-white disabled:opacity-30"
          >
            ‹
          </button>

          <button
            type="button"
            onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
            disabled={page >= totalPages}
            className="font-black text-white disabled:opacity-30"
          >
            Next Page
          </button>

          <button
            type="button"
            onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
            disabled={page >= totalPages}
            className="text-3xl leading-none text-white disabled:opacity-30"
          >
            ›
          </button>
        </div>
      </div>

      <ModalShell
        open={Boolean(selectedRow)}
        onClose={() => setSelectedRow(null)}
        title="Enrollment Details"
        maxWidth="max-w-6xl"
      >
        {selectedRow ? (
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-2xl bg-[#f7f8f3] p-5 ring-1 ring-[#e2e8da]">
              <h3 className="text-base font-black text-[#395345]">
                Applicant Information
              </h3>

              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <InfoItem label="Full Name" value={selectedRow.fullName} />
                <InfoItem label="Course" value={selectedRow.course} />
                <InfoItem
                  label="Personal Email"
                  value={selectedRow.personalEmail}
                />
                <InfoItem label="Phone" value={selectedRow.phoneNumber} />
                <InfoItem label="Birthdate" value={selectedRow.birthDate} />
                <InfoItem label="Age" value={selectedRow.age} />
                <InfoItem label="Gender" value={selectedRow.gender} />
                <InfoItem label="Status" value={selectedRow.status} />
                <InfoItem
                  label="Complete Address"
                  value={selectedRow.completeAddress}
                />
                <InfoItem
                  label="Educational Attainment"
                  value={
                    selectedRow.otherEducationText
                      ? `${formatList(selectedRow.educationAttainment)}${
                          selectedRow.educationAttainment.includes("Others")
                            ? ` (${selectedRow.otherEducationText})`
                            : ""
                        }`
                      : formatList(selectedRow.educationAttainment)
                  }
                />
                <InfoItem
                  label="Employment Status"
                  value={formatList(selectedRow.employmentStatus)}
                />
                <InfoItem
                  label="Requested At"
                  value={formatDate(selectedRow.createdAt)}
                />
                <InfoItem
                  label="Approval Status"
                  value={selectedRow.approvalStatus || "-"}
                />
              </div>

              {selectedRow.traineeEmail ||
              selectedRow.tempPassword ||
              selectedRow.remarks ? (
                <div className="mt-5 rounded-xl bg-white p-4 ring-1 ring-[#e2e8da]">
                  <p className="text-sm font-black text-[#395345]">
                    Admin / Generated Account Info
                  </p>

                  <div className="mt-3 space-y-3">
                    {selectedRow.traineeEmail ? (
                      <CopyRow
                        label="Generated Trainee Email"
                        value={selectedRow.traineeEmail}
                        onCopied={(ok) =>
                          setMsg({
                            type: ok ? "success" : "error",
                            text: ok ? "Copied trainee email." : "Copy failed.",
                          })
                        }
                      />
                    ) : null}

                    {selectedRow.tempPassword ? (
                      <CopyRow
                        label="Temporary Password"
                        value={selectedRow.tempPassword}
                        monospace
                        onCopied={(ok) =>
                          setMsg({
                            type: ok ? "success" : "error",
                            text: ok ? "Copied temp password." : "Copy failed.",
                          })
                        }
                      />
                    ) : null}

                    {selectedRow.remarks ? (
                      <InfoItem label="Remarks" value={selectedRow.remarks} />
                    ) : null}
                  </div>
                </div>
              ) : null}

              {selectedRow.approvalStatus === "pending" ? (
                <div className="mt-5 flex flex-wrap gap-2">
                  <button
                    onClick={() => approve(selectedRow.id)}
                    disabled={actingId === selectedRow.id}
                    className="rounded-xl bg-[#395345] px-4 py-2 text-sm font-black text-white disabled:opacity-60"
                    type="button"
                  >
                    {actingId === selectedRow.id ? "Processing..." : "Approve"}
                  </button>

                  <button
                    onClick={() =>
                      setRejectModal({
                        open: true,
                        id: selectedRow.id,
                        remarks: "",
                      })
                    }
                    disabled={actingId === selectedRow.id}
                    className="rounded-xl bg-red-600 px-4 py-2 text-sm font-black text-white disabled:opacity-60"
                    type="button"
                  >
                    Reject
                  </button>
                </div>
              ) : null}
            </div>

            <div className="rounded-2xl bg-[#f7f8f3] p-5 ring-1 ring-[#e2e8da]">
              <h3 className="text-base font-black text-[#395345]">
                Uploaded Documents
              </h3>

              <div className="mt-4 space-y-5">
                <DocumentGroup
                  title="Birth Certificate"
                  files={toArray(selectedRow.birthCertificate)}
                  onPreview={openFilePreview}
                />
                <DocumentGroup
                  title="Form 137/138"
                  files={toArray(selectedRow.form137138)}
                  onPreview={openFilePreview}
                />
                <DocumentGroup
                  title="Diploma/TOR"
                  files={toArray(selectedRow.diplomaTor)}
                  onPreview={openFilePreview}
                />
                <DocumentGroup
                  title="2X2 Picture with Name"
                  files={toArray(selectedRow.picture2x2)}
                  onPreview={openFilePreview}
                />
                <DocumentGroup
                  title="Marriage Contract"
                  files={toArray(selectedRow.marriageContract)}
                  onPreview={openFilePreview}
                />
                <DocumentGroup
                  title="Application Form"
                  files={toArray(selectedRow.applicationForm)}
                  onPreview={openFilePreview}
                />
              </div>
            </div>
          </div>
        ) : null}
      </ModalShell>

      <ModalShell
        open={fileModal.open}
        onClose={closeFilePreview}
        title="File Preview"
        maxWidth="max-w-5xl"
      >
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <p className="break-all text-sm font-semibold text-[#647166]">
            {fileModal.fileName}
          </p>

          {fileModal.openUrl ? (
            <a
              href={fileModal.openUrl}
              target="_blank"
              rel="noreferrer"
              className="rounded-xl bg-[#395345] px-4 py-2 text-sm font-black text-white"
            >
              Open
            </a>
          ) : null}
        </div>

        <div className="min-h-[60vh] rounded-2xl bg-[#f7f8f3] p-4 ring-1 ring-[#e2e8da]">
          {fileModal.loading ? (
            <div className="flex min-h-[60vh] items-center justify-center px-6 text-center text-sm font-bold text-[#647166]">
              Loading document preview...
            </div>
          ) : fileModal.isImage && fileModal.url && !fileModal.previewError ? (
            <div className="flex min-h-[60vh] items-center justify-center">
              <img
                src={fileModal.url}
                alt={fileModal.fileName}
                className="max-h-[70vh] max-w-full rounded-xl object-contain"
                onError={() =>
                  setFileModal((prev) => ({
                    ...prev,
                    previewError: true,
                  }))
                }
              />
            </div>
          ) : fileModal.isPdf && fileModal.url && !fileModal.previewError ? (
            <iframe
              src={fileModal.url}
              title={fileModal.fileName}
              className="h-[70vh] w-full rounded-xl border border-[#d7ddd0]"
              onError={() =>
                setFileModal((prev) => ({
                  ...prev,
                  previewError: true,
                }))
              }
            />
          ) : (
            <div className="flex min-h-[60vh] items-center justify-center px-6 text-center text-sm text-[#647166]">
              Preview is not available for this file type, the file could not be
              loaded, or the stored file ID no longer exists in GridFS. Use the
              Open button above or ask the applicant to re-upload the document.
            </div>
          )}
        </div>
      </ModalShell>

      <ModalShell
        open={rejectModal.open}
        onClose={() =>
          setRejectModal({
            open: false,
            id: "",
            remarks: "",
          })
        }
        title="Reject Enrollment"
        maxWidth="max-w-md"
      >
        <p className="text-sm text-[#647166]">
          Add remarks for the rejection.
        </p>

        <textarea
          value={rejectModal.remarks}
          onChange={(e) =>
            setRejectModal((prev) => ({
              ...prev,
              remarks: e.target.value,
            }))
          }
          rows={5}
          placeholder="Enter remarks..."
          className="mt-4 w-full rounded-xl border border-[#c6ccb9] px-4 py-3 text-sm outline-none focus:border-[#395345]"
        />

        <div className="mt-5 flex justify-end gap-2">
          <button
            onClick={() =>
              setRejectModal({
                open: false,
                id: "",
                remarks: "",
              })
            }
            className="rounded-xl border border-[#c6ccb9] bg-white px-4 py-2 text-sm font-black text-[#395345]"
            type="button"
          >
            Cancel
          </button>

          <button
            onClick={reject}
            disabled={actingId === rejectModal.id}
            className="rounded-xl bg-red-600 px-4 py-2 text-sm font-black text-white disabled:opacity-60"
            type="button"
          >
            {actingId === rejectModal.id ? "Rejecting..." : "Confirm Reject"}
          </button>
        </div>
      </ModalShell>
    </TrainingAdminLayout>
  );
}

function InfoItem({ label, value }) {
  return (
    <div className="rounded-xl bg-white px-4 py-3 ring-1 ring-[#e2e8da]">
      <div className="text-[11px] font-black uppercase tracking-wide text-[#6f7c71]">
        {label}
      </div>

      <div className="mt-1 break-words text-sm text-[#395345]">
        {value || "-"}
      </div>
    </div>
  );
}

function CopyRow({ label, value, monospace = false, onCopied }) {
  return (
    <div>
      <div className="text-[11px] font-black uppercase tracking-wide text-[#6f7c71]">
        {label}
      </div>

      <div className="mt-1 flex flex-wrap items-center gap-2">
        <span
          className={[
            "break-all text-sm text-[#395345]",
            monospace ? "font-mono" : "",
          ].join(" ")}
        >
          {value}
        </span>

        <button
          onClick={async () => {
            const ok = await copyToClipboard(value);
            onCopied?.(ok);
          }}
          className="rounded-full bg-white px-3 py-1 text-xs font-black text-[#2f6a3f] ring-1 ring-[#e2e8da] hover:bg-[#f7f8f3]"
          type="button"
        >
          Copy
        </button>
      </div>
    </div>
  );
}

function DocumentGroup({ title, files, onPreview }) {
  const normalizedFiles = toArray(files).filter(Boolean);

  return (
    <div>
      <h4 className="text-sm font-black text-[#395345]">{title}</h4>

      {normalizedFiles.length === 0 ? (
        <div className="mt-2 rounded-xl bg-white px-4 py-3 text-sm text-[#647166] ring-1 ring-[#e2e8da]">
          No file uploaded.
        </div>
      ) : (
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {normalizedFiles.map((file, idx) => (
            <DocumentPreview
              key={`${getFileName(file)}-${getFilePath(file)}-${idx}`}
              file={file}
              onPreview={onPreview}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function DocumentPreview({ file, onPreview }) {
  const [imgFailed, setImgFailed] = useState(false);
  const [previewUrl, setPreviewUrl] = useState("");
  const [previewLoading, setPreviewLoading] = useState(false);

  const directUrl = buildFileUrl(file);
  const image = isImageFile(file);
  const pdf = isPdfFile(file);
  const fileName = getFileName(file);

  useEffect(() => {
    let cancelled = false;
    let objectUrl = "";

    setImgFailed(false);

    if (!directUrl) {
      setPreviewUrl("");
      return undefined;
    }

    if (!image) {
      setPreviewUrl(directUrl);
      return undefined;
    }

    setPreviewLoading(true);

    createAuthenticatedPreviewUrl(file)
      .then((nextUrl) => {
        if (String(nextUrl || "").startsWith("blob:")) {
          objectUrl = nextUrl;
        }

        if (cancelled) {
          revokePreviewUrl(nextUrl);
          return;
        }

        setPreviewUrl(nextUrl || directUrl);
      })
      .catch(() => {
        if (!cancelled) {
          setPreviewUrl(directUrl);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setPreviewLoading(false);
        }
      });

    return () => {
      cancelled = true;
      revokePreviewUrl(objectUrl);
    };
  }, [directUrl, image, fileName, file]);

  const openUrl = directUrl;
  const thumbnailUrl = previewUrl || directUrl;

  return (
    <div className="overflow-hidden rounded-xl border border-[#e2e8da] bg-white">
      <button
        type="button"
        onClick={() => onPreview?.(file)}
        className="flex min-h-[160px] w-full items-center justify-center bg-white"
      >
        {previewLoading ? (
          <div className="px-4 py-6 text-center text-xs font-bold text-[#647166]">
            Loading preview...
          </div>
        ) : image && thumbnailUrl && !imgFailed ? (
          <img
            src={thumbnailUrl}
            alt={fileName}
            className="h-[160px] w-full object-contain"
            onError={() => setImgFailed(true)}
          />
        ) : pdf ? (
          <div className="flex flex-col items-center justify-center px-4 py-6 text-center">
            <div className="rounded-full bg-red-100 px-3 py-1 text-xs font-black text-red-700">
              PDF
            </div>

            <p className="mt-3 break-all text-xs text-[#647166]">{fileName}</p>
          </div>
        ) : (
          <div className="break-all px-4 py-6 text-center text-xs text-[#647166]">
            {fileName}
          </div>
        )}
      </button>

      <div className="border-t border-[#e2e8da] bg-[#f7f8f3] px-3 py-3">
        <p className="line-clamp-2 break-all text-xs text-[#647166]">
          {fileName}
        </p>

        <div className="mt-2 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => onPreview?.(file)}
            className="rounded-full bg-[#395345] px-3 py-1.5 text-xs font-black text-white"
          >
            Preview
          </button>

          {openUrl ? (
            <a
              href={openUrl}
              target="_blank"
              rel="noreferrer"
              className="rounded-full bg-white px-3 py-1.5 text-xs font-black text-[#395345] ring-1 ring-[#e2e8da]"
            >
              Open
            </a>
          ) : null}
        </div>
      </div>
    </div>
  );
}