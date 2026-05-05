import nodemailer from "nodemailer";

function getSmtpConfig() {
  const user = process.env.SMTP_USER || process.env.EMAIL_USER;
  const pass = process.env.SMTP_PASS || process.env.EMAIL_PASS;

  if (!user || !pass) {
    throw new Error("Missing SMTP credentials in .env");
  }

  return {
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: Number(process.env.SMTP_PORT || 587),
    secure: String(process.env.SMTP_SECURE || "false") === "true",
    auth: { user, pass },
  };
}

function getTransporter() {
  return nodemailer.createTransport(getSmtpConfig());
}

function escapeHtml(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export async function sendTrainingOtpEmail({
  to,
  firstName = "",
  otp = "",
  subject = "TAMSI OTP",
  heading = "Your OTP Code",
  note = "This code expires in 10 minutes.",
}) {
  const recipient = String(to || "").trim();
  if (!recipient) {
    throw new Error("Recipient email is missing.");
  }

  const transporter = getTransporter();
  const from =
    process.env.MAIL_FROM || process.env.SMTP_USER || process.env.EMAIL_USER;

  const safeName = escapeHtml(firstName || "Trainee");
  const safeOtp = escapeHtml(otp);
  const safeHeading = escapeHtml(heading);
  const safeNote = escapeHtml(note);

  return transporter.sendMail({
    from,
    to: recipient,
    subject: String(subject || "TAMSI OTP"),
    text: `Hello ${firstName || "Trainee"}, your OTP is ${otp}. ${note}`,
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #243b2e;">
        <p>Hello <strong>${safeName}</strong>,</p>
        <p>${safeHeading}</p>
        <p style="font-size: 28px; font-weight: bold; letter-spacing: 4px;">${safeOtp}</p>
        <p>${safeNote}</p>
        <p>If you did not request this, you may ignore this email.</p>
      </div>
    `,
  });
}

export default sendTrainingOtpEmail;
