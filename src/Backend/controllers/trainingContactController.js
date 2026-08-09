import { sendTrainingContactMessageEmail } from "../utils/trainingEmailHelpers.js";

function cleanText(value = "") {
  return String(value || "").trim();
}

function isValidEmail(email = "") {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanText(email));
}

export async function sendTrainingContactMessage(req, res) {
  try {
    const name = cleanText(req.body.name);
    const email = cleanText(req.body.email).toLowerCase();
    const subject = cleanText(req.body.subject);
    const message = cleanText(req.body.message);

    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: "Name, email, subject, and message are required.",
      });
    }

    if (name.length < 2 || subject.length < 3 || message.length < 10) {
      return res.status(400).json({
        success: false,
        message: "Please check the minimum length required for each field.",
      });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ success: false, message: "Please enter a valid email address." });
    }

    await sendTrainingContactMessageEmail({ name, email, subject, message });
    return res.status(200).json({ success: true, message: "Your message was sent successfully." });
  } catch (error) {
    console.error("sendTrainingContactMessage error:", error);
    return res.status(500).json({
      success: false,
      message: error?.message || "Failed to send contact message.",
    });
  }
}
