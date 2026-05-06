import { Resend } from "resend";

function normalizeText(value = "") {
  return String(value || "").trim();
}

function escapeHtml(value = "") {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function getResendClient() {
  const apiKey = normalizeText(process.env.RESEND_API_KEY || "");

  if (!apiKey) {
    throw new Error("RESEND_API_KEY is missing in environment variables.");
  }

  return new Resend(apiKey);
}

function getTrainingFromAddress() {
  return normalizeText(
    process.env.TRAINING_FROM_EMAIL ||
      process.env.RESEND_FROM_EMAIL ||
      process.env.MAIL_FROM ||
      "Lumispire <onboarding@resend.dev>"
  );
}

async function sendTrainingEmail({ to, subject, text, html }) {
  const recipient = normalizeText(to);

  if (!recipient) {
    throw new Error("Recipient email is missing.");
  }

  const resend = getResendClient();

  const result = await resend.emails.send({
    from: getTrainingFromAddress(),
    to: recipient,
    subject: normalizeText(subject),
    text: normalizeText(text),
    html,
  });

  if (result?.error) {
    throw new Error(result.error.message || "Resend failed to send email.");
  }

  return result;
}

export async function sendTrainingCredentialsEmail({
  to,
  firstName = "",
  traineeEmail = "",
  tempPassword = "",
  course = "",
}) {
  const cleanFirstName = normalizeText(firstName) || "Trainee";
  const cleanTraineeEmail = normalizeText(traineeEmail) || "-";
  const cleanTempPassword = normalizeText(tempPassword) || "-";
  const cleanCourse = normalizeText(course) || "-";

  const safeFirstName = escapeHtml(cleanFirstName);
  const safeTraineeEmail = escapeHtml(cleanTraineeEmail);
  const safeTempPassword = escapeHtml(cleanTempPassword);
  const safeCourse = escapeHtml(cleanCourse);

  return sendTrainingEmail({
    to,
    subject: "TAMSI Login Credentials",
    text: [
      `Hello ${cleanFirstName},`,
      "",
      "Your TAMSI enrollment has been approved.",
      `Course: ${cleanCourse}`,
      `Trainee Email: ${cleanTraineeEmail}`,
      `Temporary Password: ${cleanTempPassword}`,
      "",
      "Please login and change your password immediately.",
      "",
      "Thank you.",
      "TAMSI Training Team",
    ].join("\n"),
    html: `
      <div style="font-family: Arial, sans-serif; color: #243b2e; line-height: 1.6; background: #f7f8f3; padding: 24px;">
        <div style="max-width: 640px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 16px; overflow: hidden; background: #ffffff;">
          <div style="background: linear-gradient(135deg, #395345, #6f7d49); padding: 28px 24px; color: white;">
            <div style="font-size: 12px; font-weight: 700; letter-spacing: 0.18em; text-transform: uppercase; opacity: 0.95;">
              TAMSI Training &amp; Assessment
            </div>
            <h1 style="margin: 10px 0 0; font-size: 28px; line-height: 1.2;">
              Enrollment Approved
            </h1>
          </div>

          <div style="padding: 24px;">
            <p>Hello <strong>${safeFirstName}</strong>,</p>
            <p>Your TAMSI enrollment has been approved.</p>

            <div style="margin: 18px 0; padding: 16px; border-radius: 12px; background: #f7f8f3; border: 1px solid #e3e8dc;">
              <p style="margin: 0;"><strong>Course:</strong> ${safeCourse}</p>
              <p style="margin: 10px 0 0;"><strong>Trainee Email:</strong> ${safeTraineeEmail}</p>
              <p style="margin: 10px 0 0;"><strong>Temporary Password:</strong> ${safeTempPassword}</p>
            </div>

            <p>Please login and change your password immediately.</p>

            <p style="margin-top: 18px;">Thank you.</p>
            <p style="margin-top: 12px; font-weight: 700;">TAMSI Training Team</p>
          </div>
        </div>
      </div>
    `,
  });
}

export default sendTrainingCredentialsEmail;