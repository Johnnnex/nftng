import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getAdminFromRequest } from "@/lib/server-utils";
import { hasPermission } from "@/lib/permissions";
import { itemRefundSchema } from "@/data";

type Params = { params: Promise<{ id: string; itemId: string }> };

export async function POST(req: NextRequest, { params }: Params) {
  const ctx = getAdminFromRequest(req);
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!hasPermission(ctx.permissions, ctx.isSuper, "products", "write"))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id: orderId, itemId } = await params;
  const body = await req.json();
  const parsed = itemRefundSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues?.[0]?.message ?? "Invalid body" }, { status: 400 });

  const { amount, notes } = parsed.data;
  const now = new Date().toISOString();

  // Fetch item to get product_id, variant_combo, quantity for stock reversal
  const { data: item } = await supabase
    .from("order_items")
    .select("product_id, variant_combo, quantity, status")
    .eq("id", itemId)
    .eq("order_id", orderId)
    .single();

  if (!item) return NextResponse.json({ error: "Order item not found" }, { status: 404 });

  // Mark item returned with refund amount
  const { error: itemErr } = await supabase
    .from("order_items")
    .update({ status: "returned", refund_amount: amount, returned_at: now, updated_at: now })
    .eq("id", itemId)
    .eq("order_id", orderId);

  if (itemErr) return NextResponse.json({ error: itemErr.message }, { status: 500 });

  // Reverse stock — add the returned quantity back
  if (item.product_id && item.variant_combo) {
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
  }

  // Auto-refund order if ALL items are now returned
  const { data: allItems } = await supabase
    .from("order_items")
    .select("id, status")
    .eq("order_id", orderId);

  const allReturned = (allItems ?? []).length > 0 && (allItems ?? []).every((i) => i.status === "returned");
  if (allReturned) {
    await supabase.from("orders").update({ status: "refunded", updated_at: now }).eq("id", orderId);
  }

  // Record the refund row
  const { error: refundErr } = await supabase.from("refunds").insert({
    order_id: orderId,
    order_item_id: itemId,
    amount,
    processed_by: ctx.adminId,
    notes: notes ?? null,
  });

  if (refundErr) return NextResponse.json({ error: refundErr.message }, { status: 500 });
  return NextResponse.json({ data: { ok: true } });
}
