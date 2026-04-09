import nodemailer from "nodemailer";

/**
 * Send an email using Nodemailer + Brevo SMTP
 * @param {Object} options
 * @param {string} options.email - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.message - Email body (HTML)
 */
const sendEmail = async (options) => {
  // Create transporter
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp-relay.brevo.com",
    port: Number(process.env.SMTP_PORT) || 587,
    secure: false, // false for port 587 (STARTTLS)
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    // Timeouts to prevent hanging connections
    connectionTimeout: 10000, // 10 seconds to establish connection
    greetingTimeout: 10000,   // 10 seconds for server greeting
    socketTimeout: 15000,     // 15 seconds for socket inactivity
    tls: {
      rejectUnauthorized: false, // Allow self-signed certs in dev
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
