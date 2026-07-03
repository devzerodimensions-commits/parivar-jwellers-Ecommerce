import nodemailer from 'nodemailer';

// Is real email delivery configured?
export const isEmailConfigured = () =>
  !!(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);

/**
 * Send an email via SMTP.
 *
 * Returns { delivered: true, messageId } on success.
 * If SMTP is NOT configured, returns { delivered: false, previewOnly: true }
 * (and logs the message) instead of pretending it was sent.
 * If SMTP IS configured but sending fails, this THROWS so callers can surface
 * the error instead of failing silently.
 */
const sendEmail = async ({ to, subject, html, text }) => {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM } = process.env;

  if (!isEmailConfigured()) {
    console.warn('\n⚠  Email NOT sent — SMTP is not configured. Set SMTP_HOST/SMTP_USER/SMTP_PASS in backend/.env.');
    console.warn(`   To: ${to}\n   Subject: ${subject}\n   ${text || ''}\n`);
    return { delivered: false, previewOnly: true };
  }

  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT) || 587,
    secure: Number(SMTP_PORT) === 465, // true for 465, false for 587/25 (STARTTLS)
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });

  // Verify the connection/credentials up front so failures are explicit.
  await transporter.verify();

  const info = await transporter.sendMail({
    from: SMTP_FROM || `Parivar Jewellers <${SMTP_USER}>`,
    to,
    subject,
    text,
    html,
  });

  console.log(`✔  Email sent to ${to} (messageId ${info.messageId})`);
  return { delivered: true, messageId: info.messageId };
};

export default sendEmail;
