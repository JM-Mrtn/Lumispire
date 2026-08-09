import { sendManpowerContactMessageEmail } from "../utils/manpowerContactEmailHelpers.js";

function cleanText(value = "") {
  return String(value || "").trim();
}

function isValidEmail(email = "") {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanText(email));
}

export async function sendManpowerContactMessage(req, res) {
  try {
    const body = req.body || {};
    const name = cleanText(body.name);
    const email = cleanText(body.email).toLowerCase();
    const subject = cleanText(body.subject);
    const message = cleanText(body.message);

    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: "Name, email, subject, and message are required.",
      });
    }

    if (name.length < 2 || name.length > 100) {
      return res.status(400).json({
        success: false,
        message: "Name must contain between 2 and 100 characters.",
      });
    }

    if (!isValidEmail(email) || email.length > 254) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email address.",
      });
    }

    if (subject.length < 3 || subject.length > 160) {
      return res.status(400).json({
        success: false,
        message: "Subject must contain between 3 and 160 characters.",
      });
    }

    if (message.length < 10 || message.length > 5000) {
      return res.status(400).json({
        success: false,
        message: "Message must contain between 10 and 5,000 characters.",
      });
    }

    await sendManpowerContactMessageEmail({ name, email, subject, message });

    return res.status(200).json({
      success: true,
      message: "Your message was sent successfully.",
    });
  } catch (error) {
    console.error("sendManpowerContactMessage error:", error);

    return res.status(500).json({
      success: false,
      message: error?.message || "Failed to send contact message.",
    });
  }
}
