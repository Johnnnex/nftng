import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getAdminFromRequest } from "@/lib/server-utils";
import { hasPermission } from "@/lib/permissions";

const LIMIT = 50;

export async function GET(req: NextRequest) {
  const ctx = getAdminFromRequest(req);
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!hasPermission(ctx.permissions, ctx.isSuper, "products", "read"))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const page = Math.max(1, parseInt(req.nextUrl.searchParams.get("page") ?? "1"));
  const offset = (page - 1) * LIMIT;
  const search = req.nextUrl.searchParams.get("search") ?? "";

  let query = supabase
    .from("orders")
    .select(
      `id, order_ref, transaction_id, user_email, user_name, user_phone, user_address, status, created_at, updated_at,
       transactions ( amount )`,
      { count: "exact" },
    )
    .order("created_at", { ascending: false })
    .range(offset, offset + LIMIT - 1);

  if (search) {
    query = query.or(`user_email.ilike.%${search}%,order_ref.ilike.%${search}%,user_name.ilike.%${search}%`);
  }

  const { data: orders, count, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const orderIds = (orders ?? []).map((o) => o.id);
  const { data: itemCounts } = orderIds.length
    ? await supabase.from("order_items").select("order_id").in("order_id", orderIds)
    : { data: [] };

  const countByOrder: Record<string, number> = {};
  for (const row of itemCounts ?? []) {
    countByOrder[row.order_id] = (countByOrder[row.order_id] ?? 0) + 1;
  }

  const data = (orders ?? []).map((o) => ({
    id: o.id,
    orderRef: o.order_ref,
    transactionId: o.transaction_id,
    userEmail: o.user_email,
    userName: o.user_name,
    userPhone: o.user_phone,
    userAddress: o.user_address,
    status: o.status,
    totalAmount: (o.transactions as { amount: number } | null)?.amount ?? null,
    itemCount: countByOrder[o.id] ?? 0,
    createdAt: o.created_at,
    updatedAt: o.updated_at,
  }));

  return NextResponse.json({ data, meta: { total: count ?? 0, page, limit: LIMIT } });
}
