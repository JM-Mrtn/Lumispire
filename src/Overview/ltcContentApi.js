const API_BASE = String(
  import.meta.env.VITE_API_URL || import.meta.env.VITE_SERVER_URL || "http://localhost:5000"
).replace(/\/+$/, "");

const LTC_ADMIN_TOKEN_KEY = "ltcAdminToken";

export function getLtcAdminToken() {
  return localStorage.getItem(LTC_ADMIN_TOKEN_KEY) || "";
}

export function setLtcAdminToken(token) {
  if (token) localStorage.setItem(LTC_ADMIN_TOKEN_KEY, token);
}

export function clearLtcAdminToken() {
  localStorage.removeItem(LTC_ADMIN_TOKEN_KEY);
}

async function readJson(response) {
  const data = await response.json().catch(() => ({}));

  if (!response.ok || data.success === false) {
    throw new Error(data.message || "Request failed. Please try again.");
  }

  return data;
}

export async function getPublicLtcContent() {
  const response = await fetch(`${API_BASE}/api/ltc/public-content`);
  return readJson(response);
}

export async function loginLtcAdmin(credentials) {
  const response = await fetch(`${API_BASE}/api/ltc/admin/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credentials),
  });

  return readJson(response);
}

export async function getLtcAdminContent() {
  const response = await fetch(`${API_BASE}/api/ltc/admin/content`, {
    headers: {
      Authorization: `Bearer ${getLtcAdminToken()}`,
    },
  });

  return readJson(response);
}

export async function saveLtcAdminContent(content) {
  const response = await fetch(`${API_BASE}/api/ltc/admin/content`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getLtcAdminToken()}`,
    },
    body: JSON.stringify({ content }),
  });

  return readJson(response);
}

export async function uploadLtcHighlightImage(file) {
  if (!file) {
    throw new Error("Please select an image first.");
  }

  const formData = new FormData();
  formData.append("image", file);

  const response = await fetch(`${API_BASE}/api/ltc/admin/upload-highlight-image`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${getLtcAdminToken()}`,
    },
    body: formData,
  });

  return readJson(response);
}

export function normalizeTextAreaLines(value) {
  if (Array.isArray(value)) return value.filter(Boolean).join("\n");
  return String(value || "");
}

export function linesToArray(value) {
  return String(value || "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

export function pickPublicLtcImage(value, fallback = "/placeholder-image.png") {
  const src = String(value || "").trim();

  if (!src) return fallback;
  if (/^(https?:)?\/\//i.test(src) || src.startsWith("data:") || src.startsWith("blob:")) {
    return src;
  }

  return src;
}
