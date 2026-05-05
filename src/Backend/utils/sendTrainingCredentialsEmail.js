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

export async function sendTrainingCredentialsEmail({
  to,
  firstName = "",
  traineeEmail = "",
  tempPassword = "",
  course = "",
}) {
  const recipient = String(to || "").trim();
  if (!recipient) {
    throw new Error("Recipient email is missing.");
  }

  const transporter = getTransporter();
  const from =
    process.env.MAIL_FROM || process.env.SMTP_USER || process.env.EMAIL_USER;

  const safeFirstName = escapeHtml(firstName || "Trainee");
  const safeTraineeEmail = escapeHtml(traineeEmail);
  const safeTempPassword = escapeHtml(tempPassword);
  const safeCourse = escapeHtml(course || "-");

  return transporter.sendMail({
    from,
    to: recipient,
    subject: "TAMSI Login Credentials",
    text: [
      `Hello ${firstName || "Trainee"},`,
      "",
      "Your TAMSI enrollment has been approved.",
      `Course: ${course || "-"}`,
      `Trainee Email: ${traineeEmail || "-"}`,
      `Temporary Password: ${tempPassword || "-"}`,
      "",
      "Please login and change your password immediately.",
    ].join("\n"),
    html: `
      <div style="font-family: Arial, sans-serif; color: #243b2e; line-height: 1.6;">
        <p>Hello <strong>${safeFirstName}</strong>,</p>
        <p>Your TAMSI enrollment has been approved.</p>
        <p><strong>Course:</strong> ${safeCourse}</p>
        <p><strong>Trainee Email:</strong> ${safeTraineeEmail || "-"}</p>
        <p><strong>Temporary Password:</strong> ${safeTempPassword || "-"}</p>
        <p>Please login and change your password immediately.</p>
      </div>
    `,
  });
}

export default sendTrainingCredentialsEmail;
