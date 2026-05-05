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

export async function sendEnrollmentReceivedEmail({
  to,
  firstName = "",
  course = "",
}) {
  const recipient = String(to || "").trim();
  if (!recipient) {
    throw new Error("Recipient email is missing.");
  }

  const transporter = getTransporter();
  const from =
    process.env.MAIL_FROM || process.env.SMTP_USER || process.env.EMAIL_USER;

  const safeFirstName = escapeHtml(firstName || "Applicant");
  const safeCourse = escapeHtml(course || "-");

  return transporter.sendMail({
    from,
    to: recipient,
    subject: "TAMSI Enrollment Application Received",
    text: [
      `Hello ${firstName || "Applicant"},`,
      "",
      "We have received your TAMSI enrollment application.",
      `Course: ${course || "-"}`,
      "",
      "Your application is now under review.",
      "We will contact you again once your enrollment has been processed.",
      "",
      "Thank you.",
      "TAMSI Training Team",
    ].join("\n"),
    html: `
      <div style="font-family: Arial, sans-serif; color: #243b2e; line-height: 1.6;">
        <div style="max-width: 640px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 16px; overflow: hidden; background: #ffffff;">
          <div style="background: linear-gradient(135deg, #395345, #6f7d49); padding: 28px 24px; color: white;">
            <div style="font-size: 12px; font-weight: 700; letter-spacing: 0.18em; text-transform: uppercase; opacity: 0.95;">
              TAMSI Training &amp; Assessment
            </div>
            <h1 style="margin: 10px 0 0; font-size: 28px; line-height: 1.2;">
              Application Received
            </h1>
          </div>

          <div style="padding: 24px;">
            <p>Hello <strong>${safeFirstName}</strong>,</p>
            <p>We have received your TAMSI enrollment application.</p>

            <div style="margin: 18px 0; padding: 16px; border-radius: 12px; background: #f7f8f3; border: 1px solid #e3e8dc;">
              <p style="margin: 0;"><strong>Course:</strong> ${safeCourse}</p>
              <p style="margin: 10px 0 0;"><strong>Status:</strong> Pending Review</p>
            </div>

            <p>Your application is now under review. We will contact you again once your enrollment has been processed.</p>
            <p style="margin-top: 18px;">Thank you.</p>
            <p style="margin-top: 12px; font-weight: 700;">TAMSI Training Team</p>
          </div>
        </div>
      </div>
    `,
  });
}

export default sendEnrollmentReceivedEmail;
