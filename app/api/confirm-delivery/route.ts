import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { sendEmail } from "@/lib/brevo";
import { deliveryCompleteEmail } from "@/lib/email-templates";

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token")?.trim();
  if (!token) return NextResponse.json({ error: "Token required" }, { status: 400 });

  const { data: tripOrder, error } = await supabase
    .from("trip_orders")
    .select(`
      id, trip_id, order_id, confirmed_at,
      orders!inner(order_ref, user_name, user_email, user_address),
      trips!inner(code, status, rider_name)
    `)
    .eq("confirmation_token", token)
    .single();

  if (error || !tripOrder) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if ((tripOrder as any).confirmed_at) return NextResponse.json({ error: "Already confirmed" }, { status: 409 });

  // Get order items on this trip
  const { data: tripItems } = await supabase
    .from("trip_items")
    .select(`
      order_item_id,
      order_items!inner(id, product_title, product_image, variant_combo, quantity, unit_price, status)
    `)
    .eq("trip_id", (tripOrder as any).trip_id)
    .eq("order_items.order_id", (tripOrder as any).order_id);

  const order = (tripOrder as any).orders;
  const trip = (tripOrder as any).trips;

  return NextResponse.json({
    data: {
      tripOrderId: tripOrder.id,
      tripId: (tripOrder as any).trip_id,
      orderId: (tripOrder as any).order_id,
      orderRef: order?.order_ref ?? "",
      userName: order?.user_name ?? "",
      userAddress: order?.user_address ?? "",
      tripStatus: trip?.status ?? "",
      riderName: trip?.rider_name ?? "",
      items: (tripItems ?? []).map((ti: any) => ({
        id: ti.order_items?.id,
        productTitle: ti.order_items?.product_title ?? "",
        productImage: ti.order_items?.product_image ?? null,
        variantCombo: ti.order_items?.variant_combo ?? {},
        quantity: ti.order_items?.quantity ?? 1,
        unitPrice: Number(ti.order_items?.unit_price ?? 0),
        status: ti.order_items?.status ?? "",
      })),
    },
  });
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const { token, code } = body as { token?: string; code?: string };

  if (!token?.trim() || !code?.trim())
    return NextResponse.json({ error: "token and code are required" }, { status: 400 });

  // 1. Find trip_order by confirmation_token — must exist + not yet confirmed
  const { data: tripOrder } = await supabase
    .from("trip_orders")
    .select("id, trip_id, order_id, confirmed_at")
    .eq("confirmation_token", token.trim())
    .single();

  if (!tripOrder) return NextResponse.json({ error: "Invalid link — token not found" }, { status: 404 });
  if (tripOrder.confirmed_at) return NextResponse.json({ error: "This delivery has already been confirmed" }, { status: 409 });

  // 2. Verify the trip code
  const { data: trip } = await supabase
    .from("trips")
    .select("id, code, status")
    .eq("id", tripOrder.trip_id)
    .single();

  if (!trip) return NextResponse.json({ error: "Trip not found" }, { status: 404 });
  if (trip.code !== code.trim()) return NextResponse.json({ error: "Incorrect code — check with your rider" }, { status: 400 });
  if (trip.status !== "dispatched") return NextResponse.json({ error: "This trip has not been dispatched yet" }, { status: 400 });

  const now = new Date().toISOString();

  // 3. Get all order_items for this order that are in trip_items for this trip
  const { data: tripItems } = await supabase
    .from("trip_items")
    .select("order_item_id")
    .eq("trip_id", tripOrder.trip_id);

  const tripItemIds = (tripItems ?? []).map((t: any) => t.order_item_id as string);

  // 4. Mark those items delivered
  if (tripItemIds.length > 0) {
    await supabase
      .from("order_items")
      .update({ status: "delivered", delivered_at: now, updated_at: now })
      .in("id", tripItemIds)
      .eq("order_id", tripOrder.order_id);
  }

  // 5. Check if ALL items in the order are at a final state (delivered or returned)
  const { data: allItems } = await supabase
    .from("order_items")
    .select("id, status")
    .eq("order_id", tripOrder.order_id);

  const allDelivered = (allItems ?? []).length > 0 && (allItems ?? []).every((i: any) => i.status === "delivered" || i.status === "returned");
  if (allDelivered) {
    await supabase.from("orders").update({ status: "complete", updated_at: now }).eq("id", tripOrder.order_id);
  }

  // 6. Mark trip_order confirmed (single-use)
  await supabase.from("trip_orders").update({ confirmed_at: now }).eq("id", tripOrder.id);

  // 7. Fire-and-forget delivery confirmation email
  const storeUrl = (process.env.NEXT_PUBLIC_APP_URL ?? "").replace(/\/$/, "");
  const { data: orderDetails } = await supabase
    .from("orders")
    .select("user_name, user_email")
    .eq("id", tripOrder.order_id)
    .single();

  if (orderDetails && tripItemIds.length > 0) {
    const { data: deliveredItems } = await supabase
      .from("order_items")
      .select("product_id, product_title, product_image, variant_combo, quantity, unit_price")
      .in("id", tripItemIds)
      .eq("order_id", tripOrder.order_id);

    const { data: orderRef } = await supabase
      .from("orders")
      .select("order_ref")
      .eq("id", tripOrder.order_id)
      .single();

    sendEmail({
      to: [{ email: orderDetails.user_email, name: orderDetails.user_name }],
      subject: `Your Order Has Been Delivered — ${orderRef?.order_ref ?? ""}`,
      htmlContent: deliveryCompleteEmail({
        customerName: orderDetails.user_name,
        orderRef: orderRef?.order_ref ?? "",
        items: (deliveredItems ?? []).map((i: any) => ({
          productId: i.product_id ?? null,
          productTitle: i.product_title ?? "",
          productImage: i.product_image ?? null,
          variantCombo: i.variant_combo ?? {},
          quantity: i.quantity ?? 1,
          unitPrice: Number(i.unit_price ?? 0),
        })),
        collectionsUrl: `${storeUrl}/collections`,
        storeUrl,
      }),
    }).catch(() => null);
  }

  return NextResponse.json({ data: { ok: true, orderComplete: allDelivered } });
}
