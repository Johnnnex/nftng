import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ countryId: string }> }) {
  const { countryId } = await params;

  const { data, error } = await supabase
    .from("states")
    .select("id, name, country_id")
    .eq("country_id", countryId)
    .order("name");

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({
    data: (data ?? []).map((r) => ({ id: r.id, name: r.name, countryId: r.country_id })),
  });
}
