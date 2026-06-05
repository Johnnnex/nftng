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
  const search = url.searchParams.get("search") ?? "";
  const tab = url.searchParams.get("tab") ?? "available"; // "available" | "on_trip"

  // Get item IDs on ALL active trips (draft + dispatched)
  const { data: activeTripItems } = await supabase
    .from("trip_items")
    .select("order_item_id, trips!inner(status)")
    .in("trips.status", ["draft", "dispatched"]);

  const allActiveTripItemIds = (activeTripItems ?? []).map((r: any) => r.order_item_id as string);

  // For "available" exclusion: only draft trips (dispatched items are already 'enroute', won't appear)
  const draftTripItemIds = (activeTripItems ?? [])
    .filter((r: any) => r.trips?.status === "draft")
    .map((r: any) => r.order_item_id as string);

  const SELECT = `id, order_id, product_title, product_image, variant_combo, quantity, status, logistics_ready, packaged_at,
       orders!inner(order_ref, user_name, user_email, user_phone, user_address_line, user_address, user_city_id, user_state_id,
         cities(id, name, states(id, name)))`;

  let query;

  if (tab === "on_trip") {
    // Show items currently on an active trip — packaged (draft) or enroute (dispatched)
    if (allActiveTripItemIds.length === 0) {
      return NextResponse.json({ data: [], meta: { total: 0, page, limit: LIMIT } });
    }
    query = supabase
      .from("order_items")
      .select(SELECT, { count: "exact" })
      .in("id", allActiveTripItemIds)
      .in("status", ["packaged", "enroute"])
      .range(offset, offset + LIMIT - 1)
      .order("packaged_at", { ascending: true });
  } else {
    // "available" — packaged + logistics_ready, NOT on any draft trip
    query = supabase
      .from("order_items")
      .select(SELECT, { count: "exact" })
      .eq("status", "packaged")
      .eq("logistics_ready", true)
      .range(offset, offset + LIMIT - 1)
      .order("packaged_at", { ascending: true });

    if (draftTripItemIds.length > 0) {
      query = query.not("id", "in", `(${draftTripItemIds.join(",")})`);
    }
  }

  if (cityId) query = query.eq("orders.user_city_id", cityId);
  if (stateId) query = query.eq("orders.user_state_id", stateId);

  // Two-step search: first resolve order IDs matching the text, then OR with product_title
  if (search) {
    const { data: matchingOrders } = await supabase
      .from("orders")
      .select("id")
      .or(`order_ref.ilike.%${search}%,user_name.ilike.%${search}%`);
    const orderIds = (matchingOrders ?? []).map((o: any) => o.id as string);
    if (orderIds.length > 0) {
      query = query.or(`product_title.ilike.%${search}%,order_id.in.(${orderIds.join(",")})`);
    } else {
      query = query.ilike("product_title", `%${search}%`);
    }
  }

  const { data, count, error } = await query;
  if (error) {
    console.error("[ItemsQueue] Supabase error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

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
