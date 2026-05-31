import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { supabase } from "@/lib/supabase";
import { sendEmail } from "@/lib/brevo";
import { adminInviteEmail } from "@/lib/email-templates";
import { signInviteToken } from "@/lib/jwt";
import { hasPermission } from "@/lib/permissions";
import { getAdminFromRequest } from "@/lib/server-utils";
import { inviteAdminSchema } from "@/data";

const LIMIT = 50;

export async function GET(req: NextRequest) {
  const ctx = getAdminFromRequest(req);
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!hasPermission(ctx.permissions, ctx.isSuper, "adminManagement", "read")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const page = Math.max(1, parseInt(req.nextUrl.searchParams.get("page") ?? "1"));
  const offset = (page - 1) * LIMIT;

  const { data: admins, count, error } = await supabase
    .from("admins")
    .select(`
      id, email, first_name, last_name, is_super, is_active,
      initial_role_id, last_login_at, created_at,
      admin_configs!admin_id ( module_permissions ),
      admin_roles ( name )
    `, { count: "exact" })
    .order("created_at", { ascending: true })
    .range(offset, offset + LIMIT - 1);

  if (error) {
    console.error("[GET /api/admin/admins]", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const result = (admins ?? []).map((a) => {
    const config = Array.isArray(a.admin_configs) ? a.admin_configs[0] : a.admin_configs;
    const role = Array.isArray(a.admin_roles) ? a.admin_roles[0] : a.admin_roles;
    return {
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
    };
  });

  return NextResponse.json({ data: result, meta: { total: count ?? 0, page, limit: LIMIT } });
}

export async function POST(req: NextRequest) {
  const ctx = getAdminFromRequest(req);
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!hasPermission(ctx.permissions, ctx.isSuper, "adminManagement", "write")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = inviteAdminSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid request" }, { status: 400 });
  }

  const { email, firstName, lastName, roleId, modulePermissions } = parsed.data;

  const { data: existing } = await supabase
    .from("admins")
    .select("id")
    .eq("email", email.toLowerCase())
    .maybeSingle();
  if (existing) {
    return NextResponse.json({ error: "An admin with this email already exists" }, { status: 409 });
  }

  const { data: existingInvite } = await supabase
    .from("admin_invites")
    .select("id")
    .eq("email", email.toLowerCase())
    .eq("status", "pending")
    .maybeSingle();
  if (existingInvite) {
    return NextResponse.json({ error: "A pending invite already exists for this email" }, { status: 409 });
  }

  let permissions = modulePermissions ?? {};
  if (roleId && Object.keys(permissions).length === 0) {
    const { data: role } = await supabase
      .from("admin_roles")
      .select("module_permissions")
      .eq("id", roleId)
      .maybeSingle();
    if (role) permissions = role.module_permissions;
  }

  const inviteToken = signInviteToken(randomUUID());
  const expiresAt = new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString();

  const { data: invite, error: inviteError } = await supabase
    .from("admin_invites")
    .insert({
      email: email.toLowerCase(),
      first_name: firstName,
      last_name: lastName,
      token: inviteToken,
      status: "pending",
      role_id: roleId ?? null,
      module_permissions: permissions,
      created_by: ctx.adminId,
      expires_at: expiresAt,
    })
    .select("id")
    .single();

  if (inviteError || !invite) {
    return NextResponse.json({ error: "Failed to create invite" }, { status: 500 });
  }

  const { data: inviter } = await supabase
    .from("admins")
    .select("first_name, last_name")
    .eq("id", ctx.adminId)
    .maybeSingle();

  const inviterName = inviter ? `${inviter.first_name} ${inviter.last_name}` : "NFTNG Admin";
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const inviteUrl = `${appUrl}/admin/accept-invite?token=${inviteToken}`;

  try {
    await sendEmail({
      to: [{ email: email.toLowerCase(), name: `${firstName} ${lastName}` }],
      subject: `You've been invited to NFTNG Admin`,
      htmlContent: adminInviteEmail({ firstName, inviteUrl, inviterName }),
    });
  } catch {
    // non-fatal — invite row still created; admin can resend
  }

  return NextResponse.json({ data: { id: invite.id, email, firstName, lastName } }, { status: 201 });
}
