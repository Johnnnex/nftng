"use client";
import { useDashboardStore } from "@/store";
import type { DashboardMetrics, ChartPoint, DashboardRecentOrder } from "@/store";

type MetricsRes = { data: DashboardMetrics } | null;
type ChartRes   = { data: ChartPoint[]; years: number[]; year: number } | null;
type OrdersRes  = { data: DashboardRecentOrder[] } | null;

export function AdminDashboardInitializer({
  results,
}: {
  results: [MetricsRes, ChartRes, OrdersRes];
}) {
  const [m, c, o] = results;
  // Set synchronously at render time so AdminDashboard sees real data on its first render.
  // Zustand setState is safe to call outside useEffect — it doesn't trigger an infinite loop
  // because the store update won't cause this Initializer to re-render (it reads no store state).
  useDashboardStore.setState({
    metrics: m?.data ?? null,
    chartData: c?.data ?? [],
    chartYears: c?.years ?? [new Date().getFullYear()],
    selectedYear: c?.year ?? new Date().getFullYear(),
    recentOrders: o?.data ?? [],
  });
  return null;
}
