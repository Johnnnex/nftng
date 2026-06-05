import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getAdminFromRequest } from "@/lib/server-utils";

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export async function GET(req: NextRequest) {
  const ctx = getAdminFromRequest(req);
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const now = new Date();
  const currentYear = now.getFullYear();
  const yearParam = parseInt(req.nextUrl.searchParams.get("year") ?? String(currentYear));
  const year = isNaN(yearParam) ? currentYear : yearParam;
  const isCurrentYear = year === currentYear;

  // For current year: show Jan → current month. For past years: Jan → Dec.
  const maxMonth = isCurrentYear ? now.getMonth() + 1 : 12;

  const yearStart = new Date(year, 0, 1).toISOString();
  const yearEnd = new Date(year, maxMonth, 0, 23, 59, 59, 999).toISOString();

  const [{ data: txRows }, { data: refundRows }] = await Promise.all([
    supabase
      .from("transactions")
      .select("amount, webhook_verified_at")
      .eq("status", "success")
      .gte("webhook_verified_at", yearStart)
      .lte("webhook_verified_at", yearEnd),

    supabase
      .from("refunds")
      .select("amount, processed_at")
      .gte("processed_at", yearStart)
      .lte("processed_at", yearEnd),
  ]);

  // Aggregate by month (1-indexed), backfill missing months with 0
  const revenueByMonth: Record<number, number> = {};
  const refundsByMonth: Record<number, number> = {};

  for (const tx of txRows ?? []) {
    if (!tx.webhook_verified_at) continue;
    const m = new Date(tx.webhook_verified_at).getMonth() + 1;
    revenueByMonth[m] = (revenueByMonth[m] ?? 0) + Number(tx.amount);
  }

  for (const r of refundRows ?? []) {
    if (!r.processed_at) continue;
    const m = new Date(r.processed_at).getMonth() + 1;
    refundsByMonth[m] = (refundsByMonth[m] ?? 0) + Number(r.amount);
  }

  const data = [];
  for (let m = 1; m <= maxMonth; m++) {
    data.push({
      name: MONTH_NAMES[m - 1],
      Revenue: Math.round(revenueByMonth[m] ?? 0),
      Refunds: Math.round(refundsByMonth[m] ?? 0),
    });
  }

  // Build available year options (current year down to 10 years back)
  const years = Array.from({ length: 11 }, (_, i) => currentYear - i);

  return NextResponse.json({ data, years, year });
}
