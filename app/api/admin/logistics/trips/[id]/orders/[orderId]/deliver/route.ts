import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getAdminFromRequest } from "@/lib/server-utils";
import { hasPermission } from "@/lib/permissions";
import { sendEmail } from "@/lib/brevo";
import { deliveryCompleteEmail } from "@/lib/email-templates";

type Params = { params: Promise<{ id: string; orderId: string }> };

// Admin override — marks all trip items for this order as delivered,
// stamps trip_orders.confirmed_at, and completes the order if all items are done.
// Skips the customer code verification entirely.
export async function POST(req: NextRequest, { params }: Params) {
  const ctx = getAdminFromRequest(req);
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!hasPermission(ctx.permissions, ctx.isSuper, "logistics", "write"))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id: tripId, orderId } = await params;

  // Verify trip exists and is dispatched
  const { data: trip } = await supabase
    .from("trips")
    .select("id, status")
    .eq("id", tripId)
    .single();

  if (!trip) return NextResponse.json({ error: "Trip not found" }, { status: 404 });
  if (trip.status !== "dispatched")
    return NextResponse.json({ error: "Trip must be dispatched to override delivery" }, { status: 400 });

  // Find the trip_order record
  const { data: tripOrder } = await supabase
    .from("trip_orders")
    .select("id, confirmed_at")
    .eq("trip_id", tripId)
    .eq("order_id", orderId)
    .single();

  if (!tripOrder) return NextResponse.json({ error: "Order not found on this trip" }, { status: 404 });
  if (tripOrder.confirmed_at) return NextResponse.json({ error: "Delivery already confirmed for this order" }, { status: 409 });

  const now = new Date().toISOString();

  // Get item IDs for this order on this trip
  const { data: tripItems } = await supabase
    .from("trip_items")
    .select("order_item_id")
    .eq("trip_id", tripId);

  const tripItemIds = (tripItems ?? []).map((t: any) => t.order_item_id as string);

  // Mark those items delivered
  if (tripItemIds.length > 0) {
    await supabase
      .from("order_items")
      .update({ status: "delivered", delivered_at: now, updated_at: now })
      .in("id", tripItemIds)
      .eq("order_id", orderId);
  }

  // Check if all items in the order are at a final state
  const { data: allItems } = await supabase
    .from("order_items")
    .select("id, status")
    .eq("order_id", orderId);

  const allDone = (allItems ?? []).length > 0 &&
    (allItems ?? []).every((i: any) => i.status === "delivered" || i.status === "returned");

  if (allDone) {
    await supabase.from("orders").update({ status: "complete", updated_at: now }).eq("id", orderId);
  }

  // Stamp confirmation
  await supabase.from("trip_orders").update({ confirmed_at: now }).eq("id", tripOrder.id);

  // Fire-and-forget delivery email
  const storeUrl = (process.env.NEXT_PUBLIC_APP_URL ?? "").replace(/\/$/, "");
  const { data: orderDetails } = await supabase
    .from("orders")
    .select("user_name, user_email, order_ref")
    .eq("id", orderId)
    .single();

  if (orderDetails && tripItemIds.length > 0) {
    const { data: deliveredItems } = await supabase
      .from("order_items")
      .select("product_id, product_title, product_image, variant_combo, quantity, unit_price")
      .in("id", tripItemIds)
      .eq("order_id", orderId);

    sendEmail({
      to: [{ email: orderDetails.user_email, name: orderDetails.user_name }],
      subject: `Your Order Has Been Delivered — ${orderDetails.order_ref}`,
      htmlContent: deliveryCompleteEmail({
        customerName: orderDetails.user_name,
        orderRef: orderDetails.order_ref,
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

  return NextResponse.json({ data: { ok: true, orderComplete: allDone } });
}
