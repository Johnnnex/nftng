import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import bcrypt from "bcrypt";
import { supabase } from "@/lib/supabase";
import { signAccessToken, signRefreshToken, verifyInviteToken } from "@/lib/jwt";
import { acceptInviteBodySchema } from "@/data";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = acceptInviteBodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid request" }, { status: 400 });
  }

  const { token, password } = parsed.data;

  let inviteId: string;
  try {
    const payload = verifyInviteToken(token);
    inviteId = payload.sub;
  } catch {
    return NextResponse.json({ error: "Invalid or expired invite link" }, { status: 401 });
  }

  void inviteId;

  const { data: invite } = await supabase
    .from("admin_invites")
    .select("id, email, first_name, last_name, role_id, module_permissions, status, expires_at")
    .eq("token", token)
    .maybeSingle();

  if (!invite) return NextResponse.json({ error: "Invite not found" }, { status: 404 });
  if (invite.status !== "pending") return NextResponse.json({ error: "Invite already used or expired" }, { status: 410 });
  if (new Date(invite.expires_at) < new Date()) {
    await supabase.from("admin_invites").update({ status: "expired" }).eq("id", invite.id);
    return NextResponse.json({ error: "Invite has expired" }, { status: 410 });
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const { data: admin, error: adminError } = await supabase
    .from("admins")
    .insert({
      email: invite.email,
      password_hash: passwordHash,
      first_name: invite.first_name,
      last_name: invite.last_name,
      is_super: false,
      is_active: true,
      initial_role_id: invite.role_id ?? null,
    })
    .select("id")
    .single();

  if (adminError || !admin) {
    console.error("[accept-invite] admin insert error:", adminError);
    if (adminError?.code === "23505") {
      return NextResponse.json({ error: "An account with this email already exists" }, { status: 409 });
    }
    return NextResponse.json({ error: "Failed to create account" }, { status: 500 });
  }

  const { error: configError } = await supabase.from("admin_configs").insert({
    admin_id: admin.id,
    module_permissions: invite.module_permissions ?? {},
  });
  if (configError) console.error("[accept-invite] admin_configs insert error:", configError);

  const { error: inviteUpdateError } = await supabase
    .from("admin_invites")
    .update({ status: "accepted", accepted_at: new Date().toISOString() })
    .eq("id", invite.id);
  if (inviteUpdateError) console.error("[accept-invite] invite update error:", inviteUpdateError);

  const accessToken = signAccessToken({
    sub: admin.id,
    isSuper: false,
    permissions: invite.module_permissions ?? {},
  });
  const refreshToken = signRefreshToken(admin.id);

  const { error: tokenError } = await supabase.from("refresh_tokens").insert({
    admin_id: admin.id,
    token_hash: refreshToken,
    family_id: randomUUID(),
    expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    user_agent: req.headers.get("user-agent"),
    ip_address: req.headers.get("x-forwarded-for") ?? req.headers.get("x-real-ip"),
  });
  if (tokenError) console.error("[accept-invite] refresh_tokens insert error:", tokenError);

  const res = NextResponse.json({
    data: {
      accessToken,
      refreshToken,
      admin: {
        id: admin.id,
        email: invite.email,
        firstName: invite.first_name,
        lastName: invite.last_name,
        isSuper: false,
        permissions: invite.module_permissions ?? {},
      },
    },
  });

  res.cookies.set("admin_token", accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 15 * 60,
    path: "/",
  });

  return res;
}
