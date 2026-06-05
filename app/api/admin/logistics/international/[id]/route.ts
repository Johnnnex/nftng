import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getAdminFromRequest } from "@/lib/server-utils";
import { hasPermission } from "@/lib/permissions";

type Params = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, { params }: Params) {
  const ctx = getAdminFromRequest(req);
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!hasPermission(ctx.permissions, ctx.isSuper, "logistics", "read"))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const { data, error } = await supabase
    .from("outside_nigeria_orders")
    .select("*, countries(name)")
    .eq("id", id)
    .single();

  if (error || !data) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({
    data: {
      id: data.id,
      previewToken: data.preview_token,
      userName: data.user_name,
      userEmail: data.user_email,
      userPhone: data.user_phone,
      userCountryId: data.user_country_id,
      userCountryName: (data as any).countries?.name ?? null,
      userAddress: data.user_address,
      items: data.items ?? [],
      status: data.status,
      resolvedAt: data.resolved_at,
      createdAt: data.created_at,
    },
  });
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const ctx = getAdminFromRequest(req);
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!hasPermission(ctx.permissions, ctx.isSuper, "logistics", "write"))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const validActions = ["resolved", "reverted"] as const;
  if (!validActions.includes(body.action)) {
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }
  const action: "resolved" | "reverted" = body.action;
  const now = new Date().toISOString();

  // Fetch current status — once resolved or reverted, no further changes allowed
  const { data: existing } = await supabase
    .from("outside_nigeria_orders")
    .select("status, items")
    .eq("id", id)
    .single();

  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (existing.status !== "pending") {
    return NextResponse.json({ error: "Order already actioned — no further changes allowed" }, { status: 400 });
  }

  if (action === "reverted") {
    // Reverse stock for each item (best-effort, no optimistic lock needed for revert)
    const items: { productId: string; variantCombo: Record<string, string>; qty: number }[] = existing.items ?? [];
    await Promise.all(
      items.map(async (item) => {
        if (!item.productId) return;
        const sortedCombo = Object.keys(item.variantCombo)
          .sort()
          .reduce((a, k) => ({ ...a, [k]: item.variantCombo[k] }), {} as Record<string, string>);
        const { data: stock } = await supabase
          .from("product_stocks")
          .select("id, quantity")
          .eq("product_id", item.productId)
          .filter("combo", "eq", JSON.stringify(sortedCombo))
          .single();
        if (stock) {
          await supabase
            .from("product_stocks")
            .update({ quantity: stock.quantity + item.qty })
            .eq("id", stock.id);
        }
      }),
    );
  }

  const { error } = await supabase
    .from("outside_nigeria_orders")
    .update({ status: action, resolved_by: ctx.adminId, resolved_at: now })
    .eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data: { ok: true } });
}
