import nodemailer from "nodemailer";
import dns from "dns";

// Force IPv4 DNS resolution (Render free tier doesn't support IPv6 outbound)
dns.setDefaultResultOrder("ipv4first");

/**
 * Send an email using Nodemailer + Gmail SMTP
 * @param {Object} options
 * @param {string} options.email - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.message - Email body (HTML)
 */
const sendEmail = async (options) => {
  // Create transporter
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: Number(process.env.SMTP_PORT) || 587,
    secure: false, // false for port 587 (STARTTLS)
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    // Timeouts to prevent hanging connections
    connectionTimeout: 15000, // 15 seconds to establish connection
    greetingTimeout: 15000,   // 15 seconds for server greeting
    socketTimeout: 20000,     // 20 seconds for socket inactivity
    tls: {
      rejectUnauthorized: false,
    },
    // Force IPv4 at socket level too
    dnsOptions: {
      family: 4,
    },
  });

  const fromName = process.env.FROM_NAME || "Mentovara";

  const mailOptions = {
    from: `"${fromName}" <${process.env.FROM_EMAIL}>`,
    to: options.email,
    subject: options.subject,
    html: options.message,
  };

  // Send email
  const info = await transporter.sendMail(mailOptions);

  console.log(`✅ Email sent successfully! Message ID: ${info.messageId}`);
  return info;
};

export default sendEmail;
