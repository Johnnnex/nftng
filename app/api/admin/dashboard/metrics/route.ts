import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getAdminFromRequest } from "@/lib/server-utils";

export async function GET(req: NextRequest) {
  const ctx = getAdminFromRequest(req);
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const now = new Date();
  const nowStr = now.toISOString();
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString();
  const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999).toISOString();

  const [
    { count: totalOrders },
    { count: thisMonthOrders },
    { count: lastMonthOrders },
    { data: allRevRows },
    { data: thisMonthRevRows },
    { data: lastMonthRevRows },
    { data: allRefundRows },
    { data: thisMonthRefundRows },
    { data: lastMonthRefundRows },
    { count: totalRegistrations },
    { count: thisMonthReg },
    { count: lastMonthReg },
    { data: activeProdIds },
    { data: lastMonthActiveProdIds },
  ] = await Promise.all([
    supabase
      .from("orders")
      .select("id", { count: "exact", head: true })
      .not("status", "in", '("pending_payment","cancelled")'),

    supabase
      .from("orders")
      .select("id", { count: "exact", head: true })
      .not("status", "in", '("pending_payment","cancelled")')
      .gte("created_at", thisMonthStart),

    supabase
      .from("orders")
      .select("id", { count: "exact", head: true })
      .not("status", "in", '("pending_payment","cancelled")')
      .gte("created_at", lastMonthStart)
      .lte("created_at", lastMonthEnd),

    supabase.from("transactions").select("amount").eq("status", "success"),
    supabase.from("transactions").select("amount").eq("status", "success").gte("webhook_verified_at", thisMonthStart),
    supabase.from("transactions").select("amount").eq("status", "success").gte("webhook_verified_at", lastMonthStart).lte("webhook_verified_at", lastMonthEnd),

    supabase.from("refunds").select("amount"),
    supabase.from("refunds").select("amount").gte("processed_at", thisMonthStart),
    supabase.from("refunds").select("amount").gte("processed_at", lastMonthStart).lte("processed_at", lastMonthEnd),

    // registrations — use the correct table name
    supabase.from("registration").select("id", { count: "exact", head: true }),
    supabase.from("registration").select("id", { count: "exact", head: true }).gte("created_at", thisMonthStart),
    supabase.from("registration").select("id", { count: "exact", head: true }).gte("created_at", lastMonthStart).lte("created_at", lastMonthEnd),

    // active products within sales window (IDs only)
    supabase.from("products").select("id").eq("is_active", true)
      .or(`sales_open_at.is.null,sales_open_at.lte.${nowStr}`)
      .or(`sales_close_at.is.null,sales_close_at.gte.${nowStr}`),

    // products that were active last month (is_active now + created before this month)
    supabase.from("products").select("id").eq("is_active", true).lt("created_at", thisMonthStart),
  ]);

  // Active products — count distinct product IDs with stock > 0
  const nowActiveIds = (activeProdIds ?? []).map((p) => p.id);
  let activeProducts = 0;
  if (nowActiveIds.length > 0) {
    const { data: stockedRows } = await supabase
      .from("product_stocks").select("product_id").in("product_id", nowActiveIds).gt("quantity", 0);
    activeProducts = new Set((stockedRows ?? []).map((s) => s.product_id)).size;
  }

  // Last month active products (approximate — products that existed + active before this month)
  const lastMonthActiveCount = (lastMonthActiveProdIds ?? []).length;

  const sum = (rows: { amount: unknown }[] | null) =>
    (rows ?? []).reduce((s, r) => s + Number(r.amount), 0);

  const totalRevenue = sum(allRevRows);
  const totalRefunds = sum(allRefundRows);
  const netRevenue = totalRevenue - totalRefunds;
  const thisMonthRev = sum(thisMonthRevRows) - sum(thisMonthRefundRows);
  const lastMonthRev = sum(lastMonthRevRows) - sum(lastMonthRefundRows);

  const pctChange = (curr: number, prev: number): number => {
    if (prev === 0 && curr === 0) return 0;
    if (prev === 0) return curr > 0 ? 100 : -100;
    return Math.round(((curr - prev) / Math.abs(prev)) * 100);
  };

  return NextResponse.json({
    data: {
      totalOrders: totalOrders ?? 0,
      thisMonthOrders: thisMonthOrders ?? 0,
      netRevenue,
      thisMonthNetRevenue: thisMonthRev,
      totalRegistrations: totalRegistrations ?? 0,
      thisMonthRegistrations: thisMonthReg ?? 0,
      activeProducts,
      changes: {
        orders: pctChange(thisMonthOrders ?? 0, lastMonthOrders ?? 0),
        revenue: pctChange(thisMonthRev, lastMonthRev),
        registrations: pctChange(thisMonthReg ?? 0, lastMonthReg ?? 0),
        activeProducts: pctChange(activeProducts, lastMonthActiveCount),
      },
    },
  });
}
