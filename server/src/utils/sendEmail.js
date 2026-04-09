import nodemailer from "nodemailer";

/**
 * Send an email using Nodemailer
 * @param {Object} options - Email options
 * @param {string} options.email - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.message - Email body (HTML or plain text)
 */
const sendEmail = async (options) => {
    // Create a transporter using Brevo SMTP
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || "smtp-relay.brevo.com",
        port: process.env.SMTP_PORT || 587,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    });

    // Define the email options
    const fromName = process.env.FROM_NAME || "Mentovara";
    const mailOptions = {
        from: `${fromName} <${process.env.FROM_EMAIL}>`,
        to: options.email,
        subject: options.subject,
        html: options.message, // Assuming we pass HTML messages
    };

    // Send the email
    await transporter.sendMail(mailOptions);
};

export default sendEmail;
