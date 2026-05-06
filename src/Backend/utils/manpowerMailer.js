import { Resend } from "resend";

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

function formatDateTime(value) {
  if (!value) return "To be announced";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "To be announced";
  }

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

function getResendClient() {
  const apiKey = normalizeText(process.env.RESEND_API_KEY || "");

  if (!apiKey) {
    throw new Error("RESEND_API_KEY is missing in environment variables.");
  }

  return new Resend(apiKey);
}

function getFromAddress() {
  return normalizeText(
    process.env.MANPOWER_FROM_EMAIL ||
      process.env.RESEND_FROM_EMAIL ||
      process.env.MAIL_FROM ||
      "Lumispire Manpower <onboarding@resend.dev>"
  );
}

function getReplyToAddress() {
  return normalizeText(
    process.env.MANPOWER_REPLY_TO ||
      process.env.EMAIL_REPLY_TO ||
      process.env.EMAIL_USER ||
      ""
  );
}

function ensureRecipient(to) {
  const recipient = normalizeText(to);

  if (!recipient) {
    throw new Error("Recipient email is required.");
  }

  return recipient;
}

async function sendEmail({ to, subject, html, text }) {
  const resend = getResendClient();
  const replyTo = getReplyToAddress();

  const payload = {
    from: getFromAddress(),
    to: [ensureRecipient(to)],
    subject: normalizeText(subject),
    text: normalizeText(text),
    html,
  };

  if (replyTo) {
    payload.replyTo = replyTo;
  }

  const { data, error } = await resend.emails.send(payload);

  if (error) {
    throw new Error(error.message || "Resend failed to send email.");
  }

  console.log("Resend mail sent:", {
    id: data?.id,
    to: payload.to,
    subject: payload.subject,
  });

  return data;
}

export async function testManpowerMailerConnection() {
  const resend = getResendClient();

  return {
    ok: true,
    provider: "resend",
    from: getFromAddress(),
    hasApiKey: Boolean(resend),
  };
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
  const cleanApplicantName = normalizeText(applicantName) || "Applicant";
  const cleanVacancy = normalizeText(vacancy) || "Applied Position";
  const cleanWhen = formatDateTime(scheduledAt);
  const cleanLocation = normalizeText(location) || "To be announced";
  const cleanInterviewer = normalizeText(interviewer) || "HR Team";
  const cleanRemarks = normalizeText(remarks);

  const safeApplicantName = escapeHtml(cleanApplicantName);
  const safeVacancy = escapeHtml(cleanVacancy);
  const safeWhen = escapeHtml(cleanWhen);
  const safeLocation = escapeHtml(cleanLocation);
  const safeInterviewer = escapeHtml(cleanInterviewer);
  const safeRemarks = escapeHtml(cleanRemarks);

  const subject = `Interview Schedule - ${cleanVacancy}`;

  const text = `
LTC Manpower Services

Good day, ${cleanApplicantName}.

Your application for ${cleanVacancy} has moved to the interview stage.

Interview Schedule: ${cleanWhen}
Location: ${cleanLocation}
Interviewer: ${cleanInterviewer}
${cleanRemarks ? `Notes: ${cleanRemarks}` : ""}

Please arrive on time and bring your original documents if required.

Thank you.
LTC Manpower Services
  `.trim();

  const html = `
    <div style="font-family: Arial, sans-serif; color: #1f2937; line-height: 1.6; background: #f7f8f3; padding: 24px;">
      <div style="max-width: 640px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 16px; overflow: hidden; background: #ffffff;">
        <div style="background: linear-gradient(135deg, #1f3d2b, #6f7d49); padding: 28px 24px; color: white;">
          <div style="font-size: 12px; font-weight: 700; letter-spacing: 0.18em; text-transform: uppercase; opacity: 0.95;">
            LTC Manpower Services
          </div>
          <h1 style="margin: 10px 0 0; font-size: 28px; line-height: 1.2;">
            Interview Scheduled
          </h1>
        </div>

        <div style="padding: 24px;">
          <p>Good day, <strong>${safeApplicantName}</strong>.</p>

          <p>
            Your application for <strong>${safeVacancy}</strong> has moved to the interview stage.
          </p>

          <div style="margin: 18px 0; padding: 16px; border-radius: 12px; background: #f7f8f3; border: 1px solid #e3e8dc;">
            <p style="margin: 0;"><strong>Interview Schedule:</strong> ${safeWhen}</p>
            <p style="margin: 10px 0 0;"><strong>Location:</strong> ${safeLocation}</p>
            <p style="margin: 10px 0 0;"><strong>Interviewer:</strong> ${safeInterviewer}</p>
            ${
              safeRemarks
                ? `<p style="margin: 10px 0 0;"><strong>Notes:</strong> ${safeRemarks}</p>`
                : ""
            }
          </div>

          <p>Please arrive on time and bring your original documents if required.</p>

          <p style="margin-top: 18px;">Thank you.</p>
          <p style="margin-top: 12px; font-weight: 700;">LTC Manpower Services</p>
        </div>
      </div>
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
  const cleanEmployeeName = normalizeText(employeeName) || "Employee";
  const cleanVacancy = normalizeText(vacancy) || "Position";
  const cleanCompanyEmail = normalizeText(companyEmail) || "";
  const cleanTemporaryPassword = normalizeText(temporaryPassword) || "";

  const safeEmployeeName = escapeHtml(cleanEmployeeName);
  const safeVacancy = escapeHtml(cleanVacancy);
  const safeCompanyEmail = escapeHtml(cleanCompanyEmail || "-");
  const safeTemporaryPassword = escapeHtml(cleanTemporaryPassword || "-");

  const subject = `Hiring Result - ${cleanVacancy}`;

  const text = `
LTC Manpower Services

Congratulations, ${cleanEmployeeName}.

You have been marked as HIRED for the position of ${cleanVacancy}.

Your system credentials are:
Company Email: ${cleanCompanyEmail}
Temporary Password: ${cleanTemporaryPassword}

Please log in and change your password immediately upon first access.

Welcome to the team.
LTC Manpower Services
  `.trim();

  const html = `
    <div style="font-family: Arial, sans-serif; color: #1f2937; line-height: 1.6; background: #f7f8f3; padding: 24px;">
      <div style="max-width: 640px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 16px; overflow: hidden; background: #ffffff;">
        <div style="background: linear-gradient(135deg, #1f3d2b, #6f7d49); padding: 28px 24px; color: white;">
          <div style="font-size: 12px; font-weight: 700; letter-spacing: 0.18em; text-transform: uppercase; opacity: 0.95;">
            LTC Manpower Services
          </div>
          <h1 style="margin: 10px 0 0; font-size: 28px; line-height: 1.2;">
            You Are Hired
          </h1>
        </div>

        <div style="padding: 24px;">
          <p>Congratulations, <strong>${safeEmployeeName}</strong>.</p>

          <p>
            You have been marked as <strong>HIRED</strong> for the position of
            <strong>${safeVacancy}</strong>.
          </p>

          <div style="margin: 18px 0; padding: 16px; border-radius: 12px; background: #f7f8f3; border: 1px solid #e3e8dc;">
            <p style="margin: 0;"><strong>Company Email:</strong> ${safeCompanyEmail}</p>
            <p style="margin: 10px 0 0;"><strong>Temporary Password:</strong> ${safeTemporaryPassword}</p>
          </div>

          <p>Please log in and change your password immediately upon first access.</p>

          <p style="margin-top: 18px;">Welcome to the team.</p>
          <p style="margin-top: 12px; font-weight: 700;">LTC Manpower Services</p>
        </div>
      </div>
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
  const cleanEmployeeName = normalizeText(employeeName) || "Employee";
  const cleanOtp = normalizeText(otp);
  const cleanExpiresInMinutes = Number(expiresInMinutes || 10);

  const safeEmployeeName = escapeHtml(cleanEmployeeName);
  const safeOtp = escapeHtml(cleanOtp || "");

  const subject = "Manpower Employee Password Change OTP";

  const text = `
LTC Manpower Services

Hello ${cleanEmployeeName}.

Your OTP for password change is: ${cleanOtp}

This OTP will expire in ${cleanExpiresInMinutes} minutes.

If you did not request this password change, please ignore this email.
  `.trim();

  const html = `
    <div style="font-family: Arial, sans-serif; color: #1f2937; line-height: 1.6; background: #f7f8f3; padding: 24px;">
      <div style="max-width: 640px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 16px; overflow: hidden; background: #ffffff;">
        <div style="background: linear-gradient(135deg, #1f3d2b, #6f7d49); padding: 28px 24px; color: white;">
          <div style="font-size: 12px; font-weight: 700; letter-spacing: 0.18em; text-transform: uppercase; opacity: 0.95;">
            LTC Manpower Services
          </div>
          <h1 style="margin: 10px 0 0; font-size: 28px; line-height: 1.2;">
            Password Change OTP
          </h1>
        </div>

        <div style="padding: 24px;">
          <p>Hello <strong>${safeEmployeeName}</strong>.</p>

          <p>Your OTP for password change is:</p>

          <div style="display: inline-block; padding: 12px 18px; border-radius: 10px; background: #f3f4f6; border: 1px solid #d1d5db; font-size: 28px; font-weight: 800; letter-spacing: 6px;">
            ${safeOtp}
          </div>

          <p style="margin-top: 16px;">
            This OTP will expire in <strong>${cleanExpiresInMinutes} minutes</strong>.
          </p>

          <p>If you did not request this password change, please ignore this email.</p>
        </div>
      </div>
    </div>
  `;

  return sendEmail({
    to,
    subject,
    html,
    text,
  });
}