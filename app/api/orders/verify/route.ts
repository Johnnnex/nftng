import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  const { orderRef, gateway, reference, transactionId } = await req.json().catch(() => ({}));

  if (!orderRef) return NextResponse.json({ error: "orderRef is required" }, { status: 400 });

  // Find the order
  const { data: order } = await supabase
    .from("orders")
    .select("id, status, transaction_id, transactions(id, status, payment_method, external_reference)")
    .eq("order_ref", orderRef)
    .single();

  if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

  const tx = order.transactions as unknown as { id: string; status: string; payment_method: string; external_reference: string | null } | null;

  // Idempotent — already confirmed
  if (order.status === "paid" || order.status === "in_progress" || order.status === "complete") {
    return NextResponse.json({ data: { status: "success", orderRef } });
  }

  if (!tx) return NextResponse.json({ data: { status: "pending", orderRef } });

  // Already verified via webhook — just ensure order is flipped to paid
  if (tx.status === "success") {
    await supabase.from("orders").update({ status: "paid", updated_at: new Date().toISOString() }).eq("id", order.id).eq("status", "pending_payment");
    return NextResponse.json({ data: { status: "success", orderRef } });
  }

  // Verify with gateway
  let verified = false;
  const paymentRef = reference ?? tx.external_reference ?? orderRef;

  try {
    if ((gateway === "paystack" || tx.payment_method === "paystack") && paymentRef) {
      const r = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(paymentRef)}`, {
        headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` },
      });
      const d = await r.json();
      verified = d.status === true && d.data?.status === "success";
    } else if (gateway === "flutterwave" || tx.payment_method === "flutterwave") {
      // Flutterwave: verify by tx_ref (our orderRef)
      const flwTxId = transactionId;
      if (flwTxId) {
        const r = await fetch(`https://api.flutterwave.com/v3/transactions/${flwTxId}/verify`, {
          headers: { Authorization: `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}` },
        });
        const d = await r.json();
        verified = d.status === "success" && d.data?.status === "successful" && d.data?.tx_ref === orderRef;
      }
    }
  } catch { /* gateway unreachable — return pending */ }

  if (verified) {
    await Promise.all([
      supabase.from("transactions")
        .update({ status: "success", external_reference: paymentRef, webhook_verified_at: new Date().toISOString() })
        .eq("id", tx.id),
      supabase.from("orders")
        .update({ status: "paid", updated_at: new Date().toISOString() })
        .eq("id", order.id)
        .eq("status", "pending_payment"),
    ]);
    return NextResponse.json({ data: { status: "success", orderRef } });
  }

  return NextResponse.json({ data: { status: "pending", orderRef } });
}
