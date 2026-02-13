const nodemailer = require('nodemailer');

let transporter = null;

function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: false,
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

module.exports = { sendNewProductsEmail };
