import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getAdminFromRequest } from "@/lib/server-utils";
import { hasPermission } from "@/lib/permissions";
import { ecommerceConfigSchema } from "@/data";

export async function GET(req: NextRequest) {
  const ctx = getAdminFromRequest(req);
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!hasPermission(ctx.permissions, ctx.isSuper, "products", "read"))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { data, error } = await supabase
    .from("ecommerce_config")
    .select("id, sales_open_at, sales_close_at, updated_at")
    .limit(1)
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({
    data: { id: data.id, salesOpenAt: data.sales_open_at, salesCloseAt: data.sales_close_at, updatedAt: data.updated_at },
  });
}

export async function PATCH(req: NextRequest) {
  const ctx = getAdminFromRequest(req);
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!hasPermission(ctx.permissions, ctx.isSuper, "products", "write"))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  const parsed = ecommerceConfigSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.errors[0]?.message ?? "Invalid input" }, { status: 400 });

  const { data, error } = await supabase
    .from("ecommerce_config")
    .update({ sales_open_at: parsed.data.salesOpenAt, sales_close_at: parsed.data.salesCloseAt, updated_at: new Date().toISOString() })
    .select("id, sales_open_at, sales_close_at, updated_at")
    .limit(1)
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({
    data: { id: data.id, salesOpenAt: data.sales_open_at, salesCloseAt: data.sales_close_at, updatedAt: data.updated_at },
  });
}
