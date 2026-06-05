import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getAdminFromRequest } from "@/lib/server-utils";
import { hasPermission } from "@/lib/permissions";
import { deliveryCitySchema } from "@/data";

export async function GET(req: NextRequest) {
  const ctx = getAdminFromRequest(req);
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!hasPermission(ctx.permissions, ctx.isSuper, "logistics", "read"))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const stateId = req.nextUrl.searchParams.get("stateId");
  let query = supabase.from("cities").select("*").order("name");
  if (stateId) query = query.eq("state_id", stateId);
  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  const result = (data ?? []).map((c: any) => ({ id: c.id, stateId: c.state_id, name: c.name }));
  return NextResponse.json({ data: result });
}

export async function POST(req: NextRequest) {
  const ctx = getAdminFromRequest(req);
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!hasPermission(ctx.permissions, ctx.isSuper, "logistics", "write"))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  const parsed = deliveryCitySchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues?.[0]?.message ?? "Invalid body" }, { status: 400 });

  const { data, error } = await supabase
    .from("cities")
    .insert({ state_id: parsed.data.stateId, name: parsed.data.name })
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data: { id: data.id, stateId: data.state_id, name: data.name } }, { status: 201 });
}
