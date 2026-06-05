import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getAdminFromRequest } from "@/lib/server-utils";
import { hasPermission } from "@/lib/permissions";

const LIMIT = 50;

const SELECT =
  "id, alias, email, gender, country, city, what_describes_you, topics_of_interest, first_time_attendee, events, attended, attended_at, created_at";

function toRecord(r: Record<string, unknown>) {
  return {
    id: r.id,
    alias: r.alias,
    email: r.email,
    gender: r.gender,
    country: r.country,
    city: r.city,
    whatDescribesYou: r.what_describes_you,
    topicsOfInterest: r.topics_of_interest ?? [],
    firstTimeAttendee: r.first_time_attendee,
    events: r.events ?? [],
    attended: r.attended ?? false,
    attendedAt: r.attended_at ?? null,
    createdAt: r.created_at,
  };
}

export async function GET(req: NextRequest) {
  const ctx = getAdminFromRequest(req);
  if (!ctx)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!hasPermission(ctx.permissions, ctx.isSuper, "registrations", "read"))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const page = Math.max(
    1,
    parseInt(req.nextUrl.searchParams.get("page") ?? "1"),
  );
  const search = req.nextUrl.searchParams.get("search")?.trim() ?? "";
  const tab = req.nextUrl.searchParams.get("tab") ?? "registrations";
  const offset = (page - 1) * LIMIT;

  let query = supabase
    .from("registration")
    .select(SELECT, { count: "exact" })
    .eq("attended", tab === "attendees")
    .order("created_at", { ascending: false })
    .range(offset, offset + LIMIT - 1);

  if (search) {
    query = query.or(`alias.ilike.%${search}%,email.ilike.%${search}%`);
  }

  const { data, count, error } = await query;
  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({
    data: (data ?? []).map((r) => toRecord(r as Record<string, unknown>)),
    meta: { total: count ?? 0, page, limit: LIMIT },
  });
}
