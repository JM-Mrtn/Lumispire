function normalizeApiBase(raw) {
  if (!raw) return "http://localhost:5000/api";
  const r = String(raw).replace(/\/+$/, "");
  if (r.endsWith("/api/hotel")) return r.replace(/\/api\/hotel$/i, "/api");
  if (r.endsWith("/api")) return r;
  if (r.includes("/api/")) return r.replace(/\/api\/hotel.*$/i, "/api");
  return `${r}/api`;
}

const API_BASE = normalizeApiBase(
  import.meta.env.VITE_TRAINING_API_URL || import.meta.env.VITE_API_URL
);

export function buildTrainingFileUrl(fileId = "") {
  const cleanId = String(fileId || "").trim();
  if (!cleanId) return "";

  const token =
    localStorage.getItem("professorToken") ||
    localStorage.getItem("trainingToken") ||
    localStorage.getItem("trainingAdminToken") ||
    "";

  const baseUrl = `${API_BASE}/training-files/${cleanId}`;

  if (!token) return baseUrl;

  return `${baseUrl}?token=${encodeURIComponent(token)}`;
}

export default buildTrainingFileUrl;