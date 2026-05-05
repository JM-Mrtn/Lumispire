import nodemailer from "nodemailer";

export function hotelAppBaseUrl() {
  return (process.env.CORS_ORIGIN || "http://localhost:5173").replace(/\/+$/, "");
}

export function hotelApiBaseUrl() {
  const raw = (
    process.env.SERVER_URL ||
    process.env.VITE_SERVER_URL ||
    process.env.API_BASE_URL ||
    process.env.BACKEND_URL ||
    `http://localhost:${process.env.PORT || 5000}`
  ).replace(/\/+$/, "");

  if (raw.endsWith("/api/hotel")) return raw;
  if (raw.endsWith("/api")) return `${raw}/hotel`;

  return `${raw}/api/hotel`;
}

function normalizeText(value = "") {
  return String(value || "").trim();
}

function normalizePass(value = "") {
  return String(value || "").replace(/\s/g, "");
}

function escapeHtml(value = "") {
  return String(value ?? "").replace(/[&<>"']/g, (char) => {
    switch (char) {
      case "&":
        return "&amp;";
      case "<":
        return "&lt;";
      case ">":
        return "&gt;";
      case '"':
        return "&quot;";
      case "'":
        return "&#39;";
      default:
        return char;
    }
  });
}

export function buildHotelTransporter() {
  const user = normalizeText(process.env.EMAIL_USER || "");
  const pass = normalizePass(process.env.EMAIL_PASS || "");
  const port = Number(process.env.SMTP_PORT || 587);

  if (!user || !pass) {
    throw new Error("EMAIL_USER or EMAIL_PASS is missing in .env");
  }

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port,
    secure: port === 465,
    requireTLS: port !== 465,
    auth: {
      user,
      pass,
    },
  });
}

function getHotelFromAddress() {
  const user = normalizeText(process.env.EMAIL_USER || "");
  const fromName = normalizeText(
    process.env.HOTEL_EMAIL_FROM_NAME || "LTC Hotel Services"
  ).replace(/"/g, "");

  return `"${fromName}" <${user}>`;
}

async function sendHotelEmail({ to, subject, html, text }) {
  const transporter = buildHotelTransporter();
  const recipient = normalizeText(to);

  if (!recipient) {
    throw new Error("Recipient email is required.");
  }

  return transporter.sendMail({
    from: getHotelFromAddress(),
    to: recipient,
    subject: normalizeText(subject),
    html,
    text: normalizeText(text),
  });
}

export async function sendHotelVerificationEmail(toEmail, token) {
  const safeToken = encodeURIComponent(String(token || ""));

  /*
    IMPORTANT:
    This link now goes to the BACKEND first.

    Flow:
    Gmail Verify Email button
    -> http://localhost:5000/api/hotel/verify-email/:token?redirect=1
    -> backend verifies the token
    -> backend redirects browser to http://localhost:5173/hotel-login
  */
  const verifyLink = `${hotelApiBaseUrl()}/verify-email/${safeToken}?redirect=1`;

  const html = `
    <div style="font-family:Arial,sans-serif;line-height:1.6;color:#1f2937">
      <h2>Email Verification</h2>
      <p>Click the button below to verify your email:</p>
      <p>
        <a href="${escapeHtml(
          verifyLink
        )}" style="display:inline-block;padding:10px 16px;background:#2A4F33;color:#fff;text-decoration:none;border-radius:8px;">
          Verify Email
        </a>
      </p>
      <p>After verification, you will be redirected to the login page.</p>
      <p>If the button does not work, open this link:</p>
      <p>${escapeHtml(verifyLink)}</p>
    </div>
  `;

  const text = `
Email Verification

Open this link to verify your email:
${verifyLink}

After verification, you will be redirected to the login page.
  `.trim();

  return sendHotelEmail({
    to: toEmail,
    subject: "Verify your email",
    html,
    text,
  });
}

export async function sendHotelResetPasswordEmail(toEmail, rawToken) {
  const safeToken = encodeURIComponent(String(rawToken || ""));
  const resetLink = `${hotelAppBaseUrl()}/hotel-reset-password/${safeToken}`;

  const html = `
    <div style="font-family:Arial,sans-serif;line-height:1.6;color:#1f2937">
      <h2>Password Reset</h2>
      <p>You requested to reset your password.</p>
      <p>Click the button below to set a new password:</p>
      <p>
        <a href="${escapeHtml(
          resetLink
        )}" style="display:inline-block;padding:10px 16px;background:#2A4F33;color:#fff;text-decoration:none;border-radius:8px;">
          Reset Password
        </a>
      </p>
      <p>This link will expire in 1 hour.</p>
      <p>If you did not request this, you can ignore this email.</p>
      <p>Or open this link:</p>
      <p>${escapeHtml(resetLink)}</p>
    </div>
  `;

  const text = `
Password Reset

Open this link to reset your password:
${resetLink}

This link will expire in 1 hour.
  `.trim();

  return sendHotelEmail({
    to: toEmail,
    subject: "Reset your password",
    html,
    text,
  });
}

export async function sendHotelChangePasswordOtpEmail(toEmail, otp) {
  const safeOtp = escapeHtml(String(otp || ""));

  const html = `
    <div style="font-family:Arial,sans-serif;line-height:1.6;color:#1f2937">
      <h2>Password Change OTP</h2>
      <p>Your OTP is:</p>
      <p style="font-size:28px;font-weight:800;letter-spacing:6px;">${safeOtp}</p>
      <p>This OTP will expire in <b>10 minutes</b>.</p>
      <p>If you did not request this, please ignore this email.</p>
    </div>
  `;

  const text = `
Password Change OTP

Your OTP is: ${otp}

This OTP will expire in 10 minutes.
  `.trim();

  return sendHotelEmail({
    to: toEmail,
    subject: "Password Change OTP",
    html,
    text,
  });
}

/*
  Compatibility aliases.
*/
export const appBaseUrl = hotelAppBaseUrl;
export const buildTransporter = buildHotelTransporter;
export const sendVerificationEmail = sendHotelVerificationEmail;
export const sendResetPasswordEmail = sendHotelResetPasswordEmail;
export const sendChangePasswordOtpEmail = sendHotelChangePasswordOtpEmail;

export default {
  hotelAppBaseUrl,
  hotelApiBaseUrl,
  buildHotelTransporter,
  sendHotelVerificationEmail,
  sendHotelResetPasswordEmail,
  sendHotelChangePasswordOtpEmail,

  appBaseUrl,
  buildTransporter,
  sendVerificationEmail,
  sendResetPasswordEmail,
  sendChangePasswordOtpEmail,
};