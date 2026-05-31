import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getAdminFromRequest } from "@/lib/server-utils";
import { hasPermission } from "@/lib/permissions";

type Params = { params: Promise<{ id: string }> };

// Mark all packaged items on this order as logistics_ready in one shot.
// Also advances any pending items to packaged first.
export async function POST(req: NextRequest, { params }: Params) {
  const ctx = getAdminFromRequest(req);
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!hasPermission(ctx.permissions, ctx.isSuper, "products", "write"))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id: orderId } = await params;
  const now = new Date().toISOString();

  // Step 1: advance pending → packaged
  await supabase
    .from("order_items")
    .update({ status: "packaged", packaged_at: now, updated_at: now })
    .eq("order_id", orderId)
    .eq("status", "pending");

  // Step 2: mark all packaged items logistics_ready
  const { error } = await supabase
    .from("order_items")
    .update({ logistics_ready: true, updated_at: now })
    .eq("order_id", orderId)
    .eq("status", "packaged");

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data: { ok: true } });
}
