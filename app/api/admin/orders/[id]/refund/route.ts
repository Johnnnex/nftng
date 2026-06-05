import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getAdminFromRequest } from "@/lib/server-utils";
import { hasPermission } from "@/lib/permissions";
import { orderRefundSchema } from "@/data";

type Params = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, { params }: Params) {
  const ctx = getAdminFromRequest(req);
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!hasPermission(ctx.permissions, ctx.isSuper, "products", "write"))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id: orderId } = await params;
  const body = await req.json();
  const parsed = orderRefundSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues?.[0]?.message ?? "Invalid body" }, { status: 400 });

  const { amount, notes } = parsed.data;
  const now = new Date().toISOString();

  // Fetch items to reverse stock for those being returned
  const { data: returningItems } = await supabase
    .from("order_items")
    .select("id, product_id, variant_combo, quantity")
    .eq("order_id", orderId)
    .not("status", "in", '("returned","delivered")');

  // Mark all non-returned/delivered items returned
  await supabase
    .from("order_items")
    .update({ status: "returned", returned_at: now, updated_at: now })
    .eq("order_id", orderId)
    .not("status", "in", '("returned","delivered")');

  // Reverse stock for each returned item
  await Promise.all(
    (returningItems ?? []).map(async (item) => {
      if (!item.product_id || !item.variant_combo) return;
      const { data: stock } = await supabase
        .from("product_stocks")
        .select("id, quantity")
        .eq("product_id", item.product_id)
        .filter("combo", "eq", JSON.stringify(item.variant_combo))
        .single();
      if (stock) {
        await supabase
          .from("product_stocks")
          .update({ quantity: stock.quantity + item.quantity })
          .eq("id", stock.id);
      }
    }),
  );

  // Mark order refunded
  const { error: orderErr } = await supabase
    .from("orders")
    .update({ status: "refunded", updated_at: now })
    .eq("id", orderId);

  if (orderErr) return NextResponse.json({ error: orderErr.message }, { status: 500 });

  // Record refund (null order_item_id = full order refund)
  const { error: refundErr } = await supabase.from("refunds").insert({
    order_id: orderId,
    order_item_id: null,
    amount,
    processed_by: ctx.adminId,
    notes: notes ?? null,
  });

  if (refundErr) return NextResponse.json({ error: refundErr.message }, { status: 500 });
  return NextResponse.json({ data: { ok: true } });
}
