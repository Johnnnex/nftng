import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getAdminFromRequest } from "@/lib/server-utils";
import { hasPermission } from "@/lib/permissions";

type Params = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, { params }: Params) {
  const ctx = getAdminFromRequest(req);
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!hasPermission(ctx.permissions, ctx.isSuper, "products", "read"))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;

  const { data: order, error } = await supabase
    .from("orders")
    .select(`*, transactions ( amount, payment_method, status )`)
    .eq("id", id)
    .single();

  if (error || !order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

  const { data: items } = await supabase
    .from("order_items")
    .select("*")
    .eq("order_id", id)
    .order("created_at");

  const tx = order.transactions as { amount: number; payment_method: string; status: string } | null;

  return NextResponse.json({
    data: {
      id: order.id,
      orderRef: order.order_ref,
      transactionId: order.transaction_id,
      userEmail: order.user_email,
      userName: order.user_name,
      userPhone: order.user_phone,
      userAddress: order.user_address,
      status: order.status,
      totalAmount: tx?.amount ?? null,
      itemCount: items?.length ?? 0,
      overrideConfirmationCode: order.override_confirmation_code,
      overrideConfirmationUrlToken: order.override_confirmation_url_token,
      createdAt: order.created_at,
      updatedAt: order.updated_at,
      items: (items ?? []).map((i) => ({
        id: i.id,
        orderId: i.order_id,
        productId: i.product_id,
        productTitle: i.product_title,
        productImage: i.product_image,
        variantCombo: i.variant_combo,
        quantity: i.quantity,
        unitPrice: Number(i.unit_price),
        status: i.status,
        confirmationCode: i.confirmation_code,
        confirmationUrlToken: i.confirmation_url_token,
        packagedAt: i.packaged_at,
        onDeliveryAt: i.on_delivery_at,
        atDestinationAt: i.at_destination_at,
        deliveredAt: i.delivered_at,
        createdAt: i.created_at,
      })),
    },
  });
}
