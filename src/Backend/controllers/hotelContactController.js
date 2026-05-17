import { sendHotelContactMessageEmail } from "../utils/hotelEmailHelpers.js";

function cleanText(value = "") {
  return String(value || "").trim();
}

function isValidEmail(email = "") {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || "").trim());
}

export const sendHotelContactMessage = async (req, res) => {
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

    if (!isValidEmail(email)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email address.",
      });
    }

    if (message.length < 10) {
      return res.status(400).json({
        success: false,
        message: "Message must be at least 10 characters.",
      });
    }

    await sendHotelContactMessageEmail({
      name,
      email,
      subject,
      message,
    });

    return res.status(200).json({
      success: true,
      message: "Your message was sent successfully.",
    });
  } catch (error) {
    console.error("sendHotelContactMessage error:", error);

    return res.status(500).json({
      success: false,
      message: error?.message || "Failed to send contact message.",
    });
  }
};