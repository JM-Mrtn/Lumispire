const RAW_API_URL = String(
  import.meta.env.VITE_API_URL ||
    import.meta.env.VITE_SERVER_URL ||
    "http://localhost:5000"
).trim();

/*
 * Accept any of these environment values without producing a duplicate /api:
 *   https://example-api.onrender.com
 *   https://example-api.onrender.com/api
 *   https://example-api.onrender.com/api/ltc
 */
function normalizeLtcApiBase(value) {
  let base = String(value || "").trim().replace(/\/+$/, "");

  base = base.replace(/\/api\/ltc$/i, "");
  base = base.replace(/\/api$/i, "");

  return `${base}/api/ltc`;
}

const LTC_API_BASE = normalizeLtcApiBase(RAW_API_URL);
const LTC_ADMIN_TOKEN_KEY = "ltcAdminToken";

function ltcApiUrl(path = "") {
  return `${LTC_API_BASE}/${String(path).replace(/^\/+/, "")}`;
}

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
  const rawBody = await response.text();
  let data = {};

  if (rawBody) {
    try {
      data = JSON.parse(rawBody);
    } catch {
      data = {};
    }
  }

  if (!response.ok || data.success === false) {
    const serverMessage = String(data.message || "").trim();

    if (response.status === 404) {
      throw new Error(
        `${serverMessage || "API route not found."} ` +
          `Requested ${response.url}. Check VITE_API_URL and redeploy the backend with the LTC routes.`
      );
    }

    throw new Error(
      serverMessage || `Request failed with status ${response.status}. Please try again.`
    );
  }

  return data;
}

export async function getPublicLtcContent() {
  const response = await fetch(ltcApiUrl("public-content"));
  return readJson(response);
}

export async function loginLtcAdmin(credentials) {
  const response = await fetch(ltcApiUrl("admin/login"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credentials),
  });

  return readJson(response);
}

export async function getLtcAdminContent() {
  const response = await fetch(ltcApiUrl("admin/content"), {
    headers: {
      Authorization: `Bearer ${getLtcAdminToken()}`,
    },
  });

  return readJson(response);
}

export async function saveLtcAdminContent(content) {
  const response = await fetch(ltcApiUrl("admin/content"), {
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

  const response = await fetch(ltcApiUrl("admin/upload-highlight-image"), {
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