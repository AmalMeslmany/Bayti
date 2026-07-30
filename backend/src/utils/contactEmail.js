const nodemailer = require("nodemailer");

const CONTACT_RECIPIENT = "amal.alimeslmany@gmail.com";
const CONTACT_SUBJECT = "New Contact Message - Bayti";

function getRequiredEnv(name) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`${name} is missing. Add it to backend/.env.`);
  }

  return value;
}

function createTransporter() {
  return nodemailer.createTransport({
    host: getRequiredEnv("SMTP_HOST"),
    port: Number(getRequiredEnv("SMTP_PORT")),
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: getRequiredEnv("SMTP_USER"),
      pass: getRequiredEnv("SMTP_PASS"),
    },
  });
}

async function sendContactEmail({ name, email, message }) {
  const fromAddress = getRequiredEnv("SMTP_FROM");
  const transporter = createTransporter();

  await transporter.sendMail({
    from: fromAddress,
    to: CONTACT_RECIPIENT,
    subject: CONTACT_SUBJECT,
    replyTo: email,
    text: `Name:\n${name}\n\nEmail:\n${email}\n\nMessage:\n${message}`,
  });
}

module.exports = sendContactEmail;
