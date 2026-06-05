import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { sendEmail } from "@/lib/brevo";
import { orderConfirmEmail } from "@/lib/email-templates";
import { createHmac } from "crypto";

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signature = req.headers.get("x-paystack-signature") ?? "";

  // Paystack signs webhooks with HMAC-SHA512 using your secret key — same key used for API calls.
  // There is no separate webhook secret in Paystack's dashboard.
  const expected = createHmac("sha512", process.env.PAYSTACK_SECRET_KEY ?? "")
    .update(rawBody)
    .digest("hex");

  if (signature !== expected) {
    console.log("[paystack-webhook] ❌ Invalid signature — rejected");
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const event = JSON.parse(rawBody) as { event: string; data: { reference: string; status: string } };
  console.log(`[paystack-webhook] ✅ Signature valid | event=${event.event} | status=${event.data.status} | ref=${event.data.reference}`);

  if (event.event !== "charge.success") { console.log("[paystack-webhook] ⏭ Ignoring event — not charge.success"); return NextResponse.json({ ok: true }); }
  if (event.data.status !== "success") { console.log("[paystack-webhook] ⏭ Ignoring event — status not success"); return NextResponse.json({ ok: true }); }

  const { reference } = event.data;
  console.log(`[paystack-webhook] 🔍 Looking up order for ref=${reference}`);

  // Resolve transaction + order by the order_ref (which is used as the Paystack reference)
  const { data: order, error: orderQueryErr } = await supabase
    .from("orders")
    .select(`
      id, status, transaction_id, order_ref,
      user_name, user_email, user_address,
      order_items (
        product_title, product_image, variant_combo, quantity, unit_price
      ),
      transactions ( amount, delivery_fee )
    `)
    .eq("order_ref", reference)
    .maybeSingle();

  if (orderQueryErr) {
    console.error(`[paystack-webhook] ❌ Supabase query error for ref=${reference}:`, orderQueryErr);
    return NextResponse.json({ error: "DB error" }, { status: 500 });
  }

  if (!order) {
    console.log(`[paystack-webhook] ⚠️ No order found for ref=${reference} — ignoring`);
    return NextResponse.json({ ok: true });
  }
  console.log(`[paystack-webhook] 📦 Order found: ${order.order_ref} | status=${order.status} | items=${(order.order_items ?? []).length}`);

  // Idempotent — already processed
  if (order.status === "paid" || order.status === "in_progress" || order.status === "complete" || order.status === "refunded") {
    console.log(`[paystack-webhook] ⏭ Already processed (status=${order.status}) — skipping`);
    return NextResponse.json({ ok: true });
  }

  // Mark transaction as verified and flip order to 'paid'.
  // Order moves to 'in_progress' later when the first item is packaged by an admin.
  await Promise.all([
    order.transaction_id
      ? supabase
          .from("transactions")
          .update({ status: "success", external_reference: reference, webhook_verified_at: new Date().toISOString() })
          .eq("id", order.transaction_id)
      : Promise.resolve(),
    supabase
      .from("orders")
      .update({ status: "paid", updated_at: new Date().toISOString() })
      .eq("id", order.id)
      .eq("status", "pending_payment"),
  ]);

  // Send order confirmation email (fire-and-forget — don't block webhook response)
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
  // discount = subtotal + delivery - total  (inverse of: total = subtotal - discount + delivery)
  const discountAmount = Math.max(0, subtotal + deliveryFee - totalAmount);
  const storeUrl = (process.env.NEXT_PUBLIC_APP_URL ?? "").replace(/\/$/, "");

  console.log(`[paystack-webhook] 📧 Attempting to send order confirmation email to ${order.user_email}`);
  sendEmail({
    to: [{ email: order.user_email, name: order.user_name }],
    subject: `Order Confirmed — ${order.order_ref}`,
    htmlContent: orderConfirmEmail({
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
      storeUrl,
    }),
  }).then(() => {
    console.log(`[paystack-webhook] ✅ Order confirmation email sent to ${order.user_email}`);
  }).catch((err) => {
    console.error(`[paystack-webhook] ❌ Failed to send order confirmation email:`, err);
  });

  console.log(`[paystack-webhook] ✅ Webhook processed successfully for ${order.order_ref}`);
  return NextResponse.json({ ok: true });
}
