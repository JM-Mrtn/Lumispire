import { Resend } from "resend";

function cleanText(value = "") {
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
  const apiKey = cleanText(process.env.RESEND_API_KEY);
  if (!apiKey) throw new Error("RESEND_API_KEY is missing in environment variables.");
  return new Resend(apiKey);
}

function getFromAddress() {
  return cleanText(
    process.env.TRAINING_FROM_EMAIL ||
      process.env.RESEND_FROM_EMAIL ||
      "Lumispire <onboarding@resend.dev>"
  );
}

function getContactRecipient() {
  return cleanText(
    process.env.TRAINING_CONTACT_RECIPIENT ||
      "crmstechalliance.work@gmail.com"
  );
}

export async function sendTrainingContactMessageEmail({ name, email, subject, message }) {
  const safeName = escapeHtml(name);
  const safeEmail = escapeHtml(email);
  const safeSubject = escapeHtml(subject);
  const safeMessage = escapeHtml(message).replace(/\n/g, "<br />");

  const result = await getResendClient().emails.send({
    from: getFromAddress(),
    to: getContactRecipient(),
    replyTo: cleanText(email),
    subject: `Training Contact Message: ${cleanText(subject)}`,
    text: [
      "New Training & Assessment Contact Message",
      "",
      `Name: ${cleanText(name)}`,
      `Email: ${cleanText(email)}`,
      `Subject: ${cleanText(subject)}`,
      "",
      "Message:",
      cleanText(message),
    ].join("\n"),
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.6;color:#1f2937;background:#f6f8f6;padding:24px;">
        <div style="max-width:640px;margin:auto;background:#fff;border-radius:16px;overflow:hidden;border:1px solid #e5e7eb;">
          <div style="background:#082719;color:#fff;padding:22px 24px;">
            <h2 style="margin:0;font-size:22px;">New Training &amp; Assessment Contact Message</h2>
            <p style="margin:6px 0 0;color:#d1fae5;">TAMSI Contact Form</p>
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
    `,
  });

  if (result?.error) throw new Error(result.error.message || "Resend failed to send email.");
  return result;
}

export default sendTrainingContactMessageEmail;
