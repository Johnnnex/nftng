import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getAdminFromRequest } from "@/lib/server-utils";
import { hasPermission } from "@/lib/permissions";
import { createTripSchema } from "@/data";
import { customAlphabet } from "nanoid";

const LIMIT = 50;
const tripCode = customAlphabet("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789", 8);

export async function GET(req: NextRequest) {
  const ctx = getAdminFromRequest(req);
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!hasPermission(ctx.permissions, ctx.isSuper, "logistics", "read"))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const page = Math.max(1, parseInt(req.nextUrl.searchParams.get("page") ?? "1"));
  const offset = (page - 1) * LIMIT;
  const search = req.nextUrl.searchParams.get("search") ?? "";
  const stateId = req.nextUrl.searchParams.get("stateId") ?? "";
  const cityId = req.nextUrl.searchParams.get("cityId") ?? "";

  // When geo filter active: find trip IDs that have at least one item in that state/city
  let geoFilterIds: string[] | null = null;
  if (stateId || cityId) {
    const geoQuery = supabase
      .from("trip_items")
      .select("trip_id, order_items!inner(orders!inner(user_state_id, user_city_id))");
    const { data: geoRows } = cityId
      ? await (geoQuery as any).eq("order_items.orders.user_city_id", cityId)
      : await (geoQuery as any).eq("order_items.orders.user_state_id", stateId);
    geoFilterIds = [...new Set(((geoRows ?? []) as any[]).map((r) => r.trip_id))];
  }

  // Return empty if geo filter yielded no trips
  if (geoFilterIds !== null && geoFilterIds.length === 0) {
    return NextResponse.json({ data: [], meta: { total: 0, page, limit: LIMIT } });
  }

  let query = supabase
    .from("trips")
    .select("*, trip_items(count)", { count: "exact" })
    .range(offset, offset + LIMIT - 1)
    .order("created_at", { ascending: false });

  if (geoFilterIds) query = query.in("id", geoFilterIds);
  if (search) {
    query = query.or(`code.ilike.%${search}%,rider_name.ilike.%${search}%,rider_phone.ilike.%${search}%,rider_email.ilike.%${search}%,rider_company.ilike.%${search}%`);
  }

  const { data, count, error } = await query;

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const result = (data ?? []).map((t: any) => ({
    id: t.id,
    code: t.code,
    riderName: t.rider_name,
    riderPhone: t.rider_phone,
    riderEmail: t.rider_email,
    riderCompany: t.rider_company,
    status: t.status,
    createdBy: t.created_by,
    dispatchedAt: t.dispatched_at,
    createdAt: t.created_at,
    itemCount: t.trip_items?.[0]?.count ?? 0,
  }));

  return NextResponse.json({ data: result, meta: { total: count ?? 0, page, limit: LIMIT } });
}

export async function POST(req: NextRequest) {
  const ctx = getAdminFromRequest(req);
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!hasPermission(ctx.permissions, ctx.isSuper, "logistics", "write"))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  const parsed = createTripSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues?.[0]?.message ?? "Invalid body" }, { status: 400 });

  const { riderName, riderPhone, riderEmail, riderCompany, itemIds } = parsed.data;

  // Verify all items are logistics_ready + packaged
  const { data: items } = await supabase
    .from("order_items")
    .select("id, status, logistics_ready")
    .in("id", itemIds);

  const invalid = (items ?? []).filter((i) => i.status !== "packaged" || !i.logistics_ready);
  if (invalid.length > 0)
    return NextResponse.json({ error: "All items must be packaged and logistics-ready" }, { status: 400 });

  // Generate trip code (retry on collision)
  let code = tripCode();
  let attempt = 0;
  while (attempt < 3) {
    const { data: existing } = await supabase.from("trips").select("id").eq("code", code).single();
    if (!existing) break;
    code = tripCode();
    attempt++;
  }

  const { data: trip, error: tripErr } = await supabase
    .from("trips")
    .insert({ code, rider_name: riderName, rider_phone: riderPhone, rider_email: riderEmail || null, rider_company: riderCompany || null, status: "draft", created_by: ctx.adminId })
    .select()
    .single();

  if (tripErr) return NextResponse.json({ error: tripErr.message }, { status: 500 });

  const tripItems = itemIds.map((id) => ({ trip_id: trip.id, order_item_id: id }));
  const { error: itemsErr } = await supabase.from("trip_items").insert(tripItems);
  if (itemsErr) return NextResponse.json({ error: itemsErr.message }, { status: 500 });

  return NextResponse.json({
    data: {
      id: trip.id,
      code: trip.code,
      riderName: trip.rider_name,
      riderPhone: trip.rider_phone,
      riderEmail: trip.rider_email,
      riderCompany: trip.rider_company,
      status: trip.status,
      createdBy: trip.created_by,
      dispatchedAt: trip.dispatched_at,
      createdAt: trip.created_at,
      itemCount: itemIds.length,
    },
  }, { status: 201 });
}
