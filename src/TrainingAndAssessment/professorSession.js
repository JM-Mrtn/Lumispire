function normalizeApiBase(raw) {
  if (!raw) return "http://localhost:5000/api";
  const r = String(raw).replace(/\/+$/, "");
  if (r.endsWith("/api/hotel")) return r.replace(/\/api\/hotel$/i, "/api");
  if (r.endsWith("/api")) return r;
  if (r.includes("/api/")) return r.replace(/\/api\/hotel.*$/i, "/api");
  return `${r}/api`;
}

export const API_BASE = normalizeApiBase(
  import.meta.env.VITE_TRAINING_API_URL || import.meta.env.VITE_API_URL
);

const GET_CACHE_TTL_MS = 1200;
const pendingGetMap = new Map();
const recentGetMap = new Map();

function cloneData(value) {
  if (typeof structuredClone === "function") {
    return structuredClone(value);
  }
  return JSON.parse(JSON.stringify(value));
}

export function getProfessorToken() {
  return localStorage.getItem("professorToken") || "";
}

export function getStoredProfessor() {
  try {
    return JSON.parse(localStorage.getItem("professorUser") || "null");
  } catch {
    return null;
  }
}

export function setStoredProfessor(user) {
  localStorage.setItem("professorUser", JSON.stringify(user || null));
}

export function clearProfessorSession() {
  localStorage.removeItem("professorToken");
  localStorage.removeItem("professorUser");
}

export function professorAuthHeaders(extra = {}) {
  return {
    ...extra,
    Authorization: `Bearer ${getProfessorToken()}`,
  };
}

export function normalizeCourseName(value = "") {
  return String(value || "").trim();
}

export function normalizeCourseAssignments(values = []) {
  return [
    ...new Set(
      (Array.isArray(values) ? values : [])
        .map((item) => normalizeCourseName(item))
        .filter(Boolean)
    ),
  ];
}

export async function readJsonSafe(res) {
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    throw new Error(text?.slice(0, 200) || "Invalid server response.");
  }
}

export async function fetchJson(url, options = {}) {
  const method = String(options?.method || "GET").toUpperCase();
  const authHeader =
    options?.headers?.Authorization ||
    options?.headers?.authorization ||
    "";
  const cacheKey = `${method}::${url}::${authHeader}`;

  if (method === "GET") {
    const pending = pendingGetMap.get(cacheKey);
    if (pending) return pending;

    const cached = recentGetMap.get(cacheKey);
    if (cached && Date.now() - cached.at < GET_CACHE_TTL_MS) {
      return cloneData(cached.data);
    }
  }

  const run = (async () => {
    const res = await fetch(url, options);
    const data = await readJsonSafe(res);

    if (!res.ok) {
      const error = new Error(data?.message || "Request failed.");
      error.status = res.status;
      error.payload = data;
      throw error;
    }

    return data;
  })();

  if (method !== "GET") {
    return run;
  }

  pendingGetMap.set(cacheKey, run);

  try {
    const data = await run;
    recentGetMap.set(cacheKey, {
      at: Date.now(),
      data,
    });
    return cloneData(data);
  } finally {
    pendingGetMap.delete(cacheKey);
  }
}
