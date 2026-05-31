import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { hasPermission } from "@/lib/permissions";
import { getAdminFromRequest } from "@/lib/server-utils";
import { roleTemplateSchema } from "@/data";

type Params = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, { params }: Params) {
  const ctx = getAdminFromRequest(req);
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!hasPermission(ctx.permissions, ctx.isSuper, "adminManagement", "read")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const { data: role, error } = await supabase
    .from("admin_roles")
    .select("id, name, module_permissions, created_at")
    .eq("id", id)
    .maybeSingle();

  if (error || !role) return NextResponse.json({ error: "Role not found" }, { status: 404 });

  const { data: admins } = await supabase
    .from("admins")
    .select("id")
    .eq("initial_role_id", id);

  return NextResponse.json({
    data: {
      id: role.id,
      name: role.name,
      modulePermissions: role.module_permissions ?? {},
      assignedCount: admins?.length ?? 0,
      createdAt: role.created_at,
    },
  });
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const ctx = getAdminFromRequest(req);
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!hasPermission(ctx.permissions, ctx.isSuper, "adminManagement", "write")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const body = await req.json();
  const parsed = roleTemplateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid request" }, { status: 400 });
  }

  const { name, modulePermissions } = parsed.data;

  const { data: existing } = await supabase
    .from("admin_roles")
    .select("id")
    .eq("name", name)
    .neq("id", id)
    .maybeSingle();
  if (existing) return NextResponse.json({ error: "A role with this name already exists" }, { status: 409 });

  const { data: role, error } = await supabase
    .from("admin_roles")
    .update({ name, module_permissions: modulePermissions, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select("id, name, module_permissions, created_at")
    .single();

  if (error || !role) return NextResponse.json({ error: "Failed to update role" }, { status: 500 });

  const { data: admins } = await supabase
    .from("admins")
    .select("id")
    .eq("initial_role_id", id);

  return NextResponse.json({
    data: {
      id: role.id,
      name: role.name,
      modulePermissions: role.module_permissions ?? {},
      assignedCount: admins?.length ?? 0,
      createdAt: role.created_at,
    },
  });
}

export async function DELETE(req: NextRequest, { params }: Params) {
  const ctx = getAdminFromRequest(req);
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!hasPermission(ctx.permissions, ctx.isSuper, "adminManagement", "write")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;

  const { data: assigned } = await supabase
    .from("admins")
    .select("id")
    .eq("initial_role_id", id)
    .limit(1);

  if (assigned && assigned.length > 0) {
    return NextResponse.json({ error: "Cannot delete — role is assigned to one or more admins" }, { status: 409 });
  }

  const { error } = await supabase.from("admin_roles").delete().eq("id", id);
  if (error) return NextResponse.json({ error: "Failed to delete role" }, { status: 500 });

  return NextResponse.json({ data: null });
}
