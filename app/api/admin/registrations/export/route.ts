import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getAdminFromRequest } from "@/lib/server-utils";
import { hasPermission } from "@/lib/permissions";

export async function GET(req: NextRequest) {
  const ctx = getAdminFromRequest(req);
  if (!ctx)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!hasPermission(ctx.permissions, ctx.isSuper, "registrations", "read"))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { data, error } = await supabase
    .from("registration")
    .select(
      "id, alias, email, gender, country, city, what_describes_you, topics_of_interest, first_time_attendee, events, attended, attended_at, created_at",
    )
    .order("created_at", { ascending: false });

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });

  const rows = data ?? [];

  const headers = [
    "ID",
    "Alias",
    "Email",
    "Gender",
    "Country",
    "City",
    "Describes You",
    "Topics",
    "First Time",
    "Events",
    "Attended",
    "Attended At",
    "Registered At",
  ];

  const escape = (v: unknown) => {
    const s = Array.isArray(v) ? v.join("; ") : String(v ?? "");
    return `"${s.replace(/"/g, '""')}"`;
  };

  const csvRows = [
    headers.join(","),
    ...rows.map((r) =>
      [
        r.id,
        r.alias,
        r.email,
        r.gender,
        r.country,
        r.city,
        r.what_describes_you,
        r.topics_of_interest,
        r.first_time_attendee,
        r.events,
        r.attended,
        r.attended_at ?? "",
        r.created_at,
      ]
        .map(escape)
        .join(","),
    ),
  ].join("\n");

  const now = new Date();
  const day = String(now.getDate()).padStart(2, "0");
  const month = now.toLocaleString("en-GB", { month: "short" });
  const year = now.getFullYear();
  const filename = `registration-data-${day}-${month}-${year}.csv`;

  return new NextResponse(csvRows, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
