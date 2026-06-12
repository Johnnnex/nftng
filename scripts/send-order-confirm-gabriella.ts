// send-order-confirm-gabriella.ts
// Sends the order confirmation email to Gabriella (whose original email had a typo)
// and CCs onyeiborjohn05@gmail.com for verification.
//
// Run: npx ts-node --esm scripts/send-order-confirm-gabriella.ts

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { resolve } from "path";

async function loadEnv() {
  const { config } = await import("dotenv");
  const root = resolve(process.cwd());
  config({ path: resolve(root, ".env.local") });
  config({ path: resolve(root, ".env") });
}

// ── Brevo helpers ──────────────────────────────────────────────────────────────

const BREVO_API = "https://api.brevo.com/v3";

async function sendEmail({
  to,
  cc,
  subject,
  htmlContent,
}: {
  to: { email: string; name?: string }[];
  cc?: { email: string; name?: string }[];
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
      ...(cc && cc.length > 0 ? { cc } : {}),
      subject,
      htmlContent,
    }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(`Brevo error: ${(body as { message?: string })?.message ?? res.statusText}`);
  }
}

// ── Email template ─────────────────────────────────────────────────────────────
// This mirrors orderConfirmEmail() from lib/email-templates.ts exactly.

type OrderEmailItem = {
  title: string;
  image: string | null;
  variantCombo: Record<string, string>;
  quantity: number;
  unitPrice: number;
};

function buildOrderConfirmEmail({
  customerName,
  orderRef,
  items,
  subtotal,
  deliveryFee,
  discountAmount,
  totalAmount,
  deliveryAddress,
  storeUrl,
}: {
  customerName: string;
  orderRef: string;
  items: OrderEmailItem[];
  subtotal: number;
  deliveryFee: number;
  discountAmount: number;
  totalAmount: number;
  deliveryAddress: string;
  storeUrl: string;
}): string {
  const year = new Date().getFullYear();
  const trackUrl = `${storeUrl}/track-order`;

  const itemRows = items.map((item) => {
    const comboLabel = Object.entries(item.variantCombo).map(([k, v]) => `${k}: ${v}`).join(" · ");
    const lineTotal = (item.unitPrice * item.quantity).toLocaleString("en-NG");
    const imgCell = item.image
      ? `<img src="${item.image}" width="64" height="64" alt="${item.title}" class="item-img" style="width:64px;height:64px;border-radius:6px;object-fit:cover;display:block;" />`
      : `<div style="width:64px;height:64px;border-radius:6px;background-color:#f0f0f0;">&nbsp;</div>`;
    return `<table class="item-row-bg" width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin-bottom:10px;background-color:#fafafa;border-radius:8px;"><tr><td style="padding:14px 16px;"><table width="100%" cellpadding="0" cellspacing="0" role="presentation"><tr><td width="64" valign="top" style="padding-right:14px;">${imgCell}</td><td valign="top"><p class="body-strong" style="margin:0 0 3px;font-size:14px;font-weight:600;color:#1a1a1a;line-height:1.4;">${item.title}</p>${comboLabel ? `<p class="body-subtext" style="margin:0 0 3px;font-size:12px;color:#888;">${comboLabel}</p>` : ""}<p class="body-subtext" style="margin:0;font-size:12px;color:#888;">Qty: ${item.quantity}</p></td><td valign="top" style="text-align:right;white-space:nowrap;"><p class="body-strong" style="margin:0;font-size:14px;font-weight:700;color:#1a1a1a;">₦${lineTotal}</p></td></tr></table></td></tr></table>`;
  }).join("\n");

  const deliveryRow = deliveryFee > 0
    ? `<tr><td height="8"></td></tr><tr><td width="48%" valign="top" class="pill-bg" style="background-color:#f4f4f4;border-radius:8px;padding:16px 20px;"><p class="pill-label" style="margin:0 0 4px;font-size:11px;font-weight:700;color:#888;text-transform:uppercase;letter-spacing:1.5px;">Delivery Fee</p><p class="pill-text" style="margin:0;font-size:15px;font-weight:600;color:#1a1a1a;">₦${deliveryFee.toLocaleString("en-NG")}</p></td>${discountAmount > 0 ? `<td width="4%"></td><td width="48%" valign="top" class="pill-bg" style="background-color:#f4f4f4;border-radius:8px;padding:16px 20px;"><p class="pill-label" style="margin:0 0 4px;font-size:11px;font-weight:700;color:#888;text-transform:uppercase;letter-spacing:1.5px;">Discount</p><p style="margin:0;font-size:15px;font-weight:600;color:#dc2626;">−₦${discountAmount.toLocaleString("en-NG")}</p></td>` : "<td></td>"}</tr>`
    : "";

  const addressSection = deliveryAddress
    ? `<table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin-bottom:28px;"><tr><td class="pill-bg" style="background-color:#f4f4f4;border-radius:8px;padding:16px 20px;"><p class="pill-label" style="margin:0 0 6px;font-size:11px;font-weight:700;color:#888;text-transform:uppercase;letter-spacing:1.5px;">Delivery Address</p><p class="pill-text" style="margin:0;font-size:14px;color:#1a1a1a;line-height:1.6;">${deliveryAddress}</p></td></tr></table>`
    : "";

  return `<!doctype html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="color-scheme" content="light dark" />
    <meta name="supported-color-schemes" content="light dark" />
    <title>Order Confirmed — NFTNG Store</title>
    <style>
      @media only screen and (max-width: 600px) {
        .outer-table { padding: 0 !important; }
        .card { width: 100% !important; border-radius: 0 !important; }
        .body-pad { padding: 32px 20px !important; }
        .item-img { width: 56px !important; height: 56px !important; }
      }
      a.cta-btn:hover { opacity: 0.88; }
      @media (prefers-color-scheme: dark) {
        .outer-bg { background-color: #111111 !important; }
        .body-section { background-color: #1c1c1e !important; }
        .body-text { color: #e5e5ea !important; }
        .body-subtext { color: #aeaeb2 !important; }
        .body-strong { color: #ffffff !important; }
        .pill-bg { background-color: #2c2c2e !important; }
        .pill-text { color: #e5e5ea !important; }
        .pill-label { color: #aeaeb2 !important; }
        .order-card { background-color: #1d2d1a !important; }
        .item-row-bg { background-color: #2c2c2e !important; }
        .divider { background-color: #3a3a3c !important; }
      }
      [data-ogsc] .outer-bg { background-color: #111111 !important; }
      [data-ogsc] .body-section { background-color: #1c1c1e !important; }
      [data-ogsc] .body-text { color: #e5e5ea !important; }
      [data-ogsc] .body-subtext { color: #aeaeb2 !important; }
      [data-ogsc] .body-strong { color: #ffffff !important; }
      [data-ogsc] .pill-bg { background-color: #2c2c2e !important; }
      [data-ogsc] .pill-text { color: #e5e5ea !important; }
      [data-ogsc] .pill-label { color: #aeaeb2 !important; }
      [data-ogsc] .order-card { background-color: #1d2d1a !important; }
      [data-ogsc] .item-row-bg { background-color: #2c2c2e !important; }
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
            <p class="body-subtext" style="margin:0 0 28px;font-size:15px;font-weight:400;color:#444444;line-height:1.75">Your order is confirmed and we're getting your items ready. Here's your summary.</p>

            <table width="100%" cellpadding="0" cellspacing="0" role="presentation" class="order-card" style="background-color:#f9fff5;border-left:4px solid #6ec93e;border-radius:0 8px 8px 0;margin-bottom:28px">
              <tr><td style="padding:20px 24px">
                <p style="margin:0 0 4px;font-size:11px;font-weight:700;color:#6ec93e;text-transform:uppercase;letter-spacing:1.5px">Your Order ID</p>
                <p class="body-strong" style="margin:0;font-size:22px;font-weight:800;color:#1a1a1a;letter-spacing:-0.5px">${orderRef}</p>
                <p class="body-subtext" style="margin:6px 0 0;font-size:13px;color:#888888">Save this — you'll need it to track your order.</p>
              </td></tr>
            </table>

            <p style="margin:0 0 12px;font-size:11px;font-weight:700;color:#888888;text-transform:uppercase;letter-spacing:1.5px">Items Ordered</p>

            ${itemRows}

            <table class="divider" width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin:20px 0"><tr><td height="1" style="background-color:#f0f0f0;font-size:0;line-height:0;">&nbsp;</td></tr></table>

            <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin-bottom:28px">
              <tr>
                <td width="48%" valign="top" class="pill-bg" style="background-color:#f4f4f4;border-radius:8px;padding:16px 20px">
                  <p class="pill-label" style="margin:0 0 4px;font-size:11px;font-weight:700;color:#888;text-transform:uppercase;letter-spacing:1.5px">Subtotal</p>
                  <p class="pill-text" style="margin:0;font-size:15px;font-weight:600;color:#1a1a1a">₦${subtotal.toLocaleString("en-NG")}</p>
                </td>
                <td width="4%"></td>
                <td width="48%" valign="top" class="pill-bg" style="background-color:#f4f4f4;border-radius:8px;padding:16px 20px">
                  <p class="pill-label" style="margin:0 0 4px;font-size:11px;font-weight:700;color:#888;text-transform:uppercase;letter-spacing:1.5px">Total Paid</p>
                  <p class="pill-text" style="margin:0;font-size:15px;font-weight:600;color:#1a1a1a">₦${totalAmount.toLocaleString("en-NG")}</p>
                </td>
              </tr>
              ${deliveryRow}
            </table>

            ${addressSection}

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

  const GABRIELLA_EMAIL = "gabriellak004@gmail.com";
  const CC_EMAIL = "onyeiborjohn05@gmail.com";
  const STORE_URL = (process.env.NEXT_PUBLIC_APP_URL ?? "").replace(/\/$/, "");

  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  console.log(`🔍 Looking up paid orders for ${GABRIELLA_EMAIL}...`);

  const { data: orders, error } = await supabase
    .from("orders")
    .select(`
      id, order_ref, user_name, user_email, user_address,
      order_items ( product_title, product_image, variant_combo, quantity, unit_price ),
      transactions ( amount, delivery_fee )
    `)
    .eq("user_email", GABRIELLA_EMAIL)
    .in("status", ["paid", "in_progress", "complete"]);

  if (error) {
    console.error("❌ Supabase error:", error.message);
    process.exit(1);
  }

  if (!orders || orders.length === 0) {
    console.log(`⚠️  No paid orders found for ${GABRIELLA_EMAIL}`);
    process.exit(0);
  }

  console.log(`📦 Found ${orders.length} order(s)`);

  for (const order of orders) {
    const tx = order.transactions as unknown as { amount: number; delivery_fee: number } | null;
    const items = (order.order_items ?? []) as {
      product_title: string;
      product_image: string | null;
      variant_combo: Record<string, string>;
      quantity: number;
      unit_price: number;
    }[];

    const totalAmount = Number(tx?.amount ?? 0);
    const deliveryFee = Number(tx?.delivery_fee ?? 0);
    const subtotal = items.reduce((s, i) => s + Number(i.unit_price) * i.quantity, 0);
    const discountAmount = Math.max(0, subtotal + deliveryFee - totalAmount);

    const html = buildOrderConfirmEmail({
      customerName: order.user_name,
      orderRef: order.order_ref,
      items: items.map((i) => ({
        title: i.product_title,
        image: i.product_image,
        variantCombo: i.variant_combo,
        quantity: i.quantity,
        unitPrice: Number(i.unit_price),
      })),
      subtotal,
      deliveryFee,
      discountAmount,
      totalAmount,
      deliveryAddress: order.user_address ?? "",
      storeUrl: STORE_URL,
    });

    try {
      await sendEmail({
        to: [{ email: GABRIELLA_EMAIL, name: order.user_name }],
        cc: [{ email: CC_EMAIL, name: "Johnex" }],
        subject: `Order Confirmed — ${order.order_ref}`,
        htmlContent: html,
      });
      console.log(`✅ Sent ${order.order_ref} → ${GABRIELLA_EMAIL} (CC: ${CC_EMAIL})`);
    } catch (err) {
      console.error(`❌ Failed to send ${order.order_ref}:`, (err as Error).message);
    }
  }
}

main().catch(console.error);
