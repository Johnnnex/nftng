import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getAdminFromRequest } from "@/lib/server-utils";

export async function GET(req: NextRequest) {
  const ctx = getAdminFromRequest(req);
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabase
    .from("orders")
    .select("id, order_ref, user_name, status, created_at, transactions(amount), order_items(id)")
    .not("status", "in", '("pending_payment","cancelled")')
    .order("created_at", { ascending: false })
    .limit(7);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const rows = (data ?? []).map((o: any) => ({
    id: o.order_ref,
    customer: o.user_name,
    items: (o.order_items ?? []).length,
    total: Number((o.transactions as any)?.amount ?? 0),
    status: o.status,
    date: new Date(o.created_at).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
  }));

  return NextResponse.json({ data: rows });
}
