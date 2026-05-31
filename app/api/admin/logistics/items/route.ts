import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getAdminFromRequest } from "@/lib/server-utils";
import { hasPermission } from "@/lib/permissions";

const LIMIT = 50;

// GET logistics queue: items where logistics_ready=true AND status='packaged'
// (not yet dispatched on a trip)
export async function GET(req: NextRequest) {
  const ctx = getAdminFromRequest(req);
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!hasPermission(ctx.permissions, ctx.isSuper, "logistics", "read"))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const url = req.nextUrl;
  const page = Math.max(1, parseInt(url.searchParams.get("page") ?? "1"));
  const offset = (page - 1) * LIMIT;
  const cityId = url.searchParams.get("cityId");
  const stateId = url.searchParams.get("stateId");

  let query = supabase
    .from("order_items")
    .select(
      `id, order_id, product_title, product_image, variant_combo, quantity, status, logistics_ready, packaged_at,
       orders!inner(order_ref, user_name, user_email, user_phone, user_address_line, user_address, user_city_id, user_state_id,
         cities(id, name, states(id, name)))`,
      { count: "exact" },
    )
    .eq("status", "packaged")
    .eq("logistics_ready", true)
    .range(offset, offset + LIMIT - 1)
    .order("packaged_at", { ascending: true });

  if (cityId) query = query.eq("orders.user_city_id", cityId);
  if (stateId) query = query.eq("orders.user_state_id", stateId);

  const { data, count, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const result = (data ?? []).map((item: any) => ({
    id: item.id,
    orderId: item.order_id,
    orderRef: item.orders?.order_ref ?? "",
    productTitle: item.product_title,
    productImage: item.product_image,
    variantCombo: item.variant_combo ?? {},
    quantity: item.quantity,
    status: item.status,
    logisticsReady: item.logistics_ready,
    packagedAt: item.packaged_at,
    userName: item.orders?.user_name ?? "",
    userEmail: item.orders?.user_email ?? "",
    userPhone: item.orders?.user_phone ?? "",
    userAddress: item.orders?.user_address ?? "",
    userCityId: item.orders?.user_city_id ?? null,
    userCityName: item.orders?.cities?.name ?? null,
    userStateId: item.orders?.user_state_id ?? null,
    userStateName: item.orders?.cities?.states?.name ?? null,
  }));

  return NextResponse.json({ data: result, meta: { total: count ?? 0, page, limit: LIMIT } });
}
