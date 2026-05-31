import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { hasPermission } from "@/lib/permissions";
import { getAdminFromRequest } from "@/lib/server-utils";
import { updatePermissionsSchema } from "@/data";

type Params = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, { params }: Params) {
  const ctx = getAdminFromRequest(req);
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!hasPermission(ctx.permissions, ctx.isSuper, "adminManagement", "read")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const { data: a, error } = await supabase
    .from("admins")
    .select(`
      id, email, first_name, last_name, is_super, is_active,
      initial_role_id, last_login_at, created_at,
      admin_configs!admin_id ( module_permissions ),
      admin_roles ( name )
    `)
    .eq("id", id)
    .maybeSingle();

  if (error || !a) return NextResponse.json({ error: "Admin not found" }, { status: 404 });

  const config = Array.isArray(a.admin_configs) ? a.admin_configs[0] : a.admin_configs;
  const role = Array.isArray(a.admin_roles) ? a.admin_roles[0] : a.admin_roles;

  return NextResponse.json({
    data: {
      id: a.id,
      email: a.email,
      firstName: a.first_name,
      lastName: a.last_name,
      isSuper: a.is_super,
      isActive: a.is_active,
      initialRoleId: a.initial_role_id ?? null,
      initialRoleName: role?.name ?? null,
      permissions: config?.module_permissions ?? {},
      createdAt: a.created_at,
      lastLoginAt: a.last_login_at ?? null,
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

  const { data: target } = await supabase
    .from("admins")
    .select("id, is_super")
    .eq("id", id)
    .maybeSingle();

  if (!target) return NextResponse.json({ error: "Admin not found" }, { status: 404 });
  if (target.is_super) return NextResponse.json({ error: "Cannot modify super admin" }, { status: 403 });

  const body = await req.json();
  const parsed = updatePermissionsSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid request" }, { status: 400 });
  }

  const { modulePermissions, isActive } = parsed.data;

  if (isActive !== undefined) {
    if (id === ctx.adminId) {
      return NextResponse.json({ error: "Cannot deactivate your own account" }, { status: 400 });
    }
    await supabase.from("admins").update({ is_active: isActive, updated_at: new Date().toISOString() }).eq("id", id);
  }

  if (modulePermissions) {
    await supabase
      .from("admin_configs")
      .update({ module_permissions: modulePermissions, updated_by: ctx.adminId, updated_at: new Date().toISOString() })
      .eq("admin_id", id);
  }

  const { data: updated } = await supabase
    .from("admins")
    .select(`
      id, email, first_name, last_name, is_super, is_active,
      initial_role_id, last_login_at, created_at,
      admin_configs!admin_id ( module_permissions ),
      admin_roles ( name )
    `)
    .eq("id", id)
    .maybeSingle();

  if (!updated) return NextResponse.json({ error: "Failed to fetch updated admin" }, { status: 500 });

  const config = Array.isArray(updated.admin_configs) ? updated.admin_configs[0] : updated.admin_configs;
  const role = Array.isArray(updated.admin_roles) ? updated.admin_roles[0] : updated.admin_roles;

  return NextResponse.json({
    data: {
      id: updated.id,
      email: updated.email,
      firstName: updated.first_name,
      lastName: updated.last_name,
      isSuper: updated.is_super,
      isActive: updated.is_active,
      initialRoleId: updated.initial_role_id ?? null,
      initialRoleName: role?.name ?? null,
      permissions: config?.module_permissions ?? {},
      createdAt: updated.created_at,
      lastLoginAt: updated.last_login_at ?? null,
    },
  });
}

export async function DELETE(req: NextRequest, { params }: Params) {
  const ctx = getAdminFromRequest(req);
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!ctx.isSuper) return NextResponse.json({ error: "Only super admins can delete accounts" }, { status: 403 });

  const { id } = await params;

  if (id === ctx.adminId) {
    return NextResponse.json({ error: "Cannot delete your own account" }, { status: 400 });
  }

  const { data: target } = await supabase
    .from("admins")
    .select("id, is_super")
    .eq("id", id)
    .maybeSingle();

  if (!target) return NextResponse.json({ error: "Admin not found" }, { status: 404 });
  if (target.is_super) return NextResponse.json({ error: "Cannot delete super admin" }, { status: 403 });

  await supabase.from("admins").delete().eq("id", id);

  return NextResponse.json({ data: null }, { status: 200 });
}
