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
  if (!parsed.success) return NextResponse.json({ error: parsed.error.errors[0]?.message ?? "Invalid body" }, { status: 400 });

  const { amount, notes } = parsed.data;
  const now = new Date().toISOString();

  // Mark item returned with refund amount
  const { error: itemErr } = await supabase
    .from("order_items")
    .update({ status: "returned", refund_amount: amount, returned_at: now, updated_at: now })
    .eq("id", itemId)
    .eq("order_id", orderId);

  if (itemErr) return NextResponse.json({ error: itemErr.message }, { status: 500 });

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
