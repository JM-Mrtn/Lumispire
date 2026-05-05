export function normalizeApiBase(raw) {
  const clean = String(raw || "http://localhost:5000").replace(/\/+$/, "");

  if (clean.endsWith("/api")) return clean;

  if (clean.includes("/api/")) {
    return clean.replace(/\/api\/.*$/i, "/api");
  }

  return `${clean}/api`;
}

export const API_BASE = normalizeApiBase(import.meta.env.VITE_API_URL);

export function manpowerUrl(path = "") {
  const cleanPath = String(path || "").replace(/^\/+/, "");
  return `${API_BASE}/${cleanPath}`;
}

export function getManpowerHrToken() {
  return localStorage.getItem("manpowerHrToken") || "";
}

export function getManpowerAdminToken() {
  return localStorage.getItem("manpowerAdminToken") || "";
}

export function getManpowerEmployeeToken() {
  return localStorage.getItem("manpowerEmployeeToken") || "";
}

export function manpowerJsonHeaders(extra = {}) {
  return {
    "Content-Type": "application/json",
    ...extra,
  };
}

export function manpowerHrHeaders(extra = {}) {
  const token = getManpowerHrToken();

  return {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...extra,
  };
}

export function manpowerAdminHeaders(extra = {}) {
  const token = getManpowerAdminToken();

  return {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...extra,
  };
}

export function manpowerEmployeeHeaders(extra = {}) {
  const token = getManpowerEmployeeToken();

  return {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...extra,
  };
}