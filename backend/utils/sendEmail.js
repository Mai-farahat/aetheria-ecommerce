import nodemailer from 'nodemailer';

const sendEmail = async (options) => {
  const isMailConfigured = !!(
    process.env.SMTP_HOST &&
    process.env.SMTP_PORT &&
    process.env.SMTP_USER &&
    process.env.SMTP_PASS
  );

  if (isMailConfigured) {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const message = {
      from: `${process.env.SMTP_FROM || 'noreply@example.com'}`,
      to: options.email,
      subject: options.subject,
      text: options.message,
      html: options.html || undefined,
    };

    const info = await transporter.sendMail(message);
    console.log(`Email sent successfully: ${info.messageId}`);
  } else {
    // Graceful Console Fallback
    console.log('--------------------------------------------------');
    console.log('📧 EMAIL SIMULATION FALLBACK (No SMTP keys configured)');
    console.log(`To:      ${options.email}`);
    console.log(`Subject: ${options.subject}`);
    console.log(`Body:    ${options.message}`);
    if (options.html) {
      console.log(`HTML:    Included (${options.html.length} chars)`);
    }
    console.log('--------------------------------------------------');
  }
};

export default sendEmail;
