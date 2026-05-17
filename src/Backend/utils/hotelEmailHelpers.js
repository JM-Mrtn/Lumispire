import { Resend } from "resend";

export function hotelAppBaseUrl() {
  return (
    process.env.HOTEL_FRONTEND_URL ||
    process.env.FRONTEND_URL ||
    process.env.CORS_ORIGIN ||
    "http://localhost:5173"
  ).replace(/\/+$/, "");
}

export function hotelApiBaseUrl() {
  const raw = (
    process.env.HOTEL_API_URL ||
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

function getResendClient() {
  const apiKey = normalizeText(process.env.RESEND_API_KEY || "");

  if (!apiKey) {
    throw new Error("RESEND_API_KEY is missing in environment variables.");
  }

  return new Resend(apiKey);
}

function getHotelFromAddress() {
  return normalizeText(
    process.env.RESEND_FROM_EMAIL ||
      process.env.HOTEL_EMAIL_FROM ||
      "Lumispire <onboarding@resend.dev>"
  );
}

async function sendViaResend({ from, to, subject, html, text }) {
  const recipient = normalizeText(to);

  if (!recipient) {
    throw new Error("Recipient email is required.");
  }

  const resend = getResendClient();

  const result = await resend.emails.send({
    from: normalizeText(from) || getHotelFromAddress(),
    to: recipient,
    subject: normalizeText(subject),
    html,
    text: normalizeText(text),
  });

  if (result?.error) {
    throw new Error(result.error.message || "Resend failed to send email.");
  }

  return result;
}

/*
  Compatibility function.

  Your old controllers may still call:
  buildHotelTransporter().sendMail(...)

  This keeps that old code working, but sends through Resend instead of SMTP.
*/
export function buildHotelTransporter() {
  return {
    sendMail: async ({ from, to, subject, html, text }) => {
      return sendViaResend({
        from: from || getHotelFromAddress(),
        to,
        subject,
        html,
        text,
      });
    },
  };
}

async function sendHotelEmail({ to, subject, html, text }) {
  return sendViaResend({
    from: getHotelFromAddress(),
    to,
    subject,
    html,
    text,
  });
}

function emailShell({
  eyebrow = "Lumispire",
  title = "",
  preview = "",
  buttonText = "",
  buttonUrl = "",
  body = "",
  footerNote = "",
}) {
  const safeTitle = escapeHtml(title);
  const safePreview = escapeHtml(preview);
  const safeButtonText = escapeHtml(buttonText);
  const safeButtonUrl = escapeHtml(buttonUrl);
  const safeFooterNote = escapeHtml(footerNote);

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="color-scheme" content="light" />
    <meta name="supported-color-schemes" content="light" />
    <title>${safeTitle}</title>
  </head>
  <body style="margin:0;padding:0;background:#f3f7f1;font-family:Arial,Helvetica,sans-serif;color:#1f2937;">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;line-height:1px;">
      ${safePreview}
    </div>

    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#f3f7f1;margin:0;padding:28px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:640px;background:#ffffff;border-radius:26px;overflow:hidden;border:1px solid #dfe8dc;box-shadow:0 20px 55px rgba(8,39,25,.12);">
            <tr>
              <td style="background:linear-gradient(135deg,#082719,#174a30);padding:30px 34px;color:#ffffff;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                  <tr>
                    <td style="vertical-align:middle;">
                      <div style="font-size:12px;letter-spacing:.22em;text-transform:uppercase;color:#f4d484;font-weight:800;">${escapeHtml(
                        eyebrow
                      )}</div>
                      <div style="margin-top:8px;font-size:26px;line-height:1.15;font-weight:900;color:#ffffff;">Hotel &amp; Resort</div>
                      <div style="margin-top:6px;font-size:13px;line-height:1.5;color:rgba(255,255,255,.78);">Resort, venue, hotel, condo, and events booking services.</div>
                    </td>
                    <td align="right" style="vertical-align:middle;width:72px;">
                      <div style="width:56px;height:56px;border-radius:50%;border:1px solid rgba(244,212,132,.55);display:inline-block;text-align:center;line-height:56px;color:#f4d484;font-size:24px;font-weight:900;">L</div>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <tr>
              <td style="padding:34px 34px 10px;">
                <div style="display:inline-block;background:#eef6ed;color:#174a30;border:1px solid #d9ead7;border-radius:999px;padding:8px 13px;font-size:12px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;">Secure Account Action</div>
                <h1 style="margin:18px 0 10px;font-size:30px;line-height:1.18;color:#102418;font-weight:900;">${safeTitle}</h1>
                <p style="margin:0;font-size:15px;line-height:1.7;color:#4b5563;">${safePreview}</p>
              </td>
            </tr>

            <tr>
              <td style="padding:16px 34px 8px;">
                ${body}
              </td>
            </tr>

            <tr>
              <td align="center" style="padding:20px 34px 30px;">
                <a href="${safeButtonUrl}" style="display:inline-block;background:linear-gradient(135deg,#f4d484,#d7a84d);color:#102418;text-decoration:none;border-radius:999px;padding:15px 30px;font-size:14px;font-weight:900;letter-spacing:.04em;text-transform:uppercase;box-shadow:0 14px 28px rgba(215,168,77,.25);">${safeButtonText}</a>
              </td>
            </tr>

            <tr>
              <td style="padding:0 34px 32px;">
                <div style="background:#f8fbf7;border:1px solid #e3ece1;border-radius:18px;padding:16px 18px;">
                  <p style="margin:0 0 8px;font-size:13px;line-height:1.55;color:#4b5563;font-weight:700;">Button not working?</p>
                  <p style="margin:0;font-size:12px;line-height:1.65;color:#667085;word-break:break-all;">Copy and open this link:<br /><a href="${safeButtonUrl}" style="color:#174a30;text-decoration:underline;">${safeButtonUrl}</a></p>
                </div>
              </td>
            </tr>

            <tr>
              <td style="background:#f8fbf7;border-top:1px solid #e3ece1;padding:20px 34px;text-align:center;">
                <p style="margin:0;color:#667085;font-size:12px;line-height:1.6;">${safeFooterNote}</p>
                <p style="margin:10px 0 0;color:#98a2b3;font-size:11px;line-height:1.5;">This is an automated Lumispire message. Please do not reply to this email.</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

export async function sendHotelVerificationEmail(toEmail, token) {
  const safeToken = encodeURIComponent(String(token || ""));

  /*
    Email verification flow:

    Email button
    -> backend verifies token
    -> backend redirects user to frontend login page
  */
  const verifyLink = `${hotelApiBaseUrl()}/verify-email/${safeToken}?redirect=1`;

  const html = emailShell({
    title: "Verify your Lumispire email",
    preview:
      "Confirm your email address to activate your Hotel & Resort account.",
    buttonText: "Verify Email",
    buttonUrl: verifyLink,
    footerNote:
      "This verification link expires after 24 hours. If you did not create a Lumispire account, you can safely ignore this email.",
    body: `
      <p style="margin:0 0 14px;font-size:15px;line-height:1.75;color:#344054;">Thank you for creating a Lumispire Hotel &amp; Resort account. Please confirm your email address so we can secure your account and allow you to continue with bookings.</p>
      <p style="margin:0;font-size:15px;line-height:1.75;color:#344054;">After verification, you will be redirected to the Lumispire login page.</p>
    `,
  });

  const text = `
Verify your Lumispire email

Confirm your email address to activate your Hotel & Resort account.

Open this link to verify your email:
${verifyLink}

This verification link expires after 24 hours.
  `.trim();

  return sendHotelEmail({
    to: toEmail,
    subject: "Verify your Lumispire email",
    html,
    text,
  });
}

export async function sendHotelResetPasswordEmail(toEmail, rawToken) {
  const safeToken = encodeURIComponent(String(rawToken || ""));
  const resetLink = `${hotelAppBaseUrl()}/hotel-reset-password/${safeToken}`;

  const html = emailShell({
    title: "Reset your Lumispire password",
    preview:
      "Use this secure link to set a new password for your Hotel & Resort account.",
    buttonText: "Reset Password",
    buttonUrl: resetLink,
    footerNote:
      "This password reset link expires after 1 hour. If you did not request this, you can safely ignore this email.",
    body: `
      <p style="margin:0 0 14px;font-size:15px;line-height:1.75;color:#344054;">We received a request to reset the password for your Lumispire Hotel &amp; Resort account.</p>
      <p style="margin:0;font-size:15px;line-height:1.75;color:#344054;">Click the button below to set a new password. For your security, this link can only be used for a limited time.</p>
    `,
  });

  const text = `
Reset your Lumispire password

Open this link to reset your password:
${resetLink}

This link will expire in 1 hour.
  `.trim();

  return sendHotelEmail({
    to: toEmail,
    subject: "Reset your Lumispire password",
    html,
    text,
  });
}

export async function sendHotelChangePasswordOtpEmail(toEmail, otp) {
  const safeOtp = escapeHtml(String(otp || ""));

  const html = emailShell({
    title: "Your password change OTP",
    preview: "Use this 6-digit OTP to confirm your Lumispire password change.",
    buttonText: "Open Lumispire Login",
    buttonUrl: `${hotelAppBaseUrl()}/hotel-login`,
    footerNote:
      "This OTP expires after 10 minutes. If you did not request this password change, please ignore this email and keep your current password.",
    body: `
      <p style="margin:0 0 14px;font-size:15px;line-height:1.75;color:#344054;">Use the OTP below to complete your password change request.</p>
      <div style="margin:18px 0;background:#102418;color:#f4d484;border-radius:18px;text-align:center;padding:22px 16px;font-size:34px;font-weight:900;letter-spacing:8px;">${safeOtp}</div>
      <p style="margin:0;font-size:15px;line-height:1.75;color:#344054;">Enter this code in the Lumispire password change screen within 10 minutes.</p>
    `,
  });

  const text = `
Password Change OTP

Your OTP is: ${otp}

This OTP will expire in 10 minutes.
  `.trim();

  return sendHotelEmail({
    to: toEmail,
    subject: "Lumispire password change OTP",
    html,
    text,
  });
}

export async function sendHotelContactMessageEmail({
  name = "",
  email = "",
  subject = "",
  message = "",
}) {
  const recipient = "crmstechalliance.work@gmail.com";

  const safeName = escapeHtml(name);
  const safeEmail = escapeHtml(email);
  const safeSubject = escapeHtml(subject);
  const safeMessage = escapeHtml(message).replace(/\n/g, "<br />");

  const html = `
    <div style="font-family:Arial,sans-serif;line-height:1.6;color:#1f2937;background:#f6f8f6;padding:24px;">
      <div style="max-width:640px;margin:auto;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e5e7eb;">
        <div style="background:#082719;color:#ffffff;padding:22px 24px;">
          <h2 style="margin:0;font-size:22px;">New Hotel & Resort Contact Message</h2>
          <p style="margin:6px 0 0;color:#d1fae5;">Lumispire Contact Form</p>
        </div>

        <div style="padding:24px;">
          <p style="margin:0 0 14px;"><b>Name:</b> ${safeName}</p>
          <p style="margin:0 0 14px;"><b>Email:</b> ${safeEmail}</p>
          <p style="margin:0 0 14px;"><b>Subject:</b> ${safeSubject}</p>

          <div style="margin-top:22px;padding:18px;border-radius:12px;background:#f9fafb;border:1px solid #e5e7eb;">
            <p style="margin:0 0 8px;"><b>Message:</b></p>
            <p style="margin:0;">${safeMessage}</p>
          </div>
        </div>
      </div>
    </div>
  `;

  const text = `
New Hotel & Resort Contact Message

Name: ${name}
Email: ${email}
Subject: ${subject}

Message:
${message}
  `.trim();

  return sendHotelEmail({
    to: recipient,
    subject: `Hotel Contact Message: ${subject}`,
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
  sendHotelContactMessageEmail,

  appBaseUrl,
  buildTransporter,
  sendVerificationEmail,
  sendResetPasswordEmail,
  sendChangePasswordOtpEmail,
};