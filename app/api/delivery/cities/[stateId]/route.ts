import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ stateId: string }> }) {
  const { stateId } = await params;

  const { data, error } = await supabase
    .from("cities")
    .select("id, name, state_id")
    .eq("state_id", stateId)
    .order("name");

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({
    data: (data ?? []).map((r) => ({ id: r.id, name: r.name, stateId: r.state_id })),
  });
}
