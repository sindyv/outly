const nodemailer = require('nodemailer');

let transporter = null;

function getTransporter() {
  if (!transporter) {
    const port = Number(process.env.SMTP_PORT) || 587;
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port,
      secure: port === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }
  return transporter;
}

async function sendNewProductsEmail(toEmail, products) {
  if (!process.env.SMTP_HOST) {
    console.log(`[Notifier] SMTP not configured — skipping email to ${toEmail} (${products.length} products)`);
    return;
  }

  const productList = products
    .map(
      (p) =>
        `• ${p.name} (${p.brand}) — ${p.outletPrice} kr (was ${p.originalPrice} kr)\n  https://www.elkjop.no${p.href}`
    )
    .join('\n\n');

  const mailOptions = {
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to: toEmail,
    subject: `Elkjøp Outlet: ${products.length} new product(s) matching your search`,
    text: `Hi!\n\nNew outlet products matching your saved searches:\n\n${productList}\n\n— Elkjøp Outlet Tracker`,
  };

  await getTransporter().sendMail(mailOptions);
  console.log(`[Notifier] Email sent to ${toEmail}`);
}

async function sendVerificationEmail(toEmail, token) {
  if (!process.env.SMTP_HOST) {
    console.log(`[Notifier] SMTP not configured — skipping verification email to ${toEmail}`);
    return;
  }

  const baseUrl = process.env.BASE_URL || 'http://localhost:5173';
  const verifyLink = `${baseUrl}/api/auth/verify?token=${token}`;

  const mailOptions = {
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to: toEmail,
    subject: 'Bekreft e-postadressen din — Elkjøp Outlet Tracker',
    text: `Hei!\n\nKlikk på lenken under for å bekrefte e-postadressen din:\n\n${verifyLink}\n\nLenken er gyldig i 24 timer.\n\n— Elkjøp Outlet Tracker`,
  };

  await getTransporter().sendMail(mailOptions);
  console.log(`[Notifier] Verification email sent to ${toEmail}`);
}

module.exports = { sendNewProductsEmail, sendVerificationEmail };
