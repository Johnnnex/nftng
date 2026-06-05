import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getAdminFromRequest } from "@/lib/server-utils";
import { hasPermission } from "@/lib/permissions";
import { deliveryCountrySchema } from "@/data";

export async function GET(req: NextRequest) {
  const ctx = getAdminFromRequest(req);
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!hasPermission(ctx.permissions, ctx.isSuper, "logistics", "read"))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { data, error } = await supabase.from("countries").select("*").order("name");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  const result = (data ?? []).map((c: any) => ({ id: c.id, name: c.name, code: c.code }));
  return NextResponse.json({ data: result });
}

export async function POST(req: NextRequest) {
  const ctx = getAdminFromRequest(req);
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!hasPermission(ctx.permissions, ctx.isSuper, "logistics", "write"))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  const parsed = deliveryCountrySchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues?.[0]?.message ?? "Invalid body" }, { status: 400 });

  const { data, error } = await supabase.from("countries").insert(parsed.data).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data: { id: data.id, name: data.name, code: data.code } }, { status: 201 });
}
