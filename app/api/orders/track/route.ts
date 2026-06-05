import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  const ref = req.nextUrl.searchParams.get("ref")?.trim().toUpperCase() ?? "";
  if (!ref) return NextResponse.json({ error: "Order ref is required" }, { status: 400 });

  const { data: order, error } = await supabase
    .from("orders")
    .select(`
      id, order_ref, status, user_name, user_email, user_address, created_at, updated_at,
      transactions(amount, delivery_fee),
      cities(name, states(name)),
      order_items(
        id, product_title, product_image, variant_combo,
        quantity, unit_price, status, logistics_ready, refund_amount,
        packaged_at, enroute_at, delivered_at
      )
    `)
    .eq("order_ref", ref)
    .single();

  if (error || !order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

  // Fetch order-level refunds (order_item_id = null)
  const { data: refundRows } = await supabase
    .from("refunds")
    .select("amount, order_item_id")
    .eq("order_id", order.id);

  const orderRefundAmount = (refundRows ?? [])
    .filter((r) => r.order_item_id === null)
    .reduce((s, r) => s + Number(r.amount), 0);

  const tx = order.transactions as unknown as { amount: number; delivery_fee: number } | null;
  const city = order.cities as unknown as { name: string; states: { name: string } | null } | null;

  return NextResponse.json({
    data: {
      id: order.id,
      orderRef: order.order_ref,
      orderRefundAmount: orderRefundAmount || null,
      status: order.status,
      userName: order.user_name,
      userEmail: order.user_email,
      userAddress: order.user_address,
      userCityName: city?.name ?? null,
      userStateName: (city?.states as { name: string } | null)?.name ?? null,
      totalAmount: tx?.amount ? Number(tx.amount) : null,
      deliveryFee: tx?.delivery_fee ? Number(tx.delivery_fee) : null,
      createdAt: order.created_at,
      items: ((order.order_items as unknown[]) ?? []).map((item) => {
        const i = item as {
          id: string; product_title: string; product_image: string | null;
          variant_combo: Record<string, string>; quantity: number; unit_price: number;
          status: string; logistics_ready: boolean; refund_amount: number | null;
          packaged_at: string | null; enroute_at: string | null; delivered_at: string | null;
        };
        return {
          id: i.id,
          productTitle: i.product_title,
          productImage: i.product_image,
          variantCombo: i.variant_combo,
          quantity: i.quantity,
          unitPrice: Number(i.unit_price),
          status: i.status,
          logisticsReady: i.logistics_ready,
          refundAmount: i.refund_amount != null ? Number(i.refund_amount) : null,
          packagedAt: i.packaged_at,
          enrouteAt: i.enroute_at,
          deliveredAt: i.delivered_at,
        };
      }),
    },
  });
}
