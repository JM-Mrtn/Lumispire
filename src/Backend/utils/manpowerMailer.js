import nodemailer from "nodemailer";

function normalizeText(value = "") {
  return String(value || "").trim();
}

function normalizePass(value = "") {
  return String(value || "").replace(/\s+/g, "");
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

function formatDateTime(value) {
  if (!value) return "To be announced";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "To be announced";

  try {
    return new Intl.DateTimeFormat("en-PH", {
      dateStyle: "full",
      timeStyle: "short",
      timeZone: process.env.MAIL_TIMEZONE || "Asia/Manila",
    }).format(date);
  } catch {
    return date.toLocaleString();
  }
}

function getMailConfig() {
  const host = normalizeText(process.env.SMTP_HOST || "smtp.gmail.com");
  const port = Number(process.env.SMTP_PORT || 587);
  const user = normalizeText(process.env.EMAIL_USER || "");
  const pass = normalizePass(process.env.EMAIL_PASS || "");

  if (!user || !pass) {
    throw new Error(
      "Email credentials are not configured. Please check EMAIL_USER and EMAIL_PASS in .env."
    );
  }

  return { host, port, user, pass };
}

let transporterPromise = null;

async function createVerifiedTransporter() {
  const { host, port, user, pass } = getMailConfig();

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    requireTLS: port !== 465,
    auth: { user, pass },
  });

  await transporter.verify();
  console.log(`SMTP ready (${host}:${port}) for ${user}`);

  return transporter;
}

async function getTransporter() {
  if (!transporterPromise) {
    transporterPromise = createVerifiedTransporter().catch((error) => {
      transporterPromise = null;
      throw error;
    });
  }

  return transporterPromise;
}

function getFromAddress() {
  const user = normalizeText(process.env.EMAIL_USER || "");
  const fromName = normalizeText(
    process.env.EMAIL_FROM_NAME || "LTC Manpower Services"
  ).replace(/"/g, "");

  return `"${fromName}" <${user}>`;
}

function getReplyToAddress() {
  return normalizeText(process.env.EMAIL_REPLY_TO || process.env.EMAIL_USER || "");
}

function ensureRecipient(to) {
  const recipient = normalizeText(to);
  if (!recipient) {
    throw new Error("Recipient email is required.");
  }
  return recipient;
}

async function sendEmail({ to, subject, html, text }) {
  const transporter = await getTransporter();

  const info = await transporter.sendMail({
    from: getFromAddress(),
    replyTo: getReplyToAddress(),
    to: ensureRecipient(to),
    subject: normalizeText(subject),
    text: normalizeText(text),
    html,
  });

  console.log("Mail send result:", {
    messageId: info.messageId,
    accepted: info.accepted,
    rejected: info.rejected,
    response: info.response,
  });

  if (Array.isArray(info.rejected) && info.rejected.length > 0) {
    throw new Error(`Email rejected for: ${info.rejected.join(", ")}`);
  }

  return info;
}

export async function testManpowerMailerConnection() {
  const transporter = await getTransporter();
  return transporter.verify();
}

export async function sendInterviewScheduleEmail({
  to,
  applicantName,
  vacancy,
  scheduledAt,
  location,
  interviewer,
  remarks,
}) {
  const safeApplicantName = escapeHtml(applicantName || "Applicant");
  const safeVacancy = escapeHtml(vacancy || "Applied Position");
  const safeWhen = escapeHtml(formatDateTime(scheduledAt));
  const safeLocation = escapeHtml(location || "To be announced");
  const safeInterviewer = escapeHtml(interviewer || "HR Team");
  const safeRemarks = escapeHtml(remarks || "");

  const subject = `Interview Schedule - ${vacancy || "Application Update"}`;

  const text = `
LTC Manpower Services

Good day, ${applicantName || "Applicant"}.

Your application for ${vacancy || "the position"} has moved to the interview stage.

Interview Schedule: ${formatDateTime(scheduledAt)}
Location: ${location || "To be announced"}
Interviewer: ${interviewer || "HR Team"}
${remarks ? `Notes: ${remarks}` : ""}

Please arrive on time and bring your original documents if required.

Thank you.
  `.trim();

  const html = `
    <div style="font-family:Arial,sans-serif;line-height:1.6;color:#1f2937">
      <h2 style="margin-bottom:8px;">LTC Manpower Services</h2>
      <p>Good day, ${safeApplicantName}.</p>
      <p>Your application for <strong>${safeVacancy}</strong> has moved to the interview stage.</p>
      <p><strong>Interview Schedule:</strong> ${safeWhen}</p>
      <p><strong>Location:</strong> ${safeLocation}</p>
      <p><strong>Interviewer:</strong> ${safeInterviewer}</p>
      ${
        safeRemarks
          ? `<p><strong>Notes:</strong> ${safeRemarks}</p>`
          : ""
      }
      <p>Please arrive on time and bring your original documents if required.</p>
      <p>Thank you.</p>
    </div>
  `;

  return sendEmail({
    to,
    subject,
    html,
    text,
  });
}

export async function sendHiredCredentialsEmail({
  to,
  employeeName,
  vacancy,
  companyEmail,
  temporaryPassword,
}) {
  const safeEmployeeName = escapeHtml(employeeName || "Employee");
  const safeVacancy = escapeHtml(vacancy || "Position");
  const safeCompanyEmail = escapeHtml(companyEmail || "");
  const safeTemporaryPassword = escapeHtml(temporaryPassword || "");

  const subject = `Hiring Result - ${vacancy || "Application Update"}`;

  const text = `
LTC Manpower Services

Congratulations, ${employeeName || "Employee"}.

You have been marked as HIRED for the position of ${vacancy || "the applied position"}.

Your system credentials are:
Company Email: ${companyEmail || ""}
Temporary Password: ${temporaryPassword || ""}

Please log in and change your password immediately upon first access.

Welcome to the team.
  `.trim();

  const html = `
    <div style="font-family:Arial,sans-serif;line-height:1.6;color:#1f2937">
      <h2 style="margin-bottom:8px;">LTC Manpower Services</h2>
      <p>Congratulations, ${safeEmployeeName}.</p>
      <p>You have been marked as <strong>HIRED</strong> for the position of <strong>${safeVacancy}</strong>.</p>
      <p>Your system credentials are:</p>
      <p><strong>Company Email:</strong> ${safeCompanyEmail}</p>
      <p><strong>Temporary Password:</strong> ${safeTemporaryPassword}</p>
      <p>Please log in and change your password immediately upon first access.</p>
      <p>Welcome to the team.</p>
    </div>
  `;

  return sendEmail({
    to,
    subject,
    html,
    text,
  });
}

export async function sendManpowerEmployeePasswordOtpEmail({
  to,
  employeeName,
  otp,
  expiresInMinutes = 10,
}) {
  const safeEmployeeName = escapeHtml(employeeName || "Employee");
  const safeOtp = escapeHtml(otp || "");

  const subject = "Manpower Employee Password Change OTP";

  const text = `
LTC Manpower Services

Hello ${employeeName || "Employee"}.

Your OTP for password change is: ${otp || ""}

This OTP will expire in ${expiresInMinutes} minutes.

If you did not request this password change, please ignore this email.
  `.trim();

  const html = `
    <div style="font-family:Arial,sans-serif;line-height:1.6;color:#1f2937">
      <h2 style="margin-bottom:8px;">LTC Manpower Services</h2>
      <p>Hello ${safeEmployeeName}.</p>
      <p>Your OTP for password change is:</p>
      <div style="display:inline-block;padding:12px 18px;border-radius:10px;background:#f3f4f6;border:1px solid #d1d5db;font-size:28px;font-weight:800;letter-spacing:6px;">
        ${safeOtp}
      </div>
      <p style="margin-top:16px;">This OTP will expire in <strong>${expiresInMinutes} minutes</strong>.</p>
      <p>If you did not request this password change, please ignore this email.</p>
    </div>
  `;

  return sendEmail({
    to,
    subject,
    html,
    text,
  });
}