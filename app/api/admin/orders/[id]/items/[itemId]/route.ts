import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getAdminFromRequest } from "@/lib/server-utils";
import { hasPermission } from "@/lib/permissions";
import { itemStatusUpdateSchema, itemLogisticsReadySchema } from "@/data";

type Params = { params: Promise<{ id: string; itemId: string }> };

export async function PATCH(req: NextRequest, { params }: Params) {
  const ctx = getAdminFromRequest(req);
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!hasPermission(ctx.permissions, ctx.isSuper, "products", "write"))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id: orderId, itemId } = await params;
  const body = await req.json();

  const statusParsed = itemStatusUpdateSchema.safeParse(body);
  const logisticsParsed = itemLogisticsReadySchema.safeParse(body);

  if (!statusParsed.success && !logisticsParsed.success) {
    return NextResponse.json(
      { error: "Invalid payload — expected { status: 'packaged' } or { logisticsReady: true }" },
      { status: 400 },
    );
  }

  if (statusParsed.success) {
    // pending → packaged
    const { error } = await supabase
      .from("order_items")
      .update({ status: "packaged", packaged_at: new Date().toISOString(), updated_at: new Date().toISOString() })
      .eq("id", itemId)
      .eq("order_id", orderId)
      .eq("status", "pending");

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // Move order to in_progress when the first item is packaged — only from 'paid' state (idempotent)
    await supabase
      .from("orders")
      .update({ status: "in_progress", updated_at: new Date().toISOString() })
      .eq("id", orderId)
      .eq("status", "paid");

    return NextResponse.json({ data: { status: "packaged" } });
  }

  // Set logistics_ready — only allowed on packaged items
  const { data: item } = await supabase
    .from("order_items")
    .select("status")
    .eq("id", itemId)
    .eq("order_id", orderId)
    .single();

  if (!item) return NextResponse.json({ error: "Item not found" }, { status: 404 });
  if (item.status !== "packaged")
    return NextResponse.json({ error: "Item must be packaged before marking logistics ready" }, { status: 400 });

  const now = new Date().toISOString();
  const { error } = await supabase
    .from("order_items")
    .update({ logistics_ready: true, updated_at: now })
    .eq("id", itemId)
    .eq("order_id", orderId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Safety net: if item was packaged via bulk route the order may still be 'paid' — advance it
  await supabase
    .from("orders")
    .update({ status: "in_progress", updated_at: now })
    .eq("id", orderId)
    .eq("status", "paid");

  return NextResponse.json({ data: { logisticsReady: true } });
}
