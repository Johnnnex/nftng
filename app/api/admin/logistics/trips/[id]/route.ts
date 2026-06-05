import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getAdminFromRequest } from "@/lib/server-utils";
import { hasPermission } from "@/lib/permissions";
import { patchTripSchema } from "@/data";

type Params = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, { params }: Params) {
  const ctx = getAdminFromRequest(req);
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!hasPermission(ctx.permissions, ctx.isSuper, "logistics", "read"))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;

  const { data: trip, error } = await supabase
    .from("trips")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !trip) return NextResponse.json({ error: "Trip not found" }, { status: 404 });

  const { data: tripItems } = await supabase
    .from("trip_items")
    .select(
      `id, trip_id, order_item_id,
       order_items!inner(product_title, product_image, variant_combo, quantity, status,
         orders!inner(id, order_ref, user_name, user_email, user_address,
           cities(name, states(name))))`,
    )
    .eq("trip_id", id);

  const items = (tripItems ?? []).map((ti: any) => ({
    id: ti.id,
    tripId: ti.trip_id,
    orderItemId: ti.order_item_id,
    productTitle: ti.order_items?.product_title ?? "",
    productImage: ti.order_items?.product_image ?? null,
    variantCombo: ti.order_items?.variant_combo ?? {},
    quantity: ti.order_items?.quantity ?? 1,
    itemStatus: ti.order_items?.status ?? "enroute",
    orderId: ti.order_items?.orders?.id ?? "",
    orderRef: ti.order_items?.orders?.order_ref ?? "",
    userName: ti.order_items?.orders?.user_name ?? "",
    userEmail: ti.order_items?.orders?.user_email ?? "",
    userAddress: ti.order_items?.orders?.user_address ?? "",
    userCityName: ti.order_items?.orders?.cities?.name ?? null,
    userStateName: ti.order_items?.orders?.cities?.states?.name ?? null,
  }));

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
      itemCount: items.length,
      items,
    },
  });
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const ctx = getAdminFromRequest(req);
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!hasPermission(ctx.permissions, ctx.isSuper, "logistics", "write"))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const body = await req.json();
  const parsed = patchTripSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues?.[0]?.message ?? "Invalid body" }, { status: 400 });

  const update: Record<string, unknown> = {};
  if (parsed.data.riderName !== undefined) update.rider_name = parsed.data.riderName;
  if (parsed.data.riderPhone !== undefined) update.rider_phone = parsed.data.riderPhone;
  if (parsed.data.riderEmail !== undefined) update.rider_email = parsed.data.riderEmail || null;
  if (parsed.data.riderCompany !== undefined) update.rider_company = parsed.data.riderCompany || null;

  const { data: trip, error } = await supabase
    .from("trips")
    .update(update)
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
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
    },
  });
}
