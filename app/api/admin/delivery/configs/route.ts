import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getAdminFromRequest } from "@/lib/server-utils";
import { hasPermission } from "@/lib/permissions";
import { deliveryConfigSchema } from "@/data";

export async function GET(req: NextRequest) {
  const ctx = getAdminFromRequest(req);
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!hasPermission(ctx.permissions, ctx.isSuper, "logistics", "read"))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const cityId = req.nextUrl.searchParams.get("cityId");
  let query = supabase.from("delivery_configs").select("*").order("method");
  if (cityId) query = query.eq("city_id", cityId);
  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  const result = (data ?? []).map((c: any) => ({
    id: c.id,
    cityId: c.city_id,
    method: c.method,
    price: Number(c.price),
    estimatedDays: c.estimated_days,
  }));
  return NextResponse.json({ data: result });
}

// Upsert by (city_id, method)
export async function POST(req: NextRequest) {
  const ctx = getAdminFromRequest(req);
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!hasPermission(ctx.permissions, ctx.isSuper, "logistics", "write"))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  const parsed = deliveryConfigSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.errors[0]?.message ?? "Invalid body" }, { status: 400 });

  const { cityId, method, price, estimatedDays } = parsed.data;
  const { data, error } = await supabase
    .from("delivery_configs")
    .upsert({ city_id: cityId, method, price, estimated_days: estimatedDays ?? null }, { onConflict: "city_id,method" })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({
    data: { id: data.id, cityId: data.city_id, method: data.method, price: Number(data.price), estimatedDays: data.estimated_days },
  }, { status: 201 });
}
