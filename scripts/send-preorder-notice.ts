// send-preorder-notice.ts
// Sends a preorder delivery notice to every customer with a paid order.
// Deliveries start July 1st, 2026.
//
// Run: npx ts-node --esm scripts/send-preorder-notice.ts

import { createClient } from "@supabase/supabase-js";
import { resolve } from "path";

async function loadEnv() {
  const { config } = await import("dotenv");
  const root = resolve(process.cwd());
  config({ path: resolve(root, ".env.local") });
  config({ path: resolve(root, ".env") });
}

// ── Brevo helper ───────────────────────────────────────────────────────────────

const BREVO_API = "https://api.brevo.com/v3";

const CC_EMAIL = "onyeiborjohn05@gmail.com";

async function sendEmail({
  to,
  subject,
  htmlContent,
}: {
  to: { email: string; name?: string }[];
  subject: string;
  htmlContent: string;
}) {
  const res = await fetch(`${BREVO_API}/smtp/email`, {
    method: "POST",
    headers: {
      "api-key": process.env.BREVO_API_KEY!,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      sender: {
        email: process.env.BREVO_SENDER_EMAIL!,
        name: process.env.BREVO_SENDER_NAME!,
      },
      to,
      cc: [{ email: CC_EMAIL, name: "Johnex" }],
      subject,
      htmlContent,
    }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(`Brevo error: ${(body as { message?: string })?.message ?? res.statusText}`);
  }
}

// ── Preorder notice template ───────────────────────────────────────────────────
// Mirrors preorderNoticeEmail() from lib/email-templates.ts exactly.

function buildPreorderNoticeEmail({
  customerName,
  orderRef,
  storeUrl,
}: {
  customerName: string;
  orderRef: string;
  storeUrl: string;
}): string {
  const year = new Date().getFullYear();
  const trackUrl = `${storeUrl}/track-order`;

  return `<!doctype html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="color-scheme" content="light dark" />
    <meta name="supported-color-schemes" content="light dark" />
    <title>Delivery Update — NFTNG Store</title>
    <style>
      @media only screen and (max-width: 600px) {
        .outer-table { padding: 0 !important; }
        .card { width: 100% !important; border-radius: 0 !important; }
        .body-pad { padding: 32px 20px !important; }
      }
      a.cta-btn:hover { opacity: 0.88; }
      @media (prefers-color-scheme: dark) {
        .outer-bg { background-color: #111111 !important; }
        .body-section { background-color: #1c1c1e !important; }
        .body-text { color: #e5e5ea !important; }
        .body-subtext { color: #aeaeb2 !important; }
        .body-strong { color: #ffffff !important; }
        .order-card { background-color: #1d2d1a !important; }
        .notice-card { background-color: #1d2d1a !important; }
        .divider { background-color: #3a3a3c !important; }
      }
      [data-ogsc] .outer-bg { background-color: #111111 !important; }
      [data-ogsc] .body-section { background-color: #1c1c1e !important; }
      [data-ogsc] .body-text { color: #e5e5ea !important; }
      [data-ogsc] .body-subtext { color: #aeaeb2 !important; }
      [data-ogsc] .body-strong { color: #ffffff !important; }
      [data-ogsc] .order-card { background-color: #1d2d1a !important; }
      [data-ogsc] .notice-card { background-color: #1d2d1a !important; }
    </style>
  </head>
  <body id="body" style="margin:0;padding:0;background-color:#f4f4f4;font-family:&quot;SF Pro Display&quot;,-apple-system,BlinkMacSystemFont,&quot;Helvetica Neue&quot;,Arial,sans-serif;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;">
    <table class="outer-bg" width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background-color:#f4f4f4"><tr><td height="1" style="font-size:0;line-height:0;">&nbsp;</td></tr></table>
    <table class="outer-table outer-bg" width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background-color:#f4f4f4;padding:40px 16px">
      <tr><td align="center" valign="top">
        <table class="card" width="600" cellpadding="0" cellspacing="0" role="presentation" style="max-width:600px;width:100%;border-radius:8px">

          <tr><td style="background-color:#1d1d1d;padding:0;border-radius:8px 8px 0 0">
            <img src="https://mzdrwobmpgozupoxqqyc.supabase.co/storage/v1/object/public/email%20images/reg-mail-header-4x.png" width="600" height="130" alt="Unchain Summer 2026, The North Star" style="width:100%;max-width:600px;height:auto;display:block;border-radius:8px 8px 0 0" />
          </td></tr>

          <tr><td class="body-pad body-section" style="background-color:#ffffff;padding:40px">
            <p class="body-text" style="margin:0 0 6px;font-size:16px;font-weight:600;color:#1a1a1a;line-height:1.75">Hey ${customerName} 👋</p>
            <p class="body-subtext" style="margin:0 0 28px;font-size:15px;font-weight:400;color:#444444;line-height:1.75">We have an update on your Unchain Summer 2026 merch order. Read on for the details.</p>

            <table width="100%" cellpadding="0" cellspacing="0" role="presentation" class="order-card" style="background-color:#f9fff5;border-left:4px solid #6ec93e;border-radius:0 8px 8px 0;margin-bottom:28px">
              <tr><td style="padding:20px 24px">
                <p style="margin:0 0 4px;font-size:11px;font-weight:700;color:#6ec93e;text-transform:uppercase;letter-spacing:1.5px">Your Order ID</p>
                <p class="body-strong" style="margin:0;font-size:22px;font-weight:800;color:#1a1a1a;letter-spacing:-0.5px">${orderRef}</p>
                <p class="body-subtext" style="margin:6px 0 0;font-size:13px;color:#888888">Save this &mdash; you&rsquo;ll need it to track your order.</p>
              </td></tr>
            </table>

            <table width="100%" cellpadding="0" cellspacing="0" role="presentation" class="notice-card" style="background-color:#f9fff5;border-left:4px solid #6ec93e;border-radius:0 8px 8px 0;margin-bottom:28px">
              <tr><td style="padding:20px 24px">
                <p style="margin:0 0 4px;font-size:11px;font-weight:700;color:#6ec93e;text-transform:uppercase;letter-spacing:1.5px">Delivery Update</p>
                <p class="body-strong" style="margin:0 0 8px;font-size:15px;font-weight:700;color:#1a1a1a">Deliveries start July 1st, 2026</p>
                <p class="body-subtext" style="margin:0;font-size:14px;color:#444444;line-height:1.75">Your order is a preorder &mdash; all Unchain Summer 2026 merch is scheduled to begin shipping on <strong class="body-strong" style="color:#1a1a1a;font-weight:700">July 1st, 2026</strong>. We&rsquo;ll send you a shipping notification the moment your order is on its way. Thanks for your patience!</p>
              </td></tr>
            </table>

            <table class="divider" width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin:0 0 28px"><tr><td height="1" style="background-color:#f0f0f0;font-size:0;line-height:0;">&nbsp;</td></tr></table>

            <table cellpadding="0" cellspacing="0" role="presentation" style="margin:0 auto 32px">
              <tr><td style="background-color:#6ec93e;border-radius:8px;text-align:center">
                <a class="cta-btn" href="${trackUrl}" style="display:inline-block;padding:16px 40px;font-size:15px;font-weight:700;color:#ffffff;text-decoration:none;letter-spacing:0.3px">Track Your Order</a>
              </td></tr>
            </table>

            <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
              <tr>
                <td valign="top" style="padding-right:16px">
                  <p class="body-text" style="margin:0 0 8px;font-size:15px;font-weight:600;color:#1a1a1a">Got questions?</p>
                  <p class="body-subtext" style="margin:0;font-size:15px;color:#444444;line-height:1.75">Reach us at <a href="mailto:support@nftng.io" style="color:#6ec93e;text-decoration:none;font-weight:600">support@nftng.io</a></p>
                </td>
                <td valign="bottom" align="right" style="width:140px">
                  <img src="https://mzdrwobmpgozupoxqqyc.supabase.co/storage/v1/object/public/email%20images/axis.png" width="140" height="109" alt="" style="display:block;width:140px;height:auto" />
                </td>
              </tr>
            </table>

            <p class="body-subtext" style="margin:-60px 0 0;font-size:15px;color:#444444;line-height:1.75">Thanks for your order.<br /><strong style="color:#6ec93e">The NFTNG Team</strong></p>
          </td></tr>

          <tr><td style="background-color:#1d1d1d;border-radius:0 0 8px 8px;padding:32px 48px;text-align:center">
            <table cellpadding="0" cellspacing="0" role="presentation" style="margin:0 auto 24px">
              <tr>
                <td style="padding:0 10px"><a href="https://x.com/NFT__NG" style="text-decoration:none"><img src="https://mzdrwobmpgozupoxqqyc.supabase.co/storage/v1/object/public/email%20images/twitter-grey.png" width="24" height="24" alt="X" style="width:24px;height:24px;display:block" /></a></td>
                <td style="padding:0 10px"><a href="https://www.instagram.com/nft__ng" style="text-decoration:none"><img src="https://mzdrwobmpgozupoxqqyc.supabase.co/storage/v1/object/public/email%20images/instagram-grey.png" width="24" height="24" alt="Instagram" style="width:24px;height:24px;display:block" /></a></td>
              </tr>
            </table>
            <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin-bottom:20px"><tr><td style="border-top:1px solid rgba(255,255,255,0.15);font-size:0;line-height:0;">&nbsp;</td></tr></table>
            <p style="margin:0 0 6px;font-size:12px;color:rgba(255,255,255,0.65);line-height:1.8">&copy; ${year} NFTNG &nbsp;&middot;&nbsp; Unchain Summer 2026 &nbsp;&middot;&nbsp; Lagos, Nigeria</p>
            <p style="margin:0 0 14px;font-size:12px;color:rgba(255,255,255,0.5);line-height:1.8">Powered by NFTNG &nbsp;&middot;&nbsp; <a href="mailto:support@nftng.io" style="color:rgba(255,255,255,0.5);text-decoration:none">support@nftng.io</a></p>
            <p style="margin:0;font-size:11px;color:rgba(255,255,255,0.35);line-height:1.7;font-style:italic">You received this email because you placed an order on unchainsummer.nftng.io.</p>
          </td></tr>
        </table>
      </td></tr>
    </table>
  </body>
</html>`;
}

// ── Main ───────────────────────────────────────────────────────────────────────

async function main() {
  await loadEnv();

  const STORE_URL = (process.env.NEXT_PUBLIC_APP_URL ?? "").replace(/\/$/, "");

  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  console.log("🔍 Fetching all paid orders...");

  const { data: orders, error } = await supabase
    .from("orders")
    .select("order_ref, user_name, user_email")
    .in("status", ["paid", "in_progress", "complete"])
    .order("created_at", { ascending: true });

  if (error) {
    console.error("❌ Supabase error:", error.message);
    process.exit(1);
  }

  if (!orders || orders.length === 0) {
    console.log("⚠️  No paid orders found.");
    process.exit(0);
  }

  // Deduplicate by email — send one email per customer, using their most recent order ref
  const seen = new Map<string, { user_name: string; order_ref: string }>();
  for (const o of orders) {
    seen.set(o.user_email, { user_name: o.user_name, order_ref: o.order_ref });
  }

  const recipients = Array.from(seen.entries());
  console.log(`📦 Sending preorder notice to ${recipients.length} unique customer(s)...`);

  let sent = 0;
  let failed = 0;

  for (const [email, { user_name, order_ref }] of recipients) {
    const html = buildPreorderNoticeEmail({
      customerName: user_name,
      orderRef: order_ref,
      storeUrl: STORE_URL,
    });

    try {
      await sendEmail({
        to: [{ email, name: user_name }],
        subject: "Your Unchain Summer 2026 Order — Delivery Update",
        htmlContent: html,
      });
      console.log(`✅ Sent to ${email} (${order_ref})`);
      sent++;
    } catch (err) {
      console.error(`❌ Failed for ${email}:`, (err as Error).message);
      failed++;
    }

    // Brief pause to respect Brevo rate limits (3 req/s on free plan)
    await new Promise((r) => setTimeout(r, 400));
  }

  console.log(`\n📊 Done — ${sent} sent, ${failed} failed`);
}

main().catch(console.error);
