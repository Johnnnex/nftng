import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { hasPermission } from "@/lib/permissions";
import { getAdminFromRequest } from "@/lib/server-utils";
import { roleTemplateSchema } from "@/data";

const LIMIT = 50;

export async function GET(req: NextRequest) {
  const ctx = getAdminFromRequest(req);
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!hasPermission(ctx.permissions, ctx.isSuper, "adminManagement", "read")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const page = Math.max(1, parseInt(req.nextUrl.searchParams.get("page") ?? "1"));
  const offset = (page - 1) * LIMIT;

  const { data: roles, count, error } = await supabase
    .from("admin_roles")
    .select("id, name, module_permissions, created_at", { count: "exact" })
    .order("created_at", { ascending: true })
    .range(offset, offset + LIMIT - 1);

  if (error) return NextResponse.json({ error: "Failed to fetch roles" }, { status: 500 });

  const { data: counts } = await supabase
    .from("admins")
    .select("initial_role_id")
    .not("initial_role_id", "is", null);

  const countMap: Record<string, number> = {};
  for (const row of counts ?? []) {
    if (row.initial_role_id) countMap[row.initial_role_id] = (countMap[row.initial_role_id] ?? 0) + 1;
  }

  const result = (roles ?? []).map((r) => ({
    id: r.id,
    name: r.name,
    modulePermissions: r.module_permissions ?? {},
    assignedCount: countMap[r.id] ?? 0,
    createdAt: r.created_at,
  }));

  return NextResponse.json({ data: result, meta: { total: count ?? 0, page, limit: LIMIT } });
}

export async function POST(req: NextRequest) {
  const ctx = getAdminFromRequest(req);
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!hasPermission(ctx.permissions, ctx.isSuper, "adminManagement", "write")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = roleTemplateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid request" }, { status: 400 });
  }

  const { name, modulePermissions } = parsed.data;

  const { data: existing } = await supabase.from("admin_roles").select("id").eq("name", name).maybeSingle();
  if (existing) return NextResponse.json({ error: "A role with this name already exists" }, { status: 409 });

  const { data: role, error } = await supabase
    .from("admin_roles")
    .insert({ name, module_permissions: modulePermissions })
    .select("id, name, module_permissions, created_at")
    .single();

  if (error || !role) return NextResponse.json({ error: "Failed to create role" }, { status: 500 });

  return NextResponse.json({
    data: {
      id: role.id,
      name: role.name,
      modulePermissions: role.module_permissions ?? {},
      assignedCount: 0,
      createdAt: role.created_at,
    },
  }, { status: 201 });
}
