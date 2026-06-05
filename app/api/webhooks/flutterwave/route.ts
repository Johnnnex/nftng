import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { createHmac } from "crypto";

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signature = req.headers.get("verifi-hash") ?? "";

  // Verify SHA-256 HMAC
  const expected = createHmac("sha256", process.env.FLUTTERWAVE_WEBHOOK_SECRET ?? "")
    .update(rawBody)
    .digest("hex");

  if (signature !== expected)
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });

  const event = JSON.parse(rawBody) as {
    event: string;
    data: { tx_ref: string; status: string; id: number };
  };

  if (event.event !== "charge.completed") return NextResponse.json({ ok: true });

  const { tx_ref: orderRef, status } = event.data;
  if (status !== "successful") return NextResponse.json({ ok: true });

  const { data: order } = await supabase
    .from("orders")
    .select("id, status, transaction_id")
    .eq("order_ref", orderRef)
    .maybeSingle();

  if (!order) return NextResponse.json({ ok: true });

  // Idempotent
  if (order.status === "paid" || order.status === "in_progress" || order.status === "complete")
    return NextResponse.json({ ok: true });

  await Promise.all([
    order.transaction_id
      ? supabase.from("transactions")
          .update({ status: "success", external_reference: String(event.data.id), webhook_verified_at: new Date().toISOString() })
          .eq("id", order.transaction_id)
      : Promise.resolve(),
    supabase.from("orders")
      .update({ status: "paid", updated_at: new Date().toISOString() })
      .eq("id", order.id)
      .eq("status", "pending_payment"),
  ]);

  return NextResponse.json({ ok: true });
}
