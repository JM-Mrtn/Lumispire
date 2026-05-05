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

export async function sendProfessorCredentialsEmail({
  to,
  firstName = "",
  username = "",
  email = "",
  tempPassword = "",
}) {
  const recipient = String(to || "").trim();
  if (!recipient) {
    throw new Error("Professor recipient email is missing.");
  }

  const transporter = getTransporter();
  const from =
    process.env.MAIL_FROM || process.env.SMTP_USER || process.env.EMAIL_USER;

  const safeFirstName = escapeHtml(firstName || "Professor");
  const safeUsername = escapeHtml(username);
  const safeEmail = escapeHtml(email);
  const safeTempPassword = escapeHtml(tempPassword);

  return transporter.sendMail({
    from,
    to: recipient,
    subject: "TAMSI Professor Account Credentials",
    text: [
      `Hello ${firstName || "Professor"},`,
      "",
      "Your professor account has been created.",
      `Username: ${username || "-"}`,
      `Professor Email: ${email || "-"}`,
      `Temporary Password: ${tempPassword || "-"}`,
      "",
      "Please sign in and change your password immediately.",
    ].join("\n"),
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #243b2e;">
        <p>Hello <strong>${safeFirstName}</strong>,</p>
        <p>Your professor account has been created.</p>
        <p><strong>Username:</strong> ${safeUsername || "-"}</p>
        <p><strong>Professor Email:</strong> ${safeEmail || "-"}</p>
        <p><strong>Temporary Password:</strong> ${safeTempPassword || "-"}</p>
        <p>Please sign in and change your password immediately.</p>
      </div>
    `,
  });
}

export default sendProfessorCredentialsEmail;
