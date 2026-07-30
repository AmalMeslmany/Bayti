const sendContactEmail = require("../utils/contactEmail");
const ContactMessage = require("../models/ContactMessage");

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const submissionsByIp = new Map();
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;
const RATE_LIMIT_MAX_SUBMISSIONS = 3;

function getTrimmedString(value) {
  return typeof value === "string" ? value.trim() : "";
}

function isRateLimited(ipAddress) {
  const now = Date.now();
  const record = submissionsByIp.get(ipAddress) || {
    count: 0,
    resetAt: now + RATE_LIMIT_WINDOW_MS,
  };

  if (now > record.resetAt) {
    record.count = 0;
    record.resetAt = now + RATE_LIMIT_WINDOW_MS;
  }

  record.count += 1;
  submissionsByIp.set(ipAddress, record);

  return record.count > RATE_LIMIT_MAX_SUBMISSIONS;
}

async function sendContactMessage(req, res) {
  try {
    if (isRateLimited(req.ip)) {
      return res.status(429).json({
        status: "error",
        message: "Too many messages. Please try again later.",
      });
    }

    const name = getTrimmedString(req.body.name);
    const email = getTrimmedString(req.body.email);
    const message = getTrimmedString(req.body.message);

    if (!name || !email || !message) {
      return res.status(400).json({
        status: "error",
        message: "Name, email, and message are required.",
      });
    }

    if (!emailPattern.test(email)) {
      return res.status(400).json({
        status: "error",
        message: "Please enter a valid email address.",
      });
    }

    await ContactMessage.create({ name, email, message });
    await sendContactEmail({ name, email, message });

    return res.status(200).json({
      status: "success",
      message: "Your message has been sent successfully.",
    });
  } catch (error) {
    console.error(`Contact email error: ${error.message}`);

    return res.status(500).json({
      status: "error",
      message: "Unable to send your message right now. Please try again later.",
    });
  }
}

module.exports = {
  sendContactMessage,
};
