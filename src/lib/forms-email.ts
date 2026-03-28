import { Resend } from "resend";

export const FREE_KIT_DOWNLOAD_PATH = "/downloads/qld-car-buyers-kit-content.md";

const FROM = "Buying Buddy <info@buyingbuddy.com.au>";
const INFO_EMAIL = "info@buyingbuddy.com.au";
const BRAND_TEAL = "#0D9488";

function getResend() {
  const apiKey = process.env.RESEND_API_KEY?.trim();

  if (!apiKey) {
    throw new Error("RESEND_API_KEY is not configured.");
  }

  return new Resend(apiKey);
}

export function isResendConfigured() {
  return Boolean(process.env.RESEND_API_KEY?.trim());
}

function wrapEmail(content: string) {
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Buying Buddy</title>
    <style>
      body {
        margin: 0;
        padding: 0;
        background: #f5f7fb;
        font-family: Arial, Helvetica, sans-serif;
        color: #111827;
      }

      .shell {
        max-width: 640px;
        margin: 32px auto;
        background: #ffffff;
        border-radius: 18px;
        overflow: hidden;
        border: 1px solid #e5e7eb;
      }

      .header {
        background: ${BRAND_TEAL};
        color: #ffffff;
        padding: 28px 32px;
      }

      .header h1 {
        margin: 0;
        font-size: 24px;
        line-height: 1.1;
      }

      .body {
        padding: 28px 32px;
      }

      .body p,
      .body li {
        font-size: 15px;
        line-height: 1.65;
      }

      .body ul {
        padding-left: 20px;
      }

      .button {
        display: inline-block;
        padding: 14px 24px;
        border-radius: 999px;
        background: ${BRAND_TEAL};
        color: #ffffff !important;
        text-decoration: none;
        font-weight: 700;
        margin-top: 8px;
      }

      .card {
        margin: 20px 0;
        padding: 18px;
        border-radius: 14px;
        background: #f0fdfa;
        border: 1px solid #ccfbf1;
      }

      .footer {
        padding: 18px 32px 28px;
        color: #6b7280;
        font-size: 12px;
      }

      .footer a {
        color: ${BRAND_TEAL};
      }
    </style>
  </head>
  <body>
    <div class="shell">
      ${content}
      <div class="footer">
        <p>Buying Buddy | Brisbane, Australia</p>
        <p><a href="https://buyingbuddy.com.au">buyingbuddy.com.au</a> | <a href="mailto:${INFO_EMAIL}">${INFO_EMAIL}</a></p>
      </div>
    </div>
  </body>
</html>`;
}

export async function sendFreeKitWelcomeEmail({
  name,
  email,
}: {
  name: string;
  email: string;
}) {
  const resend = getResend();
  const downloadUrl = `https://buyingbuddy.com.au${FREE_KIT_DOWNLOAD_PATH}`;

  const welcomeHtml = wrapEmail(`
    <div class="header">
      <h1>Your QLD buyer protection kit is ready</h1>
    </div>
    <div class="body">
      <p>Hi ${name},</p>
      <p>Here is your free QLD Used Car Buyer's Protection Kit. It covers the checks that stop you buying a headache, not just the stuff sellers want you looking at.</p>
      <div class="card">
        <p><strong>Inside the kit:</strong></p>
        <ul>
          <li>A 20-point pre-purchase checklist</li>
          <li>A plain-English PPSR guide</li>
          <li>The contract details private buyers forget</li>
          <li>Negotiation scripts you can actually use</li>
          <li>Red flags that mean walk away</li>
        </ul>
      </div>
      <p>If you want a second set of eyes before you buy, you can also run a check or book a pre-purchase inspection through Buying Buddy.</p>
      <p><a class="button" href="${downloadUrl}">Download the free kit</a></p>
    </div>
  `);

  const leadAlertHtml = wrapEmail(`
    <div class="header">
      <h1>New free kit lead</h1>
    </div>
    <div class="body">
      <div class="card">
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
      </div>
      <p>This lead downloaded the QLD Used Car Buyer's Protection Kit.</p>
    </div>
  `);

  await resend.emails.send({
    from: FROM,
    to: email,
    subject: "Your free QLD used car buyer kit",
    html: welcomeHtml,
  });

  await resend.emails.send({
    from: FROM,
    to: INFO_EMAIL,
    subject: `New free kit lead: ${name}`,
    html: leadAlertHtml,
  });
}

export async function sendPpiInquiryEmail({
  name,
  phone,
  email,
  carDetails,
  location,
  preferredDate,
}: {
  name: string;
  phone: string;
  email: string;
  carDetails: string;
  location: string;
  preferredDate: string;
}) {
  const resend = getResend();

  const inquiryHtml = wrapEmail(`
    <div class="header">
      <h1>New pre-purchase inspection inquiry</h1>
    </div>
    <div class="body">
      <div class="card">
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Phone:</strong> ${phone}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Car details:</strong> ${carDetails}</p>
        <p><strong>Location:</strong> ${location}</p>
        <p><strong>Preferred date:</strong> ${preferredDate}</p>
      </div>
      <p>Follow up with the buyer and line up the inspection referral.</p>
    </div>
  `);

  await resend.emails.send({
    from: FROM,
    to: INFO_EMAIL,
    replyTo: email,
    subject: `PPI inquiry: ${carDetails}`,
    html: inquiryHtml,
  });
}
