import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getAdminFromRequest } from "@/lib/server-utils";
import { hasPermission } from "@/lib/permissions";
import { customAlphabet } from "nanoid";
import { sendEmail } from "@/lib/brevo";
import { tripDispatchCustomerHtml, tripDispatchRiderHtml } from "@/lib/email-templates";

const tokenId = customAlphabet("abcdefghijklmnopqrstuvwxyz0123456789", 10);

type Params = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, { params }: Params) {
  const ctx = getAdminFromRequest(req);
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!hasPermission(ctx.permissions, ctx.isSuper, "logistics", "write"))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id: tripId } = await params;

  // Fetch trip
  const { data: trip, error: tripErr } = await supabase
    .from("trips")
    .select("*")
    .eq("id", tripId)
    .single();

  if (tripErr || !trip) return NextResponse.json({ error: "Trip not found" }, { status: 404 });
  if (trip.status !== "draft") return NextResponse.json({ error: "Trip already dispatched" }, { status: 400 });

  // Fetch all trip_items with order details
  const { data: tripItems } = await supabase
    .from("trip_items")
    .select(
      `order_item_id,
       order_items!inner(order_id, product_title, product_image, variant_combo, quantity,
         orders!inner(id, order_ref, user_name, user_email, user_address))`,
    )
    .eq("trip_id", tripId);

  if (!tripItems?.length) return NextResponse.json({ error: "Trip has no items" }, { status: 400 });

  const now = new Date().toISOString();
  const itemIds = tripItems.map((ti: any) => ti.order_item_id);

  // Mark all items enroute
  const { error: enrouteErr } = await supabase
    .from("order_items")
    .update({ status: "enroute", enroute_at: now, updated_at: now })
    .in("id", itemIds);

  if (enrouteErr) return NextResponse.json({ error: enrouteErr.message }, { status: 500 });

  // Mark trip dispatched
  const { error: dispatchErr } = await supabase
    .from("trips")
    .update({ status: "dispatched", dispatched_at: now })
    .eq("id", tripId);

  if (dispatchErr) return NextResponse.json({ error: dispatchErr.message }, { status: 500 });

  // Group items by order
  const byOrder = new Map<string, { orderId: string; orderRef: string; userName: string; userEmail: string; userAddress: string; items: any[] }>();
  for (const ti of tripItems as any[]) {
    const order = ti.order_items?.orders;
    const orderId = order?.id;
    if (!orderId) continue;
    if (!byOrder.has(orderId)) {
      byOrder.set(orderId, {
        orderId,
        orderRef: order.order_ref,
        userName: order.user_name,
        userEmail: order.user_email,
        userAddress: order.user_address,
        items: [],
      });
    }
    byOrder.get(orderId)!.items.push({
      productTitle: ti.order_items.product_title,
      productImage: ti.order_items.product_image,
      variantCombo: ti.order_items.variant_combo,
      quantity: ti.order_items.quantity,
    });
  }

  // Insert trip_orders (one per unique order) and collect for emails
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";
  const customerEmails: Promise<void>[] = [];

  for (const [, orderGroup] of byOrder) {
    const token = tokenId();
    await supabase.from("trip_orders").insert({
      trip_id: tripId,
      order_id: orderGroup.orderId,
      confirmation_token: token,
    });

    // Fire-and-forget customer email
    const confirmUrl = `${appUrl}/confirm-delivery/${token}`;
    customerEmails.push(
      sendEmail({
        to: [{ email: orderGroup.userEmail, name: orderGroup.userName }],
        subject: `Your order ${orderGroup.orderRef} is on its way!`,
        htmlContent: tripDispatchCustomerHtml({ orderRef: orderGroup.orderRef, userName: orderGroup.userName, items: orderGroup.items, confirmUrl }),
      }).catch(console.error),
    );
  }

  // Fire-and-forget rider email if email is set
  if (trip.rider_email) {
    const allItems = [...byOrder.values()].flatMap((o) => o.items.map((i) => ({ ...i, orderRef: o.orderRef, userName: o.userName, userAddress: o.userAddress })));
    sendEmail({
      to: [{ email: trip.rider_email, name: trip.rider_name }],
      subject: `Trip ${trip.code} dispatched — your manifest`,
      htmlContent: tripDispatchRiderHtml({ tripCode: trip.code, riderName: trip.rider_name, items: allItems }),
    }).catch(console.error);
  }

  // Fire all customer emails
  Promise.all(customerEmails).catch(console.error);

  return NextResponse.json({ data: { id: tripId, status: "dispatched", dispatchedAt: now } });
}
